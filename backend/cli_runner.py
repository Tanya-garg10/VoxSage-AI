import sys
import os
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.analysis.audio_processor import AudioProcessor
from backend.comparison.aligner import TemporalAligner
from backend.comparison.deviations import DeviationDetector
from backend.evaluation.evaluator import BenchmarkEvaluator
from backend.schemas.models import DatasetItem

def run():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing command argument"}))
        sys.exit(1)

    cmd = sys.argv[1]
    processor = AudioProcessor()
    aligner = TemporalAligner()
    detector = DeviationDetector()

    if cmd == "analyze":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing audio file path"}))
            sys.exit(1)
        audio_path = sys.argv[2]
        transcript = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "none" else None
        try:
            res = processor.analyze(audio_path, transcript=transcript)
            print(res.model_dump_json() if hasattr(res, "model_dump_json") else json.dumps(res.dict()))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    elif cmd == "compare":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing reference and participant paths"}))
            sys.exit(1)
        ref_path = sys.argv[2]
        part_path = sys.argv[3]
        transcript = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "none" else None
        try:
            ref_an = processor.analyze(ref_path, transcript=transcript)
            part_an = processor.analyze(part_path, transcript=transcript)
            al = aligner.align(ref_an, part_an)
            comp = detector.compare(ref_an, part_an, al)
            print(comp.model_dump_json() if hasattr(comp, "model_dump_json") else json.dumps(comp.dict()))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    elif cmd == "evaluate":
        dataset_file = os.path.join(os.path.dirname(__file__), "..", "dataset", "annotations", "benchmark_pairs.json")
        samples_dir = os.path.join(os.path.dirname(__file__), "..", "dataset", "examples")
        try:
            with open(dataset_file, "r", encoding="utf-8") as f:
                raw_items = json.load(f)
            dataset_items = [DatasetItem(**item) for item in raw_items]
            test_items = [item for item in dataset_items if item.split in ("test", "validation")]

            evaluator = BenchmarkEvaluator()
            predictions = {}
            for item in test_items:
                ref_path = os.path.join(samples_dir, item.referenceAudioFile)
                part_path = os.path.join(samples_dir, item.participantAudioFile)
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
                    predictions[item.id] = []

            report = evaluator.evaluate_test_set(test_items, predictions)
            print(report.model_dump_json() if hasattr(report, "model_dump_json") else json.dumps(report.dict()))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    else:
        print(json.dumps({"error": f"Unknown command: {cmd}"}))
        sys.exit(1)

if __name__ == "__main__":
    run()
