'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { FaTimes, FaSpinner, FaToggleOn, FaToggleOff, FaExclamationCircle } from 'react-icons/fa'
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function AddTestModal({ isOpen, onClose, onSave, loading, initialData = null, masterTests = [] }) {
  // Default to 'master' for new tests so they search first
  const [activeTab, setActiveTab] = useState('master');
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [formData, setFormData] = useState({
    testName: '', mainCategory: 'Pathology', category: '', sampleType: 'Blood', amount: '',
    discountPercent: 0, reportTime: '', gender: 'Both', ageGroup: 'All Ages',
    testType: 'Both', precaution: '', isActive: true, masterTestId: null,
    parameters: '', // for suggest
    detailedDescription: [{ sectionTitle: 'Why is this test done?', sectionContent: '' }] // for suggest
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        if (initialData.standardMRP) {
          handleMasterSelect(initialData);
        } else {
          setActiveTab('combo');
          setFormData({ 
            ...initialData, 
            isActive: initialData.isActive ?? true,
            masterTestId: initialData.masterTestId?._id || initialData.masterTestId || null,
            category: initialData.category || '',
            parameters: initialData.parameters?.join(', ') || '',
            detailedDescription: initialData.detailedDescription || [{ sectionTitle: 'Why is this test done?', sectionContent: '' }]
          });
        }
      } else {
        setActiveTab('master');
        setFormData({
          testName: '', mainCategory: 'Pathology', category: '', sampleType: 'Blood', amount: '',
          discountPercent: 0, reportTime: '', gender: 'Both', ageGroup: 'All Ages',
          testType: 'Both', precaution: '', isActive: true, masterTestId: null,
          parameters: '',
          detailedDescription: [{ sectionTitle: 'Why is this test done?', sectionContent: '' }]
        });
      }
    }
  }, [initialData, isOpen]);

  const calculatedPrice = useMemo(() => {
    const m = parseFloat(formData.amount) || 0;
    const d = parseFloat(formData.discountPercent) || 0;
    return Math.round(m - (m * d / 100));
  }, [formData.amount, formData.discountPercent]);

  const handleMasterSelect = (master) => {
    setFormData(prev => ({
      ...prev,
      testName: master.testName,
      mainCategory: master.mainCategory,
      sampleType: master.sampleType || 'Blood',
      amount: master.standardMRP, 
      precaution: master.pretestPreparation || '', 
      masterTestId: master._id,
      isActive: true
    }));
    setActiveTab('combo'); 
  };

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
                parameters: formData.parameters ? formData.parameters.split(',').map(p => p.trim()) : [],
                pretestPreparation: formData.precaution,
                standardMRP: Number(formData.amount),
                detailedDescription: formData.detailedDescription
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
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        <div className="bg-slate-50 border-b">
            <div className="p-6 flex justify-between items-center pb-2">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {activeTab === 'suggest' ? 'Suggest to Admin' : (initialData?._id && !initialData.standardMRP ? 'Edit Test' : 'Test Configurator')}
                </h2>
                <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors"><FaTimes size={20}/></button>
            </div>
            {!initialData?._id && (
              <div className="flex px-6">
                  <button onClick={() => setActiveTab('suggest')} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'suggest' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400'}`}>Can't find test?</button>
                  <button onClick={() => setActiveTab('master')} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'master' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>Pickup From Master</button>
              </div>
            )}
        </div>
        <div className="p-8 overflow-y-auto flex-grow">
          {activeTab === 'master' ? (
            <div className="space-y-3">
              {masterTests.map((m) => (
                <div key={m._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer" onClick={() => handleMasterSelect(m)}>
                   <div>
                      <p className="font-bold text-slate-800">{m.testName}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{m.mainCategory} • Global MRP: ₹{m.standardMRP}</p>
                   </div>
                   <button className="text-[10px] font-black text-emerald-600 uppercase underline">Select</button>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Name</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.testName} onChange={e => setFormData({...formData, testName: e.target.value})} />
              </div>

              {activeTab === 'suggest' && (
                <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disease Category (e.g. Heart Health)</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Category</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.mainCategory} onChange={e => setFormData({...formData, mainCategory: e.target.value})}>
                    <option value="Pathology">Pathology</option><option value="Radiology">Radiology</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sample Type</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.sampleType} onChange={e => setFormData({...formData, sampleType: e.target.value})} placeholder="e.g. Blood" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab === 'suggest' ? 'Suggested Global MRP (₹)' : 'Your MRP (₹)'}</label>
                <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>

              {activeTab !== 'suggest' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount %</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TAT (Hrs)</label>
                    <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.reportTime} onChange={e => setFormData({...formData, reportTime: e.target.value})} />
                  </div>
                  <div className="col-span-2 bg-emerald-600 rounded-2xl p-4 text-white flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase">Final Sale Price</span>
                    <span className="text-2xl font-black">₹{calculatedPrice}</span>
                  </div>
                </>
              ) : (
                <div className="col-span-2 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameters (Comma Separated)</label>
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.parameters} onChange={e => setFormData({...formData, parameters: e.target.value})} placeholder="LDL, HDL, VLDL..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pre-test Prep</label>
                        <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-500 outline-none" value={formData.precaution} onChange={e => setFormData({...formData, precaution: e.target.value})} placeholder="e.g. Fasting 12 hours" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Description</label>
                        {formData.detailedDescription.map((desc, idx) => (
                            <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                                <input className="w-full text-xs font-bold text-slate-700 outline-none" value={desc.sectionTitle} onChange={e => {
                                    let items = [...formData.detailedDescription];
                                    items[idx].sectionTitle = e.target.value;
                                    setFormData({...formData, detailedDescription: items});
                                }} />
                                <textarea className="w-full text-xs text-slate-500 outline-none" value={desc.sectionContent} onChange={e => {
                                    let items = [...formData.detailedDescription];
                                    items[idx].sectionContent = e.target.value;
                                    setFormData({...formData, detailedDescription: items});
                                }} />
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {activeTab !== 'suggest' && (
                  <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-black text-slate-700 uppercase">Status</span>
                    <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className="text-3xl">
                        {formData.isActive ? <FaToggleOn className="text-emerald-500" /> : <FaToggleOff className="text-slate-300" />}
                    </button>
                  </div>
              )}

              <button type="submit" disabled={loading || isSuggesting} className={`col-span-2 py-4 text-white font-black rounded-2xl uppercase text-xs tracking-widest transition-all ${activeTab === 'suggest' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-emerald-600'}`}>
                {loading || isSuggesting ? <FaSpinner className="animate-spin mx-auto" /> : (activeTab === 'suggest' ? 'Send Request to Admin' : (initialData?._id && !initialData.standardMRP ? 'Update Test' : 'Add to My Inventory'))}
              </button>
            </form>
          )}
        </div>
      </div> 
    </div>
  )
}