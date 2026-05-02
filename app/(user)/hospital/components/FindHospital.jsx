"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import {
    FaStar, FaMapMarkerAlt, FaPhoneAlt, FaHospital, FaArrowRight, FaBed, FaUserMd
} from "react-icons/fa";
import { HOSPITAL_DATA } from "@/app/constants/constants";
import HospitalDetailsModal from "./otherComponents/HospitalDetailsModal";
import { useGlobalContext } from "@/app/context/GlobalContext";

function FindHospital() {
    const router = useRouter();
    const { getSingleHospitalPageData } = useGlobalContext();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                await getSingleHospitalPageData();
            } catch (err) {
                console.error("Backend failed");
            }
        };
        fetchContent();
    }, [getSingleHospitalPageData]);

    const handleSelectHospital = (hospital) => {
        setSelectedHospital(hospital);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedHospital(null), 300);
    };

    const processedHospitals = useMemo(() => {
        return HOSPITAL_DATA.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const hasMore = processedHospitals.length > 6;

    return (
        <div className="min-h-screen py-6 md:py-12 px-3 sm:px-6 lg:px-8 font-sans bg-[#f8fafc]">

            <HospitalDetailsModal
                isOpen={isModalOpen}
                hospital={selectedHospital}
                onClose={closeModal}
            />

            <div className="max-w-7xl mx-auto">
                
                {/* ================= HOSPITAL GRID ================= */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {processedHospitals.length > 0 ? (
                        processedHospitals.slice(0, 6).map((hospital) => (
                            <div 
                                key={hospital.id} 
                                className="bg-white rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col"
                            >
                                {/* Image & Badges */}
                                <div className="relative h-28 sm:h-48 md:h-56 overflow-hidden bg-slate-100">
                                    <img
                                        src={hospital.image}
                                        alt={hospital.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    
                                    {/* Top Left: Emergency Pulse */}
                                    {hospital.emergency && (
                                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-600 text-white text-[7px] sm:text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-red-200 uppercase tracking-widest">
                                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping"></span>
                                            SOS Emergency
                                        </div>
                                    )}

                                    {/* Top Right: Rating */}
                                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <FaStar className="text-yellow-400 text-[8px] sm:text-xs" />
                                        <span className="text-[9px] sm:text-xs font-black text-slate-800">{hospital.rating}</span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-3 sm:p-6 flex flex-col flex-1 space-y-3 sm:space-y-4">
                                    <div>
                                        <h3 className="text-[13px] sm:text-lg md:text-xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors line-clamp-1">
                                            {hospital.name}
                                        </h3>
                                        <p className="text-slate-400 font-medium text-[9px] sm:text-xs mt-0.5 line-clamp-1">
                                            {hospital.address}
                                        </p>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between py-2 border-y border-slate-50">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <FaUserMd className="text-blue-500 text-[10px] sm:text-xs" />
                                            <span className="text-[9px] sm:text-xs font-bold text-slate-600">{hospital.doctors}+ Drs</span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <FaBed className="text-emerald-500 text-[10px] sm:text-xs" />
                                            <span className="text-[9px] sm:text-xs font-bold text-slate-600">{hospital.beds} Beds</span>
                                        </div>
                                    </div>

                                    {/* Specialties (Only first 2 on mobile to save space) */}
                                    <div className="flex flex-wrap gap-1 md:gap-2">
                                        {hospital.specialties?.slice(0, 2).map((spec, i) => (
                                            <span key={i} className="text-[8px] sm:text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-tight">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50 mt-auto">
                                        <div className="flex items-center gap-1 text-[#08B36A] font-black text-[9px] sm:text-[11px] uppercase tracking-wider">
                                            <FaMapMarkerAlt /> {hospital.distance}m away
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-[#08B36A] rounded-lg sm:rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#08B36A] hover:text-white transition-all">
                                                <FaPhoneAlt className="text-[9px] sm:text-xs" />
                                            </div>
                                            <button
                                                onClick={() => handleSelectHospital(hospital)}
                                                className="flex-1 bg-[#08B36A] hover:bg-slate-900 text-white font-black py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-[#08B36A]/10 active:scale-95 uppercase tracking-widest text-[8px] sm:text-[10px]"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white py-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                            <FaHospital className="mx-auto text-6xl text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">No Hospitals Found</h3>
                        </div>
                    )}
                </div>

                {/* ================= SEE ALL BUTTON ================= */}
                {hasMore && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => router.push("/hospital/seeallhospitals")}
                            className="cursor-pointer inline-flex items-center gap-3 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-3.5 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group text-sm"
                        >
                            Explore All Units <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-widest">
                            Verified Hospital Network
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindHospital;