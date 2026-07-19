'use client';

import { Logo } from '@/components/layout/Logo';

const footerLinks = {
  Product: [
    { label: 'Modules', href: '#modules' },
    { label: 'Roles', href: '#roles' },
    { label: 'Start', href: '#start' },
  ],
  Workflows: [
    { label: 'Delegation', href: '#modules' },
    { label: 'Work Requests', href: '#modules' },
    { label: 'MIS and Reports', href: '#roles' },
  ],
  Access: [
    { label: 'Company Login', href: '/company/login' },
    { label: 'Platform Login', href: '/platform/login' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-[#DCEAF7] bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Logo size="sm" />
            <p className="mt-2 text-sm leading-6 text-[#5C7188]">
              Role-based task, approval, checklist, FMS and MIS workflow management.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-black text-[#08295C] mb-3 text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-[#5C7188] hover:text-[#0866FF] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#DCEAF7]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#7C8DA1]">
            &copy; {new Date().getFullYear()} TaskEasy Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-sm text-[#7C8DA1] hover:text-[#0866FF] transition-colors">Terms</a>
            <a href="/privacy" className="text-sm text-[#7C8DA1] hover:text-[#0866FF] transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
