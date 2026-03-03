"use client";
import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { INITIAL_MEDICINES } from "../../../constants/constants";
import {
  FaFlask, FaSearch, FaUpload, FaCheckCircle,
  FaTimes, FaArrowRight, FaFilter, FaTruck, FaShieldAlt, FaClock, FaPercent
} from "react-icons/fa";
import MedicineDetailsModal from "./otherComponents/MedicineDetailsModal";

function OnlinePharmacy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("low-to-high");

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMedicines = useMemo(() => {
    let result = INITIAL_MEDICINES.filter((med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortBy === "low-to-high") result.sort((a, b) => a.discountPrice - b.discountPrice);
    else if (sortBy === "high-to-low") result.sort((a, b) => b.discountPrice - a.discountPrice);
    return result;
  }, [searchTerm, sortBy]);

  const visibleMedicines = filteredMedicines.slice(0, 6);

  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsUploading(true);
      setTimeout(() => { setIsUploading(false); setUploadSuccess(true); }, 1500);
    }
  };

  const handleAddToCart = (medicine) => {
    // Implement your cart logic here
    console.log("Added to cart:", medicine);
  };

  const handleBuyClick = (med) => {
    setSelectedMedicine(med);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <MedicineDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        medicine={selectedMedicine}
        onAddToCart={handleAddToCart}
      />
      <div className="max-w-7xl mx-auto space-y-12">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {/* ================= HEADER SECTION ================= */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight">
            Online Pharmacy<span className="text-[#08B36A]">!</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Authentic medications and healthcare essentials. <br className="hidden md:block" />
            <span className="text-[#08B36A] font-bold">Verified. Reliable. Delivered in 02 Hours.</span>
          </p>
          <div className="w-24 h-1.5 bg-[#08B36A] mx-auto rounded-full opacity-30"></div>
        </div>

        {/* ================= TOP ACTION CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center transition-all hover:shadow-xl">
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest mb-6">Regular Basis?</p>
            <button className="w-full py-4 border-2 border-[#08B36A] text-[#08B36A] font-black rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all text-xs tracking-widest">BOOK A REFILL</button>
          </div>

          <div className={`p-8 rounded-[2rem] shadow-lg border text-center transition-all ${uploadSuccess ? 'bg-slate-900 border-slate-800' : 'bg-[#08B36A] border-emerald-400 shadow-[#08B36A]/20'}`}>
            <p className="text-white/90 text-sm font-black uppercase tracking-widest mb-6">Have a prescription?</p>
            <button onClick={handleUploadClick} className="w-full py-4 bg-white text-[#08B36A] font-black rounded-2xl flex items-center justify-center gap-3 text-xs tracking-widest shadow-lg active:scale-95 transition-transform">
              {isUploading ? <div className="animate-spin h-4 w-4 border-2 border-[#08B36A] border-t-transparent rounded-full" /> : uploadSuccess ? <FaCheckCircle className="text-emerald-500" /> : <FaUpload />}
              {isUploading ? "PROCESS..." : uploadSuccess ? "ATTACHED" : "UPLOAD NOW"}
            </button>
          </div>

          <div className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center transition-all hover:shadow-xl">
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest mb-6">No prescription?</p>
            <button className="w-full py-4 border-2 border-[#08B36A] text-[#08B36A] font-black rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all text-xs tracking-widest">GET STARTED</button>
          </div>
        </div>

        {/* ================= BODY SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">

          {/* Left Sidebar */}
          <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-40 h-fit">
            <div className="border-l-8 border-[#08B36A] pl-8 space-y-4">
              <span className="text-[#08B36A] font-black uppercase tracking-[0.3em] text-xs">Express Service</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                Delivery <br /> Open 24/7 <FaFlask className="inline text-[#08B36A] animate-bounce ml-2" />
              </h2>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                <input
                  type="text"
                  placeholder="Search medicines, wellness, brands..."
                  className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-none bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#08B36A] transition-all text-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <FaTruck className="text-[#08B36A] text-xl" />
                  <span className="text-[10px] font-black uppercase text-slate-500">2hr Delivery</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <FaShieldAlt className="text-[#08B36A] text-xl" />
                  <span className="text-[10px] font-black uppercase text-slate-500">100% Genuine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Results Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {visibleMedicines.map((med) => (
                <div key={med.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group">
                  {/* Product Image Area */}
                  <div className="relative h-48 w-full bg-slate-50 rounded-[2rem] overflow-hidden mb-6 p-6 flex items-center justify-center">
                    <img src={med.image} alt={med.name} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-[#08B36A] text-white p-2 rounded-xl shadow-lg flex items-center gap-1">
                      <FaPercent className="text-[10px]" />
                      <span className="text-xs font-black">{Math.round(((med.actualPrice - med.discountPrice) / med.actualPrice) * 100)}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-[#08B36A] transition-colors line-clamp-1">{med.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{med.vendor}</p>

                    <div className="pt-4 mt-4 border-t border-slate-50 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase line-through opacity-50 mb-[-2px]">₹{med.actualPrice}</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{med.discountPrice}</span>
                      </div>
                      <button
                        onClick={() => handleBuyClick(med)}
                        className="bg-slate-900 hover:bg-[#08B36A] text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-90 uppercase text-[10px] tracking-widest">
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SEE ALL ACTION */}
            <div className="pt-10 text-center">
              <Link href="/buymedicine/seeallmed">
                <button className="inline-flex items-center gap-4 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-12 py-5 rounded-[2rem] hover:bg-[#08B36A] hover:text-white transition-all shadow-xl active:scale-95 group">
                  Browse All Medicines
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OnlinePharmacy;