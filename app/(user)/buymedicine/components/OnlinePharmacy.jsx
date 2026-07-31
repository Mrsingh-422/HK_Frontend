"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaFlask, FaSearch, FaUpload, FaCheckCircle,
  FaArrowRight, FaTruck, FaShieldAlt, FaPrescription,
  FaPlus, FaHistory, FaBolt, FaStethoscope, FaBaby, FaWeight, FaHeart, FaTimes, FaThLarge, FaPills
} from "react-icons/fa";

// Context & Services
import { useGlobalContext } from "@/app/context/GlobalContext";
import UserAPI from "@/app/services/UserAPI";

// Fallback category configurations for items lacking remote assets
const FALLBACK_ICONS = {
  "Diabetes": <FaFlask />,
  "Heart": <FaHeart />,
  "Cardiac Care": <FaHeart />,
  "Baby Care": <FaBaby />,
  "Wellness": <FaStethoscope />,
  "Weight": <FaWeight />,
  "Fitness & Supplements": <FaWeight />,
  "Medicines": <FaPills />,
  "Personal Care": <FaThLarge />
};

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
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [medsLoading, setMedsLoading] = useState(false);

  const [pageData, setPageData] = useState({
    mainTitle: "Your Pharmacy Store",
    description: "Authentic medications delivered safely in 02 Hours.",
    searchPlaceholder: "Search for medicines or wellness products..."
  });

  // Your local network backend image assets path
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";

  // Resolves the medicine product image using the API array fallback rules
  const getMedImage = (med) => {
    const path = med.image_url?.[0] || med.image || med.profileImage;
    if (!path) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXcBKQGSyQzxK18TWiEw7uVtX2JD-LgIdSWQ&s";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Fallback for placeholder strings
    if (path.startsWith('img_')) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXcBKQGSyQzxK18TWiEw7uVtX2JD-LgIdSWQ&s";

    const cleanedPath = path.replace(/^public\//, '');
    const base = IMAGE_BASE_URL.replace(/\/+$/, '');
    const target = cleanedPath.replace(/^\/+/, '');
    return `${base}/${target}`;
  };

  // Initial Content and Category Mount Load
  useEffect(() => {
    const fetchInitialMetadata = async () => {
      try {
        setLoading(true);
        const [contentRes, catRes, medRes] = await Promise.all([
          getPharmacyPageContent(),
          UserAPI.getAllMedicineCategories(),
          UserAPI.getNonPrescriptionProducts("Medicines") // Default load container setup
        ]);

        if (contentRes?.success && contentRes.data) setPageData(contentRes.data);

        if (catRes?.success && Array.isArray(catRes.data)) {
          setDynamicCategories(catRes.data);
        }

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
    fetchInitialMetadata();
  }, []);

  // On-demand inventory fetching triggered whenever activeCat state updates
  useEffect(() => {
    // Skip execution during initial mount to let primary sync handle state assignment
    if (loading) return;

    const fetchFilteredProducts = async () => {
      try {
        setMedsLoading(true);
        // If "All" is active, query generic "Medicines" category default fallbacks
        const targetingCategory = activeCat === "All" ? "Medicines" : activeCat;
        const medRes = await UserAPI.getNonPrescriptionProducts(targetingCategory);

        if (medRes) {
          const medData = medRes.data || medRes;
          setMedicines(Array.isArray(medData) ? medData : []);
        }
      } catch (err) {
        console.error("Error querying targeted operational category data rows:", err);
        setMedicines([]);
      } finally {
        setMedsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [activeCat]);

  // Search API Logic (Suggestions Dropdown)
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
    }, 400);

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

  // Client side lookup filter for text typing matches inside active container state arrays
  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    return medicines.filter((med) =>
      med.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, medicines]);

  if (loading) return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-[#FAFBFD]">
      <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Initializing Portal</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFD] pb-20 font-['Plus_Jakarta_Sans'] text-slate-900 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-b from-emerald-50/40 via-transparent to-transparent pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-emerald-100/60">
              <FaBolt className="text-emerald-500 animate-pulse text-xs" /> 2hr Express Delivery
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.08] tracking-tight">
              {pageData.mainTitle.replace('!', '')}<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg max-w-lg font-medium leading-relaxed">{pageData.description}</p>

            <div className="flex flex-col sm:flex-row gap-4 relative" ref={searchRef}>
              <div className="relative flex-1 group">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  placeholder={pageData.searchPlaceholder}
                  value={searchTerm}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-13 pr-12 py-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all font-medium text-slate-800 text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
                  >
                    <FaTimes size={14} />
                  </button>
                )}

                {/* --- SEARCH SUGGESTIONS DROPDOWN --- */}
                {showSuggestions && (
                  <div className="absolute top-[115%] left-0 w-full bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] border border-slate-100 overflow-hidden z-[100]">
                    <div className="max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
                      {suggestions.length > 0 ? (
                        suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              router.push(`/buymedicine/singleproductdetail/${item.id}`);
                              setShowSuggestions(false);
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                          >
                            <div className="w-11 h-11 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100">
                              <img src={getMedImage(item)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-bold text-slate-800 truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate mt-0.5">{item.salt}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-extrabold text-slate-900">₹{item.best_price || item.bestPrice || item.price || 0}</span>
                              {item.discount && <span className="block text-[10px] font-bold text-emerald-600 mt-0.5">{item.discount} Off</span>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 font-medium text-sm">
                          {isSearching ? "Searching catalog details..." : "No matching diagnostics found"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push('/buymedicine/uploadprescription')}
                className="px-7 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 bg-slate-900 text-white hover:bg-emerald-600 shrink-0"
              >
                <FaUpload size={12} /> Upload Prescription
              </button>
            </div>
          </div>
          <div className="hidden lg:flex justify-end relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/20 to-transparent blur-3xl rounded-full transform translate-x-12 translate-y-12 -z-10"></div>
            <img
              src="https://dynamic.brandcrowd.com/template/preview/design/c0c454d4-4af7-4a54-b47f-cf1c8097d32c?v=4&designTemplateVersion=1&size=design-preview-standalone-1x"
              className="w-80 h-[440px] object-cover rounded-[2.5rem] shadow-[0_30px_70px_rgba(15,23,42,0.08)] relative z-10 -rotate-2 hover:rotate-0 transition-transform duration-700 ease-out"
              alt="Pharmacy Hub"
            />
          </div>
        </div>
      </section>

      {/* --- DYNAMIC CATEGORY BAR --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgba(148,163,184,0.08)] border border-slate-100 p-4 sm:p-6 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveCat("All")}
            className={`flex flex-col items-center gap-2.5 min-w-[95px] p-3 rounded-2xl transition-all duration-300 border-2 ${activeCat === "All" ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent hover:bg-slate-50'}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base transition-colors ${activeCat === "All" ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
              <FaThLarge size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 tracking-tight whitespace-nowrap">All Meds</span>
          </button>

          {dynamicCategories.map((cat, idx) => {
            const isSelected = activeCat === cat.name;
            const base = IMAGE_BASE_URL.replace(/\/+$/, '');
            const target = (cat.image || '').replace(/^\/+/, '');
            const categoryImageSrc = cat.image?.startsWith('http') ? cat.image : `${base}/${target}`;
            const fallbackIcon = FALLBACK_ICONS[cat.name] || <FaThLarge size={14} />;

            return (
              <button
                key={cat.name || idx}
                onClick={() => setActiveCat(cat.name)}
                className={`flex flex-col items-center gap-2.5 min-w-[95px] p-3 rounded-2xl transition-all duration-300 border-2 ${isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base overflow-hidden border border-transparent transition-colors ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  {cat.image ? (
                    <img
                      src={categoryImageSrc}
                      alt=""
                      className={`w-full h-full object-cover ${isSelected ? 'opacity-90 mix-blend-luminosity' : ''}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<span class="text-slate-400">${fallbackIcon}</span>`;
                      }}
                    />
                  ) : (
                    fallbackIcon
                  )}
                </div>
                <div className="text-center w-full">
                  <span className="text-[11px] font-bold text-slate-700 tracking-tight block truncate max-w-[85px]">{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{cat.productCount} Items</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-20">
        {/* Trust Signals */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FaTruck className="text-emerald-600 text-base" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Express</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">2 Hour Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-emerald-600 text-base" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Verified</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">100% Genuine</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FaHistory className="text-emerald-600 text-base" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Refill</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Quick Reordering</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FaPrescription className="text-emerald-600 text-base" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Licensed</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Certified Partners</p>
            </div>
          </div>
        </section>

        {/* Medicine Grid */}
        <section>
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Popular Medicines</h2>
              <p className="text-xs text-slate-400 font-medium">Currently showing live items matching your selection: <span className="text-emerald-600 font-bold">{activeCat}</span></p>
            </div>
            <Link href="/buymedicine/seeallmed" className="hidden sm:block text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-slate-900 transition-colors">Explore Store</Link>
          </div>

          {medsLoading ? (
            <div className="w-full py-20 flex flex-col justify-center items-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Updating Inventory Grid</p>
            </div>
          ) : filteredMedicines.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredMedicines.slice(0, 8).map((med, index) => {
                const displayPrice = med.best_price || med.bestPrice || med.minimumPrice || 0;
                return (
                  <div
                    key={med._id || med.Id || index}
                    onClick={() => router.push(`/buymedicine/singleproductdetail/${med._id || med.Id}`)}
                    className="group cursor-pointer flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden hover:border-transparent hover:shadow-[0_22px_50px_rgba(148,163,184,0.12)] transition-all duration-500"
                  >
                    <div className="relative aspect-square bg-slate-50/60 overflow-hidden flex items-center justify-center">
                      <img
                        src={getMedImage(med)}
                        alt={med.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {med.discont_percent && parseInt(med.discont_percent) > 0 && (
                        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                          {med.discont_percent} Off
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 bg-white">
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide mb-1 truncate block">{med.manufacturers || "Premium Formulation"}</span>
                      <h3 className="text-[15px] font-bold text-slate-800 line-clamp-2 h-11 leading-snug group-hover:text-emerald-700 transition-colors duration-300">{med.name}</h3>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {med.mrp && parseFloat(med.mrp) > parseFloat(displayPrice || 0) && (
                            <span className="text-xs text-slate-300 line-through font-medium block mb-0.5">₹{med.mrp}</span>
                          )}
                          <span className="text-lg font-extrabold text-slate-900 tracking-tight">₹{displayPrice}</span>
                        </div>
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-100 active:scale-95 shrink-0">
                          <FaPlus size={11} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaSearch className="text-slate-300 text-lg" />
              </div>
              <p className="text-slate-700 font-bold text-sm tracking-wide">No Medicines Found</p>
              <p className="text-slate-400 text-xs mt-1">No operational products found inside the network cluster matching the context category.</p>
            </div>
          )}
        </section>

        {/* Footer Action */}
        <section className="bg-slate-900 rounded-[2.5rem] p-10 sm:p-16 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Authentic Meds. <br className="sm:hidden" /><span className="text-emerald-500">Verified Partners.</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base max-w-md mx-auto">Join 50k+ users who trust our system logistics map for their healthcare essentials.</p>
            <div className="pt-4">
              <Link href="/buymedicine/seeallmed">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-md">Browse Store</button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </section>
      </main>
    </div>
  );
}

export default OnlinePharmacy;