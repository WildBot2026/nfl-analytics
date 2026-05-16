#!/usr/bin/env python3
"""
🦅 NFL Ultimate Matchup Analyzer v2
Genera dashboard_um.js con TODO:
- Semana -> Juego -> Análisis completo
- Coaches, H2H, QB, Rankings, Players
"""

import json, os

DIR = os.path.dirname(__file__)

with open(f'{DIR}/data/coaches.json') as f: COACHES = json.load(f)
with open(f'{DIR}/data/qb_stats_2024.json') as f: QB_STATS = json.load(f)
with open(f'{DIR}/data/h2h_history.json') as f: H2H_DATA = json.load(f)
with open(f'{DIR}/data/team_stats.json') as f: TEAM_STATS = json.load(f)
with open(f'{DIR}/data/player_stats.json') as f: PLAYER_STATS = json.load(f)
with open(f'{DIR}/schedule_2026_complete.json') as f: SCHEDULE = json.load(f)

TEAM_NAMES = {
    'ARI':'Arizona Cardinals','ATL':'Atlanta Falcons','BAL':'Baltimore Ravens',
    'BUF':'Buffalo Bills','CAR':'Carolina Panthers','CHI':'Chicago Bears',
    'CIN':'Cincinnati Bengals','CLE':'Cleveland Browns','DAL':'Dallas Cowboys',
    'DEN':'Denver Broncos','DET':'Detroit Lions','GB':'Green Bay Packers',
    'HOU':'Houston Texans','IND':'Indianapolis Colts','JAX':'Jacksonville Jaguars',
    'KC':'Kansas City Chiefs','LV':'Las Vegas Raiders','LAC':'Los Angeles Chargers',
    'LAR':'Los Angeles Rams','MIA':'Miami Dolphins','MIN':'Minnesota Vikings',
    'NE':'New England Patriots','NO':'New Orleans Saints','NYG':'New York Giants',
    'NYJ':'New York Jets','PHI':'Philadelphia Eagles','PIT':'Pittsburgh Steelers',
    'SEA':'Seattle Seahawks','SF':'San Francisco 49ers','TB':'Tampa Bay Buccaneers',
    'TEN':'Tennessee Titans','WAS':'Washington Commanders'
}

DIVISIONS_JSON = json.dumps({
    'NFC East': ['DAL','NYG','PHI','WAS'],
    'NFC North': ['CHI','DET','GB','MIN'],
    'NFC South': ['ATL','CAR','NO','TB'],
    'NFC West': ['ARI','LAR','SF','SEA'],
    'AFC East': ['BUF','MIA','NE','NYJ'],
    'AFC North': ['BAL','CIN','CLE','PIT'],
    'AFC South': ['HOU','IND','JAX','TEN'],
    'AFC West': ['DEN','KC','LV','LAC']
})

# Build rankings from team_stats
def get_rank(abbr, field, subfield='total'):
    ts = TEAM_STATS.get(abbr, {})
    cat = ts.get(field, {})
    v = cat.get(subfield, 0) if isinstance(cat, dict) else 0
    if isinstance(v, dict): v = v.get('total', 0)
    return float(v) if v else 0

def rank_teams(field, subfield='total', reverse=True):
    entries = [(abbr, get_rank(abbr, field, subfield)) for abbr in TEAM_NAMES]
    entries.sort(key=lambda x: x[1], reverse=reverse)
    return {abbr: i+1 for i, (abbr, _) in enumerate(entries)}

pass_yds_rank = rank_teams('passing', 'netPassingYards')
rush_yds_rank = rank_teams('rushing', 'rushingYards')
def_sacks_rank = rank_teams('defensive', 'sacks')
def_ints_rank = rank_teams('defensiveInterceptions', 'interceptions')
def_pd_rank = rank_teams('defensive', 'passesDefended')

# Team rankings for passing yards allowed (defense perspective)
# From passing stats of opponents
pass_allowed_rank = rank_teams('passing', 'netPassingYards', reverse=False)

# Player stats: build clean lookup
def clean_players():
    result = {}
    for pos, players in PLAYER_STATS.items():
        for p in players:
            t = p.get('team','')
            if t not in result:
                result[t] = {'WR':[],'RB':[],'TE':[],'LB':[],'CB':[],'S':[]}
            if pos in result[t]:
                result[t][pos].append({k:v for k,v in p.items() if k != 'team'})
    return result

TEAM_PLAYERS = clean_players()

# Build JS content
js = f'''
(function(){{
'use strict';
const SCHEDULE_UM = {json.dumps(SCHEDULE)};
const QB_DATA = {json.dumps(QB_STATS)};
const COACH = {json.dumps(COACHES)};
const TN = {json.dumps(TEAM_NAMES)};
const DIVS = {DIVISIONS_JSON};
const TP = {json.dumps(TEAM_PLAYERS)};
const H2H = {json.dumps(H2H_DATA)};

const PR = {json.dumps(pass_yds_rank)};
const RR = {json.dumps(rush_yds_rank)};
const SR = {json.dumps(def_sacks_rank)};
const IR = {json.dumps(def_ints_rank)};
const PDR = {json.dumps(def_pd_rank)};

const DIV_ORDER = Object.keys(DIVS);
const TAI = {{}}; for(const[k,v]of Object.entries(TN))TAI[v]=k;
const QB_BY_T = {{}}; QB_DATA.forEach(q=>QB_BY_T[q.team]=q);
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

let selGame = null;

function setup(){{
  const nav=document.querySelector('.nav');if(!nav){{setTimeout(setup,500);return;}}
  const btn=document.createElement('button');
  btn.textContent='🎯 Matchups II';
  btn.onclick=()=>showTab('um2');
  const btns=nav.querySelectorAll('button');
  nav.insertBefore(btn,btns[btns.length-1]);
  const tab=document.createElement('div');
  tab.id='tab-um2';tab.className='content hidden';
  const st=document.getElementById('tab-schedule');
  if(st)st.parentNode.insertBefore(tab,st.nextSibling);
  const orig=window.showTab;
  window.showTab=function(n){{
    document.querySelectorAll('.content').forEach(e=>e.classList.add('hidden'));
    document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
    const t=document.getElementById('tab-'+n);if(t)t.classList.remove('hidden');
    document.querySelectorAll('.nav button').forEach(b=>{{
      const txt=b.textContent;
      if(txt.includes('Matchups')&&(n==='um2'))b.classList.add('active');
      else if(txt.includes('Schedule')&&n==='schedule')b.classList.add('active');
      else if(txt.includes('Teams')&&n==='teams')b.classList.add('active');
      else if(txt.includes('Stats')&&n==='stats')b.classList.add('active');
      else if(txt.includes('Rosters')&&n==='rosters')b.classList.add('active');
    }});
    if(n==='schedule'&&typeof renderSchedule==='function')renderSchedule();
    if(n==='um2')render();
  }};
}}

function r(v){{return v||0;}}
function gRank(rankObj,abbr){{const r=rankObj[abbr];return r?'#'+r:'-';}}

function render(){{
  const tab=document.getElementById('tab-um2');if(!tab)return;
  const wk=Object.keys(SCHEDULE_UM).sort((a,b)=>parseInt(a)-parseInt(b));
  let h='<div class="filters" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center">';
  h+='<label style="color:#7a8ba8;font-size:13px">Week:</label>';
  h+='<select id="um2w" onchange="selW()" style="background:#0f1a30;color:#c8d6e5;border:1px solid #1e3050;border-radius:6px;padding:8px 12px">';
  wk.forEach(w=>h+='<option value="'+w+'">Week '+w+'</option>');h+='</select>';
  h+='<label style="color:#7a8ba8;font-size:13px">Team:</label>';
  h+='<select id="um2t" onchange="selW()" style="background:#0f1a30;color:#c8d6e5;border:1px solid #1e3050;border-radius:6px;padding:8px 12px">';
  h+='<option value="all">All</option>';
  DIV_ORDER.forEach(d=>{{h+='<optgroup label="─ '+d+' ─">';DIVS[d].forEach(t=>h+='<option value="'+t+'">'+TN[t]+'</option>');h+='</optgroup>';}});
  h+='</select></div><div id="um2g"></div><div id="um2d" style="display:none"></div>';
  tab.innerHTML=h;addCSS();selW();
}}

function addCSS(){{
  if(document.getElementById('um2c'))return;
  const s=document.createElement('style');s.id='um2c';
  s.textContent=`.ug{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}}
.ugm{{background:#111d35;border:1px solid #1e3050;border-radius:8px;padding:10px;cursor:pointer;transition:all .15s}}
.ugm:hover{{border-color:#4fc3f7;background:#162040}}
.ugm.sel{{border-color:#ffd54f;background:#1a2545}}
.ugt{{color:#7a8ba8;font-size:10px;margin-bottom:3px}}
.ugtm{{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;color:#e8eef5}}
.ugv{{color:#4fc3f7;font-size:10px;margin:0 6px}}
.ugn{{color:#7a8ba8;font-size:10px;margin-top:3px}}
.ud{{background:#0a0e17;border:1px solid #2d4a7a;border-radius:10px;padding:18px;margin-top:14px}}
.udh{{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #2d4a7a}}
.udt{{color:#4fc3f7;font-size:16px;font-weight:700}}
.udm{{color:#7a8ba8;font-size:11px}}
.uc{{background:#1e3050;border:none;color:#ff7043;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px}}
.us{{background:#111d35;border:1px solid #1e3050;border-radius:8px;padding:12px;margin-bottom:10px}}
.ust{{color:#ffd54f;font-size:12px;font-weight:600;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #1e3050}}
.u2{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.utb{{background:#0f1a30;border-radius:6px;padding:8px}}
.utt{{color:#fff;font-size:12px;font-weight:600;margin-bottom:5px}}
.uco{{font-size:10px;color:#7a8ba8;padding:1px 0}}
.uco span{{color:#c8d6e5}}
.usr{{display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #0a0e17}}
.usl{{color:#7a8ba8}}
.usv{{color:#c8d6e5;font-weight:500}}
.upb{{background:#0a0e17;border-radius:4px;padding:5px;font-size:10px;margin:2px 0}}
.upn{{color:#fff;font-weight:500}}
.ups{{color:#7a8ba8;font-size:9px}}
.uqh{{color:#4fc3f7;font-size:11px;font-weight:600}}
.uqs{{font-size:10px;color:#7a8ba8;padding:1px 0}}
.uqs span{{color:#c8d6e5}}
.upj{{color:#ffd54f;font-size:10px;padding:5px;background:#0a0e17;border-radius:4px;margin-top:5px}}
.ub{{display:flex;align-items:center;gap:5px;font-size:10px;margin:2px 0}}
.ubl{{color:#7a8ba8;min-width:45px}}
.ubb{{flex:1;height:4px;background:#1a2744;border-radius:3px;overflow:hidden}}
.ubf{{height:100%;background:linear-gradient(90deg,#4fc3f7,#29b6f6);border-radius:3px}}
.ubg{{background:linear-gradient(90deg,#66bb6a,#43a047)}}`;
  document.head.appendChild(s);
}}

window.selW=function(){{
  const w=document.getElementById('um2w')?.value||'1';
  const tf=document.getElementById('um2t')?.value||'all';
  const g=document.getElementById('um2g');if(!g)return;
  const gs=SCHEDULE_UM[w]||[];
  let h='<div class="ug">';
  for(const gm of gs){{
    const aa=TAI[gm.away]||gm.awayAbbr,ha=TAI[gm.home]||gm.homeAbbr;
    if(tf!=='all'&&aa!==tf&&ha!==tf)continue;
    const is=selGame&&selGame.id===gm.id&&selGame.week===w;
    h+='<div class="ugm'+(is?' sel':'')+'" onclick="selG('+gm.id+')"><div class="ugt">'+gm.day.slice(0,3)+' '+gm.date.slice(5)+' '+gm.time+'</div><div class="ugtm"><span>'+gm.awayAbbr+'</span><span class="ugv">@</span><span>'+gm.homeAbbr+'</span></div><div class="ugn">'+gm.network+'</div></div>';
  }}
  h+='</div>';g.innerHTML=h;
  if(selGame)renderDet();
}}

window.selG=function(id){{
  const w=document.getElementById('um2w')?.value||'1';
  const gs=SCHEDULE_UM[w]||[];
  const g=gs.find(x=>x.id===id);if(!g)return;
  selGame={{...g,week:w}};selW();renderDet();
}}

function closeD(){{selGame=null;document.getElementById('um2d').style.display='none';selW();}}

function renderDet(){{
  const d=document.getElementById('um2d');if(!d||!selGame)return;
  d.style.display='block';
  const g=selGame,aa=TAI[g.away]||g.awayAbbr,ha=TAI[g.home]||g.homeAbbr;
  let h='<div class="ud"><div class="udh"><div><div class="udt">'+g.awayAbbr+' @ '+g.homeAbbr+'</div><div class="udm">'+g.day+' '+g.date+' • '+g.time+' ET • '+g.network+' • W'+g.week+'</div></div><button class="uc" onclick="closeD()">✕</button></div>';

  // COACHES
  h+='<div class="us"><div class="ust">👔 Coaches</div><div class="u2">';
  [aa,ha].forEach(a=>{{
    const c=COACH[a]||{{}};
    h+='<div class="utb"><div class="utt">'+TN[a]+'</div><div class="uco">HC: <span>'+(c.HC||'?')+'</span></div><div class="uco">OC: <span>'+(c.OC||'?')+'</span></div><div class="uco">DC: <span>'+(c.DC||'?')+'</span></div></div>';
  }});
  h+='</div></div>';

  // H2H
  h+='<div class="us"><div class="ust">📊 H2H (2020-24)</div><div class="u2">';
  [[aa,ha],[ha,aa]].forEach(([a,o])=>{{
    const key=[a,o].sort().join(',');const hd=H2H.teamH2H[key];
    if(hd){{
      const w=hd.games.filter(x=>x.winner===a).length;
      const l=hd.games.filter(x=>x.winner===o).length;
      h+='<div class="utb"><div class="utt">'+TN[a]+' vs '+TN[o]+'</div>';
      h+='<div style="font-size:22px;font-weight:700;margin:6px 0"><span style="color:'+(w>l?'#66bb6a':'#ff7043')+'">'+w+'</span><span style="color:#7a8ba8">-</span><span style="color:'+(l>w?'#66bb6a':'#ff7043')+'">'+l+'</span></div>';
      hd.games.slice(-5).reverse().forEach(g2=>{{
        const iw=g2.winner===a;
        h+='<div style="font-size:9px;padding:1px 0;'+(iw?'color:#66bb6a':'color:#ff7043')+'">'+g2.date.slice(5)+': '+g2.away+' '+g2.awayScore+'-'+g2.homeScore+' '+g2.home+'</div>';
      }});
      h+='</div>';
    }}
  }});
  h+='</div></div>';

  // QB
  const qa=QB_BY_T[aa],qh=QB_BY_T[ha];
  h+='<div class="us"><div class="ust">🎯 QB 2024</div><div class="u2">';
  [[qa,aa,ha],[qh,ha,aa]].forEach(([qb,abbr,opp])=>{{
    if(!qb){{h+='<div class="utb"><div class="utt">'+TN[abbr]+'</div><div style="color:#7a8ba8;font-size:10px">No top-25 QB data</div></div>';return;}}
    h+='<div class="utb"><div class="utt">'+TN[abbr]+'</div><div class="uqh">'+qb.name+'</div>';
    h+='<div class="uqs">Yards: <span>'+qb.yards+'</span> | TD: <span>'+qb.td+'</span> | INT: <span>'+qb.int+'</span></div>';
    h+='<div class="uqs">Rate: <span>'+qb.rate+'</span> | Deep: <span>'+(qb.deep_pct||0)+'%</span> | 20+: <span>'+qb.twenty_plus+'</span></div>';
    const qh2=H2H.qbH2H&&H2H.qbH2H[qb.name]?H2H.qbH2H[qb.name][opp]:null;
    if(qh2)h+='<div class="upj">vs '+TN[opp]+': '+qh2.wins+'W-'+qh2.losses+'L</div>';
    h+='<div class="ub"><span class="ubl">Yds</span><div class="ubb"><div class="ubf" style="width:'+Math.round(qb.yards/5000*100)+'%"></div></div><span style="color:#c8d6e5;font-size:9px">'+qb.yards+'</span></div>';
    h+='<div class="ub"><span class="ubl">Rate</span><div class="ubb"><div class="ubf ubg" style="width:'+Math.round(qb.rate)+'%"></div></div><span style="color:#c8d6e5;font-size:9px">'+qb.rate+'</span></div>';
    h+='</div>';
  }});
  h+='</div></div>';

  // RANKINGS
  h+='<div class="us"><div class="ust">📈 Rankings (#)</div><div class="u2">';
  [aa,ha].forEach(a=>{{
    h+='<div class="utb"><div class="utt">'+TN[a]+'</div>';
    h+='<div class="usr"><span class="usl">Pass Yds</span><span class="usv">'+gRank(PR,a)+'</span></div>';
    h+='<div class="usr"><span class="usl">Rush Yds</span><span class="usv">'+gRank(RR,a)+'</span></div>';
    h+='<div class="usr"><span class="usl">Sacks</span><span class="usv">'+gRank(SR,a)+'</span></div>';
    h+='<div class="usr"><span class="usl">INTs</span><span class="usv">'+gRank(IR,a)+'</span></div>';
    h+='<div class="usr"><span class="usl">PD</span><span class="usv">'+gRank(PDR,a)+'</span></div>';
    h+='</div>';
  }});
  h+='</div></div>';

  // OFFENSIVE PLAYERS
  h+='<div class="us"><div class="ust">🔥 Top Players</div><div class="u2">';
  [aa,ha].forEach(a=>{{
    h+='<div class="utb"><div class="utt">'+TN[a]+'</div>';
    const wr=(TP[a]&&TP[a].WR)||[],rb=(TP[a]&&TP[a].RB)||[],te=(TP[a]&&TP[a].TE)||[];
    const lb=(TP[a]&&TP[a].LB)||[],cb=(TP[a]&&TP[a].CB)||[],ss=(TP[a]&&TP[a].S)||[];
    if(wr.length){{h+='<div style="font-size:9px;color:#4fc3f7;margin-top:3px">WR:</div>';wr.slice(0,3).forEach(p=>h+='<div class="upb"><span class="upn">'+p.name+'</span> <span class="ups">'+(p.rec||0)+'rec '+(p.yds||0)+'yd '+(p.td||0)+'TD</span></div>');}}
    if(rb.length){{h+='<div style="font-size:9px;color:#4fc3f7;margin-top:3px">RB:</div>';rb.slice(0,1).forEach(p=>h+='<div class="upb"><span class="upn">'+p.name+'</span> <span class="ups">'+(p.att||0)+'att '+(p.yds||0)+'yd '+(p.td||0)+'TD</span></div>');}}
    if(te.length){{h+='<div style="font-size:9px;color:#4fc3f7;margin-top:3px">TE:</div>';te.slice(0,1).forEach(p=>h+='<div class="upb"><span class="upn">'+p.name+'</span> <span class="ups">'+(p.rec||0)+'rec '+(p.yds||0)+'yd '+(p.td||0)+'TD</span></div>');}}
    if(!wr.length&&!rb.length&&!te.length)h+='<div style="color:#7a8ba8;font-size:9px">No 2024 data</div>';
    h+='<div style="font-size:9px;color:#ff7043;margin-top:4px">DEF:</div>';
    if(lb.length)lb.slice(0,4).forEach(p=>h+='<div class="upb"><span class="upn">'+p.name+'</span> <span class="ups">'+(p.tackles||0)+'tkl '+(p.sacks||0)+'sck '+(p.int||0)+'INT</span></div>');
    if(cb.length)cb.slice(0,2).forEach(p=>h+='<div class="upb"><span class="upn">'+p.name+'</span> <span class="ups">'+(p.tackles||0)+'tkl '+(p.int||0)+'INT '+(p.pd||0)+'PD</span></div>');
    if(ss.length)ss.slice(0,1).forEach(p=>h+='<div class="upb"><span class="upn">'+p.name+'</span> <span class="ups">'+(p.tackles||0)+'tkl '+(p.int||0)+'INT '+(p.pd||0)+'PD</span></div>');
    if(!lb.length&&!cb.length&&!ss.length)h+='<div style="color:#7a8ba8;font-size:9px">No 2024 data</div>';
    h+='</div>';
  }});
  h+='</div></div>';

  h+='</div>';d.innerHTML=h;
}}

window.addEventListener('DOMContentLoaded',setup);
}})();
'''

# Inject into dashboard
dashboard_path = f'{DIR}/dashboard_2026.html'
with open(dashboard_path, 'r') as f:
    html = f.read()

# Remove old UM script tags
for tag in ['dashboard_matchups.js', 'dashboard_h2h.js', 'dashboard_um.js']:
    html = html.replace(f'<script src="{tag}"></script>\n', '')
    html = html.replace(f'<script src="{tag}"></script>', '')

# Inject new script
inject = '\n<script>\n' + js + '\n</script>\n'
idx = html.rfind('</body>')
if idx > 0:
    html = html[:idx] + inject + html[idx:]
else:
    html += inject

with open(dashboard_path, 'w') as f:
    f.write(html)

print(f'✅ Dashboard updated: {len(html)/1024:.1f} KB')
print(f'   JS injected: {len(js)/1024:.1f} KB')
