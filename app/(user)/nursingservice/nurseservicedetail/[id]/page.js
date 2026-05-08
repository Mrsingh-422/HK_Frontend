"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaStar, FaMapMarkerAlt, FaBriefcase, FaCheckCircle,
  FaArrowLeft, FaPhoneAlt, FaEnvelope, FaClock, FaBoxOpen
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.26:5002";

export default function NurseServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nurseData, setNurseData] = useState(null);
  const [activeTab, setActiveTab] = useState("service");

  const getImageUrl = (path) => {
    if (!path) return "https://img.freepik.com/free-photo/medical-specialist-taking-care-patient_23-2148962551.jpg";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path.replace(/^public\//, "")}`.replace(/([^:]\/)\/+/g, "$1");
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.nurseServiceDetail(id);
        if (res?.success) setNurseData(res.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleProceed = (item) => {
    const isPkg = activeTab === "package";

    // DATA FOR BACKEND SCHEMA
    const bookingInitiation = {
      nurseId: nurseData._id,
      serviceId: !isPkg ? item._id : undefined,
      packageId: isPkg ? item._id : undefined,

      // Snapshot of service at time of booking
      serviceDetails: {
        title: isPkg ? item.packageName : item.title,
        type: isPkg ? "Package" : "Service",
        duration: item.duration || "Per Visit",
        basePrice: item.pricing?.oneDay?.final || 0,
        procedureIncluded: item.procedures?.join(", ") || "Standard",
        servicesOffered: item.description || ""
      },

      // Flat fields for calculations
      basePrice: item.pricing?.oneDay?.final || 0,
      nurseName: nurseData.name,
      nurseImage: nurseData.profileImage
    };

    sessionStorage.setItem("pendingNurseBooking", JSON.stringify(bookingInitiation));
    router.push(`/nursingservice/booking-details`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-sans pb-20">
      {/* Header / Hero Section */}
      <div className="relative h-[350px] w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src={getImageUrl(nurseData.profileImage)} className="w-full h-full object-cover blur-sm" alt="bg" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFEFF] via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <button onClick={() => router.back()} className="absolute top-8 left-6 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-slate-900 transition-all z-20">
            <FaArrowLeft />
          </button>
          <div className="flex flex-col md:flex-row items-end gap-8 relative z-10">
            <div className="relative">
              <img src={getImageUrl(nurseData.profileImage)} className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-8 border-white shadow-2xl object-cover bg-white" alt="profile" />
              <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-xl shadow-lg"><FaCheckCircle /></div>
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900">{nurseData.name}</h1>
              <div className="flex flex-wrap gap-6 text-slate-600 font-medium">
                <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-teal-500" /> {nurseData.city}</div>
                <div className="flex items-center gap-2"><FaBriefcase className="text-teal-500" /> {nurseData.experienceYears} Years Exp.</div>
                <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">★ 4.9 Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-2 rounded-3xl w-fit mb-10">
          <button onClick={() => setActiveTab("service")} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'service' ? "bg-white text-teal-600 shadow-md" : "text-slate-500"}`}>SERVICES</button>
          <button onClick={() => setActiveTab("package")} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'package' ? "bg-white text-teal-600 shadow-md" : "text-slate-500"}`}>PACKAGES</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {(activeTab === "service" ? (nurseData.services || []) : (nurseData.packages || [])).map((item) => (
              <div key={item._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-56 flex-shrink-0">
                    <img src={getImageUrl(item.photos?.[0])} className="w-full h-56 rounded-3xl object-cover" alt="img" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-slate-900">{item.title || item.packageName}</h3>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Starts</p>
                        <p className="text-3xl font-black text-teal-600">₹{item.pricing?.oneDay?.final}</p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{item.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><FaClock className="text-teal-500" /> {nurseData.availability?.startTime} - {nurseData.availability?.endTime}</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><FaBoxOpen className="text-teal-500" /> Med Kit Incl.</div>
                    </div>
                    <button onClick={() => handleProceed(item)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-teal-600 transition-all">Select & Continue</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28">
              <h3 className="text-xl font-black mb-6">Support</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4"><FaPhoneAlt className="text-teal-400" /> <div><p className="text-[10px] text-slate-400">Phone</p><p className="font-bold">{nurseData.phone}</p></div></div>
                <div className="flex items-center gap-4"><FaEnvelope className="text-teal-400" /> <div><p className="text-[10px] text-slate-400">Email</p><p className="font-bold truncate max-w-[150px]">{nurseData.email}</p></div></div>
                <button className="w-full bg-teal-500 py-4 rounded-2xl font-black mt-4">Chat with Coordinator</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}