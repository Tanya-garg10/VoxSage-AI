import React, { useState } from 'react';
import {
  BarChart3,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  ShieldAlert,
  Percent,
  Timer,
  Sliders,
  Scale,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { runEvaluation } from '../services/api';
import { EvaluationMetricReport } from '../types';
import { EditorialMetricCard } from './EditorialMetricCard';

export const EvaluationView: React.FC = () => {
  const [report, setReport] = useState<EvaluationMetricReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await runEvaluation();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Evaluation pipeline execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = report?.categoryBreakdown.map((item) => ({
    category: item.category.replace('_', ' ').toUpperCase(),
    precision: Number((item.precision * 100).toFixed(1)),
    recall: Number((item.recall * 100).toFixed(1)),
    f1: Number((item.f1 * 100).toFixed(1)),
    samples: item.sampleCount,
  })) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-[#E6E2D9] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#6558D9]">
            REPRODUCIBLE BENCHMARKING
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#242522] mt-1">
            Model Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-[#77766F] mt-1">
            Empirical validation against annotated benchmark test pairs. Computes temporal IoU, precision, recall, and category breakdowns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunEvaluation}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-[#242522] hover:bg-[#6558D9] disabled:bg-[#D9D5CC] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Executing Evaluation Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Benchmark Evaluation</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#D97757]/10 border border-[#D97757]/30 text-[#D97757] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Benchmark Results */}
      {report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <EditorialMetricCard
              label="Flaw Recall"
              value={`${Math.round(report.detectionMetrics.recall * 100)}%`}
              unit="Recall"
              subtext="Proportion of true ground-truth delivery flaws flagged"
              icon={CheckCircle2}
              colorScheme="success"
              badge="High Sensitivity"
            />
            <EditorialMetricCard
              label="Temporal Mean IoU"
              value={`${report.detectionMetrics.meanIoU.toFixed(3)}`}
              unit="IoU"
              subtext={`Intersection-over-Union against labeled intervals (Threshold ${report.detectionMetrics.iouThreshold})`}
              icon={Timer}
              colorScheme="accent"
              badge="Accurate Bounds"
            />
            <EditorialMetricCard
              label="Benchmark F1 Score"
              value={`${report.detectionMetrics.f1Score.toFixed(2)}`}
              unit="Harmonic Mean"
              subtext={`Precision: ${Math.round(report.detectionMetrics.precision * 100)}% · Recall: ${Math.round(report.detectionMetrics.recall * 100)}%`}
              icon={BarChart3}
              colorScheme="reference"
              badge="Harmonic Score"
            />
            <EditorialMetricCard
              label="Test Corpus Size"
              value={`${report.testSetSize}`}
              unit="Pairs"
              subtext={`${report.humanSampleCount} authentic human recordings · ${report.syntheticSampleCount} synthetic controls`}
              icon={Layers}
              colorScheme="neutral"
              badge="Deterministic Split"
            />
          </div>

          {/* Category Breakdown Recharts */}
          <div className="editorial-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E2D9] pb-3">
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
                  Performance by Flaw Classification
                </h3>
                <p className="text-xs text-[#77766F]">
                  Calculated independently across excessive pauses, rushed tempo, and monotone intonation
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-[#77766F]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#4E826B]" />
                  <span>Recall (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#6558D9]" />
                  <span>Precision (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#4E8BBD]" />
                  <span>F1 Score (%)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D9" opacity={0.6} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#77766F' }}
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#77766F' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#242522] text-[#FFFEFB] text-xs p-3 rounded-lg shadow-lg font-mono space-y-1">
                            <p className="font-bold text-[#6558D9]">{d.category}</p>
                            <p className="text-[#4E826B]">Recall: {d.recall}%</p>
                            <p className="text-[#6558D9]">Precision: {d.precision}%</p>
                            <p className="text-[#4E8BBD]">F1 Score: {d.f1}%</p>
                            <p className="text-[#D9D5CC] mt-1">Ground-truth samples: {d.samples}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="recall" fill="#4E826B" radius={[3, 3, 0, 0]} name="Recall" />
                  <Bar dataKey="precision" fill="#6558D9" radius={[3, 3, 0, 0]} name="Precision" />
                  <Bar dataKey="f1" fill="#4E8BBD" radius={[3, 3, 0, 0]} name="F1 Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Documented Failure Cases & Root Cause Analysis */}
          <div className="editorial-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E6E2D9] pb-3">
              <ShieldAlert className="w-5 h-5 text-[#D97757]" />
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
                  Documented Failure Cases & Boundary Analysis
                </h3>
                <p className="text-xs text-[#77766F]">
                  Empirical failure modes and engineering remediations discovered during benchmark verification
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {report.failureCases.map((fCase) => (
                <div
                  key={fCase.caseId}
                  className="p-4 rounded-xl border border-[#E6E2D9] bg-[#F7F5F0]/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#6558D9] bg-[#6558D9]/10 px-2 py-0.5 rounded text-[10px]">
                      {fCase.caseId}
                    </span>
                    <span className="text-[11px] text-[#77766F] font-medium">{fCase.issue}</span>
                  </div>
                  <div className="text-[#242522]">
                    <strong>Root Cause: </strong>
                    <span className="text-[#77766F] leading-relaxed">{fCase.rootCause}</span>
                  </div>
                  <div className="text-[#4E826B]">
                    <strong>Remediation: </strong>
                    <span className="text-[#4E826B] leading-relaxed font-medium">{fCase.remediation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Settings Disclosure */}
          <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#E6E2D9] text-xs text-[#77766F] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#77766F]" />
              <span>
                <strong>Evaluation Settings:</strong> IoU Threshold: {report.evaluationSettings.minDeviationThreshold} · Temporal Tolerance: ±{report.evaluationSettings.temporalToleranceSec}s · Alignment: {report.evaluationSettings.alignmentAlgorithm}
              </span>
            </div>
            <span className="text-[11px] font-mono">Deterministic Ground-Truth Test</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="editorial-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-12 h-12 rounded-xl bg-[#F7F5F0] border border-[#E6E2D9] flex items-center justify-center text-[#77766F] mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
            Not evaluated yet
          </h3>
          <p className="text-xs text-[#77766F] max-w-sm mt-1 mb-4 leading-relaxed">
            Execute the test suite against the ground-truth labeled speech corpus in <code className="text-[#6558D9]">dataset/annotations/benchmark_pairs.json</code> to compute live IoU, precision, and recall.
          </p>
          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold transition cursor-pointer"
          >
            Run Benchmark Evaluation
          </button>
        </div>
      )}
    </div>
  );
};
