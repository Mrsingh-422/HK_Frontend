
"use client"
import React, { useState } from 'react';
import ManageDoctorReschedule from './components/ManageDoctorRechedule'; // Adjust path
import { CalendarRange, Users } from 'lucide-react';

function Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Users className="text-[#08B36A]" />
                            Manage Doctors
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">Review, edit, and configure doctor appointment settings.</p>
                    </div>

                    {/* TRIGGER BUTTON */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#08B36A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#079e5e] transition-all shadow-lg shadow-[#08B36A]/20 active:scale-95"
                    >
                        <CalendarRange size={20} />
                        Reschedule Settings
                    </button>
                </div>

                {/* Dashboard Placeholder */}
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl h-96 flex items-center justify-center text-slate-400">
                    <p>Doctor List Content Goes Here...</p>
                </div>

                {/* MODAL COMPONENT */}
                <ManageDoctorReschedule 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </div>
        </div>
    );
}

export default Page;