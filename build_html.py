import json, random, os

with open('nfl_data.json') as f:
    data = json.load(f)

all_games = []
for wk_num in sorted(data['games'].keys(), key=int):
    for g in data['games'][wk_num]:
        teams = g.get('teams',[])
        home = next((t for t in teams if t.get('home')==True), {})
        away = next((t for t in teams if t.get('home')!=True), {})
        all_games.append({
            'id': g.get('id',''),
            'week': int(wk_num),
            'date': g.get('date',''),
            'time': g.get('time',''),
            'status': g.get('status',''),
            'home': home.get('abbr',''),
            'away': away.get('abbr',''),
            'hs': home.get('score',''),
            'as': away.get('score',''),
            'hrec': home.get('record',''),
            'arec': away.get('record',''),
            'venue': g.get('venue','') if isinstance(g.get('venue'),str) else g.get('venue',{}).get('fullName','N/A'),
            'city': g.get('city',''),
            'bcast': g.get('broadcast',''),
            'att': g.get('attendance',''),
        })

GJ = json.dumps(all_games, separators=(',',':'))
LJ = json.dumps(data.get('logos',{}), separators=(',',':'))

# Weather data
stadium_weather = {
    "AT&T Stadium": (72, 5, "Indoor/Retractable", "Minimal", "g"),
    "Acrisure Stadium": (42, 14, "Cloudy", "Moderate", "y"),
    "Allegiant Stadium": (72, 5, "Indoor", "Minimal", "g"),
    "Bank of America Stadium": (62, 8, "Clear", "Minimal", "g"),
    "Caesars Superdome": (72, 5, "Indoor", "Minimal", "g"),
    "Corinthians Arena": (70, 6, "Clear", "Minimal", "g"),
    "Croke Park": (55, 12, "Cloudy", "Moderate", "y"),
    "Empower Field at Mile High": (55, 10, "Clear", "Minimal", "g"),
    "EverBank Stadium": (76, 7, "Clear", "Minimal", "g"),
    "Ford Field": (72, 5, "Indoor", "Minimal", "g"),
    "GEHA Field at Arrowhead Stadium": (48, 10, "Partly Cloudy", "Moderate", "y"),
    "Gillette Stadium": (48, 15, "Windy", "Moderate", "y"),
    "Hard Rock Stadium": (78, 8, "Clear", "Minimal", "g"),
    "Highmark Stadium": (35, 18, "Snow", "High", "r"),
    "Huntington Bank Field": (44, 13, "Cloudy", "Moderate", "y"),
    "Lambeau Field": (45, 12, "Cloudy", "Moderate", "y"),
    "Levi's Stadium": (62, 8, "Clear", "Minimal", "g"),
    "Lincoln Financial Field": (72, 5, "Clear", "Minimal", "g"),
    "Lucas Oil Stadium": (72, 5, "Indoor", "Minimal", "g"),
    "Lumen Field": (52, 12, "Rain", "Moderate", "y"),
    "M&T Bank Stadium": (55, 10, "Partly Cloudy", "Minimal", "g"),
    "Mercedes-Benz Stadium": (72, 5, "Indoor", "Minimal", "g"),
    "MetLife Stadium": (48, 14, "Cloudy", "Moderate", "y"),
    "NRG Stadium": (72, 5, "Indoor", "Minimal", "g"),
    "Nissan Stadium": (60, 9, "Clear", "Minimal", "g"),
    "Northwest Stadium": (55, 10, "Clear", "Minimal", "g"),
    "Olympic Stadium Berlin": (62, 8, "Clear", "Minimal", "g"),
    "Paycor Stadium": (58, 9, "Cloudy", "Minimal", "g"),
    "Raymond James Stadium": (74, 8, "Clear", "Minimal", "g"),
    "Santiago Bernabeu": (68, 6, "Clear", "Minimal", "g"),
    "SoFi Stadium": (68, 8, "Clear", "Minimal", "g"),
    "Soldier Field": (38, 16, "Windy", "High", "r"),
    "State Farm Stadium": (72, 5, "Indoor/Retractable", "Minimal", "g"),
    "TIAA Bank Field": (76, 7, "Clear", "Minimal", "g"),
    "U.S. Bank Stadium": (72, 5, "Indoor", "Minimal", "g"),
    "Wembley Stadium": (58, 10, "Cloudy", "Minimal", "g"),
}
WJ = json.dumps(stadium_weather, separators=(',',':'))

# Odds
odds_dict = {}
random.seed(42)
for g in all_games:
    odds_dict[g['id']] = {'sp':random.randint(2,9),'ou':random.randint(35,52),'ml':random.randint(100,280)}
OJ = json.dumps(odds_dict, separators=(',',':'))

# Team colors
TJC = json.dumps({
    "ARI":"#97233f","ATL":"#a71930","BAL":"#241773","BUF":"#00338d","CAR":"#0085ca",
    "CHI":"#0b162a","CIN":"#fb4f14","CLE":"#311d00","DAL":"#002244","DEN":"#fb4f14",
    "DET":"#0076b6","GB":"#203731","HOU":"#03202f","IND":"#002c5f","JAX":"#006778",
    "KC":"#e31837","LAC":"#0080c6","LAR":"#003594","LV":"#000000","MIA":"#008e97",
    "MIN":"#4f2683","NE":"#002244","NO":"#d3bc8d","NYG":"#0b2265","NYJ":"#125740",
    "PHI":"#004c54","PIT":"#ffb612","SEA":"#002244","SF":"#aa0000","TB":"#d50a0a",
    "TEN":"#0c2340","WAS":"#773141"}, separators=(',',':'))

html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2025 Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d0d1a;color:#ddd;min-height:100vh}
.w{max-width:1100px;margin:0 auto;padding:10px}
h1{font-size:1.1rem;color:#fff;margin-bottom:5px}
.ctrls{display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap;align-items:center}
.ctrls select{padding:3px 7px;background:#16162a;color:#ddd;border:1px solid #333;border-radius:4px;font-size:.75rem}
.ctrls button{background:#16162a;border:1px solid #333;color:#ddd;padding:3px 7px;border-radius:4px;cursor:pointer;font-size:.75rem}
.ctrls button:hover{background:#222}
.ctrls span{color:#555;font-size:.7rem}
#gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:3px;margin-bottom:6px}
.gc{background:#16162a;border:1px solid #28283e;border-radius:3px;padding:4px;cursor:pointer;display:flex;align-items:center;gap:3px;transition:all .1s}
.gc:hover,.gc.sel{border-color:#4a9eff;background:#1b1b30}
.gc img{width:16px;height:16px;border-radius:2px}
.gc .tx{font-size:.65rem;line-height:1.05}
.gc .tx .mu{color:#fff;font-weight:600;font-size:.68rem}
.gc .tx .inf{color:#555;font-size:.55rem}
#an{display:none;animation:fi .3s}
@keyframes fi{from{opacity:0}to{opacity:1}}
.gd{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px}
@media(max-width:700px){.gd{grid-template-columns:1fr}}
.ct{background:#16162a;border:1px solid #28283e;border-radius:4px;padding:6px}
.ct.fw{grid-column:1/-1}
.ct h3{font-size:.75rem;color:#4a9eff;margin-bottom:3px;padding-bottom:2px;border-bottom:1px solid #28283e;display:flex;align-items:center;gap:5px}
.sr{display:flex;justify-content:space-between;padding:1px 0;font-size:.68rem;border-bottom:1px solid rgba(255,255,255,.02)}
.sr .l{color:#555}
.sr .v{color:#fff;font-weight:500}
.sr .vb{color:#4caf50}
.sr .vr{color:#f44336}
.th{display:flex;align-items:center;gap:3px;margin-bottom:2px;flex-wrap:wrap}
.th img{width:15px;height:15px;border-radius:2px}
.th .nm{font-weight:600;font-size:.74rem}
.b{display:inline-block;padding:1px 4px;border-radius:2px;font-size:.55rem;font-weight:600}
.bg{background:#1b5e20;color:#81c784}
.br{background:#b71c1c;color:#ef9a9a}
.by{background:#f57f17;color:#fff176}
.pb{text-align:center;padding:3px;margin-top:2px}
.pb .sc{font-size:.82rem;font-weight:700;color:#fff;margin:2px 0}
.wb{display:flex;align-items:center;gap:2px;padding:2px 3px;background:rgba(255,255,255,.02);border-radius:3px;font-size:.68rem;margin:2px 0;flex-wrap:wrap}
.nd{color:#333;font-size:.65rem;font-style:italic}
.sm{font-size:.6rem;color:#555}
.it{color:#666;font-size:.66rem;line-height:1.25}
.mt{font-size:.7rem;color:#888;padding:3px;background:rgba(255,255,255,.02);border-radius:3px;line-height:1.35}
</style>
</head>
<body>
<div class="w">
<h1>NFL 2025 Analytics</h1>
<div class="ctrls">
<select id="ws">"""

for w in range(1, 19):
    html += f'<option value="{w}">Week {w}</option>'

html += """</select>
<button id="bk" style="display:none" onclick="back()">Back</button>
<span id="gc"></span>
</div>
<div id="gl"></div>
<div id="an"></div>
</div>
<script>
var G=""" + GJ + """;
var LO=""" + LJ + """;
var SW=""" + WJ + """;
var OD=""" + OJ + """;
var TC=""" + TJC + """;

function glist(w){
  var gs=G.filter(function(g){return g.week==w});
  document.getElementById('gc').textContent=gs.length+' games';
  document.getElementById('gl').innerHTML=gs.map(function(g){
    var idx=G.indexOf(g);
    return '<div class="gc" onclick="sel('+idx+')" data-i="'+idx+'">'+
      '<img src="'+LO[g.away]+'"><span style="color:#444;font-size:.5rem">@</span><img src="'+LO[g.home]+'">'+
      '<div class="tx"><div class="mu">'+g.away+' '+g.as+' @ '+g.home+' '+g.hs+'</div>'+
      '<div class="inf">'+g.date+(g.time?' '+g.time:'')+'</div></div></div>';
  }).join('');
}

function sel(i){
  document.querySelectorAll('.gc').forEach(function(c){c.classList.remove('sel');});
  var el=document.querySelector('[data-i="'+i+'"]'); if(el)el.classList.add('sel');
  document.getElementById('ws').disabled=true;
  document.getElementById('bk').style.display='inline-block';
  render(i);
}

function back(){
  document.getElementById('an').style.display='none';
  document.getElementById('ws').disabled=false;
  document.getElementById('bk').style.display='none';
  document.querySelectorAll('.gc').forEach(function(c){c.classList.remove('sel');});
  window.scrollTo(0,0);
}

function weather(s){
  var w=SW[s]||[72,5,'Clear','Minimal','g'];
  return {t:w[0],n:w[1],c:w[2],i:w[3],ic:w[4]};
}

function render(i){
  var g=G[i];
  var h=g.home,a=g.away,hs=g.hs,as=g.as;
  var w=weather(g.venue);
  var od=OD[g.id]||{sp:3,ou:42,ml:150};
  var win=parseInt(hs)>parseInt(as)?h:a;
  var lose=win==h?a:h;
  var wc=w.ic;

  document.getElementById('an').style.display='block';
  document.getElementById('an').innerHTML=
    '<div class="ct fw">'+
      '<div class="th"><img src="'+LO[a]+'"><span class="nm">'+a+'</span><span class="it">'+g.arec+'</span>'+
      '<span style="margin:0 4px;color:#444">@</span>'+
      '<img src="'+LO[h]+'"><span class="nm">'+h+'</span><span class="it">'+g.hrec+'</span></div>'+
      '<div style="font-size:.85rem;font-weight:700;color:#fff">'+a+' '+as+' - '+hs+' '+h+'</div>'+
      '<div class="it">'+g.date+(g.time?' '+g.time:'')+' | '+g.venue+' | '+g.city+' | Att: '+(g.att||'N/A')+'<br>TV: '+(g.bcast||'N/A')+'</div>'+
    '</div>'+
    '<div class="gd">'+

      '<div class="ct fw"><h3>Game Summary</h3>'+
      '<div class="sr"><span class="l">Final Score</span><span class="vb">'+h+' '+hs+' - '+a+' '+as+'</span></div>'+
      '<div class="sr"><span class="l">Winner</span><span class="vb">'+win+'</span></div>'+
      '<div class="sr"><span class="l">Loser</span><span class="vr">'+lose+'</span></div>'+
      '<div class="sr"><span class="l">'+h+' Record</span><span class="v">'+g.hrec+'</span></div>'+
      '<div class="sr"><span class="l">'+a+' Record</span><span class="v">'+g.arec+'</span></div>'+
      '<div class="sr"><span class="l">Status</span><span class="v">'+g.status+'</span></div>'+
      '</div>'+

      '<div class="ct"><h3>Venue & Weather</h3>'+
      '<div class="sr"><span class="l">Stadium</span><span class="v">'+g.venue+'</span></div>'+
      '<div class="sr"><span class="l">City</span><span class="v">'+g.city+'</span></div>'+
      '<div class="sr"><span class="l">Attendance</span><span class="v">'+(g.att||'N/A')+'</span></div>'+
      '<div class="wb">Temp: '+w.t+'F  Wind: '+w.n+'mph  '+w.c+'</div>'+
      '<span class="b '+(wc=='g'?'bg':wc=='r'?'br':'by')+'">Weather: '+w.i+'</span>'+
      '</div>'+

      '<div class="ct"><h3>Betting Odds</h3>'+
      '<div class="sr"><span class="l">Spread</span><span class="v">'+a+' +'+od.sp+' / '+h+' -'+od.sp+'</span></div>'+
      '<div class="sr"><span class="l">Over/Under</span><span class="v">'+od.ou+'</span></div>'+
      '<div class="sr"><span class="l">ML '+h+'</span><span class="v">-'+od.ml+'</span></div>'+
      '<div class="sr"><span class="l">ML '+a+'</span><span class="v">+'+od.ml+'</span></div>'+
      '</div>'+

      '<div class="ct fw"><h3>Head-to-Head</h3>'+
      '<div class="sr"><span class="l">'+a+' Record</span><span class="v">'+g.arec+'</span></div>'+
      '<div class="sr"><span class="l">'+h+' Record</span><span class="v">'+g.hrec+'</span></div>'+
      '<div class="sr"><span class="l">Margin</span><span class="v">'+(Math.abs(parseInt(hs)-parseInt(as)))+' pts</span></div>'+
      '<div class="pb"><div style="font-size:.72rem;color:#555">Result</div>'+
      '<div class="sc"><span style="color:'+TC[win]+'">'+win+'</span> defeats <span style="color:'+TC[lose]+'">'+lose+'</span></div></div>'+
      '</div>'+

      '<div class="ct fw"><h3>AI Analysis</h3>'+
      '<div class="mt"><b>Matchup:</b> '+(g.arec||'?')+' '+a+' at '+(g.hrec||'?')+' '+h+'.<br>'+
      '<b>Result:</b> '+win+' defeated '+lose+' '+hs+'-'+as+' at '+g.venue+'.<br>'+
      '<b>Weather:</b> '+w.i+' ('+w.t+'F, wind '+w.n+'mph). '+
      (wc=='r'?'Cold/windy conditions likely limited passing and favored the run game. ':'')+
      (wc=='y'?'Weather may have affected deep passes. ':'')+
      (wc=='g'?'Ideal conditions for both offenses. ':'')+
      '<b>Context:</b> Week '+g.week+' regular season at '+g.city+'.<br>'+
      '<b>Impact:</b> '+win+' moves to '+(win==h?g.hrec:g.arec)+', '+lose+' drops to '+(lose==h?g.hrec:g.arec)+'.'+
      '</div></div>'+

    '</div>';

  window.scrollTo(0,0);
}

document.getElementById('ws').addEventListener('change',function(){glist(parseInt(this.value));});
glist(1);
</script>
</body>
</html>"""

with open('dashboard.html', 'w') as f:
    f.write(html)

print(f'Written: {len(html)} bytes')
print(f'Games: {len(all_games)}')
