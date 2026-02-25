'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'

function Page() {
    const [documents, setDocuments] = useState({
        hospitalImage: [],
        licenseDocument: [],
        otherDocuments: []
    })

    const [previewUrls, setPreviewUrls] = useState({
        hospitalImage: [],
        licenseDocument: []
    })

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const { uploadHospitalDocuments, loading, hospitalToken, hospital } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    const router = useRouter();

    useEffect(() => {
        // Check localStorage directly
        const checkAuth = () => {
            const hospitalToken = localStorage.getItem("hospitalToken");
            const hospitalData = localStorage.getItem("hospital");

            if (!hospitalToken || !hospitalData) {
                alert("Please login as a hospital to access this page");
                router.push('/');
                return;
            }

            // Parse hospital data
            const hospital = JSON.parse(hospitalData);

            // Check profile status
            if (hospital.profileStatus === 'Approved') {
                router.push('/hospital');
                return;
            } else if (hospital.profileStatus === 'Pending') {
                setStatusMessage('Your documents are under review. Please wait for admin approval.');
                setShowStatusModal(true);
                // Still show the page but with a message
            } else if (hospital.profileStatus === 'Rejected') {
                setStatusMessage(`Your documents were rejected. Reason: ${hospital.rejectionReason || 'No reason provided'}. Please upload new documents.`);
                setShowStatusModal(true);
                // Allow re-upload
            }
            setIsChecking(false);
        };

        checkAuth();
    }, [router]);

    // Show loading while checking authentication
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files)

        if (files.length > 0) {
            if (type === 'hospitalImage' || type === 'licenseDocument') {
                // Add new files to existing array
                setDocuments(prev => ({
                    ...prev,
                    [type]: [...prev[type], ...files]
                }))

                // Create preview URLs for new files
                const newUrls = files.map(file => URL.createObjectURL(file))
                setPreviewUrls(prev => ({
                    ...prev,
                    [type]: [...prev[type], ...newUrls]
                }))
            } else if (type === 'otherDocuments') {
                // For multiple files
                setDocuments(prev => ({
                    ...prev,
                    otherDocuments: [...prev.otherDocuments, ...files]
                }))
            }
        }
    }

    const handleRemoveFile = (type, index) => {
        if (type === 'hospitalImage' || type === 'licenseDocument') {
            // Remove file at specific index
            const updatedFiles = documents[type].filter((_, i) => i !== index)
            setDocuments(prev => ({ ...prev, [type]: updatedFiles }))

            // Remove preview URL and revoke object URL
            if (previewUrls[type][index]) {
                URL.revokeObjectURL(previewUrls[type][index])
                const updatedUrls = previewUrls[type].filter((_, i) => i !== index)
                setPreviewUrls(prev => ({ ...prev, [type]: updatedUrls }))
            }
        } else {
            // Remove all other documents
            setDocuments(prev => ({ ...prev, otherDocuments: [] }))
        }
    }

    const handleRemoveSingleOtherDoc = (index) => {
        const updatedFiles = documents.otherDocuments.filter((_, i) => i !== index)
        setDocuments(prev => ({ ...prev, otherDocuments: updatedFiles }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Check if required documents exist
        if (documents.hospitalImage.length === 0 || documents.licenseDocument.length === 0) {
            alert('Please upload at least one hospital image and one license document');
            return;
        }

        const formData = new FormData();

        // Append all hospital images
        documents.hospitalImage.forEach((file) => {
            formData.append(`hospitalImage`, file);
        });

        // Append all license documents
        documents.licenseDocument.forEach((file) => {
            formData.append(`licenseDocument`, file);
        });

        // Append all other documents
        documents.otherDocuments.forEach((file) => {
            formData.append(`otherDocuments`, file);
        });

        try {
            const res = await uploadHospitalDocuments(formData);
            console.log('Upload successful:', res);

            // Update hospital data in localStorage
            if (res.data) {
                localStorage.setItem('hospital', JSON.stringify(res.data));
            }

            setUploadSuccess(true);
            setStatusMessage('Documents uploaded successfully! Your profile is now pending approval. You will be notified once approved.');
            setShowStatusModal(true);

            // Clear documents after successful upload
            setDocuments({
                hospitalImage: [],
                licenseDocument: [],
                otherDocuments: []
            });

            // Clear preview URLs
            Object.values(previewUrls).forEach(urlArray => {
                urlArray.forEach(url => URL.revokeObjectURL(url));
            });
            setPreviewUrls({
                hospitalImage: [],
                licenseDocument: []
            });

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload documents. Please try again.');
        }
    }

    const handleCloseModal = () => {
        setShowStatusModal(false);
        setUploadSuccess(false);

        // If upload was successful, we might want to redirect or stay
        if (uploadSuccess) {
            // Optionally refresh the page to show updated status
            window.location.reload();
        }
    }

    // Get current hospital status
    const hospitalData = hospital || JSON.parse(localStorage.getItem('hospital') || '{}');
    const currentStatus = hospitalData.profileStatus || 'Incomplete';

    return (
        <>
            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center">
                            {uploadSuccess ? (
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : currentStatus === 'Pending' ? (
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            ) : currentStatus === 'Rejected' ? (
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            ) : null}

                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {uploadSuccess ? 'Upload Successful!' :
                                    currentStatus === 'Pending' ? 'Under Review' :
                                        currentStatus === 'Rejected' ? 'Documents Rejected' : 'Status Update'}
                            </h3>

                            <p className="text-gray-600 mb-6">{statusMessage}</p>

                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-[#08B36A] text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {uploadSuccess ? 'Continue' : 'Got it'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Hospital Documentation
                        </h1>

                        {/* Status Banner */}
                        <div className={`mb-6 p-4 rounded-lg ${currentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            currentStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                currentStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                            }`}>
                            <p className="font-semibold">
                                Status: {currentStatus}
                                {currentStatus === 'Rejected' && hospitalData.rejectionReason &&
                                    ` - Reason: ${hospitalData.rejectionReason}`
                                }
                            </p>
                            {currentStatus === 'Pending' && (
                                <p className="text-sm mt-1">Your documents are being reviewed by our team. This usually takes 24-48 hours.</p>
                            )}
                            {currentStatus === 'Rejected' && (
                                <p className="text-sm mt-1">Please upload new documents for re-verification.</p>
                            )}
                        </div>

                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            {currentStatus === 'Rejected'
                                ? 'Please upload new documents for re-verification. Make sure all documents are clear and valid.'
                                : 'Please upload the required documents to complete your hospital registration. All documents must be clear and legible.'
                            }
                        </p>
                    </div>

                    {/* Main Form - Disable if pending or approved */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Disable overlay for Pending status */}
                        {currentStatus === 'Pending' && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-2xl z-10 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-gray-600 font-semibold">Documents under review</p>
                                        <p className="text-sm text-gray-500">You cannot upload new documents while your profile is pending</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hospital Image Upload */}
                        <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 ${currentStatus === 'Pending' ? 'opacity-50' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-6 h-6 text-[#08B36A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Hospital Images
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#08B36A] transition-colors">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <div className="mt-4">
                                            <label htmlFor="hospital-image" className="cursor-pointer">
                                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                                    Click to upload hospital images
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    PNG, JPG, GIF, PDF up to 10MB each (Multiple files allowed)
                                                </span>
                                            </label>
                                            <input
                                                id="hospital-image"
                                                type="file"
                                                multiple
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'hospitalImage')}
                                                disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Area */}
                                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                    {previewUrls.hospitalImage.length > 0 ? (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {previewUrls.hospitalImage.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Hospital Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('hospitalImage', index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                            {/* File Count Display */}
                            {documents.hospitalImage.length > 0 && (
                                <p className="text-sm text-[#08B36A] mt-2">
                                    {documents.hospitalImage.length} image(s) selected
                                </p>
                            )}
                        </div>

                        {/* License Document Upload */}
                        <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 ${currentStatus === 'Pending' ? 'opacity-50' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-6 h-6 text-[#08B36A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Hospital License Documents
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#08B36A] transition-colors">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div className="mt-4">
                                            <label htmlFor="license-doc" className="cursor-pointer">
                                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                                    Click to upload license documents
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    PDF, PNG, JPG up to 10MB each (Multiple files allowed)
                                                </span>
                                            </label>
                                            <input
                                                id="license-doc"
                                                type="file"
                                                multiple
                                                accept=".pdf,image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'licenseDocument')}
                                                disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Area */}
                                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                    {previewUrls.licenseDocument.length > 0 ? (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {previewUrls.licenseDocument.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`License Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('licenseDocument', index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                            {/* File Count Display */}
                            {documents.licenseDocument.length > 0 && (
                                <p className="text-sm text-[#08B36A] mt-2">
                                    {documents.licenseDocument.length} document(s) selected
                                </p>
                            )}
                        </div>

                        {/* Other Documents Upload */}
                        <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 ${currentStatus === 'Pending' ? 'opacity-50' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-6 h-6 text-[#08B36A] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Other Documents (Optional)
                            </h2>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#08B36A] transition-colors">
                                <div className="text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div className="mt-4">
                                        <label htmlFor="other-docs" className="cursor-pointer">
                                            <span className="text-lg font-medium text-gray-900">
                                                Drop files here or click to upload
                                            </span>
                                            <span className="block text-sm text-gray-500 mt-1">
                                                Upload additional documents (registration certificates, NOC, etc.)
                                            </span>
                                            <span className="text-xs text-gray-400 mt-2 block">
                                                PDF, DOC, DOCX, Images up to 10MB each (Multiple files allowed)
                                            </span>
                                        </label>
                                        <input
                                            id="other-docs"
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, 'otherDocuments')}
                                            disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
                                        />
                                    </div>
                                </div>

                                {/* Selected Files List */}
                                {documents.otherDocuments.length > 0 && (
                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
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
                                                            disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
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
                                            onClick={() => handleRemoveFile('otherDocuments')}
                                            className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center"
                                            disabled={currentStatus === 'Pending' || currentStatus === 'Approved'}
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

                        {/* Submit Button - Only show if not pending or approved */}
                        {currentStatus !== 'Pending' && currentStatus !== 'Approved' && (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-[#08B36A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-green-700 text-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Uploading...' : currentStatus === 'Rejected' ? 'Re-submit Documentation' : 'Submit Documentation'}
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 text-lg"
                                >
                                    Save for Later
                                </button>
                            </div>
                        )}

                        {/* Approved Message */}
                        {currentStatus === 'Approved' && (
                            <div className="text-center mt-8 p-6 bg-green-50 rounded-xl">
                                <p className="text-green-600 font-semibold">Your profile has been approved!</p>
                                <button
                                    onClick={() => router.push('/hospital')}
                                    className="mt-4 px-6 py-2 bg-[#08B36A] text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Go to Hospital Dashboard
                                </button>
                            </div>
                        )}

                        {/* Pending Message */}
                        {currentStatus === 'Pending' && (
                            <div className="text-center mt-8 p-6 bg-yellow-50 rounded-xl">
                                <p className="text-yellow-600 font-semibold">Your documents are under review.</p>
                                <p className="text-sm text-gray-600 mt-2">You will be notified once your profile is approved.</p>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className="mt-8 bg-white rounded-lg p-4">
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
                            <p className="text-xs text-gray-500 mt-2">
                                * Hospital images and license documents are required. Other documents are optional.
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </>
    )
}

export default Page