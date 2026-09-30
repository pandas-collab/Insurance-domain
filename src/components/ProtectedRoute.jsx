import { Navigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../auth/authContext';

/**
 * ProtectedRoute
 *
 * Props:
 *   children          — JSX to render when access is granted
 *   requiredPermission — (optional) PERMISSIONS key string; if provided and the
 *                        current user lacks it, renders an Unauthorized card
 *                        instead of the children.
 */
export default function ProtectedRoute({ children, requiredPermission }) {
  const auth = useAuth();
  const location = useLocation();

  // ── 1. Loading state ────────────────────────────────────────────────────────
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-12 h-12 rounded-2xl bg-[#0D9488] flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin w-4 h-4 text-[#0D9488]"
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
            <span className="text-sm text-[#6B7280] font-medium">
              Verifying session…
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Not authenticated → redirect to /login ────────────────────────────
  if (!auth.isAuthenticated) {
    // Preserve the attempted path so we can redirect back after login (future)
    return (
      <Navigate
        to="/login?reason=session"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ── 3. Permission check ──────────────────────────────────────────────────
  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    return <UnauthorizedCard />;
  }

  // ── 4. Access granted ────────────────────────────────────────────────────
  return children;
}

// ── Unauthorized Card ────────────────────────────────────────────────────────
function UnauthorizedCard() {
  const { currentUser } = useAuth();

  const handleBack = () => {
    // Use history back; if no history, fall through to hash home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '/';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1F5F9] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-8 py-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
            <Lock className="w-8 h-8 text-red-500" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-[#111827] mb-2">
            Access Restricted
          </h2>

          {/* Message */}
          <p className="text-sm text-[#6B7280] mb-1 leading-relaxed">
            You do not have the required permissions to view this page.
          </p>
          {currentUser && (
            <p className="text-xs text-[#9CA3AF] mb-6">
              Signed in as{' '}
              <span className="font-medium text-[#374151]">
                {currentUser.firstName} {currentUser.lastName}
              </span>{' '}
              &mdash;{' '}
              <span className="font-medium text-[#374151]">
                {currentUser.role}
              </span>
            </p>
          )}

          {/* Role badge */}
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] text-xs font-medium px-3 py-1.5 rounded-full">
              <Shield className="w-3 h-3 text-[#0D9488]" />
              {currentUser?.role ?? 'Unknown Role'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-[#F3F4F6] mb-6" />

          {/* Help text */}
          <p className="text-xs text-[#9CA3AF] mb-6 leading-relaxed">
            If you believe this is an error, please contact your system
            administrator to request the appropriate access level.
          </p>

          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0B8276] active:bg-[#0A7268] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          SuretyIQ &mdash; Role-Based Access Control enforced
        </p>
      </div>
    </div>
  );
}
