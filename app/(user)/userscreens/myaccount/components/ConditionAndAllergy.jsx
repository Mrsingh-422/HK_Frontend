"use client";
import React, { useState, useEffect } from "react";
import {
    FaHeartbeat, FaStethoscope, FaTimes, 
    FaCheckCircle, FaExclamationTriangle, FaThermometerHalf, 
    FaTint, FaWind, FaSyringe, FaSpinner, FaBacteria, FaChevronDown
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

function ConditionAndAllergy({ userMedicalData }) {
    // --- MASTER DATA STATES ---
    const [masterConditions, setMasterConditions] = useState([]);
    const [masterAllergies, setMasterAllergies] = useState([]);
    const [majorConditionsList, setMajorConditionsList] = useState([]);

    // --- USER SELECTION STATES ---
    const [chronicBooleans, setChronicBooleans] = useState({
        asthma: false,
        diabetes: false,
        hypertension: false,
        heartDisease: false
    });
    const [userOther, setUserOther] = useState([]);  
    const [userAllergies, setUserAllergies] = useState([]); 

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Mappings for icons and keys
    const getBackendKey = (name) => {
        if (!name) return null;
        const n = name.toLowerCase().trim();
        if (n === "asthma") return "asthma";
        if (n === "diabetes") return "diabetes";
        if (n === "hypertension") return "hypertension";
        if (n === "heart disease" || n === "heartdisease") return "heartDisease";
        return null;
    };

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes("asthma")) return <FaWind />;
        if (n.includes("diabetes")) return <FaTint />;
        if (n.includes("heart")) return <FaHeartbeat />;
        if (n.includes("hypertension")) return <FaSyringe />;
        return <FaBacteria />;
    };

    // 1. Fetch Master Lists
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const [allergiesRes, conditionsRes, majorRes] = await Promise.all([
                    UserAPI.getAllergyList(),
                    UserAPI.getConditionList(),
                    UserAPI.getMajorConditions()
                ]);
                setMasterAllergies(allergiesRes.data || []);
                setMasterConditions(conditionsRes.data || []);
                setMajorConditionsList(majorRes.data || []);
            } catch (error) {
                console.error("Error fetching master lists:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMasters();
    }, []);

    // 2. LOAD DATA ON MOUNT
    // Since you passed userMedicalData={userData.conditionStatus}, 
    // the 'data' variable below is already the object containing the booleans.
    useEffect(() => {
        if (userMedicalData && typeof userMedicalData === 'object' && !Array.isArray(userMedicalData)) {
            setChronicBooleans({
                asthma: !!userMedicalData.asthma,
                diabetes: !!userMedicalData.diabetes,
                hypertension: !!userMedicalData.hypertension,
                heartDisease: !!userMedicalData.heartDisease,
            });
            setUserOther(userMedicalData.addedConditions || []);
            setUserAllergies(userMedicalData.addedAllergies || []);
        }
    }, [userMedicalData]);

    const toggleMajorStatus = (name) => {
        const key = getBackendKey(name);
        if (key) {
            setChronicBooleans(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    const handleAddItem = (type, value) => {
        if (!value) return;
        if (type === "condition") {
            if (!userOther.includes(value)) setUserOther([...userOther, value]);
        } else if (type === "allergy") {
            if (!userAllergies.includes(value)) setUserAllergies([...userAllergies, value]);
        }
    };

    const handleRemoveItem = (type, value) => {
        if (type === "condition") setUserOther(userOther.filter(i => i !== value));
        else setUserAllergies(userAllergies.filter(i => i !== value));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // This structure matches your controller logic perfectly
            const payload = {
                conditionStatus: {
                    asthma: chronicBooleans.asthma,
                    diabetes: chronicBooleans.diabetes,
                    hypertension: chronicBooleans.hypertension,
                    heartDisease: chronicBooleans.heartDisease
                },
                addedConditions: userOther,
                addedAllergies: userAllergies
            };

            const response = await UserAPI.updateConditionsAndAllergies(payload);
            if(response) {
                alert("Medical records updated successfully!");
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-[#08b36a]" size={40} />
        </div>
    );

    return (
        <section className="mt-10 max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Medical History <FaStethoscope className="text-[#08b36a]" />
                    </h1>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#08b36a] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#1a8551] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Major Issues Grid */}
            <div className="mb-10">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6">Major Health Issues</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {majorConditionsList.map((item) => {
                        const bKey = getBackendKey(item.name);
                        const isActive = chronicBooleans[bKey] || false;
                        return (
                            <div 
                                key={item._id}
                                onClick={() => toggleMajorStatus(item.name)}
                                className={`cursor-pointer p-6 rounded-[32px] border-2 transition-all ${
                                    isActive ? "border-[#08b36a] bg-green-50/50" : "border-gray-100 bg-white"
                                }`}
                            >
                                <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                    isActive ? "bg-[#08b36a] text-white" : "bg-gray-50 text-gray-300"
                                }`}>
                                    {getIcon(item.name)}
                                </div>
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 block ${isActive ? "text-[#08b36a]" : "text-gray-400"}`}>
                                    {isActive ? "Positive" : "None"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Conditions */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><FaThermometerHalf /></div>
                            <h3 className="font-bold text-gray-800">General Conditions</h3>
                        </div>
                        <select 
                            value=""
                            onChange={(e) => handleAddItem('condition', e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold py-2 px-4 outline-none"
                        >
                            <option value="">+ Add New</option>
                            {masterConditions.map(c => (
                                <option key={c._id} value={c.name} disabled={userOther.includes(c.name)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-3 min-h-[60px]">
                        {userOther.map((item) => (
                            <div key={item} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">{item}</span>
                                <button onClick={() => handleRemoveItem('condition', item)} className="text-gray-300 hover:text-red-500">
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Allergies */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><FaExclamationTriangle /></div>
                            <h3 className="font-bold text-gray-800">Known Allergies</h3>
                        </div>
                        <select 
                            value=""
                            onChange={(e) => handleAddItem('allergy', e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold py-2 px-4 outline-none"
                        >
                            <option value="">+ Add New</option>
                            {masterAllergies.map(a => (
                                <option key={a._id} value={a.name} disabled={userAllergies.includes(a.name)}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-3 min-h-[60px]">
                        {userAllergies.map((item) => (
                            <div key={item} className="flex items-center gap-2 bg-orange-50/20 px-4 py-2 rounded-2xl">
                                <span className="text-sm font-bold text-orange-700">{item}</span>
                                <button onClick={() => handleRemoveItem('allergy', item)} className="text-orange-300 hover:text-red-500">
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ConditionAndAllergy;