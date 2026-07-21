export default function Home() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Welcome to the HS02 Billing System. Manage your allocations, generate invoices,
          and track payments.
        </p>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Active Toilets</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">0</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Allocations</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">0</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Outstanding AR</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">R0.00</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Next Service</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">—</p>
          </div>
        </div>
      </div>
    </main>
  );
}
