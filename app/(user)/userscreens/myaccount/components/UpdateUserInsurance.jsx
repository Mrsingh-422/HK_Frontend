import React, { useState, useEffect } from "react";
import {
    FaShieldAlt, FaIdCard, FaBuilding, FaRegCalendarAlt,
    FaFileAlt, FaCheckCircle, FaTimesCircle, FaEdit,
    FaCheck, FaTimes, FaSpinner, FaUpload, FaSearch
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

function UpdateUserInsurance({ insurance }) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // API Data states
    const [insuranceList, setInsuranceList] = useState([]);
    const [uniqueProviders, setUniqueProviders] = useState([]);
    const [insuranceTypes, setInsuranceTypes] = useState([]); // Will hold ["NON-CASHLESS", "PREMIUM", ...]

    // Form State
    const [formData, setFormData] = useState({
        hasInsurance: false,
        insuranceNumber: "",
        companyName: "",
        insuranceType: "",
        startDate: "",
        endDate: "",
        masterInsuranceId: "",
        insuranceDocument: null,
        customInsuranceType: "" // Added to track custom input when 'Other' is selected
    });

    // ------------------ FETCH API DATA ------------------
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Providers/Policies
                const resInsurances = await UserAPI.getUserHealthInsuranses();
                const policyData = resInsurances.data || [];
                setInsuranceList(policyData);
                const providers = [...new Set(policyData.map(item => item.provider))];
                setUniqueProviders(providers);

                // 2. Fetch Insurance Types
                const resTypes = await UserAPI.getInsuranceTypes();
                // We spread the data and manually add "Other" to the selection list
                const typesFromAPI = resTypes.data || [];
                setInsuranceTypes([...typesFromAPI, "Other"]);
            } catch (error) {
                console.error("Failed to fetch insurance metadata", error);
            }
        };
        fetchAllData();
    }, []);

    // Initialize form with prop data
    useEffect(() => {
        if (insurance) {
            setFormData({
                ...insurance,
                insuranceDocument: null,
                customInsuranceType: ""
            });
        }
    }, [insurance]);

    // ------------------ HANDLERS ------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "companyName") {
            if (value === "other") {
                setFormData(prev => ({
                    ...prev,
                    companyName: "other",
                    masterInsuranceId: "",
                    insuranceType: ""
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    companyName: value,
                    masterInsuranceId: "",
                    insuranceType: ""
                }));
            }
        } else if (name === "masterInsuranceId") {
            const selectedPolicy = insuranceList.find(item => item._id === value);
            if (selectedPolicy) {
                setFormData(prev => ({
                    ...prev,
                    masterInsuranceId: value,
                    insuranceType: selectedPolicy.type
                }));
            }
        } else if (name === "hasInsurance") {
            const hasIns = value === "true";
            if (!hasIns) {
                setFormData({
                    hasInsurance: false,
                    insuranceNumber: "",
                    companyName: "",
                    insuranceType: "",
                    startDate: "",
                    endDate: "",
                    masterInsuranceId: "",
                    insuranceDocument: null,
                    customInsuranceType: ""
                });
            } else {
                setFormData(prev => ({ ...prev, hasInsurance: true }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, insuranceDocument: e.target.files[0] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = new FormData();

            // Logic for "Other": If insuranceType is "Other", use the value from customInsuranceType
            const finalInsuranceType = formData.insuranceType === "Other"
                ? formData.customInsuranceType
                : formData.insuranceType;

            Object.keys(formData).forEach(key => {
                if (key === 'insuranceDocument') {
                    if (formData[key]) data.append(key, formData[key]);
                } else if (key === 'insuranceType') {
                    data.append(key, finalInsuranceType);
                } else if (key !== 'customInsuranceType') {
                    data.append(key, formData[key]);
                }
            });

            await UserAPI.updateInsurnceUser(data);
            alert("Insurance details updated successfully!");
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update insurance");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Insurance Details <FaShieldAlt className="text-[#08b36a]" />
                </h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-[#08b36a] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#256f47]"
                    >
                        <FaEdit /> Edit Insurance
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">

                {/* Status Header */}
                <div className={`p-6 flex items-center justify-between ${formData.hasInsurance ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-3">
                        {formData.hasInsurance ? <FaCheckCircle className="text-[#08b36a] text-xl" /> : <FaTimesCircle className="text-red-500 text-xl" />}
                        <div>
                            {isEditing ? (
                                <select
                                    name="hasInsurance"
                                    value={formData.hasInsurance.toString()}
                                    onChange={handleInputChange}
                                    className="bg-transparent border-b border-gray-300 font-bold text-sm focus:outline-none"
                                >
                                    <option value="true">Yes, I have insurance</option>
                                    <option value="false">No, I don't have insurance</option>
                                </select>
                            ) : (
                                <p className="text-sm font-bold text-gray-900">{formData.hasInsurance ? "Active Insurance Policy" : "No Active Insurance"}</p>
                            )}
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Policy Status</p>
                        </div>
                    </div>
                </div>

                {formData.hasInsurance && (
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* 1st Dropdown: Company Provider */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="text-[#08b36a]"><FaBuilding /></span> Company Provider
                            </label>
                            {isEditing ? (
                                <select name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold">
                                    <option value="">Select Provider</option>
                                    {uniqueProviders.map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="other">Other</option>
                                </select>
                            ) : (
                                <p className="text-gray-800 font-bold text-sm">{formData.companyName || "—"}</p>
                            )}
                        </div>

                        {/* 2nd Dropdown: Conditional Step */}
                        {isEditing && formData.companyName && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaShieldAlt /></span>
                                    {formData.companyName === "other" ? "Select Insurance Type" : "Select Insurance Policy"}
                                </label>

                                {formData.companyName === "other" ? (
                                    <div className="space-y-2">
                                        <select
                                            name="insuranceType"
                                            value={formData.insuranceType}
                                            onChange={handleInputChange}
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-[#08b36a]"
                                        >
                                            <option value="">-- Choose Type --</option>
                                            {insuranceTypes.map((typeString, index) => (
                                                <option key={index} value={typeString}>
                                                    {typeString}
                                                </option>
                                            ))}
                                        </select>

                                        {/* CUSTOM TEXT INPUT: Appears when "Other" is selected in the type dropdown */}
                                        {formData.insuranceType === "Other" && (
                                            <input
                                                type="text"
                                                name="customInsuranceType"
                                                placeholder="Please specify insurance type"
                                                value={formData.customInsuranceType}
                                                onChange={handleInputChange}
                                                className="w-full p-2 bg-white border-2 border-[#08b36a] rounded-lg text-sm font-bold animate-pulse"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <select
                                        name="masterInsuranceId"
                                        value={formData.masterInsuranceId}
                                        onChange={handleInputChange}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-[#08b36a]"
                                    >
                                        <option value="">-- Choose Policy --</option>
                                        {insuranceList.filter(item => item.provider === formData.companyName).map(policy => (
                                            <option key={policy._id} value={policy._id}>
                                                {policy.insuranceName} ({policy.type})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* View Mode: Insurance Type Display */}
                        {!isEditing && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaShieldAlt /></span> Insurance Type
                                </label>
                                <p className="text-gray-800 font-bold text-sm">{formData.insuranceType || "—"}</p>
                            </div>
                        )}

                        {/* Policy Number */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="text-[#08b36a]"><FaIdCard /></span> Policy Number
                            </label>
                            {isEditing ? (
                                <input name="insuranceNumber" type="text" placeholder="POL-123456" value={formData.insuranceNumber} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                            ) : (
                                <p className="text-gray-800 font-bold text-sm">{formData.insuranceNumber || "—"}</p>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="text-[#08b36a]"><FaRegCalendarAlt /></span> Start Date
                            </label>
                            {isEditing ? (
                                <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                            ) : (
                                <p className="text-gray-800 font-bold text-sm">{formData.startDate || "—"}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="text-[#08b36a]"><FaRegCalendarAlt /></span> End Date
                            </label>
                            {isEditing ? (
                                <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                            ) : (
                                <p className="text-gray-800 font-bold text-sm">{formData.endDate || "—"}</p>
                            )}
                        </div>

                        {/* File Upload */}
                        {isEditing && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaUpload /></span> Policy Document
                                </label>
                                <input type="file" onChange={handleFileChange} className="w-full text-xs font-bold text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-[#08b36a] hover:file:bg-green-100" />
                            </div>
                        )}
                    </div>
                )}

                {isEditing && (
                    <div className="px-10 pb-10 flex gap-3">
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-[#08b36a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#256f47]">
                            {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Changes
                        </button>
                        <button onClick={() => { setIsEditing(false); setFormData(insurance); }} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200">
                            <FaTimes /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default UpdateUserInsurance;