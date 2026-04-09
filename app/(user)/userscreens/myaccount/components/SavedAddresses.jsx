"use client";
import React, { useState, useEffect } from 'react';
import { useUserContext } from "@/app/context/UserContext";
import { FiPhone, FiCheck, FiLoader, FiMapPin, FiHash, FiFlag, FiStar } from 'react-icons/fi';
import {
    HiPlus, HiOutlinePencilAlt, HiOutlineTrash,
    HiOutlineLocationMarker, HiX
} from 'react-icons/hi';
import { MdOutlineAddLocationAlt, MdOutlineLocationCity, MdOutlinePlace } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import UserAPI from "@/app/services/UserAPI";

function SavedAddresses({ userPhone }) {
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    // Data States
    const [addrList, setAddrList] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        addressType: "Home",
        phone: userPhone || "",
        houseNo: "",
        sector: "",
        landmark: "",
        pincode: "",
        city: "",
        state: "",
        country: "",
        isDefault: false,
    };

    const [formData, setFormData] = useState(initialFormState);

    // 1. FETCH ALL ADDRESSES
    const fetchAddresses = async () => {
        try {
            const res = await UserAPI.getUserAddresses();
            if (res.success) setAddrList(res.data || []);
        } catch (error) {
            console.error("Fetch addresses failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
        loadCountries();
    }, []);

    // 2. LOAD METADATA
    const loadCountries = async () => {
        const data = await getAllCountries();
        setCountries(data || []);
    };

    const fetchStates = async (countryId) => {
        const data = await getStatesByCountry(countryId);
        setStates(data || []);
    };

    const fetchCities = async (stateId) => {
        const data = await getCitiesByState(stateId);
        setCities(data || []);
    };

    // 3. HANDLERS
    const openModal = async (addr = null) => {
        if (addr) {
            setIsEditing(true);
            // Pre-load states/cities if we have IDs, otherwise dropdowns stay empty until changed
            setFormData({
                ...addr,
                // Ensure we use IDs for selection if available in your addr object
                country: addr.country, 
                state: addr.state,
                city: addr.city
            });
        } else {
            setIsEditing(false);
            setFormData({ ...initialFormState, phone: userPhone });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Checkboxes use 'checked', others use 'value'
        const finalValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));

        if (name === "country") {
            fetchStates(value);
            setFormData(prev => ({ ...prev, state: "", city: "" }));
        }
        if (name === "state") {
            fetchCities(value);
            setFormData(prev => ({ ...prev, city: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const selectedCountry = countries.find(c => c.id == formData.country || c.name === formData.country);
            const selectedState = states.find(s => s.id == formData.state || s.name === formData.state);
            const selectedCity = cities.find(c => c.id == formData.city || c.name === formData.city);

            // Create a clean payload
            const payload = {
                addressType: formData.addressType,
                phone: formData.phone,
                houseNo: formData.houseNo,
                sector: formData.sector,
                landmark: formData.landmark,
                pincode: formData.pincode,
                country: selectedCountry?.name || formData.country,
                state: selectedState?.name || formData.state,
                city: selectedCity?.name || formData.city,
                isDefault: formData.isDefault
            };

            // If editing, you might need a different endpoint, 
            // but if your addUserAddress handles both, we include the ID.
            if (isEditing) payload.addressId = formData._id;

            const res = await UserAPI.addUserAddress(payload);
            if (res.success) {
                toast.success(isEditing ? "Address Updated" : "Address Saved");
                setIsModalOpen(false);
                fetchAddresses();
            }
        } catch (error) {
            toast.error("Failed to save address");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Explicitly handles the "Set as Default" quick-action button on the card
    const handleSetDefault = async (id) => {
        try {
            const res = await UserAPI.setDefaultAddress(id);
            if (res.success) {
                toast.success("Primary address updated");
                await fetchAddresses(); // Reload list to show new default status
            }
        } catch (error) {
            toast.error("Failed to update primary address");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            const res = await UserAPI.deleteAddress(id);
            if (res.success) {
                toast.success("Address deleted");
                fetchAddresses();
            }
        } catch (error) {
            toast.error("Failed to delete address");
        }
    };

    if (isLoading) return <div className="py-20 flex justify-center"><FiLoader className="animate-spin text-[#08b36a]" size={40} /></div>;

    return (
        <section className="mt-10">
            <Toaster />
            <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Saved Addresses</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your delivery locations</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-[#08b36a] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#158c56] transition-all shadow-lg shadow-green-100"
                >
                    <HiPlus /> Add New Address
                </button>
            </div>

            {addrList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addrList.map((addr) => (
                        <div key={addr._id} className={`bg-white border-2 rounded-[32px] p-6 transition-all group relative ${addr.isDefault ? "border-[#08b36a] shadow-md shadow-green-50" : "border-gray-50 hover:border-gray-200"}`}>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${addr.isDefault ? "bg-green-100 text-[#08b36a]" : "bg-gray-100 text-gray-400"}`}>
                                        {addr.addressType}
                                    </span>
                                    {addr.isDefault && <span className="text-[#08b36a] flex items-center gap-1 text-[10px] font-black uppercase"><FiStar /> Default</span>}
                                </div>
                                <div className="flex gap-2">
                                    {/* Set Default Action Button */}
                                    {!addr.isDefault && (
                                        <button 
                                            onClick={() => handleSetDefault(addr._id)} 
                                            className="p-2 text-gray-400 hover:text-[#08b36a] hover:bg-green-50 rounded-xl transition-all" 
                                            title="Set as Default"
                                        >
                                            <FiCheck size={16} />
                                        </button>
                                    )}
                                    {/* Restore Edit Button */}
                                    <button 
                                        onClick={() => openModal(addr)} 
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <HiOutlinePencilAlt size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(addr._id)} 
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <HiOutlineTrash size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <FiPhone className="text-[#08b36a]" size={14} />
                                    <span>{addr.phone}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                        <HiOutlineLocationMarker className="text-[#08b36a]" size={18} />
                                    </div>
                                    <div className="text-xs leading-relaxed">
                                        <p className="font-black text-gray-800 text-sm mb-1">{addr.houseNo}</p>
                                        <p className="text-gray-500 font-bold">{addr.sector}, {addr.landmark}</p>
                                        <p className="text-[#08b36a] font-black mt-1 uppercase tracking-wider">{addr.city}, {addr.state} — {addr.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center">
                    <MdOutlineAddLocationAlt size={60} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-[2px] text-xs">No saved addresses found</p>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-2xl text-gray-900">{isEditing ? "Edit Address" : "Add New Address"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 transition-all"><HiX size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Type of Address</label>
                                    <div className="flex gap-3">
                                        {["Home", "Work", "Other"].map(t => (
                                            <button
                                                key={t} type="button"
                                                onClick={() => setFormData({ ...formData, addressType: t })}
                                                className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.addressType === t ? 'bg-[#08b36a] text-white' : 'bg-gray-50 text-gray-400'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <InputField icon={<FiPhone />} label="Contact Number" name="phone" placeholder="9988776655" value={formData.phone} onChange={handleInputChange} />
                                <InputField icon={<MdOutlinePlace />} label="House / Flat No." name="houseNo" placeholder="Flat 402, Skyline" value={formData.houseNo} onChange={handleInputChange} />
                                <InputField icon={<FiMapPin />} label="Sector / Area" name="sector" placeholder="Sector 15" value={formData.sector} onChange={handleInputChange} />
                                <InputField icon={<FiFlag />} label="Landmark" name="landmark" placeholder="Near Metro Station" value={formData.landmark} onChange={handleInputChange} />
                                <InputField icon={<FiHash />} label="Pincode" name="pincode" placeholder="110001" value={formData.pincode} onChange={handleInputChange} />

                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">Country</label>
                                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:border-[#08b36a]">
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">State</label>
                                    <select name="state" value={formData.state} onChange={handleInputChange} disabled={!formData.country} className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:border-[#08b36a]">
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1 block">City</label>
                                    <select name="city" value={formData.city} onChange={handleInputChange} disabled={!formData.state} className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:border-[#08b36a]">
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <label className="flex items-center gap-4 p-5 bg-green-50/50 rounded-3xl cursor-pointer border border-transparent hover:border-green-100 transition-all">
                                <input 
                                    type="checkbox" 
                                    name="isDefault" 
                                    checked={formData.isDefault} 
                                    onChange={handleInputChange} 
                                    className="w-6 h-6 accent-[#08b36a]" 
                                />
                                <span className="text-xs font-black text-green-700 uppercase tracking-widest">Set as default delivery address</span>
                            </label>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full py-5 bg-[#08b36a] text-white font-black rounded-[24px] hover:bg-[#158c56] shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all"
                            >
                                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCheck size={20} />}
                                {isEditing ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

const InputField = ({ icon, label, name, value, onChange, placeholder }) => (
    <div className="space-y-1 text-left">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-1.5 mb-1">
            <span className="text-[#08b36a]">{icon}</span> {label}
        </label>
        <input
            required={name !== 'landmark'}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none font-bold text-gray-700 focus:border-[#08b36a] transition-all"
        />
    </div>
);

export default SavedAddresses;