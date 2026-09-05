"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Settings, ChevronUp, ChevronDown, 
  Search, X, Save, ArrowLeft, Loader2, Edit2, 
  CheckCircle2, AlertCircle, RefreshCw, IndianRupee,
  TrendingUp, Wallet, ArrowUpRight, Clock, 
  FileSpreadsheet, ShieldAlert, Calculator
} from 'lucide-react';
import AdminAPI2 from '@/app/services/AdminAPI2';

export default function AdminCommissionAndWalletPage() {
  // --- Dynamic API States ---
  const [configs, setConfigs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('configs'); // 'configs' | 'settlement'

  // Table Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);

  // Dynamic Simulation Input for Settlement Tab
  const [simulationAmount, setSimulationAmount] = useState(1000);

  // Modal Form State (Commission)
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorType: '',
    commissionType: 'Percentage',
    percentageValue: 0,
    fixedRupeesValue: 0,
    isActive: true,
  });

  // Modal Form State (Cancellation Policy)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelPolicyData, setCancelPolicyData] = useState({
    vendorType: '',
    chargeType: 'Percentage',
    chargeValue: 0,
    isActive: true,
  });

  // --- Notification Helpers ---
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // --- Fetch Dynamic Data from APIs ---
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [configsRes, statsRes] = await Promise.allSettled([
        AdminAPI2.getCommissionConfigs(),
        AdminAPI2.getWalletDashboardStats()
      ]);

      if (configsRes.status === 'fulfilled') {
        const dynamicConfigs = configsRes.value.data?.data || [];
        setConfigs(dynamicConfigs);
        if (dynamicConfigs.length > 0 && !cancelPolicyData.vendorType) {
          setCancelPolicyData((prev) => ({
            ...prev,
            vendorType: dynamicConfigs[0].vendorType || ''
          }));
        }
      } else {
        throw new Error(configsRes.reason?.response?.data?.message || 'Failed to load commission rules');
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || null);
      }
    } catch (err) {
      triggerError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [cancelPolicyData.vendorType]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Open Edit Modal for a specific row
  const handleEditCommission = (vendor) => {
    setFormData({
      vendorType: vendor.vendorType || '',
      commissionType: vendor.commissionType || 'Percentage',
      percentageValue: Number(vendor.percentageValue) || 0,
      fixedRupeesValue: Number(vendor.fixedRupeesValue) || 0,
      isActive: Boolean(vendor.isActive),
    });
    setIsCommissionModalOpen(true);
  };

  // Submit Commission Update to Backend API
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        vendorType: formData.vendorType,
        commissionType: formData.commissionType,
        percentageValue: Number(formData.percentageValue) || 0,
        fixedRupeesValue: Number(formData.fixedRupeesValue) || 0,
        isActive: Boolean(formData.isActive),
      };

      const res = await AdminAPI2.updateCommissionConfig(payload);
      triggerSuccess(res.data?.message || `Configuration updated for ${formData.vendorType}!`);
      setIsCommissionModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      triggerError(err.response?.data?.message || err.message || 'Failed to update commission');
    } finally {
      setSaving(false);
    }
  };

  // Submit Cancellation Policy to Backend API
  const handleCancelPolicySubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        vendorType: cancelPolicyData.vendorType,
        chargeType: cancelPolicyData.chargeType,
        chargeValue: Number(cancelPolicyData.chargeValue) || 0,
        isActive: Boolean(cancelPolicyData.isActive),
      };

      const res = await AdminAPI2.updateCancellationPolicy(payload);
      triggerSuccess(res.data?.message || `Cancellation policy updated for ${cancelPolicyData.vendorType}!`);
      setIsCancelModalOpen(false);
    } catch (err) {
      triggerError(err.response?.data?.message || err.message || 'Failed to update cancellation policy');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Cutoff Calculations based on live configs
  const calculateDynamicSettlement = useCallback((item, baseAmount) => {
    const gross = Number(baseAmount) || 0;
    const pct = Number(item.percentageValue) || 0;
    const fix = Number(item.fixedRupeesValue) || 0;
    let adminCut = 0;

    if (item.commissionType === 'Percentage') {
      adminCut = (gross * pct) / 100;
    } else if (item.commissionType === 'Rupees') {
      adminCut = fix;
    } else if (item.commissionType === 'Both') {
      adminCut = ((gross * pct) / 100) + fix;
    } else if (item.commissionType === 'None') {
      adminCut = 0;
    }

    // Ensure profit does not exceed gross order value
    adminCut = Math.min(gross, adminCut);
    const vendorPayout = Math.max(0, gross - adminCut);

    return { adminCut, vendorPayout, gross };
  }, []);

  // Filter & Sort Logic
  const filteredConfigs = useMemo(() => {
    let list = [...configs].filter(item => 
      item.vendorType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      list.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [configs, searchTerm, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredConfigs.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentRows = filteredConfigs.slice(startIndex, startIndex + entriesPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCommissionLabel = (item) => {
    if (item.commissionType === 'Both') return `${item.percentageValue}% + ₹${item.fixedRupeesValue}`;
    if (item.commissionType === 'Rupees') return `₹${item.fixedRupeesValue}`;
    if (item.commissionType === 'None') return `0% (Free)`;
    return `${item.percentageValue}%`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm text-sm">
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm text-sm">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Wallet className="text-emerald-500" size={28} /> Admin Revenue & Commission Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live platform cutoff configuration, dynamic settlement calculations, and vendor wallet tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {configs.length > 0 && (
              <button 
                onClick={() => setIsCancelModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <ShieldAlert size={14} /> Update Cancellation Policy
              </button>
            )}
            <button 
              onClick={loadDashboardData} 
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all uppercase"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Dynamic KPI Cards from API */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Order Volume</span>
                <TrendingUp size={18} className="text-blue-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-800">
                  ₹{Number(stats.totalGrossOrderVolume || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Total volume processed</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Admin Cutoff Revenue</span>
                <IndianRupee size={18} className="text-emerald-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-emerald-600">
                  ₹{Number(stats.totalAdminCommissionRevenue || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600/80">Platform Net Profit</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Vendor Liabilities</span>
                <ArrowUpRight size={18} className="text-amber-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-amber-600">
                  ₹{Number(stats.platformTotalLiability || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Net balance owed to vendors</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
                <Clock size={18} className="text-indigo-500" />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800">
                    ₹{Number(stats.payoutStats?.Pending?.amount || 0).toLocaleString('en-IN')}
                  </h3>
                  <span className="text-[11px] font-semibold text-indigo-600">
                    {stats.payoutStats?.Pending?.count || 0} withdrawal requests
                  </span>
                </div>
                {Number(stats.pendingBankVerificationsCount || 0) > 0 && (
                  <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-md font-bold">
                    {stats.pendingBankVerificationsCount} Unverified Banks
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('configs')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'configs'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings size={15} /> Commission Rules Configuration
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'settlement'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileSpreadsheet size={15} /> Financial Cutoff & Settlement Table
          </button>
        </div>

        {/* --- VIEW 1: Commission Rules Management --- */}
        {activeTab === 'configs' && (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Filter vendor type..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                Show 
                <select 
                  value={entriesPerPage}
                  onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-white border rounded px-1.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                entries
              </div>
            </div>

            <div className="overflow-x-auto px-4 py-3 min-h-[260px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <span className="text-xs font-bold uppercase tracking-wider">Loading configurations from API...</span>
                </div>
              ) : currentRows.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm font-medium">
                  No commission rules found in database.
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-y-2 text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-3">S No.</th>
                      <th onClick={() => requestSort('vendorType')} className="px-6 py-3 cursor-pointer hover:text-emerald-500">
                        <div className="flex items-center gap-1">
                          Vendor Type
                          <ChevronUp size={12} className={sortConfig?.key === 'vendorType' ? 'text-emerald-500' : 'opacity-20'} />
                        </div>
                      </th>
                      <th className="px-6 py-3">Rule Type</th>
                      <th className="px-6 py-3">Admin Platform Cutoff</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, idx) => (
                      <tr key={row.vendorType || idx} className="hover:bg-slate-50/70 transition-all">
                        <td className="bg-slate-50/50 py-4 px-6 text-xs font-semibold rounded-l-2xl text-slate-400">
                          {startIndex + idx + 1}
                        </td>
                        <td className="bg-slate-50/50 py-4 px-6">
                          <span className="font-bold text-slate-800 text-sm bg-white border border-slate-200 px-3 py-1 rounded-lg">
                            {row.vendorType}
                          </span>
                        </td>
                        <td className="bg-slate-50/50 py-4 px-6 text-xs font-semibold text-slate-600">
                          {row.commissionType}
                        </td>
                        <td className="bg-slate-50/50 py-4 px-6 text-sm font-extrabold text-emerald-600">
                          {formatCommissionLabel(row)}
                        </td>
                        <td className="bg-slate-50/50 py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                            row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {row.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="bg-slate-50/50 py-4 px-6 text-right rounded-r-2xl">
                          <button
                            onClick={() => handleEditCommission(row)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing {filteredConfigs.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + entriesPerPage, filteredConfigs.length)} of {filteredConfigs.length}
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-[11px] font-bold uppercase text-slate-400 hover:text-emerald-500 disabled:opacity-20"
                >
                  Prev
                </button>
                <span className="text-xs font-bold px-2 text-slate-700">{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-[11px] font-bold uppercase text-slate-400 hover:text-emerald-500 disabled:opacity-20"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: Dynamic Settlement Simulation & Matrix (Computed from API) --- */}
        {activeTab === 'settlement' && (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-6 overflow-x-auto space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-800">Dynamic Settlement & Payout Matrix</h2>
                <p className="text-xs text-slate-400">Computed strictly from real-time API configuration rules.</p>
              </div>

              {/* Real-time Simulator Input */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-fit">
                <Calculator size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">Simulate Order: ₹</span>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(Math.max(0, Number(e.target.value)))}
                  className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 text-slate-400">
                <Loader2 className="animate-spin text-emerald-500" size={24} />
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active configurations available to generate matrix.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Vendor Type</th>
                    <th className="py-3 px-4">Simulated Price</th>
                    <th className="py-3 px-4">Configured Cutoff Rule</th>
                    <th className="py-3 px-4">Admin Platform Profit</th>
                    <th className="py-3 px-4">Net Vendor Wallet Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {configs.map((item) => {
                    const result = calculateDynamicSettlement(item, simulationAmount);
                    return (
                      <tr key={item.vendorType} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.vendorType}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          ₹{result.gross.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatCommissionLabel(item)}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 font-bold">
                          ₹{result.adminCut.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-extrabold">
                          ₹{result.vendorPayout.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {/* --- EDIT COMMISSION MODAL --- */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Settings className="text-emerald-500" size={20} /> Edit Commission Cutoff
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor Type: <span className="font-bold text-slate-800">{formData.vendorType}</span>
                </p>
              </div>
              <button onClick={() => setIsCommissionModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCommissionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Commission Cutoff Type</label>
                <select
                  value={formData.commissionType}
                  onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                >
                  <option value="Percentage">Percentage Only (%)</option>
                  <option value="Rupees">Fixed Rupees Only (₹)</option>
                  <option value="Both">Both (Percentage % + Fixed ₹)</option>
                  <option value="None">None (0% Free)</option>
                </select>
              </div>

              {['Percentage', 'Both'].includes(formData.commissionType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Percentage Cutoff (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.percentageValue}
                      onChange={(e) => setFormData({ ...formData, percentageValue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                  </div>
                </div>
              )}

              {['Rupees', 'Both'].includes(formData.commissionType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fixed Fee Cutoff (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.fixedRupeesValue}
                      onChange={(e) => setFormData({ ...formData, fixedRupeesValue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCommission"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-400 cursor-pointer"
                />
                <label htmlFor="isActiveCommission" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Active Configuration
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CANCELLATION POLICY MODAL --- */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="text-rose-500" size={20} /> Update Cancellation Policy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update cancellation fee & driver compensation rules.
                </p>
              </div>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelPolicySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Vendor Type</label>
                <select
                  value={cancelPolicyData.vendorType}
                  onChange={(e) => setCancelPolicyData({ ...cancelPolicyData, vendorType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  required
                >
                  {configs.map((c) => (
                    <option key={c.vendorType} value={c.vendorType}>
                      {c.vendorType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Charge Type</label>
                <select
                  value={cancelPolicyData.chargeType}
                  onChange={(e) => setCancelPolicyData({ ...cancelPolicyData, chargeType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Rupees">Fixed Rupees (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Charge / Compensation Value ({cancelPolicyData.chargeType === 'Percentage' ? '%' : '₹'})
                </label>
                <div className="relative">
                  {cancelPolicyData.chargeType === 'Rupees' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  )}
                  <input
                    type="number"
                    step={cancelPolicyData.chargeType === 'Percentage' ? '0.1' : '1'}
                    min="0"
                    value={cancelPolicyData.chargeValue}
                    onChange={(e) => setCancelPolicyData({ ...cancelPolicyData, chargeValue: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none ${
                      cancelPolicyData.chargeType === 'Rupees' ? 'pl-9 pr-4' : 'px-4'
                    }`}
                    required
                  />
                  {cancelPolicyData.chargeType === 'Percentage' && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCancel"
                  checked={cancelPolicyData.isActive}
                  onChange={(e) => setCancelPolicyData({ ...cancelPolicyData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-400 cursor-pointer"
                />
                <label htmlFor="isActiveCancel" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Policy Active
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-black flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Update Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}