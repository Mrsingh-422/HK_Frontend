"use client";

import DoctorAPI from '@/app/services/DoctorAPI'; // Adjust path if needed
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaWallet,
  FaMoneyBillWave,
  FaRupeeSign,
  FaUniversity,
  FaArrowDown,
  FaArrowUp,
  FaClock,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa';

export default function WalletDashboard() {
  
  // ==========================================
  // STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState('Credit');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Dynamic Data from API
  const [stats, setStats] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Load Wallet Statistics and Ledger Logs
  const loadWalletData = useCallback(async () => {
    setLoading(true);
    setFormError('');
    try {
      // 1. Fetch Balances and Mapped Settlement Account
      if (typeof DoctorAPI?.getWalletStats !== 'function') {
        setFormError("The 'getWalletStats' function is missing from your DoctorAPI service file.");
        return;
      }

      const statsRes = await DoctorAPI.getWalletStats();
      if (statsRes?.success) {
        setStats(statsRes.data || statsRes);
        
        // Map the verified settlement account returned by API
        const bankData = statsRes.bankDetails || statsRes.data?.bankDetails;
        if (bankData) {
          const mainBank = {
            id: 'verified-primary',
            holder: bankData.accountHolderName,
            accNo: bankData.accountNumber,
            bankName: bankData.bankName,
            ifsc: bankData.ifscCode,
            isVerified: bankData.isVerified
          };
          setBankAccounts([mainBank]);
          setSelectedBank('verified-primary');
        } else {
          setBankAccounts([]);
        }
      } else {
        setFormError(statsRes?.message || "Failed to load wallet metrics.");
      }

      // 2. Fetch Transaction History Ledger
      if (typeof DoctorAPI?.getDoctorTransactions === 'function') {
        const txRes = await DoctorAPI.getDoctorTransactions();
        if (txRes?.success) {
          setTransactions(txRes.transactions || txRes.data || []);
        } else {
          setTransactions([]);
        }
      }

    } catch (err) {
      setFormError(err?.response?.data?.message || "An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  // Filters transactions by tab selection (Credit or Debit)
  const filteredTransactions = transactions.filter(trx => trx.type === activeTab);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const parsedAmount = Number(withdrawAmount);

    // Validation: Check valid positive number
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid positive withdrawal amount.");
      return;
    }

    // Validation: Check if settlement bank account exists
    if (!selectedBank && bankAccounts.length === 0) {
      setFormError("No verified settlement bank account mapped. Please add a bank account first.");
      return;
    }

    // Validation: Check requestedAmount <= withdrawableBalance
    const availableBalance = stats?.withdrawableBalance ?? 0;
    if (parsedAmount > availableBalance) {
      setFormError(`Insufficient balance. Your withdrawable balance is ₹${availableBalance.toLocaleString('en-IN')}.`);
      return;
    }

    try {
      if (typeof DoctorAPI?.requestWithdrawal !== 'function') {
        setFormError("API method 'requestWithdrawal' is missing from DoctorAPI.js.");
        return;
      }

      setWithdrawLoading(true);

      // Call API: POST /doctor/wallet/withdraw with { amount: parsedAmount }
      const res = await DoctorAPI.requestWithdrawal(parsedAmount);

      if (res?.success) {
        const successMessage = res.message || "Withdrawal request submitted successfully. Waiting for Admin manual payout approval.";
        setFormSuccess(successMessage);
        setWithdrawAmount('');
        
        // Refresh wallet data to reflect updated balances
        await loadWalletData();
      } else {
        setFormError(res?.message || "Failed to submit withdrawal request.");
      }
    } catch (err) {
      setFormError(
        err?.response?.data?.message || 
        err?.message || 
        "An error occurred while submitting withdrawal request."
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10 min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* ========================================= */}
      {/* 1. MY WALLET BALANCE GRID                 */}
      {/* ========================================= */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
          <FaWallet className="text-[#08B36A]"/> My Wallet Balances
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Withdrawable Balance (Primary Action Card) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Withdrawable Balance</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Ready</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-1">
                <FaRupeeSign className="text-xl text-[#08B36A]"/> {stats?.withdrawableBalance?.toLocaleString('en-IN') || '0'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2">Cleared earnings older than 7 days, adjusted for requested payouts.</p>
            </div>
            
            {/* Withdrawal Quick Form */}
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
                      disabled={withdrawLoading}
                      className="w-full pl-7 pr-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all disabled:bg-slate-100"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={withdrawLoading || loading}
                    className="px-4 py-2 bg-[#08B36A] hover:bg-green-600 active:scale-95 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {withdrawLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Withdraw'
                    )}
                  </button>
                </div>

                {/* Status Messages */}
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
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Pending Balance</span>
                <FaClock className="text-slate-400" size={14} />
              </div>
              <h3 className="text-3xl font-black text-slate-500 flex items-center gap-1">
                <FaRupeeSign className="text-xl"/> {stats?.pendingBalance?.toLocaleString('en-IN') || '0'}
              </h3>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-[11px] text-slate-400 font-semibold italic">
                Unlocks after 7 days of order completion.
              </p>
            </div>
          </div>

          {/* Card 3: Total Balance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Total Balance</span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold">Cleared + Locked</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-1">
                <FaRupeeSign className="text-xl text-indigo-600"/> {stats?.totalBalance?.toLocaleString('en-IN') || '0'}
              </h3>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-400 flex justify-between">
              <span>Today: ₹{stats?.todayEarning || '0'}</span>
              <span>Weekly: ₹{stats?.weeklyEarning || '0'}</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================= */}
      {/* 2. BANK SETTINGS & TRANSACTION LOGS       */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settlement Bank Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Settlement Account</h3>
          </div>
          {bankAccounts.length > 0 ? (
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between"><span className="text-slate-400">Holder Name:</span><span className="text-slate-700">{bankAccounts[0].holder}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Account Number:</span><span className="text-slate-700 font-mono">{bankAccounts[0].accNo}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Bank Destination:</span><span className="text-slate-700">{bankAccounts[0].bankName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">IFSC Code:</span><span className="text-slate-700 font-mono uppercase">{bankAccounts[0].ifsc}</span></div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No settlement account mapped.</p>
          )}
        </div>

        {/* Transaction History Ledger */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Ledger Audit History</h3>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
              {['Credit', 'Debit'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1 rounded text-[11px] font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-[#08B36A] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'Credit' ? <FaArrowDown className="inline mr-1" /> : <FaArrowUp className="inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 pr-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((trx, idx) => (
                <div key={trx._id || idx} className="py-2.5 flex justify-between items-center text-xs font-semibold">
                  <div className="space-y-1">
                    <p className="text-slate-800 font-bold">{trx.remark || "Settlement Transaction"}</p>
                    <p className="text-[10px] text-slate-400">{new Date(trx.date || trx.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-sm font-extrabold ${trx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trx.type === 'Credit' ? `+ ₹${trx.amount}` : `- ₹${trx.amount}`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No {activeTab} history logs recorded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}