"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaClock,
  FaCheckCircle,
  FaSave,
  FaSpinner,
  FaUserMd,
  FaExclamationTriangle,
  FaTimes,
  FaLock,
  FaUnlock,
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
  FaInfoCircle
} from "react-icons/fa";
import HospitalDoctorAPI from "@/app/services/HospitalDoctorAPI";

const ALL_DAYS = [
  { key: "Mon", label: "MON" },
  { key: "Tue", label: "TUE" },
  { key: "Wed", label: "WED" },
  { key: "Thu", label: "THU" },
  { key: "Fri", label: "FRI" },
  { key: "Sat", label: "SAT" },
  { key: "Sun", label: "SUN" }
];

const LEAVE_REASON_PRESETS = [
  "Annual Cardiology Conference",
  "Surgical Symposium & Workshop",
  "Personal & Family Leave",
  "Out of Town Emergency"
];

export default function DoctorOpdSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockingSlot, setBlockingSlot] = useState(false);
  const [applyingLeave, setApplyingLeave] = useState(false);

  // Doctor Info from backend
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Read-only parameters (Set by Admin)
  const [roomNumber, setRoomNumber] = useState("");
  const [clinicFee, setClinicFee] = useState(600);

  // Doctor-controlled parameters
  const [slotDuration, setSlotDuration] = useState(15);
  const [isOpdEnabled, setIsOpdEnabled] = useState(true);

  // Weekly availability: [ { day: "Mon", startTime: "09:00", endTime: "13:00" }, ... ]
  const [availability, setAvailability] = useState([]);
  const [selectedDayKey, setSelectedDayKey] = useState("Mon");

  // Blocked slots array: ["11:00 AM"]
  const [blockedSlots, setBlockedSlots] = useState([]);

  // Modal State for Slot Click
  const [activeSlotModal, setActiveSlotModal] = useState(null);
  const [blockReason, setBlockReason] = useState("");

  // Leave Modal State (Dates Only — No Time)
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Toast / feedback message
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await HospitalDoctorAPI.getOpdSettings();
      if (res?.success && res.data) {
        const d = res.data;
        setDoctorInfo({
          id: d.doctorId,
          name: d.name,
          speciality: d.speciality,
          hospital: d.hospital
        });
        setRoomNumber(d.opdRoomNumber || "Cabin 1");
        setClinicFee(d.opdFee || 600);
        setSlotDuration(Math.max(1, Number(d.slotDurationMinutes) || 15));
        setIsOpdEnabled(d.isOpdEnabled !== false);
        setAvailability(d.weeklySchedule || []);
        setBlockedSlots(d.blockedSlots || []);
      }
    } catch (err) {
      console.error("Failed to load doctor OPD settings:", err);
      showFeedback("Failed to load settings. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Safe Universal Block Slot Call
  const executeSlotBlockAPI = async (timeSlot, action, reason = "") => {
    if (typeof HospitalDoctorAPI.toggleBlockSlot === "function") {
      return await HospitalDoctorAPI.toggleBlockSlot(timeSlot, action);
    }
    if (typeof HospitalDoctorAPI.toggleEmergencySlotBlock === "function") {
      return await HospitalDoctorAPI.toggleEmergencySlotBlock(timeSlot, action);
    }
    if (typeof HospitalDoctorAPI.toggleDoctorEmergencySlot === "function") {
      return await HospitalDoctorAPI.toggleDoctorEmergencySlot(timeSlot, action);
    }
    if (typeof HospitalDoctorAPI.blockSlotWithReason === "function") {
      return await HospitalDoctorAPI.blockSlotWithReason({
        date: new Date().toISOString().split("T")[0],
        timeSlot,
        action,
        reason
      });
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("hospitalDoctorToken") ||
          localStorage.getItem("doctorToken") ||
          localStorage.getItem("hospital_doctor_token") ||
          localStorage.getItem("token")
        : "";

    const response = await axios.post(
      `${BASE_URL}/hospital-doctor/panel/opd-slots/toggle-block`,
      { timeSlot, action, reason },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  };

  // Helper: Tomorrow's date minimum
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // Helper: Format hour & minute into "10:30 AM"
  const formatTimeSlot = (hours, minutes) => {
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const padH = String(formattedHours).padStart(2, "0");
    const padM = String(minutes).padStart(2, "0");
    return `${padH}:${padM} ${period}`;
  };

  // Generate Slots dynamically for active day based on shift hours and slotDuration
  const generatePreviewSlots = () => {
    const currentDaySchedule = availability.find((a) => a.day === selectedDayKey);
    if (!currentDaySchedule || !currentDaySchedule.startTime || !currentDaySchedule.endTime) {
      return [];
    }

    const [startH, startM] = currentDaySchedule.startTime.split(":").map(Number);
    const [endH, endM] = currentDaySchedule.endTime.split(":").map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const duration = Math.max(1, Number(slotDuration) || 15);

    const slots = [];
    const MAX_SLOTS = 120;

    for (let current = startTotal; current + duration <= endTotal && slots.length < MAX_SLOTS; current += duration) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(formatTimeSlot(h, m));
    }
    return slots;
  };

  // Day toggle
  const handleToggleDay = (dayKey) => {
    const exists = availability.find((a) => a.day === dayKey);
    if (exists) {
      setAvailability(availability.filter((a) => a.day !== dayKey));
    } else {
      setAvailability([...availability, { day: dayKey, startTime: "09:00", endTime: "13:00" }]);
    }
    setSelectedDayKey(dayKey);
  };

  const handleTimeChange = (dayKey, field, val) => {
    setAvailability((prev) =>
      prev.map((item) => (item.day === dayKey ? { ...item, [field]: val } : item))
    );
  };

  // Duration adjustments
  const handleDurationChange = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      setSlotDuration(1);
    } else {
      setSlotDuration(num);
    }
  };

  const handleStepDuration = (delta) => {
    setSlotDuration((prev) => Math.max(1, (Number(prev) || 1) + delta));
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const payload = {
        roomNumber: roomNumber || "Cabin 1",
        slotDuration: Math.max(1, Number(slotDuration)),
        clinicFee: Number(clinicFee),
        isOpdEnabled: Boolean(isOpdEnabled),
        availability: availability.map((a) => ({
          day: a.day,
          startTime: a.startTime,
          endTime: a.endTime
        }))
      };

      const res = await HospitalDoctorAPI.updateOpdSettings(payload);
      if (res?.success) {
        showFeedback("OPD timings and duration updated successfully!");
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

  // Block / Unblock Modal Submit Handler
  const handleConfirmSlotAction = async () => {
    if (!activeSlotModal) return;
    const { time, isBlocked } = activeSlotModal;
    const action = isBlocked ? "unblock" : "block";

    try {
      setBlockingSlot(true);
      const res = await executeSlotBlockAPI(time, action, blockReason);

      if (res?.success || res?.status === 200) {
        if (action === "block") {
          setBlockedSlots((prev) => (prev.includes(time) ? prev : [...prev, time]));
          showFeedback(`Slot ${time} blocked for emergency.`);
        } else {
          setBlockedSlots((prev) => prev.filter((s) => s !== time));
          showFeedback(`Slot ${time} unblocked.`);
        }
        setActiveSlotModal(null);
        setBlockReason("");
      } else {
        showFeedback(res?.message || "Action failed", "error");
      }
    } catch (err) {
      console.error("Block slot error:", err);
      showFeedback(err.response?.data?.message || "Failed to update slot state.", "error");
    } finally {
      setBlockingSlot(false);
    }
  };

  // Multi-day Leave Submit Handler (NO TIME — Pure Dates)
  const handleApplyLeaveSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    if (!leaveData.startDate || leaveData.startDate <= today) {
      showFeedback("Leaves must start from tomorrow onwards. Today is restricted!", "error");
      return;
    }

    if (leaveData.endDate < leaveData.startDate) {
      showFeedback("End Date cannot be before Start Date.", "error");
      return;
    }

    if (!leaveData.reason.trim()) {
      showFeedback("Please provide a reason for the leave application.", "error");
      return;
    }

    try {
      setApplyingLeave(true);
      const payload = {
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason.trim()
      };

      let res;
      if (typeof HospitalDoctorAPI.applyLeave === "function") {
        res = await HospitalDoctorAPI.applyLeave(payload);
      } else {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("hospitalDoctorToken") ||
              localStorage.getItem("doctorToken") ||
              localStorage.getItem("token")
            : "";
        const fallbackRes = await axios.post(`${BASE_URL}/hospital-doctor/panel/leaves/apply`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        res = fallbackRes.data;
      }

      if (res?.success) {
        showFeedback("Leave application submitted to Hospital Admin for approval!");
        setShowLeaveModal(false);
        setLeaveData({
          startDate: "",
          endDate: "",
          reason: ""
        });
      } else {
        showFeedback(res?.message || "Failed to submit leave", "error");
      }
    } catch (err) {
      console.error("Leave error:", err);
      showFeedback(err.response?.data?.message || "Failed to apply for leave.", "error");
    } finally {
      setApplyingLeave(false);
    }
  };

  // Calculate live leave duration in Days
  const calculateLeaveDaysCount = () => {
    if (!leaveData.startDate || !leaveData.endDate) return null;
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return null;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} Day${diffDays > 1 ? "s" : ""} Leave`;
  };

  const previewSlots = generatePreviewSlots();
  const currentSelectedSchedule = availability.find((a) => a.day === selectedDayKey);
  const leaveDaysText = calculateLeaveDaysCount();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <FaSpinner className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-black text-sm tracking-wide">
          Loading OPD Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-600/20">
              <FaUserMd />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                OPD Schedule & Slot Management
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {doctorInfo?.hospital?.name || "Hospital Facility"} &bull; {doctorInfo?.name || "Doctor Desk"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Apply for Leave Button */}
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <FaCalendarMinus />
              <span>Apply for Leave</span>
            </button>

            {/* Quick Save All Settings Button */}
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>{saving ? "Saving..." : "Save Shift & Duration"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Toast Feedback */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all shadow-md animate-in fade-in ${
              statusMessage.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {statusMessage.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 1. TOP CARDS: ADMIN-MANAGED READ-ONLY PARAMETERS + DURATION CONTROLLER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Admin Managed Parameters (Cabin Room + Pricing: READ ONLY) */}
          <div className="lg:col-span-6 bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FaShieldAlt className="text-emerald-600" /> Facility Assigned Parameters
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FaLock size={9} /> Locked by Admin
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Cabin Room (Read Only) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <FaDoorOpen className="text-emerald-600" /> Assigned Cabin Room
                </span>
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  {roomNumber || "Cabin 204 (OPD Block A)"}
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">Configured on Token Desk</span>
              </div>

              {/* Consultation Fee (Read Only) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <FaRupeeSign className="text-emerald-600" /> OPD Consultation Fee
                </span>
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  ₹{clinicFee}
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">Standard Facility Charge</span>
              </div>
            </div>

            {/* Master OPD Status Toggle */}
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

          {/* Right: DOCTOR CONTROLLED 1-MINUTE TO ANY NUMBER STEPPER & INTERVAL SELECTOR */}
          <div className="lg:col-span-6 bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <FaClock className="text-emerald-600" /> Patient Consultation Slot Duration
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Set any interval from 1 minute upwards. Adjusts token frequency.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                {slotDuration} Min / Slot
              </span>
            </div>

            {/* The 1-Minute Precision Stepper & Direct Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-black text-slate-700">Duration Value:</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepDuration(-1)}
                  disabled={slotDuration <= 1}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 flex items-center justify-center font-black cursor-pointer transition-all shadow-xs"
                  title="Minus 1 minute"
                >
                  <FaMinus size={11} />
                </button>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={slotDuration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-xl py-2 px-2 text-center text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStepDuration(1)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-black cursor-pointer transition-all shadow-xs"
                  title="Add 1 minute"
                >
                  <FaPlus size={11} />
                </button>

                <span className="text-xs font-bold text-slate-500 pl-1">Minutes</span>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Presets:</span>
              {[5, 10, 15, 20, 25, 30, 45, 60].map((preset) => (
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

        {/* 2. SELECT OPD DATE & SLOT GRID (Exact Screenshot Match) */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
          {/* Header & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select OPD Date & Slot</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Real-time availability synced with the OPD queue desk.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-xs font-black">
              <span className="flex items-center gap-2 text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                Available
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                Blocked (Emergency)
              </span>
            </div>
          </div>

          {/* 1. CHOOSE DATE STRIP */}
          <div className="space-y-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              1. CHOOSE DATE / DAY
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {ALL_DAYS.map((dayItem, index) => {
                const isScheduled = availability.some((a) => a.day === dayItem.key);
                const isCurrentSelected = selectedDayKey === dayItem.key;

                return (
                  <button
                    key={dayItem.key}
                    type="button"
                    onClick={() => {
                      if (!isScheduled) handleToggleDay(dayItem.key);
                      else setSelectedDayKey(dayItem.key);
                    }}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isCurrentSelected
                        ? "bg-[#0B132B] text-white border-[#0B132B] shadow-xl shadow-slate-900/20 scale-[1.02]"
                        : isScheduled
                        ? "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        : "bg-slate-50/60 text-slate-400 border-dashed border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`text-[10px] font-black tracking-wider uppercase ${isCurrentSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {dayItem.label}
                    </span>
                    <span className="text-2xl font-black mt-1 leading-none tracking-tight">
                      {13 + index}
                    </span>
                    <span className={`text-[9px] font-black uppercase mt-1 tracking-wider ${isCurrentSelected ? "text-emerald-400" : isScheduled ? "text-emerald-600" : "text-slate-400"}`}>
                      {isScheduled ? "ACTIVE" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shift Hours Settings for Selected Day */}
          {currentSelectedSchedule ? (
            <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-12 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xs font-black text-slate-900 uppercase shadow-2xs">
                  {currentSelectedSchedule.day}
                </span>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Consultation Shift Hours</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Defines start and end time for slots</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Start:</span>
                  <input
                    type="time"
                    value={currentSelectedSchedule.startTime}
                    onChange={(e) => handleTimeChange(currentSelectedSchedule.day, "startTime", e.target.value)}
                    className="text-xs font-black text-slate-900 outline-none bg-transparent"
                  />
                </div>

                <span className="text-slate-400 font-bold text-xs">&rarr;</span>

                <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">End:</span>
                  <input
                    type="time"
                    value={currentSelectedSchedule.endTime}
                    onChange={(e) => handleTimeChange(currentSelectedSchedule.day, "endTime", e.target.value)}
                    className="text-xs font-black text-slate-900 outline-none bg-transparent"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleDay(currentSelectedSchedule.day)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Turn Off
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">
                You are marked OFF on {selectedDayKey}. Enable to configure slots.
              </span>
              <button
                type="button"
                onClick={() => handleToggleDay(selectedDayKey)}
                className="px-4 py-2 bg-amber-600 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
              >
                Enable {selectedDayKey}
              </button>
            </div>
          )}

          {/* 2. SELECT AN AVAILABLE OPD SLOT GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                2. SELECT AN AVAILABLE OPD SLOT ({selectedDayKey} &bull; {slotDuration} MIN INTERVALS)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold">
                  {previewSlots.length} Slots Generated
                </span>
                <span className="text-[11px] text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Click slot to Block / Unblock
                </span>
              </div>
            </div>

            {previewSlots.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No slots generated. Please set your shift hours above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {previewSlots.map((slot) => {
                  const isBlocked = blockedSlots.includes(slot);

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setActiveSlotModal({ time: slot, isBlocked });
                        setBlockReason("");
                      }}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border group ${
                        isBlocked
                          ? "bg-red-50/70 border-red-200 hover:bg-red-100/70 shadow-2xs"
                          : "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-sm"
                      }`}
                    >
                      <span className={`text-sm font-black tracking-tight ${isBlocked ? "text-red-900 line-through" : "text-slate-900"}`}>
                        {slot}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                          isBlocked ? "text-red-600 flex items-center gap-1" : "text-emerald-600"
                        }`}
                      >
                        {isBlocked ? "BLOCKED" : "AVAILABLE"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================
          MODAL 1: APPOINTMENT LEAVE SYSTEM (Dates Only - No Times)
      ======================================================== */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-7 sm:p-8 space-y-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black shadow-xs ring-4 ring-indigo-500/10">
                  <FaPlaneDeparture />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Doctor Leave Application
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Submit dates for Hospital Admin review & approval.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleApplyLeaveSubmit} className="space-y-5 text-xs">
              {/* Date Pickers (Dates Only) */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                    <FaCalendarAlt className="text-indigo-600" /> Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={getTomorrowDate()}
                    value={leaveData.startDate}
                    onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold block mt-1">Tomorrow onwards</span>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                    <FaCalendarAlt className="text-indigo-600" /> End Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={leaveData.startDate || getTomorrowDate()}
                    value={leaveData.endDate}
                    onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  <span className="text-[9px] text-slate-400 font-semibold block mt-1">Inclusive of end date</span>
                </div>
              </div>

              {/* Calculated Span Pill */}
              {leaveDaysText && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-indigo-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <FaInfoCircle /> Total Requested Absence:
                  </span>
                  <span className="font-black text-indigo-700 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
                    {leaveDaysText}
                  </span>
                </div>
              )}

              {/* Quick Reason Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Quick Reason Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LEAVE_REASON_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLeaveData({ ...leaveData, reason: preset })}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        leaveData.reason === preset
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Reason for Leave / Clinical Description *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Attending Annual Cardiology Conference"
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingLeave}
                  className="px-6 py-2.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {applyingLeave && <FaSpinner className="animate-spin" />}
                  <span>{applyingLeave ? "Submitting..." : "Submit to Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: SLOT ACTION MODAL (BLOCK OR UNBLOCK ONLY)
      ======================================================== */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-7 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    activeSlotModal.isBlocked ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {activeSlotModal.isBlocked ? <FaUnlock size={16} /> : <FaLock size={16} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {activeSlotModal.isBlocked ? "Unblock Time Slot" : "Block Time Slot"}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Slot Time: <span className="text-slate-900 font-black">{activeSlotModal.time}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSlotModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            {activeSlotModal.isBlocked ? (
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                This slot is currently blocked for emergencies. Do you want to reopen it for patient registrations?
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Blocking this slot prevents patients from booking tokens at <span className="font-bold text-slate-900">{activeSlotModal.time}</span>.
                </p>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Emergency Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g. Surgical OT Call / Cardiac Rounds"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={blockingSlot}
                onClick={handleConfirmSlotAction}
                className={`px-5 py-2.5 text-xs font-black text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                  activeSlotModal.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                }`}
              >
                {blockingSlot && <FaSpinner className="animate-spin" />}
                <span>
                  {activeSlotModal.isBlocked ? "Unblock Slot Now" : "Block Slot for Emergency"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}