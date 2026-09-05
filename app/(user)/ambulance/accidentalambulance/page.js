"use client";
import React, { useState, useEffect, Suspense } from 'react';
import {
    MapPin, ChevronDown, Camera, ShieldAlert,
    Info, ChevronLeft, Navigation, Clock, User, Loader2, CheckCircle2, KeyRound, Phone, Hospital, AlertTriangle, ShieldCheck, Flame
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserAPI from '@/app/services/UserAPI';

function AccidentalAmbulanceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const serviceTypeFromUrl = searchParams.get('serviceType') || "Accident emergency";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [ambulances, setAmbulances] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [emergencyNumbers, setEmergencyNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState("");

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [coords, setCoords] = useState({ lat: 30.6, lng: 76.7 });
    
    // Booking confirmation & Verification States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [bookingSuccessData, setBookingSuccessData] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        countryCode: "+91",
        location: "Detecting emergency GPS location...",
        relation: "Self",
        hospitalId: "",
        description: "",
        serviceType: serviceTypeFromUrl,
        policeRequired: true,
        fireRequired: false,
        paymentMethod: "COD"
    });

    // Check login & initialize data
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        setIsLoggedIn(!!token);

        const fetchData = async () => {
            setLoading(true);
            const storedCoords = localStorage.getItem('userCoords');
            const userCoords = storedCoords ? JSON.parse(storedCoords) : { lat: 30.7046, lng: 76.7179 };
            setCoords(userCoords);

            try {
                // Reverse geocode
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}`)
                    .then(res => res.json())
                    .then(data => {
                        setFormData(prev => ({
                            ...prev,
                            location: data.display_name || "Location Detected"
                        }));
                    })
                    .catch(err => console.error("Address lookup failed", err));

                const [hospRes, numRes, familyRes, ambRes] = await Promise.allSettled([
                    UserAPI.getNearbyHospitals ? UserAPI.getNearbyHospitals(userCoords) : UserAPI.getHospitalsList(userCoords),
                    token && UserAPI.getMyEmergencyNumbers ? UserAPI.getMyEmergencyNumbers() : Promise.resolve({ success: false }),
                    token ? UserAPI.getFamilyMembers() : Promise.resolve({ success: false }),
                    UserAPI.getNearestAmbulances({
                        lat: userCoords.lat,
                        lng: userCoords.lng,
                        serviceType: serviceTypeFromUrl
                    })
                ]);

                if (hospRes.status === "fulfilled" && hospRes.value?.success && hospRes.value.data) {
                    setHospitals(hospRes.value.data);
                    if (hospRes.value.data.length > 0) {
                        setFormData(prev => ({ ...prev, hospitalId: hospRes.value.data[0]._id }));
                    }
                }

                if (numRes.status === "fulfilled" && numRes.value?.success && numRes.value.numbers) {
                    setEmergencyNumbers(numRes.value.numbers);
                    if (numRes.value.numbers.length > 0) {
                        setSelectedNumber(numRes.value.numbers[0]);
                    }
                }

                if (familyRes.status === "fulfilled" && familyRes.value?.success && familyRes.value.data) {
                    setFamilyMembers(familyRes.value.data);
                }

                if (ambRes.status === "fulfilled" && ambRes.value?.success && ambRes.value.data) {
                    setAmbulances(ambRes.value.data);
                    if (ambRes.value.data.length > 0) {
                        setSelectedAmbulance(ambRes.value.data[0]._id);
                    }
                }

            } catch (e) {
                console.error("Data fetching error:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [serviceTypeFromUrl]);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setImageFile(file);
        }
    };

    const activeAmbulance = ambulances.find(a => a._id === selectedAmbulance);

    // --- Confirm & Dispatch Emergency Action ---
    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            // CASE 1: Unregistered / Guest User (1-Click Short Booking API)
            if (!isLoggedIn) {
                if (!formData.name.trim() || !formData.phone.trim()) {
                    alert("Please provide your name and phone number for immediate driver contact.");
                    setIsSubmitting(false);
                    return;
                }

                const shortBookingPayload = {
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    countryCode: formData.countryCode,
                    pickupAddress: formData.location,
                    pickupLat: coords.lat,
                    pickupLng: coords.lng,
                    emergencyDescription: formData.description.trim() || "Road accident trauma, critical assistance requested",
                    policeRequired: formData.policeRequired,
                    fireRequired: formData.fireRequired
                };

                const res = await UserAPI.accidentalShortBook(shortBookingPayload);

                if (res.success) {
                    // Save JWT Token generated for guest user
                    if (res.token) {
                        localStorage.setItem('userToken', res.token);
                        setIsLoggedIn(true);
                    }
                    setBookingSuccessData(res.booking || { bookingId: res.bookingId, isFreeCase: true });
                    setShowSuccessModal(true);
                } else if (res.requirePhoneVerification) {
                    // Handle 403 1-Time Booking limit restriction
                    setVerificationMessage(res.message || "Free emergency booking limit reached for this number. Please verify via OTP to proceed.");
                    setShowVerificationModal(true);
                } else {
                    alert(res.message || "Dispatch request failed.");
                }
                return;
            }

            // CASE 2: Logged-in User Standard Dispatch
            if (!activeAmbulance) {
                alert("Please select an available dispatch unit.");
                setIsSubmitting(false);
                return;
            }

            const selectedMemberData = familyMembers.find(
                member => `${member.memberName} (${member.relation})` === formData.relation
            );

            const pickupLocationObj = {
                address: formData.location,
                lat: coords.lat,
                lng: coords.lng
            };

            const patientDetailsObj = {
                name: selectedMemberData ? selectedMemberData.memberName : (formData.relation === "Self" ? "Self" : "Victim"),
                relation: formData.relation,
                contactPhone: selectedNumber || formData.phone,
                age: selectedMemberData?.age || 30,
                gender: selectedMemberData?.gender || "Male",
                emergencyDescription: formData.description || "Accident emergency response needed immediately",
                condition: "Critical"
            };

            const data = new FormData();
            data.append('ambulanceId', activeAmbulance._id);
            data.append('hospitalId', formData.hospitalId || "699d881dfabe095ff8304f52");
            data.append('serviceType', "Accident emergency");
            data.append('triageLevel', "Emergency");
            data.append('paymentMethod', "COD");
            data.append('incidentDescription', formData.description || "Accidental emergency dispatch");
            data.append('policeRequired', String(formData.policeRequired));
            data.append('fireRequired', String(formData.fireRequired));

            data.append('pickupLocation', JSON.stringify(pickupLocationObj));
            data.append('patientDetails', JSON.stringify(patientDetailsObj));

            if (imageFile) {
                data.append('incidentPhoto', imageFile);
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const bookingRes = await UserAPI.bookAmbulance(data, config);

            if (bookingRes.success) {
                setBookingSuccessData(bookingRes.booking || null);
                setShowSuccessModal(true);
            } else if (bookingRes.requirePhoneVerification) {
                setVerificationMessage(bookingRes.message || "Please verify your mobile number via OTP in your profile.");
                setShowVerificationModal(true);
            } else {
                alert(bookingRes.message || "Failed to book ambulance");
            }

        } catch (error) {
            console.error("Booking Error:", error);
            if (error?.response?.data?.requirePhoneVerification) {
                setVerificationMessage(error.response.data.message);
                setShowVerificationModal(true);
            } else {
                alert("Error placing emergency dispatch request.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-6">
                        <button onClick={() => router.back()} className="hover:bg-slate-100 p-1.5 md:p-2 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black tracking-tight line-clamp-1">{serviceTypeFromUrl}</h1>
                            <p className="text-[9px] md:text-xs font-bold text-red-500 uppercase tracking-widest">Emergency Priority Mode</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] md:text-sm border border-red-100 animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>CRITICAL SOS</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">

                    {/* LEFT COLUMN: FORM */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100">
                            <h2 className="text-base md:text-lg font-black mb-4 md:mb-6 flex items-center gap-2 text-slate-900">
                                <Navigation className="w-4 h-4 md:w-5 md:h-5 text-red-600" /> Incident Location & Contact
                            </h2>

                            <div className="space-y-4 md:space-y-5">
                                {/* Pickup Location */}
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Accident Spot Location
                                    </label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm font-semibold transition-all outline-none"
                                            placeholder="Detecting location..."
                                        />
                                    </div>
                                </div>

                                {/* Guest User Info (If not logged in) */}
                                {!isLoggedIn && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-red-600 uppercase tracking-wider">Your Name *</label>
                                            <input
                                                type="text"
                                                placeholder="Enter full name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white rounded-xl p-2.5 text-xs font-bold outline-none border border-red-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-red-600 uppercase tracking-wider">Phone Number *</label>
                                            <input
                                                type="tel"
                                                placeholder="10-digit mobile"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white rounded-xl p-2.5 text-xs font-bold outline-none border border-red-200"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Emergency Contact Selector (For Logged in Users) */}
                                {isLoggedIn && emergencyNumbers.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            Driver Contact Call Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                            <select
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-10 text-xs md:text-sm font-bold appearance-none cursor-pointer outline-none"
                                                value={selectedNumber}
                                                onChange={(e) => setSelectedNumber(e.target.value)}
                                            >
                                                {emergencyNumbers.map((num, i) => (
                                                    <option key={i} value={num}>
                                                        {num} {i === 0 ? "(My Registered Phone)" : `(Emergency Contact ${i})`}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {/* Emergency Services Toggles (Police & Fire) */}
                                <div className="space-y-2 pt-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Additional Emergency Departments
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, policeRequired: !prev.policeRequired }))}
                                            className={`p-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition-all ${formData.policeRequired ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                                        >
                                            <span className="flex items-center gap-1.5"><ShieldCheck size={16} /> Police Control</span>
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${formData.policeRequired ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                                                {formData.policeRequired ? '✓' : ''}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, fireRequired: !prev.fireRequired }))}
                                            className={`p-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition-all ${formData.fireRequired ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                                        >
                                            <span className="flex items-center gap-1.5"><Flame size={16} /> Fire Dept</span>
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${formData.fireRequired ? 'bg-orange-600 text-white' : 'bg-slate-200'}`}>
                                                {formData.fireRequired ? '✓' : ''}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Destination Hospital */}
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Destination Trauma Center
                                    </label>
                                    <div className="relative">
                                        <Hospital className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                        <select
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-10 text-xs md:text-sm font-bold appearance-none cursor-pointer outline-none"
                                            value={formData.hospitalId}
                                            onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                                        >
                                            {hospitals.map((h) => (
                                                <option key={h._id} value={h._id}>
                                                    {h.name} {h.distance ? `(${h.distance} away)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Emergency Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Situation</label>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl p-4 text-xs md:text-sm font-semibold outline-none resize-none"
                                        placeholder="Describe injuries (e.g. Head trauma, unconscious, oxygen required)..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Accident Spot Photo (Optional)</label>
                                    <label className="cursor-pointer group block relative">
                                        <div className={`w-full h-24 md:h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${previewImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                                            ) : (
                                                <><Camera className="w-5 h-5 text-slate-400 group-hover:text-red-500 mb-1" /><span className="text-[10px] font-bold text-slate-500">Capture / Upload Photo</span></>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DISPATCH UNITS */}
                    <div className="lg:col-span-7 space-y-6 md:space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Nearest Available Units</h2>
                                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {ambulances.length} Responders
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-red-600 animate-spin mb-4" />
                                        <p className="font-bold text-slate-500 text-xs md:text-sm">Locating nearest response units...</p>
                                    </div>
                                ) : (
                                    ambulances.map((ambulance) => (
                                        <div
                                            key={ambulance._id}
                                            onClick={() => setSelectedAmbulance(ambulance._id)}
                                            className={`group flex flex-col sm:flex-row items-center gap-4 md:gap-6 bg-white rounded-3xl md:rounded-[2rem] p-4 border-2 transition-all cursor-pointer ${selectedAmbulance === ambulance._id ? 'border-[#08B36A] ring-4 ring-green-50' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'}`}
                                        >
                                            <div className="relative w-full sm:w-44 h-32 flex-shrink-0 rounded-2xl md:rounded-[1.2rem] overflow-hidden bg-slate-100">
                                                <img
                                                    src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=600"
                                                    alt={ambulance.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                                />
                                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                    <Clock className="w-3 h-3 text-orange-500" />
                                                    <span className="text-[10px] font-black">{ambulance.eta || "3-5 mins"}</span>
                                                </div>
                                            </div>

                                            <div className="flex-grow w-full text-center sm:text-left">
                                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                                    <h3 className="text-lg md:text-xl font-black truncate max-w-[200px] md:max-w-[250px]">{ambulance.name}</h3>
                                                    <span className="text-[8px] md:text-[10px] bg-red-50 px-2 py-0.5 rounded-full font-bold text-red-600 uppercase tracking-tighter">
                                                        {ambulance.vehicleType}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5 text-blue-500" />
                                                        {ambulance.driverInfo?.fullName || "Verified Crew"}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                                                        {ambulance.distance}
                                                    </div>
                                                </div>
                                                <p className="hidden sm:block text-[10px] text-slate-400 mt-2 line-clamp-1">{ambulance.address}</p>
                                            </div>

                                            <div className="text-center sm:text-right sm:pr-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 flex sm:flex-col items-center justify-between sm:justify-center">
                                                <p className="text-xl md:text-2xl font-black text-slate-900">
                                                    {ambulance.isFreeCase ? "FREE" : `₹${ambulance.displayPrice || ambulance.pricing?.fixedPrice || 0}`}
                                                </p>
                                                <div className={`sm:mt-2 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${selectedAmbulance === ambulance._id ? 'bg-[#08B36A] text-white shadow-lg shadow-green-200' : 'bg-slate-50 text-slate-300'}`}>
                                                    <Navigation className="w-4 h-4 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Dispatch Bar */}
                        <div className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 relative z-10 w-full md:w-auto text-center sm:text-left">
                                <div className="w-full">
                                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Service</p>
                                    <h4 className="text-xl md:text-2xl font-black">{activeAmbulance ? activeAmbulance.name : "1-Tap Quick Dispatch"}</h4>
                                    <p className="text-emerald-400 font-bold text-xs md:text-sm">
                                        Free Emergency Accident Support (No OTP on Pickup)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={isSubmitting}
                                className="w-full md:w-auto bg-[#08B36A] hover:bg-[#079f5e] disabled:bg-slate-700 text-white px-8 md:px-14 py-4 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 relative z-10 shrink-0"
                            >
                                {isSubmitting ? "Dispatching..." : "Confirm & Dispatch"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* 1. Booking Success Modal (No OTP for accidental) */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
                        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#08B36A]">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900">Ambulance Dispatched!</h3>
                            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                Emergency dispatch request sent. Driver will arrive directly on spot without requiring pickup OTP.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                router.push(`/userscreens/ambulanceappointment`);
                            }}
                            className="w-full bg-[#08B36A] hover:bg-[#079f5e] text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-200 transition-all active:scale-95"
                        >
                            Open Live Tracking
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Verification Sheet for 403 1-Time Booking Restriction */}
            {showVerificationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">Phone Verification Required</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {verificationMessage || "Free emergency booking limit reached for this number. Please verify your mobile number via OTP in profile to book again."}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowVerificationModal(false)}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => router.push('/profile')}
                                className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#069656] text-white rounded-2xl text-xs font-black uppercase shadow-md shadow-emerald-100"
                            >
                                Verify Now
                            </button>
                        </div>
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
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-2" />
                Loading application...
            </div>
        }>
            <AccidentalAmbulanceContent />
        </Suspense>
    );
}