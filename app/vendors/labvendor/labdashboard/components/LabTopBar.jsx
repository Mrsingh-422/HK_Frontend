'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  FaBars, FaBell, FaUserCircle, FaSearch, 
  FaSignOutAlt, FaChevronDown 
} from 'react-icons/fa'

export default function LabTopBar({ onMobileMenuClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  },[]);

  // Dropdown Menu Items Array
  const menuItems =[
    { name: 'Profile', href: '/vendors/labvendor/lab-profile', icon: FaUserCircle },
  ];

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      
      {/* Left Side: Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMobileMenuClick} 
          className="lg:hidden p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button className="p-2 text-gray-400 hover:text-[#08B36A] hover:bg-green-50 rounded-full transition-colors relative">
          <FaBell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* Profile Dropdown Area */}
        <div className="relative" ref={dropdownRef}>
          
          {/* Profile Trigger Button */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-all text-left border border-transparent hover:border-gray-200"
          >
            <FaUserCircle size={32} className="text-gray-400" />
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-700 leading-tight">Admin User</p>
              <p className="text-xs font-medium text-gray-500">Lab Manager</p>
            </div>
            <FaChevronDown 
              size={12} 
              className={`hidden md:block text-gray-400 transition-transform duration-300 ml-1 ${
                isDropdownOpen ? "rotate-180 text-[#08B36A]" : ""
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              
              {/* Mobile View Profile Details */}
              <div className="block md:hidden px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                <p className="text-sm font-bold text-gray-800">Admin User</p>
                <p className="text-xs font-medium text-gray-500">Lab Manager</p>
              </div>

              {/* Dynamic Menu Items (Profile Link) */}
              {menuItems.map((item, index) => (
                <Link 
                  key={index}
                  href={item.href}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#08B36A] hover:bg-green-50 transition-colors"
                >
                  <item.icon className="text-lg opacity-80" />
                  {item.name}
                </Link>
              ))}

              <div className="my-1 border-t border-gray-100"></div>

              {/* Sign Out Button */}
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  alert("Logged out successfully!");
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-lg opacity-80" />
                Sign Out
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  )
}