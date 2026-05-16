#!/usr/bin/env python3
"""Build the complete dashboard_2026.html with real NFL 2026 schedule."""
import json

with open("/tmp/nfl_data.json") as f:
    d = json.load(f)
tc, st, qb, df, ol = d["tc"], d["r"]["st"], d["r"]["qb"], d["r"]["df"], d["r"]["ol"]

S = {
1: [("NE","SEA","Wed Sep 9"),("SF","LAR","Thu Sep 10 (Melbourne)"),("CHI","CAR","Sun Sep 13"),("TB","CIN","Sun Sep 13"),("BAL","IND","Sun Sep 13"),("BUF","HOU","Sun Sep 13"),("NO","DET","Sun Sep 13"),("ATL","PIT","Sun Sep 13"),("CLE","JAX","Sun Sep 13"),("ARI","LAC","Sun Sep 13"),("GB","MIN","Sun Sep 13"),("MIA","LV","Sun Sep 13"),("WAS","PHI","Sun Sep 13"),("DAL","NYG","Sun Sep 13"),("NYJ","TEN","Sun Sep 13"),("DEN","KC","Mon Sep 14")],
2: [("DET","BUF","Thu Sep 17"),("MIN","CHI","Sun Sep 20"),("PHI","TEN","Sun Sep 20"),("GB","NYJ","Sun Sep 20"),("CAR","ATL","Sun Sep 20"),("NO","BAL","Sun Sep 20"),("CIN","HOU","Sun Sep 20"),("CLE","TB","Sun Sep 20"),("PIT","NE","Sun Sep 20"),("LV","LAC","Sun Sep 20"),("JAX","DEN","Sun Sep 20"),("WAS","DAL","Sun Sep 20"),("SEA","ARI","Sun Sep 20"),("MIA","SF","Sun Sep 20"),("IND","KC","Sun Sep 20"),("NYG","LAR","Mon Sep 21")],
3: [("ATL","GB","Thu Sep 24"),("KC","MIA","Sun Sep 27"),("HOU","IND","Sun Sep 27"),("TEN","NYG","Sun Sep 27"),("NE","JAX","Sun Sep 27"),("CIN","PIT","Sun Sep 27"),("CAR","CLE","Sun Sep 27"),("NYJ","DET","Sun Sep 27"),("SEA","WAS","Sun Sep 27"),("LAC","BUF","Sun Sep 27"),("MIN","TB","Sun Sep 27"),("ARI","SF","Sun Sep 27"),("BAL","DAL","Sun Sep 27 (Rio)"),("LV","NO","Sun Sep 27"),("LAR","DEN","Sun Sep 27"),("PHI","CHI","Mon Sep 28")],
4: [("PIT","CLE","Thu Oct 1"),("IND","WAS","Sun Oct 4 (London)"),("TEN","BAL","Sun Oct 4"),("ARI","NYG","Sun Oct 4"),("JAX","CIN","Sun Oct 4"),("NE","BUF","Sun Oct 4"),("DAL","HOU","Sun Oct 4"),("LAR","PHI","Sun Oct 4"),("GB","TB","Sun Oct 4"),("NYJ","CHI","Sun Oct 4"),("MIA","MIN","Sun Oct 4"),("DEN","SF","Sun Oct 4"),("LAC","SEA","Sun Oct 4"),("KC","LV","Sun Oct 4"),("DET","CAR","Sun Oct 4"),("ATL","NO","Mon Oct 5")],
5: [("TB","DAL","Thu Oct 8"),("PHI","JAX","Sun Oct 11 (London)"),("LV","NE","Sun Oct 11"),("HOU","TEN","Sun Oct 11"),("CLE","NYJ","Sun Oct 11"),("IND","PIT","Sun Oct 11"),("CIN","MIA","Sun Oct 11"),("MIN","NO","Sun Oct 11"),("NYG","WAS","Sun Oct 11"),("DEN","LAC","Sun Oct 11"),("CHI","GB","Sun Oct 11"),("DET","ARI","Sun Oct 11"),("SF","SEA","Sun Oct 11"),("BAL","ATL","Sun Oct 11"),("BUF","LAR","Mon Oct 12")],
6: [("SEA","DEN","Thu Oct 15"),("HOU","JAX","Sun Oct 18 (London)"),("NYJ","NE","Sun Oct 18"),("PIT","TB","Sun Oct 18"),("CAR","PHI","Sun Oct 18"),("CHI","ATL","Sun Oct 18"),("TEN","IND","Sun Oct 18"),("NO","NYG","Sun Oct 18"),("BAL","CLE","Sun Oct 18"),("ARI","LAR","Sun Oct 18"),("LAC","KC","Sun Oct 18"),("BUF","LV","Sun Oct 18"),("DAL","GB","Sun Oct 18"),("WAS","SF","Mon Oct 19")],
7: [("NE","CHI","Thu Oct 22"),("PIT","NO","Sun Oct 25 (Paris)"),("CLE","TEN","Sun Oct 25"),("MIA","NYJ","Sun Oct 25"),("IND","MIN","Sun Oct 25"),("CIN","BAL","Sun Oct 25"),("NYG","HOU","Sun Oct 25"),("TB","CAR","Sun Oct 25"),("SF","ATL","Sun Oct 25"),("DEN","ARI","Sun Oct 25"),("LAR","LV","Sun Oct 25"),("GB","DET","Sun Oct 25"),("KC","SEA","Sun Oct 25"),("DAL","PHI","Mon Oct 26")],
8: [("CAR","GB","Thu Oct 29"),("TEN","CIN","Sun Nov 1"),("IND","JAX","Sun Nov 1"),("CLE","PIT","Sun Nov 1"),("BAL","BUF","Sun Nov 1"),("ATL","TB","Sun Nov 1"),("MIN","DET","Sun Nov 1"),("ARI","DAL","Sun Nov 1"),("LV","NYJ","Sun Nov 1"),("LAC","LAR","Sun Nov 1"),("KC","DEN","Sun Nov 1"),("NE","MIA","Sun Nov 1"),("PHI","WAS","Sun Nov 1"),("CHI","SEA","Mon Nov 2")],
9: [("JAX","BAL","Thu Nov 5"),("CIN","ATL","Sun Nov 8 (Madrid)"),("NYJ","KC","Sun Nov 8"),("CLE","NO","Sun Nov 8"),("DEN","CAR","Sun Nov 8"),("DAL","IND","Sun Nov 8"),("DET","MIA","Sun Nov 8"),("NYG","PHI","Sun Nov 8"),("LAR","WAS","Sun Nov 8"),("LV","SF","Sun Nov 8"),("HOU","LAC","Sun Nov 8"),("ARI","SEA","Sun Nov 8"),("GB","NE","Sun Nov 8"),("TB","CHI","Sun Nov 8"),("BUF","MIN","Mon Nov 9")],
10: [("WAS","NYG","Thu Nov 12"),("NE","DET","Sun Nov 15 (Munich)"),("BUF","NYJ","Sun Nov 15"),("MIA","IND","Sun Nov 15"),("KC","ATL","Sun Nov 15"),("MIN","GB","Sun Nov 15"),("JAX","TEN","Sun Nov 15"),("HOU","CLE","Sun Nov 15"),("CAR","NO","Sun Nov 15"),("LAR","ARI","Sun Nov 15"),("SEA","LV","Sun Nov 15"),("SF","DAL","Sun Nov 15"),("PIT","CIN","Sun Nov 15"),("LAC","BAL","Mon Nov 16")],
11: [("IND","HOU","Thu Nov 19"),("ARI","KC","Sun Nov 22"),("TB","DET","Sun Nov 22"),("JAX","NYG","Sun Nov 22"),("MIA","BUF","Sun Nov 22"),("TEN","DAL","Sun Nov 22"),("BAL","CAR","Sun Nov 22"),("NO","CHI","Sun Nov 22"),("NYJ","LAC","Sun Nov 22"),("PIT","PHI","Sun Nov 22"),("LV","DEN","Sun Nov 22"),("MIN","SF","Sun Nov 22 (Mexico City)"),("CIN","WAS","Mon Nov 23"),("NE","MIA","Sun Nov 22")],
12: [("GB","LAR","Wed Nov 25 (Thanksgiving Eve)"),("CHI","DET","Thu Nov 26"),("PHI","DAL","Thu Nov 26"),("KC","BUF","Thu Nov 26"),("DEN","PIT","Fri Nov 27"),("BAL","HOU","Sun Nov 29"),("NO","CIN","Sun Nov 29"),("NYJ","MIA","Sun Nov 29"),("ATL","MIN","Sun Nov 29"),("NYG","IND","Sun Nov 29"),("LV","CLE","Sun Nov 29"),("TEN","JAX","Sun Nov 29"),("WAS","ARI","Sun Nov 29"),("SEA","SF","Sun Nov 29"),("NE","CAR","Sun Nov 29")],
13: [("MIA","GB","Thu Dec 3"),("IND","NE","Sun Dec 6"),("NO","DAL","Sun Dec 6"),("ARI","MIN","Sun Dec 6"),("CHI","SF","Sun Dec 6"),("CAR","TB","Sun Dec 6"),("WAS","PHI","Sun Dec 6"),("CLE","DEN","Sun Dec 6"),("NYG","NO","Sun Dec 6"),("LV","KC","Sun Dec 6"),("LAC","CIN","Sun Dec 6"),("HOU","PIT","Sun Dec 6"),("DAL","SEA","Sun Dec 6"),("BUF","NE","Sun Dec 6")],
14: [("MIN","NE","Thu Dec 10"),("DEN","NYJ","Sun Dec 13"),("ATL","CLE","Sun Dec 13"),("CHI","MIA","Sun Dec 13"),("HOU","WAS","Sun Dec 13"),("NO","CAR","Sun Dec 13"),("IND","PHI","Sun Dec 13"),("TB","BAL","Sun Dec 13"),("TEN","DET","Sun Dec 13"),("LAC","LV","Sun Dec 13"),("KC","CIN","Sun Dec 13"),("LAR","SF","Sun Dec 13"),("NYG","SEA","Sun Dec 13"),("BUF","GB","Sun Dec 13"),("PIT","JAX","Mon Dec 14")],
15: [("SF","LAC","Thu Dec 17"),("SEA","PHI","Sat Dec 19"),("CHI","BUF","Sat Dec 19"),("JAX","HOU","Sun Dec 20"),("BAL","PIT","Sun Dec 20"),("CLE","NYG","Sun Dec 20"),("IND","TEN","Sun Dec 20"),("MIA","GB","Sun Dec 20"),("NO","TB","Sun Dec 20"),("CIN","CAR","Sun Dec 20"),("ATL","WAS","Sun Dec 20"),("NYJ","ARI","Sun Dec 20"),("DAL","LAR","Sun Dec 20"),("DEN","LV","Sun Dec 20"),("DET","MIN","Sun Dec 20"),("NE","KC","Mon Dec 21")],
16: [("HOU","PHI","Thu Dec 24"),("GB","CHI","Fri Dec 25 (Christmas)"),("BUF","DEN","Fri Dec 25"),("LAR","SEA","Fri Dec 25"),("NE","NYJ","Sun Dec 27"),("CLE","BAL","Sun Dec 27"),("LAC","MIA","Sun Dec 27"),("ARI","LV","Sun Dec 27"),("SF","KC","Sun Dec 27"),("JAX","DAL","Sun Dec 27"),("NYG","DET","Sun Dec 27"),("TB","ATL","Sun Dec 27"),("WAS","MIN","Sun Dec 27"),("CAR","PIT","Sun Dec 27"),("CIN","IND","Sun Dec 27")],
17: [("BAL","CIN","Thu Dec 31"),("LAR","TB","Sun Jan 3"),("DEN","NE","Sun Jan 3"),("KC","LAC","Sun Jan 3"),("WAS","JAX","Sun Jan 3"),("BUF","MIA","Sun Jan 3"),("PIT","TEN","Sun Jan 3"),("MIN","NYJ","Sun Jan 3"),("NO","ATL","Sun Jan 3"),("SEA","CAR","Sun Jan 3"),("IND","CLE","Sun Jan 3"),("NYG","DAL","Sun Jan 3"),("LV","ARI","Sun Jan 3"),("DET","CHI","Sun Jan 3"),("PHI","SF","Sun Jan 3"),("HOU","GB","Mon Jan 4")],
18: [("NYJ","BUF","Sun Jan 10"),("JAX","IND","Sun Jan 10"),("LV","KC","Sun Jan 10"),("TEN","HOU","Sun Jan 10"),("LAC","DEN","Sun Jan 10"),("MIA","NE","Sun Jan 10"),("CLE","CIN","Sun Jan 10"),("PIT","BAL","Sun Jan 10"),("CHI","MIN","Sun Jan 10"),("DET","GB","Sun Jan 10"),("DAL","WAS","Sun Jan 10"),("TB","NO","Sun Jan 10"),("PHI","NYG","Sun Jan 10"),("SEA","LAR","Sun Jan 10"),("ATL","CAR","Sun Jan 10"),("SF","ARI","Sun Jan 10")],
}

WL = {1:"Semana 1 (Sep 9-14)",2:"Semana 2 (Sep 17-21)",3:"Semana 3 (Sep 24-28)",4:"Semana 4 (Oct 1-5)",5:"Semana 5 (Oct 8-12)",6:"Semana 6 (Oct 15-19)",7:"Semana 7 (Oct 22-26)",8:"Semana 8 (Oct 29-Nov 2)",9:"Semana 9 (Nov 5-9)",10:"Semana 10 (Nov 12-16)",11:"Semana 11 (Nov 19-23)",12:"Semana 12 (Nov 25-29)",13:"Semana 13 (Dec 3-7)",14:"Semana 14 (Dec 10-14)",15:"Semana 15 (Dec 17-21)",16:"Semana 16 (Dec 24-28)",17:"Semana 17 (Dec 31-Ene 4)",18:"Semana 18 (Ene 10)"}

MONS = {"Sep":"09","Oct":"10","Nov":"11","Dec":"12","Jan":"01"}

def parse_note(note):
    base = note.split("(")[0].strip()
    parts = base.split()
    m = MONS.get(parts[0],"09")
    d = parts[1].replace(",","").zfill(2)
    y = "2027" if parts[0]=="Jan" else "2026"
    special = note.split("(")[1].rstrip(")") if "(" in note else ""
    return f"{y}-{m}-{d}", special

def spread(a,h):
    v = st.get(a,70); w = st.get(h,70)
    sp = round((w-v)/5*3,1)
    if abs(sp) < 0.3: sp = 0.0
    return max(-10, min(10, round(sp,1)))

def ou(a,h):
    return round(35 + (st.get(a,70)+st.get(h,70))/6, 1)

games = []
tc2 = {t:0 for t in tc}
for wk in sorted(S):
    for a,h,note in S[wk]:
        d,spc = parse_note(note)
        games.append([wk,a,h,spread(a,h),ou(a,h),d,spc])
        tc2[a]+=1; tc2[h]+=1

assert len(games)==272, f"Got {len(games)}"
for t,c in tc2.items():
    assert c==17, f"{t}: {c}"

print("Teams OK: all 32 have 17 games", flush=True)
print(f"Total: {len(games)} games", flush=True)

# Build JS ga
ga_js = "var ga=[" + ",".join(f'[{w},"{a}","{h}",{s},{o},"{d}","{n}"]' for w,a,h,s,o,d,n in games) + "];"
wl_opts = "\n".join(f'<option value="{wk}">{WL[wk]}</option>' for wk in sorted(WL))

# Read the existing dashboard HTML and replace the ga, wl, tc etc
# Build the complete file
CSS = '''*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#09091a;color:#e0e0e0;min-height:100vh}
.w{max-width:1320px;margin:0 auto;padding:16px}
.hdr{background:linear-gradient(135deg,#11113a,#0a0a1f);border:1px solid #2a2a5a;border-radius:14px;padding:18px 20px;margin-bottom:14px}
.hdr h1{font-size:1.4rem;font-weight:900;background:linear-gradient(135deg,#4a9eff,#a855f7,#ff6b35);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr .sub{font-size:.75rem;color:#7777aa;margin-top:2px}
.ctrls{display:flex;gap:6px;flex-wrap:wrap;align-items:center;background:#11113a;border:1px solid #2a2a5a;border-radius:10px;padding:10px 14px;margin-bottom:14px}
.ctrls select{background:#0a0a1f;color:#ddd;border:1px solid #3a3a6a;border-radius:8px;padding:8px 30px 8px 14px;font-size:.85rem;font-weight:600;cursor:pointer;outline:none}
.btn{background:linear-gradient(135deg,#1a1a3e,#0d0d25);border:1px solid #3a3a6a;color:#ccc;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600;font-family:inherit}
.btn.act{background:linear-gradient(135deg,#4a9eff,#2563eb);border-color:#4a9eff;color:#fff}
.cnt{color:#8888aa;font-size:.8rem;margin-left:auto;font-weight:600}
.gd{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:10px}
@media(max-width:600px){.gd{grid-template-columns:1fr}}
.gc{background:#11113a;border:1px solid #2a2a5a;border-radius:12px;cursor:pointer;transition:all .2s}
.gc:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(74,158,255,0.12);border-color:#4a9eff}
.gc .top{display:flex;justify-content:space-between;padding:8px 12px 0;font-size:.65rem;color:#8888aa;font-weight:600;text-transform:uppercase}
.gc .bd{padding:8px 12px;display:flex;align-items:center;gap:10px}
.gc .bd .lg{width:40px;height:40px;flex-shrink:0}
.gc .bd .lg img{width:100%;height:100%;object-fit:contain}
.gc .bd .nm{font-size:.9rem;font-weight:700;color:#fff}
.gc .bd .vs{color:#5555aa;font-size:.7rem;font-weight:700;padding:0 2px;flex-shrink:0}
.gc .bot{padding:4px 12px 10px;display:flex;gap:4px;flex-wrap:wrap;align-items:center}
.badge{padding:3px 8px;border-radius:5px;font-size:.68rem;font-weight:700}
.badge.sp{background:#a855f720;color:#a855f7;border:1px solid #a855f740}
.badge.ou{background:#4a9eff20;color:#4a9eff;border:1px solid #4a9eff40}
.badge.mlp{background:#4ade8020;color:#4ade80;border:1px solid #4ade8040}
.badge.atp{background:#ffd70020;color:#ffd700;border:1px solid #ffd70040}
.badge.oup{background:#4a9eff20;color:#4a9eff;border:1px solid #4a9eff40}
.badge.lk{background:linear-gradient(135deg,#ff6b3530,#ff444430);color:#ff6b35;border:1px solid #ff6b3560;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,53,0.3)}50%{box-shadow:0 0 0 4px rgba(255,107,53,0)}}
#dt{display:none}#dt.sh{display:block;animation:fi .3s}
@keyframes fi{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
.dt-inner{background:linear-gradient(135deg,#11113a,#0a0a1f);border:1px solid #2a2a5a;border-radius:14px;padding:20px;margin-top:12px}
.dt-inner .hb{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.dt-inner .hb button{background:#2a2a5a;border:0;color:#ccc;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600}
.dt-inner .top-bar{display:flex;align-items:center;justify-content:center;gap:20px;padding:14px;margin-bottom:14px;background:linear-gradient(135deg,#0d0d25,#1a1a3e);border-radius:12px;border:1px solid #2a2a5a}
.dt-inner .top-bar .lg{width:56px;height:56px}
.dt-inner .top-bar .lg img{width:100%;height:100%;object-fit:contain}
.dt-inner .top-bar .tm{font-size:1.2rem;font-weight:900;color:#fff}
.dt-inner .top-bar .at{color:#5555aa;font-size:.85rem;font-weight:700;padding:0 6px}
.dt-inner .gd2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:700px){.dt-inner .gd2{grid-template-columns:1fr}}
.dt-inner .box{background:linear-gradient(135deg,#0d0d25,#16163a);border:1px solid #2a2a5a;border-radius:10px;padding:14px}
.dt-inner .box.fw{grid-column:1/-1}
.dt-inner .box h3{font-size:.85rem;font-weight:700;color:#fff;margin-bottom:8px}
.dt-inner .box .rw{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1a1a3a;font-size:.82rem}
.dt-inner .box .rw:last-child{border-bottom:0}
.dt-inner .box .rw .lb{color:#8888aa}
.dt-inner .box .rw .rv{font-weight:700}
.dt-inner .box .rw .g{color:#4ade80}.dt-inner .box .rw .r{color:#f87171}.dt-inner .box .rw .y{color:#ffd700}
.dt-inner .bw{height:12px;border-radius:8px;margin:6px 0 10px;background:#0a0a18;overflow:hidden}
.dt-inner .bf{height:100%;border-radius:8px;transition:width .6s}
.dt-inner .bf.g{background:linear-gradient(90deg,#4ade80,#22c55e)}
.dt-inner .bf.b{background:linear-gradient(90deg,#4a9eff,#3b82f6)}
.dt-inner .bf.y{background:linear-gradient(90deg,#ffd700,#f59e0b)}
.dt-inner .tbl{width:100%;border-collapse:collapse;font-size:.82rem}
.dt-inner .tbl td,.dt-inner .tbl th{padding:6px 10px;border-bottom:1px solid #1a1a3a}
.dt-inner .tbl th{color:#4a9eff;font-weight:700;font-size:.72rem;text-transform:uppercase}
.dt-inner .tbl .vl{font-weight:700}
.dt-inner .tbl .up{color:#4ade80}.dt-inner .tbl .dn{color:#f87171}
.dt-inner .lock-big{display:inline-flex;background:linear-gradient(135deg,#ff6b3530,#ff444430);border:1px solid #ff6b3560;border-radius:8px;padding:6px 14px;font-size:.8rem;font-weight:700;color:#ff6b35;animation:pulse 2s infinite}'''

tc_json = json.dumps(tc)
st_json = json.dumps(st)
qb_json = json.dumps(qb)
df_json = json.dumps(df)
ol_json = json.dumps(ol)

html = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2026 — Apuestas PRO</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
{CSS}
</style>
</head>
<body>
<div class="w">
<div class="hdr"><h1>\U0001f3c8 NFL 2026 — Apuestas</h1><div class="sub">Super Bowl LXI \u00b7 SoFi Stadium \u00b7 14 Feb 2027</div></div>
<div class="ctrls">
<select id="ws" onchange="cw()">
{wl_opts}
</select>
<button class="btn act" onclick="sf('a')">Todos</button>
<button class="btn" onclick="sf('l')">Locks</button>
<span class="cnt" id="cnt"></span>
</div>
<div id="gl"></div>
<div id="dt"></div>
</div>
<script>
var tc={tc_json};
var st={st_json};
var qb={qb_json};
var df={df_json};
var ol={ol_json};
{ga_js}
var wm={{}},tn={{}},ca={{}},cw=1,cf="a";
Object.keys(tc).forEach(function(k){{tn[k]=tc[k].n;}});
ga.forEach(function(a){{var g={{w:a[0],a:a[1],h:a[2],s:a[3],o:a[4],d:a[5],n:a[6]}};if(!wm[g.w])wm[g.w]=[];wm[g.w].push(g);}});

function an(g){{
  var k=g.w+"_"+g.a+"_"+g.h;
  if(ca[k])return ca[k];
  var av=st[g.a]||70,hv=st[g.h]||70,sd=hv-av;
  var qad=(qb[g.a]||70)-(qb[g.h]||70);
  var dad=(df[g.a]||70)-(df[g.h]||70);
  var oad=(ol[g.a]||70)-(ol[g.h]||70);
  var mc=50+sd*2+Math.abs(qad)*0.3+Math.abs(dad)*0.2+Math.abs(oad)*0.1;
  mc=Math.max(45,Math.min(99,mc));
  var mp=mc>52?g.h:g.a;
  var ae=sd+qad*0.2+dad*0.15+oad*0.1;
  var ap=ae>0?g.h:g.a;
  var ar=50+Math.min(Math.abs(ae)*3,40);
  ar=Math.max(45,Math.min(98,ar));
  var it=((av+hv)/1.5+((qb[g.a]||70)+(qb[g.h]||70))/5);
  var od=it-g.o;
  var op=od>0?"Over":"Under";
  var oc=50+Math.min(Math.abs(od)*4,40);
  oc=Math.max(45,Math.min(95,oc));
  var lk=mc>=82&&Math.abs(sd)>5;
  var gr=mc>=93?"A+":mc>=87?"A":mc>=82?"A-":mc>=78?"B+":mc>=73?"B":mc>=68?"B-":mc>=63?"C+":mc>=58?"C":"D";
  ca[k]={{mp:mp,mr:Math.round(mc),ap:ap,ar:Math.round(ar),op:op,or:Math.round(oc),lk:lk,sd:Math.round(sd*10)/10,qa:Math.round(qad)}};
  return ca[k];
}}

function rd(){{
  var gs=wm[cw]||[];
  if(cf==="l")gs=gs.filter(function(x){{return an(x).lk}});
  var el=document.getElementById("gl");
  el.innerHTML="";
  gs.forEach(function(g){{
    var a=an(g);
    var d=document.createElement("div");d.className="gc";
    var _w=g.w,_a=g.a,_h=g.h;
    d.onclick=function(){{sg(_w,_a,_h);}};
    var ss=g.s;
    var sl=(ss>0?"+"+ss:ss<0?ss:"PK");
    var extra=(g.n?'<span class="badge" style="background:#ffd70020;color:#ffd700;border:1px solid #ffd70040">'+g.n+'</span>':'');
    d.innerHTML='<div class="top"><span>S'+g.w+'</span><span>'+g.d+'</span></div><div class="bd"><div class="lg"><img src="https://a.espncdn.com/i/teamlogos/nfl/500/'+g.a+'.png"></div><div style="flex:1"><div class="nm">'+(tn[g.a]||g.a)+'</div></div><div class="vs">@</div><div style="flex:1;text-align:right"><div class="nm">'+(tn[g.h]||g.h)+'</div></div><div class="lg"><img src="https://a.espncdn.com/i/teamlogos/nfl/500/'+g.h+'.png"></div></div><div class="bot"><span class="badge sp">'+g.h+' '+sl+'</span><span class="badge ou">O/U '+g.o+'</span>'+(a.mr>=64?'<span class="badge mlp">ML '+a.mp+'</span>':'')+(a.ar>=60?'<span class="badge atp">ATS '+a.ap+'</span>':'')+'<span class="badge oup">'+a.op+'</span>'+(a.lk?'<span class="badge lk">LOCK</span>':'')+extra+'</div>';
    el.appendChild(d);
  }});
  document.getElementById("cnt").textContent=gs.length+" juegos";
}}

function sg(w,a,h){{
  var g=wm[w].find(function(x){{return x.a===a&&x.h===h}});
  if(!g)return;
  var A=an(g);
  var el=document.getElementById("dt");el.className="sh";el.scrollIntoView({{behavior:"smooth",block:"start"}});
  var cats=[{{k:"st",l:"General"}},{{k:"qb",l:"QB"}},{{k:"df",l:"Defensa"}},{{k:"ol",l:"O-Line"}}];
  var trs="";
  cats.forEach(function(c){{var av=eval(c.k)[g.a]||70,hv=eval(c.k)[g.h]||70,d=av-hv;trs+='<tr><td>'+c.l+'</td><td class="vl">'+av+'</td><td style="color:#5555aa">vs</td><td class="vl">'+hv+'</td><td class="'+(d>0?"up":"dn")+'">'+(d>0?"+":"")+d+'</td></tr>';}});
  var factors='<div class="rw"><span class="lb">Diferencia ratings</span><span class="rv '+(A.sd>0?"g":"r")+'">'+(A.sd>0?"+":"")+A.sd+' pts '+(A.sd>0?g.h:g.a)+'</span></div><div class="rw"><span class="lb">QB ventaja</span><span class="rv '+(A.qa>0?"g":"r")+'">'+(A.qa>0?"+":"")+A.qa+' '+(A.qa>0?g.h:g.a)+'</span></div>';
  el.innerHTML='<div class="dt-inner"><div class="hb"><div></div><button onclick="document.getElementById(\'dt\').className=\'\'">Cerrar</button></div><div class="top-bar"><div style="text-align:center"><div class="lg" style="margin:0 auto"><img src="https://a.espncdn.com/i/teamlogos/nfl/500/'+g.a+'.png"></div><div class="tm">'+(tn[g.a]||g.a
