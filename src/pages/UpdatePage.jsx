import { useState } from "react";
import { Link } from "react-router-dom";
import { db, supabase } from "../lib/supabase";
import { useClub } from "../contexts/ClubContext";

const POS_OPTIONS = ["GK","LB","CB","RB","LWB","RWB","CM","CDM","CAM","LM","RM","LW","RW","ST","CF"];

export default function UpdatePage() {
  const { settings, players } = useClub();
  const [step, setStep] = useState("lookup"); // lookup | editing | saving | saved
  const [lookupNumber, setLookupNumber] = useState("");
  const [player, setPlayer] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");

  const findPlayer = () => {
    if (!lookupNumber) { setError("Enter your shirt number"); return; }
    const found = players.find(p => p.number === parseInt(lookupNumber));
    if (!found) { setError("No player found with that number. Make sure you've been approved by the coach."); return; }
    setPlayer({ ...found });
    setPhotoPreview(found.photo_url || null);
    setError("");
    setStep("editing");
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB"); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveChanges = async () => {
    if (!player.name.trim()) { setError("Name can't be empty"); return; }
    setError("");
    setStep("saving");

    try {
      let photo_url = player.photo_url;
      if (photo && supabase) {
        photo_url = await db.uploadPhoto(photo);
      }

      const updates = {
        name: player.name.trim(),
        number: parseInt(player.number) || player.number,
        position: player.position,
        preferred_foot: player.preferred_foot,
        phone: player.phone?.trim() || null,
        date_of_birth: player.date_of_birth || null,
        photo_url,
      };

      if (supabase) {
        await db.updatePlayer(player.id, updates);
      }

      setStep("saved");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Try again.");
      setStep("editing");
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <img src="/logo.png" alt={settings.clubName} className="w-20 h-20 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-2xl font-bold tracking-wider mb-3">COMING SOON</h1>
          <p className="text-sm text-slate-400 mb-6">Profile editing will be available once the database is set up.</p>
          <Link to="/" className="btn-secondary text-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (step === "saved") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-400/20 flex items-center justify-center text-4xl">✓</div>
          <h1 className="font-display text-2xl font-bold tracking-wider mb-3">UPDATED!</h1>
          <p className="text-sm text-slate-400 mb-8">Your profile has been saved.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStep("lookup"); setPlayer(null); setPhoto(null); setLookupNumber(""); }} className="btn-secondary text-sm">Edit Again</button>
            <Link to="/" className="btn-primary text-sm">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <nav className="border-b border-white/5">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center gap-3">
          <img src="/logo.png" alt={settings.clubName} className="w-8 h-8 rounded-full" />
          <span className="font-display text-base font-bold tracking-wider">{settings.clubName.toUpperCase()}</span>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8">

        {/* LOOKUP STEP */}
        {step === "lookup" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold tracking-wider mb-2">UPDATE PROFILE</h1>
              <p className="text-sm text-slate-400">Enter your shirt number to find your profile</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Your Shirt Number</label>
                <input
                  type="number"
                  value={lookupNumber}
                  onChange={e => setLookupNumber(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") findPlayer(); }}
                  className="input-field text-center text-2xl font-display font-bold"
                  placeholder="10"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              )}

              <button onClick={findPlayer} className="btn-primary w-full text-center text-base py-3">
                Find My Profile
              </button>

              <p className="text-center text-[11px] text-slate-600">
                Not registered yet? <Link to="/join" className="text-brand-400 font-bold hover:underline">Join the squad</Link>
              </p>
            </div>
          </div>
        )}

        {/* EDITING STEP */}
        {(step === "editing" || step === "saving") && player && (
          <div>
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl font-bold tracking-wider mb-1">EDIT PROFILE</h1>
              <p className="text-sm text-slate-400">Update your details below</p>
            </div>

            <div className="space-y-5">
              {/* Photo */}
              <div className="flex flex-col items-center">
                <label className="cursor-pointer group">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-brand-400/30 shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center group-hover:border-brand-400/30 transition-colors">
                      <span className="text-2xl mb-1">📸</span>
                      <span className="text-[9px] text-slate-500 font-semibold">CHANGE PHOTO</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
                <p className="text-[10px] text-slate-600 mt-2">Tap to change photo</p>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input value={player.name} onChange={e => setPlayer({ ...player, name: e.target.value })} className="input-field" />
              </div>

              {/* Number & Position */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Shirt Number</label>
                  <input type="number" value={player.number} onChange={e => setPlayer({ ...player, number: e.target.value })} className="input-field" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Position</label>
                  <select value={player.position} onChange={e => setPlayer({ ...player, position: e.target.value })} className="input-field">
                    {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Preferred Foot */}
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Preferred Foot</label>
                <div className="flex gap-2">
                  {["Left", "Right", "Both"].map(f => (
                    <button key={f} onClick={() => setPlayer({ ...player, preferred_foot: f })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                        player.preferred_foot === f
                          ? "bg-brand-400 text-surface"
                          : "bg-white/5 text-slate-500 border border-white/5"
                      }`}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Phone / WhatsApp</label>
                <input type="tel" value={player.phone || ""} onChange={e => setPlayer({ ...player, phone: e.target.value })} className="input-field" placeholder="e.g. +234 801 234 5678" />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Date of Birth</label>
                <input type="date" value={player.date_of_birth || ""} onChange={e => setPlayer({ ...player, date_of_birth: e.target.value })} className="input-field" />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep("lookup"); setPlayer(null); setPhoto(null); setError(""); }}
                  className="btn-secondary flex-1 text-center">Cancel</button>
                <button onClick={saveChanges} disabled={step === "saving"}
                  className={`btn-primary flex-1 text-center ${step === "saving" ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {step === "saving" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
