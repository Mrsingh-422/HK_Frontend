import React from "react";
import {
  FaFlask, FaMicroscope, FaStethoscope,
  FaArrowRight, FaTag, FaCheckCircle, FaClock
} from "react-icons/fa";

// Static Data for Showcase
const OFFERS_SHOWCASE = [
  {
    id: 1,
    title: "Comprehensive Lab Suite",
    subtitle: "Complete Diagnostics",
    description: "Full body checkup covering 85+ parameters including liver, kidney, and heart health markers.",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=800&auto=format&fit=crop",
    offerLabel: "Season Special",
    offerValue: "50% OFF",
    couponCode: "LAB50",
    themeColor: "emerald"
  },
  {
    id: 2,
    title: "Pathology Premium",
    subtitle: "Advanced Screening",
    description: "Expert sample analysis with certified reports delivered to your dashboard in 12 hours.",
    image: "https://images.unsplash.com/photo-1579152276503-3e1987625902?q=80&w=800&auto=format&fit=crop",
    offerLabel: "Member Only",
    offerValue: "₹500 OFF",
    couponCode: "SAVE500",
    themeColor: "blue"
  },
  {
    id: 3,
    title: "Diabetes Care Pro",
    subtitle: "Sugar Monitoring",
    description: "Monthly HbA1c and glucose monitoring package with complimentary home collection.",
    image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=800&auto=format&fit=crop",
    offerLabel: "Instant Deal",
    offerValue: "FLAT 30%",
    couponCode: "GLUCO30",
    themeColor: "rose"
  }
];

const OfferCard = ({ data }) => {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100"
  };

  return (
    <div className="group relative w-full bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">

      {/* 1. THE BIG CARD: HEADER & IMAGE */}
      <div className="relative w-full h-56 rounded-[2.5rem] overflow-hidden mb-6">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
          <FaCheckCircle className="text-emerald-500 text-xs" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Verified Lab</span>
        </div>
      </div>

      {/* 2. THE BIG CARD: CONTENT */}
      <div className="px-2 mb-6">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${colorMap[data.themeColor].split(' ')[0]}`}>
          {data.subtitle}
        </span>
        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
          {data.title}
        </h3>
        <p className="text-slate-500 text-xs font-medium leading-relaxed">
          {data.description}
        </p>
      </div>

      {/* 3. THE SMALL CARD (NESTED INSIDE) */}
      <div className="relative mt-auto">
        <div className={`rounded-[2rem] p-5 border-2 border-dashed flex items-center justify-between transition-colors duration-300 ${colorMap[data.themeColor]}`}>

          {/* Ticket Notches (Design details) */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-100 shadow-inner"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-100 shadow-inner"></div>

          {/* Offer Info */}
          <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{data.offerLabel}</p>
            <p className="text-2xl font-black tracking-tighter">{data.offerValue}</p>
          </div>

          {/* Coupon Display */}
          <div className="flex flex-col items-end">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-dashed border-current mb-1">
              <span className="text-xs font-black tracking-widest uppercase">{data.couponCode}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold opacity-70">
              <FaClock size={8} /> 24h Remaining
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <button className="w-full mt-6 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900 transition-colors">
          View Details <FaArrowRight className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default function MonthlyOffers() {
  return (
    <div className="py-24 bg-[#FAFBFF]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Premium Rewards</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            Exclusive <span className="text-emerald-500">Offers</span> For You.
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
            Our most popular diagnostic packages and pharmacy deals, verified and updated
            for the current month. Claim your voucher before it expires.
          </p>
        </div>

        {/* The Static Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {OFFERS_SHOWCASE.map((offer) => (
            <OfferCard key={offer.id} data={offer} />
          ))}
        </div>

        {/* Simple Footer Link */}
        <div className="mt-16 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Standard terms and conditions apply to all coupon codes.
            <button className="ml-2 text-emerald-600 hover:underline">Learn more</button>
          </p>
        </div>
      </div>
    </div>
  );
}