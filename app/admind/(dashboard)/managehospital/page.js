'use client'

import React, { useState } from 'react'
import { FaHospital, FaFileInvoiceDollar, FaHistory, FaCalendarAlt } from "react-icons/fa"
import ManageHospital from './components/ManageHospital'
import HospitalMinCharges from './components/HospitalMinCharges'
import HospitalDischargeHistory from './components/HospitalDischargeHistory'
import ManageHospitalReschedule from './ManageHospitalRechedule'

export default function HospitalPage() {
    const [activeTab, setActiveTab] = useState('manage')
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

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
            {/* --- NAVIGATION TABS & ACTION BUTTON --- */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 bg-white p-2 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap md:flex-nowrap gap-2 w-full">
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

                {/* Reschedule Button */}
                <button
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#08B36A] text-white text-[12px] font-black uppercase tracking-widest shadow-lg hover:bg-[#06965a] transition-all duration-300 whitespace-nowrap"
                >
                    <FaCalendarAlt />
                    Manage Reschedule
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto">
                <div className="rounded-[2.5rem] overflow-hidden min-h-[600px]">
                    {renderComponent()}
                </div>
            </div>

            {/* --- RESCHEDULE MODAL --- */}
            {isRescheduleModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <button 
                            onClick={() => setIsRescheduleModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold text-xl"
                        >
                            ✕
                        </button>
                        <div className="p-8">
                            <ManageHospitalReschedule onClose={() => setIsRescheduleModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}