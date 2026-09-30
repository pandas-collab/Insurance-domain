// ── AuthContext & AuthProvider ──────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { validateCredentials, recordLogin, getUserById } from './mockUsers';
import { ROLE_PERMISSIONS } from './permissions';

const SESSION_KEY   = 'suretyiq_session';
const SESSION_TTL   = 8 * 60 * 60 * 1000; // 8 hours in ms

// ── Helpers ─────────────────────────────────────────────────────
function buildSession(user) {
  return {
    userId:    user.id,
    expiresAt: Date.now() + SESSION_TTL,
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.userId || !session?.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* storage full */ }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

// Strip sensitive fields before storing in React state
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

// ── Context ──────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  // 'session_expired' | 'unauthorized' | null
  const [sessionStatus, setSessionStatus] = useState(null);

  // ── Rehydrate session on mount ──────────────────────────────
  useEffect(() => {
    const session = loadSession();
    if (session) {
      const user = getUserById(session.userId);
      if (user && user.status === 'active') {
        setCurrentUser(sanitizeUser(user));
        setIsAuthenticated(true);
      } else {
        // User deactivated or not found — clear stale session
        clearSession();
        setSessionStatus('session_expired');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Session expiry watchdog (checks every 60 s) ─────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const session = loadSession();
      if (!session) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setSessionStatus('session_expired');
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ── login ────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // Simulate async network latency
    await new Promise(r => setTimeout(r, 600));

    const user = validateCredentials(email, password);
    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }
    if (user.status !== 'active') {
      return { success: false, error: 'Your account has been deactivated. Contact your administrator.' };
    }

    // Record login timestamp in the mock store
    recordLogin(user.id);

    const session = buildSession(user);
    saveSession(session);

    setCurrentUser(sanitizeUser(user));
    setIsAuthenticated(true);
    setSessionStatus(null);

    return { success: true, user: sanitizeUser(user) };
  }, []);

  // ── logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSessionStatus(null);
  }, []);

  // ── hasPermission ────────────────────────────────────────────
  const hasPermission = useCallback((permission) => {
    if (!currentUser?.role) return false;
    const perms = ROLE_PERMISSIONS[currentUser.role] || [];
    return perms.includes(permission);
  }, [currentUser]);

  // ── hasRole ──────────────────────────────────────────────────
  const hasRole = useCallback((role) => {
    if (!currentUser?.role) return false;
    if (Array.isArray(role)) return role.includes(currentUser.role);
    return currentUser.role === role;
  }, [currentUser]);

  // ── refreshCurrentUser ───────────────────────────────────────
  // Called after profile updates so React state stays in sync
  const refreshCurrentUser = useCallback(() => {
    if (!currentUser?.id) return;
    const fresh = getUserById(currentUser.id);
    if (fresh) setCurrentUser(sanitizeUser(fresh));
  }, [currentUser]);

  // ── Context value ────────────────────────────────────────────
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    sessionStatus,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ─────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Wrap your app with <AuthProvider>.');
  }
  return ctx;
}

export default AuthContext;
