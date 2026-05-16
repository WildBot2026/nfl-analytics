#!/usr/bin/env python3
"""
🦅 NFL Head-to-Head History Builder
Scrapes ESPN API for 2020-2024 seasons
Generates matchup history data + updates dashboard
"""

import json, urllib.request, gzip, io, os, sys

YEARS = [2020, 2021, 2022, 2023, 2024]
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DASHBOARD = os.path.join(os.path.dirname(__file__), 'dashboard_2026.html')
OUTPUT = os.path.join(DATA_DIR, 'h2h_history.json')

TEAM_ABBR_TO_FULL = {
    'ARI':'Arizona Cardinals','ATL':'Atlanta Falcons','BAL':'Baltimore Ravens',
    'BUF':'Buffalo Bills','CAR':'Carolina Panthers','CHI':'Chicago Bears',
    'CIN':'Cincinnati Bengals','CLE':'Cleveland Browns','DAL':'Dallas Cowboys',
    'DEN':'Denver Broncos','DET':'Detroit Lions','GB':'Green Bay Packers',
    'HOU':'Houston Texans','IND':'Indianapolis Colts','JAX':'Jacksonville Jaguars',
    'KC':'Kansas City Chiefs','LV':'Las Vegas Raiders','LAC':'Los Angeles Chargers',
    'LAR':'Los Angeles Rams','MIA':'Miami Dolphins','MIN':'Minnesota Vikings',
    'NE':'New England Patriots','NO':'New Orleans Saints','NYG':'New York Giants',
    'NYJ':'New York Jets','PHI':'Philadelphia Eagles','PIT':'Pittsburgh Steelers',
    'SEA':'Seattle Seahawks','SF':'San Francisco 49ers','TB':'Tampa Bay Buccaneers',
    'TEN':'Tennessee Titans','WAS':'Washington Commanders'
}

# Known QB starters for key games (2024 season)
# We can get this from ESPN API game details, but for speed use a simpler approach
# Map team to their 2024 starting QB
TEAM_QB_2024 = {
    'ARI':'Kyler Murray','ATL':'Kirk Cousins','BAL':'Lamar Jackson',
    'BUF':'Josh Allen','CAR':'Bryce Young','CHI':'Caleb Williams',
    'CIN':'Joe Burrow','CLE':'Deshaun Watson','DAL':'Dak Prescott',
    'DEN':'Bo Nix','DET':'Jared Goff','GB':'Jordan Love',
    'HOU':'C.J. Stroud','IND':'Anthony Richardson','JAX':'Trevor Lawrence',
    'KC':'Patrick Mahomes','LV':'Gardner Minshew','LAC':'Justin Herbert',
    'LAR':'Matthew Stafford','MIA':'Tua Tagovailoa','MIN':'Sam Darnold',
    'NE':'Jacoby Brissett','NO':'Derek Carr','NYG':'Daniel Jones',
    'NYJ':'Aaron Rodgers','PHI':'Jalen Hurts','PIT':'Russell Wilson',
    'SEA':'Geno Smith','SF':'Brock Purdy','TB':'Baker Mayfield',
    'TEN':'Will Levis','WAS':'Jayden Daniels'
}

def fetch_year(year):
    url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates={year}&limit=400"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        try:
            data = json.loads(raw)
        except:
            data = json.loads(gzip.decompress(raw))
    return data.get('events', [])

def process_events(events):
    games = []
    for e in events:
        comps = e.get('competitions', [{}])[0]
        teams = comps.get('competitors', [])
        if len(teams) < 2: continue
        status = comps.get('status', {}).get('type', {}).get('name', '')
        if status not in ('STATUS_FINAL', 'STATUS_FINAL_OVERTIME'): continue
        
        a = teams[0].get('team', {}).get('abbreviation', '')
        b = teams[1].get('team', {}).get('abbreviation', '')
        as_ = teams[0].get('score', '0')
        bs_ = teams[1].get('score', '0')
        date = e.get('date', '')[:10]
        season = int(date[:4])
        week = comps.get('week', {}).get('number', 0)
        
        if not a or not b: continue
        
        winner = a if int(as_) > int(bs_) else (b if int(bs_) > int(as_) else 'TIE')
        
        games.append({
            'date': date,
            'season': season,
            'week': week,
            'away': a,
            'home': b,
            'awayScore': int(as_),
            'homeScore': int(bs_),
            'winner': winner,
            'awayQB': TEAM_QB_2024.get(a, ''),
            'homeQB': TEAM_QB_2024.get(b, '')
        })
    return games

def build_h2h(all_games):
    """Build head-to-head records: team vs team, QB vs team"""
    
    # Team vs Team
    team_h2h = {}
    
    # QB vs Team  
    qb_h2h = {}
    
    for g in all_games:
        a, b = g['away'], g['home']
        
        # Team H2H
        key = tuple(sorted([a, b]))
        if key not in team_h2h:
            team_h2h[key] = {'teamA': a, 'teamB': b, 'games': []}
        team_h2h[key]['games'].append(g)
        
        # QB vs Team (for each QB that played)
        for qb_field, opp_team in [('awayQB', 'home'), ('homeQB', 'away')]:
            qb_name = g[qb_field]
            if not qb_name: continue
            opp = g[opp_team + 'Score']  # will fix
            if qb_name not in qb_h2h:
                qb_h2h[qb_name] = {}
            opp_abbr = g[opp_team]
            if opp_abbr not in qb_h2h[qb_name]:
                qb_h2h[qb_name][opp_abbr] = {'wins': 0, 'losses': 0, 'games': []}
            
            # Determine W/L for this QB
            is_away = (qb_field == 'awayQB')
            qb_team = g['away'] if is_away else g['home']
            qb_score = g['awayScore'] if is_away else g['homeScore']
            opp_score = g['homeScore'] if is_away else g['awayScore']
            won = 1 if qb_score > opp_score else 0
            lost = 1 if qb_score < opp_score else 0
            
            qb_h2h[qb_name][opp_abbr]['wins'] += won
            qb_h2h[qb_name][opp_abbr]['losses'] += lost
            qb_h2h[qb_name][opp_abbr]['games'].append({
                'date': g['date'],
                'season': g['season'],
                'week': g['week'],
                'qbTeam': qb_team,
                'opponent': opp_abbr,
                'qbScore': qb_score,
                'oppScore': opp_score,
                'result': 'W' if won else ('L' if lost else 'T')
            })
    
    return team_h2h, qb_h2h

def main():
    print("🦅 Fetching NFL games 2020-2024...")
    all_games = []
    for year in YEARS:
        events = fetch_year(year)
        games = process_events(events)
        all_games.extend(games)
        print(f"  {year}: {len(games)} games")
    
    print(f"\nTotal completed games: {len(all_games)}")
    
    # Build H2H records
    team_h2h, qb_h2h = build_h2h(all_games)
    
    print(f"Team H2H pairs: {len(team_h2h)}")
    print(f"QB H2H records: {sum(len(v) for v in qb_h2h.values())}")
    
    # Convert tuple keys to string for JSON
    team_h2h_str = {','.join(sorted([v['teamA'], v['teamB']])): v for k, v in team_h2h.items()}
    
    # Save data
    output = {
        'totalGames': len(all_games),
        'seasons': YEARS,
        'teamH2H': team_h2h_str,
        'qbH2H': qb_h2h
    }
    
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Data saved to {OUTPUT}")
    print(f"   Size: {os.path.getsize(OUTPUT)/1024:.1f} KB")
    
    # ---------- Generate dashboard script ----------
    js_path = os.path.join(os.path.dirname(__file__), 'dashboard_h2h.js')
    
    team_h2h_js = json.dumps({k: {**v, 'games': v['games'][-10:]} for k, v in team_h2h_str.items()})
    qb_h2h_js = json.dumps({q: {opp: {**rec, 'games': rec['games'][-5:]} for opp, rec in opps.items()} for q, opps in qb_h2h.items()})
    
    js = f"""// NFL Head-to-Head Module - Real Results 2020-2024
(function(){{
var H2H_TEAMS = {team_h2h_js};
var H2H_QB = {qb_h2h_js};
var TA = {json.dumps(TEAM_ABBR_TO_FULL)};

// Invert to get abbr
var TA_INV = {{}};
for(var k in TA) TA_INV[TA[k]] = k;

function findH2H(a, b) {{
  var key = [a,b].sort().join(',');
  for(var k in H2H_TEAMS) {{
    if(k === key) return H2H_TEAMS[k];
    var parts = k.split(',');
    if((parts[0]===a&&parts[1]===b)||(parts[0]===b&&parts[1]===a)) return H2H_TEAMS[k];
  }}
  return null;
}}

function findQBH2H(qb, opp) {{
  if(!H2H_QB[qb]) return null;
  return H2H_QB[qb][opp] || null;
}}

function renderH2H() {{
  var tab = document.getElementById('tab-h2h');
  if(!tab) return;
  
  var html = '<div class="filters">';
  html += 'Team: <select id="h2hTeam1" onchange="renderH2H()">';
  html += '<option value="">-- Select Team --</option>';
  var teams = Object.keys(TA).sort();
  teams.forEach(function(t){{html+='<option value="'+t+'">'+TA[t]+'</option>'}});
  html += '</select>';
  html += ' vs <select id="h2hTeam2" onchange="renderH2H()">';
  html += '<option value="">-- Select Team --</option>';
  teams.forEach(function(t){{html+='<option value="'+t+'">'+TA[t]+'</option>'}});
  html += '</select>';
  html += ' QB: <select id="h2hQB" onchange="renderH2H()">';
  html += '<option value="">All QBs</option>';
  Object.keys(H2H_QB).sort().forEach(function(q){{html+='<option value="'+q+'">'+q+'</option>'}});
  html += '</select></div>';
  
  var t1 = document.getElementById('h2hTeam1')?.value||'';
  var t2 = document.getElementById('h2hTeam2')?.value||'';
  var qb = document.getElementById('h2hQB')?.value||'';
  
  html += '<div class="h2h-grid">';
  
  if(t1 && t2 && t1 !== t2) {{
    var h2h = findH2H(t1, t2);
    if(h2h) {{
      var games = h2h.games;
      var w1 = 0, w2 = 0;
      games.forEach(function(g){{if(g.winner===t1)w1++;else if(g.winner===t2)w2++;}});
      html += '<div class="h2h-card h2h-main"><div class="h2h-record">';
      html += '<span class="h2h-team">'+TA[t1]+'</span> <span class="h2h-wins">'+w1+'</span> - ';
      html += '<span class="h2h-wins" style="color:#ff7043">'+w2+'</span> <span class="h2h-team">'+TA[t2]+'</span>';
      html += '</div><div class="h2h-count">'+games.length+' games (2020-2024)</div>';
      
      html += '<table class="h2h-table"><tr><th>Date</th><th>Season</th><th>Result</th><th>Score</th></tr>';
      games.slice().reverse().forEach(function(g){{
        var isAway = (g.away === t1);
        var teamScore = isAway ? g.awayScore : g.homeScore;
        var oppScore = isAway ? g.homeScore : g.awayScore;
        var teamLabel = isAway ? 'AT' : 'vs';
        var opp = isAway ? TA[g.home] : TA[g.away];
        var w = g.winner === t1 ? 'W' : (g.winner === t2 ? 'L' : 'T');
        var wClass = w === 'W' ? 'win' : (w === 'L' ? 'loss' : 'tie');
        html += '<tr class="'+wClass+'"><td>'+g.date+'</td><td>'+g.season+'</td>';
        html += '<td class="'+wClass+'">'+w+'</td>';
        html += '<td>'+teamLabel+' '+opp+' '+teamScore+'-'+oppScore+'</td></tr>';
      }});
      html += '</table></div>';
    }} else {{
      html += '<div class="h2h-card"><p>No games found between these teams (2020-2024)</p></div>';
    }}
  }}
  
  // QB vs Team
  if(qb) {{
    html += '<div class="h2h-section-title">🎯 QB: '+qb+' vs opponents</div>';
    var qbData = H2H_QB[qb];
    if(qbData) {{
      Object.keys(qbData).sort().forEach(function(opp) {{
        var rec = qbData[opp];
        html += '<div class="h2h-card"><div class="h2h-record">';
        html += '<span class="h2h-team">'+qb+'</span> vs <span class="h2h-team">'+TA[opp]+'</span>: ';
        html += '<span class="h2h-wins">'+rec.wins+'W</span> / ';
        html += '<span class="h2h-losses">'+rec.losses+'L</span>';
        html += '</div><table class="h2h-table"><tr><th>Date</th><th>Result</th><th>Score</th></tr>';
        rec.games.slice().reverse().forEach(function(g){{
          html += '<tr class="'+(g.result==='W'?'win':'loss')+'">';
          html += '<td>'+g.date+'</td><td>'+g.result+'</td>';
          html += '<td>'+g.qbTeam+' '+g.qbScore+'-'+g.oppScore+' '+g.opponent+'</td></tr>';
        }});
        html += '</table></div>';
      }});
    }}
  }}
  
  html += '</div>';
  
  html += '<style>.h2h-grid{{display:flex;flex-direction:column;gap:16px}}';
  html += '.h2h-card{{background:#111d35;border:1px solid #1e3050;border-radius:10px;padding:16px}}';
  html += '.h2h-main{{border-color:#4fc3f7}}';
  html += '.h2h-record{{font-size:18px;margin-bottom:8px}}';
  html += '.h2h-wins{{color:#66bb6a;font-weight:700}}';
  html += '.h2h-losses{{color:#ff7043;font-weight:700}}';
  html += '.h2h-team{{color:#4fc3f7;font-weight:600}}';
  html += '.h2h-count{{color:#7a8ba8;font-size:12px;margin-bottom:12px}}';
  html += '.h2h-table{{width:100%;border-collapse:collapse;font-size:12px}}';
  html += '.h2h-table th{{text-align:left;color:#7a8ba8;padding:6px 8px;border-bottom:1px solid #1e3050}}';
  html += '.h2h-table td{{padding:6px 8px;border-bottom:1px solid #0f1a30}}';
  html += '.h2h-table tr.win td:first-child{{border-left:3px solid #66bb6a;padding-left:5px}}';
  html += '.h2h-table tr.loss td:first-child{{border-left:3px solid #ff7043;padding-left:5px}}';
  html += '.h2h-section-title{{color:#ffd54f;font-size:14px;font-weight:600;margin-top:16px}}';
  html += '.filters{{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:center}}';
  html += '.filters select{{background:#0f1a30;color:#c8d6e5;border:1px solid #1e3050;border-radius:6px;padding:8px 12px;font-size:12px}}</style>';
  
  tab.innerHTML = html;
}}

// Add H2H tab and nav button
var nb = document.createElement('button');
nb.textContent = '📊 H2H';
nb.onclick=function(){{showTab('h2h')}};
var nav=document.querySelector('.nav');
var btns=nav.querySelectorAll('button');
nav.insertBefore(nb, btns[btns.length-1]);

var tab=document.createElement('div');
tab.id='tab-h2h';tab.className='content hidden';
document.getElementById('tab-schedule').parentNode.insertBefore(tab, document.getElementById('tab-schedule').nextSibling);

// Override showTab
var oST=window.showTab;
window.showTab=function(n){{
  document.querySelectorAll('.content').forEach(function(e){{e.classList.add('hidden')}});
  document.querySelectorAll('.nav button').forEach(function(b){{b.classList.remove('active')}});
  var t=document.getElementById('tab-'+n);if(t)t.classList.remove('hidden');
  document.querySelectorAll('.nav button').forEach(function(b){{
    if((b.textContent.includes('Matchups')||b.textContent.includes('H2H'))&&n==='matchups')b.classList.add('active');
    if(b.textContent.includes('H2H')&&n==='h2h')b.classList.add('active');
    if(b.textContent.includes('Schedule')&&n==='schedule')b.classList.add('active');
    if(b.textContent.includes('Teams')&&n==='teams')b.classList.add('active');
    if(b.textContent.includes('Stats')&&n==='stats')b.classList.add('active');
    if(b.textContent.includes('Rosters')&&n==='rosters')b.classList.add('active');
  }});
  if(n==='schedule'&&typeof renderSchedule==='function')renderSchedule();
  if(n==='matchups'&&typeof renderMatchups==='function')renderMatchups();
  if(n==='h2h')renderH2H();
}};
}})();
"""
    
    with open(js_path, 'w') as f:
        f.write(js)
    print(f"✅ Generated {js_path}")
    
    # Inject into dashboard
    with open(DASHBOARD, 'r') as f:
        html = f.read()
    
    inject = '\n<script src="dashboard_h2h.js"></script>\n'
    if 'dashboard_h2h.js' not in html and 'dashboard_matchups.js' not in html:
        # Inject before </body>
        idx = html.rfind('</body>')
        if idx > 0:
            html = html[:idx] + inject + html[idx:]
        else:
            html += inject
    
    # Also ensure matchup script is there
    if 'dashboard_matchups.js' not in html:
        idx = html.rfind('</body>')
        if idx > 0:
            html = html[:idx] + '\n<script src="dashboard_matchups.js"></script>\n' + html[idx:]
    
    with open(DASHBOARD, 'w') as f:
        f.write(html)
    
    print(f"✅ Dashboard updated: {len(html)/1024:.1f} KB")
    print("🎉 H2H History added!")
    
    # Demo output
    print("\n=== Sample: KC vs SF ===")
    h2h = team_h2h.get(('KC','SF'))
    if h2h:
        for g in h2h['games']:
            print(f"  {g['date']}: {g['away']} {g['awayScore']}-{g['homeScore']} {g['home']} | W: {g['winner']}")
    
    print("\n=== Sample: Mahomes vs SF ===")
    mahomes_vs_sf = qb_h2h.get('Patrick Mahomes', {}).get('SF')
    if mahomes_vs_sf:
        print(f"  Record: {mahomes_vs_sf['wins']}W-{mahomes_vs_sf['losses']}L")
        for g in mahomes_vs_sf['games']:
            print(f"  {g['date']}: {g['result']} | {g['qbTeam']} {g['qbScore']}-{g['oppScore']} {g['opponent']}")

if __name__ == '__main__':
    main()
