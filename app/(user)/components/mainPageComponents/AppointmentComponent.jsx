"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaStar, 
  FaUserMd, 
  FaPlus,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaClock,
  FaSpinner
} from "react-icons/fa"; 
import UserAPI from "@/app/services/UserAPI";

export default function AppointmentComponent() {
    const router = useRouter();
    const scrollRef = useRef(null);
    
    // --- API STATES ---
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // HELPER: Formats the image URL by removing 'public/' and prepending the base URL
    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/400x500?text=No+Image";
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '');
        const BASE_URL = 'http://192.168.1.26:5002';
        return `${BASE_URL}/${cleanPath}`;
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                let coordsPayload = {};
                const storedCoords = localStorage.getItem('userCoords');
                
                if (storedCoords) {
                    try {
                        const parsedCoords = JSON.parse(storedCoords);
                        coordsPayload = {
                            userLat: parsedCoords.lat?.toString(),
                            userLng: parsedCoords.lng?.toString()
                        };
                    } catch (e) {
                        console.error("Error parsing userCoords", e);
                    }
                }

                const docRes = await UserAPI.getDoctorsList(coordsPayload);

                if (docRes.success) {
                    const doctorData = Array.isArray(docRes.data) 
                        ? docRes.data 
                        : (docRes.data.profile ? [docRes.data.profile] : []);
                    
                    // Taking first 10 for the horizontal scroll
                    setDoctors(doctorData);
                }
            } catch (error) {
                console.error("Initialization Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    const handleDoctorClick = (id) => {
        router.push(`/drappointment/doctordetail/${id}`);
    };

    return (
        <section className="py-8 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* --- HEADER --- */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="h-1 w-8 bg-[#08B36A] rounded-full"></span>
                             <span className="text-[10px] font-bold text-[#08B36A] uppercase tracking-[2px]">Expert Care</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Book an Appointment
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex gap-2">
                            <button onClick={() => scroll('left')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-sm">
                                <FaChevronLeft size={14}/>
                            </button>
                            <button onClick={() => scroll('right')} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-sm">
                                <FaChevronRight size={14}/>
                            </button>
                        </div>
                        <button 
                            onClick={() => router.push("/drappointment/seealldoctors")}
                            className="text-xs font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-[#08B36A] transition-all cursor-pointer shadow-lg shadow-slate-200 uppercase tracking-wider"
                        >
                            View All
                        </button>
                    </div>
                </div>

                {/* --- HORIZONTAL SCROLL --- */}
                <div 
                    ref={scrollRef}
                    className="flex flex-nowrap overflow-x-auto gap-5 pb-8 scrollbar-hide snap-x snap-mandatory pt-2 min-h-[400px]"
                >
                    {loading ? (
                        <div className="w-full flex items-center justify-center py-20">
                            <FaSpinner className="animate-spin text-[#08B36A]" size={30} />
                        </div>
                    ) : doctors.length > 0 ? (
                        doctors.map((doc) => (
                            <div
                                key={doc._id}
                                onClick={() => handleDoctorClick(doc._id)}
                                className="flex-shrink-0 w-[240px] md:w-[280px] snap-start group bg-white border border-slate-100 rounded-[24px] p-4 flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 relative cursor-pointer"
                            >
                                {/* Experience Badge */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-[#08B36A] text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase">
                                        {doc.experienceYears ? `${doc.experienceYears}+ Years` : "Expert"}
                                    </span>
                                </div>

                                {/* Image Section */}
                                <div className="relative mb-4 aspect-[4/5] rounded-2xl bg-[#F1F5F9] overflow-hidden">
                                    <img
                                        src={getImageUrl(doc.profileImage)}
                                        alt={doc.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=No+Image"; }}
                                    />
                                    {/* Quick Rating Overlay */}
                                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white">
                                        <FaStar className="text-amber-500" size={10} />
                                        <span className="text-[10px] font-black text-slate-900">{doc.averageRating || "5.0"}</span>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-0.5 group-hover:text-[#08B36A] transition-colors">
                                        {doc.name}
                                    </h3>
                                    <p className="text-[11px] text-[#08B36A] font-bold uppercase tracking-wider mb-2">
                                        {doc.speciality}
                                    </p>
                                    
                                    <div className="space-y-1.5 mb-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium">
                                            <FaMapMarkerAlt className="text-slate-300" />
                                            <span className="truncate">{doc.city || "Mohali"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium">
                                            <FaClock className="text-slate-300" />
                                            <span>Available Today</span>
                                        </div>
                                    </div>

                                    {/* Pricing & Book Button */}
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                                        <div className="flex flex-col">
                                            {/* Logic: If MRP is not provided, we just show fee */}
                                            <span className="text-[10px] text-slate-400 line-through font-medium leading-none mb-1">₹{doc.fees?.clinic + 200 || 1000}</span>
                                            <span className="text-lg font-black text-slate-900 leading-none">₹{doc.fees?.clinic || 0}</span>
                                        </div>

                                        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-[#08B36A] transition-all active:scale-90 shadow-lg shadow-slate-200 cursor-pointer">
                                            BOOK NOW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex items-center justify-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                            No doctors found nearby.
                        </div>
                    )}
                </div>

                {/* --- TRUST BAR --- */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TrustItem 
                        icon={<FaUserMd className="text-emerald-600" size={20}/>} 
                        title="Verified Doctors" 
                        desc="Highly experienced specialists" 
                    />
                    <TrustItem 
                        icon={<FaCalendarCheck className="text-emerald-600" size={20}/>} 
                        title="Instant Booking" 
                        desc="No waiting in long queues" 
                    />
                    <TrustItem 
                        icon={<FaClock className="text-emerald-600" size={20}/>} 
                        title="Flexible Slots" 
                        desc="Morning, Afternoon & Evening" 
                    />
                </div>

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </section>
    );
}

function TrustItem({ icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}