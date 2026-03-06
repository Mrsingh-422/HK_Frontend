"use client";
import React, { useState } from "react";
// React Icons
import { HiOutlinePhone, HiOutlineLocationMarker, HiStar, HiCheckCircle, HiOutlineClock } from "react-icons/hi";
import { FiTruck, FiUser, FiUsers } from "react-icons/fi";
import { MdOutlineHealthAndSafety, MdVerified } from "react-icons/md";

function AmbulanceBookings() {
    const [appointments] = useState([
        {
            id: 1,
            bookingId: "AMB-99201",
            status: "Active",
            name: "Cardiac Care ALS",
            type: "ALS",
            vendor: "LifeLine Services",
            price: 1500,
            distance: 2.5,
            rating: 5,
            image: "https://www.forcemotors.com/wp-content/uploads/2025/02/Traveller-Ambulance-D-mob-1.png",
            description: "Advanced cardiac life support ambulance equipped with ventilator and cardiac monitoring.",
            driver: "Rajesh Kumar",
            experience: "8 Years",
            contact: "+91 9876543210",
            equipment: ["Ventilator", "Defibrillator", "ECG Monitor", "Oxygen Support"],
            available24x7: true,
            capacity: "1 Patient + 2 Attendants"
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "bg-green-100 text-green-700 border-green-200";
            case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            {/* Container restricted to 1024px (max-w-5xl) to look good on wide screens */}
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            Ambulance Bookings <MdVerified className="text-[#08b36a]" />
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your emergency transport and equipment details.</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase">Current Status</span>
                        <p className="text-[#08b36a] font-bold">All Systems Ready</p>
                    </div>
                </div>

                {/* BOOKINGS LIST */}
                <div className="space-y-8">
                    {appointments.map((item) => (
                        <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">

                            {/* TOP STRIP */}
                            <div className="bg-gray-50 px-6 py-3 flex flex-wrap justify-between items-center border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {item.bookingId}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <HiOutlineClock className="text-[#08b36a]" /> Booking Confirmed
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row">
                                {/* COMPACT IMAGE */}
                                <div className="w-full md:w-1/3 xl:w-1/4 h-52 md:h-auto shrink-0 relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 bg-[#08b36a] text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        {item.type} Type
                                    </div>
                                </div>

                                {/* DETAILS CONTENT */}
                                <div className="p-6 md:p-8 flex-1">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{item.name}</h2>
                                            <p className="text-sm font-medium text-gray-400">By {item.vendor}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                                            <HiStar className="text-yellow-500" />
                                            <span className="font-bold text-yellow-700 text-sm">{item.rating}.0</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{item.description}"</p>

                                    {/* INFO GRID */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-50 p-2.5 rounded-xl text-[#08b36a]"><FiUser size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Driver</p>
                                                <p className="text-sm font-bold text-gray-700">{item.driver}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-50 p-2.5 rounded-xl text-[#08b36a]"><FiUsers size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Capacity</p>
                                                <p className="text-sm font-bold text-gray-700">{item.capacity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-50 p-2.5 rounded-xl text-[#08b36a]"><HiOutlineLocationMarker size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Distance</p>
                                                <p className="text-sm font-bold text-gray-700">{item.distance} KM</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* EQUIPMENT */}
                                    <div className="mb-8">
                                        <p className="text-[11px] font-black text-gray-300 uppercase mb-3 tracking-widest flex items-center gap-2">
                                            <MdOutlineHealthAndSafety /> Medical Equipment Onboard
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.equipment.map((gear, i) => (
                                                <span key={i} className="bg-gray-50 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-100">
                                                    {gear}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FOOTER ACTIONS */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-50 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Fare</p>
                                            <p className="text-2xl font-black text-gray-900">₹{item.price}</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <a
                                                href={`tel:${item.contact}`}
                                                className="flex-1 sm:flex-none border border-[#08b36a] text-[#08b36a] px-6 py-2.5 rounded-xl font-bold text-sm text-center transition-all hover:bg-green-50"
                                            >
                                                Call Driver
                                            </a>
                                            <button className="flex-1 sm:flex-none bg-[#08b36a] hover:bg-[#256f47] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-100 transition-all active:scale-95">
                                                Track Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AmbulanceBookings;