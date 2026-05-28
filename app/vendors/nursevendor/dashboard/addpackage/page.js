'use client';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaBoxOpen, FaCheckCircle, FaSpinner, FaCalculator, FaStethoscope } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

export default function AddPackagePage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [nurseServices, setNurseServices] = useState([]);
    const [myPackages, setMyPackages] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        packageName: '',
        description: '',
        includedServices: [],
        pricing: {
            oneDay: { base: '', discount: '' },
            multipleDays: { base: '', discount: '' },
            hourly: { base: '', discount: '' }
        },
        consumablesUsed: [{ masterItemId: '', discountPercentage: '' }]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setFetching(true);
            const [servicesRes, packagesRes] = await Promise.all([
                NurseAPI.getNurseServicesForPackage(),
                NurseAPI.getMyPackages()
            ]);
            if (servicesRes.success) setNurseServices(servicesRes.data);
            if (packagesRes.success) setMyPackages(packagesRes.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setFetching(false);
        }
    };

    // --- CALCULATION LOGIC ---
    const getSelectedServicesSubtotal = (type) => {
        const keyMap = {
            oneDay: 'oneDayOneTimePrice',
            multipleDays: 'forMultipleDaysPrice',
            hourly: 'pricePerHour'
        };
        const priceField = keyMap[type];

        return formData.includedServices.reduce((sum, id) => {
            const service = nurseServices.find(s => s._id === id);
            return sum + (Number(service?.[priceField]) || 0);
        }, 0);
    };

    const calculateFinalPrice = (type) => {
        const servicesSubtotal = getSelectedServicesSubtotal(type);
        const additionalBase = Number(formData.pricing[type].base) || 0;
        const discount = Number(formData.pricing[type].discount) || 0;
        
        const totalBeforeDiscount = servicesSubtotal + additionalBase;
        const final = totalBeforeDiscount - (totalBeforeDiscount * (discount / 100));
        
        return final > 0 ? final.toFixed(2) : "0.00";
    };

    const handlePricingChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                [type]: { ...prev.pricing[type], [field]: value }
            }
        }));
    };

    const handleConsumableChange = (index, field, value) => {
        const updated = [...formData.consumablesUsed];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, consumablesUsed: updated }));
    };

    const addConsumableRow = () => {
        setFormData(prev => ({
            ...prev,
            consumablesUsed: [...prev.consumablesUsed, { masterItemId: '', discountPercentage: '' }]
        }));
    };

    const removeConsumableRow = (index) => {
        const updated = formData.consumablesUsed.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, consumablesUsed: updated }));
    };

    const toggleService = (id) => {
        setFormData(prev => ({
            ...prev,
            includedServices: prev.includedServices.includes(id)
                ? prev.includedServices.filter(item => item !== id)
                : [...prev.includedServices, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('packageName', formData.packageName);
            data.append('description', formData.description);
            data.append('includedServices', JSON.stringify(formData.includedServices));
            data.append('pricing', JSON.stringify(formData.pricing));
            data.append('consumablesUsed', JSON.stringify(formData.consumablesUsed));

            const res = await NurseAPI.createPackage(data);
            if (res.success) {
                toast.success("Package Created Successfully!");
                setShowForm(false);
                fetchInitialData();
                setFormData({
                    packageName: '', description: '', includedServices: [],
                    pricing: { oneDay: { base: '', discount: '' }, multipleDays: { base: '', discount: '' }, hourly: { base: '', discount: '' } },
                    consumablesUsed: [{ masterItemId: '', discountPercentage: '' }]
                });
            }
        } catch (error) {
            toast.error("Error creating package");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-4xl text-[#08B36A]" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">Nurse Packages</h1>
                    <p className="text-gray-500 font-medium">Bundle your services for patient convenience</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#08B36A] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#079d5c] transition-all active:scale-95"
                >
                    {showForm ? 'Cancel' : <><FaPlus /> New Package</>}
                </button>
            </div>

            {showForm ? (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Package Name</label>
                            <input 
                                required
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#08B36A] transition-all outline-none text-gray-700 font-medium"
                                placeholder="e.g. Premium Post-Op Recovery"
                                value={formData.packageName}
                                onChange={(e) => setFormData({...formData, packageName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Package Description</label>
                            <input 
                                required
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#08B36A] transition-all outline-none text-gray-700 font-medium"
                                placeholder="What makes this package special?"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Service Selection with Scrollable Area */}
                    <div className="space-y-4">
                        <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                            <FaStethoscope className="text-[#08B36A]" /> Select Included Services
                        </h3>
                        {/* 🌟 Scrollable Container Starts Here 🌟 */}
                        <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar border border-gray-50 rounded-[28px] p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nurseServices.map(service => (
                                    <div 
                                        key={service._id}
                                        onClick={() => toggleService(service._id)}
                                        className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden ${
                                            formData.includedServices.includes(service._id) 
                                            ? 'border-[#08B36A] bg-green-50/50' 
                                            : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">{service.subCategory}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{service.category}</p>
                                        </div>
                                        {formData.includedServices.includes(service._id) ? (
                                            <FaCheckCircle className="text-[#08B36A] text-xl" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-6">
                        <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                            <FaCalculator className="text-[#08B36A]" /> Pricing Configuration
                        </h3>
                        <div className="grid lg:grid-cols-3 gap-6">
                            {['oneDay', 'multipleDays', 'hourly'].map((type) => (
                                <div key={type} className="p-6 bg-white rounded-[28px] border border-gray-100 shadow-sm space-y-5">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                        <p className="capitalize font-black text-[#08B36A] tracking-wide">{type.replace(/([A-Z])/g, ' $1')}</p>
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full uppercase text-gray-500">Auto Calc</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-xs font-bold text-gray-500">Services Subtotal:</span>
                                            <span className="font-black text-gray-800">₹{getSelectedServicesSubtotal(type)}</span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Additional Service Fee (+)</label>
                                            <input 
                                                type="number" placeholder="0.00"
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#08B36A] outline-none font-bold"
                                                value={formData.pricing[type].base}
                                                onChange={(e) => handlePricingChange(type, 'base', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Package Discount (%)</label>
                                            <input 
                                                type="number" placeholder="0"
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#08B36A] outline-none font-bold"
                                                value={formData.pricing[type].discount}
                                                onChange={(e) => handlePricingChange(type, 'discount', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-dashed border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-400">Final Price</span>
                                            <span className="text-2xl font-black text-gray-800">₹{calculateFinalPrice(type)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Consumables */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-gray-800 text-lg">Consumables</h3>
                            <button type="button" onClick={addConsumableRow} className="text-[#08B36A] text-sm font-black bg-green-50 px-4 py-1.5 rounded-full hover:bg-green-100 transition-colors">+ Add Item</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {formData.consumablesUsed.map((row, idx) => (
                                <div key={idx} className="flex gap-3 items-center p-4 bg-gray-50 rounded-2xl">
                                    <input 
                                        placeholder="Item ID"
                                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none font-bold text-gray-700"
                                        value={row.masterItemId}
                                        onChange={(e) => handleConsumableChange(idx, 'masterItemId', e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Disc%</span>
                                        <input 
                                            type="number"
                                            className="w-12 bg-transparent border-none focus:ring-0 outline-none font-black text-[#08B36A]"
                                            value={row.discountPercentage}
                                            onChange={(e) => handleConsumableChange(idx, 'discountPercentage', e.target.value)}
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeConsumableRow(idx)} className="text-red-400 hover:text-red-600 transition-colors p-2"><FaTrash size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        disabled={loading || formData.includedServices.length === 0}
                        className="w-full py-5 bg-[#08B36A] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-200 hover:bg-[#079d5c] disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-[0.98] mt-4"
                    >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Publish New Package'}
                    </button>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPackages.length > 0 ? myPackages.map((pkg) => (
                        <div key={pkg._id} className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-[#08B36A] group-hover:scale-110 transition-transform">
                                <FaBoxOpen size={28} />
                            </div>
                            <h4 className="font-black text-xl text-gray-800 mb-2">{pkg.packageName}</h4>
                            <p className="text-sm font-medium text-gray-400 mb-6 line-clamp-2 leading-relaxed">{pkg.description}</p>
                            
                            <div className="border-t border-gray-50 pt-5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting From</p>
                                    <p className="text-xl font-black text-gray-800">₹{pkg.pricing?.oneDay?.final || pkg.pricing?.oneDay?.base}</p>
                                </div>
                                <div className="bg-green-50 text-[#08B36A] px-4 py-2 rounded-xl font-bold text-xs">
                                    {pkg.includedServices?.length || 0} Services
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-4 border-dashed border-gray-50">
                            <FaBoxOpen size={60} className="mx-auto text-gray-100 mb-6" />
                            <p className="text-gray-400 font-black text-xl">No Active Packages</p>
                            <p className="text-gray-300 font-medium">Create your first nursing bundle to attract more clients.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}