'use client'
import React, { useState } from 'react'
import { 
  FaHistory, 
  FaUser, 
  FaRupeeSign, 
  FaEye, 
  FaTimes, 
  FaFileInvoice,
  FaCalendarAlt,
  FaFilePdf
} from 'react-icons/fa'

export default function OrderHistoryPage() {
  
  // State for Modal
  const[selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dummy Data (Based on your image)
  const orders =[
    { 
      id: '908920241108050613', 
      patientName: 'Yash Userhhhhhh', 
      price: '1234.0', 
      date: '2026-03-10',
      status: 'Completed'
    },
    { 
      id: '922620250514012722', 
      patientName: 'Aarush Choudhary', 
      price: '72270.0', 
      date: '2026-03-11',
      status: 'Completed'
    },
    { 
      id: '140820241108065850', 
      patientName: 'Yash User', 
      price: '225.00', 
      date: '2026-03-12',
      status: 'Completed'
    },
  ];

  // Handler to open Modal
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handler to close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="w-full relative">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
            <FaHistory className="text-[#08B36A]"/> Order History
          </h1>
          <p className="text-gray-500 text-sm mt-1">View past orders and download their complete reports.</p>
        </div>
        
        {/* Total Orders Badge */}
        <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 px-5 py-2.5 rounded-xl flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">Total Orders:</span>
          <span className="bg-[#1e3a8a] text-white text-lg font-black px-3 py-0.5 rounded-lg shadow-sm">
            {orders.length}
          </span>
        </div>
      </div>

      {/* ========================================= */}
      {/* TABLE SECTION                             */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Patient Name</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleRowClick(order)} 
                  className="hover:bg-green-50/50 transition-colors duration-200 cursor-pointer group"
                >
                  
                  {/* Order ID & Icon */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a8a]">
                        <FaFileInvoice size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">{order.id}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaCalendarAlt /> {order.date}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Patient Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-700 flex items-center gap-2">
                      <FaUser className="text-gray-400 text-sm"/> {order.patientName}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-black text-[#08B36A] flex items-center gap-0.5 text-base">
                      <FaRupeeSign className="text-sm"/> {order.price}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* View Report Button (Same as image) */}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); // Prevents double firing of row click
                        handleRowClick(order); 
                      }}
                      className="px-4 py-2 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <FaEye size={14} /> View Report
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State if no orders */}
          {orders.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <FaHistory className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No order history found.</p>
            </div>
          )}
        </div>
      </div>


      {/* ========================================= */}
      {/* 🌟 ORDER INFO & REPORT MODAL 🌟           */}
      {/* ========================================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
                <FaFileInvoice className="text-[#08B36A]"/> Order Details
              </h2>
              <button 
                onClick={handleCloseModal} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Top Banner (Order ID) */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Order ID</p>
                <p className="text-xl font-black text-[#1e3a8a] tracking-wider">{selectedOrder.id}</p>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><FaUser /> Patient Name:</span>
                  <span className="text-sm font-bold text-gray-800">{selectedOrder.patientName}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><FaCalendarAlt /> Date of Order:</span>
                  <span className="text-sm font-bold text-gray-800">{selectedOrder.date}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><FaRupeeSign /> Total Price:</span>
                  <span className="text-lg font-black text-[#08B36A]">₹ {selectedOrder.price}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer (Download Report Button) */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button 
                onClick={handleCloseModal} 
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              
              <button 
                onClick={() => { alert('Downloading Report for ' + selectedOrder.id); handleCloseModal(); }} 
                className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <FaFilePdf size={16} /> Download Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}