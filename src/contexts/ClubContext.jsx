import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "../lib/supabase";
import { DEFAULT_PLAYERS, DEFAULT_MATCHES, DEFAULT_FEED } from "../data/defaults";

const ClubContext = createContext({});
export const useClub = () => useContext(ClubContext);

const STORAGE_KEY = "club_data";

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
      const saved = await storage.get(STORAGE_KEY);
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
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (p, m, f, s) => {
    await storage.set(STORAGE_KEY, { players: p, matches: m, feed: f, settings: s });
  }, []);

  const updatePlayers = (next) => { setPlayers(next); persist(next, matches, feed, settings); };
  const updateMatches = (next) => { setMatches(next); persist(players, next, feed, settings); };
  const updateFeed = (next) => { setFeed(next); persist(players, matches, next, settings); };
  const updateSettings = (next) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    persist(players, matches, feed, merged);
  };

  const resetAll = async () => {
    await storage.delete(STORAGE_KEY);
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
