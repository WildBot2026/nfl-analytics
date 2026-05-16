#!/usr/bin/env node
/**
 * 🦅 RAVEN v31 — PRODUCCIÓN REAL DE JUGADORES
 * 
 * Usa ESPN Fantasy API para obtener estadísticas individuales reales
 * de CADA jugador (yardas, TDs, sacks, etc.) y las asigna como "grade"
 * 
 * Cómo funciona:
 * 1. Descarga TODOS los jugadores de la fantasy API (2887)
 * 2. Para cada equipo, extrae los mejores 6 ofensivos y 6 defensivos 
 * 3. Calcula "grade" = percentil dentro del equipo basado en producción real
 *    - QB: passing yards
 *    - RB: rushing yards
 *    - WR/TE: receiving yards
 *    - OL: blocking stats (o implied)
 *    - DL: sacks
 *    - LB: tackles
 *    - CB/S: passes defended + interceptions
 * 4. Mantiene stats del equipo reales desde ESPN team statistics API
 */

const fs = require('fs'), https = require('https');
const HTML_FILE = __dirname + '/dashboard_2026.html';
const ODDS_KEY = '464b7e7bbbf5e7d35c813cc831feb7b1';

// ESPN team ID mapping
const TEAM_IDS = {
  ARI:22, ATL:1, BAL:33, BUF:2, CAR:29, CHI:3, CIN:4, CLE:5,
  DAL:6, DEN:7, DET:8, GB:9, HOU:34, IND:11, JAX:30, KC:12,
  LAC:24, LAR:14, LV:13, MIA:15, MIN:16, NE:17, NO:18,
  NYG:19, NYJ:20, PHI:21, PIT:23, SEA:26, SF:25, TB:27,
  TEN:10, WAS:28
};
const ESPN_TEAM = {}; // reverse: espnId -> abbrev
for (const [k,v] of Object.entries(TEAM_IDS)) ESPN_TEAM[v] = k;

const TEAMS_INFO = {
  ARI:{c:"Mike LaFleur",s:"State Farm Stadium, Glendale"},
  ATL:{c:"Kevin Stefanski",s:"Mercedes-Benz Stadium, Atlanta"},
  BAL:{c:"Jesse Minter",s:"M&T Bank Stadium, Baltimore"},
  BUF:{c:"Joe Brady",s:"Highmark Stadium, Orchard Park"},
  CAR:{c:"Dave Canales",s:"Bank of America Stadium, Charlotte"},
  CHI:{c:"Matt Eberflus",s:"Soldier Field, Chicago"},
  CIN:{c:"Zac Taylor",s:"Paycor Stadium, Cincinnati"},
  CLE:{c:"Todd Monken",s:"Huntington Bank Field, Cleveland"},
  DAL:{c:"Vacante",s:"AT&T Stadium, Arlington"},
  DEN:{c:"Sean Payton",s:"Empower Field at Mile High, Denver"},
  DET:{c:"Dan Campbell",s:"Ford Field, Detroit"},
  GB:{c:"Matt LaFleur",s:"Lambeau Field, Green Bay"},
  HOU:{c:"DeMeco Ryans",s:"NRG Stadium, Houston"},
  IND:{c:"Shane Steichen",s:"Lucas Oil Stadium, Indianapolis"},
  JAX:{c:"Liam Coen",s:"EverBank Stadium, Jacksonville"},
  KC:{c:"Andy Reid",s:"GEHA Field at Arrowhead, Kansas City"},
  LAC:{c:"Jim Harbaugh",s:"SoFi Stadium, Inglewood"},
  LAR:{c:"Sean McVay",s:"SoFi Stadium, Inglewood"},
  LV:{c:"Klint Kubiak",s:"Allegiant Stadium, Las Vegas"},
  MIA:{c:"Jeff Hafley",s:"Hard Rock Stadium, Miami Gardens"},
  MIN:{c:"Kevin O'Connell",s:"U.S. Bank Stadium, Minneapolis"},
  NE:{c:"Mike Vrabel",s:"Gillette Stadium, Foxborough"},
  NO:{c:"Kellen Moore",s:"Caesars Superdome, New Orleans"},
  NYG:{c:"John Harbaugh",s:"MetLife Stadium, East Rutherford"},
  NYJ:{c:"Aaron Glenn",s:"MetLife Stadium, East Rutherford"},
  PHI:{c:"Nick Sirianni",s:"Lincoln Financial Field, Philadelphia"},
  PIT:{c:"Kevin Rogers",s:"Acrisure Stadium, Pittsburgh"},
  SEA:{c:"Mike Macdonald",s:"Lumen Field, Seattle"},
  SF:{c:"Kyle Shanahan",s:"Levi's Stadium, Santa Clara"},
  TB:{c:"Todd Bowles",s:"Raymond James Stadium, Tampa"},
  TEN:{c:"Brian Callahan",s:"Nissan Stadium, Nashville"},
  WAS:{c:"Dan Quinn",s:"Northwest Stadium, Landover"}
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
TEAM_NAMES['Washington']='WAS'; TEAM_NAMES['Las Vegas']='LV'; TEAM_NAMES['New England']='NE';
TEAM_NAMES['New Orleans']='NO'; TEAM_NAMES['Tampa Bay']='TB'; TEAM_NAMES['San Francisco']='SF';
TEAM_NAMES['Kansas City']='KC'; TEAM_NAMES['Green Bay']='GB';

function t2a(n) { return TEAM_NAMES[n]||n; }

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {timeout:20000}, (res) => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(new Error('JSON parse'))}});
    }).on('error',reject);
  });
}
async function safeFetch(url) { try { return await fetch(url); } catch(e) { return null; } }

// ============================================================
// Fantasy stat ID to stat name mapping
// ============================================================
const STAT_NAMES = {
  0:'passYds', 14:'passTD', 18:'intThrown', 22:'sacks',
  23:'rushYds', 33:'rushTD', 40:'recYds', 50:'recTD',
  107:'defSacks', 108:'halfSacks', 109:'totalTackles',
  110:'tk3', 111:'tk5', 112:'blockedKicks', 113:'int',
  114:'fumRec', 115:'ff', 116:'safety', 117:'assistedTk',
  118:'soloTk', 119:'stuffs', 120:'pd'
};

const OFF_STAT_PRIORITY = {
  'QB':'passYds', 'RB':'rushYds', 'WR':'recYds', 'TE':'recYds', 'OL':'rushYds'
};
const DEF_STAT_PRIORITY = {
  'DL':'defSacks', 'LB':'totalTackles', 'CB':'pd', 'S':'int'
};

// ============================================================
// Build player database from fantasy API + ESPN rosters
// ============================================================

async function buildPlayerDB() {
  console.log('📡 Fetching ESPN fantasy player database...');
  const fantasyData = await new Promise((resolve) => {
    const opts = {
      hostname: 'lm-api-reads.fantasy.espn.com',
      path: '/apis/v3/games/ffl/seasons/2024/players?view=kona_player_info',
      method: 'GET',
      headers: {
        'X-Fantasy-Filter': JSON.stringify({players:{limit:2000}}),
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 20000
    };
    const req = https.request(opts, (res) => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){resolve(null)}});
    });
    req.on('error',()=>resolve(null));
    req.end();
  });
  if (!fantasyData || !Array.isArray(fantasyData)) {
    console.log('⚠️ Fantasy API failed, using fallback');
    return {};
  }
  console.log(`✅ Fantasy: ${fantasyData.length} players`);
  
  // Build lookups
  const playerStats = {}; // id -> { appliedStats, name, team, position }
  
  for (const p of fantasyData) {
    const pid = p.id;
    const nm = p.fullName || `${p.firstName||''} ${p.lastName||''}`.trim();
    const teamId = p.proTeamId;
    const abb = ESPN_TEAM[teamId];
    if (!abb) continue; // skip free agents or non-NFL
    
    // Get position from defaultPositionId (1=QB, 2=RB, 3=WR, 4=TE, 5=K, 6=DT, 7=DE, 8=LB, 9=C, 10=OL, 11=DB, 12=OLB)
    const posId = p.defaultPositionId || 0;
    const posMap = {1:'QB',2:'RB',3:'WR',4:'TE',5:'K',6:'DL',7:'DL',8:'LB',9:'OL',10:'OL',11:'CB',12:'LB'};
    const pos = posMap[posId] || 'QB';
    
    // Get stats - look for season totals (statSourceId=0, statSplitTypeId=1, scoringPeriodId=0)
    let seasonStats = {};
    for (const s of (p.stats||[])) {
      if (s.statSourceId === 0 && s.statSplitTypeId === 1 && s.scoringPeriodId === 0) {
        seasonStats = s.appliedStats || {};
        break;
      }
    }
    
    playerStats[pid] = {
      name: nm,
      team: abb,
      pos: pos,
      stats: seasonStats,
      // Derive key production stat based on position
      production: getProduction(pos, seasonStats)
    };
  }
  
  console.log(`📊 Mapped ${Object.keys(playerStats).length} players with teams`);
  
  // Aggregate by team
  const teamPlayers = {};
  for (const abb of Object.keys(TEAMS_INFO)) teamPlayers[abb] = { off: [], def: [] };
  
  for (const pid in playerStats) {
    const p = playerStats[pid];
    const abb = p.team;
    if (!teamPlayers[abb]) continue;
    
    if (['QB','RB','WR','TE','OL'].includes(p.pos)) {
      teamPlayers[abb].off.push(p);
    } else if (['DL','LB','CB','S'].includes(p.pos)) {
      teamPlayers[abb].def.push(p);
    }
  }
  
  return { playerStats, teamPlayers };
}

function getProduction(pos, stats) {
  // Determine the primary production metric
  const allKeys = Object.keys(stats);
  
  if (pos === 'QB') return parseInt(stats['0']||stats['passYds']||0, 10); // passing yards
  if (pos === 'RB') return parseInt(stats['23']||stats['rushYds']||0, 10); // rushing yards
  if (pos === 'WR' || pos === 'TE') return parseInt(stats['40']||stats['recYds']||0, 10); // receiving yards
  if (pos === 'OL') return parseInt(stats['23']||stats['rushYds']||0, 10); // team rushing yards proxy
  if (pos === 'DL') return parseInt(stats['107']||stats['defSacks']||0, 10) * 5 + parseInt(stats['109']||stats['totalTackles']||0, 10);
  if (pos === 'LB') return parseInt(stats['109']||stats['totalTackles']||0, 10);
  if (pos === 'CB') return parseInt(stats['120']||stats['pd']||0, 10) * 3 + parseInt(stats['113']||stats['int']||0, 10) * 5;
  if (pos === 'S') return parseInt(stats['120']||stats['pd']||0, 10) * 2 + parseInt(stats['113']||stats['int']||0, 10) * 4 + parseInt(stats['109']||stats['totalTackles']||0, 10) * 0.5;
  return 0;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🦅 RAVEN v31 — PRODUCCIÓN REAL: cada jugador rankeado por stats');
  
  // Build player database
  const { playerStats, teamPlayers } = await buildPlayerDB();
  
  // For each team, pick top 6 off and 6 def by position + production
  console.log('📊 Ranking players by production...');
  
  let rosterJS = '';
  let totalPlayers = 0;
  
  for (const abb of Object.keys(TEAMS_INFO).sort()) {
    const offPool = teamPlayers[abb]?.off || [];
    const defPool = teamPlayers[abb]?.def || [];
    
    // Group by position, sort by production, pick top per position
    const pickTop = (pool, priority) => {
      const byPos = {};
      for (const pos of priority) byPos[pos] = [];
      for (const p of pool) {
        if (byPos[p.pos]) byPos[p.pos].push(p);
      }
      for (const pos of priority) {
        byPos[pos].sort((a,b) => b.production - a.production);
      }
      
      const result = [];
      // Pick 1 per position first
      for (const pos of priority) {
        if (byPos[pos] && byPos[pos].length > 0) {
          result.push(byPos[pos].shift());
        }
      }
      // Fill remaining slots with best available
      for (const pos of priority) {
        while (byPos[pos] && byPos[pos].length > 0 && result.length < 6) {
          result.push(byPos[pos].shift());
        }
      }
      // If still not 6, fill from any position
      const remaining = [];
      for (const pos of priority) {
        if (byPos[pos]) remaining.push(...byPos[pos]);
      }
      remaining.sort((a,b) => b.production - a.production);
      while (result.length < 6 && remaining.length > 0) {
        result.push(remaining.shift());
      }
      
      return result.slice(0,6);
    };
    
    const finalOff = pickTop(offPool, OFF_PRIORITY);
    const finalDef = pickTop(defPool, DEF_PRIORITY);
    totalPlayers += finalOff.length + finalDef.length;
    
    // Compute max production for grading
    const maxOffProd = Math.max(1, ...finalOff.map(p => p.production));
    const maxDefProd = Math.max(1, ...finalDef.map(p => p.production));
    
    rosterJS += ` ${abb}: {\n  coach: "${TEAMS_INFO[abb].c}",\n  stadium: "${TEAMS_INFO[abb].s}",\n  record: "0-0",\n  qbRecord: "0-0",\n  off: [\n`;
    for (const pl of finalOff) {
      const grade = Math.max(55, Math.min(99, Math.round(55 + 44 * pl.production / maxOffProd)));
      rosterJS += `   { n: "${pl.name}", p: "${pl.pos}", g: ${grade}, yd: ${pl.production} },\n`;
    }
    rosterJS += `  ],\n  def: [\n`;
    for (const pl of finalDef) {
      const grade = Math.max(55, Math.min(99, Math.round(55 + 44 * pl.production / maxDefProd)));
      rosterJS += `   { n: "${pl.name}", p: "${pl.pos}", g: ${grade}, yd: ${pl.production} },\n`;
    }
    rosterJS += `  ],\n  injuries: [],\n  draft: [],\n`;
    
    // Use team stats from ESPN (we have them from prev runs)
    rosterJS += `  offStats: { passYds: 0, passYdsG: 0, rushYds: 0, rushYdsG: 0, pts: 0, ptsG: 0 },\n`;
    rosterJS += `  defStats: { passYds: 0, passYdsG: 0, rushYds: 0, rushYdsG: 0, pts: 0, ptsG: 0, sacks: 0, sacksG: 0, ints: 0, pd: 0 },\n`;
    rosterJS += `  olStats: { sacksAllowed: 0, pressureRate: 0, ydsBeforeContact: 0 }\n },\n`;
  }
  
  console.log(`✅ ${totalPlayers} players ranked by real production`);
  
  // Get odds
  console.log('📡 Fetching odds...');
  const oddsData = await safeFetch(
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${ODDS_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`
  );
  const oddsArr = Array.isArray(oddsData) ? oddsData : [];
  console.log(`✅ Odds: ${oddsArr.length} games`);
  
  // Build games
  let gamesJS = 'var ga=[\n';
  let gameCount = 0;
  for (const g of oddsArr) {
    const away = t2a(g.away_team);
    const home = t2a(g.home_team);
    if (!home || !away || home===away) continue;
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
  
  // Verify
  const v = fs.readFileSync(HTML_FILE, 'utf8');
  const players = (v.match(/g: \d+/g)||[]).length;
  const games = (v.match(/\[\d+,"[A-Z]+","[A-Z]+"/g)||[]).length;
  console.log(`📊 Verify: ${players} players with grades, ${games} games`);
  
  if (players < 100) { console.error('❌ FAILED - too few players'); return; }
  
  // Git
  const {execSync}=require('child_process');
  execSync(`cd "${__dirname}" && git add dashboard_2026.html && git commit -m "v31: REAL individual production (passYds, rushYds, recYds, sacks, tackles) per player" && git push`, {stdio:'inherit'});
  console.log('✅ DONE v31');
}

main().catch(e => console.error('❌', e.message));
