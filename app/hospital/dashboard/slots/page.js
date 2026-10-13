"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HospitalAPI from "@/app/services/HospitalAPI";
import {
  FaDoorOpen,
  FaRupeeSign,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlaneDeparture,
  FaBuilding,
  FaCheck,
  FaBan,
  FaTimes
} from "react-icons/fa";

const ALL_DAYS = [
  { key: "Mon", label: "MON", full: "Monday" },
  { key: "Tue", label: "TUE", full: "Tuesday" },
  { key: "Wed", label: "WED", full: "Wednesday" },
  { key: "Thu", label: "THU", full: "Thursday" },
  { key: "Fri", label: "FRI", full: "Friday" },
  { key: "Sat", label: "SAT", full: "Saturday" },
  { key: "Sun", label: "SUN", full: "Sunday" }
];

function OpdGovernanceContent() {
  const searchParams = useSearchParams();
  const queryDoctorId = searchParams?.get("doctorId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState(false);

  // Doctors List & Selected Doctor
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Hospital-Admin Only Fields: Cabin Number, Price, and Available Days
  const [roomNumber, setRoomNumber] = useState("");
  const [opdFee, setOpdFee] = useState(600);
  const [availableDays, setAvailableDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [existingSchedules, setExistingSchedules] = useState([]);

  // Doctor Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeRejectModal, setActiveRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Feedback Notification
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  // When selected doctor changes, populate data
  useEffect(() => {
    if (selectedDoctorId && doctorsList.length > 0) {
      const doc = doctorsList.find((d) => (d._id || d.id) === selectedDoctorId);
      if (doc) {
        setSelectedDoctor(doc);
        setRoomNumber(doc.opdRoomNumber || "");
        setOpdFee(doc.opdFee || 600);

        const activeDaysList = (doc.weeklySchedule || []).map((s) => s.day);
        setAvailableDays(activeDaysList.length > 0 ? activeDaysList : ["Mon", "Tue", "Wed", "Thu", "Fri"]);
        setExistingSchedules(doc.weeklySchedule || []);

        if (doc.leaves) {
          setLeaveRequests(doc.leaves);
        } else {
          setLeaveRequests([]);
        }
      }
    }
  }, [selectedDoctorId, doctorsList]);

  const showToast = (text, type = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await HospitalAPI.getHospitalDoctors();
      if (res?.success && res.data) {
        const docs = Array.isArray(res.data) ? res.data : [];
        setDoctorsList(docs);
        if (docs.length > 0) {
          // Read from hook safely (No promise unwrap error)
          const matched = docs.find((d) => (d._id || d.id) === queryDoctorId);
          setSelectedDoctorId(matched ? (matched._id || matched.id) : (docs[0]._id || docs[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load hospital doctors:", err);
      showToast("Failed to load hospital doctors.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailableDay = (dayKey) => {
    setAvailableDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleSaveConfiguration = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      showToast("Please select a doctor to configure.", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        roomNumber: roomNumber.trim(),
        opdFee: Number(opdFee),
        isOpdEnabled: true,
        availability: availableDays.map((day) => {
          const existing = existingSchedules.find((s) => s.day === day);
          return {
            day,
            startTime: existing?.startTime || "09:00",
            endTime: existing?.endTime || "14:00"
          };
        })
      };

      const res = await HospitalAPI.adminConfigureDoctorOpd(selectedDoctorId, payload);
      if (res?.success) {
        showToast(`Cabin, fee, and working days saved for ${selectedDoctor?.name || "Doctor"}!`);
      } else {
        showToast(res?.message || "Failed to update configuration", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.response?.data?.message || "Failed to save configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      setReviewingLeave(true);
      const payload = {
        doctorId: selectedDoctorId,
        leaveId,
        action: "Approved"
      };

      let res;
      if (typeof HospitalAPI.reviewDoctorLeave === "function") {
        res = await HospitalAPI.reviewDoctorLeave(payload);
      } else {
        res = await HospitalAPI.patch("/hospital/panel/doctors/leave-approval", payload);
      }

      if (res?.success) {
        showToast("Doctor leave application approved successfully!");
        setLeaveRequests((prev) =>
          prev.map((l) => (l._id === leaveId ? { ...l, status: "Approved" } : l))
        );
      } else {
        showToast(res?.message || "Failed to approve leave", "error");
      }
    } catch (err) {
      console.error("Approve leave error:", err);
      showToast(err.response?.data?.message || "Error approving leave.", "error");
    } finally {
      setReviewingLeave(false);
    }
  };

  const handleConfirmRejectLeave = async () => {
    if (!activeRejectModal) return;
    try {
      setReviewingLeave(true);
      const payload = {
        doctorId: selectedDoctorId,
        leaveId: activeRejectModal.leaveId,
        action: "Rejected",
        rejectionReason: rejectionReason.trim() || "Heavy patient influx scheduled"
      };

      let res;
      if (typeof HospitalAPI.reviewDoctorLeave === "function") {
        res = await HospitalAPI.reviewDoctorLeave(payload);
      } else {
        res = await HospitalAPI.patch("/hospital/panel/doctors/leave-approval", payload);
      }

      if (res?.success) {
        showToast("Doctor leave rejected.");
        setLeaveRequests((prev) =>
          prev.map((l) => (l._id === activeRejectModal.leaveId ? { ...l, status: "Rejected" } : l))
        );
        setActiveRejectModal(null);
        setRejectionReason("");
      } else {
        showToast(res?.message || "Failed to reject leave", "error");
      }
    } catch (err) {
      console.error("Reject leave error:", err);
      showToast(err.response?.data?.message || "Error rejecting leave.", "error");
    } finally {
      setReviewingLeave(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <FaSpinner className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-black text-sm tracking-wide">
          Loading Hospital Doctors & Governance Desk...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-600/20">
              <FaBuilding />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                Hospital OPD Governance & Leave Desk
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Assign cabin room, consultation pricing, available days & approve leaves
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="text-[11px] font-black uppercase text-slate-400">Doctor:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-black text-slate-900 outline-none focus:border-emerald-500 shadow-2xs"
            >
              {doctorsList.map((doc) => (
                <option key={doc._id || doc.id} value={doc._id || doc.id}>
                  Dr. {doc.name} ({doc.speciality || "General"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
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

        <form onSubmit={handleSaveConfiguration} className="space-y-8">
          {/* Cabin Room & Consultation Fee */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
                Hospital Facility Configuration
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Cabin Room & Consultation Fee &bull; Dr. {selectedDoctor?.name || "Doctor"}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                These values are controlled strictly by the hospital and are locked for the doctor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FaDoorOpen className="text-emerald-600" /> Cabin / Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Cabin 204 (OPD Block A)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FaRupeeSign className="text-emerald-600" /> OPD Consultation Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={opdFee}
                  onChange={(e) => setOpdFee(e.target.value)}
                  placeholder="600"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Available Working Days */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
                  Weekly Roster
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Doctor Available Working Days
                </h2>
                <p className="text-slate-400 text-xs font-medium mt-0.5">
                  Click to turn available days ON or OFF for this doctor. Shift timings are managed by the doctor.
                </p>
              </div>

              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                {availableDays.length} Days Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {ALL_DAYS.map((dayItem) => {
                const isActive = availableDays.includes(dayItem.key);

                return (
                  <button
                    key={dayItem.key}
                    type="button"
                    onClick={() => toggleAvailableDay(dayItem.key)}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isActive
                        ? "bg-[#0B132B] text-white border-[#0B132B] shadow-lg shadow-slate-900/15 scale-[1.02]"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`text-[11px] font-black tracking-wider uppercase ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                      {dayItem.label}
                    </span>
                    <span className="text-base font-black mt-1 leading-none tracking-tight">
                      {dayItem.full}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase mt-2 px-2 py-0.5 rounded-full ${
                        isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>{saving ? "Saving Changes..." : "Save Doctor OPD Settings"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Doctor Leave Approval Desk */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                Absence Management
              </span>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight mt-0.5">
                <FaPlaneDeparture className="text-indigo-600" /> Doctor Leave Applications Desk
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Review and approve multi-day leave requests. Approved leaves automatically block patient bookings.
              </p>
            </div>

            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black">
              {leaveRequests.length} Requests
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No leave requests found for Dr. {selectedDoctor?.name || "this doctor"}.
              </div>
            ) : (
              leaveRequests.map((leave) => {
                const isPending = !leave.status || leave.status === "Pending";
                const isApproved = leave.status === "Approved";
                const isRejected = leave.status === "Rejected";

                return (
                  <div
                    key={leave._id || leave.id}
                    className="p-5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-slate-900 text-sm">
                          {new Date(leave.startDate).toLocaleDateString()} &rarr;{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800"
                              : isRejected
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {leave.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-1">
                        Reason: <span className="font-normal">{leave.reason || "Personal Leave"}</span>
                      </p>
                      {leave.rejectionReason && (
                        <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                          Rejection Note: {leave.rejectionReason}
                        </p>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          disabled={reviewingLeave}
                          onClick={() => handleApproveLeave(leave._id || leave.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                          <FaCheck /> Approve Leave
                        </button>

                        <button
                          disabled={reviewingLeave}
                          onClick={() =>
                            setActiveRejectModal({
                              leaveId: leave._id || leave.id,
                              doctorId: selectedDoctorId
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <FaBan /> Reject
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

      {/* Reject Leave Modal */}
      {activeRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-7 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Reject Doctor Leave Application
              </h3>
              <button
                onClick={() => setActiveRejectModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Please provide the reason why this leave request is being rejected:
            </p>

            <textarea
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Heavy patient influx scheduled during these days"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 text-slate-800"
            />

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveRejectModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewingLeave}
                onClick={handleConfirmRejectLeave}
                className="px-5 py-2.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {reviewingLeave && <FaSpinner className="animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HospitalDoctorOpdGovernancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
          <FaSpinner className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-600 font-black text-sm">Loading...</p>
        </div>
      }
    >
      <OpdGovernanceContent />
    </Suspense>
  );
}