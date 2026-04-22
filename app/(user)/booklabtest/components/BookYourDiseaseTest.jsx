"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaFlask, FaStar, FaSearch, FaMicroscope, FaCheckCircle, FaMapMarkerAlt,
  FaArrowRight, FaFilter, FaFemale, FaUserMd, FaHeartbeat, FaVial,
  FaShieldAlt, FaPlus, FaClock, FaVials, FaFileAlt
} from "react-icons/fa";
import TestDetailsModal from "./otherComponents/TestDetailsModal";
import { useGlobalContext } from "@/app/context/GlobalContext";

const INITIAL_PACKAGES = [
  {
    id: 9,
    name: "Complete Women's Health",
    vendor: "Metro Labs",
    price: "₹6,500",
    discountPrice: "₹3,999",
    category: "Women",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
    rating: 4.9,
    distance: 1.2,
    tests: "55 Parameters",
    isTrending: true
  },
  {
    id: 14,
    name: "PCOS Advanced Panel",
    vendor: "Wellness Path",
    price: "₹2,500",
    discountPrice: "₹1,499",
    category: "Women",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
    rating: 4.7,
    distance: 2.5,
    tests: "12 Parameters",
    isTrending: false
  },
  {
    id: 4,
    name: "Heart Health Check",
    vendor: "City Care",
    price: "₹4,500",
    discountPrice: "₹2,799",
    category: "Heart",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80",
    rating: 4.8,
    distance: 2.1,
    tests: "25 Parameters",
    isTrending: true
  },
  {
    id: 5,
    name: "Thyroid Profile",
    vendor: "Prime Diagnostics",
    price: "₹1,800",
    discountPrice: "₹899",
    category: "Diabetes",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    distance: 3.8,
    tests: "10 Parameters",
    isTrending: false
  },
];

function BookYourDiseaseTest() {
  const router = useRouter();
  const { getSearchTestData } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPkg, setSelectedPkg] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pageData, setPageData] = useState({
    miniTitle: "NABL & ISO CERTIFIED",
    mainTitle: "Precision Diagnostics, At Your Doorstep",
    description: "Experience hassle-free lab testing with 100% accurate results and certified professionals.",
    searchLabel: "Search for tests, packages or symptoms..."
  });

  const filteredPackages = useMemo(() => {
    return INITIAL_PACKAGES.filter((pkg) => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || pkg.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleSeeAll = () => {
    sessionStorage.setItem("allTestPackages", JSON.stringify(INITIAL_PACKAGES));
    router.push("/booklabtest/seealltests");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
      <TestDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pkg={selectedPkg} />

      {/* --- 1. PREMIUM HERO SECTION (Linear Gradient) --- */}
      <section className="relative bg-[#08B36A] pt-12 pb-24 px-4 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <span className="inline-flex items-center gap-2 bg-black/20 border border-white/20 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
              <FaShieldAlt className="text-emerald-300" /> {pageData.miniTitle}
            </span>
            <h1 className="text-4xl sm:text-7xl font-black leading-tight drop-shadow-sm">
              {pageData.mainTitle}
            </h1>
            <p className="text-emerald-50 text-base sm:text-xl max-w-lg font-medium opacity-90">
              {pageData.description}
            </p>
            <div className="relative max-w-xl group pt-4">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 z-20" />
              <input
                type="text"
                placeholder={pageData.searchLabel}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-6 rounded-2xl bg-white text-slate-800 shadow-2xl shadow-emerald-900/20 outline-none font-bold transition-all border-none focus:ring-4 focus:ring-emerald-400/30"
              />
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] rotate-3 hover:rotate-0 transition-all duration-700">
              <FaMicroscope className="text-[12rem] text-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. THE PROCESS BAR (Removes "Empty" Feel) --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 border-r border-slate-50 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A]"><FaSearch /></div>
            <div><h4 className="font-black text-xs uppercase">1. Search</h4><p className="text-[10px] text-slate-400 font-bold">Pick your test</p></div>
          </div>
          <div className="flex items-center gap-4 border-r border-slate-50 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A]"><FaClock /></div>
            <div><h4 className="font-black text-xs uppercase">2. Book</h4><p className="text-[10px] text-slate-400 font-bold">Select slot</p></div>
          </div>
          <div className="flex items-center gap-4 border-r border-slate-50 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A]"><FaVials /></div>
            <div><h4 className="font-black text-xs uppercase">3. Sample</h4><p className="text-[10px] text-slate-400 font-bold">Home pickup</p></div>
          </div>
          <div className="flex items-center gap-4 border-r border-slate-50 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A]"><FaFileAlt /></div>
            <div><h4 className="font-black text-xs uppercase">4. Reports</h4><p className="text-[10px] text-slate-400 font-bold">Within 24h</p></div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-20 space-y-24">

        {/* --- 3. CATEGORY NAV --- */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Browse by Category</h2>
            <button onClick={handleSeeAll} className="text-[#08B36A] font-black text-xs uppercase hover:underline">See All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {["All", "Women", "Heart", "Diabetes", "Full Body"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-3 px-10 py-4 rounded-full font-black text-xs transition-all border-2
                  ${activeCategory === cat ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-[#08B36A]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* --- 4. THE "WOMEN'S BOUTIQUE" (LINEAR BG) --- */}
        <section className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#08B36A] to-[#044D2D] p-8 sm:p-16 text-white group">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="bg-white/20 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Specialized Care</span>
              <h2 className="text-4xl sm:text-6xl font-black leading-[1.1]">The Complete <br />Women's Healthcare <br /> Hub.</h2>
              <p className="text-emerald-100 text-lg opacity-80 max-w-md font-medium">Expertly curated packages for PCOS, Pregnancy, Thyroid, and Senior Female wellness.</p>
              <button
                onClick={() => router.push("/booklabtest/womenstestonly")}
                className="bg-white text-emerald-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
              >
                View Women-Only Tests
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <FaPlus className="text-emerald-300 text-3xl mb-4" />
                <h4 className="font-black text-lg mb-2">Fertility Panel</h4>
                <p className="text-xs text-emerald-100 font-medium">10 Parameters covering FSH, LH, and more.</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 mt-8">
                <FaFemale className="text-emerald-300 text-3xl mb-4" />
                <h4 className="font-black text-lg mb-2">PCOS Screening</h4>
                <p className="text-xs text-emerald-100 font-medium">Hormonal checks from top certified labs.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </section>

        {/* --- 5. MAIN PRODUCT GRID (2 Mobile / 4 Desktop) --- */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase leading-none">Popular Lab Tests</h2>
              <p className="text-[#08B36A] font-bold text-xs mt-2 uppercase tracking-widest">Verified by NABL Labs</p>
            </div>
            <button onClick={handleSeeAll} className="text-slate-400 font-black text-xs uppercase hover:text-[#08B36A] flex items-center gap-2">Explore Full Inventory <FaArrowRight /></button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="group bg-white rounded-[2rem] border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-[#08B36A]/10 transition-all duration-500 overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {pkg.isTrending && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">Trending</div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-2 py-1 rounded-xl text-[9px] font-black flex items-center gap-1 shadow-md">
                    <FaStar className="text-yellow-400" /> {pkg.rating}
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  <span className="text-[9px] font-black text-[#08B36A] uppercase tracking-tighter mb-1">{pkg.vendor}</span>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 line-clamp-2 leading-tight mb-4 h-10">
                    {pkg.name}
                  </h3>

                  <div className="text-[10px] text-slate-400 font-bold mb-6 flex items-center gap-2">
                    <FaCheckCircle className="text-[#08B36A]" /> {pkg.tests}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">{pkg.discountPrice}</span>
                      <span className="text-[10px] text-slate-300 line-through font-bold">{pkg.price}</span>
                    </div>
                    <button
                      onClick={() => setSelectedPkg(pkg) || setIsModalOpen(true)}
                      className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#08B36A] transition-all active:scale-95"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 6. TRUST FOOTER --- */}
        <section className="bg-white rounded-[3rem] border border-slate-100 p-10 sm:p-20 text-center space-y-8">
          <h3 className="text-3xl sm:text-5xl font-black text-slate-900 max-w-2xl mx-auto leading-tight">Accurate Reports. <br /><span className="text-[#08B36A]">Better Decisions.</span></h3>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm sm:text-lg">Don't settle for less when it comes to your health. We partner with the top 5% of labs in India to bring you quality diagnostics.</p>
          <button
            onClick={handleSeeAll}
            className="bg-[#08B36A] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-500/20"
          >
            View All Available Health Tests
          </button>
        </section>

      </main>
    </div>
  );
}

export default BookYourDiseaseTest;