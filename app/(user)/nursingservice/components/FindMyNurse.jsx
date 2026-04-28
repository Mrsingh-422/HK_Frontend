"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch, FaStar, FaUserNurse, FaArrowRight,
  FaCheckCircle, FaHandHoldingHeart, FaShieldAlt,
  FaFilePrescription, FaCloudUploadAlt, FaTimesCircle
} from "react-icons/fa";

import { useGlobalContext } from "@/app/context/GlobalContext";
import UserAPI from "@/app/services/UserAPI";

const STATIC_PAGE_DATA = {
  headerTag: "Professional Home Healthcare",
  mainTitle: "Expert Nursing Care \nin Your Own Home.",
  description: "Skip the hospital stay. Access certified nursing professionals for personalized recovery, elderly care, and post-op assistance.",
  searchPlaceholder: "Try searching 'ICU Nurse' or 'General Nursing'..."
};

function FindMyNurse() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { getNursePageData } = useGlobalContext();

  const [pageData, setPageData] = useState(STATIC_PAGE_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  
  // API Data State
  const [nurseServices, setNurseServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription State
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  // 1. Fetch Page Content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getNursePageData();
        if (res?.success && res?.data) setPageData(res.data);
      } catch (err) {
        console.error("Backend fetch failed, using fallback.");
      }
    };
    fetchContent();
  }, [getNursePageData]);

  // 2. Fetch Nurse Services using userCoords from localStorage
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Get coordinates from local storage
        const storedCoords = localStorage.getItem("userCoords");
        const coords = storedCoords 
          ? JSON.parse(storedCoords) 
          : { lat: 30.738056414623948, lng: 76.66049906744976 }; // Default fallback

        const res = await UserAPI.getNurseServices(coords);
        if (res?.success) {
          setNurseServices(res.data);
        }
      } catch (error) {
        console.error("Error fetching nurse services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleBooking = (id) => {
    // Navigating to the specific detail route requested
    router.push(`/nursingservice/nurseservicedetail/${id}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
      alert(`Prescription "${file.name}" selected successfully!`);
    }
  };

  const removeFile = () => {
    setPrescriptionFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const visibleNurses = useMemo(() => {
    return nurseServices.filter((n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.topServices.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 6);
  }, [searchTerm, nurseServices]);

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-sans selection:bg-teal-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
      />

      {/* ================= 1. ENHANCED HERO SECTION ================= */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-teal-50/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[-5%] w-[30%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col space-y-4">
              <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-white border border-teal-100 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">{pageData.headerTag}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight whitespace-pre-line">
                {pageData.mainTitle}
              </h1>
            </div>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
              {pageData.description}
            </p>

            <div className="relative max-w-2xl space-y-4">
              <div className="bg-white rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row items-center gap-2">
                <div className="relative flex-1 w-full group">
                  <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="text"
                    placeholder={pageData.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-300"
                  />
                </div>
                <button className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-bold hover:bg-teal-600 transition-all shadow-lg active:scale-95">
                  Find Nurse
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-teal-50 text-teal-700 border border-teal-200 px-8 py-4 rounded-2xl font-bold hover:bg-teal-100 transition-all active:scale-95"
                >
                  <FaCloudUploadAlt className="text-xl" />
                  {prescriptionFile ? "Change Prescription" : "Upload Prescription"}
                </button>

                {prescriptionFile && (
                  <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
                    <FaFilePrescription className="text-teal-600" />
                    <span className="text-sm font-medium text-slate-600 truncate max-w-[150px]">
                      {prescriptionFile.name}
                    </span>
                    <button onClick={removeFile} className="text-rose-500 hover:text-rose-700">
                      <FaTimesCircle />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-6 mt-6 px-6">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <FaCheckCircle className="text-teal-500" /> Government Verified
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <FaShieldAlt className="text-teal-500" /> Background Checked
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} className="w-10 h-10 rounded-full border-4 border-white" src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold">+5k</div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Trusted by <span className="text-slate-900 font-black">5,000+ families</span> for home recovery
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative z-10 bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-50">
              <img
                src="https://img.freepik.com/free-photo/portrait-african-american-practitioner-nurse-smiling-camera-working-illness-expertise_482257-31387.jpg?semt=ais_hybrid&w=740&q=80"
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
                    <div className="flex text-amber-400 text-xs">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    </div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Avg. Care Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. CARE SPECIALISTS LISTING ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Expert Care Specialists</h2>
            <div className="h-1.5 w-20 bg-teal-500 rounded-full" />
          </div>
          <button
            onClick={() => router.push("/nursingservice/seeallnurses")}
            className="hidden md:flex items-center gap-3 font-black text-slate-900 hover:text-teal-600 transition-colors"
          >
            View Full Directory
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center group hover:border-teal-600 transition-all">
              <FaArrowRight className="text-sm" />
            </div>
          </button>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[1,2,3].map(n => <div key={n} className="h-80 bg-slate-50 animate-pulse rounded-[2.5rem]" />)}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {visibleNurses.map((nurse) => (
              <div
                key={nurse._id}
                onClick={() => handleBooking(nurse._id)}
                className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all cursor-pointer relative hover:-translate-y-3 duration-300"
              >
                <div className="relative mb-6 aspect-video rounded-[2rem] overflow-hidden">
                  <img
                    src={nurse.profileImage}
                    alt={nurse.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="font-black text-xs text-slate-900">4.9</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-teal-600 transition-colors leading-tight">
                      {nurse.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase rounded-lg">
                        {nurse.topServices[0] || "General Nursing"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <FaCheckCircle className="text-teal-500" /> {nurse.city}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic">
                    "Expert services including {nurse.topServices.join(", ")}"
                  </p>

                  <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting from</p>
                      <p className="text-2xl font-black text-slate-900">₹{nurse.startingPrice}<span className="text-xs text-slate-400 font-medium"> / visit</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-teal-600 transition-all shadow-lg">
                      <FaArrowRight />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <button
            onClick={() => router.push("/nursingservice/seeallnurses")}
            className="bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white px-12 py-5 rounded-[2rem] font-black transition-all shadow-sm active:scale-95 border border-teal-100"
          >
            Browse All Care Packages
          </button>
        </div>
      </section>

      {/* ================= 3. TRUST & CTA ================= */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
            <div className="lg:max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                Recovery is better <br /> <span className="text-teal-400">among family.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
                Our medical coordinators help you find the perfect nursing match within 2 hours. Hand-picked staff for your specific medical needs.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button className="bg-teal-500 text-white px-10 py-5 rounded-2xl font-black hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20">
                  Speak to Coordinator
                </button>
                <button className="bg-white/10 text-white border border-white/10 backdrop-blur-md px-10 py-5 rounded-2xl font-black hover:bg-white/20 transition-all">
                  How it works
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <FaUserNurse className="text-[20rem] text-white/5 rotate-12" />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default FindMyNurse;