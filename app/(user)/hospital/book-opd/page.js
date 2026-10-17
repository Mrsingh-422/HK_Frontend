"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCrown, FaCalendarTimes } from "react-icons/fa";

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

  // New Doctor Leave / Clinic Closed State
  const [isDoctorClosed, setIsDoctorClosed] = useState(false);
  const [closureReason, setClosureReason] = useState("");

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
      if (!doctor?._id && !doctor?.id) return;
      const docId = doctor._id || doctor.id;
      const hospId = hospital?._id || hospital?.id;

      try {
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        setIsDoctorClosed(false);
        setClosureReason("");

        const res = await UserAPI.getDoctorOpdSlots(docId, hospId, selectedDate);

        if (res?.success) {
          // Check if doctor is on approved leave or clinic closed
          if (res.isClosed) {
            setIsDoctorClosed(true);
            setClosureReason(
              res.reason ||
                `Doctor is unavailable on this date. Please select another date.`
            );
            setSlots([]);
          } else {
            setIsDoctorClosed(false);
            setClosureReason("");
            setSlots(Array.isArray(res.slots) ? res.slots : []);
          }

          // Merge live doctor metadata returned by backend
          if (res.doctor) {
            setDoctor((prev) => ({ ...prev, ...res.doctor }));
          }
        }
      } catch (err) {
        console.error("Failed to load doctor slots:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor?._id, doctor?.id, hospital?._id, hospital?.id, selectedDate]);

  // 3. Save selected date, slot & premium pricing to session and route to checkout
  const handleProceedToCheckout = () => {
    if (!selectedSlot) {
      alert("Please select an available slot first.");
      return;
    }

    const totalCalculatedFee =
      Number(selectedSlot.totalFee) ||
      Number(selectedSlot.totalSlotFee) ||
      Number(doctor?.baseOpdFee) ||
      Number(doctor?.opdFee) ||
      500;

    const opdBookingPayload = {
      hospitalId: hospital?._id || hospital?.id,
      hospital: hospital,
      doctorId: doctor?._id || doctor?.id,
      doctor: doctor,
      appointmentDate: selectedDate,
      selectedDate: selectedDate,
      appointmentTime: selectedSlot.time,
      time24: selectedSlot.time24,
      selectedSlot: selectedSlot,
      category: selectedSlot.category || "General",
      isPremium: Boolean(selectedSlot.isPremium),
      premiumFee: Number(selectedSlot.premiumFee) || 0,
      baseFee: Number(selectedSlot.baseFee) || Number(doctor?.baseOpdFee) || 0,
      totalSlotFee: totalCalculatedFee,
      timestamp: Date.now()
    };

    // Store in activeOpdBooking and route to the unified checkout page
    sessionStorage.setItem("activeOpdBooking", JSON.stringify(opdBookingPayload));
    router.push("/hospital/checkout");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
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
            isClosed={isDoctorClosed}
            closureReason={closureReason}
          />

          {/* Checkout Bar (Only active when slot is picked and doctor is not on leave) */}
          {!isDoctorClosed && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div>
                {selectedSlot ? (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Consultation Payable
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{selectedSlot.totalFee || selectedSlot.totalSlotFee}
                      </span>
                      {selectedSlot.isPremium && (
                        <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <FaCrown size={9} /> Premium Surcharge (₹{selectedSlot.premiumFee}) Included
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-400">
                    Select an available slot above to proceed to checkout.
                  </p>
                )}
              </div>

              <button
                disabled={!selectedSlot}
                onClick={handleProceedToCheckout}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Checkout</span>
                <span>&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}