import { useState, useCallback, useRef } from 'react';
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle, Clock,
  ChevronDown, ChevronRight, Search, Filter, Download, Eye,
  RefreshCw, Database, Shield, Info, X, ArrowRight, Layers,
  BarChart2, AlertCircle, FileCheck, Trash2, ExternalLink
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { PERMISSIONS } from '../auth/permissions';
import { api } from '../services/apiClient';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  completed:  { bg: 'bg-teal-100',   text: 'text-teal-800',   label: 'Completed' },
  partial:    { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partial'   },
  failed:     { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Failed'    },
  pending:    { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Pending'   },
  processing: { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Processing'},
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {Icon && <Icon size={15} className="text-teal-600" />}
          {title}
        </div>
        {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

// ─── DATA GROUP FIELD DEFINITIONS (16 groups) ───────────────────────────────

const DATA_GROUPS = [
  { id: 'activeBonds',          label: 'Active Bonds',              fields: ['bondCount','totalPenalty','bondTypes'] },
  { id: 'customerSince',        label: 'Customer Since',            fields: ['customerSinceDate','relationshipYears'] },
  { id: 'fliqRate',             label: 'FLIQ Rate',                 fields: ['fliqRate','fliqCategory'] },
  { id: 'dtf',                  label: 'Average DTF',               fields: ['avgDTF','dtfTrend'] },
  { id: 'pms',                  label: 'PMS',                       fields: ['pmsScore','pmsCategory'] },
  { id: 'entryTypes',           label: 'Entry Types',               fields: ['entryTypeBreakdown','primaryEntryType'] },
  { id: 'extendedSuspended',    label: 'Extended / Suspended',      fields: ['extendedCount','suspendedCount','extendedValue'] },
  { id: 'addCvd',               label: 'ADD / CVD',                 fields: ['addExposure','cvdExposure','addCvdTotal'] },
  { id: 'ldClaims',             label: 'LD Claims',                 fields: ['ldClaimCount','ldClaimValue','ldClaimStatus'] },
  { id: 'idBills',              label: 'ID Bills',                  fields: ['idBillCount','idBillValue','idBillOutstanding'] },
  { id: 'otherClaims',          label: 'Other Claims',              fields: ['otherClaimCount','otherClaimValue'] },
  { id: 'premium',              label: 'Premium',                   fields: ['currentPremium','priorPremium','premiumChange'] },
  { id: 'paidClaims',           label: 'Paid Claims',               fields: ['paidClaimTotal','paidClaimCount','paidClaimYTD'] },
  { id: 'collateral',           label: 'Collateral',                fields: ['collateralType','collateralValue','collateralCoverage'] },
  { id: 'gia',                  label: 'GIA',                       fields: ['giaStatus','giaDate','giaVersion'] },
  { id: 'openExposure',         label: 'Open Exposure',             fields: ['openExposureTotal','openExposureCount','openExposureRisk'] },
];

// Simulated column headers that might appear in an uploaded file
const SAMPLE_DETECTED_COLUMNS = [
  'Principal Name', 'Principal ID', 'Bond Number', 'Bond Type', 'Bond Penalty',
  'Customer Since', 'FLIQ Rate', 'DTF Average', 'PMS Score', 'Entry Type',
  'Extended Count', 'Suspended Count', 'ADD Exposure', 'CVD Exposure',
  'LD Claim Count', 'LD Claim Value', 'ID Bill Count', 'ID Bill Value',
  'Other Claims', 'Current Premium', 'Prior Premium', 'Paid Claims Total',
  'Collateral Value', 'Collateral Type', 'GIA Status', 'Open Exposure',
  'Bond Count', 'Total Penalty', 'Relationship Years',
];

// Canonical target fields for mapping
const TARGET_FIELDS = [
  { id: 'principalName',  label: 'Principal Name',  required: true  },
  { id: 'principalId',    label: 'Principal ID',     required: true  },
  { id: 'bondType',       label: 'Bond Type',        required: true  },
  { id: 'bondPenalty',    label: 'Bond Penalty',     required: true  },
  { id: 'bondCount',      label: 'Bond Count',       required: false },
  { id: 'customerSince',  label: 'Customer Since',   required: false },
  { id: 'fliqRate',       label: 'FLIQ Rate',        required: false },
  { id: 'avgDTF',         label: 'Avg DTF',          required: false },
  { id: 'pmsScore',       label: 'PMS Score',        required: false },
  { id: 'entryType',      label: 'Entry Type',       required: false },
  { id: 'extendedCount',  label: 'Extended Count',   required: false },
  { id: 'suspendedCount', label: 'Suspended Count',  required: false },
  { id: 'addExposure',    label: 'ADD Exposure',     required: false },
  { id: 'cvdExposure',    label: 'CVD Exposure',     required: false },
  { id: 'ldClaimCount',   label: 'LD Claim Count',   required: false },
  { id: 'ldClaimValue',   label: 'LD Claim Value',   required: false },
  { id: 'idBillCount',    label: 'ID Bill Count',    required: false },
  { id: 'idBillValue',    label: 'ID Bill Value',    required: false },
  { id: 'otherClaims',    label: 'Other Claims',     required: false },
  { id: 'currentPremium', label: 'Current Premium',  required: false },
  { id: 'priorPremium',   label: 'Prior Premium',    required: false },
  { id: 'paidClaimsTotal',label: 'Paid Claims Total',required: false },
  { id: 'collateralValue',label: 'Collateral Value', required: false },
  { id: 'collateralType', label: 'Collateral Type',  required: false },
  { id: 'giaStatus',      label: 'GIA Status',       required: false },
  { id: 'openExposure',   label: 'Open Exposure',    required: false },
];

// Auto-suggest mapping from detected column → target field
function autoMap(detectedColumns) {
  const map = {};
  const normalize = s => s.toLowerCase().replace(/[\s_\-/]/g, '');
  detectedColumns.forEach(col => {
    const nc = normalize(col);
    const match = TARGET_FIELDS.find(tf => normalize(tf.label) === nc || normalize(tf.id) === nc);
    if (match) map[col] = match.id;
    else map[col] = '';
  });
  return map;
}

// ─── IMPORT TAB ──────────────────────────────────────────────────────────────

function ImportTab({ onImportComplete }) {
  const [dragOver, setDragOver]       = useState(false);
  const [file, setFile]               = useState(null);
  const [step, setStep]               = useState('upload'); // upload | mapping | preview | done
  const [columnMappings, setColumnMappings] = useState({});
  const [detectedColumns, setDetectedColumns] = useState([]);
  const [previewResult, setPreviewResult]     = useState(null);
  const [confirmResult, setConfirmResult]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [detectDuplicates, setDetectDuplicates] = useState(true);
  const fileInputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  }, []);

  const acceptFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx','xls','csv'].includes(ext)) {
      setError('Unsupported file format. Please upload .xlsx, .xls, or .csv files.');
      return;
    }
    setError(null);
    setFile(f);
    // Simulate column detection
    setTimeout(() => {
      const cols = SAMPLE_DETECTED_COLUMNS.slice(0, 18 + Math.floor(Math.random() * 8));
      setDetectedColumns(cols);
      setColumnMappings(autoMap(cols));
      setStep('mapping');
    }, 600);
  };

  const handleFileInput = (e) => {
    if (e.target.files[0]) acceptFile(e.target.files[0]);
  };

  const requiredMapped = TARGET_FIELDS.filter(tf => tf.required).every(tf =>
    Object.values(columnMappings).includes(tf.id)
  );

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.previewImport(
        { name: file.name, size: file.size, type: file.type },
        columnMappings
      );
      setPreviewResult(result);
      setStep('preview');
    } catch (err) {
      setError(err.message || 'Preview failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.confirmImport(previewResult.batchId, previewResult);
      setConfirmResult(result);
      setStep('done');
      onImportComplete?.();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setStep('upload'); setColumnMappings({});
    setDetectedColumns([]); setPreviewResult(null); setConfirmResult(null);
    setError(null);
  };

  // ── Upload Step ──
  if (step === 'upload') return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-sm text-blue-700">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>Upload Excel (.xlsx/.xls) or CSV files containing renewal source data. Columns will be mapped to the 16 normalized data groups.</span>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
          <XCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
        }`}
      >
        <Upload size={36} className="mx-auto mb-3 text-slate-400" />
        <p className="text-slate-700 font-medium mb-1">Drag & drop your file here</p>
        <p className="text-slate-500 text-sm mb-3">or click to browse</p>
        <p className="text-xs text-slate-400">Supported: .xlsx, .xls, .csv — Max 50MB</p>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileInput} />
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" id="dupCheck" checked={detectDuplicates} onChange={e => setDetectDuplicates(e.target.checked)} className="rounded" />
        <label htmlFor="dupCheck">Enable duplicate detection (recommended)</label>
      </div>
    </div>
  );

  // ── Mapping Step ──
  if (step === 'mapping') return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-teal-600" />
          <span className="font-medium text-slate-700">{file?.name}</span>
          <span className="text-xs text-slate-500">({detectedColumns.length} columns detected)</span>
        </div>
        <button onClick={handleReset} className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1">
          <X size={13} /> Remove file
        </button>
      </div>

      {/* Required fields checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Required Field Mapping</p>
        <div className="flex flex-wrap gap-2">
          {TARGET_FIELDS.filter(tf => tf.required).map(tf => {
            const mapped = Object.values(columnMappings).includes(tf.id);
            return (
              <span key={tf.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                mapped ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-700'
              }`}>
                {mapped ? <CheckCircle size={11} /> : <XCircle size={11} />}
                {tf.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 gap-0 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <span>Detected Column</span>
          <span>Map To Field</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {detectedColumns.map(col => (
            <div key={col} className="grid grid-cols-2 gap-4 px-4 py-2 items-center hover:bg-slate-50">
              <span className="text-sm text-slate-700 font-mono truncate">{col}</span>
              <select
                value={columnMappings[col] || ''}
                onChange={e => setColumnMappings(prev => ({ ...prev, [col]: e.target.value }))}
                className="text-sm border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">— Skip —</option>
                {TARGET_FIELDS.map(tf => (
                  <option key={tf.id} value={tf.id}>{tf.label}{tf.required ? ' *' : ''}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex gap-2">
          <XCircle size={15} className="mt-0.5 shrink-0" />{error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button onClick={handleReset} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button
          onClick={handlePreview}
          disabled={!requiredMapped || loading}
          className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
          Preview Import
        </button>
      </div>
    </div>
  );

  // ── Preview Step ──
  if (step === 'preview' && previewResult) {
    const { rows = [], errors = [], duplicates = [], summary = {} } = previewResult;
    return (
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Rows',   value: summary.totalRows   ?? 0, color: 'text-slate-700', bg: 'bg-slate-50'  },
            { label: 'Valid',        value: summary.validRows   ?? 0, color: 'text-teal-700',  bg: 'bg-teal-50'   },
            { label: 'Errors',       value: summary.errorRows   ?? 0, color: 'text-red-700',   bg: 'bg-red-50'    },
            { label: 'Duplicates',   value: summary.duplicates  ?? 0, color: 'text-yellow-700',bg: 'bg-yellow-50' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-lg p-3 text-center`}>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Error list */}
        {errors.length > 0 && (
          <div className="border border-red-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 px-4 py-2 flex items-center gap-2 text-sm font-semibold text-red-700">
              <AlertTriangle size={14} /> Validation Errors ({errors.length})
            </div>
            <div className="divide-y divide-red-100 max-h-40 overflow-y-auto">
              {errors.map((err, i) => (
                <div key={i} className="px-4 py-2 text-xs text-slate-700 flex gap-3">
                  <span className="text-slate-400 font-mono w-12 shrink-0">Row {err.row}</span>
                  <span className="text-red-600 font-medium w-28 shrink-0">{err.field}</span>
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate list */}
        {duplicates.length > 0 && (
          <div className="border border-yellow-200 rounded-lg overflow-hidden">
            <div className="bg-yellow-50 px-4 py-2 flex items-center gap-2 text-sm font-semibold text-yellow-700">
              <AlertCircle size={14} /> Duplicate Records ({duplicates.length}) — will be skipped
            </div>
            <div className="divide-y divide-yellow-100 max-h-32 overflow-y-auto">
              {duplicates.map((d, i) => (
                <div key={i} className="px-4 py-2 text-xs text-slate-700 flex gap-3">
                  <span className="text-slate-400 font-mono w-12 shrink-0">Row {d.row}</span>
                  <span>{d.principalName} — {d.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Preview (first {Math.min(rows.length, 5)} rows)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-600 font-medium">Row</th>
                  <th className="px-3 py-2 text-left text-slate-600 font-medium">Principal</th>
                  <th className="px-3 py-2 text-left text-slate-600 font-medium">Bond Type</th>
                  <th className="px-3 py-2 text-left text-slate-600 font-medium">Bond Penalty</th>
                  <th className="px-3 py-2 text-left text-slate-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className={row.status === 'error' ? 'bg-red-50' : row.status === 'duplicate' ? 'bg-yellow-50' : 'hover:bg-slate-50'}>
                    <td className="px-3 py-2 font-mono text-slate-400">{row.rowNumber}</td>
                    <td className="px-3 py-2 text-slate-700">{row.principalName || '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{row.bondType || '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{row.bondPenalty ? `₹${(row.bondPenalty ?? 0).toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'valid'     ? 'bg-teal-100 text-teal-800' :
                        row.status === 'error'     ? 'bg-red-100 text-red-700'   :
                        row.status === 'duplicate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.status === 'valid' && <CheckCircle size={10} />}
                        {row.status === 'error' && <XCircle size={10} />}
                        {row.status === 'duplicate' && <AlertCircle size={10} />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex gap-2">
            <XCircle size={15} className="mt-0.5 shrink-0" />{error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={() => setStep('mapping')} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            Back to Mapping
          </button>
          <button onClick={handleReset} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (summary.validRows ?? 0) === 0}
            className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Confirm Import ({summary.validRows ?? 0} records)
          </button>
        </div>
      </div>
    );
  }

  // ── Done Step ──
  if (step === 'done' && confirmResult) return (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={32} className="text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Import Completed Successfully</h3>
      <div className="flex justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-teal-700">{confirmResult.imported ?? 0}</p>
          <p className="text-slate-500">Imported</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{confirmResult.skipped ?? 0}</p>
          <p className="text-slate-500">Skipped</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{confirmResult.errors ?? 0}</p>
          <p className="text-slate-500">Errors</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">Batch ID: {confirmResult.batchId}</p>
      <button onClick={handleReset} className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
        Import Another File
      </button>
    </div>
  );

  return null;
}

// ─── IMPORT HISTORY TAB ──────────────────────────────────────────────────────

function ImportHistoryTab() {
  const [batches, setBatches]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [batchDetail, setBatchDetail] = useState({});

  useState(() => {
    api.getImportHistory().then(data => {
      setBatches(data || []);
      setLoading(false);
    });
  });

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!batchDetail[id]) {
      const detail = await api.getImportBatchById(id);
      setBatchDetail(prev => ({ ...prev, [id]: detail }));
    }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
    </div>
  );

  if (!batches.length) return (
    <div className="text-center py-16 text-slate-400">
      <Clock size={36} className="mx-auto mb-3 opacity-40" />
      <p className="font-medium">No import history yet</p>
      <p className="text-sm mt-1">Completed imports will appear here</p>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 rounded-lg">
        <span className="col-span-2">File</span>
        <span>Uploaded By</span>
        <span>Date</span>
        <span className="text-center">Total</span>
        <span className="text-center">Valid / Errors</span>
        <span className="text-center">Status</span>
      </div>
      {batches.map(batch => (
        <div key={batch.id} className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleExpand(batch.id)}
            className="w-full grid grid-cols-7 gap-2 px-4 py-3 text-sm hover:bg-slate-50 transition-colors items-center"
          >
            <div className="col-span-2 flex items-center gap-2 text-left">
              <FileText size={14} className="text-teal-600 shrink-0" />
              <span className="font-medium text-slate-700 truncate">{batch.filename}</span>
            </div>
            <span className="text-slate-600 text-left">{batch.uploadedBy}</span>
            <span className="text-slate-500 text-left">{new Date(batch.uploadedAt).toLocaleDateString()}</span>
            <span className="text-center text-slate-700 font-medium">{batch.totalRows ?? 0}</span>
            <span className="text-center">
              <span className="text-teal-700 font-medium">{batch.validRows ?? 0}</span>
              <span className="text-slate-400 mx-1">/</span>
              <span className="text-red-600 font-medium">{batch.errorRows ?? 0}</span>
            </span>
            <div className="flex justify-center">
              <StatusBadge status={batch.status} />
            </div>
          </button>
          {expandedId === batch.id && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              {batchDetail[batch.id] ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-slate-500">Source Type:</span> <span className="font-medium text-slate-700">{batchDetail[batch.id].sourceType || '—'}</span></div>
                    <div><span className="text-slate-500">Duplicates:</span> <span className="font-medium text-yellow-700">{batchDetail[batch.id].duplicateRows ?? 0}</span></div>
                    <div><span className="text-slate-500">Imported At:</span> <span className="font-medium text-slate-700">{batchDetail[batch.id].importedAt ? new Date(batchDetail[batch.id].importedAt).toLocaleString() : '—'}</span></div>
                  </div>
                  {(batchDetail[batch.id].errors || []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Validation Errors</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(batchDetail[batch.id].errors || []).map((err, i) => (
                          <div key={i} className="text-xs flex gap-3 text-slate-600">
                            <span className="font-mono text-slate-400 w-12 shrink-0">Row {err.row}</span>
                            <span className="text-red-600 w-28 shrink-0">{err.field}</span>
                            <span>{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <RefreshCw size={13} className="animate-spin" /> Loading details…
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── RENEWAL RECORDS TAB ─────────────────────────────────────────────────────

function RenewalRecordsTab() {
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [lineage, setLineage]         = useState(null);
  const [lineageLoading, setLineageLoading] = useState(false);

  useState(() => {
    api.getRenewalRecords({}).then(data => {
      setRecords(data || []);
      setLoading(false);
    });
  });

  const filtered = (records || []).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.principalName || '').toLowerCase().includes(q) ||
      (r.principalId   || '').toLowerCase().includes(q) ||
      (r.bondType      || '').toLowerCase().includes(q)
    );
  });

  const openLineage = async (record) => {
    setSelectedRecord(record);
    setLineage(null);
    setLineageLoading(true);
    const data = await api.getRenewalSourceLineage(record.id);
    setLineage(data);
    setLineageLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by principal name, ID, or bond type…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Database size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No renewal records found</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 gap-2 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50">
            <span className="col-span-2">Principal</span>
            <span>Bond Type</span>
            <span>Bond Penalty</span>
            <span>Import Source</span>
            <span className="text-center">Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map(record => (
              <div key={record.id} className="grid grid-cols-6 gap-2 px-4 py-3 text-sm hover:bg-slate-50 items-center">
                <div className="col-span-2">
                  <p className="font-medium text-slate-800">{record.principalName}</p>
                  <p className="text-xs text-slate-400 font-mono">{record.principalId}</p>
                </div>
                <span className="text-slate-600">{record.bondType}</span>
                <span className="text-slate-700 font-medium">
                  {record.bondPenalty ? `₹${(record.bondPenalty ?? 0).toLocaleString()}` : '—'}
                </span>
                <div>
                  {record.sourceLineage?.importBatchId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200">
                      <FileCheck size={10} /> {record.sourceLineage.sourceFile || 'Imported'}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => openLineage(record)}
                    className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 font-medium"
                  >
                    <Layers size={12} /> Lineage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Lineage Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedRecord(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Source Lineage</h3>
                <p className="text-xs text-slate-500">{selectedRecord.principalName} — {selectedRecord.principalId}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {lineageLoading ? (
                <div className="space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
                </div>
              ) : lineage ? (
                DATA_GROUPS.map(group => {
                  const gl = lineage[group.id];
                  return (
                    <div key={group.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">{group.label}</span>
                        {gl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200">
                            <FileCheck size={10} /> {gl.sourceFile}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No data</span>
                        )}
                      </div>
                      {gl && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Sheet: <span className="text-slate-700">{gl.sourceSheet || '—'}</span></span>
                          <span>Row: <span className="text-slate-700">{gl.sourceRow || '—'}</span></span>
                          <span>Batch: <span className="font-mono text-slate-600">{gl.importBatchId}</span></span>
                          <span>Imported: <span className="text-slate-700">{gl.importTimestamp ? new Date(gl.importTimestamp).toLocaleDateString() : '—'}</span></span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No lineage data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DATA QUALITY TAB ────────────────────────────────────────────────────────

function DataQualityTab() {
  const [records, setRecords]   = useState([]);
  const [batches, setBatches]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useState(() => {
    Promise.all([api.getRenewalRecords({}), api.getImportHistory()]).then(([recs, bats]) => {
      setRecords(recs || []);
      setBatches(bats || []);
      setLoading(false);
    });
  });

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  );

  // Compute quality metrics
  const totalRecords    = records.length;
  const missingFields   = records.filter(r => DATA_GROUPS.some(g => !r[g.id])).length;
  const withConflicts   = records.filter(r => r.hasConflict).length;
  const withWarnings    = records.filter(r => r.hasWarning).length;
  const completePct     = totalRecords > 0
    ? Math.round(((totalRecords - missingFields) / totalRecords) * 100)
    : 0;

  const qualityCards = [
    { label: 'Total Records',          value: totalRecords,  color: 'text-slate-800',  bg: 'bg-white',       icon: Database,       border: 'border-slate-200' },
    { label: 'Missing Data Groups',    value: missingFields, color: 'text-yellow-700', bg: 'bg-yellow-50',   icon: AlertTriangle,  border: 'border-yellow-200' },
    { label: 'Conflicting Records',    value: withConflicts, color: 'text-red-700',    bg: 'bg-red-50',      icon: XCircle,        border: 'border-red-200' },
    { label: 'Validation Warnings',    value: withWarnings,  color: 'text-orange-700', bg: 'bg-orange-50',   icon: AlertCircle,    border: 'border-orange-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {qualityCards.map(card => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <card.icon size={18} className={card.color} />
              <span className={`text-2xl font-bold ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-xs text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Overall completeness bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Data Completeness</span>
          <span className="text-sm font-bold text-teal-700">{completePct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completePct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{totalRecords - missingFields} of {totalRecords} records have all 16 data groups populated</p>
      </div>

      {/* Per-batch quality table */}
      {batches.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Per-Batch Quality Breakdown
          </div>
          <div className="divide-y divide-slate-100">
            {batches.map(batch => {
              const pct = batch.totalRows > 0
                ? Math.round((batch.validRows / batch.totalRows) * 100)
                : 0;
              return (
                <div key={batch.id} className="px-4 py-3 grid grid-cols-5 gap-3 text-sm items-center">
                  <div className="col-span-2">
                    <p className="font-medium text-slate-700 truncate">{batch.filename}</p>
                    <p className="text-xs text-slate-400">{new Date(batch.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-teal-700">{batch.validRows ?? 0}</p>
                    <p className="text-xs text-slate-400">Valid</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-red-600">{batch.errorRows ?? 0}</p>
                    <p className="text-xs text-slate-400">Errors</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-600 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data group coverage */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Data Group Coverage Across All Records
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {DATA_GROUPS.map(group => {
            const populated = records.filter(r => r[group.id] != null).length;
            const pct = totalRecords > 0 ? Math.round((populated / totalRecords) * 100) : 0;
            return (
              <div key={group.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-36 shrink-0">{group.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pct >= 80 ? 'bg-teal-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'import',   label: 'Import',          icon: Upload      },
  { id: 'history',  label: 'Import History',  icon: Clock       },
  { id: 'records',  label: 'Renewal Records', icon: Database    },
  { id: 'quality',  label: 'Data Quality',    icon: BarChart2   },
];

export function DataIngestion() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [historyKey, setHistoryKey] = useState(0);

  if (!hasPermission(PERMISSIONS.MANAGE_IMPORTS)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Shield size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm">
          The Data Integration area is restricted to Administrators only.
          Contact your system administrator if you require access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Integration</h1>
          <p className="text-slate-500 text-sm mt-1">
            Import and manage renewal source data across all 16 normalized data groups with full source lineage tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          <Shield size={12} className="text-teal-600" />
          Administrator Only
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'import' && (
          <ImportTab onImportComplete={() => { setHistoryKey(k => k + 1); }} />
        )}
        {activeTab === 'history' && (
          <ImportHistoryTab key={historyKey} />
        )}
        {activeTab === 'records' && (
          <RenewalRecordsTab />
        )}
        {activeTab === 'quality' && (
          <DataQualityTab />
        )}
      </div>
    </div>
  );
}

export default DataIngestion;
