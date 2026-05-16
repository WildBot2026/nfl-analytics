const fs = require('fs');
const d = JSON.parse(fs.readFileSync('/tmp/nfl_data.json', 'utf8'));
const st = d.r.st;

function spread(aw, hw) {
  const ra = st[aw] || 75;
  const rh = st[hw] || 75;
  let raw = (rh - ra) / 5 * 3;
  raw = Math.max(-17, Math.min(17, raw));
  return Math.round(raw * 2) / 2;
}
function oline(aw, hw) {
  const ra = st[aw] || 75;
  const rh = st[hw] || 75;
  return Math.round((38 + (ra + rh) / 6) * 2) / 2;
}

const G = [];
function add(w, a, h, d, n) {
  G.push([w, a, h, spread(a, h), oline(a, h), d, n, a, h, a, h, 0]);
}

// === Week 1 (Sep 9-14): 16 games ===
add(1, "NE", "SEA", "2026-09-09", "Kickoff");
add(1, "SF", "LAR", "2026-09-10", "Melbourne");
add(1, "CHI", "CAR", "2026-09-13", "");
add(1, "TB", "CIN", "2026-09-13", "");
add(1, "BAL", "IND", "2026-09-13", "");
add(1, "BUF", "HOU", "2026-09-13", "");
add(1, "NO", "DET", "2026-09-13", "");
add(1, "ATL", "PIT", "2026-09-13", "");
add(1, "CLE", "JAX", "2026-09-13", "");
add(1, "ARI", "LAC", "2026-09-13", "");
add(1, "GB", "MIN", "2026-09-13", "");
add(1, "MIA", "LV", "2026-09-13", "");
add(1, "WAS", "PHI", "2026-09-13", "");
add(1, "DAL", "NYG", "2026-09-13", "");
add(1, "NYJ", "TEN", "2026-09-13", "");
add(1, "DEN", "KC", "2026-09-14", "MNF");

// === Week 2 (Sep 17-21): 16 games ===
add(2, "DET", "BUF", "2026-09-17", "TNF");
add(2, "MIN", "CHI", "2026-09-20", "");
add(2, "PHI", "TEN", "2026-09-20", "");
add(2, "GB", "NYJ", "2026-09-20", "");
add(2, "CAR", "ATL", "2026-09-20", "");
add(2, "NO", "BAL", "2026-09-20", "");
add(2, "CIN", "HOU", "2026-09-20", "");
add(2, "CLE", "TB", "2026-09-20", "");
add(2, "PIT", "NE", "2026-09-20", "");
add(2, "LV", "LAC", "2026-09-20", "");
add(2, "JAX", "DEN", "2026-09-20", "");
add(2, "WAS", "DAL", "2026-09-20", "");
add(2, "SEA", "ARI", "2026-09-20", "");
add(2, "MIA", "SF", "2026-09-20", "");
add(2, "IND", "KC", "2026-09-20", "");
add(2, "NYG", "LAR", "2026-09-21", "MNF");

// === Week 3 (Sep 24-28): 16 games ===
add(3, "ATL", "GB", "2026-09-24", "TNF");
add(3, "KC", "MIA", "2026-09-27", "");
add(3, "HOU", "IND", "2026-09-27", "");
add(3, "TEN", "NYG", "2026-09-27", "");
add(3, "NE", "JAX", "2026-09-27", "");
add(3, "CIN", "PIT", "2026-09-27", "");
add(3, "CAR", "CLE", "2026-09-27", "");
add(3, "NYJ", "DET", "2026-09-27", "");
add(3, "SEA", "WAS", "2026-09-27", "");
add(3, "LAC", "BUF", "2026-09-27", "");
add(3, "MIN", "TB", "2026-09-27", "");
add(3, "ARI", "SF", "2026-09-27", "");
add(3, "BAL", "DAL", "2026-09-27", "Rio");
add(3, "LV", "NO", "2026-09-27", "");
add(3, "LAR", "DEN", "2026-09-27", "");
add(3, "PHI", "CHI", "2026-09-28", "MNF");

// === Week 4 (Oct 1-5): 16 games ===
add(4, "PIT", "CLE", "2026-10-01", "TNF");
add(4, "IND", "WAS", "2026-10-04", "London");
add(4, "TEN", "BAL", "2026-10-04", "");
add(4, "ARI", "NYG", "2026-10-04", "");
add(4, "JAX", "CIN", "2026-10-04", "");
add(4, "NE", "BUF", "2026-10-04", "");
add(4, "DAL", "HOU", "2026-10-04", "");
add(4, "LAR", "PHI", "2026-10-04", "");
add(4, "GB", "TB", "2026-10-04", "");
add(4, "NYJ", "CHI", "2026-10-04", "");
add(4, "MIA", "MIN", "2026-10-04", "");
add(4, "DEN", "SF", "2026-10-04", "");
add(4, "LAC", "SEA", "2026-10-04", "");
add(4, "KC", "LV", "2026-10-04", "");
add(4, "DET", "CAR", "2026-10-04", "");
add(4, "ATL", "NO", "2026-10-05", "MNF");

// === Week 5 (Oct 8-12): 15 games - BYES: CAR, KC ===
add(5, "TB", "DAL", "2026-10-08", "TNF");
add(5, "PHI", "JAX", "2026-10-11", "London");
add(5, "LV", "NE", "2026-10-11", "");
add(5, "HOU", "TEN", "2026-10-11", "");
add(5, "CLE", "NYJ", "2026-10-11", "");
add(5, "IND", "PIT", "2026-10-11", "");
add(5, "CIN", "MIA", "2026-10-11", "");
add(5, "MIN", "NO", "2026-10-11", "");
add(5, "NYG", "WAS", "2026-10-11", "");
add(5, "DEN", "LAC", "2026-10-11", "");
add(5, "CHI", "GB", "2026-10-11", "");
add(5, "DET", "ARI", "2026-10-11", "");
add(5, "SF", "SEA", "2026-10-11", "");
add(5, "BAL", "ATL", "2026-10-11", "");
add(5, "BUF", "LAR", "2026-10-12", "MNF");

// === Week 6 (Oct 15-19): 14 games - BYES: CIN, DET, MIA, MIN ===
add(6, "SEA", "DEN", "2026-10-15", "TNF");
add(6, "HOU", "JAX", "2026-10-18", "London");
add(6, "NYJ", "NE", "2026-10-18", "");
add(6, "PIT", "TB", "2026-10-18", "");
add(6, "CAR", "PHI", "2026-10-18", "");
add(6, "CHI", "ATL", "2026-10-18", "");
add(6, "TEN", "IND", "2026-10-18", "");
add(6, "NO", "NYG", "2026-10-18", "");
add(6, "BAL", "CLE", "2026-10-18", "");
add(6, "ARI", "LAR", "2026-10-18", "");
add(6, "LAC", "KC", "2026-10-18", "");
add(6, "BUF", "LV", "2026-10-18", "");
add(6, "DAL", "GB", "2026-10-18", "");
add(6, "WAS", "SF", "2026-10-19", "MNF");

// === Week 7 (Oct 22-26): 14 games - BYES: BUF, JAX, LAC, WAS ===
add(7, "NE", "CHI", "2026-10-22", "TNF");
add(7, "PIT", "NO", "2026-10-25", "Paris");
add(7, "CLE", "TEN", "2026-10-25", "");
add(7, "MIA", "NYJ", "2026-10-25", "");
add(7, "IND", "MIN", "2026-10-25", "");
add(7, "CIN", "BAL", "2026-10-25", "");
add(7, "NYG", "HOU", "2026-10-25", "");
add(7, "TB", "CAR", "2026-10-25", "");
add(7, "SF", "ATL", "2026-10-25", "");
add(7, "DEN", "ARI", "2026-10-25", "");
add(7, "LAR", "LV", "2026-10-25", "");
add(7, "GB", "DET", "2026-10-25", "");
add(7, "KC", "SEA", "2026-10-25", "");
add(7, "DAL", "PHI", "2026-10-26", "MNF");

// === Week 8 (Oct 29-Nov 2): 14 games - BYES: HOU, NO, NYG, SF ===
add(8, "CAR", "GB", "2026-10-29", "TNF");
add(8, "TEN", "CIN", "2026-11-01", "");
add(8, "IND", "JAX", "2026-11-01", "");
add(8, "CLE", "PIT", "2026-11-01", "");
add(8, "BAL", "BUF", "2026-11-01", "");
add(8, "ATL", "TB", "2026-11-01", "");
add(8, "MIN", "DET", "2026-11-01", "");
add(8, "ARI", "DAL", "2026-11-01", "");
add(8, "LV", "NYJ", "2026-11-01", "");
add(8, "LAC", "LAR", "2026-11-01", "");
add(8, "KC", "DEN", "2026-11-01", "");
add(8, "NE", "MIA", "2026-11-01", "");
add(8, "PHI", "WAS", "2026-11-01", "");
add(8, "CHI", "SEA", "2026-11-02", "MNF");

// === Week 9 (Nov 5-9): 15 games - BYES: PIT, TEN ===
add(9, "JAX", "BAL", "2026-11-05", "TNF");
add(9, "CIN", "ATL", "2026-11-08", "Madrid");
add(9, "NYJ", "KC", "2026-11-08", "");
add(9, "CLE", "NO", "2026-11-08", "");
add(9, "DEN", "CAR", "2026-11-08", "");
add(9, "DAL", "IND", "2026-11-08", "");
add(9, "DET", "MIA", "2026-11-08", "");
add(9, "NYG", "PHI", "2026-11-08", "");
add(9, "LAR", "WAS", "2026-11-08", "");
add(9, "LV", "SF", "2026-11-08", "");
add(9, "HOU", "LAC", "2026-11-08", "");
add(9, "ARI", "SEA", "2026-11-08", "");
add(9, "GB", "NE", "2026-11-08", "");
add(9, "TB", "CHI", "2026-11-08", "");
add(9, "BUF", "MIN", "2026-11-09", "MNF");

// === Week 10 (Nov 12-16): 14 games - BYES: CHI, DEN, PHI, TB ===
add(10, "WAS", "NYG", "2026-11-12", "TNF");
add(10, "NE", "DET", "2026-11-15", "Munich");
add(10, "BUF", "NYJ", "2026-11-15", "");
add(10, "MIA", "IND", "2026-11-15", "");
add(10, "KC", "ATL", "2026-11-15", "");
add(10, "MIN", "GB", "2026-11-15", "");
add(10, "JAX", "TEN", "2026-11-15", "");
add(10, "HOU", "CLE", "2026-11-15", "");
add(10, "CAR", "NO", "2026-11-15", "");
add(10, "LAR", "ARI", "2026-11-15", "");
add(10, "SEA", "LV", "2026-11-15", "");
add(10, "SF", "DAL", "2026-11-15", "");
add(10, "PIT", "CIN", "2026-11-15", "");
add(10, "LAC", "BAL", "2026-11-16", "MNF");

// === Week 11 (Nov 19-23): 13 games - BYES: ATL, CLE, GB, LAR, NE, SEA ===
// 6 byes = 26 teams = 13 games
add(11, "IND", "HOU", "2026-11-19", "TNF");
add(11, "ARI", "KC", "2026-11-22", "");
add(11, "TB", "DET", "2026-11-22", "");
add(11, "JAX", "NYG", "2026-11-22", "");
add(11, "MIA", "BUF", "2026-11-22", "");
add(11, "TEN", "DAL", "2026-11-22", "");
add(11, "BAL", "CAR", "2026-11-22", "");
add(11, "NO", "CHI", "2026-11-22", "");
add(11, "NYJ", "LAC", "2026-11-22", "");
add(11, "PIT", "PHI", "2026-11-22", "");
add(11, "LV", "DEN", "2026-11-22", "");
add(11, "MIN", "SF", "2026-11-22", "Mexico City");
add(11, "CIN", "WAS", "2026-11-23", "MNF");

// === Week 12 (Nov 25-29): 15 games ===
add(12, "GB", "LAR", "2026-11-25", "Wed Night");
add(12, "CHI", "DET", "2026-11-26", "Thanksgiving");
add(12, "PHI", "DAL", "2026-11-26", "Thanksgiving");
add(12, "KC", "BUF", "2026-11-26", "Thanksgiving");
add(12, "DEN", "PIT", "2026-11-27", "Black Friday");
add(12, "BAL", "HOU", "2026-11-29", "");
add(12, "NO", "CIN", "2026-11-29", "");
add(12, "NYJ", "MIA", "2026-11-29", "");
add(12, "ATL", "MIN", "2026-11-29", "");
add(12, "NYG", "IND", "2026-11-29", "");
add(12, "LV", "CLE", "2026-11-29", "");
add(12, "TEN", "JAX", "2026-11-29", "");
add(12, "WAS", "ARI", "2026-11-29", "");
add(12, "SEA", "SF", "2026-11-29", "");
add(12, "NE", "CAR", "2026-11-29", "");

// === Week 13 (Dec 3-7): 16 games (no byes) ===
add(13, "MIA", "GB", "2026-12-03", "TNF");
add(13, "IND", "NE", "2026-12-06", "");
add(13, "NO", "DAL", "2026-12-06", "");
add(13, "ARI", "MIN", "2026-12-06", "");
add(13, "CHI", "SF", "2026-12-06", "");
add(13, "CAR", "TB", "2026-12-06", "");
add(13, "WAS", "PHI", "2026-12-06", "");
add(13, "CLE", "DEN", "2026-12-06", "");
add(13, "LV", "KC", "2026-12-06", "");
add(13, "LAC", "CIN", "2026-12-06", "");
add(13, "HOU", "PIT", "2026-12-06", "");
add(13, "DAL", "SEA", "2026-12-07", "MNF");
// Need 5 more games (16 - 12 = 4 missing? Actually 12 games = 24 teams.
// Wait: MIA@GB, IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, LV@KC, LAC@CIN, HOU@PIT, DAL@SEA = 12 = 24 teams
// 32 - 24 = 8 teams remaining: ATL, BAL, BUF, DET, JAX, NYG, NYJ, TEN
// Need 4 games (8 teams):
add(13, "BUF", "ATL", "2026-12-06", "");
add(13, "BAL", "NYG", "2026-12-06", "");
add(13, "NYJ", "TEN", "2026-12-06", "");
add(13, "DET", "JAX", "2026-12-06", "");

// === Week 14 (Dec 10-14): 15 games - BYES: ARI, DAL ===
add(14, "MIN", "NE", "2026-12-10", "TNF");
add(14, "DEN", "NYJ", "2026-12-13", "");
add(14, "ATL", "CLE", "2026-12-13", "");
add(14, "CHI", "MIA", "2026-12-13", "");
add(14, "HOU", "WAS", "2026-12-13", "");
add(14, "NO", "CAR", "2026-12-13", "");
add(14, "IND", "PHI", "2026-12-13", "");
add(14, "TB", "BAL", "2026-12-13", "");
add(14, "TEN", "DET", "2026-12-13", "");
add(14, "LAC", "LV", "2026-12-13", "");
add(14, "KC", "CIN", "2026-12-13", "");
add(14, "LAR", "SF", "2026-12-13", "");
add(14, "NYG", "SEA", "2026-12-13", "");
add(14, "BUF", "GB", "2026-12-13", "");
add(14, "PIT", "JAX", "2026-12-14", "MNF");

// === Week 15 (Dec 17-21): 16 games (no byes) ===
add(15, "SF", "LAC", "2026-12-17", "TNF");
add(15, "SEA", "PHI", "2026-12-19", "Saturday");
add(15, "CHI", "BUF", "2026-12-19", "Saturday");
add(15, "JAX", "HOU", "2026-12-20", "");
add(15, "BAL", "PIT", "2026-12-20", "");
add(15, "CLE", "NYG", "2026-12-20", "");
add(15, "IND", "TEN", "2026-12-20", "");
add(15, "MIA", "GB", "2026-12-20", "");
add(15, "NO", "TB", "2026-12-20", "");
add(15, "CIN", "CAR", "2026-12-20", "");
add(15, "ATL", "WAS", "2026-12-20", "");
add(15, "NYJ", "ARI", "2026-12-20", "");
add(15, "DAL", "LAR", "2026-12-20", "");
add(15, "DEN", "LV", "2026-12-20", "");
add(15, "DET", "MIN", "2026-12-20", "");
add(15, "NE", "KC", "2026-12-21", "MNF");

// === Week 16 (Dec 24-28): 16 games (no byes) ===
add(16, "HOU", "PHI", "2026-12-24", "TNF");
add(16, "GB", "CHI", "2026-12-25", "Christmas");
add(16, "BUF", "DEN", "2026-12-25", "Christmas");
add(16, "LAR", "SEA", "2026-12-25", "Christmas");
add(16, "NE", "NYJ", "2026-12-27", "");
add(16, "CLE", "BAL", "2026-12-27", "");
add(16, "LAC", "MIA", "2026-12-27", "");
add(16, "ARI", "LV", "2026-12-27", "");
add(16, "SF", "KC", "2026-12-27", "");
add(16, "JAX", "DAL", "2026-12-27", "");
add(16, "NYG", "DET", "2026-12-27", "");
add(16, "TB", "ATL", "2026-12-27", "");
add(16, "WAS", "MIN", "2026-12-27", "");
add(16, "CAR", "PIT", "2026-12-27", "");
add(16, "CIN", "IND", "2026-12-27", "");
add(16, "TEN", "NO", "2026-12-27", "");

// === Week 17 (Dec 31-Jan 4): 16 games (no byes) ===
add(17, "BAL", "CIN", "2026-12-31", "TNF");
add(17, "LAR", "TB", "2027-01-03", "");
add(17, "DEN", "NE", "2027-01-03", "");
add(17, "KC", "LAC", "2027-01-03", "");
add(17, "WAS", "JAX", "2027-01-03", "");
add(17, "BUF", "MIA", "2027-01-03", "");
add(17, "PIT", "TEN", "2027-01-03", "");
add(17, "MIN", "NYJ", "2027-01-03", "");
add(17, "NO", "ATL", "2027-01-03", "");
add(17, "SEA", "CAR", "2027-01-03", "");
add(17, "IND", "CLE", "2027-01-03", "");
add(17, "NYG", "DAL", "2027-01-03", "");
add(17, "LV", "ARI", "2027-01-03", "");
add(17, "DET", "CHI", "2027-01-03", "");
add(17, "PHI", "SF", "2027-01-03", "");
add(17, "HOU", "GB", "2027-01-04", "MNF");

// === Week 18 (Jan 9-10): 16 games ===
add(18, "NYJ", "BUF", "2027-01-10", "");
add(18, "JAX", "IND", "2027-01-10", "");
add(18, "LV", "KC", "2027-01-10", "");
add(18, "TEN", "HOU", "2027-01-10", "");
add(18, "LAC", "DEN", "2027-01-10", "");
add(18, "MIA", "NE", "2027-01-10", "");
add(18, "CLE", "CIN", "2027-01-10", "");
add(18, "PIT", "BAL", "2027-01-10", "");
add(18, "CHI", "MIN", "2027-01-10", "");
add(18, "DET", "GB", "2027-01-10", "");
add(18, "DAL", "WAS", "2027-01-10", "");
add(18, "TB", "NO", "2027-01-10", "");
add(18, "PHI", "NYG", "2027-01-10", "");
add(18, "SEA", "LAR", "2027-01-10", "");
add(18, "ATL", "CAR", "2027-01-10", "");
add(18, "SF", "ARI", "2027-01-10", "");

// ===== VALIDATION =====
console.log("Total games:", G.length);
const byWeek = {};
G.forEach(g => { byWeek[g[0]] = (byWeek[g[0]] || 0) + 1; });
console.log("By week:", JSON.stringify(byWeek));

// Per team count
const teamCount = {};
const teamMatchups = {};
G.forEach(g => {
  [g[1], g[2]].forEach(t => {
    teamCount[t] = (teamCount[t] || 0) + 1;
    if (!teamMatchups[t]) teamMatchups[t] = {};
  });
  const key = g[1] < g[2] ? g[1]+"-"+g[2] : g[2]+"-"+g[1];
  teamMatchups[g[1]][g[2]] = (teamMatchups[g[1]][g[2]] || 0) + 1;
  teamMatchups[g[2]][g[1]] = (teamMatchups[g[2]][g[1]] || 0) + 1;
});

const ALLTEAMS = ["ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE","DAL","DEN","DET","GB","HOU","IND","JAX","KC","LAC","LAR","LV","MIA","MIN","NE","NO","NYG","NYJ","PHI","PIT","SEA","SF","TB","TEN","WAS"];

let ok = true;
ALLTEAMS.forEach(t => {
  const c = teamCount[t] || 0;
  if (c !== 17) {
    console.log(`BAD: ${t} has ${c} games`);
    ok = false;
  }
});

// Check duplicates
let dupes = 0;
const seen = {};
G.forEach(g => {
  const key = g[0] + "-" + (g[1] < g[2] ? g[1]+"-"+g[2] : g[2]+"-"+g[1]);
  if (seen[key]) { dupes++; console.log(`DUPE: W${g[0]} ${g[1]} vs ${g[2]}`); }
  seen[key] = true;
});

// Check self-play
G.forEach(g => {
  if (g[1] === g[2]) { console.log(`SELF: W${g[0]} ${g[1]}`); ok = false; }
});

console.log(`Duplicates: ${dupes}`);
if (ok) console.log("ALL TEAMS: 17/17 ✅");
console.log("Validation:", ok && dupes === 0 ? "PASS ✅" : "FAIL ❌");

if (ok && dupes === 0) {
  fs.writeFileSync('/tmp/nfl_games_correct.json', JSON.stringify(G));
  console.log("Saved to /tmp/nfl_games_correct.json");
}
