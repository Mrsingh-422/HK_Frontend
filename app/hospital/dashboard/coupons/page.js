'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { 
  FaTicketAlt, 
  FaPlus, 
  FaPercent, 
  FaCalendarAlt, 
  FaRupeeSign, 
  FaSpinner, 
  FaTimes, 
  FaTag, 
  FaShoppingCart, 
  FaUser,
  FaSyncAlt,
  FaRocket,
  FaStopwatch,
  FaPowerOff,
  FaLayerGroup,
  FaEdit
} from "react-icons/fa"
import HospitalAPI from '@/app/services/HospitalAPI';

export default function HospitalCouponsPage() {
  const { loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    couponName: '',
    discountPercentage: '',
    maxDiscount: '',
    minOrderAmount: '',
    maxUsagePerUser: '1',
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

  const handleEditClick = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      couponName: coupon.couponName,
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount || '0',
      maxUsagePerUser: coupon.maxUsagePerUser || '1',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await HospitalAPI.toggleCouponStatus(id);
      if (res.success) {
        fetchCoupons();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Failed to toggle status");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ couponName: '', discountPercentage: '', maxDiscount: '', minOrderAmount: '', maxUsagePerUser: '1', startDate: '', expiryDate: '' });
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const payload = {
        couponName: formData.couponName,
        discountPercentage: Number(formData.discountPercentage),
        maxDiscount: Number(formData.maxDiscount),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxUsagePerUser: formData.maxUsagePerUser ? Number(formData.maxUsagePerUser) : 1,
        expiryDate: formData.expiryDate
      };

      if (formData.startDate) {
        payload.startDate = formData.startDate;
      }

      let res;
      if (editingId) {
        res = await HospitalAPI.updateCoupon(editingId, payload);
      } else {
        res = await HospitalAPI.generateCoupon(payload);
      }
      
      if (res?.success) {
        closeModal();
        fetchCoupons(); 
      } else {
        alert(res?.message || "Action failed.");
      }
    } catch (error) {
      console.error("Error saving coupon", error);
      alert("An error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusDisplay = (coupon) => {
    if (!coupon.isActive) return { label: 'PAUSED', color: 'bg-red-50 text-red-600 border-red-200', icon: <FaPowerOff /> };
    
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.expiryDate);

    if (now < start) return { label: 'UPCOMING', color: 'bg-orange-50 text-orange-600 border-orange-200', icon: <FaCalendarAlt /> };
    if (now > end) return { label: 'EXPIRED', color: 'bg-gray-100 text-gray-500 border-gray-300', icon: <FaStopwatch /> };
    
    return { label: 'LIVE', color: 'bg-green-50 text-green-600 border-green-200', icon: <FaPowerOff /> };
  };

  if (authLoading || isFetching) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <FaSyncAlt className="animate-spin text-[#08B36A] text-4xl" />
    </div>
  );

  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1e3a8a] flex items-center gap-3">
            <div className="p-3 bg-[#08B36A] text-white rounded-2xl shadow-lg shadow-green-100">
              <FaTicketAlt size={24}/>
            </div>
            Coupon Central
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-2">Manage and monitor hospital discount codes.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button onClick={fetchCoupons} className="p-4 bg-white text-gray-400 rounded-2xl border border-gray-200 hover:text-[#08B36A] hover:border-[#08B36A] transition-all active:scale-95 shadow-sm">
                <FaSyncAlt className={isFetching ? 'animate-spin' : ''} />
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none bg-[#08B36A] hover:bg-green-600 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-green-100 transition-all active:scale-95 uppercase tracking-tighter text-sm"
            >
                <FaPlus /> Generate Coupon
            </button>
        </div>
      </div>

      {/* DYNAMIC LIST AREA */}
      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {coupons.map((coupon) => {
            const status = getStatusDisplay(coupon);
            return (
              <div 
                key={coupon._id} 
                className={`flex bg-white rounded-[2rem] shadow-sm border-2 overflow-hidden hover:shadow-xl transition-all relative group ${!coupon.isActive ? 'opacity-60 grayscale-[0.4]' : 'border-white'}`}
              >
                {/* Left Side: Branding/Value (The Ticket Stub) */}
                <div className={`text-white w-24 sm:w-28 flex flex-col justify-center items-center border-r-2 border-dashed border-white/30 relative shadow-inner ${coupon.isActive ? 'bg-[#08B36A]' : 'bg-gray-400'}`}>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gray-50 rounded-full border border-gray-100"></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gray-50 rounded-full border border-gray-100"></div>
                  
                  <span className="text-3xl font-black">{coupon.discountPercentage}</span>
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-80">% OFF</span>
                </div>

                {/* Right Side: Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">{coupon.couponName}</h3>
                      <button onClick={() => handleEditClick(coupon)} className="text-gray-400 hover:text-[#08B36A] transition-colors">
                        <FaEdit size={18} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <FaRupeeSign className="text-gray-300"/> Min: <span className="text-gray-700 font-black">₹{coupon.minOrderAmount || 0}</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <FaRocket className="text-gray-300"/> Max Cap: <span className="text-[#08B36A] font-black">₹{coupon.maxDiscount}</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <FaUser className="text-gray-300"/> Limit: <span className="text-gray-700 font-black">{coupon.maxUsagePerUser}</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 w-full">
                          <FaStopwatch className="text-red-300"/> Expires: <span className="text-red-500 font-black uppercase">{formatDate(coupon.expiryDate)}</span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Action Section */}
                  <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => handleToggleStatus(coupon._id)}
                      className={`flex items-center gap-2 text-[9px] font-black px-4 py-2 rounded-xl border transition-all active:scale-95 ${status.color}`}
                    >
                      {status.icon} {status.label}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 p-24 flex flex-col items-center justify-center text-center shadow-sm max-w-4xl mx-auto">
          <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100">
            <FaTicketAlt className="text-5xl text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">No Promotional Coupons</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed font-medium">
            Your inventory is currently empty. Click the button above to generate your first discount code.
          </p>
        </div>
      )}

      {/* MODAL FORM SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[450px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <div className="flex justify-between items-center p-8 border-b border-gray-50 bg-[#08B36A] text-white">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                  {editingId ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Hospital Configuration</p>
              </div>
              <button onClick={closeModal} className="p-2 bg-black/10 rounded-full hover:bg-black/20 transition-all">
                <FaTimes size={18}/>
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-8 space-y-6">
              
              <div className="space-y-1">
                <label className="label-style">Campaign Code</label>
                <div className="relative">
                   <FaTag className="absolute top-5 left-4 text-gray-400 text-sm"/>
                   <input
                    name="couponName" type="text" value={formData.couponName} onChange={handleChange}
                    placeholder="E.G. SAVE10" required maxLength={15}
                    className="input-style pl-11 uppercase font-black tracking-widest"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-style">Discount (%)</label>
                  <div className="relative">
                    <FaPercent className="absolute top-5 left-4 text-[#08B36A] text-xs"/>
                    <input name="discountPercentage" type="number" value={formData.discountPercentage} onChange={handleChange} placeholder="0" required min="1" max="100" className="input-style pl-10" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label-style">Max Cap (₹)</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute top-5 left-4 text-[#08B36A] text-xs"/>
                    <input name="maxDiscount" type="number" value={formData.maxDiscount} onChange={handleChange} placeholder="0" required min="1" className="input-style pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-style">Min Order (₹)</label>
                  <div className="relative">
                    <FaShoppingCart className="absolute top-5 left-4 text-gray-400 text-sm"/>
                    <input name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} placeholder="0" min="0" className="input-style pl-11" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label-style">User Limit</label>
                  <div className="relative">
                    <FaLayerGroup className="absolute top-5 left-4 text-gray-400 text-sm"/>
                    <input name="maxUsagePerUser" type="number" value={formData.maxUsagePerUser} onChange={handleChange} placeholder="1" min="1" className="input-style pl-11" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="label-style">Start Date</label>
                      <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} className="input-style text-xs" />
                  </div>
                  <div className="space-y-1">
                      <label className="label-style">End Date</label>
                      <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} required min={formData.startDate || new Date().toISOString().split("T")[0]} className="input-style text-xs" />
                  </div>
              </div>

              <button 
                type="submit" disabled={isGenerating}
                className="w-full py-5 font-black rounded-3xl shadow-xl transition-all text-white flex justify-center items-center gap-3 active:scale-95 bg-[#08B36A] hover:bg-green-600 uppercase tracking-tighter text-sm"
              >
                {isGenerating ? <FaSpinner className="animate-spin"/> : (editingId ? 'Update Coupon' : 'Generate Coupon Code')}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .label-style {
          display: block;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 900;
          font-size: 0.6rem;
          color: #9ca3af;
          margin-bottom: 0.5rem;
          margin-left: 0.5rem;
        }
        .input-style {
          width: 100%;
          padding: 14px 18px;
          background-color: #f8fafc;
          border-radius: 1.25rem;
          border: 1px solid #f1f5f9;
          font-weight: 800;
          color: #1e293b;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-style:focus {
          background-color: white;
          border-color: #08B36A;
          box-shadow: 0 10px 25px -5px rgba(8, 179, 106, 0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}