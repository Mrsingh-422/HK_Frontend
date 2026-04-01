'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaSearch, FaEye, FaTimes, FaFlask, FaArrowLeft, FaVials, 
  FaTags, FaCheckCircle, FaTrashAlt, FaEdit, FaMicroscope,
  FaClock, FaClinicMedical
} from 'react-icons/fa';

export default function LabTestPackages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Updated Data with Image URLs
  const [packages, setPackages] = useState([
    { 
        id: 1, 
        name: "Full Body Checkup - Advance", 
        lab: "Metropolis Lab", 
        image: "https://images.unsplash.com/photo-1579152276503-34e815615d0d?q=80&w=300&auto=format&fit=crop",
        price: "₹2,999", 
        status: "Active", 
        tests: "64 Tests Included (CBC, Liver, Kidney, Lipid, Sugar)", 
        turnaround: "24 Hours" 
    },
    { 
        id: 2, 
        name: "Cardiac Health Profile", 
        lab: "Dr. Lal PathLabs", 
        image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=300&auto=format&fit=crop",
        price: "₹1,500", 
        status: "Active", 
        tests: "ECG, Lipid Profile, Troponin, CBC", 
        turnaround: "12 Hours" 
    },
    { 
        id: 3, 
        name: "Women Wellness Gold", 
        lab: "City Diagnostic", 
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=300&auto=format&fit=crop",
        price: "₹3,200", 
        status: "Active", 
        tests: "Hormone Profile, Bone Density, Vit D, Sugar", 
        turnaround: "48 Hours" 
    },
    { 
        id: 4, 
        name: "Diabetes Basic", 
        lab: "Hk Wellness", 
        image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=300&auto=format&fit=crop",
        price: "₹599", 
        status: "Inactive", 
        tests: "HbA1c, Fasting Sugar, Urine Routine", 
        turnaround: "6 Hours" 
    },
  ]);

  const filteredPackages = useMemo(() => {
    return packages.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.lab.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, packages]);

  const handleDelete = (id) => {
    if (window.confirm("Remove this package from the public listing?")) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  const handleOpenModal = (pkg) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <FaFlask className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Lab Test Packages</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 text-center md:text-left">Bundle Management & Pricing</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 uppercase tracking-widest transition-all">
            <FaArrowLeft className="inline mr-2"/> Go Back
          </button>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-6 border-b border-slate-50 bg-white">
            <div className="relative max-w-md group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search package or lab..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="p-6">Sr.No</th>
                  <th className="p-6">Preview</th>
                  <th className="p-6">Package Name</th>
                  <th className="p-6">Vendor (Laboratory)</th>
                  <th className="p-6">Base Price</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPackages.map((pkg, index) => (
                  <tr key={pkg.id} className="group hover:bg-slate-50/80 cursor-pointer transition-all" onClick={() => handleOpenModal(pkg)}>
                    <td className="p-6 text-sm font-bold text-slate-400">{index + 1}</td>
                    <td className="p-6">
                        <img 
                            src={pkg.image} 
                            alt={pkg.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                        />
                    </td>
                    <td className="p-6 text-sm font-black text-slate-800 tracking-tight">{pkg.name}</td>
                    <td className="p-6 text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                           <FaClinicMedical className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={14}/>
                           {pkg.lab}
                        </div>
                    </td>
                    <td className="p-6 text-sm font-black text-[#08B36A]">{pkg.price}</td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${pkg.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-400'}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-3">
                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm">
                            <FaEdit size={14}/>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(pkg.id); }} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                            <FaTrashAlt size={14}/>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPackages.length === 0 && (
                <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                    No matching packages found
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PACKAGE DETAILS MODAL --- */}
      {isModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="h-48 relative overflow-hidden">
                <img src={selectedPkg.image} alt={selectedPkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                    <FaTimes size={18} />
                </button>
                <div className="absolute bottom-6 left-10">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedPkg.name}</h2>
                    <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mt-1">{selectedPkg.lab}</p>
                </div>
            </div>

            <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <ModalInfo icon={<FaTags/>} label="Package Price" val={selectedPkg.price} color="text-[#08B36A]" />
                    <ModalInfo icon={<FaClock/>} label="Turnaround Time" val={selectedPkg.turnaround} />
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FaVials size={12} className="text-blue-500"/> Clinical Components
                    </p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        {/* "{selectedPkg.tests}" */}
                    </p>
                </div>

                <div className="flex items-center gap-2 justify-center py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <FaCheckCircle className="text-[#08B36A]" size={14} />
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                        Listing Status: Verified & {selectedPkg.status}
                    </span>
                </div>
            </div>

            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENT ---
function ModalInfo({ icon, label, val, color = "text-slate-700" }) {
    return (
        <div className="flex gap-4">
            <div className="text-[#08B36A] mt-1 opacity-60 shrink-0">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-base font-black ${color} leading-none`}>{val}</p>
            </div>
        </div>
    )
}