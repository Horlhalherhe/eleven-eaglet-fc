import { useState } from "react";
import { Link } from "react-router-dom";
import { db, supabase } from "../lib/supabase";
import { useClub } from "../contexts/ClubContext";

const POS_OPTIONS = ["GK","LB","CB","RB","LWB","RWB","CM","CDM","CAM","LM","RM","LW","RW","ST","CF"];

export default function JoinPage() {
  const { settings } = useClub();
  const [step, setStep] = useState("form"); // form | uploading | success | error
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    number: "",
    position: "CM",
    preferred_foot: "Right",
    phone: "",
    date_of_birth: "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Please enter your name"); return; }
    if (!form.number) { setError("Please enter your shirt number"); return; }

    setError("");
    setStep("uploading");

    try {
      let photo_url = null;
      if (photo) {
        photo_url = await db.uploadPhoto(photo);
      }

      await db.addPlayer({
        name: form.name.trim(),
        number: parseInt(form.number),
        position: form.position,
        preferred_foot: form.preferred_foot,
        phone: form.phone.trim() || null,
        date_of_birth: form.date_of_birth || null,
        photo_url,
        approved: false,
      });

      setStep("success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <img src="/logo.png" alt={settings.clubName} className="w-20 h-20 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-2xl font-bold tracking-wider mb-3">COMING SOON</h1>
          <p className="text-sm text-slate-400 mb-6">Player registration will be available once the database is set up.</p>
          <Link to="/" className="btn-secondary text-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-400/20 flex items-center justify-center text-4xl">✓</div>
          <h1 className="font-display text-2xl font-bold tracking-wider mb-3">YOU'RE IN!</h1>
          <p className="text-sm text-slate-400 mb-2">Your details have been submitted to <strong className="text-slate-200">{settings.clubName}</strong>.</p>
          <p className="text-xs text-slate-500 mb-8">The coach will review and approve your registration shortly.</p>
          <Link to="/" className="btn-primary text-sm">Visit the Club Site</Link>
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
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold tracking-wider mb-2">JOIN THE SQUAD</h1>
          <p className="text-sm text-slate-400">Fill in your details to register as a player</p>
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
                  <span className="text-[9px] text-slate-500 font-semibold">ADD PHOTO</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            <p className="text-[10px] text-slate-600 mt-2">Tap to upload (optional, max 5MB)</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Full Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} className="input-field" placeholder="e.g. John Okafor" />
          </div>

          {/* Number & Position */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Shirt Number *</label>
              <input type="number" value={form.number} onChange={e => set("number", e.target.value)} className="input-field" placeholder="e.g. 10" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Position</label>
              <select value={form.position} onChange={e => set("position", e.target.value)} className="input-field">
                {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Preferred Foot */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Preferred Foot</label>
            <div className="flex gap-2">
              {["Left", "Right", "Both"].map(f => (
                <button key={f} onClick={() => set("preferred_foot", f)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    form.preferred_foot === f
                      ? "bg-brand-400 text-surface"
                      : "bg-white/5 text-slate-500 border border-white/5"
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Phone / WhatsApp</label>
            <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className="input-field" placeholder="e.g. +234 801 234 5678" />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Date of Birth</label>
            <input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} className="input-field" />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={step === "uploading"}
            className={`btn-primary w-full text-center text-base py-3 ${step === "uploading" ? "opacity-50 cursor-not-allowed" : ""}`}>
            {step === "uploading" ? "Submitting..." : "Join the Squad"}
          </button>

          <p className="text-center text-[11px] text-slate-600">
            Your registration will be reviewed by the coach before it appears on the squad list.
          </p>
        </div>
      </div>
    </div>
  );
}
