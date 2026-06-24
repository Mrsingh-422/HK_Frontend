'use client'
import PoliceAPI from '@/app/services/PoliceAPI';
import React, { useState, useEffect } from 'react'

import { 
  FaUserShield, 
  FaIdBadge, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaCamera, 
  FaTimes, 
  FaShieldAlt, 
  FaBriefcase, 
  FaCalendarAlt,
  FaCheckCircle,
  FaGlobe
} from 'react-icons/fa'

export default function PoliceProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // profile state matches your API data structure
  const [profile, setProfile] = useState(null);

  // formData state for the update modal
  const [formData, setFormData] = useState({
    hqName: "",
    commissionerName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: ""
  });

  const fetchProfileData = async () => {
    try {
      const response = await PoliceAPI.getHeadProfile();
      if (response.success) {
        setProfile(response.data);
        // Initialize form with all API fields
        setFormData({
          hqName: response.data.hqName,
          commissionerName: response.data.commissionerName,
          email: response.data.email,
          phone: response.data.phone,
          country: response.data.country,
          state: response.data.state,
          city: response.data.city,
          address: response.data.address
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await PoliceAPI.updateHeadProfile(formData);
      if (response.success) {
        await fetchProfileData();
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-500 font-sans">
      
      {/* --- PROFILE HEADER CARD --- */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="h-48 bg-gradient-to-r from-[#08B36A] to-emerald-700 relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-end -mt-20 gap-6">
              <div className="relative group">
                <div className="w-40 h-40 bg-white p-2 rounded-[2.5rem] shadow-xl">
                  <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 relative overflow-hidden">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserShield size={80} className="text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FaCamera className="text-white" size={24} />
                    </div>
                  </div>
                </div>
                <div className={`absolute bottom-4 right-2 w-6 h-6 border-4 border-white rounded-full ${profile.isActive ? 'bg-[#08B36A]' : 'bg-slate-300'}`}></div>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile.commissionerName}</h1>
                    <p className="text-[#08B36A] font-bold text-sm uppercase tracking-[0.15em] flex items-center gap-2 mt-1">
                      <FaShieldAlt /> {profile.role}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <ProfileStat label="System ID" value={profile._id.substring(profile._id.length - 8).toUpperCase()} icon={<FaIdBadge />} />
              <ProfileStat label="Location" value={profile.city} icon={<FaGlobe />} />
              <ProfileStat label="Region" value={profile.state} icon={<FaShieldAlt />} />
              <ProfileStat label="Joined" value={new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} icon={<FaCalendarAlt />} />
            </div>

            {/* DETAILED INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={<FaEnvelope />} label="HQ Email" value={profile.email} />
                  <InfoRow icon={<FaPhoneAlt />} label="Contact Number" value={profile.phone} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Full Address" value={profile.address} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-2">
                   Departmental Details
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={<FaShieldAlt />} label="Assigned HQ" value={profile.hqName} />
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Duty Status</p>
                      <p className="text-sm font-black text-green-700 mt-1">{profile.isActive ? 'Active & Authorized' : 'Inactive'}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_#08B36A] ${profile.isActive ? 'bg-[#08B36A]' : 'bg-slate-300'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#08B36A] text-white rounded-xl shadow-lg shadow-green-100">
                        <FaUserShield size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Modify HQ Profile</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management Credentials</p>
                    </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <FaTimes size={20} />
                </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto">
               <div className="col-span-2">
                 <InputLabel label="Commissioner Name" />
                 <input type="text" value={formData.commissionerName} onChange={(e) => setFormData({...formData, commissionerName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" />
               </div>
               <div className="col-span-2">
                 <InputLabel label="Headquarters Name" />
                 <input type="text" value={formData.hqName} onChange={(e) => setFormData({...formData, hqName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" />
               </div>
               <div>
                 <InputLabel label="Email Address" />
                 <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" />
               </div>
               <div>
                 <InputLabel label="Phone Number" />
                 <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" />
               </div>
               <div>
                 <InputLabel label="City" />
                 <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" />
               </div>
               <div>
                 <InputLabel label="State" />
                 <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20" />
               </div>
               <div className="col-span-2">
                 <InputLabel label="Full Address" />
                 <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 h-24 resize-none" />
               </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
              <button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating}
                className="flex-1 bg-[#08B36A] text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest hover:bg-[#07a25f] transition-all disabled:opacity-50"
              >
                {isUpdating ? "Syncing..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- SUB-COMPONENTS ---

function ProfileStat({ label, value, icon }) {
  return (
    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-[#08B36A] transition-all duration-300">
      <div className="p-3 bg-white rounded-2xl text-slate-400 group-hover:text-[#08B36A] transition-colors shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 group-hover:text-white/70 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-700 group-hover:text-white transition-colors">{value}</p>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-1">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-tight">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function InputLabel({ label }) {
  return (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 mb-2 block">
      {label}
    </label>
  )
}