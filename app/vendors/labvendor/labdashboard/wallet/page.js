'use client'
import React, { useState } from 'react'
import { 
  FaWallet, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaChartPie, 
  FaChartBar, 
  FaRupeeSign, 
  FaUniversity, 
  FaPlus, 
  FaTrashAlt,
  FaArrowDown,
  FaArrowUp,
  FaPaperPlane,
  FaTimes
} from 'react-icons/fa'

export default function WalletAndEarningsPage() {
  
  // ==========================================
  // STATES
  // ==========================================
  const [activeTab, setActiveTab] = useState('Credit');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  // Modal State for Adding New Bank
  const[isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);

  // Dummy Data for Earnings
  const earningsData =[
    { title: 'Total Earning', amount: '4,59,013.5', icon: FaMoneyBillWave, color: 'from-[#08B36A] to-green-700' },
    { title: 'Monthly Earning', amount: '352.8', icon: FaChartPie, color: 'from-blue-500 to-blue-700' },
    { title: 'Weekly Earning', amount: '352.8', icon: FaChartBar, color: 'from-purple-500 to-purple-700' },
    { title: 'Daily Earning', amount: '0', icon: FaChartLine, color: 'from-orange-400 to-orange-600' },
  ];

  // Dummy Data for Banks
  const [bankAccounts, setBankAccounts] = useState([]); // Empty initially as per your image

  // Dummy Data for Transactions
  const transactions =[
    { id: 'TRX001', date: '12 Mar 2026', amount: '5000', type: 'Credit', status: 'Success' },
    { id: 'TRX002', date: '10 Mar 2026', amount: '1200', type: 'Debit', status: 'Success' },
    { id: 'TRX003', date: '08 Mar 2026', amount: '300', type: 'Send', status: 'Pending' },
  ];

  const filteredTransactions = transactions.filter(trx => trx.type === activeTab);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleWithdraw = (e) => {
    e.preventDefault();
    if(!withdrawAmount || !selectedBank) {
      alert("Please enter amount and select a bank account.");
      return;
    }
    alert(`Withdrawal request of ₹${withdrawAmount} submitted to selected bank!`);
    setWithdrawAmount('');
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    // Dummy logic to add bank
    const newBank = {
      id: Date.now(),
      holder: 'Yash User',
      accNo: 'XXXXXXXX1234',
      bankName: 'HDFC Bank'
    };
    setBankAccounts([...bankAccounts, newBank]);
    setIsAddBankModalOpen(false);
    alert("Bank Account Added Successfully!");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* ========================================= */}
      {/* 1. MY EARNINGS SECTION                    */}
      {/* ========================================= */}
      <section>
        <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
          <FaMoneyBillWave className="text-[#08B36A]"/> My Earnings
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {earningsData.map((item, index) => (
            <div key={index} className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-white shadow-lg hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group`}>
              {/* Decorative Background Icon */}
              <item.icon className="absolute -right-4 -bottom-4 text-white opacity-10 text-8xl group-hover:scale-110 transition-transform duration-500" />
              
              <p className="text-white/80 font-semibold text-sm mb-1 uppercase tracking-wider">{item.title}</p>
              <h3 className="text-3xl font-black flex items-center gap-1">
                <FaRupeeSign className="text-xl" /> {item.amount}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================= */}
      {/* 2. MY WALLET SECTION                      */}
      {/* ========================================= */}
      <section>
        <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
          <FaWallet className="text-[#08B36A]"/> My Wallet
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Wallet Balance Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
            
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#08B36A] to-green-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-green-200">
                <FaWallet size={28} />
              </div>
              <div>
                <p className="text-gray-500 font-bold uppercase tracking-wide text-sm mb-1">Available Balance</p>
                <h3 className="text-4xl font-black text-[#1e3a8a] flex items-center gap-1">
                  <FaRupeeSign className="text-2xl text-[#08B36A]"/> 4,59,010
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Your wallet balance can be withdrawn to your linked bank accounts. Ensure your KYC is complete for uninterrupted transactions. Standard processing time is 2-4 business days.
            </p>
          </div>

          {/* Right: Withdrawal Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">Withdraw Funds</h3>
            
            <form onSubmit={handleWithdraw} className="space-y-6">
              
              {/* Amount Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <FaMoneyBillWave className="text-red-500"/> Enter amount to withdraw
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none bg-gray-50 border-r border-gray-200 rounded-l-xl px-4">
                    <FaRupeeSign className="text-gray-500" />
                  </div>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter Withdrawal Amount" 
                    className="w-full pl-16 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-800 font-bold transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Bank Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <FaUniversity className="text-red-500"/> Select or Add Bank Account
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-700 font-medium transition-all shadow-sm"
                    required
                  >
                    <option value="">Select Your Bank</option>
                    {bankAccounts.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.bankName} ({bank.accNo})</option>
                    ))}
                  </select>
                  
                  <button 
                    type="button"
                    onClick={() => setIsAddBankModalOpen(true)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <FaPlus size={12}/> Add New
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="px-8 py-3.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
                >
                  Withdraw Now
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

      {/* ========================================= */}
      {/* 3. BANK DETAILS TABLE                     */}
      {/* ========================================= */}
      <section>
        <h2 className="text-xl font-bold text-[#1e3a8a] mb-4">Bank Details</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sr No.</th>
                  <th className="px-6 py-4">Account Holder</th>
                  <th className="px-6 py-4">Account Number</th>
                  <th className="px-6 py-4">Bank Name</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((bank, index) => (
                    <tr key={bank.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{bank.holder}</td>
                      <td className="px-6 py-4 font-bold tracking-wider text-[#08B36A]">{bank.accNo}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{bank.bankName}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Remove Bank">
                          <FaTrashAlt size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                      <FaUniversity className="text-4xl mx-auto mb-3 text-gray-300" />
                      <p className="font-bold text-lg">No Bank details found!</p>
                      <p className="text-sm mt-1">Please add a bank account to withdraw funds.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 4. TRANSACTION DETAILS (TABS & TABLE)     */}
      {/* ========================================= */}
      <section>
        <h2 className="text-xl font-bold text-[#1e3a8a] mb-4">Transaction Details</h2>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-4 inline-flex flex-wrap gap-2 w-full sm:w-auto">
          {['Credit', 'Debit', 'Send'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === tab 
                  ? 'bg-[#08B36A] text-white shadow-md shadow-green-200' 
                  : 'bg-transparent text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'Credit' && <FaArrowDown />}
              {tab === 'Debit' && <FaArrowUp />}
              {tab === 'Send' && <FaPaperPlane />}
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-700">{trx.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{trx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          trx.type === 'Credit' ? 'bg-green-100 text-green-700' :
                          trx.type === 'Debit' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-800">₹ {trx.amount}</td>
                      <td className="px-6 py-4 font-bold text-[#08B36A]">{trx.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <p className="font-bold">No {activeTab} transactions found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 🌟 ADD BANK ACCOUNT MODAL 🌟              */}
      {/* ========================================= */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddBankModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1e3a8a] flex items-center gap-2">
                <FaUniversity className="text-[#08B36A]" /> Add Bank Account
              </h3>
              <button onClick={() => setIsAddBankModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <FaTimes size={20}/>
              </button>
            </div>

            <form onSubmit={handleAddBank} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Holder Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Number</label>
                <input type="text" placeholder="XXXXXXXXX1234" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bank Name</label>
                  <input type="text" placeholder="HDFC Bank" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">IFSC Code</label>
                  <input type="text" placeholder="HDFC0001234" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] uppercase transition-all" required />
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all">
                Save Bank Details
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}