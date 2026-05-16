#!/bin/bash
# 🦅 OTC Roster Update Script
# Scrapes OverTheCap via Tor, updates roster data, commits to GitHub
# Usage: ./update_otc_rosters.sh

set -e
cd /home/wild-ai/.openclaw/workspace/nfl_analytics

# Make sure Tor is running for SOCKS proxy
if ! curl -s --max-time 5 --socks5-hostname 127.0.0.1:9050 https://check.torproject.org/api/ip >/dev/null 2>&1; then
    echo "❌ Tor not running. Start with: sudo systemctl start tor"
    exit 1
fi

echo "🔄 Updating rosters from OverTheCap..."
python3 << 'PYEOF'
import json, re, time, sys
import requests

TEAMS = {
    'ARI':'arizona-cardinals','ATL':'atlanta-falcons','BAL':'baltimore-ravens',
    'BUF':'buffalo-bills','CAR':'carolina-panthers','CHI':'chicago-bears',
    'CIN':'cincinnati-bengals','CLE':'cleveland-browns','DAL':'dallas-cowboys',
    'DEN':'denver-broncos','DET':'detroit-lions','GB':'green-bay-packers',
    'HOU':'houston-texans','IND':'indianapolis-colts','JAX':'jacksonville-jaguars',
    'KC':'kansas-city-chiefs','LV':'las-vegas-raiders','LAC':'los-angeles-chargers',
    'LAR':'los-angeles-rams','MIA':'miami-dolphins','MIN':'minnesota-vikings',
    'NE':'new-england-patriots','NO':'new-orleans-saints','NYG':'new-york-giants',
    'NYJ':'new-york-jets','PHI':'philadelphia-eagles','PIT':'pittsburgh-steelers',
    'SEA':'seattle-seahawks','SF':'san-francisco-49ers','TB':'tampa-buccaneers',
    'TEN':'tennessee-titans','WAS':'washington-commanders'
}

proxies = {'http': 'socks5h://127.0.0.1:9050', 'https': 'socks5h://127.0.0.1:9050'}
headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'}

def extract_players(html):
    players = []
    seen = set()
    tables = re.findall(r'<table[^>]*class="[^"]*salary-cap-table[^"]*"[^>]*>.*?</table>', html, re.DOTALL)
    for table in tables:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.DOTALL)
        for row in rows:
            tds = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
            for td in tds:
                links = re.findall(r'<a[^>]*href="[^"]*"[^>]*>([^<]+)</a>', td)
                if links:
                    name = links[0].strip()
                    if name and len(name) > 2 and name not in seen:
                        seen.add(name)
                        cap = ''
                        for td2 in tds:
                            cm = re.search(r'\$[\d,]+', td2)
                            if cm: cap = cm.group(0); break
                        players.append({'name': name, 'cap': cap})
                        break
    return players

results = {}
done = 0
for abbr, slug in TEAMS.items():
    url = f'https://overthecap.com/salary-cap/{slug}'
    sys.stdout.write(f'{done+1}/32 {abbr}: ')
    sys.stdout.flush()
    try:
        r = requests.get(url, proxies=proxies, headers=headers, timeout=60)
        if r.status_code == 200:
            players = extract_players(r.text)
            results[abbr] = players
            sys.stdout.write(f'{len(players)} players\n')
        else:
            sys.stdout.write(f'HTTP {r.status_code}\n')
            results[abbr] = []
    except Exception as e:
        sys.stdout.write(f'Error: {str(e)[:40]}\n')
        results[abbr] = []
    done += 1
    sys.stdout.flush()
    time.sleep(2)

total = sum(len(p) for p in results.values())
ok = sum(1 for r in results.values() if r)
print(f'\n✅ {total} players across {ok}/32 teams')

with open('data/otc_rosters.json', 'w') as f:
    json.dump(results, f, indent=2)
print('✅ Saved to data/otc_rosters.json')
PYEOF

# Update the um3 data (merge positions from existing roster file)
echo "🔄 Merging positions..."
python3 << 'PYEOF'
import json

with open('data/otc_rosters.json') as f: OTC = json.load(f)
with open('data/rosters_complete.json') as f: R = json.load(f)

name_to_pos = {}
for abbr, td in R.items():
    plyrs = td.get('players', {})
    all_p = (plyrs.get('offense',[])or[]) + (plyrs.get('defense',[])or[]) + (plyrs.get('specialTeam',[])or[])
    for p in all_p:
        name = f"{p['firstName']} {p['lastName']}"
        if name not in name_to_pos:
            name_to_pos[name] = {'pos': p.get('position','?'), 'jersey': p.get('jersey',''), 'age': p.get('age','')}

TP = {}
for abbr, players in OTC.items():
    by_pos = {'QB':[],'WR':[],'RB':[],'TE':[],'LB':[],'CB':[],'S':[]}
    for p in players:
        pi = name_to_pos.get(p['name'], {})
        pos = pi.get('pos', '?')
        if pos in by_pos:
            by_pos[pos].append({'name':p['name'],'cap':p['cap'],'jersey':pi.get('jersey',''),'age':pi.get('age','')})
    def fmt(ps): return [{'name':p['name'],'cap':p['cap'],'jersey':p['jersey'],'age':p['age']} for p in ps]
    TP[abbr] = {
        'QBs': [p['name'] for p in by_pos['QB'][:3]],
        'WRs': fmt(by_pos['WR'][:3]), 'RBs': fmt(by_pos['RB'][:2]),
        'TEs': fmt(by_pos['TE'][:2]), 'LBs': fmt(by_pos['LB'][:4]),
        'CBs': fmt(by_pos['CB'][:2]), 'Ss': fmt(by_pos['S'][:2])
    }

with open('data/um3_data.json', 'r') as f:
    um3 = json.load(f)
um3['TP'] = TP
with open('data/um3_data.json', 'w') as f:
    json.dump(um3, f)

total_pos = sum(len(TP[a]['QBs'])+len(TP[a]['WRs'])+len(TP[a]['RBs'])+len(TP[a]['TEs'])+len(TP[a]['LBs'])+len(TP[a]['CBs'])+len(TP[a]['Ss']) for a in TP)
print(f'✅ Positions merged for {total_pos} players')
PYEOF

# Commit and push
echo "🔄 Committing and pushing to GitHub..."
git add data/otc_rosters.json data/um3_data.json
git commit -m "OTC rosters weekly update: $(date +%Y-%m-%d)" || echo "No changes to commit"
git push

echo "✅ OTC rosters updated and deployed!"
echo "📊 See it at: https://wildbot2026.github.io/nfl-analytics/"
