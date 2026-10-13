"use client";

import React, { useState, useEffect } from "react";
import HospitalDoctorAPI from "@/app/services/HospitalDoctorAPI";
import {
  FaUserMd,
  FaBell,
  FaCheckCircle,
  FaFilePrescription,
  FaUserTimes,
  FaClock,
  FaDoorOpen,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaSyncAlt,
  FaPhoneAlt,
  FaNotesMedical,
  FaCalendarCheck,
  FaSearch,
  FaTint,
  FaCalendarAlt,
  FaArrowRight,
  FaCopy,
  FaPills,
  FaStethoscope,
  FaExclamationCircle
} from "react-icons/fa";

export default function DoctorOpdDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [opdCases, setOpdCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Modal States
  const [activeCaseDetails, setActiveCaseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Action Modals
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxMedicines, setRxMedicines] = useState([
    { name: "", dosage: "1-0-1", duration: "5 days", notes: "After meals" }
  ]);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    newTimeSlot: "",
    reason: ""
  });

  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowReason, setNoShowReason] = useState("");

  const NO_SHOW_PRESETS = [
    "Patient did not respond after 3 bell rings",
    "Patient left the waiting area",
    "Patient rescheduled over phone",
    "Family requested appointment cancellation"
  ];

  useEffect(() => {
    loadDashboardAndQueue();
  }, []);

  const showToast = (text, type = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadDashboardAndQueue = async () => {
    try {
      setLoading(true);
      const [dashRes, queueRes] = await Promise.all([
        HospitalDoctorAPI.getDashboard(),
        HospitalDoctorAPI.getCases("opd")
      ]);

      if (dashRes?.success) setDashboardData(dashRes);
      if (queueRes?.success) setOpdCases(queueRes.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      showToast(err.response?.data?.message || err || "Failed to load OPD cases.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open Full Patient Details Dossier
  const handleOpenCaseDetails = async (caseItem) => {
    try {
      setLoadingDetails(true);
      setSelectedCase(caseItem);
      const res = await HospitalDoctorAPI.getCaseDetails(caseItem._id || caseItem.bookingId);
      if (res?.success && res.data) {
        setActiveCaseDetails(res.data);
      } else {
        setActiveCaseDetails(caseItem);
      }
    } catch (err) {
      console.warn("Falling back to queue item details:", err);
      setActiveCaseDetails(caseItem);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 1. Call Patient Inside Cabin
  const handleCallPatient = async (appointmentId, tokenNumber) => {
    try {
      setActionLoading(true);
      const res = await HospitalDoctorAPI.startConsultation(appointmentId);
      if (res?.success) {
        showToast(`Token #${tokenNumber} called inside cabin! Consultation In-Progress.`);
        if (activeCaseDetails) {
          setActiveCaseDetails((prev) => ({ ...prev, status: "In-Progress" }));
        }
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err || "Failed to call patient.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Submit Prescription
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!rxDiagnosis.trim()) {
      showToast("Clinical diagnosis is required.", "error");
      return;
    }

    try {
      setActionLoading(true);
      const validMedicines = rxMedicines.filter((m) => m.name.trim() !== "");
      const payload = {
        appointmentId: selectedCase._id || selectedCase.bookingId,
        diagnosis: rxDiagnosis,
        medicines: validMedicines
      };

      const res = await HospitalDoctorAPI.addPrescription(payload);
      if (res?.success) {
        showToast("Prescription issued & consultation completed successfully!");
        setShowRxModal(false);
        setActiveCaseDetails(null);
        setRxDiagnosis("");
        setRxMedicines([{ name: "", dosage: "1-0-1", duration: "5 days", notes: "After meals" }]);
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err || "Failed to submit prescription.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Reschedule Appointment
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const fn =
        HospitalDoctorAPI.rescheduleAppointment ||
        HospitalDoctorAPI.doctorRescheduleAppointment;
      const res = await fn({
        appointmentId: selectedCase._id || selectedCase.bookingId,
        newDate: rescheduleData.newDate,
        newTimeSlot: rescheduleData.newTimeSlot,
        reason: rescheduleData.reason
      });

      if (res?.success) {
        showToast(res.message || "Appointment rescheduled successfully!");
        setShowRescheduleModal(false);
        setActiveCaseDetails(null);
        setRescheduleData({ newDate: "", newTimeSlot: "", reason: "" });
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err || "Failed to reschedule.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Mark Absent / No-Show
  const handleConfirmNoShow = async () => {
    if (!noShowReason.trim()) {
      showToast("Please enter reason for no-show.", "error");
      return;
    }
    try {
      setActionLoading(true);
      const res = await HospitalDoctorAPI.markNoShow(
        selectedCase._id || selectedCase.bookingId,
        noShowReason
      );
      if (res?.success) {
        showToast(res.message || "Marked as No-Show.");
        setShowNoShowModal(false);
        setActiveCaseDetails(null);
        setNoShowReason("");
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err || "Failed to mark absent.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const filteredCases = opdCases.filter((item) => {
    const q = searchQuery.toLowerCase();
    const name = (item.patientDisplayName || item.patientName || "").toLowerCase();
    const id = (item.bookingId || "").toLowerCase();
    const token = String(item.tokenNumber || "");
    return name.includes(q) || id.includes(q) || token.includes(q);
  });

  const stats = dashboardData?.stats || {};
  const currentConsulting = stats.currentlyConsultingPatient;

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-500/5">
          <FaSpinner className="w-7 h-7 animate-spin" />
        </div>
        <p className="text-slate-800 font-black text-sm tracking-tight">Loading OPD Cabin & Queue...</p>
        <span className="text-xs text-slate-400 mt-1 font-medium">Synchronizing live hospital registry</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Cabin Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-500/10">
              <FaUserMd />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  {dashboardData?.welcomeName || "Doctor Cabin"}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {dashboardData?.dutyStatus || "On Duty"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
                <span>{dashboardData?.speciality}</span>
                <span>&bull;</span>
                <span className="text-slate-700 font-bold">{dashboardData?.opdRoomNumber || "OPD Cabin 1"}</span>
                <span>&bull;</span>
                <span className="text-slate-700 font-bold">₹{dashboardData?.opdFee || 600} Fee</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardAndQueue}
              className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <FaSyncAlt className="text-slate-400" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-7">
        {/* Toast Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all shadow-lg animate-in fade-in slide-in-from-top-2 ${
              feedback.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700 shadow-red-500/5"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-emerald-500/5"
            }`}
          >
            {feedback.type === "error" ? <FaExclamationTriangle className="text-red-500" /> : <FaCheckCircle className="text-emerald-500" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 1. Live Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Today's Tokens</span>
              <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center text-xs group-hover:bg-slate-100 transition-colors">
                <FaCalendarAlt />
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats.todayOpdTotal || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">Consulted</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                <FaCheckCircle />
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-700 mt-2">{stats.todayOpdCompleted || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider">Waiting</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xs">
                <FaClock />
              </span>
            </div>
            <p className="text-3xl font-black text-amber-600 mt-2">{stats.todayOpdPending || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 rounded-3xl text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">Serving Token</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            </div>
            <p className="text-3xl font-black mt-2 tracking-tight">#{stats.currentServingToken || "--"}</p>
          </div>
        </div>

        {/* 2. Currently Consulting Hero Card */}
        {currentConsulting && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-[2.2rem] p-6 sm:p-7 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 ring-1 ring-white/10 relative overflow-hidden">
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 shrink-0 shadow-inner">
                <span className="text-[9px] font-black uppercase text-emerald-300 tracking-wider">Active</span>
                <span className="text-2xl font-black text-white leading-none mt-0.5">#{currentConsulting.tokenNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-2xs">
                    Currently in Cabin
                  </span>
                </div>
                <h3 className="text-xl font-black mt-1.5 text-white tracking-tight">{currentConsulting.patientName}</h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Booking ID: <span className="font-mono text-emerald-300 font-bold">{currentConsulting.bookingId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => {
                  const match = opdCases.find((c) => c.bookingId === currentConsulting.bookingId);
                  setSelectedCase(match || { _id: currentConsulting.bookingId, tokenNumber: currentConsulting.tokenNumber, patientDisplayName: currentConsulting.patientName });
                  setShowRxModal(true);
                }}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FaFilePrescription className="text-sm" />
                <span>Write Prescription</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. OPD Queue List */}
        <div className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Today's OPD Queue</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Click any patient row to open clinical dossier & details.</p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search patient, token, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 font-bold bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                No patients found in OPD queue.
              </div>
            ) : (
              filteredCases.map((item) => (
                <div
                  key={item._id || item.bookingId}
                  onClick={() => handleOpenCaseDetails(item)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white hover:bg-emerald-50/30 border border-slate-200/90 hover:border-emerald-400/80 rounded-2xl gap-4 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
                >
                  {/* Left: Token & Patient Info */}
                  <div className="flex items-center gap-4">
                    {/* Big Token Number */}
                    <div className="w-14 h-14 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white border border-slate-200 group-hover:border-emerald-600 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors shadow-xs">
                      <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-emerald-100 leading-none">
                        Token
                      </span>
                      <span className="text-lg font-black text-slate-900 group-hover:text-white leading-none mt-1">
                        #{item.tokenNumber || "--"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-950">
                          {item.patientDisplayName || item.patientName}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === "In-Progress"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : item.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        {item.patientAgeGender || "Patient"} &bull; Time: <span className="text-slate-700 font-bold">{item.appointmentTime}</span> &bull; ID: <span className="font-mono text-slate-500">{item.bookingId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {item.canStartConsultation && item.status !== "In-Progress" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleCallPatient(item._id, item.tokenNumber)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        <FaBell className="text-xs" />
                        <span>Call Inside</span>
                      </button>
                    )}

                    {item.status === "In-Progress" && (
                      <button
                        onClick={() => {
                          setSelectedCase(item);
                          setShowRxModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                      >
                        <FaFilePrescription className="text-xs" />
                        <span>Write Rx</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCase(item);
                        setShowRescheduleModal(true);
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer transition-all"
                      title="Reschedule Appointment"
                    >
                      <FaClock />
                    </button>

                    <button
                      onClick={() => handleOpenCaseDetails(item)}
                      className="p-2.5 text-slate-400 group-hover:text-emerald-600 transition-colors"
                      title="View Patient Details"
                    >
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ========================================================
          MODAL 1: CLINICAL PATIENT DOSSIER (Centered, Apple/Epic Health UI)
      ======================================================== */}
      {activeCaseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Header Hero */}
            <div className="relative px-7 pt-7 pb-6 bg-gradient-to-b from-slate-50 via-slate-50/50 to-white border-b border-slate-100">
              <button
                onClick={() => setActiveCaseDetails(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
              >
                <FaTimes size={13} />
              </button>

              <div className="flex items-center gap-4.5">
                {/* Big Token Numerator Pill */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0 ring-4 ring-emerald-500/10">
                  <span className="text-[9px] font-black uppercase text-emerald-200 tracking-wider">Token</span>
                  <span className="text-2xl font-black leading-none mt-0.5">
                    #{activeCaseDetails.opdInfo?.tokenNumber || activeCaseDetails.tokenNumber}
                  </span>
                </div>

                <div className="pr-8">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {activeCaseDetails.patientSummary?.name || activeCaseDetails.patientDisplayName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        activeCaseDetails.status === "In-Progress"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : activeCaseDetails.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {activeCaseDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {activeCaseDetails.patientSummary?.age ? `${activeCaseDetails.patientSummary.age} Yrs` : ""}{" "}
                    {activeCaseDetails.patientSummary?.gender || activeCaseDetails.patientAgeGender} &bull; Booking ID:{" "}
                    <span className="font-mono text-slate-600 font-bold">{activeCaseDetails.bookingId}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="p-7 overflow-y-auto space-y-6 text-xs">
              {/* Cabin Room & Time Card */}
              <div className="grid grid-cols-2 gap-3.5 p-4.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <FaDoorOpen size={13} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/70 block">
                      Assigned Cabin
                    </span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">
                      {activeCaseDetails.opdInfo?.opdRoomNumber || activeCaseDetails.opdRoomNumber || "Cabin 1"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <FaClock size={13} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/70 block">
                      Appointment Slot
                    </span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">
                      {activeCaseDetails.opdInfo?.appointmentTime || activeCaseDetails.appointmentTime || "--:--"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Demographics & Contact */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Patient Dossier Details
                </span>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group">
                    <span className="text-slate-400 block text-[10px] font-bold">Contact Phone</span>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <FaPhoneAlt className="text-emerald-600" size={10} />
                        {activeCaseDetails.patientSummary?.contactPhone || "Not on file"}
                      </span>
                      {activeCaseDetails.patientSummary?.contactPhone && (
                        <button
                          onClick={() => copyToClipboard(activeCaseDetails.patientSummary?.contactPhone)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                          title="Copy Phone"
                        >
                          <FaCopy size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-slate-400 block text-[10px] font-bold">Blood Group</span>
                    <span className="font-black text-slate-900 flex items-center gap-1.5 mt-1.5 text-xs">
                      <FaTint className="text-red-500" size={11} />
                      {activeCaseDetails.patientSummary?.bloodGroup || "Not Specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason for Visit Card */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FaNotesMedical className="text-emerald-600" /> Reason for Visit / Chief Complaints
                </span>
                <div className="p-4.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl font-bold text-slate-700 leading-relaxed text-xs">
                  {activeCaseDetails.opdInfo?.reasonForVisit || activeCaseDetails.reasonForVisit || "Routine Follow-up & General Health Checkup"}
                </div>
              </div>
            </div>

            {/* Dossier Footer Actions */}
            <div className="p-6 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedCase(activeCaseDetails);
                  setShowNoShowModal(true);
                }}
                className="px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FaUserTimes />
                <span>Mark Absent</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setSelectedCase(activeCaseDetails);
                    setShowRescheduleModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
                >
                  Reschedule
                </button>

                {activeCaseDetails.status === "Confirmed" ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleCallPatient(activeCaseDetails._id, activeCaseDetails.tokenNumber)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                  >
                    <FaBell /> Call Inside Cabin
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedCase(activeCaseDetails);
                      setShowRxModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
                  >
                    <FaFilePrescription /> Write Prescription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: DIGITAL PRESCRIPTION PAD (EHR Pad Design)
      ======================================================== */}
      {showRxModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            {/* Medical Pad Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-serif font-black text-emerald-300 border border-white/15 shadow-inner">
                  ℞
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Medical Prescription & Clinical Sign-off
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    Token #{selectedCase.tokenNumber || "--"} &bull; {selectedCase.patientDisplayName || selectedCase.patientName || "Patient"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRxModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Prescription Form */}
            <form onSubmit={handlePrescriptionSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 text-xs">
              {/* Diagnosis Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Clinical Diagnosis & Examination Notes *
                </label>
                <textarea
                  required
                  rows="3"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Upper Respiratory Tract Infection with mild rhinitis, chest clear, temperature 99°F..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* Medicines Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FaPills className="text-emerald-600" /> Prescribed Drugs / Dosage Schedule
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setRxMedicines([...rxMedicines, { name: "", dosage: "1-0-1", duration: "5 days", notes: "After meals" }])
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <FaPlus size={10} /> Add Medication
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rxMedicines.map((med, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2.5 p-3 bg-slate-50/90 border border-slate-200/90 rounded-2xl items-center hover:bg-slate-100/50 transition-colors"
                    >
                      <input
                        type="text"
                        placeholder="Drug / Brand Name (e.g. Tab. Paracetamol 650)"
                        value={med.name}
                        onChange={(e) => {
                          const copy = [...rxMedicines];
                          copy[index].name = e.target.value;
                          setRxMedicines(copy);
                        }}
                        className="col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (1-0-1)"
                        value={med.dosage}
                        onChange={(e) => {
                          const copy = [...rxMedicines];
                          copy[index].dosage = e.target.value;
                          setRxMedicines(copy);
                        }}
                        className="col-span-3 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 text-center"
                      />
                      <input
                        type="text"
                        placeholder="Duration (5 Days)"
                        value={med.duration}
                        onChange={(e) => {
                          const copy = [...rxMedicines];
                          copy[index].duration = e.target.value;
                          setRxMedicines(copy);
                        }}
                        className="col-span-3 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setRxMedicines(rxMedicines.filter((_, i) => i !== index))}
                        className="col-span-1 text-slate-300 hover:text-red-500 flex items-center justify-center p-1 cursor-pointer transition-colors"
                        title="Remove Drug"
                      >
                        <FaTrashAlt size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  <span>Sign & Complete Consultation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: RESCHEDULE APPOINTMENT (Clean Calendar & Time Slots)
      ======================================================== */}
      {showRescheduleModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-7 sm:p-8 space-y-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Token #{selectedCase.tokenNumber || "--"} &bull; {selectedCase.patientDisplayName || selectedCase.patientName || "Patient"}
                </p>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-emerald-600" /> New Consultation Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1.5">
                  <FaClock className="text-emerald-600" /> New Time Slot *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:30 AM or 04:15 PM"
                  value={rescheduleData.newTimeSlot}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTimeSlot: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                  Reason for Reschedule *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Emergency Surgical OT / Doctor on Rounds"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black bg-slate-900 hover:bg-black text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: NO-SHOW / ABSENT CONFIRMATION (With Quick Chips)
      ======================================================== */}
      {showNoShowModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-7 sm:p-8 space-y-5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FaExclamationCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Mark Patient No-Show
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Token #{selectedCase.tokenNumber || "--"} &bull; {selectedCase.patientDisplayName || selectedCase.patientName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNoShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Did patient <span className="font-black text-slate-900">{selectedCase.patientDisplayName || selectedCase.patientName}</span> fail to appear inside the cabin? Choose a quick reason:
            </p>

            {/* Quick Preset Chips */}
            <div className="flex flex-wrap gap-1.5">
              {NO_SHOW_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNoShowReason(preset)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    noShowReason === preset
                      ? "bg-red-50 text-red-700 border-red-300"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              rows="2"
              value={noShowReason}
              onChange={(e) => setNoShowReason(e.target.value)}
              placeholder="Or write custom reason..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
            />

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNoShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmNoShow}
                className="px-5 py-2.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md shadow-red-600/20 active:scale-95 transition-all"
              >
                Confirm No-Show
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}