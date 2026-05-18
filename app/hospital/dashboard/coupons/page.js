'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaTicketAlt, FaPlus, FaPercentage, FaCalendarAlt, 
  FaMoneyBillWave, FaSpinner, FaTimes, FaTag, FaShoppingCart, FaUser
} from "react-icons/fa"
import HospitalAPI from '@/app/services/HospitalAPI';

export default function HospitalCouponsPage() {
  const { loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State Updated with ALL Backend Fields
  const [formData, setFormData] = useState({
    couponName: '',
    discountPercentage: '',
    maxDiscount: '',
    minOrderAmount: '', // New
    maxUsagePerUser: '1', // New (Default 1)
    startDate: '',
    expiryDate: ''
  });

  const fetchCoupons = async () => {
    setIsFetching(true);
    try {
      const response = await HospitalAPI.getCouponsList();
      if (response?.success) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Error fetching coupons", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const val = e.target.name === 'couponName' ? e.target.value.toUpperCase() : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Backend Required Data parsing
      const payload = {
        couponName: formData.couponName,
        discountPercentage: Number(formData.discountPercentage),
        maxDiscount: Number(formData.maxDiscount),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxUsagePerUser: formData.maxUsagePerUser ? Number(formData.maxUsagePerUser) : 1,
        expiryDate: formData.expiryDate
      };

      // Optional startDate
      if (formData.startDate) {
        payload.startDate = formData.startDate;
      }

      const res = await HospitalAPI.generateCoupon(payload);
      
      // Safe check applied
      if (res?.success) {
        setIsModalOpen(false);
        setFormData({ couponName: '', discountPercentage: '', maxDiscount: '', minOrderAmount: '', maxUsagePerUser: '1', startDate: '', expiryDate: '' });
        fetchCoupons(); 
      } else {
        alert(res?.message || "Failed to generate coupon.");
      }
    } catch (error) {
      console.error("Error generating coupon", error);
      alert("An error occurred while generating.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; }
  }, [isModalOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { label: 'Inactive', color: 'bg-gray-50 text-gray-500 border-gray-200', bar: 'bg-gray-400' };
    
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.expiryDate);

    if (now < start) return { label: 'Upcoming', color: 'bg-orange-50 text-orange-600 border-orange-200', bar: 'bg-orange-400' };
    if (now > end) return { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200', bar: 'bg-red-500' };
    
    return { label: 'Active', color: 'bg-green-50 text-green-700 border-green-200', bar: 'bg-[#08B36A]' };
  };

  if (authLoading || isFetching) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A]"></div>
    </div>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- HEADER --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-[#08B36A] via-emerald-500 to-teal-700 relative flex items-center px-8">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex w-full justify-between items-center text-white pt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaTicketAlt size={28} /></div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Coupon Management</h1>
                  <p className="text-sm text-green-50 font-medium">Create and track promotional codes</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="hidden sm:flex bg-white text-[#08B36A] px-6 py-2.5 rounded-2xl font-bold hover:bg-gray-50 hover:shadow-lg transition-all items-center gap-2">
                <FaPlus /> Generate Coupon
              </button>
            </div>
          </div>
        </div>

        <div className="sm:hidden flex justify-end px-2">
           <button onClick={() => setIsModalOpen(true)} className="bg-[#08B36A] text-white px-6 py-3 rounded-2xl font-bold shadow-md w-full flex items-center justify-center gap-2">
              <FaPlus /> Generate Coupon
            </button>
        </div>

        {/* --- COUPONS GRID --- */}
        {coupons.length === 0 ? (
           <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-[#08B36A] mb-4 opacity-50"><FaTicketAlt size={40} /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Coupons Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">You haven't generated any discount coupons yet. Click the button above to create your first coupon.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <div key={coupon._id} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                  <div className={`h-1.5 w-full ${status.bar}`}></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${status.color}`}>
                          {status.label}
                        </span>
                        <h3 className="text-2xl font-black text-gray-800 mt-3 tracking-tight flex items-center gap-2">
                          <FaTag className="text-gray-300 text-lg" /> {coupon.couponName}
                        </h3>
                      </div>
                      <div className="bg-green-50 text-[#08B36A] font-black text-2xl px-4 py-2.5 rounded-2xl border border-green-100 text-center shadow-sm">
                        {coupon.discountPercentage}% <br/><span className="text-[10px] uppercase text-green-600/70 tracking-widest leading-none">OFF</span>
                      </div>
                    </div>
                    
                    <div className="relative flex items-center justify-center my-4">
                       <div className="absolute w-5 h-5 bg-gray-50 rounded-full -left-8 border-r border-gray-200"></div>
                       <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                       <div className="absolute w-5 h-5 bg-gray-50 rounded-full -right-8 border-l border-gray-200"></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end space-y-3">
                      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-600 bg-gray-50/50 p-2 rounded-xl border border-gray-50">
                        <span className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> {formatDate(coupon.startDate)}</span>
                        <span className="text-gray-300">-</span>
                        <span>{formatDate(coupon.expiryDate)}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {coupon.maxDiscount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            Max <FaMoneyBillWave className="text-[#08B36A]" /> ₹{coupon.maxDiscount}
                          </div>
                        )}
                        {coupon.minOrderAmount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            Min <FaShoppingCart className="text-gray-400" /> ₹{coupon.minOrderAmount}
                          </div>
                        )}
                        {coupon.maxUsagePerUser && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            Usage Limit <FaUser className="text-gray-400" /> {coupon.maxUsagePerUser}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- GENERATE COUPON MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <FaTicketAlt className="text-[#08B36A]"/> Create New Coupon
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors border border-gray-100">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coupon Code <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaTag className="text-gray-400" /></div>
                  <input type="text" name="couponName" required maxLength={15} value={formData.couponName} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-gray-800 uppercase tracking-widest" placeholder="e.g. FESTIVAL20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discount (%) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaPercentage className="text-gray-400" /></div>
                    <input type="number" name="discountPercentage" required min="1" max="100" value={formData.discountPercentage} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="10" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Discount (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaMoneyBillWave className="text-gray-400" /></div>
                    <input type="number" name="maxDiscount" required min="1" value={formData.maxDiscount} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Order (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaShoppingCart className="text-gray-400" /></div>
                    <input type="number" name="minOrderAmount" min="0" value={formData.minOrderAmount} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="0 (No limit)" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usage Per User</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaUser className="text-gray-400" /></div>
                    <input type="number" name="maxUsagePerUser" min="1" value={formData.maxUsagePerUser} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaCalendarAlt className="text-gray-400" /></div>
                    <input type="date" name="startDate" min={new Date().toISOString().split("T")[0]} value={formData.startDate} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaCalendarAlt className="text-gray-400" /></div>
                    <input type="date" name="expiryDate" required min={formData.startDate || new Date().toISOString().split("T")[0]} value={formData.expiryDate} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800 text-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100">
                <button type="submit" disabled={isGenerating} className="w-full py-4 rounded-2xl font-bold text-white bg-[#08B36A] hover:bg-emerald-600 transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
                  {isGenerating ? <><FaSpinner className="animate-spin" /> Creating...</> : 'Create Coupon Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}