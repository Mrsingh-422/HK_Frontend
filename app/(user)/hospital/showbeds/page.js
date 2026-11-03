"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    FaRupeeSign, FaArrowRight, FaCalendarAlt, FaChevronLeft, FaHospital,
    FaUserMd, FaConciergeBell, FaBed, FaLungs, FaCheck, FaSpinner
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function EnhancedBedDashboard() {
    const router = useRouter();

    const [wardInfo, setWardInfo] = useState(null);
    const [beds, setBeds] = useState([]);
    const [bedCounts, setBedCounts] = useState({ totalBeds: 0, availableBedsCount: 0 });
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

    // Ensure Check-Out date is strictly at least 1 day after Check-In
    const ensureValidStayDates = (startVal, endVal) => {
        const start = new Date(startVal);
        const end = new Date(endVal);

        if (isNaN(end.getTime()) || end <= start) {
            const nextDay = new Date(start);
            nextDay.setDate(nextDay.getDate() + 1);
            return {
                cleanStart: startVal,
                cleanEnd: nextDay.toISOString().split('T')[0]
            };
        }
        return { cleanStart: startVal, cleanEnd: endVal };
    };

    // Inclusive stay calculation (+1 extra day added to bed price)
    const totalDays = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // 👈 Adds 1 extra day
        return diffDays > 0 ? diffDays : 1;
    }, [startDate, endDate]);

    // 1. Initial Load & Session Validation
    useEffect(() => {
        const rawData = sessionStorage.getItem("activeWardRequest");
        if (!rawData) { 
            router.push("/hospital"); 
            return; 
        }

        try {
            const parsed = JSON.parse(rawData);
            setWardInfo(parsed);
            
            // Console Ward Info from Session
            console.log("📥 [ACTIVE WARD REQUEST SESSION]:", parsed);

            // Initial Fetch
            fetchBeds(parsed, startDate, endDate);
            fetchDoctorsAndServices(parsed.hospitalId);
        } catch (e) {
            console.error("Invalid ward request session:", e);
            router.push("/hospital");
        }
    }, [router]);

    // 2. Fetch Bed Availability (POST /user/hospital/check-availability)
    const fetchBeds = async (info = wardInfo, sDate = startDate, eDate = endDate) => {
        if (!info?.hospitalId || !info?.wardId) return;

        const { cleanStart, cleanEnd } = ensureValidStayDates(sDate, eDate);

        setLoading(true);
        try {
            const payload = {
                hospitalId: String(info.hospitalId),
                wardId: String(info.wardId),
                startDate: cleanStart,
                endDate: cleanEnd
            };

            // 🔍 CONSOLE LOG: Exact Payload sent to Bed Availability API
            console.group("🚀 [POST -> checkBedAvailability API Payload]");
            console.log("Endpoint: /user/hospital/check-availability");
            console.log("Payload:", payload);
            console.groupEnd();

            const apiFn = UserAPI.checkBedAvailability || UserAPI.checkBedAvalability;
            const response = await apiFn(payload);

            console.log("📥 [RESPONSE <- checkBedAvailability]:", response);

            if (response?.success) {
                const bedList = response.data || [];
                setBeds(bedList);
                setBedCounts({
                    totalBeds: response.totalBeds ?? bedList.length,
                    availableBedsCount: response.availableBedsCount ?? bedList.filter(b => b.isAvailable || b.status === "Available").length
                });
                setSelectedBed(null); // Reset active selection on date change
            }
        } catch (err) { 
            console.error("Bed availability fetch error:", err); 
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
            const exists = prev.some(s => s._id === service._id || s.serviceId === service._id);
            if (exists) {
                return prev.filter(s => (s._id || s.serviceId) !== (service._id || service.serviceId));
            } else {
                return [...prev, {
                    _id: service._id || service.serviceId,
                    serviceId: service._id || service.serviceId,
                    serviceName: service.serviceName,
                    price: Number(service.price) || 0
                }];
            }
        });
    };

    // Grand Total: (Bed Stay × (Days + 1)) + Attending Doctor (FREE = ₹0) + Add-on Services
    const grandTotal = useMemo(() => {
        const bedTotal = selectedBed ? selectedBed.pricePerDay * totalDays : 0;
        const doctorFee = 0; // Attending specialist is 100% Free / Included
        const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        return bedTotal + doctorFee + servicesTotal;
    }, [selectedBed, totalDays, selectedServices]);

    // Handle Date Change with automatic validation
    const handleDateChange = (newStart, newEnd) => {
        const { cleanStart, cleanEnd } = ensureValidStayDates(newStart, newEnd);
        setStartDate(cleanStart);
        setEndDate(cleanEnd);
        fetchBeds(wardInfo, cleanStart, cleanEnd);
    };

    // 3. Save Synchronized Booking Payload & Route to Checkout
    const confirmBooking = () => {
        if (!selectedBed || !wardInfo) return;

        const { cleanStart, cleanEnd } = ensureValidStayDates(startDate, endDate);
        const bedTotal = selectedBed.pricePerDay * totalDays;
        const servicesTotal = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

        // Standardized session object synchronized with IpdCheckout
        const bookingPayload = {
            hospitalId: String(wardInfo.hospitalId),
            hospitalName: wardInfo.hospitalName || "Hospital Facility",
            wardId: String(wardInfo.wardId),
            wardName: wardInfo.wardName || "Inpatient Ward",
            wardType: wardInfo.wardType || "Standard",
            startDate: cleanStart,
            endDate: cleanEnd,
            totalDays, // Pass the inclusive (days + 1) to checkout
            bedId: String(selectedBed._id || selectedBed.bedId),
            bedNumber: String(selectedBed.bedNumber),
            pricePerDay: Number(selectedBed.pricePerDay),
            isVentilatorAvailable: Boolean(selectedBed.isVentilatorAvailable),
            bedTotal,
            doctorId: selectedDoctor?._id ? String(selectedDoctor._id) : null,
            doctorDetails: selectedDoctor || null,
            doctorFee: 0, // FREE
            specialServices: selectedServices.map(s => ({
                _id: String(s._id || s.serviceId),
                serviceId: String(s._id || s.serviceId),
                serviceName: s.serviceName,
                price: Number(s.price) || 0
            })),
            servicesTotal,
            totalPrice: grandTotal
        };

        // 🔍 CONSOLE LOG: Exact Payload being forwarded to Checkout
        console.group("🏥 [PROCEEDING TO CHECKOUT - BOOKING PAYLOAD]");
        console.log("Destination: /hospital/checkout");
        console.log("Full Object:", bookingPayload);
        console.table({
            "Hospital": bookingPayload.hospitalName,
            "Ward": bookingPayload.wardName,
            "Bed Number": bookingPayload.bedNumber,
            "Stay (Days)": bookingPayload.totalDays,
            "Check-In": bookingPayload.startDate,
            "Check-Out": bookingPayload.endDate,
            "Doctor": selectedDoctor ? `Dr. ${selectedDoctor.name}` : "None (Free)",
            "Services Count": selectedServices.length,
            "Bed Total (₹)": bookingPayload.bedTotal,
            "Services Total (₹)": bookingPayload.servicesTotal,
            "Grand Total (₹)": bookingPayload.totalPrice
        });
        console.groupEnd();

        sessionStorage.setItem("activeBooking", JSON.stringify(bookingPayload));
        sessionStorage.setItem("lastActiveCheckoutType", "IPD");
        router.push("/hospital/checkout");
    };

    const getStatusBadge = (status, isAvailable) => {
        const available = isAvailable ?? (status === "Available");
        if (available) {
            return {
                label: "Available",
                cls: "bg-emerald-50 text-[#08B36A] border border-[#08B36A]/20"
            };
        }
        switch (status) {
            case "Occupied":
                return { label: "Occupied", cls: "bg-rose-50 text-rose-600 border border-rose-200" };
            case "Reserved":
                return { label: "Reserved", cls: "bg-amber-50 text-amber-700 border border-amber-200" };
            case "Maintenance":
                return { label: "Maintenance", cls: "bg-slate-100 text-slate-500 border border-slate-200" };
            default:
                return { label: status || "Unavailable", cls: "bg-slate-100 text-slate-500 border border-slate-200" };
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-36 font-sans text-slate-900 antialiased">
            
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3 md:px-8 md:py-4 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()} 
                            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <div>
                            <h2 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2">
                                <FaHospital className="text-[#08B36A]" />
                                {wardInfo?.hospitalName || "Hospital Facility"}
                            </h2>
                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                                {wardInfo?.wardName || "Inpatient Ward"} &bull; {wardInfo?.wardType || "Standard"}
                            </p>
                        </div>
                    </div>

                    {/* Live Bed Counter Badge */}
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#08B36A] animate-pulse" />
                            {bedCounts.availableBedsCount} of {bedCounts.totalBeds} Beds Vacant
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                
                {/* 1. ATTENDING SPECIALIST DOCTOR SECTION (100% FREE) */}
                {doctors.length > 0 && (
                    <div className="mb-8 md:mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                                        <FaUserMd className="text-[#08B36A]" /> Select Attending Specialist
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/20">
                                        Free Consultation
                                    </span>
                                </div>
                                <p className="text-slate-500 text-xs font-medium mt-0.5">
                                    Assign an attending doctor for your inpatient stay &mdash; <strong className="text-[#08B36A]">100% Complimentary with Bed Admission</strong>
                                </p>
                            </div>
                            {selectedDoctor && (
                                <button 
                                    onClick={() => setSelectedDoctor(null)}
                                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                                >
                                    Remove Selection
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {doctors.map((doc) => {
                                const isSelected = selectedDoctor?._id === doc._id;

                                return (
                                    <div
                                        key={doc._id}
                                        onClick={() => setSelectedDoctor(isSelected ? null : doc)}
                                        className={`relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white
                                            ${isSelected 
                                                ? "border-[#08B36A] ring-4 ring-[#08B36A]/10 shadow-md bg-emerald-50/20" 
                                                : "border-slate-200 hover:border-[#08B36A]/40 shadow-2xs hover:shadow-sm"}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 border border-slate-200/60">
                                                {doc.name?.charAt(0) || "D"}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-slate-900 truncate">Dr. {doc.name}</h3>
                                                <p className="text-[11px] text-[#08B36A] font-bold truncate mt-0.5">{doc.speciality || "Specialist"}</p>
                                            </div>
                                        </div>

                                        {/* FREE DOCTOR BADGE */}
                                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-2 py-0.5 bg-[#08B36A]/10 text-[#08B36A] rounded-md font-black text-[10px] uppercase tracking-wider">
                                                    FREE
                                                </span>
                                                <span className="text-[10px] text-slate-300 line-through font-semibold">₹500</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold">Included in Stay</span>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-0 right-0 bg-[#08B36A] text-white p-1 rounded-bl-lg">
                                                <FaCheck size={9} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. SPECIAL ADD-ON SERVICES SECTION */}
                {services.length > 0 && (
                    <div className="mb-8 md:mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                                    <FaConciergeBell className="text-[#08B36A]" /> Hospital Add-on Facilities
                                </h2>
                                <p className="text-slate-500 text-xs font-medium mt-0.5">
                                    Optional: Add special nursing care or attendant facilities
                                </p>
                            </div>
                            {selectedServices.length > 0 && (
                                <button 
                                    onClick={() => setSelectedServices([])}
                                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                                >
                                    Clear Services
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {services.map((srv) => {
                                const isSelected = selectedServices.some(s => (s._id || s.serviceId) === (srv._id || srv.serviceId));

                                return (
                                    <div
                                        key={srv._id || srv.serviceId}
                                        onClick={() => handleToggleService(srv)}
                                        className={`relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white
                                            ${isSelected 
                                                ? "border-[#08B36A] ring-4 ring-[#08B36A]/10 shadow-md bg-emerald-50/20" 
                                                : "border-slate-200 hover:border-[#08B36A]/40 shadow-2xs hover:shadow-sm"}`}
                                    >
                                        <h3 className="text-sm font-black text-slate-900 mb-1">{srv.serviceName}</h3>
                                        {srv.description && (
                                            <p className="text-[11px] text-slate-400 font-medium mb-3 line-clamp-2 leading-relaxed">{srv.description}</p>
                                        )}

                                        <div className="flex items-center text-slate-700 font-black text-xs pt-2 border-t border-slate-100">
                                            <FaRupeeSign className="text-[10px]" /> {srv.price}
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-0 right-0 bg-[#08B36A] text-white p-1 rounded-bl-lg">
                                                <FaCheck size={9} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. DATE RANGE CHECKER SECTION */}
                <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">Check Live Bed Availability</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#08B36A]/10 text-[#08B36A]">
                                    {totalDays} Days Charged (Inclusive)
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">
                                Select Check-In &amp; Check-Out dates to check real-time bed occupancy in {wardInfo?.wardName}.
                            </p>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 divide-x divide-slate-200">
                                <div className="flex items-center gap-2 px-3.5 py-2.5">
                                    <FaCalendarAlt className="text-[#08B36A] shrink-0 text-xs" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-400 leading-none mb-1">Check-In</span>
                                        <input 
                                            type="date" 
                                            value={startDate} 
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => handleDateChange(e.target.value, endDate)} 
                                            className="bg-transparent font-black text-xs outline-none text-slate-800 cursor-pointer" 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3.5 py-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-400 leading-none mb-1">Check-Out</span>
                                        <input 
                                            type="date" 
                                            value={endDate} 
                                            min={startDate}
                                            onChange={(e) => handleDateChange(startDate, e.target.value)} 
                                            className="bg-transparent font-black text-xs outline-none text-slate-800 cursor-pointer" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => fetchBeds(wardInfo, startDate, endDate)} 
                                disabled={loading}
                                className="bg-[#08B36A] hover:bg-[#069959] text-white px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#08B36A]/20 active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Check Availability"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. BEDS GRID */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 mb-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <div key={i} className="h-36 bg-white rounded-3xl animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : beds.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 mb-8">
                        {beds.map((bed) => {
                            const isAvailable = bed.isAvailable ?? (bed.status === "Available");
                            const isSelected = selectedBed?._id === bed._id;
                            const badge = getStatusBadge(bed.status, isAvailable);

                            return (
                                <div 
                                    key={bed._id}
                                    onClick={() => isAvailable && setSelectedBed(bed)}
                                    className={`relative overflow-hidden group p-4 md:p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                                        ${isAvailable 
                                            ? "bg-white border-slate-200 hover:border-[#08B36A] hover:shadow-lg" 
                                            : "bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed"}
                                        ${isSelected ? "!border-[#08B36A] ring-4 ring-[#08B36A]/15 shadow-md bg-emerald-50/25" : "shadow-2xs"}
                                    `}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#08B36A] animate-pulse' : 'bg-rose-500'}`} />
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            {/* Ventilator Indicator */}
                                            {bed.isVentilatorAvailable && (
                                                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold" title="Ventilator Support Available">
                                                    <FaLungs />
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1 leading-none tracking-tight">
                                            {bed.bedNumber}
                                        </h3>

                                        {bed.isVentilatorAvailable && (
                                            <span className="text-[10px] font-bold text-teal-700 block mb-2">
                                                + Ventilator Attached
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center text-slate-800 font-black text-xs md:text-sm pt-2.5 border-t border-slate-100 mt-3">
                                        <FaRupeeSign className="text-[10px]" /> {bed.pricePerDay} 
                                        <span className="text-[10px] ml-1 text-slate-400 font-medium">/ day</span>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-0 right-0 bg-[#08B36A] text-white p-1.5 rounded-bl-xl shadow-xs">
                                            <FaCheck size={10} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mb-8">
                        <FaBed className="mx-auto text-4xl text-slate-300 mb-2" />
                        <h4 className="text-sm font-bold text-slate-700">No beds found</h4>
                        <p className="text-slate-400 text-xs mt-1">No beds are available for the selected dates in this ward.</p>
                    </div>
                )}

            </div>

            {/* --- FLOATING ACTION BAR --- */}
            {selectedBed && (
                <div className="fixed bottom-4 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-[100]">
                    <div className="bg-slate-950 text-white px-5 py-4 md:px-9 md:py-4.5 rounded-2xl md:rounded-full shadow-2xl flex items-center justify-between md:gap-10 border border-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-300">
                        <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                                {selectedBed.bedNumber} &bull; {totalDays} Days Charged (Inclusive) {selectedDoctor ? "+ Specialist (Free)" : ""} {selectedServices.length > 0 ? "+ Facilities" : ""}
                            </p>
                            <p className="font-black text-lg md:text-2xl flex items-center gap-0.5 leading-none mt-0.5 text-white">
                                <FaRupeeSign className="text-sm" /> 
                                {grandTotal}
                            </p>
                        </div>
                        <button 
                            onClick={confirmBooking} 
                            className="bg-[#08B36A] hover:bg-[#069959] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-xl md:rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#08B36A]/25 cursor-pointer shrink-0"
                        >
                            <span>Proceed to Admission</span>
                            <FaArrowRight size={11} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}