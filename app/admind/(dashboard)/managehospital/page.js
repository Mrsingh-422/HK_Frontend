'use client'

import React, { useState } from 'react'
import { FaHospital, FaFileInvoiceDollar, FaHistory, FaPlus } from "react-icons/fa"
import ManageHospital from './components/ManageHospital'
import HospitalMinCharges from './components/HospitalMinCharges'
import HospitalDischargeHistory from './components/HospitalDischargeHistory'

// Sub-components

export default function HospitalPage() {
    const [activeTab, setActiveTab] = useState('manage')

    const tabs = [
        { id: 'manage', label: 'Manage Hospital', icon: <FaHospital /> },
        { id: 'charges', label: 'Hospital Minimum Charges', icon: <FaFileInvoiceDollar /> },
        { id: 'history', label: 'Discharge History', icon: <FaHistory /> },
    ]

    const renderComponent = () => {
        switch (activeTab) {
            case 'manage': return <ManageHospital />
            case 'charges': return <HospitalMinCharges />
            case 'history': return <HospitalDischargeHistory />
            default: return <ManageHospital />
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-4 text-slate-800">
            {/* --- NAVIGATION TABS --- */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap md:flex-nowrap gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl 
                                    text-[12px] font-black uppercase tracking-widest transition-all duration-300
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-xl scale-[1.02]'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                                `}
                            >
                                <span className={isActive ? 'text-[#08B36A]' : ''}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto">
                <div className="rounded-[2.5rem] overflow-hidden min-h-[600px]">
                    {renderComponent()}
                </div>
            </div>
        </div>
    )
}