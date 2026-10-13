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
  TrendingUp,
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
import { AcousticMetricsCard } from './AcousticMetricsCard';

export const EvaluationTab: React.FC = () => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-semibold">
              Empirical Validation
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Track C Benchmarking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Model Evaluation & Benchmarking
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Reproducible validation across annotated benchmark test pairs. Computes temporal IoU, precision, recall, and category breakdowns.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunEvaluation}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] disabled:bg-slate-300 text-white font-semibold text-xs transition shadow-[0_2px_12px_rgba(99,91,255,0.25)] flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
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
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Benchmark Results */}
      {report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AcousticMetricsCard
              title="Temporal Flaw Recall"
              value={`${Math.round(report.detectionMetrics.recall * 100)}%`}
              unit="Recall"
              subtitle="Proportion of true ground-truth delivery flaws flagged"
              icon={CheckCircle2}
              accentColor="emerald"
              badge="High Sensitivity"
            />
            <AcousticMetricsCard
              title="Temporal Mean IoU"
              value={`${report.detectionMetrics.meanIoU.toFixed(3)}`}
              unit="IoU"
              subtitle={`Intersection-over-Union against labeled intervals (Threshold ${report.detectionMetrics.iouThreshold})`}
              icon={Timer}
              accentColor="indigo"
              badge="Accurate Bounds"
            />
            <AcousticMetricsCard
              title="Benchmark F1 Score"
              value={`${report.detectionMetrics.f1Score.toFixed(2)}`}
              unit="Harmonic Mean"
              subtitle={`Precision: ${Math.round(report.detectionMetrics.precision * 100)}% · Recall: ${Math.round(report.detectionMetrics.recall * 100)}%`}
              icon={BarChart3}
              accentColor="blue"
              badge="Balanced Metric"
            />
            <AcousticMetricsCard
              title="Test Corpus Size"
              value={`${report.testSetSize}`}
              unit="Pairs"
              subtitle={`${report.humanSampleCount} authentic human recordings · ${report.syntheticSampleCount} synthetic controls`}
              icon={Layers}
              accentColor="violet"
              badge="Deterministic Split"
            />
          </div>

          {/* Category Breakdown Recharts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Performance by Flaw Classification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated independently across excessive pauses, rushed tempo, and monotone intonation
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                  <span className="text-slate-700">Recall (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#635BFF]" />
                  <span className="text-slate-700">Precision (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#3898FF]" />
                  <span className="text-slate-700">F1 Score (%)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg font-mono space-y-1">
                            <p className="font-bold text-[#635BFF]">{d.category}</p>
                            <p className="text-emerald-400">Recall: {d.recall}%</p>
                            <p className="text-[#635BFF]">Precision: {d.precision}%</p>
                            <p className="text-[#3898FF]">F1 Score: {d.f1}%</p>
                            <p className="text-slate-400 mt-1">Samples: {d.samples}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="recall" fill="#10b981" radius={[4, 4, 0, 0]} name="Recall" />
                  <Bar dataKey="precision" fill="#635BFF" radius={[4, 4, 0, 0]} name="Precision" />
                  <Bar dataKey="f1" fill="#3898FF" radius={[4, 4, 0, 0]} name="F1 Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Documented Failure Cases & Root Cause Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Documented Failure Cases & Boundary Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Empirical failure modes and engineering remediations discovered during benchmark verification
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {report.failureCases.map((fCase) => (
                <div
                  key={fCase.caseId}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-md text-[10px]">
                      {fCase.caseId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{fCase.issue}</span>
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-900">Root Cause: </strong>
                    <span className="text-slate-600 leading-relaxed">{fCase.rootCause}</span>
                  </div>
                  <div className="text-emerald-800">
                    <strong className="text-emerald-950">Remediation: </strong>
                    <span className="text-emerald-700 leading-relaxed">{fCase.remediation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Settings Disclosure */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>
                <strong>Evaluation Settings:</strong> IoU Threshold: {report.evaluationSettings.minDeviationThreshold} · Temporal Tolerance: ±{report.evaluationSettings.temporalToleranceSec}s · Alignment: {report.evaluationSettings.alignmentAlgorithm}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Deterministic Ground-Truth Test</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">
            Benchmark Metrics Not Evaluated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
            Execute the test suite against the ground-truth labeled speech corpus in <code className="text-[#635BFF]">dataset/annotations/benchmark_pairs.json</code> to compute live IoU, precision, and recall.
          </p>
          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            Run Benchmark Evaluation
          </button>
        </div>
      )}
    </div>
  );
};
