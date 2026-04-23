#!/usr/bin/env python3
"""NFL Dashboard - Generación simple"""

import requests, json, os
from datetime import datetime

BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"

print("🔍 Obteniendo datos NFL...")

# Obtener equipos
r = requests.get(f"{BASE}/teams", timeout=10)
teams_data = r.json().get("sports", [{}])[0].get("leagues", [{}])[0].get("teams", [])

# Obtener scoreboard
r = requests.get(f"{BASE}/scoreboard", timeout=10)
sb = r.json()
season = sb.get("season", {}).get("year", "2025")
week = sb.get("week", {}).get("number", "?")

# Noticias
r = requests.get(f"{BASE}/news", timeout=10)
news = r.json().get("articles", [])[:6]

# Procesar equipos
teams = []
for t in teams_data:
    team = t.get("team", {})
    items = t.get("record", {}).get("items", [])
    
    wins = losses = 0
    if items:
        for s in items[0].get("stats", []):
            if s.get("name") == "wins": wins = int(s.get("value", 0))
            if s.get("name") == "losses": losses = int(s.get("value", 0))
    
    total = wins + losses
    win_pct = round(wins / total * 100, 1) if total > 0 else 0
    
    teams.append({
        "name": team.get("displayName", "?"),
        "abbr": team.get("abbreviation", "?"),
        "logo": team.get("logos", [{}])[0].get("href", "") if team.get("logos") else "",
        "color": team.get("color", "#333"),
        "wins": wins, "losses": losses,
        "win_pct": win_pct
    })

# Estadísticas
total_w = sum(t["wins"] for t in teams)
total_l = sum(t["losses"] for t in teams)
avg_wp = round(total_w / (total_w + total_l) * 100, 1) if (total_w + total_l) > 0 else 0
best = max(teams, key=lambda t: t["win_pct"]) if teams else {"name":"?","win_pct":0}

print(f"✅ {len(teams)} equipos procesados")

# Generar HTML
news_html = ""
for a in news:
    title = a.get("headline", "?")
    desc = a.get("description", "")[:150]
    url = a.get("links", {}).get("web", {}).get("href", "#")
    date = a.get("published", "")[:10]
    news_html += f"""
    <div class="news-card">
        <h4>{title}</h4>
        <p>{desc}...</p>
        <span class="date">{date}</span>
    </div>"""

teams_sorted = sorted(teams, key=lambda t: t["win_pct"], reverse=True)
table_rows = ""
for t in teams_sorted:
    bar = round(t["wins"] / (t["wins"] + t["losses"]) * 100) if (t["wins"] + t["losses"]) > 0 else 0
    table_rows += f"""
    <tr>
        <td><div class="team-info"><img class="team-logo" src="{t['logo']}" alt="{t['name']}">{t['name']}</div></td>
        <td>{t['wins']}</td>
        <td>{t['losses']}</td>
        <td>{t['win_pct']}%</td>
        <td><div class="win-bar" style="width:{bar}%"></div></td>
    </tr>"""

top10 = teams_sorted[:10]
top_labels = json.dumps([t["abbr"] for t in top10])
top_wp = json.dumps([t["win_pct"] for t in top10])
all_abbrs = json.dumps([t["abbr"] for t in teams])
all_wins = json.dumps([t["wins"] for t in teams])
all_colors = json.dumps([t["color"] for t in teams])

html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFL Analytics {season}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #0a0a1a; color: #fff; min-height: 100vh; }}
        .container {{ max-width: 1400px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                  padding: 30px; border-radius: 20px; margin-bottom: 30px; }}
        .header h1 {{ font-size: 2.5em; background: linear-gradient(45deg, #00d4ff, #7b2ff7);
                      -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .header .subtitle {{ color: #888; margin-top: 5px; }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }}
        .stat-card {{ background: #1a1a2e; padding: 25px; border-radius: 15px; text-align: center;
                     border: 1px solid rgba(255,255,255,0.05); }}
        .stat-card .num {{ font-size: 2.5em; font-weight: bold; background: linear-gradient(45deg, #00d4ff, #7b2ff7);
                          -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .stat-card .lbl {{ color: #888; margin-top: 5px; }}
        .charts {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }}
        .chart-box {{ background: #1a1a2e; padding: 20px; border-radius: 15px;
                     border: 1px solid rgba(255,255,255,0.05); }}
        .chart-box h3 {{ margin-bottom: 15px; color: #00d4ff; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ background: #16213e; padding: 12px; text-align: left; color: #00d4ff; }}
        td {{ padding: 12px; border-bottom: 1px solid #1a1a2e; }}
        tr:hover {{ background: rgba(0,212,255,0.05); }}
        .team-info {{ display: flex; align-items: center; gap: 10px; }}
        .team-logo {{ width: 28px; height: 28px; }}
        .win-bar {{ height: 8px; border-radius: 4px; background: linear-gradient(90deg, #00d4ff, #7b2ff7); }}
        .news-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }}
        .news-card {{ background: #1a1a2e; padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); }}
        .news-card h4 {{ color: #00d4ff; margin-bottom: 10px; }}
        .news-card p {{ color: #888; font-size: 0.9em; }}
        .news-card .date {{ color: #555; font-size: 0.8em; display: block; margin-top: 10px; }}
        @media (max-width: 768px) {{ .stats-grid {{ grid-template-columns: 1fr 1fr; }}
            .charts {{ grid-template-columns: 1fr; }} .news-grid {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏈 NFL Analytics {season}</h1>
            <div class="subtitle">Semana {week} · Análisis de Equipos · {len(teams)} Equipos</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card"><div class="num">{len(teams)}</div><div class="lbl">Equipos</div></div>
            <div class="stat-card"><div class="num">{total_w}</div><div class="lbl">Victorias</div></div>
            <div class="stat-card"><div class="num">{avg_wp}%</div><div class="lbl">Win % Promedio</div></div>
            <div class="stat-card"><div class="num">{best['abbr']}</div><div class="lbl">Mejor ({best['win_pct']}%)</div></div>
        </div>
        
        <div class="charts">
            <div class="chart-box">
                <h3>📊 Victorias por Equipo</h3>
                <canvas id="chartWins"></canvas>
            </div>
            <div class="chart-box">
                <h3>🏆 Top 10 Win %</h3>
                <canvas id="chartWinPct"></canvas>
            </div>
        </div>
        
        <div class="chart-box" style="margin-bottom:30px">
            <h3>📋 Todos los Equipos</h3>
            <table>
                <thead><tr><th>Equipo</th><th>W</th><th>L</th><th>Win%</th><th>Rendimiento</th></tr></thead>
                <tbody>{table_rows}</tbody>
            </table>
        </div>
        
        <div class="chart-box">
            <h3>📰 Noticias NFL</h3>
            <div class="news-grid">{news_html}</div>
        </div>
    </div>
    
    <script>
    new Chart(document.getElementById('chartWins'), {{
        type: 'bar',
        data: {{
            labels: {all_abbrs},
            datasets: [{{ label: 'Victorias', data: {all_wins},
                backgroundColor: {all_colors} + '88', borderColor: {all_colors}, borderWidth: 1 }}]
        }},
        options: {{ responsive: true, plugins: {{ legend: {{ labels: {{ color: '#fff' }} }} }},
            scales: {{ x: {{ ticks: {{ color: '#888' }} }}, y: {{ ticks: {{ color: '#888' }} }} }} }}
    }});
    
    new Chart(document.getElementById('chartWinPct'), {{
        type: 'doughnut',
        data: {{
            labels: {top_labels},
            datasets: [{{ data: {top_wp},
                backgroundColor: ['#00d4ff','#7b2ff7','#ff6b6b','#ffd93d','#6bcb77',
                                  '#4d96ff','#ffa94d','#74c0fc','#da77f2','#20c997'] }}]
        }},
        options: {{ responsive: true, plugins: {{ legend: {{ labels: {{ color: '#fff' }} }} }} }}
    }});
    </script>
</body>
</html>"""

output = "/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/dashboard.html"
os.makedirs(os.path.dirname(output), exist_ok=True)
with open(output, "w") as f:
    f.write(html)
print(f"✅ Dashboard guardado: {output}")
