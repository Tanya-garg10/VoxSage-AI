import os
import json
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from backend.analysis.audio_processor import AudioProcessor
from backend.comparison.aligner import TemporalAligner
from backend.comparison.deviations import DeviationDetector
from backend.evaluation.evaluator import BenchmarkEvaluator
from backend.evaluation.synthetic_generator import ControlledSyntheticGenerator
from backend.schemas.models import (
    SpeechAnalysis,
    ContrastiveComparisonResult,
    DatasetItem,
    EvaluationMetricReport,
)

app = FastAPI(
    title="VoxSage AI Backend",
    description="Contrastive Speech Analytics & Temporal Flaw Grounding Engine",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = AudioProcessor()
aligner = TemporalAligner()
detector = DeviationDetector()
evaluator = BenchmarkEvaluator()
synthetic_gen = ControlledSyntheticGenerator()

DATASET_FILE = os.path.join(os.path.dirname(__file__), "..", "dataset", "annotations", "benchmark_pairs.json")
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "..", "dataset", "examples")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VoxSage AI Speech Analytics Engine",
        "version": "1.0.0",
        "capabilities": [
            "Acoustic Feature Extraction",
            "F0 Autocorrelation Pitch Profiling",
            "Dynamic Time Warping (DTW) Alignment",
            "Temporal Flaw Grounding",
            "Controlled Synthetic Generation",
            "Empirical Benchmark Evaluation"
        ]
    }

@app.post("/analyze", response_model=SpeechAnalysis)
async def analyze_speech(
    file: UploadFile = File(...),
    transcript: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
        if len(content) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Audio file exceeds 25MB limit.")

        analysis = processor.analyze(content, transcript=transcript)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing failure: {str(e)}")

@app.post("/compare", response_model=ContrastiveComparisonResult)
async def compare_speech(
    reference: UploadFile = File(...),
    participant: UploadFile = File(...),
    transcript: Optional[str] = Form(None)
):
    try:
        ref_bytes = await reference.read()
        part_bytes = await participant.read()

        if len(ref_bytes) == 0 or len(part_bytes) == 0:
            raise HTTPException(status_code=400, detail="One or both audio files are empty.")

        ref_analysis = processor.analyze(ref_bytes, transcript=transcript)
        part_analysis = processor.analyze(part_bytes, transcript=transcript)

        alignment = aligner.align(ref_analysis, part_analysis)
        result = detector.compare(ref_analysis, part_analysis, alignment)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Contrastive comparison failure: {str(e)}")

@app.get("/dataset", response_model=List[DatasetItem])
def get_dataset():
    if not os.path.exists(DATASET_FILE):
        return []
    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@app.post("/evaluate", response_model=EvaluationMetricReport)
def run_evaluation():
    try:
        if not os.path.exists(DATASET_FILE):
            raise HTTPException(status_code=404, detail="Benchmark dataset annotations not found.")

        with open(DATASET_FILE, "r", encoding="utf-8") as f:
            raw_items = json.load(f)

        dataset_items = [DatasetItem(**item) for item in raw_items]
        test_items = [item for item in dataset_items if item.split in ("test", "validation")]

        # Run real evaluation on sample files if present
        predictions: dict = {}
        for item in test_items:
            ref_path = os.path.join(SAMPLES_DIR, item.referenceAudioFile)
            part_path = os.path.join(SAMPLES_DIR, item.participantAudioFile)

            if os.path.exists(ref_path) and os.path.exists(part_path):
                try:
                    ref_an = processor.analyze(ref_path, transcript=item.transcript)
                    part_an = processor.analyze(part_path, transcript=item.transcript)
                    al = aligner.align(ref_an, part_an)
                    devs = detector.detect_deviations(ref_an, part_an, al)
                    predictions[item.id] = devs
                except Exception:
                    predictions[item.id] = []
            else:
                # Synthesize on the fly for test verification if needed
                predictions[item.id] = []

        report = evaluator.evaluate_test_set(test_items, predictions)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
