"use client";
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import UserAPI from "@/app/services/UserAPI";

export default function SlotPicker({ nurseId, itemId, isPackage, onSlotSelect }) {
    const [mode, setMode] = useState("One day One Time");
    const [avail, setAvail] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment()); // Track current month for navigation

    // One day One Time selection
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Hourly selection
    const [hourlyStartSlot, setHourlyStartSlot] = useState(null);
    const [hourlyEndSlot, setHourlyEndSlot] = useState(null);

    // 1. Fetch available slots
    useEffect(() => {
        const fetchAvail = async () => {
            try {
                setLoading(true);
                const typeMapping = {
                    "One day One Time": "One day One Time",
                    "For Multiple Days": "For Multiple Days",
                    "Acc. To Per/Hours": "Acc. To Per/Hours"
                };
                const apiType = typeMapping[mode];
                const query = `serviceId=${!isPackage ? itemId : ''}&packageId=${isPackage ? itemId : ''}&isPackage=${isPackage}&type=${apiType}`;
                
                const res = await UserAPI.getNurseSlots(nurseId, query);
                if (res.success) {
                    setAvail(res); 
                }
            } catch (err) {
                console.error("Failed to fetch slots:", err);
            } finally {
                setLoading(false);
            }
        };
        if (nurseId && itemId) fetchAvail();
    }, [mode, nurseId, itemId, isPackage]);

    // 2. Calculation Logic
    useEffect(() => {
        if (!startDate) return;

        let totalSurcharge = 0;
        let startTime = "";
        let endTime = "";
        let calculatedTotalPrice = avail?.serviceBasePrice || 0;

        // Current Date Premium
        const datePrem = avail?.premiumDates?.find(p => p.date === startDate);
        const dateExtra = datePrem ? datePrem.extraFee : 0;

        if (mode === "One day One Time") {
            if (selectedSlot) {
                totalSurcharge = dateExtra + (selectedSlot.premiumSurcharge || 0);
                startTime = selectedSlot.time;
                endTime = moment(selectedSlot.time, "HH:mm").add(1, 'hour').format("HH:mm");
                calculatedTotalPrice = selectedSlot.totalSlotPrice + dateExtra;
            }
        } 
        else if (mode === "Acc. To Per/Hours") {
            if (hourlyStartSlot && hourlyEndSlot) {
                startTime = hourlyStartSlot.time;
                endTime = hourlyEndSlot.time;
                const startM = moment(startTime, "HH:mm");
                const endM = moment(endTime, "HH:mm");
                const hours = endM.diff(startM, 'hours');

                // Logic: Only FIRST slot premium is added, middle/end ignored
                totalSurcharge = dateExtra + (hourlyStartSlot.premiumSurcharge || 0);
                calculatedTotalPrice = (avail.serviceBasePrice * (hours > 0 ? hours : 1)) + totalSurcharge;
            }
        }
        else if (mode === "For Multiple Days" && startDate && endDate) {
            let multiDaySurcharge = 0;
            avail?.premiumDates?.forEach(p => {
                if (moment(p.date).isBetween(startDate, endDate, 'day', '[]')) {
                    multiDaySurcharge += p.extraFee;
                }
            });
            const daysCount = moment(endDate).diff(moment(startDate), 'days') + 1;
            totalSurcharge = multiDaySurcharge;
            startTime = "09:00"; 
            endTime = "18:00";
            calculatedTotalPrice = (avail.serviceBasePrice * daysCount) + multiDaySurcharge;
        }

        onSlotSelect({
            mode,
            startDate,
            endDate: endDate || startDate,
            startTime,
            endTime,
            extraFee: totalSurcharge,
            totalPrice: calculatedTotalPrice,
            displayTime: mode === "One day One Time" ? selectedSlot?.displayTime : 
                         mode === "Acc. To Per/Hours" ? (hourlyStartSlot && hourlyEndSlot ? `${hourlyStartSlot.displayTime} - ${hourlyEndSlot.displayTime}` : "") :
                         "Full Day Service"
        });
    }, [startDate, endDate, selectedSlot, hourlyStartSlot, hourlyEndSlot, mode, avail]);

    // Handle Calendar Clicks - Keeping Multi-Day exactly as original
    const handleDateClick = (dStr) => {
        if (mode === "One day One Time" || mode === "Acc. To Per/Hours") {
            setStartDate(dStr);
            setEndDate(dStr);
            setSelectedSlot(null); 
            setHourlyStartSlot(null);
            setHourlyEndSlot(null);
        } else {
            // MULTI-DAY RANGE LOGIC
            if (!startDate || (startDate && endDate)) {
                setStartDate(dStr);
                setEndDate(null);
            } else {
                if (moment(dStr).isBefore(startDate)) {
                    setStartDate(dStr);
                    setEndDate(null);
                } else {
                    setEndDate(dStr);
                }
            }
        }
    };

    const handleHourlySlotClick = (slot) => {
        if (!hourlyStartSlot || (hourlyStartSlot && hourlyEndSlot)) {
            setHourlyStartSlot(slot);
            setHourlyEndSlot(null);
        } else {
            if (moment(slot.time, "HH:mm").isBefore(moment(hourlyStartSlot.time, "HH:mm"))) {
                setHourlyStartSlot(slot);
                setHourlyEndSlot(null);
            } else {
                setHourlyEndSlot(slot);
            }
        }
    };

    // Generate calendar days for current month
    const calendarDays = useMemo(() => {
        const startOfMonth = currentMonth.clone().startOf('month');
        const endOfMonth = currentMonth.clone().endOf('month');
        const startDate = startOfMonth.clone().startOf('week');
        const endDate = endOfMonth.clone().endOf('week');
        
        const days = [];
        let day = startDate;
        
        while (day.isBefore(endDate)) {
            days.push(day.clone());
            day.add(1, 'day');
        }
        
        return days;
    }, [currentMonth]);

    // Navigation handlers
    const goToPreviousMonth = () => {
        setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(currentMonth.clone().add(1, 'month'));
    };

    const goToCurrentMonth = () => {
        setCurrentMonth(moment());
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6">Select Schedule</h3>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                {['One day One Time', 'For Multiple Days', 'Acc. To Per/Hours'].map((m) => (
                    <button
                        key={m}
                        onClick={() => { 
                            setMode(m); setStartDate(null); setEndDate(null); 
                            setSelectedSlot(null); setHourlyStartSlot(null); setHourlyEndSlot(null); 
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${mode === m ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}
                    >
                        {m === 'One day One Time' ? 'Single' : m === 'For Multiple Days' ? 'Multi-Day' : 'Hourly'}
                    </button>
                ))}
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6 px-2">
                <button
                    onClick={goToPreviousMonth}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-800">
                        {currentMonth.format('MMMM YYYY')}
                    </span>
                    <button
                        onClick={goToCurrentMonth}
                        className="text-[10px] font-black px-3 py-1.5 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all"
                    >
                        Today
                    </button>
                </div>
                
                <button
                    onClick={goToNextMonth}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-8">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                    <div key={idx} className="text-[10px] font-black text-slate-300 text-center py-2">{d}</div>
                ))}
                {calendarDays.map((date) => {
                    const dStr = date.format('YYYY-MM-DD');
                    const isCurrentMonth = date.month() === currentMonth.month();
                    const datePremium = avail?.premiumDates?.find(p => p.date === dStr);
                    const isSel = dStr === startDate || dStr === endDate;
                    const inRange = mode === "For Multiple Days" && startDate && endDate && date.isBetween(startDate, endDate, 'day');

                    return (
                        <button
                            key={dStr}
                            disabled={loading || !isCurrentMonth}
                            onClick={() => handleDateClick(dStr)}
                            className={`h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                                !isCurrentMonth ? "opacity-30 cursor-not-allowed" :
                                isSel ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20" :
                                inRange ? "bg-teal-50 border-teal-100 text-teal-700" :
                                "bg-white border-slate-50 hover:border-slate-200"
                            }`}
                        >
                            <span className="text-xs font-black">{date.date()}</span>
                            {datePremium && (
                                <span className={`text-[7px] font-black mt-0.5 ${isSel ? 'text-white/80' : 'text-rose-500'}`}>
                                    +₹{datePremium.extraFee}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {mode === "One day One Time" && startDate && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Time</h4>
                    <select 
                        className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-black text-slate-700 outline-none focus:border-teal-500 transition-all"
                        value={selectedSlot?.time || ""}
                        onChange={(e) => setSelectedSlot(avail?.timeSlots?.find(s => s.time === e.target.value))}
                    >
                        <option value="">Select Arrival Time</option>
                        {avail?.timeSlots?.map((slot) => (
                            <option key={slot.time} value={slot.time}>
                                {slot.displayTime} (₹{slot.totalSlotPrice})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {mode === "Acc. To Per/Hours" && startDate && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        {!hourlyStartSlot ? "Select Start Time" : !hourlyEndSlot ? "Select End Time" : "Time Range Selected"}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        {avail?.timeSlots?.map((slot) => {
                            const isStart = hourlyStartSlot?.time === slot.time;
                            const isEnd = hourlyEndSlot?.time === slot.time;
                            const inRange = hourlyStartSlot && hourlyEndSlot && 
                                            moment(slot.time, "HH:mm").isBetween(moment(hourlyStartSlot.time, "HH:mm"), moment(hourlyEndSlot.time, "HH:mm"), null, '[]');
                            return (
                                <button
                                    key={slot.time}
                                    onClick={() => handleHourlySlotClick(slot)}
                                    className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-1 ${
                                        isStart || isEnd ? "border-teal-500 bg-teal-500 text-white" :
                                        inRange ? "border-teal-200 bg-teal-50 text-teal-700" :
                                        "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                                    }`}
                                >
                                    <span className="text-xs font-black">{slot.displayTime}</span>
                                    {!inRange && slot.premiumSurcharge > 0 && !isEnd && (
                                        <span className={`text-[8px] font-black ${isStart ? "text-white/80" : "text-rose-500"}`}>
                                            +₹{slot.premiumSurcharge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {mode === "For Multiple Days" && startDate && !endDate && (
                <div className="text-center p-4 bg-teal-50 rounded-2xl border border-teal-100 animate-pulse">
                    <p className="text-xs font-bold text-teal-600 uppercase">Select End Date</p>
                </div>
            )}
        </div>
    );
}