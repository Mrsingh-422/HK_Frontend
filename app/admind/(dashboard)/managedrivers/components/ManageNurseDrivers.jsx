'use client'

import React, { useState } from 'react'
import { FaEye, FaHistory, FaStethoscope } from "react-icons/fa"
import DriverDetailsModal from './otherComponents/DriverDetailsModal';
import DriverHistoryModal from './otherComponents/DriverHistoryModal';

const ManageNurseDrivers = () => {
    // Nurse-specific dummy data
    const [drivers, setDrivers] = useState([
        {
            id: 1,
            vendorName: "CarePlus Nursing Agency",
            username: "Nurse_Zeenat_01",
            driverName: "Zeenat Rashid",
            phone: "9149112233",
            email: "zeenat.nurse@careplus.com",
            address: "Rajbagh, Srinagar, J&K",
            walletId: "WLT_NURSE_101",
            amount: 5800,
            vehicle: "Scooty",
            vehicleNumber: "JK01-AZ-4455",
            licenseNumber: "LIC-MED-110022",
            licenseImage: "https://randomuser.me/api/portraits/women/12.jpg",
            rcImage: "https://randomuser.me/api/portraits/women/13.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/women/1.jpg",
            onlineStatus: true,
            driverAssignStatus: true, // Currently at a patient's home
            history: [
                { orderId: "VST-9901", patientName: "Abdul Gani", location: "Jawahar Nagar", date: "2026-03-25", status: "Completed" },
                { orderId: "VST-9905", patientName: "Fatima Begum", location: "Karan Nagar", date: "2026-03-25", status: "In Progress" }
            ]
        },
        {
            id: 2,
            vendorName: "Lifeline Homecare",
            username: "Nurse_Arif_05",
            driverName: "Arif Ahmad",
            phone: "7006778899",
            email: "arif.a@lifeline.com",
            address: "Baramulla, J&K",
            walletId: "WLT_NURSE_102",
            amount: 3200,
            vehicle: "Bike",
            vehicleNumber: "JK05-BB-1234",
            licenseNumber: "LIC-MED-556677",
            licenseImage: "https://randomuser.me/api/portraits/men/22.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/23.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/22.jpg",
            onlineStatus: false,
            driverAssignStatus: false,
            history: [
                { orderId: "VST-8840", patientName: "Ghulam Nabi", location: "Sopore", date: "2026-03-24", status: "Completed" }
            ]
        }
    ]);

    // Modal Management States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Handlers
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
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Nursing Agency</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Photo</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Nurse Name</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Availability</th>
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
                                        <img src={driver.imageUrl} className="w-12 h-12 rounded-2xl mx-auto border-2 border-white shadow-md" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${driver.onlineStatus ? 'bg-[#08B36A]' : 'bg-slate-300'}`}></div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-800">{driver.driverName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{driver.username}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    {/* Availability Toggle */}
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
                                            className="p-3 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-2xl transition-all"
                                            title="View Nurse Profile"
                                        >
                                            <FaEye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenHistory(driver)}
                                            className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                                            title="View Visit History"
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
            
            {/* Profile/Licensing Details */}
            <DriverDetailsModal 
                isOpen={viewModalOpen} 
                onClose={() => setViewModalOpen(false)} 
                driver={selectedDriver} 
            />

            {/* Visit History List */}
            <DriverHistoryModal 
                isOpen={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                driver={selectedDriver} 
                onViewOrder={handleOpenOrder} 
            />

        </div>
    )
}

export default ManageNurseDrivers