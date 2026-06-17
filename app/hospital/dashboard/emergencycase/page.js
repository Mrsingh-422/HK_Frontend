"use client";

import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
import { 
  FaSearch, FaAmbulance, FaNotesMedical, FaClock
} from 'react-icons/fa';

// Import Modular Modal Components
import CaseDetailModal from './components/CaseDetailModal';
import DateSelectorModal from './components/DateSelectorModal';
import BedAllocationModal from './components/BedAllocationModal';
import DoctorAssignmentModal from './components/DoctorAssignmentModal';

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
                {item.wardName || 'Unassigned'} - {item.bedNumber || 'Unassigned'}
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
            className="bg-emerald-50 border-none rounded-lg text-xs font-black p-2 outline-none cursor-pointer text-emerald-800"
        >
            {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-emerald-50 border-none rounded-lg text-xs font-black p-2 outline-none cursor-pointer text-emerald-800"
        />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((bed) => (
        <div key={bed._id} className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
          bed.status === 'Occupied' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          <div>
            <div className="flex justify-between items-start gap-1">
              <p className="text-xs font-black text-gray-400 mb-2 uppercase">{bed.bedNumber}</p>
              {bed.isVentilatorAvailable && (
                <span className="bg-emerald-600 text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Vent
                </span>
              )}
            </div>
            
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
          
          <div className="mt-3 pt-2 border-t border-slate-100/50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <span>Daily Rate:</span>
            <span className={bed.status === 'Occupied' ? 'text-rose-600' : 'text-emerald-700'}>
              ₹{bed.pricePerDay || 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN EMERGENCY MANAGEMENT SYSTEM INTERFACE ---
const EmergencyManagement = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'referrals', 'occupancy'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  
  // Dynamic Sequential Process Modal Status Trigger
  const [activeAction, setActiveAction] = useState(null); // 'select-dates' | 'select-bed' | 'select-doctor' | null
  const [isProcessing, setIsProcessing] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  // Custom Flow Storage Object
  const [flowData, setFlowData] = useState({
    startDate: '',
    endDate: '',
    selectedWard: null,
    selectedBed: null,
    selectedDoctor: null
  });

  const [bedAssignState, setBedAssignState] = useState({ 
    wards: [], 
    beds: [], 
    isLoadingData: false 
  });

  // Occupancy Map Specific State (Initialized safely with timezone-accurate local today's date)
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

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

  // --- SEQUENTIAL STEP 1: INITIALIZE ADMISSION PROCESS (SELECT DATES) ---
  const handleStartAllocation = () => {
    setFlowData({
      startDate: '',
      endDate: '',
      selectedWard: null,
      selectedBed: null,
      selectedDoctor: null
    });
    setActiveAction('select-dates');
  };

  const handleDatesCompleted = async () => {
    setActiveAction('select-bed');
    setBedAssignState({ wards: [], beds: [], isLoadingData: true });
    try {
      const response = await HospitalAPI.getWardsList(); 
      if (response?.success) {
        setBedAssignState(prev => ({ ...prev, wards: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch wards.');
        setActiveAction(null);
      }
    } catch (error) {
      alert('Error fetching wards.');
      setActiveAction(null);
    }
  };

  // --- SEQUENTIAL STEP 2: SELECT BED & WARD (BED ASSIGNMENT) ---
  const handleSelectWard = async (ward) => {
    setBedAssignState(prev => ({ ...prev, isLoadingData: true }));
    setFlowData(prev => ({ ...prev, selectedWard: ward }));
    try {
      // Fetch dynamic date-wise occupancy to determine bed slot eligibility
      const targetQueryDate = flowData.startDate || selectedDate;
      const response = await HospitalAPI.getDailyOccupancy(ward._id, targetQueryDate); 
      if (response?.success) {
        setBedAssignState(prev => ({ ...prev, beds: response.data, isLoadingData: false }));
      } else {
        alert(response?.message || 'Could not fetch beds.');
        setBedAssignState(prev => ({ ...prev, isLoadingData: false })); 
      }
    } catch (error) {
      alert('Error fetching beds.');
      setBedAssignState(prev => ({ ...prev, isLoadingData: false }));
    }
  };

  const handleSelectBed = (bed) => {
    setFlowData(prev => ({ ...prev, selectedBed: bed }));
  };

  const handleBedSelectionNext = async () => {
    if (!flowData.selectedBed) return alert("Please select an available bed slot to continue.");
    
    // Proceed to Step 3: Select Doctor
    setIsProcessing(true);
    try {
      const response = await HospitalAPI.getHospitalDoctors();
      if (response?.success) {
        setDoctorList(response.data || []);
        setSelectedDoctorId('');
        setActiveAction('select-doctor');
      } else {
        alert(response?.message || 'Could not fetch doctors list.');
      }
    } catch (error) { 
      alert('Error fetching doctors.'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  // --- SEQUENTIAL STEP 3: SELECT DOCTOR & FINALIZE ALLOTMENT ---
  const handleFinalizeAllotment = async () => {
    if (!selectedDoctorId) return alert('Please assign a lead physician to proceed.');
    setIsProcessing(true);
    
    try {
      // 1. Allot Bed (POST: /hospital/panel/ward/admit-patient)
      const bedPayload = { 
        appointmentId: selectedCase._id, 
        bedId: flowData.selectedBed._id,
        startDate: flowData.startDate,
        endDate: flowData.endDate
      };
      const bedRes = await HospitalAPI.admitPatientToBed(bedPayload);
      
      if (!bedRes?.success) {
        alert("Admit Bed Failed: " + bedRes.message);
        setIsProcessing(false);
        return;
      }

      // 2. Assign Attending Doctor (POST: /hospital/panel/admissions/assign-doctor)
      const docPayload = { 
        appointmentId: selectedCase._id, 
        doctorId: selectedDoctorId 
      };
      const docRes = await HospitalAPI.assignDoctorToAdmission(docPayload);

      if (docRes?.success) {
        alert(`Admission Finalized Successfully! Bed ${flowData.selectedBed.bedNumber} has been allocated.`);
        setActiveAction(null);
        setSelectedCase(null); 
        fetchEmergencies(); // Refresh candidates list
      } else {
        alert("Physician Assignment Failed: " + docRes.message);
      }

    } catch (error) {
      console.error(error);
      alert('Something went wrong during final admission setup.');
    } finally {
      setIsProcessing(false);
    }
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
          {activeTab === 'active' && <EmergencyTable items={data} onView={(c) => { setSelectedCase(c); setActiveAction(null); }} />}
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

      {/* RENDER MASTER CASE DETAIL MODAL */}
      {selectedCase && (
          <CaseDetailModal 
            caseData={selectedCase} 
            onClose={() => { setSelectedCase(null); setActiveAction(null); }} 
            onStartAllocation={handleStartAllocation}
          />
      )}

      {/* SEQUENTIAL MODAL 1: SELECT DATES */}
      <DateSelectorModal
        isOpen={activeAction === 'select-dates'}
        onClose={() => { setActiveAction(null); }}
        onNext={handleDatesCompleted}
        startDate={flowData.startDate}
        setStartDate={(val) => setFlowData(prev => ({ ...prev, startDate: val }))}
        endDate={flowData.endDate}
        setEndDate={(val) => setFlowData(prev => ({ ...prev, endDate: val }))}
      />

      {/* SEQUENTIAL MODAL 2: SELECT BED */}
      <BedAllocationModal
        isOpen={activeAction === 'select-bed'}
        onClose={() => { setActiveAction(null); }}
        onBack={() => { setActiveAction('select-dates'); }}
        onNext={handleBedSelectionNext}
        wards={bedAssignState.wards}
        selectedWard={flowData.selectedWard}
        beds={bedAssignState.beds}
        loadingBeds={bedAssignState.isLoadingData}
        onSelectWard={handleSelectWard}
        onSelectBed={handleSelectBed}
        selectedBed={flowData.selectedBed}
      />

      {/* SEQUENTIAL MODAL 3: SELECT DOCTOR */}
      <DoctorAssignmentModal
        isOpen={activeAction === 'select-doctor'}
        onClose={() => { setActiveAction(null); }}
        onBack={() => { setActiveAction('select-bed'); }}
        onFinalize={handleFinalizeAllotment}
        doctors={doctorList}
        selectedDoctorId={selectedDoctorId}
        onSelectDoctor={setSelectedDoctorId}
        isProcessing={isProcessing}
      />

    </div>
  );
};

export default EmergencyManagement;