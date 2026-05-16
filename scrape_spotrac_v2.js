#!/usr/bin/env node
/**
 * 🦅 SPOTRAC ROSTER SCRAPER v2 — Roster 2026 + salarios
 * Baja los 32 equipos de Spotrac. Datos estáticos, se llena una vez.
 */

const https = require('https');
const fs = require('fs');
const DATA_DIR = __dirname + '/data';

const TEAMS = [
  ['arizona-cardinals', 'ARI'], ['atlanta-falcons', 'ATL'], ['baltimore-ravens', 'BAL'],
  ['buffalo-bills', 'BUF'], ['carolina-panthers', 'CAR'], ['chicago-bears', 'CHI'],
  ['cincinnati-bengals', 'CIN'], ['cleveland-browns', 'CLE'], ['dallas-cowboys', 'DAL'],
  ['denver-broncos', 'DEN'], ['detroit-lions', 'DET'], ['green-bay-packers', 'GB'],
  ['houston-texans', 'HOU'], ['indianapolis-colts', 'IND'], ['jacksonville-jaguars', 'JAX'],
  ['kansas-city-chiefs', 'KC'], ['las-vegas-raiders', 'LV'], ['los-angeles-chargers', 'LAC'],
  ['los-angeles-rams', 'LAR'], ['miami-dolphins', 'MIA'], ['minnesota-vikings', 'MIN'],
  ['new-england-patriots', 'NE'], ['new-orleans-saints', 'NO'], ['new-york-giants', 'NYG'],
  ['new-york-jets', 'NYJ'], ['philadelphia-eagles', 'PHI'], ['pittsburgh-steelers', 'PIT'],
  ['san-francisco-49ers', 'SF'], ['seattle-seahawks', 'SEA'], ['tampa-bay-buccaneers', 'TB'],
  ['tennessee-titans', 'TEN'], ['washington-commanders', 'WAS']
];

const POS_MAP = {
  'QB':'QB','RB':'RB','FB':'RB','WR':'WR','TE':'TE',
  'OT':'OL','OG':'OL','C':'OL','G':'OL','OL':'OL','LT':'OL','LG':'OL','RT':'OL','RG':'OL','OC':'OL',
  'ED':'DL','DL':'DL','DE':'DL','DT':'DL','NT':'DL','IDL':'DL',
  'LB':'LB','OLB':'LB','ILB':'LB','MLB':'LB',
  'CB':'CB','DB':'CB','S':'S','SAF':'S','FS':'S','SS':'S',
  'K':'ST','P':'ST','LS':'ST'
};

function fetchHTML(teamSlug) {
  return new Promise((resolve) => {
    // Use overview URL which has the full roster table
    const url = `https://www.spotrac.com/nfl/${teamSlug}/overview`;
    fetchWithRedirect(url, resolve);
  });
}

function fetchWithRedirect(url, resolve, redirectCount = 0) {
  if (redirectCount > 5) { resolve(''); return; }
  https.get(url, { timeout: 25000, headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchWithRedirect(res.headers.location.startsWith('http') ? res.headers.location : 'https://www.spotrac.com' + res.headers.location, resolve, redirectCount + 1);
      return;
    }
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => resolve(d));
  }).on('error', () => resolve(''));
}

function parsePlayers(html, teamAbbr) {
  const players = [];
  let idx = 0;
  
  while ((idx = html.indexOf('spotrac.com/nfl/player/_/id/', idx)) >= 0) {
    const start = idx + 'spotrac.com/nfl/player/_/id/'.length;
    const slash = html.indexOf('/', start);
    const pid = parseInt(html.substring(start, slash));
    
    // Find player name after href
    const closeTag = html.indexOf('>', slash);
    const nameEnd = html.indexOf('<', closeTag + 1);
    const name = nameEnd > closeTag ? html.substring(closeTag + 1, nameEnd).trim() : '?';
    
    idx = nameEnd;

    // Now find position, age, cap by looking at surrounding HTML
    // Walk backwards to find enclosing <tr>
    const trStart = html.lastIndexOf('<tr', idx - 200);
    const trEnd = trStart >= 0 ? html.indexOf('</tr>', trStart) : -1;
    if (trStart < 0 || trEnd < 0) continue;
    
    const row = html.substring(trStart, trEnd);
    
    // Position: find <td with position class
    let pos = '?';
    const posArr = row.match(/position[^>]*>([^<]+)<\/td/i);
    if (posArr) pos = posArr[1].trim();
    
    // Age
    let age = 0;
    const ageArr = row.match(/age[^>]*>(\d+)<\/td/i);
    if (ageArr) age = parseInt(ageArr[1]);
    
    // Cap hit
    let cap = 0;
    const capArr = row.match(/cap[^>]*>[\s$]*([0-9,]+)\.?\d*<\//i);
    if (capArr) cap = parseFloat(capArr[1].replace(/,/g,''));
    
    // Dead cap
    let deadCap = 0;
    const deadArr = row.match(/dead[^>]*>[\s$]*([0-9,]+)\.?\d*<\//i);
    if (deadArr) deadCap = parseFloat(deadArr[1].replace(/,/g,''));
    
    // Cash total
    let cashTotal = 0;
    const cashArr = row.match(/cash[^>]*>[\s$]*([0-9,]+)\.?\d*<\//i);
    if (cashArr) cashTotal = parseFloat(cashArr[1].replace(/,/g,''));
    
    // FA year
    let faYear = 0;
    const faArr = row.match(/fa[^>]*>(\d{4})/i);
    if (faArr) faYear = parseInt(faArr[1]);
    
    const posUpper = pos.toUpperCase();
    const posSimple = POS_MAP[posUpper] || '?';
    
    const posGroup = ['QB','RB','WR','TE','OL'].includes(posSimple) ? 'off' :
      ['DL','LB','CB','S'].includes(posSimple) ? 'def' : 'st';
    
    players.push({
      id: pid, name, team: teamAbbr, pos, posSimple, posGroup,
      age, capHit: cap, deadCap, cashTotal, faYear
    });
  }
  
  return players;
}

// ════════════════════════════════════
// MAIN
// ════════════════════════════════════

async function main() {
  console.log('🦅 SPOTRAC SCRAPER v2\n');
  
  const allRosters = {};
  const flatPlayers = {};
  let total = 0;
  
  for (let i = 0; i < TEAMS.length; i++) {
    const [slug, abb] = TEAMS[i];
    process.stdout.write(`[${String(i+1).padStart(2,'0')}/${TEAMS.length}] ${abb}... `);
    
    const html = await fetchHTML(slug);
    const players = parsePlayers(html, abb);
    
    console.log(`${players.length} players`);
    
    const off = players.filter(p => p.posGroup === 'off');
    const def = players.filter(p => p.posGroup === 'def');
    
    allRosters[abb] = { off, def };
    flatPlayers[abb] = players;
    total += players.length;
    
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✅ ${total} players across ${TEAMS.length} teams`);
  
  // Deduplicate by ID across teams (some players may appear for multiple teams in 2026)
  // Not a concern for roster view
  
  // Write both roster format and flat format
  console.log('📝 Writing files...');
  fs.writeFileSync(`${DATA_DIR}/rosters.json`, JSON.stringify(allRosters, null, 1));
  fs.writeFileSync(`${DATA_DIR}/rosters_flat.json`, JSON.stringify(flatPlayers, null, 1));
  
  const dbSize = (Buffer.byteLength(JSON.stringify(allRosters)) / 1024).toFixed(0);
  console.log(`  rosters.json — ${total} players (${dbSize} KB)`);
  console.log(`  rosters_flat.json — flat format for queries`);
  
  // Git push
  const { execSync } = require('child_process');
  execSync(`cd "${__dirname}" && git add data/ && git commit -m "NFL DB v3: ${total} players from Spotrac with salaries" && git push`, { stdio: 'inherit' });
  
  console.log('✅ DONE');
}

main().catch(e => console.error('❌', e.message));
