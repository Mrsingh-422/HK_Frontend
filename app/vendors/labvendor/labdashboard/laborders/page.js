'use client'
import React, { useState } from 'react'
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaUser, 
  FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaTimes, FaVial,
  FaCheck, FaExclamationTriangle 
} from 'react-icons/fa'

export default function LabOrdersPage() {
  const[activeTab, setActiveTab] = useState('Pending'); 
  const [selectedOrder, setSelectedOrder] = useState(null); 

  // ==========================================
  // STATE FOR APPROVE & REJECT MODALS
  // ==========================================
  const [actionOrder, setActionOrder] = useState(null); // Jis order pe action lena hai
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const[isRejectOpen, setIsRejectOpen] = useState(false);
  
  // Reject form state
  const[rejectReason, setRejectReason] = useState('Lab closed'); 
  const[rejectComment, setRejectComment] = useState('');

  // Dummy Data
  const [orders, setOrders] = useState([
    { id: 101, name: 'Yash User', address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Punjab', phone: '9999999999', status: 'Approved', date: '12 Mar 2026', amount: '₹1,200', tests:['Complete Blood Count (CBC)', 'Lipid Profile'] },
    { id: 102, name: 'Rahul Sharma', address: 'Sector 17, Chandigarh', phone: '8888888888', status: 'Approved', date: '12 Mar 2026', amount: '₹800', tests: ['Thyroid Profile (T3, T4, TSH)'] },
    { id: 103, name: 'Amit Kumar', address: 'Mohali, Punjab', phone: '7777777777', status: 'Rejected', date: '11 Mar 2026', amount: '₹450', tests: ['Blood Sugar Fasting'] },
    { id: 104, name: 'Priya Singh', address: 'Panchkula, Haryana', phone: '6666666666', status: 'Pending', date: '12 Mar 2026', amount: '₹2,100', tests:['Vitamin D', 'Vitamin B12'] },
    { id: 105, name: 'Neha Gupta', address: 'Zirakpur, Punjab', phone: '5555555555', status: 'Pending', date: '12 Mar 2026', amount: '₹600', tests:['Liver Function Test (LFT)'] },
  ]);

  const filteredOrders = orders.filter(order => order.status === activeTab);

  const closeModal = () => {
    setSelectedOrder(null);
  };

  // ==========================================
  // HANDLERS FOR ACTIONS
  // ==========================================
  const handleOpenApprove = (order, e = null) => {
    if(e) e.stopPropagation();
    setActionOrder(order);
    setIsApproveOpen(true);
  };

  const handleOpenReject = (order, e = null) => {
    if(e) e.stopPropagation();
    setActionOrder(order);
    setRejectReason('Lab closed'); // Reset reason
    setRejectComment(''); // Reset comment
    setIsRejectOpen(true);
  };

  const confirmApprove = () => {
    // Yahan API call aayegi (For now changing local state)
    setOrders(orders.map(o => o.id === actionOrder.id ? { ...o, status: 'Approved' } : o));
    setIsApproveOpen(false);
    setActionOrder(null);
  };

  const confirmReject = () => {
    // Yahan API call aayegi reject reason ke sath
    console.log(`Rejected ${actionOrder.id} due to: ${rejectReason}. Comment: ${rejectComment}`);
    setOrders(orders.map(o => o.id === actionOrder.id ? { ...o, status: 'Rejected' } : o));
    setIsRejectOpen(false);
    setActionOrder(null);
  };

  return (
    <div className="w-full relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lab Bookings & Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your patient test bookings here.</p>
        </div>

        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex space-x-1">
          {['Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab 
                  ? tab === 'Approved' ? 'bg-[#08B36A] text-white shadow-md shadow-green-200' 
                    : tab === 'Rejected' ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                    : 'bg-yellow-500 text-white shadow-md shadow-yellow-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Contact & Address</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)} 
                    className="hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">#ORD-{order.id}</span>
                      <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-full text-blue-600"><FaUser size={16} /></div>
                        <span className="font-medium text-gray-800">{order.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 max-w-xs">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhoneAlt className="text-gray-400 text-xs flex-shrink-0" />
                          <span className="font-medium">{order.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <FaMapMarkerAlt className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                          <span className="truncate" title={order.address}>{order.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' 
                        : order.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {order.status === 'Approved' && <FaCheckCircle />}
                        {order.status === 'Rejected' && <FaTimesCircle />}
                        {order.status === 'Pending' && <FaClock />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Pending me Approve aur Reject Modals open karvane wale buttons */}
                        {order.status === 'Pending' && (
                          <>
                            <button 
                              onClick={(e) => handleOpenApprove(order, e)} 
                              className="px-3 py-1.5 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={(e) => handleOpenReject(order, e)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg transition-colors"
                        >
                          <FaEye size={14} /> View
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3"><FaClock className="text-gray-300 text-3xl" /></div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">No {activeTab} Orders</h3>
                      <p className="text-gray-500 text-sm">You currently have no orders with '{activeTab}' status.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🌟 PATIENT DETAIL MODAL 🌟               */}
      {/* ========================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <FaUser size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">Patient Information</h2>
                  <span className="text-sm font-semibold text-[#08B36A]">#ORD-{selectedOrder.id}</span>
                </div>
              </div>
              <button onClick={closeModal} className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Detailed info content kept exactly same */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-semibold text-gray-800 text-lg">{selectedOrder.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-800 text-lg flex items-center gap-2">{selectedOrder.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Complete Address</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.address}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaVial className="text-[#08B36A]" /> Selected Tests
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <ul className="space-y-3">
                    {selectedOrder.tests.map((test, index) => (
                      <li key={index} className="flex justify-between items-center text-sm font-medium text-gray-700 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <span>{test}</span>
                        <FaCheckCircle className="text-green-500" />
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-600">Total Amount:</span>
                    <span className="font-black text-xl text-[#08B36A]">{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[2rem]">
              <button onClick={closeModal} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Close
              </button>
              {selectedOrder.status === 'Pending' && (
                <button 
                  onClick={() => { closeModal(); handleOpenApprove(selectedOrder); }} 
                  className="px-6 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors"
                >
                  Approve Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* ✅ 1. ACCEPT BOOKING MODAL (Small & Clean)*/}
      {/* ========================================= */}
      {isApproveOpen && actionOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsApproveOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-50 text-[#08B36A] rounded-full flex items-center justify-center mb-5 border-[6px] border-green-50/50">
              <FaCheck size={28} />
            </div>
            
            <h3 className="text-2xl font-bold text-[#1e3a8a] mb-3">Accept Booking?</h3>
            <p className="text-gray-500 text-sm mb-8 px-2 leading-relaxed">
              The lab request has been successfully accepted. The customer will be notified.
            </p>
            
            <button 
              onClick={confirmApprove} 
              className="w-full py-3.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5 text-lg"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* ❌ 2. REJECT BOOKING MODAL (With Options) */}
      {/* ========================================= */}
      {isRejectOpen && actionOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRejectOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            
            {/* Warning Icon & Title */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border-[6px] border-red-50/50">
                <FaExclamationTriangle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a8a]">Reject Booking</h3>
              <p className="text-gray-400 text-sm mt-2">Please select a reason for rejecting this request</p>
            </div>

            {/* Radio Options */}
            <div className="space-y-3.5 mb-6 px-2">
              {['Lab closed', 'Slot not available', 'Technician unavailable'].map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="rejectReason" 
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-5 h-5 text-red-500 bg-gray-100 border-gray-300 focus:ring-red-500 focus:ring-2 accent-red-500 cursor-pointer" 
                  />
                  <span className={`text-[15px] transition-colors ${rejectReason === reason ? 'text-red-500 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {/* Comment Box */}
            <div className="mb-8 px-2">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Additional Comments (Optional)</label>
              <textarea 
                rows="3" 
                placeholder="Type reason here..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none bg-gray-50 focus:bg-white transition-colors"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => setIsRejectOpen(false)} 
                className="flex-1 py-3.5 bg-white border-2 border-[#08B36A] text-[#08B36A] hover:bg-green-50 font-bold rounded-xl transition-colors text-base"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject} 
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-200 hover:-translate-y-0.5 text-base"
              >
                Reject Order
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}