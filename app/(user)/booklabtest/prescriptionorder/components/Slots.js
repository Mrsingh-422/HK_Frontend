'use client';
import React, { useState, useEffect } from 'react';
import UserAPI from '@/app/services/UserAPI';
import { FaRegClock, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export default function Slots({ labId, onSlotSelect, onBack, onNext }) {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    if (labId) fetchSlots();
  }, [labId, selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await UserAPI.getLabSlots(labId, selectedDate);
      if (res.success) setSlots(res.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSlotSelect({ date: selectedDate, time: activeSlot });
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-base font-bold text-slate-800">4. Schedule Collection</h3>
        <p className="text-xs text-slate-500">Select your preferred date and time for the sample collection.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Date Picker */}
        <div className="w-full md:w-1/3">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Select Date</label>
          <input 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full mt-2 p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#08B36A]"
          />
        </div>

        {/* Slots Grid */}
        <div className="flex-1">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Available Slots</label>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-emerald-600"><FiLoader className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  disabled={!slot.available}
                  onClick={() => setActiveSlot(slot.time)}
                  className={`p-3 text-xs font-bold rounded-xl border-2 transition-all ${
                    activeSlot === slot.time 
                      ? 'border-[#08B36A] bg-emerald-50 text-[#08B36A]' 
                      : slot.available ? 'border-slate-100 hover:border-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                  {slot.premiumFee > 0 && <span className="block text-[8px] text-amber-600">+₹{slot.premiumFee}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-50">
        <button onClick={onBack} className="px-6 py-2.5 border rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50">Previous</button>
        <button 
          onClick={handleConfirm}
          disabled={!activeSlot}
          className="px-6 py-2.5 bg-[#08B36A] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
        >
          Confirm Slot
        </button>
      </div>
    </div>
  );
}