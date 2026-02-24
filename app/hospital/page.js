'use client'

import React, { useState } from 'react'

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

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission here
        console.log('Documents to upload:', documents)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Hospital Documentation
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Please upload the required documents to complete your hospital registration.
                        All documents must be clear and legible.
                    </p>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Hospital Image Upload */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button
                            type="submit"
                            className="px-8 py-4 bg-[#08B36A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-green-700 text-lg"
                        >
                            Submit Documentation
                        </button>
                        <button
                            type="button"
                            className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 text-lg"
                        >
                            Save for Later
                        </button>
                    </div>

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
    )
}

export default Page