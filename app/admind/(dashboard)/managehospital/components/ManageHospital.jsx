'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
    FaEye, FaUserMd, FaPhoneAlt, FaSpinner, 
    FaGlobe, FaMapMarkerAlt, FaCity, FaFilter 
} from "react-icons/fa"
import HospitalDetailsModal from './othercomponents/HospitalDetailsModal';
import AdminAPI from '@/app/services/AdminAPI';
import { useUserContext } from "@/app/context/UserContext"; 

const ManageHospital = () => {
    // Context Location Helpers Extract karein
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    const [doctors, setDoctors] = useState([]); // Keeps original hospital state intact
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null); 
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Geographic Location Filter States ---
    const [selectedCountry, setSelectedCountry] = useState("All Countries");
    const [selectedState, setSelectedState] = useState("All States");
    const [selectedCity, setSelectedCity] = useState("All Cities");

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Helper: Safely get name from string or object (Context standard compatible)
    const getLocationName = (item) => {
        if (!item) return "";
        return typeof item === 'object' ? item.name : item;
    };

    // 1. Initial Load: Load all Countries from UserContext (Only once on mount)
    useEffect(() => {
        const fetchCountries = async () => {
            if (typeof getAllCountries === 'function') {
                try {
                    const rawCountries = await getAllCountries() || [];
                    setCountries(Array.isArray(rawCountries) ? rawCountries : []);
                } catch (err) {
                    console.error("Error fetching countries:", err);
                    setCountries([]);
                }
            }
        };
        fetchCountries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 👈 Empty dependency breaks context-change loop completely

    // 2. Cascade: Fetch States when Selected Country changes
    useEffect(() => {
        const fetchStates = async () => {
            if (selectedCountry && selectedCountry !== "All Countries" && Array.isArray(countries) && countries.length > 0) {
                const foundCountry = countries.find(c => getLocationName(c) === selectedCountry);
                const countryKey = foundCountry && typeof foundCountry === 'object' 
                    ? (foundCountry.isoCode || foundCountry.id || foundCountry.name) 
                    : selectedCountry;

                if (typeof getStatesByCountry === 'function') {
                    try {
                        const rawStates = await getStatesByCountry(countryKey) || [];
                        setStates(Array.isArray(rawStates) ? rawStates : []);
                    } catch (err) {
                        console.error("Error fetching states:", err);
                        setStates([]);
                    }
                }
            } else {
                setStates([]);
            }
        };

        fetchStates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry, countries]); // 👈 Removed getStatesByCountry

    // 3. Cascade: Fetch Cities when Selected State changes
    useEffect(() => {
        const fetchCities = async () => {
            if (selectedState && selectedState !== "All States" && Array.isArray(states) && states.length > 0) {
                const foundState = states.find(s => getLocationName(s) === selectedState);
                const stateKey = foundState && typeof foundState === 'object' 
                    ? (foundState.isoCode || foundState.id || foundState.name) 
                    : selectedState;

                if (typeof getCitiesByState === 'function') {
                    try {
                        const rawCities = await getCitiesByState(stateKey) || [];
                        setCities(Array.isArray(rawCities) ? rawCities : []);
                    } catch (err) {
                        console.error("Error fetching cities:", err);
                        setCities([]);
                    }
                }
            } else {
                setCities([]);
            }
        };

        fetchCities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedState, states]); // 👈 Removed getCitiesByState

    // 4. API Query Trigger: Runs whenever location selection changes (Safely on mount and updates)
    useEffect(() => {
        fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry, selectedState, selectedCity]);

    const fetchDoctors = async () => {
        setIsLoading(true);
        try {
            const queryParams = {};

            if (selectedCountry && selectedCountry !== "All Countries") {
                queryParams.country = selectedCountry;
            }
            if (selectedState && selectedState !== "All States") {
                queryParams.state = selectedState;
            }
            if (selectedCity && selectedCity !== "All Cities") {
                queryParams.city = selectedCity;
            }

            const res = await AdminAPI.getAllHospitals(queryParams);
            setDoctors(res.data || []);
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side local filtering (For Double Safety check on trailing database spaces)
    const filteredHospitals = useMemo(() => {
        return doctors.filter(doc => {
            // Country Comparison
            const matchesCountry = selectedCountry === "All Countries" || 
                (doc.country && doc.country.trim().toLowerCase() === selectedCountry.trim().toLowerCase());

            // State/District Comparison
            const matchesState = selectedState === "All States" || 
                (doc.state && doc.state.trim().toLowerCase() === selectedState.trim().toLowerCase());

            // City Comparison
            const matchesCity = selectedCity === "All Cities" || 
                (doc.city && doc.city.trim().toLowerCase() === selectedCity.trim().toLowerCase());

            return matchesCountry && matchesState && matchesCity;
        });
    }, [selectedCountry, selectedState, selectedCity, doctors]);

    const handleClearGeoFilters = () => {
        setSelectedCountry("All Countries");
        setSelectedState("All States");
        setSelectedCity("All Cities");
        setStates([]);
        setCities([]);
    };

    const handleView = (doc) => {
        setSelectedDoctor(doc);
        setIsModalOpen(true);
    };

    const handleVerifyStatus = async (id) => {
        try {
            const response = await AdminAPI.approveHospital(id);

            if (response.success) {
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, profileStatus: 'Approved' } : d));

                if (selectedDoctor && selectedDoctor._id === id) {
                    setSelectedDoctor(prev => ({ ...prev, profileStatus: 'Approved' }));
                }

                setIsModalOpen(false);
                alert("Hospital Approved successfully!");
            }
        } catch (error) {
            console.error("Approval failed:", error);
            alert(error.response?.data?.message || "Failed to approve.");
        }
    };

    const handleToggleActiveStatus = async (id, currentStatus) => {
        setTogglingId(id);
        try {
            const response = await AdminAPI.toggleHospitalStatus(id);
            if (response.success) {
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, isActive: !currentStatus } : d));
            }
        } catch (error) {
            console.error("Failed to toggle hospital status:", error);
            alert(error.response?.data?.message || "Something went wrong.");
        } finally {
            setTogglingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100">
                <FaSpinner className="animate-spin text-[#08B36A]" size={30} />
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Loading Profiles...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* --- GEOGRAPHIC LOCATION FILTER BAR --- */}
            <div className="flex flex-wrap items-center gap-4 bg-white px-6 py-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <FaFilter size={10} />
                    <span>Geo Location Matrix:</span>
                </div>

                {/* Country Dropdown */}
                <div className="relative">
                    <select
                        value={selectedCountry}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedCountry(val);
                            setSelectedState("All States"); 
                            setSelectedCity("All Cities");
                            setStates([]);
                            setCities([]);
                        }}
                        className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
                    >
                        <option value="All Countries">ALL COUNTRYS</option>
                        {Array.isArray(countries) && countries.map((country, idx) => {
                            const name = getLocationName(country);
                            return <option key={idx} value={name}>{name}</option>;
                        })}
                    </select>
                    <FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>

                {/* State / District Dropdown */}
                <div className="relative">
                    <select
                        value={selectedState}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedState(val);
                            setSelectedCity("All Cities"); 
                            setCities([]);
                        }}
                        className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
                        disabled={selectedCountry === "All Countries"}
                    >
                        <option value="All States">ALL STATES</option>
                        {Array.isArray(states) && states.map((state, idx) => {
                            const name = getLocationName(state);
                            return <option key={idx} value={name}>{name}</option>;
                        })}
                    </select>
                    <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>

                {/* City Dropdown */}
                <div className="relative">
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
                        disabled={selectedState === "All States"}
                    >
                        <option value="All Cities">ALL CITYS</option>
                        {Array.isArray(cities) && cities.map((city, idx) => {
                            const name = getLocationName(city);
                            return <option key={idx} value={name}>{name}</option>;
                        })}
                    </select>
                    <FaCity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>

                {/* Clear Location Filters */}
                {(selectedCountry !== "All Countries" || selectedState !== "All States" || selectedCity !== "All Cities") && (
                    <button
                        onClick={handleClearGeoFilters}
                        className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors ml-auto pr-2"
                    >
                        Clear Location Filters
                    </button>
                )}
            </div>

            {/* --- DATA TABLE --- */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
                <table className="w-full border-collapse text-left bg-white">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hospital Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Speciality</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Approval Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Active Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredHospitals.length > 0 ? (
                            filteredHospitals.map((doc, index) => (
                                <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 text-xs font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#08B36A] overflow-hidden border border-slate-200">
                                                {doc.profileImage ? (
                                                    <img src={`${BACKEND_URL}/${doc.profileImage}`} className="w-full h-full object-cover" />
                                                ) : (<FaUserMd size={20} />)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{doc.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-2"><FaPhoneAlt size={10} className="text-[#08B36A]" /> {doc.phone}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.email}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">{doc.speciality || 'General'}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.profileStatus === 'Approved' ? 'bg-[#08B36A]/10 text-[#08B36A]' : 'bg-amber-100 text-amber-600'}`}>
                                            {doc.profileStatus}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={doc.isActive}
                                                    disabled={togglingId === doc._id}
                                                    onChange={() => handleToggleActiveStatus(doc._id, doc.isActive)}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer 
                                                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                                    peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                                                    after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full 
                                                    after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#08B36A]
                                                    ${togglingId === doc._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                ></div>
                                            </label>
                                            
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest w-12 text-left transition-colors ${
                                                doc.isActive ? 'text-[#08B36A]' : 'text-slate-400'
                                            }`}>
                                                {togglingId === doc._id ? (
                                                    <FaSpinner className="animate-spin text-slate-400" size={10} />
                                                ) : (
                                                    doc.isActive ? 'Active' : 'Inactive'
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <button onClick={() => handleView(doc)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#08B36A] rounded-xl transition-all shadow-sm">
                                            <FaEye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-400 text-sm font-medium">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <HospitalDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                hospital={selectedDoctor}
                onVerify={handleVerifyStatus}
            />
        </div>
    )
}

export default ManageHospital