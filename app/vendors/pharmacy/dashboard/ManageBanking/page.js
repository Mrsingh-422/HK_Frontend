'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaUniversity, FaUser, FaIdCard, FaMoneyCheck, FaCheckCircle, 
  FaExclamationTriangle, FaShieldAlt, FaSpinner, FaChevronDown, FaSave,
  FaSyncAlt, FaWallet, FaLock, FaArrowDown, FaArrowUp, FaHistory,
  FaPercent, FaCoins
} from "react-icons/fa";
import { toast, Toaster } from 'react-hot-toast';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function ManageBankingPage() {
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Wallet Stats State (Section 4)
  const [walletStats, setWalletStats] = useState({
    grossEarnings: 0,
    adminCommissionDeducted: 0,
    commissionPolicy: { commissionType: 'Percentage', percentageValue: 10, fixedRupeesValue: 0 },
    totalBalance: 0,
    withdrawableBalance: 0,
    pendingBalance: 0,
    transactions: []
  });

  // Bank Form State
  const [bankDetails, setBankDetails] = useState({
    accountType: 'Savings',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    isVerified: false
  });

  useEffect(() => {
    fetchBankAndWalletDetails();
  }, []);

  // 1. Fetch Wallet Stats & Bank Details (GET /provider/wallet/stats)
  const fetchBankAndWalletDetails = async () => {
    setFetching(true);
    try {
      const response = await PharmacyVendorAPI.getWalletStats();
      
      if (response && response.success) {
        // Set Wallet Stats
        setWalletStats({
          grossEarnings: response.grossEarnings ?? 0,
          adminCommissionDeducted: response.adminCommissionDeducted ?? 0,
          commissionPolicy: response.commissionPolicy || { percentageValue: 10 },
          totalBalance: response.totalBalance ?? 0,
          withdrawableBalance: response.withdrawableBalance ?? 0,
          pendingBalance: response.pendingBalance ?? 0,
          transactions: response.transactions || []
        });

        // Set Bank Details
        if (response.bankDetails) {
          const bd = response.bankDetails;
          setBankDetails({
            accountType: bd.accountType || 'Savings',
            bankName: bd.bankName || '',
            accountHolderName: bd.accountHolderName || '',
            accountNumber: bd.accountNumber || '',
            ifscCode: bd.ifscCode || '',
            upiId: bd.upiId || '',
            isVerified: bd.isVerified || false
          });
        }
      }
    } catch (error) {
      console.error("Error fetching pharmacy wallet & bank settings", error);
      toast.error("Failed to load current wallet & bank settlement details.");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  // 2. Save changes directly to the Bank Details API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const bankPayload = {
      accountType: bankDetails.accountType,
      bankName: bankDetails.bankName,
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: bankDetails.accountNumber,
      ifscCode: bankDetails.ifscCode,
      upiId: bankDetails.upiId || undefined
    };

    try {
      const res = await PharmacyVendorAPI.updateBankDetails(bankPayload);
      
      if (res && res.success) {
        toast.success(res.message || "Bank details updated. Payouts are locked until verification.");
        await fetchBankAndWalletDetails();
      } else {
        toast.error(res?.message || "Failed to update settlement account details.");
      }
    } catch (error) {
      console.error("Error updating bank details", error);
      toast.error("An unexpected error occurred while updating bank details.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FaSyncAlt className="animate-spin text-[#08B36A] text-4xl mb-4"/>
        <p className="text-gray-500 font-bold uppercase tracking-tighter">Loading Wallet & Settlement Settings...</p>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-20 px-4 md:px-6 font-['Plus_Jakarta_Sans'] space-y-10">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-[#08B36A] text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
          <FaWallet size={32}/>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase leading-none">
          Pharmacy Wallet & Settlements
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-2 font-semibold">
          Track real-time earnings, platform commission deductions, and configure payout accounts
        </p>
      </div>

      {/* ========================================================= */}
      {/* 📌 SECTION 4: PHARMACY PROVIDER WALLET STATS DASHBOARD */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Business Volume (Gross) */}
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Business Volume</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FaCoins size={14} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{walletStats.grossEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 font-medium">Gross value of all delivered orders</p>
        </div>

        {/* Admin Platform Fee */}
        <div className="bg-white border border-rose-150 rounded-[2rem] p-6 shadow-sm space-y-2 hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">
              Admin Platform Fee ({walletStats.commissionPolicy?.percentageValue ?? 10}%)
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <FaPercent size={12} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">-₹{walletStats.adminCommissionDeducted.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 font-medium">Automatic commission on COD & Online sales</p>
        </div>

        {/* Withdrawable Balance */}
        <div className="bg-gradient-to-br from-[#08B36A] to-emerald-700 text-white rounded-[2rem] p-6 shadow-xl shadow-green-500/15 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Withdrawable Balance</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-[8.5px] font-black uppercase">Active</span>
          </div>
          <p className="text-3xl font-black relative z-10">₹{walletStats.withdrawableBalance.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-100 font-medium relative z-10">Available for direct bank withdrawal</p>
        </div>

        {/* 7-Day Locked (Pending) */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-[2rem] p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
              <FaLock size={10} /> 7-Day Locked (Pending)
            </span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <FaLock size={12} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900">₹{walletStats.pendingBalance.toLocaleString()}</p>
          <p className="text-[10px] text-amber-700 font-medium leading-tight">
            Unlocks automatically after 7-day patient return window expires
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📌 BANK SETTLEMENT & PREVIEW SECTION */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left column: card preview & security info */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Virtual Bank Card Preview */}
          <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="flex justify-between items-start z-10">
              <FaUniversity size={28} className="text-[#08B36A]" />
              <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full tracking-wider border ${
                bankDetails.isVerified 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {bankDetails.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>

            <div className="z-10 my-4">
              <p className="text-[9px] uppercase font-semibold text-blue-200 tracking-widest">Account Number</p>
              <p className="text-lg font-bold tracking-wider font-mono mt-1">
                {bankDetails.accountNumber ? `•••• •••• ${bankDetails.accountNumber.slice(-4)}` : "•••• •••• ••••"}
              </p>
            </div>

            <div className="flex justify-between items-end z-10">
              <div>
                <p className="text-[8px] uppercase font-semibold text-blue-200 tracking-widest">Account Holder</p>
                <p className="text-xs font-bold truncate max-w-[150px]">{bankDetails.accountHolderName || "Not Configured"}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase font-semibold text-blue-200 tracking-widest">Bank</p>
                <p className="text-xs font-bold">{bankDetails.bankName || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Warning notice */}
          <div className="bg-yellow-50 border border-yellow-150 rounded-[2rem] p-6 text-yellow-800 text-xs flex gap-3 leading-relaxed">
            <FaShieldAlt className="text-yellow-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-black uppercase tracking-wider text-[10px] mb-1">Fraud Prevention Notice</p>
              Modifying bank account credentials requires admin review. Settlement withdrawals are held until updated account verification is complete.
            </div>
          </div>
        </div>

        {/* Right column: Bank form details */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
              <FaMoneyCheck className="text-[#08B36A]" /> Bank Settlement Details
            </h3>
            
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${
              bankDetails.isVerified 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {bankDetails.isVerified ? "Verified Account" : "Verification Pending"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
            <div className="sm:col-span-2 space-y-1">
              <label className="label-style">Account Holder Name *</label>
              <input 
                type="text" 
                name="accountHolderName" 
                required 
                value={bankDetails.accountHolderName} 
                onChange={handleInputChange} 
                className="input-style"
                placeholder="Full Name as registered on Bank Account"
              />
            </div>

            <div className="space-y-1">
              <label className="label-style">Bank Name *</label>
              <input 
                type="text" 
                name="bankName" 
                required 
                value={bankDetails.bankName} 
                onChange={handleInputChange} 
                className="input-style"
                placeholder="e.g. HDFC Bank, State Bank of India"
              />
            </div>

            <div className="space-y-1">
              <label className="label-style">Account Type *</label>
              <div className="relative">
                <select 
                  name="accountType" 
                  value={bankDetails.accountType} 
                  onChange={handleInputChange} 
                  className="input-style appearance-none bg-white pr-10"
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current Account</option>
                </select>
                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="label-style">Account Number *</label>
              <input 
                type="text" 
                name="accountNumber" 
                required 
                value={bankDetails.accountNumber} 
                onChange={handleInputChange} 
                className="input-style font-mono"
                placeholder="Enter 9-18 digit account number"
              />
            </div>

            <div className="space-y-1">
              <label className="label-style">IFSC Code *</label>
              <input 
                type="text" 
                name="ifscCode" 
                required 
                value={bankDetails.ifscCode} 
                onChange={handleInputChange} 
                className="input-style uppercase font-mono"
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="label-style">UPI ID (Optional)</label>
              <input 
                type="text" 
                name="upiId" 
                value={bankDetails.upiId || ''} 
                onChange={handleInputChange} 
                className="input-style font-mono"
                placeholder="e.g. apollopharmacy@hdfcbank"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button 
              type="submit" 
              disabled={saving} 
              className="px-8 py-4 bg-[#08B36A] hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/10 transition flex items-center gap-2 active:scale-95 text-xs uppercase tracking-wider font-sans disabled:opacity-50"
            >
              {saving ? <><FaSpinner className="animate-spin" /> Saving Account...</> : <><FaSave /> Save Account Info</>}
            </button>
          </div>
        </form>

      </div>

      {/* ========================================================= */}
      {/* 📌 RECENT TRANSACTIONS LEDGER */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
              <FaHistory className="text-[#08B36A]" /> Recent Wallet Transactions
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
              Credits from Online orders and Debits from COD Admin Platform Fees
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">
            {walletStats.transactions?.length || 0} Transactions
          </span>
        </div>

        {(!walletStats.transactions || walletStats.transactions.length === 0) ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
            No transaction records found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {walletStats.transactions.map((tx, idx) => (
              <div key={idx} className="py-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
                    tx.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {tx.type === 'Credit' ? <FaArrowDown size={12} /> : <FaArrowUp size={12} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs md:text-sm">{tx.remark}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {tx.orderId && <span className="font-mono text-slate-500 mr-2">#{tx.orderId}</span>}
                      {new Date(tx.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black text-sm md:text-base ${
                    tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'Credit' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                  </span>
                  <span className={`block text-[9px] font-black uppercase ${
                    tx.type === 'Credit' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {tx.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .label-style { display: block; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; font-size: 0.65rem; color: #9ca3af; margin-bottom: 0.25rem; margin-left: 0.5rem; }
        .input-style { width: 100%; padding: 16px 20px; background-color: #f8fafc; border-radius: 1.5rem; border: 1px solid #f1f5f9; font-weight: 800; color: #1e293b; font-size: 0.95rem; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .input-style:focus { background-color: white; border-color: #08B36A; box-shadow: 0 15px 30px -10px rgba(8, 179, 106, 0.15); transform: translateY(-2px); }
        .input-style:disabled { cursor: not-allowed; opacity: 0.7; }
      `}</style>
    </div>
  );
}