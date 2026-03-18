'use client'
import React, { useState } from 'react'
import { 
  FaCalendarAlt, 
  FaRegClock, 
  FaSave, 
  FaSyncAlt,
  FaSun,
  FaCloudSun,
  FaMoon
} from 'react-icons/fa'

export default function AvailabilityPage() {
  
  // Dummy State for Form (To manage inputs)
  const [availability, setAvailability] = useState({
    startDate: '',
    endDate: '',
    morningStart: '', morningEnd: '', morningDuration: '',
    afternoonStart: '', afternoonEnd: '', afternoonDuration: '',
    eveningStart: '', eveningEnd: '', eveningDuration: '',
  });

  const handleChange = (e) => {
    setAvailability({ ...availability, [e.target.name]: e.target.value });
  };

  // Dummy Data for Table
  const scheduleData =[
    { day: 1, date: '2026-03-25', morning: '00:00:00am to 00:00:00pm', afternoon: '00:00:00am to 00:00:00pm', evening: '18:00:00pm to 21:59:00pm', status: 'Unavailable' },
    { day: 2, date: '2026-03-26', morning: '00:00:00am to 00:00:00pm', afternoon: '00:00:00am to 00:00:00pm', evening: '18:00:00pm to 21:59:00pm', status: 'Unavailable' },
    { day: 3, date: '2026-03-27', morning: '00:00:00am to 00:00:00pm', afternoon: '00:00:00am to 00:00:00pm', evening: '18:00:00pm to 21:59:00pm', status: 'Unavailable' },
    { day: 4, date: '2026-03-28', morning: '00:00:00am to 00:00:00pm', afternoon: '00:00:00am to 00:00:00pm', evening: '18:00:00pm to 21:59:00pm', status: 'Unavailable' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    alert("Availability Schedule Saved Successfully!");
  };

  return (
    <div className="w-full relative pb-10">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
          <FaCalendarAlt className="text-[#08B36A]"/> My Availability
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your weekly working time slots and schedule.</p>
      </div>

      {/* ========================================= */}
      {/* FORM SECTION (Availability Setter)        */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1e3a8a]">Select Your Weekly Time Slot In Calendar</h2>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          {/* --- DATE ROW --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-5 rounded-xl border border-blue-50">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="startDate"
                value={availability.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-700 font-medium transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="endDate"
                value={availability.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-700 font-medium transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* --- MORNING SLOT --- */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1e3a8a] flex items-center gap-2">
              <FaSun className="text-yellow-500 text-lg" /> Morning Slot Time 
              <span className="text-xs font-semibold bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded border border-yellow-100">(6:00 AM - 11:59 AM)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <TimeInput label="Start Time" name="morningStart" value={availability.morningStart} onChange={handleChange} />
              <TimeInput label="End Time" name="morningEnd" value={availability.morningEnd} onChange={handleChange} />
              <TextInput label="Duration (Mins)" name="morningDuration" value={availability.morningDuration} onChange={handleChange} placeholder="e.g. 30" />
            </div>
          </div>

          {/* --- AFTERNOON SLOT --- */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1e3a8a] flex items-center gap-2">
              <FaCloudSun className="text-orange-500 text-lg" /> Afternoon Slot Time 
              <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">(12:00 PM - 16:59 PM)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <TimeInput label="Start Time" name="afternoonStart" value={availability.afternoonStart} onChange={handleChange} />
              <TimeInput label="End Time" name="afternoonEnd" value={availability.afternoonEnd} onChange={handleChange} />
              <TextInput label="Duration (Mins)" name="afternoonDuration" value={availability.afternoonDuration} onChange={handleChange} placeholder="e.g. 30" />
            </div>
          </div>

          {/* --- EVENING SLOT --- */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1e3a8a] flex items-center gap-2">
              <FaMoon className="text-indigo-500 text-lg" /> Evening Slot Time 
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">(17:00 PM - 23:59 PM)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <TimeInput label="Start Time" name="eveningStart" value={availability.eveningStart} onChange={handleChange} />
              <TimeInput label="End Time" name="eveningEnd" value={availability.eveningEnd} onChange={handleChange} />
              <TextInput label="Duration (Mins)" name="eveningDuration" value={availability.eveningDuration} onChange={handleChange} placeholder="e.g. 30" />
            </div>
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <div className="flex justify-center pt-6 border-t border-gray-100">
            <button 
              type="submit"
              className="flex items-center gap-2 px-10 py-3 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
            >
              <FaSave size={16} /> Save Availability
            </button>
          </div>

        </form>
      </div>

      {/* ========================================= */}
      {/* TABLE SECTION (Schedule Viewer)           */}
      {/* ========================================= */}
      
      {/* Table Actions */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-gray-800">Saved Schedule</h2>
        <button 
          onClick={() => alert("Schedule Refreshed!")}
          className="flex items-center gap-2 px-5 py-2 bg-white border border-[#08B36A] text-[#08B36A] hover:bg-green-50 font-bold rounded-lg transition-colors shadow-sm text-sm"
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-bold">
              <tr>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Morning</th>
                <th className="px-6 py-4">Afternoon</th>
                <th className="px-6 py-4">Evening</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {scheduleData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{row.day}</td>
                  <td className="px-6 py-4 font-semibold text-[#1e3a8a]">{row.date}</td>
                  <td className="px-6 py-4">{row.morning}</td>
                  <td className="px-6 py-4">{row.afternoon}</td>
                  <td className="px-6 py-4">{row.evening}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                      row.status === 'Unavailable' 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {row.status}
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

// ----------------------------------------------------
// Reusable Sub-Components for cleaner code
// ----------------------------------------------------

const TimeInput = ({ label, name, value, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-[#08B36A] mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
        <FaRegClock />
      </div>
      <input 
        type="time" 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-700 font-medium transition-all"
      />
    </div>
  </div>
);

const TextInput = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-[#08B36A] mb-1.5">{label}</label>
    <input 
      type="number" 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-700 font-medium transition-all"
    />
  </div>
);