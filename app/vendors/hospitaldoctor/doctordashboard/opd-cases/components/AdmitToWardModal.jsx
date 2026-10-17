"use client";

import React, { useState, useEffect } from "react";
import {
  FaProcedures,
  FaBed,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaClock
} from "react-icons/fa";
import HospitalDoctorAPI from "@/app/services/HospitalDoctorAPI";

const TRIAGE_LEVELS = [
  { level: "Emergency", label: "Emergency (Immediate)", color: "bg-red-50 text-red-700 border-red-200" },
  { level: "Very Urgent", label: "Very Urgent (Within 10m)", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { level: "Urgent", label: "Urgent (Within 30m)", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { level: "Routine", label: "Routine Admission", color: "bg-slate-50 text-slate-700 border-slate-200" }
];

export default function AdmitToWardModal({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) {
  const [loadingBeds, setLoadingBeds] = useState(true);
  const [wardsData, setWardsData] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState("");
  const [selectedBed, setSelectedBed] = useState(null);

  // Form Fields
  const [triageLevel, setTriageLevel] = useState("Emergency");
  const [initialStayDays, setInitialStayDays] = useState(1);
  const [admissionReason, setAdmissionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchBeds();
      setSelectedBed(null);
      setErrorMsg("");
      setTriageLevel("Emergency");
      setInitialStayDays(1);
      setAdmissionReason(
        appointment?.reasonForVisit || appointment?.chiefComplaints
          ? `Acute condition observed during OPD: ${appointment.reasonForVisit || appointment.chiefComplaints}. Immediate in-patient care ordered.`
          : "Acute in-patient monitoring required. Shift to in-patient ward."
      );
    }
  }, [isOpen, appointment]);

  // 3.1 View Available Wards & Beds (GET /hospital-doctor/panel/opd/available-beds)
  const fetchBeds = async () => {
    try {
      setLoadingBeds(true);
      const res = await HospitalDoctorAPI.getAvailableBedsForOpd();
      if (res?.success && res.data) {
        const wards = res.data || [];
        setWardsData(wards);
        if (wards.length > 0) {
          setSelectedWardId(wards[0].wardId || wards[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load beds:", err);
      setErrorMsg("Failed to load available hospital beds.");
    } finally {
      setLoadingBeds(false);
    }
  };

  if (!isOpen) return null;

  const currentWard = wardsData.find((w) => (w.wardId || w._id) === selectedWardId);
  const depositPayable = (selectedBed?.pricePerDay || 0) * Number(initialStayDays || 1);

  // 3.2 Initiate Bed Admission Hold (POST /hospital-doctor/panel/opd/initiate-admission)
  const handleSubmitAdmission = async (e) => {
    e.preventDefault();
    if (!selectedBed) {
      setErrorMsg("Please select an available bed from the ward list.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        opdAppointmentId: appointment?._id || appointment?.appointmentId || appointment?.bookingId,
        bedId: selectedBed.bedId || selectedBed._id,
        admissionReason: admissionReason.trim(),
        triageLevel: triageLevel,
        initialStayDays: Number(initialStayDays) || 1
      };

      const res = await HospitalDoctorAPI.initiateBedAdmission(payload);
      if (res?.success) {
        if (onSuccess) onSuccess(res);
        onClose();
      } else {
        setErrorMsg(res?.message || "Failed to initiate bed admission hold.");
      }
    } catch (err) {
      console.error("Admission initiate error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to hold bed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xl animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-7 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl text-indigo-300">
              <FaProcedures />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                Admit Patient to Ward (30-Minute Bed Hold)
              </h3>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                Token #{appointment?.tokenNumber || "--"} &bull; {appointment?.patientDisplayName || appointment?.patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitAdmission} className="flex-1 overflow-y-auto p-7 space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 font-bold text-xs">
              <FaExclamationTriangle className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 30-Min Hold Info Banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <FaClock className="text-indigo-600 text-base shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-black text-indigo-950 text-xs">How 30-Minute Bed Hold Works:</p>
              <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                Selecting a bed locks it under <strong>'Reserved'</strong> status for 30 minutes. Current OPD consultation will be marked <strong>Completed</strong>, and the patient receives a live 30-minute payment countdown on their app and at the reception counter.
              </p>
            </div>
          </div>

          {/* Step 1: Select Ward */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                1. Select Target Ward
              </label>
              <span className="text-[11px] text-emerald-600 font-bold">
                {wardsData.reduce((acc, w) => acc + (w.availableBedsCount || 0), 0)} Total Beds Available
              </span>
            </div>

            {loadingBeds ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center bg-slate-50 rounded-2xl">
                <FaSpinner className="animate-spin text-indigo-600 w-5 h-5 mb-2" />
                <span className="font-bold">Checking available hospital wards...</span>
              </div>
            ) : wardsData.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed">
                No available wards or beds published in this facility.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {wardsData.map((ward) => {
                  const wId = ward.wardId || ward._id;
                  return (
                    <button
                      key={wId}
                      type="button"
                      onClick={() => {
                        setSelectedWardId(wId);
                        setSelectedBed(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedWardId === wId
                          ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md scale-102"
                          : "bg-slate-50 border-slate-200 hover:bg-white text-slate-800"
                      }`}
                    >
                      <p className="font-black text-xs leading-tight">{ward.wardName || ward.name}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-bold">
                        <span className={selectedWardId === wId ? "text-indigo-300" : "text-slate-400"}>
                          {ward.wardType || ward.type}
                        </span>
                        <span className={selectedWardId === wId ? "text-emerald-400" : "text-emerald-600"}>
                          {ward.availableBedsCount ?? ward.availableBeds ?? 0} Free
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Available Beds in Selected Ward */}
          {currentWard && (
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                2. Select Bed in {currentWard.wardName || currentWard.name}
              </label>

              {currentWard.beds?.length === 0 ? (
                <p className="text-slate-400 font-semibold italic p-4 bg-slate-50 rounded-xl">
                  No beds available in this ward. Please pick another ward above.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentWard.beds.map((bed) => {
                    const bId = bed.bedId || bed._id;
                    const isSelected = (selectedBed?.bedId || selectedBed?._id) === bId;
                    return (
                      <button
                        key={bId}
                        type="button"
                        onClick={() => setSelectedBed(bed)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30 scale-102"
                            : "bg-white border-slate-200 hover:border-emerald-500 text-slate-800 shadow-2xs"
                        }`}
                      >
                        {bed.isVentilatorAvailable && (
                          <span
                            className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full absolute top-2 right-2 ${
                              isSelected ? "bg-white text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            Ventilator
                          </span>
                        )}
                        <FaBed size={16} className={`mx-auto mb-1 ${isSelected ? "text-white" : "text-slate-400"}`} />
                        <span className="font-black text-xs block leading-tight">{bed.bedNumber}</span>
                        <span
                          className={`text-[10px] font-extrabold block mt-0.5 ${
                            isSelected ? "text-emerald-100" : "text-emerald-700"
                          }`}
                        >
                          ₹{bed.pricePerDay} / day
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Triage Priority Level */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              3. Triage Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRIAGE_LEVELS.map((t) => (
                <button
                  key={t.level}
                  type="button"
                  onClick={() => setTriageLevel(t.level)}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                    triageLevel === t.level
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : t.color
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Initial Days & Admission Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Initial Deposit Days *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={initialStayDays}
                onChange={(e) => setInitialStayDays(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-900 outline-none focus:border-indigo-500"
              />
              <span className="text-[9px] text-slate-400 block mt-1">1 Day minimum deposit</span>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Admission Clinical Order &amp; Reason *
              </label>
              <textarea
                rows="2"
                required
                value={admissionReason}
                onChange={(e) => setAdmissionReason(e.target.value)}
                placeholder="e.g. Acute cardiac monitoring required. Shift to Cardiac ICU."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Selected Bed Summary Pill */}
          {selectedBed && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                  Target Bed Locked for 30 Mins
                </span>
                <p className="font-black text-sm text-slate-900 mt-0.5">
                  {selectedBed.bedNumber} &bull; {currentWard?.wardName || currentWard?.name} ({triageLevel})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Initial Deposit Due</span>
                <span className="text-base font-black text-emerald-700">₹{depositPayable}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedBed}
              className="px-7 py-3 text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaProcedures />}
              <span>Initiate 30-Min Bed Hold &rarr;</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}