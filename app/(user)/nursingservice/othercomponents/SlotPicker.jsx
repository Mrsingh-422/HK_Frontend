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
    const [currentMonth, setCurrentMonth] = useState(moment("2026-05-01")); 

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
            basePrice: currentBasePrice, // NEW: Sending the specific mode's base price
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
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6">Select Schedule</h3>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                {[
                    {id: 'One day One Time', label: 'Single', price: avail?.prices?.oneDayFinal},
                    {id: 'For Multiple Days', label: 'Multi-Day', price: avail?.prices?.multipleDaysFinal},
                    {id: 'Acc. To Per/Hours', label: 'Hourly', price: avail?.prices?.hourlyFinal}
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => { setMode(m.id); setStartDate(null); setEndDate(null); setSelectedSlot(null); setHourlyStartSlot(null); setHourlyEndSlot(null); }}
                        className={`flex-1 py-3 rounded-xl transition-all flex flex-col items-center ${mode === m.id ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                        <span className="text-[9px] font-bold">₹{m.price || '0'}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6 px-2">
                <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-all hover:bg-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-black text-slate-800">{currentMonth.format('MMMM YYYY')}</span>
                <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-all hover:bg-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-8">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                    <div key={idx} className="text-[10px] font-black text-slate-300 text-center py-2">{d}</div>
                ))}
                {calendarDays.map((date) => {
                    const dStr = date.format('YYYY-MM-DD');
                    const isCurrentMonth = date.month() === currentMonth.month();
                    const dateInfo = avail?.calendar?.find(c => c.date === dStr);
                    const isSel = dStr === startDate || dStr === endDate;
                    const inRange = mode === "For Multiple Days" && startDate && endDate && date.isBetween(startDate, endDate, 'day');
                    const isPremium = dateInfo?.pricing?.isPremium;
                    
                    const displayPrice = mode === "One day One Time" ? dateInfo?.pricing?.oneDayPrice : dateInfo?.pricing?.multipleDayPrice;

                    return (
                        <button
                            key={dStr}
                            disabled={loading || !isCurrentMonth}
                            onClick={() => handleDateClick(dStr)}
                            className={`h-16 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                                !isCurrentMonth ? "opacity-20 cursor-not-allowed" :
                                isSel ? "bg-teal-500 text-white border-teal-500 shadow-lg" :
                                inRange ? "bg-teal-50 border-teal-100 text-teal-700" :
                                isPremium ? "bg-rose-50 border-rose-100 hover:border-rose-300" : "bg-teal-50/30 border-teal-50 hover:border-teal-100"
                            }`}
                        >
                            <span className={`text-[11px] font-black ${!isSel && isPremium ? "text-rose-600" : !isSel ? "text-teal-700" : ""}`}>{date.date()}</span>
                            {displayPrice && mode !== "Acc. To Per/Hours" && (
                                <span className={`text-[7px] font-bold ${isSel ? "text-white/80" : "text-slate-400"}`}>₹{displayPrice}</span>
                            )}
                            {dateInfo?.pricing?.extraFee > 0 && (
                                <span className={`text-[6px] font-black ${isSel ? 'text-white' : 'text-rose-500 underline'}`}>+₹{dateInfo.pricing.extraFee}</span>
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
                                {slot.displayTime} — {slot.slotPremiumFee > 0 ? `+ ₹${slot.slotPremiumFee} Premium` : "No Extra Fee"}
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
                            const inRange = hourlyStartSlot && hourlyEndSlot && moment(slot.time, "HH:mm").isBetween(moment(hourlyStartSlot.time, "HH:mm"), moment(hourlyEndSlot.time, "HH:mm"), null, '[]');
                            const hasPremium = slot.slotPremiumFee > 0;

                            return (
                                <button
                                    key={slot.time}
                                    onClick={() => {
                                        if (!hourlyStartSlot || (hourlyStartSlot && hourlyEndSlot)) { setHourlyStartSlot(slot); setHourlyEndSlot(null); }
                                        else {
                                            if (moment(slot.time, "HH:mm").isBefore(moment(hourlyStartSlot.time, "HH:mm"))) { setHourlyStartSlot(slot); setHourlyEndSlot(null); }
                                            else setHourlyEndSlot(slot);
                                        }
                                    }}
                                    className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-1 ${
                                        isStart || isEnd ? "border-teal-500 bg-teal-500 text-white" :
                                        inRange ? "border-teal-200 bg-teal-50 text-teal-700" :
                                        hasPremium ? "border-rose-100 bg-rose-50/30 hover:border-rose-200" : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                                    }`}
                                >
                                    <span className="text-[10px] font-black">{slot.displayTime}</span>
                                    <span className={`text-[8px] font-bold ${isStart || isEnd ? "text-white/80" : hasPremium ? "text-rose-500" : "text-slate-400"}`}>
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