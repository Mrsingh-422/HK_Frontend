'use client'

import React, { useState, useEffect } from 'react';
import { 
  FaUniversity, FaUser, FaIdCard, FaMoneyCheck, FaCheckCircle, 
  FaExclamationTriangle, FaShieldAlt, FaSpinner, FaChevronDown, FaSave 
} from "react-icons/fa";
import HospitalAPI from '@/app/services/HospitalAPI';

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

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setFetching(true);
    try {
      const response = await HospitalAPI.getHospitalProfile();
      if (response.success && response.data?.hospital?.bankDetails) {
        const bd = response.data.hospital.bankDetails;
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
      console.error("Error fetching bank settlement details", error);
      setMessage({ type: 'error', text: 'Failed to load current bank settlement details.' });
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
    setMessage({ type: '', text: '' });

    const bankPayload = {
      accountType: bankDetails.accountType,
      bankName: bankDetails.bankName,
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: bankDetails.accountNumber,
      ifscCode: bankDetails.ifscCode,
      upiId: bankDetails.upiId
    };

    try {
      const res = await HospitalAPI.updateBankDetails(bankPayload);
      if (res.success) {
        // Output the specific response message detailing unverified reset
        setMessage({
          type: 'success',
          text: res.message || "Bank details successfully saved. Payouts are locked until verification."
        });
        await fetchBankDetails(); // Reload state
      } else {
        setMessage({
          type: 'error',
          text: res.message || "Failed to update settlement account details."
        });
      }
    } catch (error) {
      console.error("Error updating bank details", error);
      setMessage({
        type: 'error',
        text: "An unexpected error occurred while updating bank details."
      });
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A]"></div>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-6 pb-12 px-4 md:px-0">
      
      {/* Page Title */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-black text-gray-800">Settlement & Bank Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your primary bank account destination for hospital wallet payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Status card */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Card representation */}
          <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="flex justify-between items-start z-10">
              <FaUniversity size={28} className="text-[#08B36A]" />
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider border ${
                bankDetails.isVerified 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              }`}>
                {bankDetails.isVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>

            <div className="z-10 my-4">
              <p className="text-[10px] uppercase font-semibold text-blue-200 tracking-widest">Account Number</p>
              <p className="text-xl font-bold tracking-wider font-mono mt-1">
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

          {/* Fraud prevention Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-yellow-800 text-xs flex gap-3 leading-relaxed">
            <FaShieldAlt className="text-yellow-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-extrabold uppercase tracking-wide text-[10px] mb-1">Fraud Prevention Lock</p>
              Modifying bank settlement parameters resets verification status to <strong className="font-bold">Unverified</strong> automatically. Wallet withdrawals are locked until Admin reviews and approves the new settlement details.
            </div>
          </div>
        </div>

        {/* Right Column: Update Settlement Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 md:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
            <FaMoneyCheck className="text-[#08B36A]" /> Update Bank Settlement
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Holder Name</label>
              <input 
                type="text" 
                name="accountHolderName" 
                required 
                value={bankDetails.accountHolderName} 
                onChange={handleInputChange} 
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 placeholder:text-gray-300"
                placeholder="Name as printed on bank passbook"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bank Name</label>
              <input 
                type="text" 
                name="bankName" 
                required 
                value={bankDetails.bankName} 
                onChange={handleInputChange} 
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 placeholder:text-gray-300"
                placeholder="e.g. HDFC Bank"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Type</label>
              <div className="relative">
                <select 
                  name="accountType" 
                  value={bankDetails.accountType} 
                  onChange={handleInputChange} 
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] bg-white transition-all font-semibold text-gray-800 appearance-none"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Number</label>
              <input 
                type="text" 
                name="accountNumber" 
                required 
                value={bankDetails.accountNumber} 
                onChange={handleInputChange} 
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 font-mono"
                placeholder="Enter bank account number"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">IFSC Code</label>
              <input 
                type="text" 
                name="ifscCode" 
                required 
                value={bankDetails.ifscCode} 
                onChange={handleInputChange} 
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 uppercase font-mono"
                placeholder="IFSC Code (e.g. HDFC0000123)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">UPI ID (Optional)</label>
              <input 
                type="text" 
                name="upiId" 
                value={bankDetails.upiId} 
                onChange={handleInputChange} 
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 font-mono"
                placeholder="e.g. cityhospital@okaxis"
              />
            </div>
          </div>

          {/* Form Message Alerts */}
          {message.text && (
            <div className={`p-4 rounded-2xl text-xs border flex items-start gap-2.5 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <FaCheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
              ) : (
                <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={saving} 
              className="px-8 py-3.5 bg-[#08B36A] hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 transition flex items-center gap-2 active:scale-95 text-xs uppercase tracking-wider"
            >
              {saving ? <><FaSpinner className="animate-spin" /> Saving Account...</> : <><FaSave /> Save Account Info</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}