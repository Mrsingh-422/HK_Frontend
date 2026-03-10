'use client'
import React from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCertificate,
  FaRegIdCard,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa"

export default function HospitalProfilePage() {
  const { hospital, loading } = useAuth();

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A]"></div>
    </div>
  );

  // Mock data for missing fields (replace with real hospital keys if different)
  const profileDetails = {
    address: hospital?.address || "Street Address Not Provided",
    phone: hospital?.phone || "+1 234 567 890",
    type: hospital?.type || "General Hospital",
    licenseNumber: hospital?.licenseNumber || "LIC-9920334-X",
    joinedDate: new Date(hospital?.createdAt).toLocaleDateString() || "N/A",
    specializations: ["Emergency", "Cardiology", "Neurology", "Pediatrics"]
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#08B36A] to-emerald-700"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:items-end -mt-16 gap-6">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
                {hospital?.profileImage ? (
                  <img src={hospital.profileImage} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <FaHospital className="text-gray-300 text-5xl" />
                )}
              </div>
            </div>

            {/* Basic Name & Status */}
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {hospital?.hospitalName || "Hospital Name"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <FaMapMarkerAlt className="text-[#08B36A]" /> {profileDetails.address}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${hospital?.profileStatus === 'Approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {hospital?.profileStatus === 'Approved' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  {hospital?.profileStatus}
                </span>
              </div>
            </div>

            <button className="bg-[#08B36A] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition shadow-md shadow-green-100">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- LEFT COLUMN: CONTACT INFO --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-50">
                <div className="p-2 bg-white rounded-lg text-[#08B36A] shadow-sm"><FaPhone size={14} /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-700">{profileDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-50">
                <div className="p-2 bg-white rounded-lg text-[#08B36A] shadow-sm"><FaEnvelope size={14} /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700">{hospital?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Registration Info</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2"><FaRegIdCard /> License No</span>
                <span className="font-semibold text-gray-700">{profileDetails.licenseNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2"><FaClock /> Joined On</span>
                <span className="font-semibold text-gray-700">{profileDetails.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: SERVICES & DOCUMENTS --- */}
        <div className="lg:col-span-2 space-y-6">

          {/* Medical Specialties */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCertificate className="text-[#08B36A]" /> Medical Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileDetails.specializations.map(spec => (
                <span key={spec} className="px-4 py-2 bg-green-50 text-[#08B36A] text-sm font-medium rounded-xl border border-green-100">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Documentation Gallery */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Identity & Verification Documents</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* License Document Preview */}
              <div className="group relative aspect-video rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                  View License
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <FaRegIdCard size={24} />
                  <span className="text-[10px] mt-1 uppercase font-bold">Hospital License</span>
                </div>
              </div>
              {/* Placeholder for more images */}
              <div className="group relative aspect-video rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 italic">
                  <span className="text-[10px] font-bold">Inward Facility View</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">* For security, document files are encrypted. Contact admin to re-upload.</p>
          </div>

        </div>
      </div>
    </div>
  )
}