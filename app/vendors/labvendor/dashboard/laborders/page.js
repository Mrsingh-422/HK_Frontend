'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaMapMarkerAlt, FaPhoneAlt, FaUser, 
  FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaTimes, FaVial,
  FaCheck, FaExclamationTriangle, FaTruckLoading, FaMoneyBillWave,
  FaIdBadge, FaCheckDouble, FaCalendarAlt, FaFlask, FaClipboardList,
  FaPercentage, FaShippingFast, FaWallet
} from 'react-icons/fa'
// Adjust path based on your folder structure
import { toast } from 'react-hot-toast';
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function LabOrdersPage() {
  const [activeTab, setActiveTab] = useState('Pending'); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); 

  // Modal States
  const [actionOrder, setActionOrder] = useState(null); 
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  // Reject & Assign state
  const [rejectReason, setRejectReason] = useState('Lab closed'); 
  const [rejectComment, setRejectComment] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      /**
       * STATUS MAPPING LOGIC:
       * UI Tab "Approved" maps to Backend "Confirmed"
       * UI Tab "Rejected" maps to Backend "Cancelled" (since your DB stores them as Cancelled)
       */
      let apiStatus = activeTab;
      if (activeTab === 'Approved') apiStatus = 'Confirmed';
      if (activeTab === 'Rejected') apiStatus = 'Cancelled'; // Fetch 'Cancelled' items for the 'Rejected' tab

      const response = await LabVendorAPI.getOrders(apiStatus);
      
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      toast.error(`Could not load ${activeTab} orders`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await LabVendorAPI.getDrivers();
      if (response.success) setDrivers(response.data || []);
    } catch (error) {
      toast.error("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleOpenApprove = (order, e = null) => {
    if(e) e.stopPropagation();
    setActionOrder(order);
    setIsApproveOpen(true);
  };

  const handleOpenReject = (order, e = null) => {
    if(e) e.stopPropagation();
    setActionOrder(order);
    setIsRejectOpen(true);
  };

  const handleOpenAssign = (order, e = null) => {
    if(e) e.stopPropagation();
    setActionOrder(order);
    fetchDrivers();
    setIsAssignOpen(true);
  };

  const confirmApprove = async () => {
    if (!actionOrder) return;
    try {
      const response = await LabVendorAPI.orderAction(actionOrder._id, 'Accepted');
      if (response.success) {
        toast.success("Order Approved & Confirmed");
        setIsApproveOpen(false);
        setActionOrder(null);
        fetchOrders(); 
      } else {
        toast.error(response.message || "Failed to approve order");
      }
    } catch (error) {
      console.error("Approval Error:", error);
      toast.error("Server Error: Failed to approve order");
    }
  };

  const confirmReject = async () => {
    if (!actionOrder) return;
    try {
      const fullReason = rejectComment ? `${rejectReason}: ${rejectComment}` : rejectReason;
      
      // Sending 'Rejected' status to API
      const response = await LabVendorAPI.orderAction(actionOrder._id, 'Rejected', fullReason);
      
      if (response.success) {
        toast.success("Order Rejected Successfully");
        setIsRejectOpen(false);
        setActionOrder(null);
        fetchOrders(); 
      } else {
        toast.error(response.message || "Failed to reject order");
      }
    } catch (error) {
      console.error("Rejection Error:", error);
      toast.error("Server Error: Failed to reject order");
    }
  };

  const confirmAssign = async () => {
    if(!selectedDriverId) return toast.error("Please select a phlebotomist");
    try {
      const response = await LabVendorAPI.assignStaff(actionOrder._id, selectedDriverId);
      if (response.success) {
        toast.success("Staff assigned successfully");
        setIsAssignOpen(false);
        setSelectedDriverId(''); 
        setActionOrder(null);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to assign staff");
    }
  };

  return (
    <div className="w-full relative p-4">
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
                  ? tab === 'Approved' ? 'bg-[#08B36A] text-white shadow-md' 
                    : tab === 'Rejected' ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-yellow-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
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
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Patient(s)</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan="5" className="text-center py-20 text-gray-400 font-bold animate-pulse">Fetching orders...</td></tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr 
                    key={order.bookingId} 
                    onClick={() => setSelectedOrder(order)} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{order.bookingId}</span>
                      <p className="text-xs text-gray-400 mt-1">{order.createdAt?.split('T')[0]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-full text-blue-600"><FaUser size={14} /></div>
                        <div>
                           <p className="font-medium text-gray-800">{order.patients?.[0]?.name || 'N/A'}</p>
                           {order.patients?.length > 1 && <p className="text-xs text-blue-500">+{order.patients.length - 1} more</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">{order.collectionType}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">{order.address?.city || 'Walk-in'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.status === 'Confirmed' || order.status === 'Approved' || order.status === 'Accepted' ? 'bg-green-100 text-green-700' 
                        : (order.status === 'Rejected' || order.status === 'Cancelled') ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                         {(order.status === 'Rejected' || order.status === 'Cancelled') ? 'Rejected' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {activeTab === 'Pending' && (
                          <>
                            <button onClick={(e) => handleOpenApprove(order, e)} className="px-3 py-1.5 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors">Approve</button>
                            <button onClick={(e) => handleOpenReject(order, e)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors">Reject</button>
                          </>
                        )}
                        {(activeTab === 'Approved' || order.status === 'Confirmed' || order.status === 'Accepted') && (
                           <button onClick={(e) => handleOpenAssign(order, e)} className="px-3 py-1.5 bg-[#08B36A] text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-sm hover:bg-green-600 transition-colors">
                             <FaTruckLoading /> Assign Staff
                           </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"><FaEye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No {activeTab} Orders Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🌟 VIEW DETAILS MODAL (FULL INFO) 🌟      */}
      {/* ========================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-[#08B36A] to-[#069658] text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                    <FaClipboardList size={30} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Order Information</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">ID: {selectedOrder.bookingId}</span>
                      <span className="bg-white text-[#08B36A] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                        { (selectedOrder.status === 'Rejected' || selectedOrder.status === 'Cancelled') ? 'Rejected' : selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* Rejection Reason display */}
              {(selectedOrder.status === 'Rejected' || selectedOrder.status === 'Cancelled') && selectedOrder.cancelReason && (
                <div className="bg-red-50 border border-red-100 p-5 rounded-3xl">
                   <p className="text-[10px] uppercase font-bold text-red-400 mb-1 tracking-widest flex items-center gap-2">
                     <FaExclamationTriangle /> Reason for Rejection
                   </p>
                   <p className="text-sm font-bold text-red-700 italic">"{selectedOrder.cancelReason}"</p>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Booking Type</p>
                  <p className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <FaFlask className="text-[#08B36A]" /> {selectedOrder.bookingType || 'Direct'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Collection</p>
                  <p className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <FaTruckLoading className="text-[#08B36A]" /> {selectedOrder.collectionType}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Date & Time</p>
                  <p className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <FaCalendarAlt className="text-[#08B36A]" /> {selectedOrder.appointmentTime} | {selectedOrder.appointmentDate?.split('T')[0]}
                  </p>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#08B36A] rounded-full"></div> Patient Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.isArray(selectedOrder.patients) && selectedOrder.patients.map((p, i) => (
                    <div key={i} className="flex flex-col p-4 bg-white rounded-2xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-50 text-[#08B36A] rounded-full flex items-center justify-center font-bold">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{p.relation}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs font-medium text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">{p.gender}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">{p.age} Years</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection Address */}
              {selectedOrder.address && (
                <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#08B36A] rounded-full"></div> Collection Address
                  </h3>
                  <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 relative overflow-hidden">
                    <FaMapMarkerAlt className="absolute -right-4 -bottom-4 text-green-100" size={100} />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold text-[#08B36A] uppercase tracking-widest">{selectedOrder.address.addressType || 'Home'}</p>
                          <p className="font-black text-gray-900 text-lg">{selectedOrder.userId?.name || 'User'}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 text-[#08B36A] font-bold bg-white px-4 py-2 rounded-xl shadow-sm">
                          <FaPhoneAlt size={12} /> {selectedOrder.userId?.phone}
                        </div>
                      </div>
                      <p className="text-gray-700 font-bold leading-relaxed">
                        House No: {selectedOrder.address.houseNo}, Sector: {selectedOrder.address.sector || 'N/A'}
                        {selectedOrder.address.landmark && `, Landmark: ${selectedOrder.address.landmark}`}
                        <br />
                        {selectedOrder.address.city || 'N/A'}, {selectedOrder.address.state || 'N/A'} - {selectedOrder.address.pincode || ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment & Billing */}
              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#08B36A] rounded-full"></div> Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Method</p>
                        <p className="font-bold text-gray-800 flex items-center gap-2"><FaWallet className="text-[#08B36A]" /> {selectedOrder.paymentMethod || 'COD'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Status</p>
                        <p className={`font-bold flex items-center gap-2 ${selectedOrder.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                           <FaCheckCircle /> {selectedOrder.paymentStatus || 'Pending'}
                        </p>
                    </div>
                </div>

                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-6">
                  <div className="space-y-4 mb-6">
                    {(() => {
                        const tests = selectedOrder.items?.tests || [];
                        const packages = selectedOrder.items?.packages || [];
                        const allItems = [...tests, ...packages];

                        if (allItems.length > 0) {
                            return allItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm font-bold text-gray-700 group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#08B36A]"></div>
                                    <span>{item.name}</span>
                                    {item.packageId && <span className="text-[9px] bg-green-50 text-[#08B36A] px-1.5 py-0.5 rounded uppercase">Package</span>}
                                  </div>
                                  <span className="text-gray-900 group-hover:text-[#08B36A]">₹{item.price}</span>
                                </div>
                            ));
                        }
                        return <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">No tests or packages listed</p>;
                    })()}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>Item Total</span>
                      <span>₹{selectedOrder.billSummary?.itemTotal || 0}</span>
                    </div>
                    {selectedOrder.billSummary?.homeVisitCharge > 0 && (
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Visit Charges</span>
                        <span>+ ₹{selectedOrder.billSummary?.homeVisitCharge}</span>
                      </div>
                    )}
                    {selectedOrder.billSummary?.distanceCharge > 0 && (
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Distance Charges</span>
                        <span>+ ₹{selectedOrder.billSummary?.distanceCharge}</span>
                      </div>
                    )}
                    {selectedOrder.billSummary?.rapidDeliveryCharge > 0 && (
                      <div className="flex justify-between text-xs font-bold text-blue-600 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><FaShippingFast /> Rapid Delivery</span>
                        <span>+ ₹{selectedOrder.billSummary?.rapidDeliveryCharge}</span>
                      </div>
                    )}
                    {(selectedOrder.billSummary?.itemDiscount > 0 || selectedOrder.billSummary?.couponDiscount > 0) && (
                        <div className="pt-2 mt-2 border-t border-gray-200 space-y-2">
                             {selectedOrder.billSummary?.itemDiscount > 0 && (
                                <div className="flex justify-between text-xs font-bold text-red-500 uppercase tracking-widest">
                                    <span>Item Discount</span>
                                    <span>- ₹{selectedOrder.billSummary?.itemDiscount}</span>
                                </div>
                             )}
                             {selectedOrder.billSummary?.couponDiscount > 0 && (
                                <div className="flex justify-between text-xs font-bold text-red-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><FaPercentage /> Coupon Discount</span>
                                    <span>- ₹{selectedOrder.billSummary?.couponDiscount}</span>
                                </div>
                             )}
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-dashed border-gray-300">
                      <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Total Amount</span>
                      <span className="text-2xl font-black text-[#08B36A]">₹{selectedOrder.billSummary?.totalAmount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50 flex flex-wrap justify-end gap-4">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-8 py-3.5 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                Close
              </button>
              
              {selectedOrder.status === 'Pending' && (activeTab === 'Pending') && (
                <>
                  <button 
                    onClick={() => { setSelectedOrder(null); handleOpenReject(selectedOrder); }} 
                    className="px-8 py-3.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                  >
                    Reject Order
                  </button>
                  <button 
                    onClick={() => { setSelectedOrder(null); handleOpenApprove(selectedOrder); }} 
                    className="px-8 py-3.5 bg-[#08B36A] text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-95"
                  >
                    Approve Order
                  </button>
                </>
              )}
              {(selectedOrder.status === 'Confirmed' || selectedOrder.status === 'Accepted') && (
                <button 
                  onClick={() => { setSelectedOrder(null); handleOpenAssign(selectedOrder); }} 
                  className="px-8 py-3.5 bg-[#08B36A] text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-95"
                >
                  Assign Staff Member
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ 1. ACCEPT MODAL */}
      {isApproveOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsApproveOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-green-50 text-[#08B36A] rounded-full flex items-center justify-center mb-5 border-[6px] border-green-50/50">
              <FaCheck size={28} />
            </div>
            <h3 className="text-2xl font-bold text-[#1e3a8a] mb-3">Accept Booking?</h3>
            <p className="text-gray-500 text-sm mb-8">Confirm to accept order {actionOrder?.bookingId}.</p>
            <button onClick={confirmApprove} className="w-full py-3.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-colors">Confirm Booking</button>
          </div>
        </div>
      )}

      {/* ❌ 2. REJECT MODAL */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRejectOpen(false)}></div>
          <div className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border-[6px] border-red-50/50">
                <FaExclamationTriangle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a8a]">Reject Booking</h3>
            </div>
            <div className="space-y-3.5 mb-6">
              {['Lab closed', 'Slot not available', 'Technician unavailable'].map(reason => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" checked={rejectReason === reason} onChange={() => setRejectReason(reason)} className="accent-red-500 w-5 h-5 cursor-pointer" />
                  <span className={`text-sm ${rejectReason === reason ? 'text-red-500 font-bold' : 'text-gray-600'}`}>{reason}</span>
                </label>
              ))}
              <textarea placeholder="Optional comments..." value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} className="w-full p-4 border rounded-xl text-sm bg-gray-50 outline-none focus:border-red-300" rows="3" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsRejectOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={confirmReject} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-colors">Reject Order</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚚 3. PREMIUM ASSIGN STAFF MODAL */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignOpen(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#08B36A] p-8 text-white relative">
              <button onClick={() => setIsAssignOpen(false)} className="absolute top-6 right-6 text-white/80 hover:text-white"><FaTimes size={20} /></button>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><FaTruckLoading size={28} /></div>
                <div><h3 className="text-2xl font-extrabold tracking-tight">Assign Staff</h3><p className="text-white/80 text-sm font-medium">Select a phlebotomist</p></div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#08B36A]"><FaIdBadge /></div>
                  <div><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Assigning For</p><p className="text-sm font-bold text-gray-700">Order {actionOrder?.bookingId}</p></div>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <button key={driver._id} onClick={() => setSelectedDriverId(driver._id)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedDriverId === driver._id ? 'border-[#08B36A] bg-green-50 ring-4 ring-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDriverId === driver._id ? 'bg-[#08B36A] text-white' : 'bg-gray-100 text-gray-400'}`}><FaUser size={18} /></div>
                        <div className="text-left"><p className={`font-bold text-sm ${selectedDriverId === driver._id ? 'text-[#08B36A]' : 'text-gray-700'}`}>{driver.name}</p><p className="text-xs text-gray-400 font-medium">{driver.phone}</p></div>
                      </div>
                      {selectedDriverId === driver._id && <div className="w-6 h-6 bg-[#08B36A] rounded-full flex items-center justify-center text-white"><FaCheck size={12} /></div>}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"><FaExclamationTriangle className="mx-auto text-gray-300 mb-2" size={24} /><p className="text-sm font-bold text-gray-400">No staff members found</p></div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsAssignOpen(false)} className="py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors">Go Back</button>
                <button onClick={confirmAssign} disabled={!selectedDriverId} className={`py-4 font-bold rounded-2xl shadow-lg transition-all ${selectedDriverId ? 'bg-[#08B36A] text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}