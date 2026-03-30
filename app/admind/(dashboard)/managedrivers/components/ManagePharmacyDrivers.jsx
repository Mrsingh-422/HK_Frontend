'use client'

import React, { useState } from 'react'
import { FaEye, FaHistory } from "react-icons/fa"
import DriverDetailsModal from './otherComponents/DriverDetailsModal';
import DriverHistoryModal from './otherComponents/DriverHistoryModal';

const ManagePharmacyDrivers = () => {
    const [drivers, setDrivers] = useState([
        {
            id: 1,
            vendorName: "PharmacyHk",
            username: "New 094636",
            driverName: "New User",
            phone: "8741527479",
            email: "newuser1@gmail.com",
            address: "Rajbagh, Srinagar, Jammu & Kashmir",
            walletId: "WLT1001",
            amount: 2450,
            vehicle: "Bike",
            vehicleNumber: "JK01AB1234",
            licenseNumber: "LIC8281881",
            licenseImage: "https://randomuser.me/api/portraits/men/10.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/11.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/1.jpg",
            onlineStatus: true,
            driverAssignStatus: true,
            history: [
                { parcelId: "P1001", location: "Lal Chowk", date: "2026-03-20", status: "Delivered" },
                { parcelId: "P1002", location: "Hazratbal", date: "2026-03-21", status: "Delivered" }
            ]
        },
        {
            id: 2,
            vendorName: "MediQuick",
            username: "User20456",
            driverName: "Aamir Khan",
            phone: "9876543210",
            email: "aamir@gmail.com",
            address: "Bemina, Srinagar",
            walletId: "WLT1002",
            amount: 1800,
            vehicle: "Scooter",
            vehicleNumber: "JK01CD5678",
            licenseNumber: "LIC9281882",
            licenseImage: "https://randomuser.me/api/portraits/men/12.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/13.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/2.jpg",
            onlineStatus: true,
            driverAssignStatus: false,
            history: [
                { parcelId: "P2001", location: "Baramulla", date: "2026-03-19", status: "Delivered" }
            ]
        },
        {
            id: 3,
            vendorName: "HealthPlus",
            username: "Driver789",
            driverName: "Imran Shah",
            phone: "9900112233",
            email: "imran@gmail.com",
            address: "Anantnag, J&K",
            walletId: "WLT1003",
            amount: 3200,
            vehicle: "Bike",
            vehicleNumber: "JK02EF9012",
            licenseNumber: "LIC7281883",
            licenseImage: "https://randomuser.me/api/portraits/men/14.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/15.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/3.jpg",
            onlineStatus: false,
            driverAssignStatus: true,
            history: [
                { parcelId: "P3001", location: "Pulwama", date: "2026-03-18", status: "Delivered" }
            ]
        },
        {
            id: 4,
            vendorName: "CareMeds",
            username: "DriveX44",
            driverName: "Bilal Ahmad",
            phone: "9123456780",
            email: "bilal@gmail.com",
            address: "Kupwara, J&K",
            walletId: "WLT1004",
            amount: 1500,
            vehicle: "Scooter",
            vehicleNumber: "JK03GH3456",
            licenseNumber: "LIC6281884",
            licenseImage: "https://randomuser.me/api/portraits/men/16.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/17.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/4.jpg",
            onlineStatus: true,
            driverAssignStatus: true,
            history: [
                { parcelId: "P4001", location: "Handwara", date: "2026-03-17", status: "Delivered" }
            ]
        },
        {
            id: 5,
            vendorName: "PharmaFast",
            username: "Speedy55",
            driverName: "Zubair Lone",
            phone: "9012345678",
            email: "zubair@gmail.com",
            address: "Ganderbal, J&K",
            walletId: "WLT1005",
            amount: 2750,
            vehicle: "Bike",
            vehicleNumber: "JK04IJ7890",
            licenseNumber: "LIC5281885",
            licenseImage: "https://randomuser.me/api/portraits/men/18.jpg",
            rcImage: "https://randomuser.me/api/portraits/men/19.jpg",
            imageUrl: "https://randomuser.me/api/portraits/med/men/5.jpg",
            onlineStatus: true,
            driverAssignStatus: false,
            history: [
                { parcelId: "P5001", location: "Sonamarg", date: "2026-03-19", status: "Delivered" }
            ]
        }
    ]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const handleViewDetails = (driver) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    const handleViewHistory = (driver) => {
        setSelectedDriver(driver);
        setIsHistoryModalOpen(true);
    };

    const toggleStatus = (id) => {
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: !d.status } : d));
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Vendor Name</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Image</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Driver Name</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {drivers.map((driver, index) => (
                            <tr key={driver.id} className="group hover:bg-slate-50/30 transition-colors duration-200">
                                <td className="px-6 py-5 text-sm text-slate-400 font-medium">
                                    {(index + 1).toString().padStart(2, '0')}
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-slate-700">{driver.vendorName}</td>
                                <td className="px-6 py-5 text-center">
                                    <img src={driver.imageUrl} className="w-10 h-10 rounded-xl mx-auto shadow-sm" alt="" />
                                </td>
                                <td className="px-6 py-5 text-sm font-semibold text-slate-700">{driver.driverName}</td>
                                <td className="px-6 py-5 text-center">
                                    <button onClick={() => toggleStatus(driver.id)} className="relative inline-flex items-center cursor-pointer">
                                        <div className={`w-10 h-5 rounded-full transition-colors ${driver.status ? 'bg-[#08B36A]' : 'bg-slate-200'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${driver.status ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleViewDetails(driver)}
                                            className="p-2.5 text-slate-400 hover:text-[#08B36A] hover:bg-[#08B36A]/10 rounded-xl transition-all"
                                        >
                                            <FaEye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleViewHistory(driver)}
                                            className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                            <FaHistory size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CALLING THE MODAL COMPONENT */}
            <DriverDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                driver={selectedDriver}
            />
            <DriverHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                driver={selectedDriver}
            />
        </div>
    )
}

export default ManagePharmacyDrivers