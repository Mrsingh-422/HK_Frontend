import React from "react";
import { FaArrowRight, FaStar } from "react-icons/fa";

const AllProducts = ({ items, onBuy }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((prod) => (
                <div key={prod.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex gap-6 group hover:shadow-2xl hover:shadow-[#08B36A]/5 transition-all duration-500">
                    <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 relative overflow-hidden rounded-3xl bg-slate-50 p-4">
                        <img 
                            src={prod.image} 
                            className="h-full w-full object-contain group-hover:scale-110 transition-all duration-700" 
                            alt={prod.name} 
                        />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex items-center gap-1 mb-1 text-yellow-400">
                                <FaStar size={10} /><FaStar size={10} /><FaStar size={10} />
                                <span className="text-[9px] text-slate-400 font-bold ml-1">TOP RATED</span>
                            </div>
                            <h3 className="text-sm md:text-lg font-black text-slate-800 line-clamp-2 leading-tight">
                                {prod.name}
                            </h3>
                            <p className="text-[#08B36A] font-bold text-[10px] uppercase mt-1">{prod.category}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xl md:text-2xl font-black text-slate-900">₹{prod.discountPrice}</p>
                            <button
                                onClick={() => onBuy(prod)}
                                className="text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:text-[#08B36A] transition-colors"
                            >
                                Details <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllProducts;