'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Building2,
  Shield,
  Sparkles,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  Phone,
  X,
} from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { usePlatformLogin } from '@/hooks/usePlatform';
import { useAuthStore } from '@/store/auth.store';
import { usePlatformAuthStore } from '@/store/platform-auth.store';
import { getApiBaseUrl } from '@/lib/runtime-config';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginType = 'company' | 'platform';

const features = [
  { icon: Sparkles, label: 'Smart Task Management' },
  { icon: BarChart3, label: 'Real-Time Work Tracking' },
  { icon: Zap, label: 'AI-Powered Automation' },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isAuthenticated: isPlatformAuthenticated } = usePlatformAuthStore();

  const [loginType, setLoginType] = useState<LoginType>('company');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null);

  const { mutate: companyLogin, isPending: isCompanyPending } = useLogin();
  const { mutate: platformLogin, isPending: isPlatformPending } = usePlatformLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
    if (isPlatformAuthenticated) router.replace('/platform/dashboard');
  }, [isAuthenticated, isPlatformAuthenticated, router]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0) setImgError(true);
    };
    img.onerror = () => setImgError(true);
    img.src = '/auth-illustration.png';
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0) setLogoError(true);
    };
    img.onerror = () => setLogoError(true);
    img.src = '/auth-logo.png';
  }, []);

  const onSubmit = (values: LoginFormValues) => {
    setLoginError('');
    const mutate = loginType === 'company' ? companyLogin : platformLogin;
    mutate(
      { email: values.email, password: values.password, totpCode: '' },
      {
        onSuccess: () => {
          // Auth store update will trigger redirect via useEffect
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.';
          if (msg.toLowerCase().includes('2fa code required')) {
            setSavedCredentials({ email: values.email, password: values.password });
            setNeeds2FA(true);
            setLoginError('');
          } else {
            setLoginError(msg);
          }
        },
      }
    );
  };

  const onSubmit2FA = () => {
    if (!savedCredentials || totpCode.length !== 6) return;
    setLoginError('');
    const mutate = loginType === 'company' ? companyLogin : platformLogin;
    mutate(
      { email: savedCredentials.email, password: savedCredentials.password, totpCode },
      {
        onSuccess: () => {
          // Auth store update will trigger redirect via useEffect
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Invalid code. Please try again.';
          setLoginError(msg);
          setTotpCode('');
        },
      }
    );
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      const apiBase = getApiBaseUrl();
      const ssoUrl = `${apiBase}/auth/sso/google/start?returnTo=/dashboard`;
      const res = await fetch(ssoUrl, { redirect: 'manual' });
      if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301) {
        window.location.href = ssoUrl;
      } else {
        const data = await res.json().catch(() => null);
        setLoginError(data?.error?.message || 'Google SSO is not available right now.');
      }
    } catch {
      window.location.href = `${getApiBaseUrl()}/auth/sso/google/start?returnTo=/dashboard`;
    }
  };

  const isPending = isCompanyPending || isPlatformPending;

  return (
    <div className="auth-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="auth-page-inner" style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: 1 }} className="auth-layout">

          {/* ── Left branding panel ──────────────────────────────────────── */}
          <div className="auth-branding-bg auth-left-panel">
            <div className="auth-blobs-container" aria-hidden="true">
              <div className="auth-blob auth-blob-1" />
              <div className="auth-blob auth-blob-2" />
              <div className="auth-blob auth-blob-3" />
            </div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="auth-logo"
            >
              {!logoError ? (
                <>
                  <img
                    src="/auth-logo.png"
                    alt="Task Easy"
                    className="auth-logo-image"
                    onError={() => setLogoError(true)}
                    onLoad={(e) => {
                      if (e.currentTarget.naturalWidth === 0) setLogoError(true);
                    }}
                  />
                  <span className="auth-logo-text font-display">Task Easy</span>
                </>
              ) : (
                <>
                  <div className="auth-logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <span className="auth-logo-text font-display">Task Easy</span>
                </>
              )}
            </motion.div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="auth-illustration-container"
            >
              <div className="auth-illustration-wrapper">
                <div className="auth-illustration-glow" />
                {!imgError ? (
                  <img
                    src="/auth-illustration.png"
                    alt="Developer working on tasks"
                    className="auth-illustration-img"
                    width={320}
                    height={320}
                    onError={() => setImgError(true)}
                    onLoad={(e) => {
                      if (e.currentTarget.naturalWidth === 0) setImgError(true);
                    }}
                  />
                ) : (
                  <div className="auth-illustration-img auth-illustration-fallback">
                    <div className="auth-fallback-box">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0866FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span className="auth-fallback-text font-display">Task Easy</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Text content */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="auth-branding-text"
            >
              <motion.h1 variants={fadeUp} className="auth-heading font-display">
                Work Smarter. Achieve More.
              </motion.h1>
              <motion.p variants={fadeUp} className="auth-subheading">
                Plan tasks, manage teams, track progress and automate everyday work from one powerful platform.
              </motion.p>

              {/* features removed for compact layout */}
            </motion.div>
          </div>

          {/* ── Right auth panel ─────────────────────────────────────────── */}
          <div className="auth-right-panel">
            <div className="auth-right-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="auth-card-wrapper"
              >
                <div className="auth-card">
                  {/* Card header */}
                  <div style={{ marginBottom: 10 }}>
                    <p className="auth-card-label">
                      Welcome to Task Easy
                    </p>
                    <h2 className="auth-card-title font-display">
                      Let&apos;s get you started
                    </h2>
                    <p className="auth-card-subtitle">
                      Sign in securely to manage your tasks, team and workflow.
                    </p>
                  </div>

                  {/* Login type selector */}
                  <div className="auth-type-selector">
                    <div className="auth-type-selector-inner">
                      <motion.div
                        className="auth-type-indicator"
                        animate={{
                          left: loginType === 'company' ? '0%' : '50%',
                          width: '50%',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLoginType('company');
                          setLoginError('');
                          reset();
                        }}
                        className="auth-type-btn"
                        style={{ color: loginType === 'company' ? '#102A43' : '#64748B' }}
                      >
                        <Building2 style={{ height: 16, width: 16 }} />
                        Company
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginType('platform');
                          setLoginError('');
                          reset();
                        }}
                        className="auth-type-btn"
                        style={{ color: loginType === 'platform' ? '#102A43' : '#64748B' }}
                      >
                        <Shield style={{ height: 16, width: 16 }} />
                        Platform
                      </button>
                    </div>
                  </div>

                  {/* Login type description */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loginType}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="auth-type-desc"
                    >
                      {loginType === 'company'
                        ? 'For employees, managers and company administrators'
                        : 'For Task Easy platform administrators'}
                    </motion.p>
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                  {!needs2FA ? (
                    <motion.div
                      key="login-step"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                  {/* Login form */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email field */}
                    <div style={{ marginBottom: 12 }}>
                      <label htmlFor="email" className="auth-input-label">
                        Email address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div className="auth-input-icon">
                          <Mail style={{ height: 18, width: 18 }} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          placeholder="name@company.com"
                          autoComplete="email"
                          className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                          {...register('email')}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="auth-error-msg"
                          >
                            <AlertCircle style={{ height: 14, width: 14, flexShrink: 0 }} />
                            {errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Password field */}
                    <div style={{ marginBottom: 14 }}>
                      <label htmlFor="password" className="auth-input-label">
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div className="auth-input-icon">
                          <Lock style={{ height: 18, width: 18 }} />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className={`auth-input auth-input-password ${errors.password ? 'auth-input-error' : ''}`}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="auth-password-toggle"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff style={{ height: 18, width: 18 }} />
                          ) : (
                            <Eye style={{ height: 18, width: 18 }} />
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="auth-error-msg"
                          >
                            <AlertCircle style={{ height: 14, width: 14, flexShrink: 0 }} />
                            {errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Login error */}
                    <AnimatePresence>
                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="auth-login-error"
                        >
                          <AlertCircle style={{ height: 16, width: 16 }} />
                          {loginError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={!isValid || isPending}
                      className="auth-btn-primary auth-submit-btn"
                    >
                      {isPending ? (
                        <Loader2 style={{ height: 16, width: 16 }} className="animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight style={{ height: 16, width: 16 }} />
                        </>
                      )}
                    </button>
                  </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="2fa-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 16,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          marginBottom: 12,
                        }}>
                          <Shield style={{ height: 28, width: 28, color: '#ffffff' }} />
                        </div>
                        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                          Two-Factor Authentication
                        </h3>
                        <p style={{ fontSize: 13, color: '#64748b' }}>
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label htmlFor="totp" className="auth-input-label">
                          Verification Code
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div className="auth-input-icon">
                            <Shield style={{ height: 18, width: 18 }} />
                          </div>
                          <input
                            id="totp"
                            type="text"
                            inputMode="numeric"
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                            autoComplete="one-time-code"
                            value={totpCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setTotpCode(val);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && totpCode.length === 6) onSubmit2FA();
                            }}
                            className="auth-input"
                            style={{ letterSpacing: '0.5em', fontSize: 20, fontWeight: 600, textAlign: 'center', paddingLeft: 48 }}
                          />
                        </div>
                      </div>

                      {/* Login error */}
                      <AnimatePresence>
                        {loginError && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="auth-login-error"
                          >
                            <AlertCircle style={{ height: 16, width: 16 }} />
                            {loginError}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="button"
                        onClick={onSubmit2FA}
                        disabled={totpCode.length !== 6 || isPending}
                        className="auth-btn-primary auth-submit-btn"
                      >
                        {isPending ? (
                          <Loader2 style={{ height: 16, width: 16 }} className="animate-spin" />
                        ) : (
                          <>
                            Verify &amp; Sign In
                            <ArrowRight style={{ height: 16, width: 16 }} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNeeds2FA(false);
                          setTotpCode('');
                          setSavedCredentials(null);
                          setLoginError('');
                        }}
                        style={{
                          width: '100%', marginTop: 12, padding: '10px 0',
                          fontSize: 13, fontWeight: 500, color: '#64748b',
                          background: 'none', border: 'none', cursor: 'pointer',
                        }}
                      >
                        &larr; Back to login
                      </button>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  {/* Security note removed for compact layout */}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <footer style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 32px',
              fontSize: 12,
              color: '#64748b',
              borderTop: '1px solid #dbeafe',
              background: '#eff6ff',
              zIndex: 50,
            }}>
              <span>COPYRIGHT &copy; 2026 &ndash; Kriscel Tech Pvt. Ltd., India</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <a href="/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms &amp; Services</a>
                <span style={{ color: '#93c5fd' }}>|</span>
                <a href="/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>
                <span style={{ color: '#93c5fd' }}>|</span>
                <button type="button" onClick={() => setShowSupport(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: 'inherit' }}>Support</button>
              </div>
            </footer>

            {showSupport && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
              }} onClick={() => setShowSupport(false)}>
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  width: '90%',
                  maxWidth: 520,
                  padding: 0,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                  }}>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Support</h3>
                    <button
                      onClick={() => setShowSupport(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{
                    background: '#eff6ff',
                    margin: '0 24px',
                    borderRadius: 12,
                    padding: '24px 28px',
                  }}>
                    <p style={{ margin: '0 0 20px', fontSize: 17, color: '#475569', fontWeight: 400 }}>
                      Our friendly team is always ready to help.
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: 0,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Talk to us</p>
                        <p style={{ margin: '4px 0 14px', fontSize: 13, color: '#94a3b8' }}>Available 24*7</p>
                        <a href="tel:+918985419420" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: 15,
                          fontWeight: 500,
                        }}>
                          <Phone size={18} />
                          +91 8985419420
                        </a>
                      </div>
                      <div style={{ width: 1, background: '#cbd5e1', margin: '0 20px' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Write us your query</p>
                        <p style={{ margin: '4px 0 14px', fontSize: 13, color: '#94a3b8' }}>We will get back to you.</p>
                        <a href="mailto:Info@kriscel.com" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: 15,
                          fontWeight: 500,
                        }}>
                          <Mail size={18} />
                          Info@kriscel.com
                        </a>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 24 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
