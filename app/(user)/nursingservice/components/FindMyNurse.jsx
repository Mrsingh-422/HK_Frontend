import React, { useState, useMemo } from "react";
import {
  FaSearch, FaFilter, FaStar, FaUserNurse,
  FaTimes, FaArrowRight, FaMapMarkerAlt, FaClock
} from "react-icons/fa";

import { NURSES_DATA } from "../../../constants/constants";
import { useRouter } from "next/navigation";
import NurseDetailsModal from "./otherComponents/NurseDetailsModel";

function FindMyNurse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const router = useRouter()


  // MODAL STATES
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNurseClick = (nur) => {
    setSelectedNurse(nur);
    setIsModalOpen(true);
  };

  // SORTING & FILTERING
  const processedServices = useMemo(() => {
    let filtered = NURSES_DATA.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "price-low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") return [...filtered].sort((a, b) => b.rating - a.rating);

    return filtered;
  }, [searchTerm, sortBy]);

  // LIMIT LOGIC: Show only 6
  const visibleServices = processedServices.slice(0, 6);
  const hasMore = processedServices.length > 6;

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <NurseDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nurse={selectedNurse}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT SECTION */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35 h-fit">
          <div className="border-l-4 border-[#08B36A] pl-6 space-y-4">
            <h4 className="text-[#08B36A] font-black uppercase tracking-widest text-xs md:text-sm">
              Book Your Personal Home Services
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Find My Nurse! 👩‍⚕️
            </h1>
          </div>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
            Reliable, certified, and compassionate nursing care in the comfort of your home.
            Select from our verified specialty packages.
          </p>

          <div className="space-y-4 max-w-md">
            <label className="text-[#08B36A] font-black text-sm uppercase tracking-wide">Find Your home service..</label>
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="find my home care"
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm text-lg"
              />
              {searchTerm && <FaTimes className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => setSearchTerm("")} />}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
            <p className="text-slate-700 font-bold">
              Found <span className="text-[#08B36A]">{processedServices.length} Services</span>
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FaFilter className="text-[#08B36A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border-none text-sm font-bold text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-[#08B36A] cursor-pointer"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {visibleServices.length > 0 ? (
              <>
                {visibleServices.map((service) => (
                  <div key={service.id} className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row gap-6 lg:gap-8">
                      <div className="w-full sm:w-44 h-44 flex-shrink-0 relative">
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover rounded-3xl" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h3 className="text-2xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{service.name}</h3>
                              <p className="text-[#08B36A] font-bold text-sm uppercase">Specility: {service.speciality}</p>
                            </div>
                            <div className="flex bg-yellow-50 px-2 py-1 rounded-lg">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={`${i < service.rating ? 'text-yellow-400' : 'text-slate-200'} text-sm`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{service.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Booking Fee</p>
                            <p className="text-2xl font-black text-slate-900">₹{service.price}</p>
                          </div>
                          <button
                            onClick={() => handleNurseClick(service)}
                            className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">
                            Hire Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* SEE ALL BUTTON */}
                {hasMore && (
                  <div className="pt-6 text-center">
                    <button
                      onClick={() => router.push("/nursingservice/seeallnurses")}
                      className="inline-flex items-center gap-2 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group"
                    >
                      See All Services
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-slate-400 text-xs mt-3 font-medium uppercase tracking-widest">
                      Showing 6 of {processedServices.length} Results
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                <FaUserNurse className="mx-auto text-6xl text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No Services Found</h3>
                <button onClick={() => setSearchTerm("")} className="mt-4 text-[#08B36A] font-bold underline">Clear Search</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindMyNurse;