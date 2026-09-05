'use client'

import React, { useState } from 'react'
import { FaHospital, FaCalendarAlt } from "react-icons/fa"
import ManageHospitalReschedule from './ManageHospitalRechedule'
import ManageHospitalApproval from './components/ManageHospitalApproval'

export default function HospitalPage() {
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-slate-800 font-sans">
            {/* --- TOP BAR: TITLE & RESCHEDULE BUTTON --- */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#08B36A] text-white rounded-2xl shadow-sm">
                        <FaHospital size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Administration</h1>
                        <p className="text-xs text-slate-400">Review onboarding approvals and configure global bed reschedule policies.</p>
                    </div>
                </div>

                {/* Reschedule Limit Configuration Modal Trigger */}
                <button
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#08B36A] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#08B36A]/20 hover:bg-[#06965a] transition-all duration-300 active:scale-95 whitespace-nowrap"
                >
                    <FaCalendarAlt />
                    Manage Reschedule Limits
                </button>
            </div>

            {/* --- MAIN CONTENT AREA: HOSPITAL APPROVALS LIST --- */}
            <div className="max-w-7xl mx-auto">
                <ManageHospitalApproval />
            </div>

            {/* --- RESCHEDULE MODAL --- */}
            {isRescheduleModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsRescheduleModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold text-xl p-2 rounded-full z-10 transition"
                        >
                            ✕
                        </button>
                        <div className="p-6 md:p-8">
                            <ManageHospitalReschedule onClose={() => setIsRescheduleModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}