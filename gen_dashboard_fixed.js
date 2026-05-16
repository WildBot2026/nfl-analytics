const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, 'data');

const schedule = JSON.parse(fs.readFileSync(path.join(__dirname, 'schedule_2026_complete.json'), 'utf8'));
const rosters = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rosters.json'), 'utf8'));
const teamStats = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'team_stats.json'), 'utf8'));
const teamsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'teams.json'), 'utf8'));

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

// Add abbr to each game
for (const wk of Object.keys(schedule)) {
  for (const g of schedule[wk]) {
    g.awayAbbr = TEAM_ABBR[g.away] || g.away;
    g.homeAbbr = TEAM_ABBR[g.home] || g.home;
  }
}

// Compute JSON strings safely using Buffer approach
const scheduleStr = JSON.stringify(schedule);
const teamsStr = JSON.stringify(Object.entries(TEAM_ABBR).map(([n,a])=>({n,a})).sort((a,b)=>a.n.localeCompare(b.n)));

// Team stats array
const teamStatsArr = Object.entries(teamStats).map(([abbr, d]) => {
  const p = d.passing||{}, r=d.rushing||{}, de=d.defensive||{}, s=d.scoring||{};
  return {
    abbr,
    name: REV_ABBR[abbr]||abbr,
    passYds: (p.netPassingYards||{}).total||0,
    passYdsG: (p.netPassingYardsPerGame||{}).total||0,
    rushYds: (r.rushingYards||{}).total||0,
    rushYdsG: (r.rushingYardsPerGame||{}).total||0,
    points: (s.totalPoints||{}).total||0,
    sacks: (de.sacks||{}).total||0,
    tackles: (de.totalTackles||{}).total||0,
    completionPct: (p.completionPct||{}).total||0,
    rushAvg: (r.rushingAverage||{}).total||0
  };
});
const statsStr = JSON.stringify(teamStatsArr);

// Roster arrays
const rosterArr = {off:{}, def:{}};
for (const [abbr, data] of Object.entries(rosters)) {
  rosterArr.off[abbr] = (data.off||[]).slice(0,40).map(p => ({n:p.name, p:p.pos, j:p.jersey, e:p.exp}));
  rosterArr.def[abbr] = (data.def||[]).slice(0,40).map(p => ({n:p.name, p:p.pos, j:p.jersey, e:p.exp}));
}
const rosterStr = JSON.stringify(rosterArr);

let tp = 0;
for (const a of Object.keys(rosterArr.off)) {
  tp += (rosterArr.off[a]||[]).length + (rosterArr.def[a]||[]).length;
}

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
.tabs{display:flex;gap:2px;background:#0f1420;padding:10px 30px 0;border-bottom:1px solid #2a3050;overflow-x:auto}
.tab{padding:10px 20px;cursor:pointer;background:#1a1f30;color:#888;border:1px solid #2a3050;border-bottom:none;border-radius:6px 6px 0 0;font-size:13px;white-space:nowrap;transition:all .2s}
.tab:hover{color:#ccc;background:#222838}
.tab.active{background:#0a0e17;color:#00d4aa;border-color:#00d4aa}
.content{display:none;padding:20px 30px}
.content.active{display:block}
.filters{display:flex;gap:15px;margin-bottom:20px;flex-wrap:wrap}
.filters select,.filters input{background:#1a1f30;color:#e0e0e0;border:1px solid #2a3050;padding:8px 12px;border-radius:4px;font-size:13px}
.filters select option{background:#1a1f30}
.filters label{font-size:12px;color:#888;display:flex;flex-direction:column;gap:4px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1a1f30;color:#00d4aa;padding:10px 8px;text-align:left;font-weight:600;border-bottom:2px solid #2a3050;position:sticky;top:0}
td{padding:8px;border-bottom:1px solid #1a2030}
tr:hover{background:#111827}
.team-badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600}
.team-home{color:#00d4aa;background:rgba(0,212,170,0.1)}
.team-away{color:#4a9eff;background:rgba(74,158,255,0.1)}
.network-badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:10px;background:#2a3050;color:#aaa}
.primetime{background:rgba(255,215,0,0.05)}
.status-bar{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap}
.stat-card{background:linear-gradient(135deg,#1a1f30,#0f1420);border:1px solid #2a3050;border-radius:8px;padding:15px;min-width:140px;flex:1}
.stat-card .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px}
.stat-card .value{font-size:22px;font-weight:700;color:#fff;margin-top:4px}
.stat-card .value.green{color:#00d4aa}
.stat-card .value.blue{color:#4a9eff}
.stat-card .value.gold{color:#ffd700}
.bar-container{background:#1a2030;border-radius:4px;height:8px;margin:6px 0;overflow:hidden}
.bar{height:100%;border-radius:4px;transition:width .5s;min-width:2px}
.bar.passing{background:linear-gradient(90deg,#4a9eff,#6ab0ff)}
.bar.rushing{background:linear-gradient(90deg,#ffd700,#ffaa00)}
.bar.scoring{background:linear-gradient(90deg,#00d4aa,#00ff88)}
.bar.defense{background:linear-gradient(90deg,#ff6b6b,#ff4444)}
.team-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:15px}
.team-stat-card{background:#111827;border:1px solid #2a3050;border-radius:8px;padding:15px}
.team-stat-card h3{font-size:14px;color:#fff;margin-bottom:10px}
.team-stat-card h3 span{color:#00d4aa;font-size:11px}
.stat-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:#aaa}
.stat-row .val{color:#fff;font-weight:600}
.roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:15px}
.roster-card{background:#111827;border:1px solid #2a3050;border-radius:8px;padding:12px;max-height:480px;overflow-y:auto}
.roster-card h3{font-size:13px;color:#fff;margin-bottom:8px;position:sticky;top:0;background:#111827;padding:4px 0}
.roster-player{display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid #1a2030}
.roster-player .name{color:#ccc}
.roster-player .pos{color:#4a9eff;font-weight:600;width:30px}
.roster-player .jersey{color:#555;width:25px;text-align:center}
.roster-player .exp{color:#888;width:25px;text-align:right}
.stat-chart-item{margin-bottom:10px}
.stat-chart-item .label-row{display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px}
.stat-chart-item .label-row .team-name{color:#ccc}
.stat-chart-item .label-row .team-val{color:#fff;font-weight:600}
.filter-bar{display:flex;gap:20px;margin-bottom:20px;align-items:flex-end;flex-wrap:wrap}
.filter-group{display:flex;flex-direction:column;gap:3px}
.filter-group label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px}
.filter-group select{background:#1a1f30;color:#e0e0e0;border:1px solid #2a3050;padding:7px 10px;border-radius:4px;font-size:13px}
.schedule-count{font-size:12px;color:#666;margin-bottom:8px;padding:4px 8px;background:#111827;border-radius:4px;display:inline-block}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:#0a0e17}
::-webkit-scrollbar-thumb{background:#2a3050;border-radius:3px}
</style>
</head>
<body>
<div class="header">
  <h1>🏈 <span>NFL</span> 2026 Analytics</h1>
  <div class="sub">Complete Season — 272 Games · 32 Teams · Real Rosters & Stats</div>
</div>

<div class="tabs">
  <div class="tab active" onclick="switchTab('schedule')">📅 Schedule</div>
  <div class="tab" onclick="switchTab('teams')">🏆 Teams</div>
  <div class="tab" onclick="switchTab('stats')">📊 Stats</div>
  <div class="tab" onclick="switchTab('rosters')">👥 Rosters</div>
</div>

<div id="tab-schedule" class="content active">
  <div class="filter-bar">
    <div class="filter-group">
      <label>Week</label>
      <select id="weekFilter" onchange="applyFilters()">
        <option value="all">All Weeks</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Team</label>
      <select id="teamFilter" onchange="applyFilters()">
        <option value="all">All Teams</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Network</label>
      <select id="networkFilter" onchange="applyFilters()">
        <option value="all">All Networks</option>
      </select>
    </div>
  </div>
  <div id="scheduleInfo" class="schedule-count">Loading...</div>
  <div id="scheduleTable"></div>
</div>

<div id="tab-teams" class="content">
  <div class="status-bar">
    <div class="stat-card"><div class="label">Teams</div><div class="value blue">32</div></div>
    <div class="stat-card"><div class="label">Games</div><div class="value green">272</div></div>
    <div class="stat-card"><div class="label">Weeks</div><div class="value gold">18</div></div>
    <div class="stat-card"><div class="label">Players</div><div class="value blue" id="totalPlayers">—</div></div>
  </div>
  <div class="filter-bar">
    <div class="filter-group">
      <label>Team</label>
      <select id="teamFilter2" onchange="applyTeamFilter()">
        <option value="all">All Teams</option>
      </select>
    </div>
  </div>
  <div id="teamCards" class="team-stats-grid"></div>
</div>

<div id="tab-stats" class="content">
  <div class="filter-bar">
    <div class="filter-group">
      <label>Stat Category</label>
      <select id="statCat" onchange="renderStatChart()">
        <option value="passYds">Passing Yards</option>
        <option value="passYdsG">Pass Yards/Game</option>
        <option value="rushYds">Rushing Yards</option>
        <option value="rushYdsG">Rush Yards/Game</option>
        <option value="points">Total Points</option>
        <option value="sacks">Sacks</option>
        <option value="completionPct">Completion %</option>
      </select>
    </div>
  </div>
  <div id="statChart"></div>
</div>

<div id="tab-rosters" class="content">
  <div class="filter-bar">
    <div class="filter-group">
      <label>Team</label>
      <select id="rosterTeamFilter" onchange="applyRosterFilter()">
        <option value="all">All Teams</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Unit</label>
      <select id="rosterUnit" onchange="applyRosterFilter()">
        <option value="off">Offense</option>
        <option value="def">Defense</option>
      </select>
    </div>
  </div>
  <div id="rosterGrid" class="roster-grid"></div>
</div>

<script>
const schedule = ${scheduleStr};
const teamStats = ${statsStr};
const rosters = ${rosterStr};
const teams = ${teamsStr};

function init() {
  // Populate week filter
  const wf = document.getElementById('weekFilter');
  for (let w = 1; w <= 18; w++) {
    const opt = document.createElement('option');
    opt.value = w; opt.textContent = 'Week ' + w;
    wf.appendChild(opt);
  }

  // Populate team filters
  ['teamFilter','teamFilter2','rosterTeamFilter'].forEach(id => {
    const sel = document.getElementById(id);
    teams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.a; opt.textContent = t.n;
      sel.appendChild(opt);
    });
  });

  // Populate network filter
  const nf = document.getElementById('networkFilter');
  const nets = new Set();
  Object.values(schedule).forEach(games => games.forEach(g => { if (g.network) nets.add(g.network); }));
  [...nets].sort().forEach(n => {
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = n;
    nf.appendChild(opt);
  });

  // Count total players
  let tp = 0;
  Object.values(rosters.off||{}).forEach(arr => tp += arr.length);
  Object.values(rosters.def||{}).forEach(arr => tp += arr.length);
  document.getElementById('totalPlayers').textContent = tp.toLocaleString();

  applyFilters();
  applyTeamFilter();
  renderStatChart();
  applyRosterFilter();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.querySelector(\`[onclick*="\${name}"]\`).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

function time12(t) {
  if (!t) return '';
  const [h,m] = t.split(':');
  const hr = parseInt(h);
  const amp = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr > 12 ? hr-12 : (hr === 0 ? 12 : hr);
  return h12+':'+m+' '+amp;
}

function formatDate(d) {
  const p = d.split('-');
  return p[1]+'/'+p[2]+'/'+p[0].slice(2);
}

function isPrime(g) {
  const pt = ['NBC','ESPN','Amazon','Netflix'];
  return pt.includes(g.network) && (g.time >= '20:00');
}

function applyFilters() {
  const week = document.getElementById('weekFilter').value;
  const team = document.getElementById('teamFilter').value;
  const network = document.getElementById('networkFilter').value;
  const table = document.getElementById('scheduleTable');
  const info = document.getElementById('scheduleInfo');

  let html = '<table><thead><tr><th>Wk</th><th>Date</th><th>Day</th><th>Time</th><th>Away</th><th></th><th>Home</th><th>Net</th></tr></thead><tbody>';
  let count = 0;

  for (let w = 1; w <= 18; w++) {
    const gs = schedule[String(w)] || [];
    for (const g of gs) {
      if (week !== 'all' && String(week) !== String(w)) continue;
      if (team !== 'all' && g.awayAbbr !== team && g.homeAbbr !== team) continue;
      if (network !== 'all' && g.network !== network) continue;
      count++;
      const prime = isPrime(g);
      const aShort = g.away.replace(/^(Buffalo|New|Los Angeles|San Francisco|Kansas City|Green Bay|New England|Las Vegas|Tampa Bay)/, '').trim();
      const hShort = g.home.replace(/^(Buffalo|New|Los Angeles|San Francisco|Kansas City|Green Bay|New England|Las Vegas|Tampa Bay)/, '').trim();
      html += '<tr'+(prime?' class="primetime"':'')+'>';
      html += '<td>'+g.week+'</td>';
      html += '<td>'+formatDate(g.date)+'</td>';
      html += '<td>'+(g.day||'')+'</td>';
      html += '<td>'+time12(g.time)+'</td>';
      html += '<td><span class="team-badge team-away">'+g.awayAbbr+'</span> '+(aShort||g.away)+'</td>';
      html += '<td style="color:#555;text-align:center">vs</td>';
      html += '<td><span class="team-badge team-home">'+g.homeAbbr+'</span> '+(hShort||g.home)+'</td>';
      html += '<td><span class="network-badge">'+(g.network||'')+'</span></td>';
      html += '</tr>';
    }
  }
  html += '</tbody></table>';
  info.textContent = 'Showing ' + count + ' of 272 games';
  table.innerHTML = count > 0 ? html : '<div style="padding:40px;text-align:center;color:#666">No games match your filters</div>';
}

function applyTeamFilter() {
  const team = document.getElementById('teamFilter2').value;
  const container = document.getElementById('teamCards');
  let items = teamStats;
  if (team !== 'all') items = items.filter(s => s.abbr === team);

  const maxPass = Math.max(...items.map(s=>s.passYds), 1);
  const maxRush = Math.max(...items.map(s=>s.rushYds), 1);
  const maxPts = Math.max(...items.map(s=>s.points), 1);

  let html = '';
  for (const s of items) {
    html += '<div class="team-stat-card">';
    html += '<h3>'+s.name+' <span>('+s.abbr+')</span></h3>';
    html += '<div class="stat-row"><span>Pass Yds</span><span class="val">'+s.passYds.toLocaleString()+'</span></div>';
    html += '<div class="bar-container"><div class="bar passing" style="width:'+(s.passYds/maxPass*100)+'%"></div></div>';
    html += '<div class="stat-row"><span>Rush Yds</span><span class="val">'+s.rushYds.toLocaleString()+'</span></div>';
    html += '<div class="bar-container"><div class="bar rushing" style="width:'+(s.rushYds/maxRush*100)+'%"></div></div>';
    html += '<div class="stat-row"><span>Points</span><span class="val">'+s.points+'</span></div>';
    html += '<div class="bar-container"><div class="bar scoring" style="width:'+(s.points/maxPts*100)+'%"></div></div>';
    html += '<div class="stat-row"><span>Sacks</span><span class="val">'+s.sacks+'</span></div>';
    html += '<div class="stat-row"><span>Cmp%</span><span class="val">'+s.completionPct.toFixed(1)+'%</span></div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function renderStatChart() {
  const cat = document.getElementById('statCat').value;
  const container = document.getElementById('statChart');
  const sorted = [...teamStats].sort((a,b) => (b[cat]||0)-(a[cat]||0));
  const max = Math.max(...sorted.map(s=>s[cat]||0), 1);
  const bc = cat.includes('rush') ? 'rushing' : (cat==='points' ? 'scoring' : (cat==='sacks'?'defense':'passing'));

  let html = '';
  for (const s of sorted) {
    const val = cat==='completionPct' ? (s[cat]||0).toFixed(1)+'%' : (s[cat]||0).toLocaleString();
    html += '<div class="stat-chart-item">';
    html += '<div class="label-row"><span class="team-name">'+s.name+' ('+s.abbr+')</span><span class="team-val">'+val+'</span></div>';
    html += '<div class="bar-container"><div class="bar '+bc+'" style="width:'+(s[cat]/max*100)+'%"></div></div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function applyRosterFilter() {
  const team = document.getElementById('rosterTeamFilter').value;
  const unit = document.getElementById('rosterUnit').value;
  const container = document.getElementById('rosterGrid');
  const list = team === 'all' ? teams : teams.filter(t => t.a === team);

  let html = '';
  for (const t of list) {
    const players = rosters[unit]?.[t.a] || [];
    if (players.length === 0) continue;
    html += '<div class="roster-card">';
    html += '<h3>'+t.n+' ('+t.a+') — '+(unit==='off'?'Offense':'Defense')+'</h3>';
    for (const p of players) {
      const j = p.j||'—';
      html += '<div class="roster-player"><span class="pos">'+(p.p||'?')+'</span><span class="name">'+(p.n||'')+' <span class="jersey">#'+j+'</span></span><span class="exp">'+(p.e!==undefined?'Y'+p.e:'R')+'</span></div>';
    }
    html += '</div>';
  }
  container.innerHTML = html || '<div style="padding:40px;text-align:center;color:#666">No roster data</div>';
}

init();
</script>
</body>
</html>`;

const outPath = path.join(__dirname, 'dashboard_2026.html');
fs.writeFileSync(outPath, html);
console.log('✅ Dashboard written: ' + outPath);
console.log('   Size: ' + (html.length/1024).toFixed(1) + ' KB');
let totalG = 0;
for (const wk of Object.keys(schedule)) totalG += schedule[wk].length;
console.log('   Games: ' + totalG);
console.log('   Players in rosters: ' + tp);
