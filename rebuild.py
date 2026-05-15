import json
random.seed(42)

# Load new games
with open('/tmp/nfl_final_games.json') as f:
    new_games = json.load(f)['games']

# Load existing nfl_data
with open('/tmp/nfl_data.json') as f:
    data = json.load(f)

# Replace games array
data['games'] = new_games

# Verify games are 2026 dates
dates = set()
for g in new_games:
    dates.add(g[5])
print("Dates:", sorted(dates))

# Save back
with open('/tmp/nfl_data.json', 'w') as f:
    json.dump(data, f)

print("Saved /tmp/nfl_data.json with", len(new_games), "games")
print("All 2026:", all('2026' in g[5] or '2027' in g[5] for g in new_games))
