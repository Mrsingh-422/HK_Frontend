"use client";
 
import React, { useState, useEffect } from "react";
import { useUserContext } from "@/app/context/UserContext";
import DiamondAPI from "@/app/services/DiamondAPI"; // Aapka original API import
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
 
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
function AddNewSubadmin({ onSuccess }) {
    const {
        getAllCountries,
        getStatesByCountry,
        getCitiesByState,
        loading: locationLoading
    } = useUserContext();
 
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        roleTypeId: [], // Multiple roles ke liye isko Array rakha hai
        country: "",
        state: "",
        city: "",
    });
 
    const [submitting, setSubmitting] = useState(false);
    const [dbRoles, setDbRoles] = useState([]);
 
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
 
    // --- 1. Real Roles Fetch Karein (ORIGINAL CODE) ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [countryData, rolesRes] = await Promise.all([
                    getAllCountries(),
                    DiamondAPI.getRolesList()
                ]);
                setCountries(countryData || []);
                if (rolesRes.success) setDbRoles(rolesRes.data);
            } catch (error) {
                console.log("Load Error:", error);
            }
        };
        loadInitialData();
    }, []);
 
    // Fetch States when Country changes (ORIGINAL)
    useEffect(() => {
        if (!formData.country) return;
        const fetchStates = async () => {
            const data = await getStatesByCountry(formData.country);
            setStates(data || []);
        };
        fetchStates();
    }, [formData.country]);
 
    // Fetch Cities when State changes (ORIGINAL)
    useEffect(() => {
        if (!formData.state) return;
        const fetchCities = async () => {
            const data = await getCitiesByState(formData.state);
            setCities(data || []);
        };
        fetchCities();
    }, [formData.state]);
 
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
 
    // Checkbox Handle Karne Ka Logic
    const handleRoleCheckboxChange = (roleId) => {
        setFormData((prev) => {
            const selectedRoles = Array.isArray(prev.roleTypeId) ? prev.roleTypeId : [];
            if (selectedRoles.includes(roleId)) {
                // Agar checked hai, toh hata do
                return { ...prev, roleTypeId: selectedRoles.filter(id => id !== roleId) };
            } else {
                // Agar checked nahi hai, toh array mein daal do
                return { ...prev, roleTypeId: [...selectedRoles, roleId] };
            }
        });
    };
 
    // --- 2. ASLI SUBMIT LOGIC ---
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        // Validation: Kam se kam 1 role select hona chahiye
        if (!formData.roleTypeId || formData.roleTypeId.length === 0) {
            toast.error("Please select at least one Authority Role.");
            return;
        }
 
        setSubmitting(true);
 
        try {
            // Find Names for ID
            const countryName = countries.find(c => c.id == formData.country)?.name;
            const stateName = states.find(s => s.id == formData.state)?.name;
            const cityName = cities.find(c => c.id == formData.city)?.name;
 
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                roleTypeId: formData.roleTypeId, // Frontend se array bhej rahe hain
                locationAccess: {
                    country: countryName,
                    state: stateName,
                    city: cityName
                }
            };
 
            const adminToken = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${adminToken}` } };
 
            // YAHAN NAYA URL '/subadmins' LAGA DIYA HAI
            const res = await axios.post(`${API_URL}/api/auth/admin/subadmins`, payload, config);
           
            if (res.data.success) {
                toast.success("Sub-Admin Deployed Successfully!");
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to create Sub-admin");
        } finally {
            setSubmitting(false);
        }
    };
 
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-start py-6">
            <Toaster position="top-right" />
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-xl shadow-black/5 p-10 border border-gray-100">
 
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                        Deploy New Administrator
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Assign system access and regional authority</p>
                </div>
 
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
 
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" name="name" required placeholder="John Doe" onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm" />
                    </div>
 
                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
                        <input type="email" name="email" required placeholder="admin@healthcare.com" onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm" />
                    </div>
 
                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Password</label>
                        <input type="password" name="password" required placeholder="••••••••" onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm" />
                    </div>
 
                    {/* Phone */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                        <input type="text" name="phone" required placeholder="9876543210" onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm" />
                    </div>
 
                    {/* MULTIPLE ROLES CHECKBOXES */}
                    <div className="md:col-span-2 space-y-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                            Authority Roles (Select Multiple)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {dbRoles.map((role) => (
                                <label key={role._id} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={Array.isArray(formData.roleTypeId) && formData.roleTypeId.includes(role._id)}
                                        onChange={() => handleRoleCheckboxChange(role._id)}
                                        className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="font-bold text-sm text-gray-700">{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
 
                    {/* Country */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Region (Country)</label>
                        <select name="country" value={formData.country} required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm"
                            onChange={(e) => {
                                setFormData({ ...formData, country: e.target.value, state: "", city: "" });
                                setStates([]); setCities([]);
                            }}>
                            <option value="">Select Country</option>
                            {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
 
                    {/* State */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / Province</label>
                        <select name="state" value={formData.state} required disabled={!formData.country} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm disabled:opacity-50"
                            onChange={(e) => setFormData({ ...formData, state: e.target.value, city: "" })}>
                            <option value="">Select State</option>
                            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
 
                    {/* City */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned City</label>
                        <select name="city" value={formData.city} required disabled={!formData.state} onChange={handleChange}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-emerald-500/20 font-bold text-sm disabled:opacity-50">
                            <option value="">Select City</option>
                            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
 
                    {/* Submit Button */}
                    <div className="md:col-span-2 pt-4">
                        <button type="submit" disabled={submitting}
                            className="w-full bg-[#08B36A] hover:bg-[#069356] text-white py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all font-black uppercase text-xs tracking-[0.2em] active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? "Processing Deployment..." : "Confirm & Create Admin"}
                        </button>
                    </div>
 
                </form>
            </div>
        </div>
    );
}
 
export default AddNewSubadmin;
 