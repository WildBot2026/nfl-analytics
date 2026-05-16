#!/usr/bin/env node
/**
 * 🦅 SPOTRAC ROSTER SCRAPER — baja roster de 32 equipos + salarios
 * Los datos son estáticos, una vez llenos no se tocan.
 */

const https = require('https');
const fs = require('fs');
const DATA_DIR = __dirname + '/data';

const TEAMS_SLUGS = {
  'arizona-cardinals': 'ARI', 'atlanta-falcons': 'ATL', 'baltimore-ravens': 'BAL',
  'buffalo-bills': 'BUF', 'carolina-panthers': 'CAR', 'chicago-bears': 'CHI',
  'cincinnati-bengals': 'CIN', 'cleveland-browns': 'CLE', 'dallas-cowboys': 'DAL',
  'denver-broncos': 'DEN', 'detroit-lions': 'DET', 'green-bay-packers': 'GB',
  'houston-texans': 'HOU', 'indianapolis-colts': 'IND', 'jacksonville-jaguars': 'JAX',
  'kansas-city-chiefs': 'KC', 'las-vegas-raiders': 'LV', 'los-angeles-chargers': 'LAC',
  'los-angeles-rams': 'LAR', 'miami-dolphins': 'MIA', 'minnesota-vikings': 'MIN',
  'new-england-patriots': 'NE', 'new-orleans-saints': 'NO', 'new-york-giants': 'NYG',
  'new-york-jets': 'NYJ', 'philadelphia-eagles': 'PHI', 'pittsburgh-steelers': 'PIT',
  'san-francisco-49ers': 'SF', 'seattle-seahawks': 'SEA', 'tampa-bay-buccaneers': 'TB',
  'tennessee-titans': 'TEN', 'washington-commanders': 'WAS'
};

const POS_GROUP = {
  'QB':'off','RB':'off','FB':'off','WR':'off','TE':'off',
  'OT':'off','OG':'off','C':'off','G':'off','OL':'off','LT':'off','LG':'off','RT':'off','RG':'off','OC':'off',
  'ED':'def','DL':'def','DE':'def','DT':'def','NT':'def','IDL':'def','INT':'def',
  'LB':'def','OLB':'def','ILB':'def','MLB':'def',
  'CB':'def','DB':'def','S':'def','SAF':'def','FS':'def','SS':'def',
  'K':'st','P':'st','LS':'st'
};

const POS_SIMPLE = {
  'QB':'QB','RB':'RB','FB':'RB','WR':'WR','TE':'TE',
  'OT':'OL','OG':'OL','C':'OL','G':'OL','OL':'OL','LT':'OL','LG':'OL','RT':'OL','RG':'OL','OC':'OL',
  'ED':'DL','DL':'DL','DE':'DL','DT':'DL','NT':'DL','IDL':'DL','INT':'DL',
  'LB':'LB','OLB':'LB','ILB':'LB','MLB':'LB',
  'CB':'CB','DB':'CB','S':'S','SAF':'S','FS':'S','SS':'S',
  'K':'ST','P':'ST','LS':'ST'
};

/**
 * Fetch HTML de Spotrac para un equipo.
 * Spotrac tiene el roster en una tabla en /nfl/TEAM/roster/_/year/2026
 */
async function fetchTeamRoster(slug, abb) {
  return new Promise((resolve) => {
    const url = 'https://www.spotrac.com/nfl/' + slug + '/roster/_/year/2026';
    https.get(url, { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        try {
          const players = parseSpotracHTML(html, abb);
          resolve(players);
        } catch (e) {
          console.error(`  ❌ ${abb}: parse error - ${e.message}`);
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

/**
 * Parsea el HTML de Spotrac para extraer jugadores.
 * Spotrac usa tablas con rows como:
 * <td class="player"><a href="/nfl/player/_/id/3745/aaron-rodgers">Aaron Rodgers</a></td>
 * <td class="position">QB</td>
 * <td class="age">43</td>
 * <td class="cap">$15,015,000</td>
 * <td class="dead">-</td>
 * <td class="cash">$15,015,000</td>
 */
function parseSpotracHTML(html, abb) {
  const players = [];
  
  // Match player rows: look for patterns in the roster table
  // Split by <tr> and find player rows
  const rows = html.split('<tr');
  
  for (const row of rows) {
    // Must have a player link
    const playerMatch = row.match(/<a[^>]*href="\/nfl\/player\/_\/id\/(\d+)\/[^"]*"[^>]*>([^<]+)<\/a>/i);
    if (!playerMatch) continue;
    
    const pid = playerMatch[1];
    const name = playerMatch[2].trim();
    
    // Position
    const posMatch = row.match(/<td[^>]*class="[^"]*\bposition\b[^"]*"[^>]*>([^<]+)<\/td>/i);
    if (!posMatch) continue;
    const pos = POS_SIMPLE[posMatch[1].trim().toUpperCase()] || posMatch[1].trim();
    const grp = POS_GROUP[posMatch[1].trim().toUpperCase()] || 'st';
    
    // Age
    const ageMatch = row.match(/<td[^>]*class="[^"]*\bage\b[^"]*"[^>]*>([^<]+)<\/td>/i);
    const age = ageMatch ? parseInt(ageMatch[1]) || 0 : 0;
    
    // Cap hit
    const capMatch = row.match(/<td[^>]*class="[^"]*\bcap\b[^"]*"[^>]*>\$?([0-9,]+)/i);
    const cap = capMatch ? parseFloat(capMatch[1].replace(/,/g,'')) || 0 : 0;
    
    // Dead cap
    const deadMatch = row.match(/<td[^>]*class="[^"]*\bdead\b[^"]*"[^>]*>\$?([0-9,]+)/i);
    const deadCap = deadMatch ? parseFloat(deadMatch[1].replace(/,/g,'')) || 0 : 0;
    
    // Cash total
    const cashMatch = row.match(/<td[^>]*class="[^"]*\bcash\b[^"]*"[^>]*>\$?([0-9,]+)/i);
    const cash = cashMatch ? parseFloat(cashMatch[1].replace(/,/g,'')) || 0 : 0;
    
    // FA year 
    const faMatch = row.match(/<td[^>]*class="[^"]*\bfa\b[^"]*"[^>]*>(\d{4})/i);
    const faYear = faMatch ? parseInt(faMatch[1]) : 0;
    
    players.push({
      id: parseInt(pid),
      name,
      team: abb,
      pos: posMatch[1].trim(),
      posGroup: grp,
      posSimple: pos,
      age,
      capHit: cap,
      deadCap,
      cashTotal: cash,
      faYear
    });
  }
  
  return players;
}

/**
 * Fetch career stats from ESPN core API
 */
async function fetchCareerStats(playerId) {
  return new Promise((resolve) => {
    https.get(`http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${playerId}/statistics?lang=en&region=us`, { timeout: 10000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(d);
          if (data.error) { resolve(null); return; }
          
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
              else if (s.name === 'sacks' && stats.sacks === 0) stats.sacks = v;
              else if (s.name === 'totalTackles') stats.tackles = v;
              else if (s.name === 'passesDefended') stats.pd = v;
            }
          }
          
          resolve(stats);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// ════════════════════════════════════
// MAIN
// ════════════════════════════════════

async function main() {
  console.log('🦅 SPOTRAC SCRAPER — Roster 2026 + Salarios + Stats\n');
  
  const allRosters = {};
  let totalPlayers = 0;
  
  // Step 1: Fetch all 32 team rosters from Spotrac
  const slugs = Object.entries(TEAMS_SLUGS);
  console.log(`📡 Fetching ${slugs.length} team rosters from Spotrac...`);
  
  for (let i = 0; i < slugs.length; i++) {
    const [slug, abb] = slugs[i];
    process.stdout.write(`  [${String(i+1).padStart(2,'0')}/${slugs.length}] ${abb}... `);
    const players = await fetchTeamRoster(slug, abb);
    allRosters[abb] = players;
    totalPlayers += players.length;
    console.log(`${players.length} players`);
    
    // Rate limit: 500ms entre equipos
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n✅ Total: ${totalPlayers} players across 32 teams\n`);
  
  // Step 2: Fetch career stats (only for players in the roster)
  // Use batch of 5 concurrent to avoid rate limiting
  console.log('📡 Fetching career stats from ESPN...');
  let withStats = 0;
  let statsFetched = 0;
  
  for (const abb in allRosters) {
    const batch = allRosters[abb];
    for (let i = 0; i < batch.length; i += 5) {
      const promises = batch.slice(i, i + 5).map(async (p) => {
        const stats = await fetchCareerStats(p.id);
        if (stats) {
          p.careerStats = stats;
          withStats++;
        }
        statsFetched++;
        if (statsFetched % 50 === 0) process.stdout.write('.');
        return stats;
      });
      await Promise.all(promises);
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  console.log(`\n✅ ${withStats}/${totalPlayers} with career stats\n`);
  
  // Step 3: Separate into off/def for dashboard
  const finalRosters = {};
  for (const abb in allRosters) {
    const off = [], def = [];
    for (const p of allRosters[abb]) {
      // Remove raw HTML fields, keep clean
      const clean = {
        id: p.id,
        name: p.name,
        pos: p.posSimple,
        espnPos: p.pos,
        jersey: p.jersey || '',
        age: p.age,
        capHit: p.capHit,
        deadCap: p.deadCap,
        cashTotal: p.cashTotal,
        faYear: p.faYear,
        careerStats: p.careerStats || null
      };
      if (p.posGroup === 'off') off.push(clean);
      else if (p.posGroup === 'def') def.push(clean);
    }
    finalRosters[abb] = { off, def };
  }
  
  // Step 4: Write files
  console.log('📝 Writing data files...');
  fs.writeFileSync(DATA_DIR + '/rosters.json', JSON.stringify(finalRosters, null, 1));
  console.log(`  rosters.json — ${totalPlayers} players (${withStats} with career stats)`);
  
  // Also write a flat version for easy querying
  const flatRosters = {};
  for (const abb in allRosters) {
    flatRosters[abb] = allRosters[abb].map(p => ({
      id: p.id,
      name: p.name,
      pos: p.pos,
      posSimple: p.posSimple,
      team: abb,
      age: p.age,
      capHit: p.capHit,
      deadCap: p.deadCap,
      cashTotal: p.cashTotal,
      faYear: p.faYear,
      careerStats: p.careerStats ? {
        gp: p.careerStats.gp,
        passYds: p.careerStats.passYds,
        passTD: p.careerStats.passTD,
        rushYds: p.careerStats.rushYds,
        recYds: p.careerStats.recYds,
        sacks: p.careerStats.sacks,
        tackles: p.careerStats.tackles
      } : null
    }));
  }
  fs.writeFileSync(DATA_DIR + '/player_stats.json', JSON.stringify(flatRosters, null, 1));
  console.log(`  player_stats.json — flat roster for queries`);
  
  // Git push
  const { execSync } = require('child_process');
  console.log('\n📤 Pushing to GitHub...');
  execSync(`cd "${__dirname}" && git add data/ && git commit -m "NFL DB v3: Spotrac rosters (${totalPlayers} players, ${withStats} with career stats)" && git push`, { stdio: 'inherit' });
  console.log('✅ DONE — NFL local database v3 ready');
}

main().catch(e => console.error('❌', e.message));
