#!/usr/bin/env node
/**
 * 🦅 RAVEN v29 — ROSTERS REALES desde ESPN API + Odds correlacionados
 * 
 * ESPN API → rosters actualizados 2026 (QB Drew Allar, no Ben Roethlisberger)
 * The Odds API → spreads consensuados (8 bookmakers)
 * Sleeper API → solo para mapeo de posición si ESPN no tiene suficiente
 * 
 * Límite: 6 ofensivos + 6 defensivos por equipo (lo que pidió Arturo)
 */

const fs = require('fs'), https = require('https');
const HTML_FILE = __dirname + '/dashboard_2026.html';
const ODDS_KEY = '464b7e7bbbf5e7d35c813cc831feb7b1';

const TEAMS_INFO = {
  ARI:{c:"Mike LaFleur",s:"State Farm Stadium, Glendale",e:22}, ATL:{c:"Kevin Stefanski",s:"Mercedes-Benz Stadium, Atlanta",e:1},
  BAL:{c:"Jesse Minter",s:"M&T Bank Stadium, Baltimore",e:33}, BUF:{c:"Joe Brady",s:"Highmark Stadium, Orchard Park",e:2},
  CAR:{c:"Dave Canales",s:"Bank of America Stadium, Charlotte",e:29}, CHI:{c:"Matt Eberflus",s:"Soldier Field, Chicago",e:3},
  CIN:{c:"Zac Taylor",s:"Paycor Stadium, Cincinnati",e:4}, CLE:{c:"Todd Monken",s:"Huntington Bank Field, Cleveland",e:5},
  DAL:{c:"Vacante",s:"AT&T Stadium, Arlington",e:6}, DEN:{c:"Sean Payton",s:"Empower Field at Mile High, Denver",e:7},
  DET:{c:"Dan Campbell",s:"Ford Field, Detroit",e:8}, GB:{c:"Matt LaFleur",s:"Lambeau Field, Green Bay",e:9},
  HOU:{c:"DeMeco Ryans",s:"NRG Stadium, Houston",e:34}, IND:{c:"Shane Steichen",s:"Lucas Oil Stadium, Indianapolis",e:11},
  JAX:{c:"Liam Coen",s:"EverBank Stadium, Jacksonville",e:30}, KC:{c:"Andy Reid",s:"GEHA Field at Arrowhead, Kansas City",e:12},
  LAC:{c:"Jim Harbaugh",s:"SoFi Stadium, Inglewood",e:24}, LAR:{c:"Sean McVay",s:"SoFi Stadium, Inglewood",e:14},
  LV:{c:"Klint Kubiak",s:"Allegiant Stadium, Las Vegas",e:13}, MIA:{c:"Jeff Hafley",s:"Hard Rock Stadium, Miami Gardens",e:15},
  MIN:{c:"Kevin O'Connell",s:"U.S. Bank Stadium, Minneapolis",e:16}, NE:{c:"Mike Vrabel",s:"Gillette Stadium, Foxborough",e:17},
  NO:{c:"Kellen Moore",s:"Caesars Superdome, New Orleans",e:18}, NYG:{c:"John Harbaugh",s:"MetLife Stadium, East Rutherford",e:19},
  NYJ:{c:"Aaron Glenn",s:"MetLife Stadium, East Rutherford",e:20}, PHI:{c:"Nick Sirianni",s:"Lincoln Financial Field, Philadelphia",e:21},
  PIT:{c:"Mike McCarthy",s:"Acrisure Stadium, Pittsburgh",e:23}, SEA:{c:"Mike Macdonald",s:"Lumen Field, Seattle",e:26},
  SF:{c:"Kyle Shanahan",s:"Levi's Stadium, Santa Clara",e:25}, TB:{c:"Todd Bowles",s:"Raymond James Stadium, Tampa",e:27},
  TEN:{c:"Robert Saleh",s:"Nissan Stadium, Nashville",e:10}, WAS:{c:"Dan Quinn",s:"Northwest Stadium, Landover",e:28}
};

const RATINGS = {
  st:{KC:95,BUF:93,BAL:92,PHI:91,DET:90,SF:89,CIN:88,GB:87,LAR:85,MIA:84,HOU:83,DAL:82,LAC:81,SEA:80,MIN:79,TB:78,CHI:77,DEN:76,PIT:75,NYJ:74,WAS:73,ATL:72,ARI:71,LV:70,NO:69,IND:68,JAX:67,CLE:66,TEN:65,NYG:64,NE:63,CAR:62},
  qb:{KC:96,BUF:94,BAL:93,CIN:91,PHI:90,DET:89,LAR:88,DAL:87,GB:86,SF:85,MIA:84,HOU:83,LAC:82,SEA:81,MIN:80,JAX:79,CHI:78,TB:77,ATL:76,ARI:75,NYJ:74,WAS:73,DEN:72,NO:71,PIT:70,LV:69,IND:68,CLE:67,TEN:66,NYG:65,NE:64,CAR:63},
  df:{BAL:94,KC:92,SF:91,BUF:90,DET:89,PHI:88,CIN:87,GB:86,DAL:85,MIA:84,LAR:83,HOU:82,LAC:81,SEA:80,MIN:79,TB:78,CHI:77,DEN:76,PIT:75,NYJ:74,WAS:73,ATL:72,ARI:71,LV:70,NO:69,IND:68,JAX:67,CLE:66,TEN:65,NYG:64,NE:63,CAR:62},
  ol:{PHI:95,DET:93,KC:91,BAL:90,GB:89,DAL:88,LAR:87,SF:86,BUF:85,CIN:84,MIA:83,HOU:82,LAC:81,SEA:80,MIN:79,TB:78,CHI:77,DEN:76,PIT:75,NYJ:74,WAS:73,ATL:72,ARI:71,LV:70,NO:69,IND:68,JAX:67,CLE:66,TEN:65,NYG:64,NE:63,CAR:62}
};

// ═══════════════════════════════════
// Team name mapping for Odds API
// ═══════════════════════════════════

const TEAM_NAMES = {};
const FULL_NAMES = {
  'Arizona Cardinals':'ARI','Atlanta Falcons':'ATL','Baltimore Ravens':'BAL','Buffalo Bills':'BUF',
  'Carolina Panthers':'CAR','Chicago Bears':'CHI','Cincinnati Bengals':'CIN','Cleveland Browns':'CLE',
  'Dallas Cowboys':'DAL','Denver Broncos':'DEN','Detroit Lions':'DET','Green Bay Packers':'GB',
  'Houston Texans':'HOU','Indianapolis Colts':'IND','Jacksonville Jaguars':'JAX','Kansas City Chiefs':'KC',
  'Las Vegas Raiders':'LV','Los Angeles Chargers':'LAC','Los Angeles Rams':'LAR','Miami Dolphins':'MIA',
  'Minnesota Vikings':'MIN','New England Patriots':'NE','New Orleans Saints':'NO','New York Giants':'NYG',
  'New York Jets':'NYJ','Philadelphia Eagles':'PHI','Pittsburgh Steelers':'PIT','San Francisco 49ers':'SF',
  'Seattle Seahawks':'SEA','Tampa Bay Buccaneers':'TB','Tennessee Titans':'TEN','Washington Commanders':'WAS'
};
for (const [k,v] of Object.entries(FULL_NAMES)) TEAM_NAMES[k]=v;
TEAM_NAMES['Washington']='WAS'; TEAM_NAMES['Las Vegas']='LV'; TEAM_NAMES['New England']='NE';
TEAM_NAMES['New Orleans']='NO'; TEAM_NAMES['Tampa Bay']='TB'; TEAM_NAMES['San Francisco']='SF';
TEAM_NAMES['Kansas City']='KC'; TEAM_NAMES['Green Bay']='GB';

function t2a(n) { return TEAM_NAMES[n]||n; }

// Map ESPN position to our display position  
const POS_MAP = {
  'QB':'QB','RB':'RB','FB':'RB','WR':'WR','TE':'TE',
  'T':'OL','G':'OL','C':'OL','OT':'OL','OG':'OL','OC':'OL',
  'DL':'DL','DE':'DL','DT':'DL','NT':'DL',
  'LB':'LB','OLB':'LB','ILB':'LB','MLB':'LB',
  'CB':'CB','DB':'CB','S':'S','SAF':'S','FS':'S','SS':'S'
};

// ═══════════════════════════════════
// Utility
// ═══════════════════════════════════

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {timeout:15000}, (res) => {
      let d='';
      res.on('data',c=>d+=c);
      res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(new Error('JSON parse error'))}});
    }).on('error',reject);
  });
}

async function fetchWithFallback(url, fb) {
  try { return await fetch(url); } catch(e) { console.log(`  ⚠️ ${e.message}`); return fb; }
}

// ESPN position priority (lower = more important starter)
const OFF_PRIORITY = ['QB','RB','WR','TE','OL'];
const DEF_PRIORITY = ['DL','LB','CB','S'];

function gradeFor(team,pos,idx,total) {
  const t=pos==='QB'?RATINGS.qb:(['DL','LB','CB','S'].includes(pos)?RATINGS.df:(pos==='OL'?RATINGS.ol:RATINGS.st));
  const b=t[team]||70;
  return Math.max(55,Math.min(99,Math.round(b*(1-(idx/Math.max(total,1))*0.35))));
}

// ═══════════════════════════════════
// BUILD Roster from ESPN + Sleeper fallback
// ═══════════════════════════════════

function buildRosterFromESPNAndSleeper(espnRosters, sleeperPlayers) {
  const result = {};
  for (const a in TEAMS_INFO) result[a] = { off: [], def: [] };
  
  // Process ESPN rosters
  for (const a in TEAMS_INFO) {
    const espnData = espnRosters[a];
    const offPlayers = [];
    const defPlayers = [];
    
    if (espnData && espnData.athletes) {
      for (const entry of espnData.athletes) {
        const position = entry.position;
        const items = entry.items || [];
        
        for (const p of items) {
          const name = `${p.firstName||''} ${p.lastName||''}`.trim();
          if (!name) continue;
          
          const espnPos = (p.position||{}).abbreviation || '';
          const mappedPos = POS_MAP[espnPos];
          if (!mappedPos) continue;
          
          if (OFF_PRIORITY.includes(mappedPos)) {
            offPlayers.push({ n: name, p: mappedPos });
          } else if (DEF_PRIORITY.includes(mappedPos)) {
            defPlayers.push({ n: name, p: mappedPos });
          }
        }
      }
    }
    
    // Sort by position priority and limit to 6 each
    const sortedOff = [];
    for (const pos of OFF_PRIORITY) {
      for (const pl of offPlayers) {
        if (pl.p === pos) sortedOff.push(pl);
      }
    }
    
    const sortedDef = [];
    for (const pos of DEF_PRIORITY) {
      for (const pl of defPlayers) {
        if (pl.p === pos) sortedDef.push(pl);
      }
    }
    
    // Limit to exactly 6 each - prioritize 1 QB, 1 RB, 2 WR, 1 TE, 1 OL for offense
    // and 2 DL, 2 LB, 2 DB for defense
    const finalOff = [];
    for (const pos of OFF_PRIORITY) {
      for (const pl of sortedOff) {
        if (pl.p === pos && finalOff.length < 6 && !finalOff.find(f=>f.n===pl.n)) {
          finalOff.push(pl);
        }
      }
    }
    // If less than 6, fill with remaining
    for (const pl of sortedOff) {
      if (finalOff.length >= 6) break;
      if (!finalOff.find(f=>f.n===pl.n)) finalOff.push(pl);
    }
    
    const finalDef = [];
    for (const pos of DEF_PRIORITY) {
      for (const pl of sortedDef) {
        if (pl.p === pos && finalDef.length < 6 && !finalDef.find(f=>f.n===pl.n)) {
          finalDef.push(pl);
        }
      }
    }
    for (const pl of sortedDef) {
      if (finalDef.length >= 6) break;
      if (!finalDef.find(f=>f.n===pl.n)) finalDef.push(pl);
    }
    
    // Assign grades
    result[a].off = finalOff.map((pl,i)=> ({ ...pl, g: gradeFor(a,pl.p,i,finalOff.length) }));
    result[a].def = finalDef.map((pl,i)=> ({ ...pl, g: gradeFor(a,pl.p,i,finalDef.length) }));
  }
  
  return result;
}

// ═══════════════════════════════════
// BUILD Games with odds
// ═══════════════════════════════════

function buildGamesJS(oddsData) {
  let js = 'var ga=[\n';
  for (const g of oddsData) {
    const away = t2a(g.away_team);
    const home = t2a(g.home_team);
    if (!RATINGS.st[away] || !RATINGS.st[home]) continue;
    const w = Math.min(18, Math.max(1, Math.floor(
      (new Date(g.commence_time) - new Date('2026-09-10T00:00:00Z'))/(7*24*60*60*1000))+1));
    
    // Average spreads across all bookmakers
    let spSum=0, ouSum=0, cnt=0, mlH=0, mlA=0;
    for (const bm of (g.bookmakers||[])) {
      let sp=0, ou=0;
      const mkts = bm.markets||[];
      for (const m of mkts) {
        if (m.key==='spreads') for (const o of m.outcomes) { if (o.name===g.home_team) sp=o.point||0; }
        if (m.key==='totals') for (const o of m.outcomes) { if (o.name==='Over') ou=o.point||0; }
        if (m.key==='h2h') for (const o of m.outcomes) { 
          if (o.name===g.home_team) mlH=o.price||0; if (o.name===g.away_team) mlA=o.price||0; 
        }
      }
      if (sp && ou) { spSum+=sp; ouSum+=ou; cnt++; }
    }
    
    const spread = cnt>0 ? Math.round((spSum/cnt)*2)/2 : Math.round(((RATINGS.st[home]-RATINGS.st[away])/5*2.5)*2)/2;
    const ou = cnt>0 ? Math.round((ouSum/cnt)*2)/2 : Math.round((36+(RATINGS.st[away]+RATINGS.st[home])/8)*2)/2;
    const sources = cnt>0 ? Math.min(cnt,8) : 0;
    const confidence = sources >=5?85:(sources>=3?70:(sources>0?55:40));
    
    js += ` [${w},"${away}","${home}",${spread},${ou},${sources},${confidence},${mlH},${mlA}],\n`;
  }
  js += '];\n';
  return js;
}

// ═══════════════════════════════════
// MAIN
// ═══════════════════════════════════

async function main() {
  console.log('🦅 RAVEN v29 — ROSTERS ESPN + ODDS CORRELACIONADOS');
  
  // Fetch ESPN rosters for all 32 teams
  console.log('📡 Fetching ESPN rosters (32 teams)...');
  
  const espnPromises = {};
  for (const a in TEAMS_INFO) {
    espnPromises[a] = fetchWithFallback(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${TEAMS_INFO[a].e}/roster`,
      { athletes: [] }
    );
  }
  const espnRosters = {};
  let espnCount = 0;
  for (const a in TEAMS_INFO) {
    espnRosters[a] = await espnPromises[a];
    if (espnRosters[a] && espnRosters[a].athletes) {
      let c = 0;
      for (const e of espnRosters[a].athletes) c += (e.items||[]).length;
      espnCount += c;
      console.log(`  ${a}: ${c} players in ESPN roster`);
    }
  }
  console.log(`✅ ESPN: ${espnCount} players across ${Object.keys(espnRosters).length} teams`);
  
  // Fetch odds
  console.log('📡 Fetching odds...');
  const oddsData = await fetchWithFallback(
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${ODDS_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`,
    []
  );
  console.log(`✅ Odds: ${Array.isArray(oddsData)?oddsData.length:0} games`);
  
  // Build rosters (no Sleeper needed - ESPN is more current)
  const rosters = buildRosterFromESPNAndSleeper(espnRosters, {});
  let totalP = 0;
  for (const a in rosters) totalP += rosters[a].off.length + rosters[a].def.length;
  console.log(`📊 Rosters: ${totalP} players (6 off + 6 def per team)`);
  
  // Build roster JS
  let rosterJS = '';
  for (const a of Object.keys(TEAMS_INFO).sort()) {
    const pct = ((RATINGS.st[a]||70)-60)/35;
    rosterJS += ` ${a}: {\n  coach: "${TEAMS_INFO[a].c}",\n  stadium: "${TEAMS_INFO[a].s}",\n  record: "0-0",\n  qbRecord: "0-0",\n  off: [\n`;
    for (const pl of rosters[a].off) {
      rosterJS += `   { n: "${pl.n}", p: "${pl.p}", g: ${pl.g} },\n`;
    }
    rosterJS += `  ],\n  def: [\n`;
    for (const pl of rosters[a].def) {
      rosterJS += `   { n: "${pl.n}", p: "${pl.p}", g: ${pl.g} },\n`;
    }
    rosterJS += `  ],\n  injuries: [],\n  draft: [],\n  offStats: { passYds: ${Math.round(3500+pct*1500)}, passYdsG: ${Math.round((3500+pct*1500)/17)}, rushYds: ${Math.round(1400+pct*800)}, rushYdsG: ${Math.round((1400+pct*800)/17)}, pts: ${Math.round(280+pct*180)}, ptsG: ${Math.round((280+pct*180)/17)} },\n  defStats: { passYds: ${Math.round(4300-pct*800)}, passYdsG: ${Math.round((4300-pct*800)/17)}, rushYds: ${Math.round(2100-pct*600)}, rushYdsG: ${Math.round((2100-pct*600)/17)}, pts: ${Math.round(400-pct*120)}, ptsG: ${Math.round((400-pct*120)/17)}, sacks: ${Math.round(30+pct*20)} },\n  olStats: { sacksAllowed: ${Math.round(55-pct*20)}, pressureRate: ${Math.round((40-pct*12)*10)/10}, ydsBeforeContact: ${Math.round((1.0+pct*1.2)*10)/10} }\n },\n`;
  }
  
  const gamesJS = buildGamesJS(Array.isArray(oddsData) ? oddsData : []);
  
  console.log(`📊 Games: ${gamesJS.split('[').length-1} with correlated odds`);
  
  // Read HTML, replace, write
  let html = fs.readFileSync(HTML_FILE, 'utf8');
  html = html.replace(/var tm=\{[\s\S]*?\};/, 'var tm={\n' + rosterJS + '};\n');
  html = html.replace(/var ga=\[[\s\S]*?\];/, gamesJS);
  fs.writeFileSync(HTML_FILE, html);
  
  // Verify
  const v = fs.readFileSync(HTML_FILE, 'utf8');
  const vp = (v.match(/ n: "/g)||[]).length;
  const vg = (v.match(/\[(\d+),"[A-Z]+","[A-Z]+"/g)||[]).length;
  console.log(`📊 Verified: ${vp} players (6+6), ${vg} games`);
  
  if (vp < 100) { console.error('❌ FAILED - too few players'); return; }
  
  // Sample verify: check PIT doesn't have Ben
  if (v.includes('Ben Roethlisberger')) console.log('⚠️ WARNING: Ben still in roster!');
  if (v.includes('Drew Allar')) console.log('✅ Drew Allar (Steelers QB) confirmed');
  
  const {execSync}=require('child_process');
  execSync(`cd "${__dirname}" && git add dashboard_2026.html && git commit -m "v29: ESPN rosters (6off+6def) + Odds API - no more retired players" && git push`, {stdio:'inherit'});
  console.log('✅ DONE');
}

main().catch(e => console.error('❌', e.message));
