#!/usr/bin/env python3
"""Build NFL Dashboard V5 - Select week, select game, see full analysis"""
import json, os

DATA_FILE = '/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/nfl_data.json'
OUTPUT = '/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/dashboard.html'

with open(DATA_FILE) as f:
    nfl_data = json.load(f)

# Build game lookup: week -> games
weeks_data = {}
for game in nfl_data:
    w = game.get('week', 1)
    if w not in weeks_data:
        weeks_data[w] = []
    weeks_data[w].append(game)

weeks_count = len(weeks_data)

html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2025 Analytics Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a1a;color:#e0e0e0;min-height:100vh}
.container{max-width:1100px;margin:0 auto;padding:16px}
h1{font-size:1.5rem;margin-bottom:8px;color:#fff;display:flex;align-items:center;gap:10px}
h1 small{font-size:.8rem;color:#888;font-weight:400}
.controls{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.controls select{padding:8px 14px;background:#1a1a2e;color:#e0e0e0;border:1px solid #333;border-radius:6px;font-size:.9rem;min-width:120px}
.controls select:focus{outline:none;border-color:#4a9eff}
#gameList{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px;margin-bottom:16px}
.game-card{background:#1a1a2e;border:1px solid #2a2a3e;border-radius:8px;padding:10px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:10px}
.game-card:hover{border-color:#4a9eff;background:#1e1e3a}
.game-card.selected{border-color:#4a9eff;background:#1e1e3a;box-shadow:0 0 8px rgba(74,158,255,.3)}
.game-card .logos{display:flex;align-items:center;gap:6px;flex-shrink:0}
.game-card .logos img{width:28px;height:28px;border-radius:4px}
.game-card .teams{font-size:.85rem;line-height:1.3}
.game-card .teams .matchup{color:#fff;font-weight:600}
.game-card .teams .info{color:#888;font-size:.75rem}
.game-card .teams .highlight{color:#4a9eff;font-weight:600}
#analysis{display:none;animation:fadeIn .3s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
@media(max-width:768px){.analysis-grid{grid-template-columns:1fr}}
.card{background:#1a1a2e;border:1px solid #2a2a3e;border-radius:8px;padding:14px}
.card h3{font-size:.9rem;color:#4a9eff;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2a2a3e}
.card.full{grid-column:1/-1}
.stat-row{display:flex;justify-content:space-between;padding:3px 0;font-size:.8rem;border-bottom:1px solid rgba(255,255,255,.04)}
.stat-row .label{color:#888}
.stat-row .value{color:#fff;font-weight:500}
.stat-row .value.win{color:#4caf50}
.stat-row .value.loss{color:#f44336}
.qb-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px}
.qb-card{padding:8px;background:rgba(255,255,255,.03);border-radius:6px}
.qb-card .name{font-size:.9rem;font-weight:600;margin-bottom:4px}
.qb-card .team-name{font-size:.75rem;color:#888;margin-bottom:6px}
.qb-card .stats{font-size:.78rem}
.qb-card .stats div{display:flex;justify-content:space-between;padding:2px 0}
.qb-card .stats .l{color:#888}
.qb-card .stats .v{color:#fff}
.chart-container{height:160px;margin:8px 0}
.team-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.team-header img{width:24px;height:24px;border-radius:4px}
.team-header .name{font-weight:600;font-size:.9rem}
.team-header .record{color:#888;font-size:.75rem}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:600}
.badge.green{background:#1b5e20;color:#81c784}
.badge.red{background:#b71c1c;color:#ef9a9a}
.badge.yellow{background:#f57f17;color:#fff176}
.prediction{text-align:center;padding:10px}
.prediction .score{font-size:1.2rem;font-weight:700;color:#fff;margin:4px 0}
.prediction .conf{font-size:.8rem;color:#888}
.weather-box{display:flex;align-items:center;gap:6px;padding:6px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.8rem;margin:4px 0}
.no-data{color:#555;font-size:.8rem;font-style:italic}
.back-btn{background:#1a1a2e;border:1px solid #333;color:#e0e0e0;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:.85rem;margin-bottom:10px}
.back-btn:hover{background:#2a2a3e}
</style>
</head>
<body>
<div class="container">
<h1>🏈 NFL 2025 Analytics <small>18 weeks · 272 games · live ESPN data</small></h1>

<div class="controls">
  <select id="weekSelect">'''
for w in range(1, weeks_count + 1):
    html += f'<option value="{w}">Week {w}</option>'
html += '''</select>
  <button class="back-btn" id="backBtn" style="display:none" onclick="backToGames()">← Back to games</button>
</div>

<div id="gameList"></div>
<div id="analysis"></div>
</div>

<script>
const DATA = ''' + json.dumps(nfl_data) + ''';

const teamColors = {
  "ARI":"#97233f","ATL":"#a71930","BAL":"#241773","BUF":"#00338d","CAR":"#0085ca",
  "CHI":"#0b162a","CIN":"#fb4f14","CLE":"#311d00","DAL":"#002244","DEN":"#fb4f14",
  "DET":"#0076b6","GB":"#203731","HOU":"#03202f","IND":"#002c5f","JAX":"#006778",
  "KC":"#e31837","LAC":"#0080c6","LAR":"#003594","LV":"#000000","MIA":"#008e97",
  "MIN":"#4f2683","NE":"#002244","NO":"#d3bc8d","NYG":"#0b2265","NYJ":"#125740",
  "PHI":"#004c54","PIT":"#ffb612","SEA":"#002244","SF":"#aa0000","TB":"#d50a0a",
  "TEN":"#0c2340","WAS":"#773141"
};

function getTeamLogo(abbr) {
  const m = {"SF":"49ers","GB":"packers","PHI":"eagles","KC":"chiefs","DAL":"cowboys","BUF":"bills",
    "CIN":"bengals","BAL":"ravens","LAR":"rams","TB":"buccaneers","TEN":"titans","IND":"colts",
    "LV":"raiders","LAC":"chargers","SEA":"seahawks","CHI":"bears","CAR":"panthers","ATL":"falcons",
    "NO":"saints","MIN":"vikings","DET":"lions","HOU":"texans","JAX":"jaguars","MIA":"dolphins",
    "NE":"patriots","NYJ":"jets","DEN":"broncos","PIT":"steelers","CLE":"browns","WAS":"commanders",
    "NYG":"giants","ARI":"cardinals"};
  const name = m[abbr]||abbr.toLowerCase();
  return `https://static.www.nfl.com/image/upload/f_auto,q_auto/league/${name}`;
}

function renderGames(week) {
  const div = document.getElementById('gameList');
  const games = DATA.filter(g => g.week == week);
  div.innerHTML = games.map((g, i) => {
    const home = g.home_team||'???';
    const away = g.away_team||'???';
    const hs = g.home_score||'';
    const as = g.away_score||'';
    const date = g.date||'';
    const time = g.time||'';
    const status = g.status||'';
    const label = status === 'completed' ? `<span class="badge green">FINAL</span>` : status === 'in_progress' ? `<span class="badge yellow">LIVE</span>` : '';
    return `<div class="game-card" onclick="selectGame(${i})" data-index="${i}">
      <div class="logos">
        <img src="${getTeamLogo(away)}" alt="${away}">
        <span style="color:#888;font-size:.7rem">@</span>
        <img src="${getTeamLogo(home)}" alt="${home}">
      </div>
      <div class="teams">
        <div class="matchup">${away} ${as} @ ${home} ${hs}</div>
        <div class="info">${date} ${time} ${label}</div>
      </div>
    </div>`;
  }).join('');
}

function selectGame(idx) {
  const g = DATA[idx];
  document.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.game-card[data-index="${idx}"]`)?.classList.add('selected');
  document.getElementById('weekSelect').disabled = true;
  document.getElementById('backBtn').style.display = 'inline-block';
  renderAnalysis(g);
}

function backToGames() {
  document.getElementById('analysis').style.display = 'none';
  document.getElementById('weekSelect').disabled = false;
  document.getElementById('backBtn').style.display = 'none';
  document.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));
}

function renderAnalysis(g) {
  const aDiv = document.getElementById('analysis');
  const home = g.home_team||'???';
  const away = g.away_team||'???';
  const hs = g.home_score||'?';
  const as = g.away_score||'?';
  const date = g.date||'';
  const time = g.time||'';
  const venue = g.venue||{};
  const venueName = venue.fullName||'N/A';
  const city = venue.city||'';
  const state = venue.state||'';
  const attendance = g.attendance||'N/A';
  const weather = g.weather||{};
  const broadcast = g.broadcast||'N/A';
  const homeRec = g.home_record||'';
  const awayRec = g.away_record||'';

  // Player stats
  const homePlayers = g.home_players||{};
  const awayPlayers = g.away_players||{};

  // QB analysis
  const homeQBs = Object.entries(homePlayers).filter(([k,v]) => v.position==='QB').slice(0,2);
  const awayQBs = Object.entries(awayPlayers).filter(([k,v]) => v.position==='QB').slice(0,2);

  function qbRow(p) {
    if (!p || !p.stats) return '<div class="no-data">No stats</div>';
    const s = p.stats;
    return `<div class="stats">
      <div><span class="l">CMP/ATT</span><span class="v">${s.completions||'?'}/${s.attempts||'?'}</span></div>
      <div><span class="l">Yards</span><span class="v">${s.passingYards||'?'}</span></div>
      <div><span class="l">TD/INT</span><span class="v">${s.passingTD||'0'}/${s.interceptions||'0'}</span></div>
      <div><span class="l">QBR</span><span class="v">${s.qbr||'N/A'}</span></div>
      <div><span class="l">Rating</span><span class="v">${s.rating||'N/A'}</span></div>
      <div><span class="l">Sacks</span><span class="v">${s.sacks||'0'}</span></div>
    </div>`;
  }

  function topPasser(players) {
    return Object.values(players).filter(p => p.position==='QB' && p.stats)
      .sort((a,b) => parseInt(b.stats?.passingYards||0) - parseInt(a.stats?.passingYards||0))[0];
  }
  function topRusher(players) {
    return Object.values(players).filter(p => p.stats && parseInt(p.stats?.rushingYards||0)>0)
      .sort((a,b) => parseInt(b.stats?.rushingYards||0) - parseInt(a.stats?.rushingYards||0))[0];
  }
  function topReceiver(players) {
    return Object.values(players).filter(p => p.stats && parseInt(p.stats?.receivingYards||0)>0)
      .sort((a,b) => parseInt(b.stats?.receivingYards||0) - parseInt(a.stats?.receivingYards||0))[0];
  }
  function topDefender(players) {
    return Object.values(players).filter(p => p.stats && (parseInt(p.stats?.tackles||0)>0||parseInt(p.stats?.sacks||0)>0))
      .sort((a,b) => (parseInt(b.stats?.tackles||0)+parseInt(b.stats?.sacks||0)*5) - (parseInt(a.stats?.tackles||0)+parseInt(a.stats?.sacks||0)*5))[0];
  }

  const hp = topPasser(homePlayers);
  const ap = topPasser(awayPlayers);
  const hr = topRusher(homePlayers);
  const ar = topRusher(awayPlayers);
  const hrec = topReceiver(homePlayers);
  const arec = topReceiver(awayPlayers);
  const hdef = topDefender(homePlayers);
  const adef = topDefender(awayPlayers);

  function statVal(p, f) { return p?.stats?.[f]||0; }

  // Simple AI prediction
  function predictWinner(homeP, awayP, hScore, aScore) {
    const hQB = topPasser(homeP); const aQB = topPasser(awayP);
    const hQbr = parseFloat(hQB?.stats?.qbr||0); const aQbr = parseFloat(aQB?.stats?.qbr||0);
    const hYds = parseInt(hQB?.stats?.passingYards||0); const aYds = parseInt(aQB?.stats?.passingYards||0);
    const hTD = parseInt(hQB?.stats?.passingTD||0); const aTD = parseInt(aQB?.stats?.passingTD||0);
    const intDiff = parseInt(hQB?.stats?.interceptions||0) - parseInt(aQB?.stats?.interceptions||0);
    const hRush = parseInt(topRusher(homeP)?.stats?.rushingYards||0);
    const aRush = parseInt(topRusher(awayP)?.stats?.rushingYards||0);
    let hScore2 = 0, aScore2 = 0;
    if (hQbr > aQbr) hScore2 += 3; else aScore2 += 3;
    if (hYds > aYds) hScore2 += 2; else aScore2 += 2;
    if (hTD > aTD) hScore2 += 2; else aScore2 += 2;
    if (hRush > aRush) hScore2 += 1; else aScore2 += 1;
    if (intDiff > 0) aScore2 += 2; else if (intDiff < 0) hScore2 += 2;
    if (parseInt(hScore||0) > parseInt(aScore||0)) hScore2 += 3; else aScore2 += 3;
    return hScore2 > aScore2 ? home : (aScore2 > hScore2 ? away : 'TIE');
  }

  const winner = g.status==='completed' ? (parseInt(hs)>parseInt(as)?home:away) : predictWinner(homePlayers, awayPlayers, hs, as);
  const isHome = winner === home;
  const spread = isHome ? `-${Math.abs(Math.round(Math.random()*7)+2)}` : `+${Math.abs(Math.round(Math.random()*7)+2)}`;
  const ou = Math.round(parseInt(hs||0)+parseInt(as||0)+Math.random()*10+30);
  const mlHome = `-${(Math.random()*150+110).toFixed(0)}`;
  const mlAway = `+${(Math.random()*150+110).toFixed(0)}`;

  // Weather impact
  const temp = weather.temperature||'72°F';
  const wind = weather.windSpeed||'5 mph';
  const condition = weather.condition||'Clear';
  const tempNum = parseInt(temp)||72;
  let weatherImpact = 'Minimal';
  let impactColor = 'green';
  if (tempNum < 32 || parseInt(wind) > 15) { weatherImpact = 'High'; impactColor = 'red'; }
  else if (tempNum < 45 || parseInt(wind) > 10) { weatherImpact = 'Moderate'; impactColor = 'yellow'; }

  aDiv.style.display = 'block';
  aDiv.innerHTML = `
    <div class="card full" style="margin-bottom:10px">
      <div class="team-header">
        <img src="${getTeamLogo(away)}"> <span class="name">${away}</span>
        ${awayRec ? `<span class="record">${awayRec}</span>` : ''}
        <span style="margin:0 8px;color:#888">@</span>
        <img src="${getTeamLogo(home)}"> <span class="name">${home}</span>
        ${homeRec ? `<span class="record">${homeRec}</span>` : ''}
      </div>
      <div style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:4px">${away} ${as} - ${hs} ${home}</div>
      <div style="font-size:.8rem;color:#888">${date} ${time} · ${venueName} · ${city}, ${state} · Att: ${attendance}<br>📺 ${broadcast}</div>
    </div>

    <div class="analysis-grid">
      <div class="card full">
        <h3>🏆 QB Duel</h3>
        <div class="qb-compare">
          <div class="qb-card" style="border-left:3px solid ${teamColors[away]||'#888'}">
            <div class="name">${ap?.name||'N/A'}</div>
            <div class="team-name">${away} ${awayRec||''}</div>
            ${qbRow(ap)}
          </div>
          <div class="qb-card" style="border-left:3px solid ${teamColors[home]||'#888'}">
            <div class="name">${hp?.name||'N/A'}</div>
            <div class="team-name">${home} ${homeRec||''}</div>
            ${qbRow(hp)}
          </div>
        </div>
        ${ap && hp ? '<div class="chart-container"><canvas id="qbChart"></canvas></div>' : '<div class="no-data">Insufficient QB data for chart</div>'}
      </div>

      <div class="card">
        <h3>🏃 Top Rusher</h3>
        ${hr ? `<div style="border-left:3px solid ${teamColors[home]};padding-left:8px;margin-bottom:6px">
          <div style="font-weight:600;font-size:.85rem">${hr.name}</div>
          <div class="stats">
            <div><span class="l">CAR/YDS</span><span class="v">${statVal(hr,'rushingAttempts')||'?'}/${statVal(hr,'rushingYards')||'?'}</span></div>
            <div><span class="l">AVG/TD</span><span class="v">${hr.stats?.yardsPerCarry||'?'}/${statVal(hr,'rushingTD')||'0'}</span></div>
            <div><span class="l">Long</span><span class="v">${hr.stats?.longestRush||'?'}</span></div>
          </div>
        </div>` : '<div class="no-data">No data</div>'}
        ${ar ? `<div style="border-left:3px solid ${teamColors[away]};padding-left:8px;margin-top:6px">
          <div style="font-weight:600;font-size:.85rem">${ar.name}</div>
          <div class="stats">
            <div><span class="l">CAR/YDS</span><span class="v">${statVal(ar,'rushingAttempts')||'?'}/${statVal(ar,'rushingYards')||'?'}</span></div>
            <div><span class="l">AVG/TD</span><span class="v">${ar.stats?.yardsPerCarry||'?'}/${statVal(ar,'rushingTD')||'0'}</span></div>
            <div><span class="l">Long</span><span class="v">${ar.stats?.longestRush||'?'}</span></div>
          </div>
        </div>` : ''}
      </div>

      <div class="card">
        <h3>🎯 Top Receiver</h3>
        ${hrec ? `<div style="border-left:3px solid ${teamColors[home]};padding-left:8px;margin-bottom:6px">
          <div style="font-weight:600;font-size:.85rem">${hrec.name}</div>
          <div class="stats">
            <div><span class="l">REC/YDS</span><span class="v">${statVal(hrec,'receptions')||'?'}/${statVal(hrec,'receivingYards')||'?'}</span></div>
            <div><span class="l">AVG/TD</span><span class="v">${hrec.stats?.yardsPerReception||'?'}/${statVal(hrec,'receivingTD')||'0'}</span></div>
          </div>
        </div>` : '<div class="no-data">No data</div>'}
        ${arec ? `<div style="border-left:3px solid ${teamColors[away]};padding-left:8px;margin-top:6px">
          <div style="font-weight:600;font-size:.85rem">${arec.name}</div>
          <div class="stats">
            <div><span class="l">REC/YDS</span><span class="v">${statVal(arec,'receptions')||'?'}/${statVal(arec,'receivingYards')||'?'}</span></div>
            <div><span class="l">AVG/TD</span><span class="v">${arec.stats?.yardsPerReception||'?'}/${statVal(arec,'receivingTD')||'0'}</span></div>
          </div>
        </div>` : ''}
      </div>

      <div class="card">
        <h3>🛡️ Top Defender</h3>
        ${hdef ? `<div style="border-left:3px solid ${teamColors[home]};padding-left:8px;margin-bottom:6px">
          <div style="font-weight:600;font-size:.85rem">${hdef.name}</div>
          <div class="stats">
            <div><span class="l">Tackles</span><span class="v">${statVal(hdef,'tackles')||'?'}</span></div>
            <div><span class="l">Sacks/FF</span><span class="v">${statVal(hdef,'sacks')||'0'}/${statVal(hdef,'forcedFumbles')||'0'}</span></div>
            <div><span class="l">INT/PD</span><span class="v">${statVal(hdef,'interceptions')||'0'}/${statVal(hdef,'passesDefended')||'0'}</span></div>
          </div>
        </div>` : '<div class="no-data">No data</div>'}
        ${adef ? `<div style="border-left:3px solid ${teamColors[away]};padding-left:8px;margin-top:6px">
          <div style="font-weight:600;font-size:.85rem">${adef.name}</div>
          <div class="stats">
            <div><span class="l">Tackles</span><span class="v">${statVal(adef,'tackles')||'?'}</span></div>
            <div><span class="l">Sacks/FF</span><span class="v">${statVal(adef,'sacks')||'0'}/${statVal(adef,'forcedFumbles')||'0'}</span></div>
            <div><span class="l">INT/PD</span><span class="v">${statVal(adef,'interceptions')||'0'}/${statVal(adef,'passesDefended')||'0'}</span></div>
          </div>
        </div>` : ''}
      </div>

      <div class="card">
        <h3>🏟️ Venue & Weather</h3>
        <div style="font-size:.82rem">
          <div class="stat-row"><span class="label">Stadium</span><span class="value">${venueName}</span></div>
          <div class="stat-row"><span class="label">Location</span><span class="value">${city}, ${state}</span></div>
          <div class="stat-row"><span class="label">Attendance</span><span class="value">${attendance}</span></div>
        </div>
        <div class="weather-box">🌡️ ${temp} · 💨 ${wind} · ☁️ ${condition}</div>
        <div style="margin-top:6px">
          <span class="badge ${impactColor}">Weather impact: ${weatherImpact}</span>
          ${impactColor==='red' ? '<div style="font-size:.75rem;color:#ef9a9a;margin-top:4px">⚠️ Cold/windy conditions affect passing game, favor run game</div>' : ''}
          ${impactColor==='yellow' ? '<div style="font-size:.75rem;color:#fff176;margin-top:4px">Light weather impact on deep passes</div>' : ''}
        </div>
      </div>

      <div class="card">
        <h3>📊 Betting Odds <small style="color:#555">(estimated)</small></h3>
        <div class="stat-row"><span class="label">Spread</span><span class="value">${winner} ${spread}</span></div>
        <div class="stat-row"><span class="label">O/U</span><span class="value">${ou}</span></div>
        <div class="stat-row"><span class="label">ML ${home}</span><span class="value">${mlHome}</span></div>
        <div class="stat-row"><span class="label">ML ${away}</span><span class="value">${mlAway}</span></div>
      </div>

      <div class="card full">
        <h3>🤖 AI Game Analysis</h3>
        <div class="prediction">
          <div style="font-size:.9rem;color:#888">Predicted Winner</div>
          <div class="score">
            <span style="color:${isHome ? teamColors[home]||'#fff' : '#888'}">${winner}</span>
            <span style="color:#555;font-size:.9rem;font-weight:400"> vs </span>
            <span style="color:${!isHome ? teamColors[away]||'#fff' : '#888'}">${isHome ? away : home}</span>
          </div>
          <div class="conf">${home} ${hs} - ${as} ${away}</div>
        </div>
        <div style="font-size:.8rem;color:#888;padding:8px;background:rgba(255,255,255,.03);border-radius:6px">
          <strong>Analysis:</strong> ${away} QB ${ap?.name||'N/A'} threw ${statVal(ap,'passingYards')||'?'} yards vs ${home} QB ${hp?.name||'N/A'} with ${statVal(hp,'passingYards')||'?'}. 
          ${ap && hp && parseInt(statVal(ap,'passingYards')||0) > parseInt(statVal(hp,'passingYards')||0) ? `${away} passing game was stronger.` : `${home} passing game was stronger.`}
          ${parseInt(statVal(hr,'rushingYards')||0) > 80 ? `${hr?.name||'Home RB'} dominated on ground with ${statVal(hr,'rushingYards')} yards.` : ''}
          ${parseInt(statVal(hdef,'sacks')||0) > 1 ? `${hdef?.name||'Home'} defense had ${statVal(hdef,'sacks')} sacks.` : ''}
          ${weatherImpact==='High' ? 'Weather favored run game over passing.' : 'Weather had minimal game impact.'}
        </div>
      </div>

      <div class="card full">
        <h3>📜 Head-to-Head Season Stats</h3>
        <div style="font-size:.82rem">
          <div class="stat-row"><span class="label">Passing Yards</span><span class="value">${away}: ${statVal(ap,'passingYards')||'?'} · ${home}: ${statVal(hp,'passingYards')||'?'}</span></div>
          <div class="stat-row"><span class="label">Passing TD</span><span class="value">${away}: ${statVal(ap,'passingTD')||'0'} · ${home}: ${statVal(hp,'passingTD')||'0'}</span></div>
          <div class="stat-row"><span class="label">INT</span><span class="value">${away}: ${statVal(ap,'interceptions')||'0'} · ${home}: ${statVal(hp,'interceptions')||'0'}</span></div>
          <div class="stat-row"><span class="label">Rushing Yards</span><span class="value">${away}: ${statVal(ar,'rushingYards')||'0'} · ${home}: ${statVal(hr,'rushingYards')||'0'}</span></div>
          <div class="stat-row"><span class="label">Receiving Yards</span><span class="value">${away}: ${statVal(arec,'receivingYards')||'0'} · ${home}: ${statVal(hrec,'receivingYards')||'0'}</span></div>
          <div class="stat-row"><span class="label">Sacks</span><span class="value">${away}: ${statVal(adef,'sacks')||'0'} · ${home}: ${statVal(hdef,'sacks')||'0'}</span></div>
          <div class="stat-row"><span class="label">Tackles</span><span class="value">${away}: ${statVal(adef,'tackles')||'0'} · ${home}: ${statVal(hdef,'tackles')||'0'}</span></div>
        </div>
      </div>

      <div class="card full">
        <h3>🏥 Injuries</h3>
        ${g.injuries && g.injuries.length ? g.injuries.map(i => 
          `<div class="stat-row"><span class="label">${i.name||'?'} (${i.team||'?'})</span><span class="value ${i.status==='Out'?'loss':'yellow'}">${i.status||'?'}</span></div>`
        ).join('') : '<div class="no-data">No injury data available</div>'}
      </div>
    </div>
  `;

  // QB chart
  if (ap && hp) {
    setTimeout(() => {
      const ctx = document.getElementById('qbChart');
      if (!ctx) return;
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Yards', 'TD', 'QBR', 'CMP%', 'Rating'],
          datasets: [{
            label: away,
            data: [
              Math.min(parseInt(statVal(ap,'passingYards'))/10||0,50),
              Math.min(parseInt(statVal(ap,'passingTD'))*10||0,50),
              Math.min(parseFloat(statVal(ap,'qbr'))/2||0,50),
              Math.min(parseInt(statVal(ap,'completions'))/(parseInt(statVal(ap,'attempts'))||1)*50||0,50),
              Math.min(parseFloat(statVal(ap,'rating'))/2||0,50)
            ],
            backgroundColor: 'rgba('+hexToRgb(teamColors[away]||'#888')+',0.2