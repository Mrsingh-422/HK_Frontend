"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaBuilding, FaEye, FaSearch, FaSpinner, FaMapMarkerAlt, FaGlobeAmericas, FaCity, FaFilter, FaTimes, FaBriefcaseMedical } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal, HiChevronDown } from "react-icons/hi2";
import { useUserContext } from "@/app/context/UserContext";
import ViewPharmacyComponent from "./components/ViewPharmacyComponent";
import AdminAPI from "@/app/services/AdminAPI";

function PharmacyVendorsPage() {
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lists for dropdowns
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Search & Status Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Location Filters
  const [locationFilter, setLocationFilter] = useState({
    country: "All",
    state: "All",
    city: "All"
  });

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      try {
        const [vendorRes, countryData] = await Promise.all([
          AdminAPI.getAllPharmacyInAdmin(),
          getAllCountries()
        ]);
        setVendors(vendorRes.data || []);
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

  const filteredData = useMemo(() => {
    return vendors.filter((item) => {
      const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || item.phone?.includes(search);
      const matchesStatus = statusFilter === "All" || item.profileStatus === statusFilter;
      const matchesCountry = locationFilter.country === "All" || item.country === locationFilter.country;
      const matchesState = locationFilter.state === "All" || item.state === locationFilter.state;
      const matchesCity = locationFilter.city === "All" || item.city === locationFilter.city;
      return matchesSearch && matchesStatus && matchesCountry && matchesState && matchesCity;
    });
  }, [search, statusFilter, locationFilter, vendors]);

  if (isLoading) return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
        <FaBriefcaseMedical className="absolute text-emerald-500" size={24} />
      </div>
      <p className="text-slate-400 text-[10px] font-black mt-6 uppercase tracking-[0.3em]">Loading Pharmacy Network</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              Pharmacy Network
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-md uppercase">Partner</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage pharmaceutical inventory and distribution partners</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pharmacy name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-3 shadow-sm flex flex-wrap items-center gap-3">
          
          <DropdownSelect
            label="Audit Status"
            icon={<FaFilter className="text-emerald-500" />}
            value={statusFilter}
            options={["All", "Pending", "Approved", "Rejected"]}
            onChange={setStatusFilter}
          />

          <div className="hidden md:block w-px h-8 bg-slate-100 mx-1"></div>

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

            {(statusFilter !== "All" || locationFilter.country !== "All") && (
              <button 
                onClick={() => {
                  setStatusFilter("All");
                  setLocationFilter({ country: "All", state: "All", city: "All" });
                  setSearch("");
                }}
                className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-xs font-black uppercase tracking-wider"
              >
                <FaTimes size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-10 py-6">Vendor Identity</th>
                  <th className="px-10 py-6">Geographic Details</th>
                  <th className="px-10 py-6">Audit Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item) => (
                  <tr key={item._id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                          <img 
                            src={item.documents?.pharmacyImages?.[0] ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.documents.pharmacyImages[0].replace(/\\/g, '/')}` : "https://via.placeholder.com/100"} 
                            className="w-full h-full object-cover rounded-2xl shadow-sm border-2 border-white group-hover:scale-110 transition-transform" 
                            alt={item.name} 
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-[15px] leading-tight">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-tight flex items-center gap-1">
                            <FaBuilding className="text-emerald-500/50" size={10} /> {item.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <p className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-emerald-500" size={10} /> 
                          {item.city || 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">
                          {item.state}, {item.country}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        item.profileStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.profileStatus === 'Rejected' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.profileStatus}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button 
                        onClick={() => { setSelectedVendor(item); setIsModalOpen(true); }} 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 text-xs font-bold"
                      >
                        <FaEye size={12} /> View File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <div className="py-24 text-center bg-slate-50/20">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No pharmacy records found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ViewPharmacyComponent 
          vendor={selectedVendor} 
          onClose={() => setIsModalOpen(false)} 
          onApprove={() => {}} 
          onReject={() => {}} 
        />
      )}
    </div>
  );
}

// Reusable Sub-components
const DropdownSelect = ({ label, icon, value, options, onChange }) => (
  <div className="relative group min-w-[180px]">
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

export default PharmacyVendorsPage;