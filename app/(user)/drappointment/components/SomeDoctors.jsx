"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaUserMd, 
  FaPlus, 
  FaCheckCircle, 
  FaChevronRight,
  FaBriefcase
} from 'react-icons/fa';

const DOCTORS = [
  {
    _id: "1",
    name: "Dr. Arshdeep Singh",
    specialty: "Senior Cardiologist",
    experience: "12+ Years",
    rating: 4.9,
    reviews: 120,
    fee: 800,
    hospital: "Fortis Hospital",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80"
  },
  {
    _id: "2",
    name: "Dr. Mehak Sharma",
    specialty: "Gynecologist",
    experience: "8+ Years",
    rating: 4.8,
    reviews: 85,
    fee: 600,
    hospital: "Max Healthcare",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80"
  },
  {
    _id: "3",
    name: "Dr. Rahul Verma",
    specialty: "Dermatologist",
    experience: "10+ Years",
    rating: 4.7,
    reviews: 210,
    fee: 700,
    hospital: "Ivy Hospital",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
  }
];

function SomeDoctors() {
  const router = useRouter();

  const handleDoctorClick = (id) => {
    router.push(`/drappointment/doctor/${id}`);
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
          {DOCTORS.map((doc) => (
            <div 
              key={doc._id}
              onClick={() => handleDoctorClick(doc._id)}
              className="group cursor-pointer relative bg-white rounded-[3.5rem] p-5 shadow-xl shadow-slate-200/40 border border-slate-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-72 w-full rounded-[2.8rem] overflow-hidden mb-6 bg-slate-100">
                <img 
                  src={doc.image} 
                  alt={doc.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                {/* Status Badges */}
                <div className="absolute top-5 left-5">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Available Today
                    </span>
                </div>

                <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <FaStar size={10} />
                  </div>
                  <span className="text-sm font-black tracking-tight">{doc.rating} <span className="text-[10px] font-bold text-white/70">({doc.reviews} Reviews)</span></span>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-blue-500" size={12} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Specialist</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 truncate mb-1 group-hover:text-emerald-600 transition-colors">
                  {doc.name}
                </h3>
                <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-6">
                  {doc.specialty}
                </p>

                {/* Inner Info Card */}
                <div className="bg-slate-50 rounded-[2.2rem] p-6 border border-slate-100 flex flex-col gap-4 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaBriefcase className="text-slate-400" size={14} />
                        <span className="text-xs font-bold text-slate-600">{doc.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-400" size={14} />
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{doc.hospital}</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200/60 w-full"></div>

                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                        <p className="text-xl font-black text-slate-900">₹{doc.fee}</p>
                    </div>
                    <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:scale-110 shadow-lg">
                      <FaPlus size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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