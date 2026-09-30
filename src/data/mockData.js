export const renewalCases = [
  {
    id: "RC-2026-0041",
    principalName: "Meridian Construction Group LLC",
    principalId: "PRI-1041",
    bondType: "Performance & Payment Bond",
    bondPenalty: 4750000,
    expiryDate: "2026-10-15",
    daysToExpiry: 28,
    status: "AI Brief Ready",
    riskScore: 74,
    aiConfidence: 81,
    aiRecommendation: "Renew with Conditions",
    assignedUnderwriter: "Sarah Chen",
    uwLevel: "L2",
    lastActivity: "2026-09-17T14:22:00Z",
    riskSignals: ["WIP backlog up 38%", "Current ratio declined to 1.12", "New obligee: CDOT"],
    premiumAmount: 47500,
    obligee: "Colorado Dept of Transportation",
    acknowledged: false
  },
  {
    id: "RC-2026-0038",
    principalName: "Apex Earthworks Inc",
    principalId: "PRI-0938",
    bondType: "Performance Bond",
    bondPenalty: 2100000,
    expiryDate: "2026-10-08",
    daysToExpiry: 21,
    status: "Pending IR",
    riskScore: 88,
    aiConfidence: 67,
    aiRecommendation: "Hold — Awaiting Financials",
    assignedUnderwriter: "Sarah Chen",
    uwLevel: "L2",
    lastActivity: "2026-09-16T09:45:00Z",
    riskSignals: ["Current ratio below 1.0", "Net loss in Q2 2026", "Claim filed 2025"],
    premiumAmount: 21000,
    obligee: "City of Denver Public Works",
    acknowledged: false
  },
  {
    id: "RC-2026-0055",
    principalName: "Silverline Mechanical Contractors",
    principalId: "PRI-1155",
    bondType: "Subdivision Bond",
    bondPenalty: 875000,
    expiryDate: "2026-11-20",
    daysToExpiry: 64,
    status: "In Review",
    riskScore: 42,
    aiConfidence: 91,
    aiRecommendation: "Renew Standard Terms",
    assignedUnderwriter: "Sarah Chen",
    uwLevel: "L2",
    lastActivity: "2026-09-18T11:10:00Z",
    riskSignals: ["Minor WIP growth 9%"],
    premiumAmount: 8750,
    obligee: "Jefferson County Planning Dept",
    acknowledged: true
  },
  {
    id: "RC-2026-0062",
    principalName: "Crestwood Infrastructure Partners",
    principalId: "PRI-1262",
    bondType: "Performance & Payment Bond",
    bondPenalty: 9200000,
    expiryDate: "2026-12-01",
    daysToExpiry: 75,
    status: "New",
    riskScore: 55,
    aiConfidence: 76,
    aiRecommendation: "Renew with Conditions",
    assignedUnderwriter: "Sarah Chen",
    uwLevel: "L2",
    lastActivity: "2026-09-14T16:00:00Z",
    riskSignals: ["Debt-to-equity ratio 2.4x", "Two new obligees added"],
    premiumAmount: 92000,
    obligee: "CDOT Region 6",
    acknowledged: false
  },
  {
    id: "RC-2026-0029",
    principalName: "BlueSky Utility Services LLC",
    principalId: "PRI-0829",
    bondType: "License & Permit Bond",
    bondPenalty: 500000,
    expiryDate: "2026-12-18",
    daysToExpiry: 92,
    status: "Bound",
    riskScore: 28,
    aiConfidence: 95,
    aiRecommendation: "Renew Standard Terms",
    assignedUnderwriter: "Sarah Chen",
    uwLevel: "L2",
    lastActivity: "2026-09-10T13:30:00Z",
    riskSignals: [],
    premiumAmount: 5000,
    obligee: "Colorado Public Utilities Commission",
    acknowledged: true
  }
];

export const portfolioMetrics = {
  totalActiveCases: 147,
  pendingDecision: 23,
  expiringIn30Days: 12,
  expiringIn60Days: 31,
  expiringIn90Days: 54,
  aggregateExposure: 284600000,
  renewalHitRate: 84.2,
  avgDaysToDecision: 4.1,
  aiAdoptionRate: 73.5,
  activeRiskAlerts: 8,
  pendingInfoRequests: 6,
  overrideRate: 12.3
};

export const alerts = [
  {
    id: "ALT-0091",
    type: "Financial Deterioration",
    severity: "Critical",
    principalName: "Apex Earthworks Inc",
    message: "Current ratio dropped below 1.0 — financial review required before renewal",
    createdAt: "2026-09-18T09:15:00Z",
    caseId: "RC-2026-0038",
    acknowledged: false
  },
  {
    id: "ALT-0089",
    type: "Expiry Imminent",
    severity: "High",
    principalName: "Meridian Construction Group LLC",
    message: "Bond RC-2026-0041 expires in 28 days — AI brief ready for review",
    createdAt: "2026-09-17T08:00:00Z",
    caseId: "RC-2026-0041",
    acknowledged: false
  },
  {
    id: "ALT-0085",
    type: "IR Overdue",
    severity: "High",
    principalName: "Apex Earthworks Inc",
    message: "Audited financials IR-0088 is 5 days overdue — escalation required",
    createdAt: "2026-09-15T12:00:00Z",
    caseId: "RC-2026-0038",
    acknowledged: false
  },
  {
    id: "ALT-0082",
    type: "Capacity Breach",
    severity: "Medium",
    principalName: "Crestwood Infrastructure Partners",
    message: "Aggregate exposure for principal exceeds $9M single-bond threshold",
    createdAt: "2026-09-14T15:45:00Z",
    caseId: "RC-2026-0062",
    acknowledged: true
  }
];

export const correspondenceItems = [
  {
    id: "CORR-0214",
    caseId: "RC-2026-0041",
    direction: "Outbound",
    subject: "Renewal Submission Request — Meridian Construction Group",
    from: "sarah.chen@suretycorp.com",
    to: "broker@meridianins.com",
    sentAt: "2026-09-15T10:30:00Z",
    status: "Sent",
    attachments: ["renewal_checklist_2026.pdf"]
  },
  {
    id: "CORR-0211",
    caseId: "RC-2026-0038",
    direction: "Inbound",
    subject: "RE: Financial Statement Request — Apex Earthworks",
    from: "jsmith@apexbrokers.com",
    to: "sarah.chen@suretycorp.com",
    sentAt: "2026-09-13T14:10:00Z",
    status: "Received",
    attachments: ["apex_interim_financials_q2.pdf"]
  },
  {
    id: "CORR-0208",
    caseId: "RC-2026-0062",
    direction: "Outbound",
    subject: "New Submission Acknowledgement — Crestwood Infrastructure Partners",
    from: "sarah.chen@suretycorp.com",
    to: "broker@crestwoodins.com",
    sentAt: "2026-09-14T09:00:00Z",
    status: "Sent",
    attachments: []
  }
];

export const infoRequests = [
  {
    id: "IR-0087",
    caseId: "RC-2026-0041",
    requestedItem: "2025 Audited Financial Statements",
    requestedFrom: "Principal",
    dueDate: "2026-09-25",
    status: "Pending",
    priority: "High",
    notes: "Required for AI brief financial ratio analysis"
  },
  {
    id: "IR-0088",
    caseId: "RC-2026-0038",
    requestedItem: "Q2 2026 WIP Schedule",
    requestedFrom: "Principal",
    dueDate: "2026-09-10",
    status: "Overdue",
    priority: "High",
    notes: "Needed to assess backlog capacity and liquidity impact"
  },
  {
    id: "IR-0090",
    caseId: "RC-2026-0062",
    requestedItem: "Executed Indemnity Agreement — New Obligee CDOT Region 6",
    requestedFrom: "Broker",
    dueDate: "2026-09-30",
    status: "Pending",
    priority: "Medium",
    notes: "First-time obligee requires fresh indemnity execution"
  }
];

export const aiAdvisoryPanels = [
  {
    caseId: "RC-2026-0041",
    recommendation: "Renew with Conditions",
    confidenceScore: 81,
    riskFactors: [
      { factor: "WIP Backlog Growth", signal: "38% YoY increase — monitor capacity strain", severity: "Medium" },
      { factor: "Liquidity Ratio", signal: "Current ratio 1.12 vs 1.45 prior year", severity: "High" },
      { factor: "New Obligee Exposure", signal: "CDOT first-time obligee — verify indemnity", severity: "Medium" }
    ],
    positiveFactors: [
      { factor: "Payment History", signal: "Zero claims in 7-year relationship" },
      { factor: "Net Worth Trend", signal: "Net worth grew 12% to $3.2M" }
    ],
    generatedAt: "2026-09-18T08:00:00Z",
    uwAcknowledged: false,
    uwOverride: null,
    uwOverrideReason: null
  },
  {
    caseId: "RC-2026-0038",
    recommendation: "Hold — Awaiting Financials",
    confidenceScore: 67,
    riskFactors: [
      { factor: "Liquidity Crisis", signal: "Current ratio 0.94 — below minimum threshold", severity: "Critical" },
      { factor: "Net Loss", signal: "Q2 2026 net loss of $187K reported", severity: "High" },
      { factor: "Active Claim", signal: "2025 claim for $340K still open", severity: "High" }
    ],
    positiveFactors: [
      { factor: "Relationship Tenure", signal: "5-year bonding relationship, prior renewals clean" }
    ],
    generatedAt: "2026-09-16T07:30:00Z",
    uwAcknowledged: false,
    uwOverride: null,
    uwOverrideReason: null
  },
  {
    caseId: "RC-2026-0062",
    recommendation: "Renew with Conditions",
    confidenceScore: 76,
    riskFactors: [
      { factor: "Leverage Ratio", signal: "Debt-to-equity at 2.4x — above 2.0x guideline", severity: "Medium" },
      { factor: "Obligee Concentration", signal: "Two new obligees increase exposure breadth", severity: "Medium" }
    ],
    positiveFactors: [
      { factor: "Revenue Growth", signal: "Revenue up 22% YoY to $41M" },
      { factor: "Bonding History", signal: "No claims across $28M prior aggregate" }
    ],
    generatedAt: "2026-09-14T14:00:00Z",
    uwAcknowledged: false,
    uwOverride: null,
    uwOverrideReason: null
  }
];

export const auditLog = [
  {
    id: "AUD-0501",
    timestamp: "2026-09-18T14:22:00Z",
    actor: "Sarah Chen",
    action: "AI Brief Reviewed",
    caseId: "RC-2026-0041",
    detail: "Opened AI Advisory Panel for Meridian Construction Group"
  },
  {
    id: "AUD-0500",
    timestamp: "2026-09-18T09:15:00Z",
    actor: "System",
    action: "Alert Generated",
    caseId: "RC-2026-0038",
    detail: "Financial deterioration alert triggered for Apex Earthworks Inc"
  },
  {
    id: "AUD-0499",
    timestamp: "2026-09-17T16:45:00Z",
    actor: "Sarah Chen",
    action: "IR Created",
    caseId: "RC-2026-0041",
    detail: "Information request IR-0087 issued for 2025 audited financials"
  },
  {
    id: "AUD-0498",
    timestamp: "2026-09-16T11:30:00Z",
    actor: "Sarah Chen",
    action: "Correspondence Sent",
    caseId: "RC-2026-0038",
    detail: "Outbound email sent to broker requesting Q2 WIP schedule"
  },
  {
    id: "AUD-0497",
    timestamp: "2026-09-15T10:30:00Z",
    actor: "Sarah Chen",
    action: "Correspondence Sent",
    caseId: "RC-2026-0041",
    detail: "Renewal submission request sent to broker@meridianins.com"
  }
];

export default portfolioMetrics;

// ════════════════════════════════════════════════════════════════
// RENEWAL DATA GROUPS — 16 canonical data group definitions
// ════════════════════════════════════════════════════════════════

export const renewalDataGroups = [
  {
    id: 'active_bonds',
    label: 'Active Bonds',
    description: 'All currently active bond instruments for the principal including bond numbers, penalty amounts, obligees, and effective/expiry dates.',
    fields: [
      { name: 'bondCount', label: 'Bond Count', type: 'integer', required: true },
      { name: 'totalPenalty', label: 'Total Penalty ($)', type: 'currency', required: true },
      { name: 'bondNumbers', label: 'Bond Numbers', type: 'string', required: false },
      { name: 'obligees', label: 'Obligees', type: 'string', required: false },
    ]
  },
  {
    id: 'customer_since',
    label: 'Customer Since',
    description: 'Date the principal first became a bonding customer and tenure metrics.',
    fields: [
      { name: 'customerSinceDate', label: 'Customer Since Date', type: 'date', required: true },
      { name: 'tenureYears', label: 'Tenure (Years)', type: 'decimal', required: true },
      { name: 'relationshipNotes', label: 'Relationship Notes', type: 'string', required: false },
    ]
  },
  {
    id: 'fliq_rate',
    label: 'FLIQ Rate',
    description: 'Financial Liquidity Index Quotient — composite liquidity score derived from current ratio, quick ratio, and cash flow metrics.',
    fields: [
      { name: 'fliqScore', label: 'FLIQ Score', type: 'decimal', required: true },
      { name: 'currentRatio', label: 'Current Ratio', type: 'decimal', required: true },
      { name: 'quickRatio', label: 'Quick Ratio', type: 'decimal', required: false },
      { name: 'fliqAsOfDate', label: 'As-Of Date', type: 'date', required: true },
    ]
  },
  {
    id: 'dtf',
    label: 'Average DTF',
    description: 'Days-to-Finish — average number of days to complete bonded contracts, indicating operational efficiency.',
    fields: [
      { name: 'avgDtfDays', label: 'Avg DTF (Days)', type: 'integer', required: true },
      { name: 'dtfTrend', label: 'DTF Trend', type: 'string', required: false },
      { name: 'contractsAnalyzed', label: 'Contracts Analyzed', type: 'integer', required: false },
    ]
  },
  {
    id: 'pms',
    label: 'PMS',
    description: 'Project Management Score — internal scoring of the principal\'s project management capability based on schedule adherence, change order frequency, and completion rates.',
    fields: [
      { name: 'pmsScore', label: 'PMS Score', type: 'decimal', required: true },
      { name: 'pmsGrade', label: 'PMS Grade', type: 'string', required: true },
      { name: 'pmsAsOfDate', label: 'As-Of Date', type: 'date', required: false },
    ]
  },
  {
    id: 'entry_types',
    label: 'Entry Types',
    description: 'Classification of bond entry types in the principal\'s portfolio (new, renewal, rider, continuation).',
    fields: [
      { name: 'newEntries', label: 'New Entries', type: 'integer', required: false },
      { name: 'renewalEntries', label: 'Renewal Entries', type: 'integer', required: false },
      { name: 'riderEntries', label: 'Rider Entries', type: 'integer', required: false },
      { name: 'continuationEntries', label: 'Continuation Entries', type: 'integer', required: false },
    ]
  },
  {
    id: 'extended_suspended',
    label: 'Extended/Suspended Entries',
    description: 'Bonds that have been extended beyond original term or suspended pending resolution of an issue.',
    fields: [
      { name: 'extendedCount', label: 'Extended Count', type: 'integer', required: false },
      { name: 'suspendedCount', label: 'Suspended Count', type: 'integer', required: false },
      { name: 'extendedPenalty', label: 'Extended Penalty ($)', type: 'currency', required: false },
      { name: 'suspendedPenalty', label: 'Suspended Penalty ($)', type: 'currency', required: false },
    ]
  },
  {
    id: 'add_cvd',
    label: 'ADD/CVD',
    description: 'Anti-Dumping Duty and Countervailing Duty bond exposure — applicable for principals involved in import/export activities.',
    fields: [
      { name: 'addExposure', label: 'ADD Exposure ($)', type: 'currency', required: false },
      { name: 'cvdExposure', label: 'CVD Exposure ($)', type: 'currency', required: false },
      { name: 'addCvdNotes', label: 'ADD/CVD Notes', type: 'string', required: false },
    ]
  },
  {
    id: 'ld_claims',
    label: 'LD Claims',
    description: 'Liquidated Damages claims filed against the principal\'s bonds — count, amounts, and resolution status.',
    fields: [
      { name: 'ldClaimCount', label: 'LD Claim Count', type: 'integer', required: true },
      { name: 'ldClaimTotal', label: 'LD Claim Total ($)', type: 'currency', required: true },
      { name: 'ldOpenCount', label: 'Open LD Claims', type: 'integer', required: false },
      { name: 'ldResolvedCount', label: 'Resolved LD Claims', type: 'integer', required: false },
    ]
  },
  {
    id: 'id_bills',
    label: 'ID Bills',
    description: 'Indemnity demand bills issued to the principal — amounts billed, collected, and outstanding.',
    fields: [
      { name: 'idBillCount', label: 'ID Bill Count', type: 'integer', required: false },
      { name: 'idBillTotal', label: 'ID Bill Total ($)', type: 'currency', required: false },
      { name: 'idBillOutstanding', label: 'Outstanding ($)', type: 'currency', required: false },
    ]
  },
  {
    id: 'other_claims',
    label: 'Other Claims',
    description: 'Non-LD claims including performance claims, payment claims, and miscellaneous bond claims.',
    fields: [
      { name: 'otherClaimCount', label: 'Other Claim Count', type: 'integer', required: true },
      { name: 'otherClaimTotal', label: 'Other Claim Total ($)', type: 'currency', required: true },
      { name: 'otherClaimNotes', label: 'Claim Notes', type: 'string', required: false },
    ]
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Premium amounts — written, earned, and unearned — for the current and prior renewal periods.',
    fields: [
      { name: 'writtenPremium', label: 'Written Premium ($)', type: 'currency', required: true },
      { name: 'earnedPremium', label: 'Earned Premium ($)', type: 'currency', required: false },
      { name: 'priorPremium', label: 'Prior Period Premium ($)', type: 'currency', required: false },
      { name: 'premiumRate', label: 'Premium Rate (%)', type: 'decimal', required: false },
    ]
  },
  {
    id: 'paid_claims',
    label: 'Paid Claims',
    description: 'Total claims paid by the surety on behalf of the principal — cumulative and period amounts.',
    fields: [
      { name: 'paidClaimsTotal', label: 'Paid Claims Total ($)', type: 'currency', required: true },
      { name: 'paidClaimsPeriod', label: 'Paid Claims This Period ($)', type: 'currency', required: false },
      { name: 'recoveries', label: 'Recoveries ($)', type: 'currency', required: false },
      { name: 'netLoss', label: 'Net Loss ($)', type: 'currency', required: false },
    ]
  },
  {
    id: 'collateral',
    label: 'Collateral',
    description: 'Collateral held against the principal\'s bonding program — type, amount, and expiry.',
    fields: [
      { name: 'collateralType', label: 'Collateral Type', type: 'string', required: false },
      { name: 'collateralAmount', label: 'Collateral Amount ($)', type: 'currency', required: false },
      { name: 'collateralExpiry', label: 'Collateral Expiry', type: 'date', required: false },
      { name: 'collateralNotes', label: 'Collateral Notes', type: 'string', required: false },
    ]
  },
  {
    id: 'gia',
    label: 'GIA',
    description: 'General Indemnity Agreement status — execution date, indemnitors, and any amendments.',
    fields: [
      { name: 'giaExecuted', label: 'GIA Executed', type: 'boolean', required: true },
      { name: 'giaDate', label: 'GIA Execution Date', type: 'date', required: false },
      { name: 'giaIndemnitors', label: 'Indemnitors', type: 'string', required: false },
      { name: 'giaAmendments', label: 'Amendments', type: 'integer', required: false },
    ]
  },
  {
    id: 'open_exposure',
    label: 'Open Exposure',
    description: 'Total open/unresolved bond exposure — aggregate penalty of all active and extended bonds not yet released.',
    fields: [
      { name: 'openExposureTotal', label: 'Open Exposure Total ($)', type: 'currency', required: true },
      { name: 'openBondCount', label: 'Open Bond Count', type: 'integer', required: true },
      { name: 'largestSingleExposure', label: 'Largest Single Exposure ($)', type: 'currency', required: false },
      { name: 'exposureAsOfDate', label: 'Exposure As-Of Date', type: 'date', required: true },
    ]
  },
];

// ════════════════════════════════════════════════════════════════
// SAMPLE IMPORT BATCHES
// ════════════════════════════════════════════════════════════════

export const sampleImportBatches = [
  {
    id: 'BATCH-2026-0012',
    filename: 'renewal_portfolio_Q3_2026.xlsx',
    sourceType: 'Excel',
    uploadedBy: 'admin@suretycorp.com',
    uploadedByName: 'System Administrator',
    uploadedAt: '2026-09-15T09:30:00Z',
    importedAt: '2026-09-15T09:32:14Z',
    status: 'Completed',
    totalRows: 47,
    validRows: 44,
    errorRows: 2,
    duplicateRows: 1,
    sheetsDetected: ['Active Bonds', 'Claims Summary', 'Premium History', 'Collateral Register'],
    notes: 'Q3 2026 portfolio refresh — 44 renewal records imported successfully. 2 rows failed validation (missing FLIQ date). 1 duplicate detected and skipped.',
  },
  {
    id: 'BATCH-2026-0009',
    filename: 'claims_update_sept2026.csv',
    sourceType: 'CSV',
    uploadedBy: 'admin@suretycorp.com',
    uploadedByName: 'System Administrator',
    uploadedAt: '2026-09-08T14:15:00Z',
    importedAt: '2026-09-08T14:16:02Z',
    status: 'Completed with Warnings',
    totalRows: 18,
    validRows: 15,
    errorRows: 0,
    duplicateRows: 3,
    sheetsDetected: ['Sheet1'],
    notes: '3 duplicate claim records detected (same principalId + claimDate). Existing records retained. 15 new claim updates applied.',
  },
  {
    id: 'BATCH-2026-0007',
    filename: 'new_accounts_aug2026.xlsx',
    sourceType: 'Excel',
    uploadedBy: 'admin@suretycorp.com',
    uploadedByName: 'System Administrator',
    uploadedAt: '2026-08-22T11:00:00Z',
    importedAt: '2026-08-22T11:01:45Z',
    status: 'Failed',
    totalRows: 12,
    validRows: 0,
    errorRows: 12,
    duplicateRows: 0,
    sheetsDetected: ['Accounts'],
    notes: 'Import failed — unsupported column format detected. Expected "PrincipalID" column not found. File rejected.',
  },
];

// ════════════════════════════════════════════════════════════════
// SAMPLE RENEWAL RECORDS — fully normalized with source lineage
// ════════════════════════════════════════════════════════════════

export const sampleRenewalRecords = [
  {
    id: 'RR-2026-0041',
    canonicalId: 'PRI-1041|PERF-PAY|2026-10-15',
    principalId: 'PRI-1041',
    principalName: 'Meridian Construction Group LLC',
    bondType: 'Performance & Payment Bond',
    expiryDate: '2026-10-15',
    importBatchId: 'BATCH-2026-0012',
    importTimestamp: '2026-09-15T09:32:14Z',
    dataCompleteness: 94,
    dataGroups: {
      active_bonds: {
        bondCount: 3,
        totalPenalty: 4750000,
        bondNumbers: 'SB-2024-0041, SB-2024-0042, SB-2025-0019',
        obligees: 'Colorado Dept of Transportation, CDOT Region 6, City of Aurora',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      customer_since: {
        customerSinceDate: '2019-03-12',
        tenureYears: 7.5,
        relationshipNotes: 'Introduced via Mountain West broker network',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      fliq_rate: {
        fliqScore: 68.4,
        currentRatio: 1.12,
        quickRatio: 0.89,
        fliqAsOfDate: '2026-06-30',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      dtf: {
        avgDtfDays: 312,
        dtfTrend: 'Increasing',
        contractsAnalyzed: 8,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      pms: {
        pmsScore: 72.1,
        pmsGrade: 'B',
        pmsAsOfDate: '2026-07-01',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      entry_types: {
        newEntries: 1,
        renewalEntries: 2,
        riderEntries: 0,
        continuationEntries: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      extended_suspended: {
        extendedCount: 1,
        suspendedCount: 0,
        extendedPenalty: 1200000,
        suspendedPenalty: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      add_cvd: {
        addExposure: 0,
        cvdExposure: 0,
        addCvdNotes: 'Not applicable — domestic construction only',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      ld_claims: {
        ldClaimCount: 0,
        ldClaimTotal: 0,
        ldOpenCount: 0,
        ldResolvedCount: 0,
        sourceLineage: { sourceFile: 'claims_update_sept2026.csv', sourceSheet: 'Sheet1', sourceRow: 12, importBatchId: 'BATCH-2026-0009', importTimestamp: '2026-09-08T14:16:02Z' }
      },
      id_bills: {
        idBillCount: 0,
        idBillTotal: 0,
        idBillOutstanding: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      other_claims: {
        otherClaimCount: 0,
        otherClaimTotal: 0,
        otherClaimNotes: 'No claims on record',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      premium: {
        writtenPremium: 47500,
        earnedPremium: 39200,
        priorPremium: 43000,
        premiumRate: 1.0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Premium History', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      paid_claims: {
        paidClaimsTotal: 0,
        paidClaimsPeriod: 0,
        recoveries: 0,
        netLoss: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      collateral: {
        collateralType: 'None',
        collateralAmount: 0,
        collateralExpiry: null,
        collateralNotes: 'No collateral held',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Collateral Register', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      gia: {
        giaExecuted: true,
        giaDate: '2019-03-12',
        giaIndemnitors: 'Meridian Construction Group LLC, James R. Whitfield (Personal)',
        giaAmendments: 1,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      open_exposure: {
        openExposureTotal: 4750000,
        openBondCount: 3,
        largestSingleExposure: 2800000,
        exposureAsOfDate: '2026-09-15',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 5, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
    }
  },
  {
    id: 'RR-2026-0038',
    canonicalId: 'PRI-0938|PERF|2026-10-08',
    principalId: 'PRI-0938',
    principalName: 'Apex Earthworks Inc',
    bondType: 'Performance Bond',
    expiryDate: '2026-10-08',
    importBatchId: 'BATCH-2026-0012',
    importTimestamp: '2026-09-15T09:32:14Z',
    dataCompleteness: 81,
    dataGroups: {
      active_bonds: {
        bondCount: 2,
        totalPenalty: 2100000,
        bondNumbers: 'SB-2025-0038, SB-2025-0044',
        obligees: 'City of Denver Public Works, Adams County',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      customer_since: {
        customerSinceDate: '2021-07-20',
        tenureYears: 5.2,
        relationshipNotes: 'Direct submission — no broker',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      fliq_rate: {
        fliqScore: 41.2,
        currentRatio: 0.94,
        quickRatio: 0.71,
        fliqAsOfDate: '2026-06-30',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      dtf: {
        avgDtfDays: 428,
        dtfTrend: 'Deteriorating',
        contractsAnalyzed: 5,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      pms: {
        pmsScore: 51.8,
        pmsGrade: 'C+',
        pmsAsOfDate: '2026-07-01',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      entry_types: {
        newEntries: 0,
        renewalEntries: 2,
        riderEntries: 1,
        continuationEntries: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      extended_suspended: {
        extendedCount: 0,
        suspendedCount: 1,
        extendedPenalty: 0,
        suspendedPenalty: 850000,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      add_cvd: {
        addExposure: 0,
        cvdExposure: 0,
        addCvdNotes: 'Not applicable',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      ld_claims: {
        ldClaimCount: 1,
        ldClaimTotal: 340000,
        ldOpenCount: 1,
        ldResolvedCount: 0,
        sourceLineage: { sourceFile: 'claims_update_sept2026.csv', sourceSheet: 'Sheet1', sourceRow: 4, importBatchId: 'BATCH-2026-0009', importTimestamp: '2026-09-08T14:16:02Z' }
      },
      id_bills: {
        idBillCount: 1,
        idBillTotal: 187000,
        idBillOutstanding: 187000,
        sourceLineage: { sourceFile: 'claims_update_sept2026.csv', sourceSheet: 'Sheet1', sourceRow: 4, importBatchId: 'BATCH-2026-0009', importTimestamp: '2026-09-08T14:16:02Z' }
      },
      other_claims: {
        otherClaimCount: 0,
        otherClaimTotal: 0,
        otherClaimNotes: null,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      premium: {
        writtenPremium: 21000,
        earnedPremium: 18900,
        priorPremium: 19500,
        premiumRate: 1.0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Premium History', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      paid_claims: {
        paidClaimsTotal: 340000,
        paidClaimsPeriod: 340000,
        recoveries: 0,
        netLoss: 340000,
        sourceLineage: { sourceFile: 'claims_update_sept2026.csv', sourceSheet: 'Sheet1', sourceRow: 4, importBatchId: 'BATCH-2026-0009', importTimestamp: '2026-09-08T14:16:02Z' }
      },
      collateral: {
        collateralType: 'Cash Deposit',
        collateralAmount: 200000,
        collateralExpiry: '2027-01-31',
        collateralNotes: 'Held per claim reserve requirement',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Collateral Register', sourceRow: 3, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      gia: {
        giaExecuted: true,
        giaDate: '2021-07-20',
        giaIndemnitors: 'Apex Earthworks Inc, Robert T. Nguyen (Personal)',
        giaAmendments: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      open_exposure: {
        openExposureTotal: 2100000,
        openBondCount: 2,
        largestSingleExposure: 1400000,
        exposureAsOfDate: '2026-09-15',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 8, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
    }
  },
  {
    id: 'RR-2026-0055',
    canonicalId: 'PRI-1155|SUBDIV|2026-11-20',
    principalId: 'PRI-1155',
    principalName: 'Silverline Mechanical Contractors',
    bondType: 'Subdivision Bond',
    expiryDate: '2026-11-20',
    importBatchId: 'BATCH-2026-0012',
    importTimestamp: '2026-09-15T09:32:14Z',
    dataCompleteness: 100,
    dataGroups: {
      active_bonds: {
        bondCount: 1,
        totalPenalty: 875000,
        bondNumbers: 'SB-2025-0055',
        obligees: 'Jefferson County Planning Dept',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      customer_since: {
        customerSinceDate: '2017-11-05',
        tenureYears: 8.9,
        relationshipNotes: 'Long-standing account — consistent renewal history',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      fliq_rate: {
        fliqScore: 84.7,
        currentRatio: 1.88,
        quickRatio: 1.42,
        fliqAsOfDate: '2026-06-30',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      dtf: {
        avgDtfDays: 198,
        dtfTrend: 'Stable',
        contractsAnalyzed: 11,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      pms: {
        pmsScore: 88.3,
        pmsGrade: 'A-',
        pmsAsOfDate: '2026-07-01',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      entry_types: {
        newEntries: 0,
        renewalEntries: 1,
        riderEntries: 0,
        continuationEntries: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      extended_suspended: {
        extendedCount: 0,
        suspendedCount: 0,
        extendedPenalty: 0,
        suspendedPenalty: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      add_cvd: {
        addExposure: 0,
        cvdExposure: 0,
        addCvdNotes: 'Not applicable',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      ld_claims: {
        ldClaimCount: 0,
        ldClaimTotal: 0,
        ldOpenCount: 0,
        ldResolvedCount: 0,
        sourceLineage: { sourceFile: 'claims_update_sept2026.csv', sourceSheet: 'Sheet1', sourceRow: 9, importBatchId: 'BATCH-2026-0009', importTimestamp: '2026-09-08T14:16:02Z' }
      },
      id_bills: {
        idBillCount: 0,
        idBillTotal: 0,
        idBillOutstanding: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      other_claims: {
        otherClaimCount: 0,
        otherClaimTotal: 0,
        otherClaimNotes: 'Clean claims history',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      premium: {
        writtenPremium: 8750,
        earnedPremium: 7200,
        priorPremium: 8200,
        premiumRate: 1.0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Premium History', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      paid_claims: {
        paidClaimsTotal: 0,
        paidClaimsPeriod: 0,
        recoveries: 0,
        netLoss: 0,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Claims Summary', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      collateral: {
        collateralType: 'None',
        collateralAmount: 0,
        collateralExpiry: null,
        collateralNotes: 'No collateral required',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Collateral Register', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      gia: {
        giaExecuted: true,
        giaDate: '2017-11-05',
        giaIndemnitors: 'Silverline Mechanical Contractors, Patricia A. Delgado (Personal)',
        giaAmendments: 2,
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
      open_exposure: {
        openExposureTotal: 875000,
        openBondCount: 1,
        largestSingleExposure: 875000,
        exposureAsOfDate: '2026-09-15',
        sourceLineage: { sourceFile: 'renewal_portfolio_Q3_2026.xlsx', sourceSheet: 'Active Bonds', sourceRow: 14, importBatchId: 'BATCH-2026-0012', importTimestamp: '2026-09-15T09:32:14Z' }
      },
    }
  },
];

// ════════════════════════════════════════════════════════════════
// SAMPLE IMPORT ERRORS
// ════════════════════════════════════════════════════════════════

export const sampleImportErrors = [
  {
    id: 'ERR-2026-0012-001',
    batchId: 'BATCH-2026-0012',
    row: 22,
    field: 'fliqAsOfDate',
    dataGroup: 'fliq_rate',
    errorType: 'MissingRequired',
    rawValue: null,
    message: 'Required field "FLIQ As-Of Date" is missing. Row skipped.',
    principalId: 'PRI-0744',
    principalName: 'Ridgeline Grading LLC',
  },
  {
    id: 'ERR-2026-0012-002',
    batchId: 'BATCH-2026-0012',
    row: 35,
    field: 'currentRatio',
    dataGroup: 'fliq_rate',
    errorType: 'InvalidNumeric',
    rawValue: 'N/A',
    message: 'Field "Current Ratio" contains non-numeric value "N/A". Expected decimal number.',
    principalId: 'PRI-0812',
    principalName: 'Cascade Utility Contractors',
  },
  {
    id: 'ERR-2026-0012-003',
    batchId: 'BATCH-2026-0012',
    row: 41,
    field: 'canonicalId',
    dataGroup: 'active_bonds',
    errorType: 'Duplicate',
    rawValue: 'PRI-1041|PERF-PAY|2026-10-15',
    message: 'Duplicate canonical identity detected. Existing record RR-2026-0041 retained. Import row skipped.',
    principalId: 'PRI-1041',
    principalName: 'Meridian Construction Group LLC',
  },
  {
    id: 'ERR-2026-0009-001',
    batchId: 'BATCH-2026-0009',
    row: 7,
    field: 'ldClaimTotal',
    dataGroup: 'ld_claims',
    errorType: 'Duplicate',
    rawValue: '340000',
    message: 'Duplicate claim record: same principalId + claimDate already exists. Existing record retained.',
    principalId: 'PRI-0938',
    principalName: 'Apex Earthworks Inc',
  },
  {
    id: 'ERR-2026-0009-002',
    batchId: 'BATCH-2026-0009',
    row: 11,
    field: 'ldClaimTotal',
    dataGroup: 'ld_claims',
    errorType: 'Duplicate',
    rawValue: '125000',
    message: 'Duplicate claim record: same principalId + claimDate already exists. Existing record retained.',
    principalId: 'PRI-0622',
    principalName: 'Frontier Paving Partners',
  },
  {
    id: 'ERR-2026-0009-003',
    batchId: 'BATCH-2026-0009',
    row: 15,
    field: 'paidClaimsTotal',
    dataGroup: 'paid_claims',
    errorType: 'Duplicate',
    rawValue: '89500',
    message: 'Duplicate paid claim record detected. Existing record retained.',
    principalId: 'PRI-0711',
    principalName: 'Highpoint Structural Inc',
  },
];

// ════════════════════════════════════════════════════════════════
// ROLES
// ════════════════════════════════════════════════════════════════

export const roles = [
  {
    id: "role_administrator",
    name: "Administrator",
    description: "Full system access including user management, role configuration, system settings, and all underwriting operations. Intended for platform administrators only.",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "role_l2_senior_underwriter",
    name: "L2 Senior Underwriter",
    description: "Senior underwriting authority with full renewal approval rights, AI brief override capability, portfolio intelligence access, and the ability to refer cases for escalation.",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "role_l1_underwriter",
    name: "L1 Underwriter",
    description: "Standard underwriting access for reviewing renewals, requesting information, tracking correspondence, and submitting cases for L2 review. Cannot approve or override AI recommendations independently.",
    createdAt: "2026-01-01T00:00:00Z"
  }
];

// ════════════════════════════════════════════════════════════════
// PERMISSIONS
// ════════════════════════════════════════════════════════════════

export const permissions = [
  // ── Renewals ─────────────────────────────────────────────────
  {
    id: "perm_view_renewal",
    key: "VIEW_RENEWAL",
    name: "View Renewal",
    category: "Renewals",
    description: "Read access to renewal cases, case details, and associated documents."
  },
  {
    id: "perm_edit_renewal",
    key: "EDIT_RENEWAL",
    name: "Edit Renewal",
    category: "Renewals",
    description: "Ability to update renewal case fields, status, and notes."
  },
  {
    id: "perm_assign_renewal",
    key: "ASSIGN_RENEWAL",
    name: "Assign Renewal",
    category: "Renewals",
    description: "Ability to assign or reassign renewal cases to underwriters."
  },
  {
    id: "perm_approve_renewal",
    key: "APPROVE_RENEWAL",
    name: "Approve Renewal",
    category: "Renewals",
    description: "Authority to issue a final renewal approval decision on a case."
  },
  {
    id: "perm_refer_renewal",
    key: "REFER_RENEWAL",
    name: "Refer Renewal",
    category: "Renewals",
    description: "Ability to refer a renewal case for escalation or senior review."
  },
  {
    id: "perm_request_info",
    key: "REQUEST_INFO",
    name: "Request Information",
    category: "Renewals",
    description: "Ability to create and send information requests to principals or brokers."
  },
  // ── AI ────────────────────────────────────────────────────────
  {
    id: "perm_review_ai",
    key: "REVIEW_AI",
    name: "Review AI Recommendation",
    category: "AI",
    description: "Access to view AI advisory panels, confidence scores, and risk factor breakdowns."
  },
  {
    id: "perm_override_ai",
    key: "OVERRIDE_AI",
    name: "Override AI Recommendation",
    category: "AI",
    description: "Authority to override an AI recommendation with a documented underwriter rationale."
  },
  // ── Portfolio ─────────────────────────────────────────────────
  {
    id: "perm_view_portfolio",
    key: "VIEW_PORTFOLIO",
    name: "View Portfolio",
    category: "Portfolio",
    description: "Access to portfolio-level metrics, aggregate exposure, and renewal hit-rate analytics."
  },
  // ── Administration ────────────────────────────────────────────
  {
    id: "perm_manage_users",
    key: "MANAGE_USERS",
    name: "Manage Users",
    category: "Administration",
    description: "Create, edit, deactivate, and manage user accounts and role assignments."
  },
  {
    id: "perm_manage_roles",
    key: "MANAGE_ROLES",
    name: "Manage Roles",
    category: "Administration",
    description: "Create and modify roles and their associated permission sets."
  },
  {
    id: "perm_view_audit",
    key: "VIEW_AUDIT",
    name: "View Audit History",
    category: "Administration",
    description: "Access to the full system audit trail including all user actions and system events."
  },
  {
    id: "perm_manage_imports",
    key: "MANAGE_IMPORTS",
    name: "Manage Data Imports",
    category: "Administration",
    description: "Ability to import bulk data, manage data feeds, and configure integration pipelines."
  },
  {
    id: "perm_manage_rules",
    key: "MANAGE_RULES",
    name: "Manage Rules",
    category: "Administration",
    description: "Configure underwriting rules, authority thresholds, and automated workflow triggers."
  },
  {
    id: "perm_manage_system",
    key: "MANAGE_SYSTEM",
    name: "Manage System",
    category: "Administration",
    description: "Access to system-level configuration, integrations, and platform settings."
  }
];

// ════════════════════════════════════════════════════════════════
// AUTHORITY CONFIGURATION (placeholder — values to be configured
// by administrators per customer underwriting guidelines)
// ════════════════════════════════════════════════════════════════

export const authorityConfig = {
  description: "Configurable underwriting authority thresholds. Values are set by administrators in accordance with customer-approved underwriting guidelines and are not hard-coded in the application.",
  levels: [
    {
      id: "auth_l1",
      code: "L1",
      label: "L1 Underwriter Authority",
      description: "Standard authority level for L1 underwriters. Specific bond penalty and aggregate limits are configured by administrators.",
      configuredLimits: null  // Populated by admin configuration
    },
    {
      id: "auth_l2",
      code: "L2",
      label: "L2 Senior Underwriter Authority",
      description: "Senior authority level for L2 underwriters with higher approval thresholds. Specific limits are configured by administrators.",
      configuredLimits: null  // Populated by admin configuration
    },
    {
      id: "auth_admin",
      code: "Admin",
      label: "Administrator Authority",
      description: "Administrative access — not an underwriting authority level.",
      configuredLimits: null
    }
  ],
  lastUpdated: null,
  updatedBy: null
};
