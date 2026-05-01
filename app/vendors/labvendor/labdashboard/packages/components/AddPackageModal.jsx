'use client'
import LabVendorAPI from '@/app/services/LabVendorAPI';
import React, { useState, useEffect, useMemo } from 'react'
import { 
  FaTimes, FaSpinner, FaLayerGroup, FaSearch, FaChevronDown, 
  FaClock, FaToggleOn, FaToggleOff, FaFlask, FaMapMarkerAlt, FaUserFriends, FaUtensils, FaTags, FaPlus, FaTrash, FaQuestionCircle, FaInfoCircle, FaLock
} from 'react-icons/fa'

export default function AddPackageModal({ isOpen, onClose, onSave, initialData = null, isSaving = false }) {
  const [activeTab, setActiveTab] = useState('combo');
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [masterPackages, setMasterPackages] = useState([]);
  const [standardTests, setStandardTests] = useState([]);
  
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    category: '', 
    mainCategory: 'Pathology', 
    sampleType: '', // Will handle as comma separated string for UI
    mrp: '',
    discountPercent: 0,
    reportTime: '',
    gender: 'Both',
    ageGroup: 'All',
    testType: 'Both', 
    tests: [], 
    isActive: true,
    isCustom: true,
    precaution: '', // mapped from preparations
    isFastingRequired: false,
    fastingDuration: '',
    lifestyleTags: '',
    // New fields from JSON
    tags: '',
    detailedDescription: [{ sectionTitle: '', sectionContent: '' }],
    faqs: [{ question: '', answer: '' }]
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [testsRes, masterRes] = await Promise.all([
            LabVendorAPI.getMasterList(), // FIXED: Corrected from getTests to getMasterList
            LabVendorAPI.getMasterPackages()
          ]);
          setStandardTests(testsRes.data || []);
          setMasterPackages(masterRes.data || []);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      const existingTestIds = (initialData.tests || []).map(t => typeof t === 'object' ? t._id : t);
      setFormData({ 
          ...initialData, 
          tests: existingTestIds,
          isActive: initialData.isActive ?? true,
          mrp: initialData.mrp || initialData.standardMRP || '',
          // Handle arrays from response
          sampleType: Array.isArray(initialData.sampleTypes) ? initialData.sampleTypes.join(', ') : (initialData.sampleType || ''),
          precaution: Array.isArray(initialData.preparations) ? initialData.preparations.join(', ') : (initialData.precaution || ''),
          description: initialData.shortDescription || initialData.description || '',
          reportTime: initialData.reportTime || '',
          ageGroup: initialData.ageGroup || 'All',
          testType: initialData.testType || 'Both',
          category: initialData.category || '',
          isFastingRequired: initialData.isFastingRequired || false,
          fastingDuration: initialData.fastingDuration || '',
          lifestyleTags: Array.isArray(initialData.lifestyleTags) ? initialData.lifestyleTags.join(', ') : '',
          tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
          detailedDescription: initialData.detailedDescription || [{ sectionTitle: '', sectionContent: '' }],
          faqs: initialData.faqs || [{ question: '', answer: '' }],
          isCustom: initialData.isCustom ?? true
      });
      setActiveTab('combo');
    } else if (isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      packageName: '', description: '', category: '', mainCategory: 'Pathology',
      sampleType: '', mrp: '', discountPercent: 0, 
      reportTime: '', gender: 'Both', ageGroup: 'All',
      testType: 'Both', tests: [], isActive: true, isCustom: true, precaution: '',
      isFastingRequired: false, fastingDuration: '', lifestyleTags: '',
      tags: '', detailedDescription: [{ sectionTitle: '', sectionContent: '' }],
      faqs: [{ question: '', answer: '' }]
    });
  };

  const calculatedOfferPrice = useMemo(() => {
    const m = parseFloat(formData.mrp) || 0;
    const d = parseFloat(formData.discountPercent) || 0;
    return parseFloat((m - (m * d / 100)).toFixed(2));
  }, [formData.mrp, formData.discountPercent]);

  const handleMasterSelect = (master) => {
    const masterTestIds = (master.tests || []).map(t => typeof t === 'object' ? t._id : t);
    setFormData({
      ...formData,
      packageName: master.packageName,
      description: master.shortDescription || master.description || '',
      mainCategory: master.mainCategory || 'Pathology',
      category: master.category || '',
      mrp: master.standardMRP || master.mrp || '',
      reportTime: master.reportTime || '',
      gender: master.gender || 'Both',
      ageGroup: master.ageGroup || 'All',
      tests: masterTestIds,
      sampleType: Array.isArray(master.sampleTypes) ? master.sampleTypes.join(', ') : '',
      precaution: Array.isArray(master.preparations) ? master.preparations.join(', ') : '',
      tags: Array.isArray(master.tags) ? master.tags.join(', ') : '',
      detailedDescription: master.detailedDescription || [{ sectionTitle: '', sectionContent: '' }],
      faqs: master.faqs || [{ question: '', answer: '' }],
      isFastingRequired: master.isFastingRequired || false,
      testType: master.testType || 'Both',
      isActive: true,
      isCustom: false // This disables Name and MRP
    });
    setActiveTab('combo');
  };

  // Helper functions for dynamic fields
  const addDetailedSection = () => setFormData({...formData, detailedDescription: [...formData.detailedDescription, { sectionTitle: '', sectionContent: '' }]});
  const removeDetailedSection = (index) => setFormData({...formData, detailedDescription: formData.detailedDescription.filter((_, i) => i !== index)});
  const updateDetailedSection = (index, field, value) => {
    const updated = [...formData.detailedDescription];
    updated[index][field] = value;
    setFormData({...formData, detailedDescription: updated});
  };

  const addFAQ = () => setFormData({...formData, faqs: [...formData.faqs, { question: '', answer: '' }]});
  const removeFAQ = (index) => setFormData({...formData, faqs: formData.faqs.filter((_, i) => i !== index)});
  const updateFAQ = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData({...formData, faqs: updated});
  };

  const toggleTestSelection = (testId) => {
    const updated = formData.tests.includes(testId)
        ? formData.tests.filter(id => id !== testId) 
        : [...formData.tests, testId];
    setFormData({ ...formData, tests: updated });
  };

  const handleSuggestSubmit = async () => {
    setIsSuggesting(true);
    try {
        const payload = {
            requestType: "Package",
            data: {
                ...formData,
                sampleTypes: String(formData.sampleType || '').split(',').map(s => s.trim()).filter(s => s !== ''),
                preparations: String(formData.precaution || '').split(',').map(p => p.trim()).filter(p => p !== ''),
                tags: String(formData.tags || '').split(',').map(t => t.trim()).filter(t => t !== ''),
                lifestyleTags: String(formData.lifestyleTags || '').split(',').map(tag => tag.trim()).filter(t => t !== ''),
                standardMRP: Number(formData.mrp)
            }
        };
        const res = await LabVendorAPI.submitNewMasterRequest(payload);
        if(res.success) {
            alert("Package suggestion sent to Admin!");
            onClose();
        }
    } catch (error) {
        alert(error.response?.data?.message || "Failed to submit suggestion");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (activeTab === 'suggest') {
        handleSuggestSubmit();
    } else {
        // Convert comma strings back to arrays for saving
        // FIXED: Added String() wrapper to prevent .split is not a function error
        const finalData = {
          ...formData,
          offerPrice: calculatedOfferPrice,
          sampleTypes: String(formData.sampleType || '').split(',').map(s => s.trim()).filter(s => s !== ''),
          preparations: String(formData.precaution || '').split(',').map(p => p.trim()).filter(p => p !== ''),
          tags: String(formData.tags || '').split(',').map(t => t.trim()).filter(t => t !== ''),
        };
        onSave(finalData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        <div className="bg-slate-50 border-b">
            <div className="p-6 flex justify-between items-center pb-2">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {activeTab === 'suggest' ? 'Suggest to Admin' : 'Package Configurator'}
                </h2>
                <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors"><FaTimes size={20}/></button>
            </div>
            <div className="flex px-6">
                <button onClick={() => setActiveTab('combo')} className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'combo' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>
                    <FaLayerGroup /> Configuration
                </button>
                <button onClick={() => setActiveTab('master')} className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'master' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>
                    <FaSearch /> Master Templates
                </button>
                {!initialData?._id && (
                  <button onClick={() => setActiveTab('suggest')} className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'suggest' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400'}`}>
                      Can't find package?
                  </button>
                )}
            </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'master' ? (
            <div className="space-y-4">
              {isLoadingData ? (
                <div className="py-20 flex justify-center"><FaSpinner className="animate-spin text-emerald-600" size={30}/></div>
              ) : masterPackages.length > 0 ? (
                masterPackages.map((m) => (
                  <div key={m._id} className="group flex justify-between items-center p-5 border border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer" onClick={() => handleMasterSelect(m)}>
                     <div>
                          <p className="font-bold text-slate-800">{m.packageName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.tests?.length || 0} Tests Included • ₹{m.standardMRP || m.mrp}</p>
                     </div>
                     <button type="button" className="px-5 py-2 bg-white text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all uppercase">Load</button>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No master templates available</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
              
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  Package Name {!formData.isCustom && <FaLock size={8} className="text-amber-500" />}
                </label>
                <input 
                  required 
                  readOnly={!formData.isCustom}
                  className={`w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all ${!formData.isCustom ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`} 
                  value={formData.packageName} 
                  onChange={e => setFormData({...formData, packageName: e.target.value})} 
                  placeholder="e.g. Basic Health Checkup" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Category</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.mainCategory} onChange={e => setFormData({...formData, mainCategory: e.target.value})}>
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Both">Both</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disease Category</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Full Body" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sample Types (Comma separated)</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.sampleType} onChange={e => setFormData({...formData, sampleType: e.target.value})} placeholder="Blood, Urine" />
              </div>

              <div className="col-span-2 space-y-1 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Include Master Tests</label>
                <div className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 flex justify-between items-center cursor-pointer" onClick={() => setShowTestDropdown(!showTestDropdown)}>
                    <span className={formData.tests.length ? "text-emerald-600" : "text-slate-400"}>
                        {formData.tests.length ? `${formData.tests.length} Tests Selected` : "Select tests..."}
                    </span>
                    <FaChevronDown className={`transition-transform ${showTestDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showTestDropdown && (
                    <div className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white border shadow-2xl rounded-2xl max-h-56 overflow-y-auto p-2 w-full">
                        {standardTests.filter(t => t.mainCategory === formData.mainCategory).map(t => (
                            <label key={t._id} className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl cursor-pointer transition-colors group">
                                <input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={formData.tests.includes(t._id)} onChange={() => toggleTestSelection(t._id)} />
                                <span className="text-sm font-bold text-slate-700">{t.testName}</span>
                            </label>
                        ))}
                    </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <FaUtensils size={10}/> Fasting Required?
                </label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.isFastingRequired} onChange={e => setFormData({...formData, isFastingRequired: e.target.value === 'true'})}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Report Time</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.reportTime} onChange={e => setFormData({...formData, reportTime: e.target.value})} placeholder="24 Hours" />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preparations (Comma separated)</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.precaution} onChange={e => setFormData({...formData, precaution: e.target.value})} placeholder="No special prep" />
              </div>

              {/* Dynamic Detailed Descriptions */}
              <div className="col-span-2 space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><FaInfoCircle/> Detailed Description Sections</label>
                    <button type="button" onClick={addDetailedSection} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><FaPlus/> Add Section</button>
                </div>
                {formData.detailedDescription.map((sec, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl">
                        <input className="col-span-4 p-2 bg-white rounded-lg text-sm border" placeholder="Title (e.g. Overview)" value={sec.sectionTitle} onChange={(e) => updateDetailedSection(idx, 'sectionTitle', e.target.value)} />
                        <input className="col-span-7 p-2 bg-white rounded-lg text-sm border" placeholder="Content" value={sec.sectionContent} onChange={(e) => updateDetailedSection(idx, 'sectionContent', e.target.value)} />
                        <button type="button" onClick={() => removeDetailedSection(idx)} className="col-span-1 text-rose-500 flex items-center justify-center"><FaTrash size={12}/></button>
                    </div>
                ))}
              </div>

              {/* Dynamic FAQs */}
              <div className="col-span-2 space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><FaQuestionCircle/> Frequently Asked Questions</label>
                    <button type="button" onClick={addFAQ} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><FaPlus/> Add FAQ</button>
                </div>
                {formData.faqs.map((faq, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl">
                        <input className="col-span-4 p-2 bg-white rounded-lg text-sm border" placeholder="Question" value={faq.question} onChange={(e) => updateFAQ(idx, 'question', e.target.value)} />
                        <input className="col-span-7 p-2 bg-white rounded-lg text-sm border" placeholder="Answer" value={faq.answer} onChange={(e) => updateFAQ(idx, 'answer', e.target.value)} />
                        <button type="button" onClick={() => removeFAQ(idx)} className="col-span-1 text-rose-500 flex items-center justify-center"><FaTrash size={12}/></button>
                    </div>
                ))}
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><FaTags size={10}/> Lifestyle Tags</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.lifestyleTags} onChange={e => setFormData({...formData, lifestyleTags: e.target.value})} placeholder="Alcoholic, Sedentary" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><FaTags size={10}/> Tags</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Budget, Popular" />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  {activeTab === 'suggest' ? 'Suggested Master MRP (₹)' : 'MRP (₹)'} 
                  {!formData.isCustom && activeTab !== 'suggest' && <FaLock size={8} className="text-amber-500" />}
                </label>
                <input 
                  type="number" 
                  required 
                  readOnly={!formData.isCustom && activeTab !== 'suggest'}
                  className={`w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none ${!formData.isCustom && activeTab !== 'suggest' ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`} 
                  value={formData.mrp} 
                  onChange={e => setFormData({...formData, mrp: e.target.value})} 
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                <textarea rows="2" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Entry level health check..." />
              </div>

              {activeTab === 'combo' && (
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-900 rounded-[24px] p-6 text-white shadow-xl">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Discount %</label>
                        <input type="number" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 outline-none" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} />
                    </div>
                    <div className="text-right flex flex-col justify-center">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Final Price</p>
                        <p className="text-3xl font-black">₹{calculatedOfferPrice}</p>
                    </div>
                </div>
              )}

              <button type="submit" disabled={isSaving || isSuggesting} className={`col-span-2 py-5 text-white font-black rounded-2xl shadow-xl uppercase text-sm tracking-widest transition-all flex justify-center items-center gap-2 ${activeTab === 'suggest' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-slate-900'}`}>
                {isSaving || isSuggesting ? <FaSpinner className="animate-spin" /> : 
                (activeTab === 'suggest' ? 'Send to Admin' : (initialData ? 'Update Lab Package' : 'Create & List Package'))}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}