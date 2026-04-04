/* ─── Utilities ─── */
const AVATAR_COLORS = [
  "#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899",
  "#f43f5e","#ef4444","#f97316","#eab308","#22c55e",
  "#14b8a6","#06b6d4","#3b82f6","#2563eb","#7c3aed",
];

export const getAvatarColor = (name) => {
  const n = name || "?";
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatName = (name) => {
  if (!name) return { last: "?", first: "", full: "?" };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { last: parts[0], first: "", full: parts[0] };
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(" ");
  return { last, first, full: `${last} ${first}` };
};

/* ─── Components ─── */
export function Avatar({ name = "?", size = 38, fontSize = 13, number, className = "" }) {
  const n = name || "?";
  const s = {
    width: size, height: size, borderRadius: size * 0.26,
    background: `linear-gradient(135deg, ${getAvatarColor(n)}, ${getAvatarColor(n + "x")})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize, fontWeight: 800, color: "white", letterSpacing: -0.5,
    boxShadow: `0 2px 8px ${getAvatarColor(n)}44`,
    flexShrink: 0, position: "relative",
  };
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div style={s}>{getInitials(n)}</div>
      {number != null && (
        <div className="absolute -bottom-1 -left-1 min-w-[18px] h-[18px] rounded-md bg-slate-800 border-[1.5px] border-slate-700 flex items-center justify-center text-[9px] font-extrabold text-slate-300 px-1 font-display">
          {number}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = { fit: "text-emerald-400", injured: "text-red-400", suspended: "text-amber-400" };
  const dots = { fit: "bg-emerald-400", injured: "bg-red-400", suspended: "bg-amber-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${colors[status] || "text-slate-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}
