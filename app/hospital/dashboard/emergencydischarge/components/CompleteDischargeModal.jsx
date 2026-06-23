'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaTimes, FaReceipt, FaPlus,
  FaCheckCircle, FaTrashAlt, FaDollarSign, FaBed
} from 'react-icons/fa'

const CompleteDischargeModal = ({ 
  patient, 
  onClose, 
  onConfirm, 
  initialBillingItems = [] 
}) => {
  const [billingItems, setBillingItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Sync state whenever the modal receives dynamic billing data from the selected patient
  useEffect(() => {
    if (initialBillingItems && initialBillingItems.length > 0) {
      setBillingItems(initialBillingItems.map(item => ({
        serviceName: item.serviceName,
        price: Number(item.price)
      })));
    } else {
      setBillingItems([]);
    }
  }, [initialBillingItems]);

  if (!patient) return null;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    
    setBillingItems([
      ...billingItems,
      { serviceName: newItemName.trim(), price: Number(newItemPrice) }
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleRemoveItem = (index) => {
    setBillingItems(billingItems.filter((_, idx) => idx !== index));
  };

  // Pricing calculations
  const baseFee = patient.pricingBreakdown?.baseFee || 0;
  const visitCharges = patient.pricingBreakdown?.visitCharges || 0;
  const initialExtraCharges = patient.pricingBreakdown?.extraCharges || 0;
  const discountAmount = patient.pricingBreakdown?.discountAmount || 0;

  const calculatedServiceCost = billingItems.reduce((sum, item) => sum + item.price, 0);
  const totalCalculatedCost = baseFee + visitCharges + initialExtraCharges + calculatedServiceCost - discountAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      appointmentId: patient._id,
      billingItems: billingItems,
      isEmergency: !!patient.ambulanceId 
    });
    onClose();
  };

  const patientName = patient.patients?.[0]?.patientName || patient.userId?.name || "Unknown Patient";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Discharge Ledger</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Patient: {patientName}</p>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Dynamic System & Bed Allotment Information */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-4 space-y-2">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Stay Breakdown</span>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-slate-500 font-semibold">Admission Base Fee:</div>
                <div className="text-right text-slate-800 font-bold">₹{baseFee.toFixed(2)}</div>
                
                {patient.bedId && (
                  <>
                    <div className="text-slate-500 font-semibold flex items-center gap-1">
                      <FaBed className="text-[#08B36A]" /> Bed rate ({patient.bedId.bedNumber}):
                    </div>
                    <div className="text-right text-slate-800 font-bold">₹{(patient.bedId.pricePerDay || 0).toFixed(2)} / day</div>
                  </>
                )}

                {visitCharges > 0 && (
                  <>
                    <div className="text-slate-500 font-semibold">Consultation Charges:</div>
                    <div className="text-right text-slate-800 font-bold">₹{visitCharges.toFixed(2)}</div>
                  </>
                )}

                {initialExtraCharges > 0 && (
                  <>
                    <div className="text-slate-500 font-semibold">Overstay / Miscellaneous:</div>
                    <div className="text-right text-slate-800 font-bold text-rose-600">₹{initialExtraCharges.toFixed(2)}</div>
                  </>
                )}

                {discountAmount > 0 && (
                  <>
                    <div className="text-slate-500 font-semibold text-green-600">Discounts Applied:</div>
                    <div className="text-right text-green-600 font-bold">-₹{discountAmount.toFixed(2)}</div>
                  </>
                )}
              </div>
            </div>

            {/* Active Items Table */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                Dynamic Service Line Items
              </label>
              {billingItems.length > 0 ? (
                <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {billingItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50/50 text-xs">
                      <span className="font-bold text-slate-700">{item.serviceName}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-black text-slate-900">₹{(item.price || 0).toFixed(2)}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-300 hover:text-rose-600 transition"
                        >
                          <FaTrashAlt size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                  No additional service items added.
                </div>
              )}
            </div>

            {/* Quick Add Form */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Add Additional Charge</span>
              <div className="grid grid-cols-12 gap-2">
                <input 
                  type="text" 
                  placeholder="Service Name" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="col-span-7 bg-white border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="col-span-3 bg-white border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                />
                <button 
                  onClick={handleAddItem}
                  className="col-span-2 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl flex items-center justify-center transition shadow-sm"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
              <span className="uppercase tracking-wide text-xs text-slate-400">Grand Total Summary</span>
              <span className="text-xl text-[#08B36A]">₹{totalCalculatedCost.toFixed(2)}</span>
            </div>

            {/* Alert Context info */}
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <FaReceipt className="text-blue-500 mt-0.5 animate-none" />
                <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                  Finalization initiates auto-release of Bed Allotments and tracking channels. Bedside treatment records are marked completed.
                </p>
            </div>

            <button 
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#08B36A] hover:bg-[#069e5d] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <FaCheckCircle /> CONFIRM DISCHARGE
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default CompleteDischargeModal;