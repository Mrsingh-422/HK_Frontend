'use client'
import React, { useState, useEffect } from 'react'
import {
  FaTrashAlt, 
  FaPlus, 
  FaStethoscope, 
  FaLink, 
  FaBoxOpen,
  FaSearch,
  FaSyncAlt,
  FaListUl,
  FaCheckCircle,
  FaClock,
  FaCalendarDay,
  FaLayerGroup,
  FaArrowLeft
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import NurseAPI from '@/app/services/NurseAPI'

export default function NurseServiceListingPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);
  const [showForm, setShowForm] = useState(false); // Toggle state for the form
  
  // Data Lists from API
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [masterConsumables, setMasterConsumables] = useState([]);
  const [myServices, setMyServices] = useState([]); 

  // Form State
  const [category, setCategory] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [careSubCategoryId, setCareSubCategoryId] = useState('');
  const [description, setDescription] = useState('');
  
  // Pricing State
  const [pricing, setPricing] = useState({
    oneDay: { base: 0, discount: 0, final: 0 },
    multiDay: { base: 0, discount: 0, final: 0 },
    hourly: { base: 0, discount: 0, final: 0 }
  });

  // Consumables Linking State
  const [selectedMasterItem, setSelectedMasterItem] = useState('');
  const [tempConsDisc, setTempConsDisc] = useState('');
  const [linkedConsumables, setLinkedConsumables] = useState([]);

  // 1. Load Data on Mount - Using the Approved status API
  useEffect(() => {
    const initFetch = async () => {
      try {
        setFetchingList(true);
        // This calls /provider/nurse/dash/service/list?status=Approved
        const [catRes, listRes] = await Promise.all([
          NurseAPI.getNurseCsvCategories(),
          NurseAPI.getMyServicesList('Approved') 
        ]);
        
        if (catRes.success) setCategories(catRes.data);
        if (listRes.success) setMyServices(listRes.data);
      } catch (err) {
        toast.error("Error loading initial data");
      } finally {
        setFetchingList(false);
      }
    };
    initFetch();
  }, []);

  // 2. Handle Category Change -> Fetch SubCategories
  const handleCategoryChange = async (e) => {
    const val = e.target.value;
    setCategory(val);
    setServiceTitle('');
    setSubCategories([]);
    if (!val) return;

    try {
      const res = await NurseAPI.getNurseCsvSubCategories(val);
      if (res.success) setSubCategories(res.data);
    } catch (err) {
      toast.error("Error loading services");
    }
  };

  // 3. Handle Service Change -> Fetch Details (Prices & Consumables)
  const handleServiceChange = async (e) => {
    const val = e.target.value;
    setServiceTitle(val);
    if (!val) return;

    setLoading(true);
    try {
      const res = await NurseAPI.getNurseCsvServiceDetails(category, val);
      if (res.success && res.data) {
        const d = res.data;
        setCareSubCategoryId(d._id);
        setDescription(d.description || '');
        
        setPricing({
          oneDay: { base: d.oneDayOneTimePrice || 0, discount: 0, final: d.oneDayOneTimePrice || 0 },
          multiDay: { base: d.forMultipleDaysPrice || 0, discount: 0, final: d.forMultipleDaysPrice || 0 },
          hourly: { base: d.pricePerHour || 0, discount: 0, final: d.pricePerHour || 0 }
        });

        setMasterConsumables(d.resolvedConsumables || []);
      }
    } catch (err) {
      toast.error("Error loading service details");
    } finally {
      setLoading(false);
    }
  };

  // 4. Pricing Calculation Logic
  const updatePrice = (type, field, value) => {
    setPricing(prev => {
      const updated = { ...prev[type], [field]: value };
      if (field === 'discount' || field === 'base') {
        const b = parseFloat(updated.base) || 0;
        const d = parseFloat(updated.discount) || 0;
        updated.final = Math.round(b - (b * (d / 100)));
      }
      return { ...prev, [type]: updated };
    });
  };

  // 5. Link Consumable Row
  const linkConsumable = () => {
    if (!selectedMasterItem) return toast.error("Select an item first");
    const item = masterConsumables.find(m => m._id === selectedMasterItem);
    if (!item) return;

    const disc = parseFloat(tempConsDisc) || 0;
    const final = Math.round(item.mrp - (item.mrp * (disc / 100)));

    const newRow = {
      masterItemId: item._id,
      name: item.itemName,
      mrp: item.mrp,
      discountPercentage: disc,
      final: final
    };

    setLinkedConsumables([...linkedConsumables, newRow]);
    setSelectedMasterItem('');
    setTempConsDisc('');
  };

  const removeConsumable = (id) => {
    setLinkedConsumables(linkedConsumables.filter(c => c.masterItemId !== id));
  };

  // 6. Submit Logic
  const handleSubmit = async () => {
    if (!careSubCategoryId) return toast.error("Please select a service first");
    
    setLoading(true);
    const payload = {
        careSubCategoryId: careSubCategoryId,
        careCategoryId: category,
        title: serviceTitle,
        description: description,
        pricing: {
            oneDay: { base: pricing.oneDay.base, discount: pricing.oneDay.discount },
            multipleDays: { base: pricing.multiDay.base, discount: pricing.multiDay.discount },
            hourly: { base: pricing.hourly.base, discount: pricing.hourly.discount }
        },
        consumablesUsed: linkedConsumables.map(c => ({
            masterItemId: c.masterItemId,
            discountPercentage: c.discountPercentage
        })),
        status: 'Approved'
    };

    try {
      const res = await NurseAPI.manageNurseService(payload);
      if (res.success) {
        toast.success("Service listed successfully!");
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-20 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* --- PAGE HEADER --- */}
      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-[900] text-[#1e3a8a] tracking-tighter flex items-center gap-4">
          <div className="p-4 bg-[#08B36A] text-white rounded-[1.5rem] shadow-xl">
            <FaStethoscope size={28}/>
          </div>
          Service Management
        </h1>

        {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className="bg-[#08B36A] hover:bg-[#069e5d] text-white px-8 py-4 rounded-[1.2rem] font-black text-sm shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <FaPlus /> Add New Service
            </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* --- ADD NEW SERVICE FORM (Hidden by default) --- */}
        {showForm ? (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <button 
                    onClick={() => setShowForm(false)}
                    className="mb-6 flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-[#08B36A] transition-colors"
                >
                    <FaArrowLeft /> Back to My Services
                </button>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10 space-y-8 relative overflow-hidden">
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <FaPlus className="text-[#08B36A]"/> Add New Service
                    </h2>
                    
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                            <FaSyncAlt className="animate-spin text-[#08B36A]" size={30} />
                        </div>
                    )}
                    
                    {/* 1. SELECTION ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="label-style">Category</label>
                            <select className="input-style" value={category} onChange={handleCategoryChange}>
                                <option value="">-- Select Category --</option>
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label-style">Service Title</label>
                            <select 
                                className="input-style" 
                                value={serviceTitle} 
                                onChange={handleServiceChange}
                                disabled={!subCategories.length}
                            >
                                <option value="">-- Select Service --</option>
                                {subCategories.map((sub, i) => (
                                    <option key={i} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. DESCRIPTION */}
                    <div>
                        <label className="label-style">Description (Editable)</label>
                        <textarea 
                            rows={3}
                            placeholder="Description..."
                            className="input-style min-h-[100px] py-4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* 3. PRICING CONFIGURATION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <span className="text-lg">💰</span>
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-tight">Pricing Configuration</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* One Day Price */}
                            <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm">
                                <h4 className="text-[10px] font-black text-[#08B36A] uppercase mb-4 tracking-widest">One Day Price</h4>
                                <div className="space-y-2">
                                    <input type="number" readOnly value={pricing.oneDay.base} className="w-full py-2 px-4 rounded-lg bg-gray-50 border border-gray-100 text-center font-bold text-xs outline-none" />
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mt-1 tracking-wider">Discount</label>
                                    <input type="number" placeholder="Disc %" value={pricing.oneDay.discount} onChange={(e) => updatePrice('oneDay', 'discount', e.target.value)} className="w-full py-3 px-4 rounded-lg border border-gray-200 text-center font-bold focus:border-[#08B36A] outline-none" />
                                </div>
                                <div className="mt-3 text-[11px] font-black text-gray-400">Final: <span className="text-[#08B36A]">₹{pricing.oneDay.final}</span></div>
                            </div>

                            {/* Multi Day Price */}
                            <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm">
                                <h4 className="text-[10px] font-black text-[#08B36A] uppercase mb-4 tracking-widest">Multi Day Price</h4>
                                <div className="space-y-2">
                                    <input type="number" readOnly value={pricing.multiDay.base} className="w-full py-2 px-4 rounded-lg bg-gray-50 border border-gray-100 text-center font-bold text-xs outline-none" />
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mt-1 tracking-wider">Discount</label>
                                    <input type="number" placeholder="Disc %" value={pricing.multiDay.discount} onChange={(e) => updatePrice('multiDay', 'discount', e.target.value)} className="w-full py-3 px-4 rounded-lg border border-gray-200 text-center font-bold focus:border-[#08B36A] outline-none" />
                                </div>
                                <div className="mt-3 text-[11px] font-black text-gray-400">Final: <span className="text-[#08B36A]">₹{pricing.multiDay.final}</span></div>
                            </div>

                            {/* Hourly Price */}
                            <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm">
                                <h4 className="text-[10px] font-black text-[#08B36A] uppercase mb-4 tracking-widest">Hourly Price</h4>
                                <div className="space-y-2">
                                    <input type="number" readOnly value={pricing.hourly.base} className="w-full py-2 px-4 rounded-lg bg-gray-50 border border-gray-100 text-center font-bold text-xs outline-none" />
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1 block mt-1 tracking-wider">Discount</label>
                                    <input type="number" placeholder="Disc %" value={pricing.hourly.discount} onChange={(e) => updatePrice('hourly', 'discount', e.target.value)} className="w-full py-3 px-4 rounded-lg border border-gray-200 text-center font-bold focus:border-[#08B36A] outline-none" />
                                </div>
                                <div className="mt-3 text-[11px] font-black text-gray-400">Final: <span className="text-[#08B36A]">₹{pricing.hourly.final}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* 4. CONSUMABLES */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <span className="text-lg">📦</span>
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-tight">Consumables Used</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-[4] relative">
                                <select 
                                    className="w-full input-style h-[54px] pl-10 appearance-none"
                                    value={selectedMasterItem}
                                    onChange={(e) => setSelectedMasterItem(e.target.value)}
                                >
                                    <option value="">-- Select Consumable --</option>
                                    {masterConsumables.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.itemName} ({item.size}) - ₹{item.mrp}
                                        </option>
                                    ))}
                                </select>
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14}/>
                            </div>
                            <div className="flex-1 min-w-[100px]">
                                <input 
                                    type="number" placeholder="Disc %" 
                                    className="w-full input-style h-[54px] text-center"
                                    value={tempConsDisc}
                                    onChange={(e) => setTempConsDisc(e.target.value)}
                                />
                            </div>
                            <button onClick={linkConsumable} className="w-full md:w-32 bg-[#08B36A] text-white rounded-xl font-black text-sm h-[54px]">Link</button>
                        </div>

                        {/* TABLE */}
                        <div className="bg-[#f1f5f9]/50 rounded-xl overflow-hidden mt-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white">
                                        <th className="px-6 py-4">ITEM</th>
                                        <th className="px-6 py-4 text-center">MRP</th>
                                        <th className="px-6 py-4 text-center">DISCOUNT</th>
                                        <th className="px-6 py-4 text-right">VENDOR FINAL</th>
                                        <th className="px-6 py-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white">
                                    {linkedConsumables.map((item, idx) => (
                                        <tr key={idx} className="text-[12px] font-bold text-gray-700">
                                            <td className="px-6 py-4">{item.name}</td>
                                            <td className="px-6 py-4 text-center">₹{item.mrp}</td>
                                            <td className="px-6 py-4 text-center text-orange-500">{item.discountPercentage}%</td>
                                            <td className="px-6 py-4 text-right font-black text-[#08B36A]">₹{item.final}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => removeConsumable(item.masterItemId)} className="text-gray-300 hover:text-red-500">
                                                    <FaTrashAlt size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!linkedConsumables.length && (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-[10px] text-gray-300 font-black uppercase tracking-widest">No consumables linked</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-5 bg-[#08B36A] text-white rounded-xl font-black text-sm shadow-xl uppercase tracking-wider transition-all"
                        >
                            {loading ? "Processing..." : "List Service Now (Approved)"}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            /* --- DEFAULT VIEW: MY LISTED SERVICES (Fetched via ?status=Approved) --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <FaListUl className="text-[#08B36A]" size={18}/>
                    </div>
                    My Listed Services
                </h2>

                {fetchingList ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                        <FaSyncAlt className="animate-spin text-[#08B36A] mb-4" size={24}/>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Fetching your services...</p>
                    </div>
                ) : myServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myServices.map((svc) => (
                            <div key={svc._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-gray-800 text-lg group-hover:text-[#08B36A] transition-colors">{svc.title}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                            <FaLayerGroup /> {svc.careCategoryId}
                                        </p>
                                    </div>
                                    <span className="bg-green-50 text-[#08B36A] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                        <FaCheckCircle /> Listed
                                    </span>
                                </div>
                                
                                <p className="text-gray-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                                    {svc.description}
                                </p>

                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-50">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Hourly</p>
                                        <p className="text-xs font-black text-gray-800">₹{svc.pricing?.hourly?.final || svc.pricing?.hourly?.base || 0}</p>
                                    </div>
                                    <div className="text-center border-x border-gray-50">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">One Day</p>
                                        <p className="text-xs font-black text-gray-800">₹{svc.pricing?.oneDay?.final || svc.pricing?.oneDay?.base || 0}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Multi Day</p>
                                        <p className="text-xs font-black text-gray-800">₹{svc.pricing?.multipleDays?.final || svc.pricing?.multipleDays?.base || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                        <FaBoxOpen className="mx-auto text-gray-200 mb-4" size={50}/>
                        <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No services listed yet</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <style jsx>{`
        .label-style { display: block; font-weight: 800; font-size: 0.8rem; color: #475569; margin-bottom: 0.5rem; }
        .input-style {
          width: 100%; padding: 0 16px; border-radius: 0.75rem; border: 1px solid #e2e8f0; font-weight: 600;
          color: #1e293b; font-size: 0.9rem; outline: none; background-color: white; height: 50px; transition: border-color 0.2s;
        }
        .input-style:focus { border-color: #08B36A; }
        .input-style:disabled { background-color: #f8fafc; cursor: not-allowed; }
      `}</style>
    </div>
  )
}