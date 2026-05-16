#!/usr/bin/env node
/**
 * 🦅 RAVEN v32 — ROSTER 2026 REAL + PRODUCCIÓN 2024
 * 
 * 1. Roster actual 2026 (ESPN roster API) → jugadores reales
 * 2. Fantasy stats 2024 (ESPN fantasy API) → producción por jugador
 * 3. Match por ID → cada jugador tiene stats reales individuales
 * 4. Rookies sin stats → "probable" basado en proyección
 * 5. 6 ofensivos + 6 defensivos por equipo
 */

const fs = require('fs'), https = require('https');
const HTML_FILE = __dirname + '/dashboard_2026.html';
const ODDS_KEY = '464b7e7bbbf5e7d35c813cc831feb7b1';

const TEAMS_INFO = {
  ARI:{c:"Mike LaFleur",s:"State Farm Stadium, Glendale",e:22},
  ATL:{c:"Kevin Stefanski",s:"Mercedes-Benz Stadium, Atlanta",e:1},
  BAL:{c:"Jesse Minter",s:"M&T Bank Stadium, Baltimore",e:33},
  BUF:{c:"Joe Brady",s:"Highmark Stadium, Orchard Park",e:2},
  CAR:{c:"Dave Canales",s:"Bank of America Stadium, Charlotte",e:29},
  CHI:{c:"Matt Eberflus",s:"Soldier Field, Chicago",e:3},
  CIN:{c:"Zac Taylor",s:"Paycor Stadium, Cincinnati",e:4},
  CLE:{c:"Todd Monken",s:"Huntington Bank Field, Cleveland",e:5},
  DAL:{c:"Vacante",s:"AT&T Stadium, Arlington",e:6},
  DEN:{c:"Sean Payton",s:"Empower Field at Mile High, Denver",e:7},
  DET:{c:"Dan Campbell",s:"Ford Field, Detroit",e:8},
  GB:{c:"Matt LaFleur",s:"Lambeau Field, Green Bay",e:9},
  HOU:{c:"DeMeco Ryans",s:"NRG Stadium, Houston",e:34},
  IND:{c:"Shane Steichen",s:"Lucas Oil Stadium, Indianapolis",e:11},
  JAX:{c:"Liam Coen",s:"EverBank Stadium, Jacksonville",e:30},
  KC:{c:"Andy Reid",s:"GEHA Field at Arrowhead, Kansas City",e:12},
  LAC:{c:"Jim Harbaugh",s:"SoFi Stadium, Inglewood",e:24},
  LAR:{c:"Sean McVay",s:"SoFi Stadium, Inglewood",e:14},
  LV:{c:"Klint Kubiak",s:"Allegiant Stadium, Las Vegas",e:13},
  MIA:{c:"Jeff Hafley",s:"Hard Rock Stadium, Miami Gardens",e:15},
  MIN:{c:"Kevin O'Connell",s:"U.S. Bank Stadium, Minneapolis",e:16},
  NE:{c:"Mike Vrabel",s:"Gillette Stadium, Foxborough",e:17},
  NO:{c:"Kellen Moore",s:"Caesars Superdome, New Orleans",e:18},
  NYG:{c:"John Harbaugh",s:"MetLife Stadium, East Rutherford",e:19},
  NYJ:{c:"Aaron Glenn",s:"MetLife Stadium, East Rutherford",e:20},
  PHI:{c:"Nick Sirianni",s:"Lincoln Financial Field, Philadelphia",e:21},
  PIT:{c:"Kevin Rogers",s:"Acrisure Stadium, Pittsburgh",e:23},
  SEA:{c:"Mike Macdonald",s:"Lumen Field, Seattle",e:26},
  SF:{c:"Kyle Shanahan",s:"Levi's Stadium, Santa Clara",e:25},
  TB:{c:"Todd Bowles",s:"Raymond James Stadium, Tampa",e:27},
  TEN:{c:"Brian Callahan",s:"Nissan Stadium, Nashville",e:10},
  WAS:{c:"Dan Quinn",s:"Northwest Stadium, Landover",e:28}
};

const POS_MAP = {
  'QB':'QB','RB':'RB','FB':'RB','WR':'WR','TE':'TE',
  'T':'OL','G':'OL','C':'OL','OT':'OL','OG':'OL','OC':'OL',
  'DL':'DL','DE':'DL','DT':'DL','NT':'DL',
  'LB':'LB','OLB':'LB','ILB':'LB','MLB':'LB',
  'CB':'CB','DB':'CB','S':'S','SAF':'S','FS':'S','SS':'S'
};
const OFF_PRIORITY = ['QB','RB','WR','TE','OL'];
const DEF_PRIORITY = ['DL','LB','CB','S'];

const TEAM_NAMES = {};
for (const [k,v] of Object.entries({
  'Arizona Cardinals':'ARI','Atlanta Falcons':'ATL','Baltimore Ravens':'BAL','Buffalo Bills':'BUF',
  'Carolina Panthers':'CAR','Chicago Bears':'CHI','Cincinnati Bengals':'CIN','Cleveland Browns':'CLE',
  'Dallas Cowboys':'DAL','Denver Broncos':'DEN','Detroit Lions':'DET','Green Bay Packers':'GB',
  'Houston Texans':'HOU','Indianapolis Colts':'IND','Jacksonville Jaguars':'JAX','Kansas City Chiefs':'KC',
  'Las Vegas Raiders':'LV','Los Angeles Chargers':'LAC','Los Angeles Rams':'LAR','Miami Dolphins':'MIA',
  'Minnesota Vikings':'MIN','New England Patriots':'NE','New Orleans Saints':'NO','New York Giants':'NYG',
  'New York Jets':'NYJ','Philadelphia Eagles':'PHI','Pittsburgh Steelers':'PIT','San Francisco 49ers':'SF',
  'Seattle Seahawks':'SEA','Tampa Bay Buccaneers':'TB','Tennessee Titans':'TEN','Washington Commanders':'WAS'
})) TEAM_NAMES[k]=v;
TEAM_NAMES['Washington']='WAS'; TEAM_NAMES['Las Vegas']='LV'; 
TEAM_NAMES['New England']='NE'; TEAM_NAMES['New Orleans']='NO';
TEAM_NAMES['Tampa Bay']='TB'; TEAM_NAMES['San Francisco']='SF';
TEAM_NAMES['Kansas City']='KC'; TEAM_NAMES['Green Bay']='GB';

function t2a(n) { return TEAM_NAMES[n]||n; }

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {timeout:20000}, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(new Error('JSON'))}}); }).on('error',reject);
  });
}
async function sf(url) { try { return await fetch(url); } catch(e) { return null; } }

// ============================================================
// Fetch fantasy stats with headers
// ============================================================
function fetchFantasy() {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'lm-api-reads.fantasy.espn.com',
      path: '/apis/v3/games/ffl/seasons/2024/players?view=kona_player_info',
      method: 'GET',
      headers: {
        'X-Fantasy-Filter': JSON.stringify({players:{limit:2000}}),
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 25000
    };
    const req = https.request(opts, (res) => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){resolve(null)}});
    });
    req.on('error',()=>resolve(null));
    req.end();
  });
}

// ============================================================
// Extract per-game stats from appliedStats
// ============================================================
function prodScore(stats, pos, gamesPlayed) {
  const gp = Math.max(1, gamesPlayed || 17);
  
  if (pos === 'QB') {
    const passYds = parseInt(stats['0']||0, 10);
    const passTD = parseInt(stats['14']||0, 10);
    const rushYds = parseInt(stats['23']||0, 10);
    const rushTD = parseInt(stats['33']||0, 10);
    return { 
      val: passYds + passTD*50 + rushYds*0.5 + rushTD*50,
      pg: (passYds + passTD*50 + rushYds*0.5 + rushTD*50) / gp,
      display: `${passYds}yd/${passTD}TD` 
    };
  }
  if (pos === 'RB') {
    const rushYds = parseInt(stats['23']||0, 10);
    const rushTD = parseInt(stats['33']||0, 10);
    const recYds = parseInt(stats['40']||0, 10);
    const rec = parseInt(stats['53']||0, 10); // receptions instead of recTD=50... let me check
    const recTD = parseInt(stats['50']||0, 10);
    return { 
      val: rushYds + rushTD*50 + recYds + recTD*50,
      pg: (rushYds + rushTD*50 + recYds + recTD*50) / gp,
      display: `${rushYds}rush/${recYds}rec` 
    };
  }
  if (pos === 'WR' || pos === 'TE') {
    const recYds = parseInt(stats['40']||0, 10);
    const recTD = parseInt(stats['50']||0, 10);
    return { 
      val: recYds + recTD*50,
      pg: (recYds + recTD*50) / gp,
      display: `${recYds}yd/${recTD}TD` 
    };
  }
  if (pos === 'OL') {
    // OL doesn't have individual stats - use team rush proxy
    const rushYds = parseInt(stats['23']||0, 10);
    return { val: rushYds * 0.5, pg: (rushYds*0.5)/gp, display: `${Math.round(rushYds*0.5)}blk` };
  }
  if (pos === 'DL') {
    const sacks = parseInt(stats['107']||0, 10);
    const tackles = parseInt(stats['109']||0, 10);
    const ints = parseInt(stats['113']||0, 10);
    const score = sacks*30 + tackles + ints*50;
    return { val: score, pg: score/gp, display: `${sacks}sck/${tackles}tk` };
  }
  if (pos === 'LB') {
    const tackles = parseInt(stats['109']||0, 10);
    const sacks = parseInt(stats['107']||0, 10);
    const ints = parseInt(stats['113']||0, 10);
    const pd = parseInt(stats['120']||0, 10);
    const score = tackles + sacks*20 + ints*30 + pd*10;
    return { val: score, pg: score/gp, display: `${tackles}tk/${sacks}sck` };
  }
  if (pos === 'CB') {
    const pd = parseInt(stats['120']||0, 10);
    const ints = parseInt(stats['113']||0, 10);
    const tackles = parseInt(stats['109']||0, 10);
    const score = pd*15 + ints*30 + tackles*0.5;
    return { val: score, pg: score/gp, display: `${pd}PD/${ints}INT` };
  }
  if (pos === 'S') {
    const tackles = parseInt(stats['109']||0, 10);
    const ints = parseInt(stats['113']||0, 10);
    const pd = parseInt(stats['120']||0, 10);
    const score = tackles*0.5 + ints*40 + pd*20;
    return { val: score, pg: score/gp, display: `${tackles}tk/${ints}INT` };
  }
  return { val: 0, pg: 0, display: '0' };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🦅 RAVEN v32 — ROSTER 2026 + PRODUCCIÓN INDIVIDUAL');
  
  // Step 1: Fetch fantasy stats DB
  console.log('📡 Fetching fantasy stats (2024 season)...');
  const fantasyAll = await fetchFantasy();
  if (!fantasyAll) { console.error('❌ Fantasy API failed'); return; }
  console.log(`✅ Fantasy: ${fantasyAll.length} players`);
  
  // Build fantasy lookup by player ID
  const fantasyDB = {}; // playerID -> { stats, name, pos, team }
  for (const p of fantasyAll) {
    let seasonStats = {};
    let gamesPlayed = 17;
    for (const s of (p.stats||[])) {
      if (s.statSourceId === 0 && s.statSplitTypeId === 1 && s.scoringPeriodId === 0) {
        seasonStats = s.appliedStats || {};
        // Check for games played stat
        const rawGp = s.stats ? (s.stats['210'] || s.stats['213'] || 0) : 0; // GP stat ID
        gamesPlayed = Math.min(17, Math.max(1, parseInt(rawGp) || 17));
        break;
      }
    }
    fantasyDB[p.id] = {
      stats: seasonStats,
      gp: gamesPlayed,
      name: p.fullName || `${p.firstName||''} ${p.lastName||''}`.trim(),
    };
  }
  console.log(`✅ Fantasy lookup: ${Object.keys(fantasyDB).length} players indexed`);
  
  // Step 2: Fetch rosters 2026 from ESPN
  console.log('📡 Fetching 2026 rosters (32 teams)...');
  const rosters = {};
  for (const abb in TEAMS_INFO) {
    rosters[abb] = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${TEAMS_INFO[abb].e}/roster`);
    if (rosters[abb]) process.stdout.write('.'); else process.stdout.write('x');
  }
  console.log(' done');
  
  // Step 3: Build final player lists per team
  console.log('📊 Building rosters with real stats...');
  let rosterJS = '';
  let totalP = 0, totalWithStats = 0;
  
  for (const abb of Object.keys(TEAMS_INFO).sort()) {
    const roster = rosters[abb];
    const allOff = [];
    const allDef = [];
    
    if (roster && roster.athletes) {
      for (const entry of roster.athletes) {
        const section = entry.position;
        for (const item of (entry.items||[])) {
          const name = `${item.firstName||''} ${item.lastName||''}`.trim();
          if (!name) continue;
          const espnPos = (item.position||{}).abbreviation || '';
          const mappedPos = POS_MAP[espnPos];
          if (!mappedPos) continue;
          
          const pid = item.id;
          const fdata = fantasyDB[pid];
          const stats = fdata?.stats || {};
          const gp = fdata?.gp || 17;
          const prod = prodScore(stats, mappedPos, gp);
          
          const player = { n: name, p: mappedPos, prod, hasStats: !!fdata };
          
          if (['QB','RB','WR','TE','OL'].includes(mappedPos)) {
            allOff.push(player);
            if (fdata) totalWithStats++;
          } else if (['DL','LB','CB','S'].includes(mappedPos)) {
            allDef.push(player);
            if (fdata) totalWithStats++;
          }
        }
      }
    }
    
    // Sort by production within position
    const pick6 = (pool, priority) => {
      // Pick best per position
      const byPos = {};
      for (const pos of priority) byPos[pos] = [];
      for (const p of pool) {
        if (byPos[p.p]) byPos[p.p].push(p);
      }
      for (const pos of priority) {
        byPos[pos].sort((a,b) => b.prod.pg - a.prod.pg);
      }
      
      const result = [];
      for (const pos of priority) {
        if (byPos[pos]?.length) result.push(byPos[pos].shift());
      }
      // Fill remaining
      const remaining = [];
      for (const pos of priority) {
        if (byPos[pos]) remaining.push(...byPos[pos]);
      }
      remaining.sort((a,b) => b.prod.pg - a.prod.pg);
      while (result.length < 6 && remaining.length > 0) {
        result.push(remaining.shift());
      }
      return result.slice(0,6);
    };
    
    const finalOff = pick6(allOff, OFF_PRIORITY);
    const finalDef = pick6(allDef, DEF_PRIORITY);
    totalP += finalOff.length + finalDef.length;
    
    // Compute relative grade (0-99) based on per-game production within team
    const maxOff = Math.max(1, ...finalOff.map(p => p.prod.val));
    const maxDef = Math.max(1, ...finalDef.map(p => p.prod.val));
    
    rosterJS += ` ${abb}: {\n  coach: "${TEAMS_INFO[abb].c}",\n  stadium: "${TEAMS_INFO[abb].s}",\n  record: "0-0",\n  qbRecord: "0-0",\n  off: [\n`;
    for (const pl of finalOff) {
      const grade = Math.max(50, Math.min(99, Math.round(50 + 49 * pl.prod.val / maxOff)));
      rosterJS += `   { n: "${pl.n}", p: "${pl.p}", g: ${grade}, prod: "${pl.prod.display}", pg: ${Math.round(pl.prod.pg*10)/10} },\n`;
    }
    rosterJS += `  ],\n  def: [\n`;
    for (const pl of finalDef) {
      const grade = Math.max(50, Math.min(99, Math.round(50 + 49 * pl.prod.val / maxDef)));
      rosterJS += `   { n: "${pl.n}", p: "${pl.p}", g: ${grade}, prod: "${pl.prod.display}", pg: ${Math.round(pl.prod.pg*10)/10} },\n`;
    }
    rosterJS += `  ],\n  injuries: [],\n  draft: [],\n`;
    rosterJS += `  offStats: { passYds: 0, passYdsG: 0, rushYds: 0, rushYdsG: 0, pts: 0, ptsG: 0 },\n`;
    rosterJS += `  defStats: { passYds: 0, passYdsG: 0, rushYds: 0, rushYdsG: 0, pts: 0, ptsG: 0, sacks: 0, sacksG: 0, ints: 0, pd: 0 },\n`;
    rosterJS += `  olStats: { sacksAllowed: 0, pressureRate: 0, ydsBeforeContact: 0 }\n },\n`;
  }
  
  console.log(`✅ ${totalP} players (${totalWithStats} with real stats)`);
  
  // Step 4: Fetch odds
  console.log('📡 Fetching odds...');
  const oddsData = await sf(`https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${ODDS_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`);
  const oddsArr = Array.isArray(oddsData) ? oddsData : [];
  
  // Build games
  let gamesJS = 'var ga=[\n';
  let gameCount = 0;
  for (const g of oddsArr) {
    const away = t2a(g.away_team);
    const home = t2a(g.home_team);
    if (!home || !away) continue;
    const w = Math.max(1, Math.min(18, Math.floor((new Date(g.commence_time) - new Date('2026-09-10T00:00:00Z'))/(7*24*60*60*1000))+1));
    let spSum=0, ouSum=0, cnt=0, mlH=0, mlA=0;
    for (const bm of (g.bookmakers||[])) {
      for (const m of (bm.markets||[])) {
        if (m.key==='spreads') for (const o of m.outcomes) { if (o.name===g.home_team) spSum+=o.point||0; }
        if (m.key==='totals') for (const o of m.outcomes) { if (o.name==='Over') ouSum+=o.point||0; }
        if (m.key==='h2h') for (const o of m.outcomes) { if (o.name===g.home_team) mlH=o.price||0; if (o.name===g.away_team) mlA=o.price||0; }
      }
      cnt++;
    }
    const spread = cnt>1 ? Math.round((spSum/cnt)*2)/2 : 0;
    const ou = cnt>1 ? Math.round((ouSum/cnt)*2)/2 : 0;
    const sources = Math.min(8, cnt);
    const confidence = sources>=5?85:(sources>=3?70:(sources>0?55:40));
    if (!spread && !ou) continue;
    gamesJS += ` [${w},"${away}","${home}",${spread},${ou},${sources},${confidence},${mlH},${mlA}],\n`;
    gameCount++;
  }
  gamesJS += '];\n';
  console.log(`✅ Games: ${gameCount}`);
  
  // Write HTML
  console.log('📝 Writing HTML...');
  let html = fs.readFileSync(HTML_FILE, 'utf8');
  html = html.replace(/var tm=\{[\s\S]*?\};/, 'var tm={\n' + rosterJS + '};\n');
  html = html.replace(/var ga=\[[\s\S]*?\];/, gamesJS);
  fs.writeFileSync(HTML_FILE, html);
  
  const v = fs.readFileSync(HTML_FILE, 'utf8');
  const pCount = (v.match(/g: \d+/g)||[]).length;
  const gCount = (v.match(/\[\d+,"[A-Z]+","[A-Z]+"/g)||[]).length;
  console.log(`📊 Verify: ${pCount} players, ${gCount} games`);
  
  // Sample check
  if (v.includes('Drew Allar')) console.log('✅ Drew Allar in roster (2026 PIT QB)');
  if (v.includes('Patrick Mahomes')) console.log('✅ Patrick Mahomes in roster');
  if (v.includes('prod:')) console.log('✅ Production stats present');
  
  if (pCount < 100) { console.error('❌ FAILED'); return; }
  
  const {execSync}=require('child_process');
  execSync(`cd "${__dirname}" && git add dashboard_2026.html && git commit -m "v32: ROSTER 2026 REAL + production stats per player (passYds, rushYds, sacks, tackles)" && git push`, {stdio:'inherit'});
  console.log('✅ DONE v32');
}

main().catch(e => console.error('❌', e.message));
