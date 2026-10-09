"use client";

import React, { useMemo } from "react";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaLock, FaBan } from "react-icons/fa";

export default function AppointmentScheduler({
  selectedDate,
  onSelectDate,
  slots = [],
  selectedSlot,
  onSelectSlot,
  isLoadingSlots
}) {
  // Generate next 7 selectable days
  const upcomingDates = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        fullDate: d.toISOString().split("T")[0],
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" })
      });
    }
    return list;
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Select OPD Date & Slot</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Real-time availability synced with the OPD queue desk.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Passed / Booked
          </span>
        </div>
      </div>

      {/* 1. Date Strip */}
      <div className="mb-8">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
          1. Choose Date
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
          {upcomingDates.map((item) => {
            const isSelected = selectedDate === item.fullDate;
            return (
              <button
                key={item.fullDate}
                type="button"
                onClick={() => onSelectDate(item.fullDate)}
                className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102"
                    : "bg-slate-50 border-slate-100 text-slate-700 hover:border-emerald-500 hover:bg-white"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {item.day}
                </span>
                <span className="text-lg font-black mt-0.5">{item.dateNum}</span>
                <span className={`text-[9px] font-semibold uppercase ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Slots Grid according to backend format */}
      <div>
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
          2. Select an Available OPD Slot ({selectedDate})
        </label>

        {isLoadingSlots ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold">Checking live slot availability...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold">
            No consultation slots published for this date.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot?.time24 === slot.time24;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    !isAvailable
                      ? "bg-slate-100/70 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-102"
                      : "bg-white border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                >
                  <span className="text-xs font-black tracking-tight">{slot.time}</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? "text-emerald-100"
                        : isAvailable
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {slot.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Selection Banner */}
      {selectedSlot && (
        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <FaCheckCircle className="text-emerald-600 text-base" />
            <span>
              Selected Slot: <strong>{selectedSlot.time}</strong> on <strong>{selectedDate}</strong>
            </span>
          </div>
          <span className="font-black text-[10px] uppercase bg-emerald-600 text-white px-3 py-1 rounded-lg">
            Reserved
          </span>
        </div>
      )}
    </div>
  );
}