#!/usr/bin/env node
/**
 * 🦅 NFL DATA BUILDER v2 — Base de datos local con:
 * 
 * data/teams.json        → info de equipos (permanente)
 * data/rosters.json      → roster 2026 con stats de carrera
 * data/team_stats.json   → stats por equipo (ofensiva/defensa/sacks)
 * data/games.json        → próximos juegos con odds
 * 
 * Las stats de jugador son de CARRERA (ESPN core API) porque stats
 * por temporada no están disponibles gratis.
 * Las stats de equipo sí son por temporada (2025).
 */

const fs = require('fs'), https = require('https');
const DATA_DIR = __dirname + '/data';
const ODDS_KEY = '464b7e7bbbf5e7d35c813cc831feb7b1';

const TEAM_IDS = {
  ARI:22, ATL:1, BAL:33, BUF:2, CAR:29, CHI:3, CIN:4, CLE:5,
  DAL:6, DEN:7, DET:8, GB:9, HOU:34, IND:11, JAX:30, KC:12,
  LAC:24, LAR:14, LV:13, MIA:15, MIN:16, NE:17, NO:18,
  NYG:19, NYJ:20, PHI:21, PIT:23, SEA:26, SF:25, TB:27,
  TEN:10, WAS:28
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
    https.get(url, {timeout:20000}, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve(JSON.parse(d))}catch(e){reject(new Error('JSON'))}}); }).on('error',reject);
  });
}
async function sf(url) { try { return await fetch(url); } catch(e) { return null; } }

// ════════════════════════════════════
// Fetch career stats for a player
// ════════════════════════════════════

async function fetchCareerStats(playerId) {
  const data = await sf(`http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${playerId}/statistics?lang=en&region=us`);
  if (!data) return null;
  
  const cats = (data.splits||{}).categories || [];
  const stats = { gp: 0, passYds: 0, passTD: 0, ints: 0, rushYds: 0, rushTD: 0, recYds: 0, recTD: 0, recs: 0, sacks: 0, tackles: 0, pd: 0 };
  
  for (const cat of cats) {
    for (const s of (cat.stats||[])) {
      const v = parseFloat(String(s.displayValue||'0').replace(/,/g,''));
      if (s.name === 'gamesPlayed') stats.gp = v;
      else if (s.name === 'netPassingYards') stats.passYds = v;
      else if (s.name === 'passingTouchdowns') stats.passTD += v;
      else if (s.name === 'interceptions') stats.ints = v;
      else if (s.name === 'rushingYards') stats.rushYds = v;
      else if (s.name === 'rushingTouchdowns') stats.rushTD = v;
      else if (s.name === 'receivingYards') stats.recYds = v;
      else if (s.name === 'receivingTouchdowns') stats.recTD += v;
      else if (s.name === 'receptions') stats.recs = v;
      else if (s.name === 'sacks' && !stats.sacks) stats.sacks = v; // take first (passing sacks)
      else if (s.name === 'totalTackles') stats.tackles = v;
      else if (s.name === 'passesDefended') stats.pd = v;
    }
  }
  
  return stats;
}

// ════════════════════════════════════
// Batch fetch player stats (concurrent)
// ════════════════════════════════════

const STATS_CACHE = {};
async function batchFetchStats(playerIds, batchSize=5) {
  const results = {};
  const ids = [...new Set(playerIds.filter(id => id && !STATS_CACHE[id]))];
  
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const promises = batch.map(async (id) => {
      STATS_CACHE[id] = await fetchCareerStats(id);
      return id;
    });
    const completed = await Promise.all(promises);
    for (const id of completed) {
      if (STATS_CACHE[id]) results[id] = STATS_CACHE[id];
    }
    process.stdout.write('.');
  }
  
  // Also return cached
  for (const id of playerIds) {
    if (STATS_CACHE[id] && !results[id]) {
      results[id] = STATS_CACHE[id];
    }
  }
  
  return results;
}

// ════════════════════════════════════
// Fetch team stats from ESPN
// ════════════════════════════════════

async function fetchTeamStats() {
  const teamStats = {};
  for (const abb in TEAM_IDS) {
    const data = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${TEAM_IDS[abb]}/statistics`);
    if (!data) continue;
    
    const cats = data?.results?.stats?.categories || [];
    const stats = {};
    
    for (const cat of cats) {
      const nm = cat.name;
      stats[nm] = {};
      for (const s of (cat.stats||[])) {
        const v = parseFloat(String(s.displayValue||'0').replace(/,/g,''));
        const pg = parseFloat(String(s.perGameDisplayValue||'0').replace(/,/g,''));
        if (v !== 0 || pg !== 0) {
          stats[nm][s.name] = { total: v, pg };
        }
      }
    }
    teamStats[abb] = stats;
    process.stdout.write('.');
  }
  return teamStats;
}

// ════════════════════════════════════
// MAIN
// ════════════════════════════════════

async function main() {
  console.log('🦅 Building NFL local database v2...');
  
  // 1. Fetch rosters from ESPN
  console.log('📡 Fetching 2026 rosters...');
  const rostersRaw = {};
  for (const abb in TEAM_IDS) {
    const data = await sf(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${TEAM_IDS[abb]}/roster`);
    if (!data || !data.athletes) continue;
    
    const players = { off: [], def: [] };
    for (const entry of data.athletes) {
      for (const item of (entry.items||[])) {
        const name = `${item.firstName||''} ${item.lastName||''}`.trim();
        if (!name) continue;
        const ep = (item.position||{}).abbreviation || '';
        const pos = POS_MAP[ep];
        if (!pos) continue;
        
        const pdata = {
          id: item.id,
          name,
          pos,
          jersey: item.jersey||'',
          exp: (item.experience||{}).years||0,
          age: item.age||0,
          height: item.displayHeight||'',
          weight: item.displayWeight||''
        };
        
        if (['QB','RB','WR','TE','OL'].includes(pos)) players.off.push(pdata);
        else if (['DL','LB','CB','S'].includes(pos)) players.def.push(pdata);
      }
    }
    rostersRaw[abb] = players;
    process.stdout.write('.');
  }
  console.log(' done');
  
  // 2. Fetch career stats for all players
  console.log('📡 Fetching career stats for all players...');
  const allIds = [];
  for (const abb in rostersRaw) {
    for (const p of rostersRaw[abb].off) allIds.push(p.id);
    for (const p of rostersRaw[abb].def) allIds.push(p.id);
  }
  const stats = await batchFetchStats(allIds, 10);
  console.log(` done (${Object.keys(stats).length} with stats)`);
  
  // 3. Build final roster with stats
  const rostersFinal = {};
  for (const abb in rostersRaw) {
    rostersFinal[abb] = {
      off: rostersRaw[abb].off.map(p => ({
        ...p,
        careerStats: stats[p.id] || null
      })),
      def: rostersRaw[abb].def.map(p => ({
        ...p,
        careerStats: stats[p.id] || null
      }))
    };
  }
  
  const totalPlayers = Object.values(rostersFinal).reduce((s,t) => s + t.off.length + t.def.length, 0);
  const withStats = Object.values(rostersFinal).reduce((s,t) => s + t.off.filter(p=>p.careerStats).length + t.def.filter(p=>p.careerStats).length, 0);
  
  // 4. Fetch team stats
  console.log('📡 Fetching team stats...');
  const teamStats = await fetchTeamStats();
  console.log(` done (${Object.keys(teamStats).length} teams)`);
  
  // 5. Fetch games/odds
  console.log('📡 Fetching games...');
  const oddsData = await sf(`https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${ODDS_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`);
  const games = Array.isArray(oddsData) ? oddsData.map(g => ({
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
  })) : [];
  console.log(` done (${games.length} games)`);
  
  // 6. Write all files
  console.log('📝 Writing data files...');
  fs.writeFileSync(DATA_DIR + '/rosters.json', JSON.stringify(rostersFinal, null, 1));
  fs.writeFileSync(DATA_DIR + '/team_stats.json', JSON.stringify(teamStats, null, 1));
  fs.writeFileSync(DATA_DIR + '/games.json', JSON.stringify(games, null, 1));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`  Rosters: ${totalPlayers} players (${withStats} with career stats)`);
  console.log(`  Team stats: ${Object.keys(teamStats).length} teams`);
  console.log(`  Games: ${games.length} upcoming`);
  console.log(`  DB size: ~${Math.round((Buffer.byteLength(JSON.stringify(rostersFinal))+Buffer.byteLength(JSON.stringify(teamStats))+Buffer.byteLength(JSON.stringify(games)))/1024)} KB`);
  
  // Git
  const {execSync}=require('child_process');
  execSync(`cd "${__dirname}" && git add data/ && git commit -m "NFL DB v2: local database with career stats + team stats + games" && git push`, {stdio:'inherit'});
  console.log('✅ DONE');
}

main().catch(e => console.error('❌', e.message));
