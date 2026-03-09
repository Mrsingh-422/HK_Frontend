"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    FiPlus, FiFileText, FiImage, FiTrash2, FiSearch,
    FiDownload, FiEye, FiX, FiUploadCloud
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";

function PrescriptionVault() {
    // --- 1. STATE & STORAGE ---
    const [prescriptions, setPrescriptions] = useState([]);
    const [filter, setFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // File upload specific states
    const fileInputRef = useRef(null);
    const [tempFile, setTempFile] = useState(null);

    // Load data from LocalStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem("my_medical_vault");
        if (savedData) {
            setPrescriptions(JSON.parse(savedData));
        }
    }, []);

    // Save to LocalStorage whenever prescriptions change
    useEffect(() => {
        if (prescriptions.length > 0) {
            localStorage.setItem("my_medical_vault", JSON.stringify(prescriptions));
        }
    }, [prescriptions]);

    // --- 2. HANDLERS ---

    // Handle the actual file picking from storage
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempFile({
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                    type: file.type.includes("pdf") ? "pdf" : "image",
                    data: reader.result // This is the actual file content
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!tempFile) return alert("Please select a file first");

        const newDoc = {
            id: Date.now(),
            title: e.target.title.value || tempFile.name,
            category: e.target.category.value,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: tempFile.type,
            size: tempFile.size,
            url: tempFile.data
        };

        const updatedList = [newDoc, ...prescriptions];
        setPrescriptions(updatedList);
        localStorage.setItem("my_medical_vault", JSON.stringify(updatedList));

        // Reset and close
        setIsModalOpen(false);
        setTempFile(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this document forever?")) {
            const updatedList = prescriptions.filter(p => p.id !== id);
            setPrescriptions(updatedList);
            localStorage.setItem("my_medical_vault", JSON.stringify(updatedList));
        }
    };

    const filteredDocs = prescriptions.filter(p => {
        const matchesFilter = filter === "All" || p.category === filter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                            Medical Vault <MdVerified className="text-[#08b36a]" />
                        </h1>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
                            Your secure cloud prescriptions
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#08b36a] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-gray-900 transition-all active:scale-95"
                    >
                        <FiPlus size={20} /> Add Document
                    </button>
                </div>

                {/* --- SEARCH & FILTER --- */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-[#08b36a]/10 font-bold text-sm shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {["All", "Prescription", "Lab Report", "Invoices"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === cat
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "bg-white text-gray-400 border border-gray-50"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- DOCUMENTS GRID --- */}
                {filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map((doc) => (
                            <div key={doc.id} className="group bg-white rounded-[32px] border border-gray-100 p-6 hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {doc.type === 'pdf' ? <FiFileText size={28} /> : <FiImage size={28} />}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={doc.url} download={doc.title} className="p-2 text-gray-400 hover:text-[#08b36a] hover:bg-green-50 rounded-lg"><FiDownload size={18} /></a>
                                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={18} /></button>
                                    </div>
                                </div>

                                <h3 className="font-black text-gray-900 text-lg leading-tight mb-2 truncate">{doc.title}</h3>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-[10px] font-black text-[#08b36a] uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-md">{doc.category}</span>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">{doc.size}</span>
                                </div>

                                <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{doc.date}</span>
                                    <a href={doc.url} target="_blank" className="text-[#08b36a] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
                                        <FiEye /> View File
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                        <FiFileText size={48} className="text-gray-100 mb-4" />
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No documents found</p>
                    </div>
                )}
            </div>

            {/* --- UPLOAD MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
                        <div className="bg-[#08b36a] p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">Upload Document</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl"><FiX size={24} /></button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Name</label>
                                <input name="title" required placeholder="e.g. Blood Test Report" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#08b36a] outline-none font-bold text-sm" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                                <select name="category" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#08b36a] outline-none font-bold text-sm">
                                    <option>Prescription</option>
                                    <option>Lab Report</option>
                                    <option>Invoices</option>
                                </select>
                            </div>

                            {/* Actual File Picker Section */}
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all ${tempFile ? "border-[#08b36a] bg-green-50" : "border-gray-100 hover:border-[#08b36a]/30"}`}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                                <FiUploadCloud size={32} className={`mx-auto mb-2 ${tempFile ? "text-[#08b36a]" : "text-gray-200"}`} />
                                {tempFile ? (
                                    <div>
                                        <p className="text-xs font-black text-[#08b36a] truncate">{tempFile.name}</p>
                                        <p className="text-[10px] font-bold text-[#08b36a]/60">{tempFile.size}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-gray-400">Click to pick from gallery or files</p>
                                )}
                            </div>

                            <button type="submit" className="w-full py-4 bg-[#08b36a] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg">
                                Save to Vault
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PrescriptionVault;