'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
    FaUserPlus, FaEdit, FaTrashAlt, FaPhoneAlt, FaCircle, FaUserCircle,
    FaTimesCircle, FaIdCard, FaBriefcase, FaInfoCircle, FaArrowLeft, FaPlus, FaCamera,
    FaGlobe, FaStethoscope, FaEnvelope, FaSearch
} from 'react-icons/fa'

// 👇 Ensure your NurseAPI is correctly imported
import NurseAPI from '@/app/services/NurseAPI'

export default function ManageNurseTable() {
    // --- MODAL & DATA STATES ---
    const[isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const[isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // --- SEARCH & EDIT STATES (NEWLY ADDED) ---
    const [searchQuery, setSearchQuery] = useState("");
    const[isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- FORM TEXT STATE ---
    const [formData, setFormData] = useState({
        name: "", username: "", phone: "", email: "", qualification: "", state: "",
        councilName: "", registrationNumber: "", vehicleNumber: "",
        vehicleType: "", licenseNumber: "", insuranceNumber: "",
        address: "", password: ""
    });

    // --- PHOTO UPLOAD STATES ---
    const[uploadedImages, setUploadedImages] = useState({
        driver: null, certificate: null, license: null, rc: null, insurance: null
    });
    const [files, setFiles] = useState({}); // Actual files to send to API

    const fileInputRefs = {
        driver: useRef(null), certificate: useRef(null),
        license: useRef(null), rc: useRef(null), insurance: useRef(null)
    };

    // Helper Function to display image correctly from backend URL
    const getImageUrl = (path) => {
        if (!path) return null;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.26:5002";
        return `${baseUrl}/${path.replace("public/", "")}`;
    };

    // ==========================================
    // 1. GET API CALL (Fetch Data)
    // ==========================================
    const fetchNurses = async () => {
        try {
            setLoading(true);
            const response = await NurseAPI.getNurse();
            if (response.success && response.data) {
                setNurses(response.data);
            } else if (response.data) {
                setNurses(response.data); // Fallback depending on your API structure
            }
        } catch (error) {
            console.error("Error fetching nurses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNurses();
    },[]);

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleRowClick = (nurse) => {
        setSelectedNurse(nurse);
        setIsDetailsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [key]: file })); // Save actual file for API

            // Convert to base64 for preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImages(prev => ({ ...prev, [key]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- RESET FORM HELPER ---
    const resetForm = () => {
        setFormData({
            name: "", username: "", phone: "", email: "", qualification: "", state: "",
            councilName: "", registrationNumber: "", vehicleNumber: "",
            vehicleType: "", licenseNumber: "", insuranceNumber: "",
            address: "", password: ""
        });
        setUploadedImages({ driver: null, certificate: null, license: null, rc: null, insurance: null });
        setFiles({});
        setIsEditMode(false);
        setEditId(null);
    };

    // ==========================================
    // 2. SEARCH API CALL (NEW)
    // ==========================================
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 0) {
            try {
                setLoading(true);
                const response = await NurseAPI.searchDrivers(query);
                if (response.success && response.data) {
                    setNurses(response.data);
                } else if (response.data) {
                    setNurses(response.data);
                } else {
                    setNurses([]); // Clear list if no results
                }
            } catch (error) {
                console.error("Error searching nurses:", error);
                setNurses([]);
            } finally {
                setLoading(false);
            }
        } else {
            fetchNurses(); // Bring back all list when search is empty
        }
    };

    // ==========================================
    // 3. DELETE API CALL (NEW)
    // ==========================================
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Stop row click from opening details modal
        if (window.confirm("Are you sure you want to delete this Nurse/Driver?")) {
            try {
                await NurseAPI.deleteDriver(id);
                alert("Deleted successfully!");
                fetchNurses(); // Refresh the table
            } catch (error) {
                console.error("Error deleting nurse:", error);
                alert(error.response?.data?.message || "Failed to delete.");
            }
        }
    };

    // ==========================================
    // 4. PREPARE EDIT (NEW)
    // ==========================================
    const handleEditClick = (e, nurse) => {
        e.stopPropagation();
        setIsEditMode(true);
        setEditId(nurse._id);
        
        // Populate Form
        setFormData({
            name: nurse.name || "", 
            username: nurse.username || "", 
            phone: nurse.phone || "", 
            email: nurse.email || "", 
            qualification: nurse.qualification || "", 
            state: nurse.state || "",
            councilName: nurse.councilName || "", 
            registrationNumber: nurse.registrationNumber || "", 
            vehicleNumber: nurse.vehicleNumber || "",
            vehicleType: nurse.vehicleType || "", 
            licenseNumber: nurse.licenseNumber || "", 
            insuranceNumber: nurse.insuranceNumber || "",
            address: nurse.address || "", 
            password: "" // Keep empty, only submit if user types new password
        });

        // Populate Images
        setUploadedImages({
            driver: nurse.profilePic ? getImageUrl(nurse.profilePic) : null,
            certificate: nurse.certificate ? getImageUrl(nurse.certificate) : null,
            license: nurse.license ? getImageUrl(nurse.license) : null,
            rc: nurse.rcImage ? getImageUrl(nurse.rcImage) : null,
            insurance: nurse.insurance ? getImageUrl(nurse.insurance) : null
        });
        setFiles({});
        
        setIsAddModalOpen(true);
    };

    // ==========================================
    // 5. POST / PUT API CALL (Submit Form - Updated for Edit)
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const fd = new FormData();

            // 👇 APPENDING STRICTLY WHAT BACKEND EXPECTS
            if (formData.name) fd.append("name", formData.name);
            if (formData.username) fd.append("username", formData.username); 
            if (formData.phone) fd.append("phone", formData.phone);
            if (formData.email) fd.append("email", formData.email);
            if (formData.qualification) fd.append("qualification", formData.qualification);
            if (formData.state) fd.append("state", formData.state);
            if (formData.councilName) fd.append("councilName", formData.councilName);
            if (formData.registrationNumber) fd.append("registrationNumber", formData.registrationNumber);
            if (formData.vehicleNumber) fd.append("vehicleNumber", formData.vehicleNumber);
            if (formData.vehicleType) fd.append("vehicleType", formData.vehicleType);
            if (formData.licenseNumber) fd.append("licenseNumber", formData.licenseNumber);
            if (formData.insuranceNumber) fd.append("insuranceNumber", formData.insuranceNumber);
            if (formData.address) fd.append("address", formData.address);
            if (formData.password) fd.append("password", formData.password); // Handled differently usually, but okay

            // 👇 APPENDING EXACT FILE KEYS
            if (files.driver) fd.append("profilePic", files.driver);
            if (files.certificate) fd.append("certificate", files.certificate);
            if (files.license) fd.append("license", files.license);
            if (files.rc) fd.append("rcImage", files.rc);
            // Assuming backend accepts 'insurance' file if provided
            if (files.insurance) fd.append("insurance", files.insurance);

            // Call Add or Update API depending on Mode
            if (isEditMode) {
                await NurseAPI.updateDriver(editId, fd);
                alert("Nurse updated successfully!");
            } else {
                await NurseAPI.addNurse(fd);
                alert("Nurse registered successfully!");
            }

            // Reset Form & Close Modal
            setIsAddModalOpen(false);
            resetForm();

            // Refresh table data
            fetchNurses();

        } catch (error) {
            console.error("Error submitting nurse form:", error);
            alert(error.response?.data?.message || "Failed to save Nurse. Please check your data.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className=" bg-[#F9FAFB] min-h-screen relative font-sans">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e5a91]">Manage-Nurse</h1>
                    <p className="text-gray-500 text-sm">Review profiles, edit details, or onboard new nurses.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* SEARCH INPUT */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Nurse..." 
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-green-50 shadow-sm text-sm transition-all w-64"
                        />
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-[#08B36A] hover:bg-[#069a5a] text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all active:scale-95"
                    >
                        <FaUserPlus /> Add +
                    </button>
                </div>
            </div>

            {/* --- TABLE CARD --- */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nurse Profile</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-10 text-gray-500">Loading Nurses...</td></tr>
                            ) : nurses.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-10 text-gray-500">No Nurses found.</td></tr>
                            ) : (
                                nurses.map((nurse) => (
                                    <tr key={nurse._id} onClick={() => handleRowClick(nurse)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border overflow-hidden">
                                                    {nurse.profilePic ? (
                                                        <img src={getImageUrl(nurse.profilePic)} alt="Nurse" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaUserCircle size={40} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{nurse.name}</div>
                                                    <div className="text-[10px] text-gray-400">ID: {nurse._id?.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${nurse.status === 'Available' ? 'bg-green-50 text-[#08B36A] border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    <FaCircle size={6} className={nurse.status === 'Available' ? 'animate-pulse' : ''} /> {nurse.status || "Offline"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                onClick={(e) => handleEditClick(e, nurse)}
                                                className="text-[#08B36A] p-2 hover:bg-green-50 rounded-lg mr-2 transition-colors">
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(e, nurse._id)}
                                                className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --------------------------- 
                ADD / EDIT NURSE DRIVER FORM MODAL 
            ---------------------------- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-5xl h-full md:h-[90vh] rounded-[30px] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">

                        {/* Form Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                                    <FaArrowLeft size={20} />
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {isEditMode ? "Edit Nurse Driver" : "Add Nurse Driver"}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                                {isEditMode ? "Update healthcare provider details" : "Register a new healthcare provider"}
                            </p>
                        </div>

                        {/* Form Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-[#FAFBFC]">

                            {/* --- SECTION 1: DOCUMENT IMAGES --- */}
                            <div>
                                <h3 className="text-sm font-bold text-[#08B36A] uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <FaCamera /> Required Documents & Photos
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { label: "Nurse Image", key: "driver" },
                                        { label: "Nursing Certificate", key: "certificate" },
                                        { label: "Driver License", key: "license" },
                                        { label: "RC Image", key: "rc" },
                                        { label: "Vehicle Insurance (Optional)", key: "insurance" } // Kept in UI but ignored in API call
                                    ].map((item) => (
                                        <div key={item.key} className="space-y-2">
                                            <label className="text-[12px] font-bold text-gray-500 ml-1">{item.label}</label>
                                            <div className="relative h-40 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden group hover:border-[#08B36A] transition-colors">
                                                {uploadedImages[item.key] ? (
                                                    <img src={uploadedImages[item.key]} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center">
                                                        <FaPlus className="mx-auto text-gray-300 mb-2 group-hover:text-[#08B36A]" size={24} />
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase group-hover:text-[#08B36A]">Upload Photo</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    ref={fileInputRefs[item.key]}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, item.key)}
                                                />
                                                <div
                                                    onClick={() => fileInputRefs[item.key].current.click()}
                                                    className="absolute inset-0 cursor-pointer"
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- SECTION 2: INPUT FIELDS --- */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-bold text-[#08B36A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <FaIdCard /> Personal & Professional Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {[
                                        { label: "Enter Full Name", name: "name", placeholder: "e.g. John Doe" },
                                        { label: "Create Username", name: "username", placeholder: "e.g. john_nurse123" }, // ✅ Added Username Field
                                        { label: "Enter Contact Number", name: "phone", placeholder: "+91 XXXXX XXXXX" },
                                        { label: "Enter email address", name: "email", placeholder: "example@mail.com" },
                                        { label: "Enter last qualification", name: "qualification", placeholder: "e.g. B.Sc Nursing" },
                                    ].map((field, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <label className="text-[13px] font-bold text-gray-700 ml-1">{field.label}</label>
                                            <input
                                                type="text"
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleInputChange}
                                                placeholder={field.placeholder}
                                                className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-green-50 transition-all text-sm shadow-sm"
                                                required={field.name === "name" || field.name === "phone" || field.name === "username"}
                                            />
                                        </div>
                                    ))}

                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-700 ml-1">Select State</label>
                                        <select name="state" value={formData.state} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#08B36A] text-sm appearance-none cursor-pointer shadow-sm">
                                            <option value="">Select state</option>
                                            <option value="Punjab">Punjab</option>
                                            <option value="Haryana">Haryana</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>

                                    {[
                                        { label: "Nursing Council Name", name: "councilName", placeholder: "Enter nursing council name" },
                                        { label: "Registration certificate number", name: "registrationNumber", placeholder: "Enter registration number" },
                                        { label: "Vehicle number", name: "vehicleNumber", placeholder: "PB 65 XX XXXX" },
                                        { label: "Vehicle type", name: "vehicleType", placeholder: "e.g. Car / Bike" },
                                        { label: "License number", name: "licenseNumber", placeholder: "DL-XXXXXXXXXXXX" },
                                        { label: "Insurance number", name: "insuranceNumber", placeholder: "Enter policy number" },
                                        { label: "Full Address", name: "address", placeholder: "House No, Street, City...", isFull: true },
                                        { label: "Set Password", name: "password", placeholder: isEditMode ? "Leave empty to keep current password" : "Minimum 8 characters", type: "password" },
                                    ].map((field, i) => (
                                        <div key={i} className={`space-y-1.5 ${field.isFull ? 'md:col-span-2' : ''}`}>
                                            <label className="text-[13px] font-bold text-gray-700 ml-1">Enter {field.label}</label>
                                            <input
                                                type={field.type || "text"}
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleInputChange}
                                                placeholder={field.placeholder}
                                                className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-green-50 transition-all text-sm shadow-sm"
                                                required={(!isEditMode && field.name === "password") || field.name === "vehicleNumber"}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* SUBMIT BUTTON */}
                                <div className="pt-6 flex justify-center pb-10">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full max-w-md bg-[#08B36A] hover:bg-[#069a5a] text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50"
                                    >
                                        {submitting ? "Submitting..." : (isEditMode ? "Update Registration" : "Submit Registration")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* --- DETAILS MODAL --- */}
            {isDetailsModalOpen && selectedNurse && !isAddModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">

                        {/* Header Section */}
                        <div className="bg-[#08B36A] p-10 text-white relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute top-8 right-8 text-white/90 hover:text-white transition-colors"
                            >
                                <FaTimesCircle size={32} />
                            </button>

                            <div className="flex items-center gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white flex items-center justify-center shadow-inner overflow-hidden">
                                    {selectedNurse.profilePic ? (
                                        <img src={getImageUrl(selectedNurse.profilePic)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUserCircle size={70} className="text-gray-300" />
                                    )}
                                </div>

                                {/* Name & Status */}
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tight">{selectedNurse.name}</h2>
                                    <div className="bg-white px-4 py-1 rounded-full inline-flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedNurse.status === 'Available' ? 'bg-[#08B36A]' : 'bg-gray-400'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {selectedNurse.status || 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body Section */}
                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-white">

                            {/* Left Column: Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <FaInfoCircle className="text-[#08B36A] text-sm" /> Personal Details
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nurse ID</span>
                                        <span className="text-lg font-bold text-gray-700 mt-1">{selectedNurse._id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Number</span>
                                        <span className="text-lg font-bold text-gray-700 mt-1">{selectedNurse.vehicleNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendor Type</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-lg font-bold text-gray-700">{selectedNurse.vendorType}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Work & Contact */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <FaBriefcase className="text-[#08B36A] text-sm" /> Work & Contact
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Username</span>
                                        <div className="flex items-center gap-2 mt-1 text-[#08B36A]">
                                            <FaUserCircle />
                                            <span className="text-lg font-black">{selectedNurse.username || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                                        <div className="flex items-center gap-2 mt-1 text-gray-700">
                                            <FaPhoneAlt className="text-gray-400 size-3" />
                                            <span className="text-lg font-bold">{selectedNurse.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-gray-700">
                                        <FaEnvelope className="text-gray-400 size-3" />
                                        <span className="text-lg font-bold truncate">{selectedNurse.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="p-8 bg-[#F9FAFB] flex justify-end gap-4">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-10 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Close
                            </button>
                            <button 
                                onClick={(e) => {
                                    setIsDetailsModalOpen(false); // Close Detail Modal
                                    handleEditClick(e, selectedNurse); // Open Edit Modal
                                }}
                                className="px-10 py-3.5 rounded-2xl bg-[#08B36A] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#069a5a] hover:scale-105 transition-all">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
