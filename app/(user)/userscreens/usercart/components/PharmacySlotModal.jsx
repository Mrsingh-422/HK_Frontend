"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCalendarDay, FaClock, FaTimes, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaSun, FaCloudSun, FaMoon, FaChevronRight } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

// Helper for local timezone date formatting (YYYY-MM-DD)
const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Check if a time slot has already passed for Today
const isSlotExpired = (slotTime, selectedDateStr) => {
    if (!slotTime || !selectedDateStr) return false;
    const todayStr = getLocalDateString(new Date());

    if (selectedDateStr > todayStr) return false;
    if (selectedDateStr < todayStr) return true;

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

        return new Date().getTime() >= slotDateTime.getTime();
    } catch (e) {
        return false;
    }
};

const PharmacySlotModal = ({ isOpen, onClose, onSelectSlot, pharmacyId }) => {
    const dates = useMemo(() => {
        const now = new Date();
        const tomorrow = new Date(Date.now() + 86400000);
        const dayAfter = new Date(Date.now() + 172800000);

        return [
            { label: 'Today', apiValue: getLocalDateString(now), display: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
            { label: 'Tomorrow', apiValue: getLocalDateString(tomorrow), display: tomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
            { label: 'Upcoming', apiValue: getLocalDateString(dayAfter), display: dayAfter.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }
        ];
    }, []);

    const [selectedDate, setSelectedDate] = useState(dates[0].apiValue);
    const [slots, setSlots] = useState([]);
    const [isPharmacyClosed, setIsPharmacyClosed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSlotData, setSelectedSlotData] = useState(null);

    const fetchSlots = useCallback(async () => {
        if (!pharmacyId || !selectedDate) return;
        setLoading(true);
        setSelectedSlotData(null);
        try {
            const res = await UserAPI.getPharmacySlots(pharmacyId, selectedDate);
            if (res?.success) {
                setSlots(res.slots || []);
                setIsPharmacyClosed(res.isClosed || false);
            } else {
                setSlots([]);
                setIsPharmacyClosed(false);
            }
        } catch (error) {
            console.error("Error fetching pharmacy slots:", error);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, [pharmacyId, selectedDate]);

    useEffect(() => {
        if (isOpen) fetchSlots();
    }, [isOpen, fetchSlots]);

    const groupedSlots = useMemo(() => {
        return slots.reduce((acc, slot) => {
            const cat = slot.category || "Standard";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(slot);
            return acc;
        }, {});
    }, [slots]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!selectedSlotData) return;
        const dateObj = dates.find(d => d.apiValue === selectedDate);
        onSelectSlot({
            displayText: `${dateObj?.display || selectedDate}, ${selectedSlotData.time}`,
            apiDate: selectedDate,
            apiTime: selectedSlotData.time,
            fee: selectedSlotData.extraFee || 0
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <FaCalendarDay className="text-[#08B36A]" /> Select Delivery Slot
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Choose preferred arrival window</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <FaTimes size={15} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
                    {/* Date Picker */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Delivery Date</label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {dates.map((date) => {
                                const isSelected = selectedDate === date.apiValue;
                                return (
                                    <button
                                        key={date.apiValue}
                                        type="button"
                                        onClick={() => setSelectedDate(date.apiValue)}
                                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                                            isSelected
                                                ? 'border-[#08B36A] bg-emerald-50 text-[#08B36A] shadow-xs'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                        }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-[#08B36A]' : 'text-slate-400'}`}>{date.label}</span>
                                        <span className="text-xs font-black">{date.display}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Available Slots */}
                    <div className="space-y-3 min-h-[200px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Available Time Windows</label>
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                <FaSpinner className="animate-spin text-[#08B36A]" size={22} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Fetching Slots...</span>
                            </div>
                        ) : isPharmacyClosed ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center bg-rose-50 rounded-2xl border border-rose-100 p-6">
                                <FaExclamationTriangle className="text-rose-500 mb-2" size={24} />
                                <h4 className="text-xs font-black text-rose-900 uppercase">Pharmacy Closed</h4>
                                <p className="text-[10px] text-rose-600 font-bold mt-0.5 uppercase">No slots available on this date.</p>
                            </div>
                        ) : Object.keys(groupedSlots).length > 0 ? (
                            Object.entries(groupedSlots).map(([category, categorySlots]) => (
                                <div key={category} className="space-y-2">
                                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1 border-l-2 border-[#08B36A]">
                                        {category}
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categorySlots.map((slot, idx) => {
                                            const expired = isSlotExpired(slot.time, selectedDate);
                                            const isSelected = selectedSlotData?.time === slot.time;
                                            const isDisabled = slot.isFull || expired;

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => setSelectedSlotData(slot)}
                                                    className={`p-3 rounded-xl border-2 flex flex-col items-start transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'border-[#08B36A] bg-[#08B36A] text-white shadow-xs'
                                                            : isDisabled
                                                            ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-300'
                                                            : 'border-slate-200 hover:border-[#08B36A] hover:bg-emerald-50/20 bg-white text-slate-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between w-full mb-0.5">
                                                        <span className="text-xs font-black tracking-tight">
                                                            {slot.time}
                                                        </span>
                                                        {isSelected && <FaCheckCircle size={12} />}
                                                    </div>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className={`text-[9px] font-bold ${
                                                            isSelected ? 'text-emerald-100' : slot.extraFee > 0 ? 'text-amber-600' : 'text-slate-400'
                                                        }`}>
                                                            {expired ? 'Passed' : slot.isFull ? 'Full' : slot.extraFee > 0 ? `+ ₹${slot.extraFee}` : 'Free'}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-400 text-xs font-bold">No slots configured for this date.</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2.5 shrink-0">
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="flex-1 py-3.5 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        disabled={!selectedSlotData || loading}
                        onClick={handleConfirm}
                        className="flex-1 py-3.5 text-xs font-black uppercase tracking-wider bg-[#08B36A] hover:bg-[#079c5c] text-white rounded-2xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Confirm Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PharmacySlotModal;