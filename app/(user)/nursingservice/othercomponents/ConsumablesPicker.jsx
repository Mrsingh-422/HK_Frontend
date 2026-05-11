"use client";
import React from "react";
import { FaBoxOpen, FaCheckCircle } from "react-icons/fa";

export default function ConsumablesPicker({ items, selectedItems, onToggle }) {
    if (!items || items.length === 0) return null;
    
    return (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <FaBoxOpen className="text-teal-500 text-lg" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Medical Consumables</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Add required medical supplies
                    </p>
                </div>
            </div>
            
            <div className="space-y-3">
                {items.map((item, idx) => {
                    const consumableId = item.masterItemId?._id || item._id;
                    const isSelected = selectedItems.find(i => i.consumableId === consumableId);
                    const itemName = item.masterItemId?.itemName || item.itemName;
                    const price = item.finalPrice || item.price || 0;
                    const unitType = item.masterItemId?.unitType || item.unitType || "Piece";
                    
                    return (
                        <div 
                            key={idx}
                            onClick={() => onToggle(item)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                isSelected 
                                ? "border-teal-500 bg-teal-50/50" 
                                : "border-slate-100 bg-white hover:border-slate-200"
                            }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isSelected ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"
                                }`}>
                                    <FaBoxOpen size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-800">{itemName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs font-bold text-teal-600">₹{price}</p>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">per {unitType}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected 
                                ? "bg-teal-500 border-teal-500" 
                                : "border-slate-300"
                            }`}>
                                {isSelected && <FaCheckCircle className="text-white text-[10px]" />}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {selectedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500">
                        Selected {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}