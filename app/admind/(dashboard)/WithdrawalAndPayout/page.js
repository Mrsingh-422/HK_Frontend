"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Wallet, IndianRupee, TrendingUp, ArrowUpRight, Clock, 
  CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Search, 
  Check, X, Ban, Building2, UserCheck, ShieldCheck, ShieldAlert,
  CreditCard, Loader2, Copy, ExternalLink, FileText, Phone, Mail
} from 'lucide-react';
import AdminAPI2 from '@/app/services/AdminAPI2';

export default function AdminWithdrawalAndPayoutPage() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('withdrawals'); // 'withdrawals' | 'banks'
  
  // Data States
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingBanks, setPendingBanks] = useState([]);
  
  // Loading & Notifications
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'Doctor' | 'Hospital' | 'Lab' | 'Pharmacy' | 'Nurse' | 'Ambulance'

  // Modal States
  const [approveModalData, setApproveModalData] = useState(null);
  const [utrReference, setUtrReference] = useState('');

  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- Notification Helpers ---
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4500);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // --- Fetch All Live Dashboard Data ---
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [statsRes, withdrawalsRes, banksRes] = await Promise.allSettled([
        AdminAPI2.getWalletDashboardStats(),
        AdminAPI2.getPendingWithdrawals(),
        AdminAPI2.getPendingBanks()
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || null);
      }

      if (withdrawalsRes.status === 'fulfilled') {
        setWithdrawals(withdrawalsRes.value.data?.data || []);
      } else {
        throw new Error(withdrawalsRes.reason?.response?.data?.message || 'Failed to load pending withdrawals');
      }

      if (banksRes.status === 'fulfilled') {
        setPendingBanks(banksRes.value.data?.data || []);
      }
    } catch (err) {
      triggerError(err.message || 'Error loading payout data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- Action 1: Approve Withdrawal with UTR Reference ---
  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveModalData?._id) return;

    if (!utrReference.trim()) {
      triggerError('Please enter a valid bank UTR / IMPS / UPI transaction reference code');
      return;
    }

    try {
      setActionLoading(true);
      const res = await AdminAPI2.approveWithdrawal(approveModalData._id, {
        transactionReference: utrReference.trim()
      });

      triggerSuccess(res.data?.message || `Payout of ₹${approveModalData.amount} approved successfully!`);
      setApproveModalData(null);
      setUtrReference('');
      await loadAllData();
    } catch (err) {
      triggerError(err.response?.data?.message || err.message || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Action 2: Reject Withdrawal with Auto-Refund ---
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalData?._id) return;

    if (!rejectionReason.trim()) {
      triggerError('Please provide a reason for rejecting this payout');
      return;
    }

    try {
      setActionLoading(true);
      const res = await AdminAPI2.rejectWithdrawal(rejectModalData._id, {
        reason: rejectionReason.trim()
      });

      triggerSuccess(res.data?.message || `Payout request rejected. ₹${rejectModalData.amount} refunded to vendor wallet.`);
      setRejectModalData(null);
      setRejectionReason('');
      await loadAllData();
    } catch (err) {
      triggerError(err.response?.data?.message || err.message || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Action 3: Verify / Unverify Bank Account ---
  const handleVerifyBank = async (vendorModel, vendorId, isVerified) => {
    try {
      setActionLoading(true);
      const res = await AdminAPI2.verifyVendorBankAccount(vendorModel, vendorId, { isVerified });
      triggerSuccess(res.data?.message || `Bank account marked as ${isVerified ? 'Verified' : 'Unverified'}.`);
      await loadAllData();
    } catch (err) {
      triggerError(err.response?.data?.message || err.message || 'Failed to update bank verification status');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Filter Logic ---
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(item => {
      const vendorName = item.vendorId?.name || '';
      const vendorPhone = item.vendorId?.phone || '';
      const bankAcc = item.bankDetails?.accountNumber || '';
      const matchesSearch = 
        vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorPhone.includes(searchTerm) ||
        bankAcc.includes(searchTerm);

      const matchesRole = roleFilter === 'All' || item.vendorModel?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [withdrawals, searchTerm, roleFilter]);

  const filteredBanks = useMemo(() => {
    return pendingBanks.filter(item => {
      const name = item.name || '';
      const phone = item.phone || '';
      const acc = item.bankDetails?.accountNumber || '';
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm) ||
        acc.includes(searchTerm);

      const matchesRole = roleFilter === 'All' || item.vendorModel?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [pendingBanks, searchTerm, roleFilter]);

  // Copy to clipboard helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerSuccess(`${label} copied to clipboard!`);
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hospital': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'lab': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pharmacy': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'nurse': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'ambulance': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} /> {successMsg}
            </div>
            <button onClick={() => setSuccessMsg(null)} className="p-1 hover:opacity-75"><X size={16} /></button>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} /> {errorMsg}
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:opacity-75"><X size={16} /></button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Wallet className="text-emerald-500" size={28} /> Vendor Payouts & Settlement Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review pending withdrawals across Doctors, Hospitals, Labs, Pharmacies, Nurses & Ambulances.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={loadAllData} 
              disabled={loading}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-500' : ''} /> Refresh Data
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all uppercase"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Financial KPI Dashboard Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Platform Gross Business */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Business Volume</span>
                <TrendingUp size={18} className="text-blue-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-800">
                  ₹{Number(stats.totalGrossOrderVolume || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Total volume processed</span>
              </div>
            </div>

            {/* Platform Cutoff Profit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Profit</span>
                <IndianRupee size={18} className="text-emerald-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-emerald-600">
                  ₹{Number(stats.totalAdminCommissionRevenue || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600/80">Admin Cutoff Revenue</span>
              </div>
            </div>

            {/* Net Vendor Liability */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Vendor Liability</span>
                <ArrowUpRight size={18} className="text-amber-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-amber-600">
                  ₹{Number(stats.platformTotalLiability || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Net balance owed to vendors</span>
              </div>
            </div>

            {/* Pending Payouts & Unverified Banks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts Queue</span>
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

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`pb-2 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'withdrawals'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <CreditCard size={15} /> Pending Withdrawal Requests ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('banks')}
              className={`pb-2 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'banks'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Building2 size={15} /> Bank Account Verifications ({pendingBanks.length})
            </button>
          </div>

          {/* Search & Role Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search vendor name, phone, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Doctor">Doctor</option>
              <option value="Hospital">Hospital</option>
              <option value="Lab">Lab</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Nurse">Nurse</option>
              <option value="Ambulance">Ambulance</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PENDING WITHDRAWALS QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto px-4 py-3 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <span className="text-xs font-bold uppercase tracking-wider">Loading pending payouts...</span>
                </div>
              ) : filteredWithdrawals.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                  No pending withdrawal requests found. All payouts are cleared!
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-y-2 text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-5 py-3">Vendor Details</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Requested Amount</th>
                      <th className="px-5 py-3">Beneficiary Bank / UPI Details</th>
                      <th className="px-5 py-3">Request Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredWithdrawals.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50/70 transition-all">
                        {/* Vendor Name & Contact */}
                        <td className="bg-slate-50/50 py-4 px-5 rounded-l-2xl">
                          <div className="font-bold text-slate-900 text-sm">{req.vendorId?.name || 'Unnamed Vendor'}</div>
                          <div className="flex flex-col text-[11px] text-slate-500 mt-0.5">
                            {req.vendorId?.phone && <span>📞 {req.vendorId.phone}</span>}
                            {req.vendorId?.speciality && <span className="text-indigo-600 font-semibold">{req.vendorId.speciality}</span>}
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="bg-slate-50/50 py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-extrabold uppercase tracking-wide ${getRoleBadgeColor(req.vendorModel)}`}>
                            {req.vendorModel}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="bg-slate-50/50 py-4 px-5 font-black text-slate-900 text-base">
                          ₹{Number(req.amount || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Beneficiary Details */}
                        <td className="bg-slate-50/50 py-4 px-5">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-800">{req.bankDetails?.accountHolderName || 'N/A'}</div>
                            <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                              <span>A/C: {req.bankDetails?.accountNumber}</span>
                              <button 
                                onClick={() => copyToClipboard(req.bankDetails?.accountNumber, 'Account number')}
                                className="text-slate-400 hover:text-slate-700"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              IFSC: {req.bankDetails?.ifscCode} | {req.bankDetails?.bankName}
                            </div>
                            {req.bankDetails?.upiId && (
                              <div className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono inline-block">
                                UPI: {req.bankDetails.upiId}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="bg-slate-50/50 py-4 px-5 text-slate-500 font-medium">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="bg-slate-50/50 py-4 px-5 text-right rounded-r-2xl">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setApproveModalData(req);
                                setUtrReference('');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <Check size={13} /> Approve & UTR
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalData(req);
                                setRejectionReason('');
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition inline-flex items-center gap-1"
                            >
                              <Ban size={13} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: BANK ACCOUNT VERIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'banks' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto px-4 py-3 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <span className="text-xs font-bold uppercase tracking-wider">Loading unverified banks...</span>
                </div>
              ) : filteredBanks.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium">
                  No unverified bank accounts pending review.
                </div>
              ) : (
                <table className="w-full border-separate border-spacing-y-2 text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-5 py-3">Vendor Details</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Bank Name & Holder</th>
                      <th className="px-5 py-3">Account No & IFSC</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredBanks.map((item) => (
                      <tr key={item.vendorId} className="hover:bg-slate-50/70 transition-all">
                        {/* Vendor Name */}
                        <td className="bg-slate-50/50 py-4 px-5 rounded-l-2xl">
                          <div className="font-bold text-slate-900 text-sm">{item.name || 'Unnamed Vendor'}</div>
                          <div className="flex flex-col text-[11px] text-slate-500 mt-0.5">
                            {item.phone && <span>📞 {item.phone}</span>}
                            {item.email && <span>✉️ {item.email}</span>}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="bg-slate-50/50 py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-extrabold uppercase tracking-wide ${getRoleBadgeColor(item.vendorModel)}`}>
                            {item.vendorModel}
                          </span>
                        </td>

                        {/* Bank Name & Holder */}
                        <td className="bg-slate-50/50 py-4 px-5">
                          <div className="font-bold text-slate-800">{item.bankDetails?.accountHolderName || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500">{item.bankDetails?.bankName} ({item.bankDetails?.accountType || 'Savings'})</div>
                        </td>

                        {/* Account No & IFSC */}
                        <td className="bg-slate-50/50 py-4 px-5 font-mono">
                          <div className="font-bold text-slate-900">A/C: {item.bankDetails?.accountNumber}</div>
                          <div className="text-slate-500 text-[11px]">IFSC: {item.bankDetails?.ifscCode}</div>
                          {item.bankDetails?.upiId && (
                            <div className="text-[10px] text-indigo-600">UPI: {item.bankDetails.upiId}</div>
                          )}
                        </td>

                        {/* Verification Status */}
                        <td className="bg-slate-50/50 py-4 px-5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700">
                            Unverified
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="bg-slate-50/50 py-4 px-5 text-right rounded-r-2xl">
                          <button
                            onClick={() => handleVerifyBank(item.vendorModel, item.vendorId, true)}
                            disabled={actionLoading}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <UserCheck size={14} /> Verify & Approve Bank
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: APPROVE WITHDRAWAL (UTR INPUT) */}
      {/* ========================================================================= */}
      {approveModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={22} /> Approve Payout Transfer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor: <span className="font-bold text-slate-800">{approveModalData.vendorId?.name} ({approveModalData.vendorModel})</span>
                </p>
              </div>
              <button onClick={() => setApproveModalData(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4 text-xs">
              {/* Transfer Details Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500 uppercase">Payout Amount:</span>
                  <span className="text-lg font-black text-emerald-600">₹{Number(approveModalData.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block font-semibold">Account Holder:</span>
                    <span className="font-bold text-slate-800">{approveModalData.bankDetails?.accountHolderName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Bank Name:</span>
                    <span className="font-bold text-slate-800">{approveModalData.bankDetails?.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">{approveModalData.bankDetails?.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-800">{approveModalData.bankDetails?.ifscCode}</span>
                  </div>
                </div>
              </div>

              {/* UTR Reference Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bank UTR / IMPS / UPI Reference Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-20260904-982134 or IMPS1290381029"
                  value={utrReference}
                  onChange={(e) => setUtrReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enter the transaction ID generated from your netbanking or business payment gateway.
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setApproveModalData(null)}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Confirm & Finalize Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT WITHDRAWAL (AUTO-REFUND) */}
      {/* ========================================================================= */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Ban className="text-rose-500" size={22} /> Reject Withdrawal Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Held balance of <span className="font-bold text-slate-800">₹{rejectModalData.amount}</span> will be refunded to vendor wallet automatically.
                </p>
              </div>
              <button onClick={() => setRejectModalData(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-[11px] font-medium leading-relaxed">
                🚨 <strong>Safety Guard Rail:</strong> When you reject this request, the system automatically executes a credit transaction back into the vendor's wallet balance so no money is lost.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Bank Account Number & Name Mismatch, Invalid IFSC Code, etc."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setRejectModalData(null)}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-bold hover:bg-rose-700 flex items-center justify-center gap-2 shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Ban size={16} />}
                  Reject & Auto-Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}