"use client";

import React, { useState, useEffect } from "react";
import { FaUpload, FaFileMedical } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Ensure this matches your .env file
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- FALLBACK STATIC DATA ---
const STATIC_DATA = {
    sectionTag: "Find My Nurse!",
    mainTitle: "Find My Nurse!",
    titleEmoji: "👩‍⚕️",
    subTitle: "Nursing Prescription Services.",
    description: "Connect with certified nursing professionals. Upload your doctor's prescription, and our team will match you with the best home care specialist instantly.",
    uploadLabel: "Upload Prescription",
    uploadBtnText: "Upload",
    carouselImages: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsGYaUBG_KbOnDpqowcPrMILPYH0Vbr9Rc2Q&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK38yyiGSZUCwB_dSr7w4W92VEaS9J07EQUg&s"
    ]
};

function FindMyNurseTwo() {
    const { getNursePrescriptionData } = useGlobalContext();

    const [data, setData] = useState(STATIC_DATA);
    const [currentImg, setCurrentImg] = useState(0);
    const [fileName, setFileName] = useState("No file chosen");
    const [isUploading, setIsUploading] = useState(false);

    // 2. FETCH DYNAMIC CONTENT
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getNursePrescriptionData();
                if (res?.success && res?.data) {
                    // Update state with backend data
                    setData(res.data);
                }
            } catch (err) {
                console.error("Backend fetch failed, using static fallback.");
            }
        };
        fetchContent();
    }, [getNursePrescriptionData]);

    // 3. CAROUSEL LOGIC
    useEffect(() => {
        const images = data.carouselImages || [];
        if (images.length > 1) {
            const timer = setInterval(() => {
                setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [data.carouselImages]);

    // 4. HANDLERS
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const simulateUpload = () => {
        if (fileName !== "No file chosen") {
            setIsUploading(true);
            setTimeout(() => {
                setIsUploading(false);
                alert("Prescription uploaded successfully!");
            }, 2000);
        }
    };

    return (
        <section className="py-6 md:py-16 px-4 sm:px-6 lg:px-8 font-sans bg-[#f8fafc]">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col lg:flex-row lg:items-stretch">

                    {/* LEFT: IMAGE CAROUSEL SECTION */}
                    <div className="lg:w-[45%] relative h-[250px] sm:h-[400px] lg:h-auto group overflow-hidden bg-slate-200">
                        {data.carouselImages && data.carouselImages.length > 0 ? (
                            data.carouselImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                                        }`}
                                >
                                    <img
                                        // LOGIC: If path is relative (/uploads...), prepend API_URL
                                        src={img.startsWith("http") ? img : `${API_URL}${img}`}
                                        alt="Nurse Support"
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-20"></div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">No Images Available</div>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                            {data.carouselImages?.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentImg ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: CONTENT SECTION */}
                    <div className="lg:w-[55%] p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-center text-center lg:text-left">
                        <div className="space-y-5 md:space-y-8">
                            <div className="space-y-2">
                                <p className="text-[#08B36A] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                                    {data.sectionTag}
                                </p>
                                <div className="flex items-center justify-center lg:justify-start gap-3">
                                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                                        {data.mainTitle}
                                    </h2>
                                    <span className="text-2xl sm:text-4xl bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100 hidden sm:block">
                                        {data.titleEmoji}
                                    </span>
                                </div>
                            </div>

                            <div className="border-l-0 lg:border-l-4 border-[#08B36A] lg:pl-5">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                                    {data.subTitle}
                                </h3>
                            </div>

                            <p className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                                {data.description}
                            </p>

                            {/* FILE UPLOAD UI */}
                            <div className="pt-2 md:pt-4 space-y-4">
                                <label className="text-[#08B36A] font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
                                    <FaFileMedical className="text-sm" /> {data.uploadLabel}
                                </label>

                                <div className="flex flex-col sm:flex-row rounded-2xl border-2 border-slate-100 overflow-hidden focus-within:border-[#08B36A] transition-all bg-white group/input">
                                    <div className="flex-1 relative flex items-center min-h-[50px]">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex items-center w-full">
                                            <div className="bg-slate-50 px-4 py-3 text-slate-700 font-bold text-[10px] sm:text-xs uppercase border-r border-slate-100 whitespace-nowrap group-hover/input:bg-slate-100 transition-colors">
                                                Browse
                                            </div>
                                            <div className="px-4 py-3 text-slate-400 text-xs truncate">
                                                {fileName}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={simulateUpload}
                                        disabled={isUploading}
                                        className="bg-[#08B36A] hover:bg-slate-900 text-white font-black px-6 py-4 text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 min-h-[50px]"
                                    >
                                        {isUploading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <><FaUpload /> {data.uploadBtnText || "Upload"}</>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium italic">Max file size: 5MB (PDF, JPG, PNG)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FindMyNurseTwo;