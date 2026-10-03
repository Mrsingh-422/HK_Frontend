"use client";
import React from "react";
import { FaBoxOpen, FaCheckCircle, FaPlus } from "react-icons/fa";

export default function ConsumablesPicker({ items, selectedItems, onToggle }) {
    if (!items || items.length === 0) return null;
    
    return (
        <div className="bg-white rounded-[2rem] p-6 md:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#08B36A] flex items-center justify-center">
                    <FaBoxOpen size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Clinical Consumables</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Add sterilized medical supplies for procedure
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, idx) => {
                    const consumableId = item.masterItemId?._id || item._id;
                    const isSelected = selectedItems.some(i => i.consumableId === consumableId);
                    const itemName = item.masterItemId?.itemName || item.itemName;
                    const price = item.finalPrice || item.price || 0;
                    const unitType = item.masterItemId?.unitType || item.unitType || "Piece";
                    
                    return (
                        <div 
                            key={idx}
                            onClick={() => onToggle(item)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                isSelected 
                                    ? "border-[#08B36A] bg-emerald-50/40 ring-1 ring-[#08B36A]/20" 
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-[#08B36A] text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                    <FaBoxOpen size={14} />
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-black text-slate-900 truncate">{itemName}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-xs font-bold text-[#08B36A]">₹{price}</p>
                                        <span className="text-[9px] font-medium text-slate-400 uppercase">/ {unitType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-2 transition-all ${
                                isSelected 
                                    ? "bg-[#08B36A] border-[#08B36A] text-white" 
                                    : "border-slate-300 bg-white text-slate-300"
                            }`}>
                                {isSelected ? <FaCheckCircle size={12} /> : <FaPlus size={8} />}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {selectedItems.length > 0 && (
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-600 border-t border-slate-100">
                    <span>Selected supplies:</span>
                    <span className="text-[#08B36A] font-black">
                        {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} added
                    </span>
                </div>
            )}
        </div>
    );
}