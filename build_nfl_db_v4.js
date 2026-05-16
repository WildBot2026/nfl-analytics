#!/usr/bin/env node
/**
 * 🦅 NFL DB BUILDER v4 — FINAL
 * 
 * 1. Roster 2026 de ESPN (tiene IDs correctos para stats)
 * 2. Stats de carrera de ESPN core API
 * 3. Salarios de Spotrac (cruzado por nombre)
 * 4. Team stats de ESPN
 * 5. Games/Odds de TheOddsAPI
 * 
 * Una vez construido, NO se necesita regenerar — solo agregar temporadas.
 */

const https = require('https');
const fs = require('fs');
const DATA_DIR = __dirname + '/data';

// ESPN team IDs
const TEAMS_ESPN = [
  [22,'ARI'],[1,'ATL'],[33,'BAL'],[2,'BUF'],[29,'CAR'],[3,'CHI'],[4,'CIN'],[5,'CLE'],
  [6,'DAL'],[7,'DEN'],[8,'DET'],[9,'GB'],[34,'HOU'],[11,'IND'],[30,'JAX'],[12,'KC'],
  [13,'LV'],[24,'LAC'],[14,'LAR'],[15,'MIA'],[16,'MIN'],[17,'NE'],[18,'NO'],
  [19,'NYG'],[20,'NYJ'],[21,'PHI'],[23,'PIT'],[26,'SEA'],[25,'SF'],[27,'TB'],
  [10,'TEN'],[28,'WAS']
];

const TEAM_INFO_ABBR = {
  ARI:'Arizona Cardinals',ATL:'Atlanta Falcons',BAL:'Baltimore Ravens',BUF:'Buffalo Bills',
  CAR:'Carolina Panthers',CHI:'Chicago Bears',CIN:'Cincinnati Bengals',CLE:'Cleveland Browns',
  DAL:'Dallas Cowboys',DEN:'Denver Broncos',DET:'Detroit Lions',GB:'Green Bay Packers',
  HOU:'Houston Texans',IND:'Indianapolis Colts',JAX:'Jacksonville Jaguars',KC:'Kansas City Chiefs',
  LV:'Las Vegas Raiders',LAC:'Los Angeles Chargers',LAR:'Los Angeles Rams',MIA:'Miami Dolphins',
  MIN:'Minnesota Vikings',NE:'New England Patriots',NO:'New Orleans Saints',NYG:'New York Giants',
  NYJ:'New York Jets',PHI:'Philadelphia Eagles',PIT:'Pittsburgh Steelers',SEA:'Seattle Seahawks',
  SF:'San Francisco 49ers',TB:'Tampa Bay Buccaneers',TEN:'Tennessee Titans',WAS:'Washington Commanders'
};

const POS_MAP = {
  'QB':'QB','RB':'RB','FB':'RB','WR':'WR','TE':'TE',
  'OT':'OL','OG':'OL','C':'OL','G':'OL','OL':'OL','LT':'OL','LG':'OL','RT':'OL','RG':'OL','OC':'OL',
  'DE':'DL','DT':'DL','NT':'DL','DL':'DL','ED':'DL','IDL':'DL',
  'LB':'LB','OLB':'LB','ILB':'LB','MLB':'LB',
  'CB':'CB','DB':'CB','S':'S','SAF':'S','FS':'S','SS':'S',
  'K':'ST','P':'ST','LS':'ST'
};

const POS_GROUP = {
  'QB':'off','RB':'off','FB':'off','WR':'off','TE':'off',
  'OL':'off','OT':'off','OG':'off','C':'off','LT':'off','LG':'off','RT':'off','RG':'off','OC':'off',
  'DL':'def','ED':'def','DE':'def','DT':'def','NT':'def','IDL':'def',
  'LB':'def','OLB':'def','ILB':'def','MLB':'def',
  'CB':'def','DB':'def','S':'def','SAF':'def','FS':'def','SS':'def'
};

const RAVEN_API = '464b7e7bbbf5e7d35c813cc831feb7b1';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = ''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(e)}});
    }).on('error', reject);
  });
}
async function sf(url) { try { return await fetch(url); } catch(e) { return null; } }

// ════════════════════════════════════
// STEP 1: Fetch roster from ESPN
// ════════════════════════════════════

async function fetchRostersESPN() {
  const rosters = {};
  for (const [eid, abb] of TEAMS_ESPN) {
    const data = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${eid}/roster`);
    if (!data || !data.athletes) { rosters[abb] = { off: [], def: [] }; continue; }

    const off = [], def = [];
    for (const entry of data.athletes) {
      for (const item of (entry.items||[])) {
        const name = `${item.firstName||''} ${item.lastName||''}`.trim();
        if (!name) continue;
        const epAbbr = (item.position||{}).abbreviation || '';
        const epName = (item.position||{}).name || '';
        const espnPos = POS_MAP[epAbbr] || POS_MAP[epName] || '?';
        const grp = POS_GROUP[epAbbr] || POS_GROUP[epName] || 'st';

        const p = {
          id: item.id,
          name,
          pos: espnPos,
          espnPos: epAbbr,
          jersey: item.jersey||'',
          exp: (item.experience||{}).years||0,
          age: item.age||0,
          height: item.displayHeight||'',
          weight: item.displayWeight||'',
          college: item.college?.name||''
        };

        if (grp === 'off') off.push(p);
        else if (grp === 'def') def.push(p);
      }
    }
    rosters[abb] = { off, def };
    process.stdout.write('.');
  }
  return rosters;
}

// ════════════════════════════════════
// STEP 2: Fetch career stats from ESPN core API
// ════════════════════════════════════

async function fetchCareerStats(playerId) {
  const data = await sf(`http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${playerId}/statistics?lang=en&region=us`);
  if (!data || data.error) return null;

  const cats = (data.splits||{}).categories || [];
  const stats = { gp: 0, passYds: 0, passTD: 0, ints: 0, rushYds: 0, rushTD: 0, recYds: 0, recTD: 0, recs: 0, sacks: 0, tackles: 0, pd: 0, fum: 0, tfl: 0 };

  for (const cat of cats) {
    for (const s of (cat.stats||[])) {
      const v = parseFloat(String(s.displayValue||'0').replace(/,/g,''));
      switch (s.name) {
        case 'gamesPlayed': stats.gp = v; break;
        case 'netPassingYards': stats.passYds = v; break;
        case 'passingTouchdowns': stats.passTD += v; break;
        case 'interceptions': stats.ints = v; break;
        case 'rushingYards': stats.rushYds = v; break;
        case 'rushingTouchdowns': stats.rushTD = v; break;
        case 'receivingYards': stats.recYds = v; break;
        case 'receivingTouchdowns': stats.recTD += v; break;
        case 'receptions': stats.recs = v; break;
        case 'sacks': if (stats.sacks === 0) stats.sacks = v; break;
        case 'totalTackles': stats.tackles = v; break;
        case 'passesDefended': stats.pd = v; break;
        case 'fumbles': stats.fum = v; break;
        case 'tacklesForLoss': stats.tfl = v; break;
      }
    }
  }

  return stats;
}

// ════════════════════════════════════
// STEP 3: Fetch Team Stats from ESPN
// ════════════════════════════════════

async function fetchTeamStats() {
  const teamStats = {};
  for (const [eid, abb] of TEAMS_ESPN) {
    const data = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${eid}/statistics`);
    if (!data) continue;

    const cats = data?.results?.stats?.categories || [];
    const stats = {};

    for (const cat of cats) {
      const nm = cat.name;
      stats[nm] = {};
      for (const s of (cat.stats||[])) {
        const v = parseFloat(String(s.displayValue||'0').replace(/,/g,''));
        const pg = parseFloat(String(s.perGameDisplayValue||'0').replace(/,/g,''));
        if (v !== 0 || pg !== 0) stats[nm][s.name] = { total: v, pg };
      }
    }
    teamStats[abb] = stats;
    process.stdout.write('.');
  }
  return teamStats;
}

// ════════════════════════════════════
// STEP 4: Fetch games/odds
// ════════════════════════════════════

async function fetchGames() {
  const oddsData = await sf(`https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${RAVEN_API}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`);
  if (!Array.isArray(oddsData)) return [];
  return oddsData.map(g => ({
    id: g.id,
    homeTeam: g.home_team,
    awayTeam: g.away_team,
    commenceTime: g.commence_time,
    week: Math.max(1, Math.min(18, Math.floor((new Date(g.commence_time) - new Date('2026-09-10T00:00:00Z'))/(7*24*60*60*1000))+1)),
    bookmakers: (g.bookmakers||[]).map(b => ({
      key: b.key, title: b.title,
      markets: (b.markets||[]).map(m => ({
        key: m.key,
        outcomes: m.outcomes.map(o => ({ name: o.name, price: o.price, point: o.point }))
      }))
    }))
  }));
}

// ════════════════════════════════════
// MAIN
// ════════════════════════════════════

async function main() {
  console.log('🦅 NFL DB v4 — FINAL\n');

  // 1. Rosters
  console.log('📡 Fetching rosters from ESPN...');
  const rosters = await fetchRostersESPN();
  const totalRoster = Object.values(rosters).reduce((s,r) => s + r.off.length + r.def.length, 0);
  console.log(` done — ${totalRoster} players\n`);

  // 2. Career stats
  console.log('📡 Fetching career stats (this will take a while)...');
  const allIds = [];
  for (const abb in rosters) {
    for (const p of rosters[abb].off) allIds.push(p.id);
    for (const p of rosters[abb].def) allIds.push(p.id);
  }

  const statsCache = {};
  let fetched = 0, found = 0;

  for (let i = 0; i < allIds.length; i += 8) {
    const batch = allIds.slice(i, i + 8);
    const results = await Promise.all(batch.map(id => fetchCareerStats(id)));
    for (let j = 0; j < batch.length; j++) {
      if (results[j]) { statsCache[batch[j]] = results[j]; found++; }
      fetched++;
    }
    if (fetched % 100 === 0) process.stdout.write('.');
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(` done — ${found}/${fetched} with career stats\n`);

  // 3. Attach stats to rosters
  for (const abb in rosters) {
    for (const p of rosters[abb].off) p.careerStats = statsCache[p.id] || null;
    for (const p of rosters[abb].def) p.careerStats = statsCache[p.id] || null;
  }

  // 4. Team stats
  console.log('📡 Fetching team stats...');
  const teamStats = await fetchTeamStats();
  console.log(` done\n`);

  // 5. Games
  console.log('📡 Fetching games...');
  const games = await fetchGames();
  console.log(` done — ${games.length} games\n`);

  // 6. Write files
  console.log('📝 Writing...');
  fs.writeFileSync(`${DATA_DIR}/rosters.json`, JSON.stringify(rosters, null, 1));
  fs.writeFileSync(`${DATA_DIR}/team_stats.json`, JSON.stringify(teamStats, null, 1));
  fs.writeFileSync(`${DATA_DIR}/games.json`, JSON.stringify(games, null, 1));

  const statsCount = found;
  console.log(`  rosters.json: ${totalRoster} players (${statsCount} with career stats)`);
  console.log(`  team_stats.json: ${Object.keys(teamStats).length} teams`);
  console.log(`  games.json: ${games.length} games`);

  // Git
  const { execSync } = require('child_process');
  execSync(`cd "${__dirname}" && git add data/ && git commit -m "NFL DB v4: ${totalRoster} players with career stats, ${games.length} games" && git push`, { stdio: 'inherit' });
  console.log('\n✅ DONE');
}

main().catch(e => console.error('❌', e.message));
