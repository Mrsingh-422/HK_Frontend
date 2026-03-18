'use client'
import React, { useState } from 'react'
import { 
  FaTicketAlt, 
  FaTrashAlt, 
  FaPercent, 
  FaRupeeSign, 
  FaCalendarAlt,
  FaTag,
  FaEdit,
  FaTimes
} from 'react-icons/fa'

export default function PromotionsPage() {
  
  // State for Form Inputs
  const[couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState('');
  const[minAmount, setMinAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // State for Editing
  const [editingId, setEditingId] = useState(null);

  // Dummy Data for Generated Coupons
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'HEALTH20', discount: 20, minAmount: 1500, expiryDate: '2026-04-15' },
    { id: 2, code: 'NEWUSER10', discount: 10, minAmount: 500, expiryDate: '2026-05-01' },
    { id: 3, code: 'HKLAB50', discount: 50, minAmount: 3000, expiryDate: '2026-03-30' },
  ]);

  // Handle Generate / Update Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if(!couponCode || !discount || !minAmount || !expiryDate) return;

    if (editingId) {
      // Update Existing Coupon
      setCoupons(coupons.map(coupon => 
        coupon.id === editingId ? {
          ...coupon,
          code: couponCode.toUpperCase(),
          discount: Number(discount),
          minAmount: Number(minAmount),
          expiryDate: expiryDate
        } : coupon
      ));
      alert('Coupon Updated Successfully!');
    } else {
      // Add New Coupon
      const newCoupon = {
        id: Date.now(),
        code: couponCode.toUpperCase(),
        discount: Number(discount),
        minAmount: Number(minAmount),
        expiryDate: expiryDate
      };
      setCoupons([newCoupon, ...coupons]);
      alert('New Coupon Generated!');
    }
    
    // Clear Form & Reset Edit State
    resetForm();
  };

  // Handle Edit Click (Populates Form)
  const handleEditClick = (coupon) => {
    setCouponCode(coupon.code);
    setDiscount(coupon.discount);
    setMinAmount(coupon.minAmount);
    setExpiryDate(coupon.expiryDate);
    setEditingId(coupon.id);
  };

  // Reset Form Handler
  const resetForm = () => {
    setCouponCode('');
    setDiscount('');
    setMinAmount('');
    setExpiryDate('');
    setEditingId(null);
  };

  // Handle Delete Coupon
  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this coupon?");
    if(isConfirmed){
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  return (
    <div className="w-full">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
          <FaTicketAlt className="text-[#08B36A]"/> Promotions & Coupons
        </h1>
        <p className="text-gray-500 text-sm mt-1">Generate or edit discount codes to attract more patients to your lab.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ========================================= */}
        {/* LEFT COLUMN: GENERATE / EDIT FORM         */}
        {/* ========================================= */}
        <div className="w-full lg:w-1/3">
          <div className={`bg-white p-6 rounded-2xl border shadow-sm sticky top-6 transition-all duration-300 ${editingId ? 'border-blue-300 shadow-blue-100' : 'border-gray-100'}`}>
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {editingId ? <FaEdit className="text-blue-500"/> : <FaTag className="text-[#08B36A]"/>} 
                {editingId ? 'Edit Coupon' : 'Generate Coupon'}
              </h2>
              {/* Show Cancel Edit Button if in edit mode */}
              {editingId && (
                <button onClick={resetForm} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <FaTimes /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Coupon Code <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. GET20" 
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-800 font-bold uppercase transition-all"
                  required 
                />
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Discount Percentage <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPercent className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 15" 
                    min="1" max="100"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-800 font-bold transition-all"
                    required 
                  />
                </div>
              </div>

              {/* Minimum Order Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Min. Order Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaRupeeSign className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    type="number" 
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="e.g. 1000" 
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-800 font-bold transition-all"
                    required 
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] text-gray-800 font-bold transition-all"
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`w-full mt-2 py-3 font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 ${
                  editingId 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
                    : 'bg-[#08B36A] hover:bg-green-600 text-white shadow-green-200'
                }`}
              >
                {editingId ? 'UPDATE COUPON' : 'GENERATE COUPON'}
              </button>
            </form>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: COUPONS LIST                */}
        {/* ========================================= */}
        <div className="w-full lg:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1e3a8a]">Active Coupons ({coupons.length})</h2>
          </div>

          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.id} 
                  className={`flex bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all group ${
                    editingId === coupon.id ? 'border-blue-400 ring-2 ring-blue-100 scale-[1.02]' : 'border-gray-200'
                  }`}
                >
                  
                  {/* Left Side: Discount Box (Ticket cut style) */}
                  <div className={`text-white w-28 flex flex-col justify-center items-center border-r-2 border-dashed border-white relative transition-colors ${
                    editingId === coupon.id ? 'bg-blue-500' : 'bg-[#08B36A]'
                  }`}>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                    
                    <span className="text-3xl font-black">{coupon.discount}%</span>
                    <span className="text-xs font-bold tracking-widest opacity-90 uppercase mt-0.5">OFF</span>
                  </div>

                  {/* Right Side: Details & Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white relative">
                    <div>
                      <h3 className="text-lg font-black text-gray-800 tracking-wide">{coupon.code}</h3>
                      <div className="text-xs text-gray-500 font-medium mt-1.5 space-y-1">
                        <p className="flex items-center gap-1.5"><FaRupeeSign className="text-gray-400"/> Min. Order: <span className="text-gray-700 font-bold">₹{coupon.minAmount}</span></p>
                        <p className="flex items-center gap-1.5"><FaCalendarAlt className="text-red-400"/> Expires: <span className="text-red-500 font-bold">{coupon.expiryDate}</span></p>
                      </div>
                    </div>
                    
                    {/* Action Buttons (Edit & Delete) */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* Edit Button */}
                      <button 
                        onClick={() => handleEditClick(coupon)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Coupon"
                      >
                        <FaEdit size={16} />
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Coupon"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>

                    {/* "Editing..." Badge */}
                    {editingId === coupon.id && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full animate-pulse">
                        EDITING
                      </span>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FaTicketAlt className="text-4xl text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Coupons</h3>
              <p className="text-sm text-gray-500 max-w-sm">You haven't generated any coupons yet. Create one from the left panel to boost your sales!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}