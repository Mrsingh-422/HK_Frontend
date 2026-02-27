import React, { useState, useMemo } from "react";
import {
  FaFlask, FaStar, FaFilter, FaSearch, FaMicroscope,
  FaCheckCircle, FaTimes, FaInbox, FaMapMarkerAlt, FaSortAmountDown
} from "react-icons/fa";

const INITIAL_PACKAGES = [
  {
    id: 1,
    name: "Diabetes Advanced Package",
    vendor: "Nitish Diagnostic Center",
    price: "₹21,167",
    discountPrice: "₹18,500",
    priceValue: 18500, // Numeric for sorting
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    distance: 1.2, // km
    tests: "Includes 64 Parameters",
  },
  {
    id: 2,
    name: "Basic Diabetes Test",
    vendor: "Nitish Lab Services",
    price: "₹999",
    discountPrice: "₹0",
    priceValue: 0,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    rating: 3,
    distance: 5.4,
    tests: "Includes 12 Parameters",
  },
  {
    id: 3,
    name: "Full Body Checkup",
    vendor: "HealthCare Plus",
    price: "₹5,000",
    discountPrice: "₹2,999",
    priceValue: 2999,
    image: "https://images.unsplash.com/photo-1579152276503-6058d9488e9d?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 3.2,
    tests: "Includes 80 Parameters",
  },
  {
    id: 4,
    name: "Thyroid Profile Total",
    vendor: "City Diagnostics",
    price: "₹1,200",
    discountPrice: "₹799",
    priceValue: 799,
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    distance: 0.8,
    tests: "T3, T4, TSH",
  }
];

function BookYourDiseaseTest() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  // COMBINED FILTERING & SORTING LOGIC
  const processedPackages = useMemo(() => {
    // 1. Filter
    let result = INITIAL_PACKAGES.filter((pkg) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(searchLower) ||
        pkg.vendor.toLowerCase().includes(searchLower) ||
        pkg.tests.toLowerCase().includes(searchLower)
      );
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === "price-low") return a.priceValue - b.priceValue;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "nearby") return a.distance - b.distance;
      return 0; // default (recommended/no sort)
    });

    return result;
  }, [searchTerm, sortBy]);

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-emerald-100">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT SECTION */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 mb-4">
                <FaMicroscope className="mr-2" /> 100% Verified Labs
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Search Test By <span className="text-emerald-600 italic">Habits!</span>{" "}
                <FaFlask className="inline text-emerald-500 animate-bounce" />
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                Compare prices, ratings, and distance to find the most convenient diagnostic center for your needs.
              </p>
            </div>

            {/* SEARCH BOX */}
            <div className="relative group max-w-md">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Find your diagnostics
              </label>
              <div className="relative shadow-sm rounded-2xl overflow-hidden">
                <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-emerald-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Blood test, Lab name..."
                  className="w-full pl-12 pr-12 py-4 bg-white border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-8 pt-4">
              <div className="text-center sm:text-left">
                <p className="text-2xl font-black text-slate-800 tracking-tighter">4.9/5</p>
                <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">User Rating</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center sm:text-left">
                <p className="text-2xl font-black text-slate-800 tracking-tighter">2hr</p>
                <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Report Delivery</p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-7">

            {/* SORTING CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800">
                  {processedPackages.length} Results found
                </h2>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <FaSortAmountDown className="text-emerald-600 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border-none text-sm font-bold text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="nearby">Sort by: Nearest (Distance)</option>
                  <option value="rating">Sort by: Highest Rating</option>
                  <option value="price-low">Sort by: Price (Low to High)</option>
                </select>
              </div>
            </div>

            {/* PACKAGE LIST */}
            <div className="space-y-6">
              {processedPackages.length > 0 ? (
                processedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="group bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative shrink-0">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full sm:w-44 h-40 object-cover rounded-2xl"
                        />
                        <div className="absolute bottom-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center shadow-lg">
                          <FaMapMarkerAlt className="mr-1" /> {pkg.distance} km away
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-md">
                              {pkg.vendor}
                            </span>
                            <div className="flex items-center text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={`text-[10px] ${i < pkg.rating ? 'fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>

                          <h2 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors">
                            {pkg.name}
                          </h2>

                          <div className="flex flex-wrap gap-y-2 mt-3">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md mr-2 flex items-center">
                              <FaCheckCircle className="text-emerald-500 mr-1" /> {pkg.tests}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total Price</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-black text-slate-900">
                                {pkg.discountPrice === "₹0" ? "FREE" : pkg.discountPrice}
                              </p>
                              {pkg.discountPrice !== pkg.price && (
                                <span className="text-xs text-slate-400 line-through">{pkg.price}</span>
                              )}
                            </div>
                          </div>

                          <button className="bg-emerald-600 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95 text-sm sm:text-base">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* EMPTY STATE */
                <div className="bg-white rounded-3xl p-16 text-center shadow-inner border border-slate-100">
                  <FaInbox className="text-slate-200 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => { setSearchTerm(""); setSortBy("recommended"); }}
                    className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition"
                  >
                    Reset all filters
                  </button>
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