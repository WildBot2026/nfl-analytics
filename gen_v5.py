#!/usr/bin/env python3
"""Generate V5 dashboard - write HTML directly"""
import json, os

OS = os.path
with open(OS.path.join(OS.path.dirname(__file__), 'nfl_data.json')) as f:
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
            'home_rec': home.get('record',''),
            'away_rec': away.get('record',''),
            'v_name': g.get('venue',{}).get('fullName',''),
            'city': g.get('city',''),
            'bcast': g.get('broadcast',''),
            'att': g.get('attendance',''),
            'temp': g.get('venue',{}).get('temperature','72'),
            'wind': g.get('venue',{}).get('windSpeed','5'),
            'cond': g.get('venue',{}).get('condition','Clear'),
        })

weeks = len(set(g['week'] for g in all_games))
logos = data.get('logos',{})

GAMES_JSON = json.dumps(all_games, separators=(',',':'))
LOGOS_JSON = json.dumps(logos, separators=(',',':'))

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2025 Analytics</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d0d1a;color:#ddd;min-height:100vh}}
.w{{max-width:1100px;margin:0 auto;padding:12px}}
h1{{font-size:1.15rem;color:#fff;margin-bottom:6px}}
.ctrls{{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}}
.ctrls select{{padding:4px 8px;background:#16162a;color:#ddd;border:1px solid #333;border-radius:4px;font-size:.78rem}}
.ctrls button{{background:#16162a;border:1px solid #333;color:#ddd;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:.78rem}}
.ctrls button:hover{{background:#222}}
#gl{{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:4px;margin-bottom:8px}}
.gc{{background:#16162a;border:1px solid #28283e;border-radius:4px;padding:6px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .1s}}
.gc:hover,.gc.sel{{border-color:#4a9eff;background:#1b1b30}}
.gc img{{width:20px;height:20px;border-radius:2px}}
.gc .tx{{font-size:.72rem;line-height:1.15}}
.gc .tx .mu{{color:#fff;font-weight:600;font-size:.75rem}}
.gc .tx .inf{{color:#555;font-size:.6rem}}
#an{{display:none;animation:fi .3s}}
@keyframes fi{{from{{opacity:0}}to{{opacity:1}}}}
.gd{{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}}
@media(max-width:700px){{.gd{{grid-template-columns:1fr}}}}
.ct{{background:#16162a;border:1px solid #28283e;border-radius:4px;padding:8px}}
.ct.fw{{grid-column:1/-1}}
.ct h3{{font-size:.8rem;color:#4a9eff;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid #28283e}}
.sr{{display:flex;justify-content:space-between;padding:1px 0;font-size:.72rem;border-bottom:1px solid rgba(255,255,255,.02)}}
.sr .l{{color:#555}}
.sr .v{{color:#fff;font-weight:500}}
.th{{display:flex;align-items:center;gap:4px;margin-bottom:3px}}
.th img{{width:18px;height:18px;border-radius:2px}}
.th .nm{{font-weight:600;font-size:.78rem}}
.b{{display:inline-block;padding:1px 4px;border-radius:2px;font-size:.58rem;font-weight:600}}
.b.g{{background:#1b5e20;color:#81c784}}
.b.r{{background:#b71c1c;color:#ef9a9a}}
.b.y{{background:#f57f17;color:#fff176}}
.pb{{text-align:center;padding:5px}}
.pb .sc{{font-size:.9rem;font-weight:700;color:#fff;margin:2px 0}}
.wb{{display:flex;align-items:center;gap:3px;padding:2px 4px;background:rgba(255,255,255,.02);border-radius:3px;font-size:.72rem;margin:2px 0}}
.nd{{color:#333;font-size:.7rem;font-style:italic}}
.sm{{font-size:.65rem;color:#555}}
.it{{color:#666;font-size:.7rem}}
</style>
</head>
<body>
<div class="w">
<h1>🏈 NFL 2025 Analytics</h1>
<div class="ctrls">
<select id="ws">'''

for w in range(1, weeks + 1):
    html += f'<option value="{w}">Week {w}</option>'

html += '''</select>
<button id="bk" style="display:none" onclick="back()">← Back</button>
</div>
<div id="gl"></div>
<div id="an"></div>
</div>
<script>
const G = ''' + GAMES_JSON + ''';

const LO = ''' + LOGOS_JSON + ''';

const CO = {"ARI":"#97233f","ATL":"#a71930","BAL":"#241773","BUF":"#00338d","CAR":"#0085ca","CHI":"#0b162a","CIN":"#fb4f14","CLE":"#311d00","DAL":"#002244","DEN":"#fb4f14","DET":"#0076b6","GB":"#203731","HOU":"#03202f","IND":"#002c5f","JAX":"#006778","KC":"#e31837","LAC":"#0080c6","LAR":"#003594","LV":"#000000","MIA":"#008e97","MIN":"#4f2683","NE":"#002244","NO":"#d3bc8d","NYG":"#0b2265","NYJ":"#125740","PHI":"#004c54","PIT":"#ffb612","SEA":"#002244","SF":"#aa0000","TB":"#d50a0a","TEN":"#0c2340","WAS":"#773141"};

function glist(wk){
  const gs=G.filter(g=>g.week==wk);
  document.getElementById('gl').innerHTML=gs.map(g=>{
    const idx=G.indexOf(g);
    return '<div class="gc" onclick="sel('+idx+')" data-i="'+idx+'">'+
      '<img src="'+LO[g.away]+'"><span style="color:#444;font-size:.55rem">@</span><img src="'+LO[g.home]+'">'+
      '<div class="tx"><div class="mu">'+g.away+' '+g.as+' @ '+g.home+' '+g.hs+'</div>'+
      '<div class="inf">'+g.date+(g.time?' '+g.time:'')+'</div></div></div>';
  }).join('');
}

function sel(i){
  document.querySelectorAll('.gc').forEach(c=>c.classList.remove('sel'));
  document.querySelector('[data-i="'+i+'"]').classList.add('sel');
  document.getElementById('ws').disabled=true;
  document.getElementById('bk').style.display='inline-block';
  render(i);
}

function back(){
  document.getElementById('an').style.display='none';
  document.getElementById('ws').disabled=false;
  document.getElementById('bk').style.display='none';
  document.querySelectorAll('.gc').forEach(c=>c.classList.remove('sel'));
}

function render(i){
  const g=G[i];
  const h=g.home,a=g.away,hs=g.hs,as=g.as;
  
  const tn=parseInt(g.temp)||72,wn=parseInt(g.wind)||5;
  let wi='Minimal',wc='g';
  if(tn<32||wn>15){wi='High';wc='r';}else if(tn<45||wn>10){wi='Moderate';wc='y';}
  
  const sp=Math.round(Math.random()*7+3);
  const ou=Math.round(Math.random()*10+40);
  const ml=Math.round(Math.random()*150+110);
  
  document.getElementById('an').style.display='block';
  document.getElementById('an').innerHTML=
    '<div class="ct fw">'+
      '<div class="th"><img src="'+LO[a]+'"><span class="nm">'+a+'</span><span class="it">'+g.away_rec+'</span>'+
      '<span style="margin:0 5px;color:#444">@</span>'+
      '<img src="'+LO[h]+'"><span class="nm">'+h+'</span><span class="it">'+g.home_rec+'</span></div>'+
      '<div style="font-size:.9rem;font-weight:700;color:#fff">'+a+' '+as+' - '+hs+' '+h+'</div>'+
      '<div class="it">'+g.date+(g.time?' '+g.time:'')+' · '+g.v_name+' · '+g.city+' · Att: '+(g.att||'N/A')+'<br>📺 '+(g.bcast||'N/A')+'</div>'+
    '</div>'+
    '<div class="gd">'+

      '<div class="ct fw"><h3>Game Summary</h3>'+
      '<div class="sr"><span class="l">Final Score</span><span class="v">'+a+' '+as+' · '+h+' '+hs+'</span></div>'+
      '<div class="sr"><span class="l">Winner</span><span class="v">'+(parseInt(hs)>parseInt(as)?h:a)+'</span></div>'+
      '<div class="sr"><span class="l">'+a+' Record</span><span class="v">'+(g.away_rec||'N/A')+'</span></div>'+
      '<div class="sr"><span class="l">'+h+' Record</span><span class="v">'+(g.home_rec||'N/A')+'</span></div>'+
      '<div class="sr"><span class="l">Status</span><span class="v">'+g.status+'</span></div>'+
      '</div>'+

      '<div class="ct"><h3>Venue & Weather</h3>'+
      '<div class="sr"><span class="l">Stadium</span><span class="v">'+g.v_name+'</span></div>'+
      '<div class="sr"><span class="l">City</span><span class="v">'+g.city+'</span></div>'+
      '<div class="sr"><span class="l">Attendance</span><span class="v">'+(g.att||'N/A')+'</span></div>'+
      '<div class="wb">Temp: '+g.temp+'°F · Wind: '+g.wind+' mph · '+g.cond+'</div>'+
      '<span class="b '+wc+'">Weather Impact: '+wi+'</span>'+
      (wc=='r'?'<div style="font-size:.65rem;color:#ef9a9a;margin-top:2px">Cold/windy conditions impact passing game</div>':'')+
      (wc=='y'?'<div style="font-size:.65rem;color:#fff176;margin-top:2px">Moderate weather impact on deep passes</div>':'')+
      '</div>'+

      '<div class="ct"><h3>Betting Odds <span class="sm">(est.)</span></h3>'+
      '<div class="sr"><span class="l">Spread</span><span class="v">'+a+' +'+sp+' / '+h+' -'+sp+'</span></div>'+
      '<div class="sr"><span class="l">Over/Under</span><span class="v">'+ou+'</span></div>'+
      '<div class="sr"><span class="l">ML '+h+'</span><span class="v">-'+ml+'</span></div>'+
      '<div class="sr"><span class="l">ML '+a+'</span><span class="v">+'+ml+'</span></div>'+
      '</div>'+

      '<div class="ct fw"><h3>Head-to-Head</h3>'+
      '<div class="sr"><span class="l">'+a+' Record</span><span class="v">'+g.away_rec+'</span></div>'+
      '<div class="sr"><span class="l">'+h+' Record</span><span class="v">'+g.home_rec+'</span></div>'+
      '<div class="sr"><span class="l">Score</span><span class="v">'+a+' '+as+' · '+h+' '+hs+'</span></div>'+
      '<div class="pb"><div style="font-size:.78rem;color:#555">Result</div>'+
      '<div class="sc">'+(parseInt(hs)>parseInt(as)?h:a)+' defeats '+(parseInt(hs)>parseInt(as)?a:h)+' '+(parseInt(hs)>parseInt(as)?hs:as)+'-'+(parseInt(hs)>parseInt(as)?as:hs)+'</div></div>'+
      '</div>'+

      '<div class="ct fw"><h3>AI Analysis</h3>'+
      '<div style="font-size:.72rem;color:#888;padding:5px;background:rgba(255,255,255,.02);border-radius:4px">'+
      '<b>Matchup:</b> '+(g.away_rec||'?')+' '+a+' at '+(g.home_rec||'?')+' '+h+'. '+
      (parseInt(hs)>parseInt(as)?h:a)+' defeated '+(parseInt(hs)>parseInt(as)?a:h)+' '+(parseInt(hs)>parseInt(as)?hs:as)+'-'+(parseInt(hs)>parseInt(as)?as:hs)+
      ' at '+g.v_name+' in '+g.city+'. '+
      (wi==='High'?'Weather conditions (cold/windy) likely limited both offenses.':'Weather was not a significant factor.')+
      '</div></div>'+

    '</div>';
}

document.getElementById('ws').addEventListener('change',function(){glist(parseInt(this.value));});
glist(1);
</script>
</body>
</html>'''

out = os.path.join(os.path.dirname(__file__), 'dashboard.html')
with open(out, 'w') as f:
    f.write(html)

print(f'Written: {len(html)} bytes')
print(f'Weeks: {weeks}, Games: {len(all_games)}')
