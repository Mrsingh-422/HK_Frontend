"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarDay, FaClock, FaTimes, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';

const PharmacySlotModal = ({ isOpen, onClose, onSelectSlot, pharmacyId }) => {
    // Helper to format date for API (YYYY-MM-DD)
    const formatDateForAPI = (date) => date.toISOString().split('T')[0];

    // Helper to format date for Display (25 Apr)
    const formatDateForDisplay = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    const [dates] = useState(() => [
        { label: 'Today', apiValue: formatDateForAPI(new Date()), display: formatDateForDisplay(new Date()) },
        { label: 'Tomorrow', apiValue: formatDateForAPI(new Date(Date.now() + 86400000)), display: formatDateForDisplay(new Date(Date.now() + 86400000)) },
        { label: 'Upcoming', apiValue: formatDateForAPI(new Date(Date.now() + 172800000)), display: formatDateForDisplay(new Date(Date.now() + 172800000)) }
    ]);

    const [selectedDate, setSelectedDate] = useState(dates[0].apiValue);
    const [slots, setSlots] = useState([]);
    const [isPharmacyClosed, setIsPharmacyClosed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSlotData, setSelectedSlotData] = useState(null);

    const fetchSlots = useCallback(async () => {
        if (!pharmacyId || !selectedDate) return;
        setLoading(true);
        setSelectedSlotData(null); // Reset selection on date change
        try {
            const res = await UserAPI.getPharmacySlots(pharmacyId, selectedDate);
            // res matches the structure: { success, isClosed, pharmacyId, slots: [...] }
            if (res.success) {
                setSlots(res.slots || []);
                setIsPharmacyClosed(res.isClosed || false);
            }
        } catch (error) {
            console.error("Error fetching slots", error);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, [pharmacyId, selectedDate]);

    useEffect(() => {
        if (isOpen) fetchSlots();
    }, [isOpen, fetchSlots]);

    // Group slots by category (Morning, Afternoon, Evening)
    const groupedSlots = slots.reduce((acc, slot) => {
        const cat = slot.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(slot);
        return acc;
    }, {});

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!selectedSlotData) return;
        const dateDisplay = dates.find(d => d.apiValue === selectedDate).display;
        onSelectSlot({
            displayText: `${dateDisplay}, ${selectedSlotData.time} (${selectedSlotData.category})`,
            fee: selectedSlotData.extraFee || 0
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <FaCalendarDay className="text-emerald-600" /> Select Delivery Slot
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Choose a convenient time</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-rose-500">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Picker */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Date</label>
                        <div className="grid grid-cols-3 gap-3">
                            {dates.map((date) => (
                                <button
                                    key={date.apiValue}
                                    onClick={() => setSelectedDate(date.apiValue)}
                                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${selectedDate === date.apiValue
                                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10'
                                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black uppercase ${selectedDate === date.apiValue ? 'text-emerald-700' : 'text-slate-400'}`}>{date.label}</span>
                                    <span className={`text-xs font-bold ${selectedDate === date.apiValue ? 'text-emerald-600' : 'text-slate-700'}`}>{date.display}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Available Slots</label>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1 min-h-[150px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                    <FaSpinner className="animate-spin mb-2" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Fetching Slots...</span>
                                </div>
                            ) : isPharmacyClosed ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-rose-50 rounded-2xl border border-rose-100 p-6">
                                    <FaExclamationTriangle className="text-rose-500 mb-3" size={24} />
                                    <h4 className="text-xs font-black text-rose-900 uppercase">Pharmacy Closed</h4>
                                    <p className="text-[10px] text-rose-600 font-bold mt-1 uppercase">No slots available for the selected date.</p>
                                </div>
                            ) : Object.keys(groupedSlots).length > 0 ? (
                                Object.entries(groupedSlots).map(([category, categorySlots]) => (
                                    <div key={category} className="mb-4 last:mb-0">
                                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] mb-2 px-1 border-l-2 border-emerald-500 ml-1">{category}</h5>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categorySlots.map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    disabled={slot.isFull}
                                                    onClick={() => setSelectedSlotData(slot)}
                                                    className={`p-3 rounded-xl border flex flex-col items-start transition-all ${slot.isFull ? 'opacity-40 cursor-not-allowed bg-gray-50' :
                                                            selectedSlotData?.time === slot.time
                                                                ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between w-full mb-1">
                                                        <span className={`text-xs font-black tracking-tight ${selectedSlotData?.time === slot.time ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                            {slot.time}
                                                        </span>
                                                        {selectedSlotData?.time === slot.time && <FaCheckCircle className="text-emerald-500" size={12} />}
                                                    </div>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className={`text-[9px] font-bold ${slot.extraFee > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                            {slot.extraFee > 0 ? `+ ₹${slot.extraFee}` : 'Free'}
                                                        </span>
                                                        {slot.isFull && <span className="text-[8px] font-black text-rose-500 uppercase">Full</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-[10px] font-black uppercase">No slots available for this date</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-200">
                        Go Back
                    </button>
                    <button
                        disabled={!selectedSlotData || loading}
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-[1.5px] bg-[#08B36A] text-white hover:bg-slate-900 rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:bg-slate-200"
                    >
                        {loading ? 'Wait...' : 'Confirm Slot'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                @keyframes scale-in-center { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PharmacySlotModal;