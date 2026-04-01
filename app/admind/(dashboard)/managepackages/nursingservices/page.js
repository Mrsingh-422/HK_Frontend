'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaUserNurse, 
  FaArrowLeft, 
  FaHome, 
  FaClock, 
  FaCheckCircle, 
  FaTrashAlt, 
  FaEdit, 
  FaHeartbeat, 
  FaMedkit,
  FaStethoscope,
  FaFilePrescription
} from 'react-icons/fa';

export default function NursingServicesPackages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Demo Data for Nursing Services
  const [packages, setPackages] = useState([
    { 
        id: 1, 
        name: "Critical ICU Support", 
        agency: "LifeCare Nursing", 
        image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=400&auto=format&fit=crop",
        rate: "₹2,500/day", 
        status: "Active", 
        staff: "GNM / B.Sc Nursing", 
        shift: "12 Hours", 
        detail: "Ventilator support, Tracheostomy care, continuous vitals monitoring, and emergency response." 
    },
    { 
        id: 2, 
        name: "Basic Wound Dressing", 
        agency: "HealthFirst Agency", 
        image: "https://images.unsplash.com/photo-1631815541542-e5c8e3126f54?q=80&w=400&auto=format&fit=crop",
        rate: "₹500/visit", 
        status: "Active", 
        staff: "Certified ANM", 
        shift: "Single Visit", 
        detail: "Sterile dressing for post-operative wounds, suture removal, and diabetic foot care." 
    },
    { 
        id: 3, 
        name: "Geriatric Elder Care", 
        agency: "Angel Home Care", 
        image: "https://images.unsplash.com/photo-1581578731522-745a05ad9ad5?q=80&w=400&auto=format&fit=crop",
        rate: "₹1,200/day", 
        status: "Active", 
        staff: "Patient Care Assistant", 
        shift: "8 Hours", 
        detail: "Assistance with daily living, medication management, mobilization, and companionship." 
    },
  ]);

  const filteredPackages = useMemo(() => {
    return packages.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.agency.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, packages]);

  const handleDelete = (id) => {
    if (window.confirm("Remove this nursing service from the public directory?")) {
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
                <FaUserNurse className="text-[#08B36A] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Nursing Services</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 text-center md:text-left">Home-Care Package Definitions</p>
            </div>
          </div>
          <button onClick={() => window.history.back()} className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 uppercase tracking-widest transition-all active:scale-95">
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
                placeholder="Search service or agency..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-medium" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="overflow-x-auto px-4">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-2">Sr.No</th>
                  <th className="px-6 py-2">Service Image</th>
                  <th className="px-6 py-2">Service Type</th>
                  <th className="px-6 py-2">Vendor (Agency)</th>
                  <th className="px-6 py-2">Base Rate</th>
                  <th className="px-6 py-2 text-center">Status</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {filteredPackages.map((pkg, index) => (
                  <tr key={pkg.id} className="group hover:translate-x-1 transition-all cursor-pointer" onClick={() => handleOpenModal(pkg)}>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 rounded-l-2xl text-xs font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40">
                        <img src={pkg.image} alt={pkg.name} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" />
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 text-sm font-black text-slate-800 tracking-tight uppercase">{pkg.name}</td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                           <FaHome className="text-slate-300 group-hover:text-[#08B36A] transition-colors" size={14}/>
                           {pkg.agency}
                        </div>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 text-sm font-black text-[#08B36A]">{pkg.rate}</td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 text-center">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-green-50 text-green-600 border border-green-100">{pkg.status}</span>
                    </td>
                    <td className="px-6 py-5 bg-slate-50/60 group-hover:bg-emerald-50/40 rounded-r-2xl text-right space-x-3">
                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm"><FaEdit size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(pkg.id); }} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"><FaTrashAlt size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- SERVICE PACKAGE MODAL --- */}
      {isModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            
            <div className="h-48 relative overflow-hidden">
                <img src={selectedPkg.image} alt={selectedPkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                    <FaTimes size={18} />
                </button>
                <div className="absolute bottom-6 left-10">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{selectedPkg.name}</h2>
                    <p className="text-emerald-300 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
                        <FaHome size={10}/> {selectedPkg.agency}
                    </p>
                </div>
            </div>

            <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <ModalInfo icon={<FaHeartbeat/>} label="Visit Cost" val={selectedPkg.rate} color="text-[#08B36A]" />
                    <ModalInfo icon={<FaClock/>} label="Shift Duration" val={selectedPkg.shift} />
                </div>

                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><FaStethoscope size={20}/></div>
                    <div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">Staff Qualification</p>
                        <p className="text-sm font-black text-slate-800 leading-none">{selectedPkg.staff}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <FaMedkit size={12} className="text-[#08B36A]"/> Service Scope
                    </p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        "{selectedPkg.detail}"
                    </p>
                </div>

                <div className="flex items-center gap-3 justify-center py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <FaCheckCircle className="text-[#08B36A]" size={14} />
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                        Status: Licensed & {selectedPkg.status}
                    </span>
                </div>
            </div>

            <div className="px-10 pb-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Dismiss Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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