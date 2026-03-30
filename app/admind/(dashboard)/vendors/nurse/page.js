'use client'
import React, { useState, useMemo } from 'react'
import {
  FaUserNurse, FaRegCircle, FaLayerGroup,
  FaCheckDouble, FaClock, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa"
import AddNurseType from './components/AddNurseType';
import NurseCategory from './components/NurseCategory';
import NurseVendor from './components/NurseVendor';
import PendingNurses from './components/PendingNurses';
import ApprovedNurses from './components/ApprovedNurses';
import RejectedNurses from './components/RejectedNurses';


export default function NurseAdminManagement() {
  const [activeMainTab, setActiveMainTab] = useState('vendor')
  const [activeSubTab, setActiveSubTab] = useState('nurse-vendor')

  const menuStructure = {
    vendor: {
      label: "Registry",
      icon: FaUserNurse,
      subs: [{ id: 'nurse-vendor', label: 'Nurse Vendor', icon: FaRegCircle }]
    },
    setup: {
      label: "Infrastructure",
      icon: FaLayerGroup,
      subs: [
        { id: 'add-nurse-type', label: 'Add New Type', icon: FaRegCircle },
        { id: 'view-nurse-category', label: 'View Categories', icon: FaRegCircle },
      ]
    },
    manage: {
      label: "Governance",
      icon: FaCheckDouble,
      subs: [
        { id: 'pending-nurses', label: 'Pending', icon: FaClock },
        { id: 'approved-nurses', label: 'Approved', icon: FaCheckCircle },
        { id: 'rejected-nurses', label: 'Rejected', icon: FaTimesCircle },
      ]
    }
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'nurse-vendor': return <NurseVendor />
      case 'add-nurse-type': return <AddNurseType />
      case 'pending-nurses': return <PendingNurses />
      case 'approved-nurses': return <ApprovedNurses />
      case 'rejected-nurses': return <RejectedNurses />
      default: return <NurseCategory />
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-gray-900 selection:bg-[#08B36A]/20 font-sans antialiased">
      {/* --- TOP HEADER --- */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12 h-full">
              <div className="hidden lg:flex gap-8 h-full">
                {Object.entries(menuStructure).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveMainTab(key)
                      setActiveSubTab(value.subs[0].id)
                    }}
                    className={`relative flex items-center gap-2.5 px-1 h-full transition-all font-black text-[11px] uppercase tracking-[0.15em] border-b-2 ${activeMainTab === key ? 'text-[#08B36A] border-[#08B36A]' : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                  >
                    <value.icon size={14} />
                    {value.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- SECONDARY SUB NAV --- */}
      <nav className="bg-white border-b border-gray-100 py-4 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {menuStructure[activeMainTab].subs.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeSubTab === sub.id
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <sub.icon size={11} className={activeSubTab === sub.id ? 'text-[#08B36A]' : 'text-gray-300'} />
              {sub.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="transition-all duration-300 transform">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}