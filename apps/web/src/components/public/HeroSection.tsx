'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Users,
} from 'lucide-react';

const dashboardCards = [
  { label: 'Delegation', total: 128, done: 92, pending: 28, delayed: 8, color: 'bg-[#2563EB]' },
  { label: 'Work Request', total: 74, done: 51, pending: 17, delayed: 6, color: 'bg-[#10B981]' },
  { label: 'Checklist', total: 216, done: 181, pending: 25, delayed: 10, color: 'bg-[#F59E0B]' },
  { label: 'FMS', total: 63, done: 44, pending: 14, delayed: 5, color: 'bg-[#EC4899]' },
];

const signalRows = [
  { icon: CheckCircle2, label: 'Pending -> Approval -> Completed', value: 'Live workflow' },
  { icon: Users, label: 'Super Admin, Admin, Employee', value: 'Role based' },
  { icon: Bell, label: 'Approval and task red dots', value: 'Alerts on' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F7FBFF]">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <motion.div
          className="absolute left-[6%] top-24 h-40 w-40 rounded-full bg-[#BDEBFF] blur-3xl"
          animate={{ x: [0, 18, 0], y: [0, -12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[8%] top-28 h-48 w-48 rounded-full bg-[#C9F7E5] blur-3xl"
          animate={{ x: [0, -22, 0], y: [0, 18, 0], scale: [1, 0.94, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-24 left-[42%] h-36 w-36 rounded-full bg-[#FFE8B8] blur-3xl"
          animate={{ y: [0, -18, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pt-12 sm:px-6 sm:pt-20 lg:min-h-[92vh] lg:px-8">
        <div className="grid flex-1 items-center gap-8 py-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="relative z-10"
          >
            <h1 className="max-w-3xl text-[42px] font-black leading-[1.02] text-[#08295C] sm:text-5xl lg:text-6xl xl:text-7xl">
              TaskEasy
              <span className="block text-[#0866FF]">Workflow Management</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#385470] sm:mt-6 sm:text-lg">
              Run your complete work system from one bright dashboard: assign delegation tasks,
              collect work requests, track checklist compliance, complete FMS steps, approve
              submissions, and measure performance through MIS.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link
                href="/company/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0866FF] px-6 text-sm font-bold text-white shadow-lg shadow-[#0866FF]/25 transition hover:-translate-y-0.5 hover:bg-[#0757C8]"
              >
                Open Company Login
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/platform/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#BBD7FF] bg-white px-6 text-sm font-bold text-[#08295C] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0866FF]"
              >
                Platform Console
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 grid max-w-2xl gap-3 sm:mt-8 sm:grid-cols-3">
              {signalRows.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
                  className="rounded-lg border border-[#D8E8F7] bg-white/85 p-3 shadow-sm backdrop-blur"
                >
                  <item.icon className="mb-2 h-5 w-5 text-[#0866FF]" />
                  <p className="text-xs font-bold text-[#08295C]">{item.value}</p>
                  <p className="mt-1 text-xs text-[#5C7188]">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[720px] lg:max-w-none"
          >
            <motion.div
              className="rounded-xl border border-[#D7E7F5] p-3 shadow-2xl shadow-[#0866FF]/12 backdrop-blur sm:rounded-2xl sm:p-4"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.94)' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex flex-col gap-3 border-b border-[#E7F0F8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0866FF]">Team Dashboard</p>
                  <h2 className="mt-1 text-lg font-black leading-tight text-[#08295C] sm:text-xl">Today&apos;s Work Command Center</h2>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-lg bg-[#F1F7FF] px-3 py-2 text-xs font-bold text-[#0757C8]">
                  <Clock3 className="h-4 w-4" />
                  Live
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {dashboardCards.map((card, index) => (
                  <motion.div
                    key={card.label}
                    className="min-w-0 rounded-xl border border-[#E4EDF6] bg-[#FBFDFF] p-3 sm:p-4"
                    animate={{ y: [0, index % 2 ? 5 : -5, 0] }}
                    transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-black text-[#08295C]">{card.label}</p>
                      <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-1 text-center sm:gap-2">
                      <Metric label="Total" value={card.total} />
                      <Metric label="Done" value={card.done} />
                      <Metric label="Pending" value={card.pending} />
                      <Metric label="Delayed" value={card.delayed} warn />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_0.8fr]">
                <div className="min-w-0 rounded-xl border border-[#E4EDF6] bg-white p-3 sm:p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-black text-[#08295C]">Task Trend</p>
                    <BarChart3 className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div className="flex h-28 items-end gap-2">
                    {[42, 68, 54, 86, 64, 92, 78, 104].map((height, index) => (
                      <motion.div
                        key={height}
                        className="flex-1 rounded-t-md bg-[#0866FF]"
                        initial={{ height: 8 }}
                        animate={{ height }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.08 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl border border-[#E4EDF6] bg-[#FFFDF7] p-3 sm:p-4">
                  <p className="text-sm font-black text-[#08295C]">Approve / Review</p>
                  <div className="mt-4 space-y-3">
                    {['New submissions', 'Rework submissions', 'Critical team tasks'].map((label, index) => (
                      <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
                        <span className="min-w-0 truncate text-xs font-semibold text-[#385470]">{label}</span>
                        <span className="shrink-0 rounded-full bg-[#FFE9C2] px-2 py-0.5 text-xs font-black text-[#9A5A00]">
                          {index === 0 ? 18 : index === 1 ? 7 : 11}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2">
              <motion.div
                className="rounded-xl border border-[#D8E8F7] bg-white p-4 shadow-xl shadow-[#10B981]/10 sm:rounded-2xl"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#E9FBF3] p-2 text-[#059669]">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#08295C]">Hierarchy Visibility</p>
                    <p className="mt-1 text-xs leading-5 text-[#5C7188]">Super Admin sees all. Admin sees team. Employee sees own work.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rounded-xl border border-[#D8E8F7] bg-white p-4 shadow-xl shadow-[#F59E0B]/10 sm:rounded-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#FFF4DB] p-2 text-[#D97706]">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#08295C]">MIS Score</p>
                    <p className="mt-1 text-xs leading-5 text-[#5C7188]">Delay, rework, pending work and on-time status in one score.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, warn = false }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`text-base font-black sm:text-lg ${warn ? 'text-[#D97706]' : 'text-[#08295C]'}`}>{value}</p>
      <p className="mt-0.5 truncate text-[9px] font-semibold uppercase text-[#7C8DA1] sm:text-[10px]">{label}</p>
    </div>
  );
}
