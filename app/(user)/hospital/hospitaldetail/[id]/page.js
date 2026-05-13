"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    FaArrowLeft, FaMapMarkerAlt, FaHospital, FaBed, 
    FaUserMd, FaStar, FaBriefcaseMedical, FaPhoneAlt,
    FaRegEnvelope, FaCheckCircle, FaStethoscope, FaChevronRight
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HospitalDetailPage() {
    const { id } = useParams(); // Hospital ID from URL
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getHospitalDetail(id);
                if (response.success) setData(response.data);
            } catch (error) {
                console.error("Error fetching hospital details:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    // HANDLER: Save ward data to Session Storage and Navigate
    const handleWardClick = (ward) => {
        const wardPayload = {
            hospitalId: id,
            hospitalName: data.hospital.name,
            wardId: ward._id,
            wardName: ward.name,
            wardType: ward.type,
            availableBeds: ward.availableBeds,
            totalBeds: ward.totalBeds,
            timestamp: new Date().getTime() // Useful for tracking data freshness
        };

        // Store the payload as a string in sessionStorage
        sessionStorage.setItem("activeWardRequest", JSON.stringify(wardPayload));
        
        // Navigate to the beds display page
        router.push("/hospital/showbeds");
    };

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1586773860418-d3b97998c637?auto=format&fit=crop&q=80&w=1000";
        const cleanPath = path.toString().replace(/^public\//, "").replace(/^\//, "");
        return `${BASE_URL}/${cleanPath}`;
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Syncing Hospital Data...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Hospital Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-semibold underline">Go Back</button>
            </div>
        </div>
    );

    const { hospital, wards, doctors, services } = data;

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-32">
            
            {/* STICKY HEADER */}
            <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="group flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-all font-semibold"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                        <span>Back to Search</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-widest border border-emerald-100">
                            {hospital.profileStatus || "Verified Facility"}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-8">
                
                {/* HERO SECTION */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-6">
                                <FaHospital className="text-sm" /> Institutional Profile
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                                {hospital.name}
                            </h1>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                                    <p className="font-medium text-lg leading-relaxed">{hospital.address}, {hospital.city}, {hospital.state}</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors px-5 py-3 rounded-2xl border border-slate-100 text-sm font-bold">
                                        <FaPhoneAlt className="text-xs" /> {hospital.phone}
                                    </a>
                                    <a href={`mailto:${hospital.email}`} className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors px-5 py-3 rounded-2xl border border-slate-100 text-sm font-bold">
                                        <FaRegEnvelope className="text-xs" /> {hospital.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-[3rem] blur-2xl opacity-30"></div>
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
                                <img 
                                    src={getImageUrl(hospital.hospitalImage?.[0])} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                                    alt="Hospital Exterior" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CAPACITY DASHBOARD */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Total Beds", val: wards.reduce((a, b) => a + b.availableBeds, 0), icon: <FaBed />, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Wards", val: wards.length, icon: <FaHospital />, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Specialists", val: doctors.length, icon: <FaUserMd />, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Services", val: services.length, icon: <FaStethoscope />, color: "text-orange-600", bg: "bg-orange-50" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900 leading-none mb-1">{stat.val}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* WARD SELECTION SECTION */}
                <section className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900">Bed Availability</h3>
                            <p className="text-slate-500 font-medium">Select a department below to view specific bed locations.</p>
                        </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wards.map((ward) => (
                            <div 
                                key={ward._id} 
                                onClick={() => handleWardClick(ward)}
                                className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <span className="px-4 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-tighter rounded-full">
                                        {ward.type}
                                    </span>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${ward.availableBeds > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${ward.availableBeds > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                        {ward.availableBeds > 0 ? 'STATUS: OPEN' : 'STATUS: FULL'}
                                    </div>
                                </div>

                                <h4 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                                    {ward.name}
                                    <FaChevronRight className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </h4>
                                
                                <div className="flex items-end gap-2 mb-6">
                                    <span className="text-5xl font-black tracking-tighter text-slate-900">{ward.availableBeds}</span>
                                    <span className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Available</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 ${ward.availableBeds > (ward.totalBeds/2) ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                                            style={{ width: `${(ward.availableBeds / ward.totalBeds) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Capacity</span>
                                        <span>{ward.totalBeds} Total Beds</span>
                                    </div>
                                </div>

                                {/* Hover Hint */}
                                <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 py-2 text-center text-white text-[10px] font-black uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform">
                                    View Detailed Bed Map
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DOCTORS GRID */}
                <section className="mb-20">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Medical Specialists</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {doctors.map((doc) => (
                            <div key={doc._id} className="group cursor-default">
                                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all border-2 border-transparent group-hover:border-emerald-200">
                                    <img 
                                        src={getImageUrl(doc.profileImage)} 
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0 grayscale-[0.3]" 
                                        alt={doc.name} 
                                    />
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm border border-slate-100">
                                        <FaStar className="text-yellow-400 text-[10px]" />
                                        <span className="text-[10px] font-bold">{doc.averageRating || '4.8'}</span>
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors leading-tight">Dr. {doc.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{doc.speciality}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SERVICES SECTION */}
                <section>
                    <h3 className="text-2xl font-bold text-slate-900 mb-8">Offered Services</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <div key={service._id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 hover:shadow-xl transition-all group">
                                <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 border-2 border-slate-50 group-hover:border-emerald-100 transition-colors">
                                    <img src={getImageUrl(service.image)} className="w-full h-full object-cover" alt={service.serviceName} />
                                </div>
                                <div className="flex-1 pr-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors uppercase text-xs tracking-tight">{service.serviceName}</h4>
                                        <span className="text-emerald-600 font-black text-sm">₹{service.price}</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{service.description}</p>
                                    <div className="inline-flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                                        <FaCheckCircle className="text-[10px]" /> Instant Booking
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}