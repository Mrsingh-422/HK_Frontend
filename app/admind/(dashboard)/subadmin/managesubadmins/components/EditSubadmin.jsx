"use client";
 
import React, { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { toast } from "react-hot-toast";
import DiamondAPI from "@/app/services/DiamondAPI"; // ✅ DiamondAPI import kar liya
 
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
function EditSubadmin({ user, onClose, onSuccess }) {
    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [dbRoles, setDbRoles] = useState([]); // Roles from DB
    const [submitting, setSubmitting] = useState(false);
 
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roleTypeId: [], // Multiple roles ke liye array
        phone: "",
        address: "",
        country: "",
        countryCode: "",
        state: "",
        stateCode: "",
        city: "",
        image: "",
    });
 
    const [previewImage, setPreviewImage] = useState(null);
 
    // ✅ Load existing user data and fetch roles via DiamondAPI
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                // ✅ Yahan aapki DiamondAPI use ki gayi hai
                const rolesRes = await DiamondAPI.getRolesList();
               
                if (rolesRes && rolesRes.success) {
                    setDbRoles(rolesRes.data);
                }
            } catch (error) {
                console.log("Error fetching roles", error);
            }
        };
        fetchRoles();
 
        if (user) {
            // User ki default location set karna
            const countryName = user.locationAccess?.country || user.country;
            const stateName = user.locationAccess?.state || user.state;
            const cityName = user.locationAccess?.city || user.city;
 
            const selectedCountry = countries.find((c) => c.name === countryName);
            const countryCode = selectedCountry?.isoCode || "";
 
            const stateList = State.getStatesOfCountry(countryCode);
            const selectedState = stateList.find((s) => s.name === stateName);
            const stateCode = selectedState?.isoCode || "";
 
            const cityList = City.getCitiesOfState(countryCode, stateCode);
 
            setStates(stateList);
            setCities(cityList);
 
            // User ke pehle se selected roles nikalna (Agar backend populate karke bhej raha hai)
            const userRoles = Array.isArray(user.roleType)
                ? user.roleType.map(r => typeof r === 'object' ? r._id : r)
                : [];
 
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "", // Password blank rakhenge, agar type karega toh update hoga
                roleTypeId: userRoles,
                phone: user.phone || "",
                address: user.address || "",
                country: countryName || "",
                countryCode,
                state: stateName || "",
                stateCode,
                city: cityName || "",
                image: user.image || "",
            });
 
            setPreviewImage(user.image);
        }
    }, [user, countries]);
 
    // ✅ Handle normal inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
 
    // ✅ Handle Checkboxes for Multiple Roles
    const handleRoleCheckboxChange = (roleId) => {
        setFormData((prev) => {
            const selectedRoles = Array.isArray(prev.roleTypeId) ? prev.roleTypeId : [];
            if (selectedRoles.includes(roleId)) {
                return { ...prev, roleTypeId: selectedRoles.filter(id => id !== roleId) };
            } else {
                return { ...prev, roleTypeId: [...selectedRoles, roleId] };
            }
        });
    };
 
    // ✅ Handle Country Change
    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        const selectedCountry = countries.find((c) => c.isoCode === countryCode);
        const stateList = State.getStatesOfCountry(countryCode);
 
        setStates(stateList);
        setCities([]);
 
        setFormData({
            ...formData,
            country: selectedCountry?.name || "",
            countryCode,
            state: "",
            stateCode: "",
            city: "",
        });
    };
 
    // ✅ Handle State Change
    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        const selectedState = states.find((s) => s.isoCode === stateCode);
        const cityList = City.getCitiesOfState(formData.countryCode, stateCode);
 
        setCities(cityList);
 
        setFormData({
            ...formData,
            state: selectedState?.name || "",
            stateCode,
            city: "",
        });
    };
 
    const handleCityChange = (e) => {
        setFormData({ ...formData, city: e.target.value });
    };
 
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            setFormData({ ...formData, image: file });
        }
    };
 
    // ✅ Submit Data to Edit API
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        if (formData.roleTypeId.length === 0) {
            toast.error("Please select at least one Authority Role.");
            return;
        }
 
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password, // Only updates if typed
                roleTypeId: formData.roleTypeId,
                locationAccess: {
                    country: formData.country,
                    state: formData.state,
                    city: formData.city
                }
            };
 
            const adminToken = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${adminToken}` } };
 
            const res = await axios.put(`${API_URL}/api/auth/admin/subadmins/${user._id}`, payload, config);
           
            if (res.data.success) {
                toast.success("Subadmin updated successfully!");
                if (onSuccess) onSuccess(); // Table ko refresh karne ke liye callback
                onClose(); // Modal close kar do
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update subadmin");
        } finally {
            setSubmitting(false);
        }
    };
 
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
                <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-md font-semibold text-lg">
                    Edit Subadmin: {user?.name}
                </div>
                <button onClick={onClose} className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg shadow-md text-sm font-medium transition">
                    GO BACK
                </button>
            </div>
 
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 text-gray-700 bg-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 text-gray-700 bg-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Phone *</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 text-gray-700 bg-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Change Password (Optional)</label>
                        <input type="password" name="password" placeholder="Leave blank to keep current" value={formData.password} onChange={handleChange} className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 text-gray-700 bg-transparent placeholder-gray-300" />
                    </div>
                </div>
 
                {/* Multiple Roles Checkboxes */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-600 mb-3">Authority Roles (Select Multiple) *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {dbRoles.map((role) => (
                            <label key={role._id} className="flex items-center space-x-3 p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-all">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(formData.roleTypeId) && formData.roleTypeId.includes(role._id)}
                                    onChange={() => handleRoleCheckboxChange(role._id)}
                                    className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="font-semibold text-sm text-gray-700">{role.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
 
                {/* Locations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Country</label>
                        <select value={formData.countryCode} onChange={handleCountryChange} className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 bg-transparent">
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                                <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">State</label>
                        <select value={formData.stateCode} onChange={handleStateChange} disabled={!formData.countryCode} className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 bg-transparent disabled:opacity-50">
                            <option value="">Select State</option>
                            {states.map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">City</label>
                        <select value={formData.city} onChange={handleCityChange} disabled={!formData.stateCode} className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 bg-transparent disabled:opacity-50">
                            <option value="">Select City</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city.name}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
 
                {/* Submit */}
                <div className="pt-6">
                    <button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-3 rounded-lg shadow-md font-semibold transition w-full md:w-auto disabled:opacity-50">
                        {submitting ? "Updating..." : "Update Details"}
                    </button>
                </div>
            </form>
        </div>
    );
}
 
export default EditSubadmin;
 