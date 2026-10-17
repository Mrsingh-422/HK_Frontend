"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaPrint,
  FaQrcode,
  FaArrowLeft,
  FaHospital,
  FaDoorOpen,
  FaUsers,
  FaClock,
  FaSyncAlt,
  FaUser,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaShieldAlt
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function PaymentConfirmation({
  bookingResult,
  doctor,
  hospital,
  patientData = {},
  selectedDate,
  selectedSlot,
  onReset
}) {
  const [liveQueue, setLiveQueue] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Extract appointment ID safely from varied response structures
  const targetAppointmentId =
    bookingResult?.appointmentId ||
    bookingResult?.data?._id ||
    bookingResult?._id ||
    bookingResult?.bookingId;

  // 1. Auto-fetch Live Queue on component mount
  useEffect(() => {
    if (targetAppointmentId) {
      fetchLiveQueueStatus();
    }
  }, [targetAppointmentId]);

  // Fetch Live Queue (GET /user/hospital/opd/live-queue/:appointmentId)
  const fetchLiveQueueStatus = async () => {
    if (!targetAppointmentId) return;

    try {
      setLoadingQueue(true);

      let res;
      if (typeof UserAPI?.getLiveQueueStatus === "function") {
        res = await UserAPI.getLiveQueueStatus(targetAppointmentId);
      } else {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("userToken") || localStorage.getItem("token")
            : "";

        const axiosRes = await axios.get(
          `${BASE_URL}/user/hospital/opd/live-queue/${targetAppointmentId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        );
        res = axiosRes.data;
      }

      if (res?.success && res.data) {
        setLiveQueue(res.data);
      }
    } catch (err) {
      console.warn("Live queue tracking error:", err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tokenNumber = liveQueue?.myTokenNumber || bookingResult?.tokenNumber || 1;
  const bookingId = liveQueue?.bookingId || bookingResult?.bookingId || "HKH-OPD-789012";
  const opdRoomNumber =
    liveQueue?.cabinNumber ||
    bookingResult?.data?.opdRoomNumber ||
    doctor?.opdRoomNumber ||
    "Cabin 1";

  // Generate QR Code with token verification data
  const qrDataText = `HEALTH KANGAROO OPD TOKEN SLIP
----------------------------------
Token: #${tokenNumber}
Booking ID: ${bookingId}
Doctor: Dr. ${liveQueue?.doctorName || doctor?.name || "Attending Consultant"}
Cabin: ${opdRoomNumber}
Status: ${liveQueue?.status || "Confirmed"}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-in fade-in duration-200 font-sans">
      {/* 1. Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-md shadow-emerald-500/10 ring-8 ring-emerald-500/5">
          <FaCheckCircle />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Token #{tokenNumber} Issued!
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mx-auto">
          {bookingResult?.message || "Your OPD appointment has been registered successfully."}
        </p>
      </div>

      {/* 2. LIVE OPD QUEUE TRACKER CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-[2.2rem] p-6 sm:p-7 shadow-xl border border-slate-800 ring-1 ring-white/10 relative overflow-hidden">
        {/* Glow Decorator */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
              <FaUsers />
              <span>Live Queue Status &bull; {opdRoomNumber}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            </div>
            <p className="text-xs font-medium text-slate-300">
              Dr. {liveQueue?.doctorName || doctor?.name || "Consultant"} &bull; Real-time cabin queue sync
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLiveQueueStatus}
            disabled={loadingQueue}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <FaSyncAlt className={loadingQueue ? "animate-spin" : ""} size={11} />
            <span>{loadingQueue ? "Syncing..." : "Refresh Queue"}</span>
          </button>
        </div>

        {/* Live Counters */}
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {/* Your Token */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Your Token</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">#{tokenNumber}</span>
            <span className="text-[9px] text-emerald-300 font-bold block mt-0.5">Assigned</span>
          </div>

          {/* Now Serving */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Now In Cabin</span>
            <span className="text-2xl font-black text-amber-400 mt-0.5 block">
              #{liveQueue?.currentServingToken || "--"}
            </span>
            <span className="text-[9px] text-amber-300 font-bold block mt-0.5">Serving Now</span>
          </div>

          {/* Tokens Ahead */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Patients Ahead</span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {liveQueue?.tokensAhead !== undefined ? liveQueue.tokensAhead : "--"}
            </span>
            <span className="text-[9px] text-slate-300 font-bold block mt-0.5">In Queue</span>
          </div>

          {/* Estimated Wait */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Estimated Wait</span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {liveQueue?.estimatedWaitTimeMinutes !== undefined
                ? `${liveQueue.estimatedWaitTimeMinutes}m`
                : "20m"}
            </span>
            <span className="text-[9px] text-slate-300 font-bold block mt-0.5">Approx. Time</span>
          </div>
        </div>

        {/* Payment Warning if COD / Hospital-Pending */}
        {liveQueue?.paymentStatus === "Pending" && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <span className="flex items-center gap-2">
              <FaMoneyBillWave className="text-amber-400" />
              <span>Counter Payment Pending: Please pay fees at the OPD reception desk.</span>
            </span>
            <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              COD Action Required
            </span>
          </div>
        )}
      </div>

      {/* 3. PRINTABLE OPD TOKEN SLIP */}
      <div
        id="printable-slip"
        className="bg-white rounded-[2.5rem] p-7 sm:p-9 border border-slate-200 shadow-sm relative print:m-0 print:border-none print:shadow-none"
      >
        {/* Slip Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider">
              <FaHospital /> {hospital?.name || "Hospital Facility Desk"}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">Official OPD Token Slip</h3>
            <p className="text-[11px] text-slate-400 font-semibold">{hospital?.city || "OPD Central Block"}</p>
          </div>

          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-center shrink-0 shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Daily Token</span>
            <span className="text-2xl font-black tracking-tight text-emerald-400 leading-none">#{tokenNumber}</span>
          </div>
        </div>

        {/* Patient & Clinic Details Grid */}
        <div className="grid sm:grid-cols-2 gap-6 my-6 py-2 border-b border-slate-100 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Patient</span>
              <span className="font-black text-slate-900 text-sm">{patientData.fullName || "Registered Patient"}</span>
              <span className="text-slate-500 text-[11px] font-bold block">
                ({patientData.age || 25} Yrs &bull; {patientData.gender || "Male"} &bull; {patientData.relation || "Self"})
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Booking Reference ID</span>
              <span className="font-mono font-black text-slate-800 text-xs">{bookingId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Reason for Visit</span>
              <span className="font-bold text-slate-700">{patientData.reason || "General OPD Consultation"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Attending Doctor</span>
              <span className="font-black text-slate-900 text-sm">
                Dr. {liveQueue?.doctorName || doctor?.name || "Consultant"}
              </span>
              <span className="text-emerald-600 font-bold text-[11px] block">{doctor?.speciality || "General Medicine"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Designated Cabin</span>
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <FaDoorOpen className="text-emerald-600" /> {opdRoomNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Allotted Slot Window</span>
              <span className="font-black text-slate-800">
                {selectedDate} at {selectedSlot?.time || "Scheduled Window"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom QR & Verification Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img src={qrCodeUrl} alt="OPD QR Code" className="w-full h-full object-contain" />
            </div>
            <div className="text-[11px]">
              <p className="font-black text-slate-800">Scan at Cabin Entrance</p>
              <p className="text-slate-400 font-medium">Automatic attendance check on arrival.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-black text-[10px] uppercase px-3 py-1.5 rounded-xl border ${
                liveQueue?.status === "Confirmed" || bookingResult?.data?.status === "Confirmed"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {liveQueue?.status || bookingResult?.data?.status || "Confirmed"}
            </span>

            <span className="font-black text-[10px] uppercase bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
              {liveQueue?.paymentStatus || bookingResult?.data?.paymentMethod || "Desk COD"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <FaArrowLeft /> Book Another OPD
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <FaPrint /> Print / Save Token Slip
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-slip,
          #printable-slip * {
            visibility: visible;
          }
          #printable-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}