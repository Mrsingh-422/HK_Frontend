"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft, FaWind, FaCheck, FaRupeeSign,
    FaTools, FaUserAlt, FaProcedures, FaHospital,
    FaArrowRight, FaRegCircle, FaCheckCircle
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function EnhancedBedDashboard() {
    const router = useRouter();
    const [wardInfo, setWardInfo] = useState(null);
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Selection State
    const [selectedBed, setSelectedBed] = useState(null);

    useEffect(() => {
        const fetchBeds = async () => {
            try {
                const rawData = sessionStorage.getItem("activeWardRequest");
                if (!rawData) { router.push("/hospital"); return; }
                const payload = JSON.parse(rawData);
                setWardInfo(payload);

                const response = await UserAPI.getWardBeds(payload.wardId);
                if (response.success) setBeds(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBeds();
    }, [router]);

    const filteredBeds = useMemo(() => {
        let result = beds;
        if (filter === "available") result = beds.filter(b => b.status === "Available");
        if (filter === "ventilator") result = beds.filter(b => b.isVentilatorAvailable && b.status === "Available");
        return result;
    }, [beds, filter]);

    const stats = useMemo(() => ({
        total: beds.length,
        available: beds.filter(b => b.status === "Available").length,
        ventilators: beds.filter(b => b.isVentilatorAvailable && b.status === "Available").length
    }), [beds]);

    const handleBedSelect = (bed) => {
        if (bed.status === "Available") {
            setSelectedBed(selectedBed?._id === bed._id ? null : bed);
        }
    };
    
    // UPDATED: Merging previous payload with new bed selection
    const confirmBooking = () => {
        if (!selectedBed || !wardInfo) return;

        const finalBookingPayload = {
            ...wardInfo, // Spreads HospitalID, HospitalName, WardID, WardName, etc.
            bedId: selectedBed._id,
            bedNumber: selectedBed.bedNumber,
            pricePerDay: selectedBed.pricePerDay,
            isVentilator: selectedBed.isVentilatorAvailable,
            bookingDate: new Date().toISOString()
        };

        // Save complete data for Checkout
        sessionStorage.setItem("activeBooking", JSON.stringify(finalBookingPayload));

        // Navigate to checkout
        router.push("/hospital/checkout");
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Ward Map...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32">
            <div className="max-w-7xl mx-auto p-4 md:p-8">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                            <FaArrowLeft size={16} className="text-slate-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <FaHospital size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{wardInfo?.hospitalName || "Medical Center"}</span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-800">{wardInfo?.wardName || "Ward Details"}</h1>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <StatCard label="Total" count={stats.total} color="text-slate-600" />
                        <StatCard label="Available" count={stats.available} color="text-emerald-600" />
                        <StatCard label="ICU/Vent" count={stats.ventilators} color="text-blue-600" />
                    </div>
                </header>

                {/* CONTROLS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-6">
                        <LegendItem color="bg-emerald-500" label="Vacant" />
                        <LegendItem color="bg-red-500" label="Occupied" />
                        <LegendItem color="bg-amber-500" label="Service" />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['all', 'available', 'ventilator'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === f
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredBeds.map((bed) => (
                        <BedCard
                            key={bed._id}
                            bed={bed}
                            isSelected={selectedBed?._id === bed._id}
                            onSelect={() => handleBedSelect(bed)}
                        />
                    ))}
                </div>
            </div>

            {/* FLOATING SELECTION BAR */}
            {selectedBed && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <FaProcedures className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Bed</p>
                            <h4 className="text-lg font-black">#{selectedBed.bedNumber}</h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Rate</p>
                            <p className="font-black text-emerald-400">₹{selectedBed.pricePerDay}</p>
                        </div>
                        <button
                            onClick={confirmBooking}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                            Confirm <FaArrowRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, count, color }) {
    return (
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm min-w-[90px]">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
            <p className={`text-lg font-black ${color}`}>{count}</p>
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">{label}</span>
        </div>
    );
}

function BedCard({ bed, isSelected, onSelect }) {
    const status = bed.status;

    const theme = {
        Available: {
            bg: isSelected ? "bg-emerald-50 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20" : "bg-white border-slate-200 hover:border-emerald-400",
            icon: <FaProcedures className={isSelected ? "text-emerald-600" : "text-slate-300"} />,
            badge: "bg-emerald-100 text-emerald-700",
            actionIcon: isSelected ? <FaCheckCircle size={20} className="text-emerald-600" /> : <FaRegCircle size={20} className="text-slate-300" />
        },
        Occupied: {
            bg: "bg-slate-50 border-transparent opacity-70 cursor-not-allowed",
            icon: <FaUserAlt className="text-red-300" />,
            badge: "bg-red-100 text-red-700",
            actionIcon: null
        },
        Maintenance: {
            bg: "bg-amber-50/30 border-amber-100 cursor-not-allowed",
            icon: <FaTools className="text-amber-300" />,
            badge: "bg-amber-100 text-amber-700",
            actionIcon: null
        }
    }[status];

    return (
        <div
            onClick={onSelect}
            className={`relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${theme.bg}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${theme.badge}`}>
                    {status}
                </div>
                {bed.isVentilatorAvailable && (
                    <div className="flex items-center gap-1 text-blue-500" title="Ventilator">
                        <FaWind size={12} />
                    </div>
                )}
            </div>

            <div className="mb-6 flex items-end justify-between">
                <div>
                    <div className="mb-2 transition-transform duration-300 group-hover:scale-110">
                        {theme.icon}
                    </div>
                    <h3 className="text-2xl font-black tracking-tighter text-slate-800">
                        {bed.bedNumber}
                    </h3>
                </div>
                <div>
                    {theme.actionIcon}
                </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-slate-800 font-bold text-sm">
                    <FaRupeeSign size={10} className="text-slate-400" />
                    <span>{bed.pricePerDay}</span>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Per Day</span>
            </div>
        </div>
    );
}