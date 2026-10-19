"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
    FaRupeeSign, FaArrowRight, FaCalendarAlt, FaChevronLeft, FaHospital,
    FaUserMd, FaConciergeBell
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function EnhancedBedDashboard() {
    const router = useRouter();
    const [wardInfo, setWardInfo] = useState(null);
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);

    // Doctor & Services States
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);

    // Default dates: Today and 3 days later
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);

    // Inclusive calculation (e.g., 24th to 27th = 4 Days)
    const totalDays = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 1;
    }, [startDate, endDate]);

    useEffect(() => {
        const rawData = sessionStorage.getItem("activeWardRequest");
        if (!rawData) { 
            router.push("/hospital"); 
            return; 
        }
        const parsed = JSON.parse(rawData);
        setWardInfo(parsed);
        // Auto fetch beds on load
        fetchBeds(parsed);
        // Fetch doctors and services from UserAPI
        fetchDoctorsAndServices(parsed.hospitalId);
    }, [router]);

    const fetchBeds = async (info = wardInfo) => {
        if (!info) return;
        setLoading(true);
        try {
            const response = await UserAPI.checkBedAvalability({
                hospitalId: info.hospitalId,
                wardId: info.wardId,
                startDate,
                endDate
            });
            if (response.success) {
                setBeds(response.data);
                setSelectedBed(null); // Reset selection on new search
            }
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchDoctorsAndServices = async (hospitalId) => {
        if (!hospitalId) return;
        try {
            const [docRes, srvRes] = await Promise.allSettled([
                UserAPI.getHospitalDoctors(hospitalId),
                UserAPI.getHospitalServices(hospitalId)
            ]);

            if (docRes.status === "fulfilled" && docRes.value?.success) {
                setDoctors(docRes.value.data || []);
            }
            if (srvRes.status === "fulfilled" && srvRes.value?.success) {
                setServices(srvRes.value.data || []);
            }
        } catch (err) {
            console.error("Error fetching doctors/services:", err);
        }
    };

    // Toggle special services selection
    const handleToggleService = (service) => {
        setSelectedServices((prev) => {
            const exists = prev.some(s => s._id === service._id);
            if (exists) {
                return prev.filter(s => s._id !== service._id);
            } else {
                return [...prev, {
                    _id: service._id,
                    serviceName: service.serviceName,
                    price: Number(service.price) || 0
                }];
            }
        });
    };

    // Total Calculation including Bed + Doctor + Services
    const grandTotal = useMemo(() => {
        const bedTotal = selectedBed ? selectedBed.pricePerDay * totalDays : 0;
        const doctorFee = Number(selectedDoctor?.fees?.clinic || selectedDoctor?.fees?.opd || 0);
        const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        return bedTotal + doctorFee + servicesTotal;
    }, [selectedBed, totalDays, selectedDoctor, selectedServices]);

    const confirmBooking = () => {
        if (!selectedBed) return;
        const bedTotal = selectedBed.pricePerDay * totalDays;
        const doctorFee = Number(selectedDoctor?.fees?.clinic || selectedDoctor?.fees?.opd || 0);
        const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

        sessionStorage.setItem("activeBooking", JSON.stringify({
            ...wardInfo, 
            startDate, 
            endDate, 
            totalDays,
            bedId: selectedBed._id, 
            bedNumber: selectedBed.bedNumber,
            pricePerDay: selectedBed.pricePerDay,
            bedTotal,
            doctorId: selectedDoctor?._id || null,
            doctorDetails: selectedDoctor || null,
            doctorFee,
         // In EnhancedBedDashboard.jsx -> confirmBooking():
specialServices: selectedServices.map(s => ({
    _id: s._id || s.serviceId,          // 👈 Ye add karein
    serviceId: s._id || s.serviceId,    // 👈 Ye add karein
    serviceName: s.serviceName,
    price: Number(s.price)
})),
            servicesTotal,
            totalPrice: grandTotal
        }));
        router.push("/hospital/checkout");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            
            {/* --- HEADER --- */}
            <div className="bg-white border-b sticky top-0 z-30 px-4 py-3 md:px-8 md:py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()} 
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <FaChevronLeft className="text-slate-600" />
                        </button>
                        <div>
                            <h2 className="text-sm md:text-lg font-black text-slate-800 flex items-center gap-2">
                                <FaHospital className="text-blue-500" />
                                {wardInfo?.hospitalName || "Hospital Ward"}
                            </h2>
                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                                {wardInfo?.wardName || "Standard Ward"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                
                {/* --- 1. ATTENDING SPECIALIST DOCTOR SECTION (FIRST) --- */}
                {doctors.length > 0 && (
                    <div className="mb-8 md:mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                                    <FaUserMd className="text-blue-500 text-lg md:text-xl" /> Select Specialist Doctor
                                </h2>
                                <p className="text-slate-500 text-xs md:text-sm font-medium">
                                    Optional: Choose an attending specialist for your admission
                                </p>
                            </div>
                            {selectedDoctor && (
                                <button 
                                    onClick={() => setSelectedDoctor(null)}
                                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                                >
                                    Clear Doctor
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                            {doctors.map((doc) => {
                                const isSelected = selectedDoctor?._id === doc._id;
                                const docFee = doc.fees?.clinic || doc.fees?.opd || 0;

                                return (
                                    <div
                                        key={doc._id}
                                        onClick={() => setSelectedDoctor(isSelected ? null : doc)}
                                        className={`relative overflow-hidden group p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 cursor-pointer bg-white
                                            ${isSelected 
                                                ? "!border-blue-600 ring-4 ring-blue-500/10 shadow-lg" 
                                                : "border-white hover:border-blue-400 shadow-sm hover:shadow-xl"}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-xs shrink-0">
                                                {doc.name?.charAt(0) || "D"}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm md:text-base font-black text-slate-800 truncate">Dr. {doc.name}</h3>
                                                <p className="text-[10px] md:text-xs text-slate-500 font-bold truncate">{doc.speciality || "Specialist"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-slate-500 font-bold text-xs md:text-sm pt-2 border-t border-slate-100">
                                            <FaRupeeSign className="text-[10px] md:text-xs" /> {docFee}
                                            <span className="text-[9px] md:text-[10px] ml-1 opacity-60 font-medium">consultation fee</span>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- 2. SPECIAL ADD-ON SERVICES SECTION (SECOND) --- */}
                {services.length > 0 && (
                    <div className="mb-8 md:mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                                    <FaConciergeBell className="text-blue-500 text-lg md:text-xl" /> Hospital Add-on Services
                                </h2>
                                <p className="text-slate-500 text-xs md:text-sm font-medium">
                                    Optional: Choose special facilities or attendant services
                                </p>
                            </div>
                            {selectedServices.length > 0 && (
                                <button 
                                    onClick={() => setSelectedServices([])}
                                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                                >
                                    Clear Services
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                            {services.map((srv) => {
                                const isSelected = selectedServices.some(s => s._id === srv._id);

                                return (
                                    <div
                                        key={srv._id}
                                        onClick={() => handleToggleService(srv)}
                                        className={`relative overflow-hidden group p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 cursor-pointer bg-white
                                            ${isSelected 
                                                ? "!border-blue-600 ring-4 ring-blue-500/10 shadow-lg" 
                                                : "border-white hover:border-blue-400 shadow-sm hover:shadow-xl"}`}
                                    >
                                        <h3 className="text-sm md:text-base font-black text-slate-800 mb-1">{srv.serviceName}</h3>
                                        {srv.description && (
                                            <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-3 line-clamp-2">{srv.description}</p>
                                        )}

                                        <div className="flex items-center text-slate-500 font-bold text-xs md:text-sm pt-2 border-t border-slate-100">
                                            <FaRupeeSign className="text-[10px] md:text-xs" /> {srv.price}
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- 3. DATE PICKER SECTION (THEN SLOTS CONFIG) --- */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 mb-6 md:mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="mb-2 lg:mb-0">
                            <h1 className="text-xl md:text-2xl font-black text-slate-800">Available Beds</h1>
                            <p className="text-slate-500 text-xs md:text-sm font-medium">
                                Showing availability for <span className="text-blue-600 font-black">{totalDays} Days</span>
                            </p>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-3">
                            <div className="flex flex-1 items-center bg-slate-50 rounded-xl border border-slate-200 divide-x divide-slate-200">
                                <div className="flex-1 flex items-center gap-2 px-3 py-3">
                                    <FaCalendarAlt className="text-blue-500 shrink-0 text-sm" />
                                    <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)} 
                                        className="bg-transparent font-bold text-xs md:text-sm outline-none w-full" 
                                    />
                                </div>
                                <div className="flex-1 flex items-center gap-2 px-3 py-3">
                                    <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)} 
                                        className="bg-transparent font-bold text-xs md:text-sm outline-none w-full" 
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => fetchBeds()} 
                                className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                Check
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- 4. BEDS (SLOTS) GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mb-8 md:mb-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-32 md:h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : beds.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mb-8 md:mb-12">
                        {beds.map((bed) => (
                            <div 
                                key={bed._id}
                                onClick={() => bed.status === "Available" && setSelectedBed(bed)}
                                className={`relative overflow-hidden group p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 cursor-pointer 
                                    ${bed.status === "Available" 
                                        ? "bg-white border-white hover:border-emerald-400 hover:shadow-xl" 
                                        : "bg-slate-50 border-transparent opacity-60 cursor-not-allowed"}
                                    ${selectedBed?._id === bed._id ? "!border-blue-600 ring-4 ring-blue-500/10 shadow-lg" : "shadow-sm"}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3 md:mb-5">
                                    <div className={`h-2 w-2 rounded-full ${bed.status === 'Available' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        bed.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {bed.status}
                                    </span>
                                </div>

                                <h3 className="text-xl md:text-3xl font-black text-slate-800 mb-1 leading-none">{bed.bedNumber}</h3>
                                <div className="flex items-center text-slate-500 font-bold text-xs md:text-sm">
                                    <FaRupeeSign className="text-[10px] md:text-xs" /> {bed.pricePerDay} 
                                    <span className="text-[9px] md:text-[10px] ml-1 opacity-60 font-medium">/ day</span>
                                </div>

                                {selectedBed?._id === bed._id && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mb-8 md:mb-12">
                        <p className="text-slate-400 font-bold">No beds available for the selected dates.</p>
                    </div>
                )}

            </div>

            {/* --- FLOATING ACTION BAR --- */}
            {selectedBed && (
                <div className="fixed bottom-4 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-[100]">
                    <div className="bg-slate-900 text-white px-5 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-full shadow-2xl flex items-center justify-between md:gap-12 animate-in fade-in slide-in-from-bottom-10 duration-500">
                        <div>
                            <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                                Stay Total {selectedDoctor || selectedServices.length > 0 ? "(With Add-ons)" : ""}
                            </p>
                            <p className="font-black text-lg md:text-2xl flex items-center gap-1 leading-none">
                                <FaRupeeSign className="text-sm md:text-lg" /> 
                                {grandTotal}
                            </p>
                        </div>
                        <button 
                            onClick={confirmBooking} 
                            className="bg-[#08B36A] hover:bg-emerald-400 px-6 py-3 md:px-10 md:py-4 rounded-xl md:rounded-full font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/20 cursor-pointer"
                        >
                            Book Now <FaArrowRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}