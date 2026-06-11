import { Moon, Sun, Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getInitialTheme } from '../services/theme'

const TopNav = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme())

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <Search className="mr-2 h-4 w-4" />
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="hidden items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-800 dark:bg-slate-900 sm:flex">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-sm font-semibold text-white">SA</span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">SaaS Admin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Platform Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNav
