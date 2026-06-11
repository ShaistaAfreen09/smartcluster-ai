import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

const overviewCards = [
  { title: 'Cluster Health', value: '98.7%', delta: '+4.3%' },
  { title: 'Pod Utilization', value: '63.2%', delta: '-1.8%' },
  { title: 'Node Efficiency', value: '89.4%', delta: '+2.1%' },
  { title: 'Forecast Accuracy', value: '94.1%', delta: '+0.7%' },
]

const utilizationData = [
  { name: '00:00', cpu: 30, memory: 45 },
  { name: '04:00', cpu: 35, memory: 52 },
  { name: '08:00', cpu: 55, memory: 60 },
  { name: '12:00', cpu: 70, memory: 75 },
  { name: '16:00', cpu: 62, memory: 69 },
  { name: '20:00', cpu: 54, memory: 65 },
]

const forecastData = [
  { name: 'Mon', usage: 65 },
  { name: 'Tue', usage: 70 },
  { name: 'Wed', usage: 75 },
  { name: 'Thu', usage: 72 },
  { name: 'Fri', usage: 78 },
  { name: 'Sat', usage: 82 },
  { name: 'Sun', usage: 76 },
]

const workloadData = [
  { name: 'API', value: 38 },
  { name: 'Batch', value: 28 },
  { name: 'DB', value: 20 },
  { name: 'AI', value: 14 },
]

const colors = ['#7c3aed', '#3b82f6', '#0ea5e9', '#10b981']

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-400">Overview</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Cluster performance</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Real-time observability across Kubernetes resources with AI-backed recommendations.</p>
            </div>
            <div className="inline-flex items-center rounded-3xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Live data
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewCards.map((card) => (
              <div key={card.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                <p className="mt-2 text-sm text-emerald-500">{card.delta}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Forecast</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">7-day demand</h3>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">AI prediction</span>
            </div>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip cursor={{ stroke: '#a78bfa', strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="usage" stroke="#7c3aed" fill="url(#forecastGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Workload distribution</p>
            <div className="mt-6 flex h-56 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workloadData} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={4} cornerRadius={10}>
                    {workloadData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {workloadData.map((entry, index) => (
                <div key={entry.name} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{entry.name}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{entry.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Utilization</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">CPU & Memory trends</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Last 24 hours</span>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.12)' }} />
                <Bar dataKey="cpu" name="CPU" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="memory" name="Memory" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">AI recommendations</h3>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="font-semibold text-slate-900 dark:text-white">Right-size Node pools</p>
                <p className="mt-2">Recommend reducing one underutilized node pool to optimize cost while preserving capacity.</p>
              </li>
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="font-semibold text-slate-900 dark:text-white">Scale deployment autoscaling</p>
                <p className="mt-2">Enable HPA on high-variance workloads for smoother response under peak load.</p>
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Anomaly alerts</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Alerts in last 24h</h3>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">2 active</span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-800 dark:bg-rose-950/40">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">Memory usage spike detected on ubuntu-node-4</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">AI anomaly detector flagged a sustained memory increase with abnormal pod count growth.</p>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">Pod restart rate increased in analytics deployment</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Investigate recent rollout and autoscaler behavior for the analytics workload.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
