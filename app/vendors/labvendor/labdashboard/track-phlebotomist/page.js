'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // For Back Button
import { FaMapMarkerAlt, FaArrowLeft, FaCrosshairs } from 'react-icons/fa'

export default function TrackPhlebotomist() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState(null);

  // Dummy Data
  const driversList =[
    { serial: 1, orderId: '282320250107101516', name: 'Anuj', phone: '7457895475' },
    { serial: 2, orderId: '282320250107101517', name: 'Nitish', phone: '9876543210' },
    { serial: 3, orderId: '282320250107101518', name: 'Aarush', phone: '7597272101' },
  ];

  // Handle Track Button Click
  const handleTrack = (id) => {
    setTrackingId(id);
    // Yahan map center/update karne ka logic aa sakta hai
    alert(`Tracking started for Order ID: ${id}`);
  };

  return (
    <div className="w-full">
      
      {/* ========================================= */}
      {/* 🗺️ MAP SECTION                             */}
      {/* ========================================= */}
      <div className="w-full h-[400px] mb-8 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group">
        {/* Placeholder Google Map (Chandigarh coordinates embedded) */}
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109741.02912911311!2d76.69348873658222!3d30.73506264436677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fed0be66ec96b%3A0xa5ff67da71cbc6dd!2sChandigarh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
        ></iframe>

        {/* Custom Overlay Label (Optional: To make it look more like your app) */}
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100 flex items-center gap-2 text-sm font-bold text-blue-600 cursor-pointer hover:bg-gray-50">
          <FaMapMarkerAlt /> Open in Maps
        </div>
      </div>

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
                        onClick={() => handleTrack(driver.orderId)}
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
    </div>
  )
}