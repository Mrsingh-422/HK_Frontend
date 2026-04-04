'use client'
import React, { useState, useEffect, useCallback } from 'react';
import {
    FaSearch, FaMotorcycle, FaPlus, FaCircle,
    FaPhoneAlt, FaEdit, FaTrash, FaChevronDown
} from 'react-icons/fa';

import AddDriverModal from './components/AddDriverModal';
import EditDriverModal from './components/EditDriverModal';
import DriverInfoModal from './components/DriverInfoModal';
import PharmacyAPI from '@/app/services/PharmacyAPI';

// Helper to format image URLs
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace('public/', '');
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
};

export default function ManageDriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // --- 1. Fetch Drivers ---
    const fetchDrivers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await PharmacyAPI.getPharmacyDrivers();
            if (response.success) {
                const mappedDrivers = response.data.map(driver => ({
                    ...driver,
                    id: driver._id,
                    image: getImageUrl(driver.profilePic),
                    vehicleType: driver.vehicleNumber || 'Not Assigned'
                }));
                setDrivers(mappedDrivers);
            }
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    // --- 2. Update Status (Dropdown) ---
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await PharmacyAPI.togglePharmacyDriverStatus(id, newStatus);
            if (response.success) {
                setDrivers(prev => prev.map(d =>
                    d.id === id ? { ...d, status: newStatus } : d
                ));
            }
        } catch (error) {
            console.error("Status update failed:", error);
            alert("Failed to update status.");
        }
    };

    // --- 3. Add Driver ---
    const handleAddDriver = async (formData) => {
        try {
            const response = await PharmacyAPI.addPharmacyDriver(formData);
            if (response.success) {
                fetchDrivers();
                setIsAddOpen(false);
            }
        } catch (error) {
            alert("Failed to add driver. Check console.");
        }
    };

    // --- 4. Update Driver Details (The Edit Function) ---
    const handleUpdateDriver = async (id, formData) => {
        try {
            // formData is a FormData object from the Modal
            const response = await PharmacyAPI.updatePharmacyDriver(id, formData);
            if (response.success) {
                fetchDrivers(); // Refresh list to see updates
                setIsEditOpen(false);
                setSelectedDriver(null);
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update driver details.");
        }
    };

    // --- 5. Delete Driver ---
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to remove this driver?")) {
            try {
                const response = await PharmacyAPI.deletePharmacyDriver(id);
                if (response.success) fetchDrivers();
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    // --- UI Helpers ---
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
            case 'Busy': return 'bg-blue-50 border-blue-100 text-blue-600';
            case 'Offline': return 'bg-gray-100 border-gray-200 text-gray-500';
            default: return 'bg-gray-50 border-gray-100 text-gray-400';
        }
    };

    const filteredDrivers = drivers.filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10 max-w-7xl mx-auto p-4 sm:p-0">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FaMotorcycle size={20} /></div>
                        Delivery Personnel
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage driver status via the interactive dropdowns.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" placeholder="Search by name..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button onClick={() => setIsAddOpen(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all">
                        <FaPlus size={12} /> Add New Driver
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-5 pl-8">Driver Info</th>
                                <th className="p-5">Contact & Vehicle</th>
                                <th className="p-5">Duty Status</th>
                                <th className="p-5 text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-400">Loading drivers...</td></tr>
                            ) : filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver) => (
                                    <tr
                                        key={driver.id}
                                        onClick={() => { setSelectedDriver(driver); setIsInfoOpen(true); }}
                                        className="hover:bg-emerald-50/40 transition-all group cursor-pointer"
                                    >
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <img src={driver.image} className="w-11 h-11 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{driver.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-tighter">ID: ...{driver.id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><FaPhoneAlt size={10} className="text-blue-500" /> {driver.phone}</span>
                                                <span className="text-[11px] text-gray-400 font-bold uppercase">{driver.vehicleType}</span>
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${getStatusStyles(driver.status)}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FaCircle size={8} className={driver.status === 'Available' ? 'animate-pulse' : ''} />
                                                <select
                                                    value={driver.status}
                                                    onChange={(e) => handleStatusUpdate(driver.id, e.target.value)}
                                                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none pr-4"
                                                >
                                                    <option value="Available" className="text-gray-900">Available</option>
                                                    <option value="Busy" className="text-gray-900">Busy</option>
                                                    <option value="Offline" className="text-gray-900">Offline</option>
                                                </select>
                                                <FaChevronDown size={8} className="ml-[-12px] pointer-events-none opacity-60" />
                                            </div>
                                        </td>

                                        <td className="p-5 pr-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(driver); setIsEditOpen(true); }} className="p-2 bg-gray-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg border border-gray-100 shadow-sm transition-all">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={(e) => handleDelete(e, driver.id)} className="p-2 bg-gray-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-gray-100 shadow-sm transition-all">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-medium">No drivers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS --- */}
            <AddDriverModal 
                isOpen={isAddOpen} 
                onClose={() => setIsAddOpen(false)} 
                onAdd={handleAddDriver} 
            />

            <EditDriverModal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                driver={selectedDriver} 
                onUpdate={handleUpdateDriver} 
            />

            <DriverInfoModal 
                isOpen={isInfoOpen} 
                onClose={() => setIsInfoOpen(false)} 
                driver={selectedDriver} 
            />
        </div>
    );
}