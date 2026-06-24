'use client';

import PoliceAPI from '@/app/services/PoliceAPI';
import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaDirections, 
  FaBuilding, 
  FaUserTie,
  FaArrowLeft,
  FaCheckCircle,
  FaTimes,
  FaSave
} from 'react-icons/fa';


export default function PoliceStationProfile() {
  // --- STATE MANAGEMENT ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Station Data state mapped to your API structure
  const [stationData, setStationData] = useState({
    stationName: "",
    stationCode: "",
    shoName: "",
    jurisdictionArea: "",
    email: "",
    phone: "",
    address: "",
    activeStaffCount: 0,
    isActive: true,
    profileImage: null
  });

  // Local state for the form inputs
  const [tempData, setTempData] = useState(stationData);

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await PoliceAPI.getPoliceStationProfile();
        if (response.success) {
          setStationData(response.data);
          setTempData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- HANDLERS ---
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await PoliceAPI.updatePoliceProfile(tempData);
      if (response.success) {
        setStationData(tempData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(stationData);
    setIsEditing(false);
  };

  if (isLoading && !stationData.stationName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08B36A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- TOP BREADCRUMB / ACTION BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => isEditing ? handleCancel() : window.history.back()}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#08B36A] transition-all shadow-sm"
            >
                <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">
                {isEditing ? "Edit Station" : "Station Profile"}
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <FaShieldAlt className="text-[#08B36A]" /> Department ID Registry
              </p>
            </div>
          </div>

          {/* Action Button Logic */}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-3 bg-[#08B36A] hover:bg-[#07a25f] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-100 active:scale-95"
            >
              <FaEdit /> Edit Station Details
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="flex items-center gap-3 bg-white border border-slate-200 text-slate-400 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95"
              >
                <FaTimes /> Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-3 bg-[#08B36A] hover:bg-[#07a25f] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-100 active:scale-95"
              >
                <FaSave /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Identity Card */}
          <div className="lg:col-span-1 space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={stationData.profileImage || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop"} 
                  alt="Station" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-[#08B36A] text-white rounded-full text-[10px] font-black uppercase shadow-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> {stationData.isActive ? "Operational 24/7" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="p-10 text-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{stationData.stationName}</h2>
                <div className="flex justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{stationData.stationCode}</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Registry Active</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-10 border-t border-slate-50 pt-10">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Station Officer</p>
                        <p className="text-sm font-black text-slate-700">{stationData.shoName}</p>
                    </div>
                    <div className="text-center border-l border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Force</p>
                        <p className="text-sm font-black text-[#08B36A]">{stationData.activeStaffCount} Active</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Switching between Details and Edit Form */}
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-right-4 duration-500">
            
            {!isEditing ? (
              // --- VIEW MODE ---
              <>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-1">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailCard icon={<FaPhoneAlt/>} label="Contact Number" val={stationData.phone} color="text-blue-600" bg="bg-blue-50" />
                    <DetailCard icon={<FaUserTie/>} label="Jurisdiction" val={stationData.jurisdictionArea} color="text-emerald-600" bg="bg-emerald-50" />
                    <DetailCard icon={<FaEnvelope/>} label="Station Official Email" val={stationData.email} color="text-orange-600" bg="bg-orange-50" />
                    <DetailCard icon={<FaCheckCircle/>} label="Network Status" val="100% Encrypted Comms" color="text-purple-600" bg="bg-purple-50" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-1">Location & Address</h3>
                  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="p-10 md:w-3/5 space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Postal Address</p>
                        <p className="text-lg font-black text-slate-700 leading-relaxed italic">"{stationData.address}"</p>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button className="flex-1 bg-[#08B36A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                           <FaDirections /> Get Directions
                        </button>
                        <button className="px-6 border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50"><FaMapMarkerAlt /></button>
                      </div>
                    </div>
                    <div className="md:w-2/5 h-64 md:h-auto bg-[#F1F5F9] relative overflow-hidden group flex items-center justify-center">
                        <FaMapMarkerAlt className="text-red-500 text-4xl drop-shadow-xl animate-bounce" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // --- EDIT MODE FORM ---
              <div className="bg-white rounded-[2.5rem] border border-[#08B36A]/20 p-10 shadow-xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditField label="Station Name" value={tempData.stationName} onChange={(v) => setTempData({...tempData, stationName: v})} icon={<FaBuilding/>} />
                  <EditField label="SHO In-Charge" value={tempData.shoName} onChange={(v) => setTempData({...tempData, shoName: v})} icon={<FaUserTie/>} />
                  <EditField label="Phone Number" value={tempData.phone} onChange={(v) => setTempData({...tempData, phone: v})} icon={<FaPhoneAlt/>} />
                  <EditField label="Jurisdiction Area" value={tempData.jurisdictionArea} onChange={(v) => setTempData({...tempData, jurisdictionArea: v})} icon={<FaMapMarkerAlt/>} />
                  <EditField label="Official Email" value={tempData.email} onChange={(v) => setTempData({...tempData, email: v})} icon={<FaEnvelope/>} />
                  <EditField label="Staff Count" value={tempData.activeStaffCount} type="number" onChange={(v) => setTempData({...tempData, activeStaffCount: v})} icon={<FaUsers/>} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Postal Address</label>
                  <textarea 
                    value={tempData.address} 
                    onChange={(e) => setTempData({...tempData, address: e.target.value})}
                    rows="3"
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#08B36A]/20 outline-none"
                  />
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4">
                    <FaCheckCircle className="text-[#08B36A] text-xl" />
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Updates will be visible to all district headquarters instantly.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- VIEW COMPONENTS ---

function DetailCard({ icon, label, val, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-6 group hover:border-[#08B36A] transition-all">
      <div className={`w-14 h-14 rounded-[1.5rem] ${bg} ${color} flex items-center justify-center text-xl shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-base font-black text-slate-700">{val || "N/A"}</p>
      </div>
    </div>
  )
}

// --- EDIT COMPONENTS ---

function EditField({ label, value, onChange, icon, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#08B36A]">{icon}</div>
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 focus:ring-2 focus:ring-[#08B36A]/20 outline-none transition-all"
        />
      </div>
    </div>
  )
}