"use client";
import React, { useState } from "react";
// React Icons
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineCalendar, HiOutlineClock, HiOutlineExternalLink } from "react-icons/hi";
import { FaUserMd, FaHospital, FaChevronRight } from "react-icons/fa";
import { MdOutlineMedicalServices } from "react-icons/md";

function MyHospitalAppointments() {
  const [myAppointments] = useState([
    {
      id: "APT-10293",
      bookedDate: "Oct 28, 2023",
      bookedTime: "10:30 AM",
      status: "Confirmed",
      patientName: "John Doe",
      assignedDoctor: "Dr. Smith (Senior Cardiologist)",
      hospital: {
        id: 1,
        name: "Yash Hospital",
        address: "TDI City, Sector 118",
        distance: 8737,
        rating: 4,
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",
        specialties: ["Cardiology", "Orthopedics", "Neurology"],
        doctorsCount: 35,
        beds: 120,
        emergency: true,
        phone: "+91 9876543210",
        website: "www.yashhospital.com",
        timing: "24 Hours",
        about: "Yash Hospital provides advanced healthcare with modern infrastructure and experienced doctors.",
        services: ["ICU", "Emergency Care", "Diagnostics", "Pharmacy"]
      }
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:p-8 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Hospital Appointments</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">View and manage your scheduled healthcare visits.</p>
        </div>

        {/* APPOINTMENT LIST */}
        <div className="space-y-6 md:space-y-8">
          {myAppointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* TOP STRIP - Status & ID */}
              <div className="bg-gray-50 px-4 py-3 md:px-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">ID: {appt.id}</span>
                  <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase border ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-semibold text-gray-600">
                  <span className="flex items-center gap-1.5"><HiOutlineCalendar className="text-[#08b36a]" /> {appt.bookedDate}</span>
                  <span className="flex items-center gap-1.5"><HiOutlineClock className="text-[#08b36a]" /> {appt.bookedTime}</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row">
                {/* HOSPITAL IMAGE */}
                <div className="w-full lg:w-1/3 h-48 sm:h-64 lg:h-auto relative shrink-0">
                  <img src={appt.hospital.image} alt={appt.hospital.name} className="w-full h-full object-cover" />
                  {appt.hospital.emergency && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      24/7 EMERGENCY
                    </div>
                  )}
                </div>

                {/* CONTENT AREA */}
                <div className="p-5 md:p-8 flex-1">
                  
                  {/* Hospital Title and Rating */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-5 gap-3">
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 leading-tight">
                        <FaHospital className="text-[#08b36a] shrink-0" /> {appt.hospital.name}
                      </h2>
                      <p className="flex items-start gap-1 text-gray-500 text-xs md:text-sm mt-1.5 leading-relaxed">
                        <HiOutlineLocationMarker className="text-[#08b36a] mt-0.5 shrink-0" /> 
                        <span>{appt.hospital.address} <span className="text-gray-300 mx-1">|</span> {(appt.hospital.distance / 1000).toFixed(1)} km</span>
                      </p>
                    </div>
                    <div className="bg-yellow-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0 self-start">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-1">Rating</span>
                        <p className="text-sm md:text-base font-black text-yellow-500">★ {appt.hospital.rating}.0</p>
                    </div>
                  </div>

                  {/* GRID: Doctor and Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6">
                    {/* Specialist Card */}
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-full shadow-sm text-[#08b36a] shrink-0">
                           <FaUserMd size={24} />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-[10px] font-bold text-[#2f8f5b] uppercase tracking-wider mb-0.5">Assigned Specialist</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base truncate">{appt.assignedDoctor}</p>
                        </div>
                    </div>

                    {/* Stats Grid - Responsive inside the parent grid */}
                    <div className="grid grid-cols-3 bg-gray-50 rounded-xl p-3 md:p-4 divide-x divide-gray-200">
                        <div className="text-center px-1">
                            <p className="text-sm md:text-lg font-bold text-gray-700">{appt.hospital.doctorsCount}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Doctors</p>
                        </div>
                        <div className="text-center px-1">
                            <p className="text-sm md:text-lg font-bold text-gray-700">{appt.hospital.beds}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Beds</p>
                        </div>
                        <div className="text-center px-1">
                            <p className="text-sm md:text-lg font-bold text-gray-700 whitespace-nowrap">{appt.hospital.timing}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Timing</p>
                        </div>
                    </div>
                  </div>

                  {/* SERVICES TAGS */}
                  <div className="mb-8">
                    <div className="flex flex-wrap gap-1.5">
                        {appt.hospital.services.map((service, i) => (
                            <span key={i} className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                <MdOutlineMedicalServices className="text-[#08b36a] shrink-0" size={12} /> {service}
                            </span>
                        ))}
                    </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-center sm:justify-start gap-6">
                        <a href={`tel:${appt.hospital.phone}`} className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#08b36a] hover:underline transition-all">
                            <HiOutlinePhone size={18} /> Call
                        </a>
                        <a href={`https://${appt.hospital.website}`} target="_blank" className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#08b36a] hover:underline transition-all">
                            <HiOutlineExternalLink size={18} /> Website
                        </a>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 text-xs md:text-sm font-bold text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all">
                            Cancel
                        </button>
                        <button className="flex-1 sm:flex-none px-4 md:px-8 py-2.5 bg-[#08b36a] hover:bg-[#256f47] text-white text-xs md:text-sm font-bold rounded-xl shadow-md shadow-green-100 flex items-center justify-center gap-2 transition-all active:scale-95">
                            Reschedule <FaChevronRight size={10} />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyHospitalAppointments;