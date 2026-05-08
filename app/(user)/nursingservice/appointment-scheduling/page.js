"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import AddressSelector from "../othercomponents/AddressSelector";
import BookingSummary from "../othercomponents/BookingSummary";
import SlotPicker from "../othercomponents/SlotPicker";
import UserAPI from "@/app/services/UserAPI";

function AppointmentSchedulingContent() {
    const router = useRouter();

    // Data from previous screens
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Local states for this screen
    const [selectedAddress, setSelectedAddress] = useState(null); 
    const [slotInfo, setSlotInfo] = useState({
        mode: "One day One Time",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        extraFee: 0,
        displayTime: ""
    });

    useEffect(() => {
        const savedData = sessionStorage.getItem("pendingNurseBooking");
        if (savedData) {
            setBookingData(JSON.parse(savedData));
        } else {
            router.push("/nursingservice");
        }
        setLoading(false);
    }, [router]);

    const handleFinalBooking = async () => {
        if (!selectedAddress) return alert("Please select a visit address");
        
        // Validation based on mode
        if (!slotInfo.startDate) return alert("Please select a date");
        if (slotInfo.mode !== "For Multiple Days" && !slotInfo.startTime) {
            return alert("Please select a time slot");
        }

        try {
            // CALCULATE PRICE BREAKDOWN FOR SCHEMA
            const basePrice = bookingData.basePrice || 0;
            const slotSurcharge = slotInfo.extraFee || 0;
            const taxAmount = (basePrice + slotSurcharge) * 0.05; // 5% tax example
            const finalTotal = basePrice + slotSurcharge + taxAmount;

            // CONSTRUCT PAYLOAD EXACTLY AS PER MONGOOSE SCHEMA
            const finalPayload = {
                nurseId: bookingData.nurseId,
                serviceId: bookingData.serviceId, 
                packageId: bookingData.packageId,
                
                serviceDetails: bookingData.serviceDetails,
                patients: bookingData.patients,
                assessmentLocation: bookingData.assessmentLocation,
                healthDetails: bookingData.healthDetails,

                schedule: {
                    startDate: slotInfo.startDate, 
                    endDate: slotInfo.endDate || slotInfo.startDate,
                    startTime: slotInfo.startTime || "09:00", 
                    endTime: slotInfo.endTime || "18:00",     
                    duration: slotInfo.mode                   
                },

                address: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    houseNo: selectedAddress.houseNo,
                    sector: selectedAddress.sector,
                    landmark: selectedAddress.landmark,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    country: selectedAddress.country || "India",
                    pincode: selectedAddress.pincode,
                    addressType: selectedAddress.addressType || "Home"
                },

                priceBreakdown: {
                    baseServicePrice: basePrice,
                    slotSurcharge: slotSurcharge, // Extra fees from premium dates/slots
                    consumableTotal: 0,
                    fasterServiceCharge: 0,
                    taxAmount: taxAmount,
                    totalPrice: finalTotal
                },

                basePrice: basePrice,
                totalPrice: finalTotal,
                selectedConsumables: [],
                needConsumable: false,
                status: "Pending" 
            };

            console.log("Final Payload for Backend:", finalPayload);

            const res = await UserAPI.createNurseBooking(finalPayload);
            
            if (res?.success) {
                sessionStorage.removeItem("pendingNurseBooking"); 
                router.push(`/nursingservice/booking-success?id=${res.data.bookingId}`);
            } else {
                alert(res?.message || "Booking failed. Please try again.");
            }
        } catch (error) {
            console.error("Final Booking Error:", error);
            alert("Something went wrong while creating your booking.");
        }
    };

    if (loading || !bookingData) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFEFF] font-sans pb-20">
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
                    <div className="lg:col-span-8 space-y-10">
                        <AddressSelector
                            selectedAddressId={selectedAddress?._id}
                            onSelect={(addrObj) => setSelectedAddress(addrObj)} 
                        />

                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            itemId={bookingData.serviceId || bookingData.packageId}
                            isPackage={!!bookingData.packageId}
                            onSlotSelect={(info) => setSlotInfo(info)}
                        />

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

                    <div className="lg:col-span-4">
                        <BookingSummary
                            bookingData={bookingData}
                            slotInfo={slotInfo}
                            selectedAddressId={selectedAddress?._id}
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