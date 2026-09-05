"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FaFlask,
    FaPills,
    FaUserMd,
    FaUserNurse,
    FaAmbulance,
    FaHospital,
    FaPhoneAlt,
    FaTimes,
    FaMapMarkerAlt,
    FaShieldAlt,
    FaFire,
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import UserAPI from "@/app/services/UserAPI";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function HeroSection() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [current, setCurrent] = useState(0);
    const [heroData, setHeroData] = useState({ 
        title: "",
        subtitle: "",
        images: [],
    });

    const { getHomePageContent } = useGlobalContext();

    // --- 1-Click Accidental Short Booking States ---
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [submittingDispatch, setSubmittingDispatch] = useState(false);
    const [emergencyCoords, setEmergencyCoords] = useState({ lat: 30.7046, lng: 76.7179 });
    const [shortBookingForm, setShortBookingForm] = useState({
        name: "",
        phone: "",
        countryCode: "+91",
        pickupAddress: "Detecting emergency GPS location...",
        emergencyDescription: "Road accident trauma, critical emergency assistance requested",
        policeRequired: true,
        fireRequired: false
    });

    // Fetch Dynamic Content
    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                if (getHomePageContent) {
                    const response = await getHomePageContent();
                    if (response?.success && response?.data) {
                        const data = response.data;
                        setHeroData({
                            title: data.title || "",
                            subtitle: data.subtitle || "",
                            images: (data.images || []).map(
                                (img) => (img.startsWith("http") ? img : `${API_URL}${img}`)
                            ),
                        });
                        setCurrent(0);
                    }
                }
            } catch (error) {
                console.error("Error fetching hero content:", error);
            }
        };
        fetchHeroContent();
    }, [getHomePageContent]);

    // Auto Carousel Logic
    useEffect(() => {
        if (!heroData.images.length) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroData.images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroData.images]);

    // Detect GPS Coordinates on Modal Open
    const handleOpenEmergencyModal = () => {
        setIsEmergencyModalOpen(true);
        if (typeof window !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setEmergencyCoords(userCoords);
                    localStorage.setItem('userCoords', JSON.stringify(userCoords));

                    // Reverse geocode
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}`)
                        .then(res => res.json())
                        .then(data => {
                            setShortBookingForm(prev => ({
                                ...prev,
                                pickupAddress: data.display_name || "Location Detected"
                            }));
                        })
                        .catch(() => {
                            setShortBookingForm(prev => ({
                                ...prev,
                                pickupAddress: `GPS: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`
                            }));
                        });
                },
                () => {
                    setShortBookingForm(prev => ({ ...prev, pickupAddress: "Sector 62, Mohali, Punjab" }));
                },
                { enableHighAccuracy: true }
            );
        }
    };

    // --- Execute 1-Click Accidental Short Booking (Without OTP) ---
    const handleDirectEmergencyDispatch = async (e) => {
        e.preventDefault();

        if (!shortBookingForm.name.trim() || !shortBookingForm.phone.trim()) {
            alert("Please enter your name and phone number for the ambulance driver to call.");
            return;
        }

        setSubmittingDispatch(true);
        try {
            const payload = {
                name: shortBookingForm.name.trim(),
                phone: shortBookingForm.phone.trim(),
                countryCode: shortBookingForm.countryCode,
                pickupAddress: shortBookingForm.pickupAddress,
                pickupLat: emergencyCoords.lat,
                pickupLng: emergencyCoords.lng,
                emergencyDescription: shortBookingForm.emergencyDescription.trim(),
                policeRequired: shortBookingForm.policeRequired,
                fireRequired: shortBookingForm.fireRequired
            };

            const res = await UserAPI.accidentalShortBook(payload);

            if (res.success) {
                // 1. Save Session Token & Guest User Profile
                if (res.token) {
                    localStorage.setItem('userToken', res.token);
                }
                if (res.user) {
                    const guestUser = {
                        ...res.user,
                        isShortRegistered: true,
                        isPhoneVerified: false,
                    };
                    localStorage.setItem('user', JSON.stringify(guestUser));
                    if (setUser) setUser(guestUser);
                }

                setIsEmergencyModalOpen(false);
                
                // 2. Direct clean redirect to Live Tracking (NO auto-modal popup)
                router.push(`/userscreens/ambulanceappointment`);
            } else if (res.requirePhoneVerification) {
                alert(res.message || "Free emergency booking limit reached for unverified number. Please verify your phone in profile.");
            } else {
                alert(res.message || "Emergency dispatch failed.");
            }
        } catch (error) {
            console.error("Emergency Short Booking Error:", error);
            if (error?.response?.data?.requirePhoneVerification) {
                alert(error.response.data.message);
            } else {
                alert("Failed to connect with Emergency Response. Please call directly.");
            }
        } finally {
            setSubmittingDispatch(false);
        }
    };

    const cards = [
        { href: "/booklabtest", icon: FaFlask, label: "Book Lab Test", color: "text-orange-500" },
        { href: "/buymedicine", icon: FaPills, label: "Buy Medicines", color: "text-purple-600" },
        { href: "/drappointment", icon: FaUserMd, label: "Dr. Appointment", color: "text-blue-500" },
        { href: "/nursingservice", icon: FaUserNurse, label: "Nursing Service", color: "text-green-600" },
        { href: "/ambulance", icon: FaAmbulance, label: "Ambulance", color: "text-red-500" },
        { href: "/hospital", icon: FaHospital, label: "Hospital", color: "text-red-800" },
    ];

    return (
        <div className="relative w-full">
            {/* Background Carousel Container */}
            <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
                {heroData.images.length > 0 ? (
                    heroData.images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ease-in-out ${index === current
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-110"
                                }`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))
                ) : (
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600&auto=format&fit=crop&q=80')` }}
                    />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center px-[8%]">
                    <div className="max-w-4xl z-10">

                        {/* Emergency Badge (Desktop Trigger) */}
                        <div className="hidden md:flex items-center bg-white gap-5 px-6 py-3 rounded-full w-fit mb-8 shadow-[0_10px_30px_rgba(231,76,60,0.4)] border-2 border-red-500 animate-in fade-in slide-in-from-left duration-700">
                            <div className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-pulse shadow-[0_0_15px_rgba(231,76,60,0.8)]">
                                <FaAmbulance />
                            </div>
                            <div className="flex flex-col">
                                <span className="bg-green-600 text-white text-[10px] uppercase px-2 py-0.5 rounded font-black w-fit">100% Free Service</span>
                                <h4 className="text-slate-800 text-lg font-extrabold leading-tight">Accidental Emergency Ambulance</h4>
                                <p className="text-slate-500 text-xs font-semibold">1-Click Dispatch • No Login or OTP Required</p>
                            </div>
                            <button
                                onClick={handleOpenEmergencyModal}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md shadow-red-300 uppercase tracking-wider cursor-pointer"
                            >
                                Dispatch Now
                            </button>
                        </div>

                        {/* Hero Text */}
                        <h1 className="text-white text-4xl md:text-6xl font-bold leading-[1.1] mb-4 drop-shadow-lg">
                            {heroData.title || "Health Kangaroo"}
                        </h1>
                        <p className="text-gray-200 text-lg md:text-xl max-w-xl mb-8 drop-shadow-md">
                            {heroData.subtitle || "Order medicines, book tests, consultations and emergency transport"}
                        </p>

                        {/* Mobile Emergency Button */}
                        <button
                            onClick={handleOpenEmergencyModal}
                            className="md:hidden inline-flex items-center gap-3 bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-base shadow-2xl active:scale-95 transition-all animate-pulse cursor-pointer"
                        >
                            <FaPhoneAlt /> 1-Click Free Ambulance
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Action Cards */}
            <div className="hidden lg:flex absolute -bottom-10 left-0 right-0 justify-center gap-5 px-4 z-20">
                {cards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        className="bg-white w-44 h-32 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col justify-center px-6 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl group border border-gray-100"
                    >
                        <card.icon className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${card.color}`} />
                        <span className="text-slate-800 text-sm font-bold block leading-tight">
                            {card.label}
                        </span>
                    </Link>
                ))}
            </div>

            {/* --- 1-CLICK EMERGENCY DISPATCH MODAL --- */}
            {isEmergencyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 md:p-8 shadow-2xl border-2 border-red-500 space-y-6 relative max-h-[90vh] overflow-y-auto">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl animate-pulse">
                                    <FaAmbulance />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Instant SOS Dispatch</h3>
                                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Free Emergency Service • No OTP Required</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEmergencyModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleDirectEmergencyDispatch} className="space-y-4">
                            {/* GPS Location Field */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-red-500" /> Accident / Pickup Location
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={shortBookingForm.pickupAddress}
                                    onChange={(e) => setShortBookingForm({ ...shortBookingForm, pickupAddress: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold outline-none focus:border-red-500"
                                />
                            </div>

                            {/* Name & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caller / Victim Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your name"
                                        value={shortBookingForm.name}
                                        onChange={(e) => setShortBookingForm({ ...shortBookingForm, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold outline-none focus:border-red-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="10-digit mobile"
                                        value={shortBookingForm.phone}
                                        onChange={(e) => setShortBookingForm({ ...shortBookingForm, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            {/* Emergency Details */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Details</label>
                                <textarea
                                    rows="2"
                                    value={shortBookingForm.emergencyDescription}
                                    onChange={(e) => setShortBookingForm({ ...shortBookingForm, emergencyDescription: e.target.value })}
                                    placeholder="Brief description of injuries..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold outline-none resize-none focus:border-red-500"
                                />
                            </div>

                            {/* Department Checkboxes */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShortBookingForm(prev => ({ ...prev, policeRequired: !prev.policeRequired }))}
                                    className={`p-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition-all cursor-pointer ${shortBookingForm.policeRequired ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                                >
                                    <span className="flex items-center gap-1.5"><FaShieldAlt /> Police Control</span>
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${shortBookingForm.policeRequired ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                                        {shortBookingForm.policeRequired ? '✓' : ''}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShortBookingForm(prev => ({ ...prev, fireRequired: !prev.fireRequired }))}
                                    className={`p-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition-all cursor-pointer ${shortBookingForm.fireRequired ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                                >
                                    <span className="flex items-center gap-1.5"><FaFire /> Fire Control</span>
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${shortBookingForm.fireRequired ? 'bg-orange-600 text-white' : 'bg-slate-200'}`}>
                                        {shortBookingForm.fireRequired ? '✓' : ''}
                                    </span>
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submittingDispatch}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                <FaAmbulance className="text-lg animate-bounce" />
                                {submittingDispatch ? "Searching Nearest Unit..." : "Confirm Emergency Dispatch Now"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HeroSection;