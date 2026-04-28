"use client";

import React from 'react';
import { FaPills, FaStar, FaMapMarkerAlt, FaPlus, FaFilePrescription } from 'react-icons/fa';

const NearByMedicines = () => {
    // Dummy Data for Medicines
    const dummyMedicines = [
        {
            id: 1,
            name: "Telma 40 Tablet",
            manufacturer: "Glenmark Pharmaceuticals",
            price: 150,
            mrp: 180,
            discount: "15% OFF",
            rating: 4.8,
            distance: "1.2 km away",
            image: "https://limitless-bucket-v2.s3.ap-south-1.amazonaws.com/medicine-placeholder.png", // Replace with real images
            prescriptionRequired: true,
            category: "Cardiac Care"
        },
        {
            id: 2,
            name: "Pan 40 Tablet",
            manufacturer: "Alkem Laboratories",
            price: 120,
            mrp: 155,
            discount: "22% OFF",
            rating: 4.5,
            distance: "0.8 km away",
            image: "https://limitless-bucket-v2.s3.ap-south-1.amazonaws.com/medicine-placeholder.png",
            prescriptionRequired: false,
            category: "Stomach Care"
        },
        {
            id: 3,
            name: "Crocin Advance 500mg",
            manufacturer: "GlaxoSmithKline",
            price: 25,
            mrp: 30,
            discount: "10% OFF",
            rating: 4.9,
            distance: "2.5 km away",
            image: "https://limitless-bucket-v2.s3.ap-south-1.amazonaws.com/medicine-placeholder.png",
            prescriptionRequired: false,
            category: "Fever & Pain"
        },
        {
            id: 4,
            name: "Augmentin 625 Duo",
            manufacturer: "GSK Pharmaceuticals",
            price: 190,
            mrp: 220,
            discount: "12% OFF",
            rating: 4.7,
            distance: "1.5 km away",
            image: "https://limitless-bucket-v2.s3.ap-south-1.amazonaws.com/medicine-placeholder.png",
            prescriptionRequired: true,
            category: "Antibiotics"
        }
    ];

    return (
        <div className="bg-[#F8FAFC] py-12 px-4 font-['Plus_Jakarta_Sans']">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-emerald-600 font-black uppercase tracking-[2px] text-[10px]">Instant Delivery</span>
                        <h2 className="text-3xl font-black text-slate-900 mt-1">Medicines Near You</h2>
                        <p className="text-slate-500 text-sm mt-2">Get your essential medicines delivered from trusted local pharmacies.</p>
                    </div>
                    <button className="text-emerald-600 font-black text-xs uppercase tracking-wider hover:underline">
                        View All
                    </button>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dummyMedicines.map((med) => (
                        <div key={med.id} className="bg-white border border-slate-100 rounded-[24px] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            {/* Image & Badges */}
                            <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-8">
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    <span className="bg-white/90 backdrop-blur shadow-sm px-2 py-1 rounded-lg text-[9px] font-black text-slate-900 flex items-center gap-1">
                                        <FaStar className="text-amber-400" /> {med.rating}
                                    </span>
                                    {med.prescriptionRequired && (
                                        <span className="bg-rose-50 text-rose-500 border border-rose-100 px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                            <FaFilePrescription /> RX
                                        </span>
                                    )}
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[9px] font-black">
                                        {med.discount}
                                    </span>
                                </div>

                                {/* Placeholder for Medicine Image */}
                                <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    <FaPills className="text-slate-200 text-6xl" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight mb-1">{med.category}</p>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{med.name}</h3>
                                <p className="text-[11px] text-slate-400 font-medium mb-3">{med.manufacturer}</p>

                                <div className="flex items-center gap-2 mb-4">
                                    <FaMapMarkerAlt className="text-slate-300 text-[10px]" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{med.distance}</span>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-slate-900">₹{med.price}</span>
                                            <span className="text-xs text-slate-400 line-through">₹{med.mrp}</span>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200 hover:shadow-emerald-200">
                                        <FaPlus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NearByMedicines;