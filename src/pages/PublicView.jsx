import { Link, useNavigate } from "react-router-dom";
import { useClub } from "../contexts/ClubContext";
import { Avatar, StatusBadge, formatName } from "../components/shared";
import { SQUAD_SECTIONS } from "../data/defaults";

function PublicNav({ tab, clubName }) {
  const tabs = [
    { id: "squad", label: "Squad", path: "/squad" },
    { id: "matches", label: "Matches", path: "/matches" },
    { id: "stats", label: "Stats", path: "/stats" },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-3xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold tracking-wider text-white">{clubName.toUpperCase()}</Link>
          <Link to="/login" className="text-xs text-slate-500 hover:text-brand-400 transition-colors font-semibold">Team Login</Link>
        </div>
        <div className="flex gap-1 pb-2">
          {tabs.map(t => (
            <Link key={t.id} to={t.path}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                tab === t.id ? "bg-brand-400/15 text-brand-400" : "text-slate-500 hover:text-slate-300"
              }`}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function PublicView({ tab }) {
  const { players, matches, settings } = useClub();

  const played = matches.filter(m => m.result);
  const wins = played.filter(m => parseInt(m.result[0]) > parseInt(m.result[2])).length;
  const draws = played.filter(m => m.result[0] === m.result[2]).length;
  const losses = played.filter(m => parseInt(m.result[0]) < parseInt(m.result[2])).length;
  const totalGoals = players.reduce((s, p) => s + p.goals, 0);
  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...players].sort((a, b) => b.assists - a.assists).slice(0, 5);

  return (
    <div className="min-h-screen bg-surface">
      <PublicNav tab={tab} clubName={settings.clubName} />

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ═══ SQUAD ═══ */}
        {tab === "squad" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-display text-2xl font-bold tracking-wider">SQUAD</h1>
              <span className="text-sm text-slate-500">{players.length} players</span>
            </div>
            <p className="text-sm text-slate-500 mb-6">Coach: <span className="text-slate-300 font-semibold">{settings.coachName}</span></p>

            {SQUAD_SECTIONS.map(section => {
              const sectionPlayers = players
                .filter(p => section.positions.includes(p.position))
                .sort((a, b) => {
                  const aN = formatName(a.name);
                  const bN = formatName(b.name);
                  return aN.last.localeCompare(bN.last);
                });
              if (sectionPlayers.length === 0) return null;
              return (
                <div key={section.key} className="mb-6">
                  <h3 className="font-display text-base font-bold text-slate-200 mb-3 pb-2 border-b border-white/5">
                    {section.key}
                  </h3>
                  <div className="space-y-0.5">
                    {sectionPlayers.map(p => {
                      const { last, first } = formatName(p.name);
                      return (
                        <div key={p.id} className="flex items-center gap-4 py-3 px-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <Avatar name={p.name} size={42} fontSize={14} number={p.number} />
                          <div className="flex-1 ml-1">
                            <div className="text-sm">
                              <span className="font-bold text-slate-200">{last}</span>{" "}
                              <span className="text-slate-400">{first}</span>
                            </div>
                            {p.status !== "fit" && <div className="mt-0.5"><StatusBadge status={p.status} /></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ MATCHES ═══ */}
        {tab === "matches" && (
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider mb-6">FIXTURES & RESULTS</h1>

            {/* Upcoming */}
            {matches.some(m => m.status === "upcoming") && (
              <div className="mb-8">
                <h3 className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {matches.filter(m => m.status === "upcoming").map(m => (
                    <div key={m.id} className="card p-4 border-brand-400/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold">
                            {m.venue === "Home" ? settings.clubName : m.opponent}
                            <span className="text-slate-500 font-normal mx-2">vs</span>
                            {m.venue === "Home" ? m.opponent : settings.clubName}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(m.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {m.time} · {m.venue}
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-bold">UPCOMING</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {played.length > 0 && (
              <div>
                <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Results</h3>
                <div className="space-y-3">
                  {[...played].reverse().map(m => {
                    const isWin = parseInt(m.result[0]) > parseInt(m.result[2]);
                    const isDraw = m.result[0] === m.result[2];
                    const resultColor = isWin ? "text-emerald-400" : isDraw ? "text-amber-400" : "text-red-400";
                    return (
                      <div key={m.id} className="card p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold">
                              {m.venue === "Home" ? settings.clubName : m.opponent}
                              <span className="text-slate-500 font-normal mx-2">vs</span>
                              {m.venue === "Home" ? m.opponent : settings.clubName}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(m.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {m.venue}
                            </div>
                            {m.events && m.events.filter(e => e.type === "goal").length > 0 && (
                              <div className="text-[10px] text-slate-500 mt-1.5">
                                ⚽ {m.events.filter(e => e.type === "goal").map(e => {
                                  const pl = players.find(p => p.id === e.playerId);
                                  return `${pl ? pl.name.split(" ").pop() : "?"} ${e.minute}'`;
                                }).join(", ")}
                              </div>
                            )}
                          </div>
                          <div className="text-center ml-4">
                            <div className={`font-display text-2xl font-bold ${resultColor}`}>{m.result}</div>
                            <div className={`text-[9px] font-extrabold tracking-widest ${resultColor}`}>
                              {isWin ? "WIN" : isDraw ? "DRAW" : "LOSS"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ STATS ═══ */}
        {tab === "stats" && (
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider mb-6">SEASON STATS</h1>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: "Played", value: played.length },
                { label: "Record", value: `${wins}W ${draws}D ${losses}L` },
                { label: "Goals", value: totalGoals },
              ].map((s, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className="font-display text-2xl font-bold text-brand-400">{s.value}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Win rate bar */}
            {played.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Results Distribution</h3>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {wins > 0 && <div className="bg-emerald-600 flex items-center justify-center text-[10px] font-extrabold text-white" style={{ flex: wins }}>{wins}W</div>}
                  {draws > 0 && <div className="bg-amber-600 flex items-center justify-center text-[10px] font-extrabold text-white" style={{ flex: draws }}>{draws}D</div>}
                  {losses > 0 && <div className="bg-red-600 flex items-center justify-center text-[10px] font-extrabold text-white" style={{ flex: losses }}>{losses}L</div>}
                </div>
              </div>
            )}

            {/* Top Scorers */}
            <div className="mb-8">
              <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Top Scorers</h3>
              <div className="card divide-y divide-white/[0.04]">
                {topScorers.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <span className={`font-display text-base font-bold w-5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-600"}`}>{i + 1}</span>
                    <Avatar name={p.name} size={28} fontSize={10} />
                    <span className="flex-1 text-sm font-semibold">{p.name}</span>
                    <span className="font-display text-xl font-bold text-brand-400">{p.goals}</span>
                    <span className="text-[10px] text-slate-500 w-8">goals</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Assists */}
            <div>
              <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Top Assists</h3>
              <div className="card divide-y divide-white/[0.04]">
                {topAssists.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <span className={`font-display text-base font-bold w-5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-600"}`}>{i + 1}</span>
                    <Avatar name={p.name} size={28} fontSize={10} />
                    <span className="flex-1 text-sm font-semibold">{p.name}</span>
                    <span className="font-display text-xl font-bold text-blue-400">{p.assists}</span>
                    <span className="text-[10px] text-slate-500 w-8">assists</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-slate-600">
          {settings.clubName} · Season 2025/26
        </div>
      </footer>
    </div>
  );
}
