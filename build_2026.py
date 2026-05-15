import json, re
from datetime import datetime

raw = """
AFC EAST
Buffalo Bills: 09/13 at Houston, 09/17 Detroit (Thu), 09/27 LA Chargers, 10/04 New England, 10/12 at LA Rams (Mon), 10/18 at Las Vegas, 10/25 BYE, 11/01 Baltimore, 11/09 at Minnesota (Mon), 11/15 at NY Jets, 11/22 Miami, 11/26 Kansas City (Thu), 12/06 at New England, 12/13 at Green Bay, 12/19 Chicago (Sat), 12/25 at Denver (Fri), 01/03 at Miami, 01/10 NY Jets
Miami Dolphins: 09/13 at Las Vegas, 09/20 at San Francisco, 09/27 Kansas City, 10/04 at Minnesota, 10/11 Cincinnati, 10/18 BYE, 10/25 at NY Jets, 11/01 New England, 11/08 Detroit, 11/15 at Indianapolis, 11/22 at Buffalo, 11/29 NY Jets, 12/06 at Denver, 12/13 Chicago, 12/20 at Green Bay, 12/27 LA Chargers, 01/03 Buffalo, 01/10 at New England
New England Patriots: 09/09 at Seattle (Wed), 09/20 Pittsburgh, 09/27 at Jacksonville, 10/04 at Buffalo, 10/11 Las Vegas, 10/18 NY Jets, 10/22 at Chicago (Thu), 11/01 at Miami, 11/08 Green Bay, 11/15 Detroit (Munich), 11/22 BYE, 11/29 at LA Chargers, 12/06 Buffalo, 12/10 Minnesota (Thu), 12/21 at Kansas City (Mon), 12/27 at NY Jets, 01/03 Denver, 01/10 Miami
New York Jets: 09/13 at Tennessee, 09/20 Green Bay, 09/27 at Detroit, 10/04 at Chicago, 10/11 Cleveland, 10/18 at New England, 10/25 Miami, 11/01 Las Vegas, 11/08 at Kansas City, 11/15 Buffalo, 11/22 at LA Chargers, 11/29 at Miami, 12/06 BYE, 12/13 Denver, 12/20 at Arizona, 12/27 New England, 01/03 Minnesota, 01/10 at Buffalo

AFC NORTH
Baltimore Ravens: 09/13 at Indianapolis, 09/20 New Orleans, 09/27 Dallas (Rio de Janeiro), 10/04 Tennessee, 10/11 at Atlanta, 10/18 at Cleveland, 10/25 Cincinnati, 11/01 at Buffalo, 11/05 Jacksonville (Thu), 11/16 LA Chargers (Mon), 11/22 at Carolina, 11/29 at Houston, 12/06 BYE, 12/13 Tampa Bay, 12/20 at Pittsburgh, 12/27 Cleveland, 12/31 at Cincinnati (Thu), 01/10 Pittsburgh
Cincinnati Bengals: 09/13 Tampa Bay, 09/20 at Houston, 09/27 at Pittsburgh, 10/04 Jacksonville, 10/11 at Miami, 10/18 BYE, 10/25 at Baltimore, 11/01 Tennessee, 11/08 Atlanta (Madrid), 11/15 Pittsburgh, 11/23 at Washington (Mon), 11/29 New Orleans, 12/06 at Cleveland, 12/13 Kansas City, 12/20 at Carolina, 12/31 Baltimore (Thu), 01/10 Cleveland
Cleveland Browns: 09/13 at Jacksonville, 09/20 at Tampa Bay, 09/27 Carolina, 10/01 Pittsburgh (Thu), 10/11 at NY Jets, 10/18 Baltimore, 10/25 at Tennessee, 11/01 at Pittsburgh, 11/08 at New Orleans, 11/15 Houston, 11/22 BYE, 11/29 Las Vegas, 12/06 Cincinnati, 12/13 Atlanta, 12/20 at NY Giants, 12/27 at Baltimore, 01/03 Indianapolis, 01/10 at Cincinnati
Pittsburgh Steelers: 09/13 Atlanta, 09/20 at New England, 09/27 Cincinnati, 10/01 at Cleveland (Thu), 10/11 Indianapolis, 10/18 at Tampa Bay, 10/25 New Orleans (Paris), 11/01 Cleveland, 11/08 BYE, 11/15 at Cincinnati, 11/22 at Philadelphia, 11/27 Denver (Fri), 12/06 Houston, 12/14 at Jacksonville (Mon), 12/20 Baltimore, 01/03 at Tennessee, 01/10 at Baltimore

AFC SOUTH
Houston Texans: 09/13 Buffalo, 09/20 Cincinnati, 09/27 at Indianapolis, 10/04 Dallas, 10/11 at Tennessee, 10/18 Jacksonville (Wembley), 10/25 NY Giants, 11/01 BYE, 11/08 at LA Chargers, 11/15 at Cleveland, 11/19 Indianapolis (Thu), 11/29 Baltimore, 12/06 at Pittsburgh, 12/13 at Washington, 12/20 Jacksonville, 12/24 at Philadelphia (Thu), 01/04 at Green Bay (Mon), 01/10 Tennessee
Indianapolis Colts: 09/13 Baltimore, 09/20 at Kansas City, 09/27 Houston, 10/04 Washington (Tottenham), 10/11 at Pittsburgh, 10/18 Tennessee, 10/25 at Minnesota, 11/01 at Jacksonville, 11/08 Dallas, 11/15 Miami, 11/19 at Houston (Thu), 11/29 NY Giants, 12/06 BYE, 12/13 at Philadelphia, 12/20 at Tennessee, 01/03 at Cleveland, 01/10 Jacksonville
Jacksonville Jaguars: 09/13 Cleveland, 09/20 at Denver, 09/27 New England, 10/04 at Cincinnati, 10/11 Philadelphia (Tottenham), 10/18 Houston (Wembley), 10/25 BYE, 11/01 Indianapolis, 11/05 at Baltimore (Thu), 11/15 at Tennessee, 11/22 at NY Giants, 11/29 Tennessee, 12/06 at Chicago, 12/14 Pittsburgh (Mon), 12/20 at Houston, 12/27 at Dallas, 01/10 at Indianapolis
Tennessee Titans: 09/13 NY Jets, 09/20 Philadelphia, 09/27 at NY Giants, 10/04 at Baltimore, 10/11 Houston, 10/18 at Indianapolis, 10/25 Cleveland, 11/01 at Cincinnati, 11/08 BYE, 11/15 Jacksonville, 11/22 at Dallas, 11/29 at Jacksonville, 12/06 Washington, 12/13 at Detroit, 12/20 Indianapolis, 12/27 at Las Vegas, 01/03 Pittsburgh, 01/10 at Houston

AFC WEST
Denver Broncos: 09/14 at Kansas City (Mon), 09/20 Jacksonville, 09/27 LA Rams, 10/04 at San Francisco, 10/11 at LA Chargers, 10/15 Seattle (Thu), 10/25 at Arizona, 11/01 Kansas City, 11/08 at Carolina, 11/15 BYE, 11/22 Las Vegas, 11/27 at Pittsburgh (Fri), 12/06 Miami, 12/13 at NY Jets, 12/20 at Las Vegas, 12/25 Buffalo (Fri), 01/03 at New England, 01/10 LA Chargers
Kansas City Chiefs: 09/14 Denver (Mon), 09/20 Indianapolis, 09/27 at Miami, 10/04 at Las Vegas, 10/11 BYE, 10/18 LA Chargers, 10/25 at Seattle, 11/01 at Denver, 11/08 NY Jets, 11/15 at Atlanta, 11/22 Arizona, 11/26 at Buffalo (Thu), 12/03 at LA Rams (Thu), 12/13 at Cincinnati, 12/21 New England (Mon), 12/27 San Francisco, 01/03 at LA Chargers, 01/10 Las Vegas
Las Vegas Raiders: 09/13 Miami, 09/20 at LA Chargers, 09/27 at New Orleans, 10/04 Kansas City, 10/11 at New England, 10/18 Buffalo, 10/25 LA Rams, 11/01 at NY Jets, 11/08 at San Francisco, 11/15 Seattle, 11/22 at Denver, 11/29 at Cleveland, 12/06 BYE, 12/13 LA Chargers, 12/20 Denver, 12/27 Tennessee, 01/03 at Arizona, 01/10 at Kansas City
LA Chargers: 09/13 Arizona, 09/20 Las Vegas, 09/27 at Buffalo, 10/04 at Seattle, 10/11 Denver, 10/18 at Kansas City, 10/25 BYE, 11/01 at LA Rams, 11/08 Houston, 11/16 at Baltimore (Mon), 11/22 NY Jets, 11/29 New England, 12/06 at Tampa Bay, 12/13 at Las Vegas, 12/17 San Francisco (Thu), 12/27 at Miami, 01/03 Kansas City, 01/10 at Denver

NFC EAST
Dallas Cowboys: 09/13 at NY Giants, 09/20 Washington, 09/27 Baltimore (Rio de Janeiro), 10/04 at Houston, 10/08 Tampa Bay (Thu), 10/18 at Green Bay, 10/26 at Philadelphia (Mon), 11/01 Arizona, 11/08 at Indianapolis, 11/15 San Francisco, 11/22 Tennessee, 11/26 Philadelphia (Thu), 12/07 at Seattle (Mon), 12/13 BYE, 12/20 at LA Rams, 12/27 Jacksonville, 01/03 NY Giants, 01/10 at Washington
NY Giants: 09/13 Dallas, 09/21 at LA Rams (Mon), 09/27 Tennessee, 10/04 Arizona, 10/11 at Washington, 10/18 New Orleans, 10/25 at Houston, 11/01 BYE, 11/08 at Philadelphia, 11/12 Washington (Thu), 11/22 Jacksonville, 11/29 at Indianapolis, 12/06 San Francisco, 12/13 at Seattle, 12/20 Cleveland, 12/28 at Detroit (Mon), 01/03 at Dallas, 01/10 Philadelphia
Philadelphia Eagles: 09/13 Washington, 09/20 at Tennessee, 09/28 at Chicago (Mon), 10/04 LA Rams, 10/11 Jacksonville (Tottenham), 10/18 Carolina, 10/26 Dallas (Mon), 11/01 at Washington, 11/08 NY Giants, 11/15 BYE, 11/22 Pittsburgh, 11/26 at Dallas (Thu), 12/06 at Arizona, 12/13 Indianapolis, 12/19 Seattle (Sat), 12/24 Houston (Thu), 01/03 at San Francisco, 01/10 at NY Giants
Washington Commanders: 09/13 at Philadelphia, 09/20 at Dallas, 09/27 Seattle, 10/04 Indianapolis (Tottenham), 10/11 NY Giants, 10/19 at San Francisco (Mon), 10/26 BYE, 11/01 Philadelphia, 11/08 LA Rams, 11/12 at NY Giants (Thu), 11/23 Cincinnati (Mon), 11/29 at Arizona, 12/06 at Tennessee, 12/13 Houston, 12/20 Atlanta, 12/27 at Minnesota, 01/02 at Jacksonville, 01/10 Dallas

NFC NORTH
Chicago Bears: 09/13 at LA Rams, 09/20 Seattle, 09/28 Philadelphia (Mon), 10/04 NY Jets, 10/11 at Carolina, 10/22 New England (Thu), 10/25 at San Francisco, 11/01 at Arizona, 11/08 BYE, 11/12 Carolina (Thu), 11/19 at Detroit (Thu), 11/26 at Green Bay (Thu), 12/06 Jacksonville, 12/13 at Miami, 12/19 at Buffalo (Sat), 12/27 Detroit, 01/03 Green Bay, 01/10 at Minnesota
Detroit Lions: 09/13 at Green Bay, 09/17 at Buffalo (Thu), 09/27 NY Jets, 10/04 at Minnesota, 10/11 BYE, 10/18 San Francisco, 10/25 at LA Rams, 11/01 Seattle, 11/08 at Miami, 11/15 New England (Munich), 11/19 Chicago (Thu), 11/26 at Minnesota (Thu), 12/06 at Green Bay, 12/13 Tennessee, 12/20 at San Francisco, 12/28 NY Giants (Mon), 01/03 at Chicago, 01/10 Minnesota (or 01/09)
Green Bay Packers: 09/13 Detroit, 09/20 at NY Jets, 09/27 at Minnesota, 10/04 Carolina, 10/11 at Tampa Bay, 10/18 Dallas, 10/25 BYE, 11/01 at Seattle, 11/08 at New England, 11/15 Minnesota, 11/22 at San Francisco, 11/26 Chicago (Thu), 12/06 Detroit, 12/13 Buffalo, 12/20 Miami, 12/27 at Chicago, 01/03 at Minnesota, 01/10 at Detroit
Minnesota Vikings: 09/13 at San Francisco, 09/20 at Chicago, 09/27 Green Bay, 10/04 Detroit, 10/11 BYE, 10/18 at LA Rams, 10/25 Indianapolis, 11/01 at Carolina, 11/09 Buffalo (Mon), 11/15 at Green Bay, 11/22 at Seattle, 11/26 Detroit (Thu), 12/10 at New England (Thu), 12/20 Seattle, 12/27 Washington, 01/03 at NY Jets, 01/10 Chicago

NFC SOUTH
Atlanta Falcons: 09/13 at Pittsburgh, 09/20 at Carolina, 09/27 New Orleans, 10/04 Tampa Bay, 10/11 Baltimore, 10/18 BYE, 10/25 Philadelphia (Paris), 11/01 Dallas (Atlanta), 11/08 Cincinnati (Madrid), 11/15 Kansas City, 11/22 at Tampa Bay, 11/29 at Carolina, 12/06 at New Orleans, 12/13 at Cleveland, 12/20 at Washington, 12/27 Las Vegas, 01/03 Carolina, 01/10 Tampa Bay
Carolina Panthers: 09/13 at New Orleans, 09/20 Atlanta, 09/27 at Cleveland, 10/04 at Green Bay, 10/11 Chicago, 10/18 at Philadelphia, 10/25 Arizona, 11/01 Minnesota, 11/08 Denver, 11/12 at Chicago (Thu), 11/22 Baltimore, 11/29 Atlanta, 12/06 BYE, 12/13 at Arizona, 12/20 Cincinnati, 12/27 at Tampa Bay, 01/03 at Atlanta, 01/10 New Orleans
New Orleans Saints: 09/13 Carolina, 09/20 at Baltimore, 09/27 Las Vegas, 10/04 BYE, 10/11 at Seattle, 10/18 at NY Giants, 10/25 Pittsburgh (Paris), 11/01 at Tampa Bay, 11/08 Cleveland, 11/15 Tampa Bay, 11/22 at LA Rams, 11/29 at Cincinnati, 12/06 Atlanta, 12/13 at Las Vegas, 12/20 at Minnesota, 12/27 Seattle, 01/03 at Arizona, 01/10 at Carolina
Tampa Bay Buccaneers: 09/13 at Cincinnati, 09/20 Cleveland, 09/27 at Atlanta, 10/04 at Dallas (Thu), 10/11 Green Bay, 10/18 Pittsburgh, 10/25 BYE, 11/01 New Orleans, 11/08 at Kansas City, 11/15 at New Orleans, 11/22 Atlanta, 11/29 at LA Rams, 12/06 LA Chargers, 12/13 at Baltimore, 12/20 at Dallas, 12/27 Carolina, 01/03 San Francisco, 01/10 at Atlanta

NFC WEST
Arizona Cardinals: 09/13 at LA Chargers, 09/20 San Francisco, 09/27 at Washington, 10/04 at NY Giants, 10/11 at San Francisco, 10/18 BYE, 10/25 Denver, 11/01 at Dallas, 11/08 Chicago, 11/15 at Seattle, 11/22 at Kansas City, 11/29 Washington, 12/06 Philadelphia, 12/13 Carolina, 12/20 NY Jets, 12/27 at LA Rams, 01/03 Las Vegas, 01/10 San Francisco (or 01/09)
LA Rams: 09/13 Chicago, 09/21 NY Giants (Mon), 09/27 at Denver, 10/04 at Philadelphia, 10/12 Buffalo (Mon), 10/18 Minnesota, 10/25 Detroit, 11/01 LA Chargers, 11/08 at Washington, 11/15 at Seattle, 11/22 New Orleans, 11/29 Tampa Bay, 12/03 Kansas City (Thu), 12/07 at San Francisco (Mon), 12/13 BYE, 12/20 Dallas, 12/27 Arizona, 01/03 Seattle (or 01/02), 01/10 at Seattle
San Francisco 49ers: 09/13 Minnesota, 09/20 at Miami, 09/27 at Seattle, 10/04 Denver, 10/11 Arizona, 10/15 at Seattle (Thu), 10/19 Washington (Mon), 10/25 Chicago, 11/01 at LA Rams, 11/08 Las Vegas, 11/15 at Dallas, 11/22 Green Bay, 11/29 BYE, 12/07 LA Rams (Mon), 12/13 at Arizona, 12/17 at LA Chargers (Thu), 12/27 at Kansas City, 01/03 Philadelphia, 01/10 at Arizona
Seattle Seahawks: 09/09 New England (Wed), 09/20 at Chicago, 09/27 at Washington, 10/04 LA Chargers, 10/11 New Orleans, 10/15 at Denver (Thu), 10/18 at San Francisco (Thu), 10/25 Kansas City, 11/01 at Detroit, 11/08 BYE, 11/15 at Las Vegas, 11/22 Minnesota, 11/29 at San Francisco, 12/07 Dallas (Mon), 12/13 NY Giants, 12/19 at Philadelphia (Sat), 12/20 at Minnesota, 12/27 at New Orleans, 01/03 at LA Rams, 01/10 LA Rams
"""

teams_abbr = {
    'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL',
    'Buffalo Bills': 'BUF', 'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI',
    'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE', 'Dallas Cowboys': 'DAL',
    'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
    'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC', 'Las Vegas Raiders': 'LV', 'LA Chargers': 'LAC',
    'LA Rams': 'LAR', 'Miami Dolphins': 'MIA', 'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'NY Giants': 'NYG',
    'NY Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT',
    'San Francisco 49ers': 'SF', 'Seattle Seahawks': 'SEA', 'Tampa Bay Buccaneers': 'TB',
    'Tennessee Titans': 'TEN', 'Washington Commanders': 'WSH'
}

month_map = {'09': 9, '10': 10, '11': 11, '12': 12, '01': 1}
day_map = {0:'Mon',1:'Tue',2:'Wed',3:'Thu',4:'Fri',5:'Sat',6:'Sun'}

games_data = {}

for line in raw.strip().split('\n'):
    line = line.strip()
    if not line or ':' not in line:
        continue
    if line.startswith(('AFC','NFC')):
        continue
    
    team_name = line.split(':')[0].strip()
    games_str = line.split(':', 1)[1].strip()
    
    abbr = teams_abbr.get(team_name)
    if not abbr:
        continue
    
    games = []
    for g in games_str.split(','):
        g = g.strip()
        if g == 'BYE':
            games.append({'bye': True})
            continue
        
        # Parse: "09/13 at Houston", "09/17 Detroit (Thu)", "01/10 at Baltimore (or 01/09)"
        parts = g.split()
        if not parts:
            continue
        
        date_str = parts[0]  # "09/13"
        
        if date_str == 'at' or not '/' in date_str:
            continue
        
        is_away = 'at' in g.lower()
        
        # Extract opponent name
        opp_start = 1 if is_away else 1
        opp_parts = []
        note = ''
        for p in parts[1:]:
            if p.lower() == 'at':
                continue
            if p.startswith('('):
                note = p.strip('()')
                # Maybe more notes after
                if note in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun','or'):
                    note = ''
                continue
            if p.lower() in ('amz','nfln','nbc','fox','cbs','espn','abc','netflix','prime'):
                note = p.upper()
                continue
            opp_parts.append(p)
        
        opponent = ' '.join(opp_parts)
        if not opponent:
            continue
        for tn, ta in teams_abbr.items():
            if tn.startswith(opponent) or opponent.startswith(tn.split()[-1]):
                opponent_abbr = ta
                break
        else:
            # Try matching with at
            if is_away and opp_parts and opp_parts[0][0].isupper():
                for tn, ta in teams_abbr.items():
                    if tn.startswith(' '.join(opp_parts)):
                        opponent_abbr = ta
                        break
                else:
                    opponent_abbr = opponent
            else:
                opponent_abbr = opponent
        
        games.append({
            'date': f"2026-{date_str.split('/')[0]}-{date_str.split('/')[1]}",
            'home': not is_away,
            'opponent': opponent_abbr if len(opponent_abbr) <= 4 else opponent,
            'note': note
        })
    
    games_data[abbr] = games

result = {'teams': [], 'games': []}
for team, abbr in sorted(teams_abbr.items(), key=lambda x: x[0]):
    result['teams'].append({'name': team, 'abbr': abbr})
    result['games'].extend([{**g, 'team': abbr} for g in games_data.get(abbr, [])])

with open('nfl_2026_schedule.json', 'w') as f:
    json.dump(result, f, indent=2)

print(f"✅ Generated schedule with {len(result['teams'])} teams and {len(result['games'])} games")
