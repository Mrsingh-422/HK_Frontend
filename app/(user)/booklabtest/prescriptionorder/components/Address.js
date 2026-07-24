'use client';
import React from 'react';
import { FaCheckCircle, FaMapMarkerAlt, FaPlus, FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Address({ 
  addresses, selectedAddress, collectionType, 
  onSelect, onTypeChange, onBack, onSubmit, submitting 
}) {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">5. Delivery & Collection Mode</h3>
          <p className="text-xs text-slate-500">Choose how your laboratory samples should be collected.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-xs">
          <div>
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Collection Type *</label>
            <div className="relative mt-2">
              <select
                value={collectionType}
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 appearance-none transition-all font-semibold outline-none text-xs"
                onChange={(e) => onTypeChange(e.target.value)}
              >
                <option value="Home Collection">Home Collection</option>
                <option value="Visit Lab">Visit Lab</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {collectionType === 'Home Collection' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700">Select Home Visit Location</h4>
              <button onClick={() => router.push('/userscreens/myaccount')} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-xl">
                <FaPlus size={10} /> Add Address
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div 
                  key={addr._id}
                  onClick={() => onSelect(addr)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    selectedAddress?._id === addr._id ? 'border-[#08B36A] bg-green-50/10' : 'border-slate-100 bg-white'
                  }`}
                >
                  {selectedAddress?._id === addr._id && (
                    <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
                      <FaCheckCircle size={14} />
                    </span>
                  )}
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#e6f7eb] text-[#08B36A] uppercase mb-2">
                    {addr.addressType || "Home"}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">{addr.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {addr.houseNo}, {addr.sector}, {addr.city} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="px-6 py-4 border rounded-2xl text-slate-500 text-xs font-bold hover:bg-slate-50">Previous</button>
        <button
          onClick={onSubmit}
          disabled={submitting || (collectionType === 'Home Collection' && !selectedAddress)}
          className="flex-1 py-4 bg-[#08B36A] text-white text-[13px] font-bold rounded-2xl shadow-lg disabled:opacity-40 uppercase tracking-wide flex items-center justify-center gap-2"
        >
          {submitting ? "Uploading details..." : "Submit Prescription Request"}
        </button>
      </div>
    </div>
  );
}