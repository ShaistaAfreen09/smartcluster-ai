import React from "react";
import { PredictorData } from "../types";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceDot
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertOctagon, 
  Cpu, 
  HardDrive, 
  Activity, 
  Gauge, 
  LineChart as RechartsIcon, 
  Award,
  ShieldCheck
} from "lucide-react";

interface PredictiveAnalyticsProps {
  predictionData: PredictorData | null;
  loading: boolean;
}

export default function PredictiveAnalytics({
  predictionData,
  loading
}: PredictiveAnalyticsProps) {

  if (loading || !predictionData) {
    return (
      <div id="predictive-loading-state" className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-purple-500 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Executing Regression Forecast Models...</p>
        </div>
      </div>
    );
  }

  const { metricsHistory, predictions, regressionAnalysis } = predictionData;

  // Prepare composed charts data combining historical points and predictions
  const cpuChartData = [
    ...metricsHistory.map((pt, index) => ({
      name: pt.timestamp,
      type: "Historical",
      actualCPU: pt.cpuUsedCores,
      linearTrendCPU: null,
      proactiveAI: null,
      capacity: pt.cpuCapacityCores
    })),
    ...predictions.map((pt) => ({
      name: pt.timestamp,
      type: "Predicted (Future)",
      actualCPU: null,
      linearTrendCPU: pt.predictedCpuLinear,
      proactiveAI: pt.predictedCpuEnsemble,
      confidenceLower: pt.confidenceIntervalCpu[0],
      confidenceUpper: pt.confidenceIntervalCpu[1],
      capacity: pt.confidenceIntervalCpu[1] * 1.5 // approximate ceiling
    }))
  ];

  const memChartData = [
    ...metricsHistory.map((pt) => ({
      name: pt.timestamp,
      type: "Historical",
      actualMem: pt.memUsedGi,
      linearTrendMem: null,
      proactiveAIMem: null,
      capacity: pt.memCapacityGi
    })),
    ...predictions.map((pt) => ({
      name: pt.timestamp,
      type: "Predicted (Future)",
      actualMem: null,
      linearTrendMem: pt.predictedMemLinear,
      proactiveAIMem: pt.predictedMemEnsemble,
      confidenceLower: pt.confidenceIntervalMem[0],
      confidenceUpper: pt.confidenceIntervalMem[1]
    }))
  ];

  // Custom tooltips to present research values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg shadow-xl text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
          <p className="font-bold border-b border-slate-200 dark:border-slate-800 pb-1 mb-1.5 flex justify-between gap-4">
            <span>Time Coordinate:</span>
            <span className="text-blue-500">{label}</span>
          </p>
          {payload.map((item: any) => {
            if (item.value === null || item.value === undefined) return null;
            return (
              <div key={item.name} className="flex justify-between gap-6">
                <span className="text-slate-500" style={{ color: item.color }}>• {item.name}:</span>
                <span className="font-bold">{item.value} {item.name.toLowerCase().includes("mem") ? "GiB" : "Cores"}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const getRSquareEvaluation = (score: number) => {
    if (score > 0.8) return { label: "Excellent SRE fit (R² > 0.8)", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/15" };
    if (score > 0.6) return { label: "Good predictive trends (R² > 0.6)", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/15" };
    return { label: "Highly dynamic load cycles (Adaptive fit)", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/15" };
  };

  const currentCpuSlopes = regressionAnalysis.cpu;
  const currentMemSlopes = regressionAnalysis.memory;

  return (
    <div id="predictive-analytics-view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RechartsIcon className="text-purple-500" />
            Regression Forecasting & Predictive Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Statistical regression fits & non-linear seasonal ensembles executing online Prometheus telemetry forecasting.
          </p>
        </div>
      </div>

      {/* MATH MODEL DIAGNOSTICS BENTO ROW */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Regression Fit Diagnostics & Mathematical Models
      </h3>
      <div id="diagnostics-row" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Least-Squares fit */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-500 w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">CPU Least-Squares Regression Fit</h4>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${getRSquareEvaluation(currentCpuSlopes.rSquareScore).color}`}>
              {getRSquareEvaluation(currentCpuSlopes.rSquareScore).label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Calculated Formula</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{currentCpuSlopes.regressionFormula}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Coefficient of Determination</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">R² = {parseFloat(currentCpuSlopes.rSquareScore.toFixed(4))}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Telemetry slope coefficient:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{parseFloat(currentCpuSlopes.slopeCoefficientCoresPerHour.toFixed(4))} Cores/hr</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400">
              {currentCpuSlopes.slopeCoefficientCoresPerHour > 0.01 ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Increasing Load
                </>
              ) : currentCpuSlopes.slopeCoefficientCoresPerHour < -0.01 ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Usage Compression
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Stable Quiescent
                </>
              )}
            </div>
          </div>
        </div>

        {/* Memory Least-Squares fit */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="text-emerald-500 w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">RAM Least-Squares Regression Fit</h4>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${getRSquareEvaluation(currentMemSlopes.rSquareScore).color}`}>
              {getRSquareEvaluation(currentMemSlopes.rSquareScore).label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Calculated Formula</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{currentMemSlopes.regressionFormula}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Coefficient of Determination</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">R² = {parseFloat(currentMemSlopes.rSquareScore.toFixed(4))}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Telemetry slope coefficient:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{parseFloat(currentMemSlopes.slopeCoefficientGiPerHour.toFixed(4))} GiB/hr</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              {currentMemSlopes.slopeCoefficientGiPerHour > 0.01 ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Increasing Expansion
                </>
              ) : currentMemSlopes.slopeCoefficientGiPerHour < -0.01 ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Releasing Mem Cache
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Leak-Free Allocation
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED CHARTS VISUALIZATIONS */}
      <div id="forecasting-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* CPU FORECAST COMPOSED CHART */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">CPU Trendline vs AI-Assisted Forecast</h4>
              <p className="text-[10px] text-slate-400">Compares traditional linear trendlines with non-linear neural seasonal ensembles.</p>
            </div>
            <span className="text-[9px] font-mono text-slate-400">Unit: Cores (m/1000)</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cpuChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuConfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/40" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fill: "#94a3b8" }} 
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                
                {/* Confidence intervals projection */}
                <Area 
                  name="Confidence Band" 
                  type="monotone" 
                  dataKey="confidenceUpper" 
                  stroke="none" 
                  fill="url(#cpuConfGrad)" 
                />
                
                {/* Historical point plots */}
                <Line 
                  name="Historical CPU Used" 
                  type="monotone" 
                  dataKey="actualCPU" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 2.5, strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
                
                {/* Linear regression projections */}
                <Line 
                  name="Least-Squares Projection" 
                  type="monotone" 
                  dataKey="linearTrendCPU" 
                  stroke="#10b981" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4" 
                  dot={false}
                />
                
                {/* Adaptive Smart Predictive forecasts */}
                <Line 
                  name="AI Proactive Target (Ensemble)" 
                  type="monotone" 
                  dataKey="proactiveAI" 
                  stroke="#a855f7" 
                  strokeWidth={2.5}
                  dot={{ r: 3, stroke: "#a855f7" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MEMORY FORECAST COMPOSED CHART */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">RAM Trendline vs AI-Assisted Forecast</h4>
              <p className="text-[10px] text-slate-400">Forecasting memory storage parameters to identify potential node OOM limits before they trigger.</p>
            </div>
            <span className="text-[9px] font-mono text-slate-400">Unit: GiB Capacity</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={memChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="memConfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800/40" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fill: "#94a3b8" }} 
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                
                {/* Confidence intervals projection */}
                <Area 
                  name="Confidence Band" 
                  type="monotone" 
                  dataKey="confidenceUpper" 
                  stroke="none" 
                  fill="url(#memConfGrad)" 
                />
                
                {/* Historical point plots */}
                <Line 
                  name="Historical RAM Used" 
                  type="monotone" 
                  dataKey="actualMem" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                
                {/* Linear regression projections */}
                <Line 
                  name="Least-Squares Projection" 
                  type="monotone" 
                  dataKey="linearTrendMem" 
                  stroke="#f59e0b" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4" 
                  dot={false}
                />
                
                {/* Adaptive Smart Predictive forecasts */}
                <Line 
                  name="AI Proactive Target (Ensemble)" 
                  type="monotone" 
                  dataKey="proactiveAIMem" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={{ r: 3, stroke: "#10b981" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 6-HOUR FORECAST TARGET METRICS TABLE */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 overflow-hidden shadow-sm mt-8">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">6-Hour Prognostic Active Limits Forecast Table</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Statistical projections of cluster load, helping administrators set pre-emptive container sizing.</p>
          </div>
          <Award className="w-5 h-5 text-purple-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800/60 font-mono">
                <th className="p-3">Horizon Scale</th>
                <th className="p-3">Predicted Timestamp</th>
                <th className="p-3 text-center">Predicted Traffic Ingress</th>
                <th className="p-3">Predicted CPU usage (Ensemble)</th>
                <th className="p-3">CPU Confidence Range (90% Interval)</th>
                <th className="p-3">Predicted Memory (Ensemble)</th>
                <th className="p-3">Mem Confidence Range (90% Interval)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {predictions.map((pt) => {
                const bottleneckWarn = pt.predictedCpuEnsemble > 12;
                return (
                  <tr key={pt.hourOffset} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all ${bottleneckWarn ? "bg-amber-50/20 dark:bg-amber-950/5" : ""}`}>
                    <td className="p-3 font-semibold text-slate-500 dark:text-slate-400">
                      T + {pt.hourOffset} {pt.hourOffset === 1 ? "Hour" : "Hours"}
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{pt.timestamp}</td>
                    <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">{pt.predictedTrafficRPS} RPS</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-950 dark:text-white">{pt.predictedCpuEnsemble} Cores</span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      [{pt.confidenceIntervalCpu[0]} - {pt.confidenceIntervalCpu[1]}] Cores
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-850 dark:text-slate-300">{pt.predictedMemEnsemble} GiB</span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      [{pt.confidenceIntervalMem[0]} - {pt.confidenceIntervalMem[1]}] GiB
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
