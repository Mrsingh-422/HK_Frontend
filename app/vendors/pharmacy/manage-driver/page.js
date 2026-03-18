'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaMotorcycle, FaPhoneAlt, 
    FaEdit, FaTrash, FaPlus, FaTimes, FaCircle, FaUser, FaUserPlus
} from 'react-icons/fa';

// ==========================================
// 🌟 INITIAL DUMMY DATA FOR DELIVERY BOYS
// ==========================================
const initialDriversData =[
    {
        id: 'DB-1001',
        name: 'New User',
        phone: '828272727',
        vehicleType: 'Two Wheeler',
        status: 'Online',
        image: 'https://via.placeholder.com/150/87CEFA/FFFFFF?text=Photo',
        joinDate: '10 Jan 2026'
    },
    {
        id: 'DB-1002',
        name: 'chchcjvh',
        phone: '68585858',
        vehicleType: 'Two Wheeler',
        status: 'Offline',
        image: 'https://via.placeholder.com/150/FFB6C1/FFFFFF?text=Photo',
        joinDate: '15 Feb 2026'
    },
    {
        id: 'DB-1003',
        name: 'Nitish',
        phone: 'N/A',
        vehicleType: 'LMV (Light Motor Vehicle)',
        status: 'Online',
        image: 'https://via.placeholder.com/150/98FB98/FFFFFF?text=Photo',
        joinDate: '01 Mar 2026'
    }
];

export default function ManageDriversPage() {
    // 🌟 Main Data State (Taki naya driver add ho sake aur delete ho sake)
    const[drivers, setDrivers] = useState(initialDriversData);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🌟 Info Modal State (For Clickable Row)
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // 🌟 Add New Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicleType: 'Two Wheeler',
        status: 'Online'
    });

    // --- Filter logic ---
    const filteredDrivers = drivers.filter(driver => 
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        driver.phone.includes(searchTerm)
    );

    // --- Row Click Handlers (View Info) ---
    const openDriverInfo = (driver) => {
        setSelectedDriver(driver);
        setIsInfoModalOpen(true);
    };

    const closeDriverInfo = () => {
        setIsInfoModalOpen(false);
        setTimeout(() => setSelectedDriver(null), 200);
    };

    // --- Action Button Handlers ---
    const handleEdit = (e, driver) => {
        e.stopPropagation(); // Row click hone se rokne ke liye
        alert(`Editing Form will open for: ${driver.name}`);
    };

    const handleDelete = (e, driverId, driverName) => {
        e.stopPropagation(); // Row click hone se rokne ke liye
        if(window.confirm(`Are you sure you want to delete ${driverName}?`)) {
            // Update state to remove driver
            setDrivers(drivers.filter(d => d.id !== driverId));
            alert(`${driverName} Deleted successfully!`);
        }
    };

    // --- Add New Handlers ---
    const handleAddNewClick = () => {
        setFormData({ name: '', phone: '', vehicleType: 'Two Wheeler', status: 'Online' });
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Form Validation Validation
        if(!formData.name || !formData.phone) {
            alert("Please fill out Name and Phone Number.");
            return;
        }

        // Generate New Dummy ID & Date
        const newId = `DB-${Math.floor(1000 + Math.random() * 9000)}`;
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const newDriver = {
            id: newId,
            name: formData.name,
            phone: formData.phone,
            vehicleType: formData.vehicleType,
            status: formData.status,
            image: `https://via.placeholder.com/150/FFD700/FFFFFF?text=${formData.name.substring(0,2).toUpperCase()}`, // Auto generate initials image
            joinDate: today
        };

        // Update State
        setDrivers([newDriver, ...drivers]);
        alert(`Success! Driver ${formData.name} added.`);
        closeAddModal();
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-2"> 
                        <FaMotorcycle className="text-[#08B36A]" /> Manage Delivery Boy
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">View, edit, or remove delivery personnel.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Name or Phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all"
                        />
                    </div>
                    {/* ADD NEW BUTTON */}
                    <button 
                        onClick={handleAddNewClick}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#28a745] text-white rounded-xl font-bold text-sm hover:bg-[#218838] transition-all shadow-sm shrink-0"
                    >
                        Add New <FaPlus size={12}/>
                    </button>
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Driver Info</th>
                                <th className="p-4">Contact & Vehicle</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver, index) => (
                                    <tr 
                                        key={driver.id} 
                                        onClick={() => openDriverInfo(driver)} // 🌟 TD/TR is Clickable Here 🌟
                                        className="hover:bg-blue-50/50 transition-all duration-200 group cursor-pointer"
                                    >
                                        {/* 1. Driver Image & Name */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                                                    <img src={driver.image} alt={driver.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-[15px] group-hover:text-[#1E3A8A] transition-colors">{driver.name}</span>
                                                    <span className="text-[11px] text-gray-400 font-semibold">ID: {driver.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Contact Details */}
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-700 font-semibold flex items-center gap-1.5">
                                                    <FaPhoneAlt size={10} className="text-blue-500"/> {driver.phone}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {driver.vehicleType}
                                                </span>
                                            </div>
                                        </td>

                                        {/* 3. Online/Offline Status */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5">
                                                <FaCircle size={10} className={driver.status === 'Online' ? 'text-green-500' : 'text-gray-400'} />
                                                <span className={`text-sm font-bold ${driver.status === 'Online' ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {driver.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* 4. Action Buttons (Edit / Delete) */}
                                        <td className="p-4 pr-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={(e) => handleEdit(e, driver)} // stopPropagation
                                                    className="px-4 py-1.5 bg-[#198754] text-white hover:bg-[#157347] rounded transition-all text-xs font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDelete(e, driver.id, driver.name)} // stopPropagation
                                                    className="px-4 py-1.5 bg-[#dc3545] text-white hover:bg-[#c82333] rounded transition-all text-xs font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                                        No delivery boy found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 1. INFO MODAL (ON ROW CLICK) 🌟         */}
            {/* ========================================== */}
            {isInfoModalOpen && selectedDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FaUser className="text-[#1E3A8A]" /> Driver Information
                            </h2>
                            <button onClick={closeDriverInfo} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6">
                                <img 
                                    src={selectedDriver.image} 
                                    alt="Driver" 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm mb-3"
                                />
                                <h3 className="text-xl font-bold text-gray-800">{selectedDriver.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <FaCircle size={10} className={selectedDriver.status === 'Online' ? 'text-green-500' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${selectedDriver.status === 'Online' ? 'text-green-600' : 'text-gray-500'}`}>
                                        {selectedDriver.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Driver ID</span>
                                    <span className="text-sm font-bold text-gray-800">{selectedDriver.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone Number</span>
                                    <span className="text-sm font-bold text-blue-600">{selectedDriver.phone}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Vehicle Details</span>
                                    <span className="text-sm font-bold text-gray-800">{selectedDriver.vehicleType}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Joining Date</span>
                                    <span className="text-sm font-bold text-gray-800">{selectedDriver.joinDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={closeDriverInfo} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* 🌟 2. ADD NEW DRIVER MODAL (FORM) 🌟       */}
            {/* ========================================== */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaUserPlus className="text-[#08B36A]" /> Add New Delivery Boy
                            </h2>
                            <button onClick={closeAddModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter full name" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        placeholder="Enter phone number" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Type</label>
                                        <select 
                                            value={formData.vehicleType}
                                            onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all"
                                        >
                                            <option value="Two Wheeler">Two Wheeler (Bike/Scooter)</option>
                                            <option value="LMV (Light Motor Vehicle)">LMV (Car/Van)</option>
                                            <option value="Three Wheeler">Three Wheeler</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Initial Status</label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all"
                                        >
                                            <option value="Online">Online</option>
                                            <option value="Offline">Offline</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Profile Photo (Optional)</label>
                                    <div className="w-full px-4 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                        + Click to upload image
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Action Buttons */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeAddModal} 
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-[#28a745] text-white rounded-xl font-bold text-sm hover:bg-[#218838] transition-all shadow-md shadow-green-200"
                                >
                                    Save Driver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}