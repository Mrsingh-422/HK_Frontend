'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaTimes, FaArrowLeft, FaWallet } from 'react-icons/fa'

export default function WithdrawLimit() {
    const router = useRouter(); 

    // ==========================================
    // 🌟 STATES
    // ==========================================
    const[isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newLimit, setNewLimit] = useState('');

    // Mock Data based on your screenshot
    const [withdrawData, setWithdrawData] = useState([
        { 
            id: 1, 
            limitDays: 7, 
            status: 'Active' 
        }
    ]);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    const openEditModal = (item) => {
        setEditingItem(item);
        setNewLimit(item.limitDays);
        setIsEditModalOpen(true);
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
        setNewLimit('');
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        
        // Update the data in the state
        const updatedData = withdrawData.map(item => 
            item.id === editingItem.id ? { ...item, limitDays: newLimit } : item
        );
        
        setWithdrawData(updatedData);
        closeModal();
    };

    // ==========================================
    // 🌟 UI RENDER
    // ==========================================
    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
            
            {/* Header Section */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-3 md:p-4 rounded-xl border border-[#2EBE7E]/20">
                        <FaWallet className="text-[#2EBE7E] text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Withdraw Limit</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Manage withdrawal time limits for vendors/users</p>
                    </div>
                </div>
                
                <div>
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[13px] font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5"
                    >
                        GO BACK
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-[13px] text-gray-500 font-bold uppercase tracking-wider">
                                <th className="p-5 pl-8 w-24">Sr No.</th>
                                <th className="p-5">Withdraw Limit (Days)</th>
                                <th className="p-5 w-48">Status</th>
                                <th className="p-5 w-32 text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-700">
                            {withdrawData.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group">
                                    <td className="p-5 pl-8 font-semibold text-gray-500">{index + 1}</td>
                                    
                                    <td className="p-5 font-bold text-gray-800">
                                        <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-[13px] border border-gray-200">
                                            {item.limitDays} Days
                                        </span>
                                    </td>
                                    
                                    {/* Enhanced Status Badge */}
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${
                                            item.status === 'Active' 
                                            ? 'bg-[#e6f7eb] text-[#2EBE7E] border border-[#2EBE7E]/20' 
                                            : 'bg-red-50 text-red-500 border border-red-100'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#2EBE7E]' : 'bg-red-500'}`}></span>
                                            {item.status}
                                        </span>
                                    </td>
                                    
                                    <td className="p-5 pr-8 text-center">
                                        <button 
                                            onClick={() => openEditModal(item)} 
                                            className="px-6 py-2 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[12px] font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5 tracking-wider uppercase"
                                        >
                                            EDIT
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================= */}
            {/* 🌟 ENHANCED EDIT MODAL                    */}
            {/* ========================================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Blurred Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                        onClick={closeModal}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 scale-100">
                        
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-[16px] font-bold text-gray-800">Update Withdraw Limit</h2>
                            <button 
                                onClick={closeModal} 
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-lg transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Body (Matching Screenshot 2 exactly but modernized) */}
                        <div className="p-6 md:p-8">
                            <form onSubmit={handleUpdate}>
                                <div className="border border-gray-100 bg-[#fafafa] p-8 rounded-xl shadow-inner flex flex-col items-center justify-center gap-8">
                                    
                                    {/* Input Line */}
                                    <div className="flex items-center gap-3 text-[15px] font-semibold text-gray-600">
                                        <span>Withdraw Limit :</span>
                                        <input 
                                            type="number" 
                                            value={newLimit}
                                            onChange={(e) => setNewLimit(e.target.value)}
                                            required
                                            min="1"
                                            className="w-16 px-1 py-1 text-center text-[18px] font-bold text-[#2EBE7E] border-b-2 border-gray-300 focus:border-[#2EBE7E] bg-transparent outline-none transition-colors"
                                        />
                                        <span>Days</span>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        className="w-full sm:w-auto px-10 py-3 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[13px] font-bold rounded-lg shadow-md shadow-[#2EBE7E]/20 transition-all hover:-translate-y-0.5 tracking-wide uppercase"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}