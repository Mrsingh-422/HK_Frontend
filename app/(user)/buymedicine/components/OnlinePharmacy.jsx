import React, { useState, useMemo, useRef } from "react";
import {
  FaFlask, FaFilter, FaSearch, FaTruck,
  FaPrescription, FaRefill, FaArrowRight,
  FaClock, FaUpload, FaCheckCircle, FaFileMedical, FaTimes
} from "react-icons/fa";

// 1. EXPANDED DATA OBJECT
const INITIAL_MEDICINES = [
  { id: 1, name: "Invokana 100mg Tablet", vendor: "Johnson & Johnson Ltd", actualPrice: 545, discountPrice: 463, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Metformin 500mg ER", vendor: "Sun Pharma Industries", actualPrice: 120, discountPrice: 98, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Atorvastatin 20mg", vendor: "Pfizer Ltd", actualPrice: 850, discountPrice: 720, image: "https://images.unsplash.com/photo-1550572017-ed20015948f4?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Combiflam Plus", vendor: "Sanofi India", actualPrice: 45, discountPrice: 40, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Telma 40mg Tablet", vendor: "Glenmark Pharma", actualPrice: 210, discountPrice: 185, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "Pan 40mg Tablet", vendor: "Alkem Laboratories", actualPrice: 150, discountPrice: 132, image: "https://images.unsplash.com/photo-1550572017-ed20015948f4?auto=format&fit=crop&w=400&q=80" },
  { id: 7, name: "Dolo 650mg", vendor: "Micro Labs Ltd", actualPrice: 30, discountPrice: 25, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80" },
  { id: 8, name: "Limcee Vitamin C", vendor: "Abbott India", actualPrice: 25, discountPrice: 20, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80" },
];

function OnlinePharmacy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("low-to-high");
  const [showAll, setShowAll] = useState(false);

  // --- UPLOAD LOGIC STATES ---
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 2. FILTER & SORT LOGIC
  const filteredMedicines = useMemo(() => {
    let result = INITIAL_MEDICINES.filter((med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortBy === "low-to-high") result.sort((a, b) => a.discountPrice - b.discountPrice);
    else if (sortBy === "high-to-low") result.sort((a, b) => b.discountPrice - a.discountPrice);
    return result;
  }, [searchTerm, sortBy]);

  // 3. LIMIT LOGIC
  const visibleMedicines = showAll ? filteredMedicines : filteredMedicines.slice(0, 6);
  const hasMore = filteredMedicines.length > 6;

  // --- FILE HANDLERS ---
  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
      }, 1500);
    }
  };
  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />

        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900">
            Online Pharmacy<span className="text-[#08B36A]">!</span>
          </h1>
          <div className="w-20 h-1.5 bg-[#08B36A] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* TOP ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
            <p className="text-slate-500 text-sm font-semibold">Need Medicines on regular basis?</p>
            <button className="w-full py-3 border-2 border-[#08B36A] text-[#08B36A] font-bold rounded-xl hover:bg-[#08B36A] hover:text-white transition-all uppercase tracking-widest text-xs">
              BOOK A REFILL
            </button>
          </div>

          {/* DYNAMIC UPLOAD CARD */}
          <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-500 text-center space-y-4 ${uploadSuccess ? "bg-[#08B36A] border-emerald-700" : "bg-[#08B36A] border-emerald-400"
            }`}>
            <p className="text-white/90 text-sm font-semibold">
              {selectedFile ? "Prescription Selected" : "Have a prescription?"}
            </p>
            <button onClick={handleUploadClick} disabled={isUploading} className="w-full py-3 bg-white text-[#08B36A] font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden text-xs">
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-[#08B36A] border-t-transparent rounded-full"></div>
              ) : uploadSuccess ? (
                <><FaCheckCircle /> <span className="truncate max-w-[120px]">{selectedFile.name}</span> <FaTimes onClick={removeFile} className="ml-2 hover:text-red-500" /></>
              ) : (
                <><FaUpload /> UPLOAD PRESCRIPTION</>
              )}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
            <p className="text-slate-500 text-sm font-semibold">Don't have a prescription?</p>
            <button className="w-full py-3 border-2 border-[#08B36A] text-[#08B36A] font-bold rounded-xl hover:bg-[#08B36A] hover:text-white transition-all uppercase tracking-widest text-xs">
              GET STARTED
            </button>
          </div>
        </div>

        {/* BOTTOM CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-6">

          {/* LEFT: SIDEBAR */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-35 h-fit">
            <div className="border-l-4 border-[#08B36A] pl-6 space-y-4">
              <span className="text-[#08B36A] font-black uppercase tracking-widest text-[10px]">Get Deliver Urgently</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Delivery Open 24/7 <FaFlask className="inline text-[#08B36A] text-3xl animate-bounce" />
              </h2>
              <p className="text-slate-800 font-bold text-lg leading-snug">
                Get Medicines Delivered in <span className="text-[#08B36A] underline underline-offset-8 decoration-emerald-200">02 Hours</span>
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[#08B36A] font-black text-xs uppercase tracking-widest">Find your medicines..</label>
              <div className="relative group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowAll(false); }}
                  placeholder="find best Medicine"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-slate-600 font-bold text-sm">
                Found <span className="text-[#08B36A] font-black">{filteredMedicines.length} Medicines</span>
              </p>
              <div className="flex items-center gap-2">
                <FaFilter className="text-[#08B36A] text-xs" />
                <select className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer uppercase tracking-widest" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {visibleMedicines.length > 0 ? (
                <>
                  {visibleMedicines.map((med) => (
                    <div key={med.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={med.image} alt={med.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-800 group-hover:text-[#08B36A] transition-colors">{med.name}</h3>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">{med.vendor}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-[#08B36A] font-black uppercase">Our Price</p>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-slate-900">₹{med.discountPrice}</span>
                                <span className="text-sm text-slate-300 line-through font-bold">₹{med.actualPrice}</span>
                              </div>
                            </div>
                            <button className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">
                              Order Now
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
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center gap-2 bg-white text-[#08B36A] border-2 border-[#08B36A] font-black px-10 py-4 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-lg active:scale-95 group uppercase tracking-widest text-xs"
                      >
                        {showAll ? "Show Less" : "See All Medicines"}
                        <FaArrowRight className={`group-hover:translate-x-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
                      </button>
                      {!showAll && (
                        <p className="text-slate-400 text-[10px] mt-4 font-black uppercase tracking-widest">
                          Showing 6 of {filteredMedicines.length} available items
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white p-20 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                  <FaTimes className="mx-auto text-4xl text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No results found</h3>
                  <button onClick={() => setSearchTerm("")} className="mt-4 text-[#08B36A] font-bold underline text-sm">Clear Search</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnlinePharmacy;