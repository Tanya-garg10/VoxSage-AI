from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field

class AcousticFrame(BaseModel):
    timestamp: float
    pitch: Optional[float] = None
    energy: float
    mfcc1: float
    isSpeech: bool

class EstimatedSpeakingRate(BaseModel):
    estimatedSyllablesPerSec: float
    wordsPerMin: Optional[float] = None
    wordCount: Optional[int] = None
    confidence: str
    note: str

class PitchStats(BaseModel):
    mean: float
    min: float
    max: float
    stdDev: float
    pitchRangeSemitones: float

class EnergyStats(BaseModel):
    meanRms: float
    rmsStdDev: float
    dynamicRangeDb: float

class PauseMetrics(BaseModel):
    pauseCount: int
    totalPauseDuration: float
    meanPauseDuration: float
    maxPauseDuration: float
    pausesPerMinute: float
    pauseIntervals: List[Tuple[float, float]]

class SpeechAnalysis(BaseModel):
    duration: float
    sampleRate: int
    speechDuration: float
    silenceDuration: float
    speechRatio: float
    estimatedSpeakingRate: Optional[EstimatedSpeakingRate] = None
    pitchStats: PitchStats
    energyStats: EnergyStats
    pauseMetrics: PauseMetrics
    frames: List[AcousticFrame]

class FlawGrounding(BaseModel):
    id: str
    startTime: float
    endTime: float
    feature: str  # speaking_rate | pause_anomaly | pitch_variation | vocal_energy | acoustic_spectral
    severity: str  # high | medium | low
    title: str
    measuredDeviation: str
    referenceValue: str
    participantValue: str
    evidence: str
    suggestion: str
    confidence: float
    category: str

class AlignmentInfo(BaseModel):
    method: str
    dtwDistance: float
    referenceDuration: float
    participantDuration: float
    durationRatio: float
    limitations: str

class ComparisonSummary(BaseModel):
    overallSimilarityScore: float
    speakingRateComparison: str
    energyDynamicsComparison: str
    pitchStabilityComparison: str
    pauseRhythmComparison: str

class ContrastiveComparisonResult(BaseModel):
    referenceAnalysis: SpeechAnalysis
    participantAnalysis: SpeechAnalysis
    alignment: AlignmentInfo
    deviations: List[FlawGrounding]
    summary: ComparisonSummary

class GroundTruthInterval(BaseModel):
    start: float
    end: float
    label: str

class DatasetItem(BaseModel):
    id: str
    title: str
    speechDomain: str
    speaker: str
    transcript: str
    hasAudio: bool = True
    referenceAudioFile: str
    participantAudioFile: str
    flawCategory: str
    flawSeverity: str
    groundTruthIntervals: List[GroundTruthInterval]
    isSynthetic: bool
    split: str  # train | validation | test
    notes: str

class DetectionMetrics(BaseModel):
    iouThreshold: float
    precision: float
    recall: float
    f1Score: float
    meanIoU: float

class CategoryEvaluation(BaseModel):
    category: str
    sampleCount: int
    precision: float
    recall: float
    f1: float

class FailureCase(BaseModel):
    caseId: str
    issue: str
    rootCause: str
    remediation: str

class EvaluationSettings(BaseModel):
    minDeviationThreshold: float
    temporalToleranceSec: float
    alignmentAlgorithm: str

class EvaluationMetricReport(BaseModel):
    testSetSize: int
    flawCategoryCounts: Dict[str, int]
    syntheticSampleCount: int
    humanSampleCount: int
    detectionMetrics: DetectionMetrics
    categoryBreakdown: List[CategoryEvaluation]
    featureExtractionSuccessRate: float
    failureCases: List[FailureCase]
    evaluationSettings: EvaluationSettings
