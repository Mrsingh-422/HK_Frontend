'use client'
import React, { useState, useEffect } from 'react'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
import { FaUserCircle, FaFireExtinguisher, FaBell, FaBroadcastTower, FaUserCog, FaTimes, FaCamera, FaUserEdit, FaCheckCircle } from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FireStationAPI from '@/app/services/FireStationAPI'

// 🌟 HELPER FUNCTION: To format image URL correctly from backend 🌟
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Agar image preview blob hai (jab user local PC se select karta hai)
    if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) {
        return imagePath;
    }
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
    // API se aane wale 'public/' prefix ko remove karo aur backend url add karo
    const cleanPath = imagePath.replace(/^public\//, '');
    return `${backendUrl}/${cleanPath}`;
};

// Helper component Inputs ke liye
const InputGroup = ({ label, name, value, onChange, isEditing }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        {isEditing ? (
            <input 
                type="text" 
                name={name} 
                value={value} 
                onChange={onChange} 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:bg-white transition-all"
            />
        ) : (
            <div className="px-4 py-2.5 bg-slate-50/50 border border-transparent rounded-xl text-sm font-bold text-slate-800 break-words">
                {value || '-'}
            </div>
        )}
    </div>
);

export default function TopbarFireStation({ onToggleSidebar, isCollapsed }) {
  const router = useRouter();

  // Topbar States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Modal & Form States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
      stationName: '',
      captainName: '',
      phone: '',
      landline: '',
      emergencyLines: '',
      address: '',
      profileImage: null
  });

  // 1. Local Storage se Login API ka save kiya hua data nikalna
  const loadProfileData = () => {
    try {
      const localData = localStorage.getItem('firestationData'); 
      if (localData) {
        setProfileData(JSON.parse(localData));
      }
    } catch (error) {
      console.error("Failed to parse profile data:", error);
    }
  };

  useEffect(() => {
    loadProfileData();
    window.addEventListener('profileUpdated', loadProfileData);
    return () => window.removeEventListener('profileUpdated', loadProfileData);
  }, []);

  // Jab modal open ho, toh saved data ko form mein bharna
  useEffect(() => {
    if (profileData && isProfileModalOpen) {
        setFormData({
            stationName: profileData.stationName || '',
            captainName: profileData.captainName || '',
            phone: profileData.phone || '',
            landline: profileData.landline || '',
            emergencyLines: profileData.emergencyLines || '',
            address: profileData.address || '',
            profileImage: null
        });
        // 🌟 Apply getImageUrl here for modal preview 🌟
        setImagePreview(profileData.profileImage ? getImageUrl(profileData.profileImage) : null);
        setIsEditing(false);
    }
  }, [profileData, isProfileModalOpen]);

  // Logout Handler
  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('firestationToken'); 
    localStorage.removeItem('firestationData');  
    router.push('/policeandfire/login');
  };

  // Modal Form Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData(prev => ({ ...prev, profileImage: file }));
        setImagePreview(URL.createObjectURL(file)); // Local preview before upload
    }
  };

  // 2. Profile Update Handle Karna
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const submitData = new FormData();
        submitData.append('stationName', formData.stationName);
        submitData.append('captainName', formData.captainName);
        submitData.append('phone', formData.phone);
        submitData.append('landline', formData.landline);
        submitData.append('emergencyLines', formData.emergencyLines);
        submitData.append('address', formData.address);
        
        if (formData.profileImage) {
            submitData.append('profileImage', formData.profileImage);
        }

        const response = await FireStationAPI.UpdateProfile(submitData);
        
        if (response.success) {
            setIsEditing(false);
            
            const updatedProfileData = response.data || { 
                ...profileData, 
                ...formData, 
                // Agar nayi image upload nahi ki to purani rakho
                profileImage: response.data?.profileImage || profileData.profileImage 
            };
            
            localStorage.setItem('firestationData', JSON.stringify(updatedProfileData));
            setProfileData(updatedProfileData); 

            // Trigger an event so Dashboard also gets updated data
            window.dispatchEvent(new Event('profileUpdated'));
            
            alert("Profile updated successfully!");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      {/* ----------------- TOPBAR HEADER ----------------- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-50 h-20 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleSidebar} 
            className="p-2.5 text-slate-400 hover:text-[#08B36A] hover:bg-green-50 rounded-xl transition-all shadow-sm bg-white border border-green-50"
          >
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
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-green-600 border-2 border-white rounded-full animate-ping"></span>
          </button>

          <div className="h-8 w-[1px] bg-green-50 mx-2 hidden md:block"></div>

          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="group flex items-center gap-4 pl-4 pr-2 py-2 rounded-[1.25rem] hover:bg-green-50/50 transition-all border border-transparent hover:border-green-100"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">
                {profileData ? profileData.stationName : 'Loading...'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                 {profileData ? `#${profileData.stationCode}` : '----'}
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#08B36A] flex items-center justify-center text-white border-2 border-white shadow-md overflow-hidden">
                  {/* 🌟 IMAGE FIX: Wrapped profileImage with getImageUrl 🌟 */}
                  {profileData?.profileImage ? (
                    <img src={getImageUrl(profileData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle size={40} className="opacity-90" />
                  )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <IoChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-green-50 rounded-[2rem] shadow-[0_20px_50px_rgba(8,179,106,0.12)] py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="px-5 py-3 mb-2 border-b border-green-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Readiness</p>
                      <div className="flex items-center gap-2 mt-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span className="text-xs font-black text-slate-700">Comms Active</span>
                      </div>
                  </div>

                  <button 
                      onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }} 
                      className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors"
                  >
                      <FaUserCog size={14} className="text-green-400" /> View/Edit Profile
                  </button>

                  <Link href="/policeandfire/firestation/equipment" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <FaFireExtinguisher size={13} className="text-green-400" /> My Equipment
                  </Link>
                  
                  <div className="h-px bg-green-50 my-2 mx-4"></div>
                  
                  <button 
                      className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                  >
                      <IoLogOutOutline size={18} /> Logout
                  </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ----------------- PROFILE EDIT MODAL (INTEGRATED) ----------------- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Modal Header */}
                <div className="bg-green-50/50 px-6 py-4 flex items-center justify-between border-b border-green-100">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">
                            {isEditing ? 'Edit Station Profile' : 'Station Profile Details'}
                        </h2>
                        <p className="text-xs font-bold text-[#08B36A] uppercase tracking-widest mt-1">
                            {profileData?.stationCode || 'N/A'} • {profileData?.operatingZone || 'N/A'}
                        </p>
                    </div>
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleProfileSubmit}>
                        
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center mb-8 relative">
                            <div className="w-24 h-24 rounded-2xl bg-green-100 border-4 border-white shadow-lg overflow-hidden relative group flex-shrink-0">
                                {/* 🌟 IMAGE FIX: Modal image handled here 🌟 */}
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#08B36A] font-bold text-3xl uppercase">
                                        {formData.stationName ? formData.stationName.charAt(0) : 'F'}
                                    </div>
                                )}
                                
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaCamera className="text-white mb-1" size={20} />
                                        <span className="text-[10px] text-white font-bold">CHANGE</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                            {!isEditing && profileData?.email && (
                                <p className="mt-3 text-sm font-bold text-slate-500">{profileData.email}</p>
                            )}
                        </div>

                        {/* Input Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup label="Station Name" name="stationName" value={formData.stationName} onChange={handleInputChange} isEditing={isEditing} />
                            <InputGroup label="Captain Name" name="captainName" value={formData.captainName} onChange={handleInputChange} isEditing={isEditing} />
                            <InputGroup label="Mobile Phone" name="phone" value={formData.phone} onChange={handleInputChange} isEditing={isEditing} />
                            <InputGroup label="Landline" name="landline" value={formData.landline} onChange={handleInputChange} isEditing={isEditing} />
                            <InputGroup label="Emergency Lines" name="emergencyLines" value={formData.emergencyLines} onChange={handleInputChange} isEditing={isEditing} />
                            <div className="md:col-span-2">
                                <InputGroup label="Complete Address" name="address" value={formData.address} onChange={handleInputChange} isEditing={isEditing} />
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-8 flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md shadow-green-200 hover:bg-green-600 transition-all">
                                    <FaUserEdit /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md shadow-green-200 hover:bg-green-600 transition-all disabled:opacity-70">
                                        {isLoading ? 'Saving...' : <><FaCheckCircle /> Save Changes</>}
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