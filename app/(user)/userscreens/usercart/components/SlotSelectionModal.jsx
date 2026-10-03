"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FaCalendarAlt, FaTimes, FaSpinner, FaChevronRight, FaSun, FaCloudSun, FaMoon, FaClock } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';
import toast from 'react-hot-toast';

// Helper to format local date YYYY-MM-DD
const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Check if a time slot has already passed for the current date
const isSlotExpired = (slotTime, selectedDateStr) => {
    if (!slotTime || !selectedDateStr) return false;

    const todayStr = getLocalDateString(new Date());

    // If selected date is in the future, it is not expired
    if (selectedDateStr > todayStr) return false;
    // If selected date is in the past, it is expired
    if (selectedDateStr < todayStr) return true;

    // Selected date is TODAY: compare slot time with current time
    try {
        const startTimeStr = slotTime.split('-')[0].trim();
        const parts = startTimeStr.split(/\s+/);
        const timePart = parts[0];
        const modifier = parts[1] ? parts[1].toUpperCase() : "";

        const [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr || "0", 10);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const slotDateTime = new Date();
        slotDateTime.setHours(hours, minutes, 0, 0);

        // Expired if current time has passed the slot start time
        return new Date().getTime() >= slotDateTime.getTime();
    } catch (e) {
        return false;
    }
};

const SlotSelectionModal = ({ isOpen, onClose, labId, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isClosed, setIsClosed] = useState(false);

    // Generate upcoming 7 days based on user's local timezone
    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return {
                full: getLocalDateString(d),
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate(),
                isToday: i === 0
            };
        });
    }, []);

    useEffect(() => {
        if (isOpen && labId) {
            fetchSlots();
        }
    }, [isOpen, selectedDate, labId]);

    const fetchSlots = async () => {
        setLoading(true);
        setSelectedSlot(null);
        try {
            const res = await UserAPI.getLabSlots(labId, selectedDate);
            if (res?.success) {
                setSlots(res.slots || []);
                setIsClosed(res.isClosed || false);
            } else {
                setSlots([]);
                setIsClosed(false);
            }
        } catch (error) {
            console.error("Failed to fetch slots:", error);
            toast.error("Failed to fetch time slots");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const categories = {
        Morning: { icon: <FaSun className="text-amber-500" />, label: "Morning" },
        Afternoon: { icon: <FaCloudSun className="text-orange-500" />, label: "Afternoon" },
        Evening: { icon: <FaMoon className="text-indigo-500" />, label: "Evening" }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#08B36A] tracking-widest block leading-none mb-1">
                            Home Sample Collection
                        </span>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Select Visit Slot</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <FaTimes size={15} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-6">
                    
                    {/* Date Selector Pills */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">
                            Select Visit Date
                        </label>
                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                            {dates.map((item) => {
                                const isSelected = selectedDate === item.full;
                                return (
                                    <button
                                        key={item.full}
                                        type="button"
                                        onClick={() => setSelectedDate(item.full)}
                                        className={`flex-shrink-0 w-16 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                                            isSelected 
                                                ? "border-[#08B36A] bg-emerald-50 text-[#08B36A] shadow-xs" 
                                                : "border-slate-100 bg-slate-50/70 text-slate-500 hover:border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider">{item.day}</span>
                                        <span className="text-base font-black">{item.date}</span>
                                        {item.isToday && (
                                            <span className="text-[8px] font-black uppercase text-[#08B36A]">Today</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slots List Area */}
                    <div className="min-h-[220px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-2.5 text-slate-400">
                                <FaSpinner className="animate-spin text-[#08B36A] text-2xl" />
                                <p className="text-xs font-bold uppercase tracking-wider">Syncing Available Slots...</p>
                            </div>
                        ) : isClosed ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                <FaCalendarAlt className="text-rose-300 text-4xl mx-auto mb-3" />
                                <h3 className="font-black text-slate-800 text-sm">Lab is Closed on Selected Date</h3>
                                <p className="text-xs text-slate-400 mt-1">Please select another date for home collection.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {Object.keys(categories).map((cat) => {
                                    const catSlots = slots.filter(s => s.category === cat);
                                    if (catSlots.length === 0) return null;

                                    return (
                                        <div key={cat} className="space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                {categories[cat].icon}
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                                    {categories[cat].label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2.5">
                                                {catSlots.map((slot, idx) => {
                                                    const expired = isSlotExpired(slot.time, selectedDate);
                                                    const isSelected = selectedSlot?.time === slot.time;
                                                    const isDisabled = slot.isFull || expired;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            disabled={isDisabled}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={`relative p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                                                                isSelected 
                                                                    ? "border-[#08B36A] bg-[#08B36A] text-white font-black shadow-md shadow-[#08B36A]/20" 
                                                                    : isDisabled 
                                                                    ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50" 
                                                                    : "border-slate-200 bg-white text-slate-800 hover:border-[#08B36A] hover:bg-emerald-50/20"
                                                            }`}
                                                        >
                                                            <div className="text-xs font-black">{slot.time}</div>
                                                            
                                                            {expired ? (
                                                                <span className="text-[8px] font-black text-slate-400 block mt-0.5 uppercase">
                                                                    Passed
                                                                </span>
                                                            ) : slot.isFull ? (
                                                                <span className="text-[8px] font-black text-rose-400 block mt-0.5 uppercase">
                                                                    Full
                                                                </span>
                                                            ) : slot.extraFee > 0 ? (
                                                                <span className={`text-[8px] font-black block mt-0.5 ${isSelected ? "text-emerald-100" : "text-amber-600"}`}>
                                                                    +₹{slot.extraFee}
                                                                </span>
                                                            ) : (
                                                                <span className={`text-[8px] font-bold block mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                                                                    Standard
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {slots.length === 0 && !loading && (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                                        <FaClock className="text-slate-300 text-3xl mx-auto mb-2" />
                                        <p className="text-xs font-bold text-slate-500">No slots configured for this date.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        disabled={!selectedSlot}
                        onClick={() => onConfirm(selectedDate, selectedSlot)}
                        className="w-full bg-[#08B36A] hover:bg-[#079c5c] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer"
                    >
                        <span>Confirm Appointment Slot</span>
                        <FaChevronRight size={11} />
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                .scrollbar-none::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default SlotSelectionModal;