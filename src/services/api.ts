import {
  SpeechAnalysis,
  ContrastiveComparisonResult,
  DatasetItem,
  EvaluationMetricReport,
} from '../types';

export async function fetchHealth(): Promise<any> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function analyzeAudio(
  audioBlobOrFile: Blob | File,
  transcript?: string
): Promise<SpeechAnalysis> {
  const formData = new FormData();
  formData.append('file', audioBlobOrFile, 'recording.wav');
  if (transcript && transcript.trim()) {
    formData.append('transcript', transcript.trim());
  }

  const res = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Audio analysis failed' }));
    throw new Error(err.error || 'Failed to analyze audio');
  }

  return res.json();
}

export async function compareAudios(params: {
  referenceFile?: Blob | File;
  participantFile?: Blob | File;
  referenceSample?: string;
  participantSample?: string;
  transcript?: string;
}): Promise<ContrastiveComparisonResult> {
  const formData = new FormData();

  if (params.referenceFile) {
    formData.append('reference', params.referenceFile, 'reference.wav');
  } else if (params.referenceSample) {
    formData.append('referenceSample', params.referenceSample);
  }

  if (params.participantFile) {
    formData.append('participant', params.participantFile, 'participant.wav');
  } else if (params.participantSample) {
    formData.append('participantSample', params.participantSample);
  }

  if (params.transcript && params.transcript.trim()) {
    formData.append('transcript', params.transcript.trim());
  }

  const res = await fetch('/api/compare', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Contrastive comparison failed' }));
    throw new Error(err.error || 'Failed to compare speech recordings');
  }

  return res.json();
}

export async function fetchDataset(): Promise<DatasetItem[]> {
  const res = await fetch('/api/dataset');
  if (!res.ok) throw new Error('Failed to fetch dataset');
  return res.json();
}

export async function runEvaluation(): Promise<EvaluationMetricReport> {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
    throw new Error(err.error || 'Failed to run benchmark evaluation');
  }

  return res.json();
}
