"use client";

import React, { useState, useEffect, useCallback } from 'react';
import NurseAPI from '@/app/services/NurseAPI';
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
  FaUserNurse
} from 'react-icons/fa';

export default function NurseWalletPage() {
  // ==========================================
  // STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState('Credit');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Dynamic API Data
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Modal State for Bank Details
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    accountType: 'Savings',
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
    setFormError('');
    try {
      // 1. Fetch Stats & Commission Breakdown
      const statsRes = await NurseAPI.getWalletStats();
      if (statsRes?.success) {
        setStats(statsRes);
        if (statsRes.bankDetails) {
          setBankForm({
            accountType: statsRes.bankDetails.accountType || 'Savings',
            bankName: statsRes.bankDetails.bankName || '',
            accountHolderName: statsRes.bankDetails.accountHolderName || '',
            accountNumber: statsRes.bankDetails.accountNumber || '',
            ifscCode: statsRes.bankDetails.ifscCode || '',
            upiId: statsRes.bankDetails.upiId || ''
          });
        }
      } else {
        setFormError(statsRes?.message || 'Failed to load Nurse wallet metrics.');
      }

      // 2. Fetch Full Ledger Transactions
      const txRes = await NurseAPI.getWalletTransactions().catch(() => null);
      if (txRes?.success) {
        setTransactions(txRes.transactions || []);
      } else {
        setTransactions(statsRes?.transactions || []);
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

  const filteredTransactions = transactions.filter((trx) => trx.type === activeTab);
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
      setFormError('Please map settlement bank details before withdrawing.');
      return;
    }

    // Rule C: Verified Bank Status
    if (!bank?.isVerified) {
      setFormError('Payouts locked: Nurse bank account is awaiting Admin verification.');
      return;
    }

    // Rule A: Amount <= withdrawableBalance
    const withdrawable = stats?.withdrawableBalance ?? 0;
    if (parsedAmount > withdrawable) {
      setFormError(`Requested amount exceeds your withdrawable balance of ₹${withdrawable.toLocaleString('en-IN')}.`);
      return;
    }

    try {
      setWithdrawLoading(true);
      const res = await NurseAPI.requestWithdrawal(parsedAmount);

      if (res?.success) {
        setFormSuccess(
          res.message || 'Withdrawal request submitted successfully. Waiting for Admin manual payout.'
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
      const res = await NurseAPI.updateBankDetails(bankForm);

      if (res?.success) {
        setModalMsg({
          type: 'success',
          text: res.message || 'Bank details updated. Payouts are locked until Admin verifies your account.'
        });
        setTimeout(async () => {
          setIsBankModalOpen(false);
          setModalMsg({ type: '', text: '' });
          await loadWalletData();
        }, 1800);
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
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
            <FaUserNurse className="text-[#08B36A]" /> Nurse Provider Financial Wallet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Home care & clinical duty earnings, platform commission deductions, 7-day cleared funds, and bank settlements.
          </p>
        </div>

        {/* Commission Policy Badge */}
        {stats?.commissionPolicy && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
            <FaPercentage className="text-emerald-600" />
            <span>
              Commission: {stats.commissionPolicy.percentageValue}%{' '}
              {stats.commissionPolicy.fixedRupeesValue > 0 && `+ ₹${stats.commissionPolicy.fixedRupeesValue}`}
            </span>
          </div>
        )}
      </div>

      {/* 1. EARNINGS OVERVIEW STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Duty Earnings</span>
          <p className="text-2xl font-black text-slate-800 mt-1">₹{(stats?.grossEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Total patient visit fees</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Admin Commission Cut</span>
          <p className="text-2xl font-black text-red-600 mt-1">- ₹{(stats?.adminCommissionDeducted || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Platform fee deducted</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Net Total Balance</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">₹{(stats?.totalBalance || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Cleared + 7-Day Hold</p>
        </div>
      </section>

      {/* 2. THREE BALANCE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Withdrawable Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Withdrawable Balance</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Ready</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-1">
              <FaRupeeSign className="text-xl text-[#08B36A]" /> {(stats?.withdrawableBalance || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2">Cleared earnings older than 7 days, adjusted for payouts.</p>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <form onSubmit={handleWithdraw} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
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
                    placeholder="Amount"
                    disabled={withdrawLoading || !bank?.isVerified}
                    className="w-full pl-7 pr-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] disabled:bg-slate-100"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={withdrawLoading || loading || !bank?.isVerified}
                  className="px-4 py-2 bg-[#08B36A] hover:bg-green-600 active:scale-95 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {withdrawLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Withdraw'}
                </button>
              </div>

              {formError && (
                <div className="flex items-start gap-1.5 p-2 rounded-md bg-red-50 text-red-700 text-[11px] font-semibold border border-red-100">
                  <FaExclamationCircle className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-start gap-1.5 p-2 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                  <FaCheckCircle className="mt-0.5 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}
            </form>
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
              Unlocks automatically after 7-day safety lock window from patient duty completion.
            </p>
          </div>
        </div>

        {/* Card 3: Verification Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nurse Status</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">Nurse Provider</span>
            </div>
            <div className="mt-3">
              {bank?.isVerified ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-bold">
                  <FaShieldAlt className="text-emerald-600" size={16} />
                  <span>Settlement Bank Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs font-bold">
                  <FaExclamationCircle className="text-amber-600" size={16} />
                  <span>Pending Admin Verification</span>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-400">
            Payout permission active once verified
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
              <div className="flex justify-between"><span className="text-slate-400">Account Type:</span><span className="text-slate-700">{bank.accountType || 'Savings'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Holder Name:</span><span className="text-slate-700">{bank.accountHolderName}</span></div>
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
                    <p className="text-slate-800 font-bold">{trx.remark || 'Settlement Transaction'}</p>
                    <p className="text-[10px] text-slate-400">{new Date(trx.date || trx.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-sm font-extrabold ${trx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trx.type === 'Credit' ? `+ ₹${trx.amount}` : `- ₹${trx.amount}`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No {activeTab} transaction logs found.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. UPDATE BANK MODAL */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FaUniversity className="text-[#08B36A]" /> Update Nurse Settlement Details
              </h3>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <FaTimes size={18} />
              </button>
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4 font-semibold">
              🔒 Security Guard: Modifying bank details auto-resets verification to Pending. Payouts remain locked until Admin approval.
            </p>

            {modalMsg.text && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold mb-4 border ${
                  modalMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {modalMsg.text}
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
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account Holder Name</label>
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
                  placeholder="nurse@upi"
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