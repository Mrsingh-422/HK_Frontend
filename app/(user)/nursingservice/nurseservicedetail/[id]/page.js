"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaStar, FaMapMarkerAlt, FaBriefcase, FaCheckCircle,
  FaArrowLeft, FaPhoneAlt, FaEnvelope, FaFileMedical,
  FaStethoscope, FaCapsules, FaClock, FaClipboardList,
  FaImages, FaCalendarAlt, FaTimes, FaCrown
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = "http://localhost:5000";

function NurseServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nurseData, setNurseData] = useState(null);
  const [activeTab, setSelectedTab] = useState("");

  const getImageUrl = (path) => {
    if (!path) return "https://img.freepik.com/free-photo/medical-specialist-taking-care-patient_23-2148962551.jpg";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/^public\//, "");
    return `${BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.nurseServiceDetail(id);
        if (res?.success) {
          setNurseData(res.data);
          if (res.data.services?.length > 0) {
            setSelectedTab(res.data.services[0].type);
          }
        }
      } catch (error) {
        console.error("Error fetching nurse details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleBookNow = (service) => {
    // Navigate to booking details page and pass necessary IDs
    // The slot selection logic will now happen on that page
    const queryParams = new URLSearchParams({
      nurseId: nurseData._id,
      serviceId: service._id,
      nurseName: nurseData.name,
      serviceTitle: service.title,
      servicePrice: service.price,
    }).toString();

    router.push(`/nursingservice/booking-details?${queryParams}`);
  };

  const serviceTypes = useMemo(() => {
    if (!nurseData?.services) return [];
    return [...new Set(nurseData.services.map((s) => s.type))];
  }, [nurseData]);

  const filteredServices = useMemo(() => {
    if (!nurseData?.services) return [];
    return nurseData.services.filter((s) => s.type === activeTab);
  }, [nurseData, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-sans pb-20">
      {/* --- Header / Hero Section --- */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-slate-900 overflow-hidden">
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
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{nurseData.name}</h1>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg flex items-center gap-2 font-bold text-sm">
                  <FaStar className="text-amber-500" /> 4.9 (120+ Reviews)
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-slate-600 font-medium">
                <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-teal-500" /> {nurseData.city}</div>
                <div className="flex items-center gap-2"><FaBriefcase className="text-teal-500" /> {nurseData.experienceYears} Years Exp.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">About Agency</h2>
            <div className="h-1.5 w-12 bg-teal-500 rounded-full mb-6" />
            <p className="text-slate-500 text-lg leading-relaxed">{nurseData.about || `Professional healthcare agency in ${nurseData.city}.`}</p>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Care Packages</h2>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                {serviceTypes.map((type) => (
                  <button key={type} onClick={() => setSelectedTab(type)} className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === type ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {filteredServices.map((service) => (
                <div key={service._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all group">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-56 space-y-3 flex-shrink-0">
                      <div className="w-full h-56 rounded-3xl overflow-hidden bg-slate-100 border border-slate-50">
                        <img src={getImageUrl(service.photos?.[0])} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="service" />
                      </div>
                      {service.photos?.length > 1 && (
                        <div className="flex gap-2">
                          {service.photos.slice(1, 4).map((img, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100">
                              <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="gal" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase rounded-lg">{service.type}</span>
                            {service.prescriptionRequired && <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase bg-rose-50 px-2 py-1 rounded-lg"><FaFileMedical /> Prescription Reqd.</span>}
                          </div>
                          <h3 className="text-2xl font-black text-slate-900">{service.title}</h3>
                        </div>
                        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Starting Price</p>
                          <p className="text-3xl font-black text-slate-900">₹{service.price}</p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed italic">"{service.description}"</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600"><div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500"><FaStethoscope /></div><span>{service.procedureIncluded}</span></div>
                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600"><div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500"><FaCapsules /></div>
                        </div>
                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600"><div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500"><FaClock /></div><span>{service.servicesOffered}</span></div>
                      </div>
                      <button onClick={() => handleBookNow(service)} className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-teal-600 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3">
                        Book This Package <FaArrowLeft className="rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-8">
            <h3 className="text-xl font-black mb-6">Contact Agency</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400"><FaPhoneAlt /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">Support Line</p><p className="font-bold">{nurseData.phone}</p></div></div>
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400"><FaEnvelope /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><p className="font-bold truncate max-w-[200px]">{nurseData.email}</p></div></div>
              <button className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black hover:bg-teal-400 transition-all">Talk to Coordinator</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

export default NurseServiceDetailPage;