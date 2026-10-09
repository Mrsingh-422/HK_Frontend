"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCheck, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";

import DoctorProfileHeader from "./components/DoctorProfileHeader";
import AppointmentScheduler from "./components/AppointmentScheduler";
import PatientDetailsReview from "./components/PatientDetailsReview";
import PaymentConfirmation from "./components/PaymentConfirmation";
import UserAPI from "@/app/services/UserAPI";

export default function BookOpdPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [patientData, setPatientData] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    relation: "Self",
    phone: "",
    reason: ""
  });

  const [couponCode, setCouponCode] = useState("");
  const [checkoutSummary, setCheckoutSummary] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' | 'ONLINE'
  const [bookingResult, setBookingResult] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

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
        if (res.success) {
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

  // 3. Calculate checkout summary: POST /user/hospital/opd/checkout-summary
  const fetchCheckoutSummary = async (appliedCoupon = couponCode) => {
    if (!doctor?._id || !hospital?._id || !selectedSlot) return;
    try {
      setIsApplyingCoupon(true);
      const res = await UserAPI.getOpdCheckoutSummary({
        hospitalId: hospital._id,
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.time,
        couponCode: appliedCoupon
      });
      if (res.success) {
        setCheckoutSummary(res.data);
      }
    } catch (err) {
      console.error("Checkout summary error:", err);
      alert(err.response?.data?.message || "Invalid or expired coupon code.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToDetails = () => {
    if (!selectedSlot) {
      alert("Please select an available slot first.");
      return;
    }
    fetchCheckoutSummary("");
    setCurrentStep(2);
  };

  // 4. Confirm booking: POST /user/hospital/opd/book
  const handleConfirmBooking = async () => {
    if (!patientData.fullName || !patientData.age || !patientData.phone) {
      alert("Please fill in patient name, age, and phone number.");
      return;
    }

    try {
      setIsBooking(true);
      const payload = {
        hospitalId: hospital._id,
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.time,
        patients: [
          {
            patientName: patientData.fullName,
            patientAge: Number(patientData.age),
            gender: patientData.gender,
            relation: patientData.relation || "Self"
          }
        ],
        bookingReason: patientData.reason || "General Consultation",
        paymentMethod: paymentMethod, // 'COD' or 'ONLINE'
        couponCode: couponCode || ""
      };

      const res = await UserAPI.bookOpdAppointment(payload);
      if (res.success) {
        setBookingResult(res);
        setCurrentStep(3);
      }
    } catch (err) {
      console.error("OPD Booking error:", err);
      alert(err.response?.data?.message || "Failed to confirm OPD booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => (currentStep > 1 && currentStep < 3 ? setCurrentStep(currentStep - 1) : router.back())}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider"
          >
            <FaArrowLeft /> Back
          </button>
          <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            OPD Token Flow
          </span>
        </div>
      </nav>

      {/* Stepper Progress */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
            style={{ width: currentStep === 1 ? "15%" : currentStep === 2 ? "60%" : "100%" }}
          ></div>

          {[
            { step: 1, label: "Slot & Schedule" },
            { step: 2, label: "Patient & Review" },
            { step: 3, label: "Token & Slip" }
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center bg-slate-50 px-3 z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  currentStep >= s.step ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > s.step ? <FaCheck /> : s.step}
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1.5 hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-6">
        {/* Step 4: Doctor Header */}
        <DoctorProfileHeader doctor={doctor} hospital={hospital} />

        {/* Step 5: Live Slots Selection */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <AppointmentScheduler
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              isLoadingSlots={isLoadingSlots}
            />

            <div className="flex justify-end">
              <button
                disabled={!selectedSlot}
                onClick={handleProceedToDetails}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                Continue to Patient Info →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Patient Review & Payment Mode */}
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <PatientDetailsReview
              patientData={patientData}
              onChangePatientData={setPatientData}
              doctor={doctor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              checkoutSummary={checkoutSummary}
              onApplyCoupon={() => fetchCheckoutSummary(couponCode)}
              isApplyingCoupon={isApplyingCoupon}
            />

            {/* Payment Mode Selector */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
              <h3 className="text-lg font-black text-slate-900 mb-4">Choose Payment Mode</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === "COD"
                      ? "border-emerald-600 bg-emerald-50/50 text-slate-900"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  <FaMoneyBillWave className="text-emerald-600 text-lg" />
                  <div>
                    <p className="font-bold text-xs">Pay at Hospital Desk (COD)</p>
                    <p className="text-[10px] text-slate-400">Pay cash or card when showing your Token</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === "ONLINE"
                      ? "border-emerald-600 bg-emerald-50/50 text-slate-900"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  <FaCreditCard className="text-emerald-600 text-lg" />
                  <div>
                    <p className="font-bold text-xs">Pay Online (UPI / Card)</p>
                    <p className="text-[10px] text-slate-400">Directly enter the doctor cabin queue</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-slate-500 hover:text-slate-900 font-bold text-xs uppercase"
              >
                ← Back to Slots
              </button>

              <button
                disabled={isBooking}
                onClick={handleConfirmBooking}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                {isBooking ? "Reserving Token..." : "Confirm & Issue OPD Token"}
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Confirmation, Token Slip & Live Counter */}
        {currentStep === 3 && (
          <PaymentConfirmation
            bookingResult={bookingResult}
            doctor={doctor}
            hospital={hospital}
            patientData={patientData}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onReset={() => {
              setCurrentStep(1);
              setSelectedSlot(null);
            }}
          />
        )}
      </main>
    </div>
  );
}