"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  FaMicroscope, 
  FaClock, 
  FaFlask, 
  FaChevronRight, 
  FaHome, 
  FaShieldAlt 
} from "react-icons/fa";

const TESTS = [
  {
    id: 1,
    name: "Full Body Checkup",
    includes: "82 Parameters",
    time: "24-48 hrs",
    price: 799,
    mrp: 1999,
    discount: "60% OFF",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Thyroid Profile (T3, T4, TSH)",
    includes: "3 Parameters",
    time: "12-24 hrs",
    price: 299,
    mrp: 500,
    discount: "40% OFF",
    tag: "Essential",
  },
  {
    id: 3,
    name: "Diabetes Care Package",
    includes: "45 Parameters",
    time: "24 hrs",
    price: 499,
    mrp: 1200,
    discount: "58% OFF",
    tag: "Recommended",
  },
  {
    id: 4,
    name: "Vitamin D (25-OH)",
    includes: "1 Parameter",
    time: "24 hrs",
    price: 550,
    mrp: 900,
    discount: "38% OFF",
    tag: "Popular",
  },
  {
    id: 5,
    name: "CBC (Complete Blood Count)",
    includes: "20 Parameters",
    time: "12 hrs",
    price: 199,
    mrp: 400,
    discount: "50% OFF",
    tag: "Routine",
  },
];

export default function LabTests() {
  const router = useRouter();

  return (
    <section className="py-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* --- HEADER --- */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#08B36A]/10 rounded-lg flex items-center justify-center text-[#08B36A]">
                    <FaMicroscope size={16} />
                </div>
                <span className="text-[#08B36A] text-[10px] font-black uppercase tracking-widest">Diagnostic Services</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Lab Tests</h2>
            <p className="text-sm text-slate-500 font-medium">Safe home sample collection</p>
          </div>
          
          <button 
            onClick={() => router.push("/all-lab-tests")}
            className="group flex items-center gap-2 text-xs font-bold text-[#08B36A] hover:bg-[#08B36A] hover:text-white border border-[#08B36A] px-4 py-2 rounded-full transition-all"
          >
            VIEW ALL <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- SINGLE LINE HORIZONTAL SCROLL --- */}
        <div className="flex flex-nowrap overflow-x-auto gap-5 pb-8 scrollbar-hide snap-x snap-mandatory">
          {TESTS.map((test) => (
            <div 
              key={test.id}
              className="flex-shrink-0 w-[260px] md:w-[300px] snap-start group relative bg-white border border-slate-100 rounded-[24px] p-5 transition-all duration-300 hover:shadow-xl hover:border-[#08B36A]/20 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Section */}
              <div>
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-1 rounded-md uppercase">
                        {test.tag}
                    </span>
                    <div className="text-[#08B36A] bg-[#08B36A]/5 p-2 rounded-xl group-hover:bg-[#08B36A] group-hover:text-white transition-colors">
                        <FaFlask size={16} />
                    </div>
                </div>

                <h3 className="text-base font-black text-slate-800 leading-tight mb-2 group-hover:text-[#08B36A] transition-colors line-clamp-1">
                  {test.name}
                </h3>
                
                <p className="text-[11px] text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#08B36A]"></span>
                    Includes {test.includes}
                </p>

                <div className="flex gap-2 mb-6">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <FaClock className="text-slate-400" size={10} />
                        <span className="text-[10px] font-bold text-slate-600">{test.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <FaHome className="text-slate-400" size={10} />
                        <span className="text-[10px] font-bold text-slate-600">Home</span>
                    </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">₹{test.price}</span>
                    <span className="text-[10px] text-[#08B36A] font-bold">{test.discount}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-through font-medium">MRP ₹{test.mrp}</span>
                </div>
                
                <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-[#08B36A] transition-all shadow-lg active:scale-95">
                  BOOK
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CSS to hide scrollbar */}
        <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>

        {/* --- QUALITY PROMISE --- */}
        <div className="mt-4 bg-[#F1F9F5] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-center gap-8 border border-[#08B36A]/10">
            <div className="flex items-center gap-3">
                <FaShieldAlt className="text-[#08B36A]" size={20} />
                <div>
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">NABL Accredited</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Highest accuracy guaranteed</p>
                </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-[#08B36A]/20"></div>
            <div className="flex items-center gap-3">
                <FaHome className="text-[#08B36A]" size={20} />
                <div>
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Free Home Sample</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Safe & contactless collection</p>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}