'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  MapPin,
  Users,
  Briefcase,
  BarChart3,
  Send,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
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
  isCollapsed: boolean;
  isActive?: boolean;
}

function NavItem({ item, isCollapsed, isActive }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (!item.items) {
    return (
      <Link
        href={item.href!}
        className={`flex items-center rounded-lg transition relative group ${
          isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5 gap-3 justify-start'
        } ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
        {isCollapsed && (
          <div className="absolute left-full ml-2 hidden group-hover:block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-1 rounded text-xs whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center rounded-lg transition relative group cursor-pointer ${
          isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5 gap-3 justify-between'
        } text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
      >
        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
        </div>
        {!isCollapsed && (
          <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
        )}
        {isCollapsed && (
          <div className="absolute left-full ml-2 hidden group-hover:block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-1 rounded text-xs whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </button>
      {isOpen && !isCollapsed && (
        <div className="space-y-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          {item.items.map((subitem) => (
            <Link
              key={subitem.href}
              href={subitem.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed md:static top-0 left-0 h-screen flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand / Toggle */}
      <div className="px-4 py-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">HS</span>
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-white text-sm">HS02</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Billing</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex items-center justify-center">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">HS</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronsLeft className={`w-5 h-5 transition ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item, idx) => (
          <NavItem key={idx} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          {isCollapsed ? 'HS' : 'HS 02-2025/26'}
        </p>
        {!isCollapsed && (
          <>
            <br />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">City of Tshwane</p>
          </>
        )}
      </div>
    </aside>
  );
}
