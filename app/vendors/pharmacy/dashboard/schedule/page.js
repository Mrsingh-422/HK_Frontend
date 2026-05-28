'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaCalendarAlt, 
  FaRegClock, 
  FaSave, 
  FaSyncAlt,
  FaSun, 
  FaCloudSun, 
  FaMoon, 
  FaCheckCircle,
  FaCrown,
  FaPlus, 
  FaTrash,
  FaCalendarTimes
} from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

export default function PharmacySchedulePage() {
  
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [activeTab, setActiveTab] = useState('all'); 
  
  const [newPremium, setNewPremium] = useState({ time: '', extraFee: 0 });
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Initial state with safe defaults
  const [availability, setAvailability] = useState({
    morningSlots: true,
    afternoonSlots: true,
    eveningSlots: true,
    startTime: '09:00',
    endTime: '21:00',
    slotDuration: 60,
    maxClientsPerSlot: 0,
    offDays: [],
    premiumSlots: [], 
    unavailableSlots: [],
    blockedDates: [] 
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await PharmacyVendorAPI.getAvailability();
      
      // Access config directly as per your provided API response
      const data = res?.config || res?.data?.config || res?.data || res;

      if (data) {
        setAvailability({
          morningSlots: data.morningSlots ?? true,
          afternoonSlots: data.afternoonSlots ?? true,
          eveningSlots: data.eveningSlots ?? true,
          startTime: data.startTime || '09:00',
          endTime: data.endTime || '21:00',
          slotDuration: data.slotDuration || 60,
          maxClientsPerSlot: data.maxClientsPerSlot || 0,
          premiumSlots: Array.isArray(data.premiumSlots) ? data.premiumSlots : [],
          unavailableSlots: Array.isArray(data.unavailableSlots) ? data.unavailableSlots : [],
          blockedDates: Array.isArray(data.blockedDates) ? data.blockedDates : [],
          offDays: Array.isArray(data.offDays) ? data.offDays : []
        });
      }
    } catch (error) {
      console.error("Error fetching pharmacy slots:", error);
      toast.error("Failed to load availability settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAvailability({ 
      ...availability, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleDayToggle = (day) => {
    const currentDays = [...availability.offDays];
    if (currentDays.includes(day)) {
      setAvailability({ ...availability, offDays: currentDays.filter(d => d !== day) });
    } else {
      setAvailability({ ...availability, offDays: [...currentDays, day] });
    }
  };

  const generateSlotsLocally = () => {
    const slots = [];
    const duration = Number(availability.slotDuration) || 60;
    const startT = availability.startTime || '09:00';
    const endT = availability.endTime || '21:00';

    let current = new Date(`2000-01-01T${startT}:00`);
    const end = new Date(`2000-01-01T${endT}:00`);
    
    if (isNaN(current.getTime()) || isNaN(end.getTime()) || duration <= 0) return [];
    
    while (current <= end) {
      const timeStr = current.toTimeString().substring(0, 5);
      slots.push({ time: timeStr });
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  };

  const addPremiumSlot = () => {
    if (!newPremium.time) return toast.error("Please select a time");
    const validSlots = generateSlotsLocally();
    if (!validSlots.some(s => s.time === newPremium.time)) return toast.error("Invalid interval");
    if (availability.premiumSlots.find(s => s.time === newPremium.time)) {
        return toast.error("This slot is already marked as premium");
    }
    setAvailability({
      ...availability,
      premiumSlots: [...availability.premiumSlots, { ...newPremium, extraFee: Number(newPremium.extraFee) }]
    });
    setNewPremium({ time: '', extraFee: 0 });
    toast.success("Added to premium list.");
  };

  const removePremiumSlot = (timeToRemove) => {
    const updated = availability.premiumSlots.filter(p => p.time !== timeToRemove);
    setAvailability({ ...availability, premiumSlots: updated });
  };

  const addBlockedDate = () => {
    if (!newBlockedDate) return toast.error("Please select a date first");
    if (availability.blockedDates.includes(newBlockedDate)) {
        return toast.error("Date already blocked");
    }
    setAvailability(prev => ({
        ...prev,
        blockedDates: [...prev.blockedDates, newBlockedDate].sort()
    }));
    setNewBlockedDate('');
    toast.success("Date added to closure list");
  };

  const removeBlockedDate = (dateToRemove) => {
    setAvailability(prev => ({
        ...prev,
        blockedDates: prev.blockedDates.filter(d => d !== dateToRemove)
    }));
    toast.success("Date removed from closure list");
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...availability,
        vendorType: 'Pharmacy',
        slotDuration: Number(availability.slotDuration),
        maxClientsPerSlot: Number(availability.maxClientsPerSlot),
        premiumSlots: availability.premiumSlots,
        blockedDates: availability.blockedDates,
        unavailableSlots: availability.unavailableSlots,
        offDays: availability.offDays
      };

      const res = await PharmacyVendorAPI.saveAvailability(payload);
      if (res.success || res) {
          setShowConfirmModal(true);
          await fetchAvailability(); 
      }
    } catch (error) {
      toast.error("Failed to save configuration.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockSlot = async (slotTime, isCurrentlyBlocked) => {
    try {
      setLoading(true);
      
      // 1. Calculate the updated unavailable slots array
      const currentUnavailable = Array.isArray(availability.unavailableSlots) ? availability.unavailableSlots : [];
      const updatedUnavailable = isCurrentlyBlocked 
          ? currentUnavailable.filter(t => t !== slotTime) 
          : [...currentUnavailable, slotTime];

      // 2. Prepare the full payload (mirroring handleSave logic)
      const payload = {
        ...availability,
        vendorType: 'Pharmacy',
        slotDuration: Number(availability.slotDuration),
        maxClientsPerSlot: Number(availability.maxClientsPerSlot),
        unavailableSlots: updatedUnavailable
      };

      // 3. Save using the working endpoint instead of the 404 one
      const res = await PharmacyVendorAPI.saveAvailability(payload);
      
      if (res) {
        setAvailability(prev => ({ ...prev, unavailableSlots: updatedUnavailable }));
        toast.success(isCurrentlyBlocked ? `Slot ${slotTime} is now visible` : `Slot ${slotTime} is now hidden`);
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update slot status.");
    } finally {
      setLoading(false);
    }
  }

  const getCombinedSlots = () => {
    const intervals = generateSlotsLocally();
    const isTodayOff = availability.offDays.includes(todayName);
    
    // Proper working of Blocked Dates
    const todayISO = new Date().toISOString().split('T')[0];
    const isTodayBlockedDate = availability.blockedDates.includes(todayISO);

    return intervals.map(localSlot => {
        const isBlocked = (availability.unavailableSlots || []).includes(localSlot.time);
        const premiumConfig = (availability.premiumSlots || []).find(p => p.time === localSlot.time);
        return {
            time: localSlot.time,
            isBlocked: isBlocked,
            isOffDay: isTodayOff || isTodayBlockedDate, 
            isPremium: !!premiumConfig,
            extraFee: premiumConfig ? premiumConfig.extraFee : 0
        };
    }).sort((a, b) => a.time.localeCompare(b.time));
  };

  const allCombined = getCombinedSlots();
  const filteredSlots = 
    activeTab === 'all' 
      ? allCombined 
      : activeTab === 'premium' 
        ? allCombined.filter(slot => slot.isPremium)
        : allCombined.filter(slot => slot.isBlocked); 

  const availableIntervals = generateSlotsLocally();

  return (
    <div className="w-full relative pb-10">
      <Toaster position="top-right" />
      
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
              <FaCheckCircle size={40}/>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Saved Successfully!</h3>
            <p className="text-gray-500 font-medium mb-8">Pharmacy settings and closure dates synced.</p>
            <button onClick={() => setShowConfirmModal(false)} className="w-full py-4 bg-[#08B36A] text-white font-black rounded-2xl hover:bg-green-600 transition-all shadow-lg active:scale-95">
              Great, I Understand
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
          <FaCalendarAlt className="text-[#08B36A]"/> Pharmacy Availability
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#1e3a8a]">Availability Configuration</h2>
          {loading && <FaSyncAlt className="animate-spin text-[#08B36A]"/>}
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-blue-50/30 p-5 rounded-xl border border-blue-50">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
              <input type="time" name="startTime" value={availability.startTime || '09:00'} onChange={handleChange} className="input-style" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
              <input type="time" name="endTime" value={availability.endTime || '21:00'} onChange={handleChange} className="input-style" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Min)</label>
              <input type="number" name="slotDuration" value={availability.slotDuration || ''} onChange={handleChange} className="input-style" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Max Clients</label>
              <input type="number" name="maxClientsPerSlot" value={availability.maxClientsPerSlot ?? 0} onChange={handleChange} className="input-style" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
               <input type="checkbox" name="morningSlots" checked={!!availability.morningSlots} onChange={handleChange} className="w-5 h-5 accent-[#08B36A]" />
               <div className="flex items-center gap-2 font-bold text-gray-700"><FaSun className="text-yellow-500"/> Morning Delivery</div>
            </label>
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
               <input type="checkbox" name="afternoonSlots" checked={!!availability.afternoonSlots} onChange={handleChange} className="w-5 h-5 accent-[#08B36A]" />
               <div className="flex items-center gap-2 font-bold text-gray-700"><FaCloudSun className="text-orange-500"/> Afternoon Delivery</div>
            </label>
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
               <input type="checkbox" name="eveningSlots" checked={!!availability.eveningSlots} onChange={handleChange} className="w-5 h-5 accent-[#08B36A]" />
               <div className="flex items-center gap-2 font-bold text-gray-700"><FaMoon className="text-indigo-500"/> Evening Delivery</div>
            </label>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Select Weekly Off-Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${availability.offDays.includes(day) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200 hover:border-[#08B36A]'}`}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-4">
              <FaCalendarTimes className="text-red-500" /> Specific Date Closures (Holidays)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end bg-red-50/30 p-5 rounded-xl border border-red-100">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Pick a Date to Close Pharmacy</label>
                    <input type="date" value={newBlockedDate || ''} onChange={(e) => setNewBlockedDate(e.target.value)} className="input-style" />
                </div>
                <button type="button" onClick={addBlockedDate} className="bg-red-600 text-white h-[46px] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-md">
                    <FaPlus size={14}/> Add Closure
                </button>
            </div>
            <div className="flex flex-wrap gap-3">
                {availability.blockedDates.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-red-300 px-3 py-2 rounded-lg shadow-sm">
                        <span className="text-sm font-bold text-gray-700">{date}</span>
                        <button type="button" onClick={() => removeBlockedDate(date)} className="text-red-500 hover:text-red-700"><FaTrash size={12}/></button>
                    </div>
                ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-4">
              <FaCrown className="text-yellow-500" /> Premium Slots Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end bg-yellow-50/30 p-5 rounded-xl border border-yellow-100">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Select Time</label>
                <select value={newPremium.time || ''} onChange={(e) => setNewPremium({...newPremium, time: e.target.value})} className="input-style">
                  <option value="">-- Choose --</option>
                  {availableIntervals.map((slot, idx) => (<option key={idx} value={slot.time}>{slot.time}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Extra Fee (₹)</label>
                <input type="number" value={newPremium.extraFee || 0} onChange={(e) => setNewPremium({...newPremium, extraFee: e.target.value})} className="input-style" />
              </div>
              <button type="button" onClick={addPremiumSlot} className="bg-yellow-600 text-white h-[46px] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-700 transition-all shadow-md"><FaPlus size={14}/> Add Premium</button>
            </div>
            <div className="flex flex-wrap gap-3">
                {availability.premiumSlots.map((ps, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-yellow-300 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-1"><FaRegClock className="text-yellow-500"/> {ps.time}</span>
                        <span className="text-[11px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">₹{ps.extraFee} Fee</span>
                        <button type="button" onClick={() => removePremiumSlot(ps.time)} className="text-red-400"><FaTrash size={14}/></button>
                    </div>
                ))}
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-100">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-10 py-4 bg-[#08B36A] hover:bg-green-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95">
              <FaSave /> Save All Configuration
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button onClick={() => setActiveTab('all')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-white text-[#1e3a8a] shadow-md' : 'text-gray-500'}`}>All Slots</button>
          <button onClick={() => setActiveTab('premium')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'premium' ? 'bg-white text-yellow-600 shadow-md' : 'text-gray-500'}`}>Premium</button>
          <button onClick={() => setActiveTab('blocked')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'blocked' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500'}`}>Blocked</button>
        </div>
        <button type="button" onClick={fetchAvailability} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#08B36A] text-[#08B36A] hover:bg-green-50 font-bold rounded-lg transition-colors text-sm shadow-sm active:scale-95"><FaSyncAlt /> Refresh Data</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-bold">
              <tr>
                <th className="px-6 py-4">Slot Time</th>
                <th className="px-6 py-4">Price Detail</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredSlots.map((slot, index) => (
                  <tr key={index} className={`hover:bg-gray-50/50 ${slot.isBlocked || slot.isOffDay ? 'bg-red-50/40' : ''}`}>
                    <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-bold ${slot.isBlocked || slot.isOffDay ? 'text-gray-400 line-through' : 'text-[#1e3a8a]'}`}>
                            <FaRegClock size={14}/> {slot.time}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {slot.isPremium ? (
                          <div className="flex items-center gap-2">
                             <span className="text-yellow-700 font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px] bg-yellow-100 px-2 py-1 rounded border border-yellow-200 shadow-sm">
                               <FaCrown size={10}/> Premium (+₹{slot.extraFee})
                             </span>
                          </div>
                        ) : <span className="text-gray-400 text-[10px] uppercase font-bold italic">Standard Slot</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${slot.isBlocked || slot.isOffDay ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                        {slot.isOffDay ? 'Closed (Holiday/Off)' : slot.isBlocked ? 'Hidden' : 'Live'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button disabled={loading || slot.isOffDay} type="button" onClick={() => toggleBlockSlot(slot.time, slot.isBlocked)} className={`px-4 py-2 rounded-xl border font-bold text-[11px] uppercase flex items-center gap-2 mx-auto ${slot.isBlocked ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} disabled:opacity-30`}>
                          {slot.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
        </table>
      </div>

      <style jsx>{`
        .input-style { width: 100%; padding: 10px 15px; background-color: white; border-radius: 12px; border: 1px solid #d1d5db; font-weight: 600; color: #374151; outline: none; }
      `}</style>
    </div>
  )
}