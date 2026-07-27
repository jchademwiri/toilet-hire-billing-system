import Link from 'next/link';
import { company } from '@/config/company';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <p>{company.contractReference} • {company.client} {company.description}</p>
        <div className="flex gap-6">
          <Link href="/audit-log" className="hover:text-zinc-900 dark:hover:text-white transition">
            Audit Log
          </Link>
          <Link href="/settings" className="hover:text-zinc-900 dark:hover:text-white transition">
            Settings
          </Link>
          <Link href="/help" className="hover:text-zinc-900 dark:hover:text-white transition">
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
