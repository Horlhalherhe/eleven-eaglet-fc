import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import { Avatar, StatusBadge, formatName } from "../components/shared";
import { SQUAD_SECTIONS, POS_OPTIONS, POSITIONS_MAP, EVENT_TYPES } from "../data/defaults";
import { db, isDemo } from "../lib/supabase";

/* ─── Sub-components ─── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md max-h-[85vh] bg-surface-raised rounded-t-2xl sm:rounded-2xl p-5 overflow-y-auto border-t border-white/10 sm:border sm:border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-lg font-bold tracking-wider">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AttendancePill({ value, onChange }) {
  const opts = [
    { v: "yes", icon: "✓", cls: value === "yes" ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/30" : "bg-white/[0.03] text-slate-600 border-transparent" },
    { v: "maybe", icon: "?", cls: value === "maybe" ? "bg-amber-400/15 text-amber-400 border-amber-400/30" : "bg-white/[0.03] text-slate-600 border-transparent" },
    { v: "no", icon: "✕", cls: value === "no" ? "bg-red-400/15 text-red-400 border-red-400/30" : "bg-white/[0.03] text-slate-600 border-transparent" },
  ];
  return (
    <div className="flex gap-1">
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`w-7 h-7 rounded-md border text-xs font-extrabold flex items-center justify-center transition-all ${o.cls}`}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { players, matches, feed, settings, updatePlayers, updateMatches, updateFeed, updateSettings, resetAll } = useClub();
  const navigate = useNavigate();

  const [tab, setTab] = useState("squad");
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: "", number: "", position: "GK" });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [attendanceMatch, setAttendanceMatch] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: "goal", playerId: "", minute: "" });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [pendingPlayers, setPendingPlayers] = useState([]);

  // Fetch pending players from Supabase
  useEffect(() => {
    if (isDemo) return;
    const fetchPending = async () => {
      const pending = await db.getPendingPlayers();
      setPendingPlayers(pending);
    };
    fetchPending();
  }, [players]);

  const approvePlayer = async (player) => {
    if (isDemo) return;
    await db.approvePlayer(player.id);
    setPendingPlayers(prev => prev.filter(p => p.id !== player.id));
    // Add to local state too
    updatePlayers([...players, { ...player, approved: true }]);
  };

  const rejectPlayer = async (id) => {
    if (isDemo) return;
    await db.deletePlayer(id);
    setPendingPlayers(prev => prev.filter(p => p.id !== id));
  };

  const { formation = "4-3-3", lineup = {} } = settings;
  const played = matches.filter(m => m.result);
  const wins = played.filter(m => parseInt(m.result[0]) > parseInt(m.result[2])).length;
  const draws = played.filter(m => m.result[0] === m.result[2]).length;
  const losses = played.filter(m => parseInt(m.result[0]) < parseInt(m.result[2])).length;
  const totalGoals = players.reduce((s, p) => s + p.goals, 0);
  const lineupIds = Object.values(lineup);
  const availableForLineup = players.filter(p => !lineupIds.includes(p.id) && p.status === "fit");

  /* ── Player actions ── */
  const addPlayer = () => {
    if (!newPlayer.name || !newPlayer.number) return;
    updatePlayers([...players, { id: Date.now(), name: newPlayer.name, number: parseInt(newPlayer.number), position: newPlayer.position, goals: 0, assists: 0, apps: 0, yellows: 0, reds: 0, status: "fit" }]);
    setNewPlayer({ name: "", number: "", position: "GK" });
    setShowAddPlayer(false);
  };

  const saveEditPlayer = () => {
    if (!editingPlayer) return;
    updatePlayers(players.map(p => p.id === editingPlayer.id ? editingPlayer : p));
    setEditingPlayer(null);
  };

  const deletePlayer = (id) => { updatePlayers(players.filter(p => p.id !== id)); setEditingPlayer(null); };

  /* ── Tactics actions ── */
  const assignPlayer = (playerId) => {
    if (!selectedSlot) return;
    const next = { ...lineup };
    Object.keys(next).forEach(k => { if (next[k] === playerId) delete next[k]; });
    next[selectedSlot] = playerId;
    setSelectedSlot(null);
    updateSettings({ lineup: next });
  };

  const removeFromLineup = (slotId) => {
    const next = { ...lineup };
    delete next[slotId];
    updateSettings({ lineup: next });
  };

  /* ── Match actions ── */
  const addMatchEvent = () => {
    if (!newEvent.playerId || !newEvent.minute || !selectedMatch) return;
    const evt = { id: `e${Date.now()}`, type: newEvent.type, playerId: parseInt(newEvent.playerId), minute: parseInt(newEvent.minute) };
    const next = matches.map(m => m.id === selectedMatch.id ? { ...m, events: [...(m.events || []), evt].sort((a, b) => a.minute - b.minute) } : m);
    updateMatches(next);
    setSelectedMatch(next.find(m => m.id === selectedMatch.id));
    setNewEvent({ type: "goal", playerId: "", minute: "" });
    setAddingEvent(false);
  };

  const removeMatchEvent = (matchId, eventId) => {
    const next = matches.map(m => m.id === matchId ? { ...m, events: (m.events || []).filter(e => e.id !== eventId) } : m);
    updateMatches(next);
    setSelectedMatch(next.find(m => m.id === matchId));
  };

  const setAttendanceValue = (matchId, playerId, value) => {
    const next = matches.map(m => {
      if (m.id !== matchId) return m;
      return { ...m, attendance: { ...(m.attendance || {}), [playerId]: value } };
    });
    updateMatches(next);
    if (attendanceMatch?.id === matchId) setAttendanceMatch(next.find(m => m.id === matchId));
  };

  const addPost = () => {
    if (!newPost.trim()) return;
    updateFeed([{ id: Date.now(), author: "You", time: "Just now", text: newPost, type: "message", replies: 0 }, ...feed]);
    setNewPost("");
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const tabs = [
    { id: "squad", label: "Squad", icon: "👥" },
    { id: "tactics", label: "Tactics", icon: "📋" },
    { id: "matches", label: "Matches", icon: "⚽" },
    { id: "stats", label: "Stats", icon: "📊" },
    { id: "feed", label: "Feed", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-surface max-w-lg mx-auto relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-surface-raised to-surface-overlay border-b border-white/5 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold tracking-wider">{settings.clubName.toUpperCase()}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Coach: <span className="text-slate-300 font-semibold">{settings.coachName}</span> · Matchday {played.length}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings" className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 flex items-center justify-center hover:bg-white/10 transition text-sm">⚙</Link>
            <button onClick={handleSignOut} className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 flex items-center justify-center hover:bg-white/10 transition text-sm" title="Sign out">↗</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 px-3 py-2 bg-surface border-b border-white/[0.03] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-colors ${
              tab === t.id ? "bg-brand-400/15 text-brand-400" : "text-slate-600 hover:text-slate-400"
            }`}>
            <span className="text-base">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-10">

        {/* ═══ SQUAD ═══ */}
        {tab === "squad" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-lg font-bold tracking-wider">SQUAD</h2>
              <button onClick={() => setShowAddPlayer(!showAddPlayer)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${showAddPlayer ? "border-brand-400/30 bg-brand-400/10 text-brand-400" : "border-white/10 text-brand-400 hover:bg-brand-400/5"}`}>
                {showAddPlayer ? "✕ Cancel" : "+ Add"}
              </button>
            </div>

            {showAddPlayer && (
              <div className="p-3 mb-4 rounded-xl bg-brand-500/5 border border-brand-400/10 space-y-2">
                <div className="flex gap-2">
                  <input value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} placeholder="Player name" className="input-field flex-[2]" />
                  <input value={newPlayer.number} onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value })} placeholder="#" type="number" className="input-field flex-[0.5] text-center" />
                </div>
                <div className="flex gap-2">
                  <select value={newPlayer.position} onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })} className="input-field">
                    {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={addPlayer} className="btn-primary whitespace-nowrap !py-2">Add</button>
                </div>
              </div>
            )}

            {/* Pending Registrations */}
            {pendingPlayers.length > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-brand-400/5 border border-brand-400/15">
                <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">
                  Pending Registrations ({pendingPlayers.length})
                </h3>
                <div className="space-y-2">
                  {pendingPlayers.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <Avatar name={p.name} size={40} fontSize={13} number={p.number} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">{p.name}</div>
                        <div className="text-[10px] text-slate-500">
                          #{p.number} · {p.position} · {p.preferred_foot} foot
                          {p.phone && ` · ${p.phone}`}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => approvePlayer(p)}
                          className="w-8 h-8 rounded-lg bg-emerald-400/15 text-emerald-400 flex items-center justify-center text-sm font-bold hover:bg-emerald-400/25 transition-colors"
                          title="Approve">✓</button>
                        <button onClick={() => rejectPlayer(p.id)}
                          className="w-8 h-8 rounded-lg bg-red-400/15 text-red-400 flex items-center justify-center text-sm font-bold hover:bg-red-400/25 transition-colors"
                          title="Reject">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share join link */}
            {!isDemo && (
              <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <div className="text-lg">🔗</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-500 font-semibold">Share this link with your players:</div>
                  <div className="text-xs text-brand-400 font-bold truncate">{window.location.origin}/join</div>
                </div>
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join`)}
                  className="text-[10px] font-bold text-slate-400 border border-white/10 px-2 py-1 rounded hover:bg-white/5 transition-colors flex-shrink-0">
                  Copy
                </button>
              </div>
            )}

            {SQUAD_SECTIONS.map(section => {
              const sp = players.filter(p => section.positions.includes(p.position)).sort((a, b) => formatName(a.name).last.localeCompare(formatName(b.name).last));
              if (!sp.length) return null;
              return (
                <div key={section.key} className="mb-5">
                  <h3 className="font-display text-sm font-bold text-slate-200 mb-2 pb-1.5 border-b border-white/5">{section.key}</h3>
                  {sp.map(p => {
                    const { last, first } = formatName(p.name);
                    return (
                      <div key={p.id} onClick={() => setEditingPlayer({ ...p })}
                        className="flex items-center gap-3.5 py-2.5 px-2 border-b border-white/[0.03] cursor-pointer hover:bg-white/[0.02] transition-colors">
                        <Avatar name={p.name} size={42} fontSize={14} number={p.number} />
                        <div className="flex-1 ml-0.5">
                          <div className="text-sm"><span className="font-bold">{last}</span> <span className="text-slate-400 font-normal">{first}</span></div>
                          {p.status !== "fit" && <div className="mt-0.5"><StatusBadge status={p.status} /></div>}
                        </div>
                        <div className="text-slate-700 text-lg">☆</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ TACTICS ═══ */}
        {tab === "tactics" && (
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider mb-3">FORMATION</h2>
            <div className="flex gap-1.5 mb-4">
              {Object.keys(POSITIONS_MAP).map(f => (
                <button key={f} onClick={() => updateSettings({ formation: f, lineup: {} })}
                  className={`px-4 py-1.5 rounded-full font-display text-sm font-bold tracking-wide transition-colors ${
                    formation === f ? "bg-brand-400 text-surface" : "bg-white/5 text-slate-500 hover:bg-white/10"
                  }`}>{f}</button>
              ))}
            </div>

            {/* Pitch */}
            <div className="relative w-full rounded-2xl overflow-hidden border-[3px] border-white/10" style={{ paddingBottom: "140%", background: "linear-gradient(180deg, #1a6b3c 0%, #15803d 30%, #1a6b3c 50%, #15803d 70%, #1a6b3c 100%)" }}>
              <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full">
                <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <line x1="5" y1="70" x2="95" y2="70" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <rect x="22" y="5" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <rect x="33" y="5" width="34" height="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <rect x="22" y="113" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                <rect x="33" y="127" width="34" height="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
              </svg>
              {(POSITIONS_MAP[formation] || []).map(pos => {
                const player = lineup[pos.id] ? players.find(p => p.id === lineup[pos.id]) : null;
                const isSel = selectedSlot === pos.id;
                return (
                  <div key={pos.id} onClick={() => setSelectedSlot(selectedSlot === pos.id ? null : pos.id)}
                    className="absolute cursor-pointer text-center z-10"
                    style={{ left: `${pos.x}%`, top: `${pos.y / 1.4}%`, transform: "translate(-50%, -50%)" }}>
                    <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-extrabold transition-all"
                      style={{
                        background: player ? (isSel ? "#fbbf24" : "rgba(255,255,255,0.95)") : (isSel ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.15)"),
                        border: isSel ? "2px solid #fbbf24" : player ? "2px solid transparent" : "2px dashed rgba(255,255,255,0.35)",
                        color: player ? (isSel ? "#1a1a2e" : "#1a6b3c") : "rgba(255,255,255,0.5)",
                        fontSize: player ? 14 : 10,
                        boxShadow: player ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                      }}>
                      {player ? player.number : pos.label}
                    </div>
                    <div className="text-[9px] font-bold text-white mt-0.5" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {player ? player.name.split(" ").pop() : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSlot && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-400">Select player for {selectedSlot}</span>
                  {lineup[selectedSlot] && <button onClick={() => removeFromLineup(selectedSlot)} className="text-[11px] font-bold text-red-400 border border-red-400/30 px-2 py-0.5 rounded">Remove</button>}
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto">
                  {availableForLineup.map(p => (
                    <button key={p.id} onClick={() => assignPlayer(p.id)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                      <Avatar name={p.name} size={28} fontSize={10} />
                      <span className="text-sm font-semibold flex-1">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.position}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] text-slate-500 font-semibold">{Object.keys(lineup).length}/11 positions filled</div>
              <div className="h-1 rounded bg-white/5 mt-2">
                <div className="h-full rounded bg-gradient-to-r from-brand-600 to-brand-400 transition-all" style={{ width: `${(Object.keys(lineup).length / 11) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ MATCHES ═══ */}
        {tab === "matches" && (
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider mb-4">FIXTURES</h2>
            <div className="space-y-2">
              {matches.map(m => {
                const isWin = m.result && parseInt(m.result[0]) > parseInt(m.result[2]);
                const isDraw = m.result && m.result[0] === m.result[2];
                return (
                  <div key={m.id}
                    className={`card p-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors ${m.status === "upcoming" ? "border-brand-400/15" : ""}`}
                    onClick={() => m.status === "upcoming" ? setAttendanceMatch(m) : setSelectedMatch(m)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">
                          {m.venue === "Home" ? settings.clubName : m.opponent}
                          <span className="text-slate-500 font-normal mx-1.5">vs</span>
                          {m.venue === "Home" ? m.opponent : settings.clubName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {new Date(m.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {m.time} · {m.venue}
                        </div>
                      </div>
                      <div className="text-center ml-3">
                        {m.result ? (
                          <div className={`font-display text-xl font-bold ${isWin ? "text-emerald-400" : isDraw ? "text-amber-400" : "text-red-400"}`}>{m.result}</div>
                        ) : (
                          <div className="px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400 text-[11px] font-bold">UPCOMING</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STATS ═══ */}
        {tab === "stats" && (
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider mb-4">SEASON STATS</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[{ l: "Played", v: played.length }, { l: "Record", v: `${wins}W ${draws}D ${losses}L` }, { l: "Goals", v: totalGoals }].map((s, i) => (
                <div key={i} className="card p-3 text-center">
                  <div className="font-display text-xl font-bold text-brand-400">{s.v}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            {played.length > 0 && (
              <div className="flex h-7 rounded-lg overflow-hidden mb-6">
                {wins > 0 && <div className="bg-emerald-600 flex items-center justify-center text-[10px] font-extrabold text-white" style={{ flex: wins }}>{wins}W</div>}
                {draws > 0 && <div className="bg-amber-600 flex items-center justify-center text-[10px] font-extrabold text-white" style={{ flex: draws }}>{draws}D</div>}
                {losses > 0 && <div className="bg-red-600 flex items-center justify-center text-[10px] font-extrabold text-white" style={{ flex: losses }}>{losses}L</div>}
              </div>
            )}
            {[{ title: "TOP SCORERS", data: [...players].sort((a, b) => b.goals - a.goals).slice(0, 5), key: "goals", color: "text-brand-400", unit: "goals" },
              { title: "TOP ASSISTS", data: [...players].sort((a, b) => b.assists - a.assists).slice(0, 5), key: "assists", color: "text-blue-400", unit: "assists" }].map(section => (
              <div key={section.title} className="mb-6">
                <h3 className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">{section.title}</h3>
                {section.data.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2.5 py-2 border-b border-white/[0.03]">
                    <span className={`font-display text-sm font-bold w-5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-600"}`}>{i + 1}</span>
                    <Avatar name={p.name} size={26} fontSize={9} />
                    <span className="flex-1 text-sm font-semibold">{p.name}</span>
                    <span className={`font-display text-lg font-bold ${section.color}`}>{p[section.key]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ═══ FEED ═══ */}
        {tab === "feed" && (
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider mb-4">TEAM FEED</h2>
            <div className="card p-3 mb-4">
              <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Post an update..."
                rows={2} className="input-field resize-none" />
              <div className="flex justify-end mt-2">
                <button onClick={addPost}
                  className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${newPost.trim() ? "bg-brand-600 text-white hover:bg-brand-500" : "bg-slate-800 text-slate-600"}`}>
                  Post
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {feed.map(item => (
                <div key={item.id} className={`card p-3.5 ${item.type === "announcement" ? "border-brand-400/10" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={item.author} size={26} fontSize={9} />
                    <span className="text-xs font-bold">{item.author}</span>
                    {item.type === "announcement" && <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">📢 Announcement</span>}
                    <span className="text-[10px] text-slate-600 ml-auto">{item.time}</span>
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed">{item.text}</div>
                  <div className="text-[10px] text-slate-600 mt-2">💬 {item.replies} replies</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}
      {editingPlayer && (
        <Modal title="EDIT PLAYER" onClose={() => setEditingPlayer(null)}>
          <div className="flex justify-center mb-4"><Avatar name={editingPlayer.name} size={64} fontSize={22} /></div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Name</label>
              <input value={editingPlayer.name} onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })} className="input-field" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Number</label>
                <input type="number" value={editingPlayer.number} onChange={e => setEditingPlayer({ ...editingPlayer, number: parseInt(e.target.value) || 0 })} className="input-field" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Position</label>
                <select value={editingPlayer.position} onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })} className="input-field">
                  {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Status</label>
              <div className="flex gap-1.5">
                {["fit","injured","suspended"].map(s => (
                  <button key={s} onClick={() => setEditingPlayer({ ...editingPlayer, status: s })}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${editingPlayer.status === s
                      ? s === "fit" ? "bg-emerald-400 text-surface" : s === "injured" ? "bg-red-400 text-surface" : "bg-amber-400 text-surface"
                      : "bg-white/5 text-slate-500"
                    }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {[["goals","Goals"],["assists","Assists"],["apps","Apps"],["yellows","🟨"],["reds","🟥"]].map(([k,l]) => (
                <div key={k} className="flex-1">
                  <label className="text-[10px] text-slate-500 font-semibold mb-1 block text-center">{l}</label>
                  <input type="number" value={editingPlayer[k]} onChange={e => setEditingPlayer({ ...editingPlayer, [k]: parseInt(e.target.value) || 0 })} className="input-field text-center" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => deletePlayer(editingPlayer.id)} className="px-4 py-2.5 rounded-xl border border-red-400/30 text-red-400 text-sm font-bold hover:bg-red-400/5 transition-colors">Delete</button>
              <button onClick={saveEditPlayer} className="btn-primary flex-1 text-center">Save Changes</button>
            </div>
          </div>
        </Modal>
      )}

      {selectedMatch && (
        <Modal title={`VS ${selectedMatch.opponent.toUpperCase()}`} onClose={() => { setSelectedMatch(null); setAddingEvent(false); }}>
          <div className="text-center mb-4">
            <div className="font-display text-3xl font-bold">{selectedMatch.result || "—"}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {new Date(selectedMatch.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {selectedMatch.venue}
            </div>
          </div>
          <h4 className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">Match Events</h4>
          {(selectedMatch.events || []).length === 0 && !addingEvent && <p className="text-sm text-slate-600 text-center py-4">No events logged yet</p>}
          <div className="space-y-1.5 mb-3">
            {(selectedMatch.events || []).map(evt => {
              const pl = players.find(p => p.id === evt.playerId);
              const meta = EVENT_TYPES.find(e => e.type === evt.type);
              return (
                <div key={evt.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-base w-6 text-center">{meta?.icon}</span>
                  <span className="font-display text-sm font-bold text-amber-400 w-8">{evt.minute}'</span>
                  <span className="text-sm font-semibold flex-1">{pl?.name || "Unknown"}</span>
                  <button onClick={() => removeMatchEvent(selectedMatch.id, evt.id)} className="w-5 h-5 rounded bg-red-400/10 text-red-400 text-[10px] flex items-center justify-center">✕</button>
                </div>
              );
            })}
          </div>
          {addingEvent ? (
            <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-400/10 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {EVENT_TYPES.map(et => (
                  <button key={et.type} onClick={() => setNewEvent({ ...newEvent, type: et.type })}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${newEvent.type === et.type ? "bg-brand-400 text-surface" : "bg-white/5 text-slate-500"}`}>
                    {et.icon} {et.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={newEvent.playerId} onChange={e => setNewEvent({ ...newEvent, playerId: e.target.value })} className="input-field flex-[2]">
                  <option value="">Select player</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}
                </select>
                <input type="number" placeholder="Min" value={newEvent.minute} onChange={e => setNewEvent({ ...newEvent, minute: e.target.value })} className="input-field flex-[0.5] text-center" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingEvent(false)} className="btn-secondary !py-1.5 text-xs">Cancel</button>
                <button onClick={addMatchEvent} className={`flex-1 text-center text-xs font-bold py-1.5 rounded-lg transition-colors ${newEvent.playerId && newEvent.minute ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-600"}`}>Add Event</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingEvent(true)} className="w-full py-2.5 rounded-xl border border-dashed border-brand-400/30 text-brand-400 text-xs font-bold hover:bg-brand-400/5 transition-colors">+ Add Match Event</button>
          )}
        </Modal>
      )}

      {attendanceMatch && (
        <Modal title={`ATTENDANCE — ${attendanceMatch.opponent.toUpperCase()}`} onClose={() => setAttendanceMatch(null)}>
          <div className="text-xs text-slate-500 mb-4">
            {new Date(attendanceMatch.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {attendanceMatch.time} · {attendanceMatch.venue}
          </div>
          <div className="flex gap-3 mb-4 p-3 rounded-xl bg-white/[0.02]">
            {[{ l: "Available", v: "yes", c: "text-emerald-400" }, { l: "Maybe", v: "maybe", c: "text-amber-400" }, { l: "Unavailable", v: "no", c: "text-red-400" }].map(s => (
              <div key={s.v} className="flex-1 text-center">
                <div className={`font-display text-xl font-bold ${s.c}`}>{Object.values(attendanceMatch.attendance || {}).filter(v => v === s.v).length}</div>
                <div className="text-[10px] text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-white/[0.02]">
                <Avatar name={p.name} size={30} fontSize={10} />
                <span className="flex-1 text-sm font-semibold">{p.name}</span>
                <AttendancePill value={(attendanceMatch.attendance || {})[p.id]} onChange={v => setAttendanceValue(attendanceMatch.id, p.id, v)} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
