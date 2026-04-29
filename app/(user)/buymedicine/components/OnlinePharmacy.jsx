"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaFlask, FaSearch, FaUpload, FaCheckCircle,
  FaArrowRight, FaTruck, FaShieldAlt, FaPrescription,
  FaPlus, FaHistory, FaBolt, FaStethoscope, FaBaby, FaWeight, FaHeart, FaTimes
} from "react-icons/fa";

// Context & Services
import { useGlobalContext } from "@/app/context/GlobalContext";
import UserAPI from "@/app/services/UserAPI";

const CATEGORIES = [
  { name: "Diabetes", icon: <FaFlask /> },
  { name: "Heart", icon: <FaHeart /> },
  { name: "Baby Care", icon: <FaBaby /> },
  { name: "Wellness", icon: <FaStethoscope /> },
  { name: "Weight", icon: <FaWeight /> },
];

function OnlinePharmacy() {
  const { getPharmacyPageContent } = useGlobalContext();
  const router = useRouter();
  const searchRef = useRef(null);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCat, setActiveCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);

  const [pageData, setPageData] = useState({
    mainTitle: "Your Pharmacy Store",
    description: "Authentic medications delivered safely in 02 Hours.",
    searchPlaceholder: "Search for medicines or wellness products..."
  });

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, medRes] = await Promise.all([
          getPharmacyPageContent(),
          UserAPI.getPharmacyProductsAll({ page: 1, limit: 20 })
        ]);

        if (contentRes?.success && contentRes.data) setPageData(contentRes.data);

        if (medRes) {
          const medData = medRes.data || medRes;
          setMedicines(Array.isArray(medData) ? medData : []);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search API Logic (Suggestions)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await UserAPI.searchMedicineSuggestions({ query: searchTerm });
          if (res?.success) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Search Error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    return medicines.filter((med) =>
      med.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, medicines]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-[#08B36A]/20 border-t-[#08B36A] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-slate-900">
      {/* --- HERO SECTION --- */}
      <section className="bg-emerald-50/50 pt-10 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-[#08B36A] font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100">
              <FaBolt className="animate-pulse" /> 2hr Express Delivery
            </div>
            <h1 className="text-4xl sm:text-7xl font-black text-slate-900 leading-[1.1]">
              {pageData.mainTitle.replace('!', '')}<span className="text-[#08B36A]">.</span>
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl max-w-lg font-medium">{pageData.description}</p>

            <div className="flex flex-col sm:flex-row gap-4 relative" ref={searchRef}>
              <div className="relative flex-1 group">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                <input
                  type="text"
                  placeholder={pageData.searchPlaceholder}
                  value={searchTerm}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-12 py-5 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none focus:ring-4 focus:ring-[#08B36A]/10 transition-all font-medium"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                    >
                        <FaTimes />
                    </button>
                )}

                {/* --- SEARCH SUGGESTIONS DROPDOWN --- */}
                {showSuggestions && (
                  <div className="absolute top-[110%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {suggestions.length > 0 ? (
                        suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                                router.push(`/buymedicine/singleproductdetail/${item.id}`);
                                setShowSuggestions(false);
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXcBKQGSyQzxK18TWiEw7uVtX2JD-LgIdSWQ&s" className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{item.salt}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                              {item.discount && <span className="block text-[9px] font-black text-[#08B36A]">{item.discount} Off</span>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 font-bold text-sm">
                          {isSearching ? "Searching..." : "No medicines found"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                className="px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-[#08B36A]"
              >
                <FaUpload /> Prescription
              </button>
            </div>
          </div>
          <div className="hidden lg:flex justify-end relative">
            <img
              // src="https://img.freepik.com/free-photo/pharmacist-giving-medicine-customer-pharmacy_23-2148892589.jpg"
              src="https://dynamic.brandcrowd.com/template/preview/design/c0c454d4-4af7-4a54-b47f-cf1c8097d32c?v=4&designTemplateVersion=1&size=design-preview-standalone-1x"
              className="w-80 h-[450px] object-cover rounded-[3rem] shadow-2xl relative z-10 -rotate-3 hover:rotate-0 transition-transform duration-700"
              alt="Pharmacy"
            />
          </div>
        </div>
      </section>

      {/* --- CATEGORY BAR --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-8 flex gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCat("All")} className={`flex flex-col items-center gap-3 min-w-[100px] p-4 rounded-2xl transition-all border-2 ${activeCat === "All" ? 'border-[#08B36A] bg-emerald-50/50' : 'border-transparent hover:bg-slate-50'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${activeCat === "All" ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'}`}><FaPlus /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">All Meds</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCat(cat.name)} className={`flex flex-col items-center gap-3 min-w-[100px] p-4 rounded-2xl transition-all border-2 ${activeCat === cat.name ? 'border-[#08B36A] bg-emerald-50/50' : 'border-transparent hover:bg-slate-50'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${activeCat === cat.name ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'}`}>{cat.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-16 space-y-16">
        {/* Trust Signals */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <FaTruck className="text-[#08B36A] text-2xl" />
            <div><h4 className="font-black text-xs uppercase">Express</h4><p className="text-[10px] text-slate-400 font-bold">2 Hour Delivery</p></div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <FaShieldAlt className="text-[#08B36A] text-2xl" />
            <div><h4 className="font-black text-xs uppercase">Verified</h4><p className="text-[10px] text-slate-400 font-bold">100% Genuine</p></div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <FaHistory className="text-[#08B36A] text-2xl" />
            <div><h4 className="font-black text-xs uppercase">Refill</h4><p className="text-[10px] text-slate-400 font-bold">Quick Reordering</p></div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <FaPrescription className="text-[#08B36A] text-2xl" />
            <div><h4 className="font-black text-xs uppercase">Licensed</h4><p className="text-[10px] text-slate-400 font-bold">Certified Partners</p></div>
          </div>
        </section>

        {/* Medicine Grid */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Popular Medicines</h2>
            <Link href="/buymedicine/seeallmed" className="hidden sm:block text-[#08B36A] text-xs font-black uppercase tracking-widest hover:underline">Explore Store</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredMedicines.slice(0, 8).map((med) => (
              <div 
                key={med._id || med.Id} 
                onClick={() => router.push(`/buymedicine/singleproductdetail/${med._id || med.Id}`)}
                className="group cursor-pointer flex flex-col bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500"
              >
                  <div className="relative aspect-square bg-slate-50/50 p-6 flex items-center justify-center">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXcBKQGSyQzxK18TWiEw7uVtX2JD-LgIdSWQ&s"
                      alt={med.name}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                    {med.discont_percent && parseInt(med.discont_percent) > 0 && (
                      <div className="absolute top-4 left-4 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase">
                        {med.discont_percent} Off
                      </div>
                    )}
                  </div>

                <div className="p-5 sm:p-7 flex flex-col flex-1">
                    <span className="text-[9px] font-black text-[#08B36A] uppercase mb-2 block">{med.manufacturers}</span>
                    <h3 className="text-sm sm:text-lg font-black text-slate-800 line-clamp-2 h-10 sm:h-12">{med.name}</h3>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-300 line-through font-bold block leading-none">₹{med.mrp}</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹{med.best_price}</span>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#08B36A] text-white rounded-xl flex items-center justify-center hover:bg-slate-900 transition-all active:scale-90 shadow-lg shadow-emerald-500/10">
                      <FaPlus className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Action */}
        <section className="bg-slate-900 rounded-[3rem] p-10 sm:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter max-w-2xl mx-auto leading-tight">
              Authentic Meds. <br /><span className="text-[#08B36A]">Verified Partners.</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto font-medium text-sm sm:text-lg pt-4">Join 50k+ users who trust us for their monthly healthcare essentials.</p>
            <div className="pt-10">
              <Link href="/buymedicine/seeallmed">
                <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#08B36A] hover:text-white transition-all">Browse Store</button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#08B36A]/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </section>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default OnlinePharmacy;