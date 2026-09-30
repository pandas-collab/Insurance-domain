import { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  BadgeCheck,
  Save,
  Lock,
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { updateUser } from '../auth/mockUsers';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Role badge colour map ─────────────────────────────────────────────────────
const ROLE_COLOURS = {
  Administrator: 'bg-purple-50 text-purple-700 border-purple-200',
  'L2 Senior Underwriter': 'bg-teal-50 text-teal-700 border-teal-200',
  'L1 Underwriter': 'bg-blue-50 text-blue-700 border-blue-200',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children, locked = false }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#0D9488]" strokeWidth={1.75} />
          </div>
          <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
        </div>
        {locked && (
          <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            Read-only
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-[#F9FAFB] last:border-0">
      <span className="text-xs font-medium text-[#6B7280] w-40 shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm text-[#111827] text-right ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F9FAFB] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#111827]">{label}</p>
        {description && (
          <p className="text-xs text-[#9CA3AF] mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:ring-offset-2 ${
          checked ? 'bg-[#0D9488]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ── Toast (inline, no external dep) ──────────────────────────────────────────
function InlineToast({ type, message, onDismiss }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm mb-5 ${
        isSuccess
          ? 'bg-teal-50 border-teal-200 text-teal-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
      ) : (
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      )}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-current opacity-50 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { currentUser, refreshCurrentUser } = useAuth();

  // ── Editable form state ───────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');
  const [notifEmail, setNotifEmail] = useState(
    currentUser?.notificationPreferences?.email ?? true
  );
  const [notifSms, setNotifSms] = useState(
    currentUser?.notificationPreferences?.sms ?? false
  );
  const [notifInApp, setNotifInApp] = useState(
    currentUser?.notificationPreferences?.inApp ?? true
  );

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const isDirty =
    firstName !== (currentUser?.firstName ?? '') ||
    lastName !== (currentUser?.lastName ?? '') ||
    notifEmail !== (currentUser?.notificationPreferences?.email ?? true) ||
    notifSms !== (currentUser?.notificationPreferences?.sms ?? false) ||
    notifInApp !== (currentUser?.notificationPreferences?.inApp ?? true);

  const dismissToast = () => setToast({ type: '', message: '' });

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setToast({ type: 'error', message: 'First name and last name are required.' });
      return;
    }

    setIsSaving(true);
    dismissToast();

    try {
      const changes = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        notificationPreferences: {
          email: notifEmail,
          sms: notifSms,
          inApp: notifInApp,
        },
      };

      // Write directly to the authoritative mockUsers store
      const updatedUser = updateUser(currentUser.id, changes);

      // Sync the auth context so the header name updates immediately
      if (typeof refreshCurrentUser === 'function') {
        refreshCurrentUser();
      }
      setToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.message ?? 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const roleBadgeClass =
    ROLE_COLOURS[currentUser?.role] ?? 'bg-gray-50 text-gray-700 border-gray-200';

  const statusBadge =
    currentUser?.status === 'active' ? (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Inactive
      </span>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center shadow-sm">
          <User className="w-5 h-5 text-white" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#111827]">My Profile</h1>
          <p className="text-sm text-[#6B7280]">
            Manage your personal information and notification preferences
          </p>
        </div>
      </div>

      {/* ── Avatar + name banner ── */}
      <div className="bg-gradient-to-r from-[#0D9488] to-[#0B8276] rounded-2xl px-6 py-5 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-white select-none">
            {(currentUser?.firstName?.[0] ?? '?').toUpperCase()}
            {(currentUser?.lastName?.[0] ?? '').toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white truncate">
            {currentUser?.firstName ?? ''} {currentUser?.lastName ?? ''}
          </p>
          <p className="text-sm text-teal-100 truncate">{currentUser?.email ?? ''}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleBadgeClass}`}
            >
              <Shield className="w-3 h-3" />
              {currentUser?.role ?? 'Unknown Role'}
            </span>
            {currentUser?.assignedAuthorityLevel && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white/80 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3 h-3" />
                Authority Level {currentUser.assignedAuthorityLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      <InlineToast type={toast.type} message={toast.message} onDismiss={dismissToast} />

      {/* ── Editable: Personal Information ── */}
      <SectionCard title="Personal Information" icon={User}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First name */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition"
                placeholder="First name"
              />
            </div>
            {/* Last name */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition"
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email — read-only */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#6B7280]">
              <Mail className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              <span className="truncate">{currentUser?.email ?? ''}</span>
              <span className="ml-auto text-xs text-[#9CA3AF] shrink-0">
                Contact admin to change
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Editable: Notification Preferences ── */}
      <SectionCard title="Notification Preferences" icon={Bell}>
        <div className="space-y-0">
          <ToggleRow
            label="Email Notifications"
            description="Receive renewal alerts and case updates via email"
            checked={notifEmail}
            onChange={setNotifEmail}
          />
          <ToggleRow
            label="SMS Notifications"
            description="Receive urgent alerts via text message"
            checked={notifSms}
            onChange={setNotifSms}
          />
          <ToggleRow
            label="In-App Notifications"
            description="Show notification badges and alerts within the platform"
            checked={notifInApp}
            onChange={setNotifInApp}
          />
        </div>

        {/* Save button */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
          <p className="text-xs text-[#9CA3AF]">
            {isDirty ? (
              <span className="text-amber-600 font-medium">
                You have unsaved changes
              </span>
            ) : (
              'All changes saved'
            )}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0B8276] active:bg-[#0A7268] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* ── Read-only: Account Information ── */}
      <SectionCard title="Account Information" icon={Shield} locked>
        <div className="space-y-0">
          <FieldRow label="Role" value={
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleBadgeClass}`}>
              <Shield className="w-3 h-3" />
              {currentUser?.role ?? '—'}
            </span>
          } />
          <FieldRow
            label="Authority Level"
            value={
              currentUser?.assignedAuthorityLevel ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <BadgeCheck className="w-3 h-3" />
                  Level {currentUser.assignedAuthorityLevel}
                </span>
              ) : (
                <span className="text-sm text-[#9CA3AF]">Not assigned</span>
              )
            }
          />
          <FieldRow label="Account Status" value={statusBadge} />
          <FieldRow
            label="Last Login"
            value={
              <span className="inline-flex items-center gap-1.5 text-sm text-[#374151]">
                <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                {formatDateTime(currentUser?.lastLogin)}
              </span>
            }
          />
          <FieldRow
            label="Member Since"
            value={
              <span className="inline-flex items-center gap-1.5 text-sm text-[#374151]">
                <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                {formatDate(currentUser?.createdAt)}
              </span>
            }
          />
          <FieldRow label="User ID" value={currentUser?.id ?? '—'} mono />
        </div>

        {/* Admin note */}
        <div className="mt-4 flex items-start gap-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Role, authority level, and account status are managed by your system
            administrator. Contact your admin if changes are required.
          </p>
        </div>
      </SectionCard>

      {/* ── Read-only: Security ── */}
      <SectionCard title="Security" icon={Lock} locked>
        <div className="space-y-0">
          <FieldRow label="Password" value="••••••••••••" mono />
          <FieldRow label="Two-Factor Auth" value={
            <span className="text-xs text-[#9CA3AF] italic">Not configured</span>
          } />
          <FieldRow label="Session Expiry" value="8 hours" />
        </div>
        <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Password changes and two-factor authentication configuration are
            managed through your organisation's identity provider.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
