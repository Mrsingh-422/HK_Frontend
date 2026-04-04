import { FaUser, FaTimes, FaCircle, FaPhoneAlt, FaIdBadge, FaMotorcycle, FaCalendarAlt } from 'react-icons/fa';

export default function DriverInfoModal({ isOpen, onClose, driver }) {
    if (!isOpen || !driver) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <FaUser className="text-emerald-500" /> Driver Details
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-all"><FaTimes size={18} /></button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <div className="relative mb-4">
                        <img src={driver.image} alt="" className="w-24 h-24 rounded-full border-4 border-emerald-50 shadow-sm object-cover" />
                        <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${driver.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">{driver.name}</h3>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] mt-1">{driver.status} for duty</p>

                    <div className="w-full mt-8 space-y-3">
                        <DetailItem icon={<FaIdBadge className="text-gray-400" />} label="Employee ID" value={driver.id} />
                        <DetailItem icon={<FaPhoneAlt className="text-blue-500" />} label="Phone Number" value={driver.phone} />
                        <DetailItem icon={<FaMotorcycle className="text-emerald-500" />} label="Vehicle Type" value={driver.vehicleType} />
                        <DetailItem icon={<FaCalendarAlt className="text-amber-500" />} label="Joining Date" value={driver.joinDate} />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button onClick={onClose} className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">Close Profile</button>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{value}</span>
        </div>
    );
}