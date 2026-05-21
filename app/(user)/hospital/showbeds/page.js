"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
    FaWind, FaRupeeSign, FaArrowRight, FaCalendarAlt 
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function EnhancedBedDashboard() {
    const router = useRouter();
    const[wardInfo, setWardInfo] = useState(null);
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);

    const [startDate, setStartDate] = useState("2026-05-15");
    const [endDate, setEndDate] = useState("2026-05-18");

    const totalDays = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    },[startDate, endDate]);

    useEffect(() => {
        const rawData = sessionStorage.getItem("activeWardRequest");
        if (!rawData) { router.push("/hospital"); return; }
        setWardInfo(JSON.parse(rawData));
    }, [router]);

    const fetchBeds = async () => {
        if (!wardInfo) return;
        setLoading(true);
        try {
            const response = await UserAPI.checkBedAvalability({
                hospitalId: wardInfo.hospitalId,
                wardId: wardInfo.wardId,
                startDate,
                endDate
            });
            if (response.success) setBeds(response.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const confirmBooking = () => {
        if (!selectedBed) return;
        sessionStorage.setItem("activeBooking", JSON.stringify({
            ...wardInfo, 
            startDate, 
            endDate, 
            totalDays, // Added totalDays
            bedId: selectedBed._id, 
            bedNumber: selectedBed.bedNumber,
            pricePerDay: selectedBed.pricePerDay,
            totalPrice: selectedBed.pricePerDay * totalDays // Sending calculated total
        }));
        router.push("/hospital/checkout");
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 mb-8 border border-blue-50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-800">Select Date Range</h1>
                            <p className="text-slate-500 text-sm">Stay Duration: <span className="font-black text-blue-600">{totalDays} Nights</span></p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-2 px-4">
                                <FaCalendarAlt className="text-blue-500" />
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent font-bold text-sm outline-none" />
                            </div>
                            <div className="h-8 w-[1px] bg-slate-300" />
                            <div className="flex items-center gap-2 px-4">
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent font-bold text-sm outline-none" />
                            </div>
                            <button onClick={fetchBeds} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {beds.map((bed) => (
                        <div 
                            key={bed._id}
                            onClick={() => bed.status === "Available" && setSelectedBed(bed)}
                            className={`group p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer 
                                ${bed.status === "Available" ? "bg-white border-white hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100" : "bg-slate-100 border-transparent opacity-60 cursor-not-allowed"}
                                ${selectedBed?._id === bed._id ? "!border-blue-600 ring-2 ring-blue-600/20" : ""}
                            `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                    bed.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>{bed.status}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-1">{bed.bedNumber}</h3>
                            <div className="flex items-center text-slate-500 font-bold">
                                <FaRupeeSign size={10} /> {bed.pricePerDay} <span className="text-[10px] ml-1 opacity-70">/ night</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedBed && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-12">
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Total for {totalDays} Nights</p>
                        <p className="font-black text-lg flex items-center gap-1">
                            <FaRupeeSign size={14} /> {selectedBed.pricePerDay * totalDays}
                        </p>
                    </div>
                    <button onClick={confirmBooking} className="bg-emerald-500 hover:bg-emerald-400 px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all">
                        Pay Now <FaArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
}