'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaRegEye, FaRegEdit, FaShareSquare, FaPhoneAlt, FaCalendarAlt, 
  FaStethoscope, FaCapsules, FaCheckCircle, FaUser, FaArrowLeft, 
  FaPlus, FaTrash, FaTimes, FaStickyNote
} from 'react-icons/fa'
import DoctorAPI from '@/app/services/DoctorAPI';

export default function PrescriptionPage() {
  // List View States
  const [activeTab, setActiveTab] = useState('All');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Detail View States
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Form (Create/Edit) States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState(null);
  
  const initialFormState = {
    userId: "", // In a real app, this comes from the appointment data
    appointmentId: "",
    diagnosis: "", // Sent as string, converted to array on submit
    medicines: [
      { name: "", dosage: "1-0-1", frequency: "After meals", duration: "5 Days", instructions: "" }
    ],
    additionalNotes: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. FETCH ALL PRESCRIPTIONS
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await DoctorAPI.getAllPrescriptions(activeTab.toLowerCase());
      if (response.success) {
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

  // 2. FETCH SPECIFIC DETAILS
  const handleViewDetails = async (id) => {
    setLoading(true);
    try {
      const response = await DoctorAPI.getPrescriptionDetails(id);
      const resData = response.data || response;

      const detailMapping = {
        id: id,
        name: resData.patientInfo?.name || "N/A",
        age: resData.patientInfo?.age || "N/A",
        gender: resData.patientInfo?.gender || "N/A",
        phone: resData.patientInfo?.phone || "N/A",
        diagnosis: resData.clinicalDetails?.diagnosis?.join(", ") || "N/A",
        symptoms: resData.clinicalDetails?.symptoms || "N/A", 
        date: resData.deliveryInfo?.sentTime || "N/A",
        status: resData.deliveryInfo?.status || "Sent",
        sentTime: resData.deliveryInfo?.sentTime || "N/A",
        medicines: resData.clinicalDetails?.medicines || [],
        notes: resData.clinicalDetails?.notes || "No additional notes."
      };

      setSelectedPrescription(detailMapping);
      setShowDetail(true);
    } catch (error) {
      alert("Could not load details.");
    } finally {
      setLoading(false);
    }
  };

  // 3. CREATE / EDIT LOGIC
  const openCreateForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEditForm = () => {
    // Populate form with existing data
    setFormData({
      diagnosis: selectedPrescription.diagnosis,
      medicines: [...selectedPrescription.medicines],
      additionalNotes: selectedPrescription.notes
    });
    setCurrentPrescriptionId(selectedPrescription.id);
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

        if (isEditing) {
            await DoctorAPI.updatePrescription(currentPrescriptionId, payload);
            alert("Prescription updated!");
        } else {
            await DoctorAPI.createPrescription(payload);
            alert("Prescription created successfully!");
        }
        setShowForm(false);
        fetchPrescriptions();
        if(showDetail) handleViewDetails(currentPrescriptionId);
    } catch (error) {
        alert("Action failed. Check console.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // 4. RESEND
  const handleResend = async (id) => {
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
            {showDetail && (
                <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FaArrowLeft className="text-gray-600"/>
                </button>
            )}
            <h1 className="text-xl font-black uppercase tracking-tight">
                {showDetail ? "Prescription Detail" : "Prescriptions"}
            </h1>
        </div>

        <div className="flex items-center gap-4">
            {!showDetail && (
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
            )}
            <button 
                onClick={openCreateForm}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5BB584] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#4a9c6f] transition-all shadow-md"
            >
                <FaPlus /> New Prescription
            </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {loading && (
            <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BB584]"></div>
            </div>
        )}

        {/* --- VIEW 1: TABLE LIST --- */}
        {!showDetail && !loading && (
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagnosis</th>
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
                                <p className="text-sm font-bold text-gray-600 truncate max-w-[200px]">{item.symptoms}</p>
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

        {/* --- VIEW 2: FULL DETAILS --- */}
        {showDetail && !loading && selectedPrescription && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-[#5BB584]">
                        <FaUser size={30}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">{selectedPrescription.name}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedPrescription.gender} • {selectedPrescription.age} Years</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={openEditForm} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold uppercase hover:bg-gray-200 transition-all">
                        <FaRegEdit/> Edit
                    </button>
                    <button onClick={() => handleResend(selectedPrescription.id)} className="flex items-center gap-2 px-4 py-2 bg-[#5BB584] text-white rounded-xl text-xs font-bold uppercase shadow-sm">
                        <FaShareSquare/> Resend
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <FaStethoscope className="text-[#5BB584]"/>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Diagnosis & Symptoms</h3>
                        </div>
                        <p className="text-lg font-black text-gray-800">{selectedPrescription.diagnosis}</p>
                        <p className="text-sm text-gray-500 mt-1">{selectedPrescription.symptoms}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <FaCapsules className="text-[#5BB584]"/>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Medicines</h3>
                        </div>
                        {selectedPrescription.medicines.map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="font-black text-gray-900">{med.name}</p>
                                    <p className="text-[11px] text-gray-500 font-bold uppercase">{med.dosage} • {med.frequency} • {med.duration}</p>
                                    {med.instructions && <p className="text-[11px] text-[#5BB584] mt-1 font-bold italic">Note: {med.instructions}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <FaStickyNote className="text-yellow-500"/>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Notes</h3>
                        </div>
                        <p className="text-sm font-bold text-gray-600 leading-relaxed italic">"{selectedPrescription.notes}"</p>
                    </div>
                    <div className="bg-[#5BB584] rounded-[2rem] p-6 text-white shadow-lg">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Delivery Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold opacity-80">Status</span>
                                <span className="font-black uppercase">{selectedPrescription.status}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold opacity-80">Sent On</span>
                                <span className="font-black">{selectedPrescription.sentTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL FORM: CREATE / EDIT --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-lg font-black uppercase tracking-tighter">
                        {isEditing ? "Edit Prescription" : "Create Prescription"}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <FaTimes/>
                    </button>
                </div>

                <form onSubmit={handleSubmitPrescription} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                    {!isEditing && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">User ID</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-sm font-bold mt-1 focus:ring-2 focus:ring-[#5BB584]"
                                    value={formData.userId}
                                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                    placeholder="Enter User ID"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Appointment ID</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-sm font-bold mt-1 focus:ring-2 focus:ring-[#5BB584]"
                                    value={formData.appointmentId}
                                    onChange={(e) => setFormData({...formData, appointmentId: e.target.value})}
                                    placeholder="Enter Appointment ID"
                                />
                            </div>
                        </div>
                    )}

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
                        {isEditing ? "Update Prescription" : "Send Prescription"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}