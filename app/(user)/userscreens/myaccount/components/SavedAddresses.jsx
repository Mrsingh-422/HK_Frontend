"use client";
import React, { useState, useEffect } from 'react';
import { useUserContext } from "@/app/context/UserContext";
import { FiPhone, FiCheck, FiLoader, FiMapPin, FiHash, FiFlag } from 'react-icons/fi';
import {
    HiPlus, HiOutlinePencilAlt, HiOutlineTrash,
    HiOutlineLocationMarker, HiX
} from 'react-icons/hi';
import { MdOutlineAddLocationAlt, MdOutlineLocationCity, MdOutlinePlace } from 'react-icons/md';

/**
 * @param {Array} addresses
 * @param {Function} onUpdate
 * @param {String} userPhone
 */
function SavedAddresses({ addresses = [], onUpdate, userPhone }) {

    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        id: null,
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

    // ------------------ FETCH COUNTRIES ------------------

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await getAllCountries();
                setCountries(data || []);
            } catch {
                console.error("Failed to load countries");
            }
        };
        fetchCountries();
    }, []);

    const fetchStates = async (countryId) => {
        try {
            const data = await getStatesByCountry(countryId);
            setStates(data || []);
            setCities([]);
        } catch {
            console.error("Failed to load states");
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const data = await getCitiesByState(stateId);
            setCities(data || []);
        } catch {
            console.error("Failed to load cities");
        }
    };

    const openModal = async (addr = null) => {
        if (addr) {
            setFormData(addr);
            setIsEditing(true);

            if (addr.country) {
                await fetchStates(addr.country);
            }

            if (addr.state) {
                await fetchCities(addr.state);
            }

        } else {
            setFormData({ ...initialFormState, phone: userPhone });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

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
            const selectedCountry = countries.find(c => c.id == formData.country);
            const selectedState = states.find(s => s.id == formData.state);
            const selectedCity = cities.find(c => c.id == formData.city);

            const finalData = {
                ...formData,
                country: selectedCountry?.name || formData.country,
                state: selectedState?.name || formData.state,
                city: selectedCity?.name || formData.city
            };

            // Pass the ID and the single object instead of the whole list
            // If editing, use _id or id. If new, pass null.
            const targetId = isEditing ? (finalData._id || finalData.id) : null;

            await onUpdate(targetId, finalData);
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use the new onDelete prop
    const handleDelete = (item) => {
        onDelete(item._id || item.id);
    };

    return (
        <section className="mt-10">
            <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Saved Addresses</h2>
                    <p className="text-gray-500 text-xs">Manage your delivery locations</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 border border-[#08b36a] text-[#08b36a] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-all active:scale-95"
                >
                    <HiPlus /> Add New
                </button>
            </div>

            {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#08b36a] transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${addr.isDefault ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {addr.addressType} {addr.isDefault && "• Default"}
                                </span>
                                <div className="flex gap-1">
                                    <button onClick={() => openModal(addr)} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"><HiOutlinePencilAlt size={16} /></button>
                                    <button onClick={() => deleteAddress(addr.id)} className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"><HiOutlineTrash size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <p className="text-gray-800 font-bold text-sm flex items-center gap-2">
                                    <FiPhone className="text-[#08b36a]" size={14} /> {addr.phone}
                                </p>
                                <div className="flex items-start gap-2 text-gray-600 text-xs leading-relaxed">
                                    <HiOutlineLocationMarker className="text-[#08b36a] mt-0.5 shrink-0" size={16} />
                                    <span>
                                        <b className="text-gray-800">{addr.houseNo}</b>, {addr.sector}<br />
                                        {addr.landmark && <span className="text-gray-400">Landmark: {addr.landmark}</span>}
                                        <br />
                                        <span className="font-semibold text-gray-700">{addr.city}, {addr.state} - {addr.pincode}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
                    <MdOutlineAddLocationAlt size={40} className="text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm font-medium">No addresses saved yet</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[28px] border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-lg text-gray-800">{isEditing ? "Edit Address" : "New Address"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><HiX size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <InputField icon={<FiPhone />} label="Phone Number" name="phone" placeholder="e.g. +91 9876543210" value={formData.phone} onChange={handleInputChange} />

                                <InputField icon={<MdOutlinePlace />} label="House / Flat / Office No" name="houseNo" placeholder="e.g. Flat 402, Block B" value={formData.houseNo} onChange={handleInputChange} />

                                <InputField icon={<FiMapPin />} label="Sector / Area / Street" name="sector" placeholder="e.g. Sector 118, TDI City" value={formData.sector} onChange={handleInputChange} />

                                <InputField icon={<FiFlag />} label="Landmark (Optional)" name="landmark" placeholder="e.g. Near North Park" value={formData.landmark} onChange={handleInputChange} />

                                <InputField icon={<FiHash />} label="Pincode" name="pincode" placeholder="160055" value={formData.pincode} onChange={handleInputChange} />

                                {/* COUNTRY */}
                                <div className="space-y-1 text-left sm:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 px-1 tracking-wider">
                                        <span className="text-[#08b36a]"><MdOutlinePlace /></span> Country
                                    </label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full p-3.5 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a] focus:ring-1 focus:ring-[#08b36a]"
                                    >
                                        <option value="">Country</option>
                                        {countries.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>


                                {/* STATE */}
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 px-1 tracking-wider">
                                        <span className="text-[#08b36a]"><FiMapPin /></span> State
                                    </label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        disabled={!formData.country}
                                        className="w-full p-3.5 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a] focus:ring-1 focus:ring-[#08b36a]"
                                    >
                                        <option value="">State</option>
                                        {states.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* CITY */}
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 px-1 tracking-wider">
                                        <span className="text-[#08b36a]"><MdOutlineLocationCity /></span> City
                                    </label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={!formData.state}
                                        className="w-full p-3.5 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a] focus:ring-1 focus:ring-[#08b36a]"
                                    >
                                        <option value="">City</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-2 cursor-pointer group">
                                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-5 h-5 accent-[#08b36a] border-gray-300 rounded" />
                                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-800">Set as default delivery address</span>
                            </label>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full py-4 bg-[#08b36a] text-white font-bold rounded-2xl hover:bg-[#256f47] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                {isEditing ? "Update Address" : "Save Address"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

// Helper Input Component
const InputField = ({ icon, label, name, value, onChange, placeholder }) => (
    <div className="space-y-1 text-left">
        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 px-1 tracking-wider">
            <span className="text-[#08b36a]">{icon}</span> {label}
        </label>
        <input
            required={name !== 'landmark'}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3.5 bg-white border border-gray-300 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:border-[#08b36a] focus:ring-1 focus:ring-[#08b36a] transition-all placeholder:text-gray-400"
        />
    </div>
);

export default SavedAddresses;