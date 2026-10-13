"use client";

import React, { useState, useEffect } from "react";
import HospitalAPI from "@/app/services/HospitalAPI";
import {
  FaPlaneDeparture,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaSpinner,
  FaCheck,
  FaBan,
  FaTimes,
  FaDoorOpen,
  FaCalendarAlt,
  FaSyncAlt,
  FaExclamationTriangle,
  FaUserMd
} from "react-icons/fa";

const REJECTION_PRESETS = [
  "Heavy patient appointments scheduled during this window",
  "Emergency departmental coverage shortage",
  "Another specialist already on leave for this shift",
  "Requested notice period insufficient"
];

export default function HospitalDoctorLeavesPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending"); // 'Pending' | 'Approved' | 'Rejected' | 'All'
  const [searchQuery, setSearchQuery] = useState("");

  // Data from API
  const [leavesData, setLeavesData] = useState([]);
  const [overview, setOverview] = useState({
    totalLeaves: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  });

  // Rejection Modal State
  const [selectedLeaveForReject, setSelectedLeaveForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Feedback Notification
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadLeaves();
  }, [activeTab]);

  const showToast = (text, type = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Image URL Helper
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/^(public\/|\/)/, "");
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  const loadLeaves = async (search = searchQuery) => {
    try {
      setLoading(true);
      const params = {
        status: activeTab,
        ...(search.trim() ? { search: search.trim() } : {})
      };

      const res = await HospitalAPI.getDoctorLeaves(params);
      if (res?.success) {
        setLeavesData(res.data || []);
        if (res.overview) setOverview(res.overview);
      }
    } catch (err) {
      console.error("Failed to load doctor leaves:", err);
      showToast(err.response?.data?.message || "Failed to load leave records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeaves(searchQuery);
  };

  // 1. APPROVE LEAVE
  const handleApprove = async (leave) => {
    try {
      setActionLoading(true);
      const payload = {
        doctorId: leave.doctorId,
        leaveId: leave.leaveId || leave._id,
        action: "Approved"
      };

      const res = await HospitalAPI.reviewDoctorLeave(payload);
      if (res?.success) {
        showToast(`Leave approved for ${leave.doctorName}!`);
        await loadLeaves();
      } else {
        showToast(res?.message || "Failed to approve leave.", "error");
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.response?.data?.message || "Error approving leave.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. REJECT LEAVE (Modal submit)
  const handleConfirmReject = async () => {
    if (!selectedLeaveForReject) return;
    try {
      setActionLoading(true);
      const payload = {
        doctorId: selectedLeaveForReject.doctorId,
        leaveId: selectedLeaveForReject.leaveId || selectedLeaveForReject._id,
        action: "Rejected",
        rejectionReason: rejectionReason.trim() || "Heavy patient influx scheduled"
      };

      const res = await HospitalAPI.reviewDoctorLeave(payload);
      if (res?.success) {
        showToast(`Leave rejected for ${selectedLeaveForReject.doctorName}.`);
        setSelectedLeaveForReject(null);
        setRejectionReason("");
        await loadLeaves();
      } else {
        showToast(res?.message || "Failed to reject leave.", "error");
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.response?.data?.message || "Error rejecting leave.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const tabsConfig = [
    { key: "Pending", label: "Pending Approval", count: overview.pendingCount, color: "amber" },
    { key: "Approved", label: "Approved Leaves", count: overview.approvedCount, color: "emerald" },
    { key: "Rejected", label: "Rejected", count: overview.rejectedCount, color: "red" },
    { key: "All", label: "All Applications", count: overview.totalLeaves, color: "slate" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-500/20">
              <FaPlaneDeparture />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                Doctor Leave Approval Desk
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Review multi-day absence requests & regulate live OPD slot schedules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadLeaves()}
              className="p-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Refresh Records"
            >
              <FaSyncAlt />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-7">
        {/* Toast Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all shadow-md animate-in fade-in ${
              feedback.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {feedback.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 1. OVERVIEW COUNTER METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
            <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider">
              Pending Requests
            </span>
            <p className="text-3xl font-black text-amber-600 mt-1">{overview.pendingCount || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
            <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">
              Approved Leaves
            </span>
            <p className="text-3xl font-black text-emerald-700 mt-1">{overview.approvedCount || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
            <span className="text-[11px] font-black uppercase text-red-500 tracking-wider">
              Rejected
            </span>
            <p className="text-3xl font-black text-red-600 mt-1">{overview.rejectedCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-3xl text-white shadow-lg shadow-indigo-600/20">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-200">
              Total Applications
            </span>
            <p className="text-3xl font-black mt-1">{overview.totalLeaves || 0}</p>
          </div>
        </div>

        {/* 2. TAB CONTROLLER & SEARCH BAR */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Doctor Search Field */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </form>
          </div>

          {/* 3. LEAVE APPLICATIONS LIST */}
          <div className="space-y-3.5 pt-2">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <FaSpinner className="w-7 h-7 animate-spin text-indigo-600" />
                <p className="text-xs font-black uppercase tracking-wider">Loading leave records...</p>
              </div>
            ) : leavesData.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No leave applications found under "{activeTab}".
              </div>
            ) : (
              leavesData.map((leave) => {
                const isPending = leave.status === "Pending";
                const isApproved = leave.status === "Approved";
                const isRejected = leave.status === "Rejected";

                const profileImg = getFullUrl(leave.doctorProfileImage);

                return (
                  <div
                    key={leave.leaveId || leave._id}
                    className="p-5 bg-white hover:bg-indigo-50/20 border border-slate-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-xs hover:shadow-md"
                  >
                    {/* Left: Doctor Profile & Leave Details */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {profileImg ? (
                        <img
                          src={profileImg}
                          alt={leave.doctorName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black shrink-0 border border-indigo-100 shadow-xs">
                          <FaUserMd />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            {leave.doctorName}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-bold">
                            &bull; {leave.speciality}
                          </span>
                          {leave.opdRoomNumber && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <FaDoorOpen size={9} /> {leave.opdRoomNumber}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isRejected
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </div>

                        {/* Dates Banner */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-xs font-black text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                            <FaCalendarAlt className="text-indigo-600" />
                            {leave.formattedDateRange || `${leave.startDate?.split("T")[0]} to ${leave.endDate?.split("T")[0]}`}
                          </span>
                          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                            {leave.totalDays || "Multi-day"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold pl-1">
                            Applied on: {leave.formattedAppliedAt || leave.appliedAt?.split("T")[0]}
                          </span>
                        </div>

                        {/* Leave Reason */}
                        <p className="text-xs text-slate-600 font-bold pt-1">
                          Reason: <span className="font-medium text-slate-700">{leave.reason}</span>
                        </p>

                        {/* Rejection Note if Rejected */}
                        {leave.rejectionReason && (
                          <p className="text-[11px] text-red-600 font-bold pt-0.5">
                            Rejection Note: <span className="font-medium">{leave.rejectionReason}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions (Only on Pending status) */}
                    {isPending && (
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleApprove(leave)}
                          className="px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                          <FaCheck size={11} />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            setSelectedLeaveForReject(leave);
                            setRejectionReason("");
                          }}
                          className="px-4.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-red-200"
                        >
                          <FaBan size={11} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ========================================================
          REJECT LEAVE REASON MODAL
      ======================================================== */}
      {selectedLeaveForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.2rem] w-full max-w-md p-7 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Reject Doctor Leave Application
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {selectedLeaveForReject.doctorName} &bull; {selectedLeaveForReject.formattedDateRange}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeaveForReject(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Select or provide a reason why this leave application is being rejected:
            </p>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              {REJECTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectionReason(preset)}
                  className={`w-full text-left p-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    rejectionReason === preset
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
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Or write custom rejection note..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 text-slate-800 transition-all placeholder:text-slate-400"
            />

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLeaveForReject(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-5 py-2.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {actionLoading && <FaSpinner className="animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}