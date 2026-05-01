'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaTicketAlt, 
  FaTrashAlt, 
  FaPercent, 
  FaRupeeSign, 
  FaTag,
  FaEdit,
  FaTimes,
  FaSyncAlt,
  FaLayerGroup,
  FaStopwatch,
  FaPowerOff,
  FaPlus,
  FaUserNurse,
  FaStethoscope,
  FaBriefcaseMedical,
  FaHeartbeat
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import NurseVendorAPI from '@/app/services/NurseVendorAPI';

export default function NursePromotionsPage() {
  
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingId, setEditingId] = useState(null);

  // Form state matching Documentation params exactly
  const [formData, setFormData] = useState({
    couponName: '',
    discountPercentage: '',
    maxDiscount: '',
    minOrderAmount: '',
    maxUsagePerUser: 1,
    startDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await NurseVendorAPI.listCoupons();
      if (res.success) {
        setCoupons(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load nurse service coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      couponName: '',
      discountPercentage: '',
      maxDiscount: '',
      minOrderAmount: '',
      maxUsagePerUser: 1,
      startDate: '',
      expiryDate: ''
    });
    setEditingId(null);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations based on Documentation
    if (Number(formData.discountPercentage) < 1 || Number(formData.discountPercentage) > 100) {
        return toast.error("Discount must be between 1% and 100%");
    }

    const today = new Date().setHours(0,0,0,0);
    const selectedExpiry = new Date(formData.expiryDate).setHours(0,0,0,0);
    if (selectedExpiry < today) {
        return toast.error("Expiry date must be in the future");
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        discountPercentage: Number(formData.discountPercentage),
        maxDiscount: Number(formData.maxDiscount),
        minOrderAmount: Number(formData.minOrderAmount),
        maxUsagePerUser: Number(formData.maxUsagePerUser)
      };

      if (editingId) {
        await NurseVendorAPI.updateCoupon(editingId, payload);
        toast.success('Nurse Service Coupon Updated!');
      } else {
        await NurseVendorAPI.addCoupon(payload);
        toast.success('New Nurse Coupon Created!');
      }
      closeModal();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      couponName: coupon.couponName,
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
      maxUsagePerUser: coupon.maxUsagePerUser || 1,
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this nurse service coupon?")) {
      try {
        await NurseVendorAPI.deleteCoupon(id);
        toast.success("Coupon removed from nurse dashboard");
        fetchCoupons();
      } catch (error) {
        toast.error("Delete operation failed");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await NurseVendorAPI.toggleCoupon(id);
      toast.success(res.message);
      fetchCoupons();
    } catch (error) {
      toast.error("Status toggle failed");
    }
  };

  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 p-6">
        <div>
          <h1 className="text-3xl font-black text-[#1e3a8a] flex items-center gap-3">
            <div className="p-3 bg-[#3b82f6] text-white rounded-2xl shadow-lg shadow-blue-100">
              <FaUserNurse size={24}/>
            </div>
            Nurse Care Central
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-2">Manage home-care discounts and nursing promotional codes.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={fetchCoupons} className="p-4 bg-white text-gray-400 rounded-2xl border border-gray-200 hover:text-[#3b82f6] hover:border-[#3b82f6] transition-all active:scale-95 shadow-sm">
                <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
                onClick={openAddModal}
                className="bg-[#3b82f6] hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-tighter text-sm"
            >
                <FaPlus /> Create Nurse Coupon
            </button>
        </div>
      </div>

      {/* DYNAMIC LIST AREA */}
      <div className="px-6">
      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {coupons.map((coupon) => (
            <div 
              key={coupon._id} 
              className={`flex bg-white rounded-[2rem] shadow-sm border-2 overflow-hidden hover:shadow-xl transition-all relative group ${!coupon.isActive ? 'opacity-60 grayscale-[0.4]' : 'border-white'}`}
            >
              
              {/* Left Side: Branding/Value */}
              <div className={`text-white w-24 sm:w-28 flex flex-col justify-center items-center border-r-2 border-dashed border-white/30 relative shadow-inner ${coupon.isAdminCreated ? 'bg-indigo-600' : (coupon.isActive ? 'bg-[#3b82f6]' : 'bg-gray-400')}`}>
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
                    {coupon.isAdminCreated && (
                      <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-md border border-indigo-200">GLOBAL OFFER</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <FaRupeeSign className="text-gray-300"/> Min Order: <span className="text-gray-700 font-black">₹{coupon.minOrderAmount}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <FaStethoscope className="text-gray-300"/> Max Save: <span className="text-[#3b82f6] font-black">₹{coupon.maxDiscount}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 w-full">
                        <FaStopwatch className="text-red-300"/> Valid Until: <span className="text-red-500 font-black uppercase">{new Date(coupon.expiryDate).toLocaleDateString('en-GB')}</span>
                     </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    {!coupon.isAdminCreated ? (
                      <>
                        <button onClick={() => handleEditClick(coupon)} className="p-2 text-gray-400 hover:text-blue-600 transition-all" title="Edit">
                          <FaEdit size={16} />
                        </button>
                        <button onClick={() => handleDelete(coupon._id)} className="p-2 text-gray-400 hover:text-red-500 transition-all" title="Delete">
                          <FaTrashAlt size={15} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Admin Controlled</span>
                    )}
                  </div>

                  <button 
                    onClick={() => handleToggleStatus(coupon._id)}
                    disabled={coupon.isAdminCreated}
                    className={`flex items-center gap-2 text-[9px] font-black px-4 py-2 rounded-xl border transition-all active:scale-95 ${coupon.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'} ${coupon.isAdminCreated ? 'cursor-not-allowed' : ''}`}
                  >
                    {coupon.isActive ? <><FaPowerOff size={10}/> ACTIVE</> : <><FaPowerOff size={10}/> DISABLED</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 p-24 flex flex-col items-center justify-center text-center shadow-sm max-w-4xl mx-auto">
          <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100">
            <FaHeartbeat className="text-5xl text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">No Nurse Promo Codes</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed font-medium">
            Attract more patients by creating specialized discount codes for your nursing services!
          </p>
        </div>
      )}
      </div>

      {/* MODAL FORM SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[450px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            
            <div className="flex justify-between items-center p-8 border-b border-gray-50 bg-[#3b82f6] text-white">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                   {editingId ? 'Update Coupon' : 'New Nurse Coupon'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Promotion Configuration</p>
              </div>
              <button onClick={closeModal} className="p-2 bg-black/10 rounded-full hover:bg-black/20 transition-all">
                <FaTimes size={18}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              <div className="space-y-1">
                <label className="label-style">Promo Code Name</label>
                <div className="relative">
                      <FaTag className="absolute right-5 top-5 text-gray-400 text-sm ml-4"/>
                   <input
                    name="couponName" type="text" value={formData.couponName} onChange={handleChange}
                    placeholder="E.G. NURSECARE20" required
                    className="input-style pl-11 uppercase font-black tracking-widest"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-style">Discount %</label>
                  <div className="relative">
                    <FaPercent className="absolute right-5 top-5 text-[#3b82f6] text-xs ml-4"/>
                    <input name="discountPercentage" type="number" value={formData.discountPercentage} onChange={handleChange} placeholder="1-100" required className="input-style pl-10" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="label-style">Max Cap (₹)</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute right-5 top-5 text-[#3b82f6] text-xs ml-4"/>
                    <input name="maxDiscount" type="number" value={formData.maxDiscount} onChange={handleChange} placeholder="0" required className="input-style pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-style">Min Order (₹)</label>
                  <input name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} placeholder="₹" required className="input-style" />
                </div>
                <div className="space-y-1">
                  <label className="label-style">Usage Per User</label>
                  <div className="relative">
                    <FaLayerGroup className="absolute right-5 top-5 text-gray-400 text-sm ml-4"/>
                    <input name="maxUsagePerUser" type="number" value={formData.maxUsagePerUser} onChange={handleChange} placeholder="Limit" required className="input-style pl-11" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="label-style">Launch Date</label>
                      <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="input-style text-xs" />
                  </div>
                  <div className="space-y-1">
                      <label className="label-style">Expiry Date</label>
                      <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} required className="input-style text-xs" />
                  </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-5 font-black rounded-3xl shadow-xl transition-all text-white flex justify-center items-center gap-3 active:scale-95 bg-[#3b82f6] hover:bg-blue-700 uppercase tracking-tighter text-sm"
              >
                {loading ? <FaSyncAlt className="animate-spin"/> : (editingId ? 'Confirm Update' : 'Create Nurse Coupon')}
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
          border-color: #3b82f6;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}