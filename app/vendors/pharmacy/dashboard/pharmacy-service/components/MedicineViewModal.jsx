'use client'
import React, { useState } from 'react'
import { FaTimes, FaCapsules, FaIndustry, FaFlask, FaRupeeSign, FaBox, FaCalendarCheck, FaBarcode } from 'react-icons/fa'

// Safe Image component with automatic broken link fallback
function MedicineImage({ src }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="h-full w-full bg-white/20 flex items-center justify-center">
        <FaCapsules className="text-emerald-100 text-lg" />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      onError={() => setError(true)} 
      className="w-full h-full object-cover animate-fade-in" 
      alt="med" 
    />
  );
}

export default function MedicineViewModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const resolveImageUrl = (imageUrlArray) => {
    const primaryImage = imageUrlArray?.[0];
    if (!primaryImage) return null;
    if (primaryImage.startsWith('http://') || primaryImage.startsWith('https://')) {
      return primaryImage;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanImage = primaryImage.startsWith('/') ? primaryImage.slice(1) : primaryImage;
    return `${cleanBase}/${cleanImage}`;
  };

  const medicineImage = resolveImageUrl(data.medicineId?.image_url);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 bg-emerald-600 text-white flex justify-between items-start">
            <div className="flex gap-4 items-center">
                <div className="h-14 w-14 bg-white/20 rounded-2xl overflow-hidden flex items-center justify-center border border-white/20 shrink-0">
                  <MedicineImage src={medicineImage} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">Medicine Details</span>
                        <span className={`px-3 py-1 ${data.is_available ? 'bg-white text-emerald-600' : 'bg-rose-500 text-white'} text-[10px] font-black uppercase rounded-lg tracking-widest`}>
                            {data.is_available ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight uppercase leading-none">{data.medicineId?.name}</h2>
                    <p className="text-emerald-100 font-bold mt-2 flex items-center gap-2 uppercase text-xs tracking-wider">
                        <FaIndustry /> {data.medicineId?.manufacturers}
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                <FaTimes size={24}/>
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
            
            {/* Price Metric Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider flex items-center gap-1.5"><FaRupeeSign /> Catalog Limit</p>
                    <p className="text-lg font-black text-slate-800">
                      ₹{data.medicineId?.masterMrp || data.medicineId?.mrp || 'N/A'}
                    </p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-wider flex items-center gap-1.5"><FaRupeeSign /> Printed MRP</p>
                    <p className="text-lg font-black text-blue-800">
                      ₹{data.mrp ?? data.medicineId?.mrp ?? 'N/A'}
                    </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-wider flex items-center gap-1.5"><FaRupeeSign /> Store Price</p>
                    <p className="text-lg font-black text-emerald-700">₹{data.vendor_price}</p>
                </div>
            </div>

            {/* Salt Composition */}
            <section className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <h3 className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-700 mb-3 tracking-widest">
                    <FaFlask /> Salt Composition
                </h3>
                <p className="text-sm text-blue-900 font-bold leading-relaxed">
                    {data.medicineId?.salt_composition || 'Not Specified'}
                </p>
            </section>

            {/* Description & Safety Advise */}
            {data.medicineId?.description && (
              <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                  <h3 className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Description
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed italic">
                      "{data.medicineId.description}"
                  </p>
              </section>
            )}

            {/* Inventory Details Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Number</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border">
                        <FaBarcode className="text-emerald-500 shrink-0" />
                        <span className="font-black text-slate-700 uppercase truncate">{data.batch_number || 'N/A'}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border">
                        <FaBox className="text-emerald-500 shrink-0" />
                        <span className="font-black text-slate-700">{data.stock_quantity} Units</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HSN Number</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border">
                        <span className="font-black text-slate-700">{data.hsn_number || 'N/A'}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mfg Date</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border">
                        <FaCalendarCheck className="text-emerald-500 shrink-0" />
                        <span className="font-black text-slate-700">
                             {data.manufacturing_date ? new Date(data.manufacturing_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Set'}
                        </span>
                    </div>
                </div>
                <div className="space-y-1 col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</p>
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border">
                        <FaCalendarCheck className="text-emerald-500 shrink-0" />
                        <span className="font-black text-slate-700">
                             {data.expiry_date ? new Date(data.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Set'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-slate-100 flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                <span>Added: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</span>
                <span>Last Updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t flex justify-end">
             <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase rounded-2xl tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
                Close View
             </button>
        </div>
      </div>
    </div>
  )
}