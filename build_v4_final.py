#!/usr/bin/env python3
"""NFL 2025 Dashboard v4 - Complete real data from ESPN"""
import requests, json, os, re
BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"

LOGOS = {
    "ARI":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ari.png","ATL":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/atl.png",
    "BAL":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/bal.png","BUF":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/buf.png",
    "CAR":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/car.png","CHI":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/chi.png",
    "CIN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/cin.png","CLE":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/cle.png",
    "DAL":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/dal.png","DEN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/den.png",
    "DET":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/det.png","GB":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/gb.png",
    "HOU":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/hou.png","IND":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ind.png",
    "JAX":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/jax.png","KC":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/kc.png",
    "LAC":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/lac.png","LAR":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/lar.png",
    "LV":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/lv.png","MIA":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/mia.png",
    "MIN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/min.png","NE":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ne.png",
    "NO":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/no.png","NYG":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyg.png",
    "NYJ":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyj.png","PHI":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/phi.png",
    "PIT":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/pit.png","SEA":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/sea.png",
    "SF":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/sf.png","TB":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/tb.png",
    "TEN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ten.png","WSH":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/wsh.png"
}

def get_rosters():
    """Get roster data for all 32 teams"""
    print("Fetching all team rosters...")
    tc = {}
    # Get all teams first
    r = requests.get(f"{BASE}/teams?limit=32", timeout=10)
    teams = [(t['id'], t.get('abbreviation','?')) for t in r.json().get('sports',[{}])[0].get('leagues',[{}])[0].get('teams',[])]
    
    for tid, abbr in teams:
        try:
            r2 = requests.get(f"{BASE}/teams/{tid}/roster", timeout=8)
            off,df,qb=[],[],None
            for g in r2.json().get("athletes",[]):
                pos=g.get("position","").lower()
                for pl in g.get("items",[]):
                    if pos=="offense":
                        if pl.get("position",{}).get("abbreviation")=="QB": qb=pl
                        else: off.append(pl)
                    elif pos=="defense": df.append(pl)
            tc[tid] = {"qb":qb,"offense":off[:8],"defense":df[:8],"abbr":abbr}
        except:
            tc[tid] = {"qb":None,"offense":[],"defense":[],"abbr":abbr}
        print(f"  {abbr} roster loaded", end="\r")
    print("\nAll rosters loaded")
    return tc

def fetch_week_games(wk):
    """Fetch games with full summary data including stats"""
    r = requests.get(f"{BASE}/scoreboard?dates=2025&week={wk}", timeout=10)
    games = []
    for ev in r.json().get("events",[]):
        comp = ev.get("competitions",[{}])[0]
        c = comp.get("competitors",[])
        if len(c)<2: continue
        t0,t1 = c[0].get("team",{}),c[1].get("team",{})
        a0,a1 = t0.get("abbreviation","?"),t1.get("abbreviation","?")
        s0,s1 = c[0].get("score","0"),c[1].get("score","0")
        
        game = {
            "id": ev["id"],
            "date": ev.get("date","")[:10],
            "name": ev.get("shortName","?"),
            "status": comp.get("status",{}).get("type",{}).get("description","?"),
            "teams": [
                {"id": t0.get("id"),"name": t0.get("displayName"),"abbr": a0,"score": s0,"logo": LOGOS.get(a0,""),
                 "record": (c[0].get("records") or [{}])[0].get("summary","") if c[0].get("records") else "",
                 "home": c[0].get("homeAway")=="home"},
                {"id": t1.get("id"),"name": t1.get("displayName"),"abbr": a1,"score": s1,"logo": LOGOS.get(a1,""),
                 "record": (c[1].get("records") or [{}])[0].get("summary","") if c[1].get("records") else "",
                 "home": c[1].get("homeAway")=="home"}
            ],
            "venue": comp.get("venue",{}).get("fullName","NFL Stadium"),
            "city": comp.get("venue",{}).get("address",{}).get("city",""),
            "state": comp.get("venue",{}).get("address",{}).get("state",""),
            "grass": comp.get("venue",{}).get("grass",True),
            "broadcast": (comp.get("broadcasts") or [{}])[0].get("names",[""])[0] if comp.get("broadcasts") else "",
            "attendance": comp.get("attendance","")
        }
        
        # Fetch full summary for player stats
        try:
            rs = requests.get(f"{BASE}/summary?event={ev['id']}", timeout=8)
            sj = rs.json()
            
            # Boxscore - player stats by team
            if "boxscore" in sj and sj["boxscore"].get("players"):
                game["boxscore"] = sj["boxscore"]["players"]
            
            # Leaders (top performers across game)
            if "leaders" in sj:
                game["leaders"] = sj["leaders"]
            
            # Win probability
            if "winprobability" in sj:
                wp = sj["winprobability"]
                if wp:
                    final = wp[-1]
                    game["homeWinProb"] = round(final.get("homeWinPercentage",50)*100, 1)
            
            # Odds from pickcenter
            if "pickcenter" in sj:
                pc = sj["pickcenter"]
                if pc and "provider" in pc:
                    game["oddsProvider"] = pc.get("provider",{}).get("name","")
                    game["overUnder"] = pc.get("overUnder",0)
                    for pv in pc.get("pickVersions",[]):
                        if pv.get("pickVersion","") in ["pointspread","standard"]:
                            for pick in pv.get("picks",[]):
                                if pick.get("type") == "spread":
                                    game["spread"] = pick
                                if pick.get("type") == "overunder":
                                    game["overUnder"] = pick.get("overUnder")
            
            # Injuries
            if "injuries" in sj:
                game["injuries"] = sj["injuries"]
                
        except Exception as e:
            pass
        
        games.append(game)
        print(f"  {a0} @ {a1} loaded", end="\r")
    return games

def extract_boxscore_data(bs, team_abbr):
    """Extract player stats from boxscore for a team"""
    result = {"passing":[],"rushing":[],"receiving":[],"defense":[],"kicking":[],"fumbles":[]}
    if not bs: return result
    
    # Find team data
    team_data = None
    for t in bs:
        if t.get("team",{}).get("abbreviation","").upper() == team_abbr.upper():
            team_data = t
            break
    
    if not team_data or "statistics" not in team_data:
        return result
    
    for stat_group in team_data["statistics"]:
        name = stat_group.get("name","").lower()
        keys = stat_group.get("keys",[])
        labels = stat_group.get("labels",[])
        athletes = stat_group.get("athletes",[])
        
        if "pass" in name:
            for a in athletes:
                at = a.get("athlete",{})
                vals = a.get("stats",[])
                result["passing"].append({
                    "name": at.get("displayName","?"),
                    "jersey": at.get("jersey","?"),
                    "headshot": at.get("headshot",""),
                    "stats": {k: v for k, v in zip(keys, vals)}
                })
        elif "rush" in name:
            for a in athletes:
                at = a.get("athlete",{})
                vals = a.get("stats",[])
                result["rushing"].append({
                    "name": at.get("displayName","?"),
                    "jersey": at.get("jersey","?"),
                    "headshot": at.get("headshot",""),
                    "stats": {k: v for k, v in zip(keys, vals)}
                })
        elif "receiv" in name:
            for a in athletes:
                at = a.get("athlete",{})
                vals = a.get("stats",[])
                result["receiving"].append({
                    "name": at.get("displayName","?"),
                    "jersey": at.get("jersey","?"),
                    "headshot": at.get("headshot",""),
                    "stats": {k: v for k, v in zip(keys, vals)}
                })
        elif "defens" in name or "tackl" in name:
            for a in athletes:
                at = a.get("athlete",{})
                vals = a.get("stats",[])
                result["defense"].append({
                    "name": at.get("displayName","?"),
                    "jersey": at.get("jersey","?"),
                    "headshot": at.get("headshot",""),
                    "stats": {k: v for k, v in zip(keys, vals)}
                })
        elif "kick" in name or "punt" in name:
            for a in athletes:
                at = a.get("athlete",{})
                vals = a.get("stats",[])
                result["kicking"].append({
                    "name": at.get("displayName","?"),
                    "jersey": at.get("jersey","?"),
                    "headshot": at.get("headshot",""),
                    "stats": {k: v for k, v in zip(keys, vals)}
                })
    return result

def extract_leaders(leaders_data):
    """Extract top performers"""
    result = {}
    if not leaders_data: return result
    for lg in leaders_data:
        for leader_group in lg.get("leaders",[]):
            name = leader_group.get("name","")
            display = leader_group.get("displayName","")
            leaders = leader_group.get("leaders",[])
            result[name] = {"display": display, "leaders": []}
            for l in leaders:
                at = l.get("athlete",{})
                result[name]["leaders"].append({
                    "name": at.get("displayName","?"),
                    "team": at.get("team",{}).get("abbreviation","?"),
                    "value": l.get("value",0),
                    "displayValue": l.get("displayValue","?"),
                    "headshot": at.get("headshot","")
                })
    return result

# === MAIN ===
print("="*50)
print("NFL 2025 Dashboard v4 - Building")
print("="*50)

# Get weeks
weeks = []
for wk in range(1,19):
    r = requests.get(f"{BASE}/scoreboard?dates=2025&week={wk}", timeout=5)
    if r.json().get("events"): weeks.append(wk)
print(f"Weeks found: {len(weeks)}")

# Get rosters
rosters = get_rosters()

# Get games with full data
all_games = {}
for wk in weeks:
    print(f"\\nFetching Week {wk}...")
    games = fetch_week_games(wk)
    all_games[wk] = games
    print(f"  {len(games)} games")

# Process boxscore data for JS
print("\\nProcessing data for dashboard...")

# Save as JSON for JS consumption
output = {
    "weeks": weeks,
    "games": all_games,
    "logos": LOGOS
}

outpath = "/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/dashboard.html"
html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2025 Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0b0b1e;color:#e0e0e0;font-size:13px;min-height:100vh}
.ct{max-width:1200px;margin:0 auto;padding:10px}
.hd{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);padding:14px 18px;border-radius:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.hd h1{font-size:1.3em;background:linear-gradient(90deg,#00d4ff,#7b2ff7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700}
.ctrl{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
.ctrl select,.ctrl button{background:#1a1a2e;color:#e0e0e0;border:1px solid #2a2a4a;padding:7px 12px;border-radius:6px;font-size:.82em}
.ctrl button{background:linear-gradient(90deg,#00d4ff,#7b2ff7);border:0;font-weight:600;cursor:pointer}
.gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:9px;margin-bottom:12px}
.gc{background:#1a1a2e;padding:10px;border-radius:8px;border:1px solid #1e1e3a;cursor:pointer;transition:all .2s}
.gc:hover{border-color:#00d4ff;transform:translateY(-1px)}
.gc.s{border-color:#7b2ff7}
.gct{display:flex;justify-content:space-between;align-items:center;margin:4px 0}
.gm{text-align:center;flex:1}
.gm img{width:34px;height:34px}
.gm .ab{font-size:.85em;font-weight:700;margin-top:1px}
.gm .sc{font-size:1.3em;color:#00d4ff;font-weight:700}
.gv{font-size:.9em;color:#3a3a5a}
.gdt{color:#555;font-size:.68em;text-align:center}
.gst{color:#777;font-size:.65em;text-align:center;margin-top:2px}
.an{display:none}
.an.a{display:block}
.mh{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:10px 14px;border-radius:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.ms{display:flex;align-items:center;gap:12px}
.ms img{width:42px;height:42px}
.ms .sc{font-size:1.5em;font-weight:700;color:#00d4ff}
.ms .ab{color:#888;font-size:.78em}
.mi{text-align:right;color:#666;font-size:.72em;line-height:1.5}
.tl{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px}
.ts{background:#1a1a2e;border-radius:8px;padding:10px;border:1px solid #1e1e3a}
.ts h3{color:#00d4ff;font-size:.85em;margin-bottom:6px;border-bottom:1px solid #2a2a4a;padding-bottom:5px}
.ts h4{color:#7b2ff7;font-size:.78em;margin:6px 0 3px}
.pc{display:flex;align-items:center;gap:6px;padding:4px 6px;background:rgba(255,255,255,.02);border-radius:6px;margin-bottom:3px;font-size:.78em}
.pc .av{width:24px;height:24px;border-radius:50%;background:#2a2a4a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.65em;flex-shrink:0}
.pc .av.q{background:#00d4ff;color:#000}
.pc .av.o{background:#7b2ff7}
.pc .av.d{background:#ff5252}
.pc .av.r{background:#ff9800}
.pc .av.p{background:#00bcd4}
.pi{flex:1;min-width:0}
.pi .nm{font-weight:600;font-size:.8em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pi .ps{color:#666;font-size:.68em}
.ps{color:#999;font-size:.68em;white-space:nowrap;text-align:right}
.qbc{border:1px solid rgba(0,212,255,.3);background:rgba(0,212,255,.05)}
.as{background:#1a1a2e;border-radius:8px;padding:10px;margin:8px 0;border:1px solid #1e1e3a}
.as h3{color:#00d4ff;font-size:.85em;margin-bottom:7px}
.sbx{background:rgba(255,255,255,.03);padding:6px 9px;border-radius:5px;display:inline-block;margin:2px}
.sbx .v{font-size:.9em;font-weight:700;color:#00d4ff}
.sbx .l{font-size:.65em;color:#666}
.lb{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.pr{background:linear-gradient(135deg,rgba(0,212,255,.08),rgba(123,47,247,.08));padding:8px 12px;border-radius:7px;border:1px solid rgba(0,212,255,.2);margin-top:6px}
.pr .w{font-size:.9em;font-weight:700;color:#00d4ff}
.pr .c{font-size:.72em;color:#888;margin-top:2px}
.sr{display:flex;gap:10px;flex-wrap:wrap}
.sr .sh{min-width:80px}
.sr .sh .n{font-size:.82em;font-weight:600;color:#00d4ff}
.sr .sh .d{font-size:.68em;color:#666}
.md{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
@media(max-width:768px){.tl{grid-template-columns:1fr}.ms img{width:34px;height:34px}.ms .sc{font-size:1.2em}.md{grid-template-columns:1fr}}
.hr{border-bottom:1px solid #1e1e3a;padding:3px 0;font-size:.75em}
.wb{display:inline-block;background:rgba(0,212,255,.05);padding:3px 8px;border-radius:12px;font-size:.7em;color:#00d4ff;margin-right:4px}
@keyframes pulse{0%{opacity:1}50%{opacity:.5}100%{opacity:1}}
.lv{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:4px}
.lv.w{background:#00c853}
.lv.l{background:#ff5252}
</style>
</head>
<body>
<div class="ct">
<div class="hd"><h1>🏈 NFL 2025 Analytics</h1>
<span style="color:#666;font-size:.78em">Real Player Stats · QB Ratings · Yards & TDs · Defense</span></div>
<div class="ctrl">
<select id="wk"><option value="">-- Select Week --</option>"""

for w in weeks:
    html += f'<option value="{w}">Week {w}</option>'

html += """</select>
<button onclick="ld()">📅 Load Games</button>
</div>
<div id="gl"><div style="text-align:center;padding:30px;color:#555;font-size:.85em">Select a week 🏈</div></div>
<div id="an" class="an"><div id="mh" class="mh"></div><div id="tl" class="tl"></div><div id="ae"></div></div>
</div>
<script>
// NFL Data embed
var ND = %s;

function ld(){
  var k = document.getElementById('wk').value;
  if(!k) return;
  var g = ND.games[k];
  if(!g) return;
  var h = '';
  for(var i=0;i<g.length;i++){
    var gm = g[i];
    h += '<div class="gc" onclick="sg(\\''+gm.id+'\\')"><div class="gdt">'+gm.date+(gm.broadcast?' &middot; '+gm.broadcast:'')+'</div>'+
      '<div class="gct"><div class="gm"><img src="'+gm.teams[0].logo+'"><div class="ab">'+gm.teams[0].abbr+'</div><div class="sc">'+gm.teams[0].score+'</div></div>'+
      '<div class="gv">vs</div>'+
      '<div class="gm"><img src="'+gm.teams[1].logo+'"><div class="ab">'+gm.teams[1].abbr+'</div><div class="sc">'+gm.teams[1].score+'</div></div></div>'+
      '<div class="gst">'+gm.teams[0].record+' · '+gm.teams[1].record+'</div></div>';
  }
  document.getElementById('gl').innerHTML = h;
}

function sg(id){
  var g = null;
  for(var k in ND.games){
    for(var i=0;i<ND.games[k].length;i++){
      if(ND.games[k][i].id == id){ g = ND.games[k][i]; break; }
    }
    if(g) break;
  }
  if(!g) return;
  
  document.getElementById('an').classList.add('a');
  var a0=g.teams[0], a1=g.teams[1];
  var s0=parseInt(a0.score), s1=parseInt(a1.score);
  var winner = s0>s1?a0:a1, loser = s0>s1?a1:a0;
  var spread = Math.abs(s0-s1);
  
  // Matchup header
  document.getElementById('mh').innerHTML =
    '<div class="ms"><img src="'+a0.logo+'"><div style="text-align:center"><div class="sc">'+s0+'</div><div class="ab">'+a0.abbr+'</div></div>'+
    '<div style="font-size:.9em;color:#555">@</div>'+
    '<div style="text-align:center"><div class="sc">'+s1+'</div><div class="ab">'+a1.abbr+'</div></div><img src="'+a1.logo+'"></div>'+
    '<div class="mi"><div>'+g.date+' - '+g.status+'</div><div>'+(g.venue||'NFL Stadium')+'</div>'+
    (g.attendance?('<div>Attendance: '+g.attendance+'</div>'):'')+
    (g.broadcast?('<div>'+g.broadcast+'</div>'):'')+'</div>';
  
  // Fetch summary data for this game
  var bs = {};
  var leaders = {};
  var boxscoreData = {};
  
  // We'll fetch the summary via API on-demand
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event='+id, true);
  xhr.onload = function(){
    if(xhr.status==200){
      var d = JSON.parse(xhr.responseText);
      
      // Process boxscore
      if(d.boxscore && d.boxscore.players){
        var bp = d.boxscore.players;
        for(var ti=0;ti<bp.length;ti++){
          var tabbr = bp[ti].team.abbreviation;
          boxscoreData[tabbr] = {};
          if(bp[ti].statistics){
            for(var si=0;si<bp[ti].statistics.length;si++){
              var sg = bp[ti].statistics[si];
              var name = sg.name;
              boxscoreData[tabbr][name] = {
                labels: sg.labels,
                keys: sg.keys,
                athletes: sg.athletes
              };
            }
          }
        }
      }
      
      // Process leaders
      if(d.leaders){
        for(var li=0;li<d.leaders.length;li++){
          var lg = d.leaders[li];
          for(var lgi=0;lgi<lg.leaders.length;lgi++){
            var lgroup = lg.leaders[lgi];
            leaders[lgroup.name] = {
              display: lgroup.displayName,
              list: []
            };
            for(var li2=0;li2<lgroup.leaders.length;li2++){
              var l = lgroup.leaders[li2];
              leaders[lgroup.name].list.push({
                name: l.athlete.displayName,
                team: l.athlete.team ? l.athlete.team.abbreviation : '?',
                value: l.value,
                displayValue: l.displayValue,
                headshot: l.athlete.headshot || ''
              });
            }
          }
        }
      }
      
      // Win probability
      if(d.winprobability && d.winprobability.length){
        var wp = d.winprobability;
        var lastWp = wp[wp.length-1];
        g.homeWinProb = Math.round(lastWp.homeWinPercentage * 100);
      }
      
      // Game info for weather/venue
      if(d.gameInfo){
        var gi = d.gameInfo;
        if(gi.weather){
          g.weather = gi.weather.displayValue;
          g.wind = gi.wind ? gi.wind.displayValue : '';
          g.temperature = gi.temperature ? gi.temperature.displayValue : '';
        }
      }
      
      // Odds
      if(d.odds && d.odds.length){
        g.odds = d.odds;
      }
      
      renderAnalysis(leaders, boxscoreData);
    } else {
      renderAnalysis(leaders, boxscoreData);
    }
  };
  xhr.onerror = function(){ renderAnalysis(leaders, boxscoreData); };
  xhr.send();
  
  // Quick initial render with roster data
  document.getElementById('tl').innerHTML = '<div style="grid-column:1/3;text-align:center;color:#555;padding:20px;font-size:.8em">Loading player stats... ⏳</div>';
  document.getElementById('ae').innerHTML = '';
  
  function renderAnalysis(leaders, boxscoreData){
    // Build player stats
    var html0 = '', html1 = '';
    
    function renderPlayerRow(p, cls){
      if(!p || !p.athlete) return '';
      var at = p.athlete;
      var name = at.displayName || '?';
      var jersey = at.jersey || '';
      var pos = at.position ? at.position.abbreviation : (at.displayName.includes('.')?'QB':'?');
      var vals = p.stats || [];
      var statStr = vals.join(' | ');
      var isQB = pos=='QB';
      return '<div class="pc"><div class="av '+(isQB?'q':(cls||'o'))+'">'+pos+'</div><div class="pi"><div class="nm">'+name+'</div><div class="ps">#'+jersey+'</div></div><div class="ps">'+statStr+'</div></div>';
    }
    
    function renderPassing(arr){
      if(!arr||!arr.length) return '<div style="color:#555;font-size:.72em;padding:4px">No stats</div>';
      return arr.map(function(p){
        var at = p.athlete, vals = p.stats||[];
        var name = at.displayName, jersey = at.jersey||'';
        var cmp = vals[0]||'', yds = vals[1]||'', td = vals[3]||'', qbr = vals[6]||'';
        return '<div class="pc qbc"><div class="av q">QB</div><div class="pi"><div class="nm">'+name+'</div><div class="ps">#'+jersey+'</div></div><div class="ps">'+cmp+' | '+yds+' YDS'+(td>0?' | '+td+' TD':'')+' | QBR: '+qbr+'</div></div>';
      }).join('');
    }
    
    function renderRushing(arr){
      if(!arr||!arr.length) return '<div style="color:#555;font-size:.72em;padding:4px">No stats</div>';
      return arr.map(function(p){
        var at = p.athlete, vals = p.stats||[];
        var name = at.displayName, jersey = at.jersey||'';
        var car = vals[0]||'', yds = vals[1]||'', avg = vals[2]||'', td = vals[3]||'';
        return '<div class="pc"><div class="av r">RB</div><div class="pi"><div class="nm">'+name+'</div><div class="ps">#'+jersey+'</div></div><div class="ps">'+car+' CAR | '+yds+' YDS | '+avg+' AVG'+(td>0?' | '+td+' TD':'')+'</div></div>';
      }).join('');
    }
    
    function renderReceiving(arr){
      if(!arr||!arr.length) return '<div style="color:#555;font-size:.72em;padding:4px">No stats</div>';
      return arr.map(function(p){
        var at = p.athlete, vals = p.stats||[];
        var name = at.displayName, jersey = at.jersey||'';
        var rec = vals[0]||'', yds = vals[1]||'', avg = vals[2]||'', td = vals[3]||'', tgt = vals[5]||'';
        return '<div class="pc"><div class="av p">WR</div><div class="pi"><div class="nm">'+name+'</div><div class="ps">#'+jersey+'</div></div><div class="ps">'+rec+' REC | '+yds+' YDS | '+avg+' AVG'+(td>0?' | '+td+' TD':'')+'</div></div>';
      }).join('');
    }
    
    function renderDefense(arr){
      if(!arr||!arr.length) return '<div style="color:#555;font-size:.72em;padding:4px">No stats</div>';
      return arr.map(function(p){
        var at = p.athlete, vals = p.stats||[];
        var name = at.displayName, jersey = at.jersey||'';
        var tackles = vals.length>0?vals[0]:'', sack = vals.length>2?vals[2]:'', ints = vals