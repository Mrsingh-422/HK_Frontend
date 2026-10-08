'use client';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaBoxOpen, FaCheckCircle, FaSpinner, FaCalculator, FaStethoscope, FaEdit, FaTimes, FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import NurseAPI from '@/app/services/NurseAPI';

export default function AddPackagePage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Services Pagination States (Inside Form Modal - limit 20)
    const [nurseServices, setNurseServices] = useState([]);
    const [servicePage, setServicePage] = useState(1);
    const [servicePagination, setServicePagination] = useState({
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        currentPage: 1
    });

    // Packages Pagination States (Main Grid View)
    const [myPackages, setMyPackages] = useState([]);
    const [packagePage, setPackagePage] = useState(1);
    const [packagePagination, setPackagePagination] = useState({
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        currentPage: 1
    });

    const [consumablesList, setConsumablesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState(null);

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
        consumablesUsed: [{ masterItemId: '', discountPercentage: '' }],
        prescriptionRequired: false
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch services whenever servicePage changes
    useEffect(() => {
        if (showForm) {
            fetchNurseServices(servicePage);
        }
    }, [servicePage, showForm]);

    // Fetch packages whenever packagePage changes
    useEffect(() => {
        if (!showForm) {
            fetchMyPackages(packagePage);
        }
    }, [packagePage, showForm]);

    const fetchInitialData = async () => {
        try {
            setFetching(true);
            const [servicesRes, consumablesRes, packagesRes] = await Promise.all([
                NurseAPI.getNurseServicesForPackage({ page: 1, limit: 20 }),
                NurseAPI.getPackageConsumables(),
                NurseAPI.getMyPackages({ page: 1, limit: 9 })
            ]);

            if (servicesRes?.success) {
                const servicesList = Array.isArray(servicesRes.data) 
                    ? servicesRes.data 
                    : servicesRes.data?.data || [];
                setNurseServices(servicesList);
                if (servicesRes.pagination) {
                    setServicePagination(servicesRes.pagination);
                }
            }

            if (consumablesRes?.success) {
                const conList = Array.isArray(consumablesRes.data) 
                    ? consumablesRes.data 
                    : consumablesRes.data?.data || [];
                setConsumablesList(conList);
            }

            if (packagesRes?.success) {
                const packagesList = Array.isArray(packagesRes.data) 
                    ? packagesRes.data 
                    : packagesRes.data?.data || [];
                setMyPackages(packagesList);
                if (packagesRes.pagination) {
                    setPackagePagination(packagesRes.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching initial package data:", error);
            toast.error("Failed to load data");
        } finally {
            setFetching(false);
        }
    };

    const fetchNurseServices = async (page = 1) => {
        try {
            const res = await NurseAPI.getNurseServicesForPackage({ page, limit: 20 });
            if (res?.success) {
                const servicesList = Array.isArray(res.data) 
                    ? res.data 
                    : res.data?.data || [];
                setNurseServices(servicesList);
                if (res.pagination) {
                    setServicePagination(res.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching services page:", error);
        }
    };

    const fetchMyPackages = async (page = 1) => {
        try {
            const res = await NurseAPI.getMyPackages({ page, limit: 9 });
            if (res?.success) {
                const packagesList = Array.isArray(res.data) 
                    ? res.data 
                    : res.data?.data || [];
                setMyPackages(packagesList);
                if (res.pagination) {
                    setPackagePagination(res.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching packages page:", error);
        }
    };

    // --- EDIT / DETAILS FETCH ---
    const handleEditPackage = async (pkgId, e) => {
        e.stopPropagation();
        try {
            setLoading(true);
            const res = await NurseAPI.getPackageDetails(pkgId);
            if (res?.success && res.data) {
                const pkg = res.data;
                setEditingPackageId(pkg._id);
                setFormData({
                    packageName: pkg.packageName || '',
                    description: pkg.description || '',
                    includedServices: pkg.includedServices?.map(s => s._id || s) || [],
                    pricing: {
                        oneDay: { 
                            base: pkg.pricing?.oneDay?.base ?? '', 
                            discount: pkg.pricing?.oneDay?.discount ?? '' 
                        },
                        multipleDays: { 
                            base: pkg.pricing?.multipleDays?.base ?? '', 
                            discount: pkg.pricing?.multipleDays?.discount ?? '' 
                        },
                        hourly: { 
                            base: pkg.pricing?.hourly?.base ?? '', 
                            discount: pkg.pricing?.hourly?.discount ?? '' 
                        }
                    },
                    consumablesUsed: pkg.consumablesUsed?.length > 0 
                        ? pkg.consumablesUsed.map(c => ({
                            masterItemId: c.masterItemId?._id || c.masterItemId || '',
                            discountPercentage: c.discountPercentage || 0
                          }))
                        : [{ masterItemId: '', discountPercentage: '' }],
                    prescriptionRequired: Boolean(pkg.prescriptionRequired)
                });
                setShowForm(true);
            }
        } catch (error) {
            console.error("Error fetching package details for edit:", error);
            toast.error("Failed to load package details");
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE PACKAGE ---
    const handleDeletePackage = async (pkgId, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this package?")) return;

        try {
            setLoading(true);
            const res = await NurseAPI.deletePackage(pkgId);
            if (res?.success) {
                toast.success("Package deleted successfully");
                fetchMyPackages(packagePage);
            } else {
                toast.error(res?.message || "Failed to delete package");
            }
        } catch (error) {
            console.error("Error deleting package:", error);
            toast.error("Error deleting package");
        } finally {
            setLoading(false);
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
        const base = Number(formData.pricing[type].base) || 0;
        const discount = Number(formData.pricing[type].discount) || 0;
        
        const final = base - (base * (discount / 100));
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

    const resetForm = () => {
        setShowForm(false);
        setEditingPackageId(null);
        setServicePage(1);
        setFormData({
            packageName: '', description: '', includedServices: [],
            pricing: { 
                oneDay: { base: '', discount: '' }, 
                multipleDays: { base: '', discount: '' }, 
                hourly: { base: '', discount: '' } 
            },
            consumablesUsed: [{ masterItemId: '', discountPercentage: '' }],
            prescriptionRequired: false
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formattedPricing = {
                oneDay: {
                    base: Number(formData.pricing.oneDay.base) || 0,
                    discount: Number(formData.pricing.oneDay.discount) || 0
                },
                multipleDays: {
                    base: Number(formData.pricing.multipleDays.base) || 0,
                    discount: Number(formData.pricing.multipleDays.discount) || 0
                },
                hourly: {
                    base: Number(formData.pricing.hourly.base) || 0,
                    discount: Number(formData.pricing.hourly.discount) || 0
                }
            };

            const formattedConsumables = formData.consumablesUsed
                .filter(c => c.masterItemId)
                .map(c => ({
                    masterItemId: c.masterItemId,
                    discountPercentage: Number(c.discountPercentage) || 0
                }));

            const data = new FormData();
            data.append('packageName', formData.packageName);
            data.append('description', formData.description);
            data.append('includedServices', JSON.stringify(formData.includedServices));
            data.append('pricing', JSON.stringify(formattedPricing));
            data.append('consumablesUsed', JSON.stringify(formattedConsumables));
            data.append('prescriptionRequired', formData.prescriptionRequired);

            let res;
            if (editingPackageId) {
                res = await NurseAPI.updatePackage(editingPackageId, data);
            } else {
                res = await NurseAPI.createPackage(data);
            }

            if (res?.success) {
                toast.success(res.message || (editingPackageId ? "Package Updated Successfully!" : "Package Created Successfully!"));
                resetForm();
                fetchMyPackages(packagePage);
            }
        } catch (error) {
            console.error("Error submitting package:", error);
            toast.error(error.response?.data?.message || "Error saving package");
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
                    onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); } }}
                    className="bg-[#08B36A] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#079d5c] transition-all active:scale-95 cursor-pointer"
                >
                    {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> New Package</>}
                </button>
            </div>

            {showForm ? (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-[#08B36A] transition-colors cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"
                        >
                            <FaArrowLeft /> Back to Packages
                        </button>

                        <h3 className="text-lg font-black text-gray-800">
                            {editingPackageId ? 'Edit Nursing Package' : 'Create New Nursing Package'}
                        </h3>
                    </div>

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

                    {/* Prescription Required Toggle */}
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl w-fit">
                        <input 
                            type="checkbox"
                            id="prescriptionRequired"
                            checked={formData.prescriptionRequired}
                            onChange={(e) => setFormData({...formData, prescriptionRequired: e.target.checked})}
                            className="w-5 h-5 accent-[#08B36A] rounded cursor-pointer"
                        />
                        <label htmlFor="prescriptionRequired" className="text-sm font-bold text-gray-700 cursor-pointer">
                            Prescription Required for this Package
                        </label>
                    </div>

                    {/* Service Selection with Pagination */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                                <FaStethoscope className="text-[#08B36A]" /> Select Included Services 
                                <span className="text-xs text-gray-400 font-bold">({formData.includedServices.length} Selected)</span>
                            </h3>

                            {/* Services Pagination Header Controls */}
                            {servicePagination.totalPages > 1 && (
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                    <span className="text-xs font-bold text-gray-600 px-2">
                                        Page {servicePagination.currentPage || servicePage} of {servicePagination.totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!servicePagination.hasPrevPage && servicePage <= 1}
                                        onClick={() => setServicePage(prev => Math.max(prev - 1, 1))}
                                        className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-30 cursor-pointer shadow-xs transition-all border border-gray-200"
                                    >
                                        <FaChevronLeft size={10} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!servicePagination.hasNextPage && servicePage >= servicePagination.totalPages}
                                        onClick={() => setServicePage(prev => prev + 1)}
                                        className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-30 cursor-pointer shadow-xs transition-all border border-gray-200"
                                    >
                                        <FaChevronRight size={10} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-100 rounded-[28px] p-3 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nurseServices.length > 0 ? nurseServices.map(service => (
                                    <div 
                                        key={service._id}
                                        onClick={() => toggleService(service._id)}
                                        className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden bg-white ${
                                            formData.includedServices.includes(service._id) 
                                            ? 'border-[#08B36A] bg-green-50/50 shadow-sm' 
                                            : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-800 group-hover:text-[#08B36A] transition-colors">{service.subCategory}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{service.category}</p>
                                            <div className="flex gap-2 text-[10px] font-semibold text-emerald-700 pt-1">
                                                <span>1D: ₹{service.oneDayOneTimePrice}</span>
                                                <span>•</span>
                                                <span>Hr: ₹{service.pricePerHour}</span>
                                            </div>
                                        </div>
                                        {formData.includedServices.includes(service._id) ? (
                                            <FaCheckCircle className="text-[#08B36A] text-xl shrink-0" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                                        )}
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-gray-400 text-xs font-bold">
                                        No services available.
                                    </div>
                                )}
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
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full uppercase text-gray-500">Direct Base</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-xs font-bold text-gray-500">Services Subtotal:</span>
                                            <span className="font-black text-gray-800">₹{getSelectedServicesSubtotal(type)}</span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Base Price (₹)</label>
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
                                    <select
                                        className="flex-1 bg-white p-3 rounded-xl border-none focus:ring-2 focus:ring-[#08B36A] outline-none font-bold text-gray-700 text-xs"
                                        value={row.masterItemId}
                                        onChange={(e) => handleConsumableChange(idx, 'masterItemId', e.target.value)}
                                    >
                                        <option value="">Select Consumable Item</option>
                                        {consumablesList.map(con => (
                                            <option key={con._id} value={con._id}>
                                                {con.itemName} ({con.size}) - MRP ₹{con.mrp}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Disc%</span>
                                        <input 
                                            type="number"
                                            placeholder="0"
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
                        className="w-full py-5 bg-[#08B36A] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-200 hover:bg-[#079d5c] disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-[0.98] mt-4 cursor-pointer"
                    >
                        {loading ? <FaSpinner className="animate-spin mx-auto" /> : (editingPackageId ? 'Update Nursing Package' : 'Publish New Package')}
                    </button>
                </form>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myPackages.length > 0 ? myPackages.map((pkg) => {
                            const pricing = pkg.pricing || {};

                            return (
                                <div key={pkg._id} className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#08B36A] group-hover:scale-110 transition-transform">
                                                <FaBoxOpen size={28} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => handleEditPackage(pkg._id, e)}
                                                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer"
                                                    title="Edit Package"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDeletePackage(pkg._id, e)}
                                                    className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all cursor-pointer"
                                                    title="Delete Package"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-black text-xl text-gray-800 mb-2">{pkg.packageName}</h4>
                                        <p className="text-sm font-medium text-gray-400 mb-6 line-clamp-2 leading-relaxed">{pkg.description}</p>
                                    </div>
                                    
                                    <div className="border-t border-gray-50 pt-5 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 text-center bg-gray-50/70 p-3 rounded-2xl">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">One Day</p>
                                                <p className="text-sm font-black text-gray-800 mt-0.5">₹{pricing.oneDay?.final ?? pricing.oneDay?.base ?? 0}</p>
                                            </div>
                                            <div className="border-x border-gray-200 px-1">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Multi-Day</p>
                                                <p className="text-sm font-black text-gray-800 mt-0.5">₹{pricing.multipleDays?.final ?? pricing.multipleDays?.base ?? 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hourly</p>
                                                <p className="text-sm font-black text-gray-800 mt-0.5">₹{pricing.hourly?.final ?? pricing.hourly?.base ?? 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Included Services</span>
                                            <div className="bg-green-50 text-[#08B36A] px-4 py-1.5 rounded-xl font-bold text-xs">
                                                {pkg.includedServices?.length || 0} Services
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-4 border-dashed border-gray-50">
                                <FaBoxOpen size={60} className="mx-auto text-gray-100 mb-6" />
                                <p className="text-gray-400 font-black text-xl">No Active Packages</p>
                                <p className="text-gray-300 font-medium">Create your first nursing bundle to attract more clients.</p>
                            </div>
                        )}
                    </div>

                    {/* Main Packages Grid Pagination Footer */}
                    {packagePagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
                            <span className="text-xs font-bold text-gray-500">
                                Page {packagePagination.currentPage || packagePage} of {packagePagination.totalPages} ({packagePagination.totalItems} Total Packages)
                            </span>
                            
                            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                                <button
                                    type="button"
                                    disabled={!packagePagination.hasPrevPage && packagePage <= 1}
                                    onClick={() => setPackagePage(prev => Math.max(prev - 1, 1))}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold disabled:opacity-30 cursor-pointer transition-all flex items-center gap-1 shrink-0"
                                >
                                    <FaChevronLeft size={10} /> Prev
                                </button>

                                <div className="flex items-center gap-1 overflow-x-auto">
                                    {Array.from({ length: packagePagination.totalPages }, (_, i) => i + 1).map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setPackagePage(num)}
                                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                                                (packagePagination.currentPage || packagePage) === num
                                                    ? 'bg-[#08B36A] text-white shadow-sm'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    disabled={!packagePagination.hasNextPage && packagePage >= packagePagination.totalPages}
                                    onClick={() => setPackagePage(prev => prev + 1)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold disabled:opacity-30 cursor-pointer transition-all flex items-center gap-1 shrink-0"
                                >
                                    Next <FaChevronRight size={10} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}