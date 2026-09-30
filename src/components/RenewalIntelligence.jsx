import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Zap, ChevronDown, ChevronRight, ChevronLeft, Shield, AlertTriangle,
  CheckCircle, Clock, TrendingUp, TrendingDown, FileText, Database,
  BarChart2, Search, Filter, RefreshCw, ExternalLink, Info,
  Award, Activity, DollarSign, Users, Calendar, Layers,
  ArrowRight, Eye, Star, AlertCircle, XCircle, CheckSquare, Square
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { api } from '../services/apiClient';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (v, fallback = '—') => (v !== undefined && v !== null && v !== '') ? v : fallback;
const fmtCurrency = (v) => {
  const n = parseFloat(v ?? '');
  if (isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};
const fmtPct = (v) => {
  const n = parseFloat(v ?? '');
  if (isNaN(n)) return '—';
  return n.toFixed(2) + '%';
};
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
};
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff;
};
const urgencyColor = (days) => {
  if (days === null) return 'text-slate-400';
  if (days <= 30) return 'text-red-600';
  if (days <= 60) return 'text-amber-600';
  return 'text-teal-600';
};
const urgencyBg = (days) => {
  if (days === null) return 'bg-slate-100 text-slate-500';
  if (days <= 30) return 'bg-red-50 text-red-700 border border-red-200';
  if (days <= 60) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-teal-50 text-teal-700 border border-teal-200';
};
const confidenceColor = (score) => {
  if (score >= 80) return '#0D9488';
  if (score >= 60) return '#F59E0B';
  return '#DC2626';
};
const recommendationBadge = (rec) => {
  const r = (rec || '').toLowerCase();
  if (r.includes('approve') || r.includes('renew')) return 'bg-teal-100 text-teal-800 border border-teal-200';
  if (r.includes('refer') || r.includes('review')) return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (r.includes('decline') || r.includes('reject')) return 'bg-red-100 text-red-800 border border-red-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

// ─── Confidence Ring (SVG) ───────────────────────────────────────────────────

const ConfidenceRing = ({ score = 0, size = 56 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = confidenceColor(score);
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={12} fontWeight="700" fill={color}>
        {score}%
      </text>
    </svg>
  );
};

// ─── Data Completeness Bar ───────────────────────────────────────────────────

const CompletenessBar = ({ record }) => {
  const groups = [
    'activeBonds', 'customerSince', 'fliqRate', 'dtf', 'pms',
    'entryTypes', 'extendedSuspended', 'addCvd', 'ldClaims', 'idBills',
    'otherClaims', 'premium', 'paidClaims', 'collateral', 'gia', 'openExposure'
  ];
  const populated = groups.filter(g => {
    const grp = record?.dataGroups?.[g];
    if (!grp) return false;
    return Object.values(grp).some(v => v !== null && v !== undefined && v !== '');
  }).length;
  const pct = Math.round((populated / groups.length) * 100);
  const barColor = pct >= 80 ? 'bg-teal-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-10 text-right">{pct}%</span>
      <span className="text-xs text-slate-400">{populated}/{groups.length} groups</span>
    </div>
  );
};

// ─── Source Lineage Badge ────────────────────────────────────────────────────

const LineageBadge = ({ lineage }) => {
  if (!lineage) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200 font-mono">
      <Database size={10} />
      {lineage.sourceFile ? lineage.sourceFile.split('/').pop() : 'Unknown'}
      {lineage.sourceSheet ? ` › ${lineage.sourceSheet}` : ''}
      {lineage.sourceRow ? ` R${lineage.sourceRow}` : ''}
    </span>
  );
};

// ─── Data Group Card ─────────────────────────────────────────────────────────

const DATA_GROUP_META = {
  activeBonds: { label: 'Active Bonds', icon: Shield, fields: ['count', 'totalPenalty', 'bondTypes', 'oldestBondDate'] },
  customerSince: { label: 'Customer Since', icon: Calendar, fields: ['date', 'yearsActive', 'relationshipManager'] },
  fliqRate: { label: 'FLIQ Rate', icon: TrendingUp, fields: ['rate', 'trend', 'lastAssessedDate', 'assessedBy'] },
  dtf: { label: 'Average DTF', icon: Activity, fields: ['averageDtf', 'minDtf', 'maxDtf', 'period'] },
  pms: { label: 'PMS', icon: BarChart2, fields: ['score', 'grade', 'assessmentDate', 'notes'] },
  entryTypes: { label: 'Entry Types', icon: Layers, fields: ['types', 'primaryType', 'secondaryType', 'notes'] },
  extendedSuspended: { label: 'Extended / Suspended Entries', icon: AlertCircle, fields: ['extendedCount', 'suspendedCount', 'totalValue', 'oldestDate'] },
  addCvd: { label: 'ADD / CVD', icon: AlertTriangle, fields: ['addAmount', 'cvdAmount', 'currency', 'period', 'notes'] },
  ldClaims: { label: 'LD Claims', icon: FileText, fields: ['count', 'totalAmount', 'openCount', 'closedCount', 'lastClaimDate'] },
  idBills: { label: 'ID Bills', icon: DollarSign, fields: ['count', 'totalAmount', 'pendingAmount', 'lastBillDate'] },
  otherClaims: { label: 'Other Claims', icon: FileText, fields: ['count', 'totalAmount', 'types', 'notes'] },
  premium: { label: 'Premium', icon: DollarSign, fields: ['currentPremium', 'previousPremium', 'change', 'currency', 'period'] },
  paidClaims: { label: 'Paid Claims', icon: CheckCircle, fields: ['totalPaid', 'count', 'lastPaymentDate', 'currency'] },
  collateral: { label: 'Collateral', icon: Shield, fields: ['type', 'value', 'currency', 'expiryDate', 'notes'] },
  gia: { label: 'GIA', icon: Award, fields: ['status', 'executionDate', 'parties', 'notes'] },
  openExposure: { label: 'Open Exposure', icon: TrendingUp, fields: ['totalExposure', 'currency', 'breakdown', 'asOfDate'] },
};

const DataGroupCard = ({ groupKey, data, lineage, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const meta = DATA_GROUP_META[groupKey] || { label: groupKey, icon: Database, fields: [] };
  const Icon = meta.icon;
  const hasData = data && Object.values(data).some(v => v !== null && v !== undefined && v !== '');

  return (
    <div className={`border rounded-lg overflow-hidden ${hasData ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-60'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className={hasData ? 'text-teal-600' : 'text-slate-400'} />
          <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
          {!hasData && <span className="text-xs text-slate-400 italic ml-1">No data</span>}
        </div>
        <div className="flex items-center gap-2">
          {lineage && <LineageBadge lineage={lineage} />}
          {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
          {hasData ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
              {(meta.fields.length > 0 ? meta.fields : Object.keys(data || {})).map(field => {
                const val = data?.[field];
                if (val === null || val === undefined || val === '') return null;
                const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                const display = Array.isArray(val) ? val.join(', ') : String(val);
                return (
                  <div key={field} className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-medium text-slate-700 break-words">{display}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mt-2">No data available for this group in the current import.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AI Advisory Panel ───────────────────────────────────────────────────────

const AIAdvisoryPanel = ({ advisory, caseId, onAcknowledge }) => {
  const [open, setOpen] = useState(true);
  const [acknowledged, setAcknowledged] = useState(advisory?.acknowledged || false);

  if (!advisory) return (
    <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center">
      <Zap size={24} className="text-slate-300 mx-auto mb-2" />
      <p className="text-sm text-slate-400">No AI advisory available for this renewal.</p>
    </div>
  );

  const handleAck = () => {
    setAcknowledged(true);
    onAcknowledge && onAcknowledge(caseId);
  };

  return (
    <div className="border border-teal-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-white hover:from-teal-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-teal-600" />
          <span className="text-sm font-bold text-teal-800">AI Advisory Brief</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${recommendationBadge(advisory.recommendation)}`}>
            {advisory.recommendation || 'Pending'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceRing score={advisory.confidenceScore || 0} size={40} />
          {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 bg-white border-t border-teal-100 space-y-4">
          {advisory.summary && (
            <p className="text-sm text-slate-600 leading-relaxed">{advisory.summary}</p>
          )}
          <div className="grid grid-cols-1 gap-3">
            {(advisory.riskFactors || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Risk Factors</p>
                <ul className="space-y-1">
                  {(advisory.riskFactors || []).map((f, i) => {
                    const text = typeof f === 'string' ? f : (f?.factor || f?.signal || f?.description || JSON.stringify(f));
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{text}</span>
                        {f?.severity && (
                          <span className={`ml-auto text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${
                            f.severity === 'high' ? 'bg-red-100 text-red-700' :
                            f.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{f.severity}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {(advisory.positiveFactors || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Positive Factors</p>
                <ul className="space-y-1">
                  {(advisory.positiveFactors || []).map((f, i) => {
                    const text = typeof f === 'string' ? f : (f?.factor || f?.signal || f?.description || JSON.stringify(f));
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle size={13} className="text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${acknowledged ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
            <button onClick={handleAck} disabled={acknowledged} className="flex-shrink-0">
              {acknowledged
                ? <CheckSquare size={18} className="text-teal-600" />
                : <Square size={18} className="text-amber-500" />}
            </button>
            <span className={`text-xs font-medium ${acknowledged ? 'text-teal-700' : 'text-amber-700'}`}>
              {acknowledged
                ? 'AI advisory acknowledged by underwriter'
                : 'Underwriter acknowledgement required before proceeding'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Brief Queue Card ────────────────────────────────────────────────────────

// Helper: extract display text from a factor that may be a string or {factor, signal, severity} object
const factorText = (f) => {
  if (!f) return '';
  if (typeof f === 'string') return f;
  return f.factor || f.signal || f.description || JSON.stringify(f);
};

const BriefCard = ({ caseItem, advisory, renewalRecord, selected, onClick }) => {
  const navigate = useNavigate();
  const days = daysUntil(caseItem?.expiryDate);
  const confidence = advisory?.confidenceScore ?? 0;
  const riskCount = (advisory?.riskFactors || []).length;
  const completeness = (() => {
    const groups = Object.keys(DATA_GROUP_META);
    const populated = groups.filter(g => {
      const grp = renewalRecord?.dataGroups?.[g];
      return grp && Object.values(grp).some(v => v !== null && v !== undefined && v !== '');
    }).length;
    return Math.round((populated / groups.length) * 100);
  })();

  return (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
        selected
          ? 'border-teal-400 bg-teal-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-teal-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-slate-800 truncate">{caseItem?.principalName || '—'}</span>
            {advisory?.acknowledged && (
              <CheckCircle size={13} className="text-teal-500 flex-shrink-0" title="Acknowledged" />
            )}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{caseItem?.bondType || '—'}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${recommendationBadge(advisory?.recommendation)}`}>
              {advisory?.recommendation || 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign size={11} />
              {fmtCurrency(caseItem?.bondPenalty)}
            </span>
            {riskCount > 0 && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertTriangle size={11} />
                {riskCount} risk signal{riskCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ConfidenceRing score={confidence} size={48} />
          <span className="text-xs text-slate-400">confidence</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${completeness >= 80 ? 'bg-teal-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-8">{completeness}%</span>
        </div>
        {days !== null && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${urgencyBg(days)}`}>
            {days > 0 ? `${days}d` : 'Expired'}
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="flex-1 text-xs py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1"
        >
          <Eye size={12} /> Review Brief
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/pipeline/${caseItem?.id}`); }}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <ArrowRight size={12} /> UW Decision
        </button>
      </div>
    </div>
  );
};

// ─── Risk Signal Summary ─────────────────────────────────────────────────────

const RiskSignalSummary = ({ advisories = [], cases = [] }) => {
  const allRisks = (advisories || []).flatMap(a =>
    (a.riskFactors || []).map(r => ({
      risk: typeof r === 'string' ? r : (r?.factor || r?.signal || r?.description || JSON.stringify(r)),
      caseId: a.caseId
    }))
  );
  const allPositives = (advisories || []).flatMap(a =>
    (a.positiveFactors || []).map(p => ({
      factor: typeof p === 'string' ? p : (p?.factor || p?.signal || p?.description || JSON.stringify(p)),
      caseId: a.caseId
    }))
  );
  const recDist = advisories.reduce((acc, a) => {
    const r = a.recommendation || 'Pending';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(recDist).map(([name, value]) => ({ name, value }));
  const COLORS = { 'Approve Renewal': '#0D9488', 'Refer to L2': '#F59E0B', 'Decline': '#DC2626', 'Pending': '#94A3B8' };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-teal-600" />
        <h3 className="text-sm font-bold text-slate-800">Portfolio Risk Signal Summary</h3>
        <span className="ml-auto text-xs text-slate-400">{advisories.length} briefs analyzed</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recommendation Distribution */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommendation Distribution</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-xs text-slate-400">No data</div>
          )}
          <div className="space-y-1 mt-1">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[d.name] || '#94A3B8' }} />
                  {d.name}
                </span>
                <span className="font-semibold text-slate-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Top Risk Signals */}
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Top Risk Signals</p>
          {allRisks.length > 0 ? (
            <ul className="space-y-1.5">
              {allRisks.slice(0, 5).map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <AlertTriangle size={11} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{r.risk}</span>
                </li>
              ))}
              {allRisks.length > 5 && (
                <li className="text-xs text-slate-400 italic">+{allRisks.length - 5} more signals</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No risk signals detected</p>
          )}
        </div>
        {/* Positive Factors */}
        <div>
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">Positive Factors</p>
          {allPositives.length > 0 ? (
            <ul className="space-y-1.5">
              {allPositives.slice(0, 5).map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <CheckCircle size={11} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{p.factor}</span>
                </li>
              ))}
              {allPositives.length > 5 && (
                <li className="text-xs text-slate-400 italic">+{allPositives.length - 5} more</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No positive factors recorded</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Confidence Distribution Chart ──────────────────────────────────────────

const ConfidenceChart = ({ advisories = [] }) => {
  const buckets = [
    { range: '0–20', min: 0, max: 20 },
    { range: '21–40', min: 21, max: 40 },
    { range: '41–60', min: 41, max: 60 },
    { range: '61–80', min: 61, max: 80 },
    { range: '81–100', min: 81, max: 100 },
  ];
  const data = buckets.map(b => ({
    range: b.range,
    count: advisories.filter(a => (a.confidenceScore || 0) >= b.min && (a.confidenceScore || 0) <= b.max).length,
  }));
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={15} className="text-teal-600" />
        <h3 className="text-sm font-bold text-slate-800">Confidence Score Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="Briefs" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.range === '81–100' ? '#0D9488' : d.range === '61–80' ? '#5EEAD4' : d.range === '41–60' ? '#F59E0B' : '#DC2626'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const RenewalIntelligence = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const [cases, setCases] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [renewalRecords, setRenewalRecords] = useState([]);
  const [lineageMap, setLineageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(paramId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRec, setFilterRec] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Use named API methods from the updated apiClient
      const casesRes = await api.getRenewalCases();
      const rawCases = Array.isArray(casesRes?.data) ? casesRes.data
        : Array.isArray(casesRes) ? casesRes : [];

      setCases(rawCases);

      // Load advisories and renewal records for each case in parallel
      const [advResults, recResults] = await Promise.all([
        Promise.all(rawCases.map(c =>
          api.getAIAdvisory(c.id).then(r => {
            const adv = r?.data || r;
            return adv && adv.caseId ? adv : adv ? { ...adv, caseId: c.id } : null;
          }).catch(() => null)
        )),
        Promise.all(rawCases.map(c =>
          api.getRenewalRecord(c.id).then(r => {
            const rec = r?.data || r;
            return rec ? { ...rec, caseId: c.id } : null;
          }).catch(() => null)
        )),
      ]);

      setAdvisories(advResults.filter(Boolean));
      setRenewalRecords(recResults.filter(Boolean));
    } catch (err) {
      console.error('RenewalIntelligence load error:', err);
      setCases([]);
      setAdvisories([]);
      setRenewalRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load lineage when a case is selected
  useEffect(() => {
    if (!selectedCaseId) return;
    const rec = renewalRecords.find(r => r.caseId === selectedCaseId || r.id === selectedCaseId);
    if (!rec) return;
    // Lineage is embedded in the record itself — no separate call needed
    setLineageMap(prev => ({ ...prev, [rec.id || selectedCaseId]: rec.sourceLineage || {} }));
  }, [selectedCaseId, renewalRecords]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcknowledge = async (caseId) => {
    try {
      await api.acknowledgeAIBrief(caseId);
      setAdvisories(prev => prev.map(a =>
        (a.caseId === caseId) ? { ...a, acknowledged: true, uwAcknowledged: true } : a
      ));
    } catch {}
  };

  // Derived data — build lookup maps keyed by caseId
  const advisoryMap = (advisories || []).reduce((acc, a) => {
    if (a?.caseId) acc[a.caseId] = a;
    return acc;
  }, {});
  const recordMap = (renewalRecords || []).reduce((acc, r) => {
    if (r?.caseId) acc[r.caseId] = r;
    else if (r?.id) acc[r.id] = r;
    return acc;
  }, {});

  const filteredCases = (cases || []).filter(c => {
    const adv = advisoryMap[c.id];
    const matchSearch = !searchQuery ||
      (c.principalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.bondType || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRec = filterRec === 'all' || (adv?.recommendation || 'Pending') === filterRec;
    return matchSearch && matchRec;
  });

  const selectedCase = (cases || []).find(c => c.id === selectedCaseId);
  const selectedAdvisory = selectedCaseId ? (advisoryMap[selectedCaseId] || null) : null;
  const selectedRecord = selectedCaseId ? (recordMap[selectedCaseId] || null) : null;
  const selectedLineage = selectedRecord ? (lineageMap[selectedRecord.id || selectedCaseId] || {}) : {};

  // Summary stats
  const safeAdvisories = advisories || [];
  const totalBriefs = safeAdvisories.length;
  const avgConfidence = totalBriefs > 0
    ? Math.round(safeAdvisories.reduce((s, a) => s + (a?.confidenceScore ?? 0), 0) / totalBriefs)
    : 0;
  const pendingAck = safeAdvisories.filter(a => !a?.acknowledged).length;
  const highRisk = safeAdvisories.filter(a => (a?.riskFactors || []).length >= 2).length;

  const recommendations = [...new Set(advisories.map(a => a.recommendation || 'Pending'))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading Renewal Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-teal-600" />
            <h1 className="text-xl font-bold text-slate-800">Renewal Intelligence</h1>
          </div>
          <p className="text-sm text-slate-500">
            AI-assisted underwriting briefs, normalized renewal data, and risk signal analysis across the portfolio.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'AI Briefs Ready', value: totalBriefs, icon: Zap, color: 'teal' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Star, color: 'teal' },
          { label: 'Pending Acknowledgement', value: pendingAck, icon: AlertCircle, color: pendingAck > 0 ? 'amber' : 'teal' },
          { label: 'High Risk Signals', value: highRisk, icon: AlertTriangle, color: highRisk > 0 ? 'red' : 'teal' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              color === 'teal' ? 'bg-teal-50' : color === 'amber' ? 'bg-amber-50' : 'bg-red-50'
            }`}>
              <Icon size={16} className={
                color === 'teal' ? 'text-teal-600' : color === 'amber' ? 'text-amber-600' : 'text-red-600'
              } />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConfidenceChart advisories={advisories} />
        <RiskSignalSummary advisories={advisories} cases={cases} />
      </div>

      {/* Main Content: Queue + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Brief Queue */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Zap size={15} className="text-teal-600" />
              <h2 className="text-sm font-bold text-slate-800">AI Brief Queue</h2>
              <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                {filteredCases.length}
              </span>
            </div>
            {/* Filters */}
            <div className="px-3 py-2 border-b border-slate-100 flex gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search renewals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>
              <select
                value={filterRec}
                onChange={e => setFilterRec(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
              >
                <option value="all">All</option>
                {recommendations.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* Cards */}
            <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
              {filteredCases.length === 0 ? (
                <div className="py-10 text-center">
                  <Zap size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No briefs match your filters.</p>
                </div>
              ) : (
                filteredCases.map(c => (
                  <BriefCard
                    key={c.id}
                    caseItem={c}
                    advisory={advisoryMap[c.id]}
                    renewalRecord={recordMap[c.id]}
                    selected={selectedCaseId === c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-3">
          {!selectedCaseId ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
              <Eye size={36} className="text-slate-200 mb-3" />
              <p className="text-base font-semibold text-slate-400 mb-1">Select a renewal brief</p>
              <p className="text-sm text-slate-400">
                Click any card in the queue to view the full AI advisory, normalized data groups, and source lineage.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Case Header */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => setSelectedCaseId(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <h2 className="text-base font-bold text-slate-800">{selectedCase?.principalName || '—'}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{selectedCase?.bondType || '—'}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">ID: {selectedCase?.principalId || selectedCase?.id || '—'}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Penalty: {fmtCurrency(selectedCase?.bondPenalty)}
                      </span>
                      {selectedCase?.expiryDate && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${urgencyBg(daysUntil(selectedCase.expiryDate))}`}>
                          Expires: {fmtDate(selectedCase.expiryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/pipeline/${selectedCaseId}`)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex-shrink-0"
                  >
                    <ArrowRight size={13} /> UW Decision
                  </button>
                </div>
                {/* Data Completeness */}
                {selectedRecord && (
                  <div className="mt-3 ml-6">
                    <p className="text-xs text-slate-500 mb-1">Data Completeness</p>
                    <CompletenessBar record={selectedRecord} />
                  </div>
                )}
              </div>

              {/* AI Advisory */}
              <AIAdvisoryPanel
                advisory={selectedAdvisory}
                caseId={selectedCaseId}
                onAcknowledge={handleAcknowledge}
              />

              {/* 16 Data Groups */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Database size={15} className="text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-800">Normalized Renewal Data</h3>
                  {selectedRecord?.sourceLineage?.importBatchId && (
                    <span className="ml-auto text-xs text-slate-400 font-mono">
                      Batch: {selectedRecord.sourceLineage.importBatchId}
                    </span>
                  )}
                </div>
                {selectedRecord ? (
                  <div className="p-3 space-y-2">
                    {Object.keys(DATA_GROUP_META).map((groupKey, idx) => (
                      <DataGroupCard
                        key={groupKey}
                        groupKey={groupKey}
                        data={selectedRecord?.dataGroups?.[groupKey] || {}}
                        lineage={selectedLineage?.[groupKey] || selectedRecord?.sourceLineage}
                        defaultOpen={idx < 2}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Database size={28} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No normalized renewal record found for this case.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Import renewal data via the{' '}
                      <button
                        onClick={() => navigate('/data-integration')}
                        className="text-teal-600 underline hover:text-teal-700"
                      >
                        Data Integration
                      </button>{' '}
                      area.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenewalIntelligence;
