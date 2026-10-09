"use client";

import React, { useState } from "react";
import { FaCheckCircle, FaPrint, FaQrcode, FaArrowLeft, FaHospital, FaDoorOpen, FaUsers } from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

export default function PaymentConfirmation({
  bookingResult,
  doctor,
  hospital,
  patientData,
  selectedDate,
  selectedSlot,
  onReset
}) {
  const [liveQueue, setLiveQueue] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Check live queue counter (GET /user/hospital/opd/live-queue/:appointmentId)
  const checkLiveQueue = async () => {
    if (!bookingResult?.appointmentId) return;
    try {
      setLoadingQueue(true);
      const res = await UserAPI.getLiveQueueStatus(bookingResult.appointmentId);
      if (res.success) setLiveQueue(res.data);
    } catch (err) {
      console.error("Live queue fetch error:", err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const tokenNumber = bookingResult?.tokenNumber || 12;
  const bookingId = bookingResult?.bookingId || "HK-OPD-910245102";
  const opdRoomNumber = bookingResult?.data?.opdRoomNumber || doctor?.opdRoomNumber || "Cabin 204 (OPD Block A)";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
          <FaCheckCircle />
        </div>
        <h2 className="text-3xl font-black text-slate-900">
          Token #{tokenNumber} Issued!
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          {bookingResult?.message || "OPD Appointment booked successfully!"}
        </p>
      </div>

      {/* Live Queue Tracker Card */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <FaUsers /> Live OPD Queue Desk
            </div>
            <p className="text-sm font-medium text-slate-200">
              Track live patient status directly at {opdRoomNumber}.
            </p>
          </div>
          <button
            type="button"
            onClick={checkLiveQueue}
            disabled={loadingQueue}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all shrink-0"
          >
            {loadingQueue ? "Syncing..." : "Refresh Live Counter"}
          </button>
        </div>

        {liveQueue && (
          <div className="mt-5 pt-5 border-t border-emerald-800/80 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-2xl p-3">
              <span className="text-[10px] text-slate-300 uppercase block font-bold">Your Token</span>
              <span className="text-2xl font-black text-emerald-400">#{liveQueue.myTokenNumber}</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <span className="text-[10px] text-slate-300 uppercase block font-bold">Now Serving</span>
              <span className="text-2xl font-black text-amber-400">#{liveQueue.currentServingToken}</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <span className="text-[10px] text-slate-300 uppercase block font-bold">Wait Time</span>
              <span className="text-2xl font-black text-white">{liveQueue.estimatedWaitTime || "40m"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Printable OPD Slip */}
      <div
        id="printable-slip"
        className="bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-slate-200 shadow-lg relative print:m-0 print:border-none print:shadow-none"
      >
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <FaHospital /> {hospital?.name || "Fortis Hospital Mohali"}
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">Official OPD Token Slip</h3>
            <p className="text-[11px] text-slate-400 font-semibold">{hospital?.city || "OPD Block A"}</p>
          </div>

          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-center shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Daily Token</span>
            <span className="text-2xl font-black tracking-wider text-emerald-400">#{tokenNumber}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 my-6 py-2 border-b border-slate-100 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Patient</span>
              <span className="font-extrabold text-slate-900 text-sm">{patientData.fullName}</span>
              <span className="text-slate-500 text-[11px] font-medium block">
                ({patientData.age} Yrs / {patientData.gender} • Relation: {patientData.relation || "Self"})
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Booking Reference ID</span>
              <span className="font-mono font-bold text-slate-800">{bookingId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Chief Complaints</span>
              <span className="font-medium text-slate-700">{patientData.reason || "General OPD Checkup"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Attending Doctor</span>
              <span className="font-extrabold text-slate-900 text-sm">Dr. {doctor?.name}</span>
              <span className="text-emerald-700 font-bold text-[11px] block">{doctor?.speciality}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Designated Cabin</span>
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <FaDoorOpen className="text-emerald-600" /> {opdRoomNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Allotted Time Slot</span>
              <span className="font-extrabold text-slate-900">{selectedDate} at {selectedSlot?.time}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 text-2xl">
              <FaQrcode />
            </div>
            <div className="text-[11px] text-slate-500">
              <p className="font-bold text-slate-800">Scan at Doctor Cabin Entrance</p>
              <p>Direct priority token verification.</p>
            </div>
          </div>
          <span className="font-black text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase">
            Status: {bookingResult?.data?.status || "Confirmed"} ({bookingResult?.data?.paymentMethod || "COD"})
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-all"
        >
          <FaArrowLeft /> Book Another OPD
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all"
        >
          <FaPrint /> Print / Save PDF Slip
        </button>
      </div>
    </div>
  );
}