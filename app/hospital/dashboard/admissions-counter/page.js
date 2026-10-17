"use client";

import React, { useState, useEffect } from "react";
import HospitalAPI from "@/app/services/HospitalAPI";
import {
  FaProcedures,
  FaMoneyBillWave,
  FaCreditCard,
  FaQrcode,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPrint,
  FaSearch,
  FaTimes,
  FaBed,
  FaReceipt,
  FaSyncAlt,
  FaHeartbeat,
  FaExchangeAlt,
  FaTag,
  FaShieldAlt,
  FaWind
} from "react-icons/fa";

export default function HospitalAdmissionCounterPage() {
  const [loading, setLoading] = useState(true);
  const [pendingHolds, setPendingHolds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Counter Collection Modal State
  const [selectedHold, setSelectedHold] = useState(null);
  const [paymentMode, setPaymentMode] = useState("Cash"); // 'Cash' | 'Card' | 'UPI'
  const [transactionReference, setTransactionReference] = useState("");
  const [cashierRemarks, setCashierRemarks] = useState("Received at Cash Desk");

  // Post-payment success receipt
  const [receiptData, setReceiptData] = useState(null);

  // Bed Switch Modal State (Step 1 -> Step 2 -> Step 3)
  const [switchTargetHold, setSwitchTargetHold] = useState(null);
  const [wardsList, setWardsList] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState("");
  const [wardBeds, setWardBeds] = useState([]);
  const [selectedNewBed, setSelectedNewBed] = useState(null);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [switchingBed, setSwitchingBed] = useState(false);

  useEffect(() => {
    fetchPendingHolds();
    // 1-second interval to update live countdown timers
    const timer = setInterval(() => {
      setPendingHolds((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (text, type = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. FETCH LIVE PENDING BED HOLDS
  const fetchPendingHolds = async () => {
    try {
      setLoading(true);
      let res;
      if (typeof HospitalAPI.getPendingAdmissionHolds === "function") {
        res = await HospitalAPI.getPendingAdmissionHolds();
      } else {
        res = await HospitalAPI.get(
          "/hospital/doctor/appointments/admissions/pending-holds"
        );
      }

      if (res?.success) {
        setPendingHolds(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Failed to load pending holds:", err);
      showToast("Failed to fetch pending admission holds.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Reverse Countdown Calculator
  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) return "30m 00s";
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "EXPIRED";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handleOpenCollectModal = (holdItem) => {
    setSelectedHold(holdItem);
    setPaymentMode("Cash");
    setTransactionReference(`POS-REC-${Math.floor(10000 + Math.random() * 90000)}`);
    setCashierRemarks("Received at Hospital Cash Desk");
  };

  // ========================================================
  // BED SWITCH SEQUENCE (Steps 1 -> 3)
  // ========================================================
  const handleOpenSwitchBedModal = async (holdItem) => {
    setSwitchTargetHold(holdItem);
    setSelectedNewBed(null);
    setWardBeds([]);
    setLoadingWards(true);

    try {
      const res = await HospitalAPI.getWardsList();
      if (res?.success && Array.isArray(res.data)) {
        setWardsList(res.data);
        if (res.data.length > 0) {
          const firstWard = res.data[0];
          setSelectedWardId(firstWard._id);
          fetchWardBeds(firstWard._id);
        }
      } else {
        showToast("No active wards found.", "error");
      }
    } catch (err) {
      console.error("Error loading wards:", err);
      showToast("Failed to fetch wards list.", "error");
    } finally {
      setLoadingWards(false);
    }
  };

  const fetchWardBeds = async (wardId) => {
    if (!wardId) return;
    setLoadingBeds(true);
    setSelectedNewBed(null);
    try {
      const res = await HospitalAPI.getWardBeds(wardId);
      if (res?.success && Array.isArray(res.data)) {
        setWardBeds(res.data);
      } else {
        setWardBeds([]);
      }
    } catch (err) {
      console.error("Error loading beds for ward:", err);
      showToast("Failed to fetch beds for this ward.", "error");
    } finally {
      setLoadingBeds(false);
    }
  };

  const handleWardSelect = (wardId) => {
    setSelectedWardId(wardId);
    fetchWardBeds(wardId);
  };

  const handleConfirmBedSwitch = async () => {
    if (!switchTargetHold || !selectedNewBed) return;

    const targetId =
      switchTargetHold.admissionAppointmentId ||
      switchTargetHold.admissionBookingId ||
      switchTargetHold._id;

    try {
      setSwitchingBed(true);
      const res = await HospitalAPI.switchBed(targetId, selectedNewBed.bedId || selectedNewBed._id);

      if (res?.success) {
        showToast(
          res.message ||
            `Bed successfully switched to ${res.newWardName} (${res.newBedNumber})!`
        );

        // Update local object & seamlessly open payment collection
        const updatedHold = {
          ...switchTargetHold,
          bedNumber: res.newBedNumber || selectedNewBed.bedNumber,
          wardName: res.newWardName || selectedNewBed.wardName,
          depositPayable: res.newDepositPayable || selectedNewBed.pricePerDay
        };

        setSwitchTargetHold(null);
        await fetchPendingHolds();

        // Prompt cashier directly to collect deposit for the newly switched bed
        handleOpenCollectModal(updatedHold);
      } else {
        showToast(res?.message || "Failed to switch bed.", "error");
      }
    } catch (err) {
      console.error("Bed switch failed:", err);
      showToast(err.response?.data?.message || "Error switching bed.", "error");
    } finally {
      setSwitchingBed(false);
    }
  };

  // ========================================================
  // SUBMIT PAYMENT COLLECTION
  // ========================================================
  const handleSubmitCounterPayment = async (e) => {
    e.preventDefault();
    if (!selectedHold) return;

    try {
      setActionLoading(true);
      const targetId =
        selectedHold.admissionAppointmentId ||
        selectedHold.admissionBookingId ||
        selectedHold._id;

      const payload = {
        paymentMode: paymentMode,
        transactionReference: transactionReference.trim(),
        remarks: cashierRemarks.trim()
      };

      const res = await HospitalAPI.collectAdmissionPayment(targetId, payload);

      if (res?.success) {
        showToast(
          res.message ||
            `Admission confirmed! Deposit collected via ${paymentMode}. Bed is now Occupied.`
        );
        setReceiptData({
          ...res,
          patientName: selectedHold.patient?.name || "Patient",
          depositAmount: selectedHold.depositPayable || 3500,
          date: new Date().toLocaleDateString("en-IN")
        });
        setSelectedHold(null);
        await fetchPendingHolds();
      } else {
        showToast(res?.message || "Failed to record counter payment", "error");
      }
    } catch (err) {
      console.error("Counter collection error:", err);
      showToast(err.response?.data?.message || "Error processing payment.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Search Filter
  const filteredHolds = pendingHolds.filter((item) => {
    const q = searchQuery.toLowerCase();
    const id = (item.admissionBookingId || "").toLowerCase();
    const opdId = (item.parentOpdBooking?.opdBookingId || "").toLowerCase();
    const name = (item.patient?.name || "").toLowerCase();
    const ward = (item.wardName || "").toLowerCase();
    return id.includes(q) || opdId.includes(q) || name.includes(q) || ward.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black shadow-xs">
              <FaProcedures />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                Pending Bed Holds Desk (30-Min Queue)
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Live converted admissions &bull; Switch bed or collect deposit to occupy
              </p>
            </div>
          </div>

          <button
            onClick={fetchPendingHolds}
            className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-2xs cursor-pointer active:scale-95"
          >
            <FaSyncAlt className={loading ? "animate-spin text-indigo-600" : "text-slate-400"} />
            <span>Refresh Holds</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-7">
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

        {/* Counter Info Bar & Search */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-black text-xs">
              {pendingHolds.length} Active Bed Holds
            </span>
            <p className="text-xs text-slate-400 font-medium">
              Beds remain reserved for 30 minutes until deposit is collected or bed is switched.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search patient, admission ID, OPD token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* PENDING BED HOLDS LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white rounded-3xl border border-slate-100">
              <FaSpinner className="animate-spin text-indigo-600 w-6 h-6" />
              <span className="font-bold text-xs uppercase tracking-wider">Syncing live bed holds...</span>
            </div>
          ) : filteredHolds.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-slate-200">
              No pending bed holds currently awaiting counter payment.
            </div>
          ) : (
            filteredHolds.map((item) => {
              const timerText = getRemainingTime(item.holdExpiresAt);
              const isExpired = timerText === "EXPIRED";

              return (
                <div
                  key={item.admissionAppointmentId || item.admissionBookingId}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Patient, Doctor, Ward, and Bed Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center font-black shrink-0 border border-indigo-100 shadow-2xs">
                      <FaBed size={18} />
                      <span className="text-[11px] mt-0.5 leading-none">{item.bedNumber}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {item.patient?.name}
                        </h3>
                        <span className="text-xs text-slate-400 font-bold">
                          ({item.patient?.age} Yrs &bull; {item.patient?.gender})
                        </span>

                        {item.parentOpdBooking && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <FaTag size={8} /> OPD Token #{item.parentOpdBooking.tokenNumber} ({item.parentOpdBooking.opdBookingId})
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.triageLevel === "Emergency"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.triageLevel || "Emergency"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-semibold flex items-center gap-2 flex-wrap">
                        <span>
                          Target Ward: <strong className="text-slate-900">{item.wardName}</strong>
                        </span>
                        {item.isVentilatorAvailable && (
                          <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                            Ventilator Ready
                          </span>
                        )}
                        <span>&bull;</span>
                        <span>
                          Attending: <strong>Dr. {item.doctor?.name}</strong> ({item.doctor?.cabinRoom || "Cabin"})
                        </span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-500 font-bold">
                          #{item.admissionBookingId}
                        </span>
                      </p>

                      <p className="text-xs text-slate-500 font-medium italic">
                        Order: "{item.bookingReason}"
                      </p>

                      {item.vitalsAtAdmission && (
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-700">
                          <span className="text-slate-400 flex items-center gap-1">
                            <FaHeartbeat className="text-rose-500" size={11} /> Vitals:
                          </span>
                          <span>BP: {item.vitalsAtAdmission.bp}</span>
                          <span>&bull;</span>
                          <span>Pulse: {item.vitalsAtAdmission.pulse} bpm</span>
                          <span>&bull;</span>
                          <span>Temp: {item.vitalsAtAdmission.temp} °F</span>
                          <span>&bull;</span>
                          <span className="text-emerald-600">SpO2: {item.vitalsAtAdmission.spo2}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Live Countdown, Switch Bed & Cashier Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                        30-Min Hold Remaining
                      </span>
                      <div
                        className={`flex items-center gap-1.5 font-black text-sm mt-0.5 ${
                          isExpired ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        <FaClock size={12} />
                        <span>{timerText}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                        Deposit Due
                      </span>
                      <span className="text-xl font-black text-slate-900 mt-0.5 block">
                        ₹{item.depositPayable || 3500}
                      </span>
                    </div>

                    {!isExpired ? (
                      <div className="flex items-center gap-2">
                        {/* Switch Bed Button */}
                        <button
                          onClick={() => handleOpenSwitchBedModal(item)}
                          className="px-4 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border border-indigo-200 transition-all cursor-pointer active:scale-95"
                          title="Upgrade / Change bed allocation"
                        >
                          <FaExchangeAlt />
                          <span>Switch Bed</span>
                        </button>

                        {/* Collect Payment Button */}
                        <button
                          onClick={() => handleOpenCollectModal(item)}
                          className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <FaMoneyBillWave />
                          <span>Collect Payment</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                        Hold Expired (Bed Released)
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ========================================================
          MODAL: SWITCH BED AT BILLING COUNTER (4-Step Flow)
      ======================================================== */}
      {switchTargetHold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FaExchangeAlt className="text-indigo-600" /> Switch / Upgrade Bed
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Patient: <strong className="text-slate-800">{switchTargetHold.patient?.name}</strong> &bull; Current: {switchTargetHold.wardName} ({switchTargetHold.bedNumber})
                </p>
              </div>
              <button
                onClick={() => setSwitchTargetHold(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            {/* Step 1: Wards Horizontal Selector */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                1. Select Target Ward
              </label>
              {loadingWards ? (
                <div className="py-4 flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <FaSpinner className="animate-spin text-indigo-600" /> Loading wards...
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {wardsList.map((ward) => (
                    <button
                      key={ward._id}
                      type="button"
                      onClick={() => handleWardSelect(ward._id)}
                      className={`px-4 py-2.5 rounded-2xl border shrink-0 text-left transition-all cursor-pointer ${
                        selectedWardId === ward._id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="font-black text-xs">{ward.name}</p>
                      <span className={`text-[10px] font-bold ${selectedWardId === ward._id ? "text-indigo-100" : "text-slate-400"}`}>
                        {ward.availableBeds ?? ward.availableBedsCount ?? 0} Beds Available
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Bed Units Grid View */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  2. Select Available Bed Unit
                </label>
                {/* Color Legend Rule */}
                <div className="flex items-center gap-2.5 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Reserved
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Occupied
                  </span>
                </div>
              </div>

              {loadingBeds ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <FaSpinner className="animate-spin text-indigo-600 w-5 h-5" />
                  <span className="text-xs font-bold">Loading ward beds...</span>
                </div>
              ) : wardBeds.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No beds configured in this ward.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {wardBeds.map((bed) => {
                    const isAvailable = bed.status === "Available";
                    const isSelected = selectedNewBed?.bedId === bed.bedId || selectedNewBed?._id === bed._id;

                    let statusClass = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60";

                    if (bed.status === "Available") {
                      statusClass = isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500 shadow-md cursor-pointer"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200 cursor-pointer";
                    } else if (bed.status === "Occupied") {
                      statusClass = "bg-red-50 text-red-700 border-red-200 cursor-not-allowed opacity-60";
                    } else if (bed.status === "Reserved") {
                      statusClass = "bg-amber-50 text-amber-800 border-amber-200 cursor-not-allowed opacity-60";
                    }

                    return (
                      <button
                        key={bed.bedId || bed._id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedNewBed(bed)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${statusClass}`}
                      >
                        <div className="flex items-center gap-1">
                          <FaBed size={13} />
                          <span className="text-xs font-black">{bed.bedNumber}</span>
                        </div>
                        <span className="text-[10px] font-bold mt-0.5">
                          ₹{bed.pricePerDay}/day
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[9px] uppercase font-bold">
                          {bed.isVentilatorAvailable && <FaWind title="Ventilator Ready" />}
                          <span>{bed.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Summary Card */}
            {selectedNewBed && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 block">
                    Target Bed Selection
                  </span>
                  <p className="font-black text-slate-900 text-sm mt-0.5">
                    {selectedNewBed.wardName} &bull; {selectedNewBed.bedNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-indigo-700 block">
                    New Rate / Deposit
                  </span>
                  <span className="text-lg font-black text-indigo-800">
                    ₹{selectedNewBed.pricePerDay}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSwitchTargetHold(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedNewBed || switchingBed}
                onClick={handleConfirmBedSwitch}
                className="px-6 py-2.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {switchingBed ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                <span>Confirm Bed Switch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: COUNTER PAYMENT COLLECTION (Cash / Card / POS / UPI)
      ======================================================== */}
      {selectedHold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-7 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Collect Bed Deposit at Counter
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  #{selectedHold.admissionBookingId} &bull; {selectedHold.wardName} ({selectedHold.bedNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedHold(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            <form onSubmit={handleSubmitCounterPayment} className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                    Patient Name
                  </span>
                  <p className="font-black text-sm text-slate-900 mt-0.5">
                    {selectedHold.patient?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                    Deposit Payable
                  </span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{selectedHold.depositPayable || 3500}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "Cash", icon: FaMoneyBillWave, label: "Cash" },
                    { key: "Card", icon: FaCreditCard, label: "POS Card" },
                    { key: "UPI", icon: FaQrcode, label: "Counter UPI" }
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setPaymentMode(mode.key)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 font-bold ${
                        paymentMode === mode.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <mode.icon size={13} />
                      <span className="text-xs">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  POS / Transaction Reference *
                </label>
                <input
                  type="text"
                  required
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. POS-REC-90124 or UPI-TXN-49102"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Cashier Remarks
                </label>
                <input
                  type="text"
                  value={cashierRemarks}
                  onChange={(e) => setCashierRemarks(e.target.value)}
                  placeholder="e.g. Received by Cashier at Counter 1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedHold(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  <span>Confirm Deposit & Admit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DEPOSIT RECEIPT CONFIRMATION
      ======================================================== */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-7 space-y-5 shadow-2xl border border-slate-100 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-xs">
                <FaReceipt />
              </div>
              <h3 className="text-base font-black text-slate-900">Hospital Deposit Receipt</h3>
              <p className="text-slate-400 font-semibold text-[11px]">
                Admission confirmed &bull; Bed locked as Occupied
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Admission ID:</span>
                <span className="font-mono font-black text-slate-900">#{receiptData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Patient Name:</span>
                <span className="font-black text-slate-900">{receiptData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Ward & Bed:</span>
                <span className="font-black text-emerald-700">
                  {receiptData.wardName} ({receiptData.bedNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Payment Mode:</span>
                <span className="font-black text-slate-900">{receiptData.paymentMode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-black text-slate-800">Deposit Collected:</span>
                <span className="font-black text-emerald-700">₹{receiptData.depositAmount}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl uppercase flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <FaPrint /> Print Receipt
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl uppercase flex items-center justify-center cursor-pointer text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}