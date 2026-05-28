'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // For Back Button
import { 
  FaArrowLeft, 
  FaTimes, 
  FaPhoneAlt, 
  FaUser, 
  FaTruck, 
  FaCheckCircle, 
  FaClock,
  FaMapMarkerAlt,
  FaHistory
} from 'react-icons/fa'

export default function TrackPhlebotomist() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Dummy Data
  const driversList =[
    { serial: 1, orderId: '282320250107101516', name: 'Anuj', phone: '7457895475', status: 'On the way', location: 'Sector 62, Mohali' },
    { serial: 2, orderId: '282320250107101517', name: 'Nitish', phone: '9876543210', status: 'Sample Collected', location: 'Phase 8, Chandigarh' },
    { serial: 3, orderId: '282320250107101518', name: 'Aarush', phone: '7597272101', status: 'Reaching Lab', location: 'Zirakpur, Punjab' },
  ];

  // Handle Track Button Click
  const handleTrack = (driver) => {
    setTrackingId(driver.orderId);
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
     

      {/* ========================================= */}
      {/* 📄 ORDER SUMMARY & TABLE SECTION          */}
      {/* ========================================= */}
      <div className="max-w-6xl mx-auto px-2"> {/* Wrapper for centering and max-width */}
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-1">Your Order Summary</h1>
            <h2 className="text-lg md:text-xl font-semibold text-[#1e3a8a]">Total Driver {driversList.length}</h2>
          </div>

          <button 
            onClick={() => router.back()} // Goes back to previous page
            className="flex items-center gap-2 px-6 py-2 bg-[#08B36A] text-white font-medium rounded hover:bg-green-600 transition-colors shadow-sm"
          >
            <FaArrowLeft className="text-sm" /> Back
          </button>
        </div>

        {/* Table Area */}
        <div className="bg-[#f8f9fa] rounded border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f1f3f5] border-b border-gray-200 text-gray-800 text-sm">
                <tr>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Serial no.</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">OrderId</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Phlebotomist boy name</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Phone no.</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {driversList.map((driver) => (
                  <tr 
                    key={driver.serial} 
                    className={`transition-colors duration-200 ${trackingId === driver.orderId ? 'bg-green-50' : 'hover:bg-white'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {driver.serial}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {driver.orderId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {driver.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {driver.phone}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleTrack(driver)}
                        className={`flex items-center justify-center gap-1.5 px-5 py-1.5 mx-auto rounded text-sm font-medium transition-all ${
                          trackingId === driver.orderId 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-[#08B36A] text-white hover:bg-green-600 shadow-sm'
                        }`}
                      >
                        {trackingId === driver.orderId ? (
                          <>Tracking <span className="flex h-2 w-2 relative ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span></>
                        ) : (
                          <>Track</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================= */}
      {/* 📍 TRACKING INFO MODAL (NO MAP)            */}
      {/* ========================================= */}
      {isModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>

          {/* Modal Box */}
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <FaTruck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Logistics Tracking</h3>
                  <p className="text-blue-200 text-xs">ID: {selectedDriver.orderId}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Agent Profile Section */}
              <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#1e3a8a]">
                    <FaUser size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{selectedDriver.name}</h4>
                    <p className="text-[#08B36A] font-bold text-sm flex items-center gap-1.5 mt-1">
                      <FaPhoneAlt size={10} /> {selectedDriver.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Status</span>
                    <span className="px-3 py-1 bg-[#08B36A] text-white text-[10px] font-black rounded-full uppercase">
                        {selectedDriver.status}
                    </span>
                </div>
              </div>

              {/* Location Card */}
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                <div className="p-3 bg-white rounded-full text-red-500 shadow-sm border border-red-50">
                    <FaMapMarkerAlt size={20} />
                </div>
                <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Last Seen Location</h5>
                    <p className="text-gray-800 font-bold text-base">{selectedDriver.location}</p>
                    <p className="text-gray-500 text-xs mt-1">Updated 2 mins ago</p>
                </div>
              </div>

              {/* Detailed Tracking History */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-4">
                    <FaHistory className="text-gray-400" size={14}/>
                    <h5 className="font-black text-gray-800 uppercase text-xs tracking-widest">Tracking Journey</h5>
                 </div>
                 
                 <div className="relative border-l-2 border-dashed border-gray-200 ml-4 pl-8 space-y-10">
                    {/* Step 1 - Completed */}
                    <div className="relative">
                       <span className="absolute -left-[45px] top-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm">
                         <FaCheckCircle size={14}/>
                       </span>
                       <div>
                        <p className="text-sm font-black text-gray-800">Order Assigned</p>
                        <p className="text-xs text-gray-500 font-medium">System confirmed & agent notified</p>
                        <p className="text-[10px] text-[#08B36A] font-bold mt-1">10:15 AM</p>
                       </div>
                    </div>

                    {/* Step 2 - Current/In Progress */}
                    <div className="relative">
                       <span className="absolute -left-[45px] top-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm animate-pulse">
                         <FaClock size={14}/>
                       </span>
                       <div>
                        <p className="text-sm font-black text-gray-800">{selectedDriver.status}</p>
                        <p className="text-xs text-gray-500 font-medium">Agent is moving towards the next checkpoint</p>
                        <p className="text-[10px] text-blue-500 font-bold mt-1 italic tracking-wider">LIVE UPDATING...</p>
                       </div>
                    </div>

                    {/* Step 3 - Upcoming */}
                    <div className="relative opacity-40">
                       <span className="absolute -left-[45px] top-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                         <FaMapMarkerAlt size={12}/>
                       </span>
                       <div>
                        <p className="text-sm font-black text-gray-800">Final Lab Handover</p>
                        <p className="text-xs text-gray-500 font-medium italic">Pending completion of current task</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-bold italic">Real-time status provided by GPS sync</p>
                <button 
                    onClick={closeModal}
                    className="px-8 py-2 bg-[#1e3a8a] text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md shadow-blue-100"
                >
                    Dismiss
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}