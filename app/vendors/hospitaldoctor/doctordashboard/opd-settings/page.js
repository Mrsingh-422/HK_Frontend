"use client";

import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaSave,
  FaSpinner,
  FaUserMd,
  FaExclamationTriangle,
  FaTimes,
  FaLock,
  FaDoorOpen,
  FaRupeeSign,
  FaToggleOn,
  FaToggleOff,
  FaMinus,
  FaPlus,
  FaShieldAlt,
  FaCalendarAlt,
  FaCalendarMinus,
  FaPlaneDeparture,
  FaInfoCircle,
  FaCrown,
  FaBan,
  FaUser,
  FaCalendarDay
} from "react-icons/fa";
import HospitalDoctorAPI from "@/app/services/HospitalDoctorAPI";

const LEAVE_REASON_PRESETS = [
  "Annual Cardiology Conference",
  "Surgical Symposium & Workshop",
  "Personal & Family Leave",
  "Out of Town Emergency"
];

const PREMIUM_EXTRA_FEE_PRESETS = [100, 150, 200, 250, 300, 500];

export default function DoctorOpdSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockingSlot, setBlockingSlot] = useState(false);
  const [applyingLeave, setApplyingLeave] = useState(false);

  // Doctor & Facility Info
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [roomNumber, setRoomNumber] = useState("Cabin 1");
  const [clinicFee, setClinicFee] = useState(600);

  // Doctor-controlled parameters
  const [slotDuration, setSlotDuration] = useState(15);
  const [isOpdEnabled, setIsOpdEnabled] = useState(true);

  // Date selection (Today + Future 30 Days)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dateList, setDateList] = useState([]);

  // Live Slots Data from backend for selectedDate
  const [liveSlotsData, setLiveSlotsData] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [premiumSlots, setPremiumSlots] = useState([]);

  // Modal State for Slot Click (Unified: Premium & Emergency Block)
  const [activeSlotModal, setActiveSlotModal] = useState(null); // { time, status, isPremium, bookingDetails, blockReason }
  const [modalTab, setModalTab] = useState("premium"); // 'premium' | 'block'
  const [premiumExtraFeeInput, setPremiumExtraFeeInput] = useState(150);
  const [blockReason, setBlockReason] = useState("");

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });

  const [statusMessage, setStatusMessage] = useState(null);

  // Generate Future 30 Dates on Mount
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateString = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      dates.push({ dateString, dayName, dayNum, monthName });
    }
    setDateList(dates);
  }, []);

  // Fetch settings & slots whenever selectedDate changes
  useEffect(() => {
    fetchSettingsForDate(selectedDate);
  }, [selectedDate]);

  const fetchSettingsForDate = async (targetDate) => {
    try {
      setLoading(true);
      const res = await HospitalDoctorAPI.getOpdSettings(targetDate);
      if (res?.success && res.data) {
        const d = res.data;
        setDoctorInfo({
          id: d.doctor?.id || d.doctorId,
          name: d.doctor?.name || d.name,
          speciality: d.doctor?.speciality || d.speciality,
          hospital: d.doctor?.hospital || d.hospital
        });
        setRoomNumber(d.doctor?.cabinRoom || d.opdRoomNumber || "Cabin 1");
        setClinicFee(d.doctor?.baseOpdFee || d.opdFee || 600);
        setSlotDuration(Math.max(1, Number(d.generalSchedule?.slotDurationMinutes || d.slotDurationMinutes) || 15));
        setIsOpdEnabled(d.isOpdEnabled !== false);
        setAvailability(d.generalSchedule?.weeklyAvailability || d.weeklySchedule || []);
        setPremiumSlots(d.premiumSlots || []);
        setLiveSlotsData(d.selectedDateSlots || null);
      }
    } catch (err) {
      console.error("Failed to load OPD settings:", err);
      showFeedback("Failed to load slot configurations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleStepDuration = (delta) => {
    setSlotDuration((prev) => Math.max(1, (Number(prev) || 1) + delta));
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const payload = {
        roomNumber,
        slotDuration: Math.max(1, Number(slotDuration)),
        clinicFee: Number(clinicFee),
        isOpdEnabled: Boolean(isOpdEnabled),
        premiumSlots: premiumSlots.map((ps) => ({
          time: ps.time,
          extraFee: Number(ps.extraFee) || 0
        })),
        availability
      };

      const res = await HospitalDoctorAPI.updateOpdSettings(payload);
      if (res?.success) {
        showFeedback("OPD timings, duration, and premium rules updated successfully!");
        fetchSettingsForDate(selectedDate);
      } else {
        showFeedback(res?.message || "Failed to update settings", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showFeedback(err.response?.data?.message || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Slot Click Handler
  const handleSlotClick = (slotObj) => {
    const isBlocked = slotObj.status === "Blocked";
    const isBooked = slotObj.status === "Booked";

    if (isBooked) {
      showFeedback(`Slot ${slotObj.time} is already booked by Token #${slotObj.bookingDetails?.tokenNumber}`, "error");
      return;
    }

    const matchedPremium = premiumSlots.find((p) => p.time === slotObj.time || p.time24 === slotObj.time24);

    setActiveSlotModal({
      time: slotObj.time,
      time24: slotObj.time24,
      isBlocked,
      isPremium: Boolean(matchedPremium || slotObj.isPremium),
      bookingDetails: slotObj.bookingDetails,
      blockReason: slotObj.blockReason
    });

    setPremiumExtraFeeInput(slotObj.premiumFee || matchedPremium?.extraFee || 150);
    setBlockReason(slotObj.blockReason || "");
    setModalTab(matchedPremium || slotObj.isPremium ? "premium" : isBlocked ? "block" : "premium");
  };

  // Toggle Premium Slot
  const handleTogglePremiumSlot = () => {
    if (!activeSlotModal) return;
    const slotTime = activeSlotModal.time;
    const exists = premiumSlots.find((p) => p.time === slotTime);

    if (exists) {
      setPremiumSlots((prev) => prev.filter((p) => p.time !== slotTime));
      showFeedback(`Slot ${slotTime} returned to regular price.`);
    } else {
      const fee = Number(premiumExtraFeeInput) || 150;
      setPremiumSlots((prev) => [...prev, { time: slotTime, extraFee: fee }]);
      showFeedback(`Slot ${slotTime} marked as Premium (+₹${fee}). Click Save Settings.`);
    }
    setActiveSlotModal(null);
  };

  // Block/Unblock Slot API Call
  const handleConfirmBlockAction = async () => {
    if (!activeSlotModal) return;
    const { time, isBlocked } = activeSlotModal;

    try {
      setBlockingSlot(true);
      const res = await HospitalDoctorAPI.blockSlotWithReason({
        date: selectedDate,
        time,
        reason: isBlocked ? "" : blockReason || "Emergency Block"
      });

      if (res?.success) {
        showFeedback(isBlocked ? `Slot ${time} unblocked.` : `Slot ${time} blocked for emergency.`);
        setActiveSlotModal(null);
        setBlockReason("");
        fetchSettingsForDate(selectedDate);
      } else {
        showFeedback(res?.message || "Action failed", "error");
      }
    } catch (err) {
      console.error("Block error:", err);
      showFeedback(err.response?.data?.message || "Failed to update slot status.", "error");
    } finally {
      setBlockingSlot(false);
    }
  };

  // Leave Submit
  const handleApplyLeaveSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    if (!leaveData.startDate || leaveData.startDate <= today) {
      showFeedback("Leaves must start from tomorrow onwards.", "error");
      return;
    }
    if (leaveData.endDate < leaveData.startDate) {
      showFeedback("End Date cannot be before Start Date.", "error");
      return;
    }
    if (!leaveData.reason.trim()) {
      showFeedback("Please provide a reason for leave.", "error");
      return;
    }

    try {
      setApplyingLeave(true);
      const res = await HospitalDoctorAPI.applyLeave(leaveData);
      if (res?.success) {
        showFeedback("Leave application submitted for Admin approval!");
        setShowLeaveModal(false);
        setLeaveData({ startDate: "", endDate: "", reason: "" });
      } else {
        showFeedback(res?.message || "Failed to submit leave", "error");
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || "Failed to apply for leave.", "error");
    } finally {
      setApplyingLeave(false);
    }
  };

  if (loading && !liveSlotsData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <FaSpinner className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-black text-xs uppercase tracking-wider">
          Loading OPD Configuration & Live Slots...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-600/20">
              <FaUserMd />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                OPD Schedule & Slot Management
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {doctorInfo?.hospital?.name || "Hospital Facility"} &bull; Dr. {doctorInfo?.name || "Specialist"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <FaCalendarMinus />
              <span>Apply Leave</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md animate-in fade-in ${
              statusMessage.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {statusMessage.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TOP METRICS & CONTROLLERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Facility Parameters */}
          <div className="lg:col-span-6 bg-white rounded-[2.2rem] p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FaShieldAlt className="text-emerald-600" /> Facility Assigned Parameters
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FaLock size={9} /> Locked by Admin
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <FaDoorOpen className="text-emerald-600" /> Cabin Room
                </span>
                <p className="text-sm font-black text-slate-900 tracking-tight">{roomNumber}</p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">Assigned OPD Desk</span>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <FaRupeeSign className="text-emerald-600" /> Base Fee
                </span>
                <p className="text-sm font-black text-slate-900 tracking-tight">₹{clinicFee}</p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">Physical consultation</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Queue Acceptance:</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isOpdEnabled ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                }`}>
                  {isOpdEnabled ? "Live" : "Paused"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpdEnabled(!isOpdEnabled)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider cursor-pointer transition-all ${
                  isOpdEnabled ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-200 text-slate-600"
                }`}
              >
                {isOpdEnabled ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                <span>{isOpdEnabled ? "Enabled" : "Paused"}</span>
              </button>
            </div>
          </div>

          {/* Slot Duration Stepper */}
          <div className="lg:col-span-6 bg-white rounded-[2.2rem] p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <FaClock className="text-emerald-600" /> Consultation Slot Duration
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Set any interval from 1 minute upwards.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                {slotDuration} Min / Slot
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-black text-slate-700">Duration Value:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepDuration(-1)}
                  disabled={slotDuration <= 1}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 flex items-center justify-center font-black cursor-pointer shadow-xs"
                >
                  <FaMinus size={11} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Math.max(1, Number(e.target.value)))}
                  className="w-24 bg-white border border-slate-300 rounded-xl py-2 px-2 text-center text-sm font-black text-slate-900 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleStepDuration(1)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-black cursor-pointer shadow-xs"
                >
                  <FaPlus size={11} />
                </button>
                <span className="text-xs font-bold text-slate-500 pl-1">Minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Presets:</span>
              {[5, 10, 15, 20, 30, 45, 60].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSlotDuration(preset)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    Number(slotDuration) === preset
                      ? "bg-[#0B132B] text-white shadow-xs scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DATE STRIP & LIVE SLOTS GRID */}
        <div className="bg-white rounded-[2.2rem] p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FaCalendarDay className="text-emerald-600" /> Select OPD Date & Live Slots
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Showing today and future dates only. Click any slot to configure premium pricing or emergency blocks.
              </p>
            </div>

            <div className="flex items-center gap-5 text-xs font-black flex-wrap">
              <span className="flex items-center gap-2 text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" /> Available (₹{clinicFee})
              </span>
              <span className="flex items-center gap-2 text-amber-700">
                <FaCrown className="text-amber-500" /> Premium
              </span>
              <span className="flex items-center gap-2 text-blue-700">
                <FaUser className="text-blue-500" /> Booked
              </span>
              <span className="flex items-center gap-2 text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Blocked
              </span>
            </div>
          </div>

          {/* HORIZONTAL SCROLLABLE DATE STRIP (Today + Future 30 Days) */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              1. CHOOSE DATE (TODAY & FUTURE ONLY)
            </span>

            <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
              {dateList.map((item) => {
                const isSelected = selectedDate === item.dateString;
                return (
                  <button
                    key={item.dateString}
                    type="button"
                    onClick={() => setSelectedDate(item.dateString)}
                    className={`min-w-[95px] p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border shrink-0 ${
                      isSelected
                        ? "bg-[#0B132B] text-white border-[#0B132B] shadow-xl shadow-slate-900/20 scale-105"
                        : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {item.dayName}
                    </span>
                    <span className="text-2xl font-black mt-1 leading-none tracking-tight">
                      {item.dayNum}
                    </span>
                    <span className={`text-[10px] font-bold mt-1 ${isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE SLOTS GRID */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                2. LIVE SLOTS FOR {selectedDate} ({liveSlotsData?.slots?.length || 0} Slots)
              </span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                {liveSlotsData?.availableCount || 0} Available &bull; {liveSlotsData?.bookedCount || 0} Booked
              </span>
            </div>

            {!liveSlotsData || !liveSlotsData.slots || liveSlotsData.slots.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                No consultation slots published for this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {liveSlotsData.slots.map((slotObj, idx) => {
                  const isBlocked = slotObj.status === "Blocked";
                  const isBooked = slotObj.status === "Booked";
                  const isPremium = slotObj.isPremium;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSlotClick(slotObj)}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border group relative overflow-hidden ${
                        isBlocked
                          ? "bg-red-50/80 border-red-200 hover:bg-red-100 shadow-2xs"
                          : isBooked
                          ? "bg-blue-50/80 border-blue-200 hover:bg-blue-100 shadow-2xs"
                          : isPremium
                          ? "bg-gradient-to-b from-amber-50 to-amber-100/40 border-amber-300 shadow-sm ring-2 ring-amber-400/20 hover:border-amber-400"
                          : "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-sm"
                      }`}
                    >
                      {isPremium && !isBlocked && !isBooked && (
                        <div className="absolute top-2 right-2 text-amber-500">
                          <FaCrown size={11} />
                        </div>
                      )}

                      <span className={`text-sm font-black tracking-tight ${
                        isBlocked ? "text-red-900 line-through" : isBooked ? "text-blue-950" : isPremium ? "text-amber-950" : "text-slate-900"
                      }`}>
                        {slotObj.time}
                      </span>

                      {/* Status & Patient Badges */}
                      {isBlocked ? (
                        <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-red-600">
                          BLOCKED
                        </span>
                      ) : isBooked ? (
                        <div className="mt-1 text-center">
                          <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded block">
                            Token #{slotObj.bookingDetails?.tokenNumber}
                          </span>
                          <span className="text-[9px] font-bold text-blue-800 block mt-0.5 truncate max-w-[100px]">
                            {slotObj.bookingDetails?.patientName}
                          </span>
                        </div>
                      ) : isPremium ? (
                        <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-amber-700">
                          PREMIUM (+₹{slotObj.premiumFee})
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-emerald-600">
                          AVAILABLE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* LEAVE APPLICATION MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-7 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black">
                  <FaPlaneDeparture />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Doctor Leave Application</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Submit dates for Admin review & approval.</p>
                </div>
              </div>
              <button onClick={() => setShowLeaveModal(false)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center">
                <FaTimes size={13} />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    min={getTomorrowDate()}
                    value={leaveData.startDate}
                    onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    min={leaveData.startDate || getTomorrowDate()}
                    value={leaveData.endDate}
                    onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Quick Reason Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {LEAVE_REASON_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLeaveData({ ...leaveData, reason: preset })}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        leaveData.reason === preset ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Reason for Leave *</label>
                <textarea
                  rows="2"
                  required
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  placeholder="e.g. Attending conference"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={applyingLeave} className="px-6 py-2.5 text-xs font-black bg-indigo-600 text-white rounded-xl uppercase tracking-wider shadow-md">
                  {applyingLeave ? "Submitting..." : "Submit to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLOT CONFIGURATION MODAL */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-7 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black ${
                  activeSlotModal.isBlocked ? "bg-red-50 text-red-600" : activeSlotModal.isPremium ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                }`}>
                  {activeSlotModal.isBlocked ? <FaLock /> : activeSlotModal.isPremium ? <FaCrown /> : <FaClock />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Configure Slot: {activeSlotModal.time}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Date: {selectedDate}</p>
                </div>
              </div>
              <button onClick={() => setActiveSlotModal(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <FaTimes size={12} />
              </button>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setModalTab("premium")}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === "premium" ? "bg-white text-amber-800 shadow-sm" : "text-slate-500"
                }`}
              >
                <FaCrown size={11} className="text-amber-500" />
                <span>Premium Slot</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("block")}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === "block" ? "bg-white text-red-800 shadow-sm" : "text-slate-500"
                }`}
              >
                <FaBan size={11} className="text-red-500" />
                <span>Emergency Block</span>
              </button>
            </div>

            {modalTab === "premium" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Extra Premium Surcharge (₹) *</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={premiumExtraFeeInput}
                    onChange={(e) => setPremiumExtraFeeInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-black text-slate-900 outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">Total patient will pay: ₹{Number(clinicFee) + Number(premiumExtraFeeInput || 0)}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PREMIUM_EXTRA_FEE_PRESETS.map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setPremiumExtraFeeInput(fee)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                        Number(premiumExtraFeeInput) === fee ? "bg-amber-500 text-white border-amber-500" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      +₹{fee}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveSlotModal(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                  <button type="button" onClick={handleTogglePremiumSlot} className="px-5 py-2.5 text-xs font-black bg-amber-500 text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md">
                    {activeSlotModal.isPremium ? "Remove Premium" : "Set as Premium Slot"}
                  </button>
                </div>
              </div>
            )}

            {modalTab === "block" && (
              <div className="space-y-4 text-xs">
                {activeSlotModal.isBlocked ? (
                  <p className="text-xs text-slate-600 font-medium">This slot is blocked. Do you want to unblock it?</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 font-medium">Blocking prevents patients from booking token at {activeSlotModal.time}.</p>
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Reason (e.g. Emergency OT Call)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveSlotModal(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                  <button
                    type="button"
                    disabled={blockingSlot}
                    onClick={handleConfirmBlockAction}
                    className={`px-5 py-2.5 text-xs font-black text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md ${
                      activeSlotModal.isBlocked ? "bg-emerald-600" : "bg-red-600"
                    }`}
                  >
                    {blockingSlot ? "Processing..." : activeSlotModal.isBlocked ? "Unblock Slot Now" : "Block Slot for Emergency"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}