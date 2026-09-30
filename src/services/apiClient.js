// ─── Unified API Client ───────────────────────────────────────────────────────
// PROTOTYPE mode: all data lives in localStorage with simulated latency.
// FULLSTACK mode: swap BASE_URL to '/api' and every call routes to Express/FastAPI.

const LATENCY = 120; // ms
const delay = (ms = LATENCY) => new Promise(r => setTimeout(r, ms));

// ─── localStorage helpers ─────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Seed data ────────────────────────────────────────────────────────────────
// NOTE: All cases use `premiumAmount` (not `premium`) to match component expectations.
const SEED_CASES = [
  {
    id: 'C-1001', principalName: 'Apex Construction LLC', obligeeName: 'City of Denver',
    bondType: 'Performance Bond', bondPenalty: 4200000, premiumAmount: 42000,
    effectiveDate: '2025-09-15', expiryDate: '2026-10-01', daysToExpiry: 18,
    status: 'AI Brief Ready', riskScore: 72, naicsCode: '2361',
    uwAssigned: 'Sarah Chen', region: 'Mountain West',
    financialStrength: 'A-', workInProgress: 8200000, backlog: 12400000,
    creditScore: 710, yearsInBusiness: 14, claimsHistory: 0,
    riskSignals: ['WIP Concentration', 'Expiry Imminent'],
    aiRecommendation: 'Renew with Conditions',
  },
  {
    id: 'C-1002', principalName: 'Meridian Mechanical Inc.', obligeeName: 'State of Texas DOT',
    bondType: 'Payment Bond', bondPenalty: 2750000, premiumAmount: 27500,
    effectiveDate: '2025-10-01', expiryDate: '2026-10-28', daysToExpiry: 45,
    status: 'Pending IR', riskScore: 58, naicsCode: '2382',
    uwAssigned: 'James Park', region: 'South Central',
    financialStrength: 'BBB+', workInProgress: 5100000, backlog: 7800000,
    creditScore: 680, yearsInBusiness: 9, claimsHistory: 1,
    riskSignals: ['IR Overdue'],
    aiRecommendation: 'Pending Review',
  },
  {
    id: 'C-1003', principalName: 'Summit Electrical Services', obligeeName: 'Clark County NV',
    bondType: 'Subdivision Bond', bondPenalty: 1850000, premiumAmount: 18500,
    effectiveDate: '2025-08-20', expiryDate: '2026-11-15', daysToExpiry: 63,
    status: 'In Review', riskScore: 44, naicsCode: '2381',
    uwAssigned: 'Sarah Chen', region: 'Pacific West',
    financialStrength: 'A', workInProgress: 3400000, backlog: 5200000,
    creditScore: 740, yearsInBusiness: 22, claimsHistory: 0,
    riskSignals: [],
    aiRecommendation: 'Renew Standard',
  },
  {
    id: 'C-1004', principalName: 'Ironclad Paving Co.', obligeeName: 'MDOT',
    bondType: 'Performance Bond', bondPenalty: 6100000, premiumAmount: 61000,
    effectiveDate: '2025-07-01', expiryDate: '2026-09-25', daysToExpiry: 12,
    status: 'AI Brief Ready', riskScore: 81, naicsCode: '2373',
    uwAssigned: 'Marcus Webb', region: 'Great Lakes',
    financialStrength: 'BB', workInProgress: 14200000, backlog: 9800000,
    creditScore: 655, yearsInBusiness: 7, claimsHistory: 2,
    riskSignals: ['Revenue Decline', 'Negative Working Capital', 'Claims History'],
    aiRecommendation: 'Decline',
  },
  {
    id: 'C-1005', principalName: 'BlueSky Roofing & Restoration', obligeeName: 'Maricopa County AZ',
    bondType: 'Maintenance Bond', bondPenalty: 980000, premiumAmount: 9800,
    effectiveDate: '2025-11-01', expiryDate: '2026-12-10', daysToExpiry: 88,
    status: 'New', riskScore: 35, naicsCode: '2383',
    uwAssigned: 'James Park', region: 'Southwest',
    financialStrength: 'A+', workInProgress: 1800000, backlog: 3100000,
    creditScore: 775, yearsInBusiness: 31, claimsHistory: 0,
    riskSignals: [],
    aiRecommendation: 'Renew Standard',
  },
  {
    id: 'C-1006', principalName: 'Cascade Bridge Builders', obligeeName: 'WSDOT',
    bondType: 'Performance Bond', bondPenalty: 9500000, premiumAmount: 95000,
    effectiveDate: '2025-06-15', expiryDate: '2026-10-05', daysToExpiry: 22,
    status: 'Decision Made', riskScore: 66, naicsCode: '2371',
    uwAssigned: 'Sarah Chen', region: 'Pacific Northwest',
    financialStrength: 'A-', workInProgress: 22000000, backlog: 18500000,
    creditScore: 720, yearsInBusiness: 18, claimsHistory: 1,
    riskSignals: ['Active Claim'],
    aiRecommendation: 'Renew with Conditions',
  },
  {
    id: 'C-1007', principalName: 'Granite State Utilities', obligeeName: 'NH PUC',
    bondType: 'License & Permit Bond', bondPenalty: 500000, premiumAmount: 5000,
    effectiveDate: '2025-12-01', expiryDate: '2026-11-30', daysToExpiry: 78,
    status: 'Bound', riskScore: 28, naicsCode: '2211',
    uwAssigned: 'Marcus Webb', region: 'New England',
    financialStrength: 'AA-', workInProgress: 900000, backlog: 1400000,
    creditScore: 800, yearsInBusiness: 45, claimsHistory: 0,
    riskSignals: [],
    aiRecommendation: 'Renew Standard',
  },
  {
    id: 'C-1008', principalName: 'Vanguard Site Development', obligeeName: 'Fulton County GA',
    bondType: 'Subdivision Bond', bondPenalty: 3300000, premiumAmount: 33000,
    effectiveDate: '2025-09-01', expiryDate: '2026-10-20', daysToExpiry: 37,
    status: 'Pending IR', riskScore: 63, naicsCode: '2372',
    uwAssigned: 'James Park', region: 'Southeast',
    financialStrength: 'BBB', workInProgress: 7600000, backlog: 6200000,
    creditScore: 695, yearsInBusiness: 11, claimsHistory: 1,
    riskSignals: ['WIP/Equity Ratio'],
    aiRecommendation: 'Pending Review',
  },
];

const SEED_ALERTS = [
  { id: 'A-001', caseId: 'C-1004', severity: 'Critical', type: 'Financial Deterioration',
    message: 'Ironclad Paving Co. Q2 financials show 34% revenue decline and negative working capital. Immediate review required.',
    timestamp: '2026-09-10T08:15:00Z', acknowledged: false },
  { id: 'A-002', caseId: 'C-1001', severity: 'High', type: 'Expiry Imminent',
    message: 'Apex Construction LLC bond expires in 18 days. No renewal submission received from broker.',
    timestamp: '2026-09-10T09:30:00Z', acknowledged: false },
  { id: 'A-003', caseId: 'C-1006', severity: 'High', type: 'Claims Activity',
    message: 'Cascade Bridge Builders: 1 new claim filed by WSDOT for $420K. Legal review initiated.',
    timestamp: '2026-09-09T14:00:00Z', acknowledged: false },
  { id: 'A-004', caseId: 'C-1002', severity: 'Medium', type: 'Info Request Overdue',
    message: 'Meridian Mechanical Inc. IR for updated financials is 12 days overdue. Broker follow-up needed.',
    timestamp: '2026-09-09T11:00:00Z', acknowledged: false },
  { id: 'A-005', caseId: 'C-1008', severity: 'Medium', type: 'Capacity Threshold',
    message: 'Vanguard Site Development WIP-to-equity ratio exceeds 3.5x threshold. Capacity review recommended.',
    timestamp: '2026-09-08T16:45:00Z', acknowledged: true },
];

// Seed risk signals data
const SEED_RISK_SIGNALS = [
  {
    id: 'S-001',
    caseId: 'C-1004',
    type: 'revenue_decline',
    severity: 'Critical',
    title: 'Revenue Decline',
    message: 'Q2 revenue declined 34% year-over-year',
    previousValue: '$4.2M',
    currentValue: '$2.8M',
    difference: '-$1.4M',
    percentageChange: -34,
    effectiveDate: '2026-06-30',
    source: 'Financial Statement',
    detectedAt: '2026-09-10T08:15:00Z',
    status: 'Active',
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null,
    ruleVersion: 'v1.0',
  },
  {
    id: 'S-002',
    caseId: 'C-1004',
    type: 'negative_working_capital',
    severity: 'Critical',
    title: 'Negative Working Capital',
    message: 'Working capital is now negative at -$280K',
    previousValue: '$180K',
    currentValue: '-$280K',
    difference: '-$460K',
    percentageChange: -256,
    effectiveDate: '2026-06-30',
    source: 'Financial Statement',
    detectedAt: '2026-09-10T08:15:00Z',
    status: 'Active',
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null,
    ruleVersion: 'v1.0',
  },
  {
    id: 'S-003',
    caseId: 'C-1001',
    type: 'wip_concentration',
    severity: 'High',
    title: 'WIP Concentration',
    message: '62% of backlog concentrated in single Denver contract',
    previousValue: '45%',
    currentValue: '62%',
    difference: '+17%',
    percentageChange: 38,
    effectiveDate: '2026-09-01',
    source: 'Backlog Report',
    detectedAt: '2026-09-10T09:30:00Z',
    status: 'Active',
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null,
    ruleVersion: 'v1.0',
  },
  {
    id: 'S-004',
    caseId: 'C-1006',
    type: 'new_claim',
    severity: 'High',
    title: 'New Claim Filed',
    message: 'WSDOT filed $420K claim for project delays',
    previousValue: '0',
    currentValue: '1',
    difference: '+1',
    percentageChange: 100,
    effectiveDate: '2026-09-09',
    source: 'Claims System',
    detectedAt: '2026-09-09T14:00:00Z',
    status: 'Active',
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null,
    ruleVersion: 'v1.0',
  },
  {
    id: 'S-005',
    caseId: 'C-1008',
    type: 'wip_equity_ratio',
    severity: 'Medium',
    title: 'WIP/Equity Ratio Exceeded',
    message: 'WIP-to-equity ratio of 3.5x exceeds threshold',
    previousValue: '2.8x',
    currentValue: '3.5x',
    difference: '+0.7x',
    percentageChange: 25,
    effectiveDate: '2026-09-08',
    source: 'Financial Statement',
    detectedAt: '2026-09-08T16:45:00Z',
    status: 'Acknowledged',
    acknowledged: true,
    acknowledgedBy: 'James Park',
    acknowledgedAt: '2026-09-08T17:30:00Z',
    resolvedAt: null,
    ruleVersion: 'v1.0',
  },
];

// NOTE: All advisories use `confidenceScore`, `uwAcknowledged`, `riskFactors[].signal`, `positiveFactors[]`
const SEED_AI_ADVISORIES = {
  'C-1001': {
    summary: 'Apex Construction LLC presents a moderate-high risk profile. Strong 14-year track record offset by elevated WIP concentration in a single municipal contract (62% of backlog). Recommend renewal with enhanced monitoring covenants.',
    riskFactors: [
      { factor: 'WIP Concentration', severity: 'High', signal: '62% of backlog in single Denver contract' },
      { factor: 'Liquidity Ratio', severity: 'Medium', signal: 'Current ratio 1.4x, below 1.6x threshold' },
      { factor: 'Claims History', severity: 'Low', signal: 'Zero claims in 14-year history' },
    ],
    positiveFactors: [
      { factor: 'Tenure', signal: '14-year relationship with zero prior claims' },
      { factor: 'Financial Rating', signal: 'A- financial strength rating maintained' },
    ],
    recommendation: 'Renew with Conditions',
    suggestedPremium: 44100,
    suggestedLimit: 4200000,
    confidenceScore: 84,
    generatedAt: '2026-09-10T07:00:00Z',
    uwAcknowledged: false,
  },
  'C-1004': {
    summary: 'Ironclad Paving Co. exhibits significant financial stress. Q2 revenue decline of 34%, negative working capital, and 2 prior claims create a high-risk renewal scenario. Decline or substantially reduce exposure.',
    riskFactors: [
      { factor: 'Revenue Decline', severity: 'Critical', signal: '34% YoY decline in Q2 2026' },
      { factor: 'Working Capital', severity: 'Critical', signal: 'Negative working capital: -$280K' },
      { factor: 'Claims History', severity: 'High', signal: '2 prior claims totaling $890K' },
      { factor: 'Backlog Coverage', severity: 'Medium', signal: 'Backlog down 22% from prior year' },
    ],
    positiveFactors: [
      { factor: 'Established Operation', signal: '7 years in business with regional presence' },
    ],
    recommendation: 'Decline',
    suggestedPremium: 0,
    suggestedLimit: 0,
    confidenceScore: 91,
    generatedAt: '2026-09-10T06:30:00Z',
    uwAcknowledged: false,
  },
  'C-1003': {
    summary: 'Summit Electrical Services is a strong renewal candidate. 22-year operating history, clean claims record, and improving financial metrics. Standard renewal terms recommended.',
    riskFactors: [
      { factor: 'Financial Strength', severity: 'Low', signal: 'A-rated, improving margins' },
      { factor: 'Claims History', severity: 'Low', signal: 'Zero claims in 22-year history' },
    ],
    positiveFactors: [
      { factor: 'Long Tenure', signal: '22-year operating history with clean record' },
      { factor: 'Credit Profile', signal: 'Credit score 740, well above threshold' },
      { factor: 'Backlog Health', signal: 'Backlog $5.2M with diversified contracts' },
    ],
    recommendation: 'Renew Standard',
    suggestedPremium: 18500,
    suggestedLimit: 1850000,
    confidenceScore: 93,
    generatedAt: '2026-09-09T08:00:00Z',
    uwAcknowledged: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RISK SIGNAL ENGINE — Deterministic Change Detection & Signal Management
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Signal Severity Levels ───────────────────────────────────────────────────
export const SIGNAL_SEVERITY = {
  INFORMATIONAL: 'Informational',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const SIGNAL_SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

export const SIGNAL_SEVERITY_CONFIG = {
  Informational: { color: 'gray', value: 1, badgeClass: 'bg-gray-100 text-gray-800 border-gray-200' },
  Low: { color: 'blue', value: 2, badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  Medium: { color: 'amber', value: 3, badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  High: { color: 'red', value: 4, badgeClass: 'bg-red-100 text-red-800 border-red-200' },
  Critical: { color: 'darkred', value: 5, badgeClass: 'bg-red-900 text-white border-red-800' },
};

// ─── Signal Types & Configurable Rules ────────────────────────────────────────
export const SIGNAL_TYPES = {
  NEW_CLAIM: 'new_claim',
  CLAIM_AMOUNT_CHANGE: 'claim_amount_change',
  ADTF_INCREASE: 'adtf_increase',
  ADTF_DECREASE: 'adtf_decrease',
  COLLATERAL_CHANGE: 'collateral_change',
  COLLATERAL_DECREASE: 'collateral_decrease',
  OPEN_EXPOSURE_CHANGE: 'open_exposure_change',
  PREMIUM_CHANGE: 'premium_change',
  ADD_CVD_ACTIVITY: 'add_cvd_activity',
  ENTRY_ACTIVITY_CHANGE: 'entry_activity_change',
  EXTENDED_SUSPENDED_ENTRIES: 'extended_suspended_entries',
  FINANCIAL_STRENGTH_CHANGE: 'financial_strength_change',
  CREDIT_SCORE_CHANGE: 'credit_score_change',
  WIP_CHANGE: 'wip_change',
  BACKLOG_CHANGE: 'backlog_change',
  EXPIRY_IMMINENT: 'expiry_imminent',
};

// Configurable threshold rules for signal detection
export const DEFAULT_SIGNAL_RULES = {
  [SIGNAL_TYPES.NEW_CLAIM]: {
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'New claim detected',
    thresholdType: 'count',
    threshold: 1,
  },
  [SIGNAL_TYPES.CLAIM_AMOUNT_CHANGE]: {
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Claim amount changed',
    thresholdType: 'percentage',
    threshold: 10,
  },
  [SIGNAL_TYPES.ADTF_INCREASE]: {
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'ADTF increased',
    thresholdType: 'percentage',
    threshold: 15,
  },
  [SIGNAL_TYPES.ADTF_DECREASE]: {
    severity: SIGNAL_SEVERITY.LOW,
    description: 'ADTF decreased',
    thresholdType: 'percentage',
    threshold: 15,
  },
  [SIGNAL_TYPES.COLLATERAL_CHANGE]: {
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Collateral value changed',
    thresholdType: 'percentage',
    threshold: 20,
  },
  [SIGNAL_TYPES.COLLATERAL_DECREASE]: {
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'Collateral value decreased',
    thresholdType: 'percentage',
    threshold: 10,
  },
  [SIGNAL_TYPES.OPEN_EXPOSURE_CHANGE]: {
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Open exposure changed',
    thresholdType: 'percentage',
    threshold: 25,
  },
  [SIGNAL_TYPES.PREMIUM_CHANGE]: {
    severity: SIGNAL_SEVERITY.LOW,
    description: 'Premium amount changed',
    thresholdType: 'percentage',
    threshold: 10,
  },
  [SIGNAL_TYPES.ADD_CVD_ACTIVITY]: {
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'ADD/CVD activity detected',
    thresholdType: 'count',
    threshold: 1,
  },
  [SIGNAL_TYPES.ENTRY_ACTIVITY_CHANGE]: {
    severity: SIGNAL_SEVERITY.LOW,
    description: 'Entry activity changed',
    thresholdType: 'count',
    threshold: 5,
  },
  [SIGNAL_TYPES.EXTENDED_SUSPENDED_ENTRIES]: {
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Extended or suspended entries detected',
    thresholdType: 'count',
    threshold: 1,
  },
  [SIGNAL_TYPES.FINANCIAL_STRENGTH_CHANGE]: {
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'Financial strength rating changed',
    thresholdType: 'grade',
    threshold: 1,
  },
  [SIGNAL_TYPES.CREDIT_SCORE_CHANGE]: {
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Credit score changed significantly',
    thresholdType: 'points',
    threshold: 50,
  },
  [SIGNAL_TYPES.WIP_CHANGE]: {
    severity: SIGNAL_SEVERITY.LOW,
    description: 'Work in progress changed',
    thresholdType: 'percentage',
    threshold: 20,
  },
  [SIGNAL_TYPES.BACKLOG_CHANGE]: {
    severity: SIGNAL_SEVERITY.LOW,
    description: 'Backlog changed',
    thresholdType: 'percentage',
    threshold: 20,
  },
  [SIGNAL_TYPES.EXPIRY_IMMINENT]: {
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'Bond expiry imminent',
    thresholdType: 'days',
    threshold: 30,
  },
};

// ─── Signal Status ────────────────────────────────────────────────────────────
export const SIGNAL_STATUS = {
  ACTIVE: 'Active',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
  SUPPRESSED: 'Suppressed',
};

// ─── Signal Storage Keys ─────────────────────────────────────────────────────
const SIGNALS_KEY = 'uw_risk_signals';
const SIGNAL_HISTORY_KEY = 'uw_signal_history';
const SIGNAL_RULES_KEY = 'uw_signal_rules';
const SIGNAL_PROCESSED_KEY = 'uw_signal_processed_snapshots';

// ─── Signal Rule Management ───────────────────────────────────────────────────
export async function getSignalRules() {
  ensureSeeded();
  await delay();
  return lsGet(SIGNAL_RULES_KEY, DEFAULT_SIGNAL_RULES);
}

export async function updateSignalRules(rules) {
  ensureSeeded();
  await delay();
  lsSet(SIGNAL_RULES_KEY, { ...DEFAULT_SIGNAL_RULES, ...rules });
  return lsGet(SIGNAL_RULES_KEY, DEFAULT_SIGNAL_RULES);
}

// ─── Signal Detection Engine ──────────────────────────────────────────────────
function _calculateSeverity(severity, percentageChange, rules) {
  // Dynamic severity escalation based on magnitude of change
  if (percentageChange >= 100) return SIGNAL_SEVERITY.CRITICAL;
  if (percentageChange >= 50) return SIGNAL_SEVERITY.HIGH;
  return severity;
}

function _formatCurrency(value) {
  if (value === null || value === undefined) return 'N/A';
  return `$${Number(value).toLocaleString()}`;
}

function _formatNumber(value) {
  if (value === null || value === undefined) return 'N/A';
  return Number(value).toLocaleString();
}

function _calculatePercentageChange(oldVal, newVal) {
  const oldNum = Number(oldVal) || 0;
  const newNum = Number(newVal) || 0;
  if (oldNum === 0) return newNum > 0 ? 100 : 0;
  return ((newNum - oldNum) / oldNum) * 100;
}

function _generateSignalId(caseId, type, timestamp) {
  return `SIG-${caseId}-${type}-${timestamp}`;
}

function _getProcessedSnapshotKey(caseId) {
  return `${SIGNAL_PROCESSED_KEY}_${caseId}`;
}

function _hasSnapshotChanged(caseId, currentSnapshot) {
  const processedKey = _getProcessedSnapshotKey(caseId);
  const lastProcessed = lsGet(processedKey, null);
  if (!lastProcessed) return true;
  
  // Compare key fields to detect changes
  const keyFields = ['claimsHistory', 'creditScore', 'workInProgress', 'backlog', 
                     'bondPenalty', 'premiumAmount', 'financialStrength', 'daysToExpiry'];
  
  for (const field of keyFields) {
    if (currentSnapshot[field] !== lastProcessed[field]) return true;
  }
  return false;
}

function _saveProcessedSnapshot(caseId, snapshot) {
  const processedKey = _getProcessedSnapshotKey(caseId);
  lsSet(processedKey, {
    claimsHistory: snapshot.claimsHistory,
    creditScore: snapshot.creditScore,
    workInProgress: snapshot.workInProgress,
    backlog: snapshot.backlog,
    bondPenalty: snapshot.bondPenalty,
    premiumAmount: snapshot.premiumAmount,
    financialStrength: snapshot.financialStrength,
    daysToExpiry: snapshot.daysToExpiry,
    processedAt: new Date().toISOString(),
  });
}

// ─── Signal Detection Logic ───────────────────────────────────────────────────
function _detectSignals(currentCase, previousSnapshot, rules) {
  const signals = [];
  const timestamp = Date.now();
  
  if (!previousSnapshot) {
    // First time processing - no comparison possible
    return signals;
  }
  
  // 1. New Claim Detection
  if (currentCase.claimsHistory > (previousSnapshot.claimsHistory || 0)) {
    const rule = rules[SIGNAL_TYPES.NEW_CLAIM] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.NEW_CLAIM];
    const newClaims = currentCase.claimsHistory - (previousSnapshot.claimsHistory || 0);
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.NEW_CLAIM, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.NEW_CLAIM,
      typeLabel: 'New Claim',
      severity: rule.severity,
      description: `${newClaims} new claim(s) detected`,
      previousValue: previousSnapshot.claimsHistory || 0,
      currentValue: currentCase.claimsHistory,
      difference: newClaims,
      percentageChange: null,
      effectiveDate: currentCase.effectiveDate,
      source: 'Claims History',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 2. ADTF (Average DTF) Change Detection
  const currentAdtf = currentCase.riskScore ? (currentCase.riskScore * 0.8).toFixed(1) : 0;
  const prevAdtf = previousSnapshot.riskScore ? (previousSnapshot.riskScore * 0.8).toFixed(1) : 0;
  const adtfChange = _calculatePercentageChange(prevAdtf, currentAdtf);
  
  if (Math.abs(adtfChange) >= 15) {
    const isIncrease = adtfChange > 0;
    const rule = isIncrease 
      ? (rules[SIGNAL_TYPES.ADTF_INCREASE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.ADTF_INCREASE])
      : (rules[SIGNAL_TYPES.ADTF_DECREASE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.ADTF_DECREASE]);
    
    signals.push({
      id: _generateSignalId(currentCase.id, isIncrease ? SIGNAL_TYPES.ADTF_INCREASE : SIGNAL_TYPES.ADTF_DECREASE, timestamp),
      caseId: currentCase.id,
      type: isIncrease ? SIGNAL_TYPES.ADTF_INCREASE : SIGNAL_TYPES.ADTF_DECREASE,
      typeLabel: isIncrease ? 'ADTF Increase' : 'ADTF Decrease',
      severity: _calculateSeverity(rule.severity, Math.abs(adtfChange), rules),
      description: `ADTF ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(adtfChange).toFixed(1)}%`,
      previousValue: prevAdtf,
      currentValue: currentAdtf,
      difference: (currentAdtf - prevAdtf).toFixed(1),
      percentageChange: adtfChange.toFixed(1),
      effectiveDate: currentCase.effectiveDate,
      source: 'Risk Score Calculation',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 3. Collateral Change Detection (simulated via financial strength proxy)
  if (currentCase.financialStrength !== previousSnapshot.financialStrength) {
    const rule = rules[SIGNAL_TYPES.FINANCIAL_STRENGTH_CHANGE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.FINANCIAL_STRENGTH_CHANGE];
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.FINANCIAL_STRENGTH_CHANGE, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.FINANCIAL_STRENGTH_CHANGE,
      typeLabel: 'Financial Strength Change',
      severity: rule.severity,
      description: `Financial strength changed from ${previousSnapshot.financialStrength || 'N/A'} to ${currentCase.financialStrength || 'N/A'}`,
      previousValue: previousSnapshot.financialStrength || 'N/A',
      currentValue: currentCase.financialStrength || 'N/A',
      difference: null,
      percentageChange: null,
      effectiveDate: currentCase.effectiveDate,
      source: 'Financial Rating',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 4. Credit Score Change Detection
  const creditChange = (currentCase.creditScore || 0) - (previousSnapshot.creditScore || 0);
  if (Math.abs(creditChange) >= 50) {
    const rule = rules[SIGNAL_TYPES.CREDIT_SCORE_CHANGE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.CREDIT_SCORE_CHANGE];
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.CREDIT_SCORE_CHANGE, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.CREDIT_SCORE_CHANGE,
      typeLabel: 'Credit Score Change',
      severity: creditChange < 0 ? SIGNAL_SEVERITY.HIGH : SIGNAL_SEVERITY.LOW,
      description: `Credit score ${creditChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(creditChange)} points`,
      previousValue: previousSnapshot.creditScore || 0,
      currentValue: currentCase.creditScore || 0,
      difference: creditChange,
      percentageChange: null,
      effectiveDate: currentCase.effectiveDate,
      source: 'Credit Bureau',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 5. Work In Progress Change
  const wipChange = _calculatePercentageChange(previousSnapshot.workInProgress, currentCase.workInProgress);
  if (Math.abs(wipChange) >= 20) {
    const rule = rules[SIGNAL_TYPES.WIP_CHANGE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.WIP_CHANGE];
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.WIP_CHANGE, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.WIP_CHANGE,
      typeLabel: 'WIP Change',
      severity: _calculateSeverity(rule.severity, Math.abs(wipChange), rules),
      description: `Work in progress ${wipChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(wipChange).toFixed(1)}%`,
      previousValue: _formatCurrency(previousSnapshot.workInProgress),
      currentValue: _formatCurrency(currentCase.workInProgress),
      difference: _formatCurrency(currentCase.workInProgress - (previousSnapshot.workInProgress || 0)),
      percentageChange: wipChange.toFixed(1),
      effectiveDate: currentCase.effectiveDate,
      source: 'Financial Data',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 6. Backlog Change
  const backlogChange = _calculatePercentageChange(previousSnapshot.backlog, currentCase.backlog);
  if (Math.abs(backlogChange) >= 20) {
    const rule = rules[SIGNAL_TYPES.BACKLOG_CHANGE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.BACKLOG_CHANGE];
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.BACKLOG_CHANGE, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.BACKLOG_CHANGE,
      typeLabel: 'Backlog Change',
      severity: _calculateSeverity(rule.severity, Math.abs(backlogChange), rules),
      description: `Backlog ${backlogChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(backlogChange).toFixed(1)}%`,
      previousValue: _formatCurrency(previousSnapshot.backlog),
      currentValue: _formatCurrency(currentCase.backlog),
      difference: _formatCurrency(currentCase.backlog - (previousSnapshot.backlog || 0)),
      percentageChange: backlogChange.toFixed(1),
      effectiveDate: currentCase.effectiveDate,
      source: 'Financial Data',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 7. Premium Change
  const premiumChange = _calculatePercentageChange(previousSnapshot.premiumAmount, currentCase.premiumAmount);
  if (Math.abs(premiumChange) >= 10) {
    const rule = rules[SIGNAL_TYPES.PREMIUM_CHANGE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.PREMIUM_CHANGE];
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.PREMIUM_CHANGE, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.PREMIUM_CHANGE,
      typeLabel: 'Premium Change',
      severity: _calculateSeverity(rule.severity, Math.abs(premiumChange), rules),
      description: `Premium ${premiumChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(premiumChange).toFixed(1)}%`,
      previousValue: _formatCurrency(previousSnapshot.premiumAmount),
      currentValue: _formatCurrency(currentCase.premiumAmount),
      difference: _formatCurrency(currentCase.premiumAmount - (previousSnapshot.premiumAmount || 0)),
      percentageChange: premiumChange.toFixed(1),
      effectiveDate: currentCase.effectiveDate,
      source: 'Policy Data',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 8. Open Exposure Change
  const exposureChange = _calculatePercentageChange(previousSnapshot.bondPenalty, currentCase.bondPenalty);
  if (Math.abs(exposureChange) >= 25) {
    const rule = rules[SIGNAL_TYPES.OPEN_EXPOSURE_CHANGE] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.OPEN_EXPOSURE_CHANGE];
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.OPEN_EXPOSURE_CHANGE, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.OPEN_EXPOSURE_CHANGE,
      typeLabel: 'Open Exposure Change',
      severity: _calculateSeverity(rule.severity, Math.abs(exposureChange), rules),
      description: `Open exposure ${exposureChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(exposureChange).toFixed(1)}%`,
      previousValue: _formatCurrency(previousSnapshot.bondPenalty),
      currentValue: _formatCurrency(currentCase.bondPenalty),
      difference: _formatCurrency(currentCase.bondPenalty - (previousSnapshot.bondPenalty || 0)),
      percentageChange: exposureChange.toFixed(1),
      effectiveDate: currentCase.effectiveDate,
      source: 'Bond Data',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  // 9. Expiry Imminent
  if (currentCase.daysToExpiry <= 30 && currentCase.daysToExpiry > 0) {
    const rule = rules[SIGNAL_TYPES.EXPIRY_IMMINENT] || DEFAULT_SIGNAL_RULES[SIGNAL_TYPES.EXPIRY_IMMINENT];
    const severity = currentCase.daysToExpiry <= 7 ? SIGNAL_SEVERITY.CRITICAL : 
                     currentCase.daysToExpiry <= 14 ? SIGNAL_SEVERITY.HIGH : rule.severity;
    
    signals.push({
      id: _generateSignalId(currentCase.id, SIGNAL_TYPES.EXPIRY_IMMINENT, timestamp),
      caseId: currentCase.id,
      type: SIGNAL_TYPES.EXPIRY_IMMINENT,
      typeLabel: 'Expiry Imminent',
      severity: severity,
      description: `Bond expires in ${currentCase.daysToExpiry} days`,
      previousValue: null,
      currentValue: currentCase.daysToExpiry,
      difference: null,
      percentageChange: null,
      effectiveDate: currentCase.expiryDate,
      source: 'Policy Data',
      detectionTimestamp: new Date().toISOString(),
      ruleVersion: '1.0',
      status: SIGNAL_STATUS.ACTIVE,
      acknowledgedBy: null,
      acknowledgedAt: null,
    });
  }
  
  return signals;
}

// ─── Signal API Functions ─────────────────────────────────────────────────────
export async function getSignals(filters = {}) {
  ensureSeeded();
  await delay();
  let signals = lsGet(SIGNALS_KEY, []);
  
  if (filters.caseId) signals = signals.filter(s => s.caseId === filters.caseId);
  if (filters.severity) signals = signals.filter(s => s.severity === filters.severity);
  if (filters.type) signals = signals.filter(s => s.type === filters.type);
  if (filters.status) signals = signals.filter(s => s.status === filters.status);
  if (filters.activeOnly) signals = signals.filter(s => s.status === SIGNAL_STATUS.ACTIVE);
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    signals = signals.filter(s => new Date(s.detectionTimestamp) >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    signals = signals.filter(s => new Date(s.detectionTimestamp) <= toDate);
  }
  
  // Sort by severity (highest first) then by detection timestamp (newest first)
  signals.sort((a, b) => {
    const severityDiff = SIGNAL_SEVERITY_ORDER.indexOf(b.severity) - SIGNAL_SEVERITY_ORDER.indexOf(a.severity);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.detectionTimestamp) - new Date(a.detectionTimestamp);
  });
  
  return signals;
}

export async function getSignalsByCase(caseId) {
  return getSignals({ caseId });
}

export async function getActiveSignalCount() {
  const signals = await getSignals({ activeOnly: true });
  // Count distinct renewals with active signals (not total signal records)
  const distinctCaseIds = new Set(signals.map(s => s.caseId));
  return {
    count: distinctCaseIds.size,
    totalSignals: signals.length,
    bySeverity: signals.reduce((acc, s) => {
      acc[s.severity] = (acc[s.severity] || 0) + 1;
      return acc;
    }, {}),
  };
}

export async function generateSignals(caseId) {
  ensureSeeded();
  await delay(300);
  
  const rules = await getSignalRules();
  const currentCase = await getCaseById(caseId);
  if (!currentCase) return { generated: 0, signals: [] };
  
  // Get previous snapshot for comparison
  const processedKey = _getProcessedSnapshotKey(caseId);
  const previousSnapshot = lsGet(processedKey, null);
  
  // Check if snapshot has actually changed (deduplication)
  if (!_hasSnapshotChanged(caseId, currentCase)) {
    return { generated: 0, signals: [], message: 'No changes detected - signals already up to date' };
  }
  
  // Detect new signals
  const newSignals = _detectSignals(currentCase, previousSnapshot, rules);
  
  if (newSignals.length > 0) {
    // Get existing signals
    const existingSignals = lsGet(SIGNALS_KEY, []);
    
    // Deduplicate: don't add signals for the same type that are already active
    const activeSignals = existingSignals.filter(s => s.caseId === caseId && s.status === SIGNAL_STATUS.ACTIVE);
    const activeTypes = new Set(activeSignals.map(s => s.type));
    
    const uniqueNewSignals = newSignals.filter(s => !activeTypes.has(s.type));
    
    if (uniqueNewSignals.length > 0) {
      // Add new signals
      const updatedSignals = [...existingSignals, ...uniqueNewSignals];
      lsSet(SIGNALS_KEY, updatedSignals);
      
      // Log to signal history
      const history = lsGet(SIGNAL_HISTORY_KEY, []);
      uniqueNewSignals.forEach(signal => {
        history.push({
          id: `HIST-${Date.now()}-${signal.id}`,
          signalId: signal.id,
          caseId: signal.caseId,
          action: 'GENERATED',
          timestamp: new Date().toISOString(),
          details: `Signal ${signal.type} generated with severity ${signal.severity}`,
        });
      });
      lsSet(SIGNAL_HISTORY_KEY, history);
    }
    
    // Save current snapshot as processed
    _saveProcessedSnapshot(caseId, currentCase);
    
    return { 
      generated: uniqueNewSignals.length, 
      signals: uniqueNewSignals,
      skipped: newSignals.length - uniqueNewSignals.length,
    };
  }
  
  // Save snapshot even if no signals generated
  _saveProcessedSnapshot(caseId, currentCase);
  return { generated: 0, signals: [], message: 'No material changes detected' };
}

export async function generateSignalsForAll() {
  ensureSeeded();
  await delay(500);
  
  const cases = await getCases();
  const results = { generated: 0, processed: 0, errors: [] };
  
  for (const c of cases) {
    try {
      const result = await generateSignals(c.id);
      results.generated += result.generated;
      results.processed++;
    } catch (err) {
      results.errors.push({ caseId: c.id, error: err.message });
    }
  }
  
  return results;
}

export async function acknowledgeSignal(signalId, userData = {}) {
  ensureSeeded();
  await delay();
  
  const signals = lsGet(SIGNALS_KEY, []);
  const signal = signals.find(s => s.id === signalId);
  if (!signal) return null;
  
  const updatedSignals = signals.map(s => {
    if (s.id === signalId) {
      return {
        ...s,
        status: SIGNAL_STATUS.ACKNOWLEDGED,
        acknowledgedBy: userData.userName || userData.userId || 'System',
        acknowledgedAt: new Date().toISOString(),
        acknowledgmentNote: userData.note || null,
      };
    }
    return s;
  });
  
  lsSet(SIGNALS_KEY, updatedSignals);
  
  // Log to history
  const history = lsGet(SIGNAL_HISTORY_KEY, []);
  history.push({
    id: `HIST-${Date.now()}`,
    signalId,
    caseId: signal.caseId,
    action: 'ACKNOWLEDGED',
    timestamp: new Date().toISOString(),
    actor: userData.userName || userData.userId || 'System',
    details: userData.note || 'Signal acknowledged',
  });
  lsSet(SIGNAL_HISTORY_KEY, history);
  
  return updatedSignals.find(s => s.id === signalId);
}

export async function resolveSignal(signalId, userData = {}) {
  ensureSeeded();
  await delay();
  
  const signals = lsGet(SIGNALS_KEY, []);
  const signal = signals.find(s => s.id === signalId);
  if (!signal) return null;
  
  const updatedSignals = signals.map(s => {
    if (s.id === signalId) {
      return {
        ...s,
        status: SIGNAL_STATUS.RESOLVED,
        resolvedBy: userData.userName || userData.userId || 'System',
        resolvedAt: new Date().toISOString(),
        resolutionNote: userData.note || null,
      };
    }
    return s;
  });
  
  lsSet(SIGNALS_KEY, updatedSignals);
  
  // Log to history
  const history = lsGet(SIGNAL_HISTORY_KEY, []);
  history.push({
    id: `HIST-${Date.now()}`,
    signalId,
    caseId: signal.caseId,
    action: 'RESOLVED',
    timestamp: new Date().toISOString(),
    actor: userData.userName || userData.userId || 'System',
    details: userData.note || 'Signal resolved',
  });
  lsSet(SIGNAL_HISTORY_KEY, history);
  
  return updatedSignals.find(s => s.id === signalId);
}

export async function getSignalHistory(filters = {}) {
  ensureSeeded();
  await delay();
  let history = lsGet(SIGNAL_HISTORY_KEY, []);
  
  if (filters.caseId) history = history.filter(h => h.caseId === filters.caseId);
  if (filters.signalId) history = history.filter(h => h.signalId === filters.signalId);
  if (filters.action) history = history.filter(h => h.action === filters.action);
  
  // Sort by timestamp descending
  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return history;
}

export async function getSignalStatistics() {
  ensureSeeded();
  await delay();
  
  const signals = lsGet(SIGNALS_KEY, []);
  const activeSignals = signals.filter(s => s.status === SIGNAL_STATUS.ACTIVE);
  
  const stats = {
    totalSignals: signals.length,
    activeSignals: activeSignals.length,
    acknowledgedSignals: signals.filter(s => s.status === SIGNAL_STATUS.ACKNOWLEDGED).length,
    resolvedSignals: signals.filter(s => s.status === SIGNAL_STATUS.RESOLVED).length,
    bySeverity: {},
    byType: {},
    byStatus: {},
    distinctCasesWithSignals: new Set(activeSignals.map(s => s.caseId)).size,
    trends: {
      last24Hours: signals.filter(s => {
        const detection = new Date(s.detectionTimestamp);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return detection >= yesterday;
      }).length,
      last7Days: signals.filter(s => {
        const detection = new Date(s.detectionTimestamp);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return detection >= lastWeek;
      }).length,
      last30Days: signals.filter(s => {
        const detection = new Date(s.detectionTimestamp);
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 30);
        return detection >= lastMonth;
      }).length,
    },
  };
  
  // Count by severity
  SIGNAL_SEVERITY_ORDER.forEach(severity => {
    stats.bySeverity[severity] = signals.filter(s => s.severity === severity).length;
  });
  
  // Count by type
  Object.values(SIGNAL_TYPES).forEach(type => {
    stats.byType[type] = signals.filter(s => s.type === type).length;
  });
  
  // Count by status
  Object.values(SIGNAL_STATUS).forEach(status => {
    stats.byStatus[status] = signals.filter(s => s.status === status).length;
  });
  
  return stats;
}

// ─── Seed Signals for Test Cases ──────────────────────────────────────────────
const SEED_SIGNALS = [
  {
    id: 'SIG-C-1001-new_claim-1694361600000',
    caseId: 'C-1001',
    type: SIGNAL_TYPES.NEW_CLAIM,
    typeLabel: 'New Claim',
    severity: SIGNAL_SEVERITY.HIGH,
    description: '1 new claim(s) detected',
    previousValue: 0,
    currentValue: 1,
    difference: 1,
    percentageChange: null,
    effectiveDate: '2025-09-15',
    source: 'Claims History',
    detectionTimestamp: '2026-09-10T08:00:00Z',
    ruleVersion: '1.0',
    status: SIGNAL_STATUS.ACTIVE,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'SIG-C-1004-adtf_increase-1694361600001',
    caseId: 'C-1004',
    type: SIGNAL_TYPES.ADTF_INCREASE,
    typeLabel: 'ADTF Increase',
    severity: SIGNAL_SEVERITY.CRITICAL,
    description: 'ADTF increased by 45.2%',
    previousValue: 55.2,
    currentValue: 80.1,
    difference: 24.9,
    percentageChange: '45.2',
    effectiveDate: '2025-07-01',
    source: 'Risk Score Calculation',
    detectionTimestamp: '2026-09-09T14:30:00Z',
    ruleVersion: '1.0',
    status: SIGNAL_STATUS.ACTIVE,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'SIG-C-1004-financial_strength_change-1694361600002',
    caseId: 'C-1004',
    type: SIGNAL_TYPES.FINANCIAL_STRENGTH_CHANGE,
    typeLabel: 'Financial Strength Change',
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'Financial strength changed from BBB+ to BB',
    previousValue: 'BBB+',
    currentValue: 'BB',
    difference: null,
    percentageChange: null,
    effectiveDate: '2025-07-01',
    source: 'Financial Rating',
    detectionTimestamp: '2026-09-08T10:00:00Z',
    ruleVersion: '1.0',
    status: SIGNAL_STATUS.ACKNOWLEDGED,
    acknowledgedBy: 'Sarah Chen',
    acknowledgedAt: '2026-09-09T09:00:00Z',
  },
  {
    id: 'SIG-C-1006-expiry_imminent-1694361600003',
    caseId: 'C-1006',
    type: SIGNAL_TYPES.EXPIRY_IMMINENT,
    typeLabel: 'Expiry Imminent',
    severity: SIGNAL_SEVERITY.HIGH,
    description: 'Bond expires in 22 days',
    previousValue: null,
    currentValue: 22,
    difference: null,
    percentageChange: null,
    effectiveDate: '2026-10-05',
    source: 'Policy Data',
    detectionTimestamp: '2026-09-10T07:00:00Z',
    ruleVersion: '1.0',
    status: SIGNAL_STATUS.ACTIVE,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'SIG-C-1008-wip_change-1694361600004',
    caseId: 'C-1008',
    type: SIGNAL_TYPES.WIP_CHANGE,
    typeLabel: 'WIP Change',
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Work in progress increased by 28.5%',
    previousValue: '$5,920,000',
    currentValue: '$7,600,000',
    difference: '$1,680,000',
    percentageChange: '28.5',
    effectiveDate: '2025-09-01',
    source: 'Financial Data',
    detectionTimestamp: '2026-09-07T16:00:00Z',
    ruleVersion: '1.0',
    status: SIGNAL_STATUS.ACTIVE,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'SIG-C-1002-expiry_imminent-1694361600005',
    caseId: 'C-1002',
    type: SIGNAL_TYPES.EXPIRY_IMMINENT,
    typeLabel: 'Expiry Imminent',
    severity: SIGNAL_SEVERITY.MEDIUM,
    description: 'Bond expires in 45 days',
    previousValue: null,
    currentValue: 45,
    difference: null,
    percentageChange: null,
    effectiveDate: '2026-10-28',
    source: 'Policy Data',
    detectionTimestamp: '2026-09-10T08:00:00Z',
    ruleVersion: '1.0',
    status: SIGNAL_STATUS.ACTIVE,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
];

// ─── Extended Seed Initializer with Signals ───────────────────────────────────
const _originalEnsureSeeded = ensureSeeded;
export function ensureSeededWithSignals() {
  _originalEnsureSeeded();
  
  // Initialize signals if not present
  const existingSignals = lsGet(SIGNALS_KEY, null);
  if (!existingSignals) {
    lsSet(SIGNALS_KEY, SEED_SIGNALS);
  }
  
  // Initialize signal rules if not present
  const existingRules = lsGet(SIGNAL_RULES_KEY, null);
  if (!existingRules) {
    lsSet(SIGNAL_RULES_KEY, DEFAULT_SIGNAL_RULES);
  }
  
  // Initialize signal history if not present
  const existingHistory = lsGet(SIGNAL_HISTORY_KEY, null);
  if (!existingHistory) {
    const initialHistory = [
      {
        id: 'HIST-1694361600000',
        signalId: 'SIG-C-1004-financial_strength_change-1694361600002',
        caseId: 'C-1004',
        action: 'GENERATED',
        timestamp: '2026-09-08T10:00:00Z',
        details: 'Signal financial_strength_change generated with severity High',
      },
      {
        id: 'HIST-1694361600001',
        signalId: 'SIG-C-1004-financial_strength_change-1694361600002',
        caseId: 'C-1004',
        action: 'ACKNOWLEDGED',
        timestamp: '2026-09-09T09:00:00Z',
        actor: 'Sarah Chen',
        details: 'Financial downgrade reviewed and acknowledged',
      },
    ];
    lsSet(SIGNAL_HISTORY_KEY, initialHistory);
  }
}

// Override ensureSeeded to include signals
export { ensureSeededWithSignals as ensureSeeded };

const SEED_INFO_REQUESTS = [
  { id: 'IR-001', caseId: 'C-1002', type: 'Financial Statements', status: 'Overdue',
    requestedDate: '2026-08-28', dueDate: '2026-09-07',
    requestedItem: 'Updated Q2 2026 financial statements including balance sheet and P&L.',
    description: 'Updated Q2 2026 financial statements including balance sheet and P&L.',
    requestedBy: 'James Park', requestedFrom: 'Meridian Broker', response: null },
  { id: 'IR-002', caseId: 'C-1001', type: 'Project Schedule', status: 'Pending',
    requestedDate: '2026-09-05', dueDate: '2026-09-15',
    requestedItem: 'Updated project completion schedule for Denver municipal contract.',
    description: 'Updated project completion schedule for Denver municipal contract.',
    requestedBy: 'Sarah Chen', requestedFrom: 'Apex Broker', response: null },
  { id: 'IR-003', caseId: 'C-1008', type: 'WIP Schedule', status: 'Received',
    requestedDate: '2026-09-01', dueDate: '2026-09-10',
    requestedItem: 'Current WIP schedule with contract values and percent complete.',
    description: 'Current WIP schedule with contract values and percent complete.',
    requestedBy: 'James Park', requestedFrom: 'Vanguard Broker', response: 'Submitted via broker portal on 09/09.' },
];

const SEED_CORRESPONDENCE = [
  { id: 'CO-001', caseId: 'C-1001', direction: 'Outbound', type: 'Email',
    subject: 'Renewal Submission Request — Apex Construction LLC',
    body: 'Dear Broker, Please submit renewal application and updated financials for the above-referenced account by September 20, 2026.',
    from: 'sarah.chen@surety.com', to: 'broker@apexagency.com',
    sentAt: '2026-09-08T10:00:00Z', timestamp: '2026-09-08T10:00:00Z', status: 'Sent' },
  { id: 'CO-002', caseId: 'C-1004', direction: 'Inbound', type: 'Email',
    subject: 'RE: Ironclad Paving — Q2 Financials',
    body: 'Please find attached the Q2 2026 financial statements for Ironclad Paving Co. as requested.',
    from: 'broker@ironclad-agency.com', to: 'marcus.webb@surety.com',
    sentAt: '2026-09-09T14:22:00Z', timestamp: '2026-09-09T14:22:00Z', status: 'Received' },
  { id: 'CO-003', caseId: 'C-1002', direction: 'Outbound', type: 'Letter',
    subject: 'Information Request — Meridian Mechanical Inc.',
    body: 'This letter serves as a formal request for updated financial documentation required for renewal underwriting.',
    from: 'james.park@surety.com', to: 'broker@meridian-agency.com',
    sentAt: '2026-09-07T09:00:00Z', timestamp: '2026-09-07T09:00:00Z', status: 'Sent' },
];

// ─── Seed initializer ─────────────────────────────────────────────────────────
function ensureSeeded() {
  // Bump this version string any time seed data schema changes — forces localStorage reset
  const SCHEMA_VERSION = 'v6-renewal-intelligence-fix-2026';
  if (lsGet('uw_schema_version', '') !== SCHEMA_VERSION) {
    lsSet('uw_cases', SEED_CASES);
    lsSet('uw_alerts', SEED_ALERTS);
    lsSet('uw_ai_advisories', SEED_AI_ADVISORIES);
    lsSet('uw_info_requests', SEED_INFO_REQUESTS);
    lsSet('uw_correspondence', SEED_CORRESPONDENCE);
    lsSet('uw_seeded', true);
    lsSet('uw_schema_version', SCHEMA_VERSION);
  }
}

// ─── Renewal Records (generated from SEED_CASES) ──────────────────────────────
function buildRenewalRecords() {
  return SEED_CASES.map(c => ({
    id: `RR-${c.id}`,
    caseId: c.id,
    principalName: c.principalName,
    bondType: c.bondType,
    bondPenalty: c.bondPenalty,
    effectiveDate: c.effectiveDate,
    expiryDate: c.expiryDate,
    dataGroups: {
      activeBonds: {
        count: 1,
        totalPenalty: c.bondPenalty,
        bondTypes: c.bondType,
        oldestBondDate: c.effectiveDate,
      },
      customerSince: {
        date: new Date(new Date().getFullYear() - c.yearsInBusiness, 0, 1).toISOString().split('T')[0],
        yearsActive: c.yearsInBusiness,
        relationshipManager: c.uwAssigned,
      },
      fliqRate: {
        rate: c.financialStrength,
        trend: c.riskScore > 60 ? 'Declining' : 'Stable',
        lastAssessedDate: c.effectiveDate,
        assessedBy: c.uwAssigned,
      },
      dtf: {
        averageDtf: (c.riskScore / 100 * 45).toFixed(1),
        minDtf: '5.0',
        maxDtf: (c.riskScore / 100 * 90).toFixed(1),
        period: '12 months',
      },
      pms: {
        score: Math.max(0, 100 - c.riskScore),
        grade: c.riskScore < 40 ? 'A' : c.riskScore < 60 ? 'B' : c.riskScore < 75 ? 'C' : 'D',
        assessmentDate: c.effectiveDate,
        notes: c.riskSignals.length > 0 ? c.riskSignals.join('; ') : 'No adverse signals',
      },
      entryTypes: {
        types: c.bondType,
        primaryType: c.bondType,
        secondaryType: null,
        notes: `NAICS: ${c.naicsCode}`,
      },
      extendedSuspended: {
        extendedCount: c.riskSignals.includes('Extended/Suspended Entries') ? 3 : 0,
        suspendedCount: 0,
        totalValue: c.riskSignals.includes('Extended/Suspended Entries') ? 125000 : 0,
        oldestDate: null,
      },
      addCvd: {
        addAmount: c.riskSignals.includes('ADD/CVD Activity') ? 45000 : 0,
        cvdAmount: 0,
        currency: 'USD',
        period: '2026',
        notes: c.riskSignals.includes('ADD/CVD Activity') ? 'Active ADD proceedings' : 'None',
      },
      ldClaims: {
        count: c.claimsHistory,
        totalAmount: c.claimsHistory * 180000,
        openCount: c.status === 'In Review' ? c.claimsHistory : 0,
        closedCount: c.claimsHistory,
        lastClaimDate: c.claimsHistory > 0 ? '2025-11-15' : null,
      },
      idBills: {
        count: 0,
        totalAmount: 0,
        pendingAmount: 0,
        lastBillDate: null,
      },
      otherClaims: {
        count: 0,
        totalAmount: 0,
        types: null,
        notes: 'None on file',
      },
      premium: {
        currentPremium: c.premiumAmount,
        previousPremium: Math.round(c.premiumAmount * 0.95),
        change: Math.round(c.premiumAmount * 0.05),
        currency: 'USD',
        period: '2026',
      },
      paidClaims: {
        totalPaid: c.claimsHistory * 180000,
        count: c.claimsHistory,
        lastPaymentDate: c.claimsHistory > 0 ? '2025-12-01' : null,
        currency: 'USD',
      },
      collateral: {
        type: c.riskScore > 70 ? 'Cash Deposit' : 'None',
        value: c.riskScore > 70 ? Math.round(c.bondPenalty * 0.1) : 0,
        currency: 'USD',
        expiryDate: c.riskScore > 70 ? c.expiryDate : null,
        notes: c.riskScore > 70 ? 'Required due to elevated risk score' : 'No collateral required',
      },
      gia: {
        status: 'Executed',
        executionDate: c.effectiveDate,
        parties: c.principalName,
        notes: 'Standard GIA on file',
      },
      openExposure: {
        totalExposure: c.bondPenalty,
        currency: 'USD',
        breakdown: `WIP: $${(c.workInProgress || 0).toLocaleString()}`,
        asOfDate: '2026-09-01',
      },
    },
    importedAt: '2026-09-01T00:00:00Z',
    sourceFile: 'renewal_data_2026_Q3.xlsx',
    sourceSheet: 'Active Bonds',
  }));
}

// ─── Portfolio Metrics ────────────────────────────────────────────────────────
export async function getPortfolioMetrics() {
  ensureSeeded();
  await delay();
  const cases = lsGet('uw_cases', SEED_CASES);
  const alerts = lsGet('uw_alerts', SEED_ALERTS);
  const irs = lsGet('uw_info_requests', SEED_INFO_REQUESTS);

  const active = cases.filter(c => c.status !== 'Bound');
  const expiring30 = cases.filter(c => c.daysToExpiry <= 30);
  const expiring60 = cases.filter(c => c.daysToExpiry > 30 && c.daysToExpiry <= 60);
  const expiring90 = cases.filter(c => c.daysToExpiry > 60 && c.daysToExpiry <= 90);
  const totalExposure = cases.reduce((s, c) => s + (c.bondPenalty || 0), 0);
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const pendingIRs = irs.filter(i => i.status !== 'Received');

  return {
    totalActiveCases: active.length,
    pendingDecision: cases.filter(c => c.status === 'AI Brief Ready' || c.status === 'In Review').length,
    expiringIn30Days: expiring30.length,
    expiringIn60Days: expiring60.length,
    expiringIn90Days: expiring90.length,
    aggregateExposure: totalExposure,
    renewalHitRate: 84,
    activeRiskAlerts: activeAlerts.length,
    pendingInfoRequests: pendingIRs.length,
    aiAdoptionRate: 78,
    overrideRate: 12,
  };
}

// ─── Cases ────────────────────────────────────────────────────────────────────
export async function getCases(filters = {}) {
  ensureSeeded();
  await delay();
  let cases = lsGet('uw_cases', SEED_CASES);
  if (filters.status) cases = cases.filter(c => c.status === filters.status);
  if (filters.uwAssigned) cases = cases.filter(c => c.uwAssigned === filters.uwAssigned);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    cases = cases.filter(c =>
      (c.principalName || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.obligeeName || '').toLowerCase().includes(q)
    );
  }
  return cases;
}

export async function getCaseById(id) {
  ensureSeeded();
  await delay();
  const cases = lsGet('uw_cases', SEED_CASES);
  return cases.find(c => c.id === id) || null;
}

export async function updateCase(id, updates) {
  ensureSeeded();
  await delay();
  const cases = lsGet('uw_cases', SEED_CASES);
  const updated = cases.map(c => c.id === id ? { ...c, ...updates } : c);
  lsSet('uw_cases', updated);
  return updated.find(c => c.id === id);
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export async function getAlerts(filters = {}) {
  ensureSeeded();
  await delay();
  let alerts = lsGet('uw_alerts', SEED_ALERTS);
  if (filters.caseId) alerts = alerts.filter(a => a.caseId === filters.caseId);
  if (filters.unacknowledged) alerts = alerts.filter(a => !a.acknowledged);
  return alerts;
}

export async function acknowledgeAlert(id) {
  ensureSeeded();
  await delay();
  const alerts = lsGet('uw_alerts', SEED_ALERTS);
  const updated = alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a);
  lsSet('uw_alerts', updated);
  return updated.find(a => a.id === id);
}

// ─── AI Advisory ─────────────────────────────────────────────────────────────
export async function getAIAdvisory(caseId) {
  ensureSeeded();
  await delay();
  const advisories = lsGet('uw_ai_advisories', SEED_AI_ADVISORIES);
  return advisories[caseId] || null;
}

export async function acknowledgeAIBrief(caseId, overrideData = null) {
  ensureSeeded();
  await delay();
  const advisories = lsGet('uw_ai_advisories', SEED_AI_ADVISORIES);
  if (advisories[caseId]) {
    advisories[caseId] = {
      ...advisories[caseId],
      uwAcknowledged: true,
      acknowledged: true,
      uwOverrideReason: overrideData?.reason || null,
      uwOverrideRecommendation: overrideData?.recommendation || null,
    };
    lsSet('uw_ai_advisories', advisories);
  }
  return advisories[caseId] || null;
}

// ─── UW Decision ─────────────────────────────────────────────────────────────
export async function submitUWDecision(caseId, decision) {
  ensureSeeded();
  await delay(300);
  const cases = lsGet('uw_cases', SEED_CASES);
  // Support both { status } (from RenewalPipeline) and { type } (legacy) shapes
  const decisionKey = decision.status || decision.type || 'Decision Made';
  const statusMap = {
    'Bound': 'Bound',
    'Approve': 'Bound',
    'Decision Made': 'Decision Made',
    'Approve with Conditions': 'Decision Made',
    'Decline': 'Decision Made',
    'Pending IR': 'Pending IR',
    'Request More Info': 'Pending IR',
  };
  const newStatus = statusMap[decisionKey] || decisionKey;
  const updated = cases.map(c => c.id === caseId ? { ...c, status: newStatus, lastDecision: decision } : c);
  lsSet('uw_cases', updated);

  // Log to audit
  const auditLog = lsGet('uw_audit_log', []);
  auditLog.push({
    id: `AUD-${Date.now()}`,
    caseId,
    action: `UW Decision: ${decisionKey}`,
    actor: decision.uwName || 'Underwriter',
    detail: decision.notes || '',
    timestamp: new Date().toISOString(),
  });
  lsSet('uw_audit_log', auditLog);

  return updated.find(c => c.id === caseId) || null;
}

// ─── Info Requests ────────────────────────────────────────────────────────────
export async function getInfoRequests(caseId) {
  ensureSeeded();
  await delay();
  const irs = lsGet('uw_info_requests', SEED_INFO_REQUESTS);
  if (caseId) return irs.filter(i => i.caseId === caseId);
  return irs;
}

export async function createInfoRequest(data) {
  ensureSeeded();
  await delay();
  const irs = lsGet('uw_info_requests', SEED_INFO_REQUESTS);
  const newIR = { id: `IR-${Date.now()}`, status: 'Pending', ...data };
  irs.push(newIR);
  lsSet('uw_info_requests', irs);
  return newIR;
}

export async function updateInfoRequest(id, updates) {
  ensureSeeded();
  await delay();
  const irs = lsGet('uw_info_requests', SEED_INFO_REQUESTS);
  const updated = irs.map(i => i.id === id ? { ...i, ...updates } : i);
  lsSet('uw_info_requests', updated);
  return updated.find(i => i.id === id);
}

// ─── Correspondence ───────────────────────────────────────────────────────────
export async function getCorrespondence(caseId) {
  ensureSeeded();
  await delay();
  const corr = lsGet('uw_correspondence', SEED_CORRESPONDENCE);
  if (caseId) return corr.filter(c => c.caseId === caseId);
  return corr;
}

export async function createCorrespondence(data) {
  ensureSeeded();
  await delay();
  const corr = lsGet('uw_correspondence', SEED_CORRESPONDENCE);
  const newCorr = {
    id: `CO-${Date.now()}`,
    sentAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    status: 'Sent',
    ...data,
  };
  corr.push(newCorr);
  lsSet('uw_correspondence', corr);
  return newCorr;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export async function getAuditLog(caseId) {
  ensureSeeded();
  await delay();
  const log = lsGet('uw_audit_log', []);
  if (caseId) return log.filter(e => e.caseId === caseId);
  return log;
}

// ─── Renewal Intelligence ─────────────────────────────────────────────────────
export async function getRenewalIntelligence(caseId) {
  ensureSeeded();
  await delay();
  const cases = lsGet('uw_cases', SEED_CASES);
  const c = cases.find(x => x.id === caseId);
  if (!c) return null;
  return {
    caseId,
    riskScore: c.riskScore || 0,
    financialStrength: c.financialStrength || 'N/A',
    creditScore: c.creditScore || 0,
    yearsInBusiness: c.yearsInBusiness || 0,
    claimsHistory: c.claimsHistory || 0,
    workInProgress: c.workInProgress || 0,
    backlog: c.backlog || 0,
    region: c.region || '',
    naicsCode: c.naicsCode || '',
  };
}

// ─── Import / Data Ingestion ──────────────────────────────────────────────────
export async function getImportBatches() {
  ensureSeeded();
  await delay();
  return lsGet('uw_import_batches', []);
}

export async function createImportBatch(data) {
  ensureSeeded();
  await delay(500);
  const batches = lsGet('uw_import_batches', []);
  const batch = {
    id: `IMP-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    ...data,
  };
  batches.push(batch);
  lsSet('uw_import_batches', batches);
  return batch;
}

export async function confirmImportBatch(batchId) {
  ensureSeeded();
  await delay(800);
  const batches = lsGet('uw_import_batches', []);
  const updated = batches.map(b => b.id === batchId ? { ...b, status: 'Confirmed', confirmedAt: new Date().toISOString() } : b);
  lsSet('uw_import_batches', updated);
  return updated.find(b => b.id === batchId);
}

// ─── Renewal Record Builder ───────────────────────────────────────────────────
function _buildRenewalRecord(c) {
  return {
    id: c.id,
    caseId: c.id,
    principalName: c.principalName,
    sourceLineage: { importBatchId: 'SEED-001', sourceFile: 'seed_data.js', sourceSheet: 'Cases' },
    dataGroups: {
      activeBonds: { count: 1, totalPenalty: c.bondPenalty || 0, bondTypes: c.bondType || '', oldestBondDate: c.effectiveDate || '' },
      customerSince: { date: c.effectiveDate || '', yearsActive: c.yearsInBusiness || 0, relationshipManager: c.uwAssigned || '' },
      fliqRate: { rate: c.riskScore ? (c.riskScore / 100).toFixed(2) : '', trend: c.riskScore > 60 ? 'Increasing' : 'Stable', lastAssessedDate: c.effectiveDate || '', assessedBy: c.uwAssigned || '' },
      dtf: { averageDtf: c.riskScore ? (c.riskScore * 0.8).toFixed(1) : '', minDtf: '', maxDtf: '', period: '2026' },
      pms: { score: c.creditScore || '', grade: c.financialStrength || '', assessmentDate: c.effectiveDate || '', notes: '' },
      entryTypes: { types: c.naicsCode || '', primaryType: c.bondType || '', secondaryType: '', notes: '' },
      extendedSuspended: { extendedCount: 0, suspendedCount: 0, totalValue: 0, oldestDate: '' },
      addCvd: { addAmount: '', cvdAmount: '', currency: 'USD', period: '2026', notes: '' },
      ldClaims: { count: c.claimsHistory || 0, totalAmount: '', openCount: 0, closedCount: c.claimsHistory || 0, lastClaimDate: '' },
      idBills: { count: 0, totalAmount: '', pendingAmount: '', lastBillDate: '' },
      otherClaims: { count: 0, totalAmount: '', types: '', notes: '' },
      premium: { currentPremium: c.premiumAmount || 0, previousPremium: '', change: '', currency: 'USD', period: '2026' },
      paidClaims: { totalPaid: 0, count: 0, lastPaymentDate: '', currency: 'USD' },
      collateral: { type: '', value: '', currency: 'USD', expiryDate: '', notes: '' },
      gia: { status: 'Active', executionDate: c.effectiveDate || '', parties: c.principalName || '', notes: '' },
      openExposure: { totalExposure: c.bondPenalty || 0, currency: 'USD', breakdown: c.bondType || '', asOfDate: c.expiryDate || '' },
    },
  };
}

// ─── Generic REST-style api object (for components using api.get / api.post) ──
export const api = {
  // ── Named convenience methods (used by RenewalIntelligence, RiskSignals, etc.) ──
  getCases: async () => {
    ensureSeeded();
    await delay();
    return lsGet('uw_cases', SEED_CASES);
  },
  getCaseById: async (id) => {
    ensureSeeded();
    await delay();
    const cases = lsGet('uw_cases', SEED_CASES);
    return cases.find(c => c.id === id) || null;
  },
  getAIAdvisories: async () => {
    ensureSeeded();
    await delay();
    // Return the full map keyed by caseId so RenewalIntelligence can do advisories[caseId]
    return lsGet('uw_ai_advisories', SEED_AI_ADVISORIES);
  },
  getAIAdvisory: async (caseId) => {
    ensureSeeded();
    await delay();
    const map = lsGet('uw_ai_advisories', SEED_AI_ADVISORIES);
    return map[caseId] || null;
  },
  getRenewalRecords: async () => {
    ensureSeeded();
    await delay();
    const cases = lsGet('uw_cases', SEED_CASES);
    return cases.map(c => _buildRenewalRecord(c));
  },
  getRenewalRecord: async (caseId) => {
    ensureSeeded();
    await delay();
    const cases = lsGet('uw_cases', SEED_CASES);
    const c = cases.find(x => x.id === caseId);
    if (!c) return null;
    return _buildRenewalRecord(c);
  },
  getRiskSignals: async () => {
    ensureSeeded();
    await delay();
    return lsGet('uw_risk_signals', SEED_RISK_SIGNALS);
  },
  getAlerts: async () => {
    ensureSeeded();
    await delay();
    return lsGet('uw_alerts', SEED_ALERTS);
  },
  acknowledgeAIBrief: async (caseId) => {
    ensureSeeded();
    await delay();
    const map = lsGet('uw_ai_advisories', SEED_AI_ADVISORIES);
    if (map[caseId]) {
      map[caseId] = { ...map[caseId], uwAcknowledged: true, acknowledgedAt: new Date().toISOString() };
      lsSet('uw_ai_advisories', map);
    }
    return map[caseId] || null;
  },
  acknowledgeSignal: async (signalId) => {
    ensureSeeded();
    await delay();
    const signals = lsGet('uw_risk_signals', SEED_RISK_SIGNALS);
    const updated = signals.map(s =>
      s.id === signalId
        ? { ...s, status: 'Acknowledged', acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : s
    );
    lsSet('uw_risk_signals', updated);
    return updated.find(s => s.id === signalId) || null;
  },
  resolveSignal: async (signalId) => {
    ensureSeeded();
    await delay();
    const signals = lsGet('uw_risk_signals', SEED_RISK_SIGNALS);
    const updated = signals.map(s =>
      s.id === signalId
        ? { ...s, status: 'Resolved', resolvedAt: new Date().toISOString() }
        : s
    );
    lsSet('uw_risk_signals', updated);
    return updated.find(s => s.id === signalId) || null;
  },
  dismissSignal: async (signalId) => {
    ensureSeeded();
    await delay();
    const signals = lsGet('uw_risk_signals', SEED_RISK_SIGNALS);
    const updated = signals.map(s =>
      s.id === signalId
        ? { ...s, status: 'Dismissed', dismissedAt: new Date().toISOString() }
        : s
    );
    lsSet('uw_risk_signals', updated);
    return updated.find(s => s.id === signalId) || null;
  },
  acknowledgeAlert: async (alertId) => {
    ensureSeeded();
    await delay();
    const alerts = lsGet('uw_alerts', SEED_ALERTS);
    const updated = alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a);
    lsSet('uw_alerts', updated);
    return updated.find(a => a.id === alertId) || null;
  },

  // ── REST path-based methods (used by other components) ──
  get: async (path) => {
    await delay();
    if (path.startsWith('/cases')) {
      const id = path.split('/')[2];
      if (id) return getCaseById(id);
      return getCases();
    }
    if (path.startsWith('/alerts')) return getAlerts();
    if (path.startsWith('/info-requests')) return getInfoRequests();
    if (path.startsWith('/correspondence')) return getCorrespondence();
    if (path.startsWith('/portfolio')) return getPortfolioMetrics();
    if (path.startsWith('/audit')) return getAuditLog();
    if (path.startsWith('/import-batches')) return getImportBatches();
    if (path.startsWith('/ai-advisory')) {
      const segments = path.split('/').filter(Boolean);
      const caseId = segments[1];
      if (caseId) return getAIAdvisory(caseId);
      ensureSeeded();
      const advisoryMap = lsGet('uw_ai_advisories', SEED_AI_ADVISORIES);
      return Object.entries(advisoryMap).map(([cId, adv]) => ({ ...adv, caseId: cId }));
    }
    if (path.startsWith('/renewal-records')) {
      const segments = path.split('/').filter(Boolean);
      const recordId = segments[1];
      if (recordId && segments[2] === 'lineage') return {};
      ensureSeeded();
      const cases = lsGet('uw_cases', SEED_CASES);
      if (recordId) {
        const c = cases.find(x => x.id === recordId);
        if (!c) return null;
        return _buildRenewalRecord(c);
      }
      return cases.map(c => _buildRenewalRecord(c));
    }
    if (path.startsWith('/risk-signals')) return lsGet('uw_risk_signals', SEED_RISK_SIGNALS);
    return null;
  },
  post: async (path, body) => {
    await delay();
    if (path.startsWith('/cases') && path.endsWith('/decision')) {
      const id = path.split('/')[2];
      return submitUWDecision(id, body);
    }
    if (path.startsWith('/cases') && path.endsWith('/acknowledge')) {
      const id = path.split('/')[2];
      return acknowledgeAIBrief(id, body);
    }
    if (path.startsWith('/info-requests')) return createInfoRequest(body);
    if (path.startsWith('/correspondence')) return createCorrespondence(body);
    if (path.startsWith('/import-batches')) return createImportBatch(body);
    return null;
  },
  put: async (path, body) => {
    await delay();
    if (path.startsWith('/cases')) {
      const id = path.split('/')[2];
      return updateCase(id, body);
    }
    if (path.startsWith('/info-requests')) {
      const id = path.split('/')[2];
      return updateInfoRequest(id, body);
    }
    return null;
  },
  patch: async (path, body) => {
    await delay();
    if (path.startsWith('/alerts')) {
      const id = path.split('/')[2];
      return acknowledgeAlert(id);
    }
    return null;
  },
};
