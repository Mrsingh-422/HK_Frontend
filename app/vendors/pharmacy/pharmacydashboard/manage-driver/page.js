'use client'
import React, { useState } from 'react';
import {
    FaSearch, FaMotorcycle, FaPlus, FaCircle,
    FaPhoneAlt, FaEdit, FaTrash, FaToggleOn, FaToggleOff
} from 'react-icons/fa';

// Import the Modal Components (Assuming these are in your components folder)
import AddDriverModal from './components/AddDriverModal';
import EditDriverModal from './components/EditDriverModal';
import DriverInfoModal from './components/DriverInfoModal';

const initialDriversData = [
    { id: 'DB-1001', name: 'Arjun Sharma', phone: '9876543210', vehicleType: 'Two Wheeler', status: 'Online', image: 'https://i.pravatar.cc/150?u=1001', joinDate: '10 Jan 2026' },
    { id: 'DB-1002', name: 'Rahul Verma', phone: '8877665544', vehicleType: 'Two Wheeler', status: 'Offline', image: 'https://i.pravatar.cc/150?u=1002', joinDate: '15 Feb 2026' },
    { id: 'DB-1003', name: 'Nitish Kumar', phone: '7766554433', vehicleType: 'LMV (Van)', status: 'Online', image: 'https://i.pravatar.cc/150?u=1003', joinDate: '01 Mar 2026' }
];

export default function ManageDriversPage() {
    const [drivers, setDrivers] = useState(initialDriversData);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // --- Core Logic ---
    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.phone.includes(searchTerm)
    );

    // 🌟 Toggle Online/Offline Logic
    const toggleStatus = (e, id) => {
        e.stopPropagation(); // Prevents opening the Info Modal
        setDrivers(prevDrivers => prevDrivers.map(d =>
            d.id === id ? { ...d, status: d.status === 'Online' ? 'Offline' : 'Online' } : d
        ));
    };

    const handleAdd = (newDriver) => {
        const entry = { ...newDriver, id: `DB-${Math.floor(1000 + Math.random() * 9000)}`, joinDate: 'New' };
        setDrivers([entry, ...drivers]);
    };

    const handleUpdate = (updatedDriver) => {
        setDrivers(drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Remove this driver?")) {
            setDrivers(drivers.filter(d => d.id !== id));
        }
    };

    const openEdit = (e, driver) => {
        e.stopPropagation();
        setSelectedDriver(driver);
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10 max-w-7xl mx-auto p-0 sm:p-0">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FaMotorcycle size={20} /></div>
                        Delivery Personnel
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Click on status to toggle Online/Offline availability.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" placeholder="Search name or phone..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                    >
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
                                <th className="p-5">Availability Status</th>
                                <th className="p-5 text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDrivers.length > 0 ? (
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
                                                    <p className="text-[11px] text-gray-400 font-semibold uppercase">ID: {driver.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><FaPhoneAlt size={10} className="text-blue-500" /> {driver.phone}</span>
                                                <span className="text-[11px] text-gray-400 font-bold uppercase">{driver.vehicleType}</span>
                                            </div>
                                        </td>

                                        {/* 🌟 INTERACTIVE STATUS TOGGLE 🌟 */}
                                        <td className="p-5">
                                            <button
                                                onClick={(e) => toggleStatus(e, driver.id)}
                                                title="Click to toggle status"
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${driver.status === 'Online'
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <FaCircle size={8} className={driver.status === 'Online' ? 'animate-pulse' : ''} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{driver.status}</span>
                                                {driver.status === 'Online' ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                                            </button>
                                        </td>

                                        <td className="p-5 pr-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={(e) => openEdit(e, driver)} className="p-2 bg-gray-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg border border-gray-100 transition-all shadow-sm"><FaEdit size={14} /></button>
                                                <button onClick={(e) => handleDelete(e, driver.id)} className="p-2 bg-gray-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-gray-100 transition-all shadow-sm"><FaTrash size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-medium italic">No drivers found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS --- */}
            <AddDriverModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
            <EditDriverModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} driver={selectedDriver} onUpdate={handleUpdate} />
            <DriverInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} driver={selectedDriver} />
        </div>
    );
}