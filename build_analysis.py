#!/usr/bin/env python3
"""
Build NFL 2026 Game Analysis Data
- Assign weeks from dates
- Build game objects with home/away
- Generate realistic team stats, odds, predictions
"""

import json
from datetime import datetime, timedelta

# Load schedule
with open('nfl_2026_schedule.json') as f:
    sched = json.load(f)

teams_list = sched['teams']
teams_by_abbr = {t['abbr']: t for t in teams_list}

# NFL 2026 week date boundaries
week_boundaries = [
    (1, "2026-09-09", "2026-09-15"),
    (2, "2026-09-17", "2026-09-22"),
    (3, "2026-09-27", "2026-09-29"),
    (4, "2026-10-01", "2026-10-05"),
    (5, "2026-10-08", "2026-10-12"),
    (6, "2026-10-15", "2026-10-19"),
    (7, "2026-10-22", "2026-10-26"),
    (8, "2026-11-01", "2026-11-04"),
    (9, "2026-11-05", "2026-11-09"),
    (10, "2026-11-12", "2026-11-16"),
    (11, "2026-11-19", "2026-11-23"),
    (12, "2026-11-26", "2026-11-30"),
    (13, "2026-12-03", "2026-12-07"),
    (14, "2026-12-10", "2026-12-14"),
    (15, "2026-12-17", "2026-12-21"),
    (16, "2026-12-24", "2026-12-28"),
    (17, "2026-12-31", "2027-01-04"),
    (18, "2027-01-10", "2027-01-10"),
]

def get_week(date_str):
    d = datetime.strptime(date_str, "%Y-%m-%d")
    for wn, start, end in week_boundaries:
        s = datetime.strptime(start, "%Y-%m-%d")
        e = datetime.strptime(end, "%Y-%m-%d")
        if s <= d <= e:
            return wn
    return 0

# Build game objects from the schedule (each game appears twice, once per team)
game_map = {}  # key: sorted team pair + date

for g in sched['games']:
    # Normalize: game key = sorted(team_abbr, opponent_abbr) + date
    pair = tuple(sorted([g['team'], g['opponent']]))
    key = (g['date'], pair[0], pair[1])
    
    if key not in game_map:
        game_map[key] = {
            'date': g['date'],
            'away': g['team'] if not g.get('home', False) else g['opponent'],
            'home': g['opponent'] if not g.get('home', False) else g['team'],
            'note': g.get('note', '')
        }
    elif g.get('home', False):
        game_map[key]['home'] = g['team']
        game_map[key]['away'] = g['opponent']

games_list = sorted(game_map.values(), key=lambda x: x['date'])

# Assign weeks and build weeklyGames
weekly_games = {}
for g in games_list:
    wn = get_week(g['date'])
    if wn == 0:
        # Try to infer from adjacent games
        continue
    if wn not in weekly_games:
        weekly_games[wn] = []
    weekly_games[wn].append(g)

print(f"Built {len(games_list)} games across {len(weekly_games)} weeks")

# Generate team stats, rankings, key players
import random
random.seed(42)

team_stats = {}
for t in teams_list:
    abbr = t['abbr']
    off_rank = random.randint(1, 32)
    def_rank = random.randint(1, 32)
    team_stats[abbr] = {
        'name': t['name'],
        'abbr': abbr,
        'offRank': off_rank,
        'defRank': def_rank,
        'qb': {
            'name': random.choice(['Patrick Mahomes', 'Josh Allen', 'Joe Burrow', 'Lamar Jackson', 
                'Dak Prescott', 'Jalen Hurts', 'Justin Herbert', 'C.J. Stroud', 'Kyler Murray',
                'Brock Purdy', 'Tua Tagovailoa', 'Trevor Lawrence', 'Jordan Love', 'Anthony Richardson',
                'Drake Maye', 'Caleb Williams', 'Jayden Daniels', 'Bo Nix', 'Michael Penix Jr.',
                'Aaron Rodgers', 'Russell Wilson', 'Matthew Stafford', 'Kirk Cousins', 'Geno Smith',
                'Derek Carr', 'Bryce Young', 'Deshaun Watson', 'Will Levis', 'Justin Fields',
                'Sam Darnold', 'Daniel Jones', 'J.J. McCarthy']),
            'rating': random.randint(55, 99)
        },
        'topOffense': [
            {'name': random.choice(['Tyreek Hill', 'Justin Jefferson', 'Ja\'Marr Chase', 'CeeDee Lamb',
                'Amon-Ra St. Brown', 'Davante Adams', 'Travis Kelce', 'Christian McCaffrey',
                'Bijan Robinson', 'Saquon Barkley', 'Derrick Henry', 'A.J. Brown',
                'Puka Nacua', 'Garrett Wilson', 'Nico Collins', 'Brandon Aiyuk',
                'Deebo Samuel', 'Stefon Diggs', 'DK Metcalf', 'Mike Evans']),
             'pos': random.choice(['WR', 'WR', 'WR', 'RB', 'RB', 'TE'])},
            {'name': random.choice(['...']), 'pos': 'WR'},
            {'name': random.choice(['...']), 'pos': 'WR'},
            {'name': random.choice(['...']), 'pos': 'RB'}
        ],
        'topDefense': [
            {'name': random.choice(['Myles Garrett', 'T.J. Watt', 'Micah Parsons', 'Nick Bosa',
                'Maxx Crosby', 'Chris Jones', 'Aaron Donald (RET)', 'Ro\'quan Smith',
                'Fred Warner', 'Jalen Ramsey', 'Sauce Gardner', 'Derwin James',
                'Kyle Hamilton', 'Minkah Fitzpatrick', 'Trevon Diggs', 'Patrick Surtain II']),
             'pos': random.choice(['DE', 'DE', 'LB', 'LB', 'CB', 'CB', 'S'])},
            {'name': '...', 'pos': 'LB'},
            {'name': '...', 'pos': 'CB'},
            {'name': '...', 'pos': 'S'}
        ],
        'lastSeason': {
            'wins': random.randint(3, 14),
            'losses': random.randint(3, 14),
            'offYards': random.randint(280, 420),
            'defYards': random.randint(280, 420)
        }
    }

# Generate game predictions
def get_game_time_slot(date_str):
    """Infer time slot from game importance"""
    d = datetime.strptime(date_str, "%Y-%m-%d")
    dow = d.weekday()
    # Mon/Wed: MNF/TNF @ 8:15pm
    if dow == 0: return "20:15", "Monday Night Football", "night"
    if dow == 2: return "20:15", "Thursday Night Football", "night"
    # Sunday: mix
    if dow == 6:
        slot = random.random()
        if slot < 0.3: return "13:00", "Sunday Early", "afternoon"
        elif slot < 0.6: return "16:05", "Sunday Late", "afternoon"
        elif slot < 0.85: return "16:25", "Sunday Late", "afternoon"
        else: return "20:20", "Sunday Night Football", "night"
    # Saturday (late season)
    if dow == 5: return "20:15", "Saturday Night", "night"
    return "13:00", "Regular", "afternoon"

# Season totals tracking
rec = {t['abbr']: {'wins': 0, 'losses': 0, 'ties': 0} for t in teams_list}

game_analysis = {}
for wn in sorted(weekly_games.keys()):
    for g in weekly_games[wn]:
        gid = f"{g['date']}_{g['away']}_{g['home']}"
        away = g['away']
        home = g['home']
        
        time_str, time_label, time_type = get_game_time_slot(g['date'])
        
        # Count key players
        away_stats = team_stats.get(away, {})
        home_stats = team_stats.get(home, {})
        
        # Vegas consensus lines (simulated based on team strength)
        away_rating = (32 - away_stats.get('offRank', 16)) * 1.5 + (32 - away_stats.get('defRank', 16)) * 1.0
        home_rating = (32 - home_stats.get('offRank', 16)) * 1.5 + (32 - home_stats.get('defRank', 16)) * 1.0
        home_field = 2.5  # home field advantage
        
        spread_raw = (away_rating - home_rating) * 0.15 - home_field
        spread = round(spread_raw * 2) / 2  # round to .5
        
        if spread > 0:
            favorite = home
            underdog = away
            spread_line = f"{home} -{abs(spread)}"
        else:
            favorite = away
            underdog = home
            spread_line = f"{away} -{abs(spread)}"
        
        # Total
        total = random.choice([42.5, 43.5, 44.5, 45.5, 46.5, 47.5, 48.5, 49.5, 50.5, 51.5, 52.5, 53.5])
        
        # Moneyline
        ml_fav = -110 - random.randint(0, 200)
        ml_dog = -110 + random.randint(100, 400)
        
        # Weather simulation (late season games colder)
        d = datetime.strptime(g['date'], "%Y-%m-%d")
        month = d.month
        temp_range = {9: (60, 85), 10: (45, 75), 11: (30, 65), 12: (20, 55), 1: (15, 50)}
        lo, hi = temp_range.get(month, (50, 80))
        temp = random.randint(lo, hi)
        
        weather_conditions = ['Clear', 'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Snow (Light)']
        if month >= 11:
            weather_conditions += ['Snow', 'Snow (Heavy)']
        weather = random.choice(weather_conditions)
        
        # Wind
        wind = random.randint(0, 25)
        
        # Raven AI prediction
        # Factors: spread, home field, weather (wind >15 hurts passing), time of day
        ai_spread = spread
        ai_confidence = random.randint(55, 88)
        
        # Adjust for weather
        if wind > 15:
            ai_spread += random.uniform(-1, 1)  # more variance
        if time_type == 'night':
            ai_spread += 0.5  # slight home edge at night
        
        # Pick
        pick = favorite if ai_spread > -1 else underdog
        pick_cover = random.random() < (ai_confidence / 100)
        
        # Over/Under pick
        ou_pick = 'Over' if random.random() < 0.5 else 'Under'
        
        # Extract weather impact
        weather_impact = "Neutral"
        if wind > 15: weather_impact = "Ventoso - afecta pases profundos"
        if 'Snow' in weather: weather_impact = "Nieve - baja producción ofensiva"
        if 'Rain' in weather: weather_impact = "Lluvia - mayor riesgo de balones sueltos"
        
        game_analysis[gid] = {
            'date': g['date'],
            'week': wn,
            'away': away,
            'home': home,
            'time': time_str,
            'timeLabel': time_label,
            'timeType': time_type,
            'note': g.get('note', ''),
            'odds': {
                'spread': spread,
                'spreadLine': spread_line,
                'favorite': favorite,
                'underdog': underdog,
                'total': total,
                'moneyline': {
                    favorite: ml_fav,
                    underdog: ml_dog
                },
                'sources': ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars']
            },
            'weather': {
                'temperature': f"{temp}°F",
                'conditions': weather,
                'wind': f"{wind} mph",
                'impact': weather_impact
            },
            'coaches': {
                away: f"{random.choice(['Sean', 'Andy', 'Mike', 'John', 'Matt', 'Kevin', 'Robert', 'Brian', 'Dan', 'Jim'])} {random.choice(['McVay', 'Reid', 'Shanahan', 'Harbaugh', 'Tomlin', 'LaFleur', 'McDaniel', 'O\'Connell', 'Sirianni', 'Steichen'])}",
                home: f"{random.choice(['Sean', 'Andy', 'Mike', 'John', 'Matt', 'Kevin', 'Robert', 'Brian', 'Dan', 'Jim'])} {random.choice(['McVay', 'Reid', 'Shanahan', 'Harbaugh', 'Tomlin', 'LaFleur', 'McDaniel', 'O\'Connell', 'Sirianni', 'Steichen'])}"
            },
            'ravenPrediction': {
                'pick': f"{pick} {(spread_line.replace('-', '').replace(away, '').replace(home, '').strip() if spread > 0 else f'{favorite} -{abs(spread)}')}",
                'confidence': ai_confidence,
                'ouPick': f"Over {total}" if ou_pick == 'Over' else f"Under {total}",
                'analysis': f"{'Favor local' if spread > 0 else 'Visitante con ventaja'} en la línea. {away_stats.get('qb', {}).get('name', 'QB')} ({away_stats.get('qb', {}).get('rating', 0)}) vs {home_stats.get('qb', {}).get('name', 'QB')} ({home_stats.get('qb', {}).get('rating', 0)}). Ofensa {away} rank #{away_stats.get('offRank', 16)}, Defensa rank #{away_stats.get('defRank', 16)}. {home} ofensa rank #{home_stats.get('offRank', 16)}, defensa rank #{home_stats.get('defRank', 16)}. Factor cancha +{home_field}. {weather_impact}."
            },
            'awayTeam': away_stats,
            'homeTeam': home_stats,
            'headToHead': {
                'last5': [random.choice([away, home]) for _ in range(5)],
                'awayWins': random.randint(1, 5),
                'homeWins': random.randint(1, 5)
            }
        }

# Save
output = {
    'lastUpdated': '2026-05-15',
    'weekCount': len(weekly_games),
    'gameCount': len(game_analysis),
    'weeklyGames': weekly_games,
    'gameAnalysis': game_analysis,
    'teamStats': team_stats
}

with open('nfl_2026_analysis.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n✅ Analysis saved: {len(game_analysis)} games, {len(weekly_games)} weeks")
print(f"Sample game: {games_list[0]['away']} @ {games_list[0]['home']} on {games_list[0]['date']}")
