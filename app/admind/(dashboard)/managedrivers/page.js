'use client'

import React, { useState } from 'react'
import { FaPrescriptionBottle, FaFlask, FaUserNurse, FaAmbulance } from "react-icons/fa"

// Import our sub-components
import ManagePharmacyDrivers from './components/ManagePharmacyDrivers'
import ManageLabDrivers from './components/ManageLabDrivers'
import ManageNurseDrivers from './components/ManageNurseDrivers'
import ManageAmbulanceDrivers from './components/ManageAmbulanceDrivers'

export default function DriversPage() {
    const [activeTab, setActiveTab] = useState('pharmacy')

    const navItems = [
        { id: 'pharmacy', label: 'Pharmacy', icon: <FaPrescriptionBottle /> },
        { id: 'lab', label: 'Lab Units', icon: <FaFlask /> },
        { id: 'nurse', label: 'Home Nurse', icon: <FaUserNurse /> },
        { id: 'ambulance', label: 'Ambulance', icon: <FaAmbulance /> },
    ]

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'pharmacy': return <ManagePharmacyDrivers />
            case 'lab': return <ManageLabDrivers />
            case 'nurse': return <ManageNurseDrivers />
            case 'ambulance': return <ManageAmbulanceDrivers />
            default: return <ManagePharmacyDrivers />
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-4 text-slate-800">
            {/* --- NAVIGATION TABS --- */}
            <div className="max-w-7xl mx-auto mb-1">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap md:flex-nowrap gap-1">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl 
                                    text-[12px] font-bold uppercase tracking-widest transition-all duration-200
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                                `}
                            >
                                <span className={`text-base ${isActive ? 'text-[#08B36A]' : ''}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto">
                {/* Component Container */}
                <div className="p-6 md:p-4">
                    {renderActiveComponent()}
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="max-w-7xl mx-auto mt-10 text-center">
                <p className="text-slate-400 text-[11px] uppercase tracking-[0.3em]">
                    Logistics Control Panel &bull; Secure Access
                </p>
            </div>

        </div>
    )
}