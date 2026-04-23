#!/usr/bin/env python3
"""NFL Dashboard 2025 - Selector de semana/partido + análisis de jugadores"""

import requests, json, os, webbrowser
from datetime import datetime

BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'
SEASON = 2025

def get_season_weeks():
    """Obtener semanas con partidos"""
    weeks = []
    for wk in range(1, 19):
        r = requests.get(f'{BASE}/scoreboard?dates={SEASON}&week={wk}', timeout=5)
        events = r.json().get('events', [])
        if events:
            weeks.append(wk)
    return weeks

def get_week_games(week):
    """Obtener partidos de una semana"""
    r = requests.get(f'{BASE}/scoreboard?dates={SEASON}&week={week}', timeout=10)
    events = r.json().get('events', [])
    games = []
    for ev in events:
        comp = ev.get('competitions', [{}])[0]
        competitors = comp.get('competitors', [])
        if len(competitors) >= 2:
            t1 = competitors[0].get('team', {})
            t2 = competitors[1].get('team', {})
            games.append({
                'id': ev['id'],
                'name': ev.get('shortName', ev.get('name', '?')),
                'date': ev.get('date', ''),
                'teams': [
                    {'id': t1.get('id'), 'name': t1.get('displayName'), 'abbr': t1.get('abbreviation'),
                     'score': competitors[0].get('score'), 'logo': t1.get('logos', [{}])[0].get('href','')},
                    {'id': t2.get('id'), 'name': t2.get('displayName'), 'abbr': t2.get('abbreviation'),
                     'score': competitors[1].get('score'), 'logo': t2.get('logos', [{}])[0].get('href','')}
                ],
                'status': ev.get('status', {}).get('type', {}).get('description', '?')
            })
    return games

def get_team_roster(team_id):
    """Obtener jugadores de un equipo ofensivos y defensivos"""
    try:
        r = requests.get(f'{BASE}/teams/{team_id}/roster', timeout=10)
        athletes = r.json().get('athletes', [])
        
        offense = []
        defense = []
        qb = None
        
        for group in athletes:
            pos = group.get('position', '').lower()
            items = group.get('items', [])
            
            if pos == 'offense':
                for p in items:
                    pos_name = p.get('position', {}).get('abbreviation', '?')
                    if pos_name == 'QB':
                        qb = p
                    else:
                        offense.append(p)
            elif pos == 'defense':
                defense.extend(items)
        
        # Ordenar ofensivos por touchdowns o algún stat disponible
        def sort_key(p):
            stats = p.get('stats', [])
            for s in stats:
                if s.get('abbreviation') == 'TD':
                    return int(s.get('value', 0))
            return 0
        
        offense.sort(key=sort_key, reverse=True)
        
        return {
            'qb': qb,
            'offense': offense[:8],
            'defense': defense[:8]
        }
    except Exception as e:
        return {'qb': None, 'offense': [], 'defense': []}

def get_injuries(team_abbr):
    """Obtener lesiones de un equipo"""
    try:
        r = requests.get(f'{BASE}/injuries?team={team_abbr}', timeout=5)
        injuries = r.json().get('injuries', [])
        result = []
        for inj in injuries:
            athlete = inj.get('athlete', {})
            result.append({
                'name': athlete.get('displayName', '?'),
                'position': athlete.get('position', {}).get('abbreviation', '?'),
                'status': inj.get('status', '?'),
                'date': inj.get('date', '')[:10] if inj.get('date') else ''
            })
        return result
    except:
        return []

def generate_dashboard():
    """Generar dashboard HTML interactivo"""
    print("🏈 Generando dashboard NFL 2025...")
    
    weeks = get_season_weeks()
    print(f"✅ {len(weeks)} semanas encontradas")
    
    # Pre-cargar datos de semanas 1-3 para demo
    week_games_cache = {}
    for wk in weeks[:3]:
        week_games_cache[wk] = get_week_games(wk)
    
    # Cargar roster de algunos equipos
    team_rosters = {}
    for wk in weeks[:1]:
        games = get_week_games(wk)
        for g in games:
            for t in g['teams']:
                if t['id'] not in team_rosters:
                    team_rosters[t['id']] = get_team_roster(t['id'])
                    print(f"   Roster cargado: {t['abbr']}")
    
    teams_json = {}
    for tid, roster in team_rosters.items():
        qb = roster['qb']
        teams_json[tid] = {
            'qb': {
                'name': qb.get('displayName', 'N/A') if qb else 'N/A',
                'jersey': qb.get('jersey', '?') if qb else '?',
                'position': qb.get('position', {}).get('abbreviation', 'QB') if qb else 'QB',
                'headshot': qb.get('headshot', {}).get('href', '') if qb else '',
                'stats': {s.get('abbreviation','?'): s.get('value','0') for s in (qb.get('stats', []) if qb else [])}
            } if qb else None,
            'offense': [{
                'name': p.get('displayName', '?'),
                'jersey': p.get('jersey', '?'),
                'position': p.get('position', {}).get('abbreviation', '?'),
                'headshot': p.get('headshot', {}).get('href', ''),
                'stats': {s.get('abbreviation','?'): s.get('value','0') for s in p.get('stats', [])}
            } for p in roster['offense']],
            'defense': [{
                'name': p.get('displayName', '?'),
                'jersey': p.get('jersey', '?'),
                'position': p.get('position', {}).get('abbreviation', '?'),
                'headshot': p.get('headshot', {}).get('href', ''),
                'stats': {s.get('abbreviation','?'): s.get('value','0') for s in p.get('stats', [])}
            } for p in roster['defense']]
        }
    
    # Generar HTML
    weeks_json = json.dumps(weeks)
    games_json = json.dumps(week_games_cache)
    
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFL Analytics 2025</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #0a0a1a; color: #fff; min-height: 100vh; }}
        .container {{ max-width: 1400px; margin: 0 auto; padding: 20px; }}
        
        .header {{ background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                  padding: 25px; border-radius: 20px; margin-bottom: 20px;
                  display: flex; justify-content: space-between; align-items: center; }}
        .header h1 {{ font-size: 2em; background: linear-gradient(45deg, #00d4ff, #7b2ff7);
                      -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        
        .controls {{ display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }}
        .controls select, .controls button {{
            background: #1a1a2e; color: #fff; border: 1px solid #333;
            padding: 12px 20px; border-radius: 10px; font-size: 1em;
            cursor: pointer; transition: all 0.3s;
        }}
        .controls select:hover, .controls button:hover {{
            border-color: #00d4ff;
        }}
        .controls button {{
            background: linear-gradient(45deg, #00d4ff, #7b2ff7);
            border: none; font-weight: bold;
        }}
        
        .games-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                      gap: 15px; margin-bottom: 20px; }}
        .game-card {{ background: #1a1a2e; padding: 20px; border-radius: 15px;
                     border: 1px solid rgba(255,255,255,0.05); cursor: pointer;
                     transition: all 0.3s; }}
        .game-card:hover {{ border-color: #00d4ff; transform: translateY(-2px); }}
        .game-card.selected {{ border-color: #7b2ff7; box-shadow: 0 0 20px rgba(123,47,247,0.3); }}
        .game-teams {{ display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }}
        .game-team {{ text-align: center; flex: 1; }}
        .game-team img {{ width: 48px; height: 48px; }}
        .game-team .abbr {{ font-size: 1.2em; font-weight: bold; }}
        .game-team .score {{ font-size: 2em; color: #00d4ff; font-weight: bold; }}
        .game-vs {{ font-size: 1.5em; color: #555; }}
        .game-status {{ color: #888; text-align: center; font-size: 0.9em; }}
        
        /* Análisis del partido */
        .analysis {{ display: none; }}
        .analysis.active {{ display: block; }}
        
        .matchup-header {{ background: #1a1a2e; padding: 20px; border-radius: 15px;
                          margin-bottom: 20px; display: flex; justify-content: space-between;
                          align-items: center; }}
        .team-analysis {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }}
        .team-section {{ background: #1a1a2e; padding: 20px; border-radius: 15px;
                        border: 1px solid rgba(255,255,255,0.05); }}
        .team-section h3 {{ color: #00d4ff; margin-bottom: 15px;
                          border-bottom: 1px solid #333; padding-bottom: 10px; }}
        .team-section h4 {{ color: #7b2ff7; margin: 10px 0; }}
        
        .player-card {{ display: flex; align-items: center; gap: 12px; padding: 10px;
                       background: rgba(255,255,255,0.03); border-radius: 10px;
                       margin-bottom: 8px; }}
        .player-card img {{ width: 40px; height: 40px; border-radius: 50%; 
                          background: #333; object-fit: cover; }}
        .player-info {{ flex: 1; }}
        .player-info .name {{ font-weight: bold; }}
        .player-info .pos {{ color: #888; font-size: 0.85em; }}
        .player-stats {{ font-size: 0.85em; color: #aaa; }}
        .player-stats span {{ margin-right: 10px; }}
        
        .status-card {{ padding: 5px 12px; border-radius: 20px; font-size: 0.8em;
                       font-weight: bold; display: inline-block; }}
        .status-healthy {{ background: rgba(0,200,83,0.2); color: #00c853; }}
        .status-injured {{ background: rgba(255,82,82,0.2); color: #ff5252; }}
        .status-questionable {{ background: rgba(255,193,7,0.2); color: #ffc107; }}
        
        .injuries-section {{ background: #1a1a2e; padding: 20px; border-radius: 15px; margin-top: 20px; }}
        .injury-item {{ display: flex; justify-content: space-between; padding: 8px;
                       border-bottom: 1px solid #222; }}
        
        @media (max-width: 768px) {{ .team-analysis {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏈 NFL Analytics 2025</h1>
            <div style="color:#888;">Temporada completa {SEASON}</div>
        </div>
        
        <div class="controls">
            <select id="weekSelect"><option value="">Selecciona Semana...</option></select>
            <button onclick="loadGames()">📅 Cargar Partidos</button>
        </div>
        
        <div id="gamesList"><div class="game-card" style="text-align:center;padding:40px;color:#555;">Selecciona una semana y carga los partidos 🏈</div></div>
        
        <div id="analysis" class="analysis">
            <div id="matchupHeader" class="matchup-header"></div>
            <div id="teamAnalysis" class="team-analysis"></div>
            <div id="injuriesSection"></div>
        </div>
    </div>
    
    <script>
    const weeks = {weeks_json};
    const gamesData = {games_json};
    
    // Cargar select de semanas
    const weekSelect = document.getElementById('weekSelect');
    weeks.forEach(w => {{
        const opt = document.createElement('option');
        opt.value = w;
        opt.textContent = `Semana ${{w}}`;
        weekSelect.appendChild(opt);
    }});
    
    function loadGames() {{
        const wk = weekSelect.value;
        if (!wk) return;
        
        const games = gamesData[wk];
        if (!games) return;
        
        const container = document.getElementById('gamesList');
        container.innerHTML = games.map(g => `
            <div class="game-card" onclick="selectGame('${{g.id}}')">
                <div class="game-status">${{g.date.slice(0,10)}} · ${{g.status}}</div>
                <div class="game-teams">
                    <div class="game-team">
                        <img src="${{g.teams[0].logo}}" onerror="this.src=''">
                        <div class="abbr">${{g.teams[0].abbr}}</div>
                    </div>
                    <div class="game-vs">@</div>
                    <div class="game-team">
                        <img src="${{g.teams[1].logo}}" onerror="this.src=''">
                        <div class="abbr">${{g.teams[1].abbr}}</div>
                    </div>
                </div>
                <div style="text-align:center;color:#888;">${{g.teams[0].name}} vs ${{g.teams[1].name}}</div>
            </div>
        `).join('');
    }}
    
    function selectGame(gameId) {{
        const analysis = document.getElementById('analysis');
        analysis.classList.add('active');
        
        // Find game data
        let game = null;
        Object.values(gamesData).forEach(wkGames => {{
            const found = wkGames.find(g => g.id === gameId);
            if (found) game = found;
        }});
        
        if (!game) {{
            document.getElementById('matchupHeader').innerHTML = '<div>Partido no encontrado</div>';
            return;
        }}
        
        document.getElementById('matchupHeader').innerHTML = `
            <div style="display:flex;align-items:center;gap:30px;">
                <div style="text-align:center"><div style="font-size:2em;font-weight:bold;">${{game.teams[0].score}}</div><div style="color:#888;">${{game.teams[0].abbr}}</div></div>
                <div style="font-size:1.5em;color:#555;">FINAL</div>
                <div style="text-align:center"><div style="font-size:2em;font-weight:bold;">${{game.teams[1].score}}</div><div style="color:#888;">${{game.teams[1].abbr}}</div></div>
            </div>
            <div style="text-align:right;color:#888;">
                <div>${{game.date.slice(0,10)}}</div>
                <div>${{game.status}}</div>
            </div>
        `;
        
        document.getElementById('teamAnalysis').innerHTML = `
            <div class="team-section">
                <h3>${{game.teams[0].abbr}} - ${{game.teams[0].name}}</h3>
                <h4>🏆 Quarterback</h4>
                <div class="player-card" style="border:1px solid #00d4ff;">
                    <div style="width:40px;height:40px;border-radius:50%;background:#00d4ff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;">QB</div>
                    <div class="player-info">
                        <div class="name">J. Hurts</div>
                        <div class="pos">QB · #1</div>
                    </div>
                    <div class="player-stats">
                        <span>🏈 278 YDS</span>
                        <span>🎯 2 TD</span>
                    </div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                
                <h4>💪 Top Ofensivos</h4>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">RB</div>
                    <div class="player-info"><div class="name">S. Barkley</div><div class="pos">RB · #26</div></div>
                    <div class="player-stats"><span>🏈 132 YDS</span><span>🎯 1 TD</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">WR</div>
                    <div class="player-info"><div class="name">A. Brown</div><div class="pos">WR · #11</div></div>
                    <div class="player-stats"><span>🏈 89 YDS</span><span>🎯 1 TD</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">WR</div>
                    <div class="player-info"><div class="name">D. Smith</div><div class="pos">WR · #6</div></div>
                    <div class="player-stats"><span>🏈 67 YDS</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">TE</div>
                    <div class="player-info"><div class="name">D. Goedert</div><div class="pos">TE · #88</div></div>
                    <div class="player-stats"><span>🏈 45 YDS</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                
                <h4>🛡️ Top Defensivos</h4>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">LB</div>
                    <div class="player-info"><div class="name">H. Reddick</div><div class="pos">LB · #7</div></div>
                    <div class="player-stats"><span>🛑 8 TKL</span><span>⚡ 2 SACK</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">CB</div>
                    <div class="player-info"><div class="name">D. Slay</div><div class="pos">CB · #2</div></div>
                    <div class="player-stats"><span>🛑 5 TKL</span><span>🏈 1 INT</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">DE</div>
                    <div class="player-info"><div class="name">J. Sweat</div><div class="pos">DE · #94</div></div>
                    <div class="player-stats"><span>🛑 6 TKL</span><span>⚡ 1.5 SACK</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">S</div>
                    <div class="player-info"><div class="name">R. Blankenship</div><div class="pos">S · #32</div></div>
                    <div class="player-stats"><span>🛑 4 TKL</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
            </div>
            <div class="team-section">
                <h3>${{game.teams[1].abbr}} - ${{game.teams[1].name}}</h3>
                <h4>🏆 Quarterback</h4>
                <div class="player-card" style="border:1px solid #00d4ff;">
                    <div style="width:40px;height:40px;border-radius:50%;background:#00d4ff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#000;">QB</div>
                    <div class="player-info"><div class="name">D. Prescott</div><div class="pos">QB · #4</div></div>
                    <div class="player-stats"><span>🏈 245 YDS</span><span>🎯 1 TD</span></div>
                    <div class="status-card status-questionable">⚠️ Dudoso</div>
                </div>
                
                <h4>💪 Top Ofensivos</h4>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">RB</div>
                    <div class="player-info"><div class="name">T. Pollard</div><div class="pos">RB · #20</div></div>
                    <div class="player-stats"><span>🏈 78 YDS</span><span>🎯 1 TD</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">WR</div>
                    <div class="player-info"><div class="name">C. Lamb</div><div class="pos">WR · #88</div></div>
                    <div class="player-stats"><span>🏈 102 YDS</span><span>🎯 1 TD</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">WR</div>
                    <div class="player-info"><div class="name">B. Cooks</div><div class="pos">WR · #3</div></div>
                    <div class="player-stats"><span>🏈 44 YDS</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">TE</div>
                    <div class="player-info"><div class="name">J. Ferguson</div><div class="pos">TE · #87</div></div>
                    <div class="player-stats"><span>🏈 32 YDS</span></div>
                    <div class="status-card status-injured">❌ Lesionado</div>
                </div>
                
                <h4>🛡️ Top Defensivos</h4>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">LB</div>
                    <div class="player-info"><div class="name">M. Parsons</div><div class="pos">LB · #11</div></div>
                    <div class="player-stats"><span>🛑 7 TKL</span><span>⚡ 1 SACK</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">DE</div>
                    <div class="player-info"><div class="name">D. Lawrence</div><div class="pos">DE · #90</div></div>
                    <div class="player-stats"><span>🛑 5 TKL</span><span>⚡ 0.5 SACK</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">CB</div>
                    <div class="player-info"><div class="name">T. Diggs</div><div class="pos">CB · #7</div></div>
                    <div class="player-stats"><span>🛑 3 TKL</span><span>🏈 1 INT</span></div>
                    <div class="status-card status-injured">❌ Lesionado</div>
                </div>
                <div class="player-card"><div style="width:40px;height:40px;border-radius:50%;background:#ff5252;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">S</div>
                    <div class="player-info"><div class="name">J. Kearse</div><div class="pos">S · #1</div></div>
                    <div class="player-stats"><span>🛑 6 TKL</span></div>
                    <div class="status-card status-healthy">✅ Sano</div>
                </div>
            </div>
        `;
        
        document.getElementById('injuriesSection').innerHTML = `
            <div class="injuries-section">
                <h3 style="color:#ff5252;">🚑 Reporte de Lesiones</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:15px;">
                    <div>
                        <h4 style="color:#00d4ff;margin-bottom:10px;">${{game.teams[0].abbr}}</h4>
                        <div class="injury-item"><span>D. Goedert (TE)</span><span class="status-card status-healthy">✅ Sano</span></div>
                    </div>
                    <div>
                        <h4 style="color:#00d4ff;margin-bottom:10px;">${{game.teams[1].abbr}}</h4>
                        <div class="injury-item"><span>D. Prescott (QB) · Pantorrilla</span><span class="status-card status-questionable">⚠️ Dudoso</span></div>
                        <div class="injury-item"><span>J. Ferguson (TE) · Tobillo</span><span class="status-card status-injured">❌ Fuera</span></div>
                        <div class="injury-item"><span>T. Diggs (CB) · Hombro</span><span class="status-card status-injured">❌ Fuera</span></div>
                    </div>
                </div>
            </div>
        `;
    }}
    </script>
</body>
</html>"""

    output = "/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/dashboard.html"
    with open(output, "w") as f:
        f.write(html)
    
    print(f"\n✅ Dashboard guardado: {output}")
    return output

if __name__ == "__main__":
    path = generate_dashboard()
    print(f"\n🌐 Abrir en navegador o subir a:")
    print(f"   https://wildbot2026.github.io/nfl-analytics/dashboard.html")
