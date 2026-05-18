'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaUserAlt, FaPhoneAlt, FaFire, FaExclamationTriangle, 
    FaBuilding, FaMapMarkerAlt, FaGlobe, FaSpinner, FaCheckCircle 
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function CreateCasePage() {
    // --- STATES ---
    const [stations, setStations] = useState([]);
    const [isFetchingStations, setIsFetchingStations] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        stationId: '',
        callerName: '',
        callerPhone: '',
        fireType: '',
        severity: 'Medium', // Default value
        description: '',
        address: '',
        lat: '',
        lng: ''
    });

    // --- FETCH FIRE STATIONS FOR DROPDOWN ---
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await FireHeadAPI.getAllFireStations();
                if (res.success) setStations(res.data || []);
            } catch (error) {
                console.error("Failed to load stations", error);
            } finally {
                setIsFetchingStations(false);
            }
        };
        fetchStations();
    }, []);

    // --- HANDLE INPUT CHANGE ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- AUTO FETCH GEOLOCATION ---
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6)
                    });
                },
                (error) => alert("Failed to get location. Please enter manually.")
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    // --- HANDLE FORM SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Lat/Lng ko Number me convert karna zaroori hai as per your API
            const payload = {
                ...formData,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng)
            };

            const res = await FireHeadAPI.createCase(payload);
            
            if (res.success) {
                alert("Incident reported and assigned successfully!");
                // Form Reset
                setFormData({
                    stationId: '', callerName: '', callerPhone: '', fireType: '',
                    severity: 'Medium', description: '', address: '', lat: '', lng: ''
                });
            } else {
                alert(res.message || "Failed to create case.");
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Server Error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
            
            {/* --- HEADER --- */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-500 rounded-xl"><FaFire /></div>
                    Create New Incident
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-2 ml-16">
                    Manually log a new emergency and assign it to a fire station.
                </p>
            </div>

            {/* --- MAIN FORM --- */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 space-y-10">
                    
                    {/* SECTION 1: CALLER INFO */}
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <FaUserAlt /> Caller Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Caller Name *</label>
                                <div className="relative">
                                    <FaUserAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" name="callerName" required value={formData.callerName} onChange={handleChange} placeholder="E.g. John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Caller Phone *</label>
                                <div className="relative">
                                    <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" name="callerPhone" required value={formData.callerPhone} onChange={handleChange} placeholder="+91 9876543210" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: INCIDENT DETAILS */}
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <FaFire /> Incident Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* Station Assignment */}
                            <div className="lg:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign To Fire Station *</label>
                                <div className="relative">
                                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                    <select name="stationId" required value={formData.stationId} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none appearance-none cursor-pointer transition-all">
                                        <option value="" disabled>{isFetchingStations ? 'Loading stations...' : 'Select a station to dispatch'}</option>
                                        {stations.map(stn => (
                                            <option key={stn._id} value={stn._id}>{stn.stationName} ({stn.stationCode}) - {stn.operatingZone}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Fire Type */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Fire / Incident Type *</label>
                                <select name="fireType" required value={formData.fireType} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all">
                                    <option value="" disabled>Select Type</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Commercial Building Fire">Commercial Building Fire</option>
                                    <option value="Apartment Fire">Apartment Fire</option>
                                    <option value="Warehouse Fire">Warehouse Fire</option>
                                    <option value="Forest">Forest</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Severity *</label>
                                <div className="relative">
                                    <FaExclamationTriangle className={`absolute left-4 top-1/2 -translate-y-1/2 ${formData.severity === 'Critical' ? 'text-red-600' : formData.severity === 'High' ? 'text-orange-500' : formData.severity === 'Low' ? 'text-green-500' : 'text-yellow-500'} z-10`} />
                                    <select name="severity" required value={formData.severity} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Incident Description</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Brief details about the fire, structure type, trapped victims, etc." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all resize-none"></textarea>
                            </div>

                        </div>
                    </div>

                    {/* SECTION 3: LOCATION INFO */}
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <FaMapMarkerAlt /> Location Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Address *</label>
                                <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="House/Building No, Street, Landmark, City" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Latitude *</label>
                                <div className="relative">
                                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="number" step="any" name="lat" required value={formData.lat} onChange={handleChange} placeholder="E.g. 28.6139" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700">Longitude *</label>
                                    {/* Helper Button for Coordinates */}
                                    <button type="button" onClick={handleGetLocation} className="text-[10px] font-bold text-[#08B36A] hover:underline flex items-center gap-1">
                                        <FaMapMarkerAlt /> Get Current Location
                                    </button>
                                </div>
                                <div className="relative">
                                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="number" step="any" name="lng" required value={formData.lng} onChange={handleChange} placeholder="E.g. 77.2090" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- FOOTER ACTIONS --- */}
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <FaCheckCircle className="text-green-500" /> Double-check all details before dispatching.
                    </p>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => window.history.back()} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || isFetchingStations} className="px-8 py-3 bg-[#08B36A] hover:bg-[#069356] text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
                            {isSubmitting ? <><FaSpinner className="animate-spin" /> Processing...</> : 'Create & Dispatch Case'}
                        </button>
                    </div>
                </div>
            </form>

        </div>
    )
}