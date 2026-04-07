"use client";

import React, { useState, useEffect } from "react";
import {
  FaStar, FaShoppingCart, FaTrashAlt,
  FaCheckCircle, FaInfoCircle, FaClock, FaVial,
  FaShieldAlt, FaClinicMedical, FaArrowLeft, FaExclamationTriangle
} from "react-icons/fa";
import { useCart } from "@/app/context/CartContext"; 
import toast from "react-hot-toast";

const TestDetailsModal = ({ isOpen, onClose, test }) => {
  const { cart, cartItemIds, addItem, removeItem } = useCart();
  const [selectedLab, setSelectedLab] = useState(null);

  const addedOffering = test?.vendorList?.find(v => cartItemIds.includes(v._id));
  const isAdded = !!addedOffering;

  useEffect(() => {
    if (isOpen && isAdded) {
      setSelectedLab(addedOffering);
    } else if (isOpen) {
      setSelectedLab(null);
    }
  }, [isOpen, isAdded, test, addedOffering]);

  if (!isOpen || !test) return null;

  const displayPrice = selectedLab ? selectedLab.discountPrice : (test.vendorList?.length > 0 ? Math.min(...test.vendorList.map(v => v.discountPrice)) : test.standardMRP);
  const strikePrice = selectedLab ? selectedLab.mrp : test.standardMRP;

  const handleAction = async () => {
    if (isAdded) {
      try {
        await removeItem(addedOffering._id);
        toast.success("Test removed from cart");
      } catch (error) {
        toast.error("Failed to remove test from cart");
      }
    } else {
        // REDESIGNED POPUP LOGIC
      if (cart && cart.items?.length > 0 && cart.categoryType) {
        const currentCartType = cart.categoryType;
        const newItemType = test.mainCategory;

        if (currentCartType !== newItemType) {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'animate-out fade-out slide-out-to-bottom-4'} max-w-md w-full bg-white shadow-2xl rounded-[1.5rem] pointer-events-auto flex flex-col overflow-hidden border border-slate-100`}>
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                <FaExclamationTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-bold text-slate-900 leading-tight">Order Restriction</p>
                                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                    You have <span className="font-bold text-slate-700">{currentCartType}</span> tests in cart. Mix-booking with <span className="font-bold text-slate-700">{newItemType}</span> is not allowed.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
                        <button 
                            onClick={() => toast.dismiss(t.id)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={async () => {
                                toast.dismiss(t.id);
                                await addItem(selectedLab.labId, selectedLab._id, 'LabTest', true);
                            }}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                        >
                            Start New Order
                        </button>
                    </div>
                </div>
            ), { position: 'bottom-center', duration: 6000 });
            return;
        }
      }

      if (!selectedLab) {
        toast.error("Please choose a laboratory first!", { icon: '🏥' });
        document.getElementById('lab-selection-area')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      
      try {
        await addItem(selectedLab.labId, selectedLab._id, 'LabTest');
      } catch (error) {
        toast.error("An error occurred while adding to cart.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in fade-in duration-300">
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"><FaArrowLeft size={14} /><span>Back to Catalog</span></button>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Test Code: {test.testCode || 'N/A'}</span>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><FaShieldAlt /> Secure Booking</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12 pb-24 md:pb-0">
          <div className="flex-1">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3"><span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-emerald-100">{test.mainCategory}</span><div className="flex items-center gap-1 text-amber-500 text-xs font-bold"><FaStar /> 4.8 <span className="text-slate-400 font-medium">(Verified)</span></div></div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 uppercase tracking-tight">{test.testName}</h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-3xl font-medium">Quality-controlled laboratory analysis ensures precise health data for medical evaluation.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <ClinicalSpec icon={<FaVial />} label="Sample Type" value={test.sampleType || "Blood"} />
              <ClinicalSpec icon={<FaShieldAlt />} label="Preparation" value={test.pretestPreparation || "None Required"} />
              <ClinicalSpec icon={<FaClock />} label="Turnaround" value="24-48 Hours" />
              <ClinicalSpec icon={<FaClinicMedical />} label="Availability" value={`${test.vendorCount || 0} Labs`} />
            </div>
            <section id="lab-selection-area" className="mb-12 scroll-mt-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="w-1 h-6 bg-emerald-500 rounded-full"></span>1. Select Provider</h3>
              <div className="grid gap-4">
                {test.vendorList?.map((vendor) => {
                  const isSelected = selectedLab?._id === vendor._id;
                  return (
                    <div key={vendor._id} onClick={() => !isAdded && setSelectedLab(vendor)} className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${isSelected ? "border-emerald-500 bg-emerald-50/30 shadow-md" : isAdded ? "border-slate-100 opacity-50 cursor-not-allowed" : "border-slate-100 bg-white hover:border-slate-200 cursor-pointer"}`}>
                      <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}><FaClinicMedical size={20} /></div><div><h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Diagnostic Partner</h4><p className="text-[11px] text-slate-500 font-medium tracking-tight">Report Cycle: {vendor.reportTime} Hours</p></div></div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">{vendor.mrp > vendor.discountPrice && <span className="text-xs text-slate-400 line-through">₹{vendor.mrp}</span>}<p className="text-lg font-black text-slate-900">₹{vendor.discountPrice}</p></div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">{vendor.discountPercent}% Off</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="w-full lg:w-96">
            <div className="sticky top-28 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Checkout Total</p>
                <div className="flex items-baseline gap-2"><h2 className="text-5xl font-black text-slate-900 tracking-tighter">₹{displayPrice}</h2>{strikePrice > displayPrice && <span className="text-slate-400 line-through text-xl font-medium">₹{strikePrice}</span>}</div>
                <p className="text-[10px] text-emerald-600 font-bold mt-4 flex items-center gap-1 uppercase tracking-tight"><FaCheckCircle /> Inclusive of all taxes</p>
              </div>
              <div className="space-y-5 mb-10 font-bold uppercase tracking-widest">
                <SummaryItem icon={<FaClinicMedical />} text={selectedLab ? "Center Selected" : "No Center Selected"} active={!!selectedLab} />
                <SummaryItem icon={<FaShieldAlt />} text="ISO Certified Process" active={true} />
                <SummaryItem icon={<FaInfoCircle />} text="Digital Report Format" active={true} />
              </div>
              <button onClick={handleAction} className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isAdded ? "bg-rose-50 text-rose-600 border border-rose-100 shadow-sm" : !selectedLab ? "bg-slate-100 text-slate-400 cursor-pointer" : "bg-emerald-600 text-white hover:bg-slate-900 shadow-xl shadow-emerald-200"}`}>
                {isAdded ? <><FaTrashAlt /> Remove from Cart</> : <><FaShoppingCart /> Add to Cart</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClinicalSpec = ({ icon, label, value }) => (
  <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all"><div className="text-emerald-500 mb-2">{icon}</div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="text-xs font-black text-slate-800 line-clamp-1">{value}</p></div>
);

const SummaryItem = ({ icon, text, active }) => (
  <div className="flex items-center gap-4 text-xs tracking-tighter"><span className={active ? "text-emerald-500" : "text-slate-200"}>{icon}</span><span className={active ? "text-slate-700" : "text-slate-300"}>{text}</span></div>
);

export default TestDetailsModal;