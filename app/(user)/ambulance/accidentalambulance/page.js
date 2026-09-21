"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
    MapPin, Camera, ShieldAlert, ChevronLeft, Navigation, Clock,
    Loader2, CheckCircle2, Phone, AlertTriangle, ShieldCheck,
    Flame, Radio, PhoneCall, AlertOctagon, X, User, Truck, ShieldX
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserAPI from '@/app/services/UserAPI';

function AccidentalAmbulanceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [coords, setCoords] = useState({ lat: 30.7046, lng: 76.7179 });

    // Nearby ambulances list (Preview display)
    const [ambulances, setAmbulances] = useState([]);
    const [loadingAmbulances, setLoadingAmbulances] = useState(true);

    // --- State Machine: 'FORM' | 'SEARCHING_RADAR' ---
    const [flowState, setFlowState] = useState('FORM');
    const [activeBooking, setActiveBooking] = useState(null);

    // --- 60-Second Countdown & Escalation States ---
    const [timeLeft, setTimeLeft] = useState(60);
    const [timeoutExpired, setTimeoutExpired] = useState(false);
    const [fallbackData, setFallbackData] = useState(null);
    const [isDriverAssigned, setIsDriverAssigned] = useState(false);

    const countdownRef = useRef(null);
    const pollingRef = useRef(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        countryCode: "+91",
        location: "Detecting emergency GPS coordinates...",
        description: "Road accident trauma, critical emergency assistance requested",
        policeRequired: true,
        fireRequired: false
    });

    // 1. Initial Load: GPS & Fleet Availability Check
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        setIsLoggedIn(!!token);

        const storedCoords = localStorage.getItem('userCoords');
        const userCoords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.7046, lng: 76.7179 };
        setCoords(userCoords);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}`)
            .then(res => res.json())
            .then(data => {
                setFormData(prev => ({
                    ...prev,
                    location: data.display_name || "Location Detected"
                }));
            })
            .catch(() => {});

        // Fetch ambulances for area preview
        UserAPI.getNearestAmbulances({
            lat: userCoords.lat,
            lng: userCoords.lng,
            serviceType: "Accident emergency"
        })
            .then(res => {
                if (res.success) setAmbulances(res.data || []);
            })
            .catch(() => {})
            .finally(() => setLoadingAmbulances(false));
    }, []);

    // =========================================================================
    // 🔄 1. LIVE STATUS POLLING (Every 3 seconds)
    // 🚨 STRICT RULE: DO NOT REDIRECT WHILE STATUS IS 'Searching'!
    // 🚀 REDIRECT ONLY WHEN STATUS BECOMES 'Confirmed'!
    // =========================================================================
    useEffect(() => {
        if (flowState !== 'SEARCHING_RADAR' || !activeBooking || isDriverAssigned || timeoutExpired) return;

        const bookingId = activeBooking._id || activeBooking.bookingId;

        pollingRef.current = setInterval(async () => {
            try {
                const res = await UserAPI.getAmbulanceLiveTrack(bookingId);
                const currentStatus = res.data?.status;

                // Driver accepted the emergency broadcast
                if (currentStatus === 'Confirmed' || currentStatus === 'Arrived' || currentStatus === 'En-Route') {
                    setIsDriverAssigned(true);
                    clearInterval(pollingRef.current);
                    if (countdownRef.current) clearInterval(countdownRef.current);

                    // 🚀 AUTO-REDIRECT TO LIVE TRACKING SCREEN
                    router.push(`/userscreens/ambulanceappointment`);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [flowState, activeBooking, isDriverAssigned, timeoutExpired, router]);

    // =========================================================================
    // ⏱️ 2. 60-SECOND REVERSE TIMER (00:59 -> 00:00)
    // =========================================================================
    useEffect(() => {
        if (flowState !== 'SEARCHING_RADAR' || isDriverAssigned || timeoutExpired) return;

        setTimeLeft(60);
        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    handleTimeout(); // 60s Over without driver acceptance -> Trigger Escalation
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [flowState, isDriverAssigned]);

    // =========================================================================
    // 📡 3. 60-SECOND TIMEOUT FALLBACK (POST /user/ambulance/sos/escalate/:id)
    // =========================================================================
    const handleTimeout = async () => {
        if (!activeBooking) return;
        const bookingId = activeBooking._id || activeBooking.bookingId;

        try {
            const res = await UserAPI.escalateSOSBooking(bookingId);
            
            // Race condition safety: Driver accepted at exact 00:00
            if (res.isAssigned === true || res.data?.isAssigned === true) {
                setIsDriverAssigned(true);
                router.push(`/userscreens/ambulanceappointment`);
            } else {
                setTimeoutExpired(true);
                setFallbackData(res);
            }
        } catch (err) {
            console.error("Timeout escalation error:", err);
            setTimeoutExpired(true);
            setFallbackData({
                message: "Nearby partner ambulances are currently busy. Please call the Government emergency helplines directly below.",
                emergencyHelplines: {
                    govtAmbulance: { number: "108", title: "Government Free Emergency Ambulance (108)" },
                    nationalEmergency: { number: "112", title: "All-in-One National Emergency (112)" },
                    policeHelpline: { number: "100", title: "Police Control Room (100)" }
                }
            });
        }
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setImageFile(file);
        }
    };

    // --- Trigger 1-Click SOS Dispatch ---
    const handleConfirmSOS = async () => {
        setIsSubmitting(true);
        try {
            // CASE 1: Guest 1-Click Booking
            if (!isLoggedIn) {
                if (!formData.name.trim() || !formData.phone.trim()) {
                    alert("Please provide your name and phone number for immediate driver contact.");
                    setIsSubmitting(false);
                    return;
                }

                const shortPayload = {
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    countryCode: formData.countryCode,
                    pickupAddress: formData.location,
                    pickupLat: coords.lat,
                    pickupLng: coords.lng,
                    emergencyDescription: formData.description || "Road accident trauma SOS",
                    policeRequired: formData.policeRequired,
                    fireRequired: formData.fireRequired
                };

                const res = await UserAPI.accidentalShortBook(shortPayload);

                if (res.success) {
                    if (res.token) {
                        localStorage.setItem('userToken', res.token);
                        setIsLoggedIn(true);
                    }
                    setActiveBooking(res.booking || { bookingId: res.bookingId, _id: res.booking?._id || res.bookingId });
                    setFlowState('SEARCHING_RADAR'); // ➔ OPENS RADAR SCREEN (DOES NOT REDIRECT YET)
                } else {
                    alert(res.message || "SOS dispatch failed.");
                }
                return;
            }

            // CASE 2: Logged-in User Universal SOS (Omit ambulanceId)
            const pickupLocationObj = {
                address: formData.location,
                lat: coords.lat,
                lng: coords.lng
            };

            const patientDetailsObj = {
                name: formData.name || "Accident Victim",
                condition: "Critical",
                emergencyDescription: formData.description || "Accident SOS broadcast"
            };

            const data = new FormData();
            data.append('serviceType', 'Accident emergency');
            data.append('triageLevel', 'Emergency');
            data.append('policeRequired', String(formData.policeRequired));
            data.append('fireRequired', String(formData.fireRequired));
            data.append('pickupLocation', JSON.stringify(pickupLocationObj));
            data.append('patientDetails', JSON.stringify(patientDetailsObj));

            if (imageFile) {
                data.append('incidentPhoto', imageFile);
            }

            const bookingRes = await UserAPI.bookAmbulance(data);

            if (bookingRes.success) {
                setActiveBooking(bookingRes.booking || null);
                setFlowState('SEARCHING_RADAR'); // ➔ OPENS RADAR SCREEN (DOES NOT REDIRECT YET)
            } else {
                alert(bookingRes.message || "Failed to dispatch SOS.");
            }

        } catch (error) {
            console.error("SOS Dispatch Error:", error);
            alert("Error placing emergency dispatch request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-6">
                        <button onClick={() => router.back()} className="hover:bg-slate-100 p-1.5 md:p-2 rounded-full transition-colors cursor-pointer">
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black tracking-tight text-red-600 flex items-center gap-2">
                                <ShieldAlert className="w-6 h-6 animate-pulse" /> Accident Emergency SOS
                            </h1>
                            <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                                100% Free Live SOS Broadcast
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full font-black text-xs">
                        ₹0 Always Free
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
                {/* ========================================================================= */}
                {/* VIEW 1: INITIAL DISPATCH FORM */}
                {/* ========================================================================= */}
                {flowState === 'FORM' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
                        {/* LEFT: Incident Form */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 space-y-5">
                                <h2 className="text-base md:text-lg font-black flex items-center gap-2 text-slate-900">
                                    <Navigation className="w-5 h-5 text-red-600" /> Incident Spot Location
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Accident Pickup Point
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 text-xs md:text-sm font-semibold transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {!isLoggedIn && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-red-700 uppercase tracking-wider">Your Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Rahul Verma"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white rounded-xl p-2.5 text-xs font-bold outline-none border border-red-300"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-red-700 uppercase tracking-wider">Phone Number *</label>
                                            <input
                                                type="tel"
                                                placeholder="10-digit mobile"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white rounded-xl p-2.5 text-xs font-bold outline-none border border-red-300"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Additional Department Alerts
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, policeRequired: !prev.policeRequired }))}
                                            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition-all ${formData.policeRequired ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                                        >
                                            <span className="flex items-center gap-1.5"><ShieldCheck size={16} /> 112 Police Control</span>
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${formData.policeRequired ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                                                {formData.policeRequired ? '✓' : ''}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, fireRequired: !prev.fireRequired }))}
                                            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition-all ${formData.fireRequired ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                                        >
                                            <span className="flex items-center gap-1.5"><Flame size={16} /> 101 Fire Brigade</span>
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${formData.fireRequired ? 'bg-orange-600 text-white' : 'bg-slate-200'}`}>
                                                {formData.fireRequired ? '✓' : ''}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Description</label>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl p-4 text-xs md:text-sm font-semibold outline-none resize-none"
                                        placeholder="Describe accident trauma (e.g. 2 vehicles collided, head injury)..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Accident Scene Photo (Optional)</label>
                                    <label className="cursor-pointer group block relative">
                                        <div className={`w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${previewImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                                            ) : (
                                                <><Camera className="w-5 h-5 text-slate-400 group-hover:text-red-500 mb-1" /><span className="text-[10px] font-bold text-slate-500">Capture Scene Photo</span></>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: SOS Trigger & Nearest Fleet Preview */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden shadow-2xl">
                                <div className="text-center space-y-3 py-4">
                                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                                        <div className="absolute inset-2 bg-red-500/30 rounded-full animate-pulse" />
                                        <div className="relative w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/50">
                                            <Radio className="w-7 h-7 animate-bounce" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight">1-Click SOS Broadcast</h3>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Broadcasts instantly to all active Advance Life Support & ICU ambulances. First driver to accept will navigate immediately.
                                    </p>
                                </div>

                                <div className="space-y-2.5 p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
                                    <div className="flex items-center justify-between text-slate-300">
                                        <span>Dispatch Cost</span>
                                        <span className="font-bold text-emerald-400">100% Free (₹0)</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-300">
                                        <span>Pickup Verification</span>
                                        <span className="font-bold text-white">Direct Boarding (No OTP Required)</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmSOS}
                                    disabled={isSubmitting}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-red-600/30 active:scale-95 cursor-pointer"
                                >
                                    {isSubmitting ? "Broadcasting Emergency SOS..." : "🚨 Dispatch 1-Click SOS Broadcast"}
                                </button>
                            </div>

                            {/* Informational Nearest Fleet List */}
                            <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Truck className="w-4 h-4 text-emerald-600" /> Active Responders in Area ({ambulances.length})
                                    </h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Live Fleet Radar
                                    </span>
                                </div>

                                {loadingAmbulances ? (
                                    <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Scanning nearby units...
                                    </div>
                                ) : ambulances.length === 0 ? (
                                    <p className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 font-medium">
                                        No active partner units detected. Government 108 helpline active.
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                        {ambulances.map((amb) => (
                                            <div key={amb._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{amb.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium">{amb.vehicleType} &bull; <span className="text-emerald-600 font-bold">{amb.distance || "Near you"}</span></p>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                                                    ETA: {amb.eta || "3-5 mins"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* VIEW 2: 60-SECOND RADAR SEARCHING SCREEN (STAYS ON THIS PAGE!) */}
                {/* ========================================================================= */}
                {flowState === 'SEARCHING_RADAR' && (
                    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute w-72 h-72 border-2 border-red-500 rounded-full animate-ping opacity-30 pointer-events-none" />
                            <div className="absolute w-56 h-56 border-2 border-red-500/50 rounded-full animate-pulse pointer-events-none" />
                            <div className="w-48 h-48 bg-red-600/20 border-2 border-red-500 rounded-full flex flex-col items-center justify-center shadow-2xl">
                                <Radio size={48} className="text-red-500 mb-2 animate-bounce" />
                                <span className="text-4xl font-black font-mono tracking-widest text-slate-900">
                                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Broadcasting to Nearest Ambulances...</h2>
                        <p className="text-slate-500 text-xs md:text-sm max-w-sm mb-4">
                            Alerting all active partner ambulance drivers within 5km radius of your accident spot.
                        </p>

                        <div className="inline-block bg-slate-900 text-red-400 text-xs px-4 py-2 rounded-full font-mono font-bold tracking-wider shadow-sm">
                            STATUS: SEARCHING • DO NOT CLOSE THIS PAGE
                        </div>
                    </div>
                )}
            </main>

            {/* ========================================================================= */}
            {/* 🔴 60-SECOND TIMEOUT MODAL (If no driver accepted within 60s) */}
            {/* ========================================================================= */}
            {timeoutExpired && fallbackData && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in zoom-in duration-200">
                    <div className="bg-slate-800 border-2 border-red-500 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-white space-y-6">
                        <div className="flex items-center gap-3 text-red-400">
                            <ShieldAlert size={32} />
                            <div>
                                <h3 className="text-xl font-black text-white">Drivers Currently Unavailable</h3>
                                <p className="text-xs text-slate-400">60-second emergency search limit reached</p>
                            </div>
                        </div>

                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                            {fallbackData.message || "Our partner ambulance drivers are currently occupied on urgent trauma runs. Please call the Government emergency helplines directly below:"}
                        </p>

                        <div className="space-y-3">
                            {/* GOVT 108 BUTTON */}
                            <a
                                href="tel:108"
                                className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl font-bold transition shadow-lg shadow-red-600/30 active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <Phone size={22} />
                                    <span className="text-sm">Call Govt 108 Ambulance</span>
                                </div>
                                <span className="bg-red-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">FREE</span>
                            </a>

                            {/* NATIONAL EMERGENCY 112 */}
                            <a
                                href="tel:112"
                                className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-2xl font-semibold text-sm transition active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <Phone size={20} />
                                    <span>Call Emergency Control (112)</span>
                                </div>
                                <span className="text-xs text-slate-400">Direct 112</span>
                            </a>

                            {/* POLICE 100 */}
                            <a
                                href="tel:100"
                                className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-2xl font-semibold text-sm transition active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <Phone size={20} />
                                    <span>Call Police Control Room (100)</span>
                                </div>
                                <span className="text-xs text-slate-400">Direct 100</span>
                            </a>
                        </div>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full mt-2 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AccidentalAmbulanceWeb() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-sans font-bold">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mr-2" />
                Loading Emergency Dispatcher...
            </div>
        }>
            <AccidentalAmbulanceContent />
        </Suspense>
    );
}