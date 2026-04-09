"use client";
import React, { useState, useEffect } from "react";
import {
    FaShieldAlt, FaFolderPlus, FaCloudUploadAlt, FaFolder, FaFileMedical,
    FaEdit, FaTrash, FaChevronRight, FaTimes, FaSpinner, FaEye, FaPlus, FaCalendarAlt, FaUserMd, FaFileImage
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";

const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function HealthLocker() {
    // --- Auth & Navigation States ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [items, setItems] = useState([]);
    const [navigationStack, setNavigationStack] = useState([{ id: null, name: "Vault" }]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentParentId, setCurrentParentId] = useState(null);

    // --- Modal & Form States ---
    const [modalMode, setModalMode] = useState(null); // 'folder', 'upload', 'details', 'rename', 'add-pages'
    const [activeItem, setActiveItem] = useState(null);
    const [formData, setFormData] = useState({ name: "", doctorName: "", notes: "" });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // 1. PIN Verification
    const verifyVaultPin = async () => {
        if (pin.length !== 4) return toast.error("Enter 4-digit PIN");
        setIsLoading(true);
        try {
            const res = await UserAPI.verifyLockerPin(pin);
            if (res.success) {
                toast.success("Vault Unlocked");
                setIsAuthenticated(true);
                loadLockerContent(null);
            } else {
                toast.error(res.message || "Incorrect PIN");
            }
        } catch (err) {
            toast.error("Error connecting to vault");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Load Content
    const loadLockerContent = async (parentId = null) => {
        setIsLoading(true);
        setCurrentParentId(parentId);
        try {
            const res = await UserAPI.getLockerContent(parentId);
            setItems(res.data || []);
        } catch (err) {
            toast.error("Failed to load content");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Navigation
    const enterFolder = (id, name) => {
        setNavigationStack([...navigationStack, { id, name }]);
        loadLockerContent(id);
    };

    const jumpToPath = (index) => {
        const newStack = navigationStack.slice(0, index + 1);
        setNavigationStack(newStack);
        loadLockerContent(newStack[index].id);
    };

    // 4. CRUD Logic
    const handleCreateFolder = async () => {
        if (!formData.name) return toast.error("Folder name required");
        try {
            await UserAPI.createFolder({ name: formData.name, parentId: currentParentId });
            toast.success("Folder created");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Failed to create folder"); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return toast.error("Select at least one image");

        const fd = new FormData();
        fd.append('title', formData.name);
        fd.append('doctorName', formData.doctorName);
        fd.append('notes', formData.notes);
        if (currentParentId) fd.append('parentId', currentParentId);

        // Append files from state
        selectedFiles.forEach((file) => {
            fd.append('images', file);
        });

        try {
            setIsLoading(true);
            await UserAPI.uploadLockerFile(fd);
            toast.success("Record uploaded successfully");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) {
            toast.error("Upload failed");
            console.error(err);
        }
        finally { setIsLoading(false); }
    };

    const handleAddPages = async () => {
        if (selectedFiles.length === 0) return toast.error("Select images to add");
        const fd = new FormData();
        selectedFiles.forEach((file) => {
            fd.append('images', file);
        });

        try {
            setIsLoading(true);
            await UserAPI.addPagesToRecord(activeItem._id, fd);
            toast.success("Pages added to record");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Failed to add pages"); }
        finally { setIsLoading(false); }
    };

    const handleRename = async () => {
        try {
            await UserAPI.renameLockerItem(activeItem._id, formData.name);
            toast.success("Renamed successfully");
            closeModal();
            loadLockerContent(currentParentId);
        } catch (err) { toast.error("Rename failed"); }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Delete this item? Folders will delete all contents inside.")) {
            try {
                await UserAPI.deleteLockerItem(id);
                toast.success("Deleted");
                loadLockerContent(currentParentId);
            } catch (err) { toast.error("Delete failed"); }
        }
    };

    const closeModal = () => {
        setModalMode(null);
        setActiveItem(null);
        setFormData({ name: "", doctorName: "", notes: "" });
        setSelectedFiles([]);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(filesArray);
        }
    };

    // --- Views ---
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[75vh]">
                <Toaster />
                <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 max-w-md w-full text-center">
                    <div className="bg-green-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-12 group-hover:rotate-0 transition-all">
                        <FaShieldAlt className="text-[#08b36a] text-5xl" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">Vault Locked</h2>
                    <p className="text-gray-400 mb-10">Enter 4-digit security PIN</p>
                    <input
                        type="password" maxLength={4} value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-4xl tracking-[20px] py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-[#08b36a] outline-none mb-8"
                        placeholder="••••"
                    />
                    <button onClick={verifyVaultPin} className="w-full bg-[#08b36a] text-white py-5 rounded-3xl font-black text-lg hover:bg-[#128a55] transition-all shadow-xl shadow-green-100">
                        {isLoading ? <FaSpinner className="animate-spin mx-auto" /> : "UNLOCK VAULT"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <Toaster />

            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900">Health Locker</h1>
                    <nav className="flex items-center gap-3 mt-4 bg-gray-50 w-fit px-4 py-2 rounded-2xl border border-gray-100">
                        {navigationStack.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <span onClick={() => jumpToPath(idx)} className={`text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all ${idx === navigationStack.length - 1 ? 'text-[#08b36a]' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {step.name}
                                </span>
                                {idx !== navigationStack.length - 1 && <FaChevronRight className="text-gray-300 text-[10px]" />}
                            </React.Fragment>
                        ))}
                    </nav>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setModalMode('folder')} className="flex items-center gap-2 bg-white border-2 border-gray-100 px-8 py-4 rounded-3xl font-bold text-gray-700 hover:border-gray-300 transition-all">
                        <FaFolderPlus /> New Folder
                    </button>
                    <button onClick={() => setModalMode('upload')} className="flex items-center gap-2 bg-[#08b36a] text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-green-100 hover:bg-[#128a55] transition-all">
                        <FaCloudUploadAlt /> Upload Record
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading && !modalMode ? (
                <div className="flex justify-center py-32"><FaSpinner className="animate-spin text-[#08b36a] text-5xl" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {items.length === 0 ? (
                        <div className="col-span-full text-center py-32 bg-gray-50/50 rounded-[50px] border-4 border-dashed border-gray-100">
                            <p className="text-gray-300 font-bold italic">No records found in this folder</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => item.type === 'folder' ? enterFolder(item._id, item.name) : (setActiveItem(item), setModalMode('details'))}
                                className="group bg-white p-8 rounded-[45px] border-2 border-gray-50 hover:border-[#08b36a] hover:shadow-2xl hover:shadow-green-50 transition-all cursor-pointer relative"
                            >
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveItem(item); setFormData({ name: item.name }); setModalMode('rename'); }} className="p-3 bg-gray-100 rounded-2xl text-gray-500 hover:text-[#08b36a] hover:bg-white border border-transparent hover:border-gray-100 shadow-sm">
                                        <FaEdit size={14} />
                                    </button>
                                    <button onClick={(e) => handleDelete(item._id, e)} className="p-3 bg-red-50 rounded-2xl text-red-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-100 shadow-sm">
                                        <FaTrash size={14} />
                                    </button>
                                </div>

                                <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110 ${item.type === 'folder' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {item.type === 'folder' ? <FaFolder /> : <FaFileMedical />}
                                </div>
                                <h6 className="font-black text-gray-800 truncate text-lg" title={item.name}>{item.name}</h6>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-2 h-2 rounded-full ${item.type === 'folder' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {item.type === 'folder' ? `${item.childCount || 0} Items` : `Medical Report`}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- MODALS --- */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[50px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                        <div className="p-10 flex justify-between items-center border-b border-gray-50">
                            <h3 className="font-black text-2xl text-gray-900">
                                {modalMode === 'folder' && "New Folder"}
                                {modalMode === 'rename' && "Rename Item"}
                                {modalMode === 'upload' && "Upload Medical Record"}
                                {modalMode === 'details' && activeItem?.name}
                                {modalMode === 'add-pages' && "Add Pages to Record"}
                            </h3>
                            <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><FaTimes /></button>
                        </div>

                        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Folder & Rename Form */}
                            {(modalMode === 'folder' || modalMode === 'rename') && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Item Name</label>
                                        <input
                                            type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter name here..."
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 focus:border-[#08b36a] outline-none font-bold text-gray-700"
                                        />
                                    </div>
                                    <button onClick={modalMode === 'folder' ? handleCreateFolder : handleRename} className="w-full bg-[#08b36a] text-white py-6 rounded-3xl font-black text-lg">
                                        {modalMode === 'folder' ? "CREATE FOLDER" : "UPDATE NAME"}
                                    </button>
                                </div>
                            )}

                            {/* Upload Form */}
                            {modalMode === 'upload' && (
                                <form onSubmit={handleUpload} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Record Title</label>
                                            <input required name="title" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none font-bold" placeholder="e.g. Blood Test Result" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Doctor Name</label>
                                            <input name="doctorName" value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none font-bold" placeholder="e.g. Dr. John Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Notes / Observations</label>
                                        <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none font-bold" placeholder="Any specific notes for this report..."></textarea>
                                    </div>

                                    {/* FIXED FILE INPUT */}
                                    <div>
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Images (Multiple allowed)</label>
                                        <div className="relative group">
                                            <input
                                                key="upload-input"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-green-50 file:text-[#08b36a] file:font-black cursor-pointer bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 hover:border-[#08b36a] p-2 transition-all"
                                            />
                                        </div>
                                        {/* File Picking Feedback */}
                                        {selectedFiles.length > 0 && (
                                            <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                                                <p className="text-[10px] font-black text-[#08b36a] uppercase tracking-widest mb-2">Picked {selectedFiles.length} files:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedFiles.map((file, i) => (
                                                        <span key={i} className="text-[10px] bg-white px-2 py-1 rounded-lg border text-gray-600 flex items-center gap-1">
                                                            <FaFileImage /> {file.name.substring(0, 15)}...
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full bg-[#08b36a] text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-green-100 disabled:opacity-50">
                                        {isLoading ? "UPLOADING..." : "UPLOAD TO VAULT"}
                                    </button>
                                </form>
                            )}

                            {/* Details View */}
                            {modalMode === 'details' && activeItem && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-[32px]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white rounded-xl text-[#08b36a]"><FaUserMd /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Physician</p>
                                                <p className="font-bold text-gray-700">{activeItem.doctorName || "Not Mentioned"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white rounded-xl text-blue-500"><FaCalendarAlt /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Date</p>
                                                <p className="font-bold text-gray-700">{new Date(activeItem.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Notes</p>
                                        <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl text-sm text-amber-900 font-medium leading-relaxed">
                                            {activeItem.notes || "No specific notes provided for this record."}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Report Pages ({activeItem.images?.length || 0})</p>
                                        <button onClick={() => { setSelectedFiles([]); setModalMode('add-pages'); }} className="text-[#08b36a] text-xs font-black uppercase flex items-center gap-1 hover:underline"><FaPlus /> Add More Pages</button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {activeItem.images?.map((img, i) => (
                                            <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                                <img src={`${SERVER_URL}${img}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <button onClick={() => window.open(`${SERVER_URL}${img}`, '_blank')} className="bg-white text-gray-900 p-4 rounded-2xl font-black shadow-xl flex items-center gap-2">
                                                        <FaEye /> VIEW
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Pages Form */}
                            {modalMode === 'add-pages' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-6 rounded-3xl mb-6">
                                        <p className="text-blue-700 text-sm font-bold">You are adding new images to <span className="underline">{activeItem.name}</span></p>
                                    </div>

                                    {/* FIXED FILE INPUT */}
                                    <input
                                        key="add-pages-input"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-black cursor-pointer bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 p-2 transition-all"
                                    />

                                    {selectedFiles.length > 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Picked {selectedFiles.length} new files:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedFiles.map((file, i) => (
                                                    <span key={i} className="text-[10px] bg-white px-2 py-1 rounded-lg border text-gray-600 flex items-center gap-1">
                                                        <FaFileImage /> {file.name.substring(0, 15)}...
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button onClick={() => setModalMode('details')} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black">BACK</button>
                                        <button onClick={handleAddPages} disabled={isLoading} className="flex-[2] bg-[#08b36a] text-white py-5 rounded-3xl font-black disabled:opacity-50">
                                            {isLoading ? "ADDING..." : "CONFIRM UPLOAD"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HealthLocker;