"use client";

import React, { useState } from "react";
import { FaUser, FaPhoneAlt, FaEnvelope, FaFileMedical, FaDoorOpen, FaTag, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function PatientDetailsReview({
  patientData,
  onChangePatientData,
  doctor,
  selectedDate,
  selectedSlot,
  couponCode,
  setCouponCode,
  checkoutSummary,
  onApplyCoupon,
  isApplyingCoupon
}) {
  const handleChange = (e) => {
    onChangePatientData({
      ...patientData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 mb-8">
      {/* Patient Input Form */}
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Patient Information</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Provide patient details for Token registration at {doctor?.opdRoomNumber || "OPD Cabin"}.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Patient Name *</label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                name="fullName"
                required
                value={patientData.fullName || ""}
                onChange={handleChange}
                placeholder="e.g. Aman Verma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Age *</label>
              <input
                type="number"
                name="age"
                required
                value={patientData.age || ""}
                onChange={handleChange}
                placeholder="28"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Gender *</label>
              <select
                name="gender"
                value={patientData.gender || "Male"}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Relation *</label>
            <select
              name="relation"
              value={patientData.relation || "Self"}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="Self">Self</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Phone Number *</label>
            <div className="relative">
              <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="tel"
                name="phone"
                required
                value={patientData.phone || ""}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Reason for Visit / Symptoms</label>
          <div className="relative">
            <FaFileMedical className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
            <textarea
              name="reason"
              rows={3}
              value={patientData.reason || ""}
              onChange={handleChange}
              placeholder="e.g. Chest pain and palpitations, headache..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="pt-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Have a Coupon Code?</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. HOSP100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold tracking-wider uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              disabled={!couponCode || isApplyingCoupon}
              onClick={onApplyCoupon}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              {isApplyingCoupon ? <FaSpinner className="animate-spin" /> : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {/* Bill Review Summary Card */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-4">OPD Bill Summary</h3>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5 mb-6 text-xs">
            <p className="font-black text-slate-900">Dr. {doctor?.name}</p>
            <p className="text-emerald-600 font-bold uppercase text-[10px]">{doctor?.speciality}</p>
            <p className="text-slate-500 flex items-center gap-1 font-semibold text-[11px]">
              <FaDoorOpen className="text-emerald-500" /> {doctor?.opdRoomNumber || "Cabin 204"}
            </p>
            <div className="pt-2 border-t border-slate-200/60 flex justify-between font-bold text-slate-800">
              <span>Appointment:</span>
              <span>{selectedDate} ({selectedSlot?.time})</span>
            </div>
          </div>

          <div className="space-y-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Base Consultation Fee</span>
              <span className="font-bold text-slate-900">₹{checkoutSummary?.baseFee ?? doctor?.opdFee ?? 600}</span>
            </div>

            {checkoutSummary?.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span>- ₹{checkoutSummary.discount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Total Payable</span>
              <span className="text-emerald-700">₹{checkoutSummary?.totalPayable ?? doctor?.opdFee ?? 500}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-slate-400 text-center font-medium">
          Daily Token Number will be generated immediately upon confirmation.
        </div>
      </div>
    </div>
  );
}