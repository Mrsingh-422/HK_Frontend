"use client";
import React, { useState, useEffect } from "react";
import { FaFlask, FaUpload, FaBuilding, FaMicroscope } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function BookYourPrescriptionTest() {
    const { getPrescriptionPageData } = useGlobalContext();
    
    const [fileName, setFileName] = useState("No file chosen");
    const [currentImg, setCurrentImg] = useState(0);
    
    // Dynamic State with Dummy Data
    const [data, setData] = useState({
        miniTitle: "Book Your Prescription Test",
        mainTitle: "Book Lab Test With Prescription!",
        bulkTitle: "Want to book Corporate or Bulk Tests?",
        bulkDescription: "We offer specialized packages for organizations and large groups with priority processing and doorstep collection.",
        mainDescription: "Skip the queue. Just upload your doctor's prescription and our experts will handle the rest—from test identification to home sample collection.",
        badgeText: "Precision Labs",
        images: [
            "https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1579154236604-cd46096e8248?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
        ]
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getPrescriptionPageData();
                if (res?.success && res?.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Error fetching prescription data", err);
            }
        };
        fetchContent();
    }, []);

    // Image Carousel Logic
    useEffect(() => {
        if (data.images?.length > 1) {
            const timer = setInterval(() => {
                setCurrentImg((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [data.images]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <div className="py-3 px-4 bg-[#f8fafc] sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 flex flex-col lg:flex-row min-h-[600px]">

                    {/* Left Side: Dynamic Image Carousel */}
                    <div className="lg:w-1/2 relative group overflow-hidden bg-slate-200">
                        {data.images?.map((img, index) => (
                            <img
                                key={index}
                                src={img.startsWith('http') ? img : `${API_URL}${img}`}
                                alt="Laboratory"
                                className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${
                                    index === currentImg ? "opacity-100 scale-105" : "opacity-0 scale-100"
                                }`}
                            />
                        ))}
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none"></div>

                        {/* Floating Badge */}
                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3 z-10">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <FaMicroscope />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">NABL Accredited</p>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{data.badgeText}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Content Section */}
                    <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 hidden lg:block rounded-full"></div>

                        <header className="space-y-4">
                            <h4 className="text-emerald-600 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                <span className="w-8 h-px bg-emerald-200"></span>
                                {data.miniTitle}
                            </h4>

                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                                {data.mainTitle.split(' ').slice(0, -1).join(' ')}{" "}
                                <span className="text-emerald-600">{data.mainTitle.split(' ').slice(-1)}</span>
                            </h1>

                            <div className="pt-2">
                                <FaFlask className="text-4xl text-emerald-500/80 animate-pulse" />
                            </div>
                        </header>

                        <div className="mt-8 space-y-6">
                            <div className="bg-slate-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                                <h3 className="text-slate-800 font-bold flex items-center gap-2">
                                    <FaBuilding className="text-emerald-600" />
                                    {data.bulkTitle}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                    {data.bulkDescription}
                                </p>
                            </div>

                            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                                {data.mainDescription}
                            </p>

                            <div className="pt-6">
                                <label className="block text-emerald-700 font-bold text-sm uppercase tracking-wide mb-4">
                                    Upload Prescription
                                </label>

                                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                    <div className="flex-1 relative">
                                        <input type="file" id="prescription-upload" className="hidden" onChange={handleFileChange} />
                                        <label htmlFor="prescription-upload" className="flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 transition-all group">
                                            <span className="text-slate-500 text-sm truncate pr-2">{fileName}</span>
                                            <span className="bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 text-xs font-bold py-1.5 px-3 rounded-lg">Choose File</span>
                                        </label>
                                    </div>
                                    <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-95">
                                        <FaUpload className="text-sm" /> Upload
                                    </button>
                                </div>
                                <p className="mt-3 text-[11px] text-slate-400 italic">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookYourPrescriptionTest;