'use client'
import React, { useState, useEffect } from 'react'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
import { FaUserCircle, FaUserAlt, FaShieldAlt, FaBell, FaExclamationTriangle } from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PoliceAPI from '@/app/services/PoliceAPI' // Assuming the service is at this path

export default function TopbarPoliceStation({ onToggleSidebar, isCollapsed }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
  const [hasNotifications] = useState(true); 
  const [stationData, setStationData] = useState(null);
  const router = useRouter();

  // --- FETCH STATION PROFILE DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await PoliceAPI.getPoliceStationProfile();
        if (response.success) {
          setStationData(response.data);
        }
      } catch (error) {
        console.error("Error fetching station profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // --- CONFIRMED LOGOUT FUNCTION ---
  const handleConfirmLogout = () => {
    localStorage.removeItem('policeStationToken');
    setIsLogoutModalOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
        
        {/* --- LEFT: TOGGLE & TITLE --- */}
        <div className="flex items-center gap-6">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 text-slate-400 hover:text-[#08B36A] hover:bg-green-50 rounded-xl transition-all duration-200 active:scale-95 shadow-sm bg-white border border-slate-50"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <RiMenuUnfoldLine size={22} />
            ) : (
              <RiMenuFoldLine size={22} />
            )}
          </button>

          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] leading-none">
              {stationData?.stationName || "Police Station"}
            </h1>
            <p className="text-[10px] font-bold text-[#08B36A] uppercase tracking-widest mt-1.5">
              Precinct Dashboard
            </p>
          </div>
        </div>

        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="flex items-center gap-4 relative">
          
          {/* Notification Bell */}
          <button className="p-3 text-slate-300 hover:text-[#08B36A] hover:bg-slate-50 rounded-2xl transition-all relative group">
              <FaBell size={20} />
              {hasNotifications && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
          </button>

          <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

          {/* Officer Profile Card */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center gap-4 pl-4 pr-2 py-2 rounded-[1.25rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-[#08B36A] transition-colors">
                {stationData?.stationName || "Loading..."}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">
                {stationData ? `${stationData.stationCode} • ${stationData.jurisdictionArea}` : "Station Officer"}
              </p>
            </div>
            
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#08B36A] transition-all overflow-hidden border border-slate-200">
                  {stationData?.profileImage ? (
                    <img src={stationData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle size={40} className="scale-110" />
                  )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>

            <IoChevronDown 
              size={14} 
              className={`text-slate-400 mr-1 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-gray-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-5 py-3 mb-2 border-b border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-black text-slate-700">{stationData?.isActive ? "Station Active" : "Station Inactive"}</span>
                  </div>
                </div>

                <Link 
                  href="/policeandfire/policestation/profile" 
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUserAlt size={13} />
                  Station Profile
                </Link>
                
                <div className="h-px bg-slate-50 my-2 mx-4"></div>
                
                <button 
                  className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutModalOpen(true); 
                  }}
                >
                  <IoLogOutOutline size={18} />
                  End Shift / Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsLogoutModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <FaExclamationTriangle size={28} />
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Logout</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Are you sure you want to end your shift and logout from the Police Station portal?
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="py-3.5 px-6 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="py-3.5 px-6 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}