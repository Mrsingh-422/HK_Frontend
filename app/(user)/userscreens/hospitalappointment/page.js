"use client";
import React, { useState, useEffect } from "react";
// React Icons
import {
  HiOutlineLocationMarker, HiOutlineX, HiOutlineReceiptTax, 
  HiOutlineCalendar, HiOutlineDocumentDownload, HiOutlineClock, HiChevronLeft, HiChevronRight
} from "react-icons/hi";
import { FaUserMd, FaUserAlt, FaWallet, FaBed, FaCalendarAlt, FaStethoscope } from "react-icons/fa";
import { MdVerified, MdOutlineBedroomChild } from "react-icons/md";
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function MyHospitalAppointments() {
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  
  // Pagination State
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  // Reschedule State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchBookings(1);
  }, []);

  const fetchBookings = async (page) => {
    try {
      // Assuming UserAPI supports page query, adjust if necessary
      const response = await UserAPI.getMyHospitalBookings(page); 
      if (response.success) {
        setMyAppointments(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.start || !rescheduleData.end) {
      alert("Please select both dates");
      return;
    }

    const payload = {
        appointmentId: selectedAppt._id,
        newStartDate: rescheduleData.start,
        newEndDate: rescheduleData.end,
        newBedId: selectedAppt.bedId?._id || selectedAppt.bedId
    };

    try {
      const response = await UserAPI.recheduleHospitalBooking(payload);
      if (response.success) {
        alert("Booking rescheduled successfully!");
        setIsRescheduling(false);
        setIsModalOpen(false);
        fetchBookings(pagination.currentPage);
      } else {
        alert(response.message || "Reschedule failed");
      }
    } catch (error) {
      console.error("Error rescheduling:", error);
      alert("Something went wrong.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Admitted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Hospital-Pending": return "bg-orange-100 text-orange-700 border-orange-200";
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
            <div key={appt._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 space-y-4">
                  <div className="relative group overflow-hidden rounded-2xl h-48 bg-gray-100">
                    {appt.hospitalId?.hospitalImage ? (
                      <img src={`${BASE_URL}${appt.hospitalId.hospitalImage[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-black uppercase">Home Visit</div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      {appt.hospitalId?.name || "Home Visit"} {appt.hospitalId && <MdVerified className="text-blue-500" />}
                    </h3>
                    <p className="text-gray-400 text-xs font-bold flex items-center gap-1 mt-1"><HiOutlineLocationMarker /> {appt.hospitalId?.address || appt.address?.city}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Patient</p>
                      <p className="font-bold text-gray-800">{appt.patients[0]?.patientName}</p>
                      <p className="text-xs text-gray-500 font-medium">Age: {appt.patients[0]?.patientAge}</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                      <p className="text-[10px] font-black text-[#08b36a] uppercase mb-1">Total Amount</p>
                      <p className="text-lg font-black text-gray-900">₹{appt.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-[#08b36a]">{appt.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Specialist</span>
                        <span className="text-xs font-bold text-gray-700">{appt.doctorId?.name || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Date</span>
                        <span className="text-xs font-bold text-gray-700">{new Date(appt.appointmentDate).toLocaleDateString()}</span>
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

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
                <button disabled={pagination.currentPage === 1} onClick={() => fetchBookings(pagination.currentPage - 1)} className="p-3 bg-white rounded-xl shadow-sm border"><HiChevronLeft /></button>
                <span className="font-black text-sm">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => fetchBookings(pagination.currentPage + 1)} className="p-3 bg-white rounded-xl shadow-sm border"><HiChevronRight /></button>
            </div>
        )}
      </div>

      {/* --- DETAILED MODAL --- */}
      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest">{selectedAppt.hospitalId?.name || "Home Visit"}</h2>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Booking ID: {selectedAppt.bookingId}</p>
              </div>
              <button onClick={() => {setIsModalOpen(false); setIsRescheduling(false);}} className="p-2 hover:bg-white/10 rounded-full"><HiOutlineX size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-10">
              {!isRescheduling ? (
                  <>
                    <section>
                      <div className="flex items-center gap-2 mb-4"><FaUserAlt className="text-[#08b36a]" /><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Patient Details</h4></div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Patient", value: selectedAppt.patients[0]?.patientName },
                          { label: "Gender", value: selectedAppt.patients[0]?.gender },
                          { label: "Relation", value: selectedAppt.patients[0]?.relation },
                          { label: "Age", value: selectedAppt.patients[0]?.patientAge },
                        ].map((item, i) => (
                          <div key={i} className="bg-gray-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-gray-300 uppercase mb-1">{item.label}</p><p className="text-[11px] font-bold text-gray-800">{item.value}</p></div>
                        ))}
                      </div>
                    </section>
                    
                    <section className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600"><HiOutlineCalendar size={20}/> <div><p className="text-[9px] uppercase font-black text-gray-400">Start Date</p><p className="font-bold text-sm">{new Date(selectedAppt.startDate).toLocaleDateString()}</p></div></div>
                            <div className="flex items-center gap-3 text-gray-600"><HiOutlineClock size={20}/> <div><p className="text-[9px] uppercase font-black text-gray-400">Time</p><p className="font-bold text-sm">{selectedAppt.appointmentTime}</p></div></div>
                            {selectedAppt.bedId && <div className="flex items-center gap-3 text-gray-600"><FaBed size={20}/> <div><p className="text-[9px] uppercase font-black text-gray-400">Bed No</p><p className="font-bold text-sm">{selectedAppt.bedId.bedNumber} ({selectedAppt.bedId.wardId?.name})</p></div></div>}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600"><HiOutlineCalendar size={20}/> <div><p className="text-[9px] uppercase font-black text-gray-400">End Date</p><p className="font-bold text-sm">{new Date(selectedAppt.endDate).toLocaleDateString()}</p></div></div>
                            <div className="flex items-center gap-3 text-gray-600"><MdVerified size={20}/> <div><p className="text-[9px] uppercase font-black text-gray-400">Triage</p><p className="font-bold text-sm">{selectedAppt.triageLevel || 'N/A'}</p></div></div>
                        </div>
                    </section>

                    {selectedAppt.hospitalId && (
                      <div className="flex justify-between items-center bg-green-50/50 p-6 rounded-3xl border border-green-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08b36a] shadow-sm"><MdOutlineBedroomChild size={24} /></div>
                          <div>
                            <p className="text-[10px] font-black text-[#08b36a] uppercase">Booking Type</p>
                            <p className="font-bold text-gray-800">{selectedAppt.bookingType}</p>
                          </div>
                        </div>
                        <button onClick={() => setIsRescheduling(true)} className="bg-[#08b36a] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-green-600 transition-all">Reschedule</button>
                      </div>
                    )}
                  </>
              ) : (
                <section className="space-y-6">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Select New Dates</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase">New Start Date</label>
                      <input type="date" className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold" onChange={(e) => setRescheduleData({...rescheduleData, start: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase">New End Date</label>
                      <input type="date" className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold" onChange={(e) => setRescheduleData({...rescheduleData, end: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsRescheduling(false)} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase bg-gray-100 text-gray-600">Cancel</button>
                    <button onClick={handleReschedule} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase bg-gray-900 text-white">Confirm Reschedule</button>
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><FaWallet className="text-[#08b36a]" /><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Summary</h4></div></div>
                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Description</th><th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Amount</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr><td className="px-6 py-4 text-xs font-bold text-gray-600">Base Fee</td><td className="px-6 py-4 text-xs font-bold text-gray-800 text-right">₹{selectedAppt.pricingBreakdown.baseFee}</td></tr>
                      <tr><td className="px-6 py-4 text-xs font-bold text-gray-600">Subtotal</td><td className="px-6 py-4 text-xs font-bold text-gray-800 text-right">₹{selectedAppt.pricingBreakdown.subtotal}</td></tr>
                      {selectedAppt.pricingBreakdown.discountAmount > 0 && <tr><td className="px-6 py-4 text-xs font-bold text-red-500">Discount</td><td className="px-6 py-4 text-xs font-bold text-red-500 text-right">-₹{selectedAppt.pricingBreakdown.discountAmount}</td></tr>}
                    </tbody>
                    <tfoot className="bg-gray-900 text-white"><tr><td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Total Payable</td><td className="px-6 py-4 font-black text-right">₹{selectedAppt.totalAmount}</td></tr></tfoot>
                  </table>
                </div>
              </section>

              {selectedAppt.specialServices?.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4"><FaStethoscope className="text-[#08b36a]" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Special Services</h4></div>
                    <div className="flex flex-wrap gap-2">
                        {selectedAppt.specialServices.map((svc) => (
                            <span key={svc._id} className="bg-gray-100 px-4 py-2 rounded-xl text-[10px] font-black text-gray-600 uppercase">{svc.serviceName} (+₹{svc.price})</span>
                        ))}
                    </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyHospitalAppointments;