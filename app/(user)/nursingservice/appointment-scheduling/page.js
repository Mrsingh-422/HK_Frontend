"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import AddressSelector from "../othercomponents/AddressSelector";
import BookingSummary from "../othercomponents/BookingSummary";
import SlotPicker from "../othercomponents/SlotPicker";



function AppointmentSchedulingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Data passed from previous page
    const bookingData = {
        nurseId: searchParams.get("nurseId"),
        nurseName: searchParams.get("nurseName"),
        nurseImage: searchParams.get("nurseImage"),
        serviceId: searchParams.get("serviceId"),
        serviceTitle: searchParams.get("serviceTitle"),
        basePrice: parseFloat(searchParams.get("servicePrice") || 0),
        familyMemberId: searchParams.get("familyMemberId"),
        location: searchParams.get("location"),
        patientName: searchParams.get("patientName"),
        patientAge: searchParams.get("patientAge"),
        patientGender: searchParams.get("patientGender"),
        patientRelation: searchParams.get("patientRelation"),
        triage: searchParams.get("triage"),
        weight: searchParams.get("weight"),
        dob: searchParams.get("dob"),
        language: searchParams.get("language"),
        instructions: searchParams.get("instructions"),
    };

    // Shared States
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [slotInfo, setSlotInfo] = useState({
        date: "",
        slotTime: "",
        displayTime: "",
        extraFee: 0
    });

    const handleFinalBooking = () => {
        if (!selectedAddressId) return alert("Please select a visit address");
        // if (!slotInfo.slotTime) return alert("Please select a time slot");

        const finalPayload = {
            ...bookingData,
            addressId: selectedAddressId,
            ...slotInfo,
            totalAmount: bookingData.basePrice + slotInfo.extraFee
        };

        console.log("Final Booking Payload:", finalPayload);
        alert("Proceeding to secure payment gateway...");
    };

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 py-6 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-all">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-black text-slate-900">Schedule & Address</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-10">

                        <AddressSelector
                            selectedAddressId={selectedAddressId}
                            onSelect={setSelectedAddressId}
                        />

                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            onSlotSelect={setSlotInfo}
                        />

                        {/* Safety Banner */}
                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-500 flex-shrink-0">
                                <FaShieldAlt size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800">Trusted Healthcare</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    Our professionals strictly adhere to medical guidelines and hygiene standards for home visits.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4">
                        <BookingSummary
                            bookingData={bookingData}
                            slotInfo={slotInfo}
                            selectedAddressId={selectedAddressId}
                            onProceed={handleFinalBooking}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AppointmentSchedulingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AppointmentSchedulingContent />
        </Suspense>
    );
}