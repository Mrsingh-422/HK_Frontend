'use client'
import React, { useState } from 'react'
import { 
    FaTruck, FaPlus, FaTrashAlt, FaEdit, 
    FaTimesCircle, FaRupeeSign, FaRoute, FaCheckCircle 
} from 'react-icons/fa'

export default function DeliveryChargesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // --- NEW STATES FOR EDITING ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCharge, setEditingCharge] = useState(null);
    
    // --- MOCK DATA ---
    const [charges, setCharges] = useState([
        { id: 1, fixedPrice: 200, distance: 10, perKmPrice: 20, status: 'Active' },
        { id: 2, fixedPrice: 150, distance: 5, perKmPrice: 15, status: 'Active' }
    ]);

    // --- HANDLER TO OPEN EDIT MODAL ---
    const handleEditClick = (charge) => {
        setEditingCharge(charge);
        setIsEditModalOpen(true);
    };

    return (
        <div className=" bg-[#F9FAFB] min-h-screen font-sans">
            
            {/* --- TOP HEADER --- */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-[#1e5a91] flex items-center gap-3">
                        <FaTruck className="text-[#08B36A]" /> Manage Delivery Charges
                    </h1>
                    <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-tight">Set up distance-based shipping costs</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#08B36A] hover:bg-[#069a5a] text-white px-6 py-3 rounded-full text-sm font-black shadow-[0_10px_20px_rgba(8,179,106,0.2)] transition-all active:scale-95"
                >
                    <FaPlus size={12} /> Add Charge
                </button>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Base Pricing</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Distance Rule</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Additional Cost</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {charges.map((charge) => (
                                <tr key={charge.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 text-[#1e5a91] rounded-xl flex items-center justify-center">
                                                <FaRupeeSign size={16} />
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-800 text-sm">₹{charge.fixedPrice}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Fixed Price</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 text-[#08B36A] rounded-xl flex items-center justify-center">
                                                <FaRoute size={16} />
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-800 text-sm">{charge.distance} KM</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Base Distance</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-gray-700 text-sm">
                                            ₹{charge.perKmPrice} <span className="text-[10px] text-gray-400 font-medium">/ per km</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-green-50 text-[#08B36A] border border-green-100 uppercase tracking-widest">
                                            <FaCheckCircle size={10}/> {charge.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* --- EDIT BUTTON TRIGGERS HANDLER --- */}
                                            <button 
                                                onClick={() => handleEditClick(charge)}
                                                className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD CHARGES MODAL --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e5a91]/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-black text-[#1e5a91]">Add New Charges</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-300 hover:text-red-500 transition-all">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                                    <FaRupeeSign className="text-[#08B36A]"/> Base Price (Rupee/RS)
                                </label>
                                <input type="number" placeholder="e.g. 200" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all text-sm font-bold text-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                                    <FaRoute className="text-blue-500"/> Base Distance (KM)
                                </label>
                                <input type="number" placeholder="e.g. 10" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                                    <FaRupeeSign className="text-orange-400"/> Per KM Price / After Distance
                                </label>
                                <input type="number" placeholder="e.g. 20" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-bold text-gray-700" />
                            </div>
                            <div className="pt-4">
                                <button className="w-full bg-[#08B36A] hover:bg-[#069a5a] text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(8,179,106,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                    Add Charge +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT CHARGES MODAL (NEW) --- */}
            {isEditModalOpen && editingCharge && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1e5a91]/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-black text-[#1e5a91]">Edit Delivery Charge</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-300 hover:text-red-500 transition-all">
                                <FaTimesCircle size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            {/* Input 1 */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                                    <FaRupeeSign className="text-[#08B36A]"/> Base Price (Rupee/RS)
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={editingCharge.fixedPrice}
                                    placeholder="e.g. 200" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all text-sm font-bold text-gray-700" 
                                />
                            </div>

                            {/* Input 2 */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                                    <FaRoute className="text-blue-500"/> Base Distance (KM)
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={editingCharge.distance}
                                    placeholder="e.g. 10" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-700" 
                                />
                            </div>

                            {/* Input 3 */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                                    <FaRupeeSign className="text-orange-400"/> Per KM Price / After Distance
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={editingCharge.perKmPrice}
                                    placeholder="e.g. 20" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-bold text-gray-700" 
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button className="flex-2 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all active:scale-[0.98] uppercase tracking-widest text-xs">
                                    Update Charge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}