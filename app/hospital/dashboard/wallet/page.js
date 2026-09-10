"use client";

import React, { useState, useEffect, useCallback } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
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
  FaHospital
} from 'react-icons/fa';

export default function HospitalWalletPage() {
  // ==========================================
  // STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState('Credit');
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  // Dynamic API Data
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState({ type: '', text: '' });

  // Update Bank Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankModalMsg, setBankModalMsg] = useState({ type: '', text: '' });

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
  // LOAD DATA
  // ==========================================
  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await HospitalAPI.getWalletStats();
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
      }
    } catch (err) {
      console.error('Failed to load hospital wallet metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const filteredTransactions = transactions.filter((trx) => trx.type === activeTab);
  const bank = stats?.bankDetails;

  // ==========================================
  // WITHDRAWAL HANDLER
  // ==========================================
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawMsg({ type: '', text: '' });

    const parsedAmount = Number(withdrawAmount);

    // Validation: Positive amount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Please enter a valid positive withdrawal amount.' });
      return;
    }

    // Validation: Bank mapped
    if (!bank?.accountNumber) {
      setWithdrawMsg({ type: 'error', text: 'Please map a settlement bank account first.' });
      return;
    }

    // Validation: Bank verified
    if (!bank?.isVerified) {
      setWithdrawMsg({
        type: 'error',
        text: 'Payouts locked: Hospital bank account is awaiting Admin manual verification.'
      });
      return;
    }

    // Validation: Amount <= withdrawableBalance
    const withdrawable = stats?.withdrawableBalance ?? 0;
    if (parsedAmount > withdrawable) {
      setWithdrawMsg({
        type: 'error',
        text: `Cannot exceed available withdrawable balance of ₹${withdrawable.toLocaleString('en-IN')}.`
      });
      return;
    }

    try {
      setWithdrawLoading(true);
      const res = await HospitalAPI.requestWithdrawal(parsedAmount);

      if (res?.success) {
        setWithdrawMsg({
          type: 'success',
          text: res.message || 'Withdrawal request submitted successfully to Admin.'
        });
        setTimeout(async () => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount('');
          setWithdrawMsg({ type: '', text: '' });
          await loadWalletData();
        }, 1800);
      } else {
        setWithdrawMsg({ type: 'error', text: res?.message || 'Withdrawal request failed.' });
      }
    } catch (err) {
      setWithdrawMsg({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Network error during payout request.'
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  // ==========================================
  // UPDATE BANK HANDLER
  // ==========================================
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setBankModalMsg({ type: '', text: '' });

    try {
      setBankLoading(true);
      const res = await HospitalAPI.updateBankDetails(bankForm);

      if (res?.success) {
        setBankModalMsg({
          type: 'success',
          text:
            res.message ||
            'Hospital bank details updated successfully. Payouts are locked until Admin verifies your account.'
        });
        setTimeout(async () => {
          setIsBankModalOpen(false);
          setBankModalMsg({ type: '', text: '' });
          await loadWalletData();
        }, 1800);
      } else {
        setBankModalMsg({ type: 'error', text: res?.message || 'Failed to update bank details.' });
      }
    } catch (err) {
      setBankModalMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Error updating bank details.'
      });
    } finally {
      setBankLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
            <FaHospital className="text-[#08B36A]" /> Hospital Financial & Settlement Wallet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track admission billing revenues, commission deductions, 7-day cleared funds, and bank payouts.
          </p>
        </div>

        {/* Commission Policy Badge */}
        {stats?.commissionPolicy && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
            <FaPercentage className="text-emerald-600" />
            <span>
              Platform Commission: {stats.commissionPolicy.percentageValue}%{' '}
              {stats.commissionPolicy.fixedRupeesValue > 0 && `+ ₹${stats.commissionPolicy.fixedRupeesValue}`}
            </span>
          </div>
        )}
      </div>

      {/* 1. REVENUE OVERVIEW STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Billings</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">₹{(stats?.grossEarnings || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Admin Commission Cut</span>
          <p className="text-xl font-extrabold text-red-600 mt-1">- ₹{(stats?.adminCommissionDeducted || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Billings</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">₹{(stats?.stats?.today || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Billings</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">₹{(stats?.stats?.weekly || 0).toLocaleString('en-IN')}</p>
        </div>
      </section>

      {/* 2. THREE BALANCE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Withdrawable Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Withdrawable Balance</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Cleared</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-1">
              <FaRupeeSign className="text-xl text-[#08B36A]" /> {(stats?.withdrawableBalance || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2">Available for payout transfer to your verified hospital account.</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setWithdrawMsg({ type: '', text: '' });
                setWithdrawAmount('');
                setIsWithdrawModalOpen(true);
              }}
              disabled={!bank?.isVerified}
              className="w-full py-2.5 bg-[#08B36A] hover:bg-green-600 active:scale-95 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Card 2: Pending Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Balance</span>
              <FaClock className="text-slate-400" size={14} />
            </div>
            <h3 className="text-3xl font-black text-slate-500 flex items-center gap-1">
              <FaRupeeSign className="text-xl" /> {(stats?.pendingBalance || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4">
            <p className="text-[11px] text-slate-400 font-semibold italic">
              7-Day safety lock window for insurance verification and discharge settlements.
            </p>
          </div>
        </div>

        {/* Card 3: Net Total Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Total Balance</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold">Cleared + Locked</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-1">
              <FaRupeeSign className="text-xl text-indigo-600" /> {(stats?.totalBalance || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-400">
            Total hospital net earnings
          </div>
        </div>
      </section>

      {/* 3. SETTLEMENT BANK & TRANSACTION HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bank Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FaUniversity className="text-[#08B36A]" /> Settlement Account
            </h3>
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Update
            </button>
          </div>

          {bank?.accountNumber ? (
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                {bank.isVerified ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold flex items-center gap-1">
                    <FaShieldAlt size={10} /> Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold">
                    Pending Verification
                  </span>
                )}
              </div>
              <div className="flex justify-between"><span className="text-slate-400">Account Type:</span><span className="text-slate-700">{bank.accountType || 'Current'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Hospital/Trust:</span><span className="text-slate-700">{bank.accountHolderName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Account No:</span><span className="text-slate-700 font-mono">{bank.accountNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Bank Name:</span><span className="text-slate-700">{bank.bankName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">IFSC Code:</span><span className="text-slate-700 font-mono uppercase">{bank.ifscCode}</span></div>
              {bank.upiId && <div className="flex justify-between"><span className="text-slate-400">UPI ID:</span><span className="text-slate-700 font-mono">{bank.upiId}</span></div>}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No bank account mapped. Click Update to add one.</p>
          )}
        </div>

        {/* Transaction History Ledger */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Ledger Audit History</h3>

            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
              {['Credit', 'Debit'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1 rounded text-[11px] font-bold transition-all ${
                    activeTab === tab ? 'bg-[#08B36A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'Credit' ? <FaArrowDown className="inline mr-1" /> : <FaArrowUp className="inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100 pr-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((trx, idx) => (
                <div key={trx._id || idx} className="py-2.5 flex justify-between items-center text-xs font-semibold">
                  <div className="space-y-1">
                    <p className="text-slate-800 font-bold">{trx.remark || 'Admission Settlement'}</p>
                    <p className="text-[10px] text-slate-400">{new Date(trx.date || trx.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-sm font-extrabold ${trx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trx.type === 'Credit' ? `+ ₹${trx.amount}` : `- ₹${trx.amount}`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No {activeTab} transactions found.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. WITHDRAWAL REQUEST MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FaWallet className="text-[#08B36A]" /> Request Hospital Payout
              </h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs font-semibold space-y-1">
              <p className="text-slate-500">Destination: <span className="text-slate-800">{bank?.bankName}</span></p>
              <p className="text-slate-500">Account: <span className="text-slate-800 font-mono">•••• {bank?.accountNumber?.slice(-4)}</span></p>
              <p className="text-slate-500">Available Limit: <span className="text-emerald-700 font-bold">₹{(stats?.withdrawableBalance || 0).toLocaleString('en-IN')}</span></p>
            </div>

            {withdrawMsg.text && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold mb-4 border ${
                  withdrawMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {withdrawMsg.text}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter payout amount"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  disabled={withdrawLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawLoading || !withdrawAmount}
                  className="w-2/3 py-2.5 bg-[#08B36A] hover:bg-green-600 active:scale-95 text-white font-bold rounded-lg text-xs transition flex justify-center items-center gap-1.5 disabled:opacity-50"
                >
                  {withdrawLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. UPDATE BANK MODAL */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FaUniversity className="text-[#08B36A]" /> Update Hospital Bank Details
              </h3>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <FaTimes size={18} />
              </button>
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4 font-semibold">
              🔒 Security Guard: Updating settlement details auto-resets verification to Pending. Payouts remain locked until Admin approval.
            </p>

            {bankModalMsg.text && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold mb-4 border ${
                  bankModalMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {bankModalMsg.text}
              </div>
            )}

            <form onSubmit={handleBankSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Type</label>
                <select
                  value={bankForm.accountType}
                  onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Current">Current</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Hospital / Trust Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  placeholder="hospital@axisbank"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={bankLoading}
                className="w-full py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-lg text-xs transition flex justify-center items-center gap-1.5 disabled:opacity-50"
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