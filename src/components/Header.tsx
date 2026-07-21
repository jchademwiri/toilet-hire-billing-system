export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">HS</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">HS02</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Billing System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Allocations
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Billing
            </a>
            <a
              href="#"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition"
            >
              Reports
            </a>
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
