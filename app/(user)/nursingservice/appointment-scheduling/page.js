"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaShieldAlt, FaGem } from "react-icons/fa";
import AddressSelector from "../othercomponents/AddressSelector";
import BookingSummary from "../othercomponents/BookingSummary";
import SlotPicker from "../othercomponents/SlotPicker";
import ConsumablesPicker from "../othercomponents/ConsumablesPicker";
import UserAPI from "@/app/services/UserAPI";

// Utility to dynamically load the Razorpay SDK script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function AppointmentSchedulingContent() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedConsumables, setSelectedConsumables] = useState([]);
    const [availableConsumables, setAvailableConsumables] = useState([]);
    const [consumablesLoading, setConsumablesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- SUBSCRIPTION STATE ---
    const [subscription, setSubscription] = useState(null);

    const [slotInfo, setSlotInfo] = useState({
        mode: "One day One Time",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        extraFee: 0,
        basePrice: 0,
        displayTime: ""
    });

    useEffect(() => {
        const initData = async () => {
            const savedData = sessionStorage.getItem("pendingNurseBooking");
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setBookingData(parsedData);
                
                // Parallel fetch for consumables and subscription status
                const [detailsRes, subRes] = await Promise.all([
                    UserAPI.nurseServiceDetail(parsedData.nurseId),
                    UserAPI.getMySubscriptionStatus()
                ]);

                // Handle Consumables
                if (detailsRes?.success) {
                    let consumables = [];
                    if (parsedData.serviceId && detailsRes.data.services) {
                        const selectedService = detailsRes.data.services.find(s => s._id === parsedData.serviceId);
                        if (selectedService?.consumablesUsed) consumables = selectedService.consumablesUsed;
                    } else if (parsedData.packageId && detailsRes.data.packages) {
                        const selectedPackage = detailsRes.data.packages.find(p => p._id === parsedData.packageId);
                        if (selectedPackage?.includedServices && detailsRes.data.services) {
                            const packageServices = detailsRes.data.services.filter(s => selectedPackage.includedServices.includes(s.title));
                            packageServices.forEach(s => { if (s.consumablesUsed) consumables.push(...s.consumablesUsed); });
                            consumables = consumables.filter((item, index, self) => index === self.findIndex(i => i.masterItemId?._id === item.masterItemId?._id));
                        }
                    }
                    setAvailableConsumables(consumables);
                }

                // Handle Subscription
                if (subRes?.success && subRes?.hasActivePlan) {
                    setSubscription(subRes.data);
                }

            } else {
                router.push("/nursingservice");
            }
            setLoading(false);
        };

        initData();
    }, [router]);

    // Pricing Logic for UI and Payload
    const pricingLogic = useMemo(() => {
        const hasPlan = subscription !== null;
        const dynamicBasePrice = slotInfo.basePrice || (bookingData?.basePrice || 0);
        
        return {
            isSubscriptionApplied: hasPlan,
            baseServicePrice: hasPlan ? 0 : dynamicBasePrice,
            originalBasePrice: dynamicBasePrice,
            planName: subscription?.planId?.name || "",
            subscriptionId: subscription?._id || null
        };
    }, [subscription, slotInfo, bookingData]);

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
            setIsSubmitting(true);

            const { isExpress, expressCharge, appliedCoupon, discountAmount, finalTotal } = summaryData;

            const finalPayload = {
                userId: bookingData.userId,
                nurseId: bookingData.nurseId,
                serviceId: bookingData.serviceId || null,
                packageId: bookingData.packageId || null,

                serviceDetails: {
                    title: bookingData.serviceDetails?.title || "",
                    type: bookingData.serviceDetails?.type || "",
                    duration: bookingData.serviceDetails?.duration || "",
                    basePrice: pricingLogic.originalBasePrice,
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
                    duration: slotInfo.mode
                },

                // --- UPDATED PRICE BREAKDOWN WITH AUDIT TRACKER ---
                priceBreakdown: {
                    baseServicePrice: pricingLogic.baseServicePrice, // 0 if sub active
                    originalBasePrice: pricingLogic.originalBasePrice, // Actual cost
                    slotSurcharge: slotInfo.extraFee,
                    consumableTotal: selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0),
                    couponDiscount: Math.round(discountAmount || 0),
                    fasterServiceCharge: expressCharge,
                    taxAmount: 0,
                    totalPrice: Math.round(finalTotal)
                },

                // --- NEW SUBSCRIPTION DETAILS KEY ---
                subscriptionDetails: {
                    isSubscriptionApplied: pricingLogic.isSubscriptionApplied,
                    userSubscriptionId: pricingLogic.subscriptionId,
                    planName: pricingLogic.planName
                },

                couponCode: appliedCoupon?.couponName || "",
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

                totalPrice: Math.round(finalTotal),
                selectedConsumables: selectedConsumables,
                needConsumable: selectedConsumables.length > 0,
            };

            const processRes = await UserAPI.processBooking(finalPayload);
            
            if (processRes?.success) {
                // --- SKIP RAZORPAY IF TOTAL IS 0 ---
                if (processRes.totalAmount === 0 || Math.round(finalTotal) === 0) {
                    sessionStorage.removeItem("pendingNurseBooking");
                    alert(processRes.message || "Booking confirmed using subscription benefit!");
                    router.push('/userscreens/previousorders');
                    return;
                }

                // Load Razorpay script for paid bookings
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    alert("Failed to load Razorpay SDK.");
                    setIsSubmitting(false);
                    return;
                }

                const { key_id, amount, razorpayOrderId, appointmentId } = processRes;

                const options = {
                    key: key_id,
                    amount: amount,
                    currency: "INR",
                    name: "HK Healthcare App",
                    description: "Nurse Consultation Fee",
                    order_id: razorpayOrderId,
                    prefill: {
                        name: bookingData.patients?.[0]?.name || "Patient Name",
                        contact: selectedAddress?.phone || ""
                    },
                    theme: { color: "#10b981" },
                    modal: { ondismiss: () => setIsSubmitting(false) },
                    handler: async function (response) {
                        try {
                            setIsSubmitting(true);
                            const verificationRes = await UserAPI.verifyPaymentNurse({
                                appointmentId: appointmentId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            });

                            if (verificationRes?.success) {
                                sessionStorage.removeItem("pendingNurseBooking");
                                alert("Booking Confirmed!");
                                router.push('/userscreens/previousorders');
                            } else {
                                alert("Verification failed.");
                            }
                        } catch (e) {
                            alert("Something went wrong during verification.");
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                };

                const rzpInstance = new window.Razorpay(options);
                rzpInstance.open();

            } else {
                alert(processRes?.message || "Booking failed");
                setIsSubmitting(false);
            }
        } catch (error) {
            alert("Something went wrong");
            setIsSubmitting(false);
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
                        
                        {/* --- SUBSCRIPTION BADGE --- */}
                        {pricingLogic.isSubscriptionApplied && (
                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 flex-shrink-0">
                                    <FaGem size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-emerald-800">Subscription Benefit Applied</h4>
                                    <p className="text-xs text-emerald-600 mt-1">
                                        Your <strong>{pricingLogic.planName}</strong> covers the base service price for this booking.
                                    </p>
                                </div>
                            </div>
                        )}

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
                            isSubmitting={isSubmitting}
                            // Pass subscription info to summary if needed for display
                            subscriptionInfo={pricingLogic} 
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