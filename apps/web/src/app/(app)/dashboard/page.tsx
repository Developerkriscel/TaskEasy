'use client';

import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList, Briefcase, CheckSquare, GitBranch,
  Check, Clock, AlertTriangle, X,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '@/lib/api';
import { useActiveProjects } from '@/hooks/useProjects';
import { useActiveUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/auth.store';
import { FilterBar, FilterValues } from '@/components/ui/FilterBar';
import { cn, formatDate, isOverdue } from '@/lib/utils';
import type {
  DashboardData, ModuleMetrics, ProjectWiseStatus,
  FmsWiseStatus, PersonalPriorityTask,
} from '@/types';

type DrilldownKey = { module: 'delegation' | 'workRequest' | 'checklist' | 'fms'; status: 'total' | 'done' | 'pending' | 'delayed'; label: string };

// ─── Module card config ───────────────────────────────────────────────────────

const MODULE_CONFIG = [
  {
    key: 'delegation' as const,
    teamLabel: 'Team Delegation',
    myLabel: 'My Delegation',
    Icon: ClipboardList,
    cardGradient: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
    cardShadow: '0 12px 28px -10px rgba(37,99,235,0.42)',
  },
  {
    key: 'workRequest' as const,
    teamLabel: 'Team Work Request',
    myLabel: 'My Work Request',
    Icon: Briefcase,
    cardGradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
    cardShadow: '0 12px 28px -10px rgba(124,58,237,0.34)',
  },
  {
    key: 'checklist' as const,
    teamLabel: 'Team Checklist',
    myLabel: 'My Checklist',
    Icon: CheckSquare,
    cardGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    cardShadow: '0 12px 28px -10px rgba(16,185,129,0.34)',
  },
  {
    key: 'fms' as const,
    teamLabel: 'Team FMS',
    myLabel: 'My FMS',
    Icon: GitBranch,
    cardGradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    cardShadow: '0 12px 28px -10px rgba(245,158,11,0.34)',
  },
];

const MODULE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  DELEGATION:   { label: 'DELEGATION',   bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300' },
  WORK_REQUEST: { label: 'WORK REQUEST', bg: 'bg-violet-100 dark:bg-violet-900/30',  text: 'text-violet-700 dark:text-violet-300' },
  CHECKLIST:    { label: 'CHECKLIST',    bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  FMS:          { label: 'FMS',          bg: 'bg-orange-100 dark:bg-orange-900/30',   text: 'text-orange-700 dark:text-orange-300' },
};

const CRITICAL_TABS = [
  { key: 'delegation', label: 'Delegation' },
  { key: 'workReq',   label: 'Work Req' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'fms',       label: 'FMS' },
] as const;

type CriticalTab = typeof CRITICAL_TABS[number]['key'];

// ─── Module stat card ─────────────────────────────────────────────────────────

function ModuleCard({
  moduleKey, label, metrics, Icon, cardGradient, cardShadow, loading, onStatClick,
}: {
  moduleKey: 'delegation' | 'workRequest' | 'checklist' | 'fms';
  label: string;
  metrics: ModuleMetrics;
  Icon: React.ElementType;
  cardGradient: string;
  cardShadow: string;
  loading: boolean;
  onStatClick: (key: DrilldownKey) => void;
}) {
  if (loading) {
    return <div className="h-44 rounded-2xl animate-pulse bg-surface-muted" />;
  }

  const stats: { status: 'total' | 'done' | 'pending' | 'delayed'; value: number; color: string; bgColor: string; label: string }[] = [
    { status: 'total',   value: metrics.total,   color: 'text-blue-400',   bgColor: 'bg-blue-500/10',   label: 'Total' },
    { status: 'done',    value: metrics.done,    color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Done' },
    { status: 'pending', value: metrics.pending, color: 'text-amber-400',  bgColor: 'bg-amber-500/10',  label: 'Pending' },
    { status: 'delayed', value: metrics.delayed, color: 'text-rose-400',   bgColor: 'bg-rose-500/10',   label: 'Delayed' },
  ];

  return (
    <div className="rounded-2xl p-5 bg-surface border border-border shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ background: cardGradient }} />

      <div className="flex items-start justify-between mb-4 mt-1">
        <p className="text-sm font-semibold text-foreground leading-tight max-w-[65%] font-display">{label}</p>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: cardGradient, boxShadow: cardShadow }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 pt-3 border-t border-border/50">
        {stats.map(({ status, value, color, bgColor, label: statLabel }) => (
          <button
            key={status}
            onClick={() => onStatClick({ module: moduleKey, status, label: `${label} — ${statLabel}` })}
            className="flex flex-col items-center transition-all hover:scale-105 cursor-pointer"
          >
            <div className={cn(
              'flex items-center justify-center rounded-full h-10 w-10',
              bgColor,
            )}>
              <p className={cn('text-base font-bold font-display', color)}>{value}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{statLabel}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Project Wise Status ──────────────────────────────────────────────────────

function ProjectWiseStatusTable({ rows, loading }: {
  rows: ProjectWiseStatus[];
  loading: boolean;
}) {
  return (
    <div className="section-card overflow-hidden h-full p-0">
      <div className="border-b border-border bg-gradient-to-r from-blue-500/5 to-indigo-500/5 px-4 py-3">
        <p className="text-sm font-semibold text-foreground font-display">Project Wise Status</p>
      </div>
      {loading ? (
        <div className="h-32 animate-pulse bg-surface-muted/70" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-muted/70 text-muted-foreground uppercase tracking-wide">
                <th className="text-left px-4 py-2 font-semibold">Project</th>
                <th colSpan={2} className="text-center px-2 py-2 font-semibold border-l border-border">
                  Delegation
                </th>
                <th colSpan={2} className="text-center px-2 py-2 font-semibold border-l border-border">
                  Work Request
                </th>
                <th colSpan={2} className="text-center px-2 py-2 font-semibold border-l border-border">
                  Checklist
                </th>
                <th className="text-center px-4 py-2 font-semibold border-l border-border">
                  Completion
                </th>
              </tr>
              <tr className="bg-surface-muted/70 text-muted-foreground text-[11px]">
                <th className="px-4 pb-2" />
                <th className="px-2 pb-2 font-medium border-l border-border">Pending</th>
                <th className="px-2 pb-2 font-medium">Done</th>
                <th className="px-2 pb-2 font-medium border-l border-border">Pending</th>
                <th className="px-2 pb-2 font-medium">Done</th>
                <th className="px-2 pb-2 font-medium border-l border-border">Pending</th>
                <th className="px-2 pb-2 font-medium">Done</th>
                <th className="px-4 pb-2 border-l border-border" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    No project data available
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.projectId} className="hover:bg-surface-muted/70">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-foreground">{row.projectName}</p>
                      <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, row.completion)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Completion: {row.completion.toFixed(1)}%
                      </p>
                    </td>
                    <td className="px-2 py-2.5 text-center text-amber-600 font-semibold border-l border-border">
                      {row.delegation.pending}
                    </td>
                    <td className="px-2 py-2.5 text-center text-green-600 font-semibold">
                      {row.delegation.done}
                    </td>
                    <td className="px-2 py-2.5 text-center text-amber-600 font-semibold border-l border-border">
                      {row.workRequest.pending}
                    </td>
                    <td className="px-2 py-2.5 text-center text-green-600 font-semibold">
                      {row.workRequest.done}
                    </td>
                    <td className="px-2 py-2.5 text-center text-amber-600 font-semibold border-l border-border">
                      {row.checklist?.pending ?? 0}
                    </td>
                    <td className="px-2 py-2.5 text-center text-green-600 font-semibold">
                      {row.checklist?.done ?? 0}
                    </td>
                    <td className="px-4 py-2.5 text-center border-l border-border">
                      <span className="text-indigo-600 font-semibold">{row.completion.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── FMS Wise Task Status ─────────────────────────────────────────────────────

function FmsWiseStatusTable({ rows, loading }: {
  rows: FmsWiseStatus[];
  loading: boolean;
}) {
  const grandTotal = useMemo(() => ({
    pending: rows.reduce((s, r) => s + r.pending, 0),
    done:    rows.reduce((s, r) => s + r.done, 0),
    total:   rows.reduce((s, r) => s + r.total, 0),
  }), [rows]);

  return (
    <div className="section-card overflow-hidden h-full p-0">
      <div className="border-b border-border bg-gradient-to-r from-amber-500/5 to-orange-500/5 px-4 py-3">
        <p className="text-sm font-semibold text-foreground font-display">FMS Wise Task Status</p>
      </div>
      {loading ? (
        <div className="h-32 animate-pulse bg-surface-muted/70" />
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-muted/70 text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-4 py-2 font-semibold">FMS Name</th>
              <th className="text-center px-3 py-2 font-semibold">Pending</th>
              <th className="text-center px-3 py-2 font-semibold">Done</th>
              <th className="text-center px-3 py-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No FMS data available
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.fmsId} className="hover:bg-surface-muted/70">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.fmsName}</td>
                  <td className="px-3 py-2.5 text-center text-amber-600 font-semibold">{row.pending}</td>
                  <td className="px-3 py-2.5 text-center text-green-600 font-semibold">{row.done}</td>
                  <td className="px-3 py-2.5 text-center text-foreground font-semibold">{row.total}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-muted font-bold text-foreground">
                <td className="px-4 py-2.5 text-xs uppercase tracking-wide">Grand Total</td>
                <td className="px-3 py-2.5 text-center text-amber-600">{grandTotal.pending}</td>
                <td className="px-3 py-2.5 text-center text-green-600">{grandTotal.done}</td>
                <td className="px-3 py-2.5 text-center">{grandTotal.total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
}

// ─── Tasks Trend chart ────────────────────────────────────────────────────────

function TasksTrendChart({ data, loading }: { data: DashboardData['trend']; loading: boolean }) {
  const chartData = useMemo(() =>
    data.map((p) => ({
      label: p.label,
      'Tasks Created': p.completed + p.pending + p.delayed,
      'Tasks Completed': p.completed,
    })),
  [data]);

  return (
    <div className="section-card h-full p-4">
      <p className="mb-4 text-sm font-semibold text-foreground font-display">Tasks Trend</p>
      {loading ? (
        <div className="h-44 animate-pulse rounded-lg bg-surface-muted/70" />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--surface))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '10px',
                fontSize: '11px',
                color: 'rgb(var(--foreground))',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="Tasks Created"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Tasks Completed"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Personal Priority ────────────────────────────────────────────────────────

function PersonalPriorityList({
  tasks, loading,
}: {
  tasks: PersonalPriorityTask[];
  loading: boolean;
}) {
  return (
    <div className="section-card overflow-hidden h-full p-0">
      <div className="flex items-center gap-2 border-b border-border bg-gradient-to-r from-amber-500/5 to-yellow-500/5 px-4 py-3">
        <span className="text-amber-500">⭐</span>
        <p className="text-sm font-semibold text-foreground font-display">Your Personal Priority</p>
      </div>
      <div className="max-h-64 divide-y divide-border overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 mx-4 my-2 rounded-lg animate-pulse bg-surface-muted" />
          ))
        ) : tasks.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No priority tasks
          </div>
        ) : (
          tasks.map((task) => {
            const badge = MODULE_BADGE[task.type] ?? MODULE_BADGE.DELEGATION;
            return (
              <div key={task.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-muted/70">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', badge.bg, badge.text)}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</p>
                    {task.fromSystem && (
                      <span className="text-[10px] text-muted-foreground italic">From: System</span>
                    )}
                  </div>
                </div>
                {task.isCompleted ? (
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Critical Team Tasks ──────────────────────────────────────────────────────

function CriticalTeamTasks({ data, loading }: { data: DashboardData | undefined; loading: boolean }) {
  const [tab, setTab] = useState<CriticalTab>('delegation');

  const allTasks = useMemo(() => {
    if (!data) return [];
    // Backend returns one combined `criticalTasks` array; each item carries
    // `module` ('DELEGATION'|'WORK_REQUEST'|'CHECKLIST'|'FMS'), `dueDate`,
    // and `assignedUser` { id, name }.
    return (data.criticalTasks ?? []).map((t: any) => ({
      id: t.id,
      title: t.title ?? t.stepName ?? '—',
      type: (t.module ?? 'DELEGATION') as 'DELEGATION' | 'WORK_REQUEST' | 'CHECKLIST' | 'FMS',
      user: t.assignedUser ?? null,
      targetDate: t.dueDate ?? t.targetDate ?? t.deadlineDate ?? t.plannedDate,
      status: t.status,
      priority: t.priority,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    const MAP: Record<CriticalTab, string> = {
      delegation: 'DELEGATION',
      workReq:    'WORK_REQUEST',
      checklist:  'CHECKLIST',
      fms:        'FMS',
    };
    return allTasks.filter((t) => t.type === MAP[tab]);
  }, [allTasks, tab]);

  // Group tasks by user name
  const grouped = useMemo(() => {
    const map = new Map<string, { userName: string; tasks: typeof filtered }>();
    filtered.forEach((task) => {
      const key = task.user?.id ?? 'unknown';
      const name = task.user?.name ?? 'Unknown';
      if (!map.has(key)) map.set(key, { userName: name, tasks: [] });
      map.get(key)!.tasks.push(task);
    });
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="section-card overflow-hidden p-0">
      <div className="border-b border-border bg-gradient-to-r from-red-500/5 to-rose-500/5 px-4 pt-3 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-semibold text-foreground font-display">Critical Team Tasks</p>
        </div>
        {/* Tab pills */}
        <div className="flex gap-1 flex-wrap">
          {CRITICAL_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'px-3 py-1.5 rounded-t-lg text-xs font-semibold transition-colors border-b-2',
                tab === key
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 mx-4 my-3 rounded-lg animate-pulse bg-surface-muted" />
          ))
        ) : grouped.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No critical tasks</p>
          </div>
        ) : (
          grouped.map(({ userName, tasks }) => (
            <div key={userName} className="px-4 py-3">
              {/* User header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {userName[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{userName}</p>
                  <p className="text-[10px] text-red-500 font-medium">In critical hours</p>
                </div>
              </div>
              {/* Task rows */}
              <div className="ml-9 space-y-1.5">
                {tasks.map((task) => {
                  const badge = MODULE_BADGE[task.type] ?? MODULE_BADGE.DELEGATION;
                  const overdue = isOverdue(task.targetDate);
                  return (
                    <div key={task.id} className="flex items-center gap-2">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0', badge.bg, badge.text)}>
                        {badge.label}
                      </span>
                      <p className="text-xs text-foreground font-medium truncate flex-1">{task.title}</p>
                      <span className={cn('text-[10px] flex-shrink-0', overdue ? 'text-red-500' : 'text-muted-foreground')}>
                        {task.targetDate ? formatDate(task.targetDate) : 'No due date'}
                      </span>
                      {overdue && (
                        <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Drilldown Modal ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  COMPLETED:          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING:            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS:        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  REWORK:             'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SEND_FOR_APPROVAL:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  LATE:               'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function DrilldownModal({
  drilldown, view, onClose,
}: {
  drilldown: DrilldownKey | null;
  view: 'team' | 'my';
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['dashboard-drilldown', drilldown?.module, drilldown?.status, view],
    queryFn: () => dashboardApi.drilldown(drilldown!.module, drilldown!.status, view),
    enabled: !!drilldown,
    staleTime: 60_000,
  });

  if (!drilldown || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(2,6,23,0.5)] backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full max-w-4xl max-h-[85vh] rounded-2xl bg-surface shadow-[0_32px_80px_-20px_rgba(15,23,42,0.35)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-muted/70">
          <div>
            <h2 className="text-base font-semibold text-foreground">{drilldown.label}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{rows.length} record{rows.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <CheckSquare className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No records found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-muted border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-3 py-3 font-semibold">Assigned To</th>
                  {drilldown.module !== 'checklist' && drilldown.module !== 'fms' && (
                    <th className="text-left px-3 py-3 font-semibold">Assigned By</th>
                  )}
                  <th className="text-left px-3 py-3 font-semibold">
                    {drilldown.module === 'fms' ? 'Workflow' : 'Project'}
                  </th>
                  <th className="text-left px-3 py-3 font-semibold">Due Date</th>
                  <th className="text-left px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const overdue = row.dueDate ? isOverdue(row.dueDate) : false;
                  return (
                    <tr key={row.id} className="hover:bg-surface-muted/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[200px]">
                        <p className="truncate" title={row.title}>{row.title}</p>
                        {row.priority && (
                          <span className="text-[10px] text-muted-foreground font-normal">{row.priority}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{row.assignedTo}</td>
                      {drilldown.module !== 'checklist' && drilldown.module !== 'fms' && (
                        <td className="px-3 py-3 text-muted-foreground">{row.assignedBy ?? '—'}</td>
                      )}
                      <td className="px-3 py-3 text-muted-foreground max-w-[120px] truncate">{row.project}</td>
                      <td className={cn('px-3 py-3 text-xs font-medium', overdue ? 'text-red-500' : 'text-muted-foreground')}>
                        {row.dueDate ? formatDate(row.dueDate) : '—'}
                        {overdue && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">Late</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_COLORS[row.status] ?? 'bg-surface-muted text-muted-foreground')}>
                          {row.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function isTodayMatch(dateStr?: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function useGreeting(name?: string) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const h = now.getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dayStr = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  return { greeting, timeStr, dayStr };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const canSeeTeam = ['ADMIN', 'MANAGER', 'COMPANY_OWNER', 'SAAS_OWNER'].includes(user?.role ?? '');
  const [view, setView] = useState<'team' | 'my'>(canSeeTeam ? 'team' : 'my');
  const [filters, setFilters] = useState<FilterValues>({ period: 'ALL' });
  const [drilldown, setDrilldown] = useState<DrilldownKey | null>(null);
  const firstName = user?.name ?? 'there';
  const { greeting, timeStr, dayStr } = useGreeting(firstName);

  const { data: users = [] }    = useActiveUsers();
  const { data: projects = [] } = useActiveProjects();

  const currentUserBirthday = useMemo(() => {
    const me = users.find((u: any) => u.id === (user?.sub ?? user?.id));
    return me ? isTodayMatch(me.dateOfBirth) : false;
  }, [users, user]);

  const currentUserAnniversary = useMemo(() => {
    const me = users.find((u: any) => u.id === (user?.sub ?? user?.id));
    return me ? isTodayMatch(me.anniversaryDate) : false;
  }, [users, user]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', view, filters],
    queryFn: () => dashboardApi.get(view, {
      period:    filters.period,
      dateFrom:  filters.dateFrom,
      dateTo:    filters.dateTo,
      userId:    filters.userId,
      projectId: filters.projectId,
      status:    filters.status,
    }),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const projectRows: ProjectWiseStatus[]    = data?.projectWiseStatus ?? [];
  const fmsRows:     FmsWiseStatus[]        = data?.fmsWiseStatus     ?? [];
  const personalTasks: PersonalPriorityTask[] = data?.personalPriority ?? [];
  const trendData = data?.trend ?? [];

  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SEND_FOR_APPROVAL', 'REWORK', 'LATE'];

  return (
    <div className="space-y-5">
      {/* Greeting header with gradient */}
      <div className="relative flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/8 dark:to-pink-500/5" />
        <div className="relative flex-1 min-w-0">
          <p className="text-lg font-bold text-foreground truncate font-display">
            {greeting}, <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{firstName}</span>
            {currentUserBirthday && <span className="ml-1.5">🎂 Happy Birthday!</span>}
            {currentUserAnniversary && <span className="ml-1.5">🎉 Happy Anniversary!</span>}
            {!currentUserBirthday && !currentUserAnniversary && <span className="ml-0.5">👋</span>}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{dayStr} &nbsp;·&nbsp; {timeStr}</p>
        </div>

        {/* View toggle */}
        {canSeeTeam && (
          <div className="relative flex rounded-xl border border-border bg-surface-muted overflow-hidden">
            {(['team', 'my'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold transition-all',
                  view === v
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_6px_16px_-8px_rgba(37,99,235,0.45)]'
                    : 'text-muted-foreground hover:bg-surface-strong hover:text-foreground',
                  v === 'my' && 'border-l border-border',
                )}
                style={view === v ? { color: 'white' } : undefined}
              >
                {v === 'team' ? 'Team Work' : 'My Work'}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Filter bar */}
      <FilterBar
        onFilter={setFilters}
        users={users}
        projects={projects}
        showStatusFilter
        statusOptions={statusOptions}
        showSearchFilter={false}
      />

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-border bg-surface py-10 text-center shadow-sm">
          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-primary hover:underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* 4 Module stat cards */}
      {!isError && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {MODULE_CONFIG.map(({ key, teamLabel, myLabel, Icon, cardGradient, cardShadow }) => (
            <ModuleCard
              key={key}
              moduleKey={key}
              label={view === 'my' ? myLabel : teamLabel}
              metrics={data?.[key] ?? { total: 0, done: 0, pending: 0, delayed: 0 }}
              Icon={Icon}
              cardGradient={cardGradient}
              cardShadow={cardShadow}
              loading={isLoading}
              onStatClick={setDrilldown}
            />
          ))}
        </div>
      )}

      {/* Project Wise Status + FMS Wise Task Status */}
      {!isError && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
          <ProjectWiseStatusTable rows={projectRows} loading={isLoading} />
          <FmsWiseStatusTable rows={fmsRows} loading={isLoading} />
        </div>
      )}

      {/* Tasks Trend + Personal Priority */}
      {!isError && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
          <TasksTrendChart data={trendData} loading={isLoading} />
          <PersonalPriorityList tasks={personalTasks} loading={isLoading} />
        </div>
      )}

      {/* Critical Team Tasks */}
      {!isError && (
        <CriticalTeamTasks data={data} loading={isLoading} />
      )}

      {data?.lastUpdated && (
        <p className="text-center text-xs text-muted-foreground">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      )}

      <DrilldownModal drilldown={drilldown} view={view} onClose={() => setDrilldown(null)} />
    </div>
  );
}
