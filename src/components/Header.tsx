import Link from 'next/link';
import { company } from '@/config/company';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">{company.logoText}</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">{company.shortName}</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{company.tagline}</p>
            </div>
          </div>

          {/* Quick nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href="/allocations"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Allocations
            </Link>
            <Link
              href="/billing"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Billing
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
