// ── Mock User Store (localStorage-backed) ──────────────────────
const STORE_KEY = 'suretyiq_users';

const SEED_USERS = [
  {
    id: 'usr_001',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@suretycorp.com',
    passwordHash: 'Admin123!',          // plain-text for mock only
    role: 'Administrator',
    assignedAuthorityLevel: 'ADMIN',
    status: 'active',
    notificationPreferences: { email: true, sms: false, inApp: true },
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'usr_002',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@suretycorp.com',
    passwordHash: 'Surety2026!',
    role: 'L2 Senior Underwriter',
    assignedAuthorityLevel: 'L2',
    status: 'active',
    notificationPreferences: { email: true, sms: true, inApp: true },
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: '2024-03-01T09:00:00.000Z',
  },
  {
    id: 'usr_003',
    firstName: 'James',
    lastName: 'Miller',
    email: 'james.miller@suretycorp.com',
    passwordHash: 'Surety2026!',
    role: 'L1 Underwriter',
    assignedAuthorityLevel: 'L1',
    status: 'active',
    notificationPreferences: { email: true, sms: false, inApp: true },
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-06-10T10:00:00.000Z',
  },
];

// ── Initialise store on first load ──────────────────────────────
function initStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return [...SEED_USERS];
  }
}

function saveStore(users) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(users));
  } catch { /* storage full — silently ignore */ }
}

// ── Public API ──────────────────────────────────────────────────
export function getUsers() {
  return initStore();
}

export function getUserById(id) {
  return initStore().find(u => u.id === id) || null;
}

export function getUserByEmail(email) {
  return initStore().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function validateCredentials(email, password) {
  const user = getUserByEmail(email);
  if (!user) return null;
  if (user.status !== 'active') return null;
  if (user.passwordHash !== password) return null;
  return user;
}

export function createUser(userData) {
  const users = initStore();
  const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) throw new Error('A user with this email already exists.');

  const newUser = {
    id: `usr_${Date.now()}`,
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email,
    passwordHash: userData.password || 'Surety2026!',
    role: userData.role || 'L1 Underwriter',
    assignedAuthorityLevel: userData.assignedAuthorityLevel || 'L1',
    status: 'active',
    notificationPreferences: { email: true, sms: false, inApp: true },
    lastLogin: null,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveStore(users);
  return newUser;
}

export function updateUser(id, changes) {
  const users = initStore();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found.');
  // Never allow direct passwordHash override via this path unless explicitly set
  const { password, ...safeChanges } = changes;
  if (password) safeChanges.passwordHash = password;
  users[idx] = { ...users[idx], ...safeChanges };
  saveStore(users);
  return users[idx];
}

export function deactivateUser(id) {
  return updateUser(id, { status: 'inactive' });
}

export function activateUser(id) {
  return updateUser(id, { status: 'active' });
}

export function recordLogin(id) {
  return updateUser(id, { lastLogin: new Date().toISOString() });
}
