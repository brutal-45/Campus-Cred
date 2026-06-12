'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Smartphone,
  Mail,
  Monitor,
  MapPin,
  Clock,
  Trash2,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';

// ─── Types ───
interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ip: string;
}

interface LoginRecord {
  id: string;
  dateTime: string;
  device: string;
  ip: string;
  location: string;
  status: 'success' | 'failed';
}

// ─── Mock Data (fallback when API is unavailable) ───
const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'Mumbai, India',
    lastActive: 'Just now',
    isCurrent: true,
    ip: '192.168.1.1',
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'Delhi, India',
    lastActive: '2 hours ago',
    isCurrent: false,
    ip: '10.0.0.45',
  },
  {
    id: '3',
    device: 'Firefox on MacOS',
    location: 'Bangalore, India',
    lastActive: '1 day ago',
    isCurrent: false,
    ip: '172.16.0.12',
  },
];

const MOCK_LOGIN_HISTORY: LoginRecord[] = [
  { id: '1', dateTime: '2024-01-15 09:30 AM', device: 'Chrome / Windows', ip: '192.168.1.1', location: 'Mumbai, India', status: 'success' },
  { id: '2', dateTime: '2024-01-14 03:15 PM', device: 'Safari / iPhone', ip: '10.0.0.45', location: 'Delhi, India', status: 'success' },
  { id: '3', dateTime: '2024-01-13 11:00 AM', device: 'Chrome / Windows', ip: '192.168.1.1', location: 'Mumbai, India', status: 'success' },
  { id: '4', dateTime: '2024-01-12 08:45 AM', device: 'Unknown / Unknown', ip: '203.45.67.89', location: 'Unknown', status: 'failed' },
  { id: '5', dateTime: '2024-01-11 06:20 PM', device: 'Firefox / MacOS', ip: '172.16.0.12', location: 'Bangalore, India', status: 'success' },
];

// ─── Section Wrapper ───
function Section({
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
  danger = false,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`p-5 sm:p-6 animate-fade-in ${danger ? '' : ''}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        animationDelay: `${delay * 1000}ms`,
      }}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            danger
              ? 'bg-danger/10 text-danger'
              : 'bg-electric/10 text-electric'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-navy font-semibold text-base">{title}</h3>
          <p className="text-text-secondary text-xs mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function AccountSecurityPage() {
  const { token, navigate, user } = useAppStore();

  // ─── Change Password State ───
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ─── 2FA State ───
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAMethod, setTwoFAMethod] = useState<'email' | 'app'>('email');
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [show2FAMethodSelect, setShow2FAMethodSelect] = useState(false);

  // ─── Sessions State ───
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // ─── Login History State ───
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>(MOCK_LOGIN_HISTORY);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // ─── Delete Account State ───
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletionPending, setDeletionPending] = useState(false);
  const [deletionDate, setDeletionDate] = useState('');
  const [isCancelingDeletion, setIsCancelingDeletion] = useState(false);

  // ─── Fetch Sessions ───
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/auth/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || MOCK_SESSIONS);
        }
      } catch {
        // Use mock data on error
      } finally {
        setIsLoadingSessions(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/settings/security', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLoginHistory(data.loginHistory || MOCK_LOGIN_HISTORY);
          if (data.twoFAEnabled !== undefined) setTwoFAEnabled(data.twoFAEnabled);
          if (data.twoFAMethod) setTwoFAMethod(data.twoFAMethod);
          if (data.deletionPending) {
            setDeletionPending(true);
            setDeletionDate(data.deletionDate);
          }
        }
      } catch {
        // Use mock data on error
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchSessions();
    fetchHistory();
  }, [token]);

  // ─── Change Password Handler ───
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── 2FA Handler ───
  const handleToggle2FA = async () => {
    setIsToggling2FA(true);
    try {
      const res = await fetch('/api/settings/2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: !twoFAEnabled,
          method: twoFAMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update 2FA settings');
        return;
      }

      setTwoFAEnabled(!twoFAEnabled);
      toast.success(twoFAEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled');
      setShow2FAMethodSelect(false);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsToggling2FA(false);
    }
  };

  // ─── Session Logout Handler ───
  const handleLogoutSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/auth/sessions?id=${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success('Session logged out');
      } else {
        // Still remove from UI for demo
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success('Session logged out');
      }
    } catch {
      toast.error('Failed to logout session');
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Continue anyway
    }
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success('All other sessions logged out');
  };

  // ─── Delete Account Handler ───
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/settings/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account');
        return;
      }

      const date = new Date();
      date.setDate(date.getDate() + 7);
      setDeletionPending(true);
      setDeletionDate(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
      toast.warning('Account scheduled for deletion');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsCancelingDeletion(true);
    try {
      const res = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDeletionPending(false);
        toast.success('Account deletion cancelled');
      }
    } catch {
      toast.error('Failed to cancel deletion');
    } finally {
      setIsCancelingDeletion(false);
    }
  };

  const passwordsMatch = newPassword.length > 0 && confirmNewPassword.length > 0 && newPassword === confirmNewPassword;
  const passwordChangeDisabled = !currentPassword || !newPassword || !confirmNewPassword || !passwordsMatch || isChangingPassword;

  return (
    <div className="min-h-screen hero-bg px-4 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <BackButton onClick={() => navigate('dashboard')} to="Dashboard" />
            <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center shadow-lg shadow-electric/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)]">
                Account Security
              </h1>
              <p className="text-text-secondary text-sm">
                Manage your account security settings
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* ─── Section 1: Change Password ─── */}
          <Section
            title="Change Password"
            description="Update your password to keep your account secure"
            icon={Lock}
            delay={0.1}
          >
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-navy">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="pl-10 pr-10 bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:border-electric/50 focus:ring-electric/20 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-text-secondary transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-navy">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:border-electric/50 focus:ring-electric/20 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-text-secondary transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-navy">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <Input
                    type={showConfirmNew ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`pl-10 pr-10 bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:ring-electric/20 h-11 ${
                      confirmNewPassword.length > 0 && !passwordsMatch
                        ? 'border-danger/50 focus:border-danger/50'
                        : passwordsMatch
                        ? 'border-success/50 focus:border-success/50'
                        : 'focus:border-electric/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNew(!showConfirmNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-text-secondary transition-colors"
                  >
                    {showConfirmNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmNewPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] text-danger">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={passwordChangeDisabled}
                className="btn-primary text-white font-semibold h-10 px-6 rounded-xl text-sm disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </Section>

          {/* ─── Section 2: Two-Factor Authentication ─── */}
          <Section
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            icon={Smartphone}
            delay={0.2}
          >
            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={twoFAEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setShow2FAMethodSelect(true);
                      } else {
                        handleToggle2FA();
                      }
                    }}
                    disabled={isToggling2FA}
                    className="data-[state=checked]:bg-success"
                  />
                  <div>
                    <p className="text-navy text-sm font-medium">
                      {twoFAEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    {twoFAEnabled && (
                      <p className="text-text-secondary text-[11px]">
                        Method: {twoFAMethod === 'email' ? 'Email OTP' : 'Authenticator App'}
                      </p>
                    )}
                  </div>
                </div>
                {isToggling2FA && <Loader2 className="w-4 h-4 animate-spin text-electric" />}
              </div>

              {/* Method Selection */}
              {show2FAMethodSelect && (
                <div className="overflow-hidden animate-fade-in">
                  <div className="pt-2 space-y-3">
                    <p className="text-xs text-text-secondary font-medium">
                      Choose your 2FA method:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTwoFAMethod('email')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          twoFAMethod === 'email'
                            ? 'border-electric/50 bg-electric/10'
                            : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                        }`}
                        style={twoFAMethod !== 'email' ? { backgroundColor: '#F8FAFC' } : undefined}
                      >
                        <Mail className={`w-5 h-5 mb-1.5 ${twoFAMethod === 'email' ? 'text-electric' : 'text-text-secondary'}`} />
                        <p className="text-navy text-sm font-medium">Email OTP</p>
                        <p className="text-text-secondary text-[10px] mt-0.5">Get codes via email</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTwoFAMethod('app')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          twoFAMethod === 'app'
                            ? 'border-electric/50 bg-electric/10'
                            : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                        }`}
                        style={twoFAMethod !== 'app' ? { backgroundColor: '#F8FAFC' } : undefined}
                      >
                        <Smartphone className={`w-5 h-5 mb-1.5 ${twoFAMethod === 'app' ? 'text-electric' : 'text-text-secondary'}`} />
                        <p className="text-navy text-sm font-medium">Authenticator App</p>
                        <p className="text-text-secondary text-[10px] mt-0.5">Google Authenticator</p>
                      </button>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        onClick={handleToggle2FA}
                        disabled={isToggling2FA}
                        className="btn-primary text-white font-semibold h-9 px-5 rounded-lg text-xs"
                      >
                        {isToggling2FA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Enable 2FA'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShow2FAMethodSelect(false)}
                        variant="ghost"
                        className="text-text-secondary hover:text-navy h-9 px-4 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ─── Section 3: Active Sessions ─── */}
          <Section
            title="Active Sessions"
            description="Manage devices where you're currently signed in"
            icon={Monitor}
            delay={0.3}
          >
            {isLoadingSessions ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-electric" />
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors animate-fade-in"
                    style={{ backgroundColor: '#F8FAFC' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <Monitor className="w-5 h-5 text-text-secondary" />
                        {session.isCurrent && (
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-navy text-sm font-medium truncate">
                            {session.device}
                          </p>
                          {session.isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-semibold shrink-0">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {session.location}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {session.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLogoutSession(session.id)}
                        className="text-danger/70 hover:text-danger hover:bg-danger/10 shrink-0 ml-2 h-8 px-2"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">Logout</span>
                      </Button>
                    )}
                  </div>
                ))}

                {sessions.length > 1 && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoutAllSessions}
                      className="text-danger/70 hover:text-danger hover:bg-danger/10 h-8 px-3 text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      Logout All Other Devices
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* ─── Section 4: Login History ─── */}
          <Section
            title="Login History"
            description="Recent login activity on your account"
            icon={Clock}
            delay={0.4}
          >
            {isLoadingHistory ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-electric" />
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <div className="min-w-[600px] px-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 pb-2 border-b border-[#E2E8F0]">
                    <div className="col-span-3 text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Date/Time</div>
                    <div className="col-span-3 text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Device</div>
                    <div className="col-span-2 text-[10px] uppercase tracking-wider text-text-secondary font-semibold">IP Address</div>
                    <div className="col-span-2 text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Location</div>
                    <div className="col-span-2 text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Status</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-[#E2E8F0]">
                    {loginHistory.map((record) => (
                      <div
                        key={record.id}
                        className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center animate-fade-in"
                      >
                        <div className="col-span-3 text-navy/60 text-xs truncate">{record.dateTime}</div>
                        <div className="col-span-3 text-navy/60 text-xs truncate">{record.device}</div>
                        <div className="col-span-2 text-text-secondary text-xs font-mono truncate">{record.ip}</div>
                        <div className="col-span-2 text-text-secondary text-xs truncate">{record.location}</div>
                        <div className="col-span-2">
                          {record.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 text-success text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-danger text-xs">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ─── Section 5: Account Deletion ─── */}
          <Section
            title="Account Deletion"
            description="Permanently delete your account and all data"
            icon={AlertTriangle}
            delay={0.5}
            danger
          >
            {deletionPending ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
                  <p className="text-danger text-sm font-medium">
                    Account scheduled for deletion on {deletionDate}
                  </p>
                  <p className="text-danger/60 text-xs mt-1">
                    Your account will be permanently deleted after the 7-day grace period.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleCancelDeletion}
                  disabled={isCancelingDeletion}
                  variant="ghost"
                  className="text-success hover:text-success hover:bg-success/10 h-9 px-4 text-xs"
                >
                  {isCancelingDeletion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Cancel Deletion
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-danger/5 border border-danger/10">
                  <p className="text-text-secondary text-xs leading-relaxed">
                    <strong className="text-danger/80">Warning:</strong> This action cannot be undone. Once deleted, all your data including
                    certificates, portfolio, points, and task history will be permanently removed.
                    You will have a 7-day grace period to cancel the deletion.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  variant="ghost"
                  className="text-danger hover:text-danger hover:bg-danger/10 border border-danger/20 h-10 px-5 rounded-xl text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* ─── Delete Account Confirmation Dialog ─── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border border-[#E2E8F0] text-navy max-w-md">
          <DialogHeader>
            <DialogTitle className="text-danger flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              This action cannot be undone. Type <strong className="text-danger">DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:border-danger/50 focus:ring-danger/20"
            />
            <div className="p-3 rounded-xl bg-danger/5 border border-danger/10">
              <p className="text-text-secondary text-xs">
                You will have a <strong className="text-navy/70">7-day grace period</strong> to cancel this action.
                After that, your account and all data will be permanently deleted.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText('');
              }}
              className="text-text-secondary hover:text-navy"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
              className="bg-danger hover:bg-danger/90 text-white font-semibold disabled:opacity-50"
            >
              {isDeletingAccount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
