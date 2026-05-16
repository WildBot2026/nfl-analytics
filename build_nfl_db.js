#!/usr/bin/env node
/**
 * 🦅 NFL DATA BUILDER — Construye la base de datos local
 * 
 * Genera archivos JSON estáticos que el dashboard consulta:
 * /data/teams.json          → Info de equipos (no cambia)
 * /data/rosters.json        → Roster 2026 real + stats individuales
 * /data/player_stats.json   → Stats históricas por jugador (2024)
 * /data/team_stats.json     → Stats por equipo (ofensiva, defensiva)
 * /data/games.json          → Próximos juegos con odds
 * /data/qb_records.json     → QB record vs cada equipo (histórico)
 * 
 * Una vez lleno, solo se actualiza agregando temporadas nuevas.
 */

const fs = require('fs'), https = require('https');
const DATA_DIR = __dirname + '/data';
const ODDS_KEY = '464b7e7bbbf5e7d35c813cc831feb7b1';

// ESPN team IDs
const TEAM_IDS = {
  ARI:22, ATL:1, BAL:33, BUF:2, CAR:29, CHI:3, CIN:4, CLE:5,
  DAL:6, DEN:7, DET:8, GB:9, HOU:34, IND:11, JAX:30, KC:12,
  LAC:24, LAR:14, LV:13, MIA:15, MIN:16, NE:17, NO:18,
  NYG:19, NYJ:20, PHI:21, PIT:23, SEA:26, SF:25, TB:27,
  TEN:10, WAS:28
};

const POS_GROUP = {
  'QB':'off','RB':'off','FB':'off','WR':'off','TE':'off',
  'T':'off','G':'off','C':'off','OT':'off','OG':'off','OC':'off',
  'DL':'def','DE':'def','DT':'def','NT':'def',
  'LB':'def','OLB':'def','ILB':'def','MLB':'def',
  'CB':'def','DB':'def','S':'def','SAF':'def','FS':'def','SS':'def'
};

const POS_MAP = {
  'QB':'QB','RB':'RB','FB':'RB','WR':'WR','TE':'TE',
  'T':'OL','G':'OL','C':'OL','OT':'OL','OG':'OL','OC':'OL',
  'DL':'DL','DE':'DL','DT':'DL','NT':'DL',
  'LB':'LB','OLB':'LB','ILB':'LB','MLB':'LB',
  'CB':'CB','DB':'CB','S':'S','SAF':'S','FS':'S','SS':'S'
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {timeout:20000}, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(e)}}); }).on('error',reject);
  });
}
async function sf(url) { try { return await fetch(url); } catch(e) { return null; } }

// ════════════════════════════════════
// STEP 1: Fetch fantasy stats (player production)
// ════════════════════════════════════

function fetchFantasy(season) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'lm-api-reads.fantasy.espn.com',
      path: `/apis/v3/games/ffl/seasons/${season}/players?view=kona_player_info`,
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

// ════════════════════════════════════
// STEP 2: Extract player stats from fantasy data
// ════════════════════════════════════

function extractPlayerStats(fantasyData) {
  const stats = {}; // playerID -> { seasonStats: { season: { passYds, rushYds, ... } } }
  
  for (const p of (fantasyData||[])) {
    const pid = p.id;
    const name = p.fullName || `${p.firstName||''} ${p.lastName||''}`.trim();
    const teamId = p.proTeamId;
    if (!teamId || teamId === 0) continue;
    
    const posId = p.defaultPositionId || 0;
    const posMap = {1:'QB',2:'RB',3:'WR',4:'TE',5:'K',6:'DL',7:'DL',8:'LB',9:'OL',10:'OL',11:'CB',12:'LB'};
    const pos = posMap[posId] || '?';
    
    // Collect season stats
    const seasons = {};
    for (const s of (p.stats||[])) {
      if (s.statSourceId === 0 && s.statSplitTypeId === 1 && s.scoringPeriodId === 0) {
        const season = String(s.seasonId || '2024');
        const app = s.appliedStats || {};
        seasons[season] = {
          passYds: parseInt(app['0']||0,10),
          passTD: parseInt(app['14']||0,10),
          ints: parseInt(app['18']||0,10),
          rushYds: parseInt(app['23']||0,10),
          rushTD: parseInt(app['33']||0,10),
          recYds: parseInt(app['40']||0,10),
          recTD: parseInt(app['50']||0,10),
          recs: parseInt(app['53']||0,10),
          sacks: parseInt(app['22']||app['107']||0,10),
          tackles: parseInt(app['109']||0,10),
          pd: parseInt(app['120']||0,10),
          fum: parseInt(app['67']||0,10),
          gp: parseInt(s.stats?.['213']||s.stats?.['210']||17,10)
        };
      }
    }
    
    if (Object.keys(seasons).length > 0) {
      stats[pid] = { name, pos, teamId, seasons };
    }
  }
  
  return stats;
}

// ════════════════════════════════════
// STEP 3: Extract team stats from ESPN
// ════════════════════════════════════

async function fetchTeamStats() {
  const teamStats = {};
  for (const abb in TEAM_IDS) {
    const data = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${TEAM_IDS[abb]}/statistics`);
    if (!data) continue;
    
    const cats = data?.results?.stats?.categories || [];
    const stats = { passing:{}, rushing:{}, receiving:{}, defense:{}, scoring:{} };
    
    for (const cat of cats) {
      for (const s of (cat.stats||[])) {
        const nm = s.name;
        const v = parseFloat(String(s.displayValue||'0').replace(/,/g,''));
        const pg = parseFloat(String(s.perGameDisplayValue||'0').replace(/,/g,''));
        const key = cat.name;
        if (stats[key]) stats[key][nm] = { total: v, pg };
      }
    }
    teamStats[abb] = stats;
  }
  return teamStats;
}

// ════════════════════════════════════
// STEP 4: Fetch rosters from ESPN
// ════════════════════════════════════

async function fetchRosters() {
  const rosters = {};
  for (const abb in TEAM_IDS) {
    const data = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${TEAM_IDS[abb]}/roster`);
    if (!data || !data.athletes) continue;
    
    const players = { off: [], def: [], st: [] };
    for (const entry of data.athletes) {
      const section = entry.position;
      for (const item of (entry.items||[])) {
        const name = `${item.firstName||''} ${item.lastName||''}`.trim();
        if (!name) continue;
        const ep = (item.position||{}).abbreviation || '';
        const pos = POS_MAP[ep] || (section==='offense'?'OL':(section==='defense'?'DL':'ST'));
        const grp = POS_GROUP[ep] || (section==='offense'?'off':(section==='defense'?'def':'st'));
        
        if (grp === 'off') players.off.push({
          id: item.id, name, pos, espnPos: ep,
          jersey: item.jersey||'', exp: (item.experience||{}).years||0,
          age: item.age||0, height: item.displayHeight||'', weight: item.displayWeight||''
        });
        else if (grp === 'def') players.def.push({
          id: item.id, name, pos, espnPos: ep,
          jersey: item.jersey||'', exp: (item.experience||{}).years||0,
          age: item.age||0, height: item.displayHeight||'', weight: item.displayWeight||''
        });
      }
    }
    rosters[abb] = players;
  }
  return rosters;
}

// ════════════════════════════════════
// MAIN
// ════════════════════════════════════

async function main() {
  console.log('🦅 Building NFL local database...');
  
  // 1. Teams (already exists)
  console.log('✅ teams.json — static');
  
  // 2. Fantasy stats (player production historical)
  console.log('📡 Fetching fantasy stats (2024)...');
  const fantasy2024 = await fetchFantasy('2024');
  const playerStats2024 = extractPlayerStats(fantasy2024);
  console.log(`✅ ${Object.keys(playerStats2024).length} players with 2024 stats`);
  
  // Try 2025 also
  console.log('📡 Fetching fantasy stats (2025)...');
  const fantasy2025 = await fetchFantasy('2025');
  const playerStats2025 = extractPlayerStats(fantasy2025);
  console.log(`✅ ${Object.keys(playerStats2025).length} players with 2025 stats`);
  
  // Merge
  const allPlayerStats = { ...playerStats2024 };
  for (const pid in playerStats2025) {
    if (allPlayerStats[pid]) {
      Object.assign(allPlayerStats[pid].seasons, playerStats2025[pid].seasons);
    } else {
      allPlayerStats[pid] = playerStats2025[pid];
    }
  }
  
  // 3. Team stats
  console.log('📡 Fetching team stats (2025)...');
  const teamStats = await fetchTeamStats();
  console.log(`✅ ${Object.keys(teamStats).length} teams with stats`);
  
  // 4. Rosters
  console.log('📡 Fetching 2026 rosters...');
  const rosters = await fetchRosters();
  let totalPlayers = 0;
  for (const abb in rosters) totalPlayers += rosters[abb].off.length + rosters[abb].def.length;
  console.log(`✅ ${totalPlayers} players in 2026 rosters`);
  
  // 5. Attach player stats to rosters
  const rosterWithStats = {};
  for (const abb in rosters) {
    const off = rosters[abb].off.map(p => ({
      ...p,
      stats: allPlayerStats[p.id]?.seasons || {},
      hasStats: !!allPlayerStats[p.id]
    }));
    const def = rosters[abb].def.map(p => ({
      ...p,
      stats: allPlayerStats[p.id]?.seasons || {},
      hasStats: !!allPlayerStats[p.id]
    }));
    rosterWithStats[abb] = { off, def };
  }
  
  const statsCount = totalPlayers > 0 ? 
    Object.values(rosterWithStats).reduce((s,t) => s + t.off.filter(p=>p.hasStats).length + t.def.filter(p=>p.hasStats).length, 0) : 0;
  
  // 6. Write files
  fs.writeFileSync(DATA_DIR + '/player_stats.json', JSON.stringify(allPlayerStats, null, 1));
  fs.writeFileSync(DATA_DIR + '/team_stats.json', JSON.stringify(teamStats, null, 1));
  fs.writeFileSync(DATA_DIR + '/rosters.json', JSON.stringify(rosterWithStats, null, 1));
  
  console.log(`📝 Written:`);
  console.log(`  data/player_stats.json — ${Object.keys(allPlayerStats).length} players (${statsCount} with 2024 stats)`);
  console.log(`  data/team_stats.json — ${Object.keys(teamStats).length} teams`);
  console.log(`  data/rosters.json — ${totalPlayers} players in 2026 rosters`);
  
  // 7. Fetch odds/games
  console.log('📡 Fetching games/odds...');
  const oddsData = await sf(`https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${ODDS_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`);
  const games = Array.isArray(oddsData) ? oddsData.map(g => ({
    id: g.id,
    homeTeam: g.home_team,
    awayTeam: g.away_team,
    commenceTime: g.commence_time,
    week: Math.max(1, Math.min(18, Math.floor((new Date(g.commence_time) - new Date('2026-09-10T00:00:00Z'))/(7*24*60*60*1000))+1)),
    bookmakers: (g.bookmakers||[]).map(b => ({
      key: b.key,
      title: b.title,
      markets: (b.markets||[]).map(m => ({
        key: m.key,
        outcomes: m.outcomes.map(o => ({ name: o.name, price: o.price, point: o.point }))
      }))
    }))
  })) : [];
  fs.writeFileSync(DATA_DIR + '/games.json', JSON.stringify(games, null, 1));
  console.log(`  data/games.json — ${games.length} games with odds`);
  
  // 8. Git push
  const {execSync}=require('child_process');
  try {
    execSync(`cd "${__dirname}" && git add data/ && git commit -m "NFL DB: local database with rosters, player stats, team stats, games" && git push`, {stdio:'inherit'});
  } catch(e) {}
  
  console.log('✅ DONE — NFL local database ready');
  console.log('📊 Summary:');
  console.log(`  ${Object.keys(allPlayerStats).length} players with historical stats`);
  console.log(`  ${totalPlayers} players in 2026 rosters`);
  console.log(`  ${statsCount} with actual 2024 production stats`);
  console.log(`  ${games.length} upcoming games with odds`);
  console.log(`  ${Object.keys(teamStats).length} teams with ESPN stats`);
}

main().catch(e => console.error('❌', e.message));
