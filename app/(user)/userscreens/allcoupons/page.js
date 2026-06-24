"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTicketAlt, FaCopy, FaCalendarAlt, FaShieldAlt,
  FaArrowLeft, FaCheckCircle, FaPrescriptionBottleAlt,
  FaUserNurse, FaMicroscope, FaHospital, FaAmbulance, FaUserMd,
  FaPercentage
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

const categoryConfig = {
  General: { icon: <FaTicketAlt size={16} />, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600', bgColor: 'bg-blue-50/70', border: 'border-blue-100' },
  Pharmacy: { icon: <FaPrescriptionBottleAlt size={16} />, color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50/70', border: 'border-emerald-100' },
  Nurse: { icon: <FaUserNurse size={16} />, color: 'from-teal-500 to-teal-600', textColor: 'text-teal-600', bgColor: 'bg-teal-50/70', border: 'border-teal-100' },
  Lab: { icon: <FaMicroscope size={16} />, color: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50/70', border: 'border-indigo-100' },
  Hospital: { icon: <FaHospital size={16} />, color: 'from-rose-500 to-rose-600', textColor: 'text-rose-600', bgColor: 'bg-rose-50/70', border: 'border-rose-100' },
  Ambulance: { icon: <FaAmbulance size={16} />, color: 'from-red-500 to-red-600', textColor: 'text-red-600', bgColor: 'bg-red-50/70', border: 'border-red-100' },
  Doctor: { icon: <FaUserMd size={16} />, color: 'from-violet-500 to-violet-600', textColor: 'text-violet-600', bgColor: 'bg-violet-50/70', border: 'border-violet-100' },
};

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.getAllCoupons();
        if (res.success) {
          setCoupons(res.data);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to load active coupons");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // Filter keys that actually contain array items from the API
  const categoryKeys = useMemo(() => {
    if (!coupons) return [];
    return Object.keys(coupons).filter(key => Array.isArray(coupons[key]));
  }, [coupons]);

  // Combine and filter coupons based on selected active category
  const filteredCoupons = useMemo(() => {
    if (!coupons) return [];

    if (activeTab === 'All') {
      const all = [];
      Object.keys(coupons).forEach(category => {
        if (Array.isArray(coupons[category])) {
          coupons[category].forEach(coupon => {
            all.push({ ...coupon, category });
          });
        }
      });
      return all;
    }

    return (coupons[activeTab] || []).map(coupon => ({ ...coupon, category: activeTab }));
  }, [coupons, activeTab]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied!`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">

      {/* --- TOP UTILITY BAR --- */}
      <nav className="sticky top-0 z-[100] bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center gap-2 px-3.5 py-2 bg-white border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 rounded-xl text-slate-500 hover:text-emerald-700 transition-all shadow-sm active:scale-95 w-fit"
          >
            <FaArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">Back</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Active Offers</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">

        {/* --- PAGE INTRO --- */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Exclusive Offers & <span className="text-emerald-600">Discounts</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-3">
            Save extra on medicines, tests, nurse visits, and wellness checks
          </p>
        </div>

        {/* --- CATEGORY TAB SWITCHER --- */}
        {categoryKeys.length > 0 && (
          <div className="flex overflow-x-auto gap-2.5 pb-4 mb-10 no-scrollbar">
            <button
              onClick={() => setActiveTab('All')}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${activeTab === 'All'
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              All Categories
            </button>
            {categoryKeys.map((category) => {
              const config = categoryConfig[category] || { icon: <FaTicketAlt />, color: 'from-slate-500 to-slate-600' };
              const isSelected = activeTab === category;
              const count = coupons?.[category]?.length || 0;
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:bg-emerald-50/10'
                    }`}
                >
                  <span className={isSelected ? 'text-white' : config.textColor}>{config.icon}</span>
                  {category} <span className="opacity-45">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* --- LOADING SKELETONS --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-white rounded-[2rem] border border-slate-100 p-6 animate-pulse" />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <FaTicketAlt size={24} />
            </div>
            <p className="text-base font-bold text-slate-800">No coupons active</p>
            <p className="text-slate-400 text-xs mt-1">Check back later for fresh coupons in this category.</p>
          </div>
        ) : (
          /* --- COUPON TICKETS GRID --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => {
              const config = categoryConfig[coupon.category] || { icon: <FaTicketAlt />, color: 'from-slate-500 to-slate-600', border: 'border-slate-100', bgColor: 'bg-slate-50/70', textColor: 'text-slate-600' };
              return (
                <div
                  key={coupon._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(20,184,166,0.08)] hover:border-emerald-100 transition-all duration-300 flex overflow-hidden h-44"
                >
                  {/* Left Side: Percentage Block */}
                  <div className={`w-32 md:w-36 bg-gradient-to-br ${config.color} text-white flex flex-col items-center justify-center text-center p-3 relative shrink-0`}>
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-1.5">
                      {config.icon}
                    </div>
                    <span className="text-3xl font-black tracking-tighter leading-none flex items-center">
                      {coupon.discountPercentage}
                      <span className="text-lg font-black ml-0.5">%</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">OFF</span>
                  </div>

                  {/* Coupon Ticket Divider with semicircles */}
                  <div className="w-px border-l-2 border-dashed border-slate-200 relative shrink-0">
                    <div className="absolute top-0 -translate-y-1/2 left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-100 border-t-transparent" />
                    <div className="absolute bottom-0 translate-y-1/2 left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-100 border-b-transparent" />
                  </div>

                  {/* Right Side: Details & Copy Action */}
                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0 relative">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${config.textColor} ${config.bgColor} ${config.border}`}>
                          {coupon.category}
                        </span>
                        {coupon.minOrderAmount > 0 && (
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                            Min Order: ₹{coupon.minOrderAmount}
                          </span>
                        )}
                      </div>

                      {/* Coupon Code Name */}
                      <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight uppercase mt-1">
                        {coupon.couponName}
                      </h3>

                      {/* Max discount tag */}
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        Max savings up to <span className="font-bold text-slate-600">₹{coupon.maxDiscount}</span> per request.
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1 gap-2">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                        <FaCalendarAlt size={10} className="text-slate-300" />
                        <span>Expires {formatDate(coupon.expiryDate)}</span>
                      </div>

                      {/* Interactive Copy Code Badge */}
                      <button
                        onClick={() => handleCopyCode(coupon.couponName)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all active:scale-95 shrink-0"
                      >
                        <FaCopy size={8} /> Copy
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* --- BRAND FOOTER STRIP --- */}
        <div className="mt-12 py-6 border-y border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center justify-center gap-2">
            <FaShieldAlt className="text-emerald-600 flex-shrink-0" size={18} />
            <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">100% Verified Coupons</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <FaCheckCircle className="text-emerald-600 flex-shrink-0" size={18} />
            <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">Maximum Discounts</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <FaTicketAlt className="text-emerald-600 flex-shrink-0" size={18} />
            <span className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">Instant Order Refills</span>
          </div>
        </div>

      </main>

      {/* CSS to hide standard scrollbar rails */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}