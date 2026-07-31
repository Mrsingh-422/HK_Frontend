'use client'
import React, { useState, useEffect } from 'react'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
 
import {
  FaUserCircle, FaFireExtinguisher, FaBell, FaBroadcastTower,
  FaUserCog, FaTimes, FaCamera, FaUserEdit, FaCheckCircle,
  FaMapMarkerAlt, FaIdCard, FaPhoneAlt, FaDesktop, FaUserTie, FaEnvelope
} from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FireStationAPI from '@/app/services/FireStationAPI'
 
// 🌟 HELPER FUNCTION: To format image URL correctly 🌟
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) return imagePath;
   
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    const cleanPath = imagePath.replace(/^public\//, '');
    return `${backendUrl}/${cleanPath}`;
};
 
// Helper component Inputs ke liye
const InputGroup = ({ label, name, value, onChange, isEditing, icon: Icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        {isEditing ? (
            <div className="relative group">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" size={14} />}
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-emerald-500/5 focus:border-[#08B36A] focus:bg-white transition-all`}
                />
            </div>
        ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl text-sm font-bold text-slate-800">
                {Icon && <Icon className="text-slate-300" size={14} />}
                <span className="break-all">{value || '-'}</span>
            </div>
        )}
    </div>
);
 
export default function TopbarFireStation({ onToggleSidebar, isCollapsed }) {
  const router = useRouter();
 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
 
  // 🌟 Extended Form Data based on your Keys 🌟
  const [formData, setFormData] = useState({
      stationName: '',
      stationCode: '',
      captainName: '',
      operatingZone: '',
      email: '',
      phone: '',
      landline: '',
      emergencyLines: '',
      officeDesk: '',
      address: '',
      profileImage: null
  });
 
  // 1. 🌟 FETCH PROFILE FROM API 🌟
  const fetchProfile = async () => {
    try {
        const res = await FireStationAPI.getProfile();
        if (res.success) {
            setProfileData(res.data);
            // Sync to local storage for other components
            localStorage.setItem('firestationData', JSON.stringify(res.data));
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
    }
  };
 
  useEffect(() => {
    fetchProfile(); // Initial load from API
   
    // Listen for updates from other parts of the app
    const handleUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleUpdate);
    return () => window.removeEventListener('profileUpdated', handleUpdate);
  }, []);
 
  // Sync Form when modal opens or profileData changes
  useEffect(() => {
    if (profileData && isProfileModalOpen) {
        setFormData({
            stationName: profileData.stationName || '',
            stationCode: profileData.stationCode || '',
            captainName: profileData.captainName || '',
            operatingZone: profileData.operatingZone || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            landline: profileData.landline || '',
            emergencyLines: profileData.emergencyLines || '',
            officeDesk: profileData.officeDesk || '',
            address: profileData.address || '',
            profileImage: null
        });
        setImagePreview(profileData.profileImage ? getImageUrl(profileData.profileImage) : null);
        setIsEditing(false);
    }
  }, [profileData, isProfileModalOpen]);
 
  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('firestationToken');
    localStorage.removeItem('firestationData');  
    router.push('/');
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData(prev => ({ ...prev, profileImage: file }));
        setImagePreview(URL.createObjectURL(file));
    }
  };
 
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
 
    try {
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if(formData[key] !== null) {
                submitData.append(key, formData[key]);
            }
        });
 
        const response = await FireStationAPI.UpdateProfile(submitData);
       
        if (response.success) {
            setIsEditing(false);
            await fetchProfile(); // Re-fetch latest from server
            alert("Profile updated successfully!");
            window.dispatchEvent(new Event('profileUpdated'));
        }
    } catch (error) {
        alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
        setIsLoading(false);
    }
  };
 
  return (
    <>
      <header className="bg-white/90 backdrop-blur-md border-b border-green-50 h-20 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button onClick={onToggleSidebar} className="p-2.5 text-slate-400 hover:text-[#08B36A] hover:bg-green-50 rounded-xl transition-all bg-white border border-green-50">
            {isCollapsed ? <RiMenuUnfoldLine size={22} /> : <RiMenuFoldLine size={22} />}
          </button>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] leading-none">Fire Operations</h1>
            <p className="text-[10px] font-bold text-[#08B36A] uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
              <FaBroadcastTower size={10} className="animate-pulse" /> Dispatch Center Hub
            </p>
          </div>
        </div>
 
        <div className="flex items-center gap-4 relative">
          <button className="p-3 text-slate-300 hover:text-[#08B36A] hover:bg-green-50 rounded-2xl relative group transition-all">
              <FaBell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-600 border-2 border-white rounded-full"></span>
          </button>
 
          <div className="h-8 w-[1px] bg-green-50 mx-2 hidden md:block"></div>
 
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="group flex items-center gap-4 pl-4 pr-2 py-2 rounded-[1.25rem] hover:bg-green-50/50 transition-all border border-transparent hover:border-green-100">
            <div className="text-right hidden md:block leading-tight">
              <p className="text-sm font-black text-slate-800 group-hover:text-[#08B36A] transition-colors uppercase">
                {profileData?.stationName || 'Loading...'}
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                 {profileData?.stationCode ? `#${profileData.stationCode}` : '----'}
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white border-2 border-white shadow-lg overflow-hidden">
                  {profileData?.profileImage ? (
                    <img src={getImageUrl(profileData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="font-black text-xs">{profileData?.stationName?.charAt(0) || 'F'}</div>
                  )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <IoChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
 
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-green-50 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] py-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <button onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-6 py-3 text-xs font-black text-slate-600 hover:bg-green-50 hover:text-[#08B36A] uppercase tracking-widest transition-all">
                      <FaUserCog size={14} className="text-[#08B36A]" /> Station Profile
                  </button>
                  <button className="w-full text-left flex items-center gap-3 px-6 py-3 text-xs font-black text-red-500 hover:bg-red-50 uppercase tracking-widest transition-all" onClick={handleLogout}>
                      <IoLogOutOutline size={18} /> Logout
                  </button>
              </div>
            </>
          )}
        </div>
      </header>
 
      {/* 🌟 PROFILE MODAL 🌟 */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
               
                <div className="bg-slate-900 px-8 py-8 text-white flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            {isEditing ? 'Modify Station Info' : 'Station Registry'}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                             <span className="px-3 py-1 bg-[#08B36A] rounded-lg text-[10px] font-black uppercase tracking-widest">{profileData?.stationCode}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{profileData?.operatingZone}</span>
                        </div>
                    </div>
                    <button onClick={() => setIsProfileModalOpen(false)} className="relative z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <FaTimes size={18} />
                    </button>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#08B36A] rounded-full blur-3xl opacity-20"></div>
                </div>
 
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleProfileSubmit}>
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-4xl uppercase">
                                        {formData.stationName?.charAt(0)}
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaCamera className="text-white mb-1" size={24} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </div>
 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <InputGroup label="Fire Station Name" name="stationName" value={formData.stationName} onChange={handleInputChange} isEditing={isEditing} icon={FaFireExtinguisher} />
                            <InputGroup label="Officer In Charge" name="captainName" value={formData.captainName} onChange={handleInputChange} isEditing={isEditing} icon={FaUserTie} />
                            <InputGroup label="Official Email" name="email" value={formData.email} isEditing={false} icon={FaEnvelope} />
                            <InputGroup label="Mobile Contact" name="phone" value={formData.phone} onChange={handleInputChange} isEditing={isEditing} icon={FaPhoneAlt} />
                            <InputGroup label="Landline" name="landline" value={formData.landline} onChange={handleInputChange} isEditing={isEditing} icon={FaPhoneAlt} />
                            <InputGroup label="Emergency Lines" name="emergencyLines" value={formData.emergencyLines} onChange={handleInputChange} isEditing={isEditing} icon={FaBroadcastTower} />
                            <InputGroup label="Office Desk ID" name="officeDesk" value={formData.officeDesk} onChange={handleInputChange} isEditing={isEditing} icon={FaDesktop} />
                            <InputGroup label="Operating Zone" name="operatingZone" value={formData.operatingZone} onChange={handleInputChange} isEditing={isEditing} icon={FaMapMarkerAlt} />
                           
                            <div className="md:col-span-2">
                                <InputGroup label="Operational Address" name="address" value={formData.address} onChange={handleInputChange} isEditing={isEditing} icon={FaMapMarkerAlt} />
                            </div>
                        </div>
 
                        <div className="mt-10 flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)} className="px-8 py-3.5 bg-[#08B36A] text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:scale-105 transition-all text-xs uppercase tracking-widest">
                                    <FaUserEdit className="inline mr-2" /> Modify Profile
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-600">Cancel</button>
                                    <button type="submit" disabled={isLoading} className="px-10 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:scale-105 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
                                        {isLoading ? 'Syncing...' : <><FaCheckCircle className="inline mr-2" /> Save Changes</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </>
  )
}
 