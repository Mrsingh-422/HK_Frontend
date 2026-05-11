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
            // Fetch consumables based on service/package
            fetchConsumables(parsedData);
        } else {
            router.push("/nursingservice");
        }
        setLoading(false);
    }, [router]);

    const fetchConsumables = async (data) => {
        try {
            setConsumablesLoading(true);
            // Fetch nurse details to get consumables
            const response = await UserAPI.nurseServiceDetail(data.nurseId);
            
            if (response?.success) {
                let consumables = [];
                
                // If service is selected, get consumables from that service
                if (data.serviceId && response.data.services) {
                    const selectedService = response.data.services.find(
                        service => service._id === data.serviceId
                    );
                    if (selectedService?.consumablesUsed) {
                        consumables = selectedService.consumablesUsed;
                    }
                }
                // If package is selected, aggregate consumables from all services in package
                else if (data.packageId && response.data.packages) {
                    const selectedPackage = response.data.packages.find(
                        pkg => pkg._id === data.packageId
                    );
                    if (selectedPackage?.includedServices && response.data.services) {
                        // Find all services in the package and get their consumables
                        const packageServices = response.data.services.filter(
                            service => selectedPackage.includedServices.includes(service.title)
                        );
                        packageServices.forEach(service => {
                            if (service.consumablesUsed) {
                                consumables.push(...service.consumablesUsed);
                            }
                        });
                        // Remove duplicates if any
                        consumables = consumables.filter((item, index, self) =>
                            index === self.findIndex(i => i.masterItemId?._id === item.masterItemId?._id)
                        );
                    }
                }
                
                setAvailableConsumables(consumables);
            }
        } catch (error) {
            console.error("Error fetching consumables:", error);
        } finally {
            setConsumablesLoading(false);
        }
    };

    const handleToggleConsumable = (consumable) => {
        const consumableId = consumable.masterItemId?._id || consumable._id;
        const existingIndex = selectedConsumables.findIndex(
            item => (item.consumableId === consumableId)
        );
        
        if (existingIndex >= 0) {
            // Remove if already selected
            setSelectedConsumables(prev => prev.filter((_, idx) => idx !== existingIndex));
        } else {
            // Add new consumable
            setSelectedConsumables(prev => [
                ...prev,
                {
                    consumableId: consumableId,
                    itemName: consumable.masterItemId?.itemName || consumable.itemName,
                    price: consumable.finalPrice || consumable.price || 0,
                    unitType: consumable.masterItemId?.unitType || consumable.unitType || "Piece"
                }
            ]);
        }
    };

    const handleFinalBooking = async () => {
        if (!selectedAddress) {
            alert("Please select a visit address");
            return;
        }
        
        if (!slotInfo.startDate) {
            alert("Please select a date");
            return;
        }
        
        if (slotInfo.mode !== "For Multiple Days" && !slotInfo.startTime) {
            alert("Please select a time slot");
            return;
        }

        try {
            const basePrice = bookingData.basePrice || 0;
            const slotSurcharge = slotInfo.extraFee || 0;
            const consumableTotal = selectedConsumables.reduce((sum, item) => sum + (item.price || 0), 0);
            const taxAmount = (basePrice + slotSurcharge + consumableTotal) * 0.05;
            const finalTotal = basePrice + slotSurcharge + consumableTotal + taxAmount;

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
                    landmark: selectedAddress.landmark || "",
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    country: selectedAddress.country || "India",
                    pincode: selectedAddress.pincode,
                    addressType: selectedAddress.addressType || "Home"
                },

                priceBreakdown: {
                    baseServicePrice: basePrice,
                    slotSurcharge: slotSurcharge,
                    consumableTotal: consumableTotal,
                    fasterServiceCharge: 0,
                    taxAmount: Math.round(taxAmount),
                    totalPrice: Math.round(finalTotal)
                },

                basePrice: basePrice,
                totalPrice: Math.round(finalTotal),
                selectedConsumables: selectedConsumables,
                needConsumable: selectedConsumables.length > 0,
                status: "Pending"
            };

            console.log("Final Payload for Backend:", JSON.stringify(finalPayload, null, 2));

            const res = await UserAPI.createNurseBooking(finalPayload);
            
            if (res?.success) {
                sessionStorage.removeItem("pendingNurseBooking");
                alert("Done");
                // router.push(`/nursingservice/booking-success?id=${res.data.bookingId}`);
            } else {
                alert(res?.message || "Booking failed. Please try again.");
            }
        } catch (error) {
            console.error("Final Booking Error:", error);
            alert(error?.response?.data?.message || "Something went wrong while creating your booking.");
        }
    };

    if (loading || !bookingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
            </div>
        );
    }

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
                            selectedAddress={selectedAddress}
                            onSelect={(addr) => setSelectedAddress(addr)}
                        />

                        <SlotPicker
                            nurseId={bookingData.nurseId}
                            itemId={bookingData.serviceId || bookingData.packageId}
                            isPackage={!!bookingData.packageId}
                            onSlotSelect={(info) => setSlotInfo(info)}
                        />

                        {/* Consumables Section */}
                        {!consumablesLoading && availableConsumables.length > 0 && (
                            <ConsumablesPicker
                                items={availableConsumables}
                                selectedItems={selectedConsumables}
                                onToggle={handleToggleConsumable}
                            />
                        )}

                        {consumablesLoading && (
                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-16 bg-slate-200 rounded"></div>
                                    <div className="h-16 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        )}

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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AppointmentSchedulingContent />
        </Suspense>
    );
}