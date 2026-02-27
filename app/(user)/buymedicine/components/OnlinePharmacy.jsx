import React, { useState, useMemo, useRef } from "react";
import { 
  FaFlask, FaFilter, FaSearch, FaTruck, 
  FaPrescription, FaRefill, FaArrowRight, 
  FaClock, FaUpload, FaCheckCircle, FaFileMedical, FaTimes 
} from "react-icons/fa";

const INITIAL_MEDICINES = [
  {
    id: 1,
    name: "Invokana 100mg Tablet",
    vendor: "Johnson & Johnson Ltd",
    actualPrice: 545,
    discountPrice: 463,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Metformin 500mg ER",
    vendor: "Sun Pharma Industries",
    actualPrice: 120,
    discountPrice: 98,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Atorvastatin 20mg",
    vendor: "Pfizer Ltd",
    actualPrice: 850,
    discountPrice: 720,
    image: "https://images.unsplash.com/photo-1550572017-ed20015948f4?auto=format&fit=crop&w=400&q=80",
  },
];

function OnlinePharmacy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("low-to-high");
  
  // --- UPLOAD LOGIC STATES ---
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Filter and Sort Logic
  const filteredMedicines = useMemo(() => {
    let result = INITIAL_MEDICINES.filter((med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortBy === "low-to-high") result.sort((a, b) => a.discountPrice - b.discountPrice);
    else if (sortBy === "high-to-low") result.sort((a, b) => b.discountPrice - a.discountPrice);
    return result;
  }, [searchTerm, sortBy]);

  // --- FILE HANDLERS ---
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      
      // Optional: Simulate a real upload progress
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
      }, 1500);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation(); // prevent re-triggering the click
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HIDDEN FILE INPUT */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden" 
        />

        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900">
            Online Pharmacy<span className="text-emerald-500">!</span>
          </h1>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* TOP ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
            <p className="text-slate-500 text-sm font-semibold">Need Medicines on regular basis?</p>
            <button className="w-full py-3 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
              BOOK A REFILL
            </button>
          </div>

          {/* DYNAMIC UPLOAD CARD */}
          <div className={`p-6 rounded-2xl shadow-lg border transition-all duration-500 text-center space-y-4 ${
            uploadSuccess ? "bg-emerald-600 border-emerald-700" : "bg-emerald-500 border-emerald-400"
          }`}>
            <p className="text-white/90 text-sm font-semibold">
              {selectedFile ? "Prescription Selected" : "Have a prescription?"}
            </p>
            
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-md flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {isUploading ? (
                <>
                   <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                   <span>UPLOADING...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <FaCheckCircle className="text-emerald-500" />
                  <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                  <FaTimes onClick={removeFile} className="ml-2 hover:text-red-500 cursor-pointer" />
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>UPLOAD PRESCRIPTION</span>
                </>
              )}
            </button>
            {uploadSuccess && <p className="text-white text-[10px] font-bold uppercase tracking-widest">Ready to Order</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
            <p className="text-slate-500 text-sm font-semibold">Don't have a prescription?</p>
            <button className="w-full py-3 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
              GET STARTED
            </button>
          </div>
        </div>

        {/* BOTTOM MAIN CONTENT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: SIDEBAR */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
            <div className="border-l-4 border-emerald-500 pl-6 space-y-4">
              <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Get Deliver Urgently</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-3">
                Delivery Open 24/7 <FaFlask className="text-emerald-500 text-3xl animate-bounce" />
              </h2>
              <p className="text-slate-800 font-bold text-lg md:text-xl leading-snug">
                Get Medicines Delivered in <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">02 Hours</span>
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-emerald-700 font-bold text-sm uppercase tracking-wide">Find your medicines..</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="find best Medicine"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-slate-600 font-medium">
                <span className="text-emerald-600 font-black">{filteredMedicines.length} Medicines</span> Found
              </p>
              <div className="flex items-center gap-2">
                <FaFilter className="text-emerald-500 text-sm" />
                <select 
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredMedicines.map((med) => (
                <div key={med.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden">
                      <img src={med.image} alt={med.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-800">{med.name}</h3>
                        <p className="text-sm text-slate-400 font-medium">{med.vendor}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] text-emerald-600 font-black uppercase">Our Price</p>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900">₹{med.discountPrice}</span>
                            <span className="text-sm text-slate-400 line-through">₹{med.actualPrice}</span>
                          </div>
                        </div>
                        
                        <button className="bg-emerald-600 hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OnlinePharmacy;