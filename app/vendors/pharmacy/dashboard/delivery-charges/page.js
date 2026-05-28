'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaPlus, FaTimes, FaTruck, FaChevronRight, FaSave,
  FaEdit, FaCheckCircle, FaInfoCircle, FaRupeeSign,
  FaRoute, FaPercentage, FaBolt, FaLayerGroup, FaMedkit, FaPills
} from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI'; 
import { toast } from 'react-hot-toast';

export default function ManagePharmacyDelivery() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chargeData, setChargeData] = useState(null);

  // Form state matching Documentation payload
  const [formData, setFormData] = useState({
    fixedPrice: '',
    fixedDistance: '',
    pricePerKM: '',
    fastDeliveryExtra: '',
    freeDeliveryThreshold: '',
    taxPercentage: '',
    status: 'Active'
  });

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await PharmacyVendorAPI.getMyDeliveryCharges();
      if (response.success) {
        setChargeData(response.data);
        setFormData({
          fixedPrice: response.data.fixedPrice || '',
          fixedDistance: response.data.fixedDistance || '',
          pricePerKM: response.data.pricePerKM || '',
          fastDeliveryExtra: response.data.fastDeliveryExtra || '',
          freeDeliveryThreshold: response.data.freeDeliveryThreshold || '',
          taxPercentage: response.data.taxPercentage || '',
          status: 'Active'
        });
      }
    } catch (error) {
      console.error("Error fetching pharmacy charges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await PharmacyVendorAPI.saveDeliveryCharges(formData);
      if (response.success) {
        toast.success("Pharmacy delivery rates updated!");
        setIsModalOpen(false);
        fetchCharges();
      }
    } catch (error) {
      toast.error("Failed to update logistics configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#fcfdfe] min-h-screen pb-20 font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="bg-white border-b border-slate-200/60 top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              <span className="hover:text-[#08B36A] cursor-pointer transition-colors">Pharmacy Dashboard</span>
              <FaChevronRight className="text-[8px]" />
              <span className="text-slate-800">Logistics Settings</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FaMedkit className="text-[#08B36A]" size={22} /> Medicine Delivery Rates
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[12px] font-medium text-slate-600 mr-2">
                <span className="w-2 h-2 rounded-full bg-[#08B36A] animate-pulse"></span>
                Pharmacy Live
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-6 py-3 bg-[#08B36A] hover:bg-[#069a5a] text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              <FaEdit className="group-hover:rotate-12 transition-transform" /> 
              {chargeData ? 'Edit Delivery Rates' : 'Set Initial Rates'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {loading && !chargeData ? (
          /* LOADING STATE */
          <div className="bg-white rounded-3xl border border-slate-200 p-32 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-500 font-bold tracking-tight">Syncing Logistics Engine...</p>
          </div>
        ) : chargeData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: MAIN VIEW */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* STATUS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><FaRupeeSign /></div>
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">3 Hours/Slots Delivery</p>
                    <h3 className="text-2xl font-black text-slate-900">₹{chargeData.fixedPrice}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4"><FaRoute /></div>
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">Base Radius</p>
                    <h3 className="text-2xl font-black text-slate-900">{chargeData.fixedDistance} <span className="text-sm font-medium">KM</span></h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow border-b-4 border-b-[#08B36A]">
                    <div className="w-10 h-10 bg-green-50 text-[#08B36A] rounded-xl flex items-center justify-center mb-4"><FaCheckCircle /></div>
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">System Status</p>
                    <h3 className="text-2xl font-black text-[#08B36A] tracking-tight uppercase">Active</h3>
                </div>
              </div>

              {/* DETAILED DATA */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400"><FaLayerGroup size={14}/></div>
                    <h2 className="font-black text-slate-800 tracking-tight uppercase text-sm">Logistics Policy Details</h2>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-slate-500 font-medium">Extra KM Rate</span>
                            <span className="text-lg font-bold text-slate-900">₹{chargeData.pricePerKM}/KM</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-slate-500 font-medium">1 Hours Fast Delivery</span>
                            <span className="text-lg font-bold text-slate-900">₹{chargeData.fastDeliveryExtra || '0'}</span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-slate-500 font-medium">Service Tax</span>
                            <span className="text-lg font-bold text-slate-900">{chargeData.taxPercentage}%</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-50 items-end">
                            <span className="text-[#08B36A] font-bold">Free Shipping Threshold</span>
                            <span className="text-lg font-bold text-[#08B36A]">₹{chargeData.freeDeliveryThreshold}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CALCULATION LOGIC BOX */}
              <div className="bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#08B36A]/10 rounded-full blur-3xl group-hover:bg-[#08B36A]/20 transition-all duration-700"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-[#08B36A]">
                        <FaInfoCircle />
                        <span className="text-xs font-black uppercase tracking-widest">Pricing Formula Engine</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-6">
                        Medicine delivery fees are calculated based on the pharmacy storefront location. 
                        Free delivery triggers automatically if the order value exceeds your set threshold.
                    </p>
                    <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-green-400 inline-block border border-white/5">
                        Total Fee = [Base Rate] + (Max(0, CustomerDistance - {chargeData.fixedDistance} KM) * ₹{chargeData.pricePerKM})
                    </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR PREVIEW */}
            <div className="lg:col-span-4">
               <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sticky top-28 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <FaTruck className="text-slate-300" /> Customer Preview
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Initial Delivery Cost</span>
                        <span className="text-3xl font-black text-slate-900">₹{chargeData.fixedPrice} <span className="text-sm font-normal text-slate-400">/ order</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Applied Tax</span>
                            <span className="text-xl font-bold text-slate-800">{chargeData.taxPercentage}%</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1">Fast Track</span>
                            <span className="text-xl font-bold text-slate-800">₹{chargeData.fastDeliveryExtra}</span>
                        </div>
                    </div>
                    
                    <div className="pt-6">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase">
                            <FaPercentage /> Free Shipping Rule
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            Orders above <span className="font-bold text-slate-900">₹{chargeData.freeDeliveryThreshold}</span> will get <span className="text-[#08B36A] font-bold">FREE DELIVERY</span> automatically.
                        </p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTruck size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">No Delivery Rates Found</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium leading-relaxed">Please set your pharmacy's delivery pricing to enable order fulfillment on the platform.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-4 bg-[#08B36A] hover:bg-[#069a5a] text-white font-black rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              <FaPlus /> Configure Now
            </button>
          </div>
        )}
      </div>

      {/* 4. CONFIGURATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
            
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight text-[#08B36A]">Set Pharmacy Logistics</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Enter your delivery pricing variables below.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto">
              <form id="deliveryChargeForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#08B36A] transition-colors">3 Hours/Slots Delivery Charges(₹)</label>
                    <div className="relative">
                        <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input name="fixedPrice" type="number" value={formData.fixedPrice} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-4 ring-green-50/50 transition-all font-bold text-slate-800" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-[#08B36A] transition-colors">Base Distance (KM)</label>
                    <div className="relative">
                        <FaRoute className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input name="fixedDistance" type="number" value={formData.fixedDistance} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-4 ring-green-50/50 transition-all font-bold text-slate-800" required />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate per Extra KM (₹)</label>
                    <input name="pricePerKM" type="number" value={formData.pricePerKM} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-4 ring-green-50/50 transition-all font-bold text-slate-800" required />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">1 Hours Fast Delivery Extra (₹)</label>
                    <div className="relative">
                        <FaBolt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input name="fastDeliveryExtra" type="number" value={formData.fastDeliveryExtra} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-4 ring-green-50/50 transition-all font-bold text-slate-800" />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Delivery Order Min (₹)</label>
                    <input name="freeDeliveryThreshold" type="number" value={formData.freeDeliveryThreshold} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-4 ring-green-50/50 transition-all font-bold text-slate-800" />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics Tax (%)</label>
                    <div className="relative">
                        <FaPercentage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input name="taxPercentage" type="number" value={formData.taxPercentage} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-[#08B36A] focus:bg-white focus:ring-4 ring-green-50/50 transition-all font-bold text-slate-800" />
                    </div>
                  </div>
              </form>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" form="deliveryChargeForm" disabled={loading} className="px-12 py-4 bg-[#08B36A] hover:bg-[#069a5a] text-white text-sm font-black rounded-2xl shadow-xl shadow-green-100 flex items-center gap-3 transition-all active:scale-95">
                {loading ? 'Saving...' : <><FaSave /> Update Settings</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}