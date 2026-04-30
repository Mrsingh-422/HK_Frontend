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
import UserAPI from "@/app/services/UserAPI";

function BookYourDiseaseTest() {
  const router = useRouter();
  const { getSearchTestData } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pageData, setPageData] = useState({
    miniTitle: "NABL & ISO CERTIFIED",
    mainTitle: "Precision Diagnostics, At Your Doorstep",
    description: "Experience hassle-free lab testing with 100% accurate results and certified professionals.",
    searchLabel: "Search for tests, packages or symptoms..."
  });

  // Array of 4 static clinical images for the tests
  const STATIC_TEST_IMAGES = [
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80", // MRI / Radiology
    "https://bridgehealth.in/images/new-website/radiology/lab-test-bg.webp", // Lab / Microscope
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvpgUkk1fJT4QjY3o_AK2ZzrhV9YF9RNu6Xw&s", // Blood Vials
    "https://plus.unsplash.com/premium_photo-1663011253265-9b5cb2b5ac92?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGFiJTIwdGVzdHxlbnwwfHwwfHx8MA%3D%3D"  // Clinical Checkup
  ];

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.getStandardTestCatalog();
        if (res?.success) {
          setLabTests(res.data);
        }
      } catch (error) {
        console.error("Error fetching lab tests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredPackages = useMemo(() => {
    return labTests.filter((pkg) => {
      const matchesSearch = pkg.testName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || 
                               pkg.mainCategory === activeCategory || 
                               pkg.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, labTests]);

  const handleSeeAll = () => {
    sessionStorage.setItem("allTestPackages", JSON.stringify(labTests));
    router.push("/booklabtest/seealltests");
  };

  // Helper to map API data to your UI structure with specific static images
  const getDisplayData = (pkg, index) => ({
    id: pkg._id,
    name: pkg.testName,
    vendor: `${pkg.vendorCount} Verified Labs`,
    price: `₹${pkg.standardMRP}`,
    discountPrice: `₹${pkg.minPrice}`,
    category: pkg.mainCategory,
    // Cycle through the 4 static images
    image: STATIC_TEST_IMAGES[index % 4],
    rating: 4.8,
    tests: `${pkg.parameters?.length || 0} Parameters`,
    isTrending: pkg.vendorCount > 2
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900 overflow-x-hidden">
      <TestDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pkg={selectedPkg} />

      {/* --- 1. PREMIUM HERO SECTION (Linear Gradient) --- */}
      <section className="relative bg-[#08B36A] pt-10 sm:pt-12 pb-24 sm:pb-32 px-4 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="text-white space-y-4 sm:space-y-6">
            <span className="inline-flex items-center gap-2 bg-black/20 border border-white/20 px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest">
              <FaShieldAlt className="text-emerald-300" /> {pageData.miniTitle}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight sm:leading-[1.1] drop-shadow-sm">
              {pageData.mainTitle}
            </h1>
            <p className="text-emerald-50 text-sm sm:text-lg lg:text-xl max-w-lg font-medium opacity-90">
              {pageData.description}
            </p>
            <div className="relative max-w-xl group pt-2 sm:pt-4">
              <FaSearch className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 z-20" />
              <input
                type="text"
                placeholder={pageData.searchLabel}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 rounded-xl sm:rounded-2xl bg-white text-slate-800 shadow-2xl shadow-emerald-900/20 outline-none text-sm sm:text-base font-bold transition-all border-none focus:ring-4 focus:ring-emerald-400/30 placeholder:text-slate-300"
              />
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] rotate-3 hover:rotate-0 transition-all duration-700">
              <FaMicroscope className="text-[10rem] xl:text-[12rem] text-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. THE PROCESS BAR --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 md:border-r border-slate-100 last:border-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A] text-sm sm:text-base"><FaSearch /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase">1. Search</h4><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">Pick your test</p></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 md:border-r border-slate-100 last:border-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A] text-sm sm:text-base"><FaClock /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase">2. Book</h4><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">Select slot</p></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 md:border-r border-slate-100 last:border-none mt-2 md:mt-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A] text-sm sm:text-base"><FaVials /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase">3. Sample</h4><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">Home pickup</p></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 last:border-none mt-2 md:mt-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-[#08B36A] text-sm sm:text-base"><FaFileAlt /></div>
            <div><h4 className="font-black text-[10px] sm:text-xs uppercase">4. Reports</h4><p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">Within 24h</p></div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-12 sm:mt-20 space-y-16 sm:space-y-24">

        {/* --- 3. CATEGORY NAV --- */}
        <section>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Browse by Category</h2>
            <button onClick={handleSeeAll} className="text-[#08B36A] font-black text-[10px] sm:text-xs uppercase hover:underline">See All</button>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {["All", "Women", "Radiology", "Heart", "Diabetes", "Full Body"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-4 rounded-full font-black text-[10px] sm:text-xs transition-all border-2 whitespace-nowrap
                  ${activeCategory === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-[#08B36A]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* --- 4. THE "WOMEN'S BOUTIQUE" --- */}
        <section className="relative rounded-2xl sm:rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#08B36A] to-[#044D2D] p-6 sm:p-16 text-white group">
          <div className="relative z-10 grid lg:grid-cols-2 gap-10 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <span className="bg-white/20 text-white px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Specialized Care</span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-[1.1]">The Complete <br className="hidden sm:block" />Women's Healthcare <br className="hidden sm:block" /> Hub.</h2>
              <p className="text-emerald-100 text-sm sm:text-lg opacity-80 max-w-md font-medium">Expertly curated packages for PCOS, Pregnancy, Thyroid, and Senior Female wellness.</p>
              <button
                onClick={() => router.push("/booklabtest/womenstestonly")}
                className="bg-white text-emerald-900 px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl w-full sm:w-auto"
              >
                View Women-Only Tests
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10">
                <FaPlus className="text-emerald-300 text-2xl sm:text-3xl mb-3 sm:mb-4" />
                <h4 className="font-black text-base sm:text-lg mb-2">Fertility Panel</h4>
                <p className="text-[10px] sm:text-xs text-emerald-100 font-medium leading-relaxed">10 Parameters covering FSH, LH, and more hormonal markers.</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 sm:mt-8">
                <FaFemale className="text-emerald-300 text-2xl sm:text-3xl mb-3 sm:mb-4" />
                <h4 className="font-black text-base sm:text-lg mb-2">PCOS Screening</h4>
                <p className="text-[10px] sm:text-xs text-emerald-100 font-medium leading-relaxed">Early hormonal detection from top NABL certified labs.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-400/10 rounded-full blur-[80px] sm:blur-[100px] -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
        </section>

        {/* --- 5. MAIN PRODUCT GRID --- */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase leading-none">Popular Lab Tests</h2>
              <p className="text-[#08B36A] font-bold text-[10px] sm:text-xs mt-2 uppercase tracking-widest">Verified by NABL Labs</p>
            </div>
            <button onClick={handleSeeAll} className="text-slate-400 font-black text-[10px] sm:text-xs uppercase hover:text-[#08B36A] flex items-center gap-2">Explore Full Inventory <FaArrowRight /></button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredPackages.slice(0, 4).map((test, index) => {
              const display = getDisplayData(test, index);
              return (
                <div onClick={() => router.push(`/booklabtest/testdetails/${display.id}`)} key={display.id} className="group cursor-pointer bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-[#08B36A]/10 transition-all duration-500 overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <img src={display.image} alt={display.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {display.isTrending && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">Trending</div>
                    )}
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/95 backdrop-blur px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black flex items-center gap-1 shadow-md">
                      <FaStar className="text-yellow-400" /> {display.rating}
                    </div>
                  </div>

                  <div className="p-3 sm:p-6 flex flex-col flex-1">
                    <span className="text-[7px] sm:text-[9px] font-black text-[#08B36A] uppercase tracking-tighter mb-1">{display.vendor}</span>
                    <h3 className="text-xs sm:text-base font-black text-slate-800 line-clamp-2 leading-tight mb-2 sm:mb-4 h-8 sm:h-10">
                      {display.name}
                    </h3>

                    <div className="text-[8px] sm:text-[10px] text-slate-400 font-bold mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
                      <FaCheckCircle className="text-[#08B36A]" /> {display.tests}
                    </div>

                    <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-50 flex flex-col gap-2 sm:gap-3">
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-xl font-black text-slate-900">{display.discountPrice}</span>
                        <span className="text-[8px] sm:text-[10px] text-slate-300 line-through font-bold">{display.price}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPkg(test) || setIsModalOpen(true);
                        }}
                        className="w-full bg-slate-900 text-white py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#08B36A] transition-all active:scale-95"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {loading && (
             <div className="flex justify-center py-12 sm:py-20">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-[#08B36A]"></div>
             </div>
          )}
        </section>

        {/* --- 6. TRUST FOOTER --- */}
        <section className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 p-8 sm:p-20 text-center space-y-6 sm:space-y-8">
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 max-w-2xl mx-auto leading-tight">Accurate Reports. <br /><span className="text-[#08B36A]">Better Decisions.</span></h3>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-xs sm:text-lg px-2">Don't settle for less when it comes to your health. We partner with the top 5% of labs in India to bring you quality diagnostics.</p>
          <button
            onClick={handleSeeAll}
            className="bg-[#08B36A] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-500/20 w-full sm:w-auto"
          >
            View All Available Health Tests
          </button>
        </section>

      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default BookYourDiseaseTest;