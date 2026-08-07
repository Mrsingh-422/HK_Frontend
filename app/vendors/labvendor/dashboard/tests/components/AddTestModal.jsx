'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaSpinner, FaToggleOn, FaToggleOff, FaFlask, FaQuestionCircle, FaInfoCircle, FaSearch } from 'react-icons/fa';
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function AddTestModal({ isOpen, onClose, onSave, loading, initialData = null, masterTests = [] }) {
  const [activeTab, setActiveTab] = useState('master');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    testName: '', 
    testCode: '',
    mainCategory: '', 
    category: '', 
    sampleType: '', 
    gender: '',
    standardMRP: 0,
    amount: '',             // EDITABLE: Vendor MRP / Price
    discountPercent: 0,     // EDITABLE: Vendor Discount %
    reportTime: '',          // EDITABLE: Vendor TAT (Hrs)
    precaution: '',
    parameters: [],
    detailedDescription: [],
    faqs: [],
    isActive: true, 
    masterTestId: null,
    // Suggestion tab
    suggestParameters: '',
    suggestDescription: [{ sectionTitle: '', sectionContent: '' }]
  });

  // Dynamically extract main categories from masterTests API response
  const mainCategoryOptions = useMemo(() => {
    const categories = new Set(masterTests.map(m => m.mainCategory).filter(Boolean));
    if (formData.mainCategory) categories.add(formData.mainCategory);
    return Array.from(categories);
  }, [masterTests, formData.mainCategory]);

  // Filter master tests dynamically based on search query
  const filteredMasterTests = useMemo(() => {
    if (!searchQuery.trim()) return masterTests;
    const query = searchQuery.toLowerCase().trim();
    return masterTests.filter((m) => {
      const name = (m.testName || '').toLowerCase();
      const code = (m.testCode || '').toLowerCase();
      const mainCat = (m.mainCategory || '').toLowerCase();
      const cat = (m.category || '').toLowerCase();
      return name.includes(query) || code.includes(query) || mainCat.includes(query) || cat.includes(query);
    });
  }, [masterTests, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        handleMasterSelect(initialData);
      } else {
        setActiveTab('master');
        resetForm();
      }
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setSearchQuery('');
    setFormData({
      testName: '', testCode: '', mainCategory: '', category: '', sampleType: '',
      gender: '', standardMRP: 0, amount: '', discountPercent: 0, reportTime: '',
      precaution: '', parameters: [], detailedDescription: [], faqs: [], isActive: true, masterTestId: null,
      suggestParameters: '', suggestDescription: [{ sectionTitle: '', sectionContent: '' }]
    });
  };

  const handleMasterSelect = (master) => {
    setFormData(prev => ({
      ...prev,
      testName: master.testName || '',
      testCode: master.testCode || '',
      mainCategory: master.mainCategory || '',
      category: master.category || '',
      sampleType: master.sampleType || '',
      gender: master.gender || '',
      standardMRP: master.standardMRP || 0,
      amount: master.amount ?? master.standardMRP ?? '', // Vendor editable price
      reportTime: master.reportTime || master.tat || prev.reportTime || '', // Vendor editable TAT
      discountPercent: master.discountPercent ?? prev.discountPercent ?? 0, // Vendor editable Discount
      precaution: master.pretestPreparation || master.precaution || '',
      parameters: Array.isArray(master.parameters) ? master.parameters : [],
      detailedDescription: Array.isArray(master.detailedDescription) ? master.detailedDescription : [],
      faqs: Array.isArray(master.faqs) ? master.faqs : [],
      masterTestId: master._id || master.masterTestId || null,
      isActive: master.isActive ?? true
    }));
    setActiveTab('combo'); 
  };

  const calculatedPrice = useMemo(() => {
    const m = parseFloat(formData.amount) || 0;
    const d = parseFloat(formData.discountPercent) || 0;
    return Math.round(m - (m * d / 100));
  }, [formData.amount, formData.discountPercent]);

  const handleSuggestSubmit = async () => {
    setIsSuggesting(true);
    try {
        const payload = {
            requestType: "Test",
            data: {
                testName: formData.testName,
                mainCategory: formData.mainCategory,
                category: formData.category,
                sampleType: formData.sampleType,
                parameters: formData.suggestParameters ? formData.suggestParameters.split(',').map(p => p.trim()) : [],
                pretestPreparation: formData.precaution,
                standardMRP: Number(formData.amount),
                detailedDescription: formData.suggestDescription
            }
        };
        const res = await LabVendorAPI.submitNewMasterRequest(payload);
        if(res.success) {
            alert("Request submitted to Admin!");
            onClose();
        }
    } catch (error) {
        alert(error.response?.data?.message || "Failed to submit suggestion");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'suggest') {
        handleSuggestSubmit();
    } else {
        onSave({ ...formData, discountPrice: calculatedPrice });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50 border-b">
            <div className="p-6 flex justify-between items-center pb-2">
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                      {activeTab === 'suggest' ? 'Suggest to Admin' : (activeTab === 'combo' ? 'Configure Test Pricing & TAT' : 'Pickup Test From Master')}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">All details are fetched from master API</p>
                </div>
                <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors"><FaTimes size={20}/></button>
            </div>
            {!initialData?._id && (
              <div className="flex px-6">
                  <button onClick={() => setActiveTab('master')} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'master' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>Pickup From Master</button>
                  <button onClick={() => setActiveTab('suggest')} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'suggest' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400'}`}>Can't find test?</button>
              </div>
            )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          
          {/* TAB 1: PICKUP FROM MASTER */}
          {activeTab === 'master' && (
            <div className="space-y-4">
              {/* SEARCH INPUT BAR */}
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search by test name, code, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">
                    Clear
                  </button>
                )}
              </div>

              {/* MASTER TESTS LIST */}
              <div className="space-y-3">
                {filteredMasterTests.length > 0 ? (
                  filteredMasterTests.map((m) => (
                    <div key={m._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-emerald-200 transition-all cursor-pointer" onClick={() => handleMasterSelect(m)}>
                       <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800">{m.testName}</p>
                            {m.testCode && <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{m.testCode}</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase font-black mt-1">
                            {[m.mainCategory, m.category, `Baseline MRP: ₹${m.standardMRP}`].filter(Boolean).join(' • ')}
                          </p>
                       </div>
                       <button className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">Select</button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-500">No master tests found matching "{searchQuery}"</p>
                    <button onClick={() => setActiveTab('suggest')} className="mt-2 text-xs font-black text-amber-600 hover:underline">
                      Suggest this test to admin?
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMBO (CONFIGURE PRICING, DISCOUNT & TAT) */}
          {activeTab === 'combo' && (
            <div className="space-y-6">
              
              {/* READ-ONLY MASTER API DETAILS CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    {formData.testCode && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full tracking-wider">
                        Code: {formData.testCode}
                      </span>
                    )}
                    <h3 className="text-lg font-black text-slate-800 mt-2">{formData.testName}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {[formData.mainCategory, formData.category, formData.gender ? `Gender: ${formData.gender}` : ''].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  {formData.standardMRP > 0 && (
                    <div className="text-right bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Global MRP (API)</span>
                      <span className="text-base font-black text-slate-800">₹{formData.standardMRP}</span>
                    </div>
                  )}
                </div>

                {(formData.sampleType || formData.precaution) && (
                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                    {formData.sampleType && (
                      <div>
                        <span className="font-black text-slate-400 uppercase text-[9px] block">Sample Type</span>
                        <span className="font-bold text-slate-700">{formData.sampleType}</span>
                      </div>
                    )}
                    {formData.precaution && (
                      <div>
                        <span className="font-black text-slate-400 uppercase text-[9px] block">Pre-test Preparation</span>
                        <span className="font-bold text-slate-700">{formData.precaution}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* PARAMETERS SHOWCASE */}
                {formData.parameters?.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="font-black text-slate-400 uppercase text-[9px] flex items-center gap-1 mb-2">
                      <FaFlask className="text-emerald-500"/> Parameters Tested ({formData.parameters.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.parameters.map((param, i) => (
                        <span key={i} className="text-[11px] font-bold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* DETAILED DESCRIPTION SECTIONS */}
                {formData.detailedDescription?.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="font-black text-slate-400 uppercase text-[9px] flex items-center gap-1">
                      <FaInfoCircle className="text-sky-500"/> Description & Overview
                    </span>
                    <div className="grid gap-2">
                      {formData.detailedDescription.map((desc, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80">
                          {desc.sectionTitle && <p className="text-[11px] font-black text-slate-800">{desc.sectionTitle}</p>}
                          {desc.sectionContent && <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{desc.sectionContent}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQS SHOWCASE */}
                {formData.faqs?.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="font-black text-slate-400 uppercase text-[9px] flex items-center gap-1">
                      <FaQuestionCircle className="text-amber-500"/> Frequently Asked Questions
                    </span>
                    <div className="grid gap-2">
                      {formData.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80">
                          {faq.question && <p className="text-[11px] font-black text-emerald-800">Q: {faq.question}</p>}
                          {faq.answer && <p className="text-[11px] text-slate-600 mt-1">A: {faq.answer}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* EDITABLE FORM SECTION: PRICE, DISCOUNT %, TAT */}
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-2">
                <div className="col-span-2 border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700">Vendor Specific Settings</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Adjust your price, discount and turn-around time below.</p>
                </div>

                {/* EDITABLE: YOUR PRICE */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Your Price / MRP (₹)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-3.5 bg-emerald-50/60 rounded-2xl font-bold border-2 border-emerald-400 focus:border-emerald-600 text-emerald-900 outline-none text-sm" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>

                {/* EDITABLE: DISCOUNT % */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Discount %</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    className="w-full p-3.5 bg-emerald-50/60 rounded-2xl font-bold border-2 border-emerald-400 focus:border-emerald-600 text-emerald-900 outline-none text-sm" 
                    value={formData.discountPercent} 
                    onChange={e => setFormData({...formData, discountPercent: e.target.value})} 
                  />
                </div>

                {/* EDITABLE: TAT (HRS) */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Turn Around Time / TAT (Hours)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-3.5 bg-emerald-50/60 rounded-2xl font-bold border-2 border-emerald-400 focus:border-emerald-600 text-emerald-900 outline-none text-sm" 
                    value={formData.reportTime} 
                    onChange={e => setFormData({...formData, reportTime: e.target.value})} 
                  />
                </div>

                {/* CALCULATED FINAL PRICE BOX */}
                <div className="col-span-2 bg-emerald-600 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg shadow-emerald-600/20">
                  <span className="text-[10px] font-black uppercase tracking-widest">Calculated Final Patient Price</span>
                  <span className="text-2xl font-black">₹{calculatedPrice}</span>
                </div>

                {/* STATUS TOGGLE */}
                <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-700 uppercase">Vendor Active Status</span>
                  <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className="text-3xl">
                      {formData.isActive ? <FaToggleOn className="text-emerald-500" /> : <FaToggleOff className="text-slate-300" />}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="col-span-2 py-4 text-white font-black rounded-2xl uppercase text-xs tracking-widest bg-slate-900 hover:bg-emerald-600 transition-all shadow-xl">
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : (initialData?._id && !initialData.standardMRP ? 'Update Test' : 'Add to My Inventory')}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SUGGEST TO ADMIN */}
          {activeTab === 'suggest' && (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Name</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.testName} onChange={e => setFormData({...formData, testName: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disease Category</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Category</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.mainCategory} onChange={e => setFormData({...formData, mainCategory: e.target.value})}>
                    <option value="">Select Category</option>
                    {mainCategoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sample Type</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.sampleType} onChange={e => setFormData({...formData, sampleType: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Standard MRP (₹)</label>
                <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameters (Comma Separated)</label>
                <textarea className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.suggestParameters} onChange={e => setFormData({...formData, suggestParameters: e.target.value})} />
              </div>

              <button type="submit" disabled={isSuggesting} className="col-span-2 py-4 text-white font-black rounded-2xl uppercase text-xs tracking-widest bg-amber-600 hover:bg-amber-700 transition-all">
                {isSuggesting ? <FaSpinner className="animate-spin mx-auto" /> : 'Send Request to Admin'}
              </button>
            </form>
          )}

        </div>
      </div> 
    </div>
  )
}