"use client";
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaRegCalendarCheck } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function SlotPicker({ nurseId, itemId, isPackage, onSlotSelect }) {
    const [mode, setMode] = useState("One day One Time");
    const [avail, setAvail] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment());

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [hourlyStartSlot, setHourlyStartSlot] = useState(null);
    const [hourlyEndSlot, setHourlyEndSlot] = useState(null);

    useEffect(() => {
        const fetchAvail = async () => {
            try {
                setLoading(true);
                const typeMapping = {
                    "One day One Time": "One day One Time",
                    "For Multiple Days": "For Multiple Days",
                    "Acc. To Per/Hours": "Acc. To Per/Hours"
                };
                const query = `serviceId=${!isPackage ? itemId : ''}&packageId=${isPackage ? itemId : ''}&isPackage=${isPackage}&type=${typeMapping[mode]}`;
                
                const res = await UserAPI.getNurseSlots(nurseId, query);
                if (res.success) {
                    setAvail(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch slots:", err);
            } finally {
                setLoading(false);
            }
        };
        if (nurseId && itemId) fetchAvail();
    }, [mode, nurseId, itemId, isPackage]);

    useEffect(() => {
        if (!startDate || !avail) return;

        let totalSurcharge = 0;
        let startTime = "";
        let endTime = "";
        let calculatedTotalPrice = 0;
        let currentBasePrice = 0;

        const dateData = avail.calendar?.find(c => c.date === startDate);
        const dateExtra = dateData?.pricing?.extraFee || 0;

        if (mode === "One day One Time") {
            currentBasePrice = avail.prices?.oneDayFinal || 0;
            if (selectedSlot) {
                totalSurcharge = dateExtra + (selectedSlot.slotPremiumFee || 0); 
                startTime = selectedSlot.time;
                endTime = moment(selectedSlot.time, "HH:mm").add(1, 'hour').format("HH:mm");
                calculatedTotalPrice = currentBasePrice + totalSurcharge;
            }
        } 
        else if (mode === "Acc. To Per/Hours") {
            currentBasePrice = avail.prices?.hourlyFinal || 0;
            if (hourlyStartSlot && hourlyEndSlot) {
                startTime = hourlyStartSlot.time;
                endTime = hourlyEndSlot.time;
                const hours = moment(endTime, "HH:mm").diff(moment(startTime, "HH:mm"), 'hours');
                const validHours = hours > 0 ? hours : 1;
                
                totalSurcharge = dateExtra + (hourlyStartSlot.slotPremiumFee || 0);
                calculatedTotalPrice = (currentBasePrice * validHours) + totalSurcharge;
            }
        }
        else if (mode === "For Multiple Days" && startDate && endDate) {
            currentBasePrice = avail.prices?.multipleDaysFinal || 0;
            let rangeSurcharge = 0;
            let daysCount = 0;

            let tempDate = moment(startDate).clone();
            let end = moment(endDate);
            
            while (tempDate.isSameOrBefore(end, 'day')) {
                daysCount++;
                const dStr = tempDate.format('YYYY-MM-DD');
                const dayData = avail.calendar?.find(c => c.date === dStr);
                if (dayData?.pricing?.extraFee) rangeSurcharge += dayData.pricing.extraFee;
                tempDate.add(1, 'day');
            }

            totalSurcharge = rangeSurcharge;
            startTime = "09:00"; 
            endTime = "18:00";
            calculatedTotalPrice = (currentBasePrice * daysCount) + rangeSurcharge;
        }

        onSlotSelect({
            mode,
            startDate,
            endDate: endDate || startDate,
            startTime,
            endTime,
            extraFee: totalSurcharge,
            basePrice: currentBasePrice, 
            totalPrice: calculatedTotalPrice,
            displayTime: mode === "One day One Time" ? selectedSlot?.displayTime : 
                         mode === "Acc. To Per/Hours" ? (hourlyStartSlot && hourlyEndSlot ? `${hourlyStartSlot.displayTime} - ${hourlyEndSlot.displayTime}` : "") :
                         (startDate && endDate ? `${moment(startDate).format('DD MMM')} - ${moment(endDate).format('DD MMM')} (${moment(endDate).diff(moment(startDate), 'days') + 1} Days)` : "")
        });
    }, [startDate, endDate, selectedSlot, hourlyStartSlot, hourlyEndSlot, mode, avail]);

    const handleDateClick = (dStr) => {
        if (mode !== "For Multiple Days") {
            setStartDate(dStr);
            setEndDate(dStr);
            setSelectedSlot(null); setHourlyStartSlot(null); setHourlyEndSlot(null);
        } else {
            if (!startDate || (startDate && endDate)) {
                setStartDate(dStr); setEndDate(null);
            } else {
                if (moment(dStr).isBefore(startDate)) {
                    setStartDate(dStr); setEndDate(null);
                } else {
                    setEndDate(dStr);
                }
            }
        }
    };

    const calendarDays = useMemo(() => {
        const start = currentMonth.clone().startOf('month').startOf('week');
        const end = currentMonth.clone().endOf('month').endOf('week');
        const days = [];
        let day = start;
        while (day.isBefore(end)) {
            days.push(day.clone());
            day.add(1, 'day');
        }
        return days;
    }, [currentMonth]);

    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08B36A] flex items-center justify-center">
                        <FaRegCalendarCheck size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900">Select Schedule</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Choose Visit Duration & Slot</p>
                    </div>
                </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
                {[
                    { id: 'One day One Time', label: 'Single Visit', price: avail?.prices?.oneDayFinal },
                    { id: 'For Multiple Days', label: 'Multi-Day', price: avail?.prices?.multipleDaysFinal },
                    { id: 'Acc. To Per/Hours', label: 'Hourly', price: avail?.prices?.hourlyFinal }
                ].map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => { 
                            setMode(m.id); 
                            setStartDate(null); 
                            setEndDate(null); 
                            setSelectedSlot(null); 
                            setHourlyStartSlot(null); 
                            setHourlyEndSlot(null); 
                        }}
                        className={`py-2.5 px-2 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            mode === m.id 
                                ? "bg-white text-[#08B36A] shadow-sm font-black ring-1 ring-[#08B36A]/20" 
                                : "text-slate-500 hover:text-slate-800 font-semibold"
                        }`}
                    >
                        <span className="text-[11px] uppercase tracking-tight">{m.label}</span>
                        <span className="text-[10px] font-extrabold opacity-90">₹{m.price || '0'}</span>
                    </button>
                ))}
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-2 pt-2">
                <button 
                    type="button"
                    onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} 
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center transition-all hover:bg-slate-50 hover:border-slate-300"
                >
                    <FaChevronLeft size={12} />
                </button>
                <span className="text-sm font-black text-slate-800 tracking-tight">
                    {currentMonth.format('MMMM YYYY')}
                </span>
                <button 
                    type="button"
                    onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} 
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center transition-all hover:bg-slate-50 hover:border-slate-300"
                >
                    <FaChevronRight size={12} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
                    <div key={idx} className="text-[10px] font-black text-slate-400 text-center py-1 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
                {calendarDays.map((date) => {
                    const dStr = date.format('YYYY-MM-DD');
                    const isCurrentMonth = date.month() === currentMonth.month();
                    const dateInfo = avail?.calendar?.find(c => c.date === dStr);
                    const isSel = dStr === startDate || dStr === endDate;
                    const inRange = mode === "For Multiple Days" && startDate && endDate && date.isBetween(startDate, endDate, 'day');
                    const isPremium = dateInfo?.pricing?.isPremium;
                    
                    const displayPrice = mode === "One day One Time" ? dateInfo?.pricing?.oneDayPrice : dateInfo?.pricing?.multipleDayPrice;
                    const today = moment().startOf('day');
                    const isPastDate = date.isBefore(today, 'day');

                    return (
                        <button
                            key={dStr}
                            disabled={loading || !isCurrentMonth || isPastDate}
                            onClick={() => handleDateClick(dStr)}
                            type="button"
                            className={`min-h-[58px] p-1.5 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                                !isCurrentMonth ? "opacity-25 cursor-not-allowed border-transparent" :
                                isPastDate ? "bg-slate-50/70 text-slate-300 border-slate-100 cursor-not-allowed" :
                                isSel ? "bg-[#08B36A] text-white border-[#08B36A] shadow-md shadow-[#08B36A]/20" :
                                inRange ? "bg-emerald-50 border-emerald-200 text-[#08B36A]" :
                                isPremium ? "bg-amber-50/50 border-amber-200 hover:border-amber-300" : 
                                "bg-white border-slate-200 hover:border-[#08B36A] hover:bg-emerald-50/20"
                            }`}
                        >
                            <span className={`text-xs font-black ${
                                isPastDate ? "text-slate-300" : 
                                isSel ? "text-white" : 
                                isPremium ? "text-amber-700" : "text-slate-800"
                            }`}>
                                {date.date()}
                            </span>
                            
                            {displayPrice && mode !== "Acc. To Per/Hours" && !isPastDate && (
                                <span className={`text-[8px] font-bold ${isSel ? "text-white/90" : "text-slate-400"}`}>
                                    ₹{displayPrice}
                                </span>
                            )}

                            {dateInfo?.pricing?.extraFee > 0 && !isPastDate && (
                                <span className={`text-[7px] font-black ${isSel ? 'text-white' : 'text-emerald-700'}`}>
                                    +₹{dateInfo.pricing.extraFee}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Arrival Time Selector for Single Visit */}
            {mode === "One day One Time" && startDate && (
                <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <FaClock className="text-[#08B36A] text-xs" />
                        <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            Choose Arrival Time
                        </h4>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {avail?.timeSlots?.map((slot) => {
                            const isSelected = selectedSlot?.time === slot.time;
                            const hasPremium = slot.slotPremiumFee > 0;

                            return (
                                <button
                                    key={slot.time}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                        isSelected 
                                            ? "border-[#08B36A] bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20" 
                                            : "border-slate-200 bg-white hover:border-[#08B36A] hover:bg-emerald-50/20 text-slate-800"
                                    }`}
                                >
                                    <p className="text-xs font-black">{slot.displayTime}</p>
                                    <p className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-emerald-100" : hasPremium ? "text-amber-600" : "text-slate-400"}`}>
                                        {hasPremium ? `+₹${slot.slotPremiumFee}` : "Standard"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Time Selector for Hourly Mode */}
            {mode === "Acc. To Per/Hours" && startDate && (
                <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <FaClock className="text-[#08B36A] text-xs" />
                        <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            {!hourlyStartSlot ? "Select Start Time" : !hourlyEndSlot ? "Select End Time" : "Time Range Selected"}
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {avail?.timeSlots?.map((slot) => {
                            const isStart = hourlyStartSlot?.time === slot.time;
                            const isEnd = hourlyEndSlot?.time === slot.time;
                            const inRange = hourlyStartSlot && hourlyEndSlot && moment(slot.time, "HH:mm").isBetween(moment(hourlyStartSlot.time, "HH:mm"), moment(hourlyEndSlot.time, "HH:mm"), null, '[]');
                            const hasPremium = slot.slotPremiumFee > 0;

                            return (
                                <button
                                    key={slot.time}
                                    type="button"
                                    onClick={() => {
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
                                    }}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                        isStart || isEnd 
                                            ? "border-[#08B36A] bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20" 
                                            : inRange 
                                            ? "border-emerald-200 bg-emerald-50 text-[#08B36A]" 
                                            : "border-slate-200 bg-white hover:border-[#08B36A] text-slate-800"
                                    }`}
                                >
                                    <span className="text-xs font-black">{slot.displayTime}</span>
                                    <span className={`block text-[9px] font-bold mt-0.5 ${
                                        isStart || isEnd ? "text-emerald-100" : hasPremium ? "text-amber-600" : "text-slate-400"
                                    }`}>
                                        {hasPremium ? `+₹${slot.slotPremiumFee}` : "Standard"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}