#!/usr/bin/env node
/**
 * 🦅 NFL DASHBOARD BUILDER v4
 * Genera un HTML dashboard que LEE de la base de datos local (JSON estáticos).
 * No genera datos nuevos — solo los organiza.
 */

const fs = require('fs');

const TEAMS_INFO = JSON.parse(fs.readFileSync(__dirname + '/data/teams.json', 'utf8'));
const ROSTERS = JSON.parse(fs.readFileSync(__dirname + '/data/rosters.json', 'utf8'));
const TEAM_STATS = JSON.parse(fs.readFileSync(__dirname + '/data/team_stats.json', 'utf8'));
const GAMES = JSON.parse(fs.readFileSync(__dirname + '/data/games.json', 'utf8'));

// Color map per team
const TEAM_COLORS = {
  ARI:'#97233F', ATL:'#A71930', BAL:'#241773', BUF:'#00338D', CAR:'#0085CA',
  CHI:'#0B162A', CIN:'#FB4F14', CLE:'#311D00', DAL:'#003594', DEN:'#FB4F14',
  DET:'#0076B6', GB:'#203731', HOU:'#03202F', IND:'#002C5F', JAX:'#006778',
  KC:'#E31837', LAC:'#0080C6', LAR:'#003594', LV:'#000000', MIA:'#008E97',
  MIN:'#4F2683', NE:'#002244', NO:'#D3BC8D', NYG:'#0B2265', NYJ:'#125740',
  PHI:'#004C54', PIT:'#FFB612', SEA:'#002244', SF:'#AA0000', TB:'#D50A0A',
  TEN:'#4B92DB', WAS:'#5A1414'
};

// ═══════════ BUILD ═══════════

const weeks = {};
for (const g of GAMES) {
  const w = g.week || 1;
  if (!weeks[w]) weeks[w] = [];
  weeks[w].push(g);
}

function posSort(a, b) {
  const order = {QB:0,RB:1,WR:2,TE:3,OL:4,DL:5,LB:6,CB:7,S:8,ST:9};
  return (order[a.posSimple]||99) - (order[b.posSimple]||99);
}

function calcGrade(p) {
  if (!p.careerStats) return 0;
  const s = p.careerStats;
  switch (p.posSimple) {
    case 'QB': return Math.min(100, Math.round(s.passYds / 500 + s.passTD * 3 - s.ints * 2));
    case 'RB': return Math.min(100, Math.round(s.rushYds / 200 + s.rushTD * 5 + (s.recYds||0) / 300));
    case 'WR': case 'TE': return Math.min(100, Math.round((s.recYds||0) / 300 + (s.recTD||0) * 5));
    case 'DL': case 'ED': return Math.min(100, Math.round((s.sacks||0) * 2 + (s.tackles||0) / 10));
    case 'LB': return Math.min(100, Math.round((s.tackles||0) / 5 + (s.sacks||0) * 1.5));
    case 'CB': case 'S': return Math.min(100, Math.round((s.pd||0) * 3 + (s.tackles||0) / 8));
    default: return 50;
  }
}

function prodStr(p) {
  if (!p.careerStats) return '';
  const s = p.careerStats;
  if (s.gp === 0) return 'No data';
  switch (p.posSimple) {
    case 'QB': return `${s.passYds.toLocaleString()}yd/${s.passTD}TD`;
    case 'RB': return `${s.rushYds.toLocaleString()}yd/${s.rushTD}TD`;
    case 'WR': case 'TE': return `${(s.recYds||0).toLocaleString()}yd/${s.recTD}TD`;
    case 'DL': case 'LB': return `${s.tackles}tk/${s.sacks}sck`;
    case 'CB': case 'S': return `${s.tackles}tk/${s.pd}PD`;
    default: return '';
  }
}

function teamCard(abb) {
  const info = TEAMS_INFO.teams[abb];
  const roster = ROSTERS[abb];
  if (!roster) return '';

  const color = TEAM_COLORS[abb] || '#333';
  const off = (roster.off||[]).sort(posSort);
  const def = (roster.def||[]).sort(posSort);
  const top6off = off.slice(0, 6);
  const top6def = def.slice(0, 6);

  const ts = TEAM_STATS[abb] || {};
  const offRanks = ts.passing ? 
    `Pass ${ts.passing.netPassingYards?.pg?`${ts.passing.netPassingYards.pg}ypg`:''} Rush ${ts.rushing?.rushingYards?.pg?`${ts.rushing.rushingYards.pg}ypg`:''}` : '';

  const defRanks = ts.defense ?
    `Sacks ${ts.defense.sacks?.total||0} Tackles ${ts.defense.totalTackles?.total||0}` : '';

  const totalCap = off.reduce((s,p) => s + p.capHit, 0) + def.reduce((s,p) => s + p.capHit, 0);

  const playerRows = (players, group) => players.map(p => {
    const g = calcGrade(p);
    const prod = prodStr(p);
    const colorClass = g >= 80 ? 'elite' : g >= 60 ? 'good' : g >= 40 ? 'avg' : 'low';
    return `<tr class="${colorClass}">
      <td>${p.name}</td>
      <td>${p.pos}</td>
      <td>${p.age||'?'}</td>
      <td>${p.capHit ? '$'+(p.capHit/1e6).toFixed(1)+'M' : '-'}</td>
      <td>${prod ? `<span class="stat">${prod}</span>` : '<span class="nostat">—</span>'}</td>
      <td class="grade">${g}</td>
    </tr>`;
  }).join('');

  return `<div class="team-card" data-team="${abb}">
    <div class="team-header" style="background:${color}">
      <h2>${abb}</h2>
      <span class="team-name">${info?.name||abb}</span>
      ${totalCap ? `<span class="cap-total">Cap: $${(totalCap/1e6).toFixed(0)}M</span>` : ''}
    </div>
    <div class="team-stats">
      ${offRanks ? `<div class="stat-row">🏈 ${offRanks}</div>` : ''}
      ${defRanks ? `<div class="stat-row">🛡️ ${defRanks}</div>` : ''}
    </div>
    <div class="roster-section">
      <h3>⚔️ OFFENSE</h3>
      <table class="player-table">
        <thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>Cap</th><th>Production</th><th>Grade</th></tr></thead>
        <tbody>${playerRows(off, 'off')}</tbody>
      </table>
      <h3>🛡️ DEFENSE</h3>
      <table class="player-table">
        <thead><tr><th>Player</th><th>Pos</th><th>Age</th><th>Cap</th><th>Production</th><th>Grade</th></tr></thead>
        <tbody>${playerRows(def, 'def')}</tbody>
      </table>
    </div>
  </div>`;
}

function gamesCard() {
  const sortedWeeks = Object.keys(weeks).sort((a,b) => a - b);
  return sortedWeeks.map(w => {
    const gw = weeks[w];
    return `<div class="week-group">
      <h3>Week ${w}</h3>
      <table class="games-table">
        <thead><tr><th>Away</th><th>Score</th><th>Home</th><th>Spread</th><th>O/U</th></tr></thead>
        <tbody>${gw.map(g => {
          const main = g.bookmakers?.[0]?.markets || [];
          const spread = main.find(m => m.key === 'spreads')?.outcomes || [];
          const total = main.find(m => m.key === 'totals')?.outcomes || [];
          const h2h = main.find(m => m.key === 'h2h')?.outcomes || [];
          const spreadLine = spread.length >= 2 ? `${spread[0].point > 0 ? spread[0].name+' +'+spread[0].point : spread[0].name+' '+spread[0].point}` : '';
          const totalLine = total.length > 0 ? `O/U ${Math.round(total[0].point || total[1]?.point || 0)}` : '';
          const date = new Date(g.commenceTime).toLocaleDateString('en-US', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
          return `<tr>
            <td>${g.awayTeam}</td>
            <td class="date-cell">${date}</td>
            <td>${g.homeTeam}</td>
            <td>${spreadLine}</td>
            <td>${totalLine}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
  }).join('');
}

function topPlayersByPos(pos, limit=10) {
  const all = [];
  for (const abb in ROSTERS) {
    for (const p of [...(ROSTERS[abb].off||[]), ...(ROSTERS[abb].def||[])]) {
      if (p.posSimple === pos && p.careerStats) {
        all.push({ ...p, team: abb, grade: calcGrade(p) });
      }
    }
  }
  return all.sort((a,b) => b.grade - a.grade).slice(0, limit);
}

// ═══════════ HTML ═══════════

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NFL 2026 — RAVEN DB</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Inter,sans-serif; background:#0a0a0f; color:#e0e0e0; }
.container { max-width:1600px; margin:0 auto; padding:20px; }

header { text-align:center; padding:30px 0; border-bottom:1px solid #1a1a2e; margin-bottom:30px; }
header h1 { font-size:2.5em; background:linear-gradient(135deg,#ff6b35,#ff3366); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
header p { color:#666; margin-top:5px; }

.controls { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
.controls input, .controls select, .controls button { padding:8px 12px; border:1px solid #333; border-radius:6px; background:#1a1a2e; color:#eee; font-size:14px; }
.controls input:focus, .controls select:focus { outline:none; border-color:#ff6b35; }
.controls button { background:linear-gradient(135deg,#ff6b35,#ff3366); color:#fff; border:none; cursor:pointer; }
.controls button:hover { opacity:0.9; }

.views { display:flex; gap:8px; margin-bottom:20px; }
.views button { padding:8px 16px; border:1px solid #333; border-radius:6px; background:#1a1a2e; color:#aaa; cursor:pointer; }
.views button.active { background:#ff6b35; color:#fff; border-color:#ff6b35; }

.team-grid { display:grid; gap:20px; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); }
.team-card { border:1px solid #1a1a2e; border-radius:12px; overflow:hidden; background:#111118; }
.team-header { padding:15px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.team-header h2 { font-size:1.5em; color:#fff; letter-spacing:1px; }
.team-name { font-size:0.85em; color:rgba(255,255,255,.7); }
.cap-total { margin-left:auto; font-size:0.8em; color:rgba(255,255,255,.6); background:rgba(0,0,0,.3); padding:3px 8px; border-radius:4px; }
.team-stats { padding:8px 15px; background:#0d0d15; font-size:0.85em; color:#aaa; }
.stat-row { display:inline-block; margin-right:15px; }

.roster-section { padding:10px 15px 15px; }
.roster-section h3 { font-size:0.85em; text-transform:uppercase; color:#666; margin:10px 0 5px; letter-spacing:1px; }

.player-table { width:100%; border-collapse:collapse; font-size:0.8em; }
.player-table th { text-align:left; padding:4px 6px; color:#666; border-bottom:1px solid #1a1a2e; font-size:0.75em; text-transform:uppercase; }
.player-table td { padding:4px 6px; border-bottom:1px solid #0d0d15; }
.player-table tr:hover td { background:rgba(255,255,255,.02); }
.player-table tr.elite td { color:#ff6b35; }
.player-table tr.good td { color:#ccc; }
.player-table tr.avg td { color:#888; }
.player-table tr.low td { color:#555; }
.player-table td.grade { text-align:right; font-weight:700; font-size:1.1em; }
.player-table .stat { color:#4caf50; font-size:0.85em; }
.player-table .nostat { color:#444; font-size:0.85em; }

.games-section { margin-top:30px; }
.week-group { margin-bottom:20px; }
.week-group h3 { color:#ff6b35; margin-bottom:10px; }
.games-table { width:100%; border-collapse:collapse; font-size:0.85em; }
.games-table th { text-align:left; padding:6px 10px; color:#666; border-bottom:1px solid #1a1a2e; }
.games-table td { padding:6px 10px; border-bottom:1px solid #0d0d15; }
.games-table tr:hover td { background:rgba(255,255,255,.02); }
.games-table .date-cell { color:#888; font-size:0.85em; }

.top-section { margin-bottom:30px; background:#111118; border:1px solid #1a1a2e; border-radius:12px; padding:15px; }
.top-section h3 { color:#ff6b35; margin-bottom:10px; }
.top-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:15px; }
.top-player { padding:8px 12px; background:#0d0d15; border-radius:6px; display:flex; justify-content:space-between; }
.top-player .name { font-weight:600; }
.top-player .team { color:#888; font-size:0.85em; }
.top-player .grade { color:#ff6b35; font-weight:700; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>🏈 NFL 2026</h1>
    <p>RAVEN DB · ${Object.keys(TEAMS_INFO.teams).length} teams · ${Object.values(ROSTERS).reduce((s,r) => s+(r.off||[]).length+(r.def||[]).length,0)} players · ${GAMES.length} games</p>
  </header>

  <div class="controls">
    <input type="text" id="search" placeholder="Search team, player..." oninput="filterTeams()">
    <select id="confFilter" onchange="filterTeams()"><option value="all">All Conferences</option><option value="AFC">AFC</option><option value="NFC">NFC</option></select>
    <button onclick="confetti()">🎉</button>
  </div>

  <div class="views">
    <button class="active" onclick="showView('teams',this)">📋 Teams</button>
    <button onclick="showView('top',this)">🏆 Top Players</button>
    <button onclick="showView('games',this)">📅 Schedule</button>
  </div>

  <div id="view-teams" class="team-grid">
    ${Object.keys(TEAMS_INFO.teams).map(abb => teamCard(abb)).join('')}
  </div>

  <div id="view-top" style="display:none">
    ${['QB','RB','WR','TE','DL','LB','CB','S'].map(pos => `
    <div class="top-section">
      <h3>${pos}s</h3>
      <div class="top-grid">
        ${topPlayersByPos(pos, 8).map(p => `
        <div class="top-player">
          <span><span class="name">${p.name}</span> <span class="team">${p.team}</span></span>
          <span class="grade">${p.grade}</span>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>

  <div id="view-games" style="display:none" class="games-section">
    ${gamesCard()}
  </div>
</div>

<script>
function filterTeams() {
  const q = document.getElementById('search').value.toLowerCase();
  const conf = document.getElementById('confFilter').value;
  document.querySelectorAll('.team-card').forEach(c => {
    const html = c.innerText.toLowerCase();
    const abb = c.dataset.team;
    const info = ${JSON.stringify(TEAMS_INFO.teams)};
    const teamConf = info[abb] ? info[abb].conference.toLowerCase() : '';
    const match = html.includes(q) && (conf === 'all' || teamConf === conf.toLowerCase());
    c.style.display = match ? '' : 'none';
  });
}

function showView(view, btn) {
  document.querySelectorAll('.views button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('[id^=\"view-\"]').forEach(v => v.style.display = 'none');
  document.getElementById('view-' + view).style.display = view === 'teams' ? 'grid' : '';
}

function confetti() {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(c);
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    const x = Math.random() * 100;
    const d = Math.random() * 3 + 2;
    p.style.cssText = \`position:absolute;left:\${x}%;top:-20px;width:10px;height:10px;background:hsl(\${Math.random()*360},100%,50%);border-radius:50%;animation:fall \${d}s linear forwards;animation-delay:\${Math.random()*2}s\`;
    c.appendChild(p);
  }
  setTimeout(() => c.remove(), 5000);
}
const style = document.createElement('style');
style.textContent = \`@keyframes fall { to { top: 110vh; opacity: 0; } }\`;
document.head.appendChild(style);
</script>
</body>
</html>`;

fs.writeFileSync(__dirname + '/index.html', html);
console.log('✅ NFL Dashboard written to index.html');
console.log('📊 ' + Object.keys(ROSTERS).length + ' teams, ' + GAMES.length + ' games');
console.log('🌐 Open in browser to view');
