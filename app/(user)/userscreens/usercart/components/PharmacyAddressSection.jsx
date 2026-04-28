import React from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const PharmacyAddressSection = ({ addresses, selectedAddress, setSelectedAddress, isLoading }) => {
    const router = useRouter();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                <button 
                    onClick={() => router.push('/profile/addresses')} 
                    className="text-[10px] font-bold text-emerald-600 uppercase hover:underline"
                >
                    + Add New
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-4">
                    <FaSpinner className="animate-spin text-emerald-500" />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-[11px] text-gray-400 font-bold uppercase">No addresses found</p>
                    <button 
                        onClick={() => router.push('/profile/addresses')}
                        className="mt-2 text-[10px] bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-black"
                    >
                        Create Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                        <div
                            key={addr._id}
                            onClick={() => setSelectedAddress(addr)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedAddress?._id === addr._id 
                                ? 'border-emerald-600 bg-emerald-50' 
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <FaMapMarkerAlt className={selectedAddress?._id === addr._id ? 'text-emerald-600 mt-1' : 'text-gray-400 mt-1'} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-900 uppercase">
                                            {addr.addressType || 'Other'}
                                        </span>
                                        {addr.isDefault && (
                                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                                DEFAULT
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-700 mt-1">{addr.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                        {addr.houseNo}{addr.sector ? `, ${addr.sector}` : ''}, {addr.city}, {addr.pincode}
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-1 font-bold">{addr.phone}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PharmacyAddressSection;