"use client";
import React, { useState, useMemo } from "react";
import { 
    FaChevronLeft, FaChevronRight, FaCrown, FaCheckCircle, 
    FaCalendarCheck, FaLayerGroup, FaRunning, FaInfoCircle
} from "react-icons/fa";

export default function SlotPicker({ onSlotSelect }) {
    const [bookingMode, setBookingMode] = useState("single"); // 'single', 'multiple', 'hourly'
    const [viewDate, setViewDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(null); 
    const [rangeStart, setRangeStart] = useState(null); 
    const [rangeEnd, setRangeEnd] = useState(null); 
    const [activeSlot, setActiveSlot] = useState(null);

    // --- PRICING LOGIC ---
    const getDateInfo = (date) => {
        if (!date) return { fee: 0, isPremium: false };
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6; // Sunday or Saturday
        return {
            fee: isWeekend ? 150 : 0, // Extra ₹150 for weekends
            isPremium: isWeekend
        };
    };

    // --- CALENDAR LOGIC ---
    const calendarGrid = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = [];
        const totalDays = new Date(year, month + 1, 0).getDate();
        const startDay = new Date(year, month, 1).getDay();

        for (let i = 0; i < startDay; i++) days.push(null);
        for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
        
        return days;
    }, [viewDate]);

    const handleDateClick = (date) => {
        if (!date || date < new Date().setHours(0,0,0,0)) return;
        const { fee } = getDateInfo(date);

        if (bookingMode === "single" || bookingMode === "hourly") {
            setSelectedDate(date);
            setActiveSlot(null);
            onSlotSelect({ 
                mode: bookingMode, 
                date, 
                extraFee: fee,
                slot: null 
            });
        } else if (bookingMode === "multiple") {
            if (!rangeStart || (rangeStart && rangeEnd)) {
                setRangeStart(date);
                setRangeEnd(null);
            } else {
                if (date < rangeStart) {
                    setRangeStart(date);
                    setRangeEnd(null);
                } else {
                    setRangeEnd(date);
                    onSlotSelect({ 
                        mode: "multiple", 
                        start: rangeStart, 
                        end: date,
                        extraFee: fee // Logic usually uses the start date or a calculated average
                    });
                }
            }
        }
    };

    const isSameDay = (d1, d2) => 
        d1 && d2 && d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    // --- DUMMY HOURLY SLOTS ---
    const hourlySlots = [
        { id: "h1", label: "1 Hour", sub: "Quick Visit", fee: 0 },
        { id: "h2", label: "2 Hours", sub: "Standard", fee: 100 },
        { id: "h4", label: "4 Hours", sub: "Half Day", fee: 300 },
        { id: "h8", label: "8 Hours", sub: "Full Shift", fee: 600, premium: true },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto antialiased">
            
            {/* 1. MODE SELECTOR */}
            <div className="bg-white p-1.5 rounded-[2.5rem] shadow-sm border border-slate-100 flex gap-1">
                {[
                    { id: "single", label: "One Time", icon: <FaCalendarCheck /> },
                    { id: "multiple", label: "Multiple Days", icon: <FaLayerGroup /> },
                    { id: "hourly", label: "Hourly", icon: <FaRunning /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setBookingMode(tab.id);
                            setSelectedDate(null);
                            setRangeStart(null);
                            setRangeEnd(null);
                            setActiveSlot(null);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            bookingMode === tab.id 
                            ? "bg-teal-600 text-white shadow-lg" 
                            : "text-slate-400 hover:bg-slate-50"
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 2. CALENDAR GRID (7 Columns Span) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 rounded-full"><FaChevronLeft size={12}/></button>
                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 hover:bg-slate-100 rounded-full"><FaChevronRight size={12}/></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-4">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarGrid.map((date, i) => {
                            const isPast = date && date < new Date().setHours(0,0,0,0);
                            const { fee, isPremium } = getDateInfo(date);
                            const isSelected = bookingMode === "multiple" 
                                ? (isSameDay(date, rangeStart) || isSameDay(date, rangeEnd))
                                : isSameDay(date, selectedDate);
                            
                            const inRange = bookingMode === "multiple" && rangeStart && rangeEnd && date > rangeStart && date < rangeEnd;

                            return (
                                <div key={i} className="aspect-square relative">
                                    {date ? (
                                        <button
                                            onClick={() => handleDateClick(date)}
                                            disabled={isPast}
                                            className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border
                                                ${isPast ? "opacity-20 cursor-not-allowed border-transparent" : "hover:border-teal-200 hover:shadow-md"}
                                                ${isSelected ? "bg-teal-600 border-teal-600 text-white scale-105 z-10" : "bg-white border-slate-50"}
                                                ${inRange ? "bg-teal-50 border-teal-100" : ""}
                                            `}
                                        >
                                            <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-700"}`}>
                                                {date.getDate()}
                                            </span>
                                            {!isPast && (
                                                <span className={`text-[8px] font-bold mt-0.5 ${
                                                    isSelected ? "text-teal-100" : isPremium ? "text-amber-500" : "text-slate-300"
                                                }`}>
                                                    {fee > 0 ? `+₹${fee}` : "Free"}
                                                </span>
                                            )}
                                            {isPremium && !isSelected && !isPast && (
                                                <div className="absolute top-1 right-1 text-[6px] text-amber-500"><FaCrown /></div>
                                            )}
                                        </button>
                                    ) : <div />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. SLOT DETAILS (5 Columns Span) */}
                <div className="lg:col-span-5">
                    {bookingMode === "hourly" ? (
                        <div className="bg-slate-50 p-6 rounded-[3rem] h-full border border-slate-100">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">
                                Select Duration
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {hourlySlots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        disabled={!selectedDate}
                                        onClick={() => {
                                            setActiveSlot(slot.id);
                                            onSlotSelect({ 
                                                mode: "hourly", 
                                                date: selectedDate, 
                                                slot,
                                                extraFee: getDateInfo(selectedDate).fee
                                            });
                                        }}
                                        className={`p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between
                                            ${!selectedDate ? "opacity-30 cursor-not-allowed" : 
                                            activeSlot === slot.id ? "bg-white border-teal-500 shadow-lg scale-[1.02]" : 
                                            "bg-white border-transparent hover:border-teal-100"}
                                        `}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{slot.label}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{slot.sub}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {slot.fee > 0 && (
                                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                                    +₹{slot.fee}
                                                </span>
                                            )}
                                            {activeSlot === slot.id && <FaCheckCircle className="text-teal-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-[3rem] h-full flex flex-col items-center justify-center text-center border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-teal-500 shadow-sm mb-4">
                                <FaInfoCircle size={24} />
                            </div>
                            <h4 className="font-black text-slate-800 uppercase text-sm mb-2">
                                {bookingMode === "single" ? "Single Day Visit" : "Multiple Days Visit"}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">
                                {bookingMode === "single" 
                                    ? "Select a date on the calendar. Weekend dates have a premium surcharge."
                                    : "Click a start date and an end date to define your booking range."}
                            </p>
                            
                            {(selectedDate || (rangeStart && rangeEnd)) && (
                                <div className="mt-6 animate-bounce">
                                    <FaCheckCircle className="text-teal-500 text-2xl" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* SMALL LEGEND */}
            <div className="flex items-center gap-6 px-6 py-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Standard</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-slate-100 rounded-sm flex items-center justify-center text-amber-500">
                        <FaCrown size={8}/>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Premium (Weekends)</span>
                </div>
            </div>
        </div>
    );
}