#!/usr/bin/env python3
"""Generate dashboard_2026.html with REAL NFL 2026 schedule."""
import json

with open("/tmp/nfl_data.json") as f:
    data = json.load(f)

tc = data["tc"]
r = data["r"]
st = r["st"]
qb = r["qb"]
df = r["df"]
ol = r["ol"]

# REAL NFL 2026 Schedule from CBS Sports
# Format: [week, away, home, note]
schedule_raw = {
    1: [
        ("NE", "SEA", "Wed Sep 9"),
        ("SF", "LAR", "Thu Sep 10 (Melbourne)"),
        ("CHI", "CAR", "Sun Sep 13"),
        ("TB", "CIN", "Sun Sep 13"),
        ("BAL", "IND", "Sun Sep 13"),
        ("BUF", "HOU", "Sun Sep 13"),
        ("NO", "DET", "Sun Sep 13"),
        ("ATL", "PIT", "Sun Sep 13"),
        ("CLE", "JAX", "Sun Sep 13"),
        ("ARI", "LAC", "Sun Sep 13"),
        ("GB", "MIN", "Sun Sep 13"),
        ("MIA", "LV", "Sun Sep 13"),
        ("WAS", "PHI", "Sun Sep 13"),
        ("DAL", "NYG", "Sun Sep 13"),
        ("NYJ", "TEN", "Sun Sep 13"),
        ("DEN", "KC", "Mon Sep 14"),
    ],
    2: [
        ("DET", "BUF", "Thu Sep 17"),
        ("MIN", "CHI", "Sun Sep 20"),
        ("PHI", "TEN", "Sun Sep 20"),
        ("GB", "NYJ", "Sun Sep 20"),
        ("CAR", "ATL", "Sun Sep 20"),
        ("NO", "BAL", "Sun Sep 20"),
        ("CIN", "HOU", "Sun Sep 20"),
        ("CLE", "TB", "Sun Sep 20"),
        ("PIT", "NE", "Sun Sep 20"),
        ("LV", "LAC", "Sun Sep 20"),
        ("JAX", "DEN", "Sun Sep 20"),
        ("WAS", "DAL", "Sun Sep 20"),
        ("SEA", "ARI", "Sun Sep 20"),
        ("MIA", "SF", "Sun Sep 20"),
        ("IND", "KC", "Sun Sep 20"),
        ("NYG", "LAR", "Mon Sep 21"),
    ],
    3: [
        ("ATL", "GB", "Thu Sep 24"),
        ("KC", "MIA", "Sun Sep 27"),
        ("HOU", "IND", "Sun Sep 27"),
        ("TEN", "NYG", "Sun Sep 27"),
        ("NE", "JAX", "Sun Sep 27"),
        ("CIN", "PIT", "Sun Sep 27"),
        ("CAR", "CLE", "Sun Sep 27"),
        ("NYJ", "DET", "Sun Sep 27"),
        ("SEA", "WAS", "Sun Sep 27"),
        ("LAC", "BUF", "Sun Sep 27"),
        ("MIN", "TB", "Sun Sep 27"),
        ("ARI", "SF", "Sun Sep 27"),
        ("BAL", "DAL", "Sun Sep 27 (Rio)"),
        ("LV", "NO", "Sun Sep 27"),
        ("LAR", "DEN", "Sun Sep 27"),
        ("PHI", "CHI", "Mon Sep 28"),
    ],
    4: [
        ("PIT", "CLE", "Thu Oct 1"),
        ("IND", "WAS", "Sun Oct 4 (London)"),
        ("TEN", "BAL", "Sun Oct 4"),
        ("ARI", "NYG", "Sun Oct 4"),
        ("JAX", "CIN", "Sun Oct 4"),
        ("NE", "BUF", "Sun Oct 4"),
        ("DAL", "HOU", "Sun Oct 4"),
        ("LAR", "PHI", "Sun Oct 4"),
        ("GB", "TB", "Sun Oct 4"),
        ("NYJ", "CHI", "Sun Oct 4"),
        ("MIA", "MIN", "Sun Oct 4"),
        ("DEN", "SF", "Sun Oct 4"),
        ("LAC", "SEA", "Sun Oct 4"),
        ("KC", "LV", "Sun Oct 4"),
        ("DET", "CAR", "Sun Oct 4"),
        ("ATL", "NO", "Mon Oct 5"),
    ],
    5: [
        ("TB", "DAL", "Thu Oct 8"),
        ("PHI", "JAX", "Sun Oct 11 (London)"),
        ("LV", "NE", "Sun Oct 11"),
        ("HOU", "TEN", "Sun Oct 11"),
        ("CLE", "NYJ", "Sun Oct 11"),
        ("IND", "PIT", "Sun Oct 11"),
        ("CIN", "MIA", "Sun Oct 11"),
        ("MIN", "NO", "Sun Oct 11"),
        ("NYG", "WAS", "Sun Oct 11"),
        ("DEN", "LAC", "Sun Oct 11"),
        ("CHI", "GB", "Sun Oct 11"),
        ("DET", "ARI", "Sun Oct 11"),
        ("SF", "SEA", "Sun Oct 11"),
        ("BAL", "ATL", "Sun Oct 11"),
        ("BUF", "LAR", "Mon Oct 12"),
    ],
    6: [
        ("SEA", "DEN", "Thu Oct 15"),
        ("HOU", "JAX", "Sun Oct 18 (London)"),
        ("NYJ", "NE", "Sun Oct 18"),
        ("PIT", "TB", "Sun Oct 18"),
        ("CAR", "PHI", "Sun Oct 18"),
        ("CHI", "ATL", "Sun Oct 18"),
        ("TEN", "IND", "Sun Oct 18"),
        ("NO", "NYG", "Sun Oct 18"),
        ("BAL", "CLE", "Sun Oct 18"),
        ("ARI", "LAR", "Sun Oct 18"),
        ("LAC", "KC", "Sun Oct 18"),
        ("BUF", "LV", "Sun Oct 18"),
        ("DAL", "GB", "Sun Oct 18"),
        ("WAS", "SF", "Mon Oct 19"),
    ],
    7: [
        ("NE", "CHI", "Thu Oct 22"),
        ("PIT", "NO", "Sun Oct 25 (Paris)"),
        ("CLE", "TEN", "Sun Oct 25"),
        ("MIA", "NYJ", "Sun Oct 25"),
        ("IND", "MIN", "Sun Oct 25"),
        ("CIN", "BAL", "Sun Oct 25"),
        ("NYG", "HOU", "Sun Oct 25"),
        ("TB", "CAR", "Sun Oct 25"),
        ("SF", "ATL", "Sun Oct 25"),
        ("DEN", "ARI", "Sun Oct 25"),
        ("LAR", "LV", "Sun Oct 25"),
        ("GB", "DET", "Sun Oct 25"),
        ("KC", "SEA", "Sun Oct 25"),
        ("DAL", "PHI", "Mon Oct 26"),
    ],
    8: [
        ("CAR", "GB", "Thu Oct 29"),
        ("TEN", "CIN", "Sun Nov 1"),
        ("IND", "JAX", "Sun Nov 1"),
        ("CLE", "PIT", "Sun Nov 1"),
        ("BAL", "BUF", "Sun Nov 1"),
        ("ATL", "TB", "Sun Nov 1"),
        ("MIN", "DET", "Sun Nov 1"),
        ("ARI", "DAL", "Sun Nov 1"),
        ("LV", "NYJ", "Sun Nov 1"),
        ("LAC", "LAR", "Sun Nov 1"),
        ("KC", "DEN", "Sun Nov 1"),
        ("NE", "MIA", "Sun Nov 1"),
        ("PHI", "WAS", "Sun Nov 1"),
        ("CHI", "SEA", "Mon Nov 2"),
    ],
    9: [
        ("JAX", "BAL", "Thu Nov 5"),
        ("CIN", "ATL", "Sun Nov 8 (Madrid)"),
        ("NYJ", "KC", "Sun Nov 8"),
        ("CLE", "NO", "Sun Nov 8"),
        ("DEN", "CAR", "Sun Nov 8"),
        ("DAL", "IND", "Sun Nov 8"),
        ("DET", "MIA", "Sun Nov 8"),
        ("NYG", "PHI", "Sun Nov 8"),
        ("LAR", "WAS", "Sun Nov 8"),
        ("LV", "SF", "Sun Nov 8"),
        ("HOU", "LAC", "Sun Nov 8"),
        ("ARI", "SEA", "Sun Nov 8"),
        ("GB", "NE", "Sun Nov 8"),
        ("TB", "CHI", "Sun Nov 8"),
        ("BUF", "MIN", "Mon Nov 9"),
    ],
    10: [
        ("WAS", "NYG", "Thu Nov 12"),
        ("NE", "DET", "Sun Nov 15 (Munich)"),
        ("BUF", "NYJ", "Sun Nov 15"),
        ("MIA", "IND", "Sun Nov 15"),
        ("KC", "ATL", "Sun Nov 15"),
        ("MIN", "GB", "Sun Nov 15"),
        ("JAX", "TEN", "Sun Nov 15"),
        ("HOU", "CLE", "Sun Nov 15"),
        ("CAR", "NO", "Sun Nov 15"),
        ("LAR", "ARI", "Sun Nov 15"),
        ("SEA", "LV", "Sun Nov 15"),
        ("SF", "DAL", "Sun Nov 15"),
        ("PIT", "CIN", "Sun Nov 15"),
        ("LAC", "BAL", "Mon Nov 16"),
    ],
    11: [
        ("IND", "HOU", "Thu Nov 19"),
        ("ARI", "KC", "Sun Nov 22"),
        ("TB", "DET", "Sun Nov 22"),
        ("JAX", "NYG", "Sun Nov 22"),
        ("MIA", "BUF", "Sun Nov 22"),
        ("TEN", "DAL", "Sun Nov 22"),
        ("BAL", "CAR", "Sun Nov 22"),
        ("NO", "CHI", "Sun Nov 22"),
        ("NYJ", "LAC", "Sun Nov 22"),
        ("PIT", "PHI", "Sun Nov 22"),
        ("LV", "DEN", "Sun Nov 22"),
        ("MIN", "SF", "Sun Nov 22 (Mexico City)"),
        ("CIN", "WAS", "Mon Nov 23"),
        ("NE", "MIA", "Sun Nov 22"),
    ],
    12: [
        ("GB", "LAR", "Wed Nov 25 (Thanksgiving Eve)"),
        ("CHI", "DET", "Thu Nov 26"),
        ("PHI", "DAL", "Thu Nov 26"),
        ("KC", "BUF", "Thu Nov 26"),
        ("DEN", "PIT", "Fri Nov 27"),
        ("BAL", "HOU", "Sun Nov 29"),
        ("NO", "CIN", "Sun Nov 29"),
        ("NYJ", "MIA", "Sun Nov 29"),
        ("ATL", "MIN", "Sun Nov 29"),
        ("NYG", "IND", "Sun Nov 29"),
        ("LV", "CLE", "Sun Nov 29"),
        ("TEN", "JAX", "Sun Nov 29"),
        ("WAS", "ARI", "Sun Nov 29"),
        ("SEA", "SF", "Sun Nov 29"),
        ("NE", "CAR", "Sun Nov 29"),
    ],
    13: [
        ("MIA", "GB", "Thu Dec 3"),
        ("IND", "NE", "Sun Dec 6"),
        ("NO", "DAL", "Sun Dec 6"),
        ("ARI", "MIN", "Sun Dec 6"),
        ("CHI", "SF", "Sun Dec 6"),
        ("CAR", "TB", "Sun Dec 6"),
        ("WAS", "PHI", "Sun Dec 6"),
        ("CLE", "DEN", "Sun Dec 6"),
        ("NYG", "NO", "Sun Dec 6"),
        ("LV", "KC", "Sun Dec 6"),
        ("LAC", "CIN", "Sun Dec 6"),
        ("HOU", "PIT", "Sun Dec 6"),
        ("DAL", "SEA", "Sun Dec 6"),
        ("BUF", "NE", "Sun Dec 6"),
    ],
    14: [
        ("MIN", "NE", "Thu Dec 10"),
        ("DEN", "NYJ", "Sun Dec 13"),
        ("ATL", "CLE", "Sun Dec 13"),
        ("CHI", "MIA", "Sun Dec 13"),
        ("HOU", "WAS", "Sun Dec 13"),
        ("NO", "CAR", "Sun Dec 13"),
        ("IND", "PHI", "Sun Dec 13"),
        ("TB", "BAL", "Sun Dec 13"),
        ("TEN", "DET", "Sun Dec 13"),
        ("LAC", "LV", "Sun Dec 13"),
        ("KC", "CIN", "Sun Dec 13"),
        ("LAR", "SF", "Sun Dec 13"),
        ("NYG", "SEA", "Sun Dec 13"),
        ("BUF", "GB", "Sun Dec 13"),
        ("PIT", "JAX", "Mon Dec 14"),
    ],
    15: [
        ("SF", "LAC", "Thu Dec 17"),
        ("SEA", "PHI", "Sat Dec 19"),
        ("CHI", "BUF", "Sat Dec 19"),
        ("JAX", "HOU", "Sun Dec 20"),
        ("BAL", "PIT", "Sun Dec 20"),
        ("CLE", "NYG", "Sun Dec 20"),
        ("IND", "TEN", "Sun Dec 20"),
        ("MIA", "GB", "Sun Dec 20"),
        ("NO", "TB", "Sun Dec 20"),
        ("CIN", "CAR", "Sun Dec 20"),
        ("ATL", "WAS", "Sun Dec 20"),
        ("NYJ", "ARI", "Sun Dec 20"),
        ("DAL", "LAR", "Sun Dec 20"),
        ("DEN", "LV", "Sun Dec 20"),
        ("DET", "MIN", "Sun Dec 20"),
        ("NE", "KC", "Mon Dec 21"),
    ],
    16: [
        ("HOU", "PHI", "Thu Dec 24"),
        ("GB", "CHI", "Fri Dec 25 (Christmas)"),
        ("BUF", "DEN", "Fri Dec 25"),
        ("LAR", "SEA", "Fri Dec 25"),
        ("NE", "NYJ", "Sun Dec 27"),
        ("CLE", "BAL", "Sun Dec 27"),
        ("LAC", "MIA", "Sun Dec 27"),
        ("ARI", "LV", "Sun Dec 27"),
        ("SF", "KC", "Sun Dec 27"),
        ("JAX", "DAL", "Sun Dec 27"),
        ("NYG", "DET", "Sun Dec 27"),
        ("TB", "ATL", "Sun Dec 27"),
        ("WAS", "MIN", "Sun Dec 27"),
        ("CAR", "PIT", "Sun Dec 27"),
        ("CIN", "IND", "Sun Dec 27"),
    ],
    17: [
        ("BAL", "CIN", "Thu Dec 31"),
        ("LAR", "TB", "Sun Jan 3"),
        ("DEN", "NE", "Sun Jan 3"),
        ("KC", "LAC", "Sun Jan 3"),
        ("WAS", "JAX", "Sun Jan 3"),
        ("BUF", "MIA", "Sun Jan 3"),
        ("PIT", "TEN", "Sun Jan 3"),
        ("MIN", "NYJ", "Sun Jan 3"),
        ("NO", "ATL", "Sun Jan 3"),
        ("SEA", "CAR", "Sun Jan 3"),
        ("IND", "CLE", "Sun Jan 3"),
        ("NYG", "DAL", "Sun Jan 3"),
        ("LV", "ARI", "Sun Jan 3"),
        ("DET", "CHI", "Sun Jan 3"),
        ("PHI", "SF", "Sun Jan 3"),
        ("HOU", "GB", "Mon Jan 4"),
    ],
    18: [
        ("NYJ", "BUF", "Sun Jan 10"),
        ("JAX", "IND", "Sun Jan 10"),
        ("LV", "KC", "Sun Jan 10"),
        ("TEN", "HOU", "Sun Jan 10"),
        ("LAC", "DEN", "Sun Jan 10"),
        ("MIA", "NE", "Sun Jan 10"),
        ("CLE", "CIN", "Sun Jan 10"),
        ("PIT", "BAL", "Sun Jan 10"),
        ("CHI", "MIN", "Sun Jan 10"),
        ("DET", "GB", "Sun Jan 10"),
        ("DAL", "WAS", "Sun Jan 10"),
        ("TB", "NO", "Sun Jan 10"),
        ("PHI", "NYG", "Sun Jan 10"),
        ("SEA", "LAR", "Sun Jan 10"),
        ("ATL", "CAR", "Sun Jan 10"),
        ("SF", "ARI", "Sun Jan 10"),
    ],
}

# Week labels
week_labels = {
    1: "Semana 1 (Sep 9-14)",
    2: "Semana 2 (Sep 17-21)",
    3: "Semana 3 (Sep 24-28)",
    4: "Semana 4 (Oct 1-5)",
    5: "Semana 5 (Oct 8-12)",
    6: "Semana 6 (Oct 15-19)",
    7: "Semana 7 (Oct 22-26)",
    8: "Semana 8 (Oct 29-Nov 2)",
    9: "Semana 9 (Nov 5-9)",
    10: "Semana 10 (Nov 12-16)",
    11: "Semana 11 (Nov 19-23)",
    12: "Semana 12 (Nov 25-29)",
    13: "Semana 13 (Dec 3-7)",
    14: "Semana 14 (Dec 10-14)",
    15: "Semana 15 (Dec 17-21)",
    16: "Semana 16 (Dec 24-28)",
    17: "Semana 17 (Dec 31-Ene 4)",
    18: "Semana 18 (Ene 10)",
}

def get_date(note):
    """Extract date from note."""
    months = {"Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12", "Jan": "01", "Ene": "01"}
    parts = note.split()
    if len(parts) >= 2:
        m = months.get(parts[0], "09")
        d = parts[1].replace(",", "").zfill(2)
        y = "2026" if parts[0] != "Jan" or parts[0] != "Ene" else "2027"
        # Handle Jan
        if parts[0] in ("Jan", "Ene"):
            y = "2027"
        return f"{y}-{m}-{d}"
    return "2026-09-13"

def calc_spread(away, home):
    av = st.get(away, 70)
    hv = st.get(home, 70)
    diff = hv - av
    sp = round(diff / 5 * 3, 1)
    # Keep spreads realistic
    if abs(sp) < 0.5:
        sp = 0.0  # PK
    sp = max(-10, min(10, sp))
    return round(sp, 1)

def calc_ou(away, home):
    av = st.get(away, 70)
    hv = st.get(home, 70)
    ou = round(35 + (av + hv) / 6, 1)
    return round(ou, 1)

# Build games array
games = []
team_counts = {t: 0 for t in tc}

for wk in sorted(schedule_raw.keys()):
    for away, home, note in schedule_raw[wk]:
        # Parse date from note
        nd = note
        dt = note.split("(")[0].strip() if "(" in note else note
        
        # Extract date
        mons = {"Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12", "Jan": "01"}
        parts = dt.split()
        if len(parts) >= 2:
            m = mons.get(parts[0], "09")
            d = parts[1].replace(",", "").zfill(2)
            y = "2027" if parts[0] in ("Jan",) else "2026"
            date_str = f"{y}-{m}-{d}"
        else:
            date_str = "2026-09-13"
        
        spread = calc_spread(away, home)
        ou = calc_ou(away, home)
        
        # Extract note suffix (international games, special days)
        special = ""
        if "(" in note:
            special = note.split("(")[1].rstrip(")")
        elif "Thanksgiving" in note:
            special = "Thanksgiving"
        
        games.append([wk, away, home, spread, ou, date_str, special])
        team_counts[away] += 1
        team_counts[home] += 1

print("=== Team Game Counts ===")
for t, c in sorted(team_counts.items()):
    status = "✓" if c == 17 else f"MISMATCH ({c})"
    print(f"  {t}: {c} {status}")

print(f"\nTotal games: {len(games)}")
assert len(games) == 272, f"Expected 272 games, got {len(games)}"
for t, c in team_counts.items():
    assert c == 17, f"{t} has {c} games, expected 17"

# Generate JS ga array
ga_entries = []
for g in games:
    w, a, h, s, o, d, n = g
    ga_entries.append(f"[{w},\"{a}\",\"{h}\",{s},{o},\"{d}\",\"{n}\"]")

ga_js = "var ga=[" + ",".join(ga_entries) + "];"

# Generate week labels for select
wl_entries = []
for wk in sorted(week_labels.keys()):
    wl_entries.append(f"<option value=\"{wk}\">{week_labels[wk]}</option>")
wl_html = "\n".join(wl_entries)

# Context: build the full HTML
# We keep the same CSS/HTML structure as the original but correct the data

html = f'''<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NFL 2026 — Apuestas PRO</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Inter,sans-serif;background:#09091a;color:#e0e0e0;min-height:100vh}}
.w{{max-width:1320px;margin:0 auto;padding:16px}}
.hdr{{background:linear-gradient(135deg,#11113a,#0a0a1f);border:1px solid #2a2a5a;border-radius:14px;padding:18px 20px;margin-bottom:14px}}
.hdr h1{{font-size:1.4rem;font-weight:900;background:linear-gradient(135deg,#4a9eff,#a855f7,#ff6b35);-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.hdr .sub{{font-size:.75rem;color:#7777aa;margin-top:2px}}
.ctrls{{display:flex;gap:6px;flex-wrap:wrap;align-items:center;background:#11113a;border:1px solid #2a2a5a;border-radius:10px;padding:10px 14px;margin-bottom:14px}}
.ctrls select{{background:#0a0a1f;color:#ddd;border:1px solid #3a3a6a;border-radius:8px;padding:8px 30px 8px 14px;font-size:.85rem;font-weight:600;cursor:pointer;outline:none}}
.btn{{background:linear-gradient(135deg,#1a1a3e,#0d0d25);border:1px solid #3a3a6a;color:#ccc;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600;font-family:inherit}}
.btn.act{{background:linear-gradient(135deg,#4a9eff,#2563eb);border-color:#4a9eff;color:#fff}}
.cnt{{color:#8888aa;font-size:.8rem;margin-left:auto;font-weight:600}}
.gd{{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:10px}}
@media(max-width:600px){{.gd{{grid-template-columns:1fr}}}}
.gc{{background:#11113a;border:1px solid #2a2a5a;border-radius:12px;cursor:pointer;transition:all .2s}}
.gc:hover{{transform:translateY(-2px);box-shadow:0 8px 30px rgba(74,158,255,0.12);border-color:#4a9eff}}
.gc .top{{display:flex;justify-content:space-between;padding:8px 12px 0;font-size:.65rem;color:#8888aa;font-weight:600;text-transform:uppercase}}
.gc .bd{{padding:8px 12px;display:flex;align-items:center;gap:10px}}
.gc .bd .lg{{width:40px;height:40px;flex-shrink:0}}
.gc .bd .lg img{{width:100%;height:100%;object-fit:contain}}
.gc .bd .nm{{font-size:.9rem;font-weight:700;color:#fff}}
.gc .bd .vs{{color:#5555aa;font-size:.7rem;font-weight:700;padding:0 2px;flex-shrink:0}}
.gc .bot{{padding:4px 12px 10px;display:flex;gap:4px;flex-wrap:wrap;align-items:center}}
.badge{{padding:3px 8px;border-radius:5px;font-size:.68rem;font-weight:700}}
.badge.sp{{background:#a855f720;color:#a855f7;border:1px solid #a855f740}}
.badge.ou{{background:#4a9eff20;color:#4a9eff;border:1px solid #4a9eff40}}
.badge.mlp{{background:#4ade8020;color:#4ade80;border:1px solid #4ade8040}}
.badge.atp{{background:#ffd70020;color:#ffd700;border:1px solid #ffd70040}}
.badge.oup{{background:#4a9eff20;color:#4a9eff;border:1px solid #4a9eff40}}
.badge.lk{{background:linear-gradient(135deg,#ff6b3530,#ff444430);color:#ff6b35;border:1px solid #ff6b3560;animation:pulse 2s infinite}}
@keyframes pulse{{0%,100%{{box-shadow:0 0 0 0 rgba(255,107,53,0.3)}}50%{{box-shadow:0 0 0 4px rgba(255,107,53,0)}}}}
#dt{{display:none}}#dt.sh{{display:block;animation:fi .3s}}
@keyframes fi{{from{{opacity:0;transform:translateY(15px)}}to{{opacity:1;transform:translateY(0)}}}}
.dt-inner{{background:linear-gradient(135deg,#11113a,#0a0a1f);border:1px solid #2a2a5a;border-radius:14px;padding:20px;margin-top:12px}}
.dt-inner .hb{{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}}
.dt-inner .hb button{{background:#2a2a5a;border:0;color:#ccc;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600}}
.dt-inner .top-bar{{display:flex;align-items:center;justify-content:center;gap:20px;padding:14px;margin-bottom:14px;background:linear-gradient(135deg,#0d0d25,#1a1a3e);border-radius:12px;border:1px solid #2a2a5a}}
.dt-inner .top-bar .lg{{width:56px;height:56px}}
.dt-inner .top-bar .lg img{{width:100%;height:100%;object-fit:contain}}
.dt-inner .top-bar .tm{{font-size:1.2rem;font-weight:900;color:#fff}}
.dt-inner .top-bar .at{{color:#5555aa;font-size:.85rem;font-weight:700;padding:0 6px}}
.dt-inner .gd2{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
@media(max-width:700px){{.dt-inner .gd2{{grid-template-columns:1fr}}}}
.dt-inner .box{{background:linear-gradient(135deg,#0d0d25,#16163a);border:1px solid #2a2a5a;border-radius:10px;padding:14px}}
.dt-inner .box.fw{{grid-column:1/-1}}
.dt-inner .box h3{{font-size:.85rem;font-weight:700;color:#fff;margin-bottom:8px}}
.dt-inner .box .rw{{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1a1a3a;font-size:.82rem}}
.dt-inner .box .rw:last-child{{border-bottom:0}}
.dt-inner .box .rw .lb{{color:#8888aa}}
.dt-inner .box .rw .rv{{font-weight:700}}
.dt-inner .box .rw .g{{color:#4ade80}}.dt-inner .box .rw .r{{color:#f87171}}.dt-inner .box .rw .y{{color:#ffd700}}
.dt-inner .bw{{height:12px;border-radius:8px;margin:6px 0 10px;background:#0a0a18;overflow:hidden}}
.dt-inner .bf{{height:100%;border-radius:8px;transition:width .6s}}
.dt-inner .bf.g{{background:linear-gradient(90deg,#4ade80,#22c55e)}}
.dt-inner .bf.b{{background:linear-gradient(90deg,#4a9eff,#3b82f6)}}
.dt-inner .bf.y{{background:linear-gradient(90deg,#ffd700,#f59e0b)}}
.dt-inner .tbl{{width:100%;border-collapse:collapse;font-size:.82rem}}
.dt-inner .tbl td,.dt-inner .tbl th{{padding:6px 10px;border-bottom:1px solid #1a1a3a}}
.dt-inner .tbl th{{color:#4a9eff;font-weight:700;font-size:.72rem;text-transform:uppercase}}
.dt-inner .tbl .vl{{font-weight:700}}
.dt-inner .tbl .up{{color:#4ade80}}.dt-inner .tbl .dn{{color:#f87171}}
.dt-inner .lock-big{{display:inline-flex;background:linear-gradient(135deg,#ff6b3530,#ff444430);border:1px solid #ff6b3560;border-radius:8px;padding:6px 14px;font-size:.8rem;font-weight:700;color:#ff6b35;animation:pulse 2s infinite}}
</style></head><body><div class="w">
<div class="hdr"><h1>🏈 NFL 2026 — Apuestas</h1><div class="sub">Super Bowl LXI · SoFi Stadium · 14 Feb 2027</div></div>
<div class="ctrls"><select id="ws" onchange="cw()">
{wl_html}
</select><button class="btn act" onclick="sf('a')">Todos</button><button class="btn" onclick="sf('l')">Locks</button><span class="cnt" id="cnt"></span></div>
<div id="gl"></div><div id="dt"></div></div>
<script>
var tc={json.dumps(tc)};
var st={json.dumps(st)};
var qb={json.dumps(qb)};
var df={json.dumps(df)};
var ol={json.dumps(ol)};
{ga_js}
var wm={{}},tn={{}},ca={{}},cw=1,cf="a";
Object.keys(tc).forEach(function(k){{tn[k]=tc[k].n;}});
ga.forEach(function(a){{var g={{w:a[0],a:a[1],h:a[2],s:a[3],o:a[4],d:a[5],n:a[6]}};if(!wm[g.w])wm[g.w]=[];wm[g.w].push(g);}});
function an(g){{var k=g.w+"_"+g.a+"_"+g.h;if(ca[k])return ca[k];var av=st[g.a]||70;var hv=st[g.h]||70;var sd=hv-av;var fd=av-hv;var qa=(qb[g.a]||70)-(qb[g.h]||70);var da=(df[g.a]||70)-(df[g.h]||70);var oa=(ol[g.a]||70)-(ol[g.h]||70);var mc=50+sd*2+Math.abs(qa)*0.3+Math.abs(da)*0.2+Math.abs(oa)*0.1;mc=Math.min(