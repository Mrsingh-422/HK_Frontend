'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
    FaEye, FaHistory, FaFilter, FaSearch, 
    FaUserShield, FaPowerOff, FaUsers, FaCheckCircle,
    FaSpinner, FaGlobe, FaMapMarkerAlt, FaCity, FaAmbulance, FaTruck
} from "react-icons/fa"
import { HiOutlineUserGroup, HiOutlineStatusOnline } from "react-icons/hi"
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import DriverDetailsModal from './components/otherComponents/DriverDetailsModal';
import DriverHistoryModal from './components/otherComponents/DriverHistoryModal';

// --- API Service & Context Imports ---
import AdminAPI from '@/app/services/AdminAPI';
import { useUserContext } from "@/app/context/UserContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DriverVendorPage = () => {
    // Context Functions Extract
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null); 
    const [selectedType, setSelectedType] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // --- Dynamic Location States ---
    const [selectedCountry, setSelectedCountry] = useState("All Countries");
    const [selectedState, setSelectedState] = useState("All States");
    const [selectedCity, setSelectedCity] = useState("All Cities");

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // Supported Driver Types as per documentation
    const driverTypes = ["All", "Lab", "Pharmacy", "Nurse", "Ambulance"];

    // Helper: Safely get name from string or object
    const getLocationName = (item) => {
        if (!item) return "";
        return typeof item === 'object' ? (item.name || item.label || "") : item;
    };

    // 1. Initial Load: Load all Countries from UserContext
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
    }, [getAllCountries]); 

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
    }, [selectedCountry, countries, getStatesByCountry]);

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
    }, [selectedState, states, getCitiesByState]);

    // 4. Fetch Drivers Query Function
    const fetchFilteredDrivers = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = {};

            if (selectedType && selectedType !== "All") {
                queryParams.driverType = selectedType;
            }
            if (selectedCountry && selectedCountry !== "All Countries") {
                queryParams.country = selectedCountry;
            }
            if (selectedState && selectedState !== "All States") {
                queryParams.state = selectedState;
            }
            if (selectedCity && selectedCity !== "All Cities") {
                queryParams.city = selectedCity;
            }

            // Calls GET /admin/drivers/vendor/list with queryParams
            const res = await AdminAPI.adminGetAllDrivers(queryParams);
            const driverList = res?.data || res || [];
            setDrivers(Array.isArray(driverList) ? driverList : []);
        } catch (err) {
            console.error("Error fetching filtered drivers:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedType, selectedCountry, selectedState, selectedCity]);

    // Re-fetch whenever driver type or geo filter changes
    useEffect(() => {
        fetchFilteredDrivers();
    }, [fetchFilteredDrivers]);

    const toggleStatus = async (id, currentStatus) => {
        if (togglingId === id) return;
        setTogglingId(id);
        try {
            const response = await AdminAPI.adminToggleDriverStatus(id);
            if (response && response.success) {
                const newStatus = response.isActive !== undefined 
                    ? response.isActive 
                    : (response.onlineStatus !== undefined ? response.onlineStatus : !currentStatus);

                setDrivers(prev => prev.map(d => (d.id === id || d._id === id) ? { 
                    ...d, 
                    onlineStatus: newStatus,
                    isActive: newStatus
                } : d));
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleOpenView = async (id) => {
        try {
            const res = await AdminAPI.adminGetDriverDetails(id);
            setSelectedDriver(res?.data || res);
            setViewModalOpen(true);
        } catch (err) {
            alert("Could not fetch driver details");
        }
    };

    const handleOpenHistory = (driver) => {
        setSelectedDriver(driver);
        setHistoryModalOpen(true);
    };

    const getFullImageUrl = (path) => {
        if (!path) return "https://ui-avatars.com/api/?name=Driver&background=08B36A&color=fff";
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const cleanPath = path.replace(/^public\//, '/');
        const cleanBase = BACKEND_URL.replace(/\/$/, "");
        return `${cleanBase}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
    };

    // Client-side local filters & Search bar fallback
    const filteredDrivers = useMemo(() => {
        return drivers.filter(d => {
            const driverType = d.driverType || d.type || "";
            const matchesType = selectedType === "All" || driverType.toLowerCase() === selectedType.toLowerCase();

            const name = (d.driverName || d.name || "").toLowerCase();
            const vendor = (d.vendorName || d.vendor || "").toLowerCase();
            const phone = (d.phone || d.phoneNumber || "").toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch = !search || name.includes(search) || vendor.includes(search) || phone.includes(search);

            const country = (d.country || "").trim().toLowerCase();
            const matchesCountry = selectedCountry === "All Countries" || country === selectedCountry.trim().toLowerCase();

            const state = (d.state || "").trim().toLowerCase();
            const matchesState = selectedState === "All States" || state === selectedState.trim().toLowerCase();

            const city = (d.city || "").trim().toLowerCase();
            const matchesCity = selectedCity === "All Cities" || city === selectedCity.trim().toLowerCase();

            return matchesType && matchesSearch && matchesCountry && matchesState && matchesCity;
        });
    }, [selectedType, searchTerm, selectedCountry, selectedState, selectedCity, drivers]);

    const handleClearGeoFilters = () => {
        setSelectedCountry("All Countries");
        setSelectedState("All States");
        setSelectedCity("All Cities");
        setStates([]);
        setCities([]);
    };

    return (
        <div className="w-full space-y-6 p-1 md:p-4 font-sans">
            {/* --- SEARCH & CATEGORY FILTER BAR --- */}
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative w-full xl:max-w-md group">
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name, vendor, or phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-2 xl:pb-0">
                    <div className="p-3 bg-slate-100 text-slate-400 rounded-xl mr-2 shrink-0">
                        <FaFilter size={12} />
                    </div>
                    {driverTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                                selectedType === type 
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {type === 'Ambulance' ? '🚑 Ambulance' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- GEOGRAPHIC LOCATION FILTERS --- */}
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
                        <option value="All Countries">ALL COUNTRIES</option>
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
                        className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#08B36A] cursor-pointer disabled:opacity-50"
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
                        className="appearance-none pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#08B36A] cursor-pointer disabled:opacity-50"
                        disabled={selectedState === "All States"}
                    >
                        <option value="All Cities">ALL CITIES</option>
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
                        className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors ml-auto pr-2 cursor-pointer"
                    >
                        Clear Location Filters
                    </button>
                )}
            </div>

            {/* --- DATA TABLE --- */}
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel ID</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Duty Identity</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Name & Classification</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vendor / Agency</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Availability</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A]" size={40} />
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Parsing Database Assets</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDrivers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <HiOutlineUserGroup size={60} className="text-slate-200 mb-4" />
                                            <p className="text-sm font-black uppercase text-slate-400 tracking-widest italic">No matching personnel discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDrivers.map((driver) => {
                                const driverId = driver.id || driver._id || "";
                                const isOnline = driver.onlineStatus !== undefined ? Boolean(driver.onlineStatus) : Boolean(driver.isActive);
                                const isAmbulance = (driver.driverType || '').toLowerCase() === 'ambulance';

                                return (
                                    <tr key={driverId} className="group hover:bg-slate-50/80 transition-all duration-300">
                                        {/* ID */}
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono">
                                                #{driverId.slice(-6).toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Avatar & Online Dot */}
                                        <td className="px-8 py-6">
                                            <div className="relative w-14 h-14 mx-auto">
                                                <img 
                                                    src={getFullImageUrl(driver.imageUrl || driver.profileImage)} 
                                                    className={`w-full h-full rounded-[1.5rem] object-cover border-4 border-white shadow-lg transition-transform group-hover:scale-110 ${!isOnline && 'grayscale opacity-60'}`} 
                                                    alt="" 
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[4px] border-white shadow-md ${isOnline ? 'bg-[#08B36A] animate-pulse' : 'bg-slate-300'}`}></div>
                                            </div>
                                        </td>

                                        {/* Driver Name & Classification */}
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none">
                                                {driver.driverName || driver.name}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                                    isAmbulance 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                        : 'bg-[#08B36A]/10 text-[#08B36A] border-[#08B36A]/20'
                                                }`}>
                                                    {driver.driverType || 'General'}
                                                </span>
                                                {driver.username && (
                                                    <span className="text-[10px] text-slate-400 font-bold">@{driver.username}</span>
                                                )}
                                                {driver.city && (
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {driver.city}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Vehicle Details (For Ambulance / Delivery drivers) */}
                                            {(driver.vehicle || driver.vehicleNumber) && (
                                                <div className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-1">
                                                    <FaTruck className="text-slate-400 text-xs shrink-0" />
                                                    <span className="font-semibold">{driver.vehicle || 'Vehicle'}:</span>
                                                    <span className="font-mono text-slate-700">{driver.vehicleNumber}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Vendor / Agency */}
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-700">{driver.vendorName || 'Independent Vendor'}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase mt-1 italic tracking-tight">{driver.phone || 'No phone'}</p>
                                        </td>
                                        
                                        {/* Availability Toggle */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <label 
                                                    onClick={(e) => {
                                                        if (togglingId === driverId) {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                    className={`relative inline-flex items-center cursor-pointer select-none ${
                                                        togglingId === driverId ? 'pointer-events-none opacity-40' : ''
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isOnline}
                                                        disabled={togglingId === driverId}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            toggleStatus(driverId, isOnline);
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer 
                                                        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                                        peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                                                        after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full 
                                                        after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#08B36A]"
                                                    ></div>
                                                </label>
                                                
                                                <span className={`text-[10px] font-extrabold uppercase tracking-widest w-12 text-left transition-colors ${
                                                    isOnline ? 'text-[#08B36A]' : 'text-slate-400'
                                                }`}>
                                                    {togglingId === driverId ? (
                                                        <FaSpinner className="animate-spin text-slate-400" size={10} />
                                                    ) : (
                                                        isOnline ? 'Active' : 'Inactive'
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenView(driverId)}
                                                    className="p-3.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all hover:shadow-md active:scale-90 cursor-pointer"
                                                    title="Personnel Dossier"
                                                >
                                                    <FaEye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenHistory(driver)}
                                                    className="p-3.5 bg-slate-50 text-slate-400 hover:text-[#08B36A] hover:bg-green-50 rounded-2xl transition-all hover:shadow-md active:scale-90 cursor-pointer"
                                                    title="Service Logs"
                                                >
                                                    <FaHistory size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS --- */}
            <DriverDetailsModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} driver={selectedDriver} />
            <DriverHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} driver={selectedDriver} />
        </div>
    )
}

export default DriverVendorPage;