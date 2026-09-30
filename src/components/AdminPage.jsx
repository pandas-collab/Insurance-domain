import { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  Key,
  Settings,
  Sliders,
  Search,
  Plus,
  Edit2,
  UserX,
  UserCheck,
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  Info,
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import {
  getUsers,
  createUser as mockCreateUser,
  updateUser as mockUpdateUser,
  deactivateUser as mockDeactivateUser,
  activateUser as mockActivateUser,
} from '../auth/mockUsers';
import { PERMISSIONS, ROLE_PERMISSIONS, PERMISSION_METADATA } from '../auth/permissions';

// ── Async wrappers around the synchronous mockUsers store ─────────────────────
const api = {
  createUser: async (payload) => {
    await new Promise(r => setTimeout(r, 300));
    try {
      const user = mockCreateUser(payload);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err?.message ?? 'Failed to create user.' };
    }
  },
  updateUser: async (id, payload) => {
    await new Promise(r => setTimeout(r, 300));
    try {
      const user = mockUpdateUser(id, payload);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err?.message ?? 'Failed to update user.' };
    }
  },
  deactivateUser: async (id) => {
    await new Promise(r => setTimeout(r, 200));
    try {
      mockDeactivateUser(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message ?? 'Failed to deactivate user.' };
    }
  },
  activateUser: async (id) => {
    await new Promise(r => setTimeout(r, 200));
    try {
      mockActivateUser(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message ?? 'Failed to activate user.' };
    }
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = ['Administrator', 'L2 Senior Underwriter', 'L1 Underwriter'];
const AUTHORITY_LEVELS = ['', 'L1', 'L2', 'L3'];

const ROLE_COLOURS = {
  Administrator: 'bg-purple-50 text-purple-700 border-purple-200',
  'L2 Senior Underwriter': 'bg-teal-50 text-teal-700 border-teal-200',
  'L1 Underwriter': 'bg-blue-50 text-blue-700 border-blue-200',
};

const STATUS_COLOURS = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
};

const TABS = [
  { id: 'users',       label: 'User Management',     icon: Users },
  { id: 'roles',       label: 'Role Management',      icon: Shield },
  { id: 'permissions', label: 'Permission Matrix',    icon: Key },
  { id: 'authority',   label: 'Authority Config',     icon: Sliders },
  { id: 'system',      label: 'System Config',        icon: Settings },
];

// Permission categories for matrix view
const PERM_CATEGORIES = {
  Renewals:       ['VIEW_RENEWAL','EDIT_RENEWAL','ASSIGN_RENEWAL','APPROVE_RENEWAL','REFER_RENEWAL','REQUEST_INFO'],
  'AI & Advisory':['REVIEW_AI'],
  Portfolio:      ['VIEW_PORTFOLIO'],
  Administration: ['MANAGE_USERS','MANAGE_ROLES','VIEW_AUDIT','MANAGE_IMPORTS','MANAGE_RULES','MANAGE_SYSTEM'],
};

// ── Inline Toast ──────────────────────────────────────────────────────────────

function InlineToast({ type, message, onDismiss }) {
  if (!message) return null;
  const ok = type === 'success';
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm mb-5 ${
      ok ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {ok
        ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
        : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />}
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

// ── User Modal ────────────────────────────────────────────────────────────────

function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    firstName:            user?.firstName ?? '',
    lastName:             user?.lastName  ?? '',
    email:                user?.email     ?? '',
    role:                 user?.role      ?? 'L1 Underwriter',
    assignedAuthorityLevel: user?.assignedAuthorityLevel ?? '',
    password:             '',
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.lastName.trim())  return 'Last name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'A valid email address is required.';
    if (!isEdit && !form.password) return 'Password is required for new users.';
    if (form.password && form.password.length < 8)
      return 'Password must be at least 8 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      let result;
      if (isEdit) {
        result = await api.updateUser(user.id, payload);
      } else {
        result = await api.createUser(payload);
      }
      if (result?.success) {
        onSaved(result.user, isEdit ? 'updated' : 'created');
      } else {
        setError(result?.error ?? 'Failed to save user.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0D9488]" />
            </div>
            <h2 className="text-sm font-semibold text-[#111827]">
              {isEdit ? 'Edit User' : 'Add New User'}
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">First Name *</label>
              <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder="First name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Last Name *</label>
              <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder="Last name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Email Address *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              disabled={isEdit}
              className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
              placeholder="user@suretycorp.com" />
            {isEdit && <p className="text-xs text-[#9CA3AF] mt-1">Email cannot be changed after account creation.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Role *</label>
              <div className="relative">
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent bg-white pr-8">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Authority Level</label>
              <div className="relative">
                <select value={form.assignedAuthorityLevel} onChange={e => set('assignedAuthorityLevel', e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent bg-white pr-8">
                  {AUTHORITY_LEVELS.map(l => <option key={l} value={l}>{l || '— None —'}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              {isEdit ? 'New Password' : 'Password *'}
              {isEdit && <span className="text-[#9CA3AF] font-normal ml-1">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 8 characters'}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F3F4F6] mt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#0D9488] hover:bg-[#0B8276] disabled:opacity-50 rounded-lg transition shadow-sm">
              {saving ? (
                <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Saving…</>
              ) : (isEdit ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-semibold text-[#111827] mb-2">{title}</h3>
        <p className="text-sm text-[#6B7280] mb-5">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] transition">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition shadow-sm ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const { currentUser } = useAuth();
  const [users, setUsers]       = useState(() => getUsers());
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);   // null | { mode:'add'|'edit', user? }
  const [confirm, setConfirm]   = useState(null);   // null | { user, action }
  const [toast, setToast]       = useState({ type: '', message: '' });

  const reload = () => setUsers(getUsers());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (users || []).filter(u =>
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleSaved = (user, action) => {
    setModal(null);
    reload();
    setToast({ type: 'success', message: `User ${user.firstName} ${user.lastName} ${action} successfully.` });
  };

  const handleToggleStatus = async () => {
    if (!confirm) return;
    const { user, action } = confirm;
    setConfirm(null);
    try {
      let result;
      if (action === 'deactivate') {
        result = await api.deactivateUser(user.id);
      } else {
        result = await api.activateUser(user.id);
      }
      if (result?.success) {
        reload();
        setToast({ type: 'success', message: `User ${action === 'deactivate' ? 'deactivated' : 'activated'} successfully.` });
      } else {
        setToast({ type: 'error', message: result?.error ?? 'Action failed.' });
      }
    } catch {
      setToast({ type: 'error', message: 'An unexpected error occurred.' });
    }
  };

  return (
    <div>
      {modal && (
        <UserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.action === 'deactivate' ? 'Deactivate User' : 'Activate User'}
          message={
            confirm.action === 'deactivate'
              ? `Are you sure you want to deactivate ${confirm.user.firstName} ${confirm.user.lastName}? They will no longer be able to log in.`
              : `Reactivate ${confirm.user.firstName} ${confirm.user.lastName}? They will regain access to the platform.`
          }
          confirmLabel={confirm.action === 'deactivate' ? 'Deactivate' : 'Activate'}
          confirmClass={confirm.action === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0D9488] hover:bg-[#0B8276]'}
          onConfirm={handleToggleStatus}
          onCancel={() => setConfirm(null)}
        />
      )}

      <InlineToast type={toast.type} message={toast.message} onDismiss={() => setToast({ type: '', message: '' })} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'add', user: null })}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0D9488] hover:bg-[#0B8276] rounded-lg transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Authority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Last Login</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#9CA3AF]">
                    {search ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white select-none">
                          {(u.firstName?.[0] ?? '?').toUpperCase()}{(u.lastName?.[0] ?? '').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#111827]">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-[#9CA3AF]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_COLOURS[u.role] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      <Shield className="w-3 h-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.assignedAuthorityLevel ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        {u.assignedAuthorityLevel}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOURS[u.status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">
                    {formatDateTime(u.lastLogin)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: 'edit', user: u })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F3F4F6] transition"
                        title="Edit user"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      {u.id !== currentUser?.id && (
                        u.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => setConfirm({ user: u, action: 'deactivate' })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                            title="Deactivate user"
                          >
                            <UserX className="w-3 h-3" />
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirm({ user: u, action: 'activate' })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                            title="Activate user"
                          >
                            <UserCheck className="w-3 h-3" />
                            Activate
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#F3F4F6] bg-[#F9FAFB]">
          <p className="text-xs text-[#9CA3AF]">
            {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Roles Tab ─────────────────────────────────────────────────────────────────

function RolesTab() {
  const roleData = [
    {
      name: 'Administrator',
      description: 'Full system access including user management, configuration, and all underwriting operations.',
      colour: ROLE_COLOURS['Administrator'],
    },
    {
      name: 'L2 Senior Underwriter',
      description: 'Senior underwriting authority with AI brief review, renewal approval, referral, and portfolio intelligence access.',
      colour: ROLE_COLOURS['L2 Senior Underwriter'],
    },
    {
      name: 'L1 Underwriter',
      description: 'Standard underwriting access for renewal review, information requests, and correspondence management.',
      colour: ROLE_COLOURS['L1 Underwriter'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-2">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Roles define the permission sets available to users. The permission model is designed to support additional roles without system redesign — contact your system administrator to configure custom roles.
        </p>
      </div>

      {roleData.map(role => {
        const perms = ROLE_PERMISSIONS[role.name] ?? [];
        return (
          <div key={role.name} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6]">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-[#111827]">{role.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${role.colour}`}>
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{role.description}</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {perms.map(permKey => {
                  const meta = PERMISSION_METADATA?.[permKey];
                  return (
                    <span key={permKey}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#374151] bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-1 rounded-full">
                      <Key className="w-3 h-3 text-[#9CA3AF]" />
                      {meta?.name ?? permKey}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Permissions Tab ───────────────────────────────────────────────────────────

function PermissionsTab() {
  const allRoles = ['Administrator', 'L2 Senior Underwriter', 'L1 Underwriter'];

  return (
    <div>
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          This matrix shows which permissions are granted to each role. Permission checks are enforced throughout the application — UI controls are hidden and API operations are blocked for unauthorised roles.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide w-64">Permission</th>
                {allRoles.map(r => (
                  <th key={r} className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${ROLE_COLOURS[r] ?? ''}`}>
                      {r === 'L2 Senior Underwriter' ? 'L2 Senior UW' : r === 'L1 Underwriter' ? 'L1 UW' : r}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERM_CATEGORIES).map(([category, permKeys]) => (
                <>
                  <tr key={`cat-${category}`} className="bg-[#F9FAFB]">
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold text-[#374151] uppercase tracking-wider border-b border-t border-[#E5E7EB]">
                      {category}
                    </td>
                  </tr>
                  {permKeys.map(permKey => {
                    const meta = PERMISSION_METADATA?.[permKey];
                    return (
                      <tr key={permKey} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-[#111827]">{meta?.name ?? permKey}</p>
                          {meta?.description && (
                            <p className="text-xs text-[#9CA3AF] mt-0.5">{meta.description}</p>
                          )}
                        </td>
                        {allRoles.map(role => {
                          const granted = (ROLE_PERMISSIONS[role] ?? []).includes(permKey);
                          return (
                            <td key={role} className="px-4 py-3 text-center">
                              {granted ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-50 border border-teal-200 mx-auto">
                                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] mx-auto">
                                  <X className="w-3 h-3 text-[#D1D5DB]" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Authority Config Tab ──────────────────────────────────────────────────────

function AuthorityConfigTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Sliders className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-1">Underwriting Authority Thresholds</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
              This section will allow administrators to configure customer-approved underwriting authority thresholds for each authority level (L1, L2, L3). Thresholds define the maximum bond amounts, risk categories, and approval limits each level can independently authorise.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['L1 Underwriter', 'L2 Senior Underwriter', 'L3 / Administrator'].map((level, i) => (
                <div key={level} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className={`w-4 h-4 ${i === 0 ? 'text-blue-500' : i === 1 ? 'text-teal-500' : 'text-purple-500'}`} />
                    <span className="text-xs font-semibold text-[#374151]">{level}</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">Thresholds pending configuration</p>
                  <div className="mt-3 space-y-1.5">
                    {['Bond Amount Limit', 'Risk Category', 'Referral Threshold'].map(field => (
                      <div key={field} className="flex items-center justify-between">
                        <span className="text-xs text-[#6B7280]">{field}</span>
                        <span className="text-xs font-medium text-[#9CA3AF] italic">TBD</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Authority thresholds must be approved by your organisation's underwriting governance committee before activation. This configuration area is reserved for future implementation once authority levels have been formally defined.
        </p>
      </div>
    </div>
  );
}

// ── System Config Tab ─────────────────────────────────────────────────────────

function SystemConfigTab() {
  const configSections = [
    {
      title: 'AI Provider Configuration',
      description: 'Configure the AI model provider, API endpoints, confidence thresholds, and mandatory acknowledgement rules for AI advisory panels.',
      icon: Settings,
      items: ['AI Model Provider', 'Confidence Score Threshold', 'Mandatory Acknowledgement', 'AI Brief Retention Period'],
    },
    {
      title: 'Session & Security',
      description: 'Configure session expiry, password policies, multi-factor authentication requirements, and audit log retention.',
      icon: Lock,
      items: ['Session Expiry Duration', 'Password Policy', 'MFA Requirement', 'Audit Log Retention'],
    },
    {
      title: 'Notification & Integration',
      description: 'Configure email delivery, SMS gateway, external system integrations, and webhook endpoints.',
      icon: Settings,
      items: ['Email Provider', 'SMS Gateway', 'Webhook Endpoints', 'External System Integrations'],
    },
    {
      title: 'Data Import & Export',
      description: 'Configure automated data import schedules, file format mappings, and export templates.',
      icon: Settings,
      items: ['Import Schedule', 'File Format Mapping', 'Export Templates', 'Data Retention Policy'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          System configuration controls platform-wide settings. Changes here affect all users. This area is reserved for future implementation and will be activated during the enterprise deployment phase.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {configSections.map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0">
                <section.icon className="w-4 h-4 text-[#0D9488]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111827]">{section.title}</h3>
            </div>
            <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">{section.description}</p>
            <div className="space-y-1.5">
              {section.items.map(item => (
                <div key={item} className="flex items-center justify-between py-1.5 border-b border-[#F9FAFB] last:border-0">
                  <span className="text-xs text-[#374151]">{item}</span>
                  <span className="text-xs font-medium text-[#9CA3AF] italic">Pending</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Permission gate
  if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-[#111827] mb-2">Access Restricted</h2>
        <p className="text-sm text-[#6B7280] text-center max-w-sm">
          You do not have permission to access the Administration area. Contact your system administrator if you require access.
        </p>
      </div>
    );
  }

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center shadow-sm">
          <Settings className="w-5 h-5 text-white" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Administration</h1>
          <p className="text-sm text-[#6B7280]">
            Manage users, roles, permissions, and system configuration
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#0D9488] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#374151] hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'users'       && <UsersTab />}
        {activeTab === 'roles'       && <RolesTab />}
        {activeTab === 'permissions' && <PermissionsTab />}
        {activeTab === 'authority'   && <AuthorityConfigTab />}
        {activeTab === 'system'      && <SystemConfigTab />}
      </div>
    </div>
  );
}
