'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaTools, FaSearch, FaTimes, FaPlus, FaBoxOpen, 
    FaBarcode, FaExclamationTriangle, FaCheckCircle, 
    FaWrench, FaSpinner, FaEdit, FaClipboardList, FaLayerGroup
} from 'react-icons/fa'

import FireStationAPI from '@/app/services/FireStationAPI'

export default function EquipmentInventoryPage() {
    // --- STATES ---
    const [equipmentList, setEquipmentList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    
    // Form & Selected Data
    const [selectedEq, setSelectedEq] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    
    // Add Form State
    const [formData, setFormData] = useState({
        equipmentName: '',
        category: '',
        serialNumber: '',
        totalQty: '',
        inService: '',
        status: 'Available'
    });

    // Update Form State
    const [updateData, setUpdateData] = useState({
        status: '',
        inService: ''
    });

    // --- FETCH DATA ---
    const fetchEquipmentList = async () => {
        setIsLoading(true);
        try {
            const res = await FireStationAPI.GetEquipmentList();
            if (res.success) {
                setEquipmentList(res.data);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            // Fallback for testing UI if API is not ready
            // setEquipmentList([{ _id: '1', equipmentName: 'Oxygen Cylinder', category: 'Medical', serialNumber: 'OXY-901', totalQty: 50, inService: 45, status: 'Available' }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipmentList();
    }, []);

    // --- ADD HANDLER ---
    const handleAddInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        // Basic validation: inService cannot be more than totalQty
        if (Number(formData.inService) > Number(formData.totalQty)) {
            setFormError("In-Service quantity cannot exceed Total quantity.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await FireStationAPI.AddEquipment(formData);
            if (res.success) {
                fetchEquipmentList();
                setIsAddModalOpen(false);
                setFormData({ equipmentName: '', category: '', serialNumber: '', totalQty: '', inService: '', status: 'Available' });
            } else {
                setFormError(res.message || "Failed to add equipment");
            }
        } catch (error) {
            setFormError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UPDATE HANDLER ---
    const openUpdateModal = (item) => {
        setSelectedEq(item);
        setUpdateData({
            status: item.status,
            inService: item.inService
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateEquipment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        if (Number(updateData.inService) > Number(selectedEq.totalQty)) {
            setFormError("In-Service quantity cannot exceed Total quantity.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await FireStationAPI.UpdateEquipment(selectedEq._id, updateData);
            if (res.success) {
                fetchEquipmentList();
                setIsUpdateModalOpen(false);
            } else {
                setFormError(res.message || "Failed to update equipment");
            }
        } catch (error) {
            setFormError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HELPER COMPONENT FOR STATUS ---
    const StatusBadge = ({ status }) => {
        const styles = {
            'Available': 'bg-green-50 text-green-600',
            'Low Stock': 'bg-orange-50 text-orange-600',
            'Maintenance': 'bg-red-50 text-red-500'
        };
        const icons = {
            'Available': <FaCheckCircle size={10}/>,
            'Low Stock': <FaExclamationTriangle size={10}/>,
            'Maintenance': <FaWrench size={10}/>
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
                {icons[status]} {status}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Equipment Inventory</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Track gears, medical supplies, and rescue tools</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#08B36A] hover:bg-[#069356] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                    <FaPlus size={14} /> Add Inventory
                </button>
            </div>

            {/* --- DATA TABLE SECTION --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FaClipboardList className="text-[#08B36A]"/> Ops Inventory
                    </h2>
                    <div className="relative w-64">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                        <input 
                            type="text" 
                            placeholder="Search Serial or Name..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Loading Inventory...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                                    <th className="px-8 py-4">Serial / ID</th>
                                    <th className="px-6 py-4">Item Details</th>
                                    <th className="px-6 py-4">Stock Quantity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {equipmentList.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <FaBarcode className="text-slate-300"/>
                                                <span className="text-sm font-black text-slate-700 font-mono tracking-wider">{item.serialNumber}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{item.equipmentName}</span>
                                                <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider mt-0.5">{item.category}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Service</span>
                                                    <span className="text-base font-black text-slate-700 leading-none mt-1">
                                                        {item.inService} <span className="text-xs text-slate-300">/ {item.totalQty}</span>
                                                    </span>
                                                </div>
                                                {/* Visual Bar Indicator */}
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                                                    <div 
                                                        className={`h-full rounded-full ${(item.inService/item.totalQty) < 0.2 ? 'bg-red-500' : 'bg-[#08B36A]'}`} 
                                                        style={{ width: `${(item.inService / item.totalQty) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        
                                        <td className="px-6 py-5 text-center">
                                            <button 
                                                onClick={() => openUpdateModal(item)}
                                                className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto border border-slate-100 group-hover:border-blue-100"
                                            >
                                                <FaEdit size={12} /> Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {equipmentList.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-500 font-medium">Inventory is empty.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* 1. ADD NEW EQUIPMENT MODAL */}
            {/* ========================================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-[#08B36A] rounded-2xl shadow-inner"><FaBoxOpen size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Add Inventory Item</h3>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FaTimes size={18} /></button>
                        </div>

                        <form onSubmit={handleAddEquipment} className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {formError && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2"><FaTimes className="shrink-0"/> {formError}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Equipment Name */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Equipment Name</label>
                                    <input required type="text" name="equipmentName" value={formData.equipmentName} onChange={handleAddInputChange} placeholder="e.g. Oxygen Cylinder" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                    <select required name="category" value={formData.category} onChange={handleAddInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all cursor-pointer">
                                        <option value="">Select Category</option>
                                        <option value="Protective Gear">Protective Gear</option>
                                        <option value="Medical Supplies">Medical Supplies</option>
                                        <option value="Rescue Tools">Rescue Tools</option>
                                        <option value="Hoses & Pipes">Hoses & Pipes</option>
                                        <option value="Communications">Communications</option>
                                    </select>
                                </div>

                                {/* Serial Number */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Serial Number / Batch ID</label>
                                    <div className="relative">
                                        <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="serialNumber" value={formData.serialNumber} onChange={handleAddInputChange} placeholder="e.g. OXY-901" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 font-mono outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all uppercase" />
                                    </div>
                                </div>

                                {/* Total Qty */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Quantity</label>
                                    <input required type="number" min="1" name="totalQty" value={formData.totalQty} onChange={handleAddInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                </div>

                                {/* In Service Qty */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">In-Service Quantity</label>
                                    <input required type="number" min="0" name="inService" value={formData.inService} onChange={handleAddInputChange} placeholder="0" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3.5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-[#08B36A] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2">
                                    {isSubmitting ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Save Inventory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ========================================================= */}
            {/* 2. UPDATE STATUS & QTY MODAL */}
            {/* ========================================================= */}
            {isUpdateModalOpen && selectedEq && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsUpdateModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="p-6 border-b border-slate-50 flex justify-between items-start bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Update Inventory</h3>
                                <p className="text-[#08B36A] font-bold text-xs mt-1">{selectedEq.equipmentName}</p>
                                <p className="text-slate-400 font-mono text-[10px] mt-0.5">ID: {selectedEq.serialNumber}</p>
                            </div>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm"><FaTimes size={14} /></button>
                        </div>

                        <form onSubmit={handleUpdateEquipment} className="p-6 space-y-5">
                            {formError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{formError}</div>}

                            {/* Info Box */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stock (Fixed)</span>
                                <span className="text-lg font-black text-slate-700">{selectedEq.totalQty}</span>
                            </div>

                            {/* Edit In-Service Qty */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Currently In-Service</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0" 
                                    max={selectedEq.totalQty}
                                    value={updateData.inService} 
                                    onChange={(e) => setUpdateData({...updateData, inService: e.target.value})} 
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-center text-lg" 
                                />
                            </div>

                            {/* Edit Status */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Condition Status</label>
                                <select 
                                    value={updateData.status} 
                                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})} 
                                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="Available">Available (Normal)</option>
                                    <option value="Low Stock">Low Stock (Warning)</option>
                                    <option value="Maintenance">Maintenance (Critical)</option>
                                </select>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-xl text-[11px] font-black shadow-lg shadow-blue-100 uppercase tracking-widest active:scale-95 transition-all flex justify-center items-center gap-2 mt-4">
                                {isSubmitting ? <><FaSpinner className="animate-spin" /> Updating...</> : 'Confirm Update'}
                            </button>
                        </form>

                    </div>
                </div>
            )}

        </div>
    )
}