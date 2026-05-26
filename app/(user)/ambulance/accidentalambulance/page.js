"use client";
import React, { useState, useEffect } from 'react';
import {
    MapPin, ChevronDown, Camera, ShieldAlert, MessageSquare,
    Info, ChevronLeft, Navigation, Clock, User, Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserAPI from '@/app/services/UserAPI';
import { Suspense } from 'react';

export default function AccidentalAmbulanceWeb() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const serviceTypeFromUrl = searchParams.get('serviceType') || "Accident emergency";

    const [ambulances, setAmbulances] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        location: "Fetching exact address...",
        relation: "Self",
        description: "",
        serviceType: serviceTypeFromUrl
    });

    // 1. Fetch Coordinates, Nearest Ambulances, and Family Members
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const storedCoords = localStorage.getItem('userCoords');

            try {
                const familyRes = await UserAPI.getFamilyMembers();
                if (familyRes.success && familyRes.data) {
                    setFamilyMembers(familyRes.data);
                }

                if (storedCoords) {
                    const { lat, lng } = JSON.parse(storedCoords);

                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                        .then(res => res.json())
                        .then(data => {
                            setFormData(prev => ({
                                ...prev,
                                location: data.display_name || "Location Found"
                            }));
                        })
                        .catch(err => console.error("Address lookup failed", err));

                    const payload = {
                        lat: lat,
                        lng: lng,
                        vehicleType: "",
                        serviceType: serviceTypeFromUrl
                    };

                    const response = await UserAPI.getNearestAmbulances(payload);
                    if (response.success && response.data) {
                        setAmbulances(response.data);
                        if (response.data.length > 0) {
                            setSelectedAmbulance(response.data[0]._id);
                        }
                    }
                } else {
                    setFormData(prev => ({ ...prev, location: "Location not found" }));
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
            setImageFile(file); // This is the raw file for Multer
        }
    };

    const activeAmbulance = ambulances.find(a => a._id === selectedAmbulance);

    const handleConfirmBooking = async () => {
        if (!activeAmbulance) return;

        const selectedMemberData = familyMembers.find(
            member => `${member.memberName} (${member.relation})` === formData.relation
        );

        // 1. Prepare FormData exactly like your Postman Model
        const data = new FormData();
        data.append('ambulanceId', activeAmbulance._id);
        data.append('hospitalId', "699d881dfabe095ff8304f52");
        data.append('serviceType', "Accident emergency");
        data.append('triageLevel', "Emergency");
        data.append('incidentDescription', formData.description);

        const patientDetailsObj = {
            name: selectedMemberData ? selectedMemberData.memberName : (formData.relation === "Self" ? "Self" : "Unknown Victim"),
            relation: formData.relation
        };
        data.append('patientDetails', JSON.stringify(patientDetailsObj));

        // incidentPhoto key for Multer
        if (imageFile) {
            data.append('incidentPhoto', imageFile);
        }

        // --- Important: Log to verify keys ---
        console.log("--- Payload Keys ---");
        for (let key of data.keys()) { console.log(key); }

        try {
            /**
             * CRITICAL FIX: 
             * Because your authApi has a default 'application/json' header, 
             * we must tell Axios to remove it so it can properly set the 
             * Multipart boundary for the image.
             */
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            const checkOutRes = await UserAPI.checkOutAmbulance(data, config);

            if (checkOutRes.success) {
                const bookingRes = await UserAPI.bookAmbulance(data, config);

                if (bookingRes.success) {
                    alert(`Success! Your ambulance from ${activeAmbulance.name} has been booked.`);
                    router.push('/userscreens/ambulanceappointment');
                } else {
                    alert(bookingRes.message || "Failed to book ambulance");
                }
            } else {
                alert(checkOutRes.message || "Failed to calculate fare");
            }
        } catch (error) {
            console.error("Booking Error:", error);
            alert("Error: Image upload failed. Check your API service headers.");
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={() => router.back()} className="hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">{serviceTypeFromUrl}</h1>
                                <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Priority Dispatch Enabled</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100">
                                <ShieldAlert className="w-4 h-4" /> Emergency SOS
                            </button>
                            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
                            <button className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                <MessageSquare className="w-4 h-4" /> Support
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                                    <Navigation className="w-5 h-5 text-blue-600" /> Booking Details
                                </h2>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-blue-900 uppercase tracking-widest ml-1">Pickup Location</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-all outline-none"
                                                placeholder="Detecting location..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-blue-900 uppercase tracking-widest ml-1">Patient Relation</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl py-4 pl-12 pr-10 text-sm font-semibold appearance-none cursor-pointer outline-none"
                                                value={formData.relation}
                                                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                            >
                                                <option value="Self">Self</option>
                                                {familyMembers.map((member) => (
                                                    <option key={member._id} value={`${member.memberName} (${member.relation})`}>
                                                        {member.memberName} ({member.relation})
                                                    </option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-blue-900 uppercase tracking-widest ml-1">Emergency Description</label>
                                        <textarea
                                            rows="3"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl p-4 text-sm font-semibold outline-none resize-none"
                                            placeholder="Briefly describe the emergency..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <label className="text-[11px] font-black text-blue-900 uppercase tracking-widest ml-1 block mb-3">Incident Media</label>
                                        <label className="cursor-pointer group block relative">
                                            <div className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${previewImage ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                                                ) : (
                                                    <><Camera className="w-6 h-6 text-blue-600 mb-2" /><span className="text-xs font-bold text-slate-500">Upload Photo</span></>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Available Ambulances Near You</h2>
                                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {ambulances.length} Online
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                            <p className="font-bold text-slate-500 text-sm">Finding nearest response units...</p>
                                        </div>
                                    ) : (
                                        ambulances.map((ambulance) => (
                                            <div
                                                key={ambulance._id}
                                                onClick={() => setSelectedAmbulance(ambulance._id)}
                                                className={`group flex flex-col md:flex-row items-center gap-6 bg-white rounded-[2rem] p-4 border-2 transition-all cursor-pointer ${selectedAmbulance === ambulance._id ? 'border-green-500 ring-4 ring-green-50' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'}`}
                                            >
                                                <div className="relative w-full md:w-44 h-32 flex-shrink-0 rounded-[1.2rem] overflow-hidden bg-slate-100">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=600"
                                                        alt={ambulance.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                        <Clock className="w-3 h-3 text-orange-500" />
                                                        <span className="text-[10px] font-black">{ambulance.eta}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-grow w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-xl font-black truncate max-w-[250px]">{ambulance.name}</h3>
                                                        <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded-full font-bold text-blue-600 uppercase tracking-tighter">
                                                            {ambulance.vehicleType}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                                            {ambulance.driverInfo?.fullName || "On-Duty Driver"}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-3.5 h-3.5 text-green-500" />
                                                            {ambulance.distance}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">{ambulance.address}</p>
                                                </div>

                                                <div className="text-right pr-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                                    <p className="text-2xl font-black text-slate-900">
                                                        {ambulance.isFreeCase ? "FREE" : `$${ambulance.displayPrice}`}
                                                    </p>
                                                    <div className={`mt-2 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${selectedAmbulance === ambulance._id ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-50 text-slate-300'}`}>
                                                        <Navigation className="w-4 h-4 fill-current" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Fare Bar */}
                            {activeAmbulance && (
                                <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Vehicle</p>
                                                <Info className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <h4 className="text-2xl font-black">{activeAmbulance.name}</h4>
                                            <p className="text-green-400 font-bold text-sm">
                                                {activeAmbulance.isFreeCase ? "Free Emergency Dispatch" : `Est. Fare: $${activeAmbulance.displayPrice}.00`}
                                            </p>
                                        </div>
                                        <div className="hidden md:block w-[1px] h-16 bg-slate-800" />
                                        <div className="hidden md:block">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ETA</p>
                                            <p className="text-2xl font-black">{activeAmbulance.eta}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleConfirmBooking}
                                        className="w-full md:w-auto bg-green-500 hover:bg-green-400 text-white px-16 py-6 rounded-[2rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-500/20 relative z-10"
                                    >
                                        Confirm & Dispatch
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </Suspense>
    ); 
}