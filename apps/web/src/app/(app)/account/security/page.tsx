'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Loader2,
  MonitorSmartphone,
  QrCode,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { apiGet, getApiError } from '@/lib/axios';
import { cn, formatDate } from '@/lib/utils';

type AccountProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
};

type SessionItem = {
  id: string;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  isCurrent?: boolean;
};

export default function AccountSecurityPage() {
  const qc = useQueryClient();
  const [totpCode, setTotpCode] = useState('');
  const [disableTotpCode, setDisableTotpCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['auth', 'me', 'account-security'],
    queryFn: () => authApi.me() as Promise<AccountProfile>,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['auth', 'sessions', 'account-security'],
    queryFn: () => apiGet<SessionItem[]>('/auth/sessions'),
  });

  const setup2fa = useMutation({
    mutationFn: () => authApi.setup2fa(),
    onSuccess: () => {
      setShowSetup(true);
      setTotpCode('');
    },
    onError: (error) => toast.error(getApiError(error) || 'Could not start 2FA setup'),
  });

  const verify2fa = useMutation({
    mutationFn: () => authApi.verify2fa(totpCode),
    onSuccess: () => {
      toast.success('2FA enabled for your account');
      setShowSetup(false);
      setTotpCode('');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => toast.error(getApiError(error) || 'Invalid 2FA code'),
  });

  const disable2fa = useMutation({
    mutationFn: () => authApi.disable2fa(disableTotpCode),
    onSuccess: () => {
      toast.success('2FA disabled for your account');
      setShowDisable(false);
      setDisableTotpCode('');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => toast.error(getApiError(error) || 'Invalid 2FA code'),
  });

  const qrDataUrl = setup2fa.data?.qrDataUrl ?? setup2fa.data?.qrCode;
  const twoFactorEnabled = Boolean(profile?.twoFactorEnabled);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold font-display text-foreground">My Security</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your own login security without changing company admin settings.
          </p>
        </div>
        <StatusPill enabled={twoFactorEnabled} loading={profileLoading} />
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Two-factor authentication</h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  Protect your account with a 6-digit code from an authenticator app.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Google Authenticator', 'Microsoft Authenticator', 'Authy'].map((app) => (
                    <span key={app} className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {twoFactorEnabled ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldOff className="h-4 w-4" />}
                onClick={() => {
                  setShowDisable(true);
                  setShowSetup(false);
                }}
              >
                Disable
              </Button>
            ) : (
              <Button
                size="sm"
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                onClick={() => setup2fa.mutate()}
                loading={setup2fa.isPending}
              >
                Enable 2FA
              </Button>
            )}
          </div>

          {!twoFactorEnabled && showSetup && (
            <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="grid gap-4 sm:grid-cols-[144px_1fr] sm:items-center">
                <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-border bg-white shadow-sm">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="2FA QR code" className="h-32 w-32" />
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Scan QR and verify</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    After scanning, enter the current 6-digit code from your app.
                  </p>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="max-w-44 text-center tracking-[0.35em]"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => verify2fa.mutate()}
                      loading={verify2fa.isPending}
                      disabled={totpCode.length !== 6}
                    >
                      Verify and Enable
                    </Button>
                    <Button variant="outline" onClick={() => setShowSetup(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {twoFactorEnabled && showDisable && (
            <div className="mt-5 rounded-lg border border-danger/20 bg-danger/5 p-4">
              <p className="text-sm font-medium text-foreground">Confirm disable 2FA</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your authenticator code. This only disables 2FA for your account.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={disableTotpCode}
                  onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="max-w-44 text-center tracking-[0.35em]"
                />
                <Button
                  variant="danger"
                  onClick={() => disable2fa.mutate()}
                  loading={disable2fa.isPending}
                  disabled={disableTotpCode.length !== 6}
                >
                  Disable 2FA
                </Button>
                <Button variant="outline" onClick={() => setShowDisable(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground">Account summary</h2>
              <div className="mt-3 space-y-2 text-sm">
                <SummaryRow label="Name" value={profile?.name} loading={profileLoading} />
                <SummaryRow label="Email" value={profile?.email} loading={profileLoading} />
                <SummaryRow label="Role" value={profile?.role} loading={profileLoading} />
                <SummaryRow
                  label="Last login"
                  value={profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : 'Not available'}
                  loading={profileLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <MonitorSmartphone className="h-5 w-5 text-info" />
          <h2 className="font-semibold text-foreground">Active sessions</h2>
        </div>
        {sessionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-lg border border-border bg-surface-muted px-3 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-words text-sm font-medium text-foreground">
                    {session.deviceInfo || 'Unknown device'}
                  </p>
                  {session.isCurrent && (
                    <span className="w-fit rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.ipAddress || 'Unknown IP'} · Created {formatDate(session.createdAt)}
                  {session.expiresAt ? ` · Expires ${formatDate(session.expiresAt)}` : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No active sessions found.</p>
        )}
      </section>
    </div>
  );
}

function StatusPill({ enabled, loading }: { enabled: boolean; loading: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking security
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
        enabled
          ? 'bg-success/10 text-success'
          : 'bg-warning/10 text-warning',
      )}
    >
      {enabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
      2FA {enabled ? 'enabled' : 'not enabled'}
    </span>
  );
}

function SummaryRow({ label, value, loading }: { label: string; value?: string | null; loading: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {loading ? (
        <span className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
      ) : (
        <span className="break-words text-right font-medium text-foreground">{value || '-'}</span>
      )}
    </div>
  );
}
