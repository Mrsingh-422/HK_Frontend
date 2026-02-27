import React, { useState } from "react";
import { FaFlask, FaUpload, FaFileMedical, FaBuilding, FaMicroscope } from "react-icons/fa";

function BookYourPrescriptionTest() {
    const [fileName, setFileName] = useState("No file chosen");

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName("No file chosen");
        }
    };

    return (
        <div className=" py-3 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Main Card Container */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 flex flex-col lg:flex-row min-h-[500px]">

                    {/* Left Side: Image Section */}
                    <div className="lg:w-1/2 relative group overflow-hidden">
                        <img
                            src="./labImages/labimage2.jpg"
                            alt="Laboratory"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay Gradient for Image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none"></div>

                        {/* Floating Badge */}
                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <FaMicroscope />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">NABL Accredited</p>
                                <p className="text-sm font-bold text-slate-800 leading-tight">Precision Labs</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Content Section */}
                    <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                        {/* Subtle Vertical Line decoration */}
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 hidden lg:block rounded-full"></div>

                        <header className="space-y-4">
                            <h4 className="text-emerald-600 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                <span className="w-8 h-px bg-emerald-200"></span>
                                Book Your Prescription Test
                            </h4>

                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                                Book Lab Test With <br />
                                <span className="text-emerald-600">Prescription!</span>
                            </h1>

                            <div className="pt-2">
                                <FaFlask className="text-4xl text-emerald-500/80 animate-pulse" />
                            </div>
                        </header>

                        <div className="mt-8 space-y-6">
                            {/* Bulk Section Mention */}
                            <div className="bg-slate-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                                <h3 className="text-slate-800 font-bold flex items-center gap-2">
                                    <FaBuilding className="text-emerald-600" />
                                    Want to book Corporate or Bulk Tests?
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                    We offer specialized packages for organizations and large groups with priority processing and doorstep collection.
                                </p>
                            </div>

                            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                                Skip the queue. Just upload your doctor's prescription and our
                                experts will handle the rest—from test identification to home sample collection.
                            </p>

                            {/* Upload Section */}
                            <div className="pt-6">
                                <label className="block text-emerald-700 font-bold text-sm uppercase tracking-wide mb-4">
                                    Upload Prescription
                                </label>

                                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                    {/* Custom Styled File Input */}
                                    <div className="flex-1 relative">
                                        <input
                                            type="file"
                                            id="prescription-upload"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="prescription-upload"
                                            className="flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 transition-all group"
                                        >
                                            <span className="text-slate-500 text-sm truncate pr-2">
                                                {fileName}
                                            </span>
                                            <span className="bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors">
                                                Choose File
                                            </span>
                                        </label>
                                    </div>

                                    <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-slate-300 active:scale-95">
                                        <FaUpload className="text-sm" />
                                        Upload
                                    </button>
                                </div>

                                <p className="mt-3 text-[11px] text-slate-400 italic">
                                    Supported formats: PDF, JPG, PNG (Max 5MB)
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default BookYourPrescriptionTest;