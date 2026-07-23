'use client'
import React from 'react'
import { 
  FaTimes, FaFileMedical, FaUpload, FaUser, FaPhoneAlt, FaCalendarAlt, 
  FaClock, FaMapMarkerAlt, FaReceipt, FaMoneyCheckAlt, FaLock, 
  FaUserMd, FaExclamationCircle, FaFolderOpen, FaRegClock
} from 'react-icons/fa'

export default function PatientInfoModal({ order, onClose, onEnterLims }) {
  if (!order) return null;

  // Formatting helpers
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Testing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Cancelled':
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-slate-50 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="p-5 border-b border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-[#08B36A]">
              <FaFileMedical size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Booking Specifications</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Booking ID: <span className="font-mono font-bold text-[#1e3a8a]">{order.bookingId}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Core Scrolling Details Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {order.cancelReason && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 flex items-start gap-3">
              <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Cancellation Logged</h4>
                <p className="text-xs mt-1 leading-relaxed">{order.cancelReason}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Demographic Details & Address */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Demographics section */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <FaUser /> Registered Patients Demographics
                </h3>
                <div className="space-y-3">
                  {order.patients?.map((pat, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-gray-600">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Patient Name</p>
                        <p className="font-bold text-gray-800 mt-0.5">{pat.name || pat.patientName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Age Profile</p>
                        <p className="font-bold text-gray-800 mt-0.5">{pat.age || pat.patientAge || 'Adult'} Yrs</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Biological Sex</p>
                        <p className="font-bold text-gray-800 mt-0.5">{pat.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Relationship Context</p>
                        <p className="font-bold text-gray-800 mt-0.5">{pat.relation || 'Self'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Logistics Section */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <FaCalendarAlt /> Logistic & Tracking Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200/50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Collection Type</p>
                    <p className="font-bold text-gray-800 mt-0.5">{order.collectionType || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200/50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Appointment Date</p>
                    <p className="font-bold text-[#1e3a8a] mt-0.5">{formatDate(order.appointmentDate)}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200/50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Appointment Time Window</p>
                    <p className="font-bold text-[#1e3a8a] mt-0.5 flex items-center gap-1">
                      <FaClock className="text-gray-400" /> {order.appointmentTime || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200/50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Authorized Tracking OTP</p>
                    <p className="font-mono font-black text-emerald-600 text-sm mt-0.5 tracking-widest flex items-center gap-1.5">
                      <FaLock className="text-emerald-500 text-xs" /> {order.tracking?.otp || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200/50">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Account Primary Contact</p>
                    <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
                      <FaPhoneAlt className="text-gray-400 text-xs" /> {order.userId?.name} ({order.userId?.phone})
                    </p>
                  </div>
                </div>
              </div>

              {/* Address detail panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <FaMapMarkerAlt /> Registered Collection Address
                </h3>
                {order.address ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-gray-600">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Recipient</p>
                      <p className="font-bold text-gray-800 mt-0.5">{order.address.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Contact Phone</p>
                      <p className="font-bold text-gray-800 mt-0.5">{order.address.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Address Type</p>
                      <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-bold text-[10px] mt-0.5">
                        {order.address.addressType || 'Home'}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-3 bg-slate-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Structured Address</p>
                      <p className="font-semibold text-gray-700 mt-1 leading-relaxed">
                        House No. {order.address.houseNo || '-'}, Sector {order.address.sector || '-'}, {order.address.landmark && `Landmark: ${order.address.landmark},`} {order.address.city || '-'}, {order.address.state || '-'} - {order.address.pincode || '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No address details mapped (In-house Collection or Direct Lab Booking).</p>
                )}
              </div>

              {/* Phlebotomist assignment details */}
              {order.phlebotomistId && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                    <FaUserMd /> Assigned Logistic Professional
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Staff Name</p>
                      <p className="font-bold text-gray-800 mt-0.5">{order.phlebotomistId.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Contact Number</p>
                      <p className="font-bold text-[#08B36A] mt-0.5">{order.phlebotomistId.phone}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Side: Services & Billing Summary */}
            <div className="space-y-6">
              
              {/* Booked services panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <FaFolderOpen /> Diagnostic Panel Items
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {order.items?.tests?.map((test) => (
                    <div key={test._id} className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/50 flex justify-between items-center text-xs font-medium">
                      <div>
                        <p className="font-bold text-gray-800">{test.name}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">Standalone Test</p>
                      </div>
                      <span className="font-bold text-[#1e3a8a]">₹{test.price}</span>
                    </div>
                  ))}

                  {order.items?.packages?.map((pkg) => (
                    <div key={pkg._id} className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-100/50 text-xs font-medium space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-black text-gray-800">{pkg.name}</p>
                          <p className="text-[9px] text-[#08B36A] font-bold">Populated Master Package</p>
                        </div>
                        <span className="font-bold text-emerald-700">₹{pkg.price}</span>
                      </div>
                      
                      {/* Populate child sub-tests */}
                      {pkg.packageId?.tests?.length > 0 && (
                        <div className="pl-3 border-l-2 border-emerald-200 space-y-1">
                          {pkg.packageId.tests.map((sub, sIdx) => (
                            <p key={sIdx} className="text-[10px] text-gray-500 font-bold">• {sub.testName}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial calculations panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <FaReceipt /> Financial Ledger Summary
                </h3>
                {order.billSummary ? (
                  <div className="space-y-2 text-xs font-medium text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Items Base Price</span>
                      <span className="text-gray-800 font-bold">₹{order.billSummary.itemTotal}</span>
                    </div>
                    {order.billSummary.itemDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Corporate Discount</span>
                        <span>- ₹{order.billSummary.itemDiscount}</span>
                      </div>
                    )}
                    {order.billSummary.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coupon Discount Applied</span>
                        <span>- ₹{order.billSummary.couponDiscount}</span>
                      </div>
                    )}
                    {order.billSummary.homeVisitCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Home Phlebotomy Surcharge</span>
                        <span>₹{order.billSummary.homeVisitCharge}</span>
                      </div>
                    )}
                    {order.billSummary.rapidDeliveryCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Express Turnaround Surcharge</span>
                        <span>₹{order.billSummary.rapidDeliveryCharge}</span>
                      </div>
                    )}
                    {order.billSummary.distanceCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Logistics Outbound Charge</span>
                        <span>₹{order.billSummary.distanceCharge}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-black text-gray-800">
                      <span>Total Amount Settled</span>
                      <span className="text-lg text-[#1e3a8a]">₹{order.billSummary.totalAmount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Bill summary metadata is not defined.</p>
                )}
              </div>

              {/* Transactions details panel */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <FaMoneyCheckAlt /> Transaction & Payment Audit
                </h3>
                <div className="space-y-3 text-xs font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status</span>
                    <span className={`font-bold uppercase ${order.paymentStatus === 'Done' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  {order.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Instrument</span>
                      <span className="text-gray-800 font-bold">{order.paymentMethod}</span>
                    </div>
                  )}

                  {order.paymentDetails && (
                    <div className="pt-2.5 border-t border-gray-100 space-y-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-gray-200/50">
                      {order.paymentDetails.razorpayPaymentId && (
                        <div>
                          <p className="text-gray-400 font-bold uppercase">Payment Gateway Reference ID</p>
                          <p className="font-mono text-gray-700 mt-0.5">{order.paymentDetails.razorpayPaymentId}</p>
                        </div>
                      )}
                      {order.paymentDetails.razorpayOrderId && (
                        <div>
                          <p className="text-gray-400 font-bold uppercase">Payment Gateway Order ID</p>
                          <p className="font-mono text-gray-700 mt-0.5">{order.paymentDetails.razorpayOrderId}</p>
                        </div>
                      )}
                      {order.paymentDetails.method && (
                        <div className="flex justify-between font-bold text-gray-700">
                          <span>Gateway Method: {order.paymentDetails.method}</span>
                          {order.paymentDetails.bank && <span>Bank: {order.paymentDetails.bank}</span>}
                          {order.paymentDetails.wallet && <span>Wallet: {order.paymentDetails.wallet}</span>}
                        </div>
                      )}
                      {order.paymentDetails.paidAt && (
                        <div className="pt-1 flex items-center gap-1.5 text-gray-400">
                          <FaRegClock /> Paid At: {formatDate(order.paymentDetails.paidAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Panel */}
        <div className="p-5 border-t border-gray-200 bg-white flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-xs">
            Close Panel
          </button>
          {onEnterLims && (order.status === 'Confirmed' || order.status === 'Testing') && (
            <button 
              onClick={() => { onClose(); onEnterLims(order); }} 
              className="px-5 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center gap-2 text-xs"
            >
              <FaUpload /> Enter Diagnostics Results
            </button>
          )}
        </div>

      </div>
    </div>
  )
}