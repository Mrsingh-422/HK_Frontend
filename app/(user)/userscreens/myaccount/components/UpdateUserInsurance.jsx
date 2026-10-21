import React, { useState, useEffect } from "react";
import {
    FaShieldAlt, FaIdCard, FaBuilding, FaRegCalendarAlt,
    FaFileAlt, FaCheckCircle, FaTimesCircle, FaEdit,
    FaCheck, FaTimes, FaSpinner, FaUpload, FaExternalLinkAlt,
    FaChevronDown, FaChevronUp
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

function UpdateUserInsurance({ insurance }) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingUserInsurance, setIsLoadingUserInsurance] = useState(true);
    const [isOpen, setIsOpen] = useState(true);

    // API Data states
    const [insuranceList, setInsuranceList] = useState([]);
    const [uniqueProviders, setUniqueProviders] = useState([]);
    const [insuranceTypes, setInsuranceTypes] = useState([]);

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
        insuranceDocumentFront: null,
        insuranceDocumentBack: null,
        customInsuranceType: ""
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toISOString().split("T")[0];
        } catch (e) {
            return dateStr;
        }
    };

    const populateFormFromData = (data) => {
        if (!data) return;

        const masterId = typeof data.masterInsuranceId === "object" && data.masterInsuranceId !== null
            ? data.masterInsuranceId._id
            : data.masterInsuranceId || "";

        setFormData({
            hasInsurance: Boolean(data.hasInsurance),
            insuranceNumber: data.insuranceNumber || "",
            companyName: data.companyName || "",
            insuranceType: data.insuranceType || "",
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            masterInsuranceId: masterId,
            insuranceDocument: data.insuranceDocument || null,
            insuranceDocumentFront: data.insuranceDocumentFront || null,
            insuranceDocumentBack: data.insuranceDocumentBack || null,
            customInsuranceType: ""
        });
    };

    // ------------------ FETCH API DATA ------------------
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Providers/Policies with query filters
                const resInsurances = await UserAPI.getUserHealthInsuranses();
                const policyData = resInsurances.data || [];
                setInsuranceList(policyData);
                
                const providers = [...new Set(policyData.map(item => item.provider).filter(Boolean))];
                setUniqueProviders(providers);

                // 2. Fetch Insurance Types if available
                if (UserAPI.getInsuranceTypes) {
                    const resTypes = await UserAPI.getInsuranceTypes();
                    const typesFromAPI = resTypes.data || [];
                    setInsuranceTypes([...typesFromAPI, "Other"]);
                }

                // 3. Fetch Saved Insurance via GET /api/auth/user/my-insurance
                if (UserAPI.getMyInsurance) {
                    setIsLoadingUserInsurance(true);
                    const myInsRes = await UserAPI.getMyInsurance();
                    if (myInsRes?.success && myInsRes.data) {
                        populateFormFromData(myInsRes.data);
                    } else if (insurance) {
                        populateFormFromData(insurance);
                    }
                } else if (insurance) {
                    populateFormFromData(insurance);
                }
            } catch (error) {
                console.error("Failed to fetch insurance details", error);
                if (insurance) populateFormFromData(insurance);
            } finally {
                setIsLoadingUserInsurance(false);
            }
        };

        fetchAllData();
    }, []);

    // ------------------ HANDLERS ------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "companyName") {
            setFormData(prev => ({
                ...prev,
                companyName: value,
                masterInsuranceId: "",
                insuranceType: value === "other" ? "" : prev.insuranceType
            }));
        } else if (name === "masterInsuranceId") {
            const selectedPolicy = insuranceList.find(item => item._id === value);
            setFormData(prev => ({
                ...prev,
                masterInsuranceId: value,
                insuranceType: selectedPolicy ? selectedPolicy.type : prev.insuranceType
            }));
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
                    insuranceDocumentFront: null,
                    insuranceDocumentBack: null,
                    customInsuranceType: ""
                });
            } else {
                setFormData(prev => ({ ...prev, hasInsurance: true }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, fieldName) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = new FormData();
            payload.append("hasInsurance", String(formData.hasInsurance));

            if (formData.hasInsurance) {
                const finalInsuranceType = formData.insuranceType === "Other"
                    ? formData.customInsuranceType
                    : formData.insuranceType;

                payload.append("companyName", formData.companyName || "");
                payload.append("insuranceNumber", formData.insuranceNumber || "");
                if (finalInsuranceType) payload.append("insuranceType", finalInsuranceType);
                if (formData.startDate) payload.append("startDate", formData.startDate);
                if (formData.endDate) payload.append("endDate", formData.endDate);
                if (formData.masterInsuranceId) payload.append("masterInsuranceId", formData.masterInsuranceId);

                // Attach Front and Back files only if a new File instance is picked
                if (formData.insuranceDocumentFront instanceof File) {
                    payload.append("insuranceDocumentFront", formData.insuranceDocumentFront);
                }
                if (formData.insuranceDocumentBack instanceof File) {
                    payload.append("insuranceDocumentBack", formData.insuranceDocumentBack);
                }
            }

            await UserAPI.updateInsurnceUser(payload);
            alert("Insurance details updated successfully!");
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Update failed", error);
            alert(error?.response?.data?.message || "Failed to update insurance details");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="mt-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div 
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Insurance Details <FaShieldAlt className="text-[#08b36a]" />
                    </h1>
                    {isOpen ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                </div>

                {!isEditing && isOpen && !isLoadingUserInsurance && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-[#08b36a] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#256f47] transition"
                    >
                        <FaEdit /> Edit Insurance
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
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
                                    <p className="text-sm font-bold text-gray-900">
                                        {formData.hasInsurance ? "Active Insurance Policy" : "No Active Insurance"}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Policy Status</p>
                            </div>
                        </div>

                        {isLoadingUserInsurance && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                <FaSpinner className="animate-spin text-[#08b36a]" /> Loading details...
                            </div>
                        )}
                    </div>

                    {formData.hasInsurance && (
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* 1. Company Provider */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaBuilding /></span> Company Provider
                                </label>
                                {isEditing ? (
                                    <select 
                                        name="companyName" 
                                        value={formData.companyName} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
                                    >
                                        <option value="">Select Provider</option>
                                        {uniqueProviders.map(p => <option key={p} value={p}>{p}</option>)}
                                        <option value="other">Other</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{formData.companyName || "—"}</p>
                                )}
                            </div>

                            {/* 2. Policy / Scheme Dropdown */}
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

                                            {formData.insuranceType === "Other" && (
                                                <input
                                                    type="text"
                                                    name="customInsuranceType"
                                                    placeholder="Please specify insurance type"
                                                    value={formData.customInsuranceType}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 bg-white border border-[#08b36a] rounded-lg text-sm font-bold"
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
                                            {insuranceList
                                                .filter(item => item.provider === formData.companyName)
                                                .map(policy => (
                                                    <option key={policy._id} value={policy._id}>
                                                        {policy.insuranceName} ({policy.type})
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* 3. Insurance Type Display */}
                            {!isEditing && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-[#08b36a]"><FaShieldAlt /></span> Insurance Type
                                    </label>
                                    <p className="text-gray-800 font-bold text-sm capitalize">{formData.insuranceType || "—"}</p>
                                </div>
                            )}

                            {/* 4. Policy Number */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaIdCard /></span> Policy Number
                                </label>
                                {isEditing ? (
                                    <input 
                                        name="insuranceNumber" 
                                        type="text" 
                                        placeholder="e.g. HDFC-POL-984021" 
                                        value={formData.insuranceNumber} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" 
                                    />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm font-mono">{formData.insuranceNumber || "—"}</p>
                                )}
                            </div>

                            {/* 5. Start Date */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaRegCalendarAlt /></span> Start Date
                                </label>
                                {isEditing ? (
                                    <input 
                                        name="startDate" 
                                        type="date" 
                                        value={formData.startDate} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" 
                                    />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{formData.startDate || "—"}</p>
                                )}
                            </div>

                            {/* 6. End Date */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaRegCalendarAlt /></span> End Date
                                </label>
                                {isEditing ? (
                                    <input 
                                        name="endDate" 
                                        type="date" 
                                        value={formData.endDate} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" 
                                    />
                                ) : (
                                    <p className="text-gray-800 font-bold text-sm">{formData.endDate || "—"}</p>
                                )}
                            </div>

                            {/* 7. Card Front Document */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaFileAlt /></span> Insurance Card (Front)
                                </label>
                                {isEditing ? (
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf" 
                                        onChange={(e) => handleFileChange(e, "insuranceDocumentFront")} 
                                        className="w-full text-xs font-bold text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-[#08b36a] hover:file:bg-green-100" 
                                    />
                                ) : (
                                    formData.insuranceDocumentFront ? (
                                        <a 
                                            href={`${BACKEND_URL}${formData.insuranceDocumentFront}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs text-[#08b36a] font-bold inline-flex items-center gap-1.5 hover:underline"
                                        >
                                            View Front Card <FaExternalLinkAlt className="text-[10px]" />
                                        </a>
                                    ) : <p className="text-gray-400 text-sm">Not Provided</p>
                                )}
                            </div>

                            {/* 8. Card Back Document */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#08b36a]"><FaFileAlt /></span> Insurance Card (Back)
                                </label>
                                {isEditing ? (
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf" 
                                        onChange={(e) => handleFileChange(e, "insuranceDocumentBack")} 
                                        className="w-full text-xs font-bold text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-[#08b36a] hover:file:bg-green-100" 
                                    />
                                ) : (
                                    formData.insuranceDocumentBack ? (
                                        <a 
                                            href={`${BACKEND_URL}${formData.insuranceDocumentBack}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs text-[#08b36a] font-bold inline-flex items-center gap-1.5 hover:underline"
                                        >
                                            View Back Card <FaExternalLinkAlt className="text-[10px]" />
                                        </a>
                                    ) : <p className="text-gray-400 text-sm">Not Provided</p>
                                )}
                            </div>

                            {/* 9. Combined Document (if present) */}
                            {!isEditing && formData.insuranceDocument && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-[#08b36a]"><FaFileAlt /></span> Policy Document (PDF)
                                    </label>
                                    <a 
                                        href={`${BACKEND_URL}${formData.insuranceDocument}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-xs text-blue-600 font-bold inline-flex items-center gap-1.5 hover:underline"
                                    >
                                        View Combined PDF <FaExternalLinkAlt className="text-[10px]" />
                                    </a>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="px-8 pb-8 flex gap-3">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className="flex-1 bg-[#08b36a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#256f47] disabled:opacity-50"
                            >
                                {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Changes
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200"
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default UpdateUserInsurance;