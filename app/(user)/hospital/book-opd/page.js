"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCheck } from "react-icons/fa";

import DoctorProfileHeader from "./components/DoctorProfileHeader";
import AppointmentScheduler from "./components/AppointmentScheduler";
import UserAPI from "@/app/services/UserAPI";

export default function BookOpdPage() {
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // 1. Load active doctor and hospital from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("activeOpdBooking");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setDoctor(parsed.doctor);
        setHospital(parsed.hospital);
      } catch (e) {
        console.error("Session load error", e);
      }
    }
  }, []);

  // 2. Fetch live doctor OPD slots from backend: GET /user/hospital/doctors/:doctorId/opd-slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor?._id || !hospital?._id) return;
      try {
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        const res = await UserAPI.getDoctorOpdSlots(doctor._id, hospital._id, selectedDate);
        if (res?.success) {
          setSlots(res.slots || []);
        }
      } catch (err) {
        console.error("Failed to load doctor slots:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor?._id, hospital?._id, selectedDate]);

  // 3. Save selected date & slot to session and navigate to Unified Checkout
  const handleProceedToCheckout = () => {
    if (!selectedSlot) {
      alert("Please select an available slot first.");
      return;
    }

    const opdBookingPayload = {
      hospitalId: hospital._id,
      hospital: hospital,
      doctorId: doctor._id,
      doctor: doctor,
      appointmentDate: selectedDate,
      selectedDate: selectedDate,
      appointmentTime: selectedSlot.time,
      selectedSlot: selectedSlot,
      timestamp: Date.now()
    };

    // Store in activeOpdBooking and route to the unified checkout page
    sessionStorage.setItem("activeOpdBooking", JSON.stringify(opdBookingPayload));
    router.push("/hospital/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            <FaArrowLeft /> Back
          </button>
          <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            OPD Slot Selection
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* Doctor Header */}
        <DoctorProfileHeader doctor={doctor} hospital={hospital} />

        {/* Slot Scheduler */}
        <div className="animate-fadeIn">
          <AppointmentScheduler
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            isLoadingSlots={isLoadingSlots}
          />

          <div className="flex justify-end mt-6">
            <button
              disabled={!selectedSlot}
              onClick={handleProceedToCheckout}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Continue to Checkout →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}