"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaStar,
  FaMapMarkerAlt,
  FaPlus,
  FaCheckCircle,
  FaChevronRight,
  FaBriefcase,
  FaSpinner
} from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

function SomeDoctors() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // HELPER: Formats the image URL by removing 'public/' and prepending the base URL
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400x500?text=No+Image";
    
    // 1. If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // 2. Remove 'public/' from the start of the string
    // This turns "public/uploads/doctors/..." into "uploads/doctors/..."
    const cleanPath = path.replace(/^public\//, '');
    
    // 3. Your specific backend address
    const BASE_URL = 'http://192.168.1.26:5002';
    
    return `${BASE_URL}/${cleanPath}`;
  };

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
          // Handle both single profile object and list of profiles
          const doctorData = Array.isArray(docRes.data) 
            ? docRes.data 
            : (docRes.data.profile ? [docRes.data.profile] : []);
            
          setDoctors(doctorData.slice(0, 3));
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDoctorClick = (id) => {
    router.push(`/drappointment/doctordetail/${id}`);
  };

  return (
    <div className="py-10 bg-[#FDFEFF]">
      <div className="max-w-7xl mx-auto px-6">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Expert Specialists</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
              Top Rated <span className="text-emerald-500">Doctors.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
              Consult with India's leading medical experts. Verified professionals
              with years of clinical experience across various specialties.
            </p>
          </div>
          <button
            onClick={() => router.push('/drappointment/seealldoctors')}
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-all"
          >
            Explore All Doctors <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- Doctor Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <FaSpinner className="animate-spin text-emerald-500" size={30} />
            </div>
          ) : doctors.length > 0 ? (
            doctors.map((doc) => (
              <div
                key={doc._id}
                onClick={() => handleDoctorClick(doc._id)}
                className="group cursor-pointer relative bg-white rounded-[3.5rem] p-5 shadow-xl shadow-slate-200/40 border border-slate-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-72 w-full rounded-[2.8rem] overflow-hidden mb-6 bg-slate-100">
                  <img
                    src={getImageUrl(doc.profileImage)}
                    alt={doc.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=Image+Not+Found"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {/* Status Badges */}
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${doc.dutyStatus === 'Off Duty' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div> 
                      {doc.dutyStatus || "Available"}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                      <FaStar size={10} />
                    </div>
                    <span className="text-sm font-black tracking-tight">
                      {doc.averageRating || 5.0} <span className="text-[10px] font-bold text-white/70">({doc.totalReviews || 0} Reviews)</span>
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-blue-500" size={12} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {doc.profileStatus || 'Verified'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 truncate mb-1 group-hover:text-emerald-600 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-6">
                    {doc.speciality}
                  </p>

                  {/* Inner Info Card */}
                  <div className="bg-slate-50 rounded-[2.2rem] p-6 border border-slate-100 flex flex-col gap-4 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FaBriefcase className="text-slate-400" size={14} />
                        <span className="text-xs font-bold text-slate-600">
                          {doc.experienceYears ? `${doc.experienceYears} Years Exp.` : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-400" size={14} />
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">
                          {doc.city || "Mohali"}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200/60 w-full"></div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                        <p className="text-xl font-black text-slate-900">₹{doc.fees?.clinic || 0}</p>
                      </div>
                      <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:scale-110 shadow-lg">
                        <FaPlus size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No doctors found.</p>
            </div>
          )}
        </div>

        {/* --- Global CTA --- */}
        <div className="mt-20 flex flex-col items-center">
          <button
            onClick={() => router.push('/drappointment/seealldoctors')}
            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all active:scale-95"
          >
            Browse All Specialists
          </button>
        </div>
      </div>
    </div>
  );
}

export default SomeDoctors;