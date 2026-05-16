#!/usr/bin/env node
// Part 2: Save schedule and generate dashboard

const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, 'data');

// Load part 1 results
const schedule = JSON.parse(fs.readFileSync(path.join(__dirname, '_schedule_tmp.json'), 'utf8'));
const { rosters, rostersFlat, teamStats } = JSON.parse(fs.readFileSync(path.join(__dirname, '_data_tmp.json'), 'utf8'));

const TEAM_ABBR = {
  'Arizona Cardinals':'ARI','Atlanta Falcons':'ATL','Baltimore Ravens':'BAL',
  'Buffalo Bills':'BUF','Carolina Panthers':'CAR','Chicago Bears':'CHI',
  'Cincinnati Bengals':'CIN','Cleveland Browns':'CLE','Dallas Cowboys':'DAL',
  'Denver Broncos':'DEN','Detroit Lions':'DET','Green Bay Packers':'GB',
  'Houston Texans':'HOU','Indianapolis Colts':'IND','Jacksonville Jaguars':'JAX',
  'Kansas City Chiefs':'KC','Las Vegas Raiders':'LV','Los Angeles Chargers':'LAC',
  'Los Angeles Rams':'LAR','Miami Dolphins':'MIA','Minnesota Vikings':'MIN',
  'New England Patriots':'NE','New Orleans Saints':'NO','New York Giants':'NYG',
  'New York Jets':'NYJ','Philadelphia Eagles':'PHI','Pittsburgh Steelers':'PIT',
  'San Francisco 49ers':'SF','Seattle Seahawks':'SEA','Tampa Bay Buccaneers':'TB',
  'Tennessee Titans':'TEN','Washington Commanders':'WAS'
};

const REV_ABBR = {};
for (const [k,v] of Object.entries(TEAM_ABBR)) REV_ABBR[v] = k;

function abbrToFull(a) { return REV_ABBR[a] || a; }

// Count games
let totalGames = 0;
for (const wk of Object.keys(schedule)) {
  totalGames += schedule[wk].length;
}
console.log('Total games in schedule:', totalGames);

// Build team stats arrays for dashboard
function buildTeamStatsArray() {
  const stats = [];
  for (const [abbr, data] of Object.entries(teamStats)) {
    const fullName = abbrToFull(abbr) || abbr;
    const p = data.passing || {};
    const r = data.rushing || {};
    const d = data.defensive || {};
    const s = data.scoring || {};
    stats.push({
      abbr, name: fullName,
      passYds: (p.netPassingYards || {}).total || 0,
      passYdsG: (p.netPassingYardsPerGame || {}).total || 0,
      rushYds: (r.rushingYards || {}).total || 0,
      rushYdsG: (r.rushingYardsPerGame || {}).total || 0,
      points: (s.totalPoints || {}).total || 0,
      sacks: (d.sacks || {}).total || 0,
      tackles: (d.totalTackles || {}).total || 0,
      ints: (d.passesDefended || {}).total || 0
    });
  }
  return stats;
}

// Build roster arrays for dashboard
function buildRosterArrays() {
  const off = {};
  const def = {};
  for (const [abbr, data] of Object.entries(rosters)) {
    const fullName = abbrToFull(abbr) || abbr;
    const offPlayers = (data.off || []).slice(0, 25);
    const defPlayers = (data.def || []).slice(0, 25);
    off[abbr] = offPlayers.map(p => ({
      n: p.name, p: p.pos, j: p.jersey, e: p.exp
    }));
    def[abbr] = defPlayers.map(p => ({
      n: p.name, p: p.pos, j: p.jersey, e: p.exp
    }));
  }
  return { off, def };
}

const teamStatsArr = buildTeamStatsArray();
const rostersArr = buildRosterArrays();

// ============================================================
// GENERATE DASHBOARD HTML
// ============================================================
function genDashboard() {
  // Serialize data as JSON with single quotes to avoid HTML issues
  const scheduleJson = JSON.stringify(schedule).replace(/'/g, "\\'");
  const teamStatsJson = JSON.stringify(teamStatsArr).replace(/'/g, "\\'");
  const rostersJson = JSON.stringify(rostersArr).replace(/'/g, "\\'");
  const teamsJson = JSON.stringify(
    Object.entries(TEAM_ABBR).map(([n,a]) => ({n,a}))
  ).replace(/'/g, "\\'");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NFL 2026 Analytics Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0e17;color:#e0e0e0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#0f1420 0%,#1a1f30 100%);padding:20px 30px;border-bottom:1px solid #2a3050}
.header h1{font-size:24px;color:#fff;letter-spacing:1px}
.header h1 span{color:#00d4aa}
.header .sub{color:#888;font-size:13px;margin-top:4px}
.tabs{display:flex;gap:2px;background:#0f1420;padding:10px 30px 0;border-bottom:1px solid #2a3050}
.tab{padding:10px 20px;cursor:pointer;background:#1a1f30;color:#888;border:1px solid #2a3050;border-bottom:none;border-radius:6px 6px 0 0;font-size:13px;transition:all .2s}
.tab:hover{color:#ccc;background:#222838}
.tab.active{background:#0a0e17;color:#00d4aa;border-color:#00d4aa}
.content{display:none;padding:20px 30px}
.content.active{display:block}
.filters{display:flex;gap:15px;margin-bottom:20px;flex-wrap:wrap}
.filters select,.filters input{background:#1a1f30;color:#e0e0e0;border:1px solid #2a3050;padding:8px 12px;border-radius:4px;font-size:13px}
.filters select option{background:#1a1f30}
.filters label{font-size:12px;color:#888;display:flex;flex-direction:column;gap:4px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1a1f30;color:#00d4aa;padding:10px 8px;text-align:left;font-weight:600;border-bottom:2px solid #2a3050}
td{padding:8px;border-bottom:1px solid #1a2030}
tr:hover{background:#111827}
.team-badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600}
.team-home{color:#00d4aa;background:rgba(0,212,170,0.1)}
.team-away{color:#ff6b6b;background:rgba(255,107,107,0.1)}
.network-badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:10px;background:#2a3050;color:#aaa}
.primetime{background:rgba(255,215,0,0.15);color:#ffd700}
.status-bar{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap}
.stat-card{background:linear-gradient(135deg,#1a1f30,#0f1420);border:1px solid #2a3050;border-radius:8px;padding:15px;min-width:140px;flex:1}
.stat-card .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px}
.stat-card .value{font-size:22px;font-weight:700;color:#fff;margin-top:4px}
.stat-card .value.green{color:#00d4aa}
.stat-card .value.blue{color:#4a9eff}
.stat-card .value.gold{color:#ffd700}
.bar-container{background:#1a2030;border-radius:4px;height:8px;margin:6px 0;overflow:hidden}
.bar{height:100%;border-radius:4px;transition:width .5s;min-width:2px}
.bar.green{background:linear-gradient(90deg,#00d4aa,#00ff88)}
.bar.blue{background:linear-gradient(90deg,#4a9eff,#6ab0ff)}
.bar.gold{background:linear-gradient(90deg,#ffd700,#ffaa00)}
.team-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:15px}
.team-stat-card{background:#111827;border:1px solid #2a3050;border-radius:8px;padding:15px}
.team-stat-card h3{font-size:14px;color:#fff;margin-bottom:10px}
.team-stat-card h3 span{color:#00d4aa;font-size:11px}
.stat-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:#aaa}
.stat-row .val{color:#fff;font-weight:600}
.roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:15px}
.roster-card{background:#111827;border:1px solid #2a3050;border-radius:8px;padding:12px;max-height:400px;overflow-y:auto}
.roster-card h3{font-size:13px;color:#fff;margin-bottom:8px;position:sticky;top:0;background:#111827;padding:4px 0}
.roster-player{display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid #1a2030}
.roster-player .name{color:#ccc}
.roster-player .pos{color:#4a9eff;font-weight:600;width:30px}
.roster-player .exp{color:#888;width:20px;text-align:right}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:#0a0e17}
::-webkit-scrollbar-thumb{background:#2a3050;border-radius:3px}
.dashboard-link{color:#00d4aa;text-decoration:none;font-size:12px;margin-left:15px}
.dashboard-link:hover{text-decoration:underline}
@media(max-width:768px){
  .content{padding:10px}
  .tabs{padding:10px 10px 0;overflow-x:auto}
  .tab{padding:8px 12px;font-size:12px}
  .filters{flex-direction:column}
  .team-stats-grid,.roster-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>
<div class="header">
  <h1>🏈 <span>NFL</span> 2026 Analytics</h1>
  <div class="sub">Complete Season Dashboard — 272 Games · 32 Teams · Real Rosters & Stats</div>
</div>

<div class="tabs">
  <div class="tab active" onclick="switchTab('schedule')">📅 Schedule</div>
  <div class="tab" onclick="switchTab('teams')">🏆 Teams</div>
  <div class="tab" onclick="switchTab('stats')">📊 Stats</div>
  <div class="tab" onclick="switchTab('rosters')">👥 Rosters</div>
</div>

<div id="tab-schedule" class="content active">
  <div class="filters">
    <label>Week
      <select id="weekFilter" onchange="applyFilters()">
        <option value="all">All Weeks</option>
      </select>
    </label>
    <label>Team
      <select id="teamFilter" onchange="applyFilters()">
        <option value="all">All Teams</option>
      </select>
    </label>
    <label>Network
      <select id="networkFilter" onchange="applyFilters()">
        <option value="all">All Networks</option>
      </select>
    </label>
  </div>
  <div id="scheduleTable"></div>
</div>

<div id="tab-teams" class="content">
  <div class="status-bar">
    <div class="stat-card">
      <div class="label">Teams</div>
      <div class="value blue">32</div>
    </div>
    <div class="stat-card">
      <div class="label">Games</div>
      <div class="value green">272</div>
    </div>
    <div class="stat-card">
      <div class="label">Weeks</div>
      <div class="value gold">18</div>
    </div>
    <div class="stat-card">
      <div class="label">Players</div>
      <div class="value blue" id="totalPlayers">—</div>
    </div>
  </div>
  <div class="filters">
    <label>Team
      <select id="teamFilter2" onchange="applyTeamFilter()">
        <option value="all">All Teams</option>
      </select>
    </label>
  </div>
  <div id="teamCards" class="team-stats-grid"></div>
</div>

<div id="tab-stats" class="content">
  <div class="filters">
    <label>Stat Category
      <select id="statCat" onchange="renderStatChart()">
        <option value="passYds">Passing Yards</option>
        <option value="rushYds">Rushing Yards</option>
        <option value="points">Total Points</option>
        <option value="sacks">Sacks</option>
      </select>
    </label>
  </div>
  <div id="statChart"></div>
</div>

<div id="tab-rosters" class="content">
  <div class="filters">
    <label>Team
      <select id="rosterTeamFilter" onchange="applyRosterFilter()">
        <option value="all">All Teams</option>
      </select>
    </label>
    <label>Unit
      <select id="rosterUnit" onchange="applyRosterFilter()">
        <option value="off">Offense</option>
        <option value="def">Defense</option>
      </select>
    </label>
  </div>
  <div id="rosterGrid" class="roster-grid"></div>
</div>

<script>
const scheduleData = '${scheduleJson}';
const teamStatsData = '${teamStatsJson}';
const rosterData = '${rostersJson}';
const teamsData = '${teamsJson}';

const schedule = JSON.parse(scheduleData);
const teamStats = JSON.parse(teamStatsData);
const rosters = JSON.parse(rosterData);
const teams = JSON.parse(teamsData);

// Populate filter options
function init() {
  // Week filter
  const wf = document.getElementById('weekFilter');
  for (let w = 1; w <= 18; w++) {
    const opt = document.createElement('option');
    opt.value = w; opt.textContent = 'Week ' + w;
    wf.appendChild(opt);
  }

  // Team filters
  const allTeamFilters = ['teamFilter','teamFilter2','rosterTeamFilter'];
  const sortedTeams = [...teams].sort((a,b) => a.n.localeCompare(b.n));
  for (const id of allTeamFilters) {
    const sel = document.getElementById(id);
    for (const t of sortedTeams) {
      const opt = document.createElement('option');
      opt.value = t.a; opt.textContent = t.n;
      sel.appendChild(opt);
    }
  }

  // Network filter
  const nf = document.getElementById('networkFilter');
  const nets = new Set();
  for (const wk of Object.keys(schedule)) {
    for (const g of schedule[wk]) {
      if (g.network) nets.add(g.network);
    }
  }
  for (const n of [...nets].sort()) {
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = n;
    nf.appendChild(opt);
  }

  // Count total players
  let tp = 0;
  for (const abbr of Object.keys(rosters.off || {})) {
    tp += (rosters.off[abbr] || []).length;
    tp += (rosters.def[abbr] || []).length;
  }
  document.getElementById('totalPlayers').textContent = tp.toLocaleString();

  applyFilters();
  applyTeamFilter();
  renderStatChart();
  applyRosterFilter();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.querySelector('.tab[onclick*="'+name+'"]').classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
}

function applyFilters() {
  const week = document.getElementById('weekFilter').value;
  const team = document.getElementById('teamFilter').value;
  const network = document.getElementById('networkFilter').value;
  const table = document.getElementById('scheduleTable');

  let html = '<table><thead><tr><th>Week</th><th>Date</th><th>Day</th><th>Time</th><th>Away</th><th>Home</th><th>Network</th></tr></thead><tbody>';
  let count = 0;

  for (let w = 1; w <= 18; w++) {
    const wkStr = String(w);
    const games = schedule[wkStr] || [];
    for (const g of games) {
      if (week !== 'all' && String(week) !== wkStr) continue;
      if (team !== 'all' && g.awayAbbr !== team && g.homeAbbr !== team) continue;
      if (network !== 'all' && g.network !== network) continue;
      count++;

      const isPrime = g.network && ['NBC','ESPN','Amazon','Netflix','Fox'].includes(g.network) && (g.time.includes('20:') || g.time.includes('8:'));
      const time12 = g.time.replace(/^(\d+):(\d+)/, (_,h,m) => {
        const hr = parseInt(h);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const h12 = hr > 12 ? hr-12 : (hr === 0 ? 12 : hr);
        return h12 + ':' + m + ' ' + ampm;
      });
      const dateParts = g.date.split('-');
      const dateStr = dateParts[1] + '/' + dateParts[2] + '/' + dateParts[0].slice(2);

      html += '<tr' + (isPrime ? ' class="primetime"' : '') + '>';
      html += '<td>W' + g.week + '</td>';
      html += '<td>' + dateStr + '</td>';
      html += '<td>' + g.day + '</td>';
      html += '<td>' + time12 + '</td>';
      html += '<td><span class="team-badge team-away">' + g.awayAbbr + '</span></td>';
      html += '<td><span class="team-badge team-home">' + g.homeAbbr + '</span> <span style="color:#666;font-size:11px">' + g.away.split(' ').pop() + ' @ ' + g.home.split(' ').pop() + '</span></td>';
      html += '<td><span class="network-badge' + (isPrime ? '" style="background:rgba(255,215,0,0.2);color:#ffd700"' : '"') + '>' + g.network + '</span></td>';
      html += '</tr>';
    }
  }

  html += '</tbody></table>';
  if (count === 0) html = '<div style="padding:40px;text-align:center;color:#666">No games match your filters</div>';
  else html = '<div style="margin-bottom:10px;font-size:13px;color:#888">Showing ' + count + ' games</div>' + html;
  table.innerHTML = html;
}

function applyTeamFilter() {
  const team = document.getElementById('teamFilter2').value;
  const container = document.getElementById('teamCards');

  let items = teamStats;
  if (team !== 'all') items = items.filter(s => s.abbr === team);

  let html = '';
  for (const s of items) {
    html += '<div class="team-stat-card">';
    html += '<h3>' + s.name + ' <span>(' + s.abbr + ')</span></h3>';
    html += '<div class="stat-row"><span>Passing Yds</span><span class="val">' + s.passYds.toLocaleString() + '</span></div>';
    html += '<div class="bar-container"><div class="bar blue" style="width:' + Math.min(100, s.passYds/50) + '%"></div></div>';
    html += '<div class="stat-row"><span>Pass Yds/Game</span><span class="val">' + s.passYdsG.toFixed(1) + '</span></div>';
    html += '<div class="stat-row"><span>Rushing Yds</span><span class="val">' + s.rushYds.toLocaleString() + '</span></div>';
    html += '<div class="bar-container"><div class="bar gold" style="width:' + Math.min(100, s.rushYds/30) + '%"></div></div>';
    html += '<div class="stat-row"><span>Rush Yds/Game</span><span class="val">' + s.rushYdsG.toFixed(1) + '</span></div>';
    html += '<div class="stat-row"><span>Points</span><span class="val">' + s.points + '</span></div>';
    html += '<div class="bar-container"><div class="bar green" style="width:' + Math.min(100, s.points/4) + '%"></div></div>';
    html += '<div class="stat-row"><span>Sacks</span><span class="val">' + s.sacks + '</span></div>';
    html += '<div class="stat-row"><span>Total Tackles</span><span class="val">' + s.tackles.toLocaleString() + '</span></div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function renderStatChart() {
  const cat = document.getElementById('statCat').value;
  const container = document.getElementById('statChart');
  const sorted = [...teamStats].sort((a,b) => b[cat] - a[cat]);

  let html = '';
  for (const s of sorted) {
    const max = sorted[0][cat] || 1;
    const pct = (s[cat] / max * 100).toFixed(1);
    const color = cat === 'points' ? 'green' : (cat === 'sacks' ? 'gold' : 'blue');
    html += '<div style="margin-bottom:8px">';
    html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">';
    html += '<span style="color:#ccc">' + s.name + ' (' + s.abbr + ')</span>';
    html += '<span style="color:#fff;font-weight:600">' + s[cat].toLocaleString() + '</span>';
    html += '</div>';
    html += '<div class="bar-container"><div class="bar ' + color + '" style="width:' + pct + '%"></div></div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function applyRosterFilter() {
  const team = document.getElementById('rosterTeamFilter').value;
  const unit = document.getElementById('rosterUnit').value;
  const container = document.getElementById('rosterGrid');

  let html = '';
  const list = team === 'all' ? teams : teams.filter(t => t.a === team);

  for (const t of list) {
    const players = rosters[unit]?.[t.a] || [];
    if (players.length === 0) continue;

    html += '<div class="roster-card">';
    html += '<h3>' + t.n + ' (' + t.a + ') — ' + (unit === 'off' ? 'Offense' : 'Defense') + '</h3>';
    for (const p of players) {
      html += '<div class="roster-player">';
      html += '<span class="pos">' + (p.p || '?') + '</span>';
      html += '<span class="name">' + (p.n || 'Unknown') + ' <span style="color:#555">#' + (p.j || '—') + '</span></span>';
      html += '<span class="exp">' + (p.e !== undefined ? 'Y' + p.e : 'R') + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
}

init();
</script>
</body>
</html>`;

  const outPath = path.join(__dirname, 'dashboard_2026.html');
  fs.writeFileSync(outPath, html);
  console.log('✅ Dashboard written to:', outPath);
  console.log('   Size:', (html.length / 1024).toFixed(1), 'KB');
}

genDashboard();

// Save schedule JSON
const schedulePath = path.join(__dirname, 'schedule_2026_complete.json');
fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2));
console.log('✅ Schedule written to:', schedulePath);
console.log('   Games:', totalGames);

// Cleanup temp files
try {
  fs.unlinkSync(path.join(__dirname, '_schedule_tmp.json'));
  fs.unlinkSync(path.join(__dirname, '_data_tmp.json'));
} catch(e) {}

console.log('\\n🎉 DONE!');
