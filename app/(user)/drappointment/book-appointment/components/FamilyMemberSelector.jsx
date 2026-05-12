const FamilyMemberSelector = ({ selectedMember, onSelect }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await UserAPI.getFamilyMembers();
        if (res.success) setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <section className="mt-10">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Patient Details</h3>
      {loading ? (
        <div className="flex gap-4 animate-pulse">
          {[1, 2].map((i) => <div key={i} className="w-40 h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {/* Default Option for Self could be added here if needed */}
          {members.map((member) => (
            <button
              key={member._id}
              onClick={() => onSelect(member)}
              className={`flex-shrink-0 w-44 p-4 rounded-2xl border transition-all text-left
                ${selectedMember?._id === member._id 
                  ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' 
                  : 'border-slate-200 bg-white hover:border-emerald-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                  {member.profilePic ? (
                    <img src={member.profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                      {member.memberName[0]}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{member.memberName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.relation}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};