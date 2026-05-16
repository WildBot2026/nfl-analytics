#!/usr/bin/env python3
"""
Build comprehensive player stats from ESPN API for the NFL dashboard.
More efficient: fetches leaders by category from ESPN, then fetches team rosters.
"""
import urllib.request, json, time, sys

USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
BASE = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl'

def fetch_json(url, retries=2):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            resp = urllib.request.urlopen(req, timeout=15)
            return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)
            else:
                print(f"  Failed: {e}", file=sys.stderr)
    return None

def get_team_name(abbr):
    TEAMS = {
        'ARI':'Arizona Cardinals','ATL':'Atlanta Falcons','BAL':'Baltimore Ravens',
        'BUF':'Buffalo Bills','CAR':'Carolina Panthers','CHI':'Chicago Bears',
        'CIN':'Cincinnati Bengals','CLE':'Cleveland Browns','DAL':'Dallas Cowboys',
        'DEN':'Denver Broncos','DET':'Detroit Lions','GB':'Green Bay Packers',
        'HOU':'Houston Texans','IND':'Indianapolis Colts','JAX':'Jacksonville Jaguars',
        'KC':'Kansas City Chiefs','LAC':'Los Angeles Chargers','LAR':'Los Angeles Rams',
        'LV':'Las Vegas Raiders','MIA':'Miami Dolphins','MIN':'Minnesota Vikings',
        'NE':'New England Patriots','NO':'New Orleans Saints','NYG':'New York Giants',
        'NYJ':'New York Jets','PHI':'Philadelphia Eagles','PIT':'Pittsburgh Steelers',
        'SEA':'Seattle Seahawks','SF':'San Francisco 49ers','TB':'Tampa Bay Buccaneers',
        'TEN':'Tennessee Titans','WAS':'Washington Commanders'
    }
    return TEAMS.get(abbr, abbr)

def main():
    print("="*60)
    print("NFL 2024 Player Stats Builder (Efficient)")
    print("="*60)
    
    # Step 1: Get season type 2 leaders
    print("\n[1] Fetching leaders from ESPN API...")
    leaders_url = f"{BASE}/seasons/2024/types/2/leaders"
    leaders_data = fetch_json(leaders_url)
    
    if not leaders_data:
        print("ERROR: Cannot fetch leaders data")
        sys.exit(1)
    
    categories = leaders_data.get('categories', [])
    print(f"  Found {len(categories)} leader categories")
    
    # Step 2: Process all categories to extract top athletes
    print("\n[2] Extracting top athletes from categories...")
    athlete_map = {}  # athlete_ref -> {name, team, pos, stats_dict}
    team_rosters = {}  # team_abbr -> [athlete_refs]
    
    # We'll collect athletes from target categories
    target_cats = {
        'passingYards': {'limit': 32, 'cat_name': 'passing'},
        'passingTouchdowns': {'limit': 32, 'cat_name': 'passing'},
        'passerRating': {'limit': 32, 'cat_name': 'passing'},
        'rushingYards': {'limit': 32, 'cat_name': 'rushing'},
        'rushingTouchdowns': {'limit': 32, 'cat_name': 'rushing'},
        'receivingYards': {'limit': 64, 'cat_name': 'receiving'},
        'receivingTouchdowns': {'limit': 64, 'cat_name': 'receiving'},
        'receptions': {'limit': 64, 'cat_name': 'receiving'},
        'sacks': {'limit': 32, 'cat_name': 'defense'},
        'interceptions': {'limit': 32, 'cat_name': 'defense'},
        'totalTackles': {'limit': 32, 'cat_name': 'defense'},
        'passesDefended': {'limit': 32, 'cat_name': 'defense'},
        'tacklesForLoss': {'limit': 32, 'cat_name': 'defense'},
        'forcedFumbles': {'limit': 32, 'cat_name': 'defense'},
        'fieldGoalsMade': {'limit': 16, 'cat_name': 'kicking'},
        'puntingYards': {'limit': 16, 'cat_name': 'punting'},
    }
    
    processed_athletes = {}  # id -> set of categories processed
    
    for cat in categories:
        cat_name = cat.get('name', '')
        if cat_name not in target_cats:
            continue
        
        limit = target_cats[cat_name]['limit']
        cat_group = target_cats[cat_name]['cat_name']
        cat_leaders = cat.get('leaders', [])
        
        print(f"  [{cat_name}]: {len(cat_leaders)} leaders")
        
        for i, leader in enumerate(cat_leaders[:limit]):
            athlete_ref = leader.get('athlete', {}).get('$ref')
            team_ref = leader.get('team', {}).get('$ref')
            value = leader.get('displayValue', '0')
            
            if not athlete_ref:
                continue
            
            # Extract athlete ID from ref URL
            aid = athlete_ref.split('/athletes/')[-1].split('?')[0]
            
            if aid not in processed_athletes:
                processed_athletes[aid] = set()
            
            processed_athletes[aid].add(cat_name)
            
            # Store in athlete_map
            if aid not in athlete_map:
                # Basic info from athlete ref
                athlete_data = fetch_json(athlete_ref)
                if not athlete_data:
                    continue
                
                name = f"{athlete_data.get('firstName','')} {athlete_data.get('lastName','')}".strip()
                pos = athlete_data.get('position', {}).get('abbreviation', 'N/A')
                
                team_abbr = '?'
                if team_ref:
                    tdata = fetch_json(team_ref)
                    if tdata:
                        team_abbr = tdata.get('abbreviation', '?')
                
                athlete_map[aid] = {
                    'name': name,
                    'position': pos,
                    'teamAbbr': team_abbr,
                    'categories': {}
                }
                
                # Track team roster
                if team_abbr not in team_rosters:
                    team_rosters[team_abbr] = []
                team_rosters[team_abbr].append(aid)
            
            # Store the category value
            athlete_map[aid]['categories'][cat_name] = value
            
            time.sleep(0.15)
    
    print(f"\n  Total unique athletes: {len(athlete_map)}")
    print(f"  Teams represented: {len(team_rosters)}")
    
    # Step 3: Categorize into offense and defense
    print("\n[3] Categorizing players...")
    
    offense_players = []
    defense_players = []
    
    for aid, info in athlete_map.items():
        pos = info['position']
        team = get_team_name(info['teamAbbr'])
        
        entry = {
            'name': info['name'],
            'position': pos,
            'team': team,
            'teamAbbr': info['teamAbbr'],
            'stats': info['categories']
        }
        
        if pos in ('QB', 'RB', 'WR', 'TE', 'FB', 'OL', 'C', 'G', 'T', 'OT', 'OG', 'LS', 'P', 'K'):
            if pos in ('QB', 'RB', 'WR', 'TE', 'FB'):
                # Only include skill positions
                pass
            else:
                continue
            offense_players.append(entry)
        elif pos in ('LB', 'CB', 'S', 'DE', 'DT', 'DL', 'DB', 'NT', 'OLB', 'ILB', 'MLB', 'FS', 'SS', 'CB'):
            defense_players.append(entry)
    
    # Step 4: Also add players from rosters that we might be missing
    print("\n[4] Enriching with roster data...")
    
    # Load existing rosters to fill gaps
    try:
        with open('data/rosters.json') as f:
            rosters = json.load(f)
        
        # Team name -> abbreviation helper
        team_reverse = {v: k for k, v in get_team_name.__doc__.items()}
        
        for team_abbr, roster in rosters.items():
            if team_abbr not in team_rosters:
                team_rosters[team_abbr] = []
            
            for player in roster.get('off', []):
                pid = player.get('id', '')
                if pid in athlete_map:
                    continue
                
                name = player['name']
                pos = player.get('pos', player.get('espnPos', 'N/A'))
                
                if pos in ('QB', 'RB', 'WR', 'TE'):
                    entry = {
                        'name': name,
                        'position': pos,
                        'team': get_team_name(team_abbr),
                        'teamAbbr': team_abbr,
                        'stats': {}
                    }
                    offense_players.append(entry)
                    athlete_map[pid] = {'name': name}
                
                if pos in ('LB', 'CB', 'S', 'DE', 'DT', 'DL', 'DB', 'NT', 'OLB', 'ILB', 'MLB', 'FS', 'SS'):
                    entry = {
                        'name': name,
                        'position': pos,
                        'team': get_team_name(team_abbr),
                        'teamAbbr': team_abbr,
                        'stats': {}
                    }
                    defense_players.append(entry)
                    athlete_map[pid] = {'name': name}
        
        print(f"  Rosters loaded: {len(rosters)} teams")
    except Exception as e:
        print(f"  Warning: Could not load rosters: {e}")
    
    # Step 5: Save output
    print("\n[5] Saving data...")
    
    # Deduplicate by name
    seen_off = set()
    deduped_off = []
    for p in offense_players:
        key = f"{p['name']}_{p['team']}"
        if key not in seen_off:
            seen_off.add(key)
            deduped_off.append(p)
    
    seen_def = set()
    deduped_def = []
    for p in defense_players:
        key = f"{p['name']}_{p['team']}"
        if key not in seen_def:
            seen_def.add(key)
            deduped_def.append(p)
    
    with open('data/player_stats_offense.json', 'w') as f:
        json.dump(deduped_off, f, indent=2)
    print(f"  Saved {len(deduped_off)} offensive players")
    
    with open('data/player_stats_defense.json', 'w') as f:
        json.dump(deduped_def, f, indent=2)
    print(f"  Saved {len(deduped_def)} defensive players")
    
    # Summary
    print(f"\n  Offense by position:")
    pos_off = {}
    for p in deduped_off:
        pos_off[p['position']] = pos_off.get(p['position'], 0) + 1
    for pos, cnt in sorted(pos_off.items()):
        print(f"    {pos}: {cnt}")
    
    print(f"\n  Defense by position:")
    pos_def = {}
    for p in deduped_def:
        pos_def[p['position']] = pos_def.get(p['position'], 0) + 1
    for pos, cnt in sorted(pos_def.items()):
        print(f"    {pos}: {cnt}")
    
    print("\nDone!")

if __name__ == '__main__':
    main()
