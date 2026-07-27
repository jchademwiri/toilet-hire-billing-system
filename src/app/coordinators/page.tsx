'use client';

import { useState } from 'react';
import { company } from '@/config/company';
import { cotCoordinators, regions, allocations } from '@/lib/mock-data';
import { Users, Plus, Pencil, Search } from 'lucide-react';

export default function CoordinatorsPage() {
  const [query, setQuery] = useState('');

  const filtered = cotCoordinators.filter((c) =>
    c.fullname.toLowerCase().includes(query.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">{company.coordinatorsTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {company.coordinatorsDescription}
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition">
            <Plus className="w-4 h-4" />
            Add coordinator
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coordinators…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cellphone</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocations</th>
                <th className="px-5 py-3.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const region = regions.find((r) => r.id === c.regionId);
                const count = allocations.filter((a) => a.cotCoordinatorId === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                          {c.fullname.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-foreground">{c.fullname}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{region?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.cellphone ?? '—'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.email ?? '—'}</td>
                    <td className="px-5 py-4 text-right text-muted-foreground">{count}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1 text-muted-foreground hover:text-foreground transition opacity-0 group-hover:opacity-100">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No coordinators match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} coordinator{filtered.length !== 1 ? 's' : ''}</p>
      </div>
    </main>
  );
}
