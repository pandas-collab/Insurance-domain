import { useState, createContext, useContext, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, Zap, BarChart2, Bell, Mail,
  ClipboardList, FileBarChart, Settings, User, ChevronLeft,
  ChevronRight, Shield, AlertTriangle, X, CheckCircle, Info, LogOut, Database
} from 'lucide-react';
import UnderwritingDashboard from './components/UnderwritingDashboard.jsx';
import RenewalPipeline from './components/RenewalPipeline.jsx';
import LoginPage from './components/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import AdminPage from './components/AdminPage.jsx';
import DataIngestion from './components/DataIngestion.jsx';
import RenewalIntelligence from './components/RenewalIntelligence.jsx';
import RiskSignals from './components/RiskSignals.jsx';
import { AuthProvider, useAuth } from './auth/authContext.jsx';
import { PERMISSIONS } from './auth/permissions.js';

// ── Toast Context ──────────────────────────────────────────────
export const ToastContext = createContext({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const icons = { success: CheckCircle, error: AlertTriangle, info: Info };
  const colors = { success: 'border-emerald-400 bg-emerald-50 text-emerald-800', error: 'border-red-400 bg-red-50 text-red-800', info: 'border-teal-400 bg-teal-50 text-teal-800' };
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-xs w-full">
        {toasts.map(t => {
          const Icon = icons[t.type] || Info;
          return (
            <div key={t.id} className={`flex items-start gap-2 border-l-4 rounded-lg px-3 py-2.5 shadow-md text-xs font-medium ${colors[t.type] || colors.info}`}>
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}><X className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ── Nav Config ─────────────────────────────────────────────────
const NAV_BASE = [
  { section: 'MAIN', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/pipeline', icon: GitBranch, label: 'Renewal Pipeline' },
    { to: '/intelligence', icon: Zap, label: 'Renewal Intelligence' },
    { to: '/portfolio', icon: BarChart2, label: 'Portfolio Intelligence' },
  ]},
  { section: 'OPERATIONS', items: [
    { to: '/alerts', icon: AlertTriangle, label: 'Alerts', badge: 8 },
    { to: '/correspondence', icon: Mail, label: 'Correspondence' },
    { to: '/info-requests', icon: ClipboardList, label: 'Info Requests', badge: 6 },
  ]},
  { section: 'REPORTING & ADMIN', items: [
    { to: '/reports', icon: FileBarChart, label: 'Reports' },
    { to: '/data-integration', icon: Database, label: 'Data Integration', requirePermission: PERMISSIONS.MANAGE_IMPORTS },
    { to: '/admin', icon: Settings, label: 'Administration', requirePermission: PERMISSIONS.MANAGE_USERS },
    { to: '/profile', icon: User, label: 'Profile' },
  ]},
];

// ── Placeholder View ───────────────────────────────────────────
function Placeholder({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-teal-600" />
      </div>
      <h2 className="text-base font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────
const CRUMB_MAP = {
  '': 'Dashboard', pipeline: 'Renewal Pipeline', intelligence: 'Renewal Intelligence',
  portfolio: 'Portfolio Intelligence', alerts: 'Alerts', correspondence: 'Correspondence',
  'info-requests': 'Info Requests', reports: 'Reports', admin: 'Administration',
  'data-integration': 'Data Integration', profile: 'Profile', login: 'Login',
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 min-w-0 overflow-hidden">
      <span className="text-slate-400">SuretyIQ</span>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className={`truncate ${i === parts.length - 1 ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
            {CRUMB_MAP[p] || p}
          </span>
        </span>
      ))}
      {parts.length === 0 && <><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Dashboard</span></>}
    </nav>
  );
}

// ── Shell ──────────────────────────────────────────────────────
function Shell() {
  const [open, setOpen] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentUser, logout, hasPermission } = auth;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build initials from current user
  const initials = currentUser
    ? `${(currentUser.firstName || '')[0] || ''}${(currentUser.lastName || '')[0] || ''}`.toUpperCase()
    : '??';

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
    : 'Unknown User';

  const roleLabel = currentUser?.role || '';

  // Filter nav items based on permissions
  const filteredNav = NAV_BASE.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !item.requirePermission || hasPermission(item.requirePermission)
    ),
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar */}
      <aside className={`${open ? 'w-56' : 'w-14'} flex-shrink-0 flex flex-col bg-[#F8FAFC] border-r border-slate-200 transition-all duration-200 overflow-hidden`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-3.5 border-b border-slate-200 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {open && <span className="text-sm font-bold text-[#374151] truncate">SuretyIQ</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-3 px-2">
          {filteredNav.map(({ section, items }) => (
            <div key={section}>
              {open && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">{section}</p>}
              <ul className="space-y-0.5">
                {items.map(({ to, icon: Icon, label, badge, exact }) => (
                  <li key={to}>
                    <NavLink to={to} end={exact}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-semibold transition-colors group ${isActive ? 'bg-teal-600 text-white' : 'text-[#374151] hover:bg-slate-200'}`
                      }>
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-600'}`} />
                          {open && <span className="truncate flex-1">{label}</span>}
                          {open && badge ? <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{badge}</span> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout button at bottom of sidebar */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-3 border-t border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {open && <span>Sign Out</span>}
        </button>

        {/* Toggle */}
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center justify-center py-3 border-t border-slate-200 text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors">
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 gap-2 flex-shrink-0">
          <Breadcrumbs />
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate('/alerts')} className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">8</span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => navigate('/profile')}
                className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:bg-teal-700 transition-colors"
                title="View Profile"
              >
                {initials}
              </button>
              {open && (
                <div className="hidden sm:block min-w-0">
                  <p className="text-xs font-semibold text-slate-700 leading-tight truncate">{displayName}</p>
                  <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-bold">{roleLabel}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 min-w-0">
          <Routes>
            <Route path="/" element={<UnderwritingDashboard />} />
            <Route path="/pipeline" element={<RenewalPipeline onToast={addToast} />} />
            <Route path="/pipeline/:id" element={<RenewalPipeline onToast={addToast} />} />
            <Route path="/intelligence" element={<RenewalIntelligence />} />
            <Route path="/portfolio" element={<Placeholder icon={BarChart2} title="Portfolio Intelligence" description="Aggregate exposure analysis, hit rate trends, and concentration reports." />} />
            <Route path="/alerts" element={<RiskSignals />} />
            <Route path="/correspondence" element={<Placeholder icon={Mail} title="Correspondence" description="Inbound/outbound correspondence log and compose modal." />} />
            <Route path="/info-requests" element={<Placeholder icon={ClipboardList} title="Information Requests" description="IR tracker with status, due dates, and overdue flags." />} />
            <Route path="/reports" element={<Placeholder icon={FileBarChart} title="Reports" description="Underwriting and portfolio report generation." />} />
            <Route path="/data-integration" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_IMPORTS}>
                <DataIngestion />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ── Authenticated Shell Wrapper ────────────────────────────────
function AuthenticatedShell() {
  return (
    <ProtectedRoute>
      <Shell />
    </ProtectedRoute>
  );
}

// ── Root App ───────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AuthenticatedShell />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
