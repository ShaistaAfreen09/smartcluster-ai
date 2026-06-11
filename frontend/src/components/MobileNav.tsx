import { Menu } from 'lucide-react'

const MobileNav = () => {
  return (
    <div className="lg:hidden border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-white">SC</div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">SmartCluster AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kubernetes observability</p>
          </div>
        </div>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default MobileNav
