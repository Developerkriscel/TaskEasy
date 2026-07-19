'use client';

import { motion } from 'framer-motion';
import {
  BellDot,
  ClipboardCheck,
  FileSpreadsheet,
  GitPullRequestArrow,
  Layers3,
  LineChart,
  Network,
  ShieldCheck,
} from 'lucide-react';

const modules = [
  {
    icon: GitPullRequestArrow,
    title: 'Delegation Workflow',
    description: 'Assign tasks with project, priority, deadline, proof attachments and approval status.',
    accent: '#0866FF',
  },
  {
    icon: Layers3,
    title: 'Work Requests',
    description: 'Request work from the right doer, collect completion proof and approve or send rework.',
    accent: '#10B981',
  },
  {
    icon: ClipboardCheck,
    title: 'Checklist Compliance',
    description: 'Daily, weekly, monthly and one-time checklist planning with bulk completion support.',
    accent: '#F59E0B',
  },
  {
    icon: Network,
    title: 'FMS Tracking',
    description: 'Track planned date, actual date, delay days, form links and on-time status for each step.',
    accent: '#EC4899',
  },
  {
    icon: ShieldCheck,
    title: 'Approve / Review',
    description: 'One approval queue for delegation, work request and checklist submissions.',
    accent: '#14B8A6',
  },
  {
    icon: LineChart,
    title: 'MIS Performance',
    description: 'Measure completed, pending, late, rework, delay days and weekly target score.',
    accent: '#7C3AED',
  },
  {
    icon: FileSpreadsheet,
    title: 'Reports and Exports',
    description: 'Filter by user, project, status and date range with Excel and PDF-ready views.',
    accent: '#0EA5E9',
  },
  {
    icon: BellDot,
    title: 'Notification Dots',
    description: 'Sidebar signals show pending approvals, delegation, checklist and work requests.',
    accent: '#F97316',
  },
];

export function FeaturesSection() {
  return (
    <section id="modules" className="bg-white px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black uppercase tracking-[0.18em] text-[#0866FF]"
          >
            Real TaskEasy Modules
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 text-3xl font-black text-[#08295C] sm:text-4xl"
          >
            A light, fast command center for every work cycle.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base leading-7 text-[#5C7188]"
          >
            TaskEasy is not a simple to-do list. It is a complete role-based task,
            approval and performance system built around how your dashboard actually works.
          </motion.p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-xl border border-[#DDEAF6] bg-[#FBFDFF] p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#0866FF]/8"
            >
              <div
                className="absolute right-[-44px] top-[-44px] h-24 w-24 rounded-full opacity-15 transition-transform duration-500 group-hover:scale-125"
                style={{ backgroundColor: module.accent }}
              />
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${module.accent}18`, color: module.accent }}
              >
                <module.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-[#08295C]">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5C7188]">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
