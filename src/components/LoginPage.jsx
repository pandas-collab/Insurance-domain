import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/authContext';

const DEMO_ACCOUNTS = [
  {
    label: 'Administrator',
    email: 'admin@suretycorp.com',
    password: 'Admin123!',
    badge: 'Admin',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    label: 'L2 Senior Underwriter',
    email: 'sarah.chen@suretycorp.com',
    password: 'Surety2026!',
    badge: 'L2 UW',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    label: 'L1 Underwriter',
    email: 'james.miller@suretycorp.com',
    password: 'Surety2026!',
    badge: 'L1 UW',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [filledAccount, setFilledAccount] = useState(null);

  // Detect session-expired or unauthorized redirect
  const params = new URLSearchParams(location.search);
  const reason = params.get('reason');
  const sessionExpired = reason === 'session' || reason === 'expired';
  const unauthorized = reason === 'unauthorized';

  // If already authenticated, redirect to home
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  const handleFillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setFilledAccount(account.label);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await auth.login(email.trim().toLowerCase(), password);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md">

        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0D9488] flex items-center justify-center shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">SuretyIQ</h1>
          <p className="text-sm text-[#6B7280] mt-1">AI Pre-Renewal Intelligence Platform</p>
        </div>

        {/* Session Expired / Unauthorized Notice */}
        {sessionExpired && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Your session has expired. Please sign in again to continue.
            </p>
          </div>
        )}
        {unauthorized && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">
              You do not have permission to access that page. Please sign in with an authorized account.
            </p>
          </div>
        )}

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] px-8 py-8">
          <h2 className="text-lg font-semibold text-[#111827] mb-1">Sign in to your account</h2>
          <p className="text-sm text-[#6B7280] mb-6">Enter your credentials to access the platform.</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@suretycorp.com"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D1D5DB] bg-white text-[#111827] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] transition"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#D1D5DB] bg-white text-[#111827] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0B8276] active:bg-[#0A7268] text-white font-semibold text-sm py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Panel */}
        <div className="mt-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] inline-block" />
              Demo Credentials — 3 test accounts available
            </span>
            {showDemo ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
          </button>

          {showDemo && (
            <div className="border-t border-[#F3F4F6] px-5 py-4 space-y-3">
              <p className="text-xs text-[#6B7280] mb-3">
                Click any account below to auto-fill credentials, then click <strong>Sign In</strong>.
              </p>
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="flex items-center justify-between bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] px-4 py-3 hover:border-[#0D9488] hover:bg-[#F0FDFA] transition cursor-pointer group"
                  onClick={() => handleFillDemo(account)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[#111827]">{account.label}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${account.badgeColor}`}>
                        {account.badge}
                      </span>
                      {filledAccount === account.label && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#0D9488]" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] font-mono truncate">{account.email}</p>
                    <p className="text-xs text-[#9CA3AF] font-mono">{account.password}</p>
                  </div>
                  <span className="ml-3 text-xs text-[#0D9488] font-medium opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    Fill →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          SuretyIQ &copy; {new Date().getFullYear()} &mdash; Enterprise Surety Intelligence Platform
        </p>
      </div>
    </div>
  );
}
