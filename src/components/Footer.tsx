export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <p>HS 02-2025/26 • City of Tshwane Chemical Toilet Hire</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition">
            Audit Log
          </a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition">
            Settings
          </a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition">
            Help
          </a>
        </div>
      </div>
    </footer>
  );
}
