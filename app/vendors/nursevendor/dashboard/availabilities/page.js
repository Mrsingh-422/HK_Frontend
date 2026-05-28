'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaClock, FaCalendarAlt, FaTrash, FaSave, FaBan, 
    FaCalendarTimes, FaStar, FaCheckCircle, FaListAlt, 
    FaInfoCircle, FaSyncAlt, FaSun, FaCloudSun, FaMoon,
    FaCrown, FaPlus, FaRegClock, FaChevronLeft, FaChevronRight, FaBolt, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

export default function NurseAvailabilityPage() {
    // --- STATES MATCHING YOUR SCHEMA ---
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [newBlockedDate, setNewBlockedDate] = useState('');
    
    // --- MODAL STATES FOR GOOD DESIGN ---
    const [premiumModal, setPremiumModal] = useState({
        isOpen: false,
        type: 'time', // 'time' or 'date'
        targetValue: '', // e.g., '08:00' or '2026-05-10'
        fee: 0
    });

    // Calendar Navigation State
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4)); // May 2026

    const [availability, setAvailability] = useState({
        morningSlots: true,
        afternoonSlots: true,
        eveningSlots: true,
        startTime: '08:00',
        endTime: '20:00',
        slotDuration: 60, 
        allowedBookingTypes: ["One day One Time", "Acc. To Per/Hours"],
        offDays: ["Sunday"],
        hourlyRateSurcharge: 0,
        premiumSlots: [],
        premiumDates: [], 
        unavailableSlots: [],
        blockedDates: [] 
    });

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // --- API LOGIC ---
    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const res = await NurseAPI.getMySlots();
            const data = res?.data || res;
            if (data.config) {
                setAvailability({
                    ...data.config,
                    premiumSlots: data.config.premiumSlots || [],
                    premiumDates: data.config.premiumDates || [],
                    unavailableSlots: data.config.unavailableSlots || [],
                    blockedDates: data.config.blockedDates || [],
                    offDays: data.config.offDays || [],
                    allowedBookingTypes: data.config.allowedBookingTypes || []
                });
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Failed to load settings");
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
        const duration = 60; 
        let current = new Date(`2000-01-01T${availability.startTime}:00`);
        const end = new Date(`2000-01-01T${availability.endTime}:00`);
        while (current <= end) {
            slots.push({ time: current.toTimeString().substring(0, 5) });
            current.setMinutes(current.getMinutes() + duration);
        }
        return slots;
    };

    // --- NEW MODAL HANDLERS ---
    const handleSlotSurcharge = (time) => {
        const existing = availability.premiumSlots.find(s => s.time === time);
        setPremiumModal({
            isOpen: true,
            type: 'time',
            targetValue: time,
            fee: existing ? existing.extraFee : 0
        });
    };

    const handleDateSurcharge = (dateStr) => {
        const existing = availability.premiumDates.find(d => d.date === dateStr);
        setPremiumModal({
            isOpen: true,
            type: 'date',
            targetValue: dateStr,
            fee: existing ? existing.extraFee : 0
        });
    };

    const savePremiumSetting = () => {
        const fee = Number(premiumModal.fee);
        if (premiumModal.type === 'time') {
            let updatedSlots = [...availability.premiumSlots];
            if (fee > 0) {
                const existing = updatedSlots.find(s => s.time === premiumModal.targetValue);
                if (existing) {
                    updatedSlots = updatedSlots.map(s => s.time === premiumModal.targetValue ? { ...s, extraFee: fee } : s);
                } else {
                    updatedSlots.push({ time: premiumModal.targetValue, extraFee: fee });
                }
            } else {
                updatedSlots = updatedSlots.filter(s => s.time !== premiumModal.targetValue);
            }
            setAvailability({ ...availability, premiumSlots: updatedSlots });
        } else {
            let updatedDates = [...availability.premiumDates];
            if (fee > 0) {
                const existing = updatedDates.find(d => d.date === premiumModal.targetValue);
                if (existing) {
                    updatedDates = updatedDates.map(d => d.date === premiumModal.targetValue ? { ...d, extraFee: fee } : d);
                } else {
                    updatedDates.push({ date: premiumModal.targetValue, extraFee: fee });
                }
            } else {
                updatedDates = updatedDates.filter(d => d.date !== premiumModal.targetValue);
            }
            setAvailability({ ...availability, premiumDates: updatedDates });
        }
        setPremiumModal({ ...premiumModal, isOpen: false });
        toast.success("Premium fee updated");
    };

    const addBlockedDate = () => {
        if (!newBlockedDate) return toast.error("Select a date");
        setAvailability({ ...availability, blockedDates: [...availability.blockedDates, newBlockedDate] });
        setNewBlockedDate('');
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                startTime: availability.startTime,
                endTime: availability.endTime,
                morningSlots: availability.morningSlots,
                afternoonSlots: availability.afternoonSlots,
                eveningSlots: availability.eveningSlots,
                allowedBookingTypes: availability.allowedBookingTypes,
                offDays: availability.offDays,
                hourlyRateSurcharge: availability.hourlyRateSurcharge,
                premiumSlots: availability.premiumSlots,
                premiumDates: availability.premiumDates
            };
            await NurseAPI.setNurseSlots(payload);
            setShowConfirmModal(true);
            fetchAvailability();
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const toggleBlockSlot = async (slotTime, isCurrentlyBlocked) => {
        try {
            setLoading(true);
            const action = isCurrentlyBlocked ? "unblock" : "block";
            await NurseAPI.toggleNurseSlot({ time: slotTime, action: action }); 
            toast.success(`Slot ${slotTime} ${action}ed`);
            fetchAvailability();
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setLoading(false);
        }
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const premium = availability.premiumDates.find(pd => pd.date === dateStr);
            
            days.push(
                <div 
                    key={d} 
                    onClick={() => handleDateSurcharge(dateStr)}
                    className={`h-24 border p-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1
                        ${premium ? 'bg-red-50 border-red-300 ring-1 ring-red-200' : 'bg-white border-gray-100 hover:border-blue-300'}`}
                >
                    <span className={`text-sm font-bold ${premium ? 'text-red-600' : 'text-gray-700'}`}>{d}</span>
                    {premium && <span className="text-[10px] font-black text-red-500">₹{premium.extraFee}</span>}
                </div>
            );
        }
        return days;
    };

    const allSlots = generateSlotsLocally().map(local => {
        const isBlocked = availability.unavailableSlots.includes(local.time);
        const premium = availability.premiumSlots.find(p => p.time === local.time);
        return { ...local, isBlocked, isPremium: !!premium, extraFee: premium?.extraFee || 0 };
    });

    const filteredSlots = activeTab === 'all' ? allSlots : 
                         activeTab === 'premium' ? allSlots.filter(s => s.isPremium) : 
                         allSlots.filter(s => s.isBlocked);

    const formatAMPM = (time) => {
        let [h, m] = time.split(':');
        let ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    };

    return (
        /* FIXED WRAPPER TO PREVENT SIDEBAR MOVEMENT */
        <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#F8FAFC] pb-20 space-y-8">
            
            {/* 🌟 GOOD DESIGN PREMIUM MODAL 🌟 */}
            {premiumModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <FaStar className="text-yellow-500"/> Set Premium Surcharge
                            </h3>
                            <button onClick={() => setPremiumModal({...premiumModal, isOpen: false})} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={20}/>
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Target {premiumModal.type}</p>
                                <p className="text-lg font-black text-[#1e3a8a]">
                                    {premiumModal.type === 'time' ? formatAMPM(premiumModal.targetValue) : premiumModal.targetValue}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Extra Surcharge Fee (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={premiumModal.fee} 
                                        onChange={(e) => setPremiumModal({...premiumModal, fee: e.target.value})}
                                        placeholder="Enter amount (e.g. 150)"
                                        className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#08B36A] transition-all font-bold text-lg"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Set to 0 to remove premium surcharge for this {premiumModal.type}.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPremiumModal({...premiumModal, isOpen: false})}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={savePremiumSetting}
                                className="flex-1 py-4 bg-[#08B36A] text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                            >
                                Apply Fee
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50"><FaCheckCircle size={40}/></div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Saved Successfully!</h3>
                        <p className="text-gray-500 font-medium mb-8">Configurations are now live on your profile.</p>
                        <button onClick={() => setShowConfirmModal(false)} className="w-full py-4 bg-[#08B36A] text-white font-black rounded-2xl">Great!</button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#08B36A]/10 rounded-xl"><FaCalendarTimes className="text-[#08B36A] text-xl" /></div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Availability Management</h1>
                            <p className="text-sm text-gray-500">Configure shifts, premium fees and specific date closures.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchAvailability} className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 transition-all"><FaSyncAlt className={loading ? 'animate-spin' : ''}/></button>
                        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-[#08B36A] hover:bg-[#079d5c] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                            <FaSave /> Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
                
                {/* 1. TOP CONFIGURATION GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-4"><FaClock className="text-[#08B36A]"/> Operation Settings</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Start Time</label><input type="time" name="startTime" value={availability.startTime} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">End Time</label><input type="time" name="endTime" value={availability.endTime} onChange={handleChange} className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none" /></div>
                        </div>
                        <div className="space-y-2">
                            {[{id:'morningSlots', icon:<FaSun className="text-yellow-400"/>}, {id:'afternoonSlots', icon:<FaCloudSun className="text-orange-400"/>}, {id:'eveningSlots', icon:<FaMoon className="text-indigo-400"/>}].map(shift => (
                                <label key={shift.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 cursor-pointer transition-all">
                                    <span className="text-sm font-medium flex items-center gap-2">{shift.icon} {shift.id.replace('Slots','')} Sessions</span>
                                    <input type="checkbox" name={shift.id} checked={availability[shift.id]} onChange={handleChange} className="w-5 h-5 accent-[#08B36A]"/>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-4"><FaBan className="text-red-500"/> Off-Days & Blockages</h2>
                        <div className="flex flex-wrap justify-center gap-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                                const full = day === "Sun" ? "Sunday" : day + "day";
                                const isOff = availability.offDays.includes(full);
                                return (
                                    <button key={day} onClick={() => handleDayToggle(full)} className={`w-12 h-12 rounded-2xl text-xs font-bold border transition-all ${isOff ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 hover:border-red-200'}`}>{day}</button>
                                )
                            })}
                        </div>
                        <div className="pt-4 space-y-3">
                            <label className="text-[11px] font-bold text-gray-400 uppercase block">Emergency Lab Closure (Date)</label>
                            <div className="flex gap-2">
                                <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className="flex-1 p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-1 ring-red-400" />
                                <button onClick={addBlockedDate} className="bg-gray-900 text-white px-6 rounded-xl text-xs font-bold hover:bg-black transition-all">Block Date</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availability.blockedDates.map(date => (
                                    <span key={date} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100">
                                        {date} <FaTrash className="cursor-pointer hover:scale-110" onClick={() => setAvailability({...availability, blockedDates: availability.blockedDates.filter(d => d !== date)})} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. VISUAL HOURLY SURCHARGES */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaBolt className="text-yellow-500"/> Hourly Surcharges (1h Interval)
                        </h2>
                        <p className="text-sm text-gray-400">Click on a slot to add/edit premium fee for that specific hour.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {generateSlotsLocally().map((slot, idx) => {
                            const premium = availability.premiumSlots.find(s => s.time === slot.time);
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSlotSurcharge(slot.time)}
                                    className={`p-4 rounded-2xl border text-center cursor-pointer transition-all hover:scale-105
                                        ${premium ? 'border-red-400 bg-red-50 ring-1 ring-red-100' : 'border-gray-100 bg-white hover:bg-blue-50 hover:border-blue-200'}`}
                                >
                                    <div className="text-sm font-bold text-gray-700">{formatAMPM(slot.time)}</div>
                                    <div className={`text-[10px] font-bold mt-1 ${premium ? 'text-red-500' : 'text-gray-300'}`}>
                                        {premium ? `+₹${premium.extraFee}` : 'No Extra'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. VISUAL PREMIUM DATES (CALENDAR) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaCalendarAlt className="text-red-500"/> Premium Dates (Visual)
                            </h2>
                            <p className="text-sm text-gray-400">Red highlighted dates have extra charges. Click a date to set surcharge.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><FaChevronLeft/></button>
                            <span className="text-sm font-black text-gray-700 min-w-[120px] text-center">
                                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                            </span>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><FaChevronRight/></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                        {daysOfWeek.map(d => <div key={d} className="bg-gray-50 p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>)}
                        {renderCalendar()}
                    </div>
                </div>

                {/* 4. SLOTS DATA TABLE (SUMMARY) */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-2"><FaListAlt className="text-gray-400" /><h3 className="font-bold text-gray-800">Final Slot Preview</h3></div>
                        <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                            {['all', 'premium', 'blocked'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === t ? 'bg-[#08B36A] text-white shadow-md' : 'text-gray-500'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Pricing Detail</th>
                                    <th className="px-6 py-4">Current Status</th>
                                    <th className="px-6 py-4 text-center">Quick Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {filteredSlots.map((slot, i) => (
                                    <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${slot.isBlocked ? 'bg-red-50/20' : ''}`}>
                                        <td className="px-6 py-4 font-bold text-gray-700">{formatAMPM(slot.time)}</td>
                                        <td className="px-6 py-4">
                                            {slot.isPremium ? (
                                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100 flex items-center w-fit gap-1"><FaCrown /> Premium +₹{slot.extraFee}</span>
                                            ) : <span className="text-gray-300 text-[10px] font-medium uppercase tracking-widest italic">Standard</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center w-fit gap-1 ${slot.isBlocked ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                                                {slot.isBlocked ? <><FaBan/> Blocked</> : <><FaCheckCircle/> Active</>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => toggleBlockSlot(slot.time, slot.isBlocked)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${slot.isBlocked ? 'bg-white text-green-600 border-green-200' : 'bg-white text-red-500 border-red-200'}`}>
                                                {slot.isBlocked ? 'Unblock' : 'Block Slot'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}