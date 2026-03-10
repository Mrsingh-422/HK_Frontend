'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaUserInjured, FaPhoneAlt, FaEye, FaExclamationTriangle,
  FaClock, FaSearch, FaFilter, FaTimes, FaHospitalUser,
  FaBriefcaseMedical, FaTint, FaUserMd, FaChevronDown, FaCheck
} from "react-icons/fa"

export default function EmergencyCasesPage() {
  const { hospital } = useAuth();
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- DROPDOWN STATE ---
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const dropdownRef = useRef(null);

  // Mock Doctors List
  const doctorsList = [
    { id: "DOC001", name: "Dr. Sarah Smith", spec: "Cardiology", status: "On Duty" },
    { id: "DOC002", name: "Dr. Mike Ross", spec: "Trauma Surgeon", status: "On Duty" },
    { id: "DOC003", name: "Dr. Alex Karev", spec: "Pediatrics", status: "In Surgery" },
    { id: "DOC004", name: "Dr. Meredith Grey", spec: "General Surgeon", status: "Break" },
    { id: "DOC005", name: "Dr. House", spec: "Diagnostics", status: "On Duty" },
  ];

  // Mock Emergency Cases
  const [emergencyCases] = useState([
    {
      id: "EMG-8821",
      name: "John Doe",
      age: 45,
      gender: "Male",
      bloodGroup: "O+",
      condition: "Cardiac Arrest",
      priority: "Critical",
      contact: "+1 234 567 890",
      status: "Active",
      arrivalTime: "10:30 AM",
      address: "123 Main St, New York, NY",
      attendingDoctor: "Dr. Sarah Smith"
    },
    {
      id: "EMG-8845",
      name: "Jane Wilson",
      age: 28,
      gender: "Female",
      bloodGroup: "B-",
      condition: "Major Trauma (Accident)",
      priority: "Serious",
      contact: "+1 987 654 321",
      status: "Pending",
      arrivalTime: "11:15 AM",
      address: "456 Oak Ave, Brooklyn, NY",
      attendingDoctor: "Unassigned"
    }
  ]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDocDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCases = emergencyCases.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignDoctor = (doctor) => {
    setAssignedDoctor(doctor);
    setIsDocDropdownOpen(false);
    // Here you would typically call an API to update the database
    alert(`Assigned ${doctor.name} to patient ${selectedCase.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <FaBriefcaseMedical className="text-red-500" /> Emergency Registry
          </h1>
          <p className="text-gray-500 font-medium">Monitoring Active Arrivals</p>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient..."
            className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 w-full md:w-80"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Patient Details</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400">Condition</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400">Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCases.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-gray-600">{item.condition}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.priority === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                    }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => { setSelectedCase(item); setAssignedDoctor(null); }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <FaEye /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PATIENT DETAILS MODAL --- */}
      {selectedCase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedCase(null)}></div>

          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <FaHospitalUser className="text-[#08B36A]" /> Case File
                </h2>
                <button onClick={() => setSelectedCase(null)} className="p-2 bg-slate-50 text-slate-400 rounded-xl"><FaTimes /></button>
              </div>

              {/* Patient Basic Info Card */}
              <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-black text-[#08B36A]">
                  {selectedCase.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-black text-slate-800">{selectedCase.name}</p>
                  <p className="text-sm font-bold text-slate-400">{selectedCase.age} Years • {selectedCase.gender} • {selectedCase.bloodGroup}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                  <p className={`text-sm font-black ${selectedCase.priority === 'Critical' ? 'text-red-500' : 'text-orange-500'}`}>
                    {selectedCase.priority}
                  </p>
                </div>
              </div>

              {/* ASSIGN DOCTOR DROPDOWN SECTION */}
              <div className="mb-8 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Assign Medical Staff</label>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                    className="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-[#08B36A] transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 text-[#08B36A] flex items-center justify-center">
                        <FaUserMd />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-700">
                          {assignedDoctor ? assignedDoctor.name : "Select Doctor to Assign"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {assignedDoctor ? assignedDoctor.spec : "Browse on-duty staff"}
                        </p>
                      </div>
                    </div>
                    <FaChevronDown className={`text-slate-300 group-hover:text-[#08B36A] transition-transform ${isDocDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* DROPDOWN MENU */}
                  {isDocDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl z-10 max-h-60 overflow-y-auto animate-in slide-in-from-top-2">
                      <div className="p-2 space-y-1">
                        {doctorsList.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => handleAssignDoctor(doc)}
                            className="w-full p-3 flex items-center justify-between rounded-2xl hover:bg-green-50 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-[#08B36A]">
                                <FaUserMd />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-700">{doc.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doc.spec}</p>
                              </div>
                            </div>
                            {assignedDoctor?.id === doc.id && <FaCheck className="text-[#08B36A]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-green-100 transition">
                  Update Condition
                </button>
                <button className="bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition">
                  Request Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}