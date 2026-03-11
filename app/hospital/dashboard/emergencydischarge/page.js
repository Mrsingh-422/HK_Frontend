'use client'
import React, { useState } from 'react'
import {
  FaUserCheck, FaFileAlt, FaSignOutAlt, FaHospitalUser,
  FaClock, FaMapMarkerAlt, FaNotesMedical, FaTimes,
  FaCheckCircle, FaSearch, FaExclamationCircle
} from 'react-icons/fa'
import PatientDetailModal from './components/PatientDetailModal';
import CompleteDischargeModal from './components/CompleteDischargeModal';

export default function EmergencyDischargePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const handleOpenDetail = (patient) => {
    setActivePatient(patient);
    setIsModalOpen(true);
  };

  // Mock Data for Patients awaiting discharge
  const [patients, setPatients] = useState([
    {
      id: "PT-9901",
      name: "Marcus Aurelius",
      age: 52,
      gender: "Male",
      condition: "Post-Cardiac Stable",
      room: "ER-A4",
      dischargeTime: "12:45 PM",
      doctor: "Dr. Sarah Smith",
      summary: "Patient responded well to treatment. Vitals are stable for 6 hours. Home medications prescribed.",
      status: "Ready"
    },
    {
      id: "PT-9905",
      name: "Elena Gilbert",
      age: 24,
      gender: "Female",
      condition: "Severe Dehydration",
      room: "ER-B12",
      dischargeTime: "01:15 PM",
      doctor: "Dr. House",
      summary: "IV fluids completed. Electrolytes balanced. No signs of infection. Recommended rest.",
      status: "Pending Signature"
    },
    {
      id: "PT-9912",
      name: "Arthur Shelby",
      age: 40,
      gender: "Male",
      condition: "Laceration Repair",
      room: "ER-C02",
      dischargeTime: "02:00 PM",
      doctor: "Dr. Mike Ross",
      summary: "12 stitches applied to forearm. Tetanus shot administered. Follow up in 7 days.",
      status: "Ready"
    }
  ]);

  const handleCompleteDischarge = (id, name) => {
    if (confirm(`Confirm final discharge for ${name}?`)) {
      setPatients(patients.filter(p => p.id !== id));
      alert(`${name} has been officially discharged from the registry.`);
    }
  };

  const handleConfirmDischarge = (data) => {
    console.log("Finalized Data:", data);
    // data.amount = '500'
    // data.receipt = File object
    // Call your API here to save these values
    alert(`Discharge complete for patient. Total: $${data.amount}`);
  };


  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">

      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-200 text-white">
              <FaSignOutAlt />
            </span>
            Discharge Lounge
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage finalized cases and patient departures</p>
        </div>

        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name or ID..."
            className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- CARDS GRID --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

            {/* Top Section */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${patient.status === 'Ready' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {patient.status}
                </div>
                <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest">{patient.id}</p>
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-1">{patient.name}</h3>
              <p className="text-slate-500 font-bold text-sm mb-6 flex items-center gap-2">
                <FaNotesMedical className="text-slate-300" /> {patient.condition}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><FaMapMarkerAlt size={12} /></div>
                  <span className="text-sm font-bold">Location: <span className="text-slate-800">{patient.room}</span></span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><FaClock size={12} /></div>
                  <span className="text-sm font-bold">Est. Time: <span className="text-slate-800">{patient.dischargeTime}</span></span>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="mt-auto p-4 bg-slate-50/50 flex gap-3">
              <button
                onClick={() => {
                  setActivePatient(patient);
                  setIsCompleteOpen(true);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-green-100"
              >
                <FaCheckCircle /> COMPLETE
              </button>
              <button
                onClick={() => handleOpenDetail(patient)}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition"
              >
                <FaFileAlt /> DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RENDER MODAL */}
      {
        isModalOpen && (
          <PatientDetailModal
            patient={activePatient}
            onClose={() => setIsModalOpen(false)}
          />
        )
      }

      {
        isCompleteOpen && (
          <CompleteDischargeModal
            patient={activePatient}
            onClose={() => setIsCompleteOpen(false)}
            onConfirm={handleConfirmDischarge}
          />
        )
      }

      {/* Empty State */}
      {
        filteredPatients.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FaUserCheck size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No pending discharges</h3>
            <p className="text-slate-400">All cleared patients have been processed.</p>
          </div>
        )
      }
    </div >
  )
}