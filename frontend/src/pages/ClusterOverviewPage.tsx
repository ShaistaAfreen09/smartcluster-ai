import React from 'react'
import MetricCard from '../components/MetricCard'

const clusterMetrics = [
  { title: 'Cluster Health', value: '99.1%', delta: '+1.2%' },
  { title: 'Nodes Online', value: '12', delta: '+0' },
  { title: 'Pods Running', value: '243', delta: '+3%' },
  { title: 'Avg CPU', value: '58%', delta: '-2%' },
]

const ClusterOverviewPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">Cluster</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Cluster Overview</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">High-level health and resource metrics for your cluster.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {clusterMetrics.map((m) => (
            <MetricCard key={m.title} title={m.title} value={m.value} delta={m.delta} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cluster Summary</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">This cluster is operating normally. No critical alerts in the last 24 hours.</p>

          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Namespaces: <strong className="ml-2">14</strong></li>
            <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Persistent Volumes: <strong className="ml-2">27</strong></li>
            <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Ingresses: <strong className="ml-2">6</strong></li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Events</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Scaled deployment <strong>web-frontend</strong> to 5 replicas.</li>
            <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Auto-healed node <strong>node-7</strong>.</li>
            <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">Created snapshot for storage class <strong>fast-ssd</strong>.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default ClusterOverviewPage
