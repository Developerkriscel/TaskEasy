'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

const navItems = [
  { label: 'Modules', href: '#modules' },
  { label: 'Roles', href: '#roles' },
  { label: 'Start', href: '#start' },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav
      className="sticky top-0 w-full z-50 border-b border-[#DCEAF7] backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.94)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-bold text-[#5C7188] hover:text-[#0866FF] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/company/login"
            className="hidden sm:inline-flex text-sm font-bold text-[#0866FF] hover:text-[#0757C8] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/company/login"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[#0866FF] text-white text-sm font-bold hover:bg-[#0757C8] transition-colors"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5 text-[#5C7188]" /> : <Menu className="h-5 w-5 text-[#5C7188]" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#DCEAF7] bg-white">
          <div className="px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm font-bold text-[#5C7188] hover:text-[#0866FF] py-2"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-[#DCEAF7] pt-3 space-y-2">
              <Link href="/company/login" className="block text-sm font-bold text-[#0866FF] py-2" onClick={() => setMobileOpen(false)}>
                Log In
              </Link>
              <Link
                href="/company/login"
                className="block text-center px-4 py-2 rounded-lg bg-[#0866FF] text-white text-sm font-bold"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
