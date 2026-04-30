"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaStar, FaHandHoldingHeart, FaShieldAlt,
  FaCheckCircle, FaCloudUploadAlt, FaFilePrescription, FaTimesCircle
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const STATIC_FALLBACK = {
  headerTag: "Professional Home Healthcare",
  mainTitle: "Expert Nursing Care \nin Your Own Home.",
  description: "Skip the hospital stay. Access certified nursing professionals for personalized recovery, elderly care, and post-op assistance.",
  searchPlaceholder: "Try searching 'ICU Nurse'..."
};

const NurseHero = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { getNursePageData } = useGlobalContext();

  // Component Internal State
  const [pageData, setPageData] = useState(STATIC_FALLBACK);
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  // 1. Fetch Dynamic Content Internally
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getNursePageData();
        if (res?.success && res?.data) setPageData(res.data);
      } catch (err) {
        console.error("NurseHero: API Fetch failed, using fallback.");
      }
    };
    fetchContent();
  }, [getNursePageData]);

  // 2. Internal Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
      // Logic for actual API upload could go here
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setPrescriptionFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSearchNavigation = () => {
    if (searchTerm.trim()) {
      router.push(`/nursingservice/seeallnurses?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(`/nursingservice/seeallnurses`);
    }
  };

  return (
    <section className="relative pt-8 sm:pt-12 pb-0 sm:pb-0 lg:pt-20 lg:pb-32 px-4 sm:px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] sm:w-[40%] h-[60%] bg-teal-50/50 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-[-5%] w-[50%] sm:w-[30%] h-[40%] bg-indigo-50/50 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-white border border-teal-100 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
                {pageData.headerTag}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight whitespace-pre-line">
              {pageData.mainTitle}
            </h1>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl leading-relaxed">
            {pageData.description}
          </p>

          <div className="relative max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row items-center gap-1 sm:gap-2">
              <div className="relative flex-1 w-full group">
                <FaSearch className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  placeholder={pageData.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchNavigation()}
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-300 text-sm sm:text-base"
                />
              </div>
              <button
                onClick={handleSearchNavigation}
                className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-[2rem] font-bold hover:bg-teal-600 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
              >
                Find Nurse
              </button>
            </div>

            {/* Internal File Logic */}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-50 text-teal-700 border border-teal-200 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-teal-100 transition-all active:scale-95 text-sm"
              >
                <FaCloudUploadAlt className="text-lg sm:text-xl" />
                {prescriptionFile ? "Change Prescription" : "Upload Prescription"}
              </button>

              {prescriptionFile && (
                <div className="w-full sm:w-auto flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
                  <FaFilePrescription className="text-teal-600" />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 truncate max-w-[150px]">{prescriptionFile.name}</span>
                  <button onClick={removeFile} className="text-rose-500 hover:text-rose-700 ml-auto sm:ml-0"><FaTimesCircle /></button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white" src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
              ))}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white bg-teal-500 flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold">+5k</div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">Trusted by <span className="text-slate-900 font-black">5,000+ families</span></p>
          </div>
        </div>

        {/* RIGHT SIDE: IMAGE (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="relative z-10 bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-50">
            <img
              src="https://img.freepik.com/free-photo/healthcare-workers-preventing-virus-quarantine-campaign-concept-cheerful-friendly-asian-female-physician-doctor-with-clipboard-daily-checkup-standing-white-background_1258-107867.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Nursing Care"
              className="rounded-[2.5rem] w-full h-[500px] object-cover"
            />
            <div className="absolute top-12 -left-8 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white/50 flex items-center gap-4 animate-bounce-slow">
              <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-200">
                <FaHandHoldingHeart />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Response Time</p>
                <p className="text-xl font-black text-slate-900">Under 20 Min</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black">4.9</div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <div className="flex text-amber-400 text-xs"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                  <p className="text-[10px] font-bold uppercase opacity-60">Avg. Care Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default NurseHero;