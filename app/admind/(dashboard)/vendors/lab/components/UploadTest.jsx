"use client";

import React, { useState, useRef } from "react";
import {
    FaFileCsv,
    FaCloudUploadAlt,
    FaDatabase,
    FaTable,
    FaCheckCircle,
    FaInfoCircle,
    FaTrash,
    FaArrowRight
} from "react-icons/fa";

function UploadTest() {
    const [file, setFile] = useState(null);
    const [uploadType, setUploadType] = useState("single"); // 'single' or 'package'
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile) {
            if (!selectedFile.name.endsWith(".csv")) {
                setStatus({ type: "error", message: "Invalid format. Please use .csv" });
                setFile(null);
            } else {
                setFile(selectedFile);
                setStatus({ type: "", message: "" });
            }
        }
    };

    // Drag & Drop handlers
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        validateAndSetFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", uploadType);

        try {
            // API call logic here
            
            await new Promise(res => setTimeout(res, 2000)); // Simulate
            setStatus({ type: "success", message: "Data synchronized successfully!" });
            setFile(null);
        } catch (err) {
            setStatus({ type: "error", message: "Upload failed. Check your CSV structure." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-10 font-sans">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* LEFT PANEL: Instructions & Rules */}
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
                            <FaDatabase className="text-white text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Import Center</h1>
                        <p className="text-slate-500 mt-2 leading-relaxed">
                            Quickly populate your laboratory database by uploading a CSV manifest.
                        </p>

                        <div className="mt-8 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Requirements</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <FaCheckCircle className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                    File must be in .CSV format
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <FaCheckCircle className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                    Max file size: 10MB
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-600">
                                    <FaCheckCircle className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                    Encoding: UTF-8
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                                <FaInfoCircle />
                                <span className="text-sm">Header Map</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Ensure your first row contains: <br />
                                <code className="text-indigo-600 font-mono font-bold">
                                    {uploadType === 'single' ? 'test_id, name, rate' : 'pkg_id, tests, price'}
                                </code>
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: The Upload Action */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* Header / Tabs */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => { setUploadType("single"); setFile(null); setStatus({ type: '', message: '' }) }}
                                className={`flex-1 py-5 text-sm font-bold transition-all flex items-center justify-center gap-2 
                ${uploadType === 'single' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <FaTable /> Individual Tests
                            </button>
                            <button
                                onClick={() => { setUploadType("package"); setFile(null); setStatus({ type: '', message: '' }) }}
                                className={`flex-1 py-5 text-sm font-bold transition-all flex items-center justify-center gap-2
                ${uploadType === 'package' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <FaDatabase /> Test Packages
                            </button>
                        </div>

                        <div className="p-8 lg:p-12">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                className={`
                    relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
                    ${isDragging ? "bg-indigo-50 border-indigo-400 scale-[1.01]" : "bg-slate-50/50 border-slate-200 hover:border-indigo-300 hover:bg-white"}
                    ${file ? "border-emerald-400 bg-emerald-50/30" : ""}
                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv"
                                    className="hidden"
                                />

                                {!file ? (
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto text-slate-300 group-hover:text-indigo-500 transition-colors">
                                            <FaCloudUploadAlt size={40} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-700">Select manifest file</h4>
                                            <p className="text-slate-400 text-sm mt-1">Drag and drop your CSV or click to browse</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
                                            <FaFileCsv className="text-emerald-500 text-4xl" />
                                            <div className="text-left">
                                                <p className="font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs text-slate-400 uppercase tracking-tighter">Ready for processing</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Indicator */}
                            {status.message && (
                                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm animate-pulse ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    {status.type === 'success' ? <FaCheckCircle /> : <FaInfoCircle />}
                                    {status.message}
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                disabled={!file || loading}
                                onClick={handleUpload}
                                className={`
                    w-full mt-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all
                    ${!file || loading
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-[0.98]"}
                `}
                            >
                                {loading ? "Processing..." : `Import ${uploadType === 'single' ? 'Tests' : 'Packages'}`}
                                {!loading && <FaArrowRight />}
                            </button>

                            <p className="text-center text-slate-400 text-xs mt-6">
                                By uploading, you agree to overwrite existing records with matching IDs.
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default UploadTest;