'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Building2, Shield, Users, FolderKanban, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const SETTING_SECTIONS = [
  {
    href: '/settings/company',
    icon: Building2,
    title: 'Company Settings',
    description: 'Working days, holidays, timezone, and company profile.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    href: '/settings/security',
    icon: Shield,
    title: 'Security',
    description: 'Password policy, two-factor authentication, and active sessions.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    href: '/settings/subscriptions',
    icon: CreditCard,
    title: 'Subscriptions',
    description: 'Manage your plan, user limits, and FMS limits.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
  },
  {
    href: '/admin',
    icon: Users,
    title: 'Admin Panel',
    description: 'Manage users, projects, roles, and employee accounts.',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
  },
];

const ALLOWED_ROLES = ['ADMIN', 'COMPANY_OWNER', 'SAAS_OWNER'];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // SEC-09 fix: only admins may access company settings
  useEffect(() => {
    if (user && !ALLOWED_ROLES.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-blue-500" />
        <h1 className="text-xl font-bold font-display text-foreground">Settings</h1>
      </div>

      <div className="space-y-3">
        {SETTING_SECTIONS.map(({ href, icon: Icon, title, description, color, bg, border }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 rounded-xl border ${border} bg-surface p-5 hover:shadow-md transition-all duration-200 group`}
          >
            <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground font-display text-base">{title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
