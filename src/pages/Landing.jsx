import { Link } from "react-router-dom";
import { useClub } from "../contexts/ClubContext";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { settings, players, matches } = useClub();
  const { user } = useAuth();

  const played = matches.filter(m => m.result);
  const wins = played.filter(m => parseInt(m.result[0]) > parseInt(m.result[2])).length;
  const totalGoals = players.reduce((s, p) => s + p.goals, 0);
  const nextMatch = matches.find(m => m.status === "upcoming");
  const lastMatch = [...played].pop();
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold tracking-wider text-white">
            {settings.clubName.toUpperCase()}
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/squad" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Squad</Link>
            <Link to="/matches" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Matches</Link>
            <Link to="/stats" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">Stats</Link>
            {user ? (
              <Link to="/manage" className="btn-primary text-sm !py-2 !px-4">Dashboard</Link>
            ) : (
              <Link to="/login" className="btn-primary text-sm !py-2 !px-4">Team Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="text-center">
            {/* Club badge */}
            <img src="/logo.png" alt={settings.clubName} className="w-28 h-28 md:w-40 md:h-40 mx-auto mb-8 rounded-full shadow-2xl shadow-brand-500/20 object-cover" />
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-wider mb-4">
              {settings.clubName.toUpperCase()}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-2">
              Coach: <span className="text-slate-200 font-semibold">{settings.coachName}</span>
            </p>
            <p className="text-sm text-slate-500 mb-10">Season 2025/26</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/squad" className="btn-primary text-base px-8 py-3">View Squad</Link>
              <Link to="/matches" className="btn-secondary text-base px-8 py-3">Fixtures & Results</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Squad Size", value: players.length, icon: "👥" },
            { label: "Matches Played", value: played.length, icon: "📋" },
            { label: "Wins", value: wins, icon: "🏆" },
            { label: "Goals Scored", value: totalGoals, icon: "⚽" },
          ].map((stat, i) => (
            <div key={i} className="card p-5 text-center hover:bg-white/[0.05] transition-colors">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-display text-3xl font-bold text-brand-400">{stat.value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest / Next Match */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {lastMatch && (
            <div className="card p-6">
              <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Latest Result</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white">
                    {lastMatch.venue === "Home" ? settings.clubName : lastMatch.opponent}
                    <span className="text-slate-500 mx-2 font-normal">vs</span>
                    {lastMatch.venue === "Home" ? lastMatch.opponent : settings.clubName}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {new Date(lastMatch.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {lastMatch.venue}
                  </div>
                </div>
                <div className="font-display text-3xl font-bold text-brand-400">{lastMatch.result}</div>
              </div>
            </div>
          )}
          {nextMatch && (
            <div className="card p-6 border-brand-400/20">
              <h3 className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-4">Next Fixture</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white">
                    {nextMatch.venue === "Home" ? settings.clubName : nextMatch.opponent}
                    <span className="text-slate-500 mx-2 font-normal">vs</span>
                    {nextMatch.venue === "Home" ? nextMatch.opponent : settings.clubName}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {new Date(nextMatch.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {nextMatch.time} · {nextMatch.venue}
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-brand-500/10 text-brand-400 text-sm font-bold">UPCOMING</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Scorer */}
      {topScorer && topScorer.goals > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="card p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-3xl">🥇</div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Top Scorer</div>
              <div className="text-xl font-bold text-white">{topScorer.name}</div>
              <div className="text-sm text-slate-400">{topScorer.goals} goals · {topScorer.assists} assists</div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-sm text-slate-600 tracking-wider">{settings.clubName.toUpperCase()}</div>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link to="/squad" className="hover:text-slate-400 transition-colors">Squad</Link>
            <Link to="/matches" className="hover:text-slate-400 transition-colors">Matches</Link>
            <Link to="/stats" className="hover:text-slate-400 transition-colors">Stats</Link>
            <Link to="/login" className="hover:text-slate-400 transition-colors">Team Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
