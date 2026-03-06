"use client";
import React, { useState } from "react";
// Using Md (Material Design) for maximum build stability
import {
    MdOutlineScience,
    MdOutlineLocalPharmacy,
    MdOutlineEventAvailable,
    MdOutlineHealthAndSafety,
    MdOutlineEmergency,
    MdOutlineApartment,
    MdOutlineContentCopy,
    MdOutlineAccessTime,
    MdOutlineConfirmationNumber
} from "react-icons/md";
import { TbTicketOff } from "react-icons/tb";

function OffersPage() {
    const categories = [
        { id: "lab", name: "Book Lab Test", icon: <MdOutlineScience />, color: "border-blue-500", text: "text-blue-600", bg: "bg-blue-50" },
        { id: "medicine", name: "Buy Medicine", icon: <MdOutlineLocalPharmacy />, color: "border-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
        { id: "appointment", name: "Dr Appointment", icon: <MdOutlineEventAvailable />, color: "border-purple-500", text: "text-purple-600", bg: "bg-purple-50" },
        { id: "nursing", name: "Nursing Services", icon: <MdOutlineHealthAndSafety />, color: "border-orange-500", text: "text-orange-600", bg: "bg-orange-50" },
        { id: "ambulance", name: "Ambulance", icon: <MdOutlineEmergency />, color: "border-red-500", text: "text-red-600", bg: "bg-red-50" },
        { id: "hospital", name: "Hospital", icon: <MdOutlineApartment />, color: "border-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    // Example with multiple offers in Medicine and Lab to show the stacked look
    const [offers] = useState([
        { id: 1, category: "lab", title: "Full Body Checkup", discount: "25% OFF", code: "LAB25", expiry: "30 Sep" },
        { id: 2, category: "lab", title: "Diabetes Package", discount: "₹300 OFF", code: "SUGAR300", expiry: "12 Oct" },
        { id: 3, category: "medicine", title: "First Medicine Order", discount: "20% OFF", code: "WELCOME20", expiry: "31 Dec" },
        { id: 4, category: "medicine", title: "Monthly Refill", discount: "₹150 OFF", code: "REFILL150", expiry: "15 Oct" },
        { id: 5, category: "medicine", title: "Vitamin Boosters", discount: "10% OFF", code: "VITA10", expiry: "05 Oct" },
        { id: 6, category: "appointment", title: "Specialist Consultation", discount: "Flat ₹200 OFF", code: "DOC200", expiry: "25 Oct" },
    ]);

    const copyCode = (code) => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(code);
            alert(`Promo code ${code} copied to clipboard!`);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-10 md:py-16 px-4 sm:px-6 lg:px-12 font-sans text-left">
            <div className="max-w-7xl mx-auto">

                {/* HEADER SECTION */}
                <header className="mb-14">
                    <div className="flex items-center gap-2 text-[#08b36a] font-bold text-xs uppercase tracking-widest mb-3">
                        <MdOutlineConfirmationNumber size={18} /> Exclusive Savings
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                        Health <span className="text-[#08b36a]">Vouchers</span> & Offers
                    </h1>
                    <p className="text-slate-500 mt-4 text-sm md:text-base max-w-2xl leading-relaxed">
                        Browse active promo codes across all our healthcare services. Stacking multiple offers is not allowed.
                        Select your preferred deal below.
                    </p>
                </header>

                {/* RESPONSIVE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {categories.map((cat) => {
                        const catOffers = offers.filter(o => o.category === cat.id);

                        return (
                            <div key={cat.id} className="flex flex-col space-y-5">

                                {/* CATEGORY TITLE */}
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${cat.bg} ${cat.text} text-2xl shadow-sm`}>
                                            {cat.icon}
                                        </div>
                                        <h2 className="text-lg font-extrabold text-slate-800">{cat.name}</h2>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-md">
                                        {catOffers.length} DEALS
                                    </span>
                                </div>

                                {/* OFFER TICKET STACK */}
                                <div className="space-y-3">
                                    {catOffers.length > 0 ? (
                                        catOffers.map((offer) => (
                                            <div
                                                key={offer.id}
                                                className={`relative flex items-center bg-white border-l-[6px] ${cat.color} rounded-r-2xl shadow-sm hover:shadow-md transition-all duration-300 h-28 overflow-hidden group`}
                                            >
                                                {/* LEFT: DISCOUNT DATA */}
                                                <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                                                    <span className={`${cat.text} text-sm font-black uppercase tracking-tight`}>
                                                        {offer.discount}
                                                    </span>
                                                    <h3 className="text-slate-800 font-bold text-[13px] md:text-sm truncate pr-2">
                                                        {offer.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold">
                                                        <MdOutlineAccessTime size={14} /> EXPIRES: {offer.expiry}
                                                    </div>
                                                </div>

                                                {/* MIDDLE: TICKET DIVIDER */}
                                                <div className="relative h-full flex flex-col justify-between py-1 px-1">
                                                    <div className="w-4 h-4 rounded-full bg-[#f8fafc] -mt-3 border border-slate-100"></div>
                                                    <div className="w-[1px] h-full border-r-2 border-dashed border-slate-100 mx-auto"></div>
                                                    <div className="w-4 h-4 rounded-full bg-[#f8fafc] -mb-3 border border-slate-100"></div>
                                                </div>

                                                {/* RIGHT: PROMO CODE AREA */}
                                                <div className="w-24 md:w-28 flex flex-col items-center justify-center bg-slate-50/50 h-full group-hover:bg-white transition-colors">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Code</p>
                                                    <p className="text-[11px] font-mono font-black text-slate-700 mb-2">{offer.code}</p>
                                                    <button
                                                        onClick={() => copyCode(offer.code)}
                                                        className={`p-2 rounded-lg ${cat.bg} ${cat.text} hover:scale-110 active:scale-90 transition-all shadow-sm`}
                                                    >
                                                        <MdOutlineContentCopy size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        /* EMPTY STATE */
                                        <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-start opacity-70">
                                            <TbTicketOff size={28} className="text-slate-300 mb-2" />
                                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">No active offers</p>
                                            <p className="text-slate-400 text-[10px] mt-1">Check back later for {cat.name} deals.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* BOTTOM HELP SECTION */}
                <div className="mt-24 p-8 md:p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-[#08b36a]/10 rounded-3xl flex items-center justify-center text-[#08b36a] shrink-0">
                        <MdOutlineHealthAndSafety size={44} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Need help with coupons?</h3>
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                            Simply copy the code and paste it into the <b>"Promo Code"</b> box during checkout.
                            If you are facing issues, ensure the order value meets the minimum requirement for the offer.
                        </p>
                    </div>
                    <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-[#08b36a] transition-all shadow-lg active:scale-95">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OffersPage;