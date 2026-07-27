'use client';

import { useState } from 'react';
import { company } from '@/config/company';
import { regions, cotCoordinators, allocations } from '@/lib/mock-data';
import { MapPin, Plus, Pencil, X, Check } from 'lucide-react';

export default function RegionsPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEdit = (id: string, name: string) => { setEditingId(id); setEditName(name); };
  const cancelEdit = () => setEditingId(null);

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Regions & Coordinators</h1>
            <p className="text-muted-foreground text-sm">
              Reference data for regions and {company.client} coordinators.
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition">
            <Plus className="w-4 h-4" />
            New region
          </button>
        </div>

        {/* Regions */}
        <div className="space-y-4">
          {regions.map((region) => {
            const coordinators = cotCoordinators.filter((c) => c.regionId === region.id);
            const regionAllocations = allocations.filter((a) => a.regionId === region.id);

            return (
              <div key={region.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Region header */}
                <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  {editingId === region.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 max-w-xs rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:text-foreground"><Check className="w-4 h-4 text-green-500" /></button>
                      <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <h2 className="font-semibold text-foreground">{region.name}</h2>
                      <button
                        onClick={() => startEdit(region.id, region.name)}
                        className="ml-2 p-1 text-muted-foreground hover:text-foreground transition opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {regionAllocations.length} allocation{regionAllocations.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Coordinators table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cellphone</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {coordinators.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition group">
                        <td className="px-5 py-3 font-medium text-foreground">{c.fullname}</td>
                        <td className="px-5 py-3 text-muted-foreground">{c.cellphone ?? '—'}</td>
                        <td className="px-5 py-3 text-muted-foreground">{c.email ?? '—'}</td>
                        <td className="px-5 py-3 text-right">
                          <button className="p-1 text-muted-foreground hover:text-foreground transition opacity-0 group-hover:opacity-100">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coordinators.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-4 text-sm text-muted-foreground">No coordinators yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="px-5 py-3 border-t border-border">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition">
                    + Add coordinator
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
