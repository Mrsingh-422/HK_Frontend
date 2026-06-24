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
import { useGlobalContext } from "@/app/context/GlobalContext";

// Premium Static Image for Nursing Fallback
const STATIC_NURSE_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/`;

function NurseSection() {
  const router = useRouter();
  const [nurseServices, setNurseServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const {openModal} = useGlobalContext()

  // Fetch Services List dynamically using active user coordinates
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const storedCoords = localStorage.getItem("userCoords");
        const coords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.7380, lng: 76.6604 };
        const res = await UserAPI.getNurseServices(coords);
        if (res?.success) {
          // Limit to exactly 6 cards as requested
          setNurseServices(res.data.slice(0, 6));
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
    <div className="min-h-screen bg-slate-50/50 font-sans py-12 md:py-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-[2px] bg-teal-500 rounded-full"></span>
              <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Verified Professionals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
              Meet Our Specialized <span className="text-teal-500">Nurses</span>
            </h2>
          </div>
          <button 
            onClick={() => router.push("/nursingservice/seeallnurses")} 
            className="flex items-center gap-3 font-bold text-slate-800 hover:text-teal-600 transition-all text-sm sm:text-base group"
          >
            Explore Directory
            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all duration-300">
              <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>

        {/* --- NURSE SERVICES GRID --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[420px] bg-white animate-pulse rounded-3xl border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {nurseServices.map((nurse) => (
              <div
                key={nurse._id}
                onClick={() => handleBooking(nurse._id)}
                className="group relative bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(15,118,110,0.08)] transition-all duration-500 cursor-pointer flex flex-col hover:-translate-y-1.5"
              >
                {/* Verified Badge Icon (Repositioned to top-right beautifully) */}
                <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-slate-100">
                  <FaCheckCircle className="text-teal-500 text-base" />
                </div>

                {/* Image Section */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 mb-5">
                  <img 
                    src={nurse.profileImage ? `${BASE_URL}${nurse.profileImage.replace('public/', '')}` : STATIC_NURSE_IMAGE} 
                    alt={nurse.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => { e.target.src = STATIC_NURSE_IMAGE; }}
                  />
                  
                  {/* Experience Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
                      <FaAward className="text-teal-400 text-xs" />
                      <span className="font-semibold text-[11px] text-white tracking-wide">
                        {nurse.experienceYears} Yrs Exp
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-amber-500/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                      <FaStar className="text-white text-xs" />
                      <span className="text-white font-bold text-[11px] leading-none">
                        {nurse.rating > 0 ? nurse.rating : "New"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 px-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FaMapMarkerAlt className="text-slate-400 text-xs" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{nurse.city}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 leading-snug mb-3 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {nurse.name}
                  </h3>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {nurse.topServices?.map((service, idx) => (
                      <span key={idx} className="bg-teal-50/60 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide border border-teal-100/50">
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting From</span>
                      <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                        <span className="text-lg font-bold text-slate-800 mr-0.5">₹</span>{nurse.startingPrice}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-teal-100">
                      <FaArrowRight className="text-sm transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && nurseServices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaUserNurse size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-semibold text-lg">No nursing services available in this area.</p>
            <p className="text-slate-400 text-sm mt-1">Please try shifting your current location settings.</p>
          </div>
        )}

        {/* --- BOTTOM TRUST SECTION --- */}
        <div className="mt-16 md:mt-28 bg-slate-900 rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="z-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Are you a Certified Nurse?
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg">
              Join our exclusive network and start providing premium specialized care right in your city.
            </p>
          </div>
          <button
          onClick={()=> openModal('register')}
          className="z-10 w-full lg:w-auto whitespace-nowrap bg-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-teal-400 transition-all duration-300 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5">
            Join Us As Professional
          </button>
        </div>

      </section>
    </div>
  );
}

export default NurseSection;