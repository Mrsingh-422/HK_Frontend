"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import {
  FaWallet,
  FaRupeeSign,
  FaClock,
  FaUniversity,
  FaArrowDown,
  FaArrowUp,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaPercentage,
  FaShieldAlt,
  FaPills,
  FaLock,
  FaCoins,
  FaInfoCircle
} from 'react-icons/fa';

export default function PharmacyWalletPage() {
  // ==========================================
  // STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Credit' | 'Debit'
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Dynamic API Data
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Modal State for Bank
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    accountType: 'Current',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  // ==========================================
  // LOAD WALLET & LEDGER DATA
  // ==========================================
  const loadWalletData = useCallback(async () => {
    setLoading(true);
    setFormError('');
    try {
      // 1. Fetch Stats, Commission Breakdown & Transactions (GET /provider/wallet/stats)
      const statsRes = await PharmacyVendorAPI.getWalletStats();
      if (statsRes?.success) {
        setStats(statsRes);
        setTransactions(statsRes.transactions || []);
        
        if (statsRes.bankDetails) {
          setBankForm({
            accountType: statsRes.bankDetails.accountType || 'Current',
            bankName: statsRes.bankDetails.bankName || '',
            accountHolderName: statsRes.bankDetails.accountHolderName || '',
            accountNumber: statsRes.bankDetails.accountNumber || '',
            ifscCode: statsRes.bankDetails.ifscCode || '',
            upiId: statsRes.bankDetails.upiId || ''
          });
        }
      } else {
        setFormError(statsRes?.message || 'Failed to load Pharmacy wallet metrics.');
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Connection error loading wallet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  // Filter Transactions by Tab
  const filteredTransactions = transactions.filter((trx) => {
    if (activeTab === 'All') return true;
    return trx.type === activeTab;
  });

  const bank = stats?.bankDetails;

  // ==========================================
  // WITHDRAWAL HANDLER
  // ==========================================
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const parsedAmount = Number(withdrawAmount);

    // Rule A: Positive Amount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid positive withdrawal amount.');
      return;
    }

    // Rule B: Bank Details Mapped
    if (!bank?.accountNumber) {
      setFormError('Please map settlement bank details before requesting a withdrawal.');
      return;
    }

    // Rule C: Verified Bank Status
    if (!bank?.isVerified) {
      setFormError('Payouts locked: Pharmacy bank account is awaiting Admin verification.');
      return;
    }

    // Rule D: Amount <= withdrawableBalance
    const withdrawable = stats?.withdrawableBalance ?? 0;
    if (parsedAmount > withdrawable) {
      setFormError(`Requested amount exceeds your withdrawable balance of ₹${withdrawable.toLocaleString('en-IN')}.`);
      return;
    }

    try {
      setWithdrawLoading(true);
      const res = await PharmacyVendorAPI.requestWithdrawal(parsedAmount);

      if (res?.success) {
        setFormSuccess(
          res.message || 'Withdrawal request submitted successfully. Awaiting Admin payout.'
        );
        setWithdrawAmount('');
        await loadWalletData();
      } else {
        setFormError(res?.message || 'Withdrawal submission failed.');
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Withdrawal submission error.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // ==========================================
  // UPDATE BANK HANDLER
  // ==========================================
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setModalMsg({ type: '', text: '' });

    try {
      setBankLoading(true);
      const res = await PharmacyVendorAPI.updateBankDetails(bankForm);

      if (res?.success) {
        setModalMsg({
          type: 'success',
          text: res.message || 'Bank details updated. Payouts are locked until Admin verifies your account.'
        });
        setTimeout(async () => {
          setIsBankModalOpen(false);
          setModalMsg({ type: '', text: '' });
          await loadWalletData();
        }, 1500);
      } else {
        setModalMsg({ type: 'error', text: res?.message || 'Failed to update bank details.' });
      }
    } catch (err) {
      setModalMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Error updating bank details.'
      });
    } finally {
      setBankLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1e3a8a] tracking-tight flex items-center gap-2.5">
            <FaPills className="text-[#08B36A]" /> Pharmacy Financial Wallet
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time medicine sales, platform commission cutoffs, 7-day cleared funds, and bank settlements.
          </p>
        </div>

        {/* Commission Policy Badge */}
        {stats?.commissionPolicy && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-800 shadow-sm">
            <FaPercentage className="text-emerald-600" />
            <span>
              Admin Platform Fee: {stats.commissionPolicy.percentageValue ?? 10}%
              {stats.commissionPolicy.fixedRupeesValue > 0 && ` + ₹${stats.commissionPolicy.fixedRupeesValue}`}
            </span>
          </div>
        )}
      </div>

      {/* 1. FINANCIAL METRICS DASHBOARD (SECTION 4 CHECKLIST) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Business Volume (Gross) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Business Volume (Gross)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FaCoins size={13} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{(stats?.grossEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 font-medium">Gross revenue across all completed orders</p>
        </div>

        {/* Metric 2: Admin Platform Fee */}
        <div className="bg-white p-5 rounded-2xl border border-rose-150 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
              Admin Platform Fee ({stats?.commissionPolicy?.percentageValue ?? 10}%)
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <FaPercentage size={12} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">-₹{(stats?.adminCommissionDeducted || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 font-medium">Automatic deduction on COD & Online orders</p>
        </div>

        {/* Metric 3: Withdrawable Balance (Active Withdraw Button) */}
        <div className="bg-gradient-to-br from-[#08B36A] to-emerald-700 text-white p-5 rounded-2xl shadow-lg shadow-green-500/15 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Withdrawable Balance</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-[8.5px] font-black uppercase">Ready</span>
            </div>
            <p className="text-3xl font-black mt-1">₹{(stats?.withdrawableBalance || 0).toLocaleString('en-IN')}</p>
          </div>
          <p className="text-[10px] text-emerald-100 font-medium">Available for immediate bank transfer</p>
        </div>

        {/* Metric 4: 7-Day Locked (Pending) */}
        <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1">
              <FaLock size={10} /> 7-Day Locked (Pending)
            </span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <FaClock size={12} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900">₹{(stats?.pendingBalance || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-amber-700 font-medium">Will unlock after 7-day customer return window</p>
        </div>

      </section>

      {/* 2. WITHDRAWAL & BANK SETTLEMENT SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Quick Withdrawal Box */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FaWallet className="text-[#08B36A]" /> Request Payout
            </h3>
            <span className="text-[10px] font-black uppercase text-slate-400">Direct Transfer</span>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Enter Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    if (formError) setFormError('');
                    if (formSuccess) setFormSuccess('');
                  }}
                  placeholder="e.g. 5000"
                  disabled={withdrawLoading || !bank?.isVerified || (stats?.withdrawableBalance || 0) <= 0}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-[#08B36A] disabled:bg-slate-100 disabled:opacity-60 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={withdrawLoading || loading || !bank?.isVerified || (stats?.withdrawableBalance || 0) <= 0}
              className="w-full py-3.5 bg-[#08B36A] hover:bg-emerald-600 active:scale-98 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-green-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {withdrawLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Withdraw to Bank'}
            </button>

            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-150">
                <FaExclamationCircle className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-150">
                <FaCheckCircle className="mt-0.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}
          </form>

          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            * Payouts are transferred directly to your verified bank settlement account via NEFT/IMPS.
          </p>
        </div>

        {/* Mapped Bank Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FaUniversity className="text-[#08B36A]" /> Linked Settlement Bank Account
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Primary account for all pharmacy order payouts</p>
            </div>
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition"
            >
              Update Bank
            </button>
          </div>

          {bank?.accountNumber ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Account Holder</span>
                <p className="font-bold text-slate-800 truncate">{bank.accountHolderName || 'N/A'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Bank & Branch</span>
                <p className="font-bold text-slate-800">{bank.bankName || 'N/A'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Account Number</span>
                <p className="font-mono font-bold text-slate-800">{bank.accountNumber}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">IFSC Code</span>
                <p className="font-mono uppercase font-bold text-slate-800">{bank.ifscCode}</p>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Verification Status</span>
                {bank.isVerified ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px] uppercase flex items-center gap-1.5 border border-emerald-200">
                    <FaShieldAlt size={10} /> Verified Settlement Account
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-black text-[10px] uppercase flex items-center gap-1.5 border border-amber-200">
                    <FaExclamationCircle size={10} /> Pending Admin Verification
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <FaUniversity className="mx-auto text-3xl opacity-30" />
              <p className="text-xs font-bold uppercase">No settlement bank account linked yet.</p>
              <button 
                onClick={() => setIsBankModalOpen(true)}
                className="text-xs text-[#08B36A] font-black uppercase underline hover:opacity-80"
              >
                + Add Bank Account
              </button>
            </div>
          )}
        </div>

      </section>

      {/* 3. TRANSACTION LEDGER AUDIT */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base uppercase tracking-wider">
              Financial Audit Ledger
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Online order credits and COD platform commission deductions
            </p>
          </div>

          <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {['All', 'Credit', 'Debit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-[#08B36A] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'Credit' && <FaArrowDown className="inline mr-1" />}
                {tab === 'Debit' && <FaArrowUp className="inline mr-1" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-2">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((trx, idx) => (
              <div key={trx._id || idx} className="py-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
                    trx.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {trx.type === 'Credit' ? <FaArrowDown size={12} /> : <FaArrowUp size={12} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs md:text-sm">{trx.remark || 'Settlement Transaction'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {trx.orderId && <span className="font-mono text-slate-500 mr-2 font-bold">#{trx.orderId}</span>}
                      {new Date(trx.date || trx.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm md:text-base font-black ${
                    trx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {trx.type === 'Credit' ? `+₹${trx.amount}` : `-₹${trx.amount}`}
                  </span>
                  <span className={`block text-[9px] font-black uppercase ${
                    trx.type === 'Credit' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {trx.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
              No {activeTab !== 'All' ? activeTab : ''} transaction records found.
            </div>
          )}
        </div>
      </section>

      {/* 4. UPDATE BANK MODAL */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-150 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FaUniversity className="text-[#08B36A]" /> Update Bank Settlement Account
              </h3>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[10px] font-semibold leading-relaxed flex items-start gap-2">
              <FaShieldAlt className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <span>Modifying bank details auto-resets verification to Pending. Payouts are locked until Admin approval.</span>
            </div>

            {modalMsg.text && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border ${
                  modalMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {modalMsg.text}
              </div>
            )}

            <form onSubmit={handleBankSubmit} className="space-y-3 font-sans">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Account Type *</label>
                <select
                  value={bankForm.accountType}
                  onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="Current">Current Account</option>
                  <option value="Savings">Savings Account</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Account Number *</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  placeholder="pharmacy@hdfcbank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={bankLoading}
                className="w-full py-3 bg-[#08B36A] hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {bankLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Save Bank Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}