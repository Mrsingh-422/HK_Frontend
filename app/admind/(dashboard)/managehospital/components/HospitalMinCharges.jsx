import React from 'react'

function HospitalMinCharges() {
    const charges = [
        { service: "General Ward (Per Day)", amount: 1500 },
        { service: "ICU Admission Fee", amount: 5000 },
        { service: "Ambulance Pick-up (Within 5km)", amount: 800 },
    ]

    return (
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {charges.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group hover:border-[#08B36A] transition-all">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.service}</p>
                        <div className="flex justify-between items-end">
                            <p className="text-3xl font-black text-slate-800">₹{item.amount}</p>
                            <button className="text-[#08B36A] font-bold text-xs">Update</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HospitalMinCharges