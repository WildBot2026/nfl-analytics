// Test Spotrac parsing - fixed regex
const https = require('https');

https.get('https://www.spotrac.com/nfl/pittsburgh-steelers/roster/_/year/2026', {
  timeout: 20000,
  headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' }
}, (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    // Find all player rows
    const playerRegex = /href="https:\/\/www\.spotrac\.com\/nfl\/player\/_\/id\/(\d+)\/[^"]*"[^>]*>([^<]+)<\/a>/gi;
    const positionsById = {};
    const agesById = {};
    const capsById = {};
    
    let match;
    const players = [];
    while ((match = playerRegex.exec(html)) !== null) {
      players.push({ id: match[1], name: match[2].trim() });
    }
    
    // Now find position/age/cap for each by looking at <tr> context
    // Simpler: use split on <tr> and find player link in each
    const rows = html.split('<tr');
    const playerMap = {};
    
    for (const row of rows) {
      const idMatch = row.match(/href="https:\/\/www\.spotrac\.com\/nfl\/player\/_\/id\/(\d+)\/[^"]*"/i);
      if (!idMatch) continue;
      const pid = idMatch[1];
      
      const nameMatch = row.match(/href="https:\/\/www\.spotrac\.com\/nfl\/player\/_\/id\/\d+\/[^"]*"[^>]*>([^<]+)</i);
      const name = nameMatch ? nameMatch[1].trim() : '?';
      
      const posMatch = row.match(/position[^>]*>([^<]+)</i);
      const ageMatch = row.match(/age[^>]*>(\d+)</i);
      const capMatch = row.match(/cap[^>]*>\$?([0-9,]+)\.?\d*</i);
      
      const pos = nameMatch && row.includes(`>${name}<`) && name.length > 0 && name !== '?' ? 
        (posMatch ? posMatch[1].trim() : '?') : null;
      
      // Only process this if the name is actually in the row
      if (name && name.length > 0) {
        playerMap[pid] = {
          name,
          pos: posMatch ? posMatch[1].trim() : '?',
          age: ageMatch ? parseInt(ageMatch[1]) : 0,
          cap: capMatch ? parseFloat(capMatch[1].replace(/,/g,'')) : 0
        };
      }
    }
    
    // Show some results
    let count = 0;
    for (const [id, p] of Object.entries(playerMap)) {
      if (count < 10) {
        console.log(`${p.name} (${id}) | pos:${p.pos} | age:${p.age} | cap:$${p.cap}`);
      }
      count++;
    }
    console.log(`\nTotal: ${count} players`);
    
    // Check for specific players
    for (const [id, p] of Object.entries(playerMap)) {
      if (p.name.includes('Allar')) console.log(`\nFound Allar: ${p.name} - ${p.pos} - $${p.cap}`);
      if (p.name.includes('Rodgers')) console.log(`Found Rodgers: ${p.name} - ${p.pos} - $${p.cap}`);
    }
  });
}).on('error', e => console.error('Error:', e.message));
