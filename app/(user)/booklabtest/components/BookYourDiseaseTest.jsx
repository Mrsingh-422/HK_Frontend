"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaFlask, FaStar, FaFilter, FaSearch, FaMicroscope,
  FaCheckCircle, FaTimes, FaInbox, FaMapMarkerAlt, FaSortAmountDown, FaArrowRight
} from "react-icons/fa";
import TestDetailsModal from "./otherComponents/TestDetailsModal";
import { useGlobalContext } from "@/app/context/GlobalContext"; // Import Context

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
    detailedTests: ["ECG", "2D Echo", "Lipid Profile", "High Sensitivity CRP", "Homocysteine", "Troponin I", "CK-MB"]
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
    detailedTests: ["TSH", "T3 Total", "T4 Total", "Free T3", "Free T4", "Anti-TPO Antibodies"]
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
    detailedTests: ["Creatinine", "Blood Urea", "Uric Acid", "Sodium", "Potassium", "Chloride", "Glomerular Filtration Rate"]
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
    detailedTests: ["SGPT (ALT)", "SGOT (AST)", "Alkaline Phosphatase", "Bilirubin Total", "Bilirubin Direct", "Total Protein", "Albumin"]
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
    detailedTests: ["Vitamin D", "Vitamin B12", "Calcium", "Iron", "Ferritin", "Magnesium"]
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
    detailedTests: ["CBC", "Thyroid Profile", "Pap Smear", "Hormone Panel", "Lipid Profile", "Blood Sugar Fasting", "Vitamin D"]
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
    detailedTests: ["CBC", "PSA", "Testosterone", "Lipid Profile", "Liver Function Test", "Kidney Function Test", "Blood Sugar"]
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
    detailedTests: ["Complete Hemogram", "Lipid Profile", "Kidney Function Test", "Liver Function Test", "Thyroid Profile", "Vitamin B12", "Blood Sugar Fasting"]
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
    detailedTests: ["CBC", "Malaria Antigen", "Dengue NS1", "Typhoid Test", "ESR", "CRP"]
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
    detailedTests: ["CBC", "Blood Sugar", "Urine Routine", "Liver Function Test", "Kidney Function Test", "Chest X-Ray", "HIV Screening"]
  }
];

function BookYourDiseaseTest() {
  const router = useRouter();
  const { getSearchTestData } = useGlobalContext(); // Assuming this context function exists

  // States for Search & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  // Dynamic Content State (Left Side)
  const [pageData, setPageData] = useState({
    miniTitle: "100% Verified Labs",
    mainTitle: "Search Test By Habits!",
    description: "Book your lab tests online at HealthKangaroo. Get instant results and save time with our secure and reliable platform. Order now!",
    searchLabel: "Find your diagnostics.."
  });

  // Modal States
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ================= FETCH DYNAMIC CONTENT =================
  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const res = await getSearchTestData(); // API call to get dynamic text
        if (res?.success && res?.data) {
          setPageData({
            miniTitle: res.data.miniTitle || pageData.miniTitle,
            mainTitle: res.data.mainTitle || pageData.mainTitle,
            description: res.data.description || pageData.description,
            searchLabel: res.data.searchLabel || pageData.searchLabel
          });
        }
      } catch (err) {
        console.log("Error fetching dynamic content:", err);
      }
    };
    fetchPageContent();
  }, []);

  // ================= RIGHT SIDE LOGIC (Filtering & Sorting) =================
  const processedPackages = useMemo(() => {
    let result = INITIAL_PACKAGES.filter((pkg) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.vendor.toLowerCase().includes(searchLower)
      );
    });
    result.sort((a, b) => {
      if (sortBy === "price-low") return a.priceValue - b.priceValue;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "nearby") return a.distance - b.distance;
      return 0;
    });
    return result;
  }, [searchTerm, sortBy]);

  const visibleItems = processedPackages.slice(0, 6);
  const hasMore = processedPackages.length > 6;

  const handleSeeAll = () => {
    sessionStorage.setItem("allTestPackages", JSON.stringify(INITIAL_PACKAGES));
    router.push("/booklabtest/seealltests");
  };

  const openModal = (pkg) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <TestDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={selectedPkg}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT SIDE: HERO (Fully Dynamic Now) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35">
            <div className="border-l-4 border-[#08B36A] pl-5 md:pl-6 space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-[#08B36A]/10 text-[#08B36A] uppercase tracking-widest">
                <FaMicroscope className="mr-2" /> {pageData.miniTitle}
              </span>
              
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                {/* Dynamically handling the split title for styling */}
                {pageData.mainTitle.split(" ").map((word, i, arr) => (
                    <span key={i}>
                        {word.toLowerCase().includes("habits") || i === arr.length - 1 ? (
                            <span className="text-[#08B36A] italic">{word} </span>
                        ) : (
                            word + " "
                        )}
                    </span>
                ))}
                <FaFlask className="inline text-[#08B36A] animate-bounce ml-2" />
              </h1>

              <p className="text-slate-600 leading-relaxed">
                {pageData.description}
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <label className="text-[#08B36A] font-black text-xs uppercase tracking-widest">
                {pageData.searchLabel}
              </label>
              <div className="relative group">
                <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-[#08B36A]' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Blood test, Thyroid..."
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] outline-none transition-all shadow-sm text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: LISTINGS (Logic Kept As Is) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
              <p className="text-slate-700 font-bold text-sm">
                Found <span className="text-[#08B36A] font-black">{processedPackages.length} Packages</span>
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border-none text-[11px] font-black text-slate-700 rounded-xl focus:ring-2 focus:ring-[#08B36A] p-2 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="nearby">Nearest First</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Lowest Price</option>
              </select>
            </div>

            <div className="space-y-6">
              {visibleItems.length > 0 ? (
                <>
                  {visibleItems.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#08B36A]/20 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-44 h-44 flex-shrink-0 relative overflow-hidden rounded-3xl">
                          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute bottom-3 right-3 bg-[#08B36A] text-white px-2 py-1 rounded-lg text-[9px] font-black flex items-center shadow-lg">
                            <FaMapMarkerAlt className="mr-1" /> {pkg.distance}km
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-md">
                                {pkg.vendor}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < pkg.rating ? "text-yellow-400 text-[10px]" : "text-slate-200 text-[10px]"} />
                                ))}
                              </div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800">{pkg.name}</h3>
                            <p className="text-slate-400 text-xs mt-2 flex items-center gap-2 font-bold"><FaCheckCircle className="text-[#08B36A]" /> {pkg.tests}</p>
                          </div>

                          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-50">
                            <p className="text-2xl font-black text-slate-900">{pkg.discountPrice}</p>
                            <button
                              onClick={() => openModal(pkg)} 
                              className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 py-3.5 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="pt-6 text-center">
                      <button
                        onClick={handleSeeAll}
                        className="inline-flex items-center gap-3 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-12 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group uppercase text-xs tracking-widest"
                      >
                        See All Packages <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white p-20 rounded-[2rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest">
                  No matches found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookYourDiseaseTest;