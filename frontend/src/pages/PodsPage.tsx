import React from 'react'
import MetricCard from '../components/MetricCard'

type Pod = {
  name: string
  namespace: string
  status: 'Running' | 'Pending' | 'CrashLoopBackOff'
  node: string
  restarts: number
}

const mockPods: Pod[] = [
  { name: 'web-frontend-5d4f7', namespace: 'default', status: 'Running', node: 'ubuntu-node-1', restarts: 0 },
  { name: 'api-6c8f9', namespace: 'backend', status: 'Running', node: 'ubuntu-node-2', restarts: 1 },
  { name: 'analytics-0', namespace: 'ml', status: 'CrashLoopBackOff', node: 'gpu-node-1', restarts: 12 },
  { name: 'redis-1', namespace: 'datastore', status: 'Pending', node: 'ubuntu-node-3', restarts: 0 },
]

const PodsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Workloads</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Pods</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Current pods across namespaces with status and restart counts.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Pods" value={`${mockPods.length}`} />
          <MetricCard title="Running" value={`${mockPods.filter(p => p.status === 'Running').length}`} />
          <MetricCard title="Pending" value={`${mockPods.filter(p => p.status === 'Pending').length}`} />
          <MetricCard title="Restarts (24h)" value={`${mockPods.reduce((s, p) => s + p.restarts, 0)}`} />
        </div>

        <div className="mt-6">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-3">Name</th>
                <th className="pb-3">Namespace</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Node</th>
                <th className="pb-3">Restarts</th>
              </tr>
            </thead>
            <tbody>
              {mockPods.map((p) => (
                <tr key={p.name} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3">{p.name}</td>
                  <td className="py-3">{p.namespace}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${p.status === 'Running' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{p.status}</span>
                  </td>
                  <td className="py-3">{p.node}</td>
                  <td className="py-3">{p.restarts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PodsPage
