import { Activity, BarChart3, Database, ServerCog, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const items = [
  { label: 'Dashboard', icon: Activity, path: '/' },
  { label: 'Cluster', icon: ServerCog, path: '/cluster' },
  { label: 'Nodes', icon: BarChart3, path: '/nodes' },
  { label: 'Pods', icon: BarChart3, path: '/pods' },
  { label: 'AI Insights', icon: Sparkles, path: '/insights' },
  { label: 'Datastore', icon: Database, path: '/' },
]

const Sidebar = () => {
  return (
    <aside className="hidden w-80 flex-col border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/20">
          SC
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">SmartCluster</p>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AI Platform</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">AI Recommendation</p>
        <p className="mt-2 text-sm leading-6">Optimize resource utilization with predictive forecasting and automated policy suggestions.</p>
      </div>
    </aside>
  )
}

export default Sidebar
