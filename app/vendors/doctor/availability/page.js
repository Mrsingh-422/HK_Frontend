'use client'
import React, { useState } from 'react'
import { 
    FaCalendarAlt, FaClock, FaSun, FaCloudSun, FaMoon, 
    FaSave, FaSyncAlt, FaCheckCircle
} from "react-icons/fa";

export default function AvailabilityPage() {
    // ==========================================
    // 🌟 1. STATE MANAGEMENT
    // ==========================================
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form State
    const[formData, setFormData] = useState({
        startDate: '', endDate: '',
        morningStart: '', morningEnd: '', morningDuration: '',
        afternoonStart: '', afternoonEnd: '', afternoonDuration: '',
        eveningStart: '', eveningEnd: '', eveningDuration: '',
    });

    // Dummy Table Data
    const[tableData, setTableData] = useState([
        { id: 1, date: '2026-03-28', morning: { time: '06:00 AM - 11:00 AM', duration: '10' }, afternoon: { time: '-', duration: '-' }, evening: { time: '-', duration: '-' }, status: 'Available' },
        { id: 2, date: '2026-03-27', morning: { time: '06:30 AM - 11:30 AM', duration: '15' }, afternoon: { time: '12:00 PM - 03:00 PM', duration: '15' }, evening: { time: '-', duration: '-' }, status: 'Available' },
        { id: 3, date: '2026-03-26', morning: { time: '08:00 AM - 11:59 AM', duration: '20' }, afternoon: { time: '-', duration: '-' }, evening: { time: '05:00 PM - 09:00 PM', duration: '20' }, status: 'Available' },
        { id: 4, date: '2026-03-25', morning: { time: '06:00 AM - 11:00 AM', duration: '10' }, afternoon: { time: '-', duration: '-' }, evening: { time: '-', duration: '-' }, status: 'Available' },
    ]);

    // ==========================================
    // 🌟 2. HANDLERS
    // ==========================================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert("Availability slots saved successfully!");
        }, 1000);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simulate data fetch
        setTimeout(() => {
            setIsRefreshing(false);
        }, 800);
    };

    return (
        <div className="pb-10 max-w-6xl mx-auto">
            
            {/* --- PAGE HEADER --- */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Availability</h1>
                <p className="text-sm text-gray-500 mt-1">Set your working dates, time slots, and consultation durations.</p>
            </div>

            {/* ========================================== */}
            {/* 🌟 FORM SECTION 🌟 */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
                <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[#1e3a8a] text-center">Set Your Availability Slots</h2>
                </div>

                <form onSubmit={handleSave} className="p-6 md:p-8">
                    
                    {/* 📅 Date Range Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-[#08B36A] mb-2">Start Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] outline-none transition-all text-sm font-medium text-gray-700"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#08B36A] mb-2">End Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] outline-none transition-all text-sm font-medium text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-8"></div>

                    {/* 🌅 Morning Slot */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FaSun className="text-amber-500 text-lg" />
                            <h3 className="text-base font-bold text-[#1e3a8a]">Morning Slot Time</h3>
                            <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-md ml-2">(06:00 AM - 11:59 AM)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">Start Time</label>
                                <input type="time" name="morningStart" value={formData.morningStart} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">End Time</label>
                                <input type="time" name="morningEnd" value={formData.morningEnd} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">Duration (Mins)</label>
                                <input type="number" placeholder="e.g., 15" name="morningDuration" value={formData.morningDuration} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                        </div>
                    </div>

                    {/* 🌤️ Afternoon Slot */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FaCloudSun className="text-blue-500 text-lg" />
                            <h3 className="text-base font-bold text-[#1e3a8a]">Afternoon Slot Time</h3>
                            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md ml-2">(12:00 PM - 16:59 PM)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">Start Time</label>
                                <input type="time" name="afternoonStart" value={formData.afternoonStart} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">End Time</label>
                                <input type="time" name="afternoonEnd" value={formData.afternoonEnd} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">Duration (Mins)</label>
                                <input type="number" placeholder="e.g., 15" name="afternoonDuration" value={formData.afternoonDuration} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                        </div>
                    </div>

                    {/* 🌙 Evening Slot */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <FaMoon className="text-indigo-500 text-lg" />
                            <h3 className="text-base font-bold text-[#1e3a8a]">Evening Slot Time</h3>
                            <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md ml-2">(17:00 PM - 23:59 PM)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">Start Time</label>
                                <input type="time" name="eveningStart" value={formData.eveningStart} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">End Time</label>
                                <input type="time" name="eveningEnd" value={formData.eveningEnd} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#08B36A] mb-1.5 uppercase tracking-wide">Duration (Mins)</label>
                                <input type="number" placeholder="e.g., 15" name="eveningDuration" value={formData.eveningDuration} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none transition-all text-sm font-medium" />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center border-t border-gray-100 pt-8">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-10 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${isSaving ? 'bg-[#069c5c] cursor-not-allowed opacity-80' : 'bg-[#08B36A] hover:bg-[#069c5c] hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            {isSaving ? (
                                <><FaSyncAlt className="animate-spin" /> Saving...</>
                            ) : (
                                <><FaSave className="text-lg" /> Save Availability</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* ========================================== */}
            {/* 🌟 TABLE SECTION 🌟 */}
            {/* ========================================== */}
            <div className="mb-4">
                <button 
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                >
                    <FaSyncAlt className={`text-[#08B36A] ${isRefreshing ? 'animate-spin' : ''}`} /> 
                    {isRefreshing ? 'Refreshing...' : 'Refresh List'}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Sr. No</th>
                                <th className="px-6 py-4 font-bold text-left">Date</th>
                                <th className="px-6 py-4 font-bold">Morning</th>
                                <th className="px-6 py-4 font-bold">Afternoon</th>
                                <th className="px-6 py-4 font-bold">Evening</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tableData.map((row, index) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
                                    
                                    <td className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-800">{row.date}</span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-gray-700">{row.morning.time}</span>
                                            {row.morning.duration !== '-' && <span className="text-[10px] text-[#08B36A] font-bold uppercase mt-0.5">{row.morning.duration} mins/slot</span>}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-gray-700">{row.afternoon.time}</span>
                                            {row.afternoon.duration !== '-' && <span className="text-[10px] text-[#08B36A] font-bold uppercase mt-0.5">{row.afternoon.duration} mins/slot</span>}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-gray-700">{row.evening.time}</span>
                                            {row.evening.duration !== '-' && <span className="text-[10px] text-[#08B36A] font-bold uppercase mt-0.5">{row.evening.duration} mins/slot</span>}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                            <FaCheckCircle /> {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}