// Quick test of Spotrac parsing
const https = require('https');

https.get('https://www.spotrac.com/nfl/pittsburgh-steelers/roster/_/year/2026', {
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
}, (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const rows = html.split('<tr');
    console.log('Rows:', rows.length);
    
    let count = 0;
    for (const row of rows) {
      const playerMatch = row.match(/<a[^>]*href="\/nfl\/player\/_\/id\/(\d+)\/[^"]*"[^>]*>([^<]+)<\/a>/i);
      if (!playerMatch) continue;
      
      const cells = row.match(/<td[^>]*>([^<]*)<\/td>/gi);
      if (!cells) continue;
      
      const name = playerMatch[2].trim();
      const pos = cells.length > 1 ? cells[1].replace(/<[^>]+>/g,'').trim() : '?';
      const age = cells.length > 2 ? parseInt(cells[2].replace(/<[^>]+>/g,'')) || 0 : 0;
      
      // Find cap hit - look for '$' after cap class
      const capAll = row.match(/class="[^"]*cap[^"]*"[^>]*>\$?([0-9,]+)/i);
      const cap = capAll ? parseFloat(capAll[1].replace(/,/g,'')) : 0;
      
      if (count < 5) {
        console.log(name, '| pos:', pos, '| age:', age, '| cap:', cap);
      }
      count++;
    }
    console.log('Total players found:', count);
    
    // Find Drew Allar
    const allarRow = html.match(/<a[^>]*href="[^"]*"[^>]*>([^<]*Allar[^<]*)<\/a>/i);
    console.log('Drew Allar:', allarRow ? allarRow[1] : 'NOT FOUND');
  });
}).on('error', e => console.error('Error:', e.message));
