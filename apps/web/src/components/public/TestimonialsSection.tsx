'use client';

import { motion } from 'framer-motion';
import { Crown, Gauge, UserCheck, UsersRound } from 'lucide-react';

const roles = [
  {
    icon: Crown,
    title: 'Super Admin',
    description: 'Full control across users, projects, hierarchy, dashboard, MIS, reports, approvals and FMS.',
    items: ['All company data', 'Manage users and projects', 'Set hierarchy'],
    color: '#0866FF',
  },
  {
    icon: UsersRound,
    title: 'Admin',
    description: 'Manage assigned team work, assign tasks, approve submissions and track team performance.',
    items: ['Team dashboard', 'Approve or rework', 'Reports and MIS'],
    color: '#10B981',
  },
  {
    icon: UserCheck,
    title: 'Employee',
    description: 'See only own work, complete tasks with remarks and proof, and track submission status.',
    items: ['Own pending work', 'Checklist and FMS', 'Completion history'],
    color: '#F59E0B',
  },
];

const kpis = [
  { label: 'Total Tasks', value: '481' },
  { label: 'Completed', value: '368' },
  { label: 'On Time', value: '84%' },
  { label: 'Reworks', value: '19' },
];

export function TestimonialsSection() {
  return (
    <section id="roles" className="overflow-hidden bg-[#F6FAFF] px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0866FF]">Role Based Dashboard</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#08295C] sm:text-4xl">
            Everyone sees the right work, no extra noise.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#5C7188]">
            TaskEasy filters every dashboard, table and report by role. Super Admin sees
            everything, Admin sees assigned teams, and Employees see only their own tasks,
            checklists, requests and FMS steps.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl border border-[#DCEAF7] bg-white p-4 shadow-sm"
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${role.color}16`, color: role.color }}
                >
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-[#08295C]">{role.title}</h3>
                <p className="mt-2 min-h-[72px] text-xs leading-5 text-[#5C7188]">{role.description}</p>
                <div className="mt-4 space-y-2">
                  {role.items.map((item) => (
                    <div key={item} className="rounded-md bg-[#F6FAFF] px-2.5 py-1.5 text-xs font-semibold text-[#385470]">
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative"
        >
          <div className="rounded-2xl border border-[#DCEAF7] bg-white p-5 shadow-2xl shadow-[#0866FF]/10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10B981]">MIS Snapshot</p>
                <h3 className="mt-1 text-xl font-black text-[#08295C]">Performance and accountability</h3>
              </div>
              <div className="rounded-lg bg-[#E9FBF3] p-2 text-[#059669]">
                <Gauge className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-[#E4EDF6] bg-[#FBFDFF] p-3 text-center">
                  <p className="text-2xl font-black text-[#08295C]">{kpi.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase text-[#7C8DA1]">{kpi.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#E4EDF6] bg-[#FBFDFF] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-[#08295C]">Employee score movement</p>
                <span className="rounded-full bg-[#EFF6FF] px-2 py-1 text-xs font-black text-[#0866FF]">Last week</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'On-time completion', width: '84%', color: '#10B981' },
                  { name: 'Checklist pending control', width: '72%', color: '#0866FF' },
                  { name: 'Rework reduction', width: '61%', color: '#F59E0B' },
                ].map((bar, index) => (
                  <div key={bar.name}>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#385470]">
                      <span>{bar.name}</span>
                      <span>{bar.width}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#EAF2FA]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: bar.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: bar.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + index * 0.12 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FFF8E8] p-4">
                <p className="text-sm font-black text-[#08295C]">Score rule</p>
                <p className="mt-1 text-xs leading-5 text-[#7A5A1D]">Perfect score starts at 0. Delay, pending work and rework create negative score.</p>
              </div>
              <div className="rounded-xl bg-[#EEF9FF] p-4">
                <p className="text-sm font-black text-[#08295C]">Weekly target</p>
                <p className="mt-1 text-xs leading-5 text-[#315A72]">Admins can save weekly snapshots and set the next target score.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
