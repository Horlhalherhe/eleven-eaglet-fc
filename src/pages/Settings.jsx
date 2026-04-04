import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useClub } from "../contexts/ClubContext";
import { useAuth } from "../contexts/AuthContext";
import { db, isDemo } from "../lib/supabase";

const COLOR_PRESETS = [
  { name: "Navy/Gold", primary: "#1a2744", accent: "#d4a843" },
  { name: "Emerald", primary: "#059669", accent: "#34d399" },
  { name: "Blue", primary: "#2563eb", accent: "#60a5fa" },
  { name: "Red", primary: "#dc2626", accent: "#f87171" },
  { name: "Purple", primary: "#7c3aed", accent: "#a78bfa" },
  { name: "Orange", primary: "#ea580c", accent: "#fb923c" },
  { name: "Rose", primary: "#e11d48", accent: "#fb7185" },
  { name: "Cyan", primary: "#0891b2", accent: "#22d3ee" },
];

export default function Settings() {
  const { settings, updateSettings, resetAll } = useClub();
  const { user } = useAuth();
  const [clubName, setClubName] = useState(settings.clubName);
  const [coachName, setCoachName] = useState(settings.coachName);
  const [saved, setSaved] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    if (isDemo) return;
    const fetchAdmins = async () => {
      const data = await db.getAdmins();
      setAdmins(data);
    };
    fetchAdmins();
  }, []);

  const handleSave = () => {
    updateSettings({ clubName, coachName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleColorChange = (primary, accent) => {
    updateSettings({ primaryColor: primary, accentColor: accent });
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) { setInviteError("Enter an email address"); return; }
    if (!email.includes("@")) { setInviteError("Enter a valid email"); return; }
    if (admins.find(a => a.email === email)) { setInviteError("This email is already an admin"); return; }

    setInviteError("");
    try {
      await db.inviteAdmin(email, user?.email || "owner");
      const updated = await db.getAdmins();
      setAdmins(updated);
      setInviteEmail("");
      setInviteSuccess(`${email} has been invited!`);
      setTimeout(() => setInviteSuccess(""), 3000);
    } catch (err) {
      setInviteError(err.message || "Failed to invite admin");
    }
  };

  const handleRemoveAdmin = async (admin) => {
    if (admin.role === "owner") { setInviteError("Can't remove the owner"); return; }
    if (!window.confirm(`Remove ${admin.email} as admin?`)) return;
    await db.removeAdmin(admin.id);
    setAdmins(admins.filter(a => a.id !== admin.id));
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="border-b border-white/5 px-4 h-14 flex items-center justify-between">
          <Link to="/manage" className="text-sm text-slate-400 hover:text-white transition-colors font-semibold">← Back</Link>
          <h1 className="font-display text-lg font-bold tracking-wider">SETTINGS</h1>
          <div className="w-12" />
        </div>

        <div className="px-4 py-6 space-y-8">

          {/* Club Info */}
          <section>
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Club Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Club Name</label>
                <input value={clubName} onChange={e => setClubName(e.target.value)} className="input-field" placeholder="Eleven Eaglet FC" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Coach Name</label>
                <input value={coachName} onChange={e => setCoachName(e.target.value)} className="input-field" placeholder="Coach" />
              </div>
              <button onClick={handleSave} className="btn-primary w-full text-center">
                {saved ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Club Logo */}
          <section>
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Club Badge</h2>
            <div className="card p-6 text-center">
              <img src="/logo.png" alt="Club Badge" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg object-cover" />
              <p className="text-xs text-slate-500 mb-3">Upload your club badge or logo</p>
              <label className="btn-secondary inline-block cursor-pointer text-sm">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("Logo upload:", file.name);
                  }
                }} />
              </label>
              <p className="text-[10px] text-slate-600 mt-2">PNG or SVG, max 2MB.</p>
            </div>
          </section>

          {/* Club Colors */}
          <section>
            <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Club Colors</h2>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleColorChange(preset.primary, preset.accent)}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    settings.primaryColor === preset.primary
                      ? "border-white/30 bg-white/[0.06] scale-105"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex gap-1 justify-center mb-2">
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.accent }} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">{preset.name}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Admin Management */}
          {!isDemo && (
            <section>
              <h2 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">Admin Management</h2>

              {/* Invite */}
              <div className="card p-4 mb-4">
                <p className="text-sm text-slate-400 mb-3">Invite someone to manage the club. They'll be able to sign up and access the dashboard.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => { setInviteEmail(e.target.value); setInviteError(""); }}
                    onKeyDown={e => { if (e.key === "Enter") handleInvite(); }}
                    className="input-field flex-1"
                    placeholder="email@example.com"
                  />
                  <button onClick={handleInvite} className="btn-primary whitespace-nowrap !py-2 !px-4">
                    Invite
                  </button>
                </div>
                {inviteError && (
                  <div className="mt-2 text-xs text-red-400">{inviteError}</div>
                )}
                {inviteSuccess && (
                  <div className="mt-2 text-xs text-emerald-400">{inviteSuccess}</div>
                )}
              </div>

              {/* Admin List */}
              <div className="card divide-y divide-white/[0.04]">
                {admins.length === 0 && (
                  <div className="p-4 text-sm text-slate-500 text-center">No admins yet. You'll be added as owner automatically.</div>
                )}
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-400/15 flex items-center justify-center text-xs font-bold text-brand-400">
                      {admin.role === "owner" ? "👑" : "🛡"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{admin.email}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        {admin.role === "owner" ? "Owner" : "Admin"}
                        {admin.invited_by && admin.role !== "owner" && ` · Invited by ${admin.invited_by}`}
                      </div>
                    </div>
                    {admin.role !== "owner" && (
                      <button onClick={() => handleRemoveAdmin(admin)}
                        className="w-7 h-7 rounded-lg bg-red-400/10 text-red-400 flex items-center justify-center text-xs hover:bg-red-400/20 transition-colors"
                        title="Remove admin">✕</button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-600 mt-2">
                Invited admins need to sign up at <span className="text-brand-400 font-bold">/login</span> with the invited email to get access.
              </p>
            </section>
          )}

          {/* Danger Zone */}
          <section>
            <h2 className="text-xs text-red-400/70 font-bold uppercase tracking-wider mb-4">Danger Zone</h2>
            <div className="card p-4 border-red-400/10">
              <p className="text-sm text-slate-400 mb-3">Reset all club data back to the sample defaults. This cannot be undone.</p>
              <button onClick={() => { if (window.confirm("Reset all data? This cannot be undone.")) resetAll(); }} className="text-sm font-bold text-red-400 border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-400/5 transition-colors">
                Reset All Data
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
