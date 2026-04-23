import { FaClock, FaTruck, FaCalendarAlt } from 'react-icons/fa';

const PharmacyDeliverySection = ({ deliveryOption, setDeliveryOption, selectedSlot, openSlotModal }) => {
    const options = [
        { id: 'fast', title: 'Fast Delivery', desc: 'Within 3 Hours', icon: <FaClock /> },
        { id: 'normal', title: 'Normal', desc: 'Next Day', icon: <FaTruck /> },
        { id: 'slot', title: 'Slot Delivery', desc: selectedSlot || 'Choose Slot', icon: <FaCalendarAlt /> }
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Speed</h3>
            <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => opt.id === 'slot' ? openSlotModal() : setDeliveryOption(opt.id)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center text-center gap-1 ${
                            deliveryOption === opt.id 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-100 bg-gray-50 hover:border-emerald-200'
                        }`}
                    >
                        <div className={`${deliveryOption === opt.id ? 'text-emerald-600' : 'text-gray-400'}`}>{opt.icon}</div>
                        <p className={`text-[10px] font-black uppercase ${deliveryOption === opt.id ? 'text-emerald-700' : 'text-slate-700'}`}>{opt.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 leading-tight">{opt.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
export default PharmacyDeliverySection;