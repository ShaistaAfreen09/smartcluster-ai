import React from 'react'

type MetricCardProps = {
  title: string
  value: string
  delta?: string
  children?: React.ReactNode
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, delta, children }) => {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
          {delta && <p className="mt-2 text-sm text-emerald-500">{delta}</p>}
        </div>
        {children && <div className="ml-4 flex items-center">{children}</div>}
      </div>
    </div>
  )
}

export default MetricCard
