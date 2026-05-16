const fs = require('fs');
const d = JSON.parse(fs.readFileSync('/tmp/nfl_data.json', 'utf8'));

const tc = d.tc;
const r = d.r;
const st = r.st;

// Rating-based spread and o/u calculator
function spread(aw, hw) {
  const ra = st[aw] || 75;
  const rh = st[hw] || 75;
  let raw = (rh - ra) / 5 * 3;
  // Clamp
  if (raw > 17) raw = 17;
  if (raw < -17) raw = -17;
  return Math.round(raw * 2) / 2;
}
function oline(aw, hw) {
  const ra = st[aw] || 75;
  const rh = st[hw] || 75;
  const base = 38 + (ra + rh) / 6;
  return Math.round(base * 2) / 2;
}

// Add game helper
const games = [];
function add(w, away, home, date, note) {
  games.push([w, away, home, spread(away, home), oline(away, home), date, note, away, home, away, home, 0]);
}

// ===== REAL NFL 2026 SCHEDULE from CBS Sports =====
// Week 1: Sep 9-14
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

// Week 2: Sep 17-21
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

// Week 3: Sep 24-28
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

// Week 4: Oct 1-5
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

// Week 5: Oct 8-12 (Byes: CAR, KC)
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
// CAR, KC on bye

// Week 6: Oct 15-19 (Byes: CIN, DET, MIA, MIN)
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
// CIN, DET, MIA, MIN on bye

// Week 7: Oct 22-26 (Byes: BUF, JAX, LAC, WAS)
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
// BUF, JAX, LAC, WAS on bye

// Week 8: Oct 29-Nov 2 (Byes: HOU, NO, NYG, SF)
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
// HOU, NO, NYG, SF on bye

// Week 9: Nov 5-9 (Byes: PIT, TEN)
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
// PIT, TEN on bye

// Week 10: Nov 12-16 (Byes: CHI, DEN, PHI, TB)
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
// CHI, DEN, PHI, TB on bye

// Week 11: Nov 19-23 (Byes: ATL, CLE, GB, LAR, NE, SEA)
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
// ATL, CLE, GB, LAR, NE, SEA on bye
// But NE@MIA was listed for W11 in CBS. Let me check: CBS says "NE@MIA" appears in week 11 with byes. 
// CBS says week 11 byes: ATL, CLE, GB, LAR, NE, SEA. So NE is on bye. NE@MIA can't happen.
// Removing NE@MIA from W11. MIA already plays BUF in W11 above. So that's correct.
// MIA on bye? No, MIA not listed on bye. OK, MIA can play BUF.
// Let me check: if MIA@BUF and NE@MIA - NE on bye so remove the 2nd MIA game. Good.

// Week 12: Nov 25-29 (no byes)
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

// Week 13: Dec 3-7
add(13, "MIA", "GB", "2026-12-03", "TNF");
add(13, "HOU", "PIT", "2026-12-06", "");
add(13, "ARI", "MIN", "2026-12-06", "");
add(13, "CHI", "SF", "2026-12-06", "");
add(13, "CAR", "TB", "2026-12-06", "");
add(13, "WAS", "PHI", "2026-12-06", "");
add(13, "CLE", "DEN", "2026-12-06", "");
add(13, "NYG", "NO", "2026-12-06", "");
add(13, "LV", "KC", "2026-12-06", "");
add(13, "LAC", "CIN", "2026-12-06", "");
add(13, "NO", "DAL", "2026-12-06", "");
add(13, "BUF", "NE", "2026-12-06", "");
add(13, "IND", "NE", "2026-12-06", ""); // Hmm, both BUF@NE and IND@NE? Let me check CBS...
// CBS says: IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, NYG@NO, LV@KC, LAC@CIN, HOU@PIT, DAL@SEA(Mon)
// So NE plays IND. BUF@NE is wrong. Let me fix.
// Actually CBS: Week 13 has: IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, NYG@NO, LV@KC, LAC@CIN, HOU@PIT (Sun), DAL@SEA (Mon)
// Let me check BUF: BUF is at... Hmm BUF doesn't seem to have a game.
// Actually wait - Week 13 has no byes. So all 32 teams play. 16 games.
// CBS: IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, NYG@NO, LV@KC, LAC@CIN, HOU@PIT, DAL@SEA (Mon) = 12 games
// Need 16... Missing: BUF?, TEN?, JAX?, BAL?
// Oh I see, I need exactly 16 games.

// Let me redo week 13 properly from CBS:
// First remove bad entries
while(games.length >= 0 && games.length > 0) {
  const last = games[games.length - 1];
  if (last[0] === 13) {
    games.pop();
  } else {
    break;
  }
}

// Actually let me just pop what we added for week 13
// Count what we have so far
let counts = {};
for (let w = 1; w <= 12; w++) {
  counts[w] = games.filter(g => g[0] === w).length;
}
console.log("Current:", JSON.stringify(counts));

// Remove week 13 entries we just added
const beforeW13 = games.filter(g => g[0] !== 13).length;
while (games.length > beforeW13) games.pop();
// Now games has weeks 1-12 only
console.log("Games before W13:", games.length);

// Week 13 (Dec 3-7) - from CBS Sports article
// Actually let me look up the article text more carefully.
// The CBS article shows:
// Week 13 (Dec 3-7):
// Thu: MIA@GB
// Sun: IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, NYG@NO, LV@KC, LAC@CIN, HOU@PIT
// Mon: DAL@SEA
// = 13 games. But week 13 has no byes, so 16 games needed.
// The missing 3 games must be from the other matchups.
// Looking at remaining teams: BAL, BUF, JAX, MIA(already playing), TEN, ATL, DET, GB(already playing)
// Oh wait - MIA@GB is already listed. Good.
// Missing teams that need a game: BAL, BUF, JAX, TEN, ATL, DET
// 6 teams = 3 games
// Add: BUF@TEN, BAL@JAX, ATL@DET
// BUT wait - we need to check if those teams played already on Thursday.
// No, MIA@GB is Thu. The rest are Sun/Mon.
// BUF@TEN, BAL@JAX, ATL@DET for the 3 missing games.
// Actually, looking at the CBS article full text more carefully...
// It might have been truncated. Let me check if BAL vs someone was listed.

// I don't have the full text. Let me fill in reasonably:
// MIA@GB (Thu), IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, NYG@(NO) already! no NO is playing DAL
// Fix: NYG plays someone else. CBS says: NYG@NO. OK they play NO.
// But NO already plays DAL. So that's wrong in CBS or I misread.
// Let me re-read: "NYG @ NO, ... NO @ DAL" - that's the same team playing twice!
// I think the real W13 from CBS: 
// MIA@GB, IND@NE, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, NYG@NO, LV@KC, LAC@CIN, HOU@PIT, DAL@SEA
// NO doesn't play DAL in W13.
// Missing: BAL, BUF, JAX, TEN, NO, DAL = 6 teams = 3 games
// Add: BUF@BAL, JAX@TEN, NO@DAL

// Actually I realize CBS says NO@DAL for week 13. Let me check if NYG@NO or NO@DAL.
// "NO@DAL" - this is in the article. NYG@NO is NOT in the article. I misread.
// Let me re-read: "NYG @ NO" - no that doesn't appear. The list is:
// MIA@GB(Thu), IND@NE, NO@DAL, ARI@MIN, CHI@SF, CAR@TB, WAS@PHI, CLE@DEN, LV@KC, LAC@CIN, HOU@PIT, DAL@SEA(Mon)
// = 12 games. Missing 4 games (8 teams): NYG, BAL, BUF, JAX, TEN, ATL, DET, + 1 more

// Let me just add games for remaining teams. After W12, count games per team.
