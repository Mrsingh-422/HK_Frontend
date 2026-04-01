'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FaUserMd, FaEye, FaSearch, FaSpinner, FaMapMarkerAlt, FaGlobeAmericas, FaCity, FaStethoscope, FaFilter, FaTimes } from "react-icons/fa"
import { HiOutlineAdjustmentsHorizontal, HiChevronDown } from "react-icons/hi2";
import { useUserContext } from "@/app/context/UserContext";
import DoctorDetailsModal from './DoctorDetailsModal'
import AdminAPI from '@/app/services/AdminAPI';

export default function ManageDoctors() {
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Filter States
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [locationFilter, setLocationFilter] = useState({ country: "All", state: "All", city: "All" });

    useEffect(() => {
        const initPage = async () => {
            setIsLoading(true);
            try {
                const [docRes, countryData] = await Promise.all([
                    AdminAPI.getDoctorsList(),
                    getAllCountries()
                ]);
                setDoctors(docRes.data || []);
                setCountries(countryData || []);
            } catch (error) {
                console.error("Initialization failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initPage();
    }, []);

    const handleCountryChange = async (countryName) => {
        if (countryName === "All") {
            setLocationFilter({ country: "All", state: "All", city: "All" });
            setStates([]);
            setCities([]);
            return;
        }
        const selectedCountry = countries.find(c => c.name === countryName);
        setLocationFilter({ country: countryName, state: "All", city: "All" });
        if (selectedCountry) {
            const stateData = await getStatesByCountry(selectedCountry.id);
            setStates(stateData || []);
            setCities([]);
        }
    };

    const handleStateChange = async (stateName) => {
        if (stateName === "All") {
            setLocationFilter(prev => ({ ...prev, state: "All", city: "All" }));
            setCities([]);
            return;
        }
        const selectedState = states.find(s => s.name === stateName);
        setLocationFilter(prev => ({ ...prev, state: stateName, city: "All" }));
        if (selectedState) {
            const cityData = await getCitiesByState(selectedState.id);
            setCities(cityData || []);
        }
    };

    const handleViewDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setIsViewModalOpen(true);
    };

    const handleApprove = async (id) => {
        try {
            const res = await AdminAPI.approveDoctor(id);
            if (res.success) {
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, profileStatus: 'Approved' } : d));
                setIsViewModalOpen(false);
            }
        } catch (error) { alert("Approval failed"); }
    };

    const handleReject = async (id, reason) => {
        try {
            const res = await AdminAPI.rejectDoctor(id, reason);
            if (res.success) {
                setDoctors(prev => prev.map(d => d._id === id ? { ...d, profileStatus: 'Rejected', rejectionReason: reason } : d));
                setIsViewModalOpen(false);
            }
        } catch (error) { alert("Rejection failed"); }
    };

    const filteredDoctors = useMemo(() => {
        return doctors.filter((item) => {
            const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || item.phone?.includes(search);
            const matchesStatus = statusFilter === "All" || item.profileStatus === statusFilter;
            const matchesCountry = locationFilter.country === "All" || item.country === locationFilter.country;
            const matchesState = locationFilter.state === "All" || item.state === locationFilter.state;
            const matchesCity = locationFilter.city === "All" || item.city === locationFilter.city;
            return matchesSearch && matchesStatus && matchesCountry && matchesState && matchesCity;
        });
    }, [search, statusFilter, locationFilter, doctors]);

    if (isLoading) return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
            <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                <FaUserMd className="absolute text-emerald-500" size={24} />
            </div>
            <p className="text-slate-400 text-[10px] font-black mt-6 uppercase tracking-[0.3em]">Loading Directory</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans">
            
            {/* Header section with Stats */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            Doctor Management
                            <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-md uppercase align-middle">Admin</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Manage, verify and organize medical practitioners</p>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Name or Phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-3 shadow-sm flex flex-wrap items-center gap-3">
                    
                    {/* Status Dropdown */}
                    <DropdownSelect
                        label="Profile Status"
                        icon={<FaFilter className="text-emerald-500" />}
                        value={statusFilter}
                        options={["All", "Pending", "Approved", "Rejected", "Incomplete"]}
                        onChange={setStatusFilter}
                    />

                    <div className="hidden md:block w-px h-8 bg-slate-100 mx-1"></div>

                    {/* Location Filters */}
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <CompactSelect 
                            icon={<FaGlobeAmericas />} 
                            label="Country"
                            value={locationFilter.country} 
                            options={countries} 
                            onChange={handleCountryChange} 
                        />
                        <CompactSelect 
                            icon={<FaMapMarkerAlt />} 
                            label="State"
                            value={locationFilter.state} 
                            options={states} 
                            disabled={locationFilter.country === "All"}
                            onChange={handleStateChange} 
                        />
                        <CompactSelect 
                            icon={<FaCity />} 
                            label="City"
                            value={locationFilter.city} 
                            options={cities} 
                            disabled={locationFilter.state === "All"}
                            onChange={(val) => setLocationFilter(prev => ({ ...prev, city: val }))} 
                        />

                        {/* Reset Button */}
                        {(statusFilter !== "All" || locationFilter.country !== "All") && (
                            <button 
                                onClick={() => {
                                    setStatusFilter("All");
                                    setLocationFilter({ country: "All", state: "All", city: "All" });
                                    setSearch("");
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-xs font-black uppercase tracking-wider"
                            >
                                <FaTimes size={12} /> Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-8 py-5">Practitioner</th>
                                    <th className="px-8 py-5">Contact Details</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDoctors.map((item) => (
                                    <tr key={item._id} className="group hover:bg-slate-50/80 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12">
                                                    <img 
                                                        src={item.profileImage ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.profileImage.replace(/\\/g, '/')}` : "https://via.placeholder.com/100"} 
                                                        className="w-full h-full object-cover rounded-2xl shadow-sm border-2 border-white group-hover:scale-110 transition-transform" 
                                                        alt={item.name} 
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${item.profileStatus === 'Approved' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm leading-tight">{item.name}</p>
                                                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter flex items-center gap-1 mt-1">
                                                        <FaStethoscope size={10} /> {item.speciality || 'General Physician'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                                                    <FaMapMarkerAlt className="text-slate-300" size={10} /> 
                                                    {item.city}, {item.state}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-medium mt-1">{item.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={item.profileStatus} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleViewDoctor(item)} 
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 text-xs font-bold"
                                            >
                                                <FaEye size={12} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredDoctors.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <FaSearch className="text-slate-300" size={24} />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No records match your filters</p>
                        </div>
                    )}
                </div>
            </div>

            <DoctorDetailsModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                doctor={selectedDoctor}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    )
}

// Sub-component: Status Badge
const StatusBadge = ({ status }) => {
    const config = {
        Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        Rejected: 'bg-rose-50 text-rose-500 border-rose-100',
        Pending: 'bg-amber-50 text-amber-600 border-amber-100',
        Incomplete: 'bg-slate-100 text-slate-500 border-slate-200'
    }
    return (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config[status] || config.Pending}`}>
            {status}
        </span>
    )
}

// Sub-component: Dropdown Select (For Status)
const DropdownSelect = ({ label, icon, value, options, onChange }) => (
    <div className="relative group min-w-[160px]">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">{icon}</div>
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-700 uppercase tracking-tighter outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer appearance-none transition-all"
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{label}: {opt}</option>
            ))}
        </select>
        <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
)

// Sub-component: Compact Select (For Locations)
const CompactSelect = ({ icon, label, value, options, onChange, disabled }) => (
    <div className={`relative flex items-center min-w-[150px] transition-all ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        <div className="absolute left-3 text-slate-400 text-xs">{icon}</div>
        <select 
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 uppercase tracking-tight outline-none focus:border-emerald-500/50 cursor-pointer appearance-none shadow-sm"
        >
            <option value="All">All {label}s</option>
            {options.map(opt => (
                <option key={opt.id || opt.name || opt} value={opt.name || opt}>
                    {opt.name || opt}
                </option>
            ))}
        </select>
        <HiChevronDown className="absolute right-3 text-slate-300 pointer-events-none" size={14} />
    </div>
)