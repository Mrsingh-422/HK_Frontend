'use client'
 
import React, { useState, useEffect } from 'react'
import {
  FaUniversity, FaUser, FaIdCard, FaMoneyCheck, FaCheckCircle,
  FaExclamationTriangle, FaShieldAlt, FaSpinner, FaChevronDown, FaSave,
  FaSyncAlt
} from "react-icons/fa"
import { toast, Toaster } from 'react-hot-toast'
import DoctorAPI from '@/app/services/DoctorAPI'
 
export default function ManageBankingPage() {
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    fetchBankDetails();
  }, []);
 
  const fetchBankDetails = async () => {
    setFetching(true);
    try {
      const response = await DoctorAPI.getProfile();
      if (response.success && response.data?.bankDetails) {
        const bd = response.data.bankDetails;
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
    } catch (error) {
      console.error("Error fetching doctor bank settings", error);
      toast.error("Failed to load current bank settlement details.");
    } finally {
      setFetching(false);
    }
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
 
    const bankPayload = {
      accountType: bankDetails.accountType,
      bankName: bankDetails.bankName,
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: bankDetails.accountNumber,
      ifscCode: bankDetails.ifscCode,
      upiId: bankDetails.upiId
    };
 
    try {
      const res = await DoctorAPI.updateBankDetails(bankPayload);
      if (res.success) {
        toast.success(res.message || "Bank details successfully saved. Payouts are locked until verification.");
        await fetchBankDetails(); // Reload status
      } else {
        toast.error(res.message || "Failed to update settlement account details.");
      }
    } catch (error) {
      console.error("Error updating doctor bank details", error);
      toast.error("An unexpected error occurred while updating bank details.");
    } finally {
      setSaving(false);
    }
  };
 
  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FaSyncAlt className="animate-spin text-[#08B36A] text-4xl mb-4"/>
        <p className="text-gray-500 font-bold uppercase tracking-tighter">Loading Settlement Settings...</p>
    </div>
  );
 
  return (
    <div className="w-full  mx-auto pb-20 px-4">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-[#08B36A] text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
          <FaUniversity size={32}/>
        </div>
        <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase leading-none">Settlement Settings</h1>
        <p className="text-sm text-gray-500 mt-2 font-semibold">Configure your bank account details for direct wallet payouts</p>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left column: card preview & info */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Card Representation */}
          <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="flex justify-between items-start z-10">
              <FaUniversity size={28} className="text-[#08B36A]" />
              {/* Card Badge: Verified / Unverified */}
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
              <p className="font-black uppercase tracking-wider text-[10px] mb-1">Fraud Prevention Warning</p>
              Any changes made to bank account credentials automatically reset your status to <strong className="font-bold">Unverified</strong>. Payouts will remain locked until verified by an Administrator.
            </div>
          </div>
        </div>
 
        {/* Right column: Bank form details */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
              <FaMoneyCheck className="text-[#08B36A]" /> Update Bank Settlement Account
            </h3>
            
            {/* Header Status Badge: Verified / Unverified */}
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${
              bankDetails.isVerified
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {bankDetails.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-1">
              <label className="label-style">Account Holder Name</label>
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
              <label className="label-style">Bank Name</label>
              <input
                type="text"
                name="bankName"
                required
                value={bankDetails.bankName}
                onChange={handleInputChange}
                className="input-style"
                placeholder="e.g. HDFC Bank"
              />
            </div>
 
            <div className="space-y-1">
              <label className="label-style">Account Type</label>
              <div className="relative">
                <select
                  name="accountType"
                  value={bankDetails.accountType}
                  onChange={handleInputChange}
                  className="input-style appearance-none bg-white pr-10"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
 
            <div className="space-y-1">
              <label className="label-style">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                required
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                className="input-style font-mono"
                placeholder="Enter bank account number"
              />
            </div>
 
            <div className="space-y-1">
              <label className="label-style">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                required
                value={bankDetails.ifscCode}
                onChange={handleInputChange}
                className="input-style uppercase font-mono"
                placeholder="e.g. HDFC0000123"
              />
            </div>
 
            <div className="sm:col-span-2 space-y-1">
              <label className="label-style">UPI ID (Optional)</label>
              <input
                type="text"
                name="upiId"
                value={bankDetails.upiId}
                onChange={handleInputChange}
                className="input-style font-mono"
                placeholder="e.g. sameersharma@okhdfc"
              />
            </div>
          </div>
 
          {/* Submit Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-[#08B36A] hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/10 transition flex items-center gap-2 active:scale-95 text-xs uppercase tracking-wider"
            >
              {saving ? <><FaSpinner className="animate-spin" /> Saving Account...</> : <><FaSave /> Save Account Info</>}
            </button>
          </div>
        </form>
 
      </div>
 
      <style jsx>{`
        .label-style { display: block; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; font-size: 0.65rem; color: #9ca3af; margin-bottom: 0.25rem; margin-left: 0.5rem; }
        .input-style { width: 100%; padding: 16px 20px; background-color: #f8fafc; border-radius: 1.5rem; border: 1px solid #f1f5f9; font-weight: 800; color: #1e293b; font-size: 0.95rem; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .input-style:focus { background-color: white; border-color: #08B36A; box-shadow: 0 15px 30px -10px rgba(8, 179, 106, 0.15); transform: translateY(-2px); }
        .input-style:disabled { cursor: not-allowed; opacity: 0.7; }
      `}</style>
    </div>
  )
}
 