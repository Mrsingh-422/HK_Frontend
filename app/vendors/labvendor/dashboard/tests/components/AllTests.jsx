import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

export default function AllTests({ tests, onViewDetails }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="bg-slate-50">
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
            <th className="px-8 py-5">Standard Test Template</th>
            <th className="px-8 py-5">Category</th>
            <th className="px-8 py-5">Global MRP</th>
            <th className="px-8 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tests.map((test) => (
            <tr key={test._id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6 font-bold text-slate-700">{test.testName}</td>
              <td className="px-8 py-6">
                <span className="text-[10px] font-black text-slate-500 uppercase">{test.mainCategory}</span>
              </td>
              <td className="px-8 py-6 font-black text-slate-800">₹{test.standardMRP}</td>
              <td className="px-8 py-6 text-right">
                <button onClick={() => onViewDetails(test)} className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-600 text-[10px] font-black rounded-xl hover:border-emerald-600 hover:text-emerald-600 transition-all uppercase tracking-widest inline-flex items-center gap-2">
                  View Specs <FaArrowRight />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}