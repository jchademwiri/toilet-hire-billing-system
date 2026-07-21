'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Plus,
  DollarSign,
  MapPin,
  Users,
  Briefcase,
  BarChart3,
  Send,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const navigation = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Operations',
    icon: Package,
    items: [
      { label: 'Allocations', href: '/allocations' },
      { label: 'New Allocation', href: '/allocations/new' },
      { label: 'Billing Hub', href: '/billing' },
    ],
  },
  {
    label: 'Management',
    icon: Briefcase,
    items: [
      { label: 'Regions', href: '/regions' },
      { label: 'Coordinators', href: '/coordinators' },
      { label: 'Employees', href: '/employees' },
    ],
  },
  {
    label: 'Reporting',
    icon: BarChart3,
    items: [
      { label: 'Invoices', href: '/invoices' },
      { label: 'Payments', href: '/payments' },
      { label: 'Aging Report', href: '/aging' },
    ],
  },
  {
    label: 'Integration',
    icon: Send,
    items: [{ label: 'Sage Sync', href: '/sage-sync' }],
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

interface NavItemProps {
  item: (typeof navigation)[0];
  isActive?: boolean;
}

function NavItem({ item, isActive }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (!item.items) {
    return (
      <Link
        href={item.href!}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="space-y-1 pl-4">
          {item.items.map((subitem) => (
            <Link
              key={subitem.href}
              href={subitem.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
            >
              {subitem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen md:h-auto flex flex-col w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">HS</span>
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-white">HS02</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Billing</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item, idx) => (
            <NavItem key={idx} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
          <p>HS 02-2025/26</p>
          <p className="text-xs">City of Tshwane</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
