"use client";
import React from "react";
import { FaTimes } from "react-icons/fa";

function ShowLabVendorDetail({ vendor, onClose }) {
    if (!vendor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm z-5000">
            <div className="bg-white w-[95%] max-w-2xl rounded-2xl shadow-2xl p-6 relative animate-fadeIn">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition cursor-pointer"
                >
                    <FaTimes size={18} />
                </button>

                {/* Header */}
                <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Lab Vendor Details
                    </h2>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                    <div>
                        <p className="text-gray-500">Vendor Name</p>
                        <p className="font-semibold text-gray-800">{vendor.name}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-semibold text-gray-800">{vendor.phone}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">Status</p>
                        <p className={`font-semibold ${vendor.status ? "text-emerald-500" : "text-red-500"}`}>
                            {vendor.status ? "Active" : "Inactive"}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">Account Verification</p>
                        <p className={`font-semibold ${vendor.verified === "Approved" ? "text-emerald-500" : "text-yellow-500"}`}>
                            {vendor.verified}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">Join Date</p>
                        <p className="font-semibold text-gray-800">{vendor.joinDate}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">Image</p>
                        <div className="w-24 h-20 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mt-1">
                            {vendor.image ? (
                                <img
                                    src={vendor.image}
                                    alt="vendor"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-gray-400">No Image</span>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ShowLabVendorDetail;