"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaSearch, FaMicroscope } from "react-icons/fa";
import TestDetailsModal from "../components/otherComponents/TestDetailsModal";

function AllTestsPage() {
    const router = useRouter();
    const [tests, setTests] = useState([]);
    const [localSearch, setLocalSearch] = useState("");

    const INITIAL_PACKAGES = [
        {
            id: 4,
            name: "Heart Health Package",
            vendor: "City Care Diagnostics",
            price: "₹4,500",
            discountPrice: "₹2,799",
            priceValue: 2799,
            image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 2.1,
            tests: "Includes 25 Parameters",
            detailedTests: [
                "ECG",
                "2D Echo",
                "Lipid Profile",
                "High Sensitivity CRP",
                "Homocysteine",
                "Troponin I",
                "CK-MB"
            ]
        },
        {
            id: 5,
            name: "Thyroid Profile Advanced",
            vendor: "Metro Lab Services",
            price: "₹1,800",
            discountPrice: "₹899",
            priceValue: 899,
            image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
            rating: 5,
            distance: 4.8,
            tests: "Includes 10 Parameters",
            detailedTests: [
                "TSH",
                "T3 Total",
                "T4 Total",
                "Free T3",
                "Free T4",
                "Anti-TPO Antibodies"
            ]
        },
        {
            id: 6,
            name: "Kidney Function Test",
            vendor: "Prime Diagnostics",
            price: "₹2,200",
            discountPrice: "₹1,299",
            priceValue: 1299,
            image: "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 6.3,
            tests: "Includes 15 Parameters",
            detailedTests: [
                "Creatinine",
                "Blood Urea",
                "Uric Acid",
                "Sodium",
                "Potassium",
                "Chloride",
                "Glomerular Filtration Rate"
            ]
        },
        {
            id: 7,
            name: "Liver Function Test",
            vendor: "Apollo Diagnostic Hub",
            price: "₹1,500",
            discountPrice: "₹799",
            priceValue: 799,
            image: "https://images.unsplash.com/photo-1576765607924-3f0c2d6b7c10?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 1.9,
            tests: "Includes 12 Parameters",
            detailedTests: [
                "SGPT (ALT)",
                "SGOT (AST)",
                "Alkaline Phosphatase",
                "Bilirubin Total",
                "Bilirubin Direct",
                "Total Protein",
                "Albumin"
            ]
        },
        {
            id: 8,
            name: "Vitamin Deficiency Panel",
            vendor: "Wellness Path Labs",
            price: "₹3,000",
            discountPrice: "₹1,999",
            priceValue: 1999,
            image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80",
            rating: 5,
            distance: 3.5,
            tests: "Includes 8 Parameters",
            detailedTests: [
                "Vitamin D",
                "Vitamin B12",
                "Calcium",
                "Iron",
                "Ferritin",
                "Magnesium"
            ]
        },
        {
            id: 9,
            name: "Women's Health Package",
            vendor: "CareFirst Diagnostics",
            price: "₹6,500",
            discountPrice: "₹3,999",
            priceValue: 3999,
            image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 2.7,
            tests: "Includes 55 Parameters",
            detailedTests: [
                "CBC",
                "Thyroid Profile",
                "Pap Smear",
                "Hormone Panel",
                "Lipid Profile",
                "Blood Sugar Fasting",
                "Vitamin D"
            ]
        },
        {
            id: 10,
            name: "Men's Health Package",
            vendor: "HealthSecure Labs",
            price: "₹6,000",
            discountPrice: "₹3,499",
            priceValue: 3499,
            image: "https://images.unsplash.com/photo-1588776814546-ec7e2b57c2d6?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 4.1,
            tests: "Includes 50 Parameters",
            detailedTests: [
                "CBC",
                "PSA",
                "Testosterone",
                "Lipid Profile",
                "Liver Function Test",
                "Kidney Function Test",
                "Blood Sugar"
            ]
        },
        {
            id: 11,
            name: "Senior Citizen Health Package",
            vendor: "GoldenCare Diagnostics",
            price: "₹7,500",
            discountPrice: "₹4,999",
            priceValue: 4999,
            image: "https://images.unsplash.com/photo-1580281658629-58c4e4dba9c9?auto=format&fit=crop&w=400&q=80",
            rating: 5,
            distance: 2.4,
            tests: "Includes 70 Parameters",
            detailedTests: [
                "Complete Hemogram",
                "Lipid Profile",
                "Kidney Function Test",
                "Liver Function Test",
                "Thyroid Profile",
                "Vitamin B12",
                "Blood Sugar Fasting"
            ]
        },
        {
            id: 12,
            name: "Fever Screening Panel",
            vendor: "RapidCare Labs",
            price: "₹1,200",
            discountPrice: "₹699",
            priceValue: 699,
            image: "https://images.unsplash.com/photo-1581594549595-35f6edc8e2e7?auto=format&fit=crop&w=400&q=80",
            rating: 3,
            distance: 5.9,
            tests: "Includes 18 Parameters",
            detailedTests: [
                "CBC",
                "Malaria Antigen",
                "Dengue NS1",
                "Typhoid Test",
                "ESR",
                "CRP"
            ]
        },
        {
            id: 13,
            name: "Pre-Employment Health Checkup",
            vendor: "WorkFit Diagnostics",
            price: "₹3,500",
            discountPrice: "₹2,199",
            priceValue: 2199,
            image: "https://images.unsplash.com/photo-1581595219341-7a5d2e0b8c9e?auto=format&fit=crop&w=400&q=80",
            rating: 4,
            distance: 3.8,
            tests: "Includes 40 Parameters",
            detailedTests: [
                "CBC",
                "Blood Sugar",
                "Urine Routine",
                "Liver Function Test",
                "Kidney Function Test",
                "Chest X-Ray",
                "HIV Screening"
            ]
        }
    ];

    // ✅ ADDED ONLY THIS
    useEffect(() => {
        setTests(INITIAL_PACKAGES);
    }, []);

    const filteredTests = useMemo(() => {
        return tests.filter((t) =>
            t.name.toLowerCase().includes(localSearch.toLowerCase()) ||
            t.vendor.toLowerCase().includes(localSearch.toLowerCase())
        );
    }, [tests, localSearch]);

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBookClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-[#08B36A]/10">

            <TestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pkg={selectedPackage}
            />

            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-7">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-widest cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <FaMicroscope className="text-[#08B36A] text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Systems</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-6 md:py-10 px-4">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Medical <span className="text-[#08B36A]">Packages</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Available diagnostics near you.</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#08B36A] outline-none text-xs"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {filteredTests.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white rounded-2xl p-2.5 md:p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all"
                        >
                            <div className="h-28 sm:h-36 md:h-48 w-full relative overflow-hidden rounded-xl bg-slate-50 mb-3">
                                <img
                                    src={pkg.image}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    alt={pkg.name}
                                />
                                <div className="absolute bottom-2 right-2 bg-[#08B36A] text-white px-1.5 py-0.5 rounded-lg text-[7px] md:text-[9px] font-black shadow-lg">
                                    <FaMapMarkerAlt className="inline mr-1" />{pkg.distance}km
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[7px] md:text-[10px] font-black text-[#08B36A] uppercase tracking-widest truncate max-w-[70px]">{pkg.vendor}</span>
                                    <div className="flex items-center gap-0.5 text-yellow-400 text-[8px] md:text-xs">
                                        <FaStar className="fill-current" /> <span className="text-slate-900 font-bold">{pkg.rating}</span>
                                    </div>
                                </div>

                                <h3 className="text-[11px] md:text-base font-black text-slate-800 line-clamp-2 min-h-[30px] md:min-h-[44px]">
                                    {pkg.name}
                                </h3>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                                <p className="text-sm md:text-xl font-black text-slate-900">{pkg.discountPrice}</p>
                                <button
                                    onClick={() => handleBookClick(pkg)}
                                    className="bg-[#08B36A] hover:bg-slate-900 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[11px] uppercase tracking-widest transition-all active:scale-90"
                                >
                                    Book
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default AllTestsPage;