#!/usr/bin/env node
/**
 * 🦅 NFL 2026 MATCHUP PREDICTIONS BUILDER
 * 
 * Cruza QB stats 2024 vs Defensa del oponente
 * Solo datos de la última temporada (2024)
 */

const fs = require('fs');
const path = require('path');

const QB = require('./data/qb_stats_2024.json');
const TEAM_STATS = require('./data/team_stats.json');
const SCHEDULE = require('./schedule_2026_complete.json');
const DASHBOARD = path.join(__dirname, 'dashboard_2026.html');

const TEAM_SHORT = {
  'Arizona Cardinals':'Cardinals','Atlanta Falcons':'Falcons','Baltimore Ravens':'Ravens',
  'Buffalo Bills':'Bills','Carolina Panthers':'Panthers','Chicago Bears':'Bears',
  'Cincinnati Bengals':'Bengals','Cleveland Browns':'Browns','Dallas Cowboys':'Cowboys',
  'Denver Broncos':'Broncos','Detroit Lions':'Lions','Green Bay Packers':'Packers',
  'Houston Texans':'Texans','Indianapolis Colts':'Colts','Jacksonville Jaguars':'Jaguars',
  'Kansas City Chiefs':'Chiefs','Las Vegas Raiders':'Raiders','Los Angeles Chargers':'Chargers',
  'Los Angeles Rams':'Rams','Miami Dolphins':'Dolphins','Minnesota Vikings':'Vikings',
  'New England Patriots':'Patriots','New Orleans Saints':'Saints','New York Giants':'Giants',
  'New York Jets':'Jets','Philadelphia Eagles':'Eagles','Pittsburgh Steelers':'Steelers',
  'San Francisco 49ers':'49ers','Seattle Seahawks':'Seahawks',
  'Tampa Bay Buccaneers':'Buccaneers','Tennessee Titans':'Titans','Washington Commanders':'Commanders'
};

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

// QB lookup by team
const QB_BY_TEAM = {};
for (const qb of QB) QB_BY_TEAM[qb.team] = qb;

// Build defense profiles from team_stats 2024
const DEFENSE_PROFILES = {};
for (const [team, data] of Object.entries(TEAM_STATS)) {
  const def = data.defensive || {};
  const di = data.defensiveInterceptions || {};
  const pass = data.passing || {};
  
  DEFENSE_PROFILES[team] = {
    sacks: (def.sacks && def.sacks.total) || 0,
    tfl: (def.tacklesForLoss && def.tacklesForLoss.total) || 0,
    pd: (def.passesDefended && def.passesDefended.total) || 0,
    ints: (di.interceptions && di.interceptions.total) || 0,
    passingYdsAllowed: (pass.netPassingYards && pass.netPassingYards.total) || 0,
    passingTDAllowed: (pass.passingTouchdowns && pass.passingTouchdowns.total) || 0
  };
}

// ════ Predict a single game ════
function predictGame(awayTeam, homeTeam) {
  const qbA = QB_BY_TEAM[awayTeam];
  const qbH = QB_BY_TEAM[homeTeam];
  const defA = DEFENSE_PROFILES[awayTeam] || { sacks: 0, pd: 0, ints: 0 };
  const defH = DEFENSE_PROFILES[homeTeam] || { sacks: 0, pd: 0, ints: 0 };

  const result = {
    awayTeam, homeTeam,
    awayQB: qbA || null,
    homeQB: qbH || null,
    predictions: {}
  };

  // Predict away QB
  if (qbA) {
    const deepPct = qbA.deep_pct || 0;
    let deepRating;
    if (deepPct > 12) deepRating = 'Alto (deeper ball)';
    else if (deepPct < 9) deepRating = 'Bajo (short/medium)';
    else deepRating = 'Medio (balanced)';

    const defFactor = 1 - ((defH.sacks - 25) / 100); // normalize around avg sacks
    const baseYds = qbA.yards / 17;
    const projYds = Math.round(baseYds * Math.max(0.5, Math.min(1.5, defFactor)));
    const projTD = Math.max(0, Math.round((qbA.td / 17) * defFactor));
    const projINT = Math.max(0, Math.round((qbA.int / 17) * (defH.ints > 15 ? 1.3 : 0.8)));

    result.predictions[awayTeam] = {
      qb: qbA.name,
      deepPct,
      deepRating,
      pressureDef: defH.sacks,
      projYds, projTD, projINT,
      analysis: `${qbA.name}: ${deepPct}% deep · vs ${defH.sacks} sacks defense`
    };
  }

  // Predict home QB
  if (qbH) {
    const deepPct = qbH.deep_pct || 0;
    let deepRating;
    if (deepPct > 12) deepRating = 'Alto (deeper ball)';
    else if (deepPct < 9) deepRating = 'Bajo (short/medium)';
    else deepRating = 'Medio (balanced)';

    const defFactor = 1 - ((defA.sacks - 25) / 100);
    const baseYds = qbH.yards / 17;
    const projYds = Math.round(baseYds * Math.max(0.5, Math.min(1.5, defFactor)));
    const projTD = Math.max(0, Math.round((qbH.td / 17) * defFactor));
    const projINT = Math.max(0, Math.round((qbH.int / 17) * (defA.ints > 15 ? 1.3 : 0.8)));

    result.predictions[homeTeam] = {
      qb: qbH.name,
      deepPct,
      deepRating,
      pressureDef: defA.sacks,
      projYds, projTD, projINT,
      analysis: `${qbH.name}: ${deepPct}% deep · vs ${defA.sacks} sacks defense`
    };
  }

  return result;
}

// ════ Generate all matchups ════
const allMatchups = {};
for (const [week, games] of Object.entries(SCHEDULE)) {
  allMatchups[week] = [];
  for (const game of games) {
    if (game.away.includes('TBA') || game.home.includes('TBA')) continue;
    allMatchups[week].push(predictGame(game.away, game.home));
  }
}

// Save data
fs.writeFileSync(path.join(__dirname, 'data', 'matchups.json'), JSON.stringify(allMatchups, null, 2));
console.log(`✅ Matchups generated: ${Object.values(allMatchups).flat().length} games`);

// ════ Generate dashboard_matchups.js ════
const matchupJS = `// NFL Matchup Predictions Module - 2024 data only
(function(){
var QB_S = ${JSON.stringify(QB)};
var MU = ${JSON.stringify(allMatchups)};
var TS = ${JSON.stringify(TEAM_SHORT)};
var TA = ${JSON.stringify(TEAM_ABBR)};
var DP = ${JSON.stringify(DEFENSE_PROFILES)};

// Nav button
var nb = document.createElement('button');
nb.textContent = '🎯 Matchups';
nb.onclick=function(){showTab('matchups')};
var nav=document.querySelector('.nav');
var btns=nav.querySelectorAll('button');
nav.insertBefore(nb,btns[btns.length-1]);

// Tab
var tab=document.createElement('div');
tab.id='tab-matchups';tab.className='content hidden';
document.getElementById('tab-schedule').parentNode.insertBefore(tab,document.getElementById('tab-schedule').nextSibling);

// Override showTab
var oST=window.showTab;
window.showTab=function(n){
  document.querySelectorAll('.content').forEach(function(e){e.classList.add('hidden')});
  document.querySelectorAll('.nav button').forEach(function(b){b.classList.remove('active')});
  var t=document.getElementById('tab-'+n);if(t)t.classList.remove('hidden');
  document.querySelectorAll('.nav button').forEach(function(b){
    if(b.textContent.includes('Matchups')&&n==='matchups')b.classList.add('active');
    if(b.textContent.includes('Schedule')&&n==='schedule')b.classList.add('active');
    if(b.textContent.includes('Teams')&&n==='teams')b.classList.add('active');
    if(b.textContent.includes('Stats')&&n==='stats')b.classList.add('active');
    if(b.textContent.includes('Rosters')&&n==='rosters')b.classList.add('active');
  });
  if(n==='schedule'&&typeof renderSchedule==='function')renderSchedule();
  if(n==='matchups')renderMatchups();
};

function renderMatchups(){
  var t=document.getElementById('tab-matchups');
  var wk=Object.keys(MU).sort(function(a,b){return parseInt(a)-parseInt(b)});
  var f='<div class="filters"><select id="muW" onchange="renderMatchups()">';
  wk.forEach(function(w){f+='<option value="'+w+'">Week '+w+'</option>'});
  f+='</select><select id="muT" onchange="renderMatchups()"><option value="all">All teams</option>';
  Object.keys(TS).sort().forEach(function(t2){f+='<option value="'+t2+'">'+t2+'</option>'});
  f+='</select></div><div class="matchup-grid">';

  var w=document.getElementById('muW')?document.getElementById('muW').value:'1';
  var tf=document.getElementById('muT')?document.getElementById('muT').value:'all';
  var ms=MU[w]||[];

  for(var i=0;i<ms.length;i++){
    var m=ms[i];
    if(tf!=='all'&&m.awayTeam!==tf&&m.homeTeam!==tf)continue;
    var aP=m.predictions[m.awayTeam],hP=m.predictions[m.homeTeam];
    
    f+='<div class="matchup-card"><div class="matchup-header"><span class="matchup-teams">'+TS[m.awayTeam]+' @ '+TS[m.homeTeam]+'</span></div>';
    
    if(aP){
      var qbA=QB_S.find(function(q){return q.team===m.awayTeam});
      f+='<div class="matchup-team"><div class="matchup-team-name">'+TS[m.awayTeam]+' ('+TA[m.awayTeam]+')</div>';
      f+='<div class="matchup-qb">🎯 '+aP.qb+'</div>';
      f+='<div class="matchup-meta"><span>Pases profundos: '+aP.deepPct+'% · '+aP.deepRating+'</span></div>';
      f+='<div class="matchup-meta"><span>vs presión defensiva: '+aP.pressureDef+' sacks</span></div>';
      f+='<div class="matchup-proj"><span>📊 Estimado: '+aP.projYds+'yds / '+aP.projTD+'TD / '+aP.projINT+'INT</span></div>';
      if(qbA){
        f+='<div class="matchup-bars"><div class="bar-row"><span class="bl">Yds '+qbA.yards+'</span><div class="bb"><div class="bf" style="width:'+Math.round(qbA.yards/5000*100)+'%"></div></div></div>';
        f+='<div class="bar-row"><span class="bl">20+ '+qbA.twenty_plus+'</span><div class="bb"><div class="bf" style="width:'+Math.round(qbA.twenty_plus/70*100)+'%"></div></div></div>';
        f+='<div class="bar-row"><span class="bl">Rate '+qbA.rate+'</span><div class="bb"><div class="bf rate" style="width:'+Math.round(qbA.rate)+'%"></div></div></div></div>';
      }
      f+='</div>';
    }
    
    if(hP){
      var qbH=QB_S.find(function(q){return q.team===m.homeTeam});
      f+='<div class="matchup-team"><div class="matchup-team-name">'+TS[m.homeTeam]+' ('+TA[m.homeTeam]+')</div>';
      f+='<div class="matchup-qb">🎯 '+hP.qb+'</div>';
      f+='<div class="matchup-meta"><span>Pases profundos: '+hP.deepPct+'% · '+hP.deepRating+'</span></div>';
      f+='<div class="matchup-meta"><span>vs presión defensiva: '+hP.pressureDef+' sacks</span></div>';
      f+='<div class="matchup-proj"><span>📊 Estimado: '+hP.projYds+'yds / '+hP.projTD+'TD / '+hP.projINT+'INT</span></div>';
      if(qbH){
        f+='<div class="matchup-bars"><div class="bar-row"><span class="bl">Yds '+qbH.yards+'</span><div class="bb"><div class="bf" style="width:'+Math.round(qbH.yards/5000*100)+'%"></div></div></div>';
        f+='<div class="bar-row"><span class="bl">20+ '+qbH.twenty_plus+'</span><div class="bb"><div class="bf" style="width:'+Math.round(qbH.twenty_plus/70*100)+'%"></div></div></div>';
        f+='<div class="bar-row"><span class="bl">Rate '+qbH.rate+'</span><div class="bb"><div class="bf rate" style="width:'+Math.round(qbH.rate)+'%"></div></div></div></div>';
      }
      f+='</div>';
    }
    
    f+='</div>';
  }
  
  f+='</div><style>.matchup-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:14px}.matchup-card{background:#111d35;border:1px solid #1e3050;border-radius:10px;padding:14px}.matchup-header{display:flex;padding-bottom:8px;border-bottom:1px solid #1e3050;margin-bottom:8px}.matchup-teams{color:#4fc3f7;font-weight:600;font-size:14px}.matchup-team{padding:8px;background:#0f1a30;border-radius:6px;margin-bottom:8px}.matchup-team-name{color:#fff;font-size:13px;font-weight:600}.matchup-qb{color:#4fc3f7;font-size:12px;margin:4px 0}.matchup-meta{color:#7a8ba8;font-size:11px;padding:2px 0}.matchup-proj{color:#ffd54f;font-size:11px;margin:4px 0}.matchup-bars{margin-top:4px}.bar-row{display:flex;align-items:center;gap:6px;font-size:10px;margin-bottom:2px}.bl{color:#7a8ba8;min-width:70px}.bb{flex:1;height:5px;background:#1a2744;border-radius:3px;overflow:hidden}.bf{height:100%;background:linear-gradient(90deg,#4fc3f7,#29b6f6);border-radius:3px}.bf.rate{background:linear-gradient(90deg,#66bb6a,#43a047)}</style>';
  
  t.innerHTML=f;
}
})();
`;

fs.writeFileSync(path.join(__dirname, 'dashboard_matchups.js'), matchupJS);
console.log('✅ dashboard_matchups.js generated');

// Now inject into dashboard
let html = fs.readFileSync(DASHBOARD, 'utf8');
const bp = html.lastIndexOf('</body>');
const inject = '\n<script src="dashboard_matchups.js"></script>\n';
if (bp > 0) {
  html = html.slice(0, bp) + inject + html.slice(bp);
} else {
  html += inject;
}
fs.writeFileSync(DASHBOARD, html);
console.log(`✅ Dashboard updated: ${((html.length)/1024).toFixed(1)} KB`);
console.log('🎉 Done!');
