'use client'
import React, { useState } from 'react'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
import { FaUserCircle, FaUserAlt, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline, IoNotificationsOutline } from 'react-icons/io5'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TopbarPoliceHeadquarter({ onToggleSidebar, isCollapsed }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for Popup
  const router = useRouter();

  // --- CONFIRMED LOGOUT FUNCTION ---
  const handleConfirmLogout = () => {
    localStorage.removeItem('policeHeadToken'); // Remove Token
    setIsLogoutModalOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
        
        {/* Left Side: Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-[#08B36A] hover:bg-green-50 rounded-xl transition-all duration-200 active:scale-95"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <RiMenuUnfoldLine size={22} />
            ) : (
              <RiMenuFoldLine size={22} />
            )}
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#08B36A] hidden sm:block" size={18} />
            <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wider hidden sm:block">
              Police Headquarters
            </h1>
          </div>
        </div>

        {/* Right Side: Notifications & Officer Profile Section */}
        <div className="flex items-center gap-2 sm:gap-4 relative">
          
          {/* Notification Icon */}
          <button className="relative p-2.5 text-slate-500 hover:text-[#08B36A] hover:bg-green-50 rounded-xl transition-all duration-200 group">
            <IoNotificationsOutline size={24} />
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white text-white text-[9px] font-black flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
              3
            </span>
          </button>

          <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>

          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center gap-3 pl-3 pr-1 py-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-[#08B36A] transition-colors">
                Officer Karan
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Badge: #9042 • Sector 74
              </p>
            </div>
            
            <div className="relative">
              <FaUserCircle size={36} className="text-slate-200 group-hover:text-[#08B36A] transition-colors" />
              <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <IoChevronDown 
              size={14} 
              className={`text-slate-400 mr-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 mb-1 border-b border-gray-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Duty Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-700">On Duty</span>
                  </div>
                </div>

                <Link 
                  href="/policeandfire/policeheadquater/profile" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUserAlt size={13} />
                  Profile
                </Link>
                
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                
                <button 
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutModalOpen(true); // Open Modal instead of immediate logout
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsLogoutModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <FaExclamationTriangle size={28} />
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Logout</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Are you sure you want to end your shift and logout from the Headquarters portal?
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="py-3.5 px-6 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="py-3.5 px-6 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
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