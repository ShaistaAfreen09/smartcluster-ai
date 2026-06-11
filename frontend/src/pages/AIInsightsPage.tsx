import React from 'react'
import MetricCard from '../components/MetricCard'

const recommendations = [
  { id: 1, title: 'Right-size GPU pool', description: 'Reduce idle GPU nodes by 1 to save cost.' },
  { id: 2, title: 'Enable HPA on analytics', description: 'Autoscale analytics deployment based on CPU usage.' },
  { id: 3, title: 'Merge small namespaces', description: 'Consolidate low-usage namespaces to reduce overhead.' },
]

const anomalies = [
  { id: 1, title: 'Memory spike', details: 'Memory on ubuntu-node-4 exceeded 90% for 12 minutes.' },
  { id: 2, title: 'Restart surge', details: 'analytics pods restarted 12 times in 2 hours.' },
]

const AIInsightsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">AI</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">AI Insights</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Model-driven recommendations and detected anomalies.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Recommendations" value={`${recommendations.length}`} />
          <MetricCard title="Anomalies" value={`${anomalies.length}`} />
          <MetricCard title="Forecast Accuracy" value="94.3%" />
          <MetricCard title="Models Active" value="3" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recommendations</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              {recommendations.map((r) => (
                <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Anomalies</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              {anomalies.map((a) => (
                <li key={a.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.details}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsightsPage
