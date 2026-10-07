"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
    FaClock, FaChevronLeft, FaChevronRight, FaSpinner, 
    FaBolt, FaCalendarAlt
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function SlotPicker({
    nurseId,
    itemId,
    isPackage = false,
    onSlotSelect,
    initialBasePrice = 0,
    pricingRates = {}
}) {
    // 1. Shift Mode ('One day One Time' | 'For Multiple Days' | 'Acc. To Per/Hours')
    const [selectedMode, setSelectedMode] = useState("One day One Time");

    // 2. Calendar View & Date States (Starts completely empty)
    const [viewDate, setViewDate] = useState(() => new Date());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 3. Time Slot States (Starts completely empty)
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [hourlyStartSlot, setHourlyStartSlot] = useState(null);
    const [hourlyEndSlot, setHourlyEndSlot] = useState(null);
    
    // 4. Server Availability Data State
    const [calendarDaysList, setCalendarDaysList] = useState([]);
    const [timeSlotsList, setTimeSlotsList] = useState([]);
    const [deliveryConfig, setDeliveryConfig] = useState({ travelBaseFee: 0, expressChargeRate: 100 });
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Keep ref to avoid stale closure without triggering infinite re-render loops
    const onSlotSelectRef = useRef(onSlotSelect);
    useEffect(() => {
        onSlotSelectRef.current = onSlotSelect;
    }, [onSlotSelect]);

    const formatTimeToAMPM = (timeStr) => {
        if (!timeStr) return "";
        if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
        try {
            const [hoursStr, minutesStr] = timeStr.split(":");
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            const strMinutes = minutes < 10 ? "0" + minutes : minutes;
            const strHours = hours < 10 ? "0" + hours : hours;
            return `${strHours}:${strMinutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    // Fetch Availability Slots from Backend
    const fetchSlots = useCallback(async () => {
        if (!nurseId) return;

        try {
            setLoadingSlots(true);
            const params = {
                nurseId,
                serviceId: isPackage ? null : (itemId || null),
                packageId: isPackage ? (itemId || null) : null,
                isPackage: Boolean(isPackage),
                type: selectedMode,
                selectedDate: startDate || undefined
            };

            const apiMethod = UserAPI.getNurseAvailabilitySlots || 
                             UserAPI.getNurseAvailability || 
                             UserAPI.nurseAvailability;

            if (typeof apiMethod === "function") {
                const res = await apiMethod(params);
                const responseData = res?.data || res;

                if (res?.success && responseData) {
                    const fetchedCalendar = Array.isArray(responseData.calendar) ? responseData.calendar : [];

                    const fetchedTimeSlots = Array.isArray(responseData.timeSlots) 
                        ? responseData.timeSlots.map(s => {
                            const isUnavailable = Boolean(s.isDisabled) || s.isAvailable === false;
                            return {
                                time: s.time,
                                displayTime: s.displayTime || formatTimeToAMPM(s.time),
                                surcharge: s.slotPremiumFee || 0,
                                expressExtraFee: s.expressExtraFee || 0,
                                totalSlotPriceWithExpress: s.totalSlotPriceWithExpress || 0,
                                isExpressWindow: Boolean(s.isExpressWindow),
                                isDisabled: isUnavailable,
                                statusLabel: s.statusLabel || (isUnavailable ? "Closed" : s.isExpressWindow ? "1-4h Express Rush" : "Standard"),
                                hourlyBasePrice: s.hourlyBasePrice || 0,
                                totalHourlyPrice: s.totalHourlyPrice || 0,
                                isAvailable: !isUnavailable
                            };
                        })
                        : [];

                    if (responseData.deliveryConfig) {
                        setDeliveryConfig(responseData.deliveryConfig);
                    }

                    setCalendarDaysList(fetchedCalendar);
                    setTimeSlotsList(fetchedTimeSlots);
                }
            }
        } catch (error) {
            console.error("❌ [SlotPicker] Error fetching availability slots:", error);
        } finally {
            setLoadingSlots(false);
        }
    }, [nurseId, itemId, isPackage, selectedMode, startDate]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // Calendar Matrix Builder
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthTotalDays = new Date(year, month, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];

        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({
                dayNumber: prevMonthTotalDays - i,
                isCurrentMonth: false,
                isPast: true,
                iso: ""
            });
        }

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const d = new Date(year, month, day);
            const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = d < today;

            const serverDateObj = calendarDaysList.find(c => c.date === iso);
            const isDisabled = serverDateObj ? serverDateObj.isDisabled : false;
            const pricingObj = serverDateObj?.pricing || {};
            const extraFee = pricingObj.extraFee || 0;
            
            let customDayPrice = pricingRates?.oneDay?.final ?? initialBasePrice ?? 1800;
            if (selectedMode === "For Multiple Days") {
                customDayPrice = pricingObj.multipleDayPrice || pricingRates?.multipleDays?.final || initialBasePrice || 1800;
            } else if (selectedMode === "Acc. To Per/Hours") {
                customDayPrice = pricingObj.hourlyPrice || pricingRates?.hourly?.final || 200;
            } else {
                customDayPrice = pricingObj.oneDayPrice || pricingRates?.oneDay?.final || initialBasePrice || 1800;
            }

            days.push({
                dayNumber: day,
                isCurrentMonth: true,
                isPast,
                isDisabled,
                extraFee,
                customDayPrice,
                iso
            });
        }

        return days;
    }, [viewDate, calendarDaysList, selectedMode, pricingRates, initialBasePrice]);

    const handlePrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const computedHoursCount = useMemo(() => {
        if (selectedMode !== "Acc. To Per/Hours") return 1;
        if (!hourlyStartSlot) return 1;
        if (!hourlyEndSlot) return 1;

        try {
            const [startH, startM] = hourlyStartSlot.time.split(":").map(Number);
            const [endH, endM] = hourlyEndSlot.time.split(":").map(Number);
            const diffHours = (endH + endM / 60) - (startH + startM / 60);
            return Math.max(1, Math.round(diffHours));
        } catch (e) {
            return 1;
        }
    }, [selectedMode, hourlyStartSlot, hourlyEndSlot]);

    const pricing = useMemo(() => {
        const singlePrice = pricingRates?.oneDay?.final ?? initialBasePrice ?? 1800;
        const multiPrice = pricingRates?.multipleDays?.final ?? initialBasePrice ?? 1800;
        const hourlyPrice = pricingRates?.hourly?.final ?? 200;

        let activeBase = singlePrice;
        let units = 1;
        let totalDateExtra = 0;
        let slotExtra = 0;
        let activeExpressFee = 0;

        if (selectedMode === "For Multiple Days") {
            activeBase = multiPrice;
            if (startDate && endDate) {
                const startD = new Date(startDate);
                const endD = new Date(endDate);
                const diffTime = Math.abs(endD - startD);
                units = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

                let curr = new Date(startD);
                while (curr <= endD) {
                    const isoStr = curr.toISOString().split("T")[0];
                    const matchedCalDay = calendarDaysList.find(c => c.date === isoStr);
                    if (matchedCalDay?.pricing?.extraFee) {
                        totalDateExtra += matchedCalDay.pricing.extraFee;
                    }
                    curr.setDate(curr.getDate() + 1);
                }
            } else if (startDate) {
                const matchedCalDay = calendarDaysList.find(c => c.date === startDate);
                if (matchedCalDay?.pricing?.extraFee) {
                    totalDateExtra += matchedCalDay.pricing.extraFee;
                }
            }
            slotExtra = selectedSlot?.surcharge || 0;
            activeExpressFee = selectedSlot?.expressExtraFee || 0;
        } else if (selectedMode === "Acc. To Per/Hours") {
            units = computedHoursCount;
            activeBase = hourlyPrice * units;

            if (hourlyStartSlot?.surcharge) slotExtra += hourlyStartSlot.surcharge;
            if (hourlyEndSlot?.surcharge) slotExtra += hourlyEndSlot.surcharge;
            if (hourlyStartSlot?.expressExtraFee) activeExpressFee = Math.max(activeExpressFee, hourlyStartSlot.expressExtraFee);

            const matchedCalDay = calendarDaysList.find(c => c.date === startDate);
            totalDateExtra = matchedCalDay?.pricing?.extraFee || 0;
        } else {
            activeBase = singlePrice;
            slotExtra = selectedSlot?.surcharge || 0;
            activeExpressFee = selectedSlot?.expressExtraFee || 0;
            const matchedCalDay = calendarDaysList.find(c => c.date === startDate);
            totalDateExtra = matchedCalDay?.pricing?.extraFee || 0;
        }

        const calculatedTotal = activeBase + totalDateExtra + slotExtra + activeExpressFee;

        return {
            singlePrice,
            multiPrice,
            hourlyPrice,
            activeBase,
            units,
            dateExtra: totalDateExtra,
            slotExtra,
            expressExtraFee: activeExpressFee,
            total: calculatedTotal
        };
    }, [pricingRates, initialBasePrice, selectedMode, startDate, endDate, selectedSlot, hourlyStartSlot, hourlyEndSlot, computedHoursCount, calendarDaysList]);

    // 💡 Dispatch selection up to parent with exact string comparison to prevent infinite loops
    const emitSelection = useCallback((newSlot, newMode = selectedMode, newStart = startDate, newEnd = endDate) => {
        if (typeof onSlotSelectRef.current !== "function") return;

        let activeStart = "";
        let activeEnd = "";
        let isExpressWindow = false;
        let displayTime = "";

        if (newMode === "Acc. To Per/Hours") {
            const startS = newSlot?.start || hourlyStartSlot;
            const endS = newSlot?.end || hourlyEndSlot || startS;
            if (startS && !startS.isDisabled) {
                activeStart = startS.time;
                activeEnd = endS?.time || activeStart;
                isExpressWindow = Boolean(startS.isExpressWindow);
                displayTime = newStart ? `${newStart} [${formatTimeToAMPM(activeStart)} to ${formatTimeToAMPM(activeEnd)}] (${pricing.units} Hrs)` : "";
            }
        } else {
            const regS = newSlot?.regular || selectedSlot;
            if (regS && !regS.isDisabled) {
                activeStart = regS.time;
                activeEnd = activeStart;
                isExpressWindow = Boolean(regS.isExpressWindow);
                displayTime = newStart ? (newMode === "For Multiple Days"
                    ? `${newStart} to ${newEnd || newStart} (${formatTimeToAMPM(activeStart)})`
                    : `${newStart} (${formatTimeToAMPM(activeStart)})`) : "";
            }
        }

        onSlotSelectRef.current({
            mode: newMode,
            startDate: newStart || "",
            endDate: newMode === "For Multiple Days" ? (newEnd || newStart || "") : (newStart || ""),
            startTime: activeStart,
            endTime: activeEnd,
            hoursCount: pricing.units,
            extraFee: pricing.dateExtra + pricing.slotExtra,
            expressExtraFee: pricing.expressExtraFee,
            isExpressWindow,
            basePrice: pricing.activeBase,
            totalPrice: pricing.total,
            displayTime
        });
    }, [selectedMode, startDate, endDate, hourlyStartSlot, hourlyEndSlot, selectedSlot, pricing]);

    const handleDateClick = (isoDate, isDisabled) => {
        if (isDisabled) return;

        setSelectedSlot(null);
        setHourlyStartSlot(null);
        setHourlyEndSlot(null);

        let newStart = startDate;
        let newEnd = endDate;

        if (selectedMode === "For Multiple Days") {
            if (!startDate || (startDate && endDate)) {
                newStart = isoDate;
                newEnd = "";
            } else if (startDate && !endDate) {
                if (new Date(isoDate) < new Date(startDate)) {
                    newStart = isoDate;
                    newEnd = "";
                } else {
                    newEnd = isoDate;
                }
            }
        } else {
            newStart = isoDate;
            newEnd = isoDate;
        }

        setStartDate(newStart);
        setEndDate(newEnd);
        emitSelection({ regular: null, start: null, end: null }, selectedMode, newStart, newEnd);
    };

    const handleRegularSlotClick = (slot) => {
        if (slot.isDisabled) return;
        setSelectedSlot(slot);
        emitSelection({ regular: slot }, selectedMode, startDate, endDate);
    };

    const handleHourlySlotClick = (slot) => {
        if (slot.isDisabled) return;

        let newStart = hourlyStartSlot;
        let newEnd = hourlyEndSlot;

        if (!hourlyStartSlot || (hourlyStartSlot && hourlyEndSlot)) {
            newStart = slot;
            newEnd = null;
        } else if (hourlyStartSlot && !hourlyEndSlot) {
            if (slot.time <= hourlyStartSlot.time) {
                newStart = slot;
                newEnd = null;
            } else {
                newEnd = slot;
            }
        }

        setHourlyStartSlot(newStart);
        setHourlyEndSlot(newEnd);
        emitSelection({ start: newStart, end: newEnd }, selectedMode, startDate, endDate);
    };

    return (
        <div className="bg-white border-2 border-slate-200/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xs space-y-7 text-slate-900 font-sans">
            
            {/* Mode Tabs */}
            <div className="bg-[#F8FAFC] p-1.5 rounded-2xl sm:rounded-3xl border border-slate-200/80 grid grid-cols-3 gap-1.5">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedMode("One day One Time");
                        setEndDate(startDate);
                        setSelectedSlot(null);
                        emitSelection({ regular: null }, "One day One Time", startDate, startDate);
                    }}
                    className={`py-3.5 sm:py-4 px-2 rounded-xl sm:rounded-2xl text-center transition-all cursor-pointer ${
                        selectedMode === "One day One Time" ? "bg-white border-2 border-[#08B36A] shadow-sm" : "bg-transparent border-2 border-transparent hover:bg-white/50"
                    }`}
                >
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider block ${selectedMode === "One day One Time" ? "text-[#08B36A]" : "text-slate-600"}`}>
                        Single Visit
                    </span>
                    <span className={`text-xs sm:text-sm font-black block mt-0.5 ${selectedMode === "One day One Time" ? "text-[#08B36A]" : "text-slate-800"}`}>
                        ₹{pricing.singlePrice}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setSelectedMode("For Multiple Days");
                        setSelectedSlot(null);
                        emitSelection({ regular: null }, "For Multiple Days", startDate, endDate);
                    }}
                    className={`py-3.5 sm:py-4 px-2 rounded-xl sm:rounded-2xl text-center transition-all cursor-pointer ${
                        selectedMode === "For Multiple Days" ? "bg-white border-2 border-[#08B36A] shadow-sm" : "bg-transparent border-2 border-transparent hover:bg-white/50"
                    }`}
                >
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider block ${selectedMode === "For Multiple Days" ? "text-[#08B36A]" : "text-slate-600"}`}>
                        Multi-Day
                    </span>
                    <span className={`text-xs sm:text-sm font-black block mt-0.5 ${selectedMode === "For Multiple Days" ? "text-[#08B36A]" : "text-slate-800"}`}>
                        ₹{pricing.multiPrice}/Day
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setSelectedMode("Acc. To Per/Hours");
                        setEndDate(startDate);
                        setHourlyStartSlot(null);
                        setHourlyEndSlot(null);
                        emitSelection({ start: null, end: null }, "Acc. To Per/Hours", startDate, startDate);
                    }}
                    className={`py-3.5 sm:py-4 px-2 rounded-xl sm:rounded-2xl text-center transition-all cursor-pointer ${
                        selectedMode === "Acc. To Per/Hours" ? "bg-white border-2 border-[#08B36A] shadow-sm" : "bg-transparent border-2 border-transparent hover:bg-white/50"
                    }`}
                >
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider block ${selectedMode === "Acc. To Per/Hours" ? "text-[#08B36A]" : "text-slate-600"}`}>
                        Hourly Range
                    </span>
                    <span className={`text-xs sm:text-sm font-black block mt-0.5 ${selectedMode === "Acc. To Per/Hours" ? "text-[#08B36A]" : "text-slate-800"}`}>
                        ₹{pricing.hourlyPrice}/Hr
                    </span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    <div className="text-center">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </h3>
                        {selectedMode === "For Multiple Days" ? (
                            <p className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider mt-0.5">
                                {startDate && !endDate ? "Select End Date" : startDate && endDate ? `${pricing.units} Days Range Selected (₹${pricing.activeBase}/day)` : "Click to select range"}
                            </p>
                        ) : (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                {startDate ? `Selected: ${startDate}` : "Select Date"}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                    {WEEKDAYS.map(day => (
                        <span key={day} className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider py-1">
                            {day}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {calendarDays.map((item, idx) => {
                        if (!item.isCurrentMonth) {
                            return (
                                <div key={idx} className="min-h-[58px] sm:min-h-[68px] rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-200 font-black text-xs sm:text-sm bg-slate-50/50">
                                    {item.dayNumber}
                                </div>
                            );
                        }

                        if (item.isPast || item.isDisabled) {
                            return (
                                <div key={idx} className="min-h-[58px] sm:min-h-[68px] rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-300 font-bold text-xs sm:text-sm bg-slate-50 border border-slate-100 cursor-not-allowed">
                                    {item.dayNumber}
                                </div>
                            );
                        }

                        const isStart = startDate === item.iso;
                        const isEnd = endDate === item.iso;
                        const isInRange = selectedMode === "For Multiple Days" && startDate && endDate && (new Date(item.iso) > new Date(startDate) && new Date(item.iso) < new Date(endDate));
                        const isSelected = isStart || isEnd;

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleDateClick(item.iso, item.isDisabled)}
                                className={`min-h-[58px] sm:min-h-[68px] p-1.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                    isSelected
                                        ? "bg-[#08B36A] border-[#08B36A] text-white shadow-lg shadow-emerald-600/30 scale-[1.02] z-10"
                                        : isInRange
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                        : "bg-white border-slate-200/80 hover:border-[#08B36A] text-slate-800 hover:shadow-xs"
                                }`}
                            >
                                <span className={`text-xs sm:text-sm font-black leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                                    {item.dayNumber}
                                </span>
                                <span className={`text-[9px] sm:text-[10px] font-bold block mt-0.5 leading-none ${
                                    isSelected ? "text-white" : isInRange ? "text-emerald-800" : "text-slate-500"
                                }`}>
                                    ₹{item.customDayPrice}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <FaClock className="text-[#08B36A]" /> 
                        {selectedMode === "Acc. To Per/Hours" 
                            ? `Select Shift Time Range` 
                            : selectedMode === "For Multiple Days" 
                            ? "Select Daily Shift Arrival Time" 
                            : "Choose Arrival Time"}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                        Date: <strong className="text-slate-700">{startDate || "Not Selected"}</strong>
                    </span>
                </div>

                {!startDate ? (
                    <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs font-bold text-slate-400 border border-dashed border-slate-200">
                        Please select a date from the calendar above to view available time slots.
                    </div>
                ) : loadingSlots ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                        <FaSpinner className="animate-spin text-[#08B36A]" />
                        <span className="text-xs font-bold uppercase tracking-wider">Loading Slots...</span>
                    </div>
                ) : timeSlotsList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {timeSlotsList.map((slot, idx) => {
                            const isHourlyStart = selectedMode === "Acc. To Per/Hours" && hourlyStartSlot?.time === slot.time;
                            const isHourlyEnd = selectedMode === "Acc. To Per/Hours" && hourlyEndSlot?.time === slot.time;
                            const isInHourlyRange = selectedMode === "Acc. To Per/Hours" && hourlyStartSlot && hourlyEndSlot && (slot.time > hourlyStartSlot.time && slot.time < hourlyEndSlot.time);

                            const isRegularSelected = selectedMode !== "Acc. To Per/Hours" && selectedSlot?.time === slot.time;
                            const isSelected = isRegularSelected || isHourlyStart || isHourlyEnd;

                            if (slot.isDisabled) {
                                return (
                                    <div 
                                        key={idx} 
                                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-100 text-center opacity-70 cursor-not-allowed flex flex-col justify-center"
                                    >
                                        <p className="text-xs sm:text-sm font-bold text-slate-400 line-through">
                                            {slot.displayTime || slot.time}
                                        </p>
                                        <span className="text-[9px] font-black uppercase tracking-tight text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md mt-1 w-fit mx-auto">
                                            {slot.statusLabel || "Closed"}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        if (selectedMode === "Acc. To Per/Hours") {
                                            handleHourlySlotClick(slot);
                                        } else {
                                            handleRegularSlotClick(slot);
                                        }
                                    }}
                                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                                        isSelected
                                            ? "border-[#08B36A] bg-[#08B36A] text-white shadow-lg shadow-emerald-600/30 scale-[1.03] z-10"
                                            : isInHourlyRange
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-bold"
                                            : slot.isExpressWindow
                                            ? "border-amber-300 bg-amber-50/60 hover:border-amber-400 text-slate-900 hover:shadow-xs"
                                            : "border-slate-200 bg-white hover:border-[#08B36A] text-slate-900 hover:shadow-xs"
                                    }`}
                                >
                                    <p className={`text-xs sm:text-sm font-black ${
                                        isSelected ? "text-white" : isInHourlyRange ? "text-emerald-950" : "text-slate-900"
                                    }`}>
                                        {slot.displayTime || slot.time}
                                    </p>
                                    
                                    <span className={`text-[9px] sm:text-[10px] font-bold block mt-0.5 flex items-center justify-center gap-1 ${
                                        isSelected 
                                            ? "text-emerald-100" 
                                            : isInHourlyRange 
                                            ? "text-emerald-800" 
                                            : slot.isExpressWindow 
                                            ? "text-amber-700" 
                                            : "text-slate-500"
                                    }`}>
                                        {slot.isExpressWindow && !isSelected && <FaBolt size={8} className="text-amber-500" />}
                                        {isHourlyStart ? "Start Time" : isHourlyEnd ? "End Time" : slot.statusLabel}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs font-semibold text-slate-400">
                        No available slots for this date.
                    </div>
                )}
            </div>
        </div>
    );
}