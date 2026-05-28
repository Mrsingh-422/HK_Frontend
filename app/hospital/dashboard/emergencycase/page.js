"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';

const EmergencyManagement = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'referrals', 'occupancy'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  
  // Occupancy Map Specific State
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeTab === 'active') fetchEmergencies();
    if (activeTab === 'referrals') fetchReferrals();
    if (activeTab === 'occupancy') {
        fetchWards();
        if(selectedWard) fetchOccupancy();
    }
  }, [activeTab, selectedWard, selectedDate]);

  const fetchEmergencies = async () => {
    setLoading(true);
    const res = await HospitalAPI.getEmergencyCases();
    if (res?.success) setData(res.data);
    setLoading(false);
  };

  const fetchReferrals = async () => {
    setLoading(true);
    const res = await HospitalAPI.getReferralBookings('all');
    if (res?.success) setData(res.data);
    setLoading(false);
  };

  const fetchWards = async () => {
    const res = await HospitalAPI.getWardsList();
    if (res?.success) {
        setWards(res.data);
        if(!selectedWard && res.data.length > 0) setSelectedWard(res.data[0]._id);
    }
  };

  const fetchOccupancy = async () => {
    setLoading(true);
    const res = await HospitalAPI.getDailyOccupancy(selectedWard, selectedDate);
    if (res?.success) setData(res.data);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-[90rem] mx-auto font-sans min-h-screen bg-emerald-50/20">
      
      {/* HEADER & TAB NAVIGATION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <span className="bg-emerald-600 text-white p-1.5 rounded-lg">🚑</span> 
              Emergency Control Center
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase mt-1">Real-time Patient Flow & Bed Management</p>
          </div>

          <div className="flex bg-emerald-50 p-1 rounded-xl border border-emerald-100">
            {[
              { id: 'active', label: 'Active Cases', icon: '⚡' },
              { id: 'referrals', label: 'Transfers', icon: '🔄' },
              { id: 'occupancy', label: 'Bed Map', icon: '🛏️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setData([]); }}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'active' && <EmergencyTable items={data} onView={setSelectedCase} />}
          {activeTab === 'referrals' && <ReferralTable items={data} />}
          {activeTab === 'occupancy' && (
            <OccupancyGrid 
              items={data} 
              wards={wards} 
              selectedWard={selectedWard} 
              setSelectedWard={setSelectedWard}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
        </div>
      )}

      {/* RENDER MODAL IF CASE SELECTED (Using your existing Modal UI) */}
      {selectedCase && (
          <CaseDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
};

// --- SUB-COMPONENT: EMERGENCY TABLE ---
const EmergencyTable = ({ items, onView }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-emerald-50/50 text-[10px] uppercase font-black text-emerald-800">
        <tr>
          <th className="p-5">Booking / Ambulance</th>
          <th className="p-5">Patient Details</th>
          <th className="p-5">Ward / Bed</th>
          <th className="p-5 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-emerald-50">
        {items.map((item) => (
          <tr key={item._id} className="hover:bg-emerald-50/20 transition-all group">
            <td className="p-5">
              <p className="text-xs font-black text-emerald-700">#{item.bookingId}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{item.ambulanceId?.vehicleNumber || 'Private Arrival'}</p>
            </td>
            <td className="p-5">
              <p className="text-sm font-black text-gray-800">{item.patients[0]?.patientName}</p>
              <p className="text-[10px] text-gray-500">{item.patients[0]?.gender} • {item.patients[0]?.patientAge}y</p>
            </td>
            <td className="p-5">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-[10px] font-black uppercase">
                {item.wardName} - {item.bedNumber}
              </span>
            </td>
            <td className="p-5 text-center">
              <button onClick={() => onView(item)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- SUB-COMPONENT: REFERRAL TABLE ---
const ReferralTable = ({ items }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-blue-50/50 text-[10px] uppercase font-black text-blue-800">
        <tr>
          <th className="p-5">Transfer ID</th>
          <th className="p-5">From / To</th>
          <th className="p-5">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-50">
        {items.map((ref) => (
          <tr key={ref._id}>
            <td className="p-5">
              <p className="text-xs font-black text-blue-700">{ref.bookingId}</p>
              <p className="text-[9px] text-gray-400">{ref.caseReference}</p>
            </td>
            <td className="p-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-600">{ref.pickupHospitalId?.name}</span>
                <span className="text-blue-400">➔</span>
                <span className="text-[10px] font-black text-emerald-600">{ref.hospitalId?.name}</span>
              </div>
            </td>
            <td className="p-5">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">{ref.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- SUB-COMPONENT: OCCUPANCY GRID ---
const OccupancyGrid = ({ items, wards, selectedWard, setSelectedWard, selectedDate, setSelectedDate }) => (
  <div className="space-y-4">
    <div className="flex gap-4 bg-white p-4 rounded-xl border border-emerald-100">
        <select 
            value={selectedWard} 
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-emerald-50 border-none rounded-lg text-xs font-black p-2 outline-none"
        >
            {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-emerald-50 border-none rounded-lg text-xs font-black p-2 outline-none"
        />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((bed) => (
        <div key={bed._id} className={`p-4 rounded-2xl border-2 transition-all ${
          bed.status === 'Occupied' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <p className="text-xs font-black text-gray-400 mb-2 uppercase">{bed.bedNumber}</p>
          <div className="flex flex-col gap-1">
             {bed.status === 'Occupied' ? (
                 <>
                    <p className="text-[11px] font-black text-rose-700 truncate">{bed.currentOccupant}</p>
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter">ID: {bed.activeBookingId}</p>
                 </>
             ) : (
                <p className="text-[11px] font-black text-emerald-600 uppercase">Available</p>
             )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Export the Main Component
export default EmergencyManagement;