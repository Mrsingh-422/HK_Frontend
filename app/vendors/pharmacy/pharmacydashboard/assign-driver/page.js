'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaMotorcycle, FaMapMarkerAlt, 
    FaClock, FaPhoneAlt, FaStar, FaCheckCircle, 
    FaRoute, FaTimes, FaUserCircle, FaExclamationCircle
} from 'react-icons/fa';

// ==========================================
// 🌟 DUMMY DATA FOR ASSIGNMENT 🌟
// ==========================================

// 1. Orders Waiting for Assignment
const unassignedOrders =[
    {
        id: 'ORD-8091',
        customerName: 'Rahul Verma',
        address: 'Sector 15, Vashi, Navi Mumbai',
        distance: '4.2 km',
        timeElapsed: '10 mins',
        urgency: 'Normal',
        items: 3,
        amount: '₹450'
    },
    {
        id: 'ORD-8092',
        customerName: 'Sneha Patil',
        address: 'Andheri West, Near Metro Station, Mumbai',
        distance: '8.5 km',
        timeElapsed: '45 mins',
        urgency: 'High', // High urgency because it's waiting for 45 mins
        items: 1,
        amount: '₹1,250'
    },
    {
        id: 'ORD-8093',
        customerName: 'Amit Sharma',
        address: 'Powai Lake Road, Powai, Mumbai',
        distance: '2.1 km',
        timeElapsed: '5 mins',
        urgency: 'Normal',
        items: 5,
        amount: '₹3,200'
    },
    {
        id: 'ORD-8094',
        customerName: 'Priya Desai',
        address: 'Bandra Kurla Complex (BKC), Mumbai',
        distance: '5.8 km',
        timeElapsed: '25 mins',
        urgency: 'Medium',
        items: 2,
        amount: '₹890'
    },
];

// 2. Available Delivery Boys
const availableRiders =[
    {
        id: 'DB-101',
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        rating: 4.8,
        distanceFromStore: '0.5 km',
        status: 'Available',
        vehicle: 'Bike (MH-04-AB-1234)'
    },
    {
        id: 'DB-102',
        name: 'Suresh Singh',
        phone: '+91 91234 56789',
        rating: 4.5,
        distanceFromStore: '1.2 km',
        status: 'Available',
        vehicle: 'Scooty (MH-02-XY-9876)'
    },
    {
        id: 'DB-103',
        name: 'Vinay Tiwari',
        phone: '+91 99887 76655',
        rating: 4.9,
        distanceFromStore: '3.0 km',
        status: 'Busy (Delivering)',
        vehicle: 'Bike (MH-47-CD-5566)'
    },
];

export default function AssignDeliveryBoyPage() {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const[isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const[riderSearchTerm, setRiderSearchTerm] = useState('');

    const openAssignModal = (order) => {
        setSelectedOrder(order);
        setIsAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setIsAssignModalOpen(false);
        setTimeout(() => setSelectedOrder(null), 200);
    };

    const handleAssign = (rider) => {
        alert(`✅ Order ${selectedOrder.id} successfully assigned to ${rider.name}!`);
        closeAssignModal();
        // Here you would typically filter out the assigned order from the list
    };

    // UI Helpers
    const getUrgencyStyle = (urgency) => {
        switch (urgency) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200 animate-pulse';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-[#08B36A] bg-green-50 border-green-200';
        }
    };

    const getRiderStatusStyle = (status) => {
        if (status === 'Available') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        return 'text-amber-600 bg-amber-50 border-amber-200';
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#08B36A] to-blue-500"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaMotorcycle className="text-[#08B36A]" /> Assign Delivery Boy
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Dispatch orders quickly by assigning them to the nearest available riders.</p>
                </div>
                
                {/* Search Bar for Orders */}
                <div className="relative w-full sm:w-72">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Order ID or Location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                        <FaClock />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Assignment</p>
                        <h3 className="text-2xl font-bold text-gray-800">12 <span className="text-sm font-medium text-gray-400">Orders</span></h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                        <FaMotorcycle />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Riders Online</p>
                        <h3 className="text-2xl font-bold text-gray-800">08 <span className="text-sm font-medium text-gray-400">Available</span></h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-full -mr-8 -mt-8"></div>
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl relative z-10">
                        <FaExclamationCircle className="animate-pulse" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-red-500">Delayed Orders</p>
                        <h3 className="text-2xl font-bold text-red-600">02 <span className="text-sm font-medium text-red-400">&gt; 30 mins</span></h3>
                    </div>
                </div>
            </div>

            {/* --- ORDERS TABLE --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/40">
                    <h2 className="text-lg font-bold text-gray-800">Orders Waiting for Dispatch</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Order Details</th>
                                <th className="p-4">Delivery Location</th>
                                <th className="p-4">Waiting Time</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {unassignedOrders.map((order, index) => (
                                <tr key={index} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                    
                                    {/* Order Details */}
                                    <td className="p-4 pl-6">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{order.id}</span>
                                            <span className="text-xs text-gray-600 font-medium">{order.customerName}</span>
                                            <div className="flex gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-bold">{order.items} Items</span>
                                                <span className="text-[10px] text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded font-bold">{order.amount}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs text-gray-700 font-semibold flex items-start gap-1.5 max-w-[250px] line-clamp-2">
                                                <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0" size={12} /> 
                                                {order.address}
                                            </span>
                                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md w-fit flex items-center gap-1 border border-blue-100">
                                                <FaRoute size={10}/> Distance: {order.distance}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Waiting Time & Urgency */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                                <FaClock className="text-gray-400"/> {order.timeElapsed}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyStyle(order.urgency)}`}>
                                                {order.urgency} Priority
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className="p-4 pr-6 text-center">
                                        <button 
                                            onClick={() => openAssignModal(order)}
                                            className="px-5 py-2.5 bg-[#08B36A] text-white rounded-xl font-bold text-xs hover:bg-[#079b5c] transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <FaMotorcycle size={14} /> Assign Rider
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 SMART ASSIGNMENT MODAL 🌟               */}
            {/* ========================================== */}
            {isAssignModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FaMotorcycle className="text-[#08B36A]" /> Select Delivery Boy
                                </h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Assigning order <span className="font-bold text-gray-700">{selectedOrder.id}</span></p>
                            </div>
                            <button onClick={closeAssignModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Order Summary Strip */}
                        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex flex-wrap gap-4 justify-between items-center shrink-0">
                            <div className="flex items-center gap-2 text-sm">
                                <FaMapMarkerAlt className="text-red-400" />
                                <span className="font-semibold text-gray-700 truncate max-w-[200px]">{selectedOrder.address}</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">Drop: {selectedOrder.distance}</span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getUrgencyStyle(selectedOrder.urgency)}`}>Wait: {selectedOrder.timeElapsed}</span>
                            </div>
                        </div>

                        {/* Search Riders */}
                        <div className="p-4 border-b border-gray-100 shrink-0">
                            <div className="relative w-full">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search riders by name..." 
                                    value={riderSearchTerm}
                                    onChange={(e) => setRiderSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Riders List (Scrollable) */}
                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50/50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Nearest Available Riders</p>
                            <div className="space-y-3">
                                {availableRiders.map((rider, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                        
                                        {/* Rider Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                                                <FaUserCircle size={40} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm">{rider.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1"><FaPhoneAlt size={10}/> {rider.phone}</span>
                                                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded"><FaStar size={10}/> {rider.rating}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1">{rider.vehicle}</p>
                                            </div>
                                        </div>

                                        {/* Distance & Action */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                                            <div className="flex flex-col items-start sm:items-end">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRiderStatusStyle(rider.status)}`}>
                                                    {rider.status}
                                                </span>
                                                <span className="text-xs font-bold text-gray-700 mt-1 flex items-center gap-1">
                                                    <FaRoute className="text-blue-400"/> {rider.distanceFromStore} away
                                                </span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleAssign(rider)}
                                                disabled={rider.status !== 'Available'}
                                                className={`px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                                                    rider.status === 'Available' 
                                                    ? 'bg-[#08B36A] text-white hover:bg-[#079b5c] shadow-md shadow-green-200' 
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {rider.status === 'Available' ? <><FaCheckCircle size={14}/> Assign</> : 'Unavailable'}
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0 flex justify-end">
                            <button onClick={closeAssignModal} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}