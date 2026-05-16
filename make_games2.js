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

// Helper: count by team after each week group
function validate() {
  const ALL = ["ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE","DAL","DEN","DET","GB","HOU","IND","JAX","KC","LAC","LAR","LV","MIA","MIN","NE","NO","NYG","NYJ","PHI","PIT","SEA","SF","TB","TEN","WAS"];
  const tcnt = {};
  ALL.forEach(t => tcnt[t] = 0);
  G.forEach(g => { tcnt[g[1]]++; tcnt[g[2]]++; });
  // Check self-play
  G.forEach(g => { if (g[1] === g[2]) console.log("SELF:", g); });
  const seen = {};
  G.forEach(g => { const k = g[0]+"-"+(g[1]<g[2]?g[1]+"-"+g[2]:g[2]+"-"+g[1]); if (seen[k]) console.log("DUPE:", g); seen[k] = true; });
  const ok = ALL.every(t => tcnt[t] === 17);
  const dupes = Object.keys(seen).length !== G.length;
  console.log("Total:", G.length, "| All 17/17:", ok, "| No dupes:", !dupes);
  return ok && !dupes;
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
console.log("W1 done:", G.length);

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
console.log("W2 done:", G.length);

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
console.log("W3 done:", G.length);

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
console.log("W4 done:", G.length);

// === Week 5 (Oct 8-12): 15 games (BYES: CAR, KC) ===
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
console.log("W5 done:", G.length);

// === Week 6 (Oct 15-19): 14 games (BYES: CIN, DET, MIA, MIN) ===
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
console.log("W6 done:", G.length);

// === Week 7 (Oct 22-26): 14 games (BYES: BUF, JAX, LAC, WAS) ===
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
console.log("W7 done:", G.length);

// === Week 8 (Oct 29-Nov 2): 14 games (BYES: HOU, NO, NYG, SF) ===
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
console.log("W8 done:", G.length);

// === Week 9 (Nov 5-9): 15 games (BYES: PIT, TEN) ===
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
console.log("W9 done:", G.length);

// === Week 10 (Nov 12-16): 14 games (BYES: CHI, DEN, PHI, TB) ===
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
console.log("W10 done:", G.length);

// === Week 11 (Nov 19-23): 13 games (BYES: ATL, CLE, GB, LAR, NE, SEA) ===
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
console.log("W11 done:", G.length);

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
console.log("W12 done:", G.length);
validate();

// Now count per team after W12
const ALL = ["ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE","DAL","DEN","DET","GB","HOU","IND","JAX","KC","LAC","LAR","LV","MIA","MIN","NE","NO","NYG","NYJ","PHI","PIT","SEA","SF","TB","TEN","WAS"];
const tc = {};
ALL.forEach(t => tc[t] = 0);
G.forEach(g => { tc[g[1]]++; tc[g[2]]++; });
console.log("After W12 counts:");
ALL.forEach(t => console.log(`  ${t}: ${tc[t]}`));

// Need 17 per team. After W12 we need 17 - current.
const need = {};
ALL.forEach(t => { need[t] = 17 - tc[t]; });
console.log("\nNeeded games per team (W13-18):");
ALL.forEach(t => console.log(`  ${t}: ${need[t]}`));
console.log("Sum needed:", ALL.reduce((s,t) => s + need[t], 0), "/ 2 =", ALL.reduce((s,t) => s + need[t], 0) / 2, "games");

// Now build W13-18 with these exact counts
// We know: W13=16games, W14=15(2byes), W15=16, W16=16, W17=16, W18=16 = 95 games needed
// 95*2 = 190 team slots = sum of needs

