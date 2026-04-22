"use client";

import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import {
    FaTimes, FaPrescription, FaPhoneAlt, FaMapMarkerAlt,
    FaCloudUploadAlt, FaRobot, FaCheckCircle, FaSpinner
} from "react-icons/fa";

const PrescriptionModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState("idle"); // idle | scanning | completed
    const [extractedText, setExtractedText] = useState("");
    const [formData, setFormData] = useState({ phone: "", address: "" });

    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setExtractedText("");
            setStatus("idle");
        }
    };

    const handleScanAction = async () => {
        if (!file) return alert("Please select an image first");

        setStatus("scanning");

        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // 👉 Resize image (VERY IMPORTANT for OCR stability)
            const MAX_WIDTH = 1000;
            const scale = Math.min(1, MAX_WIDTH / img.width);

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 👉 Grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }

            ctx.putImageData(imageData, 0, 0);

            // 👉 Convert to base64 (IMPORTANT FIX)
            const processedImage = canvas.toDataURL("image/png");

            const result = await Tesseract.recognize(
                processedImage,
                "eng",
                {
                    logger: (m) => console.log(m),
                }
            );

            const text = result.data.text;

            console.log("OCR TEXT:", text);

            setExtractedText(text || "No text detected");
            setStatus("completed");

        } catch (error) {
            console.error("OCR ERROR:", error);
            alert("OCR failed. Try another image.");
            setStatus("idle");
        }
    };

    const resetAndClose = () => {
        setFile(null);
        setPreview(null);
        setStatus("idle");
        setExtractedText("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#08B36A] text-white rounded-xl flex items-center justify-center">
                            <FaRobot />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">
                                AI Prescription Scanner
                            </h3>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">
                                Powered by Smart OCR
                            </p>
                        </div>
                    </div>
                    <button onClick={resetAndClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6">
                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-[#08B36A] hover:bg-emerald-50/30 transition-all cursor-pointer group"
                        >
                            <FaCloudUploadAlt className="text-5xl text-slate-300 group-hover:text-[#08B36A] mx-auto mb-4" />
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                Click to Upload Prescription
                            </p>
                            <p className="text-xs text-slate-400 font-medium mt-2">
                                Take a clear photo of your prescription
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Image */}
                            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[3/4] border border-slate-200">
                                <img src={preview} alt="Prescription" className="w-full h-full object-cover" />

                                {status === "scanning" && (
                                    <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#08B36A] animate-scan-line"></div>
                                        <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                                            <FaSpinner className="animate-spin text-[#08B36A]" />
                                            <span className="text-[10px] font-black uppercase">
                                                AI Extracting...
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side */}
                            <div className="space-y-4">
                                {status === "completed" ? (
                                    <>
                                        <div className="bg-emerald-50 border p-4 rounded-2xl">
                                            <p className="text-xs whitespace-pre-line">
                                                {extractedText}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            className="w-full p-3 border rounded-xl"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                        />

                                        <textarea
                                            rows="3"
                                            placeholder="Address"
                                            className="w-full p-3 border rounded-xl"
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, address: e.target.value })
                                            }
                                        ></textarea>

                                        <button
                                            onClick={() => setPreview(null)}
                                            className="text-sm text-red-500"
                                        >
                                            Change Image
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {preview && (
                    <div className="p-6 border-t">
                        <button
                            disabled={status === "scanning"}
                            onClick={handleScanAction}
                            className="w-full bg-[#08B36A] text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {status === "scanning" ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Scanning...
                                </>
                            ) : (
                                <>
                                    <FaRobot /> Scan Prescription
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          position: absolute;
          animation: scan 2s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default PrescriptionModal;