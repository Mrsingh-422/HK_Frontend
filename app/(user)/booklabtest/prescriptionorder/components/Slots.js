'use client';
import React, { useState, useEffect } from 'react';
import UserAPI from '@/app/services/UserAPI';
import { FaRegClock, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export default function Slots({ labId, onSlotSelect, onBack, onNext }) {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    if (labId) fetchSlots();
  }, [labId, selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    setActiveSlot(null);
    setIsClosed(false);
    setClosedMessage("");

    try {
      // Query parameters format: date=YYYY-MM-DD (e.g. 2026-10-25)
      const res = await UserAPI.getLabSlots(labId, selectedDate);
      
      if (res?.success) {
        setSlots(res.slots || []);
        setIsClosed(Boolean(res.isClosed));
        if (res.isClosed) {
          setClosedMessage(res.message || "Lab is closed on this day.");
        }
      } else {
        setSlots([]);
        setIsClosed(Boolean(res?.isClosed));
        setClosedMessage(res?.message || "Failed to fetch slots.");
      }
    } catch (err) {
      console.error("Error fetching lab slots:", err);
      setSlots([]);
      setIsClosed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const selectedSlotObj = slots.find(s => (s.time === activeSlot || s.displayTime === activeSlot));
    onSlotSelect({ 
      date: selectedDate, 
      time: selectedSlotObj?.time || activeSlot,
      displayTime: selectedSlotObj?.displayTime || activeSlot,
      slot: selectedSlotObj 
    });
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
            className="w-full mt-2 p-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
          />
        </div>

        {/* Slots Grid */}
        <div className="flex-1">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Available Slots</label>
          
          {loading ? (
            <div className="flex items-center justify-center h-36 text-emerald-600">
              <FiLoader className="animate-spin text-2xl" />
            </div>
          ) : isClosed ? (
            <div className="mt-3 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-rose-700">{closedMessage || "Lab is closed on this date"}</p>
              <p className="text-[11px] text-rose-500 mt-1">Please select another date to view available time slots.</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-3 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-semibold">
              No time slots available for this date.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2 max-h-72 overflow-y-auto pr-1">
              {slots.map((slot, idx) => {
                // Master flag for button enable/disable: isAvailable
                const isAvailable = Boolean(slot.isAvailable);
                const isSelected = activeSlot === slot.time || activeSlot === slot.displayTime;
                const extraCharge = Number(slot.extraFee || 0);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setActiveSlot(slot.time)}
                    className={`p-3 text-xs font-bold rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                      isSelected 
                        ? 'border-[#08B36A] bg-emerald-50 text-[#08B36A] shadow-xs cursor-pointer' 
                        : isAvailable 
                        ? 'border-slate-100 hover:border-slate-200 text-slate-700 bg-white cursor-pointer' 
                        : 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed opacity-60'
                    }`}
                  >
                    {/* Direct UI print format with AM/PM */}
                    <span className="font-bold text-xs">{slot.displayTime || slot.time}</span>
                    
                    <span className="text-[9px] uppercase font-medium text-slate-400 mt-0.5">
                      {slot.category || "Slot"}
                    </span>

                    {/* Extra Convenience Fee */}
                    {isAvailable && extraCharge > 0 && (
                      <span className="text-[9px] text-amber-600 font-black mt-0.5">
                        +₹{extraCharge}
                      </span>
                    )}

                    {/* Status Badge when not Available */}
                    {!isAvailable && (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${
                        slot.status === "Booked"
                          ? "bg-slate-200 text-slate-600"
                          : slot.status === "Past"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {slot.status || "Unavailable"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-50">
        <button 
          type="button" 
          onClick={onBack} 
          className="px-6 py-2.5 border rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
        >
          Previous
        </button>
        <button 
          type="button" 
          onClick={handleConfirm}
          disabled={!activeSlot}
          className="px-6 py-2.5 bg-[#08B36A] hover:bg-[#079c5c] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
        >
          Confirm Slot
        </button>
      </div>
    </div>
  );
}