'use client'

import React, { useState } from 'react'
import { FaEye, FaHistory, FaMicroscope } from "react-icons/fa"
import DriverDetailsModal from './otherComponents/DriverDetailsModal';
import DriverHistoryModal from './otherComponents/DriverHistoryModal';
// Reuse the same Modals we built for Pharmacy to keep the UI consistent

const ManageLabDrivers = () => {
    // Lab-specific dummy data
    const [drivers, setDrivers] = useState([
        {
            id: 1,
            vendorName: "Modern Diagnostic Lab",
            username: "Lab_X_001",
            driverName: "Imtiyaz Bhat",
            phone: "9149000000",
            email: "imtiyaz.lab@gmail.com",
            address: "Batamaloo, Srinagar, J&K",
            walletId: "WLT_LAB_501",
            amount: 4500,
            vehicle: "Bike",
            vehicleNumber: "JK01AM-9988",
            licenseNumber: "LIC-LAB-8821",
            licenseImage: "https://randomuser.me/api/portraits/men/32.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/33.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/12.jpg",
            onlineStatus: true,
            driverAssignStatus: false,
            history: [
                { orderId: "ORD-LAB-7721", patientName: "Muzaffar Ali", location: "Soura", date: "2026-03-24", status: "Sample Collected" },
                { orderId: "ORD-LAB-7722", patientName: "Rubeena Jan", location: "Hyderpora", date: "2026-03-24", status: "Delivered to Lab" }
            ]
        },
        {
            id: 2,
            vendorName: "City Care Pathology",
            username: "Patho_22",
            driverName: "Suhail Rather",
            phone: "7006000000",
            email: "suhail.patho@gmail.com",
            address: "Anantnag, J&K",
            walletId: "WLT_LAB_502",
            amount: 1200,
            vehicle: "Scooty",
            vehicleNumber: "JK03-1122",
            licenseNumber: "LIC-LAB-9900",
            licenseImage: "https://randomuser.me/api/portraits/men/44.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/45.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/15.jpg",
            onlineStatus: false,
            driverAssignStatus: false,
            history: []
        }
    ]);

    // Modal Management States
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
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Lab Vendor</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Photo</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Driver Name</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Online Status</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {drivers.map((driver, index) => (
                            <tr key={driver.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                <td className="px-6 py-5 text-sm font-medium text-slate-400">
                                    {(index + 1).toString().padStart(2, '0')}
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-slate-700">
                                    {driver.vendorName}
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="relative inline-block">
                                        <img src={driver.imageUrl} className="w-11 h-11 rounded-2xl mx-auto border-2 border-white shadow-sm ring-1 ring-slate-100" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${driver.onlineStatus ? 'bg-[#08B36A]' : 'bg-slate-300'}`}></div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-800">{driver.driverName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{driver.username}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <button 
                                        onClick={() => toggleStatus(driver.id)} 
                                        className="relative inline-flex items-center cursor-pointer focus:outline-none"
                                    >
                                        <div className={`w-11 h-6 rounded-full transition-colors duration-300 shadow-inner ${driver.onlineStatus ? 'bg-[#08B36A]' : 'bg-slate-200'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${driver.onlineStatus ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleOpenView(driver)}
                                            className="p-2.5 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-xl transition-all group-hover:shadow-sm"
                                            title="View Profile"
                                        >
                                            <FaEye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenHistory(driver)}
                                            className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all group-hover:shadow-sm"
                                            title="View Collection History"
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

            {/* --- REUSED MODALS --- */}
            
            {/* 1. Driver Profile Modal */}
            <DriverDetailsModal
                isOpen={viewModalOpen} 
                onClose={() => setViewModalOpen(false)} 
                driver={selectedDriver} 
            />

            {/* 2. Collection History Modal */}
            <DriverHistoryModal
                isOpen={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                driver={selectedDriver} 
                onViewOrder={handleOpenOrder} 
            />

            
        </div>
    )
}

export default ManageLabDrivers