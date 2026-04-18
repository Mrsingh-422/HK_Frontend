"use client";

import React from "react";
import { useRouter } from "next/navigation";
// Corrected Icon Imports
import { 
  FaFileMedical, 
  FaTruck, 
  FaNotesMedical, 
  FaWhatsapp, 
  FaChevronRight,
  FaFileInvoice
} from "react-icons/fa";

export default function SomeDesign() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-20 font-sans bg-[#F8FAFC]">
      
      {/* --- 1. PREMIUM HERO BANNER --- */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#08B36A] to-[#047a48] text-white">
          <div className="flex flex-col md:flex-row items-center justify-between px-8 py-12 md:px-20 md:py-20">
            <div className="md:w-1/2 z-10 text-center md:text-left">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[2px] mb-6 inline-block">
                Verified Pharmacy
              </span>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6">
                Your Health, <br /> Our Priority.
              </h1>
              <p className="text-white/80 text-lg mb-8 font-medium max-w-md">
                Get genuine medicines and healthcare essentials delivered to your doorstep within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="bg-white text-[#08B36A] px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
                  Order Now
                </button>
                <button className="bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-black hover:bg-white/10 transition-all">
                  View Offers
                </button>
              </div>
            </div>
            
            {/* Image Section */}
            <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
                <div className="w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full absolute blur-3xl animate-pulse" />
                <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500&auto=format&fit=crop" 
                    alt="Healthcare" 
                    className="relative z-10 w-full max-w-sm rounded-[40px] shadow-2xl transition-transform hover:scale-105 duration-700"
                />
            </div>
          </div>

          {/* Abstract Shapes for Design */}
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* --- 2. ACTION CARDS (Prescription & WhatsApp) --- */}
      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Prescription Card */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 flex items-center justify-between group cursor-pointer hover:border-[#08B36A] hover:shadow-xl hover:shadow-[#08B36A]/5 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#08B36A]/10 rounded-2xl flex items-center justify-center text-[#08B36A] group-hover:scale-110 transition-transform">
              <FaFileInvoice size={30} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl">Quick Order</h3>
              <p className="text-sm text-slate-500 font-medium">Upload prescription & we'll call you</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-full group-hover:bg-[#08B36A] group-hover:text-white transition-all">
            <FaChevronRight size={14} />
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 flex items-center justify-between group cursor-pointer hover:border-green-500 hover:shadow-xl hover:shadow-green-500/5 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <FaWhatsapp size={32} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl">WhatsApp Order</h3>
              <p className="text-sm text-slate-500 font-medium">Chat with us to buy medicines</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-full group-hover:bg-green-500 group-hover:text-white transition-all">
            <FaChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* --- 3. TRUST STRIP --- */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="bg-slate-900 rounded-[40px] px-8 py-12 flex flex-wrap gap-10 justify-around items-center text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#08B36A]/20 blur-[80px]" />
            
            <TrustFeature 
                icon={<FaTruck size={24} className="text-[#08B36A]" />} 
                title="Free Shipping" 
                desc="Orders above ₹500" 
            />
            <div className="w-[1px] h-12 bg-white/10 hidden lg:block"></div>
            <TrustFeature 
                icon={<FaFileMedical size={24} className="text-[#08B36A]" />} 
                title="100% Genuine" 
                desc="Direct from Pharma" 
            />
            <div className="w-[1px] h-12 bg-white/10 hidden lg:block"></div>
            <TrustFeature 
                icon={<FaNotesMedical size={24} className="text-[#08B36A]" />} 
                title="Expert Help" 
                desc="Verified Pharmacists" 
            />
        </div>
      </div>

    </div>
  );
}

// Helper Component for the Trust Strip
function TrustFeature({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-5 z-10">
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-lg tracking-tight">{title}</h4>
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}