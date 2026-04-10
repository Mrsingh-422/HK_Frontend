"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar, FaSearch, FaMapMarkerAlt, FaVideo, 
  FaHospital, FaArrowRight, FaCheckCircle, 
  FaStethoscope, FaUserMd, FaShieldAlt, FaBriefcaseMedical, FaClock
} from "react-icons/fa";
import { DOCTORS_DATA } from "@/app/constants/constants";

// --- Framer Motion Animation Settings ---
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function LandingFindDoctor() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Logic: Filter by search then slice to exactly 6 for the landing page
  const visibleDoctors = useMemo(() => {
    const filtered = DOCTORS_DATA.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.slice(0, 6); 
  }, [searchTerm]);

  const handleNavigateToDoctor = (id) => {
    router.push(`/drappointment/doctor/${id}`);
  };

  const handleSeeAll = () => {
    router.push("/drappointment/seealldoctors");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-100"
          >
            <FaCheckCircle className="animate-pulse" /> Verified Medical Network
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Your health journey <br />
            <span className="text-emerald-600">starts with the right expert.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Connect with India's top-rated certified specialists for video consultations 
            or in-person clinic visits. Secure, fast, and reliable.
          </motion.p>

          {/* SEARCH BOX */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full group">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search by specialty (e.g. Cardiologist)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-transparent outline-none font-medium text-slate-700"
              />
            </div>
            <button 
              onClick={handleSeeAll}
              className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg"
            >
              Search Doctors
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
          {[
            { icon: FaUserMd, label: "Specialists", count: "500+" },
            { icon: FaStar, label: "Avg. Rating", count: "4.9/5" },
            { icon: FaShieldAlt, label: "Secure Data", count: "100%" },
            { icon: FaClock, label: "Wait Time", count: "< 5 Min" },
          ].map((item, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-2">
                <item.icon className="text-emerald-600" />
              </div>
              <h4 className="text-2xl font-black text-slate-900">{item.count}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DOCTORS GRID (SHOW ONLY 6) */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Top Rated Specialists</h2>
            <div className="h-1.5 w-20 bg-emerald-500 rounded-full" />
          </div>
          <button 
            onClick={handleSeeAll}
            className="group flex items-center gap-3 font-black text-slate-900 hover:text-emerald-600 transition-colors"
          >
            View All 200+ Specialists 
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 group-hover:border-emerald-600 flex items-center justify-center transition-all">
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {visibleDoctors.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                variants={fadeInUp}
                whileHover={{ y: -12 }}
                onClick={() => handleNavigateToDoctor(doc.id)}
                className="group bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Image Area */}
                <div className="relative mb-6 aspect-[4/5] rounded-[2rem] overflow-hidden">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                    <FaStar className="text-amber-400" />
                    <span className="font-black text-sm">{doc.rating}</span>
                  </div>
                </div>

                {/* Info Area */}
                <div className="space-y-4 px-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                        {doc.name}
                      </h3>
                      <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mt-1">
                        {doc.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <FaMapMarkerAlt className="text-emerald-500 flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{doc.address}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee starts at</span>
                      <span className="text-xl font-black text-slate-900">₹{doc.consultFee}</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-600"><FaVideo size={12}/></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600"><FaHospital size={12}/></div>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-slate-900 group-hover:bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-slate-200 group-hover:shadow-emerald-200">
                    Book Slot
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* VIEW ALL BUTTON (Below Grid) */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-20 text-center"
        >
            <button 
                onClick={handleSeeAll}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-12 py-5 rounded-[2rem] font-black transition-all shadow-sm active:scale-95 border border-emerald-100"
            >
                View All Available Specialists
            </button>
        </motion.div>
      </section>

      {/* 4. PROFESSIONAL CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden group">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                Modern Healthcare <br /> <span className="text-emerald-400 underline decoration-wavy underline-offset-8">Simplified.</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
                Experience seamless appointment booking with India's most advanced health network. Available on Web, iOS, and Android.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-all flex items-center gap-2">
                  Get Started <FaArrowRight />
                </button>
                <button className="bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                <FaStethoscope className="text-[25rem] text-white/5 -rotate-12 float-animation" />
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-20px) rotate(-8deg); }
        }
      `}</style>
    </div>
  );
}