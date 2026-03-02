import React, { useState, useMemo } from "react";
import { 
  FaSearch, FaFilter, FaStar, FaAmbulance, 
  FaTimes, FaArrowRight, FaMapMarkerAlt, FaChevronRight, FaCheckCircle 
} from "react-icons/fa";

// 1. DATA OBJECT
const REFERRAL_DATA = [
  { id: 1, name: "Premium Referral ALS", type: "ALS", vendor: "City Hospital", price: 1200, distance: 3.2, rating: 5, image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Standard Referral BLS", type: "BLS", vendor: "Red Cross", price: 750, distance: 1.5, rating: 4, image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Patient Transport Unit", type: "PTV", vendor: "Safe Transit", price: 500, distance: 5.8, rating: 3, image: "https://images.unsplash.com/photo-1612994370726-5d4d609fca1b?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Newborn Care Unit", type: "NNA", vendor: "Mother Care", price: 2000, distance: 10.1, rating: 5, image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Inter-city ALS", type: "ALS", vendor: "Global Rescue", price: 1800, distance: 2.1, rating: 4, image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "Eco BLS", type: "BLS", vendor: "Local Health", price: 600, distance: 4.5, rating: 4, image: "https://images.unsplash.com/photo-1612994370726-5d4d609fca1b?auto=format&fit=crop&w=400&q=80" },
  { id: 7, name: "Advanced PTV", type: "PTV", vendor: "Direct Med", price: 900, distance: 0.8, rating: 5, image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80" },
  { id: 8, name: "Specialized NNA", type: "NNA", vendor: "Apex Labs", price: 2500, distance: 14.3, rating: 5, image: "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=400&q=80" },
];

const types = [
  { id: "ALS", label: "ALS", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
  { id: "BLS", label: "BLS", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
  { id: "PTV", label: "PTV", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
  { id: "NNA", label: "NNA", img: "https://cdn-icons-png.flaticon.com/512/1032/1032989.png" },
];

function FindReferralAmbulance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [showLimit, setShowLimit] = useState(6);

  // SEARCH & SORT LOGIC
  const processedData = useMemo(() => {
    let filtered = REFERRAL_DATA.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "price") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "distance") return [...filtered].sort((a, b) => a.distance - b.distance);
    if (sortBy === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);
    
    return filtered;
  }, [searchTerm, sortBy]);

  const visibleItems = processedData.slice(0, showLimit);
  const hasMore = processedData.length > showLimit;

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT LISTING SECTION (Desktop 7 Cols) */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          {/* RESULTS HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
            <p className="text-slate-700 font-bold text-sm sm:text-base">
              <span className="text-blue-600">{processedData.length} Referral Ambulance</span> Found(s)
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FaFilter className="text-[#08B36A] text-xs" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border-none text-[11px] sm:text-xs font-black text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-[#08B36A] cursor-pointer uppercase tracking-widest"
              >
                <option value="recommended">Sort: Default</option>
                <option value="distance">Sort: Nearest</option>
                <option value="price">Sort: Budget</option>
                <option value="rating">Sort: Top Rated</option>
              </select>
            </div>
          </div>

          {/* LISTINGS */}
          <div className="space-y-4">
            {visibleItems.length > 0 ? (
              <>
                {visibleItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Image Area */}
                      <div className="w-full sm:w-36 md:w-44 h-40 sm:h-36 md:h-44 flex-shrink-0 relative overflow-hidden rounded-2xl bg-slate-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-0.5 rounded-md text-[8px] font-black shadow-lg">REFERRAL</div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg md:text-xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{item.name}</h3>
                              <p className="text-[#08B36A] font-bold text-[10px] uppercase tracking-widest">{item.vendor}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <FaStar className="text-yellow-400 text-[10px]" />
                              <span className="text-[10px] font-black text-yellow-700">{item.rating}.0</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                                <FaAmbulance className="text-[#08B36A]" /> {item.type}
                            </span>
                            <span className="bg-emerald-50 text-[#08B36A] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                                <FaMapMarkerAlt /> {item.distance}km
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Starting from</p>
                            <p className="text-xl font-black text-slate-900">₹{item.price}</p>
                          </div>
                          <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                            Book <FaChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* SEE MORE LOGIC */}
                {hasMore ? (
                  <div className="pt-6 text-center">
                    <button 
                      onClick={() => setShowLimit(processedData.length)}
                      className="inline-flex items-center gap-2 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-3 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                    >
                      See More Ambulances <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : processedData.length > 6 && (
                    <div className="pt-6 text-center">
                    <button 
                      onClick={() => setShowLimit(6)}
                      className="text-slate-400 font-bold text-xs hover:text-[#08B36A] transition-colors underline underline-offset-4"
                    >
                      Show Less
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <FaAmbulance className="mx-auto text-5xl text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No referral units found</p>
                <button onClick={() => setSearchTerm("")} className="mt-4 text-[#08B36A] font-bold underline text-sm">Clear Search</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SEARCH SECTION (Desktop 5 Cols) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35 h-fit order-1 lg:order-2">
          <div className="border-l-4 border-[#08B36A] pl-6 space-y-4">
            <h4 className="text-[#08B36A] font-black uppercase tracking-widest text-[10px]">BOOK REFERRAL AMBULANCE</h4>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Find Referral <br /> Ambulance! 🚑
            </h1>
            <p className="text-lg font-bold text-slate-700">24*7 Service Available</p>
          </div>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
            Reliable inter-hospital and specialist referral transport. Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo porro quos delectus exercitationem illo.
          </p>

          {/* AMBULANCE TYPES GRID */}
          <div className="space-y-4">
            <h5 className="text-slate-800 font-black text-xs uppercase tracking-widest">Select Type Of Ambulance</h5>
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-sm">
              {types.map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-[#08B36A] group-hover:shadow-md transition-all">
                    <img src={t.img} alt={t.label} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-[#08B36A] transition-colors">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="space-y-4 max-w-md">
            <label className="text-[#08B36A] font-black text-[10px] uppercase tracking-[0.2em]">Find Your Referral Ambulance</label>
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setShowLimit(6);}}
                placeholder="Search Referral Ambulance"
                className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-sm"
              />
              {searchTerm && <FaTimes className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => setSearchTerm("")} />}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FindReferralAmbulance;