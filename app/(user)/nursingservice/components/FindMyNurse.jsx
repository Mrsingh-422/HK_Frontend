"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaStar, 
  FaArrowRight, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaAward, 
  FaUserNurse 
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

// Premium Static Image for Nursing
const STATIC_NURSE_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";

function FindMyNurse() {
  const router = useRouter();
  const [nurseServices, setNurseServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Services List
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const storedCoords = localStorage.getItem("userCoords");
        const coords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.7380, lng: 76.6604 };
        const res = await UserAPI.getNurseServices(coords);
        if (res?.success) {
          // Limit to 4 cards as requested
          setNurseServices(res.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching nurse services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBooking = (id) => router.push(`/nursingservice/nurseservicedetail/${id}`);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans py-10">
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-teal-500 rounded-full"></span>
              <span className="text-teal-600 font-black text-[10px] uppercase tracking-widest">Verified Professionals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Expert Care <span className="text-teal-500">Specialists</span>
            </h2>
          </div>
          <button 
            onClick={() => router.push("/nursingservice/seeallnurses")} 
            className="flex items-center gap-3 font-black text-slate-900 hover:text-teal-600 transition-all text-xs sm:text-base group"
          >
            Explore Directory
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
              <FaArrowRight className="text-xs sm:text-sm" />
            </div>
          </button>
        </div>

        {/* --- GRID --- */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 sm:h-96 bg-white animate-pulse rounded-[2rem] border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {nurseServices.map((nurse) => (
              <div
                key={nurse._id}
                onClick={() => handleBooking(nurse._id)}
                className="group relative bg-white rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-5 border border-slate-50 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(20,184,166,0.15)] transition-all duration-500 cursor-pointer flex flex-col hover:-translate-y-2"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] sm:aspect-square rounded-[1.5rem] sm:rounded-[2.2rem] overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src={STATIC_NURSE_IMAGE} 
                    alt={nurse.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  
                  {/* Experience Badge */}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-sm flex items-center gap-1 sm:gap-2">
                      <FaAward className="text-teal-500 text-[10px] sm:text-xs" />
                      <span className="font-black text-[8px] sm:text-[10px] text-slate-800 uppercase tracking-tighter">
                        {nurse.experienceYears} Yrs Exp
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4">
                    <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                      <FaStar className="text-amber-400 text-[8px] sm:text-[10px]" />
                      <span className="text-white font-bold text-[9px] sm:text-[11px]">4.9</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 px-1 sm:px-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FaMapMarkerAlt className="text-teal-500 text-[8px] sm:text-[10px]" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{nurse.city}</span>
                  </div>

                  <h3 className="text-sm sm:text-xl font-black text-slate-900 leading-tight mb-2 sm:mb-3 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {nurse.name}
                  </h3>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {nurse.topServices?.map((service, idx) => (
                      <span key={idx} className="bg-teal-50 text-teal-700 text-[7px] sm:text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-teal-100">
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[7px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-tighter leading-none">Starting From</span>
                      <p className="text-base sm:text-2xl font-black text-slate-900">
                        ₹{nurse.startingPrice}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-100 group-hover:bg-slate-900 transition-all">
                      <FaArrowRight className="text-[10px] sm:text-sm" />
                    </div>
                  </div>
                </div>

                {/* Verified Icon Badge */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-50">
                  <FaCheckCircle className="text-teal-500 text-sm sm:text-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && nurseServices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserNurse size={30} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No nursing services available in this area.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default FindMyNurse;