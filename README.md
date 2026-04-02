# ⚽ FC Emerald — Football Team Management Website

A modern, mobile-responsive football club website with public pages for fans and a protected dashboard for team management.

## Features

### Public Pages (anyone can visit)
- **Landing page** — Club hero section, quick stats, latest result, next fixture
- **Squad** — Full roster grouped by position (Goalkeepers, Defenders, Midfielders, Forwards)
- **Matches** — Upcoming fixtures and past results with scorers
- **Stats** — Season overview, win/draw/loss distribution, top scorers & assist charts

### Team Dashboard (login required)
- **Squad management** — Add, edit, delete players. Update status (fit/injured/suspended), stats, position, number
- **Tactics board** — Interactive pitch with 4-3-3, 4-4-2, 3-5-2 formations. Drag players into positions
- **Match event logging** — Log goals, assists, cards, substitutions with player and minute
- **Attendance tracker** — Mark player availability (yes/maybe/no) for upcoming matches
- **Team feed** — Post announcements and messages to the team
- **Settings** — Customize club name, coach name, colors, upload badge

### Technical
- **Persistent storage** — All data saved via Supabase (or localStorage in demo mode)
- **Authentication** — Supabase Auth with email/password (or demo mode)
- **Mobile-first** — Fully responsive, works great on phones and tablets
- **Fast** — Vite + React, optimized build

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally (demo mode — no backend needed)

```bash
npm run dev
```

Open http://localhost:5173 — the app works immediately with localStorage.  
Use any email/password to "log in" to the dashboard in demo mode.

### 3. (Optional) Connect Supabase for real auth & cloud storage

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

3. In Supabase SQL Editor, create the data table:

```sql
CREATE TABLE club_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE club_data ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write
CREATE POLICY "Authenticated users can manage club data"
  ON club_data FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read (for public pages)
CREATE POLICY "Anyone can read club data"
  ON club_data FOR SELECT
  TO anon
  USING (true);
```

4. Enable Email Auth in Supabase → Authentication → Providers

---

## Deploy to Production

### Option A: Netlify (recommended)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables in Netlify → Site settings → Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

The `netlify.toml` file is already configured for you.

### Option B: Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → "New Project" → Import your repo
3. Framework: **Vite**
4. Add the same environment variables
5. Deploy!

The `vercel.json` file is already configured for you.

### Option C: GitHub Pages

```bash
npm run build
```

Upload the `dist` folder to your GitHub Pages repo. Note: you'll need to configure the base URL in `vite.config.js` if not using a custom domain.

---

## Project Structure

```
fc-emerald-web/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   └── shared.jsx   # Avatar, StatusBadge, utilities
│   ├── contexts/
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── ClubContext.jsx   # Club data state & persistence
│   ├── data/
│   │   └── defaults.js  # Sample data, formations, constants
│   ├── lib/
│   │   └── supabase.js  # Supabase client + localStorage fallback
│   ├── pages/
│   │   ├── Landing.jsx   # Public homepage
│   │   ├── Login.jsx     # Auth page
│   │   ├── PublicView.jsx # Public squad/matches/stats
│   │   ├── Dashboard.jsx  # Protected management UI
│   │   └── Settings.jsx   # Club customization
│   ├── App.jsx           # Router
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind + global styles
├── .env.example
├── netlify.toml
├── vercel.json
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Customization

- **Club name & coach** — Settings page or directly in `src/data/defaults.js`
- **Colors** — Settings page offers 8 presets, or edit CSS variables in `index.css`
- **Sample data** — Edit `src/data/defaults.js` with your real players, matches, etc.
- **Formations** — Add new formations in `defaults.js` → `POSITIONS_MAP`

---

## Going from Website to Mobile App

When you're ready to wrap this as a native app:

1. **Capacitor (easiest)** — Add `@capacitor/core`, run `npx cap init`, build, and deploy to iOS/Android
2. **React Native** — Port components to React Native (the architecture is already component-based)
3. **PWA** — Add a service worker and manifest for installable web app experience

---

## License

MIT — use it for your team!
