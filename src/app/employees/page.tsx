'use client';

import { Fragment, useState, useCallback } from 'react';
import { employees as initialEmployees, areas, allocations } from '@/lib/mock-data';
import {
  Plus, Search, Pencil, Trash2, X, Check, AlertTriangle, Layers, List,
} from 'lucide-react';

type Position = 'All' | 'Coordinator' | 'Cleaner';
type Employee = typeof initialEmployees[number];

// ── Modal backdrop ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 p-6">
        {children}
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  title, message, onConfirm, onCancel,
}: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal onClose={onCancel}>
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/80 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Employee form (add / edit) ────────────────────────────────────────────────

function EmployeeForm({
  employee, onSave, onCancel,
}: {
  employee?: Employee;
  onSave: (data: { fullname: string; position: 'Coordinator' | 'Cleaner'; areaId: string }) => void;
  onCancel: () => void;
}) {
  const [fullname, setFullname] = useState(employee?.fullname ?? '');
  const [position, setPosition] = useState<'Coordinator' | 'Cleaner'>(employee?.position ?? 'Cleaner');
  const [areaId, setAreaId] = useState(employee?.areaId ?? areas[0]?.id ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !areaId) return;
    onSave({ fullname: fullname.trim(), position, areaId });
  };

  const selectedArea = areas.find((a) => a.id === areaId);
  const selectedAllocation = allocations.find((a) => a.id === selectedArea?.allocationId);

  return (
    <Modal onClose={onCancel}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {employee ? 'Edit employee' : 'Add employee'}
        </h3>
        <button onClick={onCancel} className="p-1 hover:bg-muted rounded transition">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="e.g. John Doe"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Position</label>
          <div className="flex gap-2">
            {(['Coordinator', 'Cleaner'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPosition(p)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  position === p
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Area / Site</label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {areas.map((a) => {
              const alloc = allocations.find((al) => al.id === a.allocationId);
              return (
                <option key={a.id} value={a.id}>
                  {a.name} — {alloc?.regionName ?? '—'} ({a.toiletCount} toilets)
                </option>
              );
            })}
          </select>
          {selectedAllocation && (
            <p className="text-xs text-muted-foreground">
              Allocation: {selectedAllocation.regionName} &middot; {selectedAllocation.cotCoordinatorName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
          >
            <Check className="w-4 h-4" />
            {employee ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [query, setQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position>('All');
  const [allocationFilter, setAllocationFilter] = useState<string>('All');
  const [grouped, setGrouped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | undefined>();

  // Compute the next available ID
  const nextId = useCallback(() => {
    const maxNum = employees.reduce((max, e) => {
      const num = parseInt(e.id.replace('e-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `e-${String(maxNum + 1).padStart(3, '0')}`;
  }, [employees]);

  // CRUD handlers
  const handleAdd = (data: { fullname: string; position: 'Coordinator' | 'Cleaner'; areaId: string }) => {
    const newEmployee: Employee = {
      id: nextId(),
      fullname: data.fullname,
      position: data.position,
      areaId: data.areaId,
    };
    setEmployees((prev) => [...prev, newEmployee]);
    setShowForm(false);
  };

  const handleEdit = (data: { fullname: string; position: 'Coordinator' | 'Cleaner'; areaId: string }) => {
    if (!editingEmployee) return;
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === editingEmployee.id
          ? { ...e, fullname: data.fullname, position: data.position, areaId: data.areaId }
          : e
      )
    );
    setEditingEmployee(undefined);
  };

  const handleDelete = () => {
    if (!deletingEmployee) return;
    setEmployees((prev) => prev.filter((e) => e.id !== deletingEmployee.id));
    setDeletingEmployee(undefined);
  };

  // Filtering
  const filtered = employees.filter((e) => {
    const area = areas.find((a) => a.id === e.areaId);
    const matchesQuery = e.fullname.toLowerCase().includes(query.toLowerCase());
    const matchesPosition = positionFilter === 'All' || e.position === positionFilter;
    const matchesAllocation = allocationFilter === 'All' || area?.allocationId === allocationFilter;
    return matchesQuery && matchesPosition && matchesAllocation;
  });

  const coordinators = employees.filter((e) => e.position === 'Coordinator').length;
  const cleaners = employees.filter((e) => e.position === 'Cleaner').length;

  // Group filtered employees by allocation (region), sorted by region name
  const groups = [...allocations]
    .sort((a, b) => a.regionName.localeCompare(b.regionName))
    .map((alloc) => ({
      allocation: alloc,
      employees: filtered.filter((e) => {
        const area = areas.find((a) => a.id === e.areaId);
        return area?.allocationId === alloc.id;
      }),
    }))
    .filter((g) => g.employees.length > 0);

  const renderEmployeeRow = (e: Employee) => {
    const area = areas.find((a) => a.id === e.areaId);
    const allocation = allocations.find((a) => a.id === area?.allocationId);
    return (
      <tr key={e.id} className="hover:bg-muted/30 transition group">
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
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setEditingEmployee(e)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Edit employee"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeletingEmployee(e)}
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition"
              title="Delete employee"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Employees</h1>
            <p className="text-muted-foreground text-sm">
              EPWP staff register — {coordinators} coordinators, {cleaners} cleaners.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
          >
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

        {/* Actions bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
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
                {p === 'All' ? 'All' : p}
              </button>
            ))}
          </div>
          <select
            value={allocationFilter}
            onChange={(e) => setAllocationFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All regions</option>
            {[...allocations]
              .sort((a, b) => a.regionName.localeCompare(b.regionName))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.regionName} — {a.cotCoordinatorName}
                </option>
              ))}
          </select>
          <button
            onClick={() => setGrouped((g) => !g)}
            title={grouped ? 'Show flat list' : 'Group by region / allocation'}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition ${
              grouped
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            {grouped ? <Layers className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            {grouped ? 'Grouped' : 'Group by region'}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Area</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation</th>
                  <th className="px-5 py-3.5 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grouped
                  ? groups.map((g) => (
                      <Fragment key={g.allocation.id}>
                        <tr className="bg-muted/60">
                          <td colSpan={5} className="px-5 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                {g.allocation.regionName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                &middot; {g.allocation.cotCoordinatorName} &middot; {g.employees.length} employee{g.employees.length === 1 ? '' : 's'}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {g.employees.map((e) => renderEmployeeRow(e))}
                      </Fragment>
                    ))
                  : filtered.map((e) => renderEmployeeRow(e))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      No employees match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} of {employees.length} employees shown</p>
      </div>

      {/* ── Add form modal ── */}
      {showForm && (
        <EmployeeForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Edit form modal ── */}
      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleEdit}
          onCancel={() => setEditingEmployee(undefined)}
        />
      )}

      {/* ── Delete confirmation ── */}
      {deletingEmployee && (
        <ConfirmDialog
          title="Delete employee"
          message={`Are you sure you want to remove ${deletingEmployee.fullname}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEmployee(undefined)}
        />
      )}
    </main>
  );
}
