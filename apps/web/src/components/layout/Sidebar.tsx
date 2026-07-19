'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Logo, LogoIcon } from '@/components/layout/Logo';
import { useNotificationCounts } from '@/hooks/useDashboard';

// ─── Colorful icon wrappers ──────────────────────────────────────────────────

function SidebarIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={cn('inline-flex items-center justify-center h-5 w-5 rounded-md text-[11px]', color)}>
      {children}
    </span>
  );
}

const NavIcons = {
  dashboard:   () => <SidebarIcon color="bg-blue-500/15 text-blue-600">📊</SidebarIcon>,
  delegation:  () => <SidebarIcon color="bg-violet-500/15 text-violet-600">📋</SidebarIcon>,
  kanban:      () => <SidebarIcon color="bg-cyan-500/15 text-cyan-600">📌</SidebarIcon>,
  workRequest: () => <SidebarIcon color="bg-amber-500/15 text-amber-600">💼</SidebarIcon>,
  checklist:   () => <SidebarIcon color="bg-green-500/15 text-green-600">✅</SidebarIcon>,
  fms:         () => <SidebarIcon color="bg-pink-500/15 text-pink-600">🔀</SidebarIcon>,
  approval:    () => <SidebarIcon color="bg-emerald-500/15 text-emerald-600">👍</SidebarIcon>,
  mis:         () => <SidebarIcon color="bg-indigo-500/15 text-indigo-600">📈</SidebarIcon>,
  predictive:  () => <SidebarIcon color="bg-purple-500/15 text-purple-600">🤖</SidebarIcon>,
  reports:     () => <SidebarIcon color="bg-orange-500/15 text-orange-600">📄</SidebarIcon>,
  notification:() => <SidebarIcon color="bg-red-500/15 text-red-600">🔔</SidebarIcon>,
  calendar:    () => <SidebarIcon color="bg-teal-500/15 text-teal-600">📅</SidebarIcon>,
  projects:    () => <SidebarIcon color="bg-sky-500/15 text-sky-600">📁</SidebarIcon>,
  users:       () => <SidebarIcon color="bg-fuchsia-500/15 text-fuchsia-600">👥</SidebarIcon>,
  automation:  () => <SidebarIcon color="bg-yellow-500/15 text-yellow-600">⚡</SidebarIcon>,
  importExport:() => <SidebarIcon color="bg-lime-500/15 text-lime-600">📥</SidebarIcon>,
  audit:       () => <SidebarIcon color="bg-slate-500/15 text-slate-600">🛡️</SidebarIcon>,
  hierarchy:   () => <SidebarIcon color="bg-rose-500/15 text-rose-600">🏢</SidebarIcon>,
  settings:    () => <SidebarIcon color="bg-gray-500/15 text-gray-600">⚙️</SidebarIcon>,
  security:    () => <SidebarIcon color="bg-blue-500/15 text-blue-600">🔐</SidebarIcon>,
};

// ─── Nav data ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.FC;
  roles?: string[];
  countKey?: keyof import('@/types').NotificationCounts;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: NavIcons.dashboard },
      { label: 'Delegation', href: '/delegation', icon: NavIcons.delegation, countKey: 'delegation' },
      { label: 'Work Requests', href: '/work-requests', icon: NavIcons.workRequest, countKey: 'workRequest' },
      { label: 'Checklists', href: '/checklist', icon: NavIcons.checklist, countKey: 'checklist' },
      { label: 'FMS System', href: '/fms', icon: NavIcons.fms, countKey: 'fms' },
      { label: 'Kanban', href: '/kanban', icon: NavIcons.kanban },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Approve / Review', href: '/approvals', icon: NavIcons.approval, roles: ['ADMIN', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE', 'VIEWER'], countKey: 'approval' },
      { label: 'MIS', href: '/mis', icon: NavIcons.mis, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Predictive AI', href: '/predictive', icon: NavIcons.predictive, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Reports', href: '/reports', icon: NavIcons.reports, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Notifications', href: '/notifications', icon: NavIcons.notification },
      { label: 'Calendar', href: '/calendar', icon: NavIcons.calendar },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Projects', href: '/projects', icon: NavIcons.projects, roles: ['ADMIN', 'MANAGER'] },
      { label: 'Users', href: '/users', icon: NavIcons.users, roles: ['ADMIN'] },
      { label: 'Automation', href: '/automation', icon: NavIcons.automation, roles: ['ADMIN'] },
      { label: 'Import / Export', href: '/import-export', icon: NavIcons.importExport, roles: ['ADMIN'] },
      { label: 'Audit Logs', href: '/audit-logs', icon: NavIcons.audit, roles: ['ADMIN', 'AUDITOR'] },
      { label: 'Set Hierarchy', href: '/hierarchy', icon: NavIcons.hierarchy, roles: ['ADMIN'] },
      { label: 'Settings', href: '/settings', icon: NavIcons.settings, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Security', href: '/account/security', icon: NavIcons.security },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const roleMatches = (userRole: string | undefined, allowedRoles?: string[]) => {
  if (!allowedRoles) return true;
  const role = String(userRole ?? '').toUpperCase();
  if (['SAAS_OWNER', 'COMPANY_OWNER'].includes(role)) return true;
  return allowedRoles.includes(role);
};

const approvalLabelForRole = (userRole?: string) => {
  const role = String(userRole ?? '').toUpperCase();
  return ['ADMIN', 'MANAGER', 'COMPANY_OWNER', 'SAAS_OWNER'].includes(role)
    ? 'Approve / Review'
    : 'Track Status';
};

// ─── Component ───────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed = false, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: counts } = useNotificationCounts();

  const visibleGroups = NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => roleMatches(user?.role, item.roles))
        .map((item) => (
          item.href === '/approvals'
            ? { ...item, label: approvalLabelForRole(user?.role) }
            : item
        )),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 animate-fade-in lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col',
          'border-r border-border bg-surface',
          'transition-all duration-200 lg:static lg:z-auto',
          collapsed ? 'w-[68px] lg:w-[68px]' : 'w-[252px] lg:w-[252px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
          {collapsed ? (
            <LogoIcon className="h-8 w-8 flex-shrink-0 text-primary" />
          ) : (
            <Logo size="sm" />
          )}
          <button
            onClick={onMobileClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-px">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const count = item.countKey ? (counts?.[item.countKey] ?? 0) : 0;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onMobileClose?.()}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors duration-100',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Icon />
                        {count > 0 && (
                          <span className={cn(
                            'absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] font-semibold',
                            isActive
                              ? 'bg-primary text-contrast'
                              : 'bg-danger text-contrast',
                          )}>
                            {count > 9 ? '9+' : count}
                          </span>
                        )}
                      </div>
                      {!collapsed && (
                        <span className="flex-1 truncate">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
}
