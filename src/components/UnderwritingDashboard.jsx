import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign,
  FileText, Bell, CheckCircle, ChevronRight, Activity, Zap
} from 'lucide-react';
import { getPortfolioMetrics, getAlerts, acknowledgeAlert, getCases } from '../services/apiClient.js';
import { auditLog } from '../data/mockData.js';

const fmt = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const severityConfig = {
  Critical: { bg: 'bg-red-50', border: 'border-red-400', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  High:     { bg: 'bg-amber-50', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Medium:   { bg: 'bg-teal-50', border: 'border-teal-400', badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
};

const statusColors = {
  'AI Brief Ready': 'bg-teal-100 text-teal-700',
  'Pending IR':     'bg-amber-100 text-amber-700',
  'In Review':      'bg-blue-100 text-blue-700',
  'New':            'bg-slate-100 text-slate-600',
  'Bound':          'bg-emerald-100 text-emerald-700',
  'Decision Made':  'bg-purple-100 text-purple-700',
};

function KPICard({ icon: Icon, label, value, sub, trend, trendUp, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 leading-tight">{label}</span>
        <div className={`p-1.5 rounded-lg ${accent || 'bg-teal-50'} flex-shrink-0`}>
          <Icon className="w-4 h-4 text-teal-600" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 truncate">{value}</div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
        {sub && <span className="text-xs text-slate-400 truncate">{sub}</span>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse min-w-0">
      <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
      <div className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  );
}

export default function UnderwritingDashboard({ onSelect = () => {} }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [alertList, setAlertList] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPortfolioMetrics(), getAlerts(), getCases()]).then(([m, a, c]) => {
      setMetrics(m);
      setAlertList(a);
      setCases(c);
      setLoading(false);
    });
  }, []);

  const handleAck = async (id) => {
    await acknowledgeAlert(id);
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const expiry30 = cases.filter(c => c.daysToExpiry <= 30);
  const expiry60 = cases.filter(c => c.daysToExpiry > 30 && c.daysToExpiry <= 60);
  const expiry90 = cases.filter(c => c.daysToExpiry > 60 && c.daysToExpiry <= 90);
  const activeAlerts = alertList.filter(a => !a.acknowledged).slice(0, 3);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-hidden">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KPICard icon={FileText} label="Active Cases" value={metrics.totalActiveCases}
              sub={`${metrics.pendingDecision} pending decision`} trend="+3 this week" trendUp />
            <KPICard icon={Clock} label="Expiring ≤30 Days" value={metrics.expiringIn30Days}
              sub="Requires immediate action" accent="bg-red-50" />
            <KPICard icon={DollarSign} label="Aggregate Exposure" value={`$${(metrics.aggregateExposure / 1e6).toFixed(1)}M`}
              sub="Total bond penalty" trend="+2.1M" trendUp />
            <KPICard icon={TrendingUp} label="Renewal Hit Rate" value={`${metrics.renewalHitRate}%`}
              sub="Target: >82%" trend="+1.4%" trendUp />
            <KPICard icon={AlertTriangle} label="Risk Alerts" value={metrics.activeRiskAlerts}
              sub={`${metrics.pendingInfoRequests} pending IRs`} accent="bg-red-50" />
            <KPICard icon={Zap} label="AI Adoption" value={`${metrics.aiAdoptionRate}%`}
              sub={`Override rate: ${metrics.overrideRate}%`} trend="+2.1%" trendUp />
          </>
        )}
      </div>

      {/* Expiry Pipeline */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Expiry Pipeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: '≤ 30 Days', items: expiry30, color: 'border-red-400', badge: 'bg-red-100 text-red-700', count: metrics?.expiringIn30Days ?? '—' },
            { label: '31–60 Days', items: expiry60, color: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', count: metrics?.expiringIn60Days ?? '—' },
            { label: '61–90 Days', items: expiry90, color: 'border-teal-400', badge: 'bg-teal-100 text-teal-700', count: metrics?.expiringIn90Days ?? '—' },
          ].map(({ label, items, color, badge, count }) => (
            <div key={label} className={`bg-white border-l-4 ${color} border border-slate-200 rounded-xl p-3 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{count} cases</span>
              </div>
              {loading ? (
                <div className="space-y-1.5">
                  {[1,2].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
                </div>
              ) : items.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center">No cases in this window</p>
              ) : (
                <ul className="space-y-1.5">
                  {items.slice(0, 3).map(c => (
                    <li key={c.id}
                      onClick={() => { onSelect(c.id); navigate(`/pipeline/${c.id}`); }}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer group transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{c.principalName}</p>
                        <p className="text-xs text-slate-400">{c.daysToExpiry}d · {fmt(c.bondPenalty)}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts Strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Active Alerts</h2>
          <button onClick={() => navigate('/alerts')} className="text-xs text-teal-600 hover:underline font-medium">View all</button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm text-slate-500">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAlerts.map(alert => {
              const cfg = severityConfig[alert.severity] || severityConfig.Medium;
              return (
                <div key={alert.id} className={`${cfg.bg} border-l-4 ${cfg.border} border border-slate-200 rounded-xl p-3 flex items-start gap-3`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{alert.severity}</span>
                      <span className="text-xs font-semibold text-slate-700 truncate">{alert.type}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{alert.message}</p>
                  </div>
                  <button onClick={() => handleAck(alert.id)}
                    className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex-shrink-0 whitespace-nowrap">
                    Ack
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Recent Activity</h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {auditLog.slice(0, 5).map((entry, i) => (
            <div key={entry.id} className={`flex items-start gap-3 px-4 py-3 ${i < 4 ? 'border-b border-slate-100' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">{entry.action}
                  <span className="font-normal text-slate-500"> · {entry.actor}</span>
                </p>
                <p className="text-xs text-slate-500 truncate">{entry.detail}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">{fmtDate(entry.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
