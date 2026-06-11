import React from 'react'
import MetricCard from '../components/MetricCard'

type Node = {
  name: string
  status: 'Ready' | 'NotReady'
  cpu: string
  memory: string
}

const mockNodes: Node[] = [
  { name: 'ubuntu-node-1', status: 'Ready', cpu: '62%', memory: '68%' },
  { name: 'ubuntu-node-2', status: 'Ready', cpu: '55%', memory: '59%' },
  { name: 'ubuntu-node-3', status: 'NotReady', cpu: '0%', memory: '0%' },
  { name: 'gpu-node-1', status: 'Ready', cpu: '74%', memory: '81%' },
]

const NodesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Nodes</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Cluster Nodes</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Nodes" value={`${mockNodes.length}`} />
          <MetricCard title="Ready" value={`${mockNodes.filter(n => n.status === 'Ready').length}`} />
          <MetricCard title="NotReady" value={`${mockNodes.filter(n => n.status === 'NotReady').length}`} />
          <MetricCard title="Avg CPU" value="62%" />
        </div>

        <div className="mt-6">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-3">Name</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">CPU</th>
                <th className="pb-3">Memory</th>
              </tr>
            </thead>
            <tbody>
              {mockNodes.map((n) => (
                <tr key={n.name} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3">{n.name}</td>
                  <td className="py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${n.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{n.status}</span>
                  </td>
                  <td className="py-3">{n.cpu}</td>
                  <td className="py-3">{n.memory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NodesPage
