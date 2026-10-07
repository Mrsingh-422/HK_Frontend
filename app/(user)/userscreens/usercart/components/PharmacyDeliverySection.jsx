"use client";

import React from 'react';
import { FaClock, FaTruck, FaCalendarAlt, FaCheck } from 'react-icons/fa';

const PharmacyDeliverySection = ({ deliveryOption, setDeliveryOption, selectedSlot, openSlotModal }) => {
    const options = [
        { id: 'fast', title: 'Express Fast', desc: 'Within 60 Mins', icon: <FaClock size={16} /> },
        { id: 'standard', title: 'Standard', desc: 'Within 3 Hours', icon: <FaTruck size={16} /> },
        { id: 'slot', title: 'Slot Delivery', desc: selectedSlot || 'Choose Slot', icon: <FaCalendarAlt size={16} /> }
    ];

    return (
        <div className="bg-white border border-slate-200/90 rounded-[2rem] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Choose Delivery Speed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {options.map((opt) => {
                    const isSelected = deliveryOption === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => opt.id === 'slot' ? openSlotModal() : setDeliveryOption(opt.id)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer select-none ${
                                isSelected 
                                    ? 'border-[#08B36A] bg-emerald-50/50 text-[#08B36A] ring-1 ring-[#08B36A]/20 shadow-xs' 
                                    : 'border-slate-200 bg-white hover:border-[#08B36A] hover:bg-emerald-50/20 text-slate-700'
                            }`}
                        >
                            <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#08B36A] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {opt.icon}
                            </div>
                            <p className="text-xs font-black uppercase tracking-tight mt-1">{opt.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{opt.desc}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PharmacyDeliverySection;