export interface AcousticFrame {
  timestamp: number;
  pitch: number | null; // in Hz
  energy: number; // RMS
  mfcc1: number;
  isSpeech: boolean;
}

export interface SpeechAnalysis {
  duration: number;
  sampleRate: number;
  speechDuration: number;
  silenceDuration: number;
  speechRatio: number;
  estimatedSpeakingRate?: {
    estimatedSyllablesPerSec: number;
    wordsPerMin?: number;
    wordCount?: number;
    confidence: string;
    note: string;
  };
  pitchStats: {
    mean: number;
    min: number;
    max: number;
    stdDev: number;
    pitchRangeSemitones: number;
  };
  energyStats: {
    meanRms: number;
    rmsStdDev: number;
    dynamicRangeDb: number;
  };
  pauseMetrics: {
    pauseCount: number;
    totalPauseDuration: number;
    meanPauseDuration: number;
    maxPauseDuration: number;
    pausesPerMinute: number;
    pauseIntervals: [number, number][];
  };
  frames: AcousticFrame[];
}

export interface FlawGrounding {
  id: string;
  startTime: number;
  endTime: number;
  feature: 'speaking_rate' | 'pause_anomaly' | 'pitch_variation' | 'vocal_energy' | 'acoustic_spectral';
  severity: 'high' | 'medium' | 'low';
  title: string;
  measuredDeviation: string;
  referenceValue: string;
  participantValue: string;
  evidence: string;
  suggestion: string;
  confidence: number; // 0 to 1
  category: string;
}

export interface ContrastiveComparisonResult {
  referenceAnalysis: SpeechAnalysis;
  participantAnalysis: SpeechAnalysis;
  alignment: {
    method: string;
    dtwDistance: number;
    referenceDuration: number;
    participantDuration: number;
    durationRatio: number;
    limitations: string;
  };
  deviations: FlawGrounding[];
  summary: {
    overallSimilarityScore: number; // 0-100
    speakingRateComparison: string;
    energyDynamicsComparison: string;
    pitchStabilityComparison: string;
    pauseRhythmComparison: string;
  };
}

export interface DatasetItem {
  id: string;
  title: string;
  speechDomain: string;
  speaker: string;
  transcript: string;
  hasAudio: boolean;
  referenceAudioFile: string;
  participantAudioFile: string;
  flawCategory: 'excessive_pauses' | 'rushed_delivery' | 'monotone_pitch' | 'vocal_fade' | 'erratic_cadence' | 'articulation_mismatch';
  flawSeverity: 'mild' | 'moderate' | 'severe';
  groundTruthIntervals: {
    start: number;
    end: number;
    label: string;
  }[];
  isSynthetic: boolean;
  split: 'train' | 'validation' | 'test';
  notes: string;
}

export interface EvaluationMetricReport {
  testSetSize: number;
  flawCategoryCounts: Record<string, number>;
  syntheticSampleCount: number;
  humanSampleCount: number;
  detectionMetrics: {
    iouThreshold: number;
    precision: number;
    recall: number;
    f1Score: number;
    meanIoU: number;
  };
  categoryBreakdown: {
    category: string;
    sampleCount: number;
    precision: number;
    recall: number;
    f1: number;
  }[];
  featureExtractionSuccessRate: number;
  failureCases: {
    caseId: string;
    issue: string;
    rootCause: string;
    remediation: string;
  }[];
  evaluationSettings: {
    minDeviationThreshold: number;
    temporalToleranceSec: number;
    alignmentAlgorithm: string;
  };
}

export interface PracticeAttempt {
  id: string;
  flawId: string;
  timestamp: number;
  duration: number;
  audioBlob: Blob;
  audioUrl: string;
  analysis?: SpeechAnalysis;
  measuredDeltas?: {
    speakingRateDelta: number;
    pauseRatioDelta: number;
    pitchVariationDelta: number;
    energyStabilityDelta: number;
  };
}

export interface PracticeSessionRecord {
  id: string;
  timestamp: string; // ISO string
  flawId: string;
  flawTitle: string;
  flawCategory: string;
  severity: string;
  interval: [number, number];
  referenceSample: string;
  originalMeasuredDeviation: string;
  postPracticeResult: {
    speakingRateChange: string;
    pauseReduction: string;
    pitchModulation: string;
    similarityImprovement: number; // e.g. +6.5%
    status: 'improved' | 'steady' | 'needs_review';
    coachExplanation: string;
  };
}

