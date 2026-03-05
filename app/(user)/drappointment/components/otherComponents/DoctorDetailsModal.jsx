import React from "react";
import {
  FaTimes, FaStar, FaMapMarkerAlt, FaVideo, FaHospital,
  FaGraduationCap, FaAward, FaCalendarAlt, FaClock, FaCheckCircle, FaLanguage
} from "react-icons/fa";

export default function DoctorDetailsModal({ isOpen, onClose, doctor }) {
  if (!isOpen || !doctor) return null;

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3 mt-6">
      <Icon className="text-[#08B36A] text-sm" />
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">{title}</h4>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="cursor-pointer absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">

        {/* Close Button */}
        <button onClick={onClose} className="cursor-pointer absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-500 hover:text-red-500 transition-colors">
          <FaTimes />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-10 no-scrollbar">

          {/* Header Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-slate-50 flex-shrink-0 shadow-lg">
              <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-50 text-[#08B36A] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {doctor.category}
                </span>
                <span className="text-slate-400 text-[10px] font-bold tracking-tight">Reg: {doctor.registrationNumber}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">{doctor.name}</h2>
              <p className="text-[#08B36A] font-bold text-sm md:text-base">{doctor.qualification}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-yellow-500 font-black text-sm">
                  <FaStar /> {doctor.rating} <span className="text-slate-300 font-medium text-xs">({doctor.totalReviews} reviews)</span>
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
                  {doctor.experience} Experience
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Left Column */}
            <div>
              <SectionTitle icon={FaUserMd} title="About Specialist" />
              <p className="text-slate-500 text-sm leading-relaxed">{doctor.about}</p>

              <SectionTitle icon={FaLanguage} title="Languages" />
              <div className="flex flex-wrap gap-2">
                {doctor.speaks.map(lang => (
                  <span key={lang} className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-600 rounded-lg">{lang}</span>
                ))}
              </div>

              <SectionTitle icon={FaGraduationCap} title="Education" />
              <div className="space-y-3">
                {doctor.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-slate-100 pl-3">
                    <p className="text-xs font-black text-slate-800">{edu.degree}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{edu.institute} • {edu.year}</p>
                  </div>
                ))}
              </div>

              <SectionTitle icon={FaAward} title="Awards" />
              {doctor.awards.map((award, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 p-2 rounded-xl">
                  <FaAward /> {award}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div>
              <SectionTitle icon={FaCalendarAlt} title="Availability" />
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                <div>
                  <p className="text-[9px] font-black text-[#08B36A] uppercase mb-1">Clinic Visit</p>
                  <p className="text-xs font-bold text-slate-700">{doctor.availability.clinicDays.join(", ")}</p>
                  <p className="text-[10px] text-slate-400">{doctor.availability.clinicTiming}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1"><FaMapMarkerAlt /> {doctor.clinicAddress}</p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Video Call</p>
                  <p className="text-xs font-bold text-slate-700">{doctor.availability.videoConsultation}</p>
                </div>
              </div>

              <SectionTitle icon={FaCheckCircle} title="Services Provided" />
              <div className="grid grid-cols-1 gap-2">
                {doctor.services.map(service => (
                  <div key={service} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <FaCheckCircle className="text-[#08B36A]" /> {service}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <SectionTitle icon={FaStar} title="Patient Reviews" />
          <div className="space-y-4 mb-20">
            {doctor.reviews.map((rev, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl">
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-black text-slate-800">{rev.patient}</p>
                  <div className="flex text-yellow-400 text-[10px]"><FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar /></div>
                </div>
                <p className="text-[11px] text-slate-500 italic">"{rev.comment}"</p>
                <p className="text-[9px] text-slate-300 mt-2 font-bold uppercase">{rev.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Footer Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3">
          <button className="cursor-pointer bg-blue-600 hover:bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center">
            <span className="text-sm">₹{doctor.videoConsultFee}</span>
            <span className="flex items-center gap-1 mt-0.5 opacity-80"><FaVideo /> Online Call</span>
          </button>
          <button className="cursor-pointer bg-[#08B36A] hover:bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center">
            <span className="text-sm">₹{doctor.clinicFee}</span>
            <span className="flex items-center gap-1 mt-0.5 opacity-80"><FaHospital /> Clinic Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper icon not imported in initial list
const FaUserMd = (props) => <FaHospital {...props} />;