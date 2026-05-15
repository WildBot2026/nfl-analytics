// ============================================================
// NFL 2026 — Data Completo: Teams, Schedule, Draft, UDFAs
// Generado: 2026-05-09
// ============================================================

// ---- TEAMS ----
const teams = [
  { id: "ARI", name: "Arizona Cardinals", city: "Glendale", conf: "NFC", div: "West", color: "#97233f" },
  { id: "ATL", name: "Atlanta Falcons", city: "Atlanta", conf: "NFC", div: "South", color: "#a71930" },
  { id: "BAL", name: "Baltimore Ravens", city: "Baltimore", conf: "AFC", div: "North", color: "#241773" },
  { id: "BUF", name: "Buffalo Bills", city: "Orchard Park", conf: "AFC", div: "East", color: "#00338d" },
  { id: "CAR", name: "Carolina Panthers", city: "Charlotte", conf: "NFC", div: "South", color: "#0085ca" },
  { id: "CHI", name: "Chicago Bears", city: "Chicago", conf: "NFC", div: "North", color: "#0b162a" },
  { id: "CIN", name: "Cincinnati Bengals", city: "Cincinnati", conf: "AFC", div: "North", color: "#fb4f14" },
  { id: "CLE", name: "Cleveland Browns", city: "Cleveland", conf: "AFC", div: "North", color: "#311d00" },
  { id: "DAL", name: "Dallas Cowboys", city: "Arlington", conf: "NFC", div: "East", color: "#003594" },
  { id: "DEN", name: "Denver Broncos", city: "Denver", conf: "AFC", div: "West", color: "#fb4f14" },
  { id: "DET", name: "Detroit Lions", city: "Detroit", conf: "NFC", div: "North", color: "#0076b6" },
  { id: "GB",  name: "Green Bay Packers", city: "Green Bay", conf: "NFC", div: "North", color: "#203731" },
  { id: "HOU", name: "Houston Texans", city: "Houston", conf: "AFC", div: "South", color: "#03202f" },
  { id: "IND", name: "Indianapolis Colts", city: "Indianapolis", conf: "AFC", div: "South", color: "#002c5f" },
  { id: "JAC", name: "Jacksonville Jaguars", city: "Jacksonville", conf: "AFC", div: "South", color: "#101820" },
  { id: "KC",  name: "Kansas City Chiefs", city: "Kansas City", conf: "AFC", div: "West", color: "#e31837" },
  { id: "LV",  name: "Las Vegas Raiders", city: "Las Vegas", conf: "AFC", div: "West", color: "#000000" },
  { id: "LAC", name: "Los Angeles Chargers", city: "Inglewood", conf: "AFC", div: "West", color: "#0080c6" },
  { id: "LAR", name: "Los Angeles Rams", city: "Inglewood", conf: "NFC", div: "West", color: "#003594" },
  { id: "MIA", name: "Miami Dolphins", city: "Miami Gardens", conf: "AFC", div: "East", color: "#008e97" },
  { id: "MIN", name: "Minnesota Vikings", city: "Minneapolis", conf: "NFC", div: "North", color: "#4f2683" },
  { id: "NE",  name: "New England Patriots", city: "Foxborough", conf: "AFC", div: "East", color: "#002244" },
  { id: "NO",  name: "New Orleans Saints", city: "New Orleans", conf: "NFC", div: "South", color: "#d3bc8d" },
  { id: "NYG", name: "New York Giants", city: "East Rutherford", conf: "NFC", div: "East", color: "#0b2265" },
  { id: "NYJ", name: "New York Jets", city: "East Rutherford", conf: "AFC", div: "East", color: "#125740" },
  { id: "PHI", name: "Philadelphia Eagles", city: "Philadelphia", conf: "NFC", div: "East", color: "#004c54" },
  { id: "PIT", name: "Pittsburgh Steelers", city: "Pittsburgh", conf: "AFC", div: "North", color: "#ffb612" },
  { id: "SEA", name: "Seattle Seahawks", city: "Seattle", conf: "NFC", div: "West", color: "#002244" },
  { id: "SF",  name: "San Francisco 49ers", city: "Santa Clara", conf: "NFC", div: "West", color: "#aa0000" },
  { id: "TB",  name: "Tampa Bay Buccaneers", city: "Tampa", conf: "NFC", div: "South", color: "#d50a0a" },
  { id: "TEN", name: "Tennessee Titans", city: "Nashville", conf: "AFC", div: "South", color: "#0c2340" },
  { id: "WAS", name: "Washington Commanders", city: "Landover", conf: "NFC", div: "East", color: "#5a1414" }
];

// ---- KEY DATES ----
const keyDates = [
  { date: "2026-08-06", event: "Hall of Fame Game (Canton, OH)", detail: "Cardinals vs. Panthers — NBC 8PM ET" },
  { date: "2026-09-09", event: "Kickoff Week 1", detail: "TBD @ Seattle Seahawks — NBC 8:20PM ET" },
  { date: "2026-09-10", event: "NFL Melbourne, Australia", detail: "49ers vs. Rams — FOX 8:35PM ET" },
  { date: "2026-09-11", event: "Week 1 SNF", detail: "NBC" },
  { date: "2026-09-13", event: "Week 1 Sunday", detail: "Full slate" },
  { date: "2026-09-14", event: "Week 1 MNF", detail: "ESPN/ABC" },
  { date: "2026-09-27", event: "NFL Rio de Janeiro, Brazil", detail: "Ravens vs. Cowboys — NFLN" },
  { date: "2026-10-25", event: "NFL Paris, France", detail: "Saints vs. TBD — NFLN 9:30AM ET" },
  { date: "2026-11-26", event: "Thanksgiving", detail: "Lions @ home (CBS 12:30PM), Cowboys @ home (FOX 4:30PM)" },
  { date: "2026-12-25", event: "Christmas Tripleheader", detail: "Full schedule TBD" },
  { date: "2027-01-10", event: "Regular Season Finale", detail: "Week 18" },
  { date: "2027-01-16", event: "Super Wild Card Weekend", detail: "TBD" },
  { date: "2027-02-14", event: "Super Bowl LXI", detail: "SoFi Stadium, Inglewood CA" }
];

// ---- 2026 DRAFT (complete) ----
const draft2026 = {
  ARI: [
    { round: 1, pick: 3,  name: "Jeremiyah Love", pos: "RB", college: "Notre Dame" },
    { round: 2, pick: 34, name: "Chase Bisontis", pos: "IOL", college: "Texas A&M" },
    { round: 3, pick: 65, name: "Carson Beck", pos: "QB", college: "Miami" },
    { round: 4, pick: 104,name: "Kaleb Proctor", pos: "DL", college: "SE Louisiana" },
    { round: 5, pick: 143,name: "Reggie Virgil", pos: "WR", college: "Texas Tech" },
    { round: 6, pick: 183,name: "Karson Sharar", pos: "LB", college: "Iowa" },
    { round: 7, pick: 217,name: "Jayden Williams", pos: "OT", college: "Ole Miss" }
  ],
  ATL: [
    { round: 2, pick: 48, name: "Avieon Terrell", pos: "CB", college: "Clemson" },
    { round: 3, pick: 79, name: "Zachariah Branch", pos: "WR", college: "Georgia" },
    { round: 4, pick: 134,name: "Kendal Daniels", pos: "LB", college: "Oklahoma" },
    { round: 6, pick: 208,name: "Anterio Thompson", pos: "DT", college: "Washington" },
    { round: 6, pick: 215,name: "Harold Perkins Jr.", pos: "LB", college: "LSU" },
    { round: 7, pick: 231,name: "Ethan Onianwa", pos: "OT", college: "Ohio State" }
  ],
  BAL: [
    { round: 1, pick: 14, name: "Olaivavega Ioane", pos: "IOL", college: "Penn State" },
    { round: 2, pick: 45, name: "Zion Young", pos: "EDGE", college: "Missouri" },
    { round: 3, pick: 80, name: "Ja'Kobi Lane", pos: "WR", college: "USC" },
    { round: 4, pick: 115,name: "Elijah Sarratt", pos: "WR", college: "Indiana" },
    { round: 5, pick: 133,name: "Matthew Hibner", pos: "TE", college: "SMU" },
    { round: 5, pick: 162,name: "Chandler Rivers", pos: "CB", college: "Duke" },
    { round: 5, pick: 173,name: "Josh Cuevas", pos: "TE", college: "Alabama" },
    { round: 5, pick: 174,name: "Adam Randall", pos: "RB", college: "Clemson" },
    { round: 6, pick: 211,name: "Ryan Eckley", pos: "P", college: "Michigan State" },
    { round: 7, pick: 250,name: "Rayshaun Benny", pos: "DT", college: "Michigan" },
    { round: 7, pick: 253,name: "Evan Beerntsen", pos: "G", college: "Northwestern" }
  ],
  BUF: [
    { round: 2, pick: 35, name: "T.J. Parker", pos: "EDGE", college: "Clemson" },
    { round: 2, pick: 62, name: "Davison Igbinosun", pos: "CB", college: "Ohio State" },
    { round: 4, pick: 102,name: "Jude Bowry", pos: "OT", college: "Boston College" },
    { round: 4, pick: 125,name: "Skyler Bell", pos: "WR", college: "UConn" },
    { round: 4, pick: 126,name: "Kaleb Elarms-Orr", pos: "LB", college: "TCU" },
    { round: 5, pick: 167,name: "Jalon Kilgore", pos: "S", college: "South Carolina" },
    { round: 5, pick: 181,name: "Zane Durant", pos: "DT", college: "Penn State" },
    { round: 7, pick: 220,name: "Toriano Pride Jr.", pos: "CB", college: "Missouri" },
    { round: 7, pick: 239,name: "Tommy Doman", pos: "P", college: "Florida" },
    { round: 7, pick: 241,name: "Ar'Maj Reed-Adams", pos: "G", college: "Texas A&M" }
  ],
  CAR: [
    { round: 1, pick: 19, name: "Monroe Freeling", pos: "OT", college: "Georgia" },
    { round: 2, pick: 49, name: "Lee Hunter", pos: "DL", college: "Texas Tech" },
    { round: 3, pick: 83, name: "Chris Brazzell II", pos: "WR", college: "Tennessee" },
    { round: 4, pick: 129,name: "Will Lee III", pos: "CB", college: "Texas A&M" },
    { round: 5, pick: 144,name: "Sam Hecht", pos: "IOL", college: "Kansas State" },
    { round: 5, pick: 151,name: "Zakee Wheatley", pos: "S", college: "Penn State" },
    { round: 7, pick: 227,name: "Jackson Kuwatch", pos: "LB", college: "Miami (OH)" }
  ],
  CHI: [
    { round: 1, pick: 25, name: "Dillon Thieneman", pos: "S", college: "Oregon" },
    { round: 2, pick: 57, name: "Logan Jones", pos: "IOL", college: "Iowa" },
    { round: 3, pick: 69, name: "Sam Roush", pos: "TE", college: "Stanford" },
    { round: 3, pick: 89, name: "Zavion Thomas", pos: "WR", college: "LSU" },
    { round: 4, pick: 124,name: "Malik Muhammad", pos: "CB", college: "Texas" },
    { round: 4, pick: 166,name: "Keyshaun Elliott", pos: "LB", college: "Arizona State" },
    { round: 6, pick: 213,name: "Jordan van den Berg", pos: "DL", college: "Georgia Tech" }
  ],
  CIN: [
    { round: 2, pick: 41, name: "Cashius Howell", pos: "EDGE", college: "Texas A&M" },
    { round: 3, pick: 72, name: "Tacario Davis", pos: "CB", college: "Washington" },
    { round: 4, pick: 128,name: "Connor Lew", pos: "IOL", college: "Auburn" },
    { round: 4, pick: 140,name: "Colbie Young", pos: "WR", college: "Georgia" },
    { round: 6, pick: 189,name: "Brian Parker II", pos: "G", college: "Duke" },
    { round: 7, pick: 221,name: "Jack Endries", pos: "TE", college: "Texas" },
    { round: 7, pick: 226,name: "Landon Robinson", pos: "DT", college: "Navy" }
  ],
  CLE: [
    { round: 1, pick: 9,  name: "Spencer Fano", pos: "OT", college: "Utah" },
    { round: 1, pick: 24, name: "KC Concepcion", pos: "WR", college: "Texas A&M" },
    { round: 2, pick: 39, name: "Denzel Boston", pos: "WR", college: "Washington" },
    { round: 2, pick: 58, name: "Emmanuel McNeil-Warren", pos: "S", college: "Toledo" },
    { round: 3, pick: 86, name: "Austin Barber", pos: "OT", college: "Florida" },
    { round: 5, pick: 146,name: "Parker Brailsford", pos: "IOL", college: "Alabama" },
    { round: 5, pick: 149,name: "Justin Jefferson", pos: "LB", college: "Alabama" },
    { round: 5, pick: 170,name: "Joe Royer", pos: "TE", college: "Cincinnati" },
    { round: 6, pick: 182,name: "Taylen Green", pos: "QB", college: "Arkansas" },
    { round: 7, pick: 248,name: "Carsen Ryan", pos: "TE", college: "BYU" }
  ],
  DAL: [
    { round: 1, pick: 11, name: "Caleb Downs", pos: "S", college: "Ohio State" },
    { round: 1, pick: 23, name: "Malachi Lawrence", pos: "EDGE", college: "UCF" },
    { round: 3, pick: 92, name: "Jaishawn Barham", pos: "EDGE", college: "Michigan" },
    { round: 4, pick: 112,name: "Drew Shelton", pos: "OT", college: "Penn State" },
    { round: 4, pick: 114,name: "Devin Moore", pos: "CB", college: "Florida" },
    { round: 4, pick: 137,name: "LT Overton", pos: "DL", college: "Alabama" },
    { round: 7, pick: 218,name: "Anthony Smith", pos: "WR", college: "East Carolina" }
  ],
  DEN: [
    { round: 3, pick: 66, name: "Tyler Onyedim", pos: "DT", college: "Texas A&M" },
    { round: 4, pick: 108,name: "Jonah Coleman", pos: "RB", college: "Washington" },
    { round: 4, pick: 111,name: "Kage Casey", pos: "IOL", college: "Boise State" },
    { round: 5, pick: 152,name: "Justin Joly", pos: "TE", college: "NC State" },
    { round: 7, pick: 246,name: "Miles Scott", pos: "S", college: "Illinois" },
    { round: 7, pick: 256,name: "Dallen Bentley", pos: "TE", college: "Utah" },
    { round: 7, pick: 257,name: "Red Murdock", pos: "LB", college: "Buffalo" }
  ],
  DET: [
    { round: 1, pick: 17, name: "Blake Miller", pos: "OT", college: "Clemson" },
    { round: 2, pick: 44, name: "Derrick Moore", pos: "EDGE", college: "Michigan" },
    { round: 4, pick: 118,name: "Jimmy Rolder", pos: "LB", college: "Michigan" },
    { round: 5, pick: 157,name: "Keith Abney II", pos: "CB", college: "Arizona State" },
    { round: 5, pick: 168,name: "Kendrick Law", pos: "WR", college: "Kentucky" },
    { round: 6, pick: 205,name: "Skyler Gill-Howard", pos: "DT", college: "Texas Tech" },
    { round: 7, pick: 222,name: "Tyre West", pos: "EDGE", college: "Tennessee" }
  ],
  GB: [
    { round: 2, pick: 52, name: "Brandon Cisse", pos: "CB", college: "South Carolina" },
    { round: 3, pick: 77, name: "Chris McClellan", pos: "DL", college: "Missouri" },
    { round: 4, pick: 120,name: "Dani Dennis-Sutton", pos: "EDGE", college: "Penn State" },
    { round: 5, pick: 153,name: "Jager Burton", pos: "IOL", college: "Kentucky" },
    { round: 6, pick: 201,name: "Domani Jackson", pos: "CB", college: "Alabama" },
    { round: 6, pick: 216,name: "Trey Smack", pos: "PK", college: "Florida" }
  ],
  HOU: [
    { round: 1, pick: 26, name: "Keylan Rutledge", pos: "IOL", college: "Georgia Tech" },
    { round: 2, pick: 36, name: "Kayden McDonald", pos: "DL", college: "Ohio State" },
    { round: 2, pick: 59, name: "Marlin Klein", pos: "TE", college: "Michigan" },
    { round: 4, pick: 106,name: "Febechi Nwaiwu", pos: "IOL", college: "Oklahoma" },
    { round: 4, pick: 123,name: "Wade Woodaz", pos: "LB", college: "Clemson" },
    { round: 5, pick: 141,name: "Kamari Ramsey", pos: "S", college: "USC" },
    { round: 6, pick: 204,name: "Lewis Bond", pos: "WR", college: "Boston College" },
    { round: 7, pick: 243,name: "Aiden Fisher", pos: "LB", college: "Indiana" }
  ],
  IND: [
    { round: 2, pick: 53, name: "CJ Allen", pos: "LB", college: "Georgia" },
    { round: 3, pick: 78, name: "A.J. Haulcy", pos: "S", college: "LSU" },
    { round: 4, pick: 113,name: "Jalen Farmer", pos: "IOL", college: "Kentucky" },
    { round: 4, pick: 135,name: "Bryce Boettcher", pos: "LB", college: "Oregon" },
    { round: 5, pick: 156,name: "George Gumbs Jr.", pos: "EDGE", college: "Florida" },
    { round: 6, pick: 214,name: "Caden Curry", pos: "EDGE", college: "Ohio State" },
    { round: 7, pick: 237,name: "Seth McGowan", pos: "RB", college: "Kentucky" },
    { round: 7, pick: 254,name: "Deion Burks", pos: "WR", college: "Oklahoma" }
  ],
  JAC: [
    { round: 2, pick: 56, name: "Nate Boerkircher", pos: "TE", college: "Texas A&M" },
    { round: 3, pick: 81, name: "Albert Regis", pos: "DL", college: "Texas A&M" },
    { round: 3, pick: 88, name: "Emmanuel Pregnon", pos: "IOL", college: "Oregon" },
    { round: 3, pick: 100,name: "Jalen Huskey", pos: "S", college: "Maryland" },
    { round: 4, pick: 119,name: "Wesley Williams", pos: "EDGE", college: "Duke" },
    { round: 5, pick: 164,name: "Tanner Koziol", pos: "TE", college: "Houston" },
    { round: 6, pick: 191,name: "Josh Cameron", pos: "WR", college: "Baylor" },
    { round: 6, pick: 203,name: "CJ Williams", pos: "WR", college: "Stanford" },
    { round: 7, pick: 233,name: "Zach Durfee", pos: "EDGE", college: "Washington" },
    { round: 7, pick: 240,name: "Parker Hughes", pos: "LB", college: "Middle Tennessee" }
  ],
  KC: [
    { round: 1, pick: 6,  name: "Mansoor Delane", pos: "CB", college: "LSU" },
    { round: 1, pick: 29, name: "Peter Woods", pos: "DL", college: "Clemson" },
    { round: 2, pick: 40, name: "R Mason Thomas", pos: "EDGE", college: "Oklahoma" },
    { round: 5, pick: 109,name: "Jadon Canady", pos: "CB", college: "Oregon" },
    { round: 5, pick: 161,name: "Emmett Johnson", pos: "RB", college: "Nebraska" },
    { round: 5, pick: 176,name: "Cyrus Allen", pos: "WR", college: "Cincinnati" },
    { round: 7, pick: 249,name: "Garrett Nussmeier", pos: "QB", college: "LSU" }
  ],
  LV: [
    { round: 1, pick: 1,  name: "Fernando Mendoza", pos: "QB", college: "Indiana" },
    { round: 2, pick: 38, name: "Treydan Stukes", pos: "S", college: "Arizona" },
    { round: 3, pick: 67, name: "Keyron Crawford", pos: "EDGE", college: "Auburn" },
    { round: 3, pick: 91, name: "Trey Zuhn III", pos: "IOL", college: "Texas A&M" },
    { round: 4, pick: 101,name: "Jermod McCoy", pos: "CB", college: "Tennessee" },
    { round: 4, pick: 122,name: "Mike Washington Jr", pos: "RB", college: "Arkansas" },
    { round: 5, pick: 150,name: "Dalton Johnson", pos: "S", college: "Arizona" },
    { round: 5, pick: 175,name: "Hezekiah Masses", pos: "CB", college: "California" },
    { round: 6, pick: 195,name: "Malik Benson", pos: "WR", college: "Oregon" },
    { round: 7, pick: 229,name: "Brandon Cleveland", pos: "DT", college: "NC State" }
  ],
  LAC: [
    { round: 1, pick: 22, name: "Akheem Mesidor", pos: "EDGE", college: "Miami" },
    { round: 2, pick: 63, name: "Jake Slaughter", pos: "IOL", college: "Florida" },
    { round: 4, pick: 105,name: "Brenen Thompson", pos: "WR", college: "Mississippi State" },
    { round: 4, pick: 117,name: "Travis Burke", pos: "OT", college: "Memphis" },
    { round: 4, pick: 131,name: "Genesis Smith", pos: "S", college: "Arizona" },
    { round: 5, pick: 145,name: "Nick Barrett", pos: "DL", college: "South Carolina" },
    { round: 6, pick: 202,name: "Logan Taylor", pos: "G", college: "Boston College" },
    { round: 6, pick: 206,name: "Alex Harkey", pos: "G", college: "Oregon" }
  ],
  LAR: [
    { round: 1, pick: 13, name: "Ty Simpson", pos: "QB", college: "Alabama" },
    { round: 2, pick: 61, name: "Max Klare", pos: "TE", college: "Ohio State" },
    { round: 3, pick: 93, name: "Keagen Trost", pos: "IOL", college: "Missouri" },
    { round: 6, pick: 197,name: "CJ Daniels", pos: "WR", college: "Miami" },
    { round: 7, pick: 232,name: "Tim Keenan III", pos: "DT", college: "Alabama" }
  ],
  MIA: [
    { round: 1, pick: 12, name: "Kadyn Proctor", pos: "OT", college: "Alabama" },
    { round: 1, pick: 27, name: "Chris Johnson", pos: "CB", college: "San Diego State" },
    { round: 2, pick: 43, name: "Jacob Rodriguez", pos: "LB", college: "Texas Tech" },
    { round: 3, pick: 75, name: "Caleb Douglas", pos: "WR", college: "Texas Tech" },
    { round: 3, pick: 87, name: "Will Kacmarek", pos: "TE", college: "Ohio State" },
    { round: 3, pick: 94, name: "Chris Bell", pos: "WR", college: "Louisville" },
    { round: 4, pick: 130,name: "Trey Moore", pos: "LB", college: "Texas" },
    { round: 4, pick: 138,name: "Kyle Louis", pos: "LB", college: "Pittsburgh" },
    { round: 5, pick: 158,name: "Michael Taaffe", pos: "S", college: "Texas" },
    { round: 5, pick: 177,name: "Kevin Coleman Jr.", pos: "WR", college: "Missouri" },
    { round: 5, pick: 180,name: "Seydou Traore", pos: "TE", college: "Mississippi State" },
    { round: 6, pick: 200,name: "DJ Campbell", pos: "G", college: "Texas" },
    { round: 7, pick: 238,name: "Max Llewellyn", pos: "EDGE", college: "Iowa" }
  ],
  MIN: [
    { round: 1, pick: 18, name: "Caleb Banks", pos: "DL", college: "Florida" },
    { round: 2, pick: 51, name: "Jake Golday", pos: "LB", college: "Cincinnati" },
    { round: 3, pick: 82, name: "Domonique Orange", pos: "DL", college: "Iowa State" },
    { round: 3, pick: 97, name: "Caleb Tiernan", pos: "OT", college: "Northwestern" },
    { round: 3, pick: 98, name: "Jakobe Thomas", pos: "S", college: "Miami" },
    { round: 5, pick: 159,name: "Max Bredeson", pos: "HB", college: "Michigan" },
    { round: 5, pick: 163,name: "Charles Demmings", pos: "CB", college: "Stephen F. Austin" },
    { round: 6, pick: 198,name: "Demond Clairborne", pos: "RB", college: "Wake Forest" },
    { round: 7, pick: 235,name: "Gavin Gerhardt", pos: "C", college: "Cincinnati" }
  ],
  NE: [
    { round: 1, pick: 28, name: "Caleb Lomu", pos: "OT", college: "Utah" },
    { round: 2, pick: 55, name: "Gabe Jacas", pos: "EDGE", college: "Illinois" },
    { round: 3, pick: 95, name: "Eli Raridon", pos: "TE", college: "Notre Dame" },
    { round: 5, pick: 171,name: "Karon Prunty", pos: "DB", college: "Wake Forest" },
    { round: 6, pick: 196,name: "Dametrious Crownover", pos: "OT", college: "Texas A&M" },
    { round: 6, pick: 212,name: "Namdi Obiazor", pos: "LB", college: "TCU" },
    { round: 7, pick: 234,name: "Behren Morton", pos: "QB", college: "Texas Tech" },
    { round: 7, pick: 245,name: "Jam Miller", pos: "RB", college: "Alabama" },
    { round: 7, pick: 247,name: "Quintayvious Hutchins", pos: "EDGE", college: "Boston College" }
  ],
  NO: [
    { round: 1, pick: 8,  name: "Jordyn Tyson", pos: "WR", college: "Arizona State" },
    { round: 2, pick: 42, name: "Christen Miller", pos: "DL", college: "Georgia" },
    { round: 3, pick: 73, name: "Oscar Delp", pos: "TE", college: "Georgia" },
    { round: 4, pick: 132,name: "Jeremiah Wright", pos: "IOL", college: "Auburn" },
    { round: 4, pick: 136,name: "Bryce Lance", pos: "WR", college: "North Dakota State" },
    { round: 5, pick: 172,name: "Lorenzo Styles Jr.", pos: "CB", college: "Ohio State" },
    { round: 6, pick: 190,name: "Barion Brown", pos: "WR", college: "LSU" },
    { round: 7, pick: 219,name: "TJ Hall", pos: "CB", college: "Iowa" }
  ],
  NYG: [
    { round: 1, pick: 5,  name: "Arvell Reese", pos: "EDGE", college: "Ohio State" },
    { round: 1, pick: 10, name: "Francis Mauigoa", pos: "OT", college: "Miami" },
    { round: 2, pick: 37, name: "Colton Hood", pos: "CB", college: "Tennessee" },
    { round: 3, pick: 74, name: "Malachi Fields", pos: "WR", college: "Notre Dame" },
    { round: 6, pick: 186,name: "Bobby Jamison-Travis", pos: "DL", college: "Auburn" },
    { round: 6, pick: 192,name: "J.C. Davis", pos: "OT", college: "Illinois" },
    { round: 6, pick: 193,name: "Jack Kelly", pos: "LB", college: "BYU" }
  ],
  NYJ: [
    { round: 1, pick: 2,  name: "David Bailey", pos: "EDGE", college: "Texas Tech" },
    { round: 1, pick: 16, name: "Kenyon Sadiq", pos: "TE", college: "Oregon" },
    { round: 1, pick: 30, name: "Omar Cooper Jr.", pos: "WR", college: "Indiana" },
    { round: 2, pick: 50, name: "D'Angelo Ponds", pos: "CB", college: "Indiana" },
    { round: 4, pick: 103,name: "Darrell Jackson Jr.", pos: "DL", college: "Florida State" },
    { round: 4, pick: 110,name: "Cade Klubnik", pos: "QB", college: "Clemson" },
    { round: 6, pick: 188,name: "Anez Cooper", pos: "G", college: "Miami" },
    { round: 7, pick: 228,name: "VJ Payne", pos: "S", college: "Kansas State" }
  ],
  PHI: [
    { round: 1, pick: 20, name: "Makai Lemon", pos: "WR", college: "USC" },
    { round: 2, pick: 54, name: "Eli Stowers", pos: "TE", college: "Vanderbilt" },
    { round: 3, pick: 68, name: "Markel Bell", pos: "OT", college: "Miami" },
    { round: 5, pick: 178,name: "Cole Payton", pos: "QB", college: "North Dakota State" },
    { round: 6, pick: 207,name: "Micah Morris", pos: "G", college: "Georgia" },
    { round: 7, pick: 244,name: "Cole Wisniewski", pos: "S", college: "Texas Tech" },
    { round: 7, pick: 251,name: "Uar Bernard", pos: "DT", college: "Nigeria" },
    { round: 7, pick: 252,name: "Keyshawn James-Newby", pos: "EDGE", college: "New Mexico" }
  ],
  PIT: [
    { round: 1, pick: 21, name: "Max Iheanachor", pos: "OT", college: "Arizona State" },
    { round: 2, pick: 47, name: "Germie Bernard", pos: "WR", college: "Alabama" },
    { round: 3, pick: 76, name: "Drew Allar", pos: "QB", college: "Penn State" },
    { round: 3, pick: 85, name: "Daylen Everette", pos: "CB", college: "Georgia" },
    { round: 3, pick: 96, name: "Gennings Dunker", pos: "IOL", college: "Iowa" },
    { round: 4, pick: 121,name: "Kaden Wetjen", pos: "WR", college: "Iowa" },
    { round: 5, pick: 169,name: "Riley Nowakowski", pos: "TE", college: "Indiana" },
    { round: 6, pick: 210,name: "Gabriel Rubio", pos: "DT", college: "Notre Dame" },
    { round: 7, pick: 224,name: "Robert Spears-Jennings", pos: "S", college: "Oklahoma" },
    { round: 7, pick: 230,name: "Eli Heidenreich", pos: "RB", college: "Navy" }
  ],
  SF: [
    { round: 2, pick: 33, name: "De'Zhaun Stribling", pos: "WR", college: "Ole Miss" },
    { round: 3, pick: 70, name: "Romello Height", pos: "EDGE", college: "Texas Tech" },
    { round: 3, pick: 90, name: "Kaelon Black", pos: "RB", college: "Indiana" },
    { round: 4, pick: 107,name: "Gracen Halton", pos: "DL", college: "Oklahoma" },
    { round: 4, pick: 127,name: "Carver Willis", pos: "OT", college: "Washington" },
    { round: 4, pick: 139,name: "Ephesians Prysock", pos: "CB", college: "Washington" },
    { round: 5, pick: 154,name: "Jaden Dugger", pos: "LB", college: "Louisiana" },
    { round: 5, pick: 179,name: "Enrique Cruz Jr.", pos: "OT", college: "Kansas" }
  ],
  SEA: [
    { round: 1, pick: 32, name: "Jadarian Price", pos: "RB", college: "Notre Dame" },
    { round: 2, pick: 64, name: "Bud Clark", pos: "S", college: "TCU" },
    { round: 3, pick: 99, name: "Julian Neal", pos: "CB", college: "Arkansas" },
    { round: 5, pick: 148,name: "Beau Stephens", pos: "IOL", college: "Iowa" },
    { round: 6, pick: 199,name: "Emmanuel Henderson Jr.", pos: "WR", college: "Kansas" },
    { round: 7, pick: 236,name: "Andre Fuller", pos: "CB", college: "Toledo" },
    { round: 7, pick: 242,name: "Deven Eastern", pos: "DT", college: "Minnesota" },
    { round: 7, pick: 255,name: "Michael Dansby", pos: "CB", college: "Arizona" }
  ],
  TB: [
    { round: 1, pick: 15, name: "Rueben Bain Jr.", pos: "EDGE", college: "Miami" },
    { round: 2, pick: 46, name: "Josiah Trotter", pos: "LB", college: "Missouri" },
    { round: 3, pick: 84, name: "Ted Hurst", pos: "WR", college: "Georgia State" },
    { round: 4, pick: 116,name: "Keionte Scott", pos: "CB", college: "Miami" },
    { round: 5, pick: 155,name: "DeMonte Kapehart", pos: "DL", college: "Clemson" },
    { round: 5, pick: 160,name: "Billy Schrauth", pos: "G", college: "Notre Dame" },
    { round: 6, pick: 185,name: "Bauer Sharp", pos: "TE", college: "LSU" }
  ],
  TEN: [
    { round: 1, pick: 4,  name: "Carnell Tate", pos: "WR", college: "Ohio State" },
    { round: 1, pick: 31, name: "Keldric Faulk", pos: "EDGE", college: "Auburn" },
    { round: 2, pick: 60, name: "Anthony Hill Jr.", pos: "EDGE", college: "Texas" },
    { round: 5, pick: 142,name: "Fernando Carmona", pos: "IOL", college: "Arkansas" },
    { round: 5, pick: 165,name: "Nicholas Singleton", pos: "RB", college: "Penn State" },
    { round: 6, pick: 184,name: "Jackie Marshall", pos: "DL", college: "Baylor" },
    { round: 6, pick: 194,name: "Pat Coogan", pos: "C", college: "Indiana" },
    { round: 7, pick: 225,name: "Jaren Kanak", pos: "TE", college: "Oklahoma" }
  ],
  WAS: [
    { round: 1, pick: 7,  name: "Sonny Styles", pos: "LB", college: "Ohio State" },
    { round: 3, pick: 71, name: "Antonio Williams", pos: "WR", college: "Clemson" },
    { round: 5, pick: 147,name: "Joshua Josephs", pos: "EDGE", college: "Tennessee" },
    { round: 6, pick: 187,name: "Kaytron Allen", pos: "RB", college: "Penn State" },
    { round: 6, pick: 209,name: "Matt Gulbin", pos: "C", college: "Michigan State" },
    { round: 7, pick: 223,name: "Micah Pollard", pos: "LB", college: "Texas" }
  ]
};

// ---- UDFAs 2026 ----
const udfas = {
  ARI: [
    { name: "Elijah Culp", pos: "CB", college: "James Madison" },
    { name: "Tre Wallace", pos: "WR", college: "Ole Miss" }
  ],
  ATL: [
    { name: "Jack Strand", pos: "QB", college: "Minnesota-Moorhead" },
    { name: "Carlos Allen", pos: "DT", college: "Houston" },
    { name: "James Brockermeyer", pos: "C", college: "Miami" },
    { name: "Malik Rutherford", pos: "WR", college: "Georgia Tech" },
    { name: "Jack Velling", pos: "TE", college: "Michigan State" },
    { name: "CJ Nunnally", pos: "DE", college: "Purdue" },
    { name: "Cash Jones", pos: "RB", college: "Georgia" },
    { name: "Vinny Anthony", pos: "WR", college: "Wisconsin" }
  ],
  BAL: [
    { name: "Reid Williford", pos: "LB", college: "Charlotte" },
    { name: "Matthew McDoom", pos: "CB", college: "Cincinnati" },
    { name: "Nick Dawkins", pos: "C", college: "Penn State" },
    { name: "Cortez Braham", pos: "WR", college: "Memphis" },
    { name: "Aaron Graves", pos: "DL", college: "Iowa" },
    { name: "Joey Fagnano", pos: "QB", college: "UConn" },
    { name: "Diego Pounds", pos: "OT", college: "Ole Miss" },
    { name: "Jahquez Robinson", pos: "S", college: "Auburn" },
    { name: "Silas Walters", pos: "S", college: "Miami (Ohio)" },
    { name: "Ladarius Webb Jr.", pos: "S", college: "Wake Forest" },
    { name: "Dontae McMillan", pos: "RB", college: "Eastern Michigan" },
    { name: "Octavion Smith Jr.", pos: "WR", college: "Maryland" },
    { name: "Trevonte Sylvester", pos: "OT", college: "Louisville" }
  ],
  BUF: [
    { name: "Ja'Mori Maclin", pos: "WR", college: "Kentucky" },
    { name: "Theron Gaines", pos: "LB", college: "Tennessee Tech" },
    { name: "Da'Metrius Weatherspoon", pos: "OT", college: "Syracuse" },
    { name: "Desmond Reid", pos: "RB", college: "Pitt" }
  ],
  CAR: [
    { name: "Haynes King", pos: "QB", college: "Georgia Tech" },
    { name: "Cam Miller", pos: "CB", college: "Rutgers" },
    { name: "Kobe Prentice", pos: "WR", college: "Baylor" },
    { name: "Aaron Hall", pos: "DT", college: "Duke" }
  ],
  CHI: [
    { name: "Miller Moss", pos: "QB", college: "Louisville" },
    { name: "KC Eziomume", pos: "CB", college: "Tulane" },
    { name: "Gabriel Plascencia", pos: "K", college: "San Diego State" },
    { name: "Hayden Large", pos: "TE", college: "Iowa" },
    { name: "Skyler Thomas", pos: "S", college: "Oregon State" },
    { name: "Caden Barnett", pos: "IOL", college: "Wyoming" },
    { name: "Coleman Bennett", pos: "RB", college: "Kennesaw State" }
  ],
  CIN: [
    { name: "Jack Dingle", pos: "LB", college: "Cincinnati" },
    { name: "Josh Kattus", pos: "TE", college: "Kentucky" },
    { name: "Ceyair Wright", pos: "CB", college: "Nebraska" },
    { name: "Corey Robinson", pos: "OL", college: "Georgia Tech" }
  ],
  CLE: [
    { name: "Logan Fano", pos: "EDGE", college: "Utah" },
    { name: "Bernard Gooden", pos: "DL", college: "LSU" },
    { name: "Tyreak Sapp", pos: "EDGE", college: "UF" },
    { name: "T.J. Harden", pos: "RB", college: "SMU" },
    { name: "Davon Booth", pos: "RB", college: "Mississippi State" },
    { name: "DeCarlos Nicholson", pos: "RB", college: "USC" },
    { name: "Michael Coats Jr.", pos: "CB", college: "West Virginia" }
  ],
  DAL: [
    { name: "Jordan Hudson", pos: "WR", college: "SMU" },
    { name: "DJ Rogers", pos: "TE", college: "TCU" },
    { name: "Michael Trigg", pos: "TE", college: "Baylor" },
    { name: "Dominic Richardson", pos: "RB", college: "Tulsa" }
  ],
  DEN: [
    { name: "Taurean York", pos: "LB", college: "Texas A&M" },
    { name: "Dane Key", pos: "WR", college: "Nebraska" },
    { name: "Brent Austin", pos: "C", college: "Cal" },
    { name: "Sidney Fulgar", pos: "OL", college: "Baylor" },
    { name: "Luke Basso", pos: "LS", college: "Oregon" }
  ],
  DET: [
    { name: "John Michael Gyllenborg", pos: "TE", college: "Wyoming" }
  ],
  GB: [
    { name: "Isaiah Mozee", pos: "WR", college: "Oregon" }
  ],
  HOU: [
    { name: "R.J. Maryland", pos: "TE", college: "SMU" }
  ],
  IND: [
    { name: "Drew Evans", pos: "S", college: "Utah" },
    { name: "Jack Kelly (2)", pos: "LB", college: "Alabama" }
  ],
  JAC: [
    // no major UDFA reported
  ],
  KC: [
    { name: "Nohl Williams", pos: "CB", college: "Cal" },
    { name: "Connor Weigman", pos: "QB", college: "Texas A&M" }
  ],
  LV: [
    { name: "Gary Smith III", pos: "DT", college: "UCLA" },
    { name: "Roman Hemby", pos: "RB", college: "Indiana" },
    { name: "Jacob Clark", pos: "QB", college: "Missouri State" },
    { name: "Sawyer Robertson", pos: "QB", college: "Baylor" },
    { name: "Isaiah Jatta", pos: "OT", college: "BYU" },
    { name: "Kansei Matsuzawa", pos: "K", college: "Hawaii" },
    { name: "Caleb Offord", pos: "CB", college: "Kennesaw State" }
  ],
  LAC: [
    { name: "Avery Smith", pos: "CB", college: "Toledo" },
    { name: "Jerand Bradley", pos: "WR/TE", college: "Kansas State" },
    { name: "Isaiah World", pos: "OT", college: "Oregon" },
    { name: "Greg Desrosiers", pos: "RB", college: "Memphis" },
    { name: "Sincere Brown", pos: "WR", college: "Colorado" },
    { name: "Lander Barton", pos: "LB", college: "Utah" },
    { name: "Noah Avinger", pos: "S", college: "Utah State" },
    { name: "Jahmeer Carter", pos: "DL", college: "Virginia" }
  ],
  LAR: [
    { name: "Matthew Caldwell", pos: "QB", college: "Texas" },
    { name: "Eddie Walls", pos: "EDGE", college: "Houston" },
    { name: "Austin Blaske", pos: "OL", college: "North Carolina" },
    { name: "Darryl Peterson", pos: "LB", college: "Wisconsin" },
    { name: "Dan Villari", pos: "TE", college: "Syracuse" },
    { name: "Nikhai Hill-Green", pos: "LB", college: "Alabama" },
    { name: "Dean Connors", pos: "RB", college: "Houston" },
    { name: "Jaxson Moi", pos: "DT", college: "Tennessee" },
    { name: "EJ Williams", pos: "WR", college: "Indiana" }
  ],
  MIA: [
    { name: "Anthony Hankerson", pos: "RB", college: "Oregon State" },
    { name: "Mark Gronowski", pos: "QB", college: "Iowa" },
    { name: "Mason Reiger", pos: "LB", college: "Wisconsin" }
  ],
  MIN: [
    { name: "Tristian Leigh", pos: "OT", college: "Clemson" },
    { name: "Dillon Bell", pos: "WR", college: "Georgia" }
  ],
  NE: [
    { name: "Jacory Barney Jr.", pos: "WR", college: "Nebraska" },
    { name: "Solomon Davis", pos: "S", college: "Abilene Christian" },
    { name: "Will Hardy", pos: "LB", college: "Texas" }
  ],
  NO: [
    { name: "Nate Karl", pos: "OL", college: "Stanford" },
    { name: "Jake Kreul", pos: "EDGE", college: "Illinois" }
  ],
  NYG: [
    { name: "Elijah Green", pos: "RB", college: "North Carolina" },
    { name: "Dallas Winner", pos: "WR", college: "Air Force" },
    { name: "R Mason Thomas", pos: "EDGE", college: "Oklahoma" }
  ],
  NYJ: [
    { name: "Andre Mevis", pos: "PK", college: "Iowa State" }
  ],
  PHI: [
    { name: "Dylan Stewart", pos: "EDGE", college: "South Carolina" }
  ],
  PIT: [
    { name: "Jaxson Campbell", pos: "WR", college: "UCLA" }
  ],
  SF: [
    { name: "Bo Jackson", pos: "WR", college: "Boston College" },
    { name: "Demitrius Payton", pos: "CB", college: "UCLA" }
  ],
  SEA: [
    { name: "DJ McKinney", pos: "CB", college: "Oklahoma" }
  ],
  TB: [
    { name: "KJ Bolden", pos: "S", college: "Georgia" }
  ],
  TEN: [
    { name: "Jaylen Lewis", pos: "WR", college: "Arkansas" },
    { name: "Levi Rodgers", pos: "LB", college: "Texas A&M" }
  ],
  WAS: [
    { name: "Brendan Jenkins", pos: "S", college: "Nebraska" },
    { name: "Tyler Cooper", pos: "G", college: "Ole Miss" }
  ]
};

// ---- 2026 SCHEDULE (confirmed games + framework) ----
// ---- WEEKLY SCHEDULE 2026 (from May 14 release) ----
const weeklyGames = {
  1: [ // Week 1 · Sep 9-15 — 16 games
    {date:"2026-09-09", away:"NE", home:"SEA", note:"Kickoff"},
    {date:"2026-09-13", away:"ARI", home:"LAC"},
    {date:"2026-09-13", away:"ATL", home:"PIT"},
    {date:"2026-09-13", away:"BAL", home:"IND"},
    {date:"2026-09-13", away:"BUF", home:"HOU"},
    {date:"2026-09-13", away:"CAR", home:"NO"},
    {date:"2026-09-13", away:"CHI", home:"LAR"},
    {date:"2026-09-13", away:"TB", home:"CIN"},
    {date:"2026-09-13", away:"CLE", home:"JAX"},
    {date:"2026-09-13", away:"DAL", home:"NYG"},
    {date:"2026-09-13", away:"DET", home:"GB"},
    {date:"2026-09-13", away:"MIA", home:"LV"},
    {date:"2026-09-13", away:"MIN", home:"SF"},
    {date:"2026-09-13", away:"WSH", home:"PHI"},
    {date:"2026-09-13", away:"NYJ", home:"TEN"},
    {date:"2026-09-14", away:"DEN", home:"KC"}
  ],
  2: [ // Week 2 · Sep 17-22 — 17 games
    {date:"2026-09-17", away:"DET", home:"BUF", note:"Thu"},
    {date:"2026-09-20", away:"SF", home:"ARI"},
    {date:"2026-09-20", away:"ATL", home:"CAR"},
    {date:"2026-09-20", away:"NO", home:"BAL"},
    {date:"2026-09-20", away:"CHI", home:"SEA"},
    {date:"2026-09-20", away:"CIN", home:"HOU"},
    {date:"2026-09-20", away:"CLE", home:"TB"},
    {date:"2026-09-20", away:"WSH", home:"DAL"},
    {date:"2026-09-20", away:"JAX", home:"DEN"},
    {date:"2026-09-20", away:"GB", home:"NYJ"},
    {date:"2026-09-20", away:"IND", home:"KC"},
    {date:"2026-09-20", away:"LV", home:"LAC"},
    {date:"2026-09-20", away:"MIA", home:"SF"},
    {date:"2026-09-20", away:"MIN", home:"CHI"},
    {date:"2026-09-20", away:"PIT", home:"NE"},
    {date:"2026-09-20", away:"PHI", home:"TEN"},
    {date:"2026-09-21", away:"NYG", home:"LAR", note:"Mon"}
  ],
  3: [ // Week 3 · Sep 27-28 — 16 games
    {date:"2026-09-27", away:"LAC", home:"BUF"},
    {date:"2026-09-27", away:"CAR", home:"CLE"},
    {date:"2026-09-27", away:"CIN", home:"PIT"},
    {date:"2026-09-27", away:"BAL", home:"DAL", note:"Rio"},
    {date:"2026-09-27", away:"LAR", home:"DEN"},
    {date:"2026-09-27", away:"NYJ", home:"DET"},
    {date:"2026-09-27", away:"GB", home:"MIN"},
    {date:"2026-09-27", away:"HOU", home:"IND"},
    {date:"2026-09-27", away:"NE", home:"JAX"},
    {date:"2026-09-27", away:"KC", home:"MIA"},
    {date:"2026-09-27", away:"NO", home:"LV"},
    {date:"2026-09-27", away:"TEN", home:"NYG"},
    {date:"2026-09-27", away:"PHI", home:"LAR"},
    {date:"2026-09-27", away:"SEA", home:"WSH"},
    {date:"2026-09-27", away:"TB", home:"ATL"},
    {date:"2026-09-27", away:"ARI", home:"WSH"},
    {date:"2026-09-28", away:"PHI", home:"CHI", note:"Mon"}
  ],
  4: [ // Week 4 · Oct 1-5 — 16 games
    {date:"2026-10-01", away:"PIT", home:"CLE", note:"Thu"},
    {date:"2026-10-04", away:"ARI", home:"NYG"},
    {date:"2026-10-04", away:"TB", home:"ATL"},
    {date:"2026-10-04", away:"TEN", home:"BAL"},
    {date:"2026-10-04", away:"NE", home:"BUF"},
    {date:"2026-10-04", away:"CAR", home:"GB"},
    {date:"2026-10-04", away:"NYJ", home:"CHI"},
    {date:"2026-10-04", away:"JAX", home:"CIN"},
    {date:"2026-10-04", away:"DAL", home:"HOU"},
    {date:"2026-10-04", away:"DEN", home:"SF"},
    {date:"2026-10-04", away:"DET", home:"MIN"},
    {date:"2026-10-04", away:"WSH", home:"IND", note:"Tottenham"},
    {date:"2026-10-04", away:"KC", home:"LV"},
    {date:"2026-10-04", away:"LAC", home:"SEA"},
    {date:"2026-10-04", away:"LAR", home:"PHI"},
    {date:"2026-10-04", away:"MIA", home:"MIN"}
  ],
  5: [ // Week 5 · Oct 8-12 — 14 games (5 bye teams)
    {date:"2026-10-08", away:"TB", home:"DAL", note:"Thu"},
    {date:"2026-10-11", away:"ARI", home:"SF"},
    {date:"2026-10-11", away:"BAL", home:"ATL"},
    {date:"2026-10-11", away:"CHI", home:"CAR"},
    {date:"2026-10-11", away:"CIN", home:"MIA"},
    {date:"2026-10-11", away:"CLE", home:"NYJ"},
    {date:"2026-10-11", away:"DEN", home:"LAC"},
    {date:"2026-10-11", away:"GB", home:"TB"},
    {date:"2026-10-11", away:"HOU", home:"TEN"},
    {date:"2026-10-11", away:"IND", home:"PIT"},
    {date:"2026-10-11", away:"PHI", home:"JAX", note:"Tottenham"},
    {date:"2026-10-11", away:"LV", home:"NE"},
    {date:"2026-10-11", away:"NYG", home:"WSH"},
    {date:"2026-10-11", away:"NO", home:"SEA"},
    {date:"2026-10-12", away:"BUF", home:"LAR", note:"Mon"}
  ],
  6: [ // Week 6 · Oct 15-19 — 15 games (2 bye teams)
    {date:"2026-10-15", away:"SEA", home:"DEN", note:"Thu"},
    {date:"2026-10-18", away:"BAL", home:"CLE"},
    {date:"2026-10-18", away:"BUF", home:"LV"},
    {date:"2026-10-18", away:"CAR", home:"PHI"},
    {date:"2026-10-18", away:"DAL", home:"GB"},
    {date:"2026-10-18", away:"SF", home:"DET"},
    {date:"2026-10-18", away:"JAX", home:"HOU", note:"Wembley"},
    {date:"2026-10-18", away:"TEN", home:"IND"},
    {date:"2026-10-18", away:"LAC", home:"KC"},
    {date:"2026-10-18", away:"MIN", home:"LAR"},
    {date:"2026-10-18", away:"NO", home:"NYG"},
    {date:"2026-10-18", away:"NYJ", home:"NE"},
    {date:"2026-10-18", away:"PIT", home:"TB"},
    {date:"2026-10-19", away:"WSH", home:"SF", note:"Mon"}
  ],
  7: [ // Week 7 · Oct 22-26 — 13 games (6 bye teams)
    {date:"2026-10-22", away:"NE", home:"CHI", note:"Thu"},
    {date:"2026-10-25", away:"DEN", home:"ARI"},
    {date:"2026-10-25", away:"NO", home:"ATL"},
    {date:"2026-10-25", away:"CIN", home:"BAL"},
    {date:"2026-10-25", away:"ARI", home:"CAR"},
    {date:"2026-10-25", away:"CLE", home:"TEN"},
    {date:"2026-10-25", away:"DET", home:"LAR"},
    {date:"2026-10-25", away:"NYG", home:"HOU"},
    {date:"2026-10-25", away:"IND", home:"MIN"},
    {date:"2026-10-25", away:"KC", home:"SEA"},
    {date:"2026-10-25", away:"LAR", home:"LV"},
    {date:"2026-10-25", away:"MIA", home:"NYJ"},
    {date:"2026-10-25", away:"PIT", home:"NO", note:"Paris"},
    {date:"2026-10-26", away:"DAL", home:"PHI", note:"Mon"}
  ],
  8: [ // Week 8 · Nov 1-2 — 13 games (6 bye)
    {date:"2026-11-01", away:"ARI", home:"DAL"},
    {date:"2026-11-01", away:"BAL", home:"BUF"},
    {date:"2026-11-01", away:"MIN", home:"CAR"},
    {date:"2026-11-01", away:"TEN", home:"CIN"},
    {date:"2026-11-01", away:"CLE", home:"PIT"},
    {date:"2026-11-01", away:"KC", home:"DEN"},
    {date:"2026-11-01", away:"DET", home:"SEA"},
    {date:"2026-11-01", away:"IND", home:"JAX"},
    {date:"2026-11-01", away:"LAC", home:"LAR"},
    {date:"2026-11-01", away:"LV", home:"NYJ"},
    {date:"2026-11-01", away:"NE", home:"MIA"},
    {date:"2026-11-01", away:"NO", home:"TB"},
    {date:"2026-11-01", away:"PHI", home:"WSH"}
  ],
  9: [ // Week 9 · Nov 5-9 — 14 games (4 bye)
    {date:"2026-11-05", away:"JAX", home:"BAL", note:"Thu"},
    {date:"2026-11-08", away:"CHI", home:"ARI"},
    {date:"2026-11-08", away:"ATL", home:"CIN", note:"Madrid"},
    {date:"2026-11-08", away:"DEN", home:"CAR"},
    {date:"2026-11-08", away:"CLE", home:"NO"},
    {date:"2026-11-08", away:"DAL", home:"IND"},
    {date:"2026-11-08", away:"DET", home:"MIA"},
    {date:"2026-11-08", away:"GB", home:"NE"},
    {date:"2026-11-08", away:"HOU", home:"LAC"},
    {date:"2026-11-08", away:"NYJ", home:"KC"},
    {date:"2026-11-08", away:"LAR", home:"WSH"},
    {date:"2026-11-08", away:"LV", home:"SF"},
    {date:"2026-11-08", away:"NYG", home:"PHI"},
    {date:"2026-11-08", away:"TB", home:"KC"},
    {date:"2026-11-09", away:"BUF", home:"MIN", note:"Mon"}
  ],
  10: [ // Week 10 · Nov 12-16 — 14 games (4 bye)
    {date:"2026-11-12", away:"CAR", home:"CHI", note:"Thu"},
    {date:"2026-11-12", away:"WSH", home:"NYG", note:"Thu"},
    {date:"2026-11-15", away:"ARI", home:"SEA"},
    {date:"2026-11-15", away:"KC", home:"ATL"},
    {date:"2026-11-15", away:"BUF", home:"NYJ"},
    {date:"2026-11-15", away:"PIT", home:"CIN"},
    {date:"2026-11-15", away:"HOU", home:"CLE"},
    {date:"2026-11-15", away:"SF", home:"DAL"},
    {date:"2026-11-15", away:"NE", home:"DET", note:"Munich"},
    {date:"2026-11-15", away:"MIN", home:"GB"},
    {date:"2026-11-15", away:"MIA", home:"IND"},
    {date:"2026-11-15", away:"JAX", home:"TEN"},
    {date:"2026-11-15", away:"TB", home:"NO"},
    {date:"2026-11-15", away:"LV", home:"SEA"},
    {date:"2026-11-16", away:"LAC", home:"BAL", note:"Mon"}
  ],
  11: [ // Week 11 · Nov 19-23 — 15 games (2 bye)
    {date:"2026-11-19", away:"CHI", home:"DET", note:"Thu"},
    {date:"2026-11-19", away:"IND", home:"HOU", note:"Thu"},
    {date:"2026-11-22", away:"ARI", home:"KC"},
    {date:"2026-11-22", away:"ATL", home:"TB"},
    {date:"2026-11-22", away:"BAL", home:"CAR"},
    {date:"2026-11-22", away:"MIA", home:"BUF"},
    {date:"2026-11-22", away:"TEN", home:"DAL"},
    {date:"2026-11-22", away:"LV", home:"DEN"},
    {date:"2026-11-22", away:"GB", home:"SF"},
    {date:"2026-11-22", away:"JAX", home:"NYG"},
    {date:"2026-11-22", away:"NYJ", home:"LAC"},
    {date:"2026-11-22", away:"NO", home:"LAR"},
    {date:"2026-11-22", away:"MIN", home:"SEA"},
    {date:"2026-11-22", away:"PIT", home:"PHI"},
    {date:"2026-11-23", away:"CIN", home:"WSH", note:"Mon"}
  ],
  12: [ // Week 12 · Nov 26-30 — 16 games (Thanksgiving)
    {date:"2026-11-26", away:"KC", home:"BUF", note:"Thanksgiving"},
    {date:"2026-11-26", away:"CHI", home:"GB", note:"Thanksgiving"},
    {date:"2026-11-26", away:"PHI", home:"DAL", note:"Thanksgiving"},
    {date:"2026-11-26", away:"DET", home:"MIN", note:"Thanksgiving"},
    {date:"2026-11-27", away:"DEN", home:"PIT", note:"Fri"},
    {date:"2026-11-29", away:"WSH", home:"ARI"},
    {date:"2026-11-29", away:"ATL", home:"CAR"},
    {date:"2026-11-29", away:"BAL", home:"HOU"},
    {date:"2026-11-29", away:"NO", home:"CIN"},
    {date:"2026-11-29", away:"LV", home:"CLE"},
    {date:"2026-11-29", away:"NYG", home:"IND"},
    {date:"2026-11-29", away:"TEN", home:"JAX"},
    {date:"2026-11-29", away:"NE", home:"LAC"},
    {date:"2026-11-29", away:"TB", home:"LAR"},
    {date:"2026-11-29", away:"NYJ", home:"MIA"},
    {date:"2026-11-29", away:"SEA", home:"SF"}
  ],
  13: [ // Week 13 · Dec 3-7 — 15 games (2 bye)
    {date:"2026-12-03", away:"KC", home:"LAR", note:"Thu"},
    {date:"2026-12-06", away:"PHI", home:"ARI"},
    {date:"2026-12-06", away:"ATL", home:"NO"},
    {date:"2026-12-06", away:"BUF", home:"NE"},
    {date:"2026-12-06", away:"JAX", home:"CHI"},
    {date:"2026-12-06", away:"CIN", home:"CLE"},
    {date:"2026-12-06", away:"MIA", home:"DEN"},
    {date:"2026-12-06", away:"DET", home:"GB"},
    {date:"2026-12-06", away:"HOU", home:"PIT"},
    {date:"2026-12-06", away:"LAC", home:"TB"},
    {date:"2026-12-06", away:"SF", home:"NYG"},
    {date:"2026-12-06", away:"WSH", home:"TEN"},
    {date:"2026-12-07", away:"DAL", home:"SEA", note:"Mon"},
    {date:"2026-12-07", away:"LAR", home:"SF", note:"Mon"}
  ],
  14: [ // Week 14 · Dec 10-14 — 16 games
    {date:"2026-12-10", away:"MIN", home:"NE", note:"Thu"},
    {date:"2026-12-13", away:"CAR", home:"ARI"},
    {date:"2026-12-13", away:"ATL", home:"CLE"},
    {date:"2026-12-13", away:"TB", home:"BAL"},
    {date:"2026-12-13", away:"BUF", home:"GB"},
    {date:"2026-12-13", away:"CHI", home:"MIA"},
    {date:"2026-12-13", away:"KC", home:"CIN"},
    {date:"2026-12-13", away:"DEN", home:"NYJ"},
    {date:"2026-12-13", away:"TEN", home:"DET"},
    {date:"2026-12-13", away:"HOU", home:"WSH"},
    {date:"2026-12-13", away:"IND", home:"PHI"},
    {date:"2026-12-13", away:"LAC", home:"LV"},
    {date:"2026-12-13", away:"NYG", home:"SEA"},
    {date:"2026-12-13", away:"NO", home:"LV"},
    {date:"2026-12-13", away:"SF", home:"ARI"},
    {date:"2026-12-14", away:"PIT", home:"JAX", note:"Mon"}
  ],
  15: [ // Week 15 · Dec 17-21 — 16 games
    {date:"2026-12-17", away:"SF", home:"LAC", note:"Thu"},
    {date:"2026-12-19", away:"BUF", home:"CHI", note:"Sat"},
    {date:"2026-12-19", away:"SEA", home:"PHI", note:"Sat"},
    {date:"2026-12-20", away:"NYJ", home:"ARI"},
    {date:"2026-12-20", away:"ATL", home:"WSH"},
    {date:"2026-12-20", away:"BAL", home:"PIT"},
    {date:"2026-12-20", away:"CAR", home:"CIN"},
    {date:"2026-12-20", away:"CLE", home:"NYG"},
    {date:"2026-12-20", away:"DAL", home:"LAR"},
    {date:"2026-12-20", away:"DEN", home:"LV"},
    {date:"2026-12-20", away:"DET", home:"SF"},
    {date:"2026-12-20", away:"MIA", home:"GB"},
    {date:"2026-12-20", away:"JAX", home:"HOU"},
    {date:"2026-12-20", away:"IND", home:"TEN"},
    {date:"2026-12-20", away:"NO", home:"MIN"},
    {date:"2026-12-21", away:"NE", home:"KC", note:"Mon"}
  ],
  16: [ // Week 16 · Dec 24-28 — 16 games
    {date:"2026-12-24", away:"HOU", home:"PHI", note:"Thu"},
    {date:"2026-12-25", away:"BUF", home:"DEN", note:"Christmas"},
    {date:"2026-12-27", away:"ARI", home:"LAR"},
    {date:"2026-12-27", away:"LV", home:"ATL"},
    {date:"2026-12-27", away:"CLE", home:"BAL"},
    {date:"2026-12-27", away:"CAR", home:"TB"},
    {date:"2026-12-27", away:"DET", home:"CHI"},
    {date:"2026-12-27", away:"JAX", home:"DAL"},
    {date:"2026-12-27", away:"SF", home:"KC"},
    {date:"2026-12-27", away:"LAC", home:"MIA"},
    {date:"2026-12-27", away:"TEN", home:"LV"},
    {date:"2026-12-27", away:"WSH", home:"MIN"},
    {date:"2026-12-27", away:"NE", home:"NYJ"},
    {date:"2026-12-27", away:"NO", home:"SEA"},
    {date:"2026-12-28", away:"NYG", home:"DET", note:"Mon"},
    {date:"2026-12-27", away:"GB", home:"CHI"}
  ],
  17: [ // Week 17 · Dec 31-Jan 4 — 16 games
    {date:"2026-12-31", away:"BAL", home:"CIN", note:"Thu"},
    {date:"2027-01-02", away:"WSH", home:"JAX", note:"Sat"},
    {date:"2027-01-03", away:"LV", home:"ARI"},
    {date:"2027-01-03", away:"CAR", home:"ATL"},
    {date:"2027-01-03", away:"BUF", home:"MIA"},
    {date:"2027-01-03", away:"IND", home:"CLE"},
    {date:"2027-01-03", away:"NYG", home:"DAL"},
    {date:"2027-01-03", away:"DEN", home:"NE"},
    {date:"2027-01-03", away:"GB", home:"MIN"},
    {date:"2027-01-03", away:"KC", home:"LAC"},
    {date:"2027-01-03", away:"PIT", home:"TEN"},
    {date:"2027-01-03", away:"PHI", home:"SF"},
    {date:"2027-01-03", away:"MIN", home:"NYJ"},
    {date:"2027-01-03", away:"SEA", home:"LAR"},
    {date:"2027-01-03", away:"SF", home:"TB"},
    {date:"2027-01-04", away:"HOU", home:"GB", note:"Mon"}
  ],
  18: [ // Week 18 · Jan 10 — 16 games (flex scheduling)
    {date:"2027-01-10", away:"SF", home:"ARI"},
    {date:"2027-01-10", away:"TB", home:"ATL"},
    {date:"2027-01-10", away:"PIT", home:"BAL"},
    {date:"2027-01-10", away:"NYJ", home:"BUF"},
    {date:"2027-01-10", away:"NO", home:"CAR"},
    {date:"2027-01-10", away:"CHI", home:"MIN"},
    {date:"2027-01-10", away:"CLE", home:"CIN"},
    {date:"2027-01-10", away:"DAL", home:"WSH"},
    {date:"2027-01-10", away:"LAC", home:"DEN"},
    {date:"2027-01-10", away:"GB", home:"DET"},
    {date:"2027-01-10", away:"TEN", home:"HOU"},
    {date:"2027-01-10", away:"JAX", home:"IND"},
    {date:"2027-01-10", away:"LV", home:"KC"},
    {date:"2027-01-10", away:"LAR", home:"SEA"},
    {date:"2027-01-10", away:"MIA", home:"NE"},
    {date:"2027-01-10", away:"PHI", home:"NYG"}
  ]
};

// ---- SEASON INFO ----
const season2026 = {
  year: "2026",
  regularSeasonStart: "2026-09-09",
  regularSeasonEnd: "2027-01-10",
  superBowl: "LXI — Feb 14, 2027 — SoFi Stadium",
  preseason: [
    { week: "HOF", date: "2026-08-06", away: "ARI", home: "CAR", venue: "Tom Benson Hall of Fame Stadium, Canton OH", tv: "NBC" }
  ],
  international: [
    { week: 1, date: "2026-09-10", away: "SF", home: "LAR", venue: "Melbourne Cricket Ground, Australia", tv: "FOX", label: "NFL Melbourne" },
    { week: 3, date: "2026-09-27", away: "BAL", home: "DAL", venue: "Rio de Janeiro, Brazil", tv: "CBS", label: "NFL Brazil" },
    { week: 4, date: "2026-10-04", away: "WSH", home: "IND", venue: "Tottenham Hotspur Stadium, London", tv: "NFLN", label: "NFL London" },
    { week: 5, date: "2026-10-11", away: "PHI", home: "JAX", venue: "Tottenham Hotspur Stadium, London", tv: "NFLN", label: "NFL London" },
    { week: 6, date: "2026-10-18", away: "HOU", home: "JAX", venue: "Wembley Stadium, London", tv: "NFLN", label: "NFL London" },
    { week: 7, date: "2026-10-25", away: "PIT", home: "NO", venue: "Paris, France", tv: "NFLN", label: "NFL Paris" },
    { week: 9, date: "2026-11-08", away: "ATL", home: "CIN", venue: "Madrid, Spain", tv: "NFLN", label: "NFL Madrid" },
    { week: 10, date: "2026-11-15", away: "NE", home: "DET", venue: "Munich, Germany", tv: "FOX", label: "NFL Munich" }
  ]
};

// ---- KNOWN GAMES (2026 Full Schedule - Released May 14, 2026) ----
const knownGames = []; // All games available via weeklyGames object

const lastUpdated = "2026-05-14T22:55:00Z";
const scheduleRelease = "2026-05-14T22:00:00Z";
