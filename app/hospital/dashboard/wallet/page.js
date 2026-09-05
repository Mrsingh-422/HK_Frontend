'use client';

import HospitalAPI from '@/app/services/HospitalAPI';
import React, { useState, useEffect } from 'react';

export default function HospitalWalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Withdrawal modal and form states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Tooltip display state
  const [showTooltip, setShowTooltip] = useState(false);

  // Guard against Next.js SSR hydration mismatches
  useEffect(() => {
    setIsMounted(true);
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await HospitalAPI.getWalletStats();
      if (res?.success) {
        setWalletData(res.data || res);
      } else {
        setError(res?.message || "Failed to load wallet data.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "An unexpected error occurred while fetching wallet details.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawAmount('');
    setActionMessage({ type: '', text: '' });
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setActionMessage({ type: '', text: '' });

    const amountNum = Number(withdrawAmount);
    const withdrawable = walletData?.withdrawableBalance ?? 0;

    // Client-side validations
    if (isNaN(amountNum) || amountNum <= 0) {
      setActionMessage({ type: 'error', text: 'Please enter a valid positive withdrawal amount.' });
      return;
    }

    if (!walletData?.bankDetails?.accountNumber) {
      setActionMessage({ type: 'error', text: 'No verified bank settlement account found. Please map an account first.' });
      return;
    }

    if (amountNum > withdrawable) {
      setActionMessage({
        type: 'error',
        text: `The requested amount exceeds your available balance. You can withdraw up to ₹${withdrawable.toLocaleString('en-IN')}.`
      });
      return;
    }

    setSubmitLoading(true);
    try {
      // POST /hospital/wallet/withdraw with { amount: amountNum }
      const requestFn = HospitalAPI.requestWithdrawal || HospitalAPI.requestWithdraw;
      if (typeof requestFn !== 'function') {
        setActionMessage({ type: 'error', text: "Withdrawal API method is missing in HospitalAPI.js." });
        return;
      }

      const response = await requestFn(amountNum);
      if (response?.success) {
        const successText = response.message || "Withdrawal request submitted successfully. Waiting for Admin manual payout approval.";
        setActionMessage({
          type: 'success',
          text: successText
        });
        
        // Refresh wallet data and close modal after slight delay
        setTimeout(async () => {
          await fetchWalletDetails();
          setShowWithdrawModal(false);
        }, 1800);
      } else {
        setActionMessage({
          type: 'error',
          text: response?.message || 'Withdrawal failed. Please try again.'
        });
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'A network error occurred while submitting your withdrawal.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Avoid rendering on-server to prevent hydration issues
  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 text-sm font-medium">Loading wallet info...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex flex-col items-start">
          <p className="font-semibold text-sm">Error Loading Wallet</p>
          <p className="text-xs mt-1 text-red-600">{error}</p>
          <button 
            onClick={fetchWalletDetails} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalBalance = 0,
    withdrawableBalance = 0,
    pendingBalance = 0,
    stats = {},
    bankDetails = {},
    transactions = []
  } = walletData || {};

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hospital Wallet</h1>
          <p className="text-sm text-gray-500">Track clearance, request payouts, and view statements</p>
        </div>
        <div className="flex items-center bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-blue-700 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          7-Day Clearance Active
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Balance Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Balance</span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{totalBalance.toLocaleString('en-IN')}</h2>
          </div>
          <p className="text-xs text-gray-400 mt-4">Cleared + Uncleared locked earnings</p>
        </div>

        {/* Withdrawable Balance Card with Primary Action */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1 w-full bg-blue-500"></div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Withdrawable Balance</span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{withdrawableBalance.toLocaleString('en-IN')}</h2>
          </div>
          <div className="mt-6">
            <button
              onClick={handleOpenWithdrawModal}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium rounded-lg shadow-sm transition-all text-xs flex justify-center items-center"
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Pending Balance Card with Tooltip Trigger */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Balance</span>
              
              {/* Info Tooltip */}
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Pending balance tooltip"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-xs font-semibold text-gray-500 hover:bg-gray-100">
                    i
                  </span>
                </button>
                {showTooltip && (
                  <div className="absolute right-0 bottom-7 z-10 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-md leading-relaxed">
                    This is the 7-day safety lock period to handle potential transaction cancellations/refunds before final clearance.
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{pendingBalance.toLocaleString('en-IN')}</h2>
          </div>
          <p className="text-xs text-gray-400 mt-4">Locked under 7-day clearance period</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bank Details section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-semibold text-gray-800">Bank Settlement Account</h3>
            {bankDetails.isVerified && (
              <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Verified
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Account Holder Name</p>
              <p className="font-semibold text-gray-800 mt-0.5">{bankDetails.accountHolderName || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Bank Name</p>
              <p className="font-semibold text-gray-800 mt-0.5">{bankDetails.bankName || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Account Number</p>
              <p className="font-semibold text-gray-800 mt-0.5 font-mono">
                {bankDetails.accountNumber ? `•••• •••• ${bankDetails.accountNumber.slice(-4)}` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">IFSC Code</p>
              <p className="font-semibold text-gray-800 mt-0.5 font-mono uppercase">{bankDetails.ifscCode || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">Recent Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-500">Earnings Today</span>
              <span className="text-sm font-semibold text-gray-800">₹{(stats.today || stats.todayEarning || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-gray-50">
              <span className="text-xs text-gray-500">Earnings This Week</span>
              <span className="text-sm font-semibold text-gray-800">₹{(stats.weekly || stats.weeklyEarning || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Transactions Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-4">Recent Wallet Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">No recent transaction history recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="text-gray-400 bg-gray-50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Remark / Reference</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {transactions.map((tx, idx) => (
                  <tr key={tx._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        tx.type === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{tx.remark || 'Settlement'}</td>
                    <td className="px-6 py-4">
                      {new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      tx.type === 'Credit' ? 'text-green-600' : 'text-gray-800'
                    }`}>
                      {tx.type === 'Credit' ? '+' : '-'} ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Next.js Friendly Payout Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Request Withdrawal</h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-4 space-y-4">
              
              <div>
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Settlement Destination
                </span>
                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-700">{bankDetails.bankName || 'Mapped Bank'}</p>
                  <p>A/C Holder: {bankDetails.accountHolderName || 'N/A'}</p>
                  <p className="font-mono">A/C Number: •••• {bankDetails.accountNumber?.slice(-4) || 'N/A'}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="amount" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Limit: ₹{withdrawableBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    min="1"
                    step="any"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      if (actionMessage.text) setActionMessage({ type: '', text: '' });
                    }}
                    placeholder="Enter withdrawal amount"
                    className="block w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {actionMessage.text && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  actionMessage.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {actionMessage.text}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-medium shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                  disabled={submitLoading || !withdrawAmount}
                >
                  {submitLoading ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}