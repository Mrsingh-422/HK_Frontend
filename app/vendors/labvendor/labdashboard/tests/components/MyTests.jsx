import React from 'react';
import { FaEye, FaTrash, FaEdit, FaCircle } from 'react-icons/fa';

export default function MyTests({ tests, onViewDetails, onEdit, onDelete }) {
  if (tests.length === 0) return <div className="p-20 text-center text-slate-400 font-bold">No tests found in your inventory.</div>;

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
            <th className="py-4 px-6">Test Name & Category</th>
            <th className="py-4 px-6">Pricing</th>
            <th className="py-4 px-6">Sample & TAT</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr> 
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tests.map((test) => (
            <tr key={test._id} className="bg-white transition-colors hover:bg-slate-50/30">
              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black">
                    <span className="text-xs">T</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-none mb-1.5">{test.testName}</p>
                    <div className="flex gap-2">
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase">{test.mainCategory}</span>
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">{test.testType || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-emerald-600 leading-none">₹{test.discountPrice || test.amount}</span>
                  <span className="text-[9px] text-slate-300 font-bold mt-1 uppercase tracking-tighter">MRP ₹{test.amount}</span>
                </div>
              </td>
              <td className="py-4 px-6 whitespace-nowrap">
                <div className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                    <p>Sample: {test.sampleType}</p>
                    <p>TAT: {test.reportTime}H</p>
                </div>
              </td>
              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <FaCircle size={7} className={test.isActive ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className={`text-[10px] font-black uppercase ${test.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
              </td>
              <td className="py-4 px-6 text-right whitespace-nowrap">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onViewDetails(test)} title="View" className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><FaEye size={16}/></button>
                  <button onClick={() => onEdit(test)} title="Edit" className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><FaEdit size={16}/></button>
                  <button onClick={() => onDelete(test._id)} title="Delete" className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><FaTrash size={16}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}