"use client";
import React, { useState } from "react";
// React Icons
import {
  HiOutlineLocationMarker, HiOutlinePhone, HiOutlineCalendar,
  HiOutlineClock, HiOutlineExternalLink, HiOutlineX, HiOutlineInformationCircle,
  HiOutlineReceiptTax, HiOutlineUserGroup, HiOutlineDocumentDownload,
} from "react-icons/hi";
import { FaUserMd, FaHospital, FaChevronRight, FaStethoscope, FaBed, FaUserAlt, FaWallet } from "react-icons/fa";
import { MdOutlineMedicalServices, MdVerified, MdOutlineBedroomChild, } from "react-icons/md";
import { HOSPITAL_APPOINTMENT } from "@/app/constants/constants";

function MyHospitalAppointments() {
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [myAppointments] = useState(HOSPITAL_APPOINTMENT);

  const getStatusColor = (status) => {
    switch (status) {
      case "Admitted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Medical Records</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Appointments & Admissions</p>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {myAppointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">

                {/* Side: Basic Info & Status */}
                <div className="md:w-1/3 space-y-4">
                  <div className="relative group overflow-hidden rounded-2xl h-48">
                    <img src={appt.hospital.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">{appt.hospital.name} <MdVerified className="text-blue-500" /></h3>
                    <p className="text-gray-400 text-xs font-bold flex items-center gap-1 mt-1"><HiOutlineLocationMarker /> {appt.hospital.address}</p>
                  </div>
                </div>

                {/* Main: Quick Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Admitted Patient</p>
                      <p className="font-bold text-gray-800">{appt.patient.name}</p>
                      <p className="text-xs text-gray-500 font-medium">Age: {appt.patient.age} | {appt.patient.uhid}</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                      <p className="text-[10px] font-black text-[#08b36a] uppercase mb-1">Billing Summary</p>
                      <p className="text-lg font-black text-gray-900">{appt.billing.currency}{appt.billing.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-[#08b36a]">{appt.billing.pendingAmount > 0 ? `Pending: ${appt.billing.currency}${appt.billing.pendingAmount}` : 'Fully Paid'}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Specialist</span>
                        <span className="text-xs font-bold text-gray-700">{appt.assignedDoctor.split('(')[0]}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Admission Date</span>
                        <span className="text-xs font-bold text-gray-700">{appt.patient.admissionDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedAppt(appt); setIsModalOpen(true); }}
                      className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#08b36a] transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                      Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- DETAILED MODAL --- */}
      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">

            <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest">{selectedAppt.hospital.name}</h2>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Admission Record: {selectedAppt.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><HiOutlineX size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-10">

              {/* 1. PATIENT INFORMATION */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FaUserAlt className="text-[#08b36a]" />
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Patient Details</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Patient Name", value: selectedAppt.patient.name, icon: FaUserAlt },
                    { label: "UHID Number", value: selectedAppt.patient.uhid, icon: HiOutlineReceiptTax },
                    { label: "Blood Group", value: selectedAppt.patient.bloodGroup, icon: HiOutlineCalendar }, // reusing an icon or similar
                    { label: "Admission", value: selectedAppt.patient.admissionDate, icon: HiOutlineCalendar },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-300 uppercase mb-1">{item.label}</p>
                      <p className="text-[11px] font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. ADMISSION INFO */}
              <section className="bg-green-50/30 p-6 rounded-[32px] border border-green-50 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08b36a] shadow-sm">
                    <MdOutlineBedroomChild size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#08b36a] uppercase">Room Assignment</p>
                    <p className="font-bold text-gray-800">{selectedAppt.patient.roomType}</p>
                    <p className="text-xs text-gray-400 font-medium">{selectedAppt.patient.ward}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08b36a] shadow-sm">
                    <FaUserMd size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#08b36a] uppercase">Supervising Doctor</p>
                    <p className="font-bold text-gray-800">{selectedAppt.assignedDoctor}</p>
                  </div>
                </div>
              </section>

              {/* 3. FINANCIAL / BILLING SUMMARY */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaWallet className="text-[#08b36a]" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Summary</h4>
                  </div>
                  <button className="text-[#08b36a] text-[10px] font-black uppercase flex items-center gap-1 hover:underline">
                    <HiOutlineDocumentDownload size={16} /> Download Invoice
                  </button>
                </div>

                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Service Description</th>
                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedAppt.billing.breakdown.map((item, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-xs font-bold text-gray-600">{item.label}</td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-800 text-right">{selectedAppt.billing.currency}{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-900 text-white">
                      <tr>
                        <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Total Estimated Bill</td>
                        <td className="px-6 py-4 font-black text-right">{selectedAppt.billing.currency}{selectedAppt.billing.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-4 flex gap-3">
                  <div className="flex-1 bg-green-50 border border-green-100 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-[#08b36a] uppercase">Paid Amount</p>
                    <p className="text-sm font-black text-gray-800">{selectedAppt.billing.currency}{selectedAppt.billing.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-red-500 uppercase">Outstanding</p>
                    <p className="text-sm font-black text-gray-800">{selectedAppt.billing.currency}{selectedAppt.billing.pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </section>

              {/* 4. HOSPITAL ABOUT */}
              <section className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  *This is a digital record generated by {selectedAppt.hospital.name}. For billing disputes, contact {selectedAppt.hospital.phone}.
                </p>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyHospitalAppointments;