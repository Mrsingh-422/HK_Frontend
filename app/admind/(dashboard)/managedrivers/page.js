'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
    FaEye, FaHistory, FaFilter, FaSearch, 
    FaUserShield, FaPowerOff, FaUsers, FaCheckCircle,
    FaSpinner, FaGlobe, FaMapMarkerAlt, FaCity
} from "react-icons/fa"
import { HiOutlineUserGroup, HiOutlineStatusOnline } from "react-icons/hi"
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import DriverDetailsModal from './components/otherComponents/DriverDetailsModal';
import DriverHistoryModal from './components/otherComponents/DriverHistoryModal';

// --- API Service & Context Imports ---
import AdminAPI from '@/app/services/AdminAPI';
import { useUserContext } from "@/app/context/UserContext"; // 👈 Context Imported

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DriverVendorPage = () => {
    // Context Functions Extract karein
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

    const driverTypes = ["All", "Lab", "Pharmacy", "Nurse", "Ambulance"];

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
    }, []); 

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

    // 4. API Query Trigger: Runs whenever location selection state changes (Safely on mount and updates)
    useEffect(() => {
        fetchFilteredDrivers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry, selectedState, selectedCity]);

    const fetchFilteredDrivers = async () => {
        try {
            setLoading(true);
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

            // Fallback parameters verification
            const res = await AdminAPI.adminGetAllDrivers(queryParams);
            setDrivers(res.data || []);
        } catch (err) {
            console.error("Error fetching filtered drivers:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentOnlineStatus) => {
        if (togglingId === id) return;
        setTogglingId(id);
        try {
            const response = await AdminAPI.adminToggleDriverStatus(id);
            if (response.success) {
                const newOnlineStatus = response.isActive !== undefined ? response.isActive : !currentOnlineStatus;
                setDrivers(prev => prev.map(d => d.id === id ? { 
                    ...d, 
                    onlineStatus: newOnlineStatus 
                } : d));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(err.response?.data?.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleOpenView = async (id) => {
        try {
            const res = await AdminAPI.adminGetDriverDetails(id);
            setSelectedDriver(res.data);
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
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '/');
        return `${BACKEND_URL}${cleanPath}`;
    };

    // Client-side local filters & Double Geographic safety net
    const filteredDrivers = useMemo(() => {
        return drivers.filter(d => {
            // 1. Classification type (Lab, Pharmacy etc.)
            const matchesType = selectedType === "All" || d.driverType === selectedType;

            // 2. Local search bar comparison
            const matchesSearch = d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 d.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 (d.phone && d.phone.includes(searchTerm));

            // 3. Country comparison (Trim safe to clear backend spaces)
            const matchesCountry = selectedCountry === "All Countries" || 
                (d.country && d.country.trim().toLowerCase() === selectedCountry.trim().toLowerCase());

            // 4. State comparison (Trim safe)
            const matchesState = selectedState === "All States" || 
                (d.state && d.state.trim().toLowerCase() === selectedState.trim().toLowerCase());

            // 5. City comparison (Trim safe)
            const matchesCity = selectedCity === "All Cities" || 
                (d.city && d.city.trim().toLowerCase() === selectedCity.trim().toLowerCase());

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
        <div className="w-full space-y-6 p-1 md:p-4">
            {/* --- SEARCH & FILTER BAR --- */}
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
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                selectedType === type 
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- GEOGRAPHIC LOCATION FILTERS (Context Fed) --- */}
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
                            ) : filteredDrivers.map((driver) => (
                                <tr key={driver.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <span className="text-[11px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded">
                                            #{driver.id.slice(-6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="relative w-14 h-14 mx-auto">
                                            <img 
                                                src={getFullImageUrl(driver.imageUrl)} 
                                                className={`w-full h-full rounded-[1.5rem] object-cover border-4 border-white shadow-lg transition-transform group-hover:scale-110 ${!driver.onlineStatus && 'grayscale opacity-60'}`} 
                                                alt="" 
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[4px] border-white shadow-md ${driver.onlineStatus ? 'bg-[#08B36A] animate-pulse' : 'bg-slate-300'}`}></div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none">{driver.driverName}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-black uppercase bg-[#08B36A]/10 text-[#08B36A] px-2 py-0.5 rounded border border-[#08B36A]/20">
                                                {driver.driverType}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold">@{driver.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700">{driver.vendorName}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1 italic tracking-tight">{driver.phone}</p>
                                    </td>
                                    
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <label 
                                                onClick={(e) => {
                                                    if (togglingId === driver.id) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }
                                                }}
                                                className={`relative inline-flex items-center cursor-pointer select-none ${
                                                    togglingId === driver.id ? 'pointer-events-none opacity-40' : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={driver.onlineStatus !== false}
                                                    disabled={togglingId === driver.id}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatus(driver.id, driver.onlineStatus);
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
                                                driver.onlineStatus !== false ? 'text-[#08B36A]' : 'text-slate-400'
                                            }`}>
                                                {togglingId === driver.id ? (
                                                    <FaSpinner className="animate-spin text-slate-400" size={10} />
                                                ) : (
                                                    driver.onlineStatus !== false ? 'Active' : 'Inactive'
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenView(driver.id)}
                                                className="p-3.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all hover:shadow-md active:scale-90"
                                                title="Personnel Dossier"
                                            >
                                                <FaEye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenHistory(driver)}
                                                className="p-3.5 bg-slate-50 text-slate-400 hover:text-[#08B36A] hover:bg-green-50 rounded-2xl transition-all hover:shadow-md active:scale-90"
                                                title="Service Logs"
                                            >
                                                <FaHistory size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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