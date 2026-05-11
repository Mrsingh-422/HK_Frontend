"use client";
import React from "react";
import { FaCalendarCheck, FaClock, FaInfoCircle, FaStethoscope, FaUser, FaMapMarkerAlt, FaBoxOpen } from "react-icons/fa";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BookingSummary({ bookingData, slotInfo, selectedAddress, selectedConsumables = [], onProceed }) {
    const basePrice = bookingData.basePrice || 0;
    const slotSurcharge = slotInfo.extraFee || 0;
    const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);
    const totalAmount = basePrice + slotSurcharge + consumableTotal;

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop";
        if (path.startsWith("http")) return path;
        const cleanPath = path.replace(/^public\//, "");
        return `${BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const renderDate = () => {
        if (slotInfo.startDate && slotInfo.endDate && slotInfo.startDate !== slotInfo.endDate) {
            const start = new Date(slotInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const end = new Date(slotInfo.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${start} - ${end}`;
        }
        if (slotInfo.startDate) {
            return new Date(slotInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return "Pick a Date";
    };

    const renderTime = () => {
        if (slotInfo.displayTime) return slotInfo.displayTime;
        if (slotInfo.startTime && slotInfo.endTime) {
            if (slotInfo.mode === "For Multiple Days") return "Full Day Service (09:00 - 18:00)";
            return `${slotInfo.startTime} - ${slotInfo.endTime}`;
        }
        if (slotInfo.startTime) return slotInfo.startTime;
        return "Select Time";
    };

    const isSelectionValid = () => {
        if (!selectedAddress) return false;
        if (slotInfo.mode === "One day One Time") {
            return slotInfo.startDate && slotInfo.startTime;
        }
        if (slotInfo.mode === "Acc. To Per/Hours") {
            return slotInfo.startDate && slotInfo.startTime && slotInfo.endTime;
        }
        if (slotInfo.mode === "For Multiple Days") {
            return slotInfo.startDate && slotInfo.endDate && slotInfo.startDate !== slotInfo.endDate;
        }
        return false;
    };

    const getModeDisplay = () => {
        if (slotInfo.mode === "One day One Time") return "Single Visit";
        if (slotInfo.mode === "Acc. To Per/Hours") return "Hourly Service";
        if (slotInfo.mode === "For Multiple Days") return "Multi-Day Service";
        return "Service";
    };

    return (
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <img 
                    src={getImageUrl(bookingData.nurseImage)} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" 
                    alt="Nurse" 
                />
                <div>
                    <p className="text-[9px] font-black uppercase text-teal-400 tracking-wider">Assigned Professional</p>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{bookingData.nurseName}</h3>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Service Selected</p>
                    <div className="flex items-center gap-2">
                        <FaStethoscope className="text-teal-500 text-xs" />
                        <p className="text-sm font-black text-slate-200">{bookingData.serviceDetails?.title}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Service Type</p>
                    <p className="text-sm font-bold text-teal-400">{getModeDisplay()}</p>
                </div>

                {bookingData.patients && bookingData.patients[0] && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Patient Details</p>
                        <div className="flex items-center gap-2">
                            <FaUser className="text-teal-500 text-xs" />
                            <p className="font-bold text-slate-200">
                                {bookingData.patients[0].name} 
                                <span className="text-slate-500 text-xs ml-2">({bookingData.patients[0].age} yrs)</span>
                            </p>
                        </div>
                    </div>
                )}

                {selectedAddress && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Address</p>
                        <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-teal-500 text-xs mt-0.5" />
                            <p className="text-xs font-medium text-slate-300">
                                {selectedAddress.houseNo}, {selectedAddress.sector}<br />
                                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                            </p>
                        </div>
                    </div>
                )}

                {selectedConsumables.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Medical Consumables</p>
                        {selectedConsumables.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                                <FaBoxOpen className="text-teal-500 text-xs" />
                                <span className="text-xs font-medium flex-1">{item.itemName}</span>
                                <span className="text-xs font-black text-teal-400">₹{item.price}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-px bg-white/10" />

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <FaCalendarCheck className="text-teal-400 size-3" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Date</p>
                            <span className="text-sm font-bold">{renderDate()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                            <FaClock className="text-teal-400 size-3" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Time</p>
                            <span className="text-sm font-bold">{renderTime()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Base Service Fee</span>
                        <span className="font-black">₹{basePrice}</span>
                    </div>
                    
                    {slotSurcharge > 0 && (
                        <div className="flex justify-between text-xs text-amber-400">
                            <span className="font-medium uppercase tracking-tighter">Premium / Extra Charges</span>
                            <span className="font-black">+ ₹{slotSurcharge}</span>
                        </div>
                    )}

                    {consumableTotal > 0 && (
                        <div className="flex justify-between text-xs text-teal-400">
                            <span className="font-medium uppercase tracking-tighter">Medical Consumables</span>
                            <span className="font-black">+ ₹{consumableTotal}</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Total Payable</p>
                            <span className="text-3xl font-black text-teal-400">₹{Math.round(totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 uppercase font-bold bg-white/5 px-2 py-1 rounded-md">
                            <FaInfoCircle className="text-teal-500" /> Tax Incl.
                        </div>
                    </div>
                </div>

                <button
                    onClick={onProceed}
                    disabled={!isSelectionValid()}
                    className={`w-full py-5 rounded-[2rem] font-black transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center ${
                        !isSelectionValid()
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                        : "bg-teal-500 text-white hover:bg-teal-400 shadow-teal-500/20"
                    }`}
                >
                    <span className="text-base">Confirm & Book</span>
                    {!selectedAddress && <span className="text-[8px] uppercase opacity-60 mt-1">Please Select Address</span>}
                    {selectedAddress && !isSelectionValid() && slotInfo.startDate && (
                        <span className="text-[8px] uppercase opacity-60 mt-1">
                            {slotInfo.mode === "For Multiple Days" && (!slotInfo.endDate || slotInfo.startDate === slotInfo.endDate) 
                                ? "Please Select End Date" 
                                : "Please Complete Time Selection"}
                        </span>
                    )}
                    {selectedAddress && !slotInfo.startDate && (
                        <span className="text-[8px] uppercase opacity-60 mt-1">Please Select Date & Time</span>
                    )}
                </button>

                <p className="text-[9px] text-center text-slate-500 px-4">
                    By clicking confirm, you agree to our terms of home-care service and cancellation policy.
                </p>
            </div>
        </div>
    );
}