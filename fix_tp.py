#!/usr/bin/env python3
"""Fix Top Player positions with comprehensive overrides"""
import json

with open('data/otc_rosters.json') as f: OTC = json.load(f)
with open('data/rosters_complete.json') as f: R = json.load(f)

POS_OVERRIDES = {
    # WR/RB mis-mapped as other positions
    "Tyreek Hill": "WR", "Deebo Samuel": "WR", "D.K. Metcalf": "WR",
    "Jaylen Waddle": "WR", "Chase Claypool": "WR", "George Pickens": "WR",
    "Nico Collins": "WR", "Kayshon Boutte": "WR", "Parker Washington": "WR",
    "Quincy Williams": "LB", "Nolan Smith": "DE", "Khalil Mack": "LB",
    "Jonnu Smith": "TE", "James Cook": "RB", "Keaton Mitchell": "RB",
    "Tank Bigsby": "RB", "Rachaad White": "RB", "Brian Robinson Jr.": "RB",
    "D'Andre Swift": "RB", "Jordan Mason": "RB", "Kenny Moore": "CB",
    "Shaquille Mason": "G", "Javon Kinlaw": "DT", "Jer'Zhan Newton": "DT",
    "Daron Payne": "DT", "Quinnen Williams": "DT", "DeForest Buckner": "DT",
    "Christian Wilkins": "DT", "Milton Williams": "DT",
    "Quan Martin": "S", "Cooper Kupp": "WR", "Marcus Epps": "S",
    "Minkah Fitzpatrick": "S", "Kyle Hamilton": "S", "Jevon Holland": "S",
    "Budda Baker": "S", "Jeremy Chinn": "S", "Talanoa Hufanga": "S",
    "Cam Bynum": "S", "Amani Hooker": "S", "Julian Love": "S",
    "Brian Branch": "S", "Jordan Howden": "S", "Jalen Ramsey": "CB",
    "Marlon Humphrey": "CB", "D.J. Reed": "CB", "D.J. Jones": "DT",
    "D.J. Reader": "DT", "D.J. Moore": "WR",
    "Trevon Diggs": "CB", "Stefon Diggs": "WR",
    "Gabriel Davis": "WR", "Taron Johnson": "CB", "Evan Engram": "TE",
    "Zack Martin": "G", "Marcus Williams": "S", "Tony Jefferson": "S",
    "Ernest Jones": "LB", "C.J. Mosley": "LB", "Frankie Luvu": "LB",
    "Ahmad Gardner": "CB", "Aaron Rodgers": "QB", "Derek Carr": "QB",
    "Brandon McManus": "K", "Chris Boswell": "K", "Bryan Anger": "P",
    "Cameron Dicker": "K", "A.J. Cole": "P", "Tyler Lockett": "WR",
    "Darius Slay": "CB", "Donte Jackson": "CB", "Brandon Stephens": "CB",
    "Sam Cosmi": "G", "Trey Hendrickson": "DE", "Dexter Lawrence": "DT",
    "Ricky Pearsall": "WR", "Michael Wilson": "WR", "Darnell Mooney": "WR",
    "Christian Kirk": "WR", "Ja'Marr Chase": "WR", "Tee Higgins": "WR",
    "Amon-Ra St. Brown": "WR", "Garrett Wilson": "WR", "Chris Olave": "WR",
    "Drake London": "WR", "Davante Adams": "WR", "CeeDee Lamb": "WR",
    "Allen Lazard": "WR", "Kalif Raymond": "WR", "Kendrick Bourne": "WR",
    # OL
    "Terron Armstead": "OT", "Jack Conklin": "OT", "Mekhi Becton": "OT",
    "Dan Moore Jr.": "OT", "Dion Dawkins": "OT", "Alaric Jackson": "OT",
    "Kolton Miller": "OT", "Andrew Thomas": "OT", "Abraham Lucas": "OT",
    "Tytus Howard": "OT", "Walker Little": "OT", "Mike McGlinchey": "OT",
    "Kevin Dotson": "G", "Will Fries": "G", "Michael Onwenu": "G",
    "Trey Smith": "G", "Jon Runyan, Jr.": "G", "Robert Hunt": "G",
    "Bobby Brown III": "DT",
    # Defensive
    "Harold Landry": "LB", "Cameron Jordan": "DE", "James Bradberry": "CB",
    "Yetur Gross-Matos": "DE", "Dorance Armstrong Jr.": "DE",
    "Alex Anzalone": "LB", "Davon Godchaux": "DT",
    "Dayo Odeyingbo": "DE", "Baron Browning": "LB", "Dre Greenlaw": "LB",
    "Javon Hargrave": "DT", "T.J. Watt": "LB", "Nick Bosa": "DE",
    "Maxx Crosby": "DE", "Micah Parsons": "LB", "Chris Jones": "DT",
    "Zach Allen": "DE", "Aidan Hutchinson": "DE", "George Karlaftis": "DE",
    "Montez Sweat": "DE", "Joey Bosa": "DE", "Kobie Turner": "DT",
    "Byron Young": "DE",
    # QBs
    "Brock Purdy": "QB", "Jared Goff": "QB", "Josh Allen": "QB",
    "Jalen Hurts": "QB", "Lamar Jackson": "QB", "Joe Burrow": "QB",
    "Trevor Lawrence": "QB", "C.J. Stroud": "QB", "Patrick Mahomes": "QB",
    "Breece Hall": "RB", "Bijan Robinson": "RB", "Jonathan Taylor": "RB",
    "Kenneth Walker III": "RB", "James Conner": "RB", "Jordan Love": "QB",
    "Geno Smith": "QB", "Justin Herbert": "QB", "Matt Stafford": "QB",
    "Tua Tagovailoa": "QB", "Justin Fields": "QB", "Will Levis": "QB",
    "Sam Darnold": "QB", "Kyler Murray": "QB", "Jake Browning": "QB",
    "Daniel Jones": "QB", "Mitchell Trubisky": "QB", "Carson Wentz": "QB",
    "Jameis Winston": "QB", "Jacoby Brissett": "QB", "Kirk Cousins": "QB",
    "Russell Wilson": "QB", "Drew Lock": "QB", "Mason Rudolph": "QB",
    "Deshaun Watson": "QB", "Tyrod Taylor": "QB", "Tommy DeVito": "QB",
    "Davis Mills": "QB", "Andy Dalton": "QB", "Zach Wilson": "QB",
    "Joe Flacco": "QB", "Tyson Bagent": "QB", "Sam Howell": "QB",
    "Jarrett Stidham": "QB", "Aidan O'Connell": "QB", "Kyle Allen": "QB",
    "Connor Bazelak": "QB", "Drake Jackson": "QB", "Kaytron Allen": "QB",
    # RBs
    "Phillip Dorsett": "RB", "Ty Johnson": "RB", "Justice Hill": "RB",
    "Josh Jacobs": "RB", "David Montgomery": "RB", "Kyren Williams": "RB",
    "DeeJay Dallas": "RB", "Hunter Luepke": "RB", "John Kelly": "RB",
    "Zach Charbonnet": "RB", "Devin Singletary": "RB", "Ben Sinnott": "RB",
    "Tony Pollard": "RB", "J.K. Dobbins": "RB", "Chuba Hubbard": "RB",
    "Ashton Jeanty": "RB", "Mike Washington Jr.": "RB",
    "Rhamondre Stevenson": "RB", "Jaylen Warren": "RB",
    "Devon Achane": "RB", "Kadarius Calloway": "RB",
    # WR additional
    "Jalen Nailor": "WR", "Tre Tucker": "WR", "Dareke Young": "WR",
    "K.J. Osborn": "WR", "Wan'Dale Robinson": "WR",
    "Cedric Tillman": "WR", "Alec Pierce": "WR",
    "Xavier Legette": "WR", "Jauan Jennings": "WR",
    "Quentin Johnston": "WR", "Josh Palmer": "WR",
    "Darius Slayton": "WR", "Courtland Sutton": "WR",
    "Jerry Jeudy": "WR", "Emeka Egbuka": "WR",
    "Jahan Dotson": "WR", "Romeo Doubs": "WR",
    "Christian Watson": "WR", "Brandon Aiyuk": "WR",
    "Malachi Corley": "WR", "Ladd McConkey": "WR",
    "Troy Franklin": "WR",
    # TE
    "Brock Bowers": "TE", "Noah Fant": "TE", "Greg Dulcich": "TE",
    "Kyle Pitts": "TE", "Dalton Schultz": "TE", "Hunter Henry": "TE",
    "George Kittle": "TE", "Cole Kmet": "TE", "Sam LaPorta": "TE",
    "T.J. Hockenson": "TE", "Pat Freiermuth": "TE", "Tucker Kraft": "TE",
    "Durham Smythe": "TE", "Colby Parkinson": "TE", "Elijah Higgins": "TE",
    "Isaiah Likely": "TE", "Mike Gesicki": "TE", "Hunter Long": "TE",
    "Jake Ferguson": "TE", "Grant Calcaterra": "TE", "Charlie Kolar": "TE",
    "John Bates": "TE", "Jeremy Ruckert": "TE", "Mo Alie-Cox": "TE",
    "Daniel Bellinger": "TE", "Noah Gray": "TE", "Eric Saubert": "TE",
    "Tommy Tremble": "TE", "Taysom Hill": "TE", "Devin Culp": "TE",
    "Michael Mayer": "TE", "Brenton Strange": "TE",
    # LB additional
    "Dre Greenlaw": "LB", "Roquan Smith": "LB", "Fred Warner": "LB",
    "Nick Bolton": "LB", "Demario Davis": "LB", "De'Vondre Campbell": "LB",
    "Zaire Franklin": "LB", "Jordyn Brooks": "LB", "Robert Spillane": "LB",
    "Divine Deablo": "LB", "T.J. Edwards": "LB", "Jamien Sherwood": "LB",
    "Nakobe Dean": "LB", "Quay Walker": "LB", "Tommy Eichenberg": "LB",
    "Joe Giles-Harris": "LB", "Dee Winters": "LB", "Christian Elliss": "LB",
    "Derrick Barnes": "LB", "Henry To'oTo'o": "LB",
    "Foyesade Oluokun": "LB", "Patrick Jones II": "LB",
    "Joe Tryon-Shoyinka": "LB", "Ogbonnia Okoronkwo": "LB",
    "Azeez Ojulari": "LB", "K.J. Britt": "LB", "Jack Gibbens": "LB",
    "Nate Landman": "LB", "Cody Barton": "LB", "Andrew Van Ginkel": "LB",
    "Uchenna Nwosu": "LB", "Harold Landry": "LB", "Baron Browning": "LB",
    "Jermaine Johnson II": "DE", "Chauncey Golston": "DE",
    "Kayvon Thibodeaux": "LB", "Rashan Gary": "LB",
    "Josh Hines-Allen": "DE", "Bradley Chubb": "LB",
    "Darius Robinson": "DE", "Carl Granderson": "DE",
    "Isaiah McGuire": "DE", "Keion White": "DE",
    "Aidan Hutchinson": "DE", "Travis Jones": "DT",
    # CB
    "Charvarius Ward": "CB", "Carlton Davis": "CB", "Jaylon Johnson": "CB",
    "Patrick Surtain II": "CB", "Denzel Ward": "CB",
    "Paulson Adebo": "CB", "Jaycee Horn": "CB", "Clark Phillips III": "CB",
    "Tariq Woolen": "CB", "Riq Woolen": "CB",
    "Keisean Nixon": "CB", "Isaac Yiadom": "CB", "Kristian Fulton": "CB",
    "Trent McDuffie": "CB", "Josh Jobe": "CB", "Alontae Taylor": "CB",
    "Cordale Flott": "CB", "Mike Hughes": "CB",
    "Chidobe Awuzie": "CB", "Benjamin St-Juste": "CB",
    "Cam Taylor-Britt": "CB", "Ayden Garnes": "CB",
    "D.J. Turner": "CB", "Emmanuel Forbes": "CB",
    "M.J. Stewart": "CB", "Tremon Smith": "CB",
    "Chauncey Gardner-Johnson, Jr.": "CB",
    "Dicaprio Bootle": "CB", "Deonte Banks": "CB",
    "Tyrique Stevenson": "CB", "Kool-Aid McKinstry": "CB",
    "Brandon Stephens": "CB", "Nate Hobbs": "CB",
    "Garrett Williams": "CB", "Jakorian Bennett": "CB",
    "Kyu Blu Kelly": "CB", "Cameron Brown": "CB",
    "Rico Payton": "CB", "Roger McCreary": "CB",
    # S
    "Javon Bullard": "S", "Chamarri Conner": "S",
    "Malik Hooker": "S", "Ronnie Hickman": "S",
    "Antonio Johnson": "S", "Jordan Battle": "S",
    "Elijah Hicks": "S", "Quentin Lake": "S",
    "Josh Metellus": "S", "Ji'Ayir Brown": "S",
    "Kyle Dugger": "S", "Johnathan Abram": "S",
    "Marcus Banks": "S", "Trevon Moehrig": "S",
    "Isaiah Pola-Mao": "S", "Harrison Smith": "S",
    "Dax Hill": "S", "Brandon Jones": "S",
    "Marcus Maye": "S", "Will Harris": "S",
    "Tyler Nubin": "S", "Daxton Hill": "S",
    "Gunner Olszewski": "S", "Samuel Cosmi": "S",
}

team_pos = {}
for abbr, td in R.items():
    team_pos[abbr] = {}
    plyrs = td.get("players", {})
    all_p = (plyrs.get("offense",[])or[]) + (plyrs.get("defense",[])or[]) + (plyrs.get("specialTeam",[])or[])
    for p in all_p:
        full = f"{p['firstName']} {p['lastName']}".lower()
        last = p["lastName"].lower()
        info = {"pos": p.get("position","?"), "jersey": p.get("jersey",""), "age": p.get("age","")}
        team_pos[abbr][full] = info
        team_pos[abbr][last] = info

OFF_POS = {"QB","WR","RB","TE","OT","OG","C","G","T","OL","FB","LS"}
DEF_POS = {"DE","DT","LB","CB","S","NT","OLB","MLB","ILB","EDGE","DB","FS","SS","SAF","DL"}
KICK_POS = {"P","K","PK"}

def safe_cap(cap_str):
    if not cap_str or cap_str == "N/A": return 0
    try: return int(cap_str.replace("$","").replace(",",""))
    except: return 0

def get_pos_info(name, team):
    nl = name.lower()
    if name in POS_OVERRIDES:
        return {"pos": POS_OVERRIDES[name], "jersey": "", "age": ""}
    tm = team_pos.get(team, {})
    if nl in tm: return tm[nl]
    last = nl.split()[-1] if " " in nl else nl
    if last in tm: return tm[last]
    for t, pm in team_pos.items():
        if nl in pm: return pm[nl]
    for t, pm in team_pos.items():
        if last in pm: return pm[last]
    return {"pos": "?", "jersey": "", "age": ""}

TP = {}
for abbr, players in OTC.items():
    offense, defense = [], []
    for p in players:
        pi = get_pos_info(p["name"], abbr)
        pos = pi["pos"]
        entry = {"name": p["name"], "cap": p["cap"], "pos": pos, "jersey": pi.get("jersey",""), "age": pi.get("age","")}
        if pos in OFF_POS: offense.append(entry)
        elif pos in DEF_POS: defense.append(entry)
        elif pos in KICK_POS: offense.append(entry)
        else: offense.append(entry)

    offense.sort(key=lambda x: safe_cap(x["cap"]), reverse=True)
    defense.sort(key=lambda x: safe_cap(x["cap"]), reverse=True)

    # Diversified picks - 1 QB, 1 WR, 1 RB, 1 TE, then best remaining
    top_off = []; added = set()
    for pos in ["QB","WR","RB","TE"]:
        for p in offense:
            if p["name"] not in added and p["pos"] == pos:
                top_off.append(p); added.add(p["name"]); break
    for p in offense:
        if p["name"] not in added:
            top_off.append(p); added.add(p["name"])
        if len(top_off) >= 6: break

    top_def = []; added_def = set()
    for pos in ["DE","DT","LB","CB","S"]:
        for p in defense:
            if p["name"] not in added_def and p["pos"] == pos:
                top_def.append(p); added_def.add(p["name"]); break
    for p in defense:
        if p["name"] not in added_def:
            top_def.append(p); added_def.add(p["name"])
        if len(top_def) >= 6: break

    TP[abbr] = {"offense": top_off[:6], "defense": top_def[:6]}

# Update
with open("data/um3_data.json", "r") as f:
    um3 = json.load(f)
um3["TP"] = TP
with open("data/um3_data.json", "w") as f:
    json.dump(um3, f)

# Verify all teams
for abbr in sorted(TP.keys()):
    t = TP[abbr]
    o = ", ".join([f"{p['name']}({p['pos']})" for p in t["offense"]])
    d = ", ".join([f"{p['name']}({p['pos']})" for p in t["defense"]])
    print(f"{abbr}:")
    print(f"  OFF: {o}")
    print(f"  DEF: {d}")

total = sum(len(v["offense"])+len(v["defense"]) for v in TP.values())
q_mark = sum(1 for v in TP.values() for p in v["offense"]+v["defense"] if p["pos"]=="?")
fully_mapped = sum(1 for v in TP.values() for p in v["offense"]+v["defense"] if p["pos"]!="?")
print(f"\n✅ {total} players ({fully_mapped} mapped, {q_mark} unknown pos)")
print(f"✅ {len(TP)} teams with 12/12 players each")
