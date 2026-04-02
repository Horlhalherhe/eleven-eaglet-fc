export const DEFAULT_PLAYERS = [
  { id: 1, name: "Marc Torres", number: 1, position: "GK", goals: 0, assists: 0, apps: 18, yellows: 0, reds: 0, status: "fit" },
  { id: 2, name: "Diego Ruiz", number: 2, position: "RB", goals: 1, assists: 4, apps: 17, yellows: 2, reds: 0, status: "fit" },
  { id: 3, name: "Luca Bianchi", number: 4, position: "CB", goals: 2, assists: 0, apps: 18, yellows: 3, reds: 0, status: "fit" },
  { id: 4, name: "Karim Hadid", number: 5, position: "CB", goals: 1, assists: 1, apps: 16, yellows: 1, reds: 0, status: "injured" },
  { id: 5, name: "Jan Eriksen", number: 3, position: "LB", goals: 0, assists: 6, apps: 18, yellows: 1, reds: 0, status: "fit" },
  { id: 6, name: "Mateo Silva", number: 8, position: "CM", goals: 5, assists: 7, apps: 18, yellows: 2, reds: 0, status: "fit" },
  { id: 7, name: "Ryo Tanaka", number: 6, position: "CM", goals: 3, assists: 3, apps: 15, yellows: 0, reds: 0, status: "fit" },
  { id: 8, name: "Felix Braun", number: 10, position: "CM", goals: 8, assists: 10, apps: 18, yellows: 1, reds: 0, status: "fit" },
  { id: 9, name: "Adama Traoré", number: 7, position: "RW", goals: 7, assists: 5, apps: 17, yellows: 0, reds: 0, status: "fit" },
  { id: 10, name: "Niko Petrović", number: 9, position: "ST", goals: 14, assists: 3, apps: 18, yellows: 2, reds: 0, status: "fit" },
  { id: 11, name: "Youssef Amiri", number: 11, position: "LW", goals: 9, assists: 8, apps: 16, yellows: 1, reds: 0, status: "suspended" },
  { id: 12, name: "Tomás Vega", number: 13, position: "GK", goals: 0, assists: 0, apps: 2, yellows: 0, reds: 0, status: "fit" },
  { id: 13, name: "Lucas Morel", number: 14, position: "CB", goals: 0, assists: 1, apps: 8, yellows: 1, reds: 0, status: "fit" },
  { id: 14, name: "Erik Holm", number: 16, position: "CM", goals: 1, assists: 2, apps: 10, yellows: 0, reds: 0, status: "fit" },
  { id: 15, name: "André Santos", number: 17, position: "RW", goals: 2, assists: 1, apps: 7, yellows: 0, reds: 0, status: "fit" },
  { id: 16, name: "Noah Fischer", number: 20, position: "ST", goals: 3, assists: 0, apps: 9, yellows: 1, reds: 0, status: "fit" },
];

export const DEFAULT_MATCHES = [
  { id: 1, opponent: "Real Valdés", date: "2026-03-14", time: "15:00", venue: "Home", result: "3-1", status: "played", events: [
    { id: "e1", type: "goal", playerId: 10, minute: 12 },
    { id: "e2", type: "assist", playerId: 8, minute: 12 },
    { id: "e3", type: "goal", playerId: 8, minute: 45 },
    { id: "e4", type: "assist", playerId: 9, minute: 45 },
    { id: "e5", type: "goal", playerId: 10, minute: 78 },
    { id: "e6", type: "yellow", playerId: 3, minute: 55 },
  ], attendance: {} },
  { id: 2, opponent: "SC Freiberg", date: "2026-03-21", time: "18:30", venue: "Away", result: "1-1", status: "played", events: [
    { id: "e7", type: "goal", playerId: 11, minute: 67 },
    { id: "e8", type: "yellow", playerId: 6, minute: 34 },
    { id: "e9", type: "yellow", playerId: 2, minute: 80 },
  ], attendance: {} },
  { id: 3, opponent: "Dynamo Lenz", date: "2026-03-28", time: "20:00", venue: "Home", result: "2-0", status: "played", events: [
    { id: "e10", type: "goal", playerId: 9, minute: 33 },
    { id: "e11", type: "goal", playerId: 6, minute: 88 },
    { id: "e12", type: "assist", playerId: 8, minute: 88 },
  ], attendance: {} },
  { id: 4, opponent: "Atlético Ronda", date: "2026-04-04", time: "16:00", venue: "Away", result: null, status: "upcoming", events: [], attendance: {} },
  { id: 5, opponent: "FC Nordberg", date: "2026-04-11", time: "15:00", venue: "Home", result: null, status: "upcoming", events: [], attendance: {} },
  { id: 6, opponent: "Union Belfort", date: "2026-04-18", time: "18:00", venue: "Away", result: null, status: "upcoming", events: [], attendance: {} },
];

export const DEFAULT_FEED = [
  { id: 1, author: "Coach", time: "2h ago", text: "Great win today lads! Recovery session tomorrow at 10am. No exceptions.", type: "announcement", replies: 4 },
  { id: 2, author: "Mateo Silva", time: "5h ago", text: "Who's carpooling to the away game next week? I can take 3.", type: "message", replies: 7 },
  { id: 3, author: "Coach", time: "1d ago", text: "Karim is out for 2-3 weeks — hamstring strain. Lucas will slot in at CB.", type: "announcement", replies: 2 },
  { id: 4, author: "Felix Braun", time: "2d ago", text: "Anyone up for extra shooting practice Thursday evening?", type: "message", replies: 11 },
];

export const POSITIONS_MAP = {
  "4-3-3": [
    { id: "GK", label: "GK", x: 50, y: 90 },
    { id: "LB", label: "LB", x: 15, y: 72 },
    { id: "CB1", label: "CB", x: 38, y: 75 },
    { id: "CB2", label: "CB", x: 62, y: 75 },
    { id: "RB", label: "RB", x: 85, y: 72 },
    { id: "CM1", label: "CM", x: 30, y: 52 },
    { id: "CM2", label: "CM", x: 50, y: 48 },
    { id: "CM3", label: "CM", x: 70, y: 52 },
    { id: "LW", label: "LW", x: 18, y: 25 },
    { id: "ST", label: "ST", x: 50, y: 18 },
    { id: "RW", label: "RW", x: 82, y: 25 },
  ],
  "4-4-2": [
    { id: "GK", label: "GK", x: 50, y: 90 },
    { id: "LB", label: "LB", x: 15, y: 72 },
    { id: "CB1", label: "CB", x: 38, y: 75 },
    { id: "CB2", label: "CB", x: 62, y: 75 },
    { id: "RB", label: "RB", x: 85, y: 72 },
    { id: "LM", label: "LM", x: 15, y: 48 },
    { id: "CM1", label: "CM", x: 38, y: 52 },
    { id: "CM2", label: "CM", x: 62, y: 52 },
    { id: "RM", label: "RM", x: 85, y: 48 },
    { id: "ST1", label: "ST", x: 38, y: 22 },
    { id: "ST2", label: "ST", x: 62, y: 22 },
  ],
  "3-5-2": [
    { id: "GK", label: "GK", x: 50, y: 90 },
    { id: "CB1", label: "CB", x: 25, y: 75 },
    { id: "CB2", label: "CB", x: 50, y: 78 },
    { id: "CB3", label: "CB", x: 75, y: 75 },
    { id: "LWB", label: "LWB", x: 10, y: 52 },
    { id: "CM1", label: "CM", x: 33, y: 52 },
    { id: "CM2", label: "CM", x: 50, y: 46 },
    { id: "CM3", label: "CM", x: 67, y: 52 },
    { id: "RWB", label: "RWB", x: 90, y: 52 },
    { id: "ST1", label: "ST", x: 38, y: 22 },
    { id: "ST2", label: "ST", x: 62, y: 22 },
  ],
};

export const SQUAD_SECTIONS = [
  { key: "Goalkeepers", positions: ["GK"] },
  { key: "Defenders", positions: ["LB", "CB", "RB", "LWB", "RWB"] },
  { key: "Midfielders", positions: ["CM", "CDM", "CAM", "LM", "RM"] },
  { key: "Forwards", positions: ["LW", "RW", "ST", "CF"] },
];

export const POS_OPTIONS = ["GK","LB","CB","RB","LWB","RWB","CM","CDM","CAM","LM","RM","LW","RW","ST","CF"];

export const EVENT_TYPES = [
  { type: "goal", icon: "⚽", label: "Goal" },
  { type: "assist", icon: "👟", label: "Assist" },
  { type: "yellow", icon: "🟨", label: "Yellow Card" },
  { type: "red", icon: "🟥", label: "Red Card" },
  { type: "sub_in", icon: "🔼", label: "Sub In" },
  { type: "sub_out", icon: "🔽", label: "Sub Out" },
];
