import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { db, isDemo } from "../lib/supabase";
import { DEFAULT_PLAYERS, DEFAULT_MATCHES, DEFAULT_FEED } from "../data/defaults";

const ClubContext = createContext({});
export const useClub = () => useContext(ClubContext);

const LS_KEY = "fc_eaglet_data";

/* Local storage helpers for demo mode */
function lsGet() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function lsSet(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}
function lsDelete() {
  localStorage.removeItem(LS_KEY);
}

export function ClubProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [feed, setFeed] = useState([]);
  const [settings, setSettings] = useState({
    clubName: "Eleven Eaglet FC",
    coachName: "Coach",
    formation: "4-3-3",
    lineup: {},
    primaryColor: "#1a2744",
    accentColor: "#d4a843",
  });

  useEffect(() => {
    (async () => {
      if (isDemo) {
        const saved = lsGet();
        if (saved) {
          setPlayers(saved.players || DEFAULT_PLAYERS);
          setMatches(saved.matches || DEFAULT_MATCHES);
          setFeed(saved.feed || DEFAULT_FEED);
          setSettings(s => ({ ...s, ...saved.settings }));
        } else {
          setPlayers(DEFAULT_PLAYERS);
          setMatches(DEFAULT_MATCHES);
          setFeed(DEFAULT_FEED);
        }
      } else {
        // Load from Supabase
        const [dbPlayers, dbMatches, dbFeed, dbSettings] = await Promise.all([
          db.getPlayers(false),
          db.getMatches(),
          db.getFeed(),
          db.getSettings(),
        ]);
        setPlayers(dbPlayers.length > 0 ? dbPlayers : DEFAULT_PLAYERS);
        setMatches(dbMatches.length > 0 ? dbMatches : DEFAULT_MATCHES);
        setFeed(dbFeed.length > 0 ? dbFeed : DEFAULT_FEED);
        if (dbSettings) setSettings(s => ({ ...s, ...dbSettings }));
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (p, m, f, s) => {
    if (isDemo) {
      lsSet({ players: p, matches: m, feed: f, settings: s });
    }
    // When using Supabase, individual operations handle their own persistence
  }, []);

  const updatePlayers = (next) => { setPlayers(next); persist(next, matches, feed, settings); };
  const updateMatches = (next) => { setMatches(next); persist(players, next, feed, settings); };
  const updateFeed = (next) => { setFeed(next); persist(players, matches, next, settings); };
  const updateSettings = (next) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    persist(players, matches, feed, merged);
    if (!isDemo) db.saveSettings(merged);
  };

  const resetAll = async () => {
    if (isDemo) lsDelete();
    setPlayers(DEFAULT_PLAYERS);
    setMatches(DEFAULT_MATCHES);
    setFeed(DEFAULT_FEED);
    setSettings({
      clubName: "Eleven Eaglet FC",
      coachName: "Coach",
      formation: "4-3-3",
      lineup: {},
      primaryColor: "#1a2744",
      accentColor: "#d4a843",
    });
  };

  return (
    <ClubContext.Provider value={{
      loading, players, matches, feed, settings,
      updatePlayers, updateMatches, updateFeed, updateSettings, resetAll,
    }}>
      {children}
    </ClubContext.Provider>
  );
}
