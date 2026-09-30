import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Clock, FileText, MessageSquare, Info, ArrowLeft, Shield, Zap
} from 'lucide-react';
import { getCases, getCaseById, getAIAdvisory, getInfoRequests,
  getCorrespondence, acknowledgeAIBrief, submitUWDecision } from '../services/apiClient.js';

const fmt = n => `$${(n / 1e6).toFixed(2)}M`;
const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_COLORS = {
  'AI Brief Ready': 'bg-teal-100 text-teal-700',
  'Pending IR':     'bg-amber-100 text-amber-700',
  'In Review':      'bg-blue-100 text-blue-700',
  'New':            'bg-slate-100 text-slate-600',
  'Bound':          'bg-emerald-100 text-emerald-700',
  'Decision Made':  'bg-purple-100 text-purple-700',
};

const RISK_COLORS = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-red-50 text-red-600',
  Medium:   'bg-amber-100 text-amber-700',
  Low:      'bg-teal-100 text-teal-700',
};

const IR_STATUS = {
  Pending:  'bg-amber-100 text-amber-700',
  Overdue:  'bg-red-100 text-red-700',
  Received: 'bg-emerald-100 text-emerald-700',
  Waived:   'bg-slate-100 text-slate-500',
};

function RiskBadge({ score }) {
  const color = score >= 75 ? 'bg-red-100 text-red-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}</span>;
}

function ConfidenceRing({ score }) {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#0D9488' : score >= 60 ? '#D97706' : '#DC2626';
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E2E8F0" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 28 28)" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{score}%</span>
    </div>
  );
}

function AIAdvisoryPanel({ caseId, onToast }) {
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  const [override, setOverride] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAIAdvisory(caseId).then(p => { setPanel(p); setLoading(false); });
  }, [caseId]);

  if (loading) return <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />;

  // Graceful empty state — no advisory exists for this case
  if (!panel) return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
      <Zap className="w-6 h-6 text-slate-300 mx-auto mb-1" />
      <p className="text-xs text-slate-500 font-medium">No AI Advisory available for this case</p>
      <p className="text-xs text-slate-400 mt-0.5">AI brief will appear once the case is processed</p>
    </div>
  );

  // Defensive normalisation — handle both old and new field names from localStorage
  const confidenceScore = panel.confidenceScore ?? panel.confidence ?? 0;
  const uwAcknowledged  = panel.uwAcknowledged  ?? panel.acknowledged  ?? false;
  const riskFactors     = (panel.riskFactors    || []).map(f => ({ ...f, signal: f.signal || f.detail || '' }));
  const positiveFactors = panel.positiveFactors || [];
  const generatedAt     = panel.generatedAt || new Date().toISOString();

  const handleAck = async () => {
    setSaving(true);
    await acknowledgeAIBrief(caseId, override ? { recommendation: 'Override', reason: override } : null);
    setPanel(p => ({ ...p, uwAcknowledged: true, acknowledged: true, uwOverrideReason: override || null }));
    onToast?.('AI Brief acknowledged successfully', 'success');
    setSaving(false);
  };

  return (
    <div className="border border-teal-300 rounded-xl overflow-hidden shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-teal-50 hover:bg-teal-100 transition-colors">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-semibold text-teal-800">AI Advisory Panel</span>
          {uwAcknowledged && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Acknowledged</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-teal-600" />}
      </button>

      {open && (
        <div className="bg-teal-50 border-t border-teal-200 px-4 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <ConfidenceRing score={confidenceScore} />
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">AI Recommendation</p>
              <span className="text-sm font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-lg">{panel.recommendation || '—'}</span>
              <p className="text-xs text-slate-400 mt-1">Generated {fmtDate(generatedAt)}</p>
            </div>
          </div>

          {riskFactors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Risk Factors</p>
              <div className="space-y-1.5">
                {riskFactors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2 border border-teal-100">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${RISK_COLORS[f.severity] || RISK_COLORS.Medium}`}>{f.severity}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{f.factor}</p>
                      <p className="text-xs text-slate-500">{f.signal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {positiveFactors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Positive Factors</p>
              <div className="space-y-1.5">
                {positiveFactors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{f.factor}</p>
                      <p className="text-xs text-slate-500">{f.signal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!uwAcknowledged && (
            <div className="bg-white border border-teal-200 rounded-xl p-3 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
                  className="mt-0.5 accent-teal-600" />
                <span className="text-xs text-slate-700 font-medium">I have reviewed the AI brief and take responsibility for the underwriting decision</span>
              </label>
              <textarea value={override} onChange={e => setOverride(e.target.value)}
                placeholder="Optional: Enter override reason if disagreeing with AI recommendation..."
                className="w-full text-xs border border-slate-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-teal-400 text-slate-700 placeholder-slate-400" />
              <button onClick={handleAck} disabled={!checked || saving}
                className="w-full py-2 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {saving ? 'Acknowledging…' : 'Acknowledge AI Brief'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CaseDetail({ id, onToast }) {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [irs, setIrs] = useState([]);
  const [corr, setCorr] = useState([]);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    getCaseById(id).then(setCaseData);
    getInfoRequests(id).then(r => setIrs(r));
    getCorrespondence(id).then(r => setCorr(r));
  }, [id]);

  const handleDecision = async (status) => {
    setDeciding(true);
    await submitUWDecision(id, { status });
    setCaseData(p => ({ ...p, status }));
    onToast?.(`Decision recorded: ${status}`, 'success');
    setDeciding(false);
  };

  if (!caseData) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/pipeline')} className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Pipeline
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-mono mb-0.5">{caseData.id}</p>
            <h2 className="text-base font-bold text-slate-800 leading-tight">{caseData.principalName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{caseData.bondType} · {caseData.obligeeName || caseData.obligee || '—'}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[caseData.status] || 'bg-slate-100 text-slate-600'}`}>{caseData.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Bond Penalty', fmt(caseData.bondPenalty ?? 0)],
            ['Premium', `$${(caseData.premiumAmount ?? caseData.premium ?? 0).toLocaleString()}`],
            ['Expiry', fmtDate(caseData.expiryDate)],
            ['Days to Expiry', `${caseData.daysToExpiry} days`],
          ].map(([k, v]) => (
            <div key={k} className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400 font-medium">{k}</p>
              <p className="text-slate-700 font-bold">{v}</p>
            </div>
          ))}
        </div>
        {caseData.riskSignals?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {caseData.riskSignals.map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />{s}
              </span>
            ))}
          </div>
        )}
      </div>

      <AIAdvisoryPanel caseId={id} onToast={onToast} />

      {irs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Information Requests</span>
          </div>
          {irs.map((ir, i) => (
            <div key={ir.id} className={`px-4 py-2.5 flex items-center gap-3 ${i < irs.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{ir.requestedItem}</p>
                <p className="text-xs text-slate-400">Due {ir.dueDate} · From {ir.requestedFrom}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${IR_STATUS[ir.status] || 'bg-slate-100 text-slate-500'}`}>{ir.status}</span>
            </div>
          ))}
        </div>
      )}

      {corr.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Correspondence</span>
          </div>
          {corr.map((c, i) => (
            <div key={c.id} className={`px-4 py-2.5 flex items-start gap-3 ${i < corr.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${c.direction === 'Outbound' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{c.direction}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{c.subject}</p>
                <p className="text-xs text-slate-400 truncate">{c.direction === 'Outbound' ? `To: ${c.to}` : `From: ${c.from}`}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{c.sentAt || c.timestamp ? fmtDate(c.sentAt || c.timestamp) : '—'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">UW Decision — L2 Authority</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Approve', status: 'Bound', cls: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
            { label: 'Approve w/ Conditions', status: 'Decision Made', cls: 'bg-teal-600 hover:bg-teal-700 text-white' },
            { label: 'Request More Info', status: 'Pending IR', cls: 'bg-amber-500 hover:bg-amber-600 text-white' },
            { label: 'Decline', status: 'Decision Made', cls: 'bg-red-600 hover:bg-red-700 text-white' },
          ].map(({ label, status, cls }) => (
            <button key={label} onClick={() => handleDecision(status)} disabled={deciding}
              className={`py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${cls}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RenewalPipeline({ onToast }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!id) getCases().then(c => { setCases(c); setLoading(false); });
  }, [id]);

  if (id) return (
    <div className="max-w-2xl mx-auto">
      <CaseDetail id={id} onToast={onToast} />
    </div>
  );

  const statuses = ['All', 'New', 'In Review', 'AI Brief Ready', 'Pending IR', 'Bound'];
  const filtered = filter === 'All' ? cases : cases.filter(c => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <FileText className="w-4 h-4 text-teal-600" />
        <h1 className="text-sm font-bold text-slate-800">My Renewal Pipeline</h1>
        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">{cases.length} cases</span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${filter === s ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="space-y-0">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 border-b border-slate-100 animate-pulse bg-slate-50" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No cases match this filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[560px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Case ID', 'Principal', 'Penalty', 'Expiry', 'Risk', 'AI Rec', 'Status', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} onClick={() => navigate(`/pipeline/${c.id}`)}
                    className={`cursor-pointer hover:bg-teal-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{c.id}</td>
                    <td className="px-3 py-3 min-w-0">
                      <p className="font-semibold text-slate-800 truncate max-w-[140px]">{c.principalName}</p>
                      <p className="text-slate-400 truncate max-w-[140px]">{c.bondType}</p>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">{fmt(c.bondPenalty)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="text-slate-700">{fmtDate(c.expiryDate)}</p>
                      <p className={`font-bold ${c.daysToExpiry <= 30 ? 'text-red-600' : c.daysToExpiry <= 60 ? 'text-amber-600' : 'text-slate-400'}`}>{c.daysToExpiry}d</p>
                    </td>
                    <td className="px-3 py-3"><RiskBadge score={c.riskScore} /></td>
                    <td className="px-3 py-3 max-w-[110px]">
                      <span className="text-slate-600 truncate block">{c.aiRecommendation}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
