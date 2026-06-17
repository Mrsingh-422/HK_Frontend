"use client";

import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const DateSelectorModal = ({ isOpen, onClose, onNext, startDate, setStartDate, endDate, setEndDate }) => {
  // Current calendar view month (defaults to today or selected start date)
  const [viewDate, setViewDate] = useState(() => {
    if (startDate) return new Date(startDate);
    return new Date();
  });

  if (!isOpen) return null;

  // --- CALENDAR MATHEMATICS ---
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get total days in currently viewed month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get weekday index of the 1st day of the month (0 = Sunday, 6 = Saturday)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Parse parent string dates (YYYY-MM-DD) into JavaScript Dates for comparative math
  const startObj = startDate ? new Date(startDate + 'T00:00:00') : null;
  const endObj = endDate ? new Date(endDate + 'T00:00:00') : null;

  // Format Helper: JS Date -> YYYY-MM-DD
  const formatDateString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Navigate calendar months
  const adjustMonth = (offset) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  // Handle visual grid day click
  const handleDayClick = (dayNum) => {
    const clickedDate = new Date(year, month, dayNum);
    clickedDate.setHours(0,0,0,0);

    // Prevent selection of past dates (relative to current date)
    const today = new Date();
    today.setHours(0,0,0,0);
    if (clickedDate < today) {
      alert("Cannot select historical dates.");
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // First click or reset click: Set as start date, clear end date
      setStartDate(formatDateString(clickedDate));
      setEndDate("");
    } else {
      // Second click: Evaluate range boundaries
      const currentStart = new Date(startDate + 'T00:00:00');
      if (clickedDate < currentStart) {
        // If clicked date is before start date, make it the new start date
        setStartDate(formatDateString(clickedDate));
      } else {
        // Set as end date
        setEndDate(formatDateString(clickedDate));
      }
    }
  };

  // Compile classes dynamically for each day cell
  const getDayClasses = (dayNum) => {
    const dateOfCell = new Date(year, month, dayNum);
    dateOfCell.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const isPast = dateOfCell < today;
    const isStart = startObj && dateOfCell.getTime() === startObj.getTime();
    const isEnd = endObj && dateOfCell.getTime() === endObj.getTime();
    const isWithinRange = startObj && endObj && dateOfCell > startObj && dateOfCell < endObj;

    let base = "h-9 w-9 text-xs font-bold rounded-lg flex items-center justify-center transition-all duration-150 ";

    if (isPast) {
      return base + "text-slate-300 cursor-not-allowed";
    }
    if (isStart || isEnd) {
      return base + "bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/20 scale-105 cursor-pointer z-10";
    }
    if (isWithinRange) {
      return base + "bg-[#08B36A]/10 text-[#08B36A] rounded-none hover:bg-[#08B36A]/20 cursor-pointer";
    }
    return base + "text-slate-700 hover:bg-slate-100 cursor-pointer";
  };

  const handleNextSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please configure both admission and discharge dates on the map grid.");
      return;
    }
    onNext();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 md:p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#08B36A]/10 text-[#08B36A] rounded-xl">
              <FaCalendarAlt size={14} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Admission Schedule</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Step 1: Choose Allotment Range</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Custom Calendar Navigation */}
        <div className="flex justify-between items-center mb-5">
          <button 
            type="button" 
            onClick={() => adjustMonth(-1)}
            className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200/50 transition-all"
          >
            <FaChevronLeft size={10} />
          </button>
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
            {monthNames[month]} {year}
          </span>
          <button 
            type="button" 
            onClick={() => adjustMonth(1)}
            className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200/50 transition-all"
          >
            <FaChevronRight size={10} />
          </button>
        </div>

        {/* Custom Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
            <div key={day} className="h-6 flex items-center justify-center">{day}</div>
          ))}
        </div>

        {/* Custom Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center mb-6">
          {/* Pad empty days for first week offset alignment */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-9 w-9"></div>
          ))}

          {/* Render each numerical day of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={getDayClasses(dayNum)}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Selected Duration Indicators */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between gap-4 text-xs font-bold text-slate-600 mb-6 shadow-inner">
          <div className="flex-1">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Start Date</span>
            <span className={startDate ? "text-slate-900 font-extrabold" : "text-slate-400 italic font-medium"}>
              {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "Not Selected"}
            </span>
          </div>
          <div className="border-r border-slate-200"></div>
          <div className="flex-1 text-right">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Discharge Date</span>
            <span className={endDate ? "text-slate-900 font-extrabold" : "text-slate-400 italic font-medium"}>
              {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "Not Selected"}
            </span>
          </div>
        </div>

        {/* Form Submission Action */}
        <form onSubmit={handleNextSubmit}>
          <button 
            type="submit" 
            className="w-full bg-[#08B36A] hover:bg-[#079d5c] text-white font-extrabold text-[10px] tracking-widest uppercase py-4 rounded-xl transition-all shadow-md shadow-[#08B36A]/10 active:scale-98"
          >
            Next: Select Vacant Bed &rarr;
          </button>
        </form>

      </div>
    </div>
  );
};

export default DateSelectorModal;