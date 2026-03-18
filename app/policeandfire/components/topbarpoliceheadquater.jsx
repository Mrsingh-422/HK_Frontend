'use client'
import React, { useState } from 'react'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
import { FaUserCircle, FaUserAlt, FaShieldAlt } from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import Link from 'next/link'

export default function TopbarPoliceHeadquarter({ onToggleSidebar, isCollapsed }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
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

      {/* Right Side: Officer Profile Section */}
      <div className="flex items-center relative">
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
            {/* Online Indicator */}
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
                href="/vendors/nursevendor/profile" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUserAlt size={13} />
                Duty Profile
              </Link>
              
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              
              <button 
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false);
                  console.log("Logout triggered");
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
  )
}