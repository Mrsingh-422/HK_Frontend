"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function RegisterAsHospital() {
  const { registerAsHospital, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    registerAs: "",
    hospitalName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    password: "",
    termsAccepted: false,
  });

  const [documents, setDocuments] = useState({
    hospitalImage: [],
    licenseDocument: [],
    otherDocuments: []
  });

  const [previewUrls, setPreviewUrls] = useState({
    hospitalImage: [],
    licenseDocument: []
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // ================= FETCH COUNTRIES =================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data || []);
      } catch {
        console.error("Failed to load countries");
      }
    };
    fetchCountries();
  }, []);

  // ================= FETCH STATES =================
  const fetchStates = async (countryId) => {
    try {
      const data = await getStatesByCountry(countryId);
      setStates(data || []);
      setCities([]);
    } catch {
      console.error("Failed to load states");
    }
  };

  // ================= FETCH CITIES =================
  const fetchCities = async (stateId) => {
    try {
      const data = await getCitiesByState(stateId);
      setCities(data || []);
    } catch {
      console.error("Failed to load cities");
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") {
      fetchStates(value);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
    if (name === "state") {
      fetchCities(value);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  // ================= DOCUMENT HANDLERS =================
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      if (type === 'hospitalImage' || type === 'licenseDocument') {
        // Add new files to existing array
        setDocuments(prev => ({ 
          ...prev, 
          [type]: [...prev[type], ...files] 
        }));

        // Create preview URLs for new files
        const newUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => ({ 
          ...prev, 
          [type]: [...prev[type], ...newUrls] 
        }));
      } else if (type === 'otherDocuments') {
        // For multiple files
        setDocuments(prev => ({ 
          ...prev, 
          otherDocuments: [...prev.otherDocuments, ...files] 
        }));
      }
    }
  };

  const handleRemoveFile = (type, index) => {
    if (type === 'hospitalImage' || type === 'licenseDocument') {
      // Remove file at specific index
      const updatedFiles = documents[type].filter((_, i) => i !== index);
      setDocuments(prev => ({ ...prev, [type]: updatedFiles }));
      
      // Remove preview URL and revoke object URL
      if (previewUrls[type][index]) {
        URL.revokeObjectURL(previewUrls[type][index]);
        const updatedUrls = previewUrls[type].filter((_, i) => i !== index);
        setPreviewUrls(prev => ({ ...prev, [type]: updatedUrls }));
      }
    }
  };

  const handleRemoveSingleOtherDoc = (index) => {
    const updatedFiles = documents.otherDocuments.filter((_, i) => i !== index);
    setDocuments(prev => ({ ...prev, otherDocuments: updatedFiles }));
  };

  const handleClearAllOtherDocs = () => {
    setDocuments(prev => ({ ...prev, otherDocuments: [] }));
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (
      !formData.registerAs ||
      !formData.hospitalName ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      !formData.password
    ) {
      return "All fields are required.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!formData.termsAccepted) {
      return "You must accept terms & conditions.";
    }

    return null;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const selectedCountry = countries.find(
        (c) => c.id == formData.country
      );
      const selectedState = states.find(
        (s) => s.id == formData.state
      );
      const selectedCity = cities.find(
        (c) => c.id == formData.city
      );

      const finalData = {
        ...formData,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
      };

      // await registerAsHospital(finalData);
      console.log("Hospital Registration Data:", finalData);
      console.log("Documents to upload:", documents);

      setSuccess(
        "Hospital Registered Successfully! Please complete your documentation."
      );
      
      // Show document upload modal
      setShowDocumentModal(true);

    } catch (err) {
      setError(err?.message || err);
    }
  };

  // ================= DOCUMENT SUBMIT =================
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required documents
    if (documents.hospitalImage.length === 0 || documents.licenseDocument.length === 0) {
      alert('Please upload at least one hospital image and one license document');
      return;
    }

    try {
      // Here you would upload documents to your server
      console.log('Uploading documents:', documents);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowDocumentModal(false);
      setSuccess("Documentation submitted successfully! Waiting for admin approval.");
      
      // Redirect to dashboard or home
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents. Please try again.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">

          {/* LEFT IMAGE */}
          <div className="w-full lg:w-1/2 transition-transform duration-500 hover:scale-105">
            <img
              src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
              alt="Register"
              className="w-full rounded-xl shadow-2xl"
            />
          </div>

          {/* RIGHT FORM */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              Get Started
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <select
                name="registerAs"
                value={formData.registerAs}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              >
                <option value="">Register As</option>
                <option value="GovernmentHospital">Government Hospital</option>
                <option value="PrivateHospital">Private Hospital</option>
                <option value="CharityHospital">Charity Hospital</option>
              </select>

              <input
                type="text"
                placeholder="Hospital name"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              />

              <input
                type="email"
                placeholder="Hospital email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              />

              <input
                type="text"
                placeholder="Hospital phone number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              />

              <p className="text-sm text-gray-500 -mt-2">
                We'll never share your phone with anyone else.
              </p>

              {/* LOCATION ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
                >
                  <option value="">Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!formData.country}
                  className="border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A] disabled:bg-gray-100"
                >
                  <option value="">State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className="border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A] disabled:bg-gray-100"
                >
                  <option value="">City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#08B36A]"
              />

              {/* Terms */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="accent-[#08B36A]"
                />
                <span className="text-sm text-gray-600">
                  Allow All Terms & Conditions on this site
                </span>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-[#08B36A] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-green-700 disabled:opacity-70"
              >
                {loading ? "Registering..." : "Register →"}
              </button>

              <p className="text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    closeModal();
                    openModal("login");
                  }}
                  className="text-[#08B36A] cursor-pointer font-medium hover:underline"
                >
                  Login
                </span>
              </p>

            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
              Hospital
            </h2>
            <p className="text-base md:text-lg leading-8 text-gray-600 max-w-3xl">
              Join our platform and manage appointments, doctors, and patients efficiently.
            </p>
          </div>
        </div>

      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Upload Hospital Documents
              </h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-8">

              {/* Hospital Images Upload */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-[#08B36A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Hospital Images <span className="text-red-500 ml-1">*</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#08B36A] transition-colors bg-white">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="modal-hospital-image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload hospital images
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, GIF, PDF up to 10MB each
                          </span>
                        </label>
                        <input
                          id="modal-hospital-image"
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'hospitalImage')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-white max-h-64 overflow-y-auto">
                    {previewUrls.hospitalImage.length > 0 ? (
                      <div className="space-y-3">
                        {previewUrls.hospitalImage.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Hospital Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('hospitalImage', index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-gray-400">
                        <span className="text-sm">Preview will appear here</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {documents.hospitalImage.length > 0 && (
                  <p className="text-sm text-[#08B36A] mt-2">
                    {documents.hospitalImage.length} image(s) selected
                  </p>
                )}
              </div>

              {/* License Documents Upload */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-[#08B36A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  License Documents <span className="text-red-500 ml-1">*</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#08B36A] transition-colors bg-white">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="modal-license-doc" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload license documents
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, PNG, JPG up to 10MB each
                          </span>
                        </label>
                        <input
                          id="modal-license-doc"
                          type="file"
                          multiple
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'licenseDocument')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-white max-h-64 overflow-y-auto">
                    {previewUrls.licenseDocument.length > 0 ? (
                      <div className="space-y-3">
                        {previewUrls.licenseDocument.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`License Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile('licenseDocument', index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-gray-400">
                        <span className="text-sm">Preview will appear here</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {documents.licenseDocument.length > 0 && (
                  <p className="text-sm text-[#08B36A] mt-2">
                    {documents.licenseDocument.length} document(s) selected
                  </p>
                )}
              </div>

              {/* Other Documents Upload */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-[#08B36A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Other Documents (Optional)
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#08B36A] transition-colors bg-white">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="modal-other-docs" className="cursor-pointer">
                        <span className="text-base font-medium text-gray-900">
                          Click to upload additional documents
                        </span>
                        <span className="block text-sm text-gray-500 mt-1">
                          Registration certificates, NOC, etc.
                        </span>
                        <span className="text-xs text-gray-400 mt-2 block">
                          PDF, DOC, DOCX, Images up to 10MB each
                        </span>
                      </label>
                      <input
                        id="modal-other-docs"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'otherDocuments')}
                      />
                    </div>
                  </div>

                  {/* Selected Files List */}
                  {documents.otherDocuments.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {documents.otherDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded group">
                            <div className="flex items-center flex-1 min-w-0">
                              <svg className="w-4 h-4 text-[#08B36A] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-600 truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleOtherDoc(index)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleClearAllOtherDocs}
                        className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Documentation Progress</span>
                  <span className="text-sm font-medium text-[#08B36A]">
                    {[
                      documents.hospitalImage.length > 0 ? 1 : 0,
                      documents.licenseDocument.length > 0 ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}/2 Required
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#08B36A] h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${([documents.hospitalImage.length > 0 ? 1 : 0, documents.licenseDocument.length > 0 ? 1 : 0].reduce((a, b) => a + b, 0) / 2) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end sticky bottom-0 bg-white pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#08B36A] text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Submit Documents
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default RegisterAsHospital;