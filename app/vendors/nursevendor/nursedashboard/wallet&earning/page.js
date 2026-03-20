'use client'
import React, { useState } from 'react'
import { 
    FaWallet, FaMoneyBillWave, FaUniversity, FaHistory, 
    FaPlus, FaArrowCircleDown, FaCheckCircle, FaTrashAlt,
    FaRegClock, FaChartLine, FaUserEdit, FaHashtag, FaKey, FaTimesCircle
} from 'react-icons/fa'

export default function WalletDashboard() {
    const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);

    // --- MOCK DATA ---
    const earnings = [
        { label: 'Total Earning', value: '189', icon: <FaChartLine />, color: 'bg-green-600' },
        { label: 'Monthly Earning', value: '0', icon: <FaMoneyBillWave />, color: 'bg-[#08B36A]' },
        { label: 'Weekly Earning', value: '0', icon: <FaMoneyBillWave />, color: 'bg-[#32B97D]' },
        { label: 'Daily Earning', value: '0', icon: <FaMoneyBillWave />, color: 'bg-[#40c78d]' },
    ];

    return (
        <div className=" bg-[#F9FAFB] min-h-screen font-sans text-[#1e5a91]">
            
            {/* --- SECTION 1: MY EARNINGS GRID --- */}
            <div className="mb-10">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <FaMoneyBillWave className="text-[#08B36A]" /> My Earnings
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {earnings.map((item, idx) => (
                        <div key={idx} className={`${item.color} p-6 rounded-[2rem] shadow-lg shadow-green-100 text-white relative overflow-hidden group`}>
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{item.label}</p>
                                <h3 className="text-3xl font-black">₹{item.value}</h3>
                            </div>
                            <div className="absolute right-[-10px] bottom-[-10px] text-white/10 text-7xl transition-transform group-hover:scale-110 duration-500">
                                {item.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- SECTION 2: MY WALLET & WITHDRAW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Wallet Balance Card */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight">My Wallet</h2>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Available Funds</p>
                        </div>
                        <div className="w-14 h-14 bg-green-50 text-[#08B36A] rounded-2xl flex items-center justify-center shadow-inner">
                            <FaWallet size={28} />
                        </div>
                    </div>
                    
                    <div>
                        <div className="text-5xl font-black text-gray-800 flex items-center gap-1">
                            <span className="text-2xl text-[#08B36A]">₹</span>180
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed mt-4">
                            Your earnings are securely held. You can withdraw funds to your verified bank account at any time.
                        </p>
                    </div>
                </div>

                {/* Withdraw Form Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <FaArrowCircleDown className="text-[#08B36A]"/> Withdraw Money
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Withdraw Amount 💸</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 pl-4 text-sm">₹ </span>
                                <input type="number" placeholder="  Enter Amount" className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-sm" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Select Bank Account 🏦</label>
                            <div className="flex gap-2">
                                <select className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-sm text-gray-500">
                                    <option>Select Your Bank</option>
                                </select>
                                <button 
                                    onClick={() => setIsAddBankModalOpen(true)}
                                    className="bg-gray-800 hover:bg-black text-white px-6 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-95"
                                >
                                    Add New
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 w-full md:w-auto px-12 py-4 bg-[#08B36A] hover:bg-[#069a5a] text-white font-black rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 uppercase tracking-widest text-xs">
                        Process Withdrawal
                    </button>
                </div>
            </div>

            {/* --- SECTION 3: TABLES --- */}
            <div className="space-y-10">
                
                {/* Bank Details Table */}
                <div>
                    <h2 className="text-lg font-black mb-4 flex items-center gap-2 px-2">
                        <FaUniversity className="text-[#08B36A]" /> Bank Details
                    </h2>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Sr No.</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Account Holder</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Account Number</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Bank Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <FaUniversity size={40} />
                                                <p className="text-sm font-bold uppercase tracking-widest">No Bank details found!</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Transaction Details Table */}
                <div>
                    <h2 className="text-lg font-black mb-4 flex items-center gap-2 px-2">
                        <FaHistory className="text-[#08B36A]" /> Transaction History
                    </h2>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Sr No.</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <FaRegClock size={40} />
                                                <p className="text-sm font-bold uppercase tracking-widest">No Withdrawal requests found!</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ADD BANK DETAILS MODAL --- */}
            {isAddBankModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e5a91]/20 backdrop-blur-sm animate-in fade-in duration-300 text-[#1e5a91]">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-black uppercase tracking-tight">Add Bank Details</h2>
                            <button onClick={() => setIsAddBankModalOpen(false)} className="text-gray-300 hover:text-red-500 transition-all">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-5">
                            
                            {/* Account Holder Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaUserEdit className="text-gray-400" /> Account Holder Name
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Enter full name" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#1e5a91]/10 focus:border-[#1e5a91] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                                />
                            </div>

                            {/* Bank Account Number */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaHashtag className="text-gray-400" /> Bank Account Number
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Enter account number" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#1e5a91]/10 focus:border-[#1e5a91] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                                />
                            </div>

                            {/* Bank Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaUniversity className="text-gray-400" /> Bank Name
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. HDFC Bank" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#1e5a91]/10 focus:border-[#1e5a91] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                                />
                            </div>

                            {/* Bank IFSC Code */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FaKey className="text-gray-400" /> Bank IFSC Code
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Enter IFSC code" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#1e5a91]/10 focus:border-[#1e5a91] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 uppercase" 
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button className="w-full bg-[#1e5a91] hover:bg-[#164a77] text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] uppercase tracking-widest text-xs">
                                    Add Bank Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}