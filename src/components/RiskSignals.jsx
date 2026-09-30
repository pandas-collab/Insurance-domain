import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  FileText,
  Shield,
  Bell,
  MoreHorizontal,
  RefreshCw,
  Eye,
  CheckSquare,
  XSquare,
  History
} from 'lucide-react';
import { api } from '../services/apiClient';

// Severity configuration
const SEVERITY_CONFIG = {
  informational: {
    label: 'Informational',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Info,
    dot: 'bg-gray-400',
    priority: 1
  },
  low: {
    label: 'Low',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Info,
    dot: 'bg-blue-500',
    priority: 2
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
    dot: 'bg-amber-500',
    priority: 3
  },
  high: {
    label: 'High',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertTriangle,
    dot: 'bg-red-500',
    priority: 4
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertTriangle,
    dot: 'bg-red-700',
    priority: 5
  }
};

// Signal type labels
const SIGNAL_TYPE_LABELS = {
  new_claim: 'New Claim',
  claim_amount_change: 'Claim Amount Change',
  adtf_increase: 'ADTF Increase',
  adtf_decrease: 'ADTF Decrease',
  collateral_change: 'Collateral Change',
  exposure_change: 'Exposure Change',
  premium_change: 'Premium Change',
  add_cvd_activity: 'ADD/CVD Activity',
  entry_activity: 'Entry Activity',
  extended_entry: 'Extended Entry',
  suspended_entry: 'Suspended Entry',
  missing_data: 'Missing Data',
  data_quality: 'Data Quality Issue',
  gia_change: 'GIA Change',
  pms_change: 'PMS Change',
  fliq_rate_change: 'FLIQ Rate Change'
};

// Status configuration
const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'bg-amber-100 text-amber-700',
    icon: Bell
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckSquare
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  dismissed: {
    label: 'Dismissed',
    color: 'bg-gray-100 text-gray-600',
    icon: XSquare
  }
};

// Format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentage
const formatPercentage = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Severity Badge Component
const SeverityBadge = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.informational;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Signal Type Badge
const SignalTypeBadge = ({ type }) => {
  const label = SIGNAL_TYPE_LABELS[type] || type;
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
      {label}
    </span>
  );
};

// Change Indicator Component
const ChangeIndicator = ({ previousValue, currentValue, type = 'currency' }) => {
  if (previousValue === null || previousValue === undefined || currentValue === null || currentValue === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  const diff = currentValue - previousValue;
  const percentChange = previousValue !== 0 ? (diff / previousValue) * 100 : 0;
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;

  let Icon = Minus;
  let colorClass = 'text-gray-500';

  if (isIncrease) {
    Icon = TrendingUp;
    colorClass = 'text-red-600';
  } else if (isDecrease) {
    Icon = TrendingDown;
    colorClass = 'text-green-600';
  }

  const formattedValue = type === 'currency' ? formatCurrency(currentValue) : currentValue;
  const formattedDiff = type === 'currency' ? formatCurrency(Math.abs(diff)) : Math.abs(diff);

  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{formattedValue}</span>
      {(isIncrease || isDecrease) && (
        <span className={`text-xs flex items-center gap-0.5 ${colorClass}`}>
          <Icon className="w-3 h-3" />
          {formattedDiff} ({formatPercentage(percentChange)})
        </span>
      )}
    </div>
  );
};

// Signal Detail Panel Component
const SignalDetailPanel = ({ signal, onClose, onAcknowledge, onResolve, onDismiss }) => {
  if (!signal) return null;

  const severityConfig = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.informational;
  const SeverityIcon = severityConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-start justify-between ${severityConfig.color}`}>
          <div className="flex items-center gap-3">
            <SeverityIcon className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">{SIGNAL_TYPE_LABELS[signal.signalType] || signal.signalType}</h3>
              <p className="text-sm opacity-80">Signal ID: {signal.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Severity & Status */}
          <div className="flex items-center gap-4">
            <SeverityBadge severity={signal.severity} />
            <StatusBadge status={signal.status} />
          </div>

          {/* Description */}
          {signal.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{signal.description}</p>
            </div>
          )}

          {/* Value Comparison */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
              Value Comparison
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="p-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Previous Value</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {signal.previousValue !== null && signal.previousValue !== undefined
                    ? (signal.signalType.includes('amount') || signal.signalType.includes('premium') || signal.signalType.includes('collateral') || signal.signalType.includes('exposure')
                        ? formatCurrency(signal.previousValue)
                        : signal.previousValue)
                    : '—'}
                </div>
              </div>
              <div className="p-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Current Value</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {signal.currentValue !== null && signal.currentValue !== undefined
                    ? (signal.signalType.includes('amount') || signal.signalType.includes('premium') || signal.signalType.includes('collateral') || signal.signalType.includes('exposure')
                        ? formatCurrency(signal.currentValue)
                        : signal.currentValue)
                    : '—'}
                </div>
              </div>
            </div>
            {signal.percentageChange !== null && signal.percentageChange !== undefined && (
              <div className="px-4 py-2 bg-gray-50 border-t text-sm">
                <span className="text-gray-600">Change: </span>
                <span className={`font-medium ${signal.percentageChange > 0 ? 'text-red-600' : signal.percentageChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {formatPercentage(signal.percentageChange)}
                </span>
              </div>
            )}
          </div>

          {/* Source Information */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
              Source Information
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Group</span>
                <span className="text-sm font-medium">{signal.dataGroup || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Field</span>
                <span className="text-sm font-medium">{signal.field || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rule Version</span>
                <span className="text-sm font-medium">{signal.ruleVersion || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Detected At</span>
                <span className="text-sm font-medium">{formatDate(signal.detectedAt)}</span>
              </div>
              {signal.effectiveDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Effective Date</span>
                  <span className="text-sm font-medium">{formatDate(signal.effectiveDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Case Link */}
          {signal.caseId && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">Associated with Case: </span>
              <button 
                onClick={() => window.location.href = `#/case/${signal.caseId}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {signal.caseId}
              </button>
            </div>
          )}

          {/* Audit History */}
          {signal.auditLog && signal.auditLog.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700 flex items-center gap-2">
                <History className="w-4 h-4" />
                Audit History
              </div>
              <div className="p-4 space-y-3">
                {signal.auditLog.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-gray-500"> by {entry.user}</span>
                      <div className="text-xs text-gray-400">{formatDate(entry.timestamp)}</div>
                      {entry.notes && <div className="text-gray-600 mt-1">{entry.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          {signal.status === 'active' && (
            <>
              <button
                onClick={() => onDismiss(signal.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border"
              >
                Dismiss
              </button>
              <button
                onClick={() => onAcknowledge(signal.id)}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
              >
                Acknowledge
              </button>
            </>
          )}
          {(signal.status === 'active' || signal.status === 'acknowledged') && (
            <button
              onClick={() => onResolve(signal.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-lg"
            >
              Resolve
            </button>
          )}
          {signal.status === 'resolved' && (
            <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
              Resolved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal' }) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-50 text-gray-700'
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Main RiskSignals Component
export const RiskSignals = () => {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    severity: '',
    status: 'active',
    type: '',
    dateRange: '7d',
    search: ''
  });

  // Load signals
  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const data = await api.getRiskSignals();
      setSignals(data || []);
    } catch (error) {
      console.error('Failed to load signals:', error);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered signals
  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      if (filters.severity && signal.severity !== filters.severity) return false;
      if (filters.status && signal.status !== filters.status) return false;
      if (filters.type && signal.signalType !== filters.type) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          (signal.id?.toLowerCase().includes(searchLower)) ||
          (signal.caseId?.toLowerCase().includes(searchLower)) ||
          (SIGNAL_TYPE_LABELS[signal.signalType]?.toLowerCase().includes(searchLower)) ||
          (signal.description?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      if (filters.dateRange) {
        const signalDate = new Date(signal.detectedAt);
        const now = new Date();
        let cutoff = new Date();
        switch (filters.dateRange) {
          case '24h':
            cutoff.setDate(cutoff.getDate() - 1);
            break;
          case '7d':
            cutoff.setDate(cutoff.getDate() - 7);
            break;
          case '30d':
            cutoff.setDate(cutoff.getDate() - 30);
            break;
          case '90d':
            cutoff.setDate(cutoff.getDate() - 90);
            break;
          default:
            cutoff = null;
        }
        if (cutoff && signalDate < cutoff) return false;
      }
      return true;
    }).sort((a, b) => {
      // Sort by severity priority desc, then by detected date desc
      const severityDiff = (SEVERITY_CONFIG[b.severity]?.priority || 0) - (SEVERITY_CONFIG[a.severity]?.priority || 0);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    });
  }, [signals, filters]);

  // Statistics
  const statistics = useMemo(() => {
    const activeSignals = signals.filter(s => s.status === 'active');
    const bySeverity = {
      critical: activeSignals.filter(s => s.severity === 'critical').length,
      high: activeSignals.filter(s => s.severity === 'high').length,
      medium: activeSignals.filter(s => s.severity === 'medium').length,
      low: activeSignals.filter(s => s.severity === 'low').length,
      informational: activeSignals.filter(s => s.severity === 'informational').length
    };
    const byType = {};
    activeSignals.forEach(s => {
      byType[s.signalType] = (byType[s.signalType] || 0) + 1;
    });
    const acknowledgedToday = signals.filter(s => {
      if (s.status !== 'acknowledged') return false;
      const today = new Date().toDateString();
      const ackDate = s.acknowledgedAt ? new Date(s.acknowledgedAt).toDateString() : null;
      return ackDate === today;
    }).length;

    return {
      totalActive: activeSignals.length,
      bySeverity,
      byType,
      acknowledgedToday,
      criticalHigh: bySeverity.critical + bySeverity.high
    };
  }, [signals]);

  // Actions
  const handleAcknowledge = async (signalId) => {
    try {
      await api.acknowledgeSignal(signalId);
      await loadSignals();
      setSelectedSignal(null);
    } catch (error) {
      console.error('Failed to acknowledge signal:', error);
    }
  };

  const handleResolve = async (signalId) => {
    try {
      await api.resolveSignal(signalId);
      await loadSignals();
      setSelectedSignal(null);
    } catch (error) {
      console.error('Failed to resolve signal:', error);
    }
  };

  const handleDismiss = async (signalId) => {
    try {
      await api.dismissSignal(signalId);
      await loadSignals();
      setSelectedSignal(null);
    } catch (error) {
      console.error('Failed to dismiss signal:', error);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Signal ID', 'Type', 'Severity', 'Status', 'Case ID', 'Previous Value', 'Current Value', 'Change %', 'Detected At', 'Description'].join(','),
      ...filteredSignals.map(s => [
        s.id,
        SIGNAL_TYPE_LABELS[s.signalType] || s.signalType,
        s.severity,
        s.status,
        s.caseId || '',
        s.previousValue || '',
        s.currentValue || '',
        s.percentageChange || '',
        s.detectedAt,
        `"${(s.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-signals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Signals</h1>
          <p className="text-gray-600 mt-1">Monitor and manage renewal risk signals and change alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSignals}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Active Signals"
          value={statistics.totalActive}
          subtitle={`${statistics.criticalHigh} critical/high priority`}
          icon={Bell}
          color="teal"
        />
        <StatCard
          title="Critical & High"
          value={statistics.criticalHigh}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          color={statistics.criticalHigh > 0 ? 'red' : 'gray'}
        />
        <StatCard
          title="Medium Priority"
          value={statistics.bySeverity.medium}
          subtitle="Review recommended"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Acknowledged Today"
          value={statistics.acknowledgedToday}
          subtitle="Signals reviewed today"
          icon={CheckCircle2}
          color="blue"
        />
      </div>

      {/* Severity Distribution */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Severity Distribution (Active Signals)</h3>
        <div className="flex items-center gap-2">
          {['critical', 'high', 'medium', 'low', 'informational'].map(severity => {
            const count = statistics.bySeverity[severity];
            const total = statistics.totalActive || 1;
            const percentage = (count / total) * 100;
            const config = SEVERITY_CONFIG[severity];
            return (
              <div key={severity} className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">{config.label}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${config.dot}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search signals..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${showFilters ? 'bg-[#0D9488] text-white border-[#0D9488]' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredSignals.length} of {signals.length} signals
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b bg-gray-50 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="informational">Informational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signal Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="">All Types</option>
                {Object.entries(SIGNAL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Signals Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detected</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Shield className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No signals found</h3>
                      <p className="text-gray-500 mt-1">No risk signals match your current filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSignals.map(signal => (
                  <tr 
                    key={signal.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSignal(signal)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {SIGNAL_TYPE_LABELS[signal.signalType] || signal.signalType}
                        </span>
                        <span className="text-xs text-gray-500">{signal.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={signal.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={signal.status} />
                    </td>
                    <td className="px-4 py-3">
                      {signal.previousValue !== null && signal.currentValue !== null ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {signal.signalType.includes('amount') || signal.signalType.includes('premium') || signal.signalType.includes('collateral')
                              ? formatCurrency(signal.currentValue)
                              : signal.currentValue}
                          </span>
                          {signal.percentageChange !== null && (
                            <span className={`text-xs ${signal.percentageChange > 0 ? 'text-red-600' : signal.percentageChange < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {formatPercentage(signal.percentageChange)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {signal.caseId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/case/${signal.caseId}`);
                          }}
                          className="text-sm text-[#0D9488] hover:underline font-medium"
                        >
                          {signal.caseId}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(signal.detectedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSignal(signal);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {signal.status === 'active' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledge(signal.id);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Acknowledge"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolve(signal.id);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Resolve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <SignalDetailPanel
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default RiskSignals;
