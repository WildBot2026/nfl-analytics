#!/usr/bin/env node
/**
 * 🦅 SPOTRAC ROSTER SCRAPER v3 — Roster 2026 + salarios por equipo
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

function fetchWithRedirect(url, resolve, n) {
  if (n > 5) { resolve(''); return; }
  https.get(url, {
    timeout: 25000,
    headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' }
  }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      const loc = res.headers.location.startsWith('http') ? res.headers.location : 'https://www.spotrac.com' + res.headers.location;
      fetchWithRedirect(loc, resolve, n + 1);
      return;
    }
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => resolve(d));
  }).on('error', () => resolve(''));
}

function fetchHTML(slug) {
  return new Promise((resolve) => {
    fetchWithRedirect(`https://www.spotrac.com/nfl/${slug}/overview`, resolve, 0);
  });
}

function parsePlayers(html, abb) {
  const players = [];
  let idx = 0;

  while ((idx = html.indexOf('spotrac.com/nfl/player/_/id/', idx)) >= 0) {
    const start = idx + 'spotrac.com/nfl/player/_/id/'.length;
    const slash = html.indexOf('/', start);
    const pid = parseInt(html.substring(start, slash));

    const closeTag = html.indexOf('>', slash);
    const nameEnd = html.indexOf('<', closeTag + 1);
    const name = nameEnd > closeTag ? html.substring(closeTag + 1, nameEnd).trim() : '?';
    idx = nameEnd;

    // Find enclosing <tr>
    const trStart = html.lastIndexOf('<tr', idx - 200);
    const trEnd = trStart >= 0 ? html.indexOf('</tr>', trStart) : -1;
    if (trStart < 0 || trEnd < 0) continue;
    const row = html.substring(trStart, trEnd);

    // Extract all <td> cell text
    const tds = [];
    let ci = -1;
    while ((ci = row.indexOf('<td', ci + 1)) >= 0) {
      const tdEnd = row.indexOf('</td>', ci);
      if (tdEnd < 0) break;
      const content = row.substring(row.indexOf('>', ci) + 1, tdEnd)
        .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      tds.push(content);
      ci = tdEnd;
    }

    // tds: 0=rank, 1=name-col, 2=position, 3=age
    let pos = '?';
    if (tds.length > 2 && tds[2] && tds[2].length <= 5) pos = tds[2];
    let age = 0;
    if (tds.length > 3) age = parseInt(tds[3]) || 0;

    // Dollar amounts: find by class names
    let cap = 0, deadCap = 0, cashTotal = 0, faYear = 0;

    const capM = row.match(/contract-cap_total[^>]*>[\s\S]*?\$?([0-9,]+)\.?\d*/i);
    if (capM) cap = parseFloat(capM[1].replace(/,/g, ''));

    const deadM = row.match(/contract-cap_dead[^>]*>[\s\S]*?\(?\$?([0-9,]+)\.?\d*/i);
    if (deadM) deadCap = parseFloat(deadM[1].replace(/,/g, ''));

    const cashM = row.match(/contract-cash_total[^>]*>[\s\S]*?\$?([0-9,]+)\.?\d*/i);
    if (cashM) cashTotal = parseFloat(cashM[1].replace(/,/g, ''));

    const faM = row.match(/contract-free_agent_year[^>]*>[\s\S]*?(\d{4})/i);
    if (faM) faYear = parseInt(faM[1]);

    const pu = pos.toUpperCase();
    const ps = POS_MAP[pu] || '?';
    const pg = ['QB','RB','WR','TE','OL'].includes(ps) ? 'off' :
      ['DL','LB','CB','S'].includes(ps) ? 'def' : 'st';

    players.push({ id: pid, name, team: abb, pos, posSimple: ps, posGroup: pg, age, capHit: cap, deadCap, cashTotal, faYear });
  }

  return players;
}

// ════════════════════════════════════
// MAIN
// ════════════════════════════════════

async function main() {
  console.log('🦅 SPOTRAC SCRAPER v3\n');

  const allRosters = {};
  const flatPlayers = {};
  let total = 0;

  for (let i = 0; i < TEAMS.length; i++) {
    const [slug, abb] = TEAMS[i];
    process.stdout.write(`[${String(i+1).padStart(2,'0')}/${TEAMS.length}] ${abb}... `);

    const html = await fetchHTML(slug);
    const players = parsePlayers(html, abb);

    const off = players.filter(p => p.posGroup === 'off');
    const def = players.filter(p => p.posGroup === 'def');
    allRosters[abb] = { off, def };
    flatPlayers[abb] = players;
    total += players.length;

    const withPos = players.filter(p => p.pos !== '?').length;
    console.log(`${players.length} players (${withPos} with position)`);

    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n✅ ${total} players across ${TEAMS.length} teams`);

  fs.writeFileSync(`${DATA_DIR}/rosters.json`, JSON.stringify(allRosters, null, 1));
  fs.writeFileSync(`${DATA_DIR}/rosters_flat.json`, JSON.stringify(flatPlayers, null, 1));

  const size = (Buffer.byteLength(JSON.stringify(allRosters)) / 1024).toFixed(0);
  console.log(`  rosters.json — ${total} players (${size} KB)`);

  const { execSync } = require('child_process');
  execSync(`cd "${__dirname}" && git add data/ && git commit -m "NFL DB v3: ${total} players from Spotrac with salaries" && git push`, { stdio: 'inherit' });
  console.log('✅ DONE');
}

main().catch(e => console.error('❌', e.message));
