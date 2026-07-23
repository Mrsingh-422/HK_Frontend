'use client';
import React, { useState, useEffect } from 'react';
import { 
  FaRegEye, FaRegEdit, FaShareSquare, FaPhoneAlt, FaCalendarAlt, 
  FaStethoscope, FaCapsules, FaCheckCircle, FaUser, FaArrowLeft, 
  FaPlus, FaTrash, FaTimes, FaStickyNote, FaSpinner
} from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI';

// Import template relative link
import DigitalPrescriptionTemplate from '../videocallappointments/components/DigitalPrescriptionTemplate';

export default function PrescriptionPage() {
  // List View States
  const [activeTab, setActiveTab] = useState('All');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Digital Template Modal States
  const [selectedPrescriptionPayload, setSelectedPrescriptionPayload] = useState(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  // Form (Edit) States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: "",
    medicines: [],
    additionalNotes: ""
  });

  // 1. FETCH ALL PRESCRIPTIONS
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await DoctorAPI.getAllPrescriptions(activeTab.toLowerCase());
      if (response && response.success) {
        setPrescriptions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [activeTab]);

  // 2. FETCH SPECIFIC DETAILS & OPEN PRINT SUMMARY SHEETS
  const handleViewDetails = async (id) => {
    setLoading(true);
    try {
      const response = await DoctorAPI.getPrescriptionDetails(id);
      if (response) {
        setSelectedPrescriptionPayload(response);
        setIsTemplateOpen(true);
      }
    } catch (error) {
      console.error("Could not load prescription details:", error);
      alert("Could not load details.");
    } finally {
      setLoading(false);
    }
  };

  // 3. EDIT LOGIC
  const openEditForm = (prescriptionRawData) => {
    const raw = prescriptionRawData?.data || prescriptionRawData || {};
    const medicinesList = raw.clinicalDetails?.medicines || [];
    const diagnosisList = raw.clinicalDetails?.diagnosis || [];

    setFormData({
      diagnosis: Array.isArray(diagnosisList) ? diagnosisList.join(', ') : diagnosisList,
      medicines: [...medicinesList],
      additionalNotes: raw.clinicalDetails?.symptoms || ""
    });
    setCurrentPrescriptionId(raw._id || raw.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const addMedicineRow = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
    });
  };

  const removeMedicineRow = (index) => {
    const updated = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: updated });
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            ...formData,
            diagnosis: typeof formData.diagnosis === 'string' ? formData.diagnosis.split(',').map(s => s.trim()) : formData.diagnosis
        };

        await DoctorAPI.updatePrescription(currentPrescriptionId, payload);
        alert("Prescription updated successfully!");
        setShowForm(false);
        fetchPrescriptions();
    } catch (error) {
        alert("Action failed. Check console.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // 4. RESEND
  const handleResend = async (id) => {
    if (!id) return;
    try {
      await DoctorAPI.resendPrescription(id);
      alert("Prescription notification resent to patient!");
    } catch (error) {
      alert("Resend failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <div className="p-6 md:px-10 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-tight">
                Prescription History
            </h1>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {['All', 'Today'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {loading && (
            <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BB584]"></div>
            </div>
        )}

        {/* --- VIEW: TABLE LIST --- */}
        {!loading && (
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Summary</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {prescriptions.map((item) => (
                        <tr key={item.id} className="hover:bg-green-50/40 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#5BB584] group-hover:text-white transition-colors">
                                        <FaUser size={14}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{item.patientName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-sm font-bold text-gray-600 truncate max-w-[200px]">{item.symptoms || "General Care"}</p>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-xs font-bold text-gray-500">{item.date}</span>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    item.status === 'Sent' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {item.status} <FaCheckCircle size={8}/>
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button 
                                    onClick={() => handleViewDetails(item.id)}
                                    className="p-2.5 bg-gray-50 rounded-lg text-gray-400 hover:text-[#5BB584] hover:bg-green-50 transition-all"
                                    title="View Medical Summary Sheet"
                                >
                                    <FaRegEye size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {prescriptions.length === 0 && (
                <div className="p-20 text-center text-gray-400 font-black uppercase text-xs tracking-widest">No Prescriptions Found</div>
            )}
          </div>
        )}
      </div>

      {/* --- PREVIEW PAD SUMMARY MODAL OVERLAY --- */}
      <DigitalPrescriptionTemplate
          isOpen={isTemplateOpen}
          onClose={() => {
              setIsTemplateOpen(false);
              setSelectedPrescriptionPayload(null);
          }}
          data={selectedPrescriptionPayload}
          onEdit={openEditForm}
          onResend={handleResend}
      />

      {/* --- MODAL FORM: EDIT FORM --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-lg font-black uppercase tracking-tighter">
                        Edit Prescription
                    </h2>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <FaTimes/>
                    </button>
                </div>

                <form onSubmit={handleSubmitPrescription} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Diagnosis (Comma separated)</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-sm font-bold mt-1 focus:ring-2 focus:ring-[#5BB584]"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                            placeholder="Fever, Common Cold..."
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Medicines</label>
                            <button type="button" onClick={addMedicineRow} className="text-[#5BB584] text-xs font-black uppercase">+ Add Row</button>
                        </div>
                        {formData.medicines.map((med, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                <div className="flex gap-3">
                                    <input 
                                        placeholder="Medicine Name"
                                        className="flex-1 px-3 py-2 bg-white rounded-lg text-xs font-bold border border-gray-200"
                                        value={med.name}
                                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                                        required
                                    />
                                    <input 
                                        placeholder="Dosage (1-0-1)"
                                        className="w-24 px-3 py-2 bg-white rounded-lg text-xs font-bold border border-gray-200"
                                        value={med.dosage}
                                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeMedicineRow(idx)} className="text-red-400 hover:text-red-600">
                                        <FaTrash size={14}/>
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <input 
                                        placeholder="Frequency"
                                        className="px-3 py-2 bg-white rounded-lg text-xs font-bold border border-gray-200"
                                        value={med.frequency}
                                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                                    />
                                    <input 
                                        placeholder="Duration"
                                        className="px-3 py-2 bg-white rounded-lg text-xs font-bold border border-gray-200"
                                        value={med.duration}
                                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                                    />
                                    <input 
                                        placeholder="Instructions"
                                        className="px-3 py-2 bg-white rounded-lg text-xs font-bold border border-gray-200"
                                        value={med.instructions}
                                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Additional Advice</label>
                        <textarea 
                            rows="3"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-sm font-bold mt-1 focus:ring-2 focus:ring-[#5BB584]"
                            value={formData.additionalNotes}
                            onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                            placeholder="Avoid cold water, rest..."
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-[#5BB584] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#4a9c6f] transition-all shadow-lg"
                    >
                        Update Prescription
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}