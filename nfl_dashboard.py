#!/usr/bin/env python3
"""
NFL Analytics Dashboard Generator
Genera un dashboard HTML moderno con datos NFL y análisis de apuestas
"""

import requests, json, os
from datetime import datetime

BASE_ESPN = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"

class NFLAnalytics:
    def __init__(self):
        self.data = {}
    
    def fetch_all(self):
        """Obtener todos los datos NFL"""
        print("🔍 Obteniendo datos NFL...")
        
        # Equipos
        r = requests.get(f"{BASE_ESPN}/teams", timeout=10)
        self.data["teams"] = r.json() if r.status_code == 200 else {}
        
        # Scoreboard
        r = requests.get(f"{BASE_ESPN}/scoreboard", timeout=10)
        self.data["scoreboard"] = r.json() if r.status_code == 200 else {}
        
        # Noticias
        r = requests.get(f"{BASE_ESPN}/news", timeout=10)
        self.data["news"] = r.json() if r.status_code == 200 else {}
        
        # Standings (conferencias)
        r = requests.get(f"{BASE_ESPN}/standings", timeout=10)
        self.data["standings"] = r.json() if r.status_code == 200 else {}
        
        print(f"✅ Datos obtenidos: {len(self.data.get('teams',{}).get('sports',[]))} deportes")
        return self.data
    
    def generate_html(self):
        """Generar dashboard HTML"""
        teams_data = self.data.get("teams", {}).get("sports", [{}])[0].get("leagues", [{}])[0].get("teams", [])
        scoreboard = self.data.get("scoreboard", {})
        news = self.data.get("news", {}).get("articles", [])
        season = scoreboard.get("season", {}).get("year", "2025")
        week = scoreboard.get("week", {}).get("number", "?")
        
        # Generar datos de equipos para JS
        teams_js = []
        for t in teams_data:
            team = t.get("team", {})
            record = t.get("record", {}).get("items", [{}])[0] if t.get("record", {}).get("items") else {}
            stats = t.get("record", {}).get("items", [{}])[0].get("stats", []) if t.get("record", {}).get("items") else []
            
            wins = sum(1 for s in stats if s.get("name") == "wins")
            losses = sum(1 for s in stats if s.get("name") == "losses")
            win_pct = 0
            
            for s in stats:
                if s.get("name") == "wins":
                    wins = int(s.get("value", 0))
                elif s.get("name") == "losses":
                    losses = int(s.get("value", 0))
            
            total = wins + losses
            win_pct = round(wins / total * 100, 1) if total > 0 else 0
            
            teams_js.append({
                "name": team.get("displayName", "?"),
                "abbr": team.get("abbreviation", "?"),
                "logo": team.get("logos", [{}])[0].get("href", "") if team.get("logos") else "",
                "color": team.get("color", "#333"),
                "wins": wins,
                "losses": losses,
                "win_pct": win_pct,
                "conference": team.get("conferenceId", "?")
            })
        
        # Generar noticias
        news_html = ""
        for article in news[:6]:
            title = article.get("headline", "?")
            desc = article.get("description", "")[:150]
            url = article.get("links", {}).get("web", {}).get("href", "#")
            date = article.get("published", "")
            news_html += f"""
            <div class="news-card">
                <h4>{title}</h4>
                <p>{desc}...</p>
                <span class="date">{date[:10] if date else ''}</span>
            </div>
            """
        
        # Generar tabla de equipos
        teams_js_json = json.dumps(teams_js)
        
        html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFL Analytics - Temporada {season}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #0a0a1a; color: #fff; min-height: 100vh; }}
        .container {{ max-width: 1400px; margin: 0 auto; padding: 20px; }}
        
        /* Header */
        .header {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                  padding: 30px; border-radius: 20px; margin-bottom: 30px;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.3); }}
        .header h1 {{ font-size: 2.5em; background: linear-gradient(45deg, #00d4ff, #7b2ff7);
                      -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .header .subtitle {{ color: #888; font-size: 1.1em; margin-top: 5px; }}
        
        /* Stats Grid */
        .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                      gap: 20px; margin-bottom: 30px; }}
        .stat-card {{ background: linear-gradient(135deg, #1a1a2e, #16213e);
                     padding: 25px; border-radius: 15px; text-align: center;
                     border: 1px solid rgba(255,255,255,0.05); }}
        .stat-card .number {{ font-size: 2.5em; font-weight: bold;
                             background: linear-gradient(45deg, #00d4ff, #7b2ff7);
                             -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .stat-card .label {{ color: #888; margin-top: 5px; }}
        
        /* Charts */
        .chart-container {{ background: #1a1a2e; padding: 20px; border-radius: 15px;
                          margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05); }}
        .chart-row {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
        
        /* Teams Table */
        .teams-section {{ margin-top: 30px; }}
        .teams-table {{ width: 100%; border-collapse: collapse; }}
        .teams-table th {{ background: #16213e; padding: 12px; text-align: left;
                         color: #00d4ff; font-weight: 600; }}
        .teams-table td {{ padding: 12px; border-bottom: 1px solid #1a1a2e; }}
        .teams-table tr:hover {{ background: rgba(0,212,255,0.05); }}
        .team-info {{ display: flex; align-items: center; gap: 10px; }}
        .team-logo {{ width: 30px; height: 30px; object-fit: contain; }}
        .win-bar {{ height: 6px; border-radius: 3px;
                    background: linear-gradient(90deg, #00d4ff, #7b2ff7);
                    transition: width 0.5s; }}
        
        /* News */
        .news-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                     gap: 20px; margin-top: 20px; }}
        .news-card {{ background: #1a1a2e; padding: 20px; border-radius: 15px;
                     border: 1px solid rgba(255,255,255,0.05); }}
        .news-card h4 {{ color: #00d4ff; margin-bottom: 10px; }}
        .news-card p {{ color: #888; font-size: 0.9em; }}
        .news-card .date {{ color: #555; font-size: 0.8em; margin-top: 10px; display: block; }}
        
        @media (max-width: 768px) {{ .chart-row {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏈 NFL Analytics {season}</h1>
            <div class="subtitle">Semana {week} · Análisis de Equipos · Predicciones · Apuestas</div>
        </div>
        
        <!-- Stats -->
        <div class="stats-grid" id="statsGrid"></div>
        
        <!-- Charts -->
        <div class="chart-row">
            <div class="chart-container">
                <h3>📊 Record por Equipo</h3>
                <canvas id="winsChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>🏆 Win % por Equipo</h3>
                <canvas id="winPctChart"></canvas>
            </div>
        </div>
        
        <!-- Teams Table -->
        <div class="teams-section">
            <div class="chart-container">
                <h3>📋 Todos los Equipos</h3>
                <table class="teams-table">
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>Victorias</th>
                            <th>Derrotas</th>
                            <th>Win %</th>
                            <th>Rendimiento</th>
                        </tr>
                    </thead>
                    <tbody id="teamsBody"></tbody>
                </table>
            </div>
        </div>
        
        <!-- News -->
        <div class="teams-section">
            <div class="chart-container">
                <h3>📰 Últimas Noticias NFL</h3>
                <div class="news-grid">
                    {news_html}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const teams = {teams_js_json};
        
        // Stats Grid
        const totalWins = teams.reduce((a, t) => a + t.wins, 0);
        const totalLosses = teams.reduce((a, t) => a + t.losses, 0);
        const avgWinPct = (totalWins / (totalWins + totalLosses) * 100).toFixed(1);
        const bestTeam = teams.reduce((a, t) => t.win_pct > a.win_pct ? t : a, teams[0]);
        
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="number">32</div><div class="label">Equipos</div></div>
            <div class="stat-card"><div class="number">{totalWins}</div><div class="label">Victorias Totales</div></div>
            <div class="stat-card"><div class="number">{avgWinPct}%</div><div class="label">Win % Promedio</div></div>
            <div class="stat-card"><div class="number">{bestTeam.abbr}</div><div class="label">Mejor Equipo ({bestTeam.win_pct}%)</div></div>
        `;
        
        // Wins Chart
        new Chart(document.getElementById('winsChart'), {{
            type: 'bar',
            data: {{
                labels: teams.map(t => t.abbr),
                datasets: [{{
                    label: 'Victorias',
                    data: teams.map(t => t.wins),
                    backgroundColor: teams.map(t => t.color + '88'),
                    borderColor: teams.map(t => t.color),
                    borderWidth: 1
                }}]
            }},
            options: {{ 
                responsive: true,
                plugins: {{ legend: {{ labels: {{ color: '#fff' }} }} }},
                scales: {{ x: {{ ticks: {{ color: '#888' }} }}, y: {{ ticks: {{ color: '#888' }} }} }}
            }}
        }});
        
        // Win % Chart
        const top10 = [...teams].sort((a, b) => b.win_pct - a.win_pct).slice(0, 10);
        new Chart(document.getElementById('winPctChart'), {{
            type: 'doughnut',
            data: {{
                labels: top10.map(t => t.abbr),
                datasets: [{{
                    data: top10.map(t => t.win_pct),
                    backgroundColor: ['#00d4ff','#7b2ff7','#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6b6b','#ffa94d','#74c0fc','#da77f2']
                }}]
            }},
            options: {{ 
                responsive: true,
                plugins: {{ legend: {{ labels: {{ color: '#fff' }} }} }}
            }}
        }});
        
        // Teams Table
        const sorted = [...teams].sort((a, b) => b.win_pct - a.win_pct);
        document.getElementById('teamsBody').innerHTML = sorted.map(t => {{
            const total = t.wins + t.losses;
            const barPct = total > 0 ? (t.wins / total * 100) : 0;
            return `<tr>
                <td><div class="team-info"><img class="team-logo" src="${{t.logo}}" alt="${{t.name}}">${{t.name}}</div></td>
                <td>${{t.wins}}</td>
                <td>${{t.losses}}</td>
                <td>${{t.win_pct}}%</td>
                <td><div class="win-bar" style="width:${{barPct}}%"></div></td>
            </tr>`;
        }}).join('');
    </script>
</body>
</html>"""
        
        return html
    
    def save(self, output_path):
        """Guardar dashboard HTML"""
        html = self.generate_html()
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "w") as f:
            f.write(html)
        print(f"✅ Dashboard guardado: {output_path}")
        return output_path

if __name__ == "__main__":
    output = "/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/dashboard.html"
    
    analytics = NFLAnalytics()
    analytics.fetch_all()
    analytics.save(output)
    
    print(f"\n📊 Dashboard generado: {output}")
