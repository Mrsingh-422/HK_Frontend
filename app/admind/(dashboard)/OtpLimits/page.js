'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowLeft,
  KeyRound,
  Sliders,
  Sparkles,
  Search,
  Lock,
  Unlock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import AdminAPI2 from '@/app/services/AdminAPI2';

export default function AdminOtpLimitsPage() {
  // --- Tab State ---
  const [activeTab, setActiveTab] = useState('blocked'); // 'blocked' | 'configs' | 'matrix'

  // --- 1. Blocked List State ---
  const [blockedList, setBlockedList] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [blockedPage, setBlockedPage] = useState(1);
  const [blockedLimit] = useState(20);
  const [blockedTotalPages, setBlockedTotalPages] = useState(1);
  const [totalBlockedCount, setTotalBlockedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOtpType, setFilterOtpType] = useState('All'); // 'All' | 'Registration-OTP' | 'Phone-OTP' | 'Email-OTP'

  // --- 2. Configurations & 24h Stats State ---
  const [configs, setConfigs] = useState([]);
  const [stats24h, setStats24h] = useState({ totalPhoneRequests: 0, totalEmailRequests: 0 });
  const [configLoading, setConfigLoading] = useState(false);

  // --- 3. Action States ---
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alertBanner, setAlertBanner] = useState(null);

  // Manual Unblock Input State
  const [manualIdentifier, setManualIdentifier] = useState('');
  const [manualOtpType, setManualOtpType] = useState('All');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Edit Config Modal State
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    otpType: '',
    maxAttempts: 3,
    windowInHours: 24,
    isActive: true,
  });

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 5000);
  };

  // --- 1. Fetch Blocked Numbers & Emails List ---
  const fetchBlockedList = useCallback(async () => {
    try {
      setBlockedLoading(true);
      const res = await AdminAPI2.getBlockedOtpList({
        page: blockedPage,
        limit: blockedLimit,
        search: searchQuery,
        otpType: filterOtpType
      });

      if (res.data?.success || res.status === 200) {
        setBlockedList(res.data.data || []);
        setTotalBlockedCount(res.data.totalBlocked || res.data.data?.length || 0);
        setBlockedTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching blocked OTP list:', err);
      showAlert(err.response?.data?.message || 'Failed to load blocked OTP accounts', 'error');
    } finally {
      setBlockedLoading(false);
    }
  }, [blockedPage, blockedLimit, searchQuery, filterOtpType]);

  // --- 2. Fetch OTP Configs & 24h Stats ---
  const fetchConfigsAndStats = useCallback(async () => {
    try {
      setConfigLoading(true);
      const res = await AdminAPI2.getOtpLimitsAndStats();
      if (res.data?.success || res.status === 200) {
        const data = res.data?.data || {};
        setConfigs(data.configs || []);
        setStats24h(data.stats24h || { totalPhoneRequests: 0, totalEmailRequests: 0 });
      }
    } catch (err) {
      console.error('Error fetching OTP configs:', err);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedList();
  }, [fetchBlockedList]);

  useEffect(() => {
    fetchConfigsAndStats();
  }, [fetchConfigsAndStats]);

  // --- 3. 1-Click Unblock Handler ---
  const handleUnblock = async (identifier, otpType = 'All') => {
    try {
      setActionLoadingId(identifier);
      const res = await AdminAPI2.resetOtpIdentifier(identifier, otpType);
      showAlert(
        res.data?.message || `Successfully unblocked '${identifier}'! User can request OTP immediately.`,
        'success'
      );
      // Refresh list
      await fetchBlockedList();
    } catch (err) {
      console.error('Unblock error:', err);
      showAlert(err.response?.data?.message || `Failed to unblock '${identifier}'`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- 4. Manual Unblock Form Submission ---
  const handleManualUnblockSubmit = async (e) => {
    e.preventDefault();
    const cleanId = manualIdentifier.trim();
    if (!cleanId) {
      showAlert('Please enter a phone number or email address', 'error');
      return;
    }

    try {
      setManualSubmitting(true);
      const res = await AdminAPI2.resetOtpIdentifier(cleanId, manualOtpType);
      showAlert(res.data?.message || `Successfully unblocked '${cleanId}'.`, 'success');
      setManualIdentifier('');
      await fetchBlockedList();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to reset limit for this user', 'error');
    } finally {
      setManualSubmitting(false);
    }
  };

  // --- 5. Update Dynamic Limit Configuration ---
  const handleUpdateLimitSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        otpType: formData.otpType,
        maxAttempts: Number(formData.maxAttempts),
        windowInHours: Number(formData.windowInHours),
        isActive: Boolean(formData.isActive),
      };

      const res = await AdminAPI2.updateOtpLimit(payload);
      showAlert(res.data?.message || `OTP limit for ${formData.otpType} updated successfully!`, 'success');
      setSelectedConfig(null);
      await fetchConfigsAndStats();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update OTP limit', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Global Notification Banner */}
        {alertBanner && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-sm transition-all animate-in fade-in duration-200 ${
              alertBanner.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertBanner.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-rose-600 rounded-2xl text-white shadow-sm">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Live OTP Rate Limiter & Security Center
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time monitoring of throttled accounts, 1-click unblock tool, and isolated channel limits.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => { fetchBlockedList(); fetchConfigsAndStats(); }}
              disabled={blockedLoading || configLoading}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={blockedLoading || configLoading ? 'animate-spin text-rose-600' : ''} /> Refresh Live List
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all uppercase"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Blocked</span>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{totalBlockedCount}</h3>
              <span className="text-[11px] font-semibold text-slate-400">Rate limited identifiers</span>
            </div>
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone OTPs (24h)</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {Number(stats24h.totalPhoneRequests || 0).toLocaleString()}
              </h3>
              <span className="text-[11px] font-semibold text-indigo-600">SMS Verification Requests</span>
            </div>
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Phone className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Email OTPs (24h)</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {Number(stats24h.totalEmailRequests || 0).toLocaleString()}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600">Email Auth Dispatches</span>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- MANUAL 1-CLICK UNBLOCK BAR --- */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 w-full md:w-1/3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={14} /> Quick Helpline Unblock Tool
            </div>
            <p className="text-xs text-slate-300">
              Enter a phone number or email to instantly wipe all attempts and unblock the user.
            </p>
          </div>

          <form onSubmit={handleManualUnblockSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-2/3">
            <input
              type="text"
              required
              placeholder="Enter phone (9876543210) or email..."
              value={manualIdentifier}
              onChange={(e) => setManualIdentifier(e.target.value)}
              className="flex-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            <select
              value={manualOtpType}
              onChange={(e) => setManualOtpType(e.target.value)}
              className="bg-slate-800 border border-white/20 text-white rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="All">All Buckets</option>
              <option value="Registration-OTP">Registration OTP</option>
              <option value="Phone-OTP">Phone OTP</option>
              <option value="Email-OTP">Email OTP</option>
            </select>
            <button
              type="submit"
              disabled={manualSubmitting}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {manualSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              Unblock Identifier
            </button>
          </form>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('blocked')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'blocked'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock size={15} /> Live Blocked Accounts ({totalBlockedCount})
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'configs'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sliders size={15} /> Dynamic Rate Limit Rules
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'matrix'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers size={15} /> OTP Limiter Isolation Matrix
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE BLOCKED LIST */}
        {/* ========================================================================= */}
        {activeTab === 'blocked' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden space-y-4">
            {/* Filters Bar */}
            <div className="bg-slate-50/70 p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search phone or email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setBlockedPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500">Filter Bucket:</span>
                <select
                  value={filterOtpType}
                  onChange={(e) => { setFilterOtpType(e.target.value); setBlockedPage(1); }}
                  className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="All">All OTP Buckets</option>
                  <option value="Registration-OTP">Registration-OTP</option>
                  <option value="Phone-OTP">Phone-OTP (Password Reset)</option>
                  <option value="Email-OTP">Email-OTP (Password Reset)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-4 py-2 min-h-[260px]">
              {blockedLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Loading live blocked identifiers...</span>
                </div>
              ) : blockedList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium">
                  No rate-limited numbers or emails found. System running normally!
                </div>
              ) : (
                <table className="w-full text-left text-xs border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-5 py-2">Identifier</th>
                      <th className="px-5 py-2">OTP Bucket</th>
                      <th className="px-5 py-2">Attempts</th>
                      <th className="px-5 py-2">Cooldown Remaining</th>
                      <th className="px-5 py-2">Client IPs</th>
                      <th className="px-5 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedList.map((row) => (
                      <tr key={`${row.identifier}-${row.otpType}`} className="hover:bg-slate-50/80 transition">
                        <td className="bg-slate-50/60 py-3.5 px-5 font-bold text-slate-900 rounded-l-2xl">
                          <div className="flex items-center gap-2">
                            {row.identifierType === 'email' ? (
                              <Mail className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Phone className="w-4 h-4 text-indigo-600" />
                            )}
                            <span>{row.identifier}</span>
                          </div>
                        </td>

                        <td className="bg-slate-50/60 py-3.5 px-5">
                          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700">
                            {row.otpType}
                          </span>
                        </td>

                        <td className="bg-slate-50/60 py-3.5 px-5 font-extrabold text-rose-600">
                          {row.attemptsCount} / {row.maxAllowed || 3} Max
                        </td>

                        <td className="bg-slate-50/60 py-3.5 px-5">
                          <div className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            {row.remainingTimeDisplay || 'Active Cooldown'}
                          </div>
                        </td>

                        <td className="bg-slate-50/60 py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                          {row.clientIps && row.clientIps.length > 0 ? (
                            <div className="flex items-center gap-1" title={row.clientIps.join(', ')}>
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span>{row.clientIps[0]}</span>
                              {row.clientIps.length > 1 && (
                                <span className="text-[10px] bg-slate-200 px-1 rounded">+{row.clientIps.length - 1}</span>
                              )}
                            </div>
                          ) : 'N/A'}
                        </td>

                        <td className="bg-slate-50/60 py-3.5 px-5 text-right rounded-r-2xl">
                          <button
                            onClick={() => handleUnblock(row.identifier, row.otpType)}
                            disabled={actionLoadingId === row.identifier}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {actionLoadingId === row.identifier ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                            1-Click Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{blockedPage}</span> of{' '}
                <span className="font-bold text-slate-700">{blockedTotalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBlockedPage((p) => Math.max(p - 1, 1))}
                  disabled={blockedPage === 1 || blockedLoading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBlockedPage((p) => Math.min(p + 1, blockedTotalPages))}
                  disabled={blockedPage === blockedTotalPages || blockedLoading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DYNAMIC RATE LIMIT RULES */}
        {/* ========================================================================= */}
        {activeTab === 'configs' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-50/70 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Sliders className="text-rose-600 w-5 h-5" /> Configured Limit Rules
                </h3>
                <p className="text-xs text-slate-500">Live rate limits update instantly without restarting the server.</p>
              </div>
            </div>

            <div className="overflow-x-auto px-4 py-3 min-h-[200px]">
              <table className="w-full border-separate border-spacing-y-2 text-left text-xs">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-3">Channel / Bucket</th>
                    <th className="px-6 py-3">Max Allowed Attempts</th>
                    <th className="px-6 py-3">Rolling Cooldown Window</th>
                    <th className="px-6 py-3">Protection Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((row) => (
                    <tr key={row.otpType} className="hover:bg-slate-50/70 transition">
                      <td className="bg-slate-50/50 py-4 px-6 font-bold text-slate-800 rounded-l-2xl">
                        <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg">
                          {row.otpType}
                        </span>
                      </td>
                      <td className="bg-slate-50/50 py-4 px-6 font-extrabold text-slate-900 text-sm">
                        {row.maxAttempts} Attempts
                      </td>
                      <td className="bg-slate-50/50 py-4 px-6 font-medium text-slate-600">
                        Per {row.windowInHours} Hour(s)
                      </td>
                      <td className="bg-slate-50/50 py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {row.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="bg-slate-50/50 py-4 px-6 text-right rounded-r-2xl">
                        <button
                          onClick={() => {
                            setSelectedConfig(row);
                            setFormData({
                              otpType: row.otpType,
                              maxAttempts: Number(row.maxAttempts) || 3,
                              windowInHours: Number(row.windowInHours) || 24,
                              isActive: Boolean(row.isActive),
                            });
                          }}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-slate-700 rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1.5"
                        >
                          <Edit2 size={13} /> Edit Rule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MASTER OTP LIMITER MATRIX */}
        {/* ========================================================================= */}
        {activeTab === 'matrix' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 overflow-x-auto space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="text-indigo-600 w-5 h-5" /> Master OTP Isolation Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of security separation across all authentication and registration flows.
              </p>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Bucket / Category</th>
                  <th className="py-3 px-4">Protected Action</th>
                  <th className="py-3 px-4">Max Attempts</th>
                  <th className="py-3 px-4">Cooldown Window</th>
                  <th className="py-3 px-4">Isolation Guarantee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Registration-OTP</td>
                  <td className="py-3.5 px-4 text-slate-700">New User / Doctor / Provider / Hospital Registration</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">3 Attempts</td>
                  <td className="py-3.5 px-4">24 Hours</td>
                  <td className="py-3.5 px-4 text-emerald-700">Does not block Forgot Password on the same number.</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Phone-OTP</td>
                  <td className="py-3.5 px-4 text-slate-700">Universal Forgot Password Mobile SMS</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">3 Attempts</td>
                  <td className="py-3.5 px-4">24 Hours</td>
                  <td className="py-3.5 px-4 text-emerald-700">Independent bucket from Registration OTP.</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Email-OTP</td>
                  <td className="py-3.5 px-4 text-slate-700">Universal Forgot Password Email Brevo OTP</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">3 Attempts</td>
                  <td className="py-3.5 px-4">24 Hours</td>
                  <td className="py-3.5 px-4 text-emerald-700">Independent bucket from Phone SMS limits.</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Blocked-List</td>
                  <td className="py-3.5 px-4 text-slate-700">Admin Monitoring & 1-Click Unblock Tool</td>
                  <td className="py-3.5 px-4 text-slate-500">—</td>
                  <td className="py-3.5 px-4">Live Cooldown</td>
                  <td className="py-3.5 px-4 text-indigo-700 font-bold">Admin can instantly unblock any identifier in 1-click.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* --- EDIT CONFIG MODAL --- */}
      {selectedConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Sliders className="text-rose-600 w-5 h-5" /> Edit Rate Limit Rule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Channel: <span className="font-bold text-slate-800">{formData.otpType}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedConfig(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateLimitSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Max Allowed Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Rolling Cooldown Window (In Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  required
                  value={formData.windowInHours}
                  onChange={(e) => setFormData({ ...formData, windowInHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveLimit"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="isActiveLimit" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Enable Active Protection for this channel
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedConfig(null)}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center justify-center gap-2 shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={14} />}
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}