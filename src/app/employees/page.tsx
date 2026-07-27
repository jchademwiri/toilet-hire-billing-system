'use client';

import { useState } from 'react';
import { employees, areas, allocations } from '@/lib/mock-data';
import { Users, Plus, Search, Filter } from 'lucide-react';

type Position = 'All' | 'Coordinator' | 'Cleaner';

export default function EmployeesPage() {
  const [query, setQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position>('All');

  const filtered = employees.filter((e) => {
    const matchesQuery = e.fullname.toLowerCase().includes(query.toLowerCase());
    const matchesPosition = positionFilter === 'All' || e.position === positionFilter;
    return matchesQuery && matchesPosition;
  });

  const coordinators = employees.filter((e) => e.position === 'Coordinator').length;
  const cleaners = employees.filter((e) => e.position === 'Cleaner').length;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Employees</h1>
            <p className="text-muted-foreground text-sm">
              EPWP staff register — {coordinators} coordinators, {cleaners} cleaners.
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition">
            <Plus className="w-4 h-4" />
            Add employee
          </button>
        </div>

        {/* POPIA notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted border border-border text-xs text-muted-foreground">
          <span className="text-base leading-none mt-0.5">🔒</span>
          <p>
            <strong className="text-foreground">POPIA notice:</strong> ID numbers are personal information under the Protection of Personal Information Act.
            They are stored in a separate restricted table and are not shown here. Access is controlled separately.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-background">
            {(['All', 'Coordinator', 'Cleaner'] as Position[]).map((p) => (
              <button
                key={p}
                onClick={() => setPositionFilter(p)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                  positionFilter === p
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Area</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => {
                const area = areas.find((a) => a.id === e.areaId);
                const allocation = allocations.find((a) => a.id === area?.allocationId);
                return (
                  <tr key={e.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                          {e.fullname.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-foreground">{e.fullname}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.position === 'Coordinator'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {e.position}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{area?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{allocation?.regionName ?? '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No employees match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} of {employees.length} employees shown</p>
      </div>
    </main>
  );
}
