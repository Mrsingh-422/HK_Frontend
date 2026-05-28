'use client'
import React, { useState } from 'react'
import {
  FaUserCheck, FaFileAlt, FaSignOutAlt, FaHospitalUser,
  FaClock, FaMapMarkerAlt, FaNotesMedical, FaTimes,
  FaCheckCircle, FaSearch, FaExclamationCircle, FaUserMd
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
            <span className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-200 text-white flex items-center justify-center">
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

      {/* --- TABLE CONTAINER --- */}
      {filteredPatients.length > 0 && (
        <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="p-4">Patient Info</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Doctor & Location</th>
                  <th className="p-4">Est. Time</th>
                  <th className="p-4">Discharge Summary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Patient Name, ID, Age, Gender */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-0.5">{patient.id}</span>
                        <span className="text-sm font-black text-slate-800 leading-tight">{patient.name}</span>
                        <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                          {patient.age} Yrs &bull; {patient.gender}
                        </span>
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-rose-50 text-rose-500 rounded-md text-xs">
                          <FaNotesMedical size={10} />
                        </span>
                        <span className="font-bold text-slate-700 text-xs">{patient.condition}</span>
                      </div>
                    </td>

                    {/* Doctor & Location */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <FaUserMd className="text-slate-400" size={11} />
                          <span>{patient.doctor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                          <FaMapMarkerAlt className="text-slate-400" size={11} />
                          <span>Room {patient.room}</span>
                        </div>
                      </div>
                    </td>

                    {/* Estimated Time */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <FaClock className="text-slate-400" size={11} />
                        <span>{patient.dischargeTime}</span>
                      </div>
                    </td>

                    {/* Discharge Summary */}
                    <td className="p-4 max-w-xs">
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {patient.summary}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        patient.status === 'Ready' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-orange-50 text-orange-600'
                      }`}>
                        {patient.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setActivePatient(patient);
                            setIsCompleteOpen(true);
                          }}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-black text-[10px] flex items-center gap-1 transition shadow-sm"
                        >
                          <FaCheckCircle size={10} /> COMPLETE
                        </button>
                        <button
                          onClick={() => handleOpenDetail(patient)}
                          className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800 rounded-lg font-black text-[10px] flex items-center gap-1 transition"
                        >
                          <FaFileAlt size={10} /> DETAILS
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          <div className="text-center py-20 max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FaUserCheck size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No pending discharges</h3>
            <p className="text-slate-400">All cleared patients have been processed.</p>
          </div>
        )
      }
    </div>
  )
}