"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useUserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, UploadCloud } from "lucide-react";
import DoctorAPI from "@/app/services/DoctorAPI";

export default function DoctorDocumentsPage() {
  const { user, loading } = useAuth();
  const { getDoctorSpecializations, getDoctorQualifications } = useUserContext();
  const router = useRouter();

  const [quals, setQuals] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);
  
  const [form, setForm] = useState({
    qualification: "", speciality: "", councilName: "", councilNumber: "", licenseNumber: "",
    profileImage: null, certificates: null
  });

  useEffect(() => {
    const load = async () => {
      const [q, s] = await Promise.all([getDoctorQualifications(), getDoctorSpecializations()]);
      setQuals(q || []); setSpecs(s || []);
    };
    load();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (e.target.name === "profileImage") {
      setForm({ ...form, profileImage: file });
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, certificates: file });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    try {
      await DoctorAPI.uploadDocs(data);
      alert("Documents submitted for review!");
      router.refresh(); // This will trigger the check for 'Pending' status
    } catch (err) { alert("Upload failed"); }
  };

  // Status Logic
  if (user?.profileStatus === "Pending") {
    return <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Under Review</h2>
      <p className="text-gray-500">Admin is verifying your documents. Please wait.</p>
    </div>;
  }

  return (
    <div className="max-w-[400px] mx-auto bg-white min-h-screen p-6 pb-20">
      {/* Profile Upload Circle */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border relative">
          {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <Camera size={40} className="text-gray-400" />}
          <input type="file" name="profileImage" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
        </div>
        <p className="mt-2 text-gray-500 font-medium">Upload</p>
      </div>

      <div className="space-y-5">
        <p className="text-xs font-bold text-[#344e6c]">Upload Certificate</p>
        
        {/* Dotted Certificate Box */}
        <div className="border-2 border-dashed border-[#42b883] rounded-2xl p-6 flex flex-col items-center bg-[#f9fffb] relative">
          <div className="w-12 h-12 bg-[#42b883] text-white rounded-full flex items-center justify-center mb-3">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-[#0e2c4b] font-bold text-lg">Upload image</h3>
          <p className="text-[11px] text-gray-400 text-center px-4 mb-4">Ensure the photo is clear and not blurry. JPG, PNG or PDF allowed.</p>
          
          <div className="flex gap-3 w-full">
            <button className="flex-1 bg-[#56b978] text-white text-xs py-2.5 rounded-lg flex items-center justify-center gap-2">
              <Camera size={16} /> Camera
            </button>
            <button className="flex-1 bg-[#f1f4f9] text-[#0e2c4b] text-xs py-2.5 rounded-lg border flex items-center justify-center gap-2">
              <ImageIcon size={16} /> Gallery
            </button>
          </div>
          <input type="file" name="certificates" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
          {form.certificates && <p className="text-[10px] mt-2 text-green-600 font-bold">{form.certificates.name}</p>}
        </div>

        {/* Inputs */}
        <select className="w-full p-3.5 border border-gray-200 rounded-xl text-gray-500 bg-white" onChange={(e)=>setForm({...form, qualification: e.target.value})}>
            <option>Qualification</option>
            {quals.map(q => <option key={q._id} value={q.name}>{q.name}</option>)}
        </select>

        <input className="w-full p-3.5 border border-gray-200 rounded-xl outline-none" placeholder="Council Name" onChange={(e)=>setForm({...form, councilName: e.target.value})} />
        <input className="w-full p-3.5 border border-gray-200 rounded-xl outline-none" placeholder="Council Number" onChange={(e)=>setForm({...form, councilNumber: e.target.value})} />
        <input className="w-full p-3.5 border border-gray-200 rounded-xl outline-none" placeholder="License Number" onChange={(e)=>setForm({...form, licenseNumber: e.target.value})} />
        
        <select className="w-full p-3.5 border border-gray-200 rounded-xl text-gray-500 bg-white" onChange={(e)=>setForm({...form, speciality: e.target.value})}>
            <option>Specialists</option>
            {specs.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
        </select>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#56b978] text-white py-4 rounded-xl font-bold text-lg mt-4 hover:bg-[#48a368] transition-colors"
        >
          {loading ? "Processing..." : "Done"}
        </button>
      </div>
    </div>
  );
}