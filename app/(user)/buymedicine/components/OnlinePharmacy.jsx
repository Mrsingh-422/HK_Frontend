"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaFlask, FaSearch, FaUpload, FaCheckCircle,
  FaArrowRight, FaTruck, FaShieldAlt, FaPrescription,
  FaPlus, FaCapsules, FaHistory, FaBolt, FaStethoscope, FaBaby, FaWeight, FaHeart
} from "react-icons/fa";
import MedicineDetailsModal from "./otherComponents/MedicineDetailsModal";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { INITIAL_MEDICINES } from "@/app/constants/constants";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const CATEGORIES = [
  { name: "Diabetes", icon: <FaFlask /> },
  { name: "Heart", icon: <FaHeart /> },
  { name: "Baby Care", icon: <FaBaby /> },
  { name: "Wellness", icon: <FaStethoscope /> },
  { name: "Weight", icon: <FaWeight /> },
];

function OnlinePharmacy() {
  const { getPharmacyPageContent, getAllMedicines } = useGlobalContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [loading, setLoading] = useState(true);

  const [pageData, setPageData] = useState({
    mainTitle: "Your Pharmacy Store",
    description: "Authentic medications delivered safely in 02 Hours.",
    card2Title: "Have a prescription?",
    card2Btn: "UPLOAD NOW",
    searchPlaceholder: "Search for medicines or wellness products..."
  });

  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, medRes] = await Promise.all([
          getPharmacyPageContent(),
          getAllMedicines()
        ]);
        if (contentRes?.success && contentRes.data) setPageData(contentRes.data);
        if (medRes?.success) setMedicines(medRes.data || INITIAL_MEDICINES);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, medicines]);

  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => { setIsUploading(false); setUploadSuccess(true); }, 1500);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-[#08B36A]/20 border-t-[#08B36A] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-slate-900">
      <MedicineDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        medicine={selectedMedicine}
        onAddToCart={(med) => console.log("Added:", med)}
      />

      {/* --- 1. MINIMALIST HERO SECTION --- */}
      <section className="bg-emerald-50/50 pt-10 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-[#08B36A] font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100">
               <FaBolt className="animate-pulse" /> 2hr Express Delivery
            </div>
            <h1 className="text-4xl sm:text-7xl font-black text-slate-900 leading-[1.1]">
               {pageData.mainTitle.replace('!', '')}<span className="text-[#08B36A]">.</span>
            </h1>
            <p className="text-slate-500 text-lg sm:text-xl max-w-lg font-medium">
               {pageData.description}
            </p>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1 group">
                  <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                  <input 
                    type="text" 
                    placeholder={pageData.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium"
                  />
               </div>
               <button 
                onClick={handleUploadClick}
                className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#08B36A] transition-all shadow-lg flex items-center justify-center gap-3"
               >
                 {uploadSuccess ? <FaCheckCircle className="text-emerald-400" /> : <FaUpload />}
                 {uploadSuccess ? "Uploaded" : "Prescription"}
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          <div className="hidden lg:flex justify-end relative">
             <div className="w-96 h-96 bg-[#08B36A] rounded-[4rem] rotate-6 absolute opacity-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80" 
               className="w-80 h-[450px] object-cover rounded-[3rem] shadow-2xl relative z-10 -rotate-3 hover:rotate-0 transition-transform duration-700" 
               alt="Pharmacy"
             />
          </div>
        </div>
      </section>

      {/* --- 2. ICONIC CATEGORY BAR --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-8 flex gap-4 overflow-x-auto no-scrollbar">
           <button 
            onClick={() => setActiveCat("All")}
            className={`flex flex-col items-center gap-3 min-w-[100px] p-4 rounded-2xl transition-all border-2
            ${activeCat === "All" ? 'border-[#08B36A] bg-emerald-50/50' : 'border-transparent hover:bg-slate-50'}`}
           >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${activeCat === "All" ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'}`}><FaPlus /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">All Meds</span>
           </button>
           {CATEGORIES.map((cat) => (
             <button 
              key={cat.name}
              onClick={() => setActiveCat(cat.name)}
              className={`flex flex-col items-center gap-3 min-w-[100px] p-4 rounded-2xl transition-all border-2
              ${activeCat === cat.name ? 'border-[#08B36A] bg-emerald-50/50' : 'border-transparent hover:bg-slate-50'}`}
             >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${activeCat === cat.name ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'}`}>{cat.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
             </button>
           ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-16 space-y-16">
        
        {/* --- 3. TRUST SIGNALS --- */}
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

        {/* --- 4. HIGH DENSITY PRODUCT GRID --- */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Popular Medicines</h2>
            <Link href="/buymedicine/seeallmed" className="text-[#08B36A] text-xs font-black uppercase tracking-widest hover:underline">Explore All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredMedicines.slice(0, 12).map((med) => (
              <div key={med._id || med.id} className="group flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500">
                <div className="relative aspect-square bg-slate-50/50 p-6 flex items-center justify-center">
                  <img 
                    src={med.image?.startsWith('http') ? med.image : `${API_URL}${med.image}`} 
                    alt={med.name} 
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                  />
                  {med.actualPrice > med.discountPrice && (
                    <div className="absolute top-4 left-4 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase">
                       {Math.round(((med.actualPrice - med.discountPrice) / med.actualPrice) * 100)}% Off
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-7 flex flex-col flex-1">
                  <span className="text-[9px] font-black text-[#08B36A] uppercase tracking-tighter mb-2">{med.vendor}</span>
                  <h3 className="text-sm sm:text-lg font-black text-slate-800 line-clamp-2 leading-tight mb-4 h-10 sm:h-12">
                    {med.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-300 line-through font-bold block leading-none mb-1">₹{med.actualPrice}</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹{med.discountPrice}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedMedicine(med) || setIsModalOpen(true)}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-[#08B36A] text-white rounded-xl flex items-center justify-center hover:bg-slate-900 transition-all shadow-lg shadow-emerald-500/10 active:scale-90"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 5. CLEAN FOOTER ACTION --- */}
        <section className="bg-slate-900 rounded-[3rem] p-10 sm:p-20 text-center space-y-8 relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter max-w-2xl mx-auto leading-tight">
                Authentic Meds. <br/><span className="text-[#08B36A]">Verified Partners.</span>
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto font-medium text-sm sm:text-lg pt-4">
                Join 50k+ users who trust us for their monthly healthcare essentials.
              </p>
              <div className="pt-10">
                 <Link href="/buymedicine/seeallmed">
                    <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#08B36A] hover:text-white transition-all shadow-2xl">
                       Browse Full Store
                    </button>
                 </Link>
              </div>
           </div>
           {/* Abstract Circle Background */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#08B36A]/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </section>
      </main>
    </div>
  );
}

export default OnlinePharmacy;