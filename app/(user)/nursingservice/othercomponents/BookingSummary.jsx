import React from "react";
import { FaCalendarCheck, FaClock, FaInfoCircle } from "react-icons/fa";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BookingSummary({ bookingData, slotInfo, selectedAddressId, onProceed }) {
    const totalAmount = bookingData.basePrice + (slotInfo.extraFee || 0);

    const getImageUrl = (path) => {
        if (!path) return "https://img.freepik.com/free-photo/medical-specialist-taking-care-patient_23-2148962551.jpg";
        if (path.startsWith("http")) return path;
        const cleanPath = path.replace(/^public\//, "");
        return `${BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    };

    // Helper to format Date objects to strings safely
    const renderDate = () => {
        if (slotInfo.mode === "multiple" && slotInfo.start && slotInfo.end) {
            return `${slotInfo.start.toLocaleDateString()} - ${slotInfo.end.toLocaleDateString()}`;
        }
        if (slotInfo.date instanceof Date) {
            return slotInfo.date.toLocaleDateString();
        }
        return slotInfo.date || "Pick a Date";
    };

    // Helper to determine if the "Proceed" button should be enabled
    const isSelectionValid = () => {
        if (!selectedAddressId) return false;
        if (slotInfo.mode === "single" && slotInfo.date) return true;
        if (slotInfo.mode === "multiple" && slotInfo.start && slotInfo.end) return true;
        if (slotInfo.mode === "hourly" && slotInfo.date && slotInfo.slot) return true;
        return false;
    };

    return (
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-28 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <img src={getImageUrl(bookingData.nurseImage)} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" alt="Nurse" />
                <div>
                    <p className="text-[10px] font-black uppercase text-teal-400">Nurse Assigned</p>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{bookingData.nurseName}</h3>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patient</p>
                    <p className="font-bold text-slate-200">{bookingData.patientName} ({bookingData.patientAge}Y)</p>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <FaCalendarCheck className="text-teal-400" />
                        <span className="text-sm font-bold">{renderDate()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaClock className="text-teal-400" />
                        <span className="text-sm font-bold">
                            {slotInfo.slot?.label || slotInfo.displayTime || (slotInfo.mode === "hourly" ? "Pick Duration" : "Full Day Visit")}
                        </span>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Standard Fee</span>
                        <span className="font-black">₹{bookingData.basePrice}</span>
                    </div>
                    {(slotInfo.extraFee > 0 || slotInfo.slot?.fee > 0) && (
                        <div className="flex justify-between text-sm text-amber-400">
                            <span className="font-medium text-[10px] uppercase">Premium Surcharge</span>
                            <span className="font-black">+ ₹{slotInfo.extraFee || slotInfo.slot?.fee}</span>
                        </div>
                    )}
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Payable Amount</p>
                            <span className="text-3xl font-black text-teal-400">₹{totalAmount + (slotInfo.slot?.fee || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 uppercase font-bold">
                            <FaInfoCircle /> Tax Incl.
                        </div>
                    </div>
                </div>

                <button
                    onClick={onProceed}
                    disabled={!isSelectionValid()}
                    className={`w-full py-5 rounded-[2rem] font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                        !isSelectionValid()
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                        : "bg-teal-500 text-white hover:bg-teal-400"
                    }`}
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
}