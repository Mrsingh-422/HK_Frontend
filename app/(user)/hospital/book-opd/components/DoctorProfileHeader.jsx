"use client";

import React from "react";
import { FaUserMd, FaStar, FaHospital, FaDoorOpen } from "react-icons/fa";

export default function DoctorProfileHeader({ doctor, hospital }) {
  if (!doctor) return null;

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        {/* Doctor Avatar */}
        <div className="relative w-28 h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
          <img
            src={doctor.profileImage || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600"}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            <FaStar className="text-amber-400 text-xs" />
            <span className="text-[11px] font-black text-slate-800">4.9</span>
          </div>
        </div>

        {/* Doctor Profile Details */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-emerald-100">
              Verified OPD Specialist
            </span>
            {doctor.opdRoomNumber && (
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                <FaDoorOpen className="text-emerald-400" /> {doctor.opdRoomNumber}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Dr. {doctor.name}
          </h1>

          <p className="text-emerald-600 font-bold text-sm tracking-wide uppercase">
            {doctor.speciality}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium pt-1">
            <FaHospital className="text-slate-400" />
            <span>{hospital?.name || "Hospital Facility"}</span>
          </div>
        </div>

        {/* OPD Fee Display */}
        <div className="md:border-l md:border-slate-100 md:pl-6 flex md:flex-col justify-between items-end md:items-start gap-1 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">OPD Consultation Fee</span>
          <span className="text-3xl font-black text-slate-900">₹{doctor.opdFee || doctor.consultationFee || 500}</span>
          <span className="text-[10px] text-emerald-600 font-bold">Includes OPD Registration</span>
        </div>
      </div>
    </div>
  );
}