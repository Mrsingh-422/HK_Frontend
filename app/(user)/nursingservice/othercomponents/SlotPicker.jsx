"use client";
import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaCrown, FaCheckCircle } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function SlotPicker({ nurseId, onSlotSelect }) {
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSlot, setActiveSlot] = useState(null);

    useEffect(() => {
        if (nurseId && selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDate, nurseId]);

    const fetchAvailableSlots = async () => {
        try {
            setLoadingSlots(true);
            const res = await UserAPI.getNurseSlots(nurseId, { date: selectedDate });
            if (res?.success) {
                setSlots(res.data);
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSlotClick = (slot) => {
        setActiveSlot(slot.time);
        onSlotSelect({
            date: selectedDate,
            slotTime: slot.time,
            displayTime: slot.displayTime,
            extraFee: slot.extraFee || 0
        });
    };

    return (
        <section className="space-y-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-teal-500" /> Select Schedule
                </h3>
                <input 
                    type="date" 
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                />
            </div>

            {loadingSlots ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {slots.length > 0 ? (
                        slots.map((slot, index) => (
                            <button
                                key={index}
                                disabled={!slot.isAvailable}
                                onClick={() => handleSlotClick(slot)}
                                className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 ${
                                    !slot.isAvailable 
                                        ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-100" 
                                        : activeSlot === slot.time
                                        ? "border-teal-500 bg-teal-50 shadow-md"
                                        : "border-slate-100 bg-white hover:border-teal-200"
                                }`}
                            >
                                <span className="font-black text-slate-900 text-sm">{slot.displayTime}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{slot.category}</span>
                                {slot.isPremium && (
                                    <div className="absolute top-1 right-1 flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-lg text-[8px] font-black">
                                        <FaCrown className="text-amber-500" /> +₹{slot.extraFee}
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs font-bold text-slate-400">No slots available for this date.</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}