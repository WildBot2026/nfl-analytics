#!/usr/bin/env python3
"""
Build Ultimate Matchup analyzer con roster real de ESPN.
Inyecta la pestaña Matchups III en dashboard_2026.html
"""
import json, os, subprocess

DIR = os.path.dirname(__file__)

with open(f'{DIR}/data/coaches.json') as f: COACHES = json.load(f)
with open(f'{DIR}/data/qb_stats_2024.json') as f: QB_STATS = json.load(f)
with open(f'{DIR}/data/h2h_history.json') as f: H2H_DATA = json.load(f)
with open(f'{DIR}/data/team_stats.json') as f: TEAM_STATS = json.load(f)
with open(f'{DIR}/data/rosters_complete.json') as f: ROSTERS = json.load(f)
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
DIVISIONS = {
    'NFC East': ['DAL','NYG','PHI','WAS'], 'NFC North': ['CHI','DET','GB','MIN'],
    'NFC South': ['ATL','CAR','NO','TB'], 'NFC West': ['ARI','LAR','SF','SEA'],
    'AFC East': ['BUF','MIA','NE','NYJ'], 'AFC North': ['BAL','CIN','CLE','PIT'],
    'AFC South': ['HOU','IND','JAX','TEN'], 'AFC West': ['DEN','KC','LV','LAC']
}
DIV_ORDER = list(DIVISIONS.keys())

def get_ts_val(abbr, cat, sub='total'):
    ts = TEAM_STATS.get(abbr, {})
    c = ts.get(cat, {})
    v = c.get(sub, 0) if isinstance(c, dict) else 0
    if isinstance(v, dict): v = v.get('total', 0)
    return float(v) if v else 0

def rank_teams(cat, sub='total', rev=True):
    entries = [(a, get_ts_val(a, cat, sub)) for a in TEAM_NAMES]
    entries.sort(key=lambda x: x[1], reverse=rev)
    return {a: i+1 for i, (a, _) in enumerate(entries)}

RANKINGS = {
    'passYds': rank_teams('passing', 'netPassingYards'),
    'rushYds': rank_teams('rushing', 'rushingYards'),
    'sacks': rank_teams('defensive', 'sacks'),
    'ints': rank_teams('defensiveInterceptions', 'interceptions'),
    'pd': rank_teams('defensive', 'passesDefended'),
}

def build_team_players():
    result = {}
    for abbr in TEAM_NAMES:
        td = ROSTERS.get(abbr, {})
        plyrs = td.get('players', {})
        all_p = (plyrs.get('offense', [])or[]) + (plyrs.get('defense', [])or[]) + (plyrs.get('specialTeam',[])or[])
        def by_pos(pos): return [p for p in all_p if p.get('position')==pos]
        def fmt(ps): return [{'name':f"{p['firstName']} {p['lastName']}",'jersey':p.get('jersey',''),'age':p.get('age',''),'exp':p.get('experience','')} for p in ps]
        qbs = [f"{p['firstName']} {p['lastName']}" for p in by_pos('QB')[:3]]
        result[abbr] = {
            'QBs': qbs, 'WRs': fmt(by_pos('WR')[:3]), 'RBs': fmt(by_pos('RB')[:2]),
            'TEs': fmt(by_pos('TE')[:2]), 'LBs': fmt(by_pos('LB')[:4]),
            'CBs': fmt(by_pos('CB')[:2]), 'Ss': fmt(by_pos('S')[:2]),
        }
    return result

TEAM_PLAYERS = build_team_players()

js = f'''
(function(){{
'use strict';
const SCH = {json.dumps(SCHEDULE)};
const QBD = {json.dumps(QB_STATS)};
const CO = {json.dumps(COACHES)};
const TN = {json.dumps(TEAM_NAMES)};
const DV = {json.dumps(DIVISIONS)};
const DO = {json.dumps(DIV_ORDER)};
const RK = {json.dumps(RANKINGS)};
const TP = {json.dumps(TEAM_PLAYERS)};
const H2 = {json.dumps(H2H_DATA)};
const TAI = {{}}; for(const[k,v]of Object.entries(TN))TAI[v]=k;
const QBT = {{}}; QBD.forEach(q=>QBT[q.team]=q);
let sel=null;
function addCss(){{
if(document.getElementById('um3c'))return;
const s=document.createElement('style');s.id='um3c';
s.textContent=`.ug{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}}
.ugm{{background:#111d35;border:1px solid #1e3050;border-radius:8px;padding:10px;cursor:pointer;transition:all.15s}}
.ugm:hover{{border-color:#4fc3f7;background:#162040}}
.ugm.s{{border-color:#ffd54f;background:#1a2545}}
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
.utt{{color:#e8eef5;font-size:12px;font-weight:600;margin-bottom:5px}}
.uco{{font-size:10px;color:#7a8ba8;padding:1px 0}}
.uco span{{color:#c8d6e5}}
.usr{{display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid #0a0e17}}
.usl{{color:#7a8ba8}}
.usv{{color:#c8d6e5;font-weight:500}}
.upb{{background:#0a0e17;border-radius:4px;padding:3px 6px;font-size:10px;margin:2px 0;display:inline-block}}
.upn{{color:#e8eef5;font-weight:500;font-size:10px}}
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
function gr(o,a){{const r=o[a];return r?'#'+r:'-';}}
function setup(){{
const nav=document.querySelector('.nav');if(!nav){{setTimeout(setup,500);return;}}
const btn=document.createElement('button');btn.textContent='🎯 Matchups III';
btn.onclick=()=>showTab('um3');
const bs=nav.querySelectorAll('button');nav.insertBefore(btn,bs[bs.length-1]);
const tb=document.createElement('div');tb.id='tab-um3';tb.className='content hidden';
const st=document.getElementById('tab-schedule');
if(st)st.parentNode.insertBefore(tb,st.nextSibling);
const orig=window.showTab;
window.showTab=function(n){{
document.querySelectorAll('.content').forEach(e=>e.classList.add('hidden'));
document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
const t=document.getElementById('tab-'+n);if(t)t.classList.remove('hidden');
document.querySelectorAll('.nav button').forEach(b=>{{const x=b.textContent;if(x.includes('Matchups')&&n.includes('um'))b.classList.add('active');else if(x.includes('Schedule')&&n==='schedule')b.classList.add('active');else if(x.includes('Teams')&&n==='teams')b.classList.add('active');else if(x.includes('Stats')&&n==='stats')b.classList.add('active');else if(x.includes('Rosters')&&n==='rosters')b.classList.add('active');}});
if(n==='schedule'&&typeof renderSchedule==='function')renderSchedule();
if(n==='um3')render();
}};
}}
function render(){{
const tb=document.getElementById('tab-um3');if(!tb)return;
const wk=Object.keys(SCH).sort((a,b)=>parseInt(a)-parseInt(b));
let h='<div class="filters" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center">';
h+='<label style="color:#7a8ba8;font-size:13px">Week:</label>';
h+='<select id="uw" onchange="sw()" style="background:#0f1a30;color:#c8d6e5;border:1px solid #1e3050;border-radius:6px;padding:8px 12px">';
wk.forEach(w=>h+='<option value="'+w+'">W'+w+'</option>');h+='</select>';
h+='<label style="color:#7a8ba8;font-size:13px">Team:</label>';
h+='<select id="ut" onchange="sw()" style="background:#0f1a30;color:#c8d6e5;border:1px solid #1e3050;border-radius:6px;padding:8px 12px">';
h+='<option value="all">All</option>';
DO.forEach(d=>{{h+='<optgroup label="─ '+d+' ─">';DV[d].forEach(t=>h+='<option value="'+t+'">'+TN[t]+'</option>');h+='</optgroup>';}});
h+='</select></div><div id="ug"></div><div id="ud" style="display:none"></div>';
tb.innerHTML=h;addCss();sw();
}}
window.sw=function(){{
const w=document.getElementById('uw')?.value||'1';
const tf=document.getElementById('ut')?.value||'all';
const g=document.getElementById('ug');if(!g)return;
const gs=SCH[w]||[];
let h='<div class="ug">';
for(const gm of gs){{
const aa=TAI[gm.away]||gm.awayAbbr,ha=TAI[gm.home]||gm.homeAbbr;
if(tf!=='all'&&aa!==tf&&ha!==tf)continue;
const is=sel&&sel.id===gm.id&&sel.week===w;
h+='<div class="ugm'+(is?' s':'')+'" onclick="sg('+gm.id+')"><div class="ugt">'+(gm.day||'').slice(0,3)+' '+(gm.date||'').slice(5)+' '+gm.time+'</div><div class="ugtm"><span>'+gm.awayAbbr+'</span><span class="ugv">@</span><span>'+gm.homeAbbr+'</span></div><div class="ugn">'+gm.network+'</div></div>';
}}
h+='</div>';g.innerHTML=h;
if(sel)rd();
}}
window.sg=function(id){{
const w=document.getElementById('uw')?.value||'1';
const gs=SCH[w]||[];const g=gs.find(x=>x.id===id);if(!g)return;
sel={{...g,week:w}};sw();rd();
}}
function cl(){{sel=null;document.getElementById('ud').style.display='none';sw();}}
function rd(){{
const d=document.getElementById('ud');if(!d||!sel)return;
d.style.display='block';
const g=sel,aa=TAI[g.away]||g.awayAbbr,ha=TAI[g.home]||g.homeAbbr;
let h='<div class="ud"><div class="udh"><div><div class="udt">'+g.awayAbbr+' @ '+g.homeAbbr+'</div><div class="udm">'+g.day+' '+g.date+' • '+g.time+' ET • '+g.network+' • W'+g.week+'</div></div><button class="uc" onclick="cl()">✕ Close</button></div>';
h+='<div class="us"><div class="ust">👔 Coaches</div><div class="u2">';
[aa,ha].forEach(a=>{{const c=CO[a]||{{}};
h+='<div class="utb"><div class="utt">'+TN[a]+'</div><div class="uco">HC: <span>'+(c.HC||'?')+'</span></div><div class="uco">OC: <span>'+(c.OC||'?')+'</span></div><div class="uco">DC: <span>'+(c.DC||'?')+'</span></div></div>';}});
h+='</div></div>';
h+='<div class="us"><div class="ust">📊 H2H (2020-24)</div><div class="u2">';
[[aa,ha],[ha,aa]].forEach(([a,o])=>{{const k=[a,o].sort().join(',');const hd=H2.teamH2H[k];
if(hd){{const w=hd.games.filter(x=>x.winner===a).length,l=hd.games.filter(x=>x.winner===o).length;
h+='<div class="utb"><div class="utt">'+TN[a]+' vs '+TN[o]+'</div><div style="font-size:22px;font-weight:700;margin:6px 0"><span style="color:'+(w>l?'#66bb6a':'#ff7043')+'">'+w+'</span><span style="color:#7a8ba8">-</span><span style="color:'+(l>w?'#66bb6a':'#ff7043')+'">'+l+'</span></div>';
hd.games.slice(-5).reverse().forEach(g2=>{{const iw=g2.winner===a;
h+='<div style="font-size:9px;padding:1px 0;'+(iw?'color:#66bb6a':'color:#ff7043')+'">'+g2.date.slice(5)+': '+g2.awayAbbr+' '+g2.awayScore+'-'+g2.homeScore+' '+g2.homeAbbr+'</div>';}});
h+='</div>';}}));
h+='</div></div>';
const qa=QBT[aa],qh=QBT[ha];
h+='<div class="us"><div class="ust">🎯 QB 2024</div><div class="u2">';
[[qa,aa,ha],[qh,ha,aa]].forEach(([qb,abbr,opp])=>{{if(!qb){{h+='<div class="utb"><div class="utt">'+TN[abbr]+'</div><div style="color:#7a8ba8;font-size:10px">No top-25 QB data</div></div>';return;}}
h+='<div class="utb"><div class="utt">'+TN[abbr]+'</div><div class="uqh">'+qb.name+'</div>';
h+='<div class="uqs">Yards: <span>'+qb.yards+'</span> | TD: <span>'+qb.td+'</span> | INT: <span>'+qb.int+'</span></div>';
h+='<div class="uqs">Rate: <span>'+qb.rate+'</span> | Deep: <span>'+(qb.deep_pct||0)+'%</span> | 20+: <span>'+qb.twenty_plus+'</span></div>';
const qh2=H2.qbH2H&&H2.qbH2H[qb.name]?H2.qbH2H[qb.name][opp]:null;
if(qh2)h+='<div class="upj">vs '+TN[opp]+': '+qh2.wins+'W-'+qh2.losses+'L</div>';
h+='<div class="ub"><span class="ubl">Yds</span><div class="ubb"><div class="ubf" style="width:'+Math.round(qb.yards/5500*100)+'%"></div></div><span style="color:#c8d6e5;font-size:9px">'+qb.yards+'</span></div>';
h+='<div class="ub"><span class="ubl">Rate</span><div class="ubb"><div class="ubf ubg" style="width:'+Math.round(qb.rate*0.95)+'%"></div></div><span style="color:#c8d6e5;font-size:9px">'+qb.rate+'</span></div>';
h+='<div class="ub"><span class="ubl">Deep%</span><div class="ubb"><div class="ubf" style="width:'+Math.min(100,(qb.deep_pct||0)*4)+'%"></div></div><span style="color:#c8d6e5;font-size:9px">'+(qb.deep_pct||0)+'%</span></div>';
h+='</div>';}});
h+='</div></div>';
h+='<div class="us"><div class="ust">📈 Rankings (#)</div><div class="u2">';
[aa,ha].forEach(a=>{{h+='<div class="utb"><div class="utt">'+TN[a]+'</div>';
h+='<div class="usr"><span class="usl">Pass Yds</span><span class="usv">'+gr(RK.passYds,a)+'</span></div>';
h+='<div class="usr"><span class="usl">Rush Yds</span><span class="usv">'+gr(RK.rushYds,a)+'</span></div>';
h+='<div class="usr"><span class="usl">Sacks</span><span class="usv">'+gr(RK.sacks,a)+'</span></div>';
h+='<div class="usr"><span class="usl">INTs</span><span class="usv">'+gr(RK.ints,a)+'</span></div>';
h+='<div class="usr"><span class="usl">Pass Defl.</span><span class="usv">'+gr(RK.pd,a)+'</span></div></div>';}});
h+='</div></div>';
h+='<div class="us"><div class="ust">🔥 Roster (ESPN)</div><div class="u2">';
[aa,ha].forEach(a=>{{const p=TP[a]||{{}};
h+='<div class="utb"><div class="utt">'+TN[a]+'</div>';
if(p.QBs&&p.QBs.length){{h+='<div style="font-size:9px;color:#4fc3f7;margin-top:3px">QB:</div><div class="upb"><span class="upn">'+p.QBs.join(', ')+'</span></div>';}}
if(p.WRs&&p.WRs.length){{h+='<div style="font-size:9px;color:#66bb6a;margin-top:3px">WR:</div>';p.WRs.slice(0,3).forEach(w=>h+='<div class="upb"><span class="upn">#'+w.jersey+' '+w.name+'</span> <span class="ups">'+w.age+'yo</span></div>');}}
if(p.RBs&&p.RBs.length){{h+='<div style="font-size:9px;color:#66bb6a;margin-top:3px">RB:</div>';p.RBs.slice(0,2).forEach(r=>h+='<div class="upb"><span class="upn">#'+r.jersey+' '+r.name+'</span> <span class="ups">'+r.age+'yo</span></div>');}}
if(p.TEs&&p.TEs.length){{h+='<div style="font-size:9px;color:#66bb6a;margin-top:3px">TE:</div>';p.TEs.slice(0,1).forEach(t=>h+='<div class="upb"><span class="upn">#'+t.jersey+' '+t.name+'</span> <span class="ups">'+t.age+'yo</span></div>');}}
if(p.LBs&&p.LBs.length){{h+='<div style="font-size:9px;color:#ff7043;margin-top:4px">LB:</div>';p.LBs.slice(0,4).forEach(l=>h+='<div class="upb"><span class="upn">#'+l.jersey+' '+l.name+'</span> <span class="ups">'+l.age+'yo</span></div>');}}
if(p.CBs&&p.CBs.length){{h+='<div style="font-size:9px;color:#ff7043;margin-top:3px">CB:</div>';p.CBs.slice(0,2).forEach(c=>h+='<div class="upb"><span class="upn">#'+c.jersey+' '+c.name+'</span> <span class="ups">'+c.age+'yo</span></div>');}}
if(p.Ss&&p.Ss.length){{h+='<div style="font-size:9px;color:#ff7043;margin-top:3px">S:</div>';p.Ss.slice(0,1).forEach(s=>h+='<div class="upb"><span class="upn">#'+s.jersey+' '+s.name+'</span> <span class="ups">'+s.age+'yo</span></div>');}}
h+='</div>';}});
h+='</div></div></div>';
d.innerHTML=h;
}}
window.addEventListener('DOMContentLoaded',setup);
}})();
'''

# Inject into dashboard
dash_path = f'{DIR}/dashboard_2026.html'
with open(dash_path, 'r') as f:
    html = f.read()

# Remove old UM scripts
for tag in ['dashboard_matchups.js', 'dashboard_h2h.js', 'dashboard_um.js']:
    html = html.replace(f'<script src="{tag}"></script>\n', '')
    html = html.replace(f'<script src="{tag}"></script>', '')

# Inject new embedded script
inject_marker = '\n<!-- UM3 -->\n<script>\n' + js + '\n</script>\n'
idx = html.rfind('</body>')
html = html[:idx] + inject_marker + html[idx:]

with open(dash_path, 'w') as f:
    f.write(html)

print(f"✅ Dashboard updated: {len(html)/1024:.1f} KB")
print(f"   JS injected: {len(js)/1024:.1f} KB")

# Verify syntax
r = subprocess.run(['node', '-e', js[:2000] + '\nconsole.log("ok");'], capture_output=True, text=True, shell=False)
if r.returncode == 0:
    print("✅ Node syntax: OK")
else:
    print(f"⚠️  Syntax check: {r.stderr[:200]}")
