"use client";

import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTimes, FaSpinner, FaChevronRight, FaSun, FaCloudSun, FaMoon } from 'react-icons/fa';
import UserAPI from '@/app/services/UserAPI';
import toast from 'react-hot-toast';

const SlotSelectionModal = ({ isOpen, onClose, labId, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isClosed, setIsClosed] = useState(false);

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate()
        };
    });

    useEffect(() => {
        if (isOpen && labId) {
            fetchSlots();
        }
    }, [isOpen, selectedDate, labId]);

    const fetchSlots = async () => {
        setLoading(true);
        setSelectedSlot(null);
        try {
            // MATCHING YOUR API: Passing labId and selectedDate as two arguments
            const res = await UserAPI.getLabSlots(labId, selectedDate);
            if (res.success) {
                setSlots(res.slots || []);
                setIsClosed(res.isClosed || false);
            }
        } catch (error) {
            toast.error("Failed to fetch slots");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const categories = {
        Morning: { icon: <FaSun className="text-orange-400" />, label: "Morning" },
        Afternoon: { icon: <FaCloudSun className="text-amber-500" />, label: "Afternoon" },
        Evening: { icon: <FaMoon className="text-indigo-400" />, label: "Evening" }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Select Appointment</h2>
                        <p className="text-xs text-gray-500 font-medium">Available slots for home collection</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaTimes className="text-gray-400" /></button>
                </div>

                <div className="p-6">
                    {/* Date Selector */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {dates.map((item) => (
                            <button
                                key={item.full}
                                onClick={() => setSelectedDate(item.full)}
                                className={`flex-shrink-0 w-16 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${selectedDate === item.full ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 bg-gray-50 text-gray-400"}`}
                            >
                                <span className="text-[10px] font-bold uppercase">{item.day}</span>
                                <span className="text-lg font-black">{item.date}</span>
                            </button>
                        ))}
                    </div>

                    {/* Slots List */}
                    <div className="mt-6 min-h-[300px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full pt-20">
                                <FaSpinner className="animate-spin text-emerald-500 text-3xl mb-3" />
                                <p className="text-sm text-gray-400">Fetching slots...</p>
                            </div>
                        ) : isClosed ? (
                            <div className="text-center py-12">
                                <FaCalendarAlt className="text-rose-200 text-5xl mx-auto mb-4" />
                                <h3 className="font-bold text-gray-900">Lab is Closed</h3>
                                <p className="text-sm text-gray-500">No slots available for this date.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.keys(categories).map((cat) => {
                                    const catSlots = slots.filter(s => s.category === cat);
                                    if (catSlots.length === 0) return null;
                                    return (
                                        <div key={cat}>
                                            <div className="flex items-center gap-2 mb-3">
                                                {categories[cat].icon}
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {catSlots.map((slot, idx) => (
                                                    <button
                                                        key={idx}
                                                        disabled={slot.isFull}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`relative p-3 rounded-xl border-2 text-center transition-all ${selectedSlot?.time === slot.time ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold" : slot.isFull ? "bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-100 text-gray-700"}`}
                                                    >
                                                        <div className="text-sm">{slot.time}</div>
                                                        {slot.extraFee > 0 && (
                                                            <div className="text-[8px] font-black text-amber-600 bg-amber-100 rounded px-1 absolute -top-2 left-1/2 -translate-x-1/2">
                                                                +₹{slot.extraFee}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        disabled={!selectedSlot}
                        onClick={() => onConfirm(selectedDate, selectedSlot)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        Confirm Appointment <FaChevronRight size={14} />
                    </button>
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default SlotSelectionModal;