'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaTruck, FaSearch, FaTimes, FaPlus, FaTint, 
    FaTachometerAlt, FaHashtag, FaIdCard, FaSpinner, 
    FaEye, FaCheckCircle, FaWrench, FaTags
} from 'react-icons/fa'

import FireStationAPI from '@/app/services/FireStationAPI'

export default function FleetManagementPage() {
    // --- STATES ---
    const [fleetList, setFleetList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    
    // Form States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        vehicleName: '',
        vehicleType: '',
        assetId: '',
        licensePlate: '',
        pumpCapacity: '',
        waterTank: '',
        status: 'Available' // Default status
    });

    // --- FETCH DATA ---
    const fetchFleetList = async () => {
        setIsLoading(true);
        try {
            const res = await FireStationAPI.GetFleetList();
            if (res.success) {
                setFleetList(res.data);
            }
        } catch (error) {
            console.error("Error fetching fleet list:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFleetList();
    }, []);

    // --- FORM HANDLERS ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        try {
            const res = await FireStationAPI.AddVehicle(formData);
            if (res.success) {
                fetchFleetList(); // Refresh list
                setIsAddModalOpen(false); // Close modal
                // Reset form
                setFormData({ vehicleName: '', vehicleType: '', assetId: '', licensePlate: '', pumpCapacity: '', waterTank: '', status: 'Available' });
            } else {
                setFormError(res.message || "Failed to add vehicle");
            }
        } catch (error) {
            console.error("Error adding vehicle:", error);
            setFormError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER HELPERS ---
    const openDetailModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet & Equipment</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage fire trucks, tankers, and rescue vehicles</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#08B36A] hover:bg-[#069356] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                    <FaPlus size={14} /> Add New Vehicle
                </button>
            </div>

            {/* --- DATA TABLE SECTION --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FaTruck className="text-[#08B36A]"/> Registered Assets
                    </h2>
                    <div className="relative w-64">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                        <input 
                            type="text" 
                            placeholder="Search Asset ID or Name..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Loading Fleet Data...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                                    <th className="px-8 py-4">Asset ID</th>
                                    <th className="px-6 py-4">Vehicle Details</th>
                                    <th className="px-6 py-4">Capabilities</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {fleetList.map((vehicle) => (
                                    <tr 
                                        key={vehicle._id} 
                                        onClick={() => openDetailModal(vehicle)}
                                        className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                                    >
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{vehicle.assetId}</span>
                                        </td>
                                        
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{vehicle.vehicleName}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider">{vehicle.vehicleType}</span>
                                                    <span className="text-[10px] text-slate-300">•</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{vehicle.licensePlate}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold" title="Water Tank Capacity">
                                                    <FaTint size={10}/> {vehicle.waterTank}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-[10px] font-bold" title="Pump Capacity">
                                                    <FaTachometerAlt size={10}/> {vehicle.pumpCapacity}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-max ${
                                                vehicle.status === 'Available' ? 'bg-green-50 text-green-600' : 
                                                vehicle.status === 'Maintenance' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'
                                            }`}>
                                                {vehicle.status === 'Available' && <FaCheckCircle size={10}/>} 
                                                {vehicle.status === 'Maintenance' && <FaWrench size={10}/>} 
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-5 text-center">
                                            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl group-hover:text-[#08B36A] group-hover:border-[#08B36A]/30 transition-all shadow-sm">
                                                <FaEye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {fleetList.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-500 font-medium">No vehicles found in the fleet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* 1. ADD NEW VEHICLE MODAL */}
            {/* ========================================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-[#08B36A] rounded-2xl shadow-inner">
                                    <FaTruck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Register Asset</h3>
                                    <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest mt-1">Add new vehicle to fleet</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FaTimes size={18} /></button>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleAddVehicle} className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            
                            {formError && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
                                    <FaTimes className="shrink-0"/> {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Vehicle Name */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Name</label>
                                    <div className="relative">
                                        <FaTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="vehicleName" value={formData.vehicleName} onChange={handleInputChange} placeholder="e.g. Fire Tanker Alpha" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Vehicle Type */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vehicle Type</label>
                                    <div className="relative">
                                        <FaTags className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <select required name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all appearance-none cursor-pointer">
                                            <option value="">Select Type</option>
                                            <option value="Fire Truck">Fire Truck</option>
                                            <option value="Water Tanker">Water Tanker</option>
                                            <option value="Rescue Van">Rescue Van</option>
                                            <option value="Ladder Truck">Ladder Truck</option>
                                            <option value="Ambulance">Ambulance</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Asset ID */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asset ID</label>
                                    <div className="relative">
                                        <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="assetId" value={formData.assetId} onChange={handleInputChange} placeholder="e.g. FT-001" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* License Plate */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">License Plate Number</label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} placeholder="e.g. HR26AB1234" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all uppercase" />
                                    </div>
                                </div>

                                {/* Water Tank Capacity */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Water Tank Capacity</label>
                                    <div className="relative">
                                        <FaTint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="waterTank" value={formData.waterTank} onChange={handleInputChange} placeholder="e.g. 5000 Liters" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Pump Capacity */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pump Capacity</label>
                                    <div className="relative">
                                        <FaTachometerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="pumpCapacity" value={formData.pumpCapacity} onChange={handleInputChange} placeholder="e.g. 2000 LPM" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Status</label>
                                    <div className="flex gap-4">
                                        {['Available', 'Maintenance', 'Out of Service'].map(status => (
                                            <label key={status} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border cursor-pointer transition-all ${
                                                formData.status === status 
                                                ? 'border-[#08B36A] bg-green-50 text-[#08B36A]' 
                                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                            }`}>
                                                <input type="radio" name="status" value={status} checked={formData.status === status} onChange={handleInputChange} className="hidden" />
                                                <span className="text-xs font-black uppercase tracking-wider">{status}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3.5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-[#08B36A] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Confirm & Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ========================================================= */}
            {/* 2. VIEW VEHICLE DETAIL MODAL (Read Only) */}
            {/* ========================================================= */}
            {isDetailModalOpen && selectedVehicle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsDetailModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Header Truck Info */}
                        <div className="p-8 bg-slate-50 flex flex-col items-center text-center relative border-b border-slate-100">
                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm"><FaTimes size={16} /></button>
                            
                            <div className="w-20 h-20 bg-white border-4 border-green-100 rounded-2xl flex items-center justify-center text-[#08B36A] shadow-md mb-4">
                                <FaTruck size={36} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">{selectedVehicle.vehicleName}</h3>
                            <p className="text-[#08B36A] font-bold text-sm mb-2">{selectedVehicle.vehicleType}</p>
                            
                            <div className="flex gap-2">
                                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-slate-300">
                                    ID: {selectedVehicle.assetId}
                                </span>
                                <span className="bg-[#08B36A] text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">
                                    {selectedVehicle.licensePlate}
                                </span>
                            </div>
                        </div>

                        {/* Performance Details List */}
                        <div className="p-8 space-y-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-2">Technical Specifications</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {/* Water Tank Card */}
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center group hover:bg-blue-50 transition-colors">
                                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm mb-2 group-hover:scale-110 transition-transform"><FaTint size={14}/></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Water Tank</p>
                                    <p className="text-sm font-black text-blue-700">{selectedVehicle.waterTank}</p>
                                </div>
                                
                                {/* Pump Capacity Card */}
                                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center text-center group hover:bg-orange-50 transition-colors">
                                    <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm mb-2 group-hover:scale-110 transition-transform"><FaTachometerAlt size={14}/></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pump Rating</p>
                                    <p className="text-sm font-black text-orange-700">{selectedVehicle.pumpCapacity}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                        selectedVehicle.status === 'Available' ? 'bg-green-100 text-green-700' : 
                                        selectedVehicle.status === 'Maintenance' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {selectedVehicle.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}