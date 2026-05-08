export default function ConsumablesPicker({ items, selectedItems, onToggle }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-3 mt-8">
            <h4 className="text-sm font-black text-slate-800 ml-2 uppercase tracking-widest">Medical Consumables</h4>
            {items.map((item) => (
                <div 
                    key={item.masterItemId._id}
                    onClick={() => onToggle(item)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedItems.find(i => i.consumableId === item.masterItemId._id) 
                        ? "border-teal-500 bg-teal-50" : "border-slate-100 bg-white"
                    }`}
                >
                    <div>
                        <p className="text-sm font-bold text-slate-800">{item.masterItemId.itemName}</p>
                        <p className="text-[10px] font-bold text-slate-400">₹{item.finalPrice} / {item.masterItemId.unitType}</p>
                    </div>
                    <input type="checkbox" checked={!!selectedItems.find(i => i.consumableId === item.masterItemId._id)} readOnly className="accent-teal-500 w-5 h-5" />
                </div>
            ))}
        </div>
    );
}