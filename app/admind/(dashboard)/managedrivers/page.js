'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
    FaEye, FaHistory, FaFilter, FaSearch, 
    FaUserShield, FaPowerOff, FaUsers, FaCheckCircle 
} from "react-icons/fa"
import { HiOutlineUserGroup, HiOutlineStatusOnline } from "react-icons/hi"
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import DriverDetailsModal from './components/otherComponents/DriverDetailsModal';
import DriverHistoryModal from './components/otherComponents/DriverHistoryModal';

// --- API Service Import ---
import AdminAPI from '@/app/services/AdminAPI';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DriverVendorPage = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    const driverTypes = ["All", "Lab", "Pharmacy", "Nurse", "Ambulance"];

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.adminGetAllDrivers();
            setDrivers(res.data || []);
        } catch (err) {
            console.error("Error fetching drivers:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            setDrivers(prev => prev.map(d => d.id === id ? { ...d, onlineStatus: !d.onlineStatus } : d));
            await AdminAPI.adminToggleDriverStatus(id);
        } catch (err) {
            alert("Failed to update status");
            fetchDrivers();
        }
    };

    const handleOpenView = async (id) => {
        try {
            const res = await AdminAPI.adminGetDriverDetails(id);
            setSelectedDriver(res.data);
            setViewModalOpen(true);
        } catch (err) {
            alert("Could not fetch driver details");
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return "https://ui-avatars.com/api/?name=Driver&background=08B36A&color=fff";
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '/');
        return `${BACKEND_URL}${cleanPath}`;
    };

    // Advanced Filtering Logic
    const filteredDrivers = useMemo(() => {
        return drivers.filter(d => {
            const matchesType = selectedType === "All" || d.driverType === selectedType;
            const matchesSearch = d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 d.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [selectedType, searchTerm, drivers]);


    return (
        <div className="w-full space-y-8 p-1 md:p-4">
            {/* --- SEARCH & FILTER BAR --- */}
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative w-full xl:max-w-md group">
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name, vendor, or phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-2 xl:pb-0">
                    <div className="p-3 bg-slate-100 text-slate-400 rounded-xl mr-2 shrink-0">
                        <FaFilter size={12} />
                    </div>
                    {driverTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                selectedType === type 
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel ID</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Duty Identity</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Name & Classification</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vendor / Agency</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Availability</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A]" size={40} />
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Parsing Database Assets</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDrivers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <HiOutlineUserGroup size={60} className="text-slate-200 mb-4" />
                                            <p className="text-sm font-black uppercase text-slate-400 tracking-widest italic">No matching personnel discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDrivers.map((driver, index) => (
                                <tr key={driver.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <span className="text-[11px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded">
                                            #{driver.id.slice(-6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="relative w-14 h-14 mx-auto">
                                            <img 
                                                src={getFullImageUrl(driver.imageUrl)} 
                                                className={`w-full h-full rounded-[1.5rem] object-cover border-4 border-white shadow-lg transition-transform group-hover:scale-110 ${!driver.onlineStatus && 'grayscale opacity-60'}`} 
                                                alt="" 
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[4px] border-white shadow-md ${driver.onlineStatus ? 'bg-[#08B36A] animate-pulse' : 'bg-slate-300'}`}></div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none">{driver.driverName}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-black uppercase bg-[#08B36A]/10 text-[#08B36A] px-2 py-0.5 rounded border border-[#08B36A]/20">
                                                {driver.driverType}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold">@{driver.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700">{driver.vendorName}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1 italic tracking-tight">{driver.phone}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button 
                                            onClick={() => toggleStatus(driver.id)} 
                                            className={`w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner ${driver.onlineStatus ? 'bg-[#08B36A]' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-500 ${driver.onlineStatus ? 'left-8' : 'left-1'}`}></div>
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenView(driver.id)}
                                                className="p-3.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all hover:shadow-md active:scale-90"
                                                title="Personnel Dossier"
                                            >
                                                <FaEye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenHistory(driver)}
                                                className="p-3.5 bg-slate-50 text-slate-400 hover:text-[#08B36A] hover:bg-green-50 rounded-2xl transition-all hover:shadow-md active:scale-90"
                                                title="Service Logs"
                                            >
                                                <FaHistory size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS --- */}
            <DriverDetailsModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} driver={selectedDriver} />
            <DriverHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} driver={selectedDriver} />
        </div>
    )
}


export default DriverVendorPage;