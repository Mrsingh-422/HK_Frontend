'use client'

import React, { useState } from 'react'
import { FaEye, FaHistory, FaAmbulance, FaShieldAlt } from "react-icons/fa"
import DriverHistoryModal from './otherComponents/DriverHistoryModal';
import DriverDetailsModal from './otherComponents/DriverDetailsModal';


const ManageAmbulanceDrivers = () => {
    // Ambulance-specific dummy data
    const [drivers, setDrivers] = useState([
        {
            id: 1,
            vendorName: "Lifeline Emergency Corps",
            username: "Amb_911_Kmr",
            driverName: "Bashir Ahmad",
            phone: "9149776655",
            email: "bashir.amb@lifeline.org",
            address: "Bemina, Srinagar, J&K",
            walletId: "WLT_AMB_001",
            amount: 8500,
            vehicle: "Ambulance (Type B)",
            vehicleNumber: "JK01-EMG-108",
            licenseNumber: "LIC-HV-998877",
            licenseImage: "https://randomuser.me/api/portraits/men/50.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/51.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/10.jpg",
            onlineStatus: true,
            driverAssignStatus: false, // Available for Dispatch
            history: [
                { orderId: "DISP-101", patientName: "Omar Abdullah", location: "SMHS Hospital", date: "2026-03-25", status: "Patient Transferred" },
                { orderId: "DISP-105", patientName: "Zahid Khan", location: "SKIMS Soura", date: "2026-03-25", status: "Patient Transferred" }
            ]
        },
        {
            id: 2,
            vendorName: "City Hospital Services",
            username: "Amb_City_04",
            driverName: "Fayaz Lone",
            phone: "7006881122",
            email: "fayaz.lone@cityhospital.com",
            address: "Ganderbal, J&K",
            walletId: "WLT_AMB_002",
            amount: 2100,
            vehicle: "Ambulance (Advanced)",
            vehicleNumber: "JK16-AMB-4433",
            licenseNumber: "LIC-HV-112233",
            licenseImage: "https://randomuser.me/api/portraits/men/60.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/61.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/40.jpg",
            onlineStatus: false,
            driverAssignStatus: false,
            history: [
                { orderId: "DISP-088", patientName: "Aijaz Dar", location: "Bone & Joint Hospital", date: "2026-03-24", status: "Patient Transferred" }
            ]
        }
    ]);

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Click Handlers
    const handleOpenView = (driver) => {
        setSelectedDriver(driver);
        setViewModalOpen(true);
    };

    const handleOpenHistory = (driver) => {
        setSelectedDriver(driver);
        setHistoryModalOpen(true);
    };

    const handleOpenOrder = (order) => {
        setSelectedOrder(order);
        setOrderModalOpen(true);
    };

    const toggleStatus = (id) => {
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, onlineStatus: !d.onlineStatus } : d));
    };

    return (
        <div className="w-full">
            {/* Table Section */}
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm bg-white">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/30">
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Hospital/Agency</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Identity</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Pilot Name</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Duty Status</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {drivers.map((driver, index) => (
                            <tr key={driver.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                <td className="px-8 py-6 text-sm font-bold text-slate-400">
                                    {(index + 1).toString().padStart(2, '0')}
                                </td>
                                <td className="px-8 py-6 text-sm font-black text-slate-800">
                                    {driver.vendorName}
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="relative inline-block">
                                        <img src={driver.imageUrl} className="w-12 h-12 rounded-[1.25rem] mx-auto border-2 border-white shadow-lg grayscale group-hover:grayscale-0 transition-all" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm ${driver.onlineStatus ? 'bg-[#08B36A]' : 'bg-slate-300'}`}></div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-black text-slate-700">{driver.driverName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{driver.username}</p>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <button 
                                        onClick={() => toggleStatus(driver.id)} 
                                        className="relative inline-flex items-center cursor-pointer focus:outline-none"
                                    >
                                        <div className={`w-12 h-6 rounded-full transition-colors duration-300 shadow-inner ${driver.onlineStatus ? 'bg-[#08B36A]' : 'bg-slate-200'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${driver.onlineStatus ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-end gap-3">
                                        <button 
                                            onClick={() => handleOpenView(driver)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-2xl transition-all hover:scale-110"
                                            title="View Driver Profile"
                                        >
                                            <FaEye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenHistory(driver)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all hover:scale-110"
                                            title="View Dispatch History"
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

            {/* --- INTEGRATED MODALS --- */}
            
            {/* 1. Driver/License Details */}
            <DriverDetailsModal
                isOpen={viewModalOpen} 
                onClose={() => setViewModalOpen(false)} 
                driver={selectedDriver} 
            />

            {/* 2. Dispatch History Table */}
            <DriverHistoryModal
                isOpen={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                driver={selectedDriver} 
                onViewOrder={handleOpenOrder} 
            />

           
        </div>
    )
}

export default ManageAmbulanceDrivers