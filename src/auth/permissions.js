// ── Permission Keys ────────────────────────────────────────────
export const PERMISSIONS = {
  // Renewal Operations
  VIEW_RENEWAL:    'VIEW_RENEWAL',
  EDIT_RENEWAL:    'EDIT_RENEWAL',
  ASSIGN_RENEWAL:  'ASSIGN_RENEWAL',
  APPROVE_RENEWAL: 'APPROVE_RENEWAL',
  REFER_RENEWAL:   'REFER_RENEWAL',

  // AI & Intelligence
  REVIEW_AI:       'REVIEW_AI',

  // Information & Correspondence
  REQUEST_INFO:    'REQUEST_INFO',

  // Portfolio
  VIEW_PORTFOLIO:  'VIEW_PORTFOLIO',

  // Administration
  MANAGE_USERS:    'MANAGE_USERS',
  MANAGE_ROLES:    'MANAGE_ROLES',
  VIEW_AUDIT:      'VIEW_AUDIT',
  MANAGE_IMPORTS:  'MANAGE_IMPORTS',
  MANAGE_RULES:    'MANAGE_RULES',
  MANAGE_SYSTEM:   'MANAGE_SYSTEM',
};

// ── Role → Permission Assignments ──────────────────────────────
export const ROLE_PERMISSIONS = {
  'Administrator': [
    PERMISSIONS.VIEW_RENEWAL,
    PERMISSIONS.EDIT_RENEWAL,
    PERMISSIONS.ASSIGN_RENEWAL,
    PERMISSIONS.APPROVE_RENEWAL,
    PERMISSIONS.REFER_RENEWAL,
    PERMISSIONS.REVIEW_AI,
    PERMISSIONS.REQUEST_INFO,
    PERMISSIONS.VIEW_PORTFOLIO,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_AUDIT,
    PERMISSIONS.MANAGE_IMPORTS,
    PERMISSIONS.MANAGE_RULES,
    PERMISSIONS.MANAGE_SYSTEM,
  ],
  'L2 Senior Underwriter': [
    PERMISSIONS.VIEW_RENEWAL,
    PERMISSIONS.EDIT_RENEWAL,
    PERMISSIONS.ASSIGN_RENEWAL,
    PERMISSIONS.APPROVE_RENEWAL,
    PERMISSIONS.REFER_RENEWAL,
    PERMISSIONS.REVIEW_AI,
    PERMISSIONS.REQUEST_INFO,
    PERMISSIONS.VIEW_PORTFOLIO,
    PERMISSIONS.VIEW_AUDIT,
  ],
  'L1 Underwriter': [
    PERMISSIONS.VIEW_RENEWAL,
    PERMISSIONS.EDIT_RENEWAL,
    PERMISSIONS.REFER_RENEWAL,
    PERMISSIONS.REVIEW_AI,
    PERMISSIONS.REQUEST_INFO,
    PERMISSIONS.VIEW_PORTFOLIO,
  ],
};

// ── Authority Levels Config (placeholder — thresholds configured by Admin) ──
export const AUTHORITY_LEVELS = {
  L1: {
    id: 'L1',
    label: 'L1 Underwriter',
    description: 'Entry-level underwriting authority. Refer decisions above configured thresholds.',
    thresholds: {}, // Populated via Admin > Authority Configuration
  },
  L2: {
    id: 'L2',
    label: 'L2 Senior Underwriter',
    description: 'Senior underwriting authority. Full approval within configured bond limits.',
    thresholds: {}, // Populated via Admin > Authority Configuration
  },
  ADMIN: {
    id: 'ADMIN',
    label: 'Administrator',
    description: 'System administrator. No underwriting authority limits apply.',
    thresholds: {},
  },
};

// ── Permission Metadata (for Admin UI display) ──────────────────
export const PERMISSION_METADATA = [
  // Renewals category
  { key: PERMISSIONS.VIEW_RENEWAL,    name: 'View Renewals',         category: 'Renewals',       description: 'View renewal cases and their details.' },
  { key: PERMISSIONS.EDIT_RENEWAL,    name: 'Edit Renewals',         category: 'Renewals',       description: 'Edit renewal case data and underwriting notes.' },
  { key: PERMISSIONS.ASSIGN_RENEWAL,  name: 'Assign Renewals',       category: 'Renewals',       description: 'Assign renewal cases to underwriters.' },
  { key: PERMISSIONS.APPROVE_RENEWAL, name: 'Approve Renewals',      category: 'Renewals',       description: 'Issue final approval decisions on renewals.' },
  { key: PERMISSIONS.REFER_RENEWAL,   name: 'Refer Renewals',        category: 'Renewals',       description: 'Refer renewal cases for senior review.' },
  // AI category
  { key: PERMISSIONS.REVIEW_AI,       name: 'Review AI Briefs',      category: 'AI & Intelligence', description: 'View, acknowledge, and override AI advisory briefs.' },
  // Information category
  { key: PERMISSIONS.REQUEST_INFO,    name: 'Request Information',   category: 'Information',    description: 'Create and manage information requests to principals.' },
  // Portfolio category
  { key: PERMISSIONS.VIEW_PORTFOLIO,  name: 'View Portfolio',        category: 'Portfolio',      description: 'Access portfolio intelligence and aggregate metrics.' },
  // Administration category
  { key: PERMISSIONS.MANAGE_USERS,    name: 'Manage Users',          category: 'Administration', description: 'Create, edit, and deactivate user accounts.' },
  { key: PERMISSIONS.MANAGE_ROLES,    name: 'Manage Roles',          category: 'Administration', description: 'View and configure role permission assignments.' },
  { key: PERMISSIONS.VIEW_AUDIT,      name: 'View Audit Log',        category: 'Administration', description: 'Access the full system audit trail.' },
  { key: PERMISSIONS.MANAGE_IMPORTS,  name: 'Manage Data Imports',   category: 'Administration', description: 'Upload and manage bulk data imports.' },
  { key: PERMISSIONS.MANAGE_RULES,    name: 'Manage Rules',          category: 'Administration', description: 'Configure underwriting rules and alert thresholds.' },
  { key: PERMISSIONS.MANAGE_SYSTEM,   name: 'System Configuration',  category: 'Administration', description: 'Access system-level settings and integrations.' },
];
