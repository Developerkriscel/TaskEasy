'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, RotateCcw, Send, Trophy } from 'lucide-react';

const cycle = [
  { icon: Send, label: 'Pending' },
  { icon: CheckCircle2, label: 'Send for Approval' },
  { icon: RotateCcw, label: 'Rework if needed' },
  { icon: Trophy, label: 'Completed' },
];

export function CTASection() {
  return (
    <section id="start" className="bg-white px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#DCEAF7] bg-[#F8FCFF] p-6 shadow-xl shadow-[#0866FF]/8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0866FF]">Ready to Run TaskEasy</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#08295C] sm:text-4xl">
              Launch your work approval system from one beautiful dashboard.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5C7188]">
              Create tasks, collect proof, approve work, handle rework, monitor delays and
              update MIS snapshots without jumping between sheets, chats and manual reports.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/company/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0866FF] px-6 text-sm font-bold text-white shadow-lg shadow-[#0866FF]/25 transition hover:-translate-y-0.5 hover:bg-[#0757C8]"
              >
                Continue to Company Login
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/platform/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#BBD7FF] bg-white px-6 text-sm font-bold text-[#08295C] transition hover:-translate-y-0.5 hover:border-[#0866FF]"
              >
                Platform Admin Login
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DCEAF7] bg-white p-5">
            <p className="mb-5 text-sm font-black text-[#08295C]">Core status cycle</p>
            <div className="space-y-3">
              {cycle.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-3 rounded-xl bg-[#F6FAFF] p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0866FF] shadow-sm">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-[#08295C]">{step.label}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E3EDF7]">
                      <motion.div
                        className="h-full rounded-full bg-[#10B981]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(index + 1) * 25}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.15 + index * 0.08 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
