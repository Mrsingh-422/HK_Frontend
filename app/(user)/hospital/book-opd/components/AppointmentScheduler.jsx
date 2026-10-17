"use client";

import React, { useMemo } from "react";
import {
  FaCheckCircle,
  FaCrown,
  FaCalendarTimes,
  FaBan,
  FaClock,
  FaSun,
  FaCloudSun,
  FaMoon
} from "react-icons/fa";

export default function AppointmentScheduler({
  selectedDate,
  onSelectDate,
  slots = [],
  selectedSlot,
  onSelectSlot,
  isLoadingSlots,
  isClosed = false,
  closureReason = ""
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

  // Group slots by Shift/Category (Morning, Afternoon, Evening)
  const groupedSlots = useMemo(() => {
    const groups = {
      Morning: [],
      Afternoon: [],
      Evening: []
    };

    slots.forEach((s) => {
      const cat = s.category || "Morning";
      if (groups[cat]) {
        groups[cat].push(s);
      } else {
        groups.Morning.push(s);
      }
    });

    return groups;
  }, [slots]);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Select OPD Date & Slot
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Real-time availability synced directly with the doctor's cabin desk.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <FaCrown className="text-amber-500 text-xs" /> Premium
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Blocked / OT
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Past / Taken
          </span>
        </div>
      </div>

      {/* 1. Date Selector Strip */}
      <div className="mb-8">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
          1. Choose Consultation Date
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
          {upcomingDates.map((item) => {
            const isSelected = selectedDate === item.fullDate;
            return (
              <button
                key={item.fullDate}
                type="button"
                onClick={() => onSelectDate(item.fullDate)}
                className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md scale-102"
                    : "bg-slate-50 border-slate-200/80 text-slate-700 hover:border-emerald-500 hover:bg-white"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {item.day}
                </span>
                <span className="text-lg font-black mt-0.5">{item.dateNum}</span>
                <span className={`text-[9px] font-semibold uppercase ${isSelected ? "text-emerald-400" : "text-slate-400"}`}>
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DOCTOR ON APPROVED LEAVE / CLINIC CLOSED WARNING */}
      {isClosed ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-rose-50/70 border-2 border-rose-200 text-center space-y-3 animate-in fade-in">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xs">
            <FaCalendarTimes />
          </div>
          <div>
            <h3 className="text-base font-black text-rose-900 tracking-tight">
              Doctor Not Available On This Date
            </h3>
            <p className="text-xs text-rose-700 font-bold max-w-md mx-auto mt-1 leading-relaxed">
              {closureReason || "The doctor is on approved leave. Please select another date from the calendar above."}
            </p>
          </div>
          <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">
            &uarr; Please tap another date from the calendar strip above
          </p>
        </div>
      ) : (
        /* 3. SLOTS VIEW (When Doctor is Available) */
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              2. Select Available Slot ({selectedDate})
            </label>
            <span className="text-[11px] text-slate-500 font-bold">
              {slots.filter((s) => s.isAvailable).length} Available Today
            </span>
          </div>

          {isLoadingSlots ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold">Checking live slot availability & doctor cabin status...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
              No consultation slots published for this date.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([shiftName, shiftSlots]) => {
                if (shiftSlots.length === 0) return null;

                const shiftIcon =
                  shiftName === "Morning" ? (
                    <FaSun className="text-amber-500" />
                  ) : shiftName === "Afternoon" ? (
                    <FaCloudSun className="text-orange-500" />
                  ) : (
                    <FaMoon className="text-indigo-400" />
                  );

                return (
                  <div key={shiftName} className="space-y-2.5">
                    {/* Shift Subheader */}
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600">
                      {shiftIcon}
                      <span>{shiftName} Slots</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({shiftSlots.filter((s) => s.isAvailable).length} open)
                      </span>
                    </div>

                    {/* Slots Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {shiftSlots.map((slot, index) => {
                        const isSelected = selectedSlot?.time === slot.time;
                        const isAvailable = slot.isAvailable;
                        const isPremium = slot.isPremium;
                        const isBlocked = slot.status === "Blocked";
                        const isPast = slot.status === "Past";

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => onSelectSlot(slot)}
                            title={isBlocked ? slot.blockReason || "Doctor Blocked Slot" : slot.status}
                            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden cursor-pointer ${
                              !isAvailable
                                ? isBlocked
                                  ? "bg-rose-50/70 border-rose-200 text-rose-400 cursor-not-allowed opacity-80"
                                  : "bg-slate-100/70 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-60 line-through"
                                : isSelected
                                ? isPremium
                                  ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-600 shadow-md scale-102 ring-2 ring-amber-400/40"
                                  : "bg-emerald-600 text-white border-emerald-600 shadow-md scale-102"
                                : isPremium
                                ? "bg-gradient-to-b from-amber-50/70 to-amber-100/40 border-amber-300 text-amber-950 hover:border-amber-400 hover:shadow-sm"
                                : "bg-white border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-xs"
                            }`}
                          >
                            {/* Top-right Crown for Premium Slots */}
                            {isPremium && isAvailable && (
                              <div className="absolute top-2 right-2">
                                <FaCrown size={10} className={isSelected ? "text-white" : "text-amber-500"} />
                              </div>
                            )}

                            {/* Blocked OT Icon */}
                            {isBlocked && (
                              <div className="absolute top-2 right-2 text-rose-400">
                                <FaBan size={9} />
                              </div>
                            )}

                            <span className="text-xs font-black tracking-tight">{slot.time}</span>

                            {/* Price / Status Label */}
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-[10px] font-black ${
                                  isSelected
                                    ? "text-white"
                                    : isBlocked
                                    ? "text-rose-600"
                                    : isPremium
                                    ? "text-amber-700"
                                    : isAvailable
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {isAvailable
                                  ? `₹${slot.totalFee || slot.totalSlotFee}`
                                  : isBlocked
                                  ? "Blocked"
                                  : isPast
                                  ? "Past"
                                  : slot.status || "Booked"}
                              </span>

                              {/* Block Reason or Surcharge tag */}
                              {isBlocked && slot.blockReason ? (
                                <span className="text-[8px] font-semibold text-rose-500 truncate max-w-[85px]">
                                  {slot.blockReason}
                                </span>
                              ) : isPremium && isAvailable ? (
                                <span
                                  className={`text-[8px] font-black uppercase tracking-wider ${
                                    isSelected ? "text-amber-200" : "text-amber-600"
                                  }`}
                                >
                                  +₹{slot.premiumFee}
                                </span>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Active Selection Confirmation Banner */}
      {selectedSlot && !isClosed && (
        <div
          className={`mt-8 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border ${
            selectedSlot.isPremium
              ? "bg-gradient-to-r from-amber-50 to-amber-100/60 border-amber-200 text-amber-950"
              : "bg-emerald-50 border-emerald-100 text-emerald-950"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {selectedSlot.isPremium ? (
              <FaCrown className="text-amber-500 text-base" />
            ) : (
              <FaCheckCircle className="text-emerald-600 text-base" />
            )}
            <div>
              <p className="font-bold">
                Selected: <span className="font-black text-sm">{selectedSlot.time}</span> on{" "}
                <strong>{selectedDate}</strong>
              </p>
              {selectedSlot.isPremium && (
                <p className="text-[10px] text-amber-800 font-semibold mt-0.5">
                  Includes Peak/Premium Surcharge of +₹{selectedSlot.premiumFee}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black">
              Total Consultation Fee:{" "}
              <span className="text-sm font-black text-slate-900">
                ₹{selectedSlot.totalFee || selectedSlot.totalSlotFee}
              </span>
            </span>
            <span
              className={`font-black text-[10px] uppercase px-3 py-1 rounded-lg ${
                selectedSlot.isPremium
                  ? "bg-amber-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {selectedSlot.isPremium ? "Premium Slot" : "Slot Selected"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}