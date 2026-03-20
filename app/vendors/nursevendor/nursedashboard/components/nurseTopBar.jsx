'use client'
import React, { useState } from 'react'
import { HiMenuAlt2 } from 'react-icons/hi'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
import { FaUserCircle, FaUserAlt } from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import Link from 'next/link'

export default function NurseTopBar({ onToggleSidebar, isCollapsed }) {
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

        <div>
          <h1 className="text-sm font-medium text-gray-400 uppercase tracking-wider hidden sm:block">
            Nurse Dashboard
          </h1>
        </div>
      </div>

      {/* Right Side: Enhanced Profile Section */}
      <div className="flex items-center relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="group flex items-center gap-3 pl-3 pr-1 py-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-[#08B36A] transition-colors">
              Nurse Maria
            </p>
            <p className="text-[11px] font-medium text-gray-400">
              ID: #29405 • Ward A
            </p>
          </div>
          
          <div className="relative">
            <FaUserCircle size={36} className="text-gray-300 group-hover:text-[#08B36A] transition-colors" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <IoChevronDown 
            size={14} 
            className={`text-gray-400 mr-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Invisible backdrop to close dropdown when clicking outside */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setIsDropdownOpen(false)}
            ></div>
            
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link 
                href="/vendors/nursevendor/profile" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUserAlt size={14} />
                My Profile
              </Link>
              
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              
              <button 
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false);
                  console.log("Logout clicked");
                }}
              >
                <IoLogOutOutline size={18} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}