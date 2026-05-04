'use client'
import React, { useState } from 'react'
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri'
import { FaUserCircle, FaFireExtinguisher, FaBell, FaBroadcastTower } from 'react-icons/fa'
import { IoChevronDown, IoLogOutOutline } from 'react-icons/io5'
import Link from 'next/link'

export default function TopbarFireStation({ onToggleSidebar, isCollapsed }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
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
            <p className="text-sm font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">Capt. Sharma</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Marshall • #FR-742</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#08B36A] flex items-center justify-center text-white border-2 border-white shadow-md">
                 <FaUserCircle size={40} className="opacity-90" />
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

                <Link href="/policeandfire/firestation/settings" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-[#08B36A] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                    <FaFireExtinguisher size={13} className="text-green-400" /> My Equipment
                </Link>
                
                <div className="h-px bg-green-50 my-2 mx-4"></div>
                
                <button 
                    className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-black text-[#08B36A] hover:bg-green-50 transition-colors"
                    onClick={() => {
                        setIsDropdownOpen(false);
                        console.log("Logout triggered");
                    }}
                >
                    <IoLogOutOutline size={18} /> Logout
                </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}