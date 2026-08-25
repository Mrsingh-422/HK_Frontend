'use client'

import React, { useState, useMemo } from 'react'
import { FaTimes, FaCapsules, FaIndustry, FaFlask, FaRupeeSign, FaBox, FaCalendarCheck, FaBarcode, FaCalculator } from 'react-icons/fa'

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

const HSN_TAX_MAP = {
  "30049011": 12, 
  "21069099": 18, 
  "0000": 0,       
  "": 0            
};

export default function MedicineViewModal({ isOpen, onClose, data }) {
  const [invoiceQty, setInvoiceQty] = useState(10);
  const deliveryCharge = 40; 

  const billSummary = useMemo(() => {
    if (!data) {
      return {
        itemTotal: 0,
        gstRate: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        taxableTotal: '0.00',
        cgstTotal: '0.00',
        sgstTotal: '0.00',
        totalAmount: 0
      };
    }

    const qty = Math.max(1, Number(invoiceQty) || 1);
    const hsn = data.hsn_number || '';
    const gstRate = hsn === "" ? 0 : (HSN_TAX_MAP[hsn] !== undefined ? HSN_TAX_MAP[hsn] : 12);
    
    const cgstPercent = gstRate / 2;
    const sgstPercent = gstRate / 2;

    const unitPrice = data.vendor_price || 0;
    const itemTotal = unitPrice * qty;
    
    const taxableTotal = gstRate > 0 ? (itemTotal / (1 + (gstRate / 100))) : itemTotal;
    const cgstTotal = gstRate > 0 ? (taxableTotal * (cgstPercent / 100)) : 0;
    const sgstTotal = gstRate > 0 ? (taxableTotal * (sgstPercent / 100)) : 0;
    const totalAmount = itemTotal + deliveryCharge;

    return {
      itemTotal,
      gstRate,
      cgstPercent,
      sgstPercent,
      taxableTotal: taxableTotal.toFixed(2),
      cgstTotal: cgstTotal.toFixed(2),
      sgstTotal: sgstTotal.toFixed(2),
      totalAmount
    };
  }, [data, invoiceQty]);

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
  const isCodAvailable = data.isCodAvailable !== false && data.medicineId?.isCodAvailable !== false;

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
                        <span className={`px-3 py-1 ${isCodAvailable ? 'bg-white text-emerald-600' : 'bg-rose-500 text-white'} text-[10px] font-black uppercase rounded-lg tracking-widest`}>
                            COD: {isCodAvailable ? 'Available' : 'Unavailable'}
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

            {/* Dynamic GST Billing Simulator */}
            <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-3xl space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 tracking-wider">
                        <FaCalculator className="text-emerald-500" /> GST Invoice & Billing Simulator
                    </h3>
                    <div className="flex items-center gap-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Test Quantity:</label>
                        <input 
                          type="number" 
                          min="1"
                          className="w-16 p-1 bg-white border border-slate-200 rounded text-center text-xs font-extrabold text-slate-700 outline-none"
                          value={invoiceQty}
                          onChange={(e) => setInvoiceQty(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
                    <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-slate-100/50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-200/50">
                                <th className="px-3 py-2">Item Name</th>
                                <th className="px-3 py-2 text-center">Qty</th>
                                <th className="px-3 py-2 text-right">MRP</th>
                                <th className="px-3 py-2 text-right">Rate</th>
                                <th className="px-3 py-2 text-center">HSN</th>
                                <th className="px-3 py-2 text-center">CGST %</th>
                                <th className="px-3 py-2 text-center">SGST %</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                            <tr>
                                <td className="px-3 py-2.5 font-bold text-slate-800">{data.medicineId?.name}</td>
                                <td className="px-3 py-2.5 text-center font-black">{Number(invoiceQty) || 1}</td>
                                <td className="px-3 py-2.5 text-right">₹{data.mrp ?? data.medicineId?.mrp}</td>
                                <td className="px-3 py-2.5 text-right">₹{data.vendor_price}</td>
                                <td className="px-3 py-2.5 text-center text-[9px] font-mono">{data.hsn_number || '—'}</td>
                                <td className="px-3 py-2.5 text-center text-emerald-600 font-bold">
                                  {billSummary.cgstPercent > 0 ? `${billSummary.cgstPercent}%` : '0.00%'}
                                </td>
                                <td className="px-3 py-2.5 text-center text-emerald-600 font-bold">
                                  {billSummary.sgstPercent > 0 ? `${billSummary.sgstPercent}%` : '0.00%'}
                                </td>
                                <td className="px-3 py-2.5 text-right font-bold text-slate-800">₹{billSummary.itemTotal}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col gap-2 shadow-sm text-xs">
                    <div className="flex justify-between items-center text-slate-500 font-bold">
                        <span>Taxable Amount (Base Price):</span>
                        <span className="font-extrabold text-slate-800">₹{billSummary.taxableTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-bold">
                        <span>Add CGST:</span>
                        <span className="font-extrabold text-slate-800">₹{billSummary.cgstTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-bold">
                        <span>Add SGST:</span>
                        <span className="font-extrabold text-slate-800">₹{billSummary.sgstTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-bold">
                        <span>Delivery Charge:</span>
                        <span className="font-extrabold text-slate-800">₹{deliveryCharge}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-emerald-700 font-black text-sm">
                        <span>Grand Total (Total Amount):</span>
                        <span>₹{billSummary.totalAmount}</span>
                    </div>
                </div>

                {!isCodAvailable && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[10px] font-bold animate-pulse">
                     ⚠️ COD (Cash on Delivery) is currently unavailable for this store.
                  </div>
                )}
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
                        <span className="font-black text-slate-700">{data.hsn_number || '—'}</span>
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