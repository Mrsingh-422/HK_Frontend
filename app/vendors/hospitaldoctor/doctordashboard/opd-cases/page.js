"use client";

import React, { useState, useEffect } from "react";
import HospitalDoctorAPI from "@/app/services/HospitalDoctorAPI";
import UserAPI from "@/app/services/UserAPI";
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
  FaTimes,
  FaSyncAlt,
  FaSearch,
  FaCalendarAlt,
  FaArrowRight,
  FaCopy,
  FaHeartbeat,
  FaCrown,
  FaCheck,
  FaPrint,
  FaPhoneAlt,
  FaNotesMedical,
  FaTint,
  FaProcedures,
  FaBed,
  FaPlay
} from "react-icons/fa";

// Imported Modals from components folder
import AddPrescriptionModal from "./components/AddPrescriptionModal";
import DigitalPrescriptionTemplate from "./components/DigitalPrescriptionTemplate";
import AdmitToWardModal from "./components/AdmitToWardModal";

const RESCHEDULE_REASON_PRESETS = [
  "Emergency Surgery / Cardiac OT",
  "Doctor on Urgent ICU Rounds",
  "Shift Schedule Adjusted",
  "Patient Requested Over Phone"
];

export default function DoctorOpdDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [opdCases, setOpdCases] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'completed' | 'no-show' | 'all'
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Active Case Full Details Modal State
  const [activeCaseDetails, setActiveCaseDetails] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  // Two-Step Prescription Flow
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false);
  const [stagedPrescriptionPayload, setStagedPrescriptionPayload] = useState(null);
  const [isViewingPrescription, setIsViewingPrescription] = useState(false);

  // Direct Complete Consultation (Advice Only)
  const [showDirectCompleteModal, setShowDirectCompleteModal] = useState(false);
  const [directNotes, setDirectNotes] = useState("");
  const [directAdvice, setDirectAdvice] = useState("");

  // OPD to IPD Bed Admission Hold Modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  // Reschedule States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ newDate: "", newTimeSlot: "", reason: "" });
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [isLoadingRescheduleSlots, setIsLoadingRescheduleSlots] = useState(false);

  // No-show States
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
      showToast(err || "Failed to load OPD cases.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open Full Case Details Dossier
  const handleOpenCaseDetails = async (caseItem) => {
    setSelectedCase(caseItem);
    try {
      const res = await HospitalDoctorAPI.getCaseDetails(caseItem._id || caseItem.bookingId);
      if (res?.success && res.data) {
        setActiveCaseDetails(res.data);
      } else {
        setActiveCaseDetails(caseItem);
      }
    } catch (err) {
      setActiveCaseDetails(caseItem);
    }
  };

  // 1.5 A: Call Patient Inside Cabin / Start Consultation
  const handleStartCase = async (appointmentId, tokenNumber, autoOpenPrescribe = false, caseObj = null) => {
    try {
      setActionLoading(true);
      const res = await HospitalDoctorAPI.startConsultation(appointmentId);
      if (res?.success) {
        showToast(`Token #${tokenNumber} called inside cabin! Case started.`);
        
        if (activeCaseDetails) {
          setActiveCaseDetails((prev) => ({ ...prev, status: "In-Progress" }));
        }

        await loadDashboardAndQueue();

        if (autoOpenPrescribe && caseObj) {
          handleStartPrescription({ ...caseObj, status: "In-Progress" });
        }
      } else {
        showToast(res?.message || "Failed to start consultation.", "error");
      }
    } catch (err) {
      showToast(err || "Failed to start consultation.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 1.5 B: Mark Patient No-Show
  const handleConfirmNoShow = async () => {
    if (!noShowReason.trim()) return showToast("Please enter reason for no-show.", "error");
    try {
      setActionLoading(true);
      const res = await HospitalDoctorAPI.markNoShow(
        selectedCase._id || selectedCase.bookingId
      );
      if (res?.success) {
        showToast(res.message || "Marked as No-Show.");
        setShowNoShowModal(false);
        setActiveCaseDetails(null);
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err || "Failed to mark absent.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 1.5 C: Direct Complete Consultation (Advice Only)
  const handleConfirmDirectComplete = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const apptId = selectedCase?._id || selectedCase?.bookingId;
      const res = await HospitalDoctorAPI.completeOpdConsultation(apptId, {
        consultationNotes: directNotes.trim() || "Normal consultation, routine clinical checkup.",
        advice: directAdvice.trim() || "Stay hydrated and rest."
      });

      if (res?.success) {
        showToast(res.message || "Consultation completed successfully! Wallet earnings updated.");
        setShowDirectCompleteModal(false);
        setActiveCaseDetails(null);
        setDirectNotes("");
        setDirectAdvice("");
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err || "Failed to complete consultation.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Prescription Workflow Handlers
  const handleStartPrescription = (caseItem) => {
    const target = caseItem || selectedCase;
    if (!target) return;
    setSelectedCase(target);
    setIsViewingPrescription(false);
    setIsPrescriptionModalOpen(true);
  };

  const handlePrescriptionStaged = (payload) => {
    setStagedPrescriptionPayload(payload);
    setIsPrescriptionModalOpen(false);
    setIsTemplatePreviewOpen(true);
  };

  const handleCompletePrescriptionCase = async () => {
    showToast("Prescription issued & consultation marked Completed successfully!");
    setIsTemplatePreviewOpen(false);
    setSelectedCase(null);
    setActiveCaseDetails(null);
    setStagedPrescriptionPayload(null);
    await loadDashboardAndQueue();
  };

  // View Existing Prescription Record
  const handleViewPrescriptionSlip = (caseItem) => {
    setSelectedCase(caseItem);
    setIsViewingPrescription(true);
    setIsTemplatePreviewOpen(true);
  };

  // Reschedule Slots via UserAPI
  const fetchAvailableSlotsForDate = async (targetDate) => {
    if (!targetDate) return;
    const doctorId = selectedCase?.doctorId || dashboardData?.doctorId;
    const hospitalId = selectedCase?.hospitalId || dashboardData?.hospital?._id;

    try {
      setIsLoadingRescheduleSlots(true);
      setRescheduleSlots([]);
      const res = await UserAPI.getDoctorOpdSlots(doctorId, hospitalId, targetDate);
      if (res?.success) setRescheduleSlots(res.slots || []);
    } catch (err) {
      setRescheduleSlots([]);
    } finally {
      setIsLoadingRescheduleSlots(false);
    }
  };

  const handleOpenRescheduleModal = (caseItem) => {
    setSelectedCase(caseItem);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const initialDate = d.toISOString().split("T")[0];

    setRescheduleData({ newDate: initialDate, newTimeSlot: "", reason: "" });
    setShowRescheduleModal(true);
    fetchAvailableSlotsForDate(initialDate);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleData.newTimeSlot) {
      showToast("Please select an available time slot.", "error");
      return;
    }
    try {
      setActionLoading(true);
      const fn =
        HospitalDoctorAPI.rescheduleAppointment ||
        HospitalDoctorAPI.doctorRescheduleAppointment;

      const res = await fn({
        appointmentId: selectedCase._id || selectedCase.bookingId,
        newDate: rescheduleData.newDate,
        newTimeSlot: rescheduleData.newTimeSlot,
        reason: rescheduleData.reason || "Doctor in Emergency Surgery"
      });

      if (res?.success) {
        showToast("Appointment rescheduled successfully!");
        setShowRescheduleModal(false);
        setActiveCaseDetails(null);
        await loadDashboardAndQueue();
      }
    } catch (err) {
      showToast(err || "Failed to reschedule.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Contact number copied to clipboard!");
  };

  // Tab Filtering & Counts
  const activeCasesCount = opdCases.filter(
    (c) => c.status === "Confirmed" || c.status === "In-Progress" || c.status === "Hospital-Pending"
  ).length;
  const completedCasesCount = opdCases.filter((c) => c.status === "Completed").length;
  const noShowCasesCount = opdCases.filter((c) => c.status === "No-Show").length;

  const filteredCases = opdCases.filter((item) => {
    if (activeTab === "active") {
      if (item.status !== "Confirmed" && item.status !== "In-Progress" && item.status !== "Hospital-Pending") {
        return false;
      }
    } else if (activeTab === "completed") {
      if (item.status !== "Completed") return false;
    } else if (activeTab === "no-show") {
      if (item.status !== "No-Show") return false;
    }

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
        <FaSpinner className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-700 font-black text-xs uppercase tracking-wider">
          Loading OPD Cabin & Queue...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-600/25">
              <FaUserMd />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  {dashboardData?.welcomeName || "Doctor Cabin"}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {dashboardData?.dutyStatus || "On Duty"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {dashboardData?.speciality} &bull; {dashboardData?.opdRoomNumber} &bull; ₹{dashboardData?.opdFee} Fee
              </p>
            </div>
          </div>

          <button
            onClick={loadDashboardAndQueue}
            className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FaSyncAlt className="text-slate-400" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-7">
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md ${
              feedback.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {feedback.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 1. Live Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Today's Tokens</span>
            <p className="text-3xl font-black text-slate-900 mt-2">{stats.todayOpdTotal || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">Consulted</span>
            <p className="text-3xl font-black text-emerald-700 mt-2">{stats.todayOpdCompleted || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider">Waiting</span>
            <p className="text-3xl font-black text-amber-600 mt-2">{stats.todayOpdPending || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-3xl text-white shadow-xl shadow-emerald-700/20">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">Serving Token</span>
            <p className="text-3xl font-black mt-2">#{stats.currentServingToken || "--"}</p>
          </div>
        </div>

        {/* 2. Currently In Cabin Banner */}
        {currentConsulting && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-[2.2rem] p-6 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex flex-col items-center justify-center border border-white/20 shrink-0">
                <span className="text-[9px] font-black uppercase text-emerald-300">Active</span>
                <span className="text-2xl font-black mt-0.5">#{currentConsulting.tokenNumber}</span>
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Currently in Cabin
                </span>
                <h3 className="text-xl font-black mt-1.5">{currentConsulting.patientName}</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">#{currentConsulting.bookingId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Direct Finish (Advice Only) */}
              <button
                onClick={() => {
                  const match = opdCases.find((c) => c.bookingId === currentConsulting.bookingId);
                  setSelectedCase(match || { _id: currentConsulting.bookingId, tokenNumber: currentConsulting.tokenNumber, patientDisplayName: currentConsulting.patientName });
                  setShowDirectCompleteModal(true);
                }}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
              >
                Finish (Advice Only)
              </button>

              {/* Admit Ward Hold */}
              <button
                onClick={() => {
                  const match = opdCases.find((c) => c.bookingId === currentConsulting.bookingId);
                  setSelectedCase(match || { _id: currentConsulting.bookingId, tokenNumber: currentConsulting.tokenNumber, patientDisplayName: currentConsulting.patientName });
                  setShowAdmitModal(true);
                }}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <FaProcedures size={13} />
                <span>Admit Ward (Hold)</span>
              </button>

              {/* Write Rx */}
              <button
                onClick={() => {
                  const match = opdCases.find((c) => c.bookingId === currentConsulting.bookingId);
                  handleStartPrescription(match || { _id: currentConsulting.bookingId, tokenNumber: currentConsulting.tokenNumber, patientDisplayName: currentConsulting.patientName });
                }}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FaFilePrescription size={13} />
                <span>Write Rx</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. OPD Queue List with Tabs */}
        <div className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Today's OPD Queue</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Start consultation, prescribe medicines, or shift to ward.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Queue Status Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "active" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>Active & Waiting</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {activeCasesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "completed" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>Completed</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {completedCasesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("no-show")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "no-show" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>No-Show</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === "no-show" ? "bg-red-100 text-red-800" : "bg-slate-200 text-slate-600"}`}>
                    {noShowCasesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>All ({opdCases.length})</span>
                </button>
              </div>

              {/* Search Field */}
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search token, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No patients found in "{activeTab}" queue.
              </div>
            ) : (
              filteredCases.map((item) => {
                const isCompleted = item.status === "Completed";
                const isNoShow = item.status === "No-Show";
                const isWaiting = item.status === "Confirmed" || item.status === "Hospital-Pending";
                const isInProgress = item.status === "In-Progress";

                return (
                  <div
                    key={item._id || item.bookingId}
                    onClick={() => handleOpenCaseDetails(item)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white hover:bg-emerald-50/30 border border-slate-200/90 hover:border-emerald-400/80 rounded-2xl gap-4 transition-all duration-200 shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
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
                          <h4 className="text-sm font-black text-slate-900">{item.patientDisplayName || item.patientName}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : isInProgress
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : isNoShow
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isInProgress ? "In Cabin" : item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {item.patientAgeGender || "Patient"} &bull; Time: <span className="text-slate-700 font-bold">{item.appointmentTime}</span> &bull; ID: <span className="font-mono">{item.bookingId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* START CASE BUTTON */}
                      {isWaiting && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleStartCase(item._id || item.bookingId, item.tokenNumber, false, item)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
                        >
                          <FaPlay size={10} />
                          <span>Start Case</span>
                        </button>
                      )}

                      {/* IN-PROGRESS BUTTONS */}
                      {isInProgress && (
                        <>
                          <button
                            onClick={() => handleStartPrescription(item)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                          >
                            <FaFilePrescription size={12} />
                            <span>Prescribe</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCase(item);
                              setShowAdmitModal(true);
                            }}
                            className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title="Shift / Admit Patient to Hospital Ward"
                          >
                            <FaProcedures size={11} />
                            <span>Admit Ward</span>
                          </button>
                        </>
                      )}

                      {/* COMPLETED BUTTON */}
                      {isCompleted && (
                        <button
                          onClick={() => handleViewPrescriptionSlip(item)}
                          className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                        >
                          <FaPrint size={11} />
                          <span>View Rx</span>
                        </button>
                      )}

                      {/* Reschedule button for waiting/in-progress cases */}
                      {!isCompleted && !isNoShow && (
                        <button
                          onClick={() => handleOpenRescheduleModal(item)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                          title="Reschedule Appointment"
                        >
                          <FaClock />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ========================================================
          FULL CASE DOSSIER MODAL
      ======================================================== */}
      {activeCaseDetails && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200 font-sans">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            <div className="relative px-7 pt-7 pb-6 bg-gradient-to-b from-slate-50 via-slate-50/50 to-white border-b border-slate-100">
              <button
                onClick={() => setActiveCaseDetails(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
              >
                <FaTimes size={13} />
              </button>

              <div className="flex items-center gap-4.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0 ring-4 ring-emerald-500/10">
                  <span className="text-[9px] font-black uppercase text-emerald-200 tracking-wider">Token</span>
                  <span className="text-2xl font-black leading-none mt-0.5">
                    #{activeCaseDetails.opdInfo?.tokenNumber || activeCaseDetails.tokenNumber || "--"}
                  </span>
                </div>

                <div className="pr-8">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {activeCaseDetails.patientSummary?.name || activeCaseDetails.patientDisplayName || activeCaseDetails.patientName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        activeCaseDetails.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : activeCaseDetails.status === "In-Progress"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : activeCaseDetails.status === "No-Show"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {activeCaseDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {activeCaseDetails.patientSummary?.age || activeCaseDetails.patientAgeGender?.split("/")[0]} Yrs &bull; {activeCaseDetails.patientSummary?.gender || activeCaseDetails.patientAgeGender?.split("/")[1]} &bull; ID:{" "}
                    <span className="font-mono text-slate-600 font-bold">{activeCaseDetails.bookingId}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-7 overflow-y-auto space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-3.5 p-4.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <FaDoorOpen size={13} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/70 block">Assigned Cabin</span>
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
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/70 block">Appointment Slot</span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">
                      {activeCaseDetails.opdInfo?.appointmentTime || activeCaseDetails.appointmentTime || "--:--"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Contact */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold">Contact Phone</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <FaPhoneAlt className="text-emerald-600" size={10} />
                    {activeCaseDetails.patientSummary?.contactPhone || activeCaseDetails.phoneNumber || "Not on file"}
                  </span>
                  {(activeCaseDetails.patientSummary?.contactPhone || activeCaseDetails.phoneNumber) && (
                    <button
                      onClick={() => copyToClipboard(activeCaseDetails.patientSummary?.contactPhone || activeCaseDetails.phoneNumber)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    >
                      <FaCopy size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Complaints */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FaNotesMedical className="text-emerald-600" /> Chief Complaints & Reason for Visit
                </span>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-slate-700 leading-relaxed text-xs">
                  {activeCaseDetails.opdInfo?.reasonForVisit || activeCaseDetails.reasonForVisit || "Routine Consultation"}
                </div>
              </div>
            </div>

            {/* Dossier Footer Actions */}
            <div className="p-6 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
              {activeCaseDetails.status !== "Completed" && activeCaseDetails.status !== "No-Show" ? (
                <button
                  onClick={() => {
                    setSelectedCase(activeCaseDetails);
                    setShowNoShowModal(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <FaUserTimes />
                  <span>Mark Absent</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5 flex-wrap">
                {activeCaseDetails.status !== "Completed" && activeCaseDetails.status !== "No-Show" && (
                  <button
                    onClick={() => handleOpenRescheduleModal(activeCaseDetails)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-2xs"
                  >
                    Reschedule
                  </button>
                )}

                {activeCaseDetails.status === "In-Progress" && (
                  <>
                    <button
                      onClick={() => {
                        setActiveCaseDetails(null);
                        setSelectedCase(activeCaseDetails);
                        setShowAdmitModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <FaProcedures size={11} />
                      <span>Admit Ward</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveCaseDetails(null);
                        handleStartPrescription(activeCaseDetails);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <FaFilePrescription /> Write Prescription
                    </button>
                  </>
                )}

                {(activeCaseDetails.status === "Confirmed" || activeCaseDetails.status === "Hospital-Pending") && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStartCase(activeCaseDetails._id, activeCaseDetails.tokenNumber, false, activeCaseDetails)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25"
                  >
                    <FaPlay size={10} /> Call Inside Cabin
                  </button>
                )}

                {activeCaseDetails.status === "Completed" && (
                  <button
                    onClick={() => {
                      setActiveCaseDetails(null);
                      handleViewPrescriptionSlip(activeCaseDetails);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <FaPrint /> View Prescription Slip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIT TO WARD 30-MIN HOLD MODAL */}
      <AdmitToWardModal
        isOpen={showAdmitModal}
        onClose={() => setShowAdmitModal(false)}
        appointment={selectedCase}
        onSuccess={(admissionData) => {
          showToast(`Bed ${admissionData.bedDetails?.bedNumber} held for 30 minutes! Admission #${admissionData.admissionBookingId} created.`);
          loadDashboardAndQueue();
        }}
      />

      {/* MODAL: DIRECT COMPLETE CONSULTATION (Advice Only) */}
      {showDirectCompleteModal && selectedCase && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md font-sans">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-7 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Finish Consultation &bull; Token #{selectedCase.tokenNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Complete this OPD visit with clinical advice without prescribing drugs.
            </p>

            <form onSubmit={handleConfirmDirectComplete} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Consultation Notes *</label>
                <textarea
                  rows="2"
                  required
                  value={directNotes}
                  onChange={(e) => setDirectNotes(e.target.value)}
                  placeholder="e.g. Normal viral throat congestion. Advised hydration."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Advice Given *</label>
                <textarea
                  rows="2"
                  required
                  value={directAdvice}
                  onChange={(e) => setDirectAdvice(e.target.value)}
                  placeholder="e.g. Review after 3 days if symptoms persist."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDirectCompleteModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-black bg-emerald-600 text-white rounded-xl uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {actionLoading && <FaSpinner className="animate-spin" />}
                  <span>Complete Consultation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 1: ADD PRESCRIPTION MODAL */}
      <AddPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        appointment={{
          _id: selectedCase?._id || selectedCase?.bookingId,
          appointmentId: selectedCase?._id || selectedCase?.bookingId,
          bookingId: selectedCase?.bookingId,
          patientName: selectedCase?.patientDisplayName || selectedCase?.patientName,
          patientGender: selectedCase?.patientAgeGender?.split("/")[1]?.trim() || "N/A",
          patientAge: selectedCase?.patientAgeGender?.split("/")[0]?.trim() || "N/A",
          patientAddress: activeCaseDetails?.patientSummary?.address || "N/A",
          userId: selectedCase?.patientId || selectedCase?.userId || "null",
          consultationType: "OPD",
          reasonForVisit: selectedCase?.reasonForVisit || selectedCase?.chiefComplaints || "",
          vitals: activeCaseDetails?.vitals
        }}
        onSuccess={handlePrescriptionStaged}
      />

      {/* STEP 2: DIGITAL PRESCRIPTION TEMPLATE */}
      <DigitalPrescriptionTemplate
        isOpen={isTemplatePreviewOpen}
        onClose={() => setIsTemplatePreviewOpen(false)}
        appointmentId={selectedCase?._id || selectedCase?.bookingId}
        data={stagedPrescriptionPayload}
        isViewOnly={isViewingPrescription}
        onCompleteCase={handleCompletePrescriptionCase}
        onEdit={() => {
          setIsTemplatePreviewOpen(false);
          setIsPrescriptionModalOpen(true);
        }}
      />

      {/* MODAL: RESCHEDULE APPOINTMENT */}
      {showRescheduleModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[92vh] overflow-y-auto p-7 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Reschedule Appointment Slot</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <FaTimes size={12} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1.5">Consultation Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleData.newDate}
                  onChange={(e) => {
                    const d = e.target.value;
                    setRescheduleData((prev) => ({ ...prev, newDate: d, newTimeSlot: "" }));
                    fetchAvailableSlotsForDate(d);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Select Available Slot *</label>
                {isLoadingRescheduleSlots ? (
                  <div className="py-8 text-center text-slate-400"><FaSpinner className="animate-spin mb-1 text-emerald-500" /> Checking...</div>
                ) : rescheduleSlots.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed">No slots available.</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {rescheduleSlots.map((slot, index) => {
                      const isPicked = rescheduleData.newTimeSlot === slot.time;
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={slot.isAvailable === false}
                          onClick={() => setRescheduleData((prev) => ({ ...prev, newTimeSlot: slot.time }))}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            slot.isAvailable === false ? "bg-slate-100 text-slate-300 line-through" : isPicked ? "bg-emerald-600 text-white font-black" : "bg-slate-50 text-slate-800"
                          }`}
                        >
                          <span className="text-xs font-black">{slot.time}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Reason for Reschedule *</label>
                <textarea
                  rows="2"
                  required
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  placeholder="e.g. Doctor in Emergency Surgery"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" disabled={actionLoading || !rescheduleData.newTimeSlot} className="px-6 py-2.5 text-xs font-black bg-slate-900 text-white rounded-xl uppercase">
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MARK ABSENT / NO-SHOW */}
      {showNoShowModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-7 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 uppercase">Mark Patient No-Show</h3>
            <p className="text-xs text-slate-600">Patient did not appear inside the cabin.</p>

            <div className="flex flex-wrap gap-1.5">
              {NO_SHOW_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNoShowReason(preset)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${noShowReason === preset ? "bg-red-50 text-red-700 border-red-300" : "bg-slate-50 text-slate-600"}`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t">
              <button onClick={() => setShowNoShowModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
              <button disabled={actionLoading} onClick={handleConfirmNoShow} className="px-5 py-2.5 text-xs font-black bg-red-600 text-white rounded-xl uppercase">
                Confirm No-Show
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}