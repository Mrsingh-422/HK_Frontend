"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import AddressSelector from "../othercomponents/AddressSelector";
import BookingSummary from "../othercomponents/BookingSummary";
import SlotPicker from "../othercomponents/SlotPicker";
import ConsumablesPicker from "../othercomponents/ConsumablesPicker";
import UserAPI from "@/app/services/UserAPI";

function AppointmentSchedulingContent() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedConsumables, setSelectedConsumables] = useState([]);
    const [availableConsumables, setAvailableConsumables] = useState([]);
    const [consumablesLoading, setConsumablesLoading] = useState(false);
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
            const parsedData = JSON.parse(savedData);
            setBookingData(parsedData);
            fetchConsumables(parsedData);
        } else {
            router.push("/nursingservice");
        }
        setLoading(false);
    }, [router]);

    const fetchConsumables = async (data) => {
        try {
            setConsumablesLoading(true);
            const response = await UserAPI.nurseServiceDetail(data.nurseId);
            if (response?.success) {
                let consumables = [];
                if (data.serviceId && response.data.services) {
                    const selectedService = response.data.services.find(s => s._id === data.serviceId);
                    if (selectedService?.consumablesUsed) consumables = selectedService.consumablesUsed;
                } else if (data.packageId && response.data.packages) {
                    const selectedPackage = response.data.packages.find(p => p._id === data.packageId);
                    if (selectedPackage?.includedServices && response.data.services) {
                        const packageServices = response.data.services.filter(s => selectedPackage.includedServices.includes(s.title));
                        packageServices.forEach(s => { if (s.consumablesUsed) consumables.push(...s.consumablesUsed); });
                        consumables = consumables.filter((item, index, self) => index === self.findIndex(i => i.masterItemId?._id === item.masterItemId?._id));
                    }
                }
                setAvailableConsumables(consumables);
            }
        } catch (error) { console.error(error); } finally { setConsumablesLoading(false); }
    };

    const handleToggleConsumable = (consumable) => {
        const consumableId = consumable.masterItemId?._id || consumable._id;
        const existingIndex = selectedConsumables.findIndex(item => (item.consumableId === consumableId));
        if (existingIndex >= 0) {
            setSelectedConsumables(prev => prev.filter((_, idx) => idx !== existingIndex));
        } else {
            setSelectedConsumables(prev => [...prev, {
                consumableId: consumableId,
                itemName: consumable.masterItemId?.itemName || consumable.itemName,
                price: consumable.finalPrice || consumable.price || 0,
                unitType: consumable.masterItemId?.unitType || consumable.unitType || "Piece"
            }]);
        }
    };

    const handleFinalBooking = async (summaryData) => {
        try {
            const { isExpress, expressCharge, appliedCoupon, discountAmount, finalTotal } = summaryData;

            // Matching the Mongoose Model exactly
            const finalPayload = {
                userId: bookingData.userId,
                nurseId: bookingData.nurseId,
                serviceId: bookingData.serviceId || null,
                packageId: bookingData.packageId || null,

                serviceDetails: {
                    title: bookingData.serviceDetails?.title || "",
                    type: bookingData.serviceDetails?.type || "",
                    duration: bookingData.serviceDetails?.duration || "",
                    basePrice: bookingData.basePrice,
                    procedureIncluded: bookingData.serviceDetails?.procedureIncluded || "",
                    servicesOffered: bookingData.serviceDetails?.servicesOffered || ""
                },

                patients: bookingData.patients.map(p => ({
                    patientId: p.patientId || p._id,
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    relation: p.relation
                })),

                assessmentLocation: bookingData.assessmentLocation,
                healthDetails: {
                    height: bookingData.healthDetails?.height || "",
                    dob: bookingData.healthDetails?.dob || null,
                    language: bookingData.healthDetails?.language || "",
                    specialInstructions: bookingData.healthDetails?.specialInstructions || ""
                },

                schedule: {
                    startDate: slotInfo.startDate,
                    endDate: slotInfo.endDate || slotInfo.startDate,
                    startTime: slotInfo.startTime,
                    endTime: slotInfo.endTime || slotInfo.startTime,
                    duration: slotInfo.mode // Matches Enum: 'One day One Time', 'For Multiple Days', 'Acc. To Per/Hours'
                },

                priceBreakdown: {
                    baseServicePrice: bookingData.basePrice,
                    slotSurcharge: slotInfo.extraFee,
                    consumableTotal: selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0),
                    couponDiscount: Math.round(discountAmount || 0),
                    fasterServiceCharge: expressCharge,
                    taxAmount: 0,
                    totalPrice: Math.round(finalTotal)
                },

                couponCode: appliedCoupon?.couponName || "",
                appliedCoupon: appliedCoupon ? {
                    couponId: appliedCoupon._id,
                    discountAmount: Math.round(discountAmount || 0),
                    couponName: appliedCoupon.couponName
                } : null,

                address: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    houseNo: selectedAddress.houseNo,
                    sector: selectedAddress.sector,
                    landmark: selectedAddress.landmark || "",
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    country: "India",
                    pincode: selectedAddress.pincode,
                    addressType: selectedAddress.addressType || "Home"
                },

                basePrice: bookingData.basePrice,
                totalPrice: Math.round(finalTotal),
                selectedConsumables: selectedConsumables,
                needConsumable: selectedConsumables.length > 0,
                status: "Pending"
            };

            const res = await UserAPI.nurseFinalBooking(finalPayload);
            if (res?.success) {
                sessionStorage.removeItem("pendingNurseBooking");
                alert("Booking Created Successfully!");
                router.push('/profile/bookings');
            } else {
                alert(res?.message || "Booking failed");
            }
        } catch (error) {
            console.error("Booking Error:", error);
            alert("Something went wrong");
        }
    };

    if (loading || !bookingData) return null;

    return (
        <div className="min-h-screen bg-[#FDFEFF] pb-20 font-sans">
            <div className="bg-white border-b py-6 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-900 p-2 hover:bg-slate-100 rounded-full"><FaArrowLeft /></button>
                    <h1 className="text-xl font-black">Schedule & Address</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-10">
                        <AddressSelector selectedAddress={selectedAddress} onSelect={setSelectedAddress} />
                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            itemId={bookingData.serviceId || bookingData.packageId}
                            isPackage={!!bookingData.packageId}
                            onSlotSelect={setSlotInfo}
                        />
                        {!consumablesLoading && availableConsumables.length > 0 && (
                            <ConsumablesPicker items={availableConsumables} selectedItems={selectedConsumables} onToggle={handleToggleConsumable} />
                        )}
                        <div className="bg-slate-50 border p-6 rounded-[2rem] flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-500 flex-shrink-0"><FaShieldAlt size={20} /></div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800">Trusted Healthcare</h4>
                                <p className="text-xs text-slate-500 mt-1">Our professionals strictly adhere to medical guidelines and hygiene standards.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <BookingSummary
                            bookingData={bookingData}
                            slotInfo={slotInfo}
                            selectedAddress={selectedAddress}
                            selectedConsumables={selectedConsumables}
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
        <Suspense fallback={<div>Loading...</div>}>
            <AppointmentSchedulingContent />
        </Suspense>
    );
}