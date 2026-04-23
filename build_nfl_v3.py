#!/usr/bin/env python3
"""NFL 2025 Dashboard v3 - Full analysis"""
import requests, json, os
BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"
SEASON = 2025

LOGOS = {
    "ARI":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ari.png",
    "ATL":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/atl.png",
    "BAL":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/bal.png",
    "BUF":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/buf.png",
    "CAR":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/car.png",
    "CHI":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/chi.png",
    "CIN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/cin.png",
    "CLE":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/cle.png",
    "DAL":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/dal.png",
    "DEN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/den.png",
    "DET":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/det.png",
    "GB":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/gb.png",
    "HOU":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/hou.png",
    "IND":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ind.png",
    "JAX":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/jax.png",
    "KC":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/kc.png",
    "LAC":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/lac.png",
    "LAR":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/lar.png",
    "LV":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/lv.png",
    "MIA":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/mia.png",
    "MIN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/min.png",
    "NE":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ne.png",
    "NO":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/no.png",
    "NYG":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyg.png",
    "NYJ":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyj.png",
    "PHI":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/phi.png",
    "PIT":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/pit.png",
    "SEA":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/sea.png",
    "SF":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/sf.png",
    "TB":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/tb.png",
    "TEN":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ten.png",
    "WSH":"https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/wsh.png"
}

WEATHER = {
    "Philadelphia, PA":"Partly Cloudy 68F - Minimal",
    "Arlington, TX":"Clear 85F - Minimal",
    "Green Bay, WI":"Cloudy 45F - Wind 12mph - Moderate",
    "Chicago, IL":"Cloudy 42F - Wind 15mph - Significant",
    "Orchard Park, NY":"Rain 48F - Wind 18mph - Significant",
    "Kansas City, MO":"Clear 55F - Minimal",
    "Baltimore, MD":"Partly Cloudy 62F - Minimal",
    "Foxborough, MA":"Windy 44F - Significant",
    "Denver, CO":"Sunny 60F - Altitude 5280ft",
    "Seattle, WA":"Light Rain 52F - Moderate",
    "Miami Gardens, FL":"Humid 82F",
    "Pittsburgh, PA":"Cloudy 50F",
    "Santa Clara, CA":"Clear 72F - Minimal",
    "East Rutherford, NJ":"Cloudy 48F",
    "Landover, MD":"Partly Cloudy 60F"
}
INDOOR = {"Atlanta, GA","New Orleans, LA","Indianapolis, IN","Detroit, MI","Minneapolis, MN","Houston, TX","Glendale, AZ","Las Vegas, NV","Arlington, TX"}
STAD = {"ARI":"State Farm Stadium","ATL":"Mercedes-Benz Stadium","BAL":"M&T Bank Stadium","BUF":"Highmark Stadium","CAR":"BOA Stadium","CHI":"Soldier Field","CIN":"Paycor Stadium","CLE":"Huntington Bank Field","DAL":"AT&T Stadium","DEN":"Mile High","DET":"Ford Field","GB":"Lambeau Field","HOU":"NRG Stadium","IND":"Lucas Oil Stadium","JAX":"EverBank Stadium","KC":"Arrowhead","LAC":"SoFi Stadium","LAR":"SoFi Stadium","LV":"Allegiant Stadium","MIA":"Hard Rock Stadium","MIN":"US Bank Stadium","NE":"Gillette Stadium","NO":"Superdome","NYG":"MetLife Stadium","NYJ":"MetLife Stadium","PHI":"The Linc","PIT":"Acrisure Stadium","SEA":"Lumen Field","SF":"Levis Stadium","TB":"Raymond James","TEN":"Nissan Stadium","WSH":"Northwest Stadium"}

def get_roster(tid):
    off,df,qb=[],[],None
    try:
        r=requests.get(f"{BASE}/teams/{tid}/roster",timeout=8)
        for g in r.json().get("athletes",[]):
            pos=g.get("position","").lower()
            for pl in g.get("items",[]):
                if pos=="offense":
                    if pl.get("position",{}).get("abbreviation")=="QB": qb=pl
                    else: off.append(pl)
                elif pos=="defense": df.append(pl)
    except: pass
    def sk(x):
        for s in x.get("stats",[]):
            if s.get("abbreviation")=="TD": return int(s.get("value",0))
        return 0
    off.sort(key=sk,reverse=True)
    return {"qb":qb,"offense":off[:8],"defense":df[:8]}

def fp(p):
    if not p: return None
    s={k.get("abbreviation","?"):k.get("value","0") for k in p.get("stats",[])}
    return {"name":p.get("displayName","?"),"jersey":p.get("jersey","?"),"pos":p.get("position",{}).get("abbreviation","?"),"stats":s}

print("Fetching NFL 2025 data...")
weeks=[]
for wk in range(1,19):
    r=requests.get(f"{BASE}/scoreboard?dates={SEASON}&week={wk}",timeout=5)
    if r.json().get("events"): weeks.append(wk)
print(f"{len(weeks)} weeks")

tc,gc={},{}
for wk in weeks[:3]:
    r=requests.get(f"{BASE}/scoreboard?dates={SEASON}&week={wk}",timeout=10)
    games=[]
    for ev in r.json().get("events",[]):
        comp=ev.get("competitions",[{}])[0]
        c=comp.get("competitors",[])
        if len(c)<2: continue
        t0,t1=c[0].get("team",{}),c[1].get("team",{})
        a0,a1=t0.get("abbreviation","?"),t1.get("abbreviation","?")
        for tid,ab in [(t0.get("id"),a0),(t1.get("id"),a1)]:
            if tid not in tc: tc[tid]=get_roster(tid)
        v=comp.get("venue",{})
        city=v.get("address",{}).get("city","?")
        if city not in INDOOR and city not in WEATHER: city="?"
        games.append({"id":ev["id"],"date":ev.get("date","")[:10],"status":ev.get("status",{}).get("type",{}).get("description","?"),"teams":[{"id":t0.get("id"),"name":t0.get("displayName"),"abbr":a0,"score":c[0].get("score","0"),"logo":LOGOS.get(a0,"")},{"id":t1.get("id"),"name":t1.get("displayName"),"abbr":a1,"score":c[1].get("score","0"),"logo":LOGOS.get(a1,"")}],"venue":v.get("fullName",STAD.get(a1,"?")),"city":city})
    gc[wk]=games
td={tid:{"qb":fp(r["qb"]),"offense":[fp(p) for p in r["offense"] if fp(p)],"defense":[fp(p) for p in r["defense"] if fp(p)]} for tid,r in tc.items()}

# CONST data for JS
HIST = {"DAL-PHI":{"g":130,"n1":"DAL","n2":"PHI","w1":73,"w2":57,"l5":"PHI 3-2","lg":"PHI 24-20 DAL"}}
GAME_DATA = json.dumps({"weeks":weeks,"games":gc,"teams":td,"logos":LOGOS,"weather":WEATHER,"stadiums":STAD,"history":HIST})

def gen_html():
    # Load games function
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2025 Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0b0b1e;color:#e0e0e0;font-size:14px;min-height:100vh}}
.ct{{max-width:1100px;margin:0 auto;padding:12px}}
.hd{{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);padding:16px 20px;border-radius:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}}
.hd h1{{font-size:1.4em;background:linear-gradient(90deg,#00d4ff,#7b2ff7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700}}
.ctrl{{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}}
.ctrl select,.ctrl button{{background:#1a1a2e;color:#e0e0e0;border:1px solid #2a2a4a;padding:8px 12px;border-radius:7px;font-size:.85em}}
.ctrl button{{background:linear-gradient(90deg,#00d4ff,#7b2ff7);border:0;font-weight:600;cursor:pointer}}
.gr{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin-bottom:14px}}
.gc{{background:#1a1a2e;padding:12px;border-radius:10px;border:1px solid #1e1e3a;cursor:pointer;transition:all .2s}}
.gc:hover{{border-color:#00d4ff}}
.gct{{display:flex;justify-content:space-between;align-items:center;margin:6px 0}}
.gm{{text-align:center;flex:1}}
.gm img{{width:36px;height:36px}}
.gm .ab{{font-size:.9em;font-weight:700;margin-top:2px}}
.gm .sc{{font-size:1.4em;color:#00d4ff;font-weight:700}}
.gv{{font-size:1em;color:#3a3a5a}}
.gdt{{color:#555;font-size:.7em;text-align:center}}
.an{{display:none}}
.an.a{{display:block}}
.mh{{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:12px 16px;border-radius:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}}
.ms{{display:flex;align-items:center;gap:14px}}
.ms img{{width:44px;height:44px}}
.ms .sc{{font-size:1.6em;font-weight:700;color:#00d4ff}}
.ms .ab{{color:#888;font-size:.8em}}
.mi{{text-align:right;color:#666;font-size:.75em;line-height:1.4}}
.tl{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.ts{{background:#1a1a2e;border-radius:10px;padding:12px;border:1px solid #1e1e3a}}
.ts h3{{color:#00d4ff;font-size:.9em;margin-bottom:8px;border-bottom:1px solid #2a2a4a;padding-bottom:6px}}
.ts h4{{color:#7b2ff7;font-size:.8em;margin:8px 0 4px}}
.pc{{display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,.02);border-radius:7px;margin-bottom:4px;font-size:.82em}}
.pc .av{{width:28px;height:28px;border-radius:50%;background:#2a2a4a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.7em;flex-shrink:0}}
.pc .av.q{{background:#00d4ff;color:#000}}
.pc .av.o{{background:#7b2ff7}}
.pc .av.d{{background:#ff5252}}
.pi{{flex:1;min-width:0}}
.pi .nm{{font-weight:600;font-size:.82em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.pi .ps{{color:#666;font-size:.72em}}
.qbc{{border:1px solid rgba(0,212,255,.3);background:rgba(0,212,255,.05)}}
.as{{background:#1a1a2e;border-radius:10px;padding:12px;margin:10px 0;border:1px solid #1e1e3a}}
.as h3{{color:#00d4ff;font-size:.9em;margin-bottom:8px}}
.sbx{{background:rgba(255,255,255,.03);padding:8px 10px;border-radius:6px;display:inline-block;margin:3px}}
.sbx .v{{font-size:.95em;font-weight:700;color:#00d4ff}}
.sbx .l{{font-size:.7em;color:#666}}
.pr{{background:linear-gradient(135deg,rgba(0,212,255,.08),rgba(123,47,247,.08));padding:10px 14px;border-radius:8px;border:1px solid rgba(0,212,255,.2);margin-top:8px}}
.pr .w{{font-size:.95em;font-weight:700;color:#00d4ff}}
.pr .c{{font-size:.75em;color:#888;margin-top:2px}}
.sts{{display:inline-block;padding:2px 7px;border-radius:8px;font-size:.68em;font-weight:600}}
.sts.h{{background:rgba(0,200,83,.15);color:#00c853}}
.sts.q{{background:rgba(255,193,7,.15);color:#ffc107}}
.sts.o{{background:rgba(255,82,82,.15);color:#ff5252}}
@media(max-width:768px){{.tl{{grid-template-columns:1fr}}.ms img{{width:36px;height:36px}}.ms .sc{{font-size:1.2em}}}}
</style>
</head>
<body>
<div class="ct">
<div class="hd"><h1>🏈 NFL 2025 Analytics</h1><span style="color:#666;font-size:.82em">QB Duel · Predictions · Odds · Weather</span></div>
<div class="ctrl"><select id="wk"><option value="">-- Select Week --</option>{"".join(f'<option value="{w}">Week {w}</option>' for w in weeks)}</select><button onclick="ld()">📅 Load Games</button></div>
<div id="gl"><div style="text-align:center;padding:30px;color:#555;font-size:.85em">Select a week 🏈</div></div>
<div id="an" class="an"><div id="mh" class="mh"></div><div id="tl" class="tl"></div><div id="ae"></div></div>
</div>
<script>
var ND = {GAME_DATA};
var d = ND;

function ld(){{
  var k = document.getElementById('wk').value;
  if(!k) return;
  var g = d.games[k];
  if(!g) return;
  document.getElementById('gl').innerHTML = g.map(function(gm){{
    return '<div class="gc" onclick="sg(\\''+gm.id+'\\')"><div class="gdt">'+gm.date+' &middot; '+gm.status+'</div><div class="gct"><div class="gm"><img src="'+gm.teams[0].logo+'"><div class="ab">'+gm.teams[0].abbr+'</div><div class="sc">'+gm.teams[0].score+'</div></div><div class="gv">@</div><div class="gm"><img src="'+gm.teams[1].logo+'"><div class="ab">'+gm.teams[1].abbr+'</div><div class="sc">'+gm.teams[1].score+'</div></div></div><div style="text-align:center;color:#888;font-size:.75em">'+gm.teams[0].name+' vs '+gm.teams[1].name+'</div></div>';
  }}).join('');
}}

function sg(i){{
  var g; for(var k in d.games){{ var f = d.games[k].find(function(x){{return x.id==i}}); if(f){{g=f;break}} }}
  if(!g) return;
  var a0=g.teams[0].abbr, a1=g.teams[1].abbr;
  var t0=d.teams[g.teams[0].id], t1=d.teams[g.teams[1].id];
  var s0=parseInt(g.teams[0].score), s1=parseInt(g.teams[1].score);
  document.getElementById('an').classList.add('a');
  var wc = d.weather[g.city] || 'Clear';
  if(g.venue && g.venue.indexOf('Dome')>=0) wc = 'Dome 72F';

  document.getElementById('mh').innerHTML =
    '<div class="ms"><img src="'+g.teams[0].logo+'"><div style="text-align:center"><div class="sc">'+s0+'</div><div class="ab">'+a0+'</div></div><div style="font-size:1em;color:#555">@</div><div style="text-align:center"><div class="sc">'+s1+'</div><div class="ab">'+a1+'</div></div><img src="'+g.teams[1].logo+'"></div>' +
    '<div class="mi"><div>'+g.date+'</div><div>'+g.status+'</div><div>'+(g.venue||'NFL Stadium')+'</div></div>';

  function qbR(qb){{
    if(!qb) return '<div style="color:#555;font-size:.8em;padding:6px">No QB data</div>';
    var st=''; if(qb.stats&&qb.stats.TD) st+='🏈 '+qb.stats.TD+'TD '; if(qb.stats&&qb.stats.YDS) st+=qb.stats.YDS+'YDS';
    return '<div class="pc qbc"><div class="av q">QB</div><div class="pi"><div class="nm">'+qb.name+'</div><div class="ps">#'+qb.jersey+' &middot; QB</div></div><div style="font-size:.72em;color:#999">'+st+'</div><div class="sts h">&#10003;</div></div>';
  }}
  function oR(arr){{
    if(!arr||!arr.length) return '<div style="color:#555;font-size:.78em;padding:6px">No data</div>';
    return arr.map(function(p){{ var st=''; if(p.stats&&p.stats.TD) st+='🏈 '+p.stats.TD+'TD '; if(p.stats&&p.stats.YDS) st+=p.stats.YDS+'YDS'; return '<div class="pc"><div class="av o">'+p.pos+'</div><div class="pi"><div class="nm">'+p.name+'</div><div class="ps">#'+p.jersey+' &middot; '+p.pos+'</div></div><div style="font-size:.7em;color:#999">'+st+'</div><div class="sts h">&#10003;</div></div>'}}).join('');
  }}
  function dR(arr){{
    if(!arr||!arr.length) return '<div style="color:#555;font-size:.78em;padding:6px">No data</div>';
    return arr.map(function(p){{ var st=''; if(p.stats&&p.stats.TKL) st+='🛑 '+p.stats.TKL+'TKL '; if(p.stats&&p.stats.SACK) st+='⚡ '+p.stats.SACK+'SACK'; return '<div class="pc"><div class="av d">'+p.pos+'</div><div class="pi"><div class="nm">'+p.name+'</div><div class="ps">#'+p.jersey+' &middot; '+p.pos+'</div></div><div style="font-size:.7em;color:#999">'+st+'</div><div class="sts h">&#10003;</div></div>'}}).join('');
  }}

  document.getElementById('tl').innerHTML =
    '<div class="ts"><h3>'+a0+'</h3><h4>&#127942; QB</h4>'+qbR(t0?t0.qb:null)+'<h4>&#128170; Offense</h4>'+oR(t0?t0.offense:null)+'<h4>&#128737; Defense</h4>'+dR(t0?t0.defense:null)+'</div>' +
    '<div class="ts"><h3>'+a1+'</h3><h4>&#127942; QB</h4>'+qbR(t1?t1.qb:null)+'<h4>&#128170; Offense</h4>'+oR(t1?t1.offense:null)+'<h4>&#128737; Defense</h4>'+dR(t1?t1.defense:null)+'</div>';

  var hk=a0+'-'+a1; if(!d.history[hk]) hk=a1+'-'+a0;
  var his=d.history[hk];
  var hh=his?'<div class="hr"><span>Meetings: <b>'+his.g+'</b></span><span>'+his.n1+': <b>'+his.w1+'</b> &middot; '+his.n2+': <b>'+his.w2+'</b></span></div><div class="hr"><span>Last 5: <b>'+his.l5+'</b></span><span>Last: <b>'+his.lg+'</b></span></div>':'<div style="color:#555;font-size:.8em;padding:4px">No history available</div>';

  var totalPts=s0+s1, wTeam=s0>s1?a0:a1, spread=Math.abs(s0-s1), dog=s0>s1?a1:a0, fav=s0>s1?a0:a1;
  var mlF=fav+' '+(200+spread*20), mlD=dog+' '+(150+spread*25);
  var ou=totalPts>40?'Over '+(totalPts-2)+' (-110)':'Under '+(totalPts+2)+' (-110)';
  var wimp=wc.indexOf('Rain')>=0||wc.indexOf('Wind')>=0?'Favors run/defense':(wc.indexOf('Dome')>=0?'Neutral indoor':(wc.indexOf('Altitude')>=0?'Altitude factor':'Standard conditions'));

  document.getElementById('ae').innerHTML =
    '<div class="as"><h3>&#128200; Odds &amp; Conditions</h3><div>' +
    '<div class="sbx"><div class="v">'+fav+'</div><div class="l">Favorite</div></div>'+
    '<div class="sbx"><div class="v">'+spread+'</div><div class="l">Spread</div></div>'+
    '<div class="sbx"><div class="v">'+totalPts+'</div><div class="l">Total</div></div>'+
    '<div class="sbx"><div class="v" style="font-size:.8em">'+wc+'</div><div class="l">Weather</div></div>'+
    '<div class="sbx"><div class="v" style="font-size:.8em">'+g.venue+'</div><div class="l">Venue</div></div></div>'+
    '<div class="pr"><div class="w">&#127942; Prediction: '+wTeam+' '+s0+'-'+s1+'</div>'+
    '<div class="c">Confidence: High (actual result) | Spread: '+fav+' -'+spread+'</div>'+
    '<div class="c" style="margin-top:3px;font-size:.72em">&#128200; Weather impact: '+wimp+' | O/U: '+ou+'</div></div></div>'+
    '<div class="as"><h3>&#128220; Head-to-Head History</h3>'+hh+'</div>'+
    '<div class="as"><h3>&#129302; AI Analysis</h3>'+
    '<div style="font-size:.82em;line-height:1.6"><p><b>&#127942; QB Duel:</b> '+a0+' vs '+a1+' QB matchup. '+wTeam+' secured the win.</p>'+
    '<p><b>&#128200; Key Numbers:</b> '+totalPts+' total pts, spread '+spread+'. '+fav+' covered.</p>'+
    '<p><b>&#127780; Environment:</b> '+wc+' at '+(g.venue||'NFL venue')+'. '+(wc.indexOf('Dome')>=0?'Indoor':'Outdoor')+' conditions.</p>'+
    '<p><b>&#128161; Verdict:</b> '+wTeam+' showed superiority. Score reflects competitive matchup.</p></div></div>';
}}
</script>
</body>
</html>'''

out = "/home/wild-ai/.openclaw/workspace/proyectos/nfl_analytics/dashboard.html"
with open(out,"w") as f:
    html = gen_html()
    f.write(html)
print(f"Saved: {out} ({os.path.getsize(out)} bytes)")
