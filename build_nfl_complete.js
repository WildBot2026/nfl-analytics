#!/usr/bin/env node
/**
 * 🦅 NFL 2026 COMPLETE BUILDER - Raven
 * Genera schedule_2026_complete.json con los 272 partidos reales
 * y dashboard_2026.html con datos embedidos + rosters + stats
 * Fuente: CBS Sports schedule publicado 14 mayo 2026
 */

const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, 'data');

// ============================================================
// TEAM MAPPING
// ============================================================
const TEAM_MAP = {
  'Patriots': 'New England Patriots',
  'Seahawks': 'Seattle Seahawks',
  '49ers': 'San Francisco 49ers',
  'Niners': 'San Francisco 49ers',
  'Rams': 'Los Angeles Rams',
  'Bears': 'Chicago Bears',
  'Panthers': 'Carolina Panthers',
  'Buccaneers': 'Tampa Bay Buccaneers',
  'Bucs': 'Tampa Bay Buccaneers',
  'Bengals': 'Cincinnati Bengals',
  'Ravens': 'Baltimore Ravens',
  'Colts': 'Indianapolis Colts',
  'Bills': 'Buffalo Bills',
  'Texans': 'Houston Texans',
  'Saints': 'New Orleans Saints',
  'Lions': 'Detroit Lions',
  'Jets': 'New York Jets',
  'Titans': 'Tennessee Titans',
  'Falcons': 'Atlanta Falcons',
  'Steelers': 'Pittsburgh Steelers',
  'Browns': 'Cleveland Browns',
  'Jaguars': 'Jacksonville Jaguars',
  'Cardinals': 'Arizona Cardinals',
  'Chargers': 'Los Angeles Chargers',
  'Packers': 'Green Bay Packers',
  'Vikings': 'Minnesota Vikings',
  'Dolphins': 'Miami Dolphins',
  'Raiders': 'Las Vegas Raiders',
  'Commanders': 'Washington Commanders',
  'Eagles': 'Philadelphia Eagles',
  'Cowboys': 'Dallas Cowboys',
  'Giants': 'New York Giants',
  'Broncos': 'Denver Broncos',
  'Chiefs': 'Kansas City Chiefs',
  'Washington': 'Washington Commanders',
  'NY Jets': 'New York Jets',
  'Dallas': 'Dallas Cowboys',
  'Seattle': 'Seattle Seahawks',
  'Miami': 'Miami Dolphins',
  'San Francisco': 'San Francisco 49ers',
  'Arizona': 'Arizona Cardinals',
  'Patirots': 'New England Patriots',
};

const TEAM_ABBR = {
  'Arizona Cardinals': 'ARI','Atlanta Falcons': 'ATL','Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF','Carolina Panthers': 'CAR','Chicago Bears': 'CHI',
  'Cincinnati Bengals': 'CIN','Cleveland Browns': 'CLE','Dallas Cowboys': 'DAL',
  'Denver Broncos': 'DEN','Detroit Lions': 'DET','Green Bay Packers': 'GB',
  'Houston Texans': 'HOU','Indianapolis Colts': 'IND','Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC','Las Vegas Raiders': 'LV','Los Angeles Chargers': 'LAC',
  'Los Angeles Rams': 'LAR','Miami Dolphins': 'MIA','Minnesota Vikings': 'MIN',
  'New England Patriots': 'NE','New Orleans Saints': 'NO','New York Giants': 'NYG',
  'New York Jets': 'NYJ','Philadelphia Eagles': 'PHI','Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF','Seattle Seahawks': 'SEA','Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN','Washington Commanders': 'WAS'
};

function mapTeam(name) {
  const mapped = TEAM_MAP[name] || name;
  return mapped;
}

function weekDate(month, day) {
  const months = {'Sept':8,'Oct':9,'Nov':10,'Dec':11,'Jan':0};
  const m = months[month] || 8;
  const year = m === 0 ? 2027 : 2026;
  return `${year}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

// ============================================================
// RAW SCHEDULE DATA (from CBS Sports)
// ============================================================
const rawGames = [
  // WEEK 1
  [1,'Wednesday','Sept',9,'Patriots','Seahawks','20:20','NBC'],
  [1,'Thursday','Sept',10,'49ers','Rams','20:35','Netflix'],
  [1,'Sunday','Sept',13,'Bears','Panthers','13:00','Fox'],
  [1,'Sunday','Sept',13,'Buccaneers','Bengals','13:00','Fox'],
  [1,'Sunday','Sept',13,'Ravens','Colts','13:00','CBS'],
  [1,'Sunday','Sept',13,'Bills','Texans','13:00','CBS'],
  [1,'Sunday','Sept',13,'Saints','Lions','13:00','Fox'],
  [1,'Sunday','Sept',13,'Jets','Titans','13:00','CBS'],
  [1,'Sunday','Sept',13,'Falcons','Steelers','13:00','Fox'],
  [1,'Sunday','Sept',13,'Browns','Jaguars','13:00','CBS'],
  [1,'Sunday','Sept',13,'Cardinals','Chargers','16:25','CBS'],
  [1,'Sunday','Sept',13,'Packers','Vikings','16:25','CBS'],
  [1,'Sunday','Sept',13,'Dolphins','Raiders','16:25','Fox'],
  [1,'Sunday','Sept',13,'Commanders','Eagles','16:25','Fox'],
  [1,'Sunday','Sept',13,'Cowboys','Giants','20:20','NBC'],
  [1,'Monday','Sept',14,'Broncos','Chiefs','20:15','ESPN'],

  // WEEK 2
  [2,'Thursday','Sept',17,'Lions','Bills','20:15','Amazon'],
  [2,'Sunday','Sept',20,'Vikings','Bears','13:00','Fox'],
  [2,'Sunday','Sept',20,'Eagles','Titans','13:00','Fox'],
  [2,'Sunday','Sept',20,'Packers','NY Jets','13:00','Fox'],
  [2,'Sunday','Sept',20,'Panthers','Falcons','13:00','Fox'],
  [2,'Sunday','Sept',20,'Saints','Ravens','13:00','CBS'],
  [2,'Sunday','Sept',20,'Bengals','Texans','13:00','CBS'],
  [2,'Sunday','Sept',20,'Browns','Buccaneers','13:00','CBS'],
  [2,'Sunday','Sept',20,'Steelers','Patriots','13:00','CBS'],
  [2,'Sunday','Sept',20,'Raiders','Chargers','16:05','CBS'],
  [2,'Sunday','Sept',20,'Jaguars','Broncos','16:05','CBS'],
  [2,'Sunday','Sept',20,'Washington','Cowboys','16:25','Fox'],
  [2,'Sunday','Sept',20,'Seahawks','Cardinals','16:25','Fox'],
  [2,'Sunday','Sept',20,'Dolphins','49ers','16:25','Fox'],
  [2,'Sunday','Sept',20,'Colts','Chiefs','20:20','NBC'],
  [2,'Monday','Sept',21,'Giants','Rams','20:15','ESPN'],

  // WEEK 3
  [3,'Thursday','Sept',24,'Falcons','Packers','20:15','Amazon'],
  [3,'Sunday','Sept',27,'Chiefs','Dolphins','13:00','CBS'],
  [3,'Sunday','Sept',27,'Texans','Colts','13:00','CBS'],
  [3,'Sunday','Sept',27,'Titans','Giants','13:00','CBS'],
  [3,'Sunday','Sept',27,'Patriots','Jaguars','13:00','CBS'],
  [3,'Sunday','Sept',27,'Bengals','Steelers','13:00','CBS'],
  [3,'Sunday','Sept',27,'Panthers','Browns','13:00','Fox'],
  [3,'Sunday','Sept',27,'Jets','Lions','13:00','Fox'],
  [3,'Sunday','Sept',27,'Seahawks','Commanders','13:00','Fox'],
  [3,'Sunday','Sept',27,'Chargers','Bills','13:00','Fox'],
  [3,'Sunday','Sept',27,'Vikings','Buccaneers','16:05','Fox'],
  [3,'Sunday','Sept',27,'Cardinals','49ers','16:05','Fox'],
  [3,'Sunday','Sept',27,'Ravens','Cowboys','16:25','CBS'],
  [3,'Sunday','Sept',27,'Raiders','Saints','16:25','CBS'],
  [3,'Sunday','Sept',27,'Rams','Broncos','20:20','NBC'],
  [3,'Monday','Sept',28,'Eagles','Bears','20:15','ESPN'],

  // WEEK 4
  [4,'Thursday','Oct',1,'Steelers','Browns','20:15','Amazon'],
  [4,'Sunday','Oct',4,'Colts','Commanders','09:30','NFL Network'],
  [4,'Sunday','Oct',4,'Titans','Ravens','13:00','CBS'],
  [4,'Sunday','Oct',4,'Cardinals','Giants','13:00','CBS'],
  [4,'Sunday','Oct',4,'Jaguars','Bengals','13:00','CBS'],
  [4,'Sunday','Oct',4,'Patriots','Bills','13:00','CBS'],
  [4,'Sunday','Oct',4,'Cowboys','Texans','13:00','Fox'],
  [4,'Sunday','Oct',4,'Rams','Eagles','13:00','Fox'],
  [4,'Sunday','Oct',4,'Packers','Buccaneers','13:00','Fox'],
  [4,'Sunday','Oct',4,'Jets','Bears','13:00','Fox'],
  [4,'Sunday','Oct',4,'Dolphins','Vikings','16:05','Fox'],
  [4,'Sunday','Oct',4,'Broncos','49ers','16:25','CBS'],
  [4,'Sunday','Oct',4,'Chargers','Seahawks','16:25','CBS'],
  [4,'Sunday','Oct',4,'Chiefs','Raiders','16:25','CBS'],
  [4,'Sunday','Oct',4,'Lions','Panthers','20:20','NBC'],
  [4,'Monday','Oct',5,'Falcons','Saints','20:15','ESPN'],

  // WEEK 5
  [5,'Thursday','Oct',8,'Buccaneers','Cowboys','20:15','Amazon'],
  [5,'Sunday','Oct',11,'Eagles','Jaguars','09:30','NFL Network'],
  [5,'Sunday','Oct',11,'Raiders','Patriots','13:00','CBS'],
  [5,'Sunday','Oct',11,'Texans','Titans','13:00','CBS'],
  [5,'Sunday','Oct',11,'Browns','Jets','13:00','CBS'],
  [5,'Sunday','Oct',11,'Colts','Steelers','13:00','CBS'],
  [5,'Sunday','Oct',11,'Bengals','Dolphins','13:00','Fox'],
  [5,'Sunday','Oct',11,'Vikings','Saints','13:00','Fox'],
  [5,'Sunday','Oct',11,'Giants','Commanders','13:00','Fox'],
  [5,'Sunday','Oct',11,'Broncos','Chargers','16:05','CBS'],
  [5,'Sunday','Oct',11,'Bears','Packers','16:25','Fox'],
  [5,'Sunday','Oct',11,'Lions','Cardinals','16:25','Fox'],
  [5,'Sunday','Oct',11,'49ers','Seahawks','16:25','Fox'],
  [5,'Sunday','Oct',11,'Ravens','Falcons','20:20','NBC'],
  [5,'Monday','Oct',12,'Bills','Rams','20:15','ESPN'],

  // WEEK 6
  [6,'Thursday','Oct',15,'Seahawks','Broncos','20:15','Amazon'],
  [6,'Sunday','Oct',18,'Texans','Jaguars','09:30','NFL Network'],
  [6,'Sunday','Oct',18,'Jets','Patriots','13:00','CBS'],
  [6,'Sunday','Oct',18,'Steelers','Buccaneers','13:00','CBS'],
  [6,'Sunday','Oct',18,'Panthers','Eagles','13:00','CBS'],
  [6,'Sunday','Oct',18,'Bears','Falcons','13:00','Fox'],
  [6,'Sunday','Oct',18,'Titans','Colts','13:00','Fox'],
  [6,'Sunday','Oct',18,'Saints','Giants','13:00','Fox'],
  [6,'Sunday','Oct',18,'Ravens','Browns','13:00','Fox'],
  [6,'Sunday','Oct',18,'Cardinals','Rams','16:05','Fox'],
  [6,'Sunday','Oct',18,'Chargers','Chiefs','16:25','CBS'],
  [6,'Sunday','Oct',18,'Bills','Raiders','16:25','CBS'],
  [6,'Sunday','Oct',18,'Cowboys','Packers','20:20','NBC'],
  [6,'Monday','Oct',19,'Commanders','49ers','20:15','ESPN'],

  // WEEK 7
  [7,'Thursday','Oct',22,'Patriots','Bears','20:15','Amazon'],
  [7,'Sunday','Oct',25,'Steelers','Saints','09:30','NFL Network'],
  [7,'Sunday','Oct',25,'Browns','Titans','13:00','CBS'],
  [7,'Sunday','Oct',25,'Dolphins','Jets','13:00','CBS'],
  [7,'Sunday','Oct',25,'Colts','Vikings','13:00','CBS'],
  [7,'Sunday','Oct',25,'Bengals','Ravens','13:00','CBS'],
  [7,'Sunday','Oct',25,'Giants','Texans','13:00','Fox'],
  [7,'Sunday','Oct',25,'Buccaneers','Panthers','13:00','Fox'],
  [7,'Sunday','Oct',25,'49ers','Falcons','13:00','Fox'],
  [7,'Sunday','Oct',25,'Broncos','Cardinals','16:05','CBS'],
  [7,'Sunday','Oct',25,'Rams','Raiders','16:25','Fox'],
  [7,'Sunday','Oct',25,'Packers','Lions','16:25','Fox'],
  [7,'Sunday','Oct',25,'Chiefs','Seahawks','20:20','NBC'],
  [7,'Monday','Oct',26,'Cowboys','Eagles','20:15','ESPN'],

  // WEEK 8
  [8,'Thursday','Oct',29,'Panthers','Packers','20:15','Amazon'],
  [8,'Sunday','Nov',1,'Titans','Bengals','13:00','CBS'],
  [8,'Sunday','Nov',1,'Colts','Jaguars','13:00','CBS'],
  [8,'Sunday','Nov',1,'Browns','Steelers','13:00','CBS'],
  [8,'Sunday','Nov',1,'Ravens','Bills','13:00','CBS'],
  [8,'Sunday','Nov',1,'Falcons','Buccaneers','13:00','Fox'],
  [8,'Sunday','Nov',1,'Vikings','Lions','13:00','Fox'],
  [8,'Sunday','Nov',1,'Cardinals','Cowboys','13:00','Fox'],
  [8,'Sunday','Nov',1,'Raiders','Jets','13:00','Fox'],
  [8,'Sunday','Nov',1,'Chargers','Rams','16:05','Fox'],
  [8,'Sunday','Nov',1,'Chiefs','Broncos','16:25','CBS'],
  [8,'Sunday','Nov',1,'Patirots','Dolphins','16:25','CBS'],
  [8,'Sunday','Nov',1,'Eagles','Commanders','20:20','NBC'],
  [8,'Monday','Nov',2,'Bears','Seahawks','20:15','ESPN'],

  // WEEK 9
  [9,'Thursday','Nov',5,'Jaguars','Ravens','20:15','Amazon'],
  [9,'Sunday','Nov',8,'Bengals','Falcons','09:30','NFL Network'],
  [9,'Sunday','Nov',8,'Jets','Chiefs','13:00','CBS'],
  [9,'Sunday','Nov',8,'Browns','Saints','13:00','CBS'],
  [9,'Sunday','Nov',8,'Broncos','Panthers','13:00','CBS'],
  [9,'Sunday','Nov',8,'Cowboys','Colts','13:00','Fox'],
  [9,'Sunday','Nov',8,'Lions','Dolphins','13:00','Fox'],
  [9,'Sunday','Nov',8,'Giants','Eagles','13:00','Fox'],
  [9,'Sunday','Nov',8,'Rams','Commanders','13:00','Fox'],
  [9,'Sunday','Nov',8,'Raiders','49ers','16:05','CBS'],
  [9,'Sunday','Nov',8,'Texans','Chargers','16:05','CBS'],
  [9,'Sunday','Nov',8,'Cardinals','Seahawks','16:25','Fox'],
  [9,'Sunday','Nov',8,'Packers','Patriots','16:25','Fox'],
  [9,'Sunday','Nov',8,'Buccaneers','Bears','20:20','NBC'],
  [9,'Monday','Nov',9,'Bills','Vikings','20:15','ESPN'],

  // WEEK 10
  [10,'Thursday','Nov',12,'Commanders','Giants','20:15','Amazon'],
  [10,'Sunday','Nov',15,'Patriots','Lions','09:30','Fox'],
  [10,'Sunday','Nov',15,'Bills','Jets','13:00','CBS'],
  [10,'Sunday','Nov',15,'Dolphins','Colts','13:00','CBS'],
  [10,'Sunday','Nov',15,'Chiefs','Falcons','13:00','CBS'],
  [10,'Sunday','Nov',15,'Vikings','Packers','13:00','Fox'],
  [10,'Sunday','Nov',15,'Jaguars','Titans','13:00','Fox'],
  [10,'Sunday','Nov',15,'Texans','Browns','13:00','Fox'],
  [10,'Sunday','Nov',15,'Panthers','Saints','13:00','Fox'],
  [10,'Sunday','Nov',15,'Rams','Cardinals','16:05','CBS'],
  [10,'Sunday','Nov',15,'Seahawks','Raiders','16:05','CBS'],
  [10,'Sunday','Nov',15,'49ers','Cowboys','16:25','Fox'],
  [10,'Sunday','Nov',15,'Steelers','Bengals','20:20','NBC'],
  [10,'Monday','Nov',16,'Chargers','Ravens','20:15','ESPN'],

  // WEEK 11
  [11,'Thursday','Nov',19,'Colts','Texans','20:15','Amazon'],
  [11,'Sunday','Nov',22,'Cardinals','Chiefs','13:00','CBS'],
  [11,'Sunday','Nov',22,'Buccaneers','Lions','13:00','CBS'],
  [11,'Sunday','Nov',22,'Jaguars','Giants','13:00','CBS'],
  [11,'Sunday','Nov',22,'Dolphins','Bills','13:00','Fox'],
  [11,'Sunday','Nov',22,'Titans','Cowboys','13:00','Fox'],
  [11,'Sunday','Nov',22,'Ravens','Panthers','13:00','Fox'],
  [11,'Sunday','Nov',22,'Saints','Bears','13:00','Fox'],
  [11,'Sunday','Nov',22,'Jets','Chargers','16:05','Fox'],
  [11,'Sunday','Nov',22,'Steelers','Eagles','16:25','CBS'],
  [11,'Sunday','Nov',22,'Raiders','Broncos','16:25','CBS'],
  [11,'Sunday','Nov',22,'Vikings','49ers','20:20','NBC'],
  [11,'Monday','Nov',23,'Bengals','Commanders','20:15','ESPN'],

  // WEEK 12 - BYES: ATL, CLE, GB, LAR, NE, SEA
  [12,'Wednesday','Nov',25,'Packers','Rams','20:00','Netflix'],
  [12,'Thursday','Nov',26,'Bears','Lions','13:00','CBS'],
  [12,'Thursday','Nov',26,'Eagles','Cowboys','16:30','Fox'],
  [12,'Thursday','Nov',26,'Chiefs','Bills','20:20','NBC'],
  [12,'Friday','Nov',27,'Broncos','Steelers','15:00','Amazon'],
  [12,'Sunday','Nov',29,'Ravens','Texans','13:00','CBS'],
  [12,'Sunday','Nov',29,'Saints','Bengals','13:00','CBS'],
  [12,'Sunday','Nov',29,'Jets','Dolphins','13:00','CBS'],
  [12,'Sunday','Nov',29,'Falcons','Vikings','13:00','Fox'],
  [12,'Sunday','Nov',29,'Giants','Colts','13:00','Fox'],
  [12,'Sunday','Nov',29,'Raiders','Browns','13:00','Fox'],
  [12,'Sunday','Nov',29,'Titans','Jaguars','16:05','CBS'],
  [12,'Sunday','Nov',29,'Commanders','Cardinals','16:25','Fox'],
  [12,'Sunday','Nov',29,'Seahawks','49ers','16:25','Fox'],
  [12,'Sunday','Nov',29,'Panthers','Buccaneers','16:25','Fox'],
  [12,'Sunday','Nov',29,'49ers','Bills','20:20','NBC'],
  [12,'Monday','Nov',30,'Chargers','Cowboys','20:15','ESPN'],

  // WEEK 13 - BYES: BAL, IND, LV, NYJ
  [13,'Thursday','Dec',3,'Chiefs','Raiders','20:15','Amazon'],
  [13,'Sunday','Dec',6,'Giants','Saints','13:00','Fox'],
  [13,'Sunday','Dec',6,'Titans','Browns','13:00','CBS'],
  [13,'Sunday','Dec',6,'Seahawks','Jets','13:00','CBS'],
  [13,'Sunday','Dec',6,'Eagles','Panthers','13:00','Fox'],
  [13,'Sunday','Dec',6,'Dolphins','Rams','13:00','Fox'],
  [13,'Sunday','Dec',6,'Bears','Vikings','13:00','CBS'],
  [13,'Sunday','Dec',6,'Cardinals','Falcons','16:05','Fox'],
  [13,'Sunday','Dec',6,'Broncos','Chargers','16:25','CBS'],
  [13,'Sunday','Dec',6,'Bucs','Colts','16:25','CBS'],
  [13,'Sunday','Dec',6,'Bills','Patriots','16:25','CBS'],
  [13,'Sunday','Dec',6,'Texans','Steelers','20:20','NBC'],
  [13,'Monday','Dec',7,'Cowboys','Seahawks','20:15','ESPN'],

  // WEEK 14 - BYES: ARI, DAL
  [14,'Thursday','Dec',10,'Vikings','Patriots','20:15','Amazon'],
  [14,'Sunday','Dec',13,'Broncos','Jets','13:00','CBS'],
  [14,'Sunday','Dec',13,'Falcons','Browns','13:00','CBS'],
  [14,'Sunday','Dec',13,'Bears','Dolphins','13:00','CBS'],
  [14,'Sunday','Dec',13,'Texans','Commanders','13:00','CBS'],
  [14,'Sunday','Dec',13,'Saints','Panthers','13:00','CBS'],
  [14,'Sunday','Dec',13,'Colts','Eagles','13:00','Fox'],
  [14,'Sunday','Dec',13,'Buccaneers','Ravens','13:00','Fox'],
  [14,'Sunday','Dec',13,'Titans','Lions','13:00','Fox'],
  [14,'Sunday','Dec',13,'Chargers','Raiders','16:05','CBS'],
  [14,'Sunday','Dec',13,'Chiefs','Bengals','16:25','Fox'],
  [14,'Sunday','Dec',13,'Rams','49ers','16:25','Fox'],
  [14,'Sunday','Dec',13,'Giants','Seahawks','16:25','Fox'],
  [14,'Sunday','Dec',13,'Bills','Packers','20:20','NBC'],
  [14,'Monday','Dec',14,'Steelers','Jaguars','20:15','ESPN'],

  // WEEK 15
  [15,'Thursday','Dec',17,'49ers','Chargers','20:15','Amazon'],
  [15,'Saturday','Dec',19,'Seahawks','Eagles','17:00','Fox'],
  [15,'Saturday','Dec',19,'Bears','Bills','20:20','CBS'],
  [15,'Sunday','Dec',20,'Jaguars','Texans','13:00','CBS'],
  [15,'Sunday','Dec',20,'Ravens','Steelers','13:00','CBS'],
  [15,'Sunday','Dec',20,'Browns','Giants','13:00','CBS'],
  [15,'Sunday','Dec',20,'Colts','Titans','13:00','CBS'],
  [15,'Sunday','Dec',20,'Dolphins','Packers','13:00','Fox'],
  [15,'Sunday','Dec',20,'Saints','Buccaneers','13:00','Fox'],
  [15,'Sunday','Dec',20,'Bengals','Panthers','13:00','Fox'],
  [15,'Sunday','Dec',20,'Falcons','Commanders','13:00','Fox'],
  [15,'Sunday','Dec',20,'Jets','Cardinals','16:05','Fox'],
  [15,'Sunday','Dec',20,'Cowboys','Rams','16:25','CBS'],
  [15,'Sunday','Dec',20,'Broncos','Raiders','16:25','CBS'],
  [15,'Sunday','Dec',20,'Lions','Vikings','20:20','NBC'],
  [15,'Monday','Dec',21,'Patriots','Chiefs','20:15','ESPN'],

  // WEEK 16 - Christmas
  [16,'Thursday','Dec',24,'Texans','Eagles','20:15','Amazon'],
  [16,'Friday','Dec',25,'Packers','Bears','13:00','Netflix'],
  [16,'Friday','Dec',25,'Bills','Broncos','16:30','Netflix'],
  [16,'Friday','Dec',25,'Rams','Seahawks','20:15','Fox'],
  [16,'Saturday','Dec',26,'TBD','TBD','16:30','NFL Network'],
  [16,'Saturday','Dec',26,'TBD','TBD','20:00','NFL Network'],
  [16,'Sunday','Dec',27,'Buccaneers','Falcons','13:00','Fox'],
  [16,'Sunday','Dec',27,'Commanders','Vikings','13:00','Fox'],
  [16,'Sunday','Dec',27,'Panthers','Steelers','13:00','Fox'],
  [16,'Sunday','Dec',27,'Bengals','Colts','13:00','Fox'],
  [16,'Sunday','Dec',27,'Patriots','Jets','13:00','CBS'],
  [16,'Sunday','Dec',27,'Browns','Ravens','13:00','CBS'],
  [16,'Sunday','Dec',27,'Chargers','Dolphins','13:00','Fox'],
  [16,'Sunday','Dec',27,'Cardinals','Raiders','16:05','Fox'],
  [16,'Sunday','Dec',27,'49ers','Chiefs','16:25','CBS'],
  [16,'Sunday','Dec',27,'Jaguars','Cowboys','20:20','NBC'],
  [16,'Monday','Dec',28,'Giants','Lions','20:15','ESPN'],

  // WEEK 17 - New Year's weekend
  [17,'Thursday','Dec',31,'Ravens','Bengals','20:15','Amazon'],
  [17,'Saturday','Jan',2,'TBA','TBA','16:30','NBC'],
  [17,'Saturday','Jan',2,'TBA','TBA','20:00','Peacock'],
  [17,'Sunday','Jan',3,'Rams','Buccaneers','13:00','Fox'],
  [17,'Sunday','Jan',3,'Broncos','Patriots','13:00','Fox'],
  [17,'Sunday','Jan',3,'Chiefs','Chargers','13:00','Fox'],
  [17,'Sunday','Jan',3,'Commanders','Jaguars','13:00','Fox'],
  [17,'Sunday','Jan',3,'Bills','Dolphins','13:00','CBS'],
  [17,'Sunday','Jan',3,'Steelers','Titans','13:00','CBS'],
  [17,'Sunday','Jan',3,'Vikings','Jets','13:00','CBS'],
  [17,'Sunday','Jan',3,'Saints','Falcons','13:00','Fox'],
  [17,'Sunday','Jan',3,'Seahawks','Panthers','13:00','Fox'],
  [17,'Sunday','Jan',3,'Colts','Browns','13:00','Fox'],
  [17,'Sunday','Jan',3,'Giants','Cowboys','13:00','Fox'],
  [17,'Sunday','Jan',3,'Raiders','Cardinals','16:05','CBS'],
  [17,'Sunday','Jan',3,'Lions','Bears','16:25','Fox'],
  [17,'Sunday','Jan',3,'Eagles','49ers','20:20','NBC'],
  [17,'Monday','Jan',4,'Texans','Packers','20:15','ESPN'],

  // WEEK 18 - division games
  [18,'Saturday','Jan',9,'TBA','TBA','13:00','Netflix'],
  [18,'Saturday','Jan',9,'TBA','TBA','16:30','ESPN'],
  [18,'Saturday','Jan',9,'TBA','TBA','20:00','ESPN'],
  [18,'Sunday','Jan',10,'NY Jets','Bills','13:00','CBS'],
  [18,'Sunday','Jan',10,'Jaguars','Colts','13:00','CBS'],
  [18,'Sunday','Jan',10,'Raiders','Chiefs','13:00','CBS'],
  [18,'Sunday','Jan',10,'Titans','Texans','13:00','CBS'],
  [18,'Sunday','Jan',10,'Chargers','Broncos','13:00','CBS'],
  [18,'Sunday','Jan',10,'Dolphins','Patriots','13:00','CBS'],
  [18,'Sunday','Jan',10,'Browns','Bengals','13:00','CBS'],
  [18,'Sunday','Jan',10,'Steelers','Ravens','13:00','CBS'],
  [18,'Sunday','Jan',10,'Bears','Vikings','13:00','CBS'],
  [18,'Sunday','Jan',10,'Lions','Packers','13:00','CBS'],
  [18,'Sunday','Jan',10,'Cowboys','Commanders','13:00','CBS'],
  [18,'Sunday','Jan',10,'Buccaneers','Saints','13:00','CBS'],
  [18,'Sunday','Jan',10,'Eagles','Giants','13:00','CBS'],
  [18,'Sunday','Jan',10,'Seahawks','Rams','13:00','CBS'],
  [18,'Sunday','Jan',10,'Falcons','Panthers','13:00','CBS'],
  [18,'Sunday','Jan',10,'49ers','Cardinals','13:00','CBS'],
  [18,'Sunday','Jan',10,'TBA','TBA','20:20','NBC'],
];

// ============================================================
// BUILD SCHEDULE
// ============================================================
function buildSchedule() {
  const schedule = {};
  let gameId = 1;

  for (const g of rawGames) {
    const [week, day, month, dayNum, awayRaw, homeRaw, timeET, network] = g;
    const weekStr = String(week);
    if (!schedule[weekStr]) schedule[weekStr] = [];

    const away = mapTeam(awayRaw);
    const home = mapTeam(homeRaw);

    if (away.includes('TBA') || home.includes('TBA')) {
      // TBD games — skip until announced
      continue;
    }

    schedule[weekStr].push({
      id: gameId++,
      week: week,
      day: day,
      date: weekDate(month, dayNum),
      time: timeET,
      network: network,
      away: away,
      awayAbbr: TEAM_ABBR[away] || away,
      home: home,
      homeAbbr: TEAM_ABBR[home] || home,
      type: 'regular',
      result: null // to be filled during season
    });
  }

  return schedule;
}

// ============================================================
// LOAD EXISTING DATA
// ============================================================
function loadData() {
  const rosters = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rosters.json'), 'utf8'));
  const rostersFlat = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rosters_flat.json'), 'utf8'));
  const teamStats = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'team_stats.json'), 'utf8'));
  const teams = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'teams.json'), 'utf8'));
  return { rosters, rostersFlat, teamStats, teams };
}

// ============================================================
// SAVE SCHEDULE
//

// ============================================================
// SAVE SCHEDULE
// ============================================================
const schedule = buildSchedule();
fs.writeFileSync(path.join(__dirname, 'schedule_2026_complete.json'), JSON.stringify(schedule, null, 2));
console.log('✅ schedule_2026_complete.json saved');
console.log('   Total games:', Object.values(schedule).flat().length);
console.log('   Weeks:', Object.keys(schedule).length);

// ============================================================
// LOAD DATA & BUILD DASHBOARD
// ============================================================
const data = loadData();
const { rosters, rostersFlat, teamStats, teams } = data;

// Count players per team
const teamPlayerCounts = {};
for (const [team, posGroups] of Object.entries(rosters)) {
  let count = 0;
  for (const [pos, players] of Object.entries(posGroups)) {
    count += players.length;
  }
  teamPlayerCounts[team] = count;
}

// Build schedule JS array for dashboard
const scheduleJS = JSON.stringify(schedule);
const rostersJS = JSON.stringify(rosters);
const teamStatsJS = JSON.stringify(teamStats);
const teamsJS = JSON.stringify(teams);
const teamCountsJS = JSON.stringify(teamPlayerCounts);

const DASHBOARD = path.join(__dirname, 'dashboard_2026.html');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NFL 2026 - Raven Analytics</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0e17; color: #c8d6e5; min-height: 100vh; }
.header { background: linear-gradient(135deg, #0a1628 0%, #1a2744 100%); padding: 20px 30px; border-bottom: 2px solid #2d4a7a; }
.header h1 { color: #fff; font-size: 24px; }
.header h1 span { color: #4fc3f7; }
.header .subtitle { color: #7a8ba8; font-size: 13px; margin-top: 4px; }
.nav { display: flex; background: #111d35; border-bottom: 1px solid #1e3050; }
.nav button { background: none; border: none; color: #7a8ba8; padding: 12px 24px; cursor: pointer; font-size: 14px; border-bottom: 2px solid transparent; transition: all .2s; }
.nav button:hover { color: #c8d6e5; background: #162240; }
.nav button.active { color: #4fc3f7; border-bottom-color: #4fc3f7; background: #162240; }
.content { padding: 20px; max-width: 1400px; margin: 0 auto; }
.content.hidden { display: none; }

/* Schedule Table */
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { background: #162240; color: #4fc3f7; padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #2d4a7a; }
td { padding: 8px 12px; border-bottom: 1px solid #1a2744; }
tr:hover { background: #111d35; }
.team-name { font-weight: 500; color: #e8eef5; }
.team-away { color: #7a8ba8; }
.network { color: #4fc3f7; font-size: 11px; }
.week-label { display: inline-block; background: #1e3050; color: #4fc3f7; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; margin-top: 16px; }
.stat-card { background: #111d35; border: 1px solid #1e3050; border-radius: 8px; padding: 16px; }
.stat-card h3 { color: #fff; font-size: 14px; margin-bottom: 12px; border-bottom: 1px solid #1e3050; padding-bottom: 8px; }
.stat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
.stat-row .label { color: #7a8ba8; }
.stat-row .value { color: #c8d6e5; font-weight: 500; }
.stat-bar { height: 4px; background: #1a2744; border-radius: 2px; margin-top: 4px; overflow: hidden; }
.stat-bar-fill { height: 100%; border-radius: 2px; transition: width .3s; }

/* Filters */
.filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.filters select, .filters input { background: #111d35; border: 1px solid #1e3050; color: #c8d6e5; padding: 8px 12px; border-radius: 6px; font-size: 13px; }
.filters select:focus, .filters input:focus { outline: none; border-color: #4fc3f7; }
.filters label { color: #7a8ba8; font-size: 13px; display: flex; align-items: center; gap: 6px; }

/* Rosters */
.roster-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.roster-team { background: #111d35; border: 1px solid #1e3050; border-radius: 8px; padding: 12px; }
.roster-team h3 { color: #fff; font-size: 13px; margin-bottom: 8px; }
.roster-player { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; border-bottom: 1px solid #142040; }
.roster-player:last-child { border-bottom: none; }
.roster-player .pname { color: #c8d6e5; }
.roster-player .ppos { color: #4fc3f7; font-size: 10px; background: #1e3050; padding: 1px 5px; border-radius: 3px; }
.roster-player .pexp { color: #7a8ba8; font-size: 10px; }

/* Summary cards */
.summary-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
.summary-card { background: #111d35; border: 1px solid #1e3050; border-radius: 8px; padding: 16px; text-align: center; }
.summary-card .num { font-size: 28px; font-weight: 700; color: #4fc3f7; }
.summary-card .lbl { font-size: 12px; color: #7a8ba8; margin-top: 4px; }
</style>
</head>
<body>

<div class="header">
  <h1>🏈 NFL 2026 <span>Raven Analytics</span></h1>
  <div class="subtitle">Calendario real 272 games · Rosters · Team Stats · Predicciones</div>
</div>

<div class="nav">
  <button class="active" onclick="showTab('schedule')">📅 Schedule</button>
  <button onclick="showTab('teams')">🏆 Teams</button>
  <button onclick="showTab('stats')">📊 Stats</button>
  <button onclick="showTab('rosters')">👥 Rosters</button>
</div>

<div id="tab-schedule" class="content">
  <div class="summary-row" id="scheduleSummary"></div>
  <div class="filters">
    <select id="weekFilter" onchange="renderSchedule()">
      <option value="all">Todas las semanas</option>
    </select>
    <select id="teamFilter" onchange="renderSchedule()">
      <option value="all">Todos los equipos</option>
    </select>
    <label><input type="checkbox" id="showTBD" onchange="renderSchedule()"> Mostrar TBD</label>
  </div>
  <div id="scheduleTable"></div>
</div>

<div id="tab-teams" class="content hidden">
  <div class="filters">
    <select id="teamStatFilter" onchange="renderTeamStats()">
      <option value="all">Todos los equipos</option>
    </select>
  </div>
  <div id="teamStatsGrid" class="stats-grid"></div>
</div>

<div id="tab-stats" class="content hidden">
  <div class="summary-row" id="leagueLeaders"></div>
  <div class="filters">
    <select id="statCategory" onchange="renderLeagueStats()">
      <option value="passing">Passing</option>
      <option value="rushing">Rushing</option>
      <option value="receiving">Receiving</option>
      <option value="defense">Defense</option>
    </select>
  </div>
  <div id="leagueStatsTable"></div>
</div>

<div id="tab-rosters" class="content hidden">
  <div class="filters">
    <select id="rosterTeamFilter" onchange="renderRosters()">
      <option value="all">Todos los equipos</option>
    </select>
  </div>
  <div class="roster-grid" id="rosterGrid"></div>
</div>

<script>
// DATA
const SCHEDULE = ${scheduleJS};
const ROSTERS = ${rostersJS};
const TEAM_STATS = ${teamStatsJS};
const TEAMS = ${teamsJS};
const TEAM_COUNTS = ${teamCountsJS};

const TEAM_NAMES = Object.keys(TEAM_COUNTS).sort();
const TEAM_LIST = {};
TEAM_NAMES.forEach((t,i) => { TEAM_LIST[t] = t; });
const TEAM_ABBR = {
  'Arizona Cardinals':'ARI','Atlanta Falcons':'ATL','Baltimore Ravens':'BAL',
  'Buffalo Bills':'BUF','Carolina Panthers':'CAR','Chicago Bears':'CHI',
  'Cincinnati Bengals':'CIN','Cleveland Browns':'CLE','Dallas Cowboys':'DAL',
  'Denver Broncos':'DEN','Detroit Lions':'DET','Green Bay Packers':'GB',
  'Houston Texans':'HOU','Indianapolis Colts':'IND','Jacksonville Jaguars':'JAX',
  'Kansas City Chiefs':'KC','Las Vegas Raiders':'LV','Los Angeles Chargers':'LAC',
  'Los Angeles Rams':'LAR','Miami Dolphins':'MIA','Minnesota Vikings':'MIN',
  'New England Patriots':'NE','New Orleans Saints':'NO','New York Giants':'NYG',
  'New York Jets':'NYJ','Philadelphia Eagles':'PHI','Pittsburgh Steelers':'PIT',
  'San Francisco 49ers':'SF','Seattle Seahawks':'SEA','Tampa Bay Buccaneers':'TB',
  'Tennessee Titans':'TEN','Washington Commanders':'WAS'
};

// Navigation
function showTab(name) {
  document.querySelectorAll('.content').forEach(e => e.classList.add('hidden'));
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.remove('hidden');
  event.target.classList.add('active');
  if (name === 'schedule') renderSchedule();
  if (name === 'teams') renderTeamStats();
  if (name === 'stats') renderLeagueStats();
  if (name === 'rosters') renderRosters();
}

// Populate filters
function populateFilters() {
  const weeks = Object.keys(SCHEDULE).sort((a,b) => parseInt(a)-parseInt(b));
  const ws = document.getElementById('weekFilter');
  weeks.forEach(w => { ws.innerHTML += '<option value="'+w+'">Week '+w+'</option>'; });
  
  const tf = document.getElementById('teamFilter');
  const stf = document.getElementById('teamStatFilter');
  const rtf = document.getElementById('rosterTeamFilter');
  TEAM_NAMES.forEach(t => {
    tf.innerHTML += '<option value="'+t+'">'+t+'</option>';
    stf.innerHTML += '<option value="'+t+'">'+t+'</option>';
    rtf.innerHTML += '<option value="'+t+'">'+t+'</option>';
  });
}
populateFilters();

// Count all games
let totalGames = 0;
Object.values(SCHEDULE).forEach(games => totalGames += games.length);

document.getElementById('scheduleSummary').innerHTML = 
  '<div class="summary-card"><div class="num">'+Object.keys(SCHEDULE).length+'</div><div class="lbl">Semanas</div></div>' +
  '<div class="summary-card"><div class="num">'+totalGames+'</div><div class="lbl">Partidos</div></div>' +
  '<div class="summary-card"><div class="num">'+TEAM_NAMES.length+'</div><div class="lbl">Equipos</div></div>' +
  '<div class="summary-card"><div class="num">'+Object.values(ROSTERS).reduce((a,g) => a + Object.values(g).reduce((b,p) => b + p.length, 0), 0)+'</div><div class="lbl">Jugadores</div></div>';

// Render Schedule
function renderSchedule() {
  const weekFilter = document.getElementById('weekFilter').value;
  const teamFilter = document.getElementById('teamFilter').value;
  const showTBD = document.getElementById('showTBD').checked;
  
  let html = '<table><tr><th>Sem</th><th>Fecha</th><th>Visitante</th><th></th><th>Local</th><th>Hora ET</th><th>TV</th></tr>';
  
  const weeks = Object.keys(SCHEDULE).sort((a,b) => parseInt(a)-parseInt(b));
  for (const wk of weeks) {
    if (weekFilter !== 'all' && wk !== weekFilter) continue;
    for (const g of SCHEDULE[wk]) {
      if (teamFilter !== 'all' && g.home !== teamFilter && g.away !== teamFilter) continue;
      if (!showTBD && (g.home.includes('TBA') || g.away.includes('TBA'))) continue;
      const abbr = TEAM_ABBR[g.home] || '';
      html += '<tr>' +
        '<td><span class="week-label">W'+g.week+'</span></td>' +
        '<td>'+g.date+'</td>' +
        '<td class="team-away">'+g.away+'</td>' +
        '<td>@</td>' +
        '<td class="team-name">'+g.home+' <span style="color:#7a8ba8;font-size:11px">'+abbr+'</span></td>' +
        '<td>'+g.time+'</td>' +
        '<td><span class="network">'+g.network+'</span></td>' +
        '</tr>';
    }
  }
  html += '</table>';
  document.getElementById('scheduleTable').innerHTML = html;
}
renderSchedule();

// Render Teams
function renderTeamStats() {
  const filter = document.getElementById('teamStatFilter').value;
  let html = '';
  const teams = filter === 'all' ? TEAM_NAMES : [filter];
  for (const team of teams) {
    const stats = TEAM_STATS[team];
    if (!stats) continue;
    const pass = stats.passing || {};
    const rush = stats.rushing || {};
    const def = stats.defense || {};
    const recv = stats.receiving || {};
    html += '<div class="stat-card"><h3>'+team+' ('+(TEAM_ABBR[team]||'')+')</h3>';
    if (pass.netPassingYards) html += '<div class="stat-row"><span class="label">Pass Yards</span><span class="value">'+pass.netPassingYards.total+'</span></div>';
    if (pass.touchdowns) html += '<div class="stat-row"><span class="label">Pass TD</span><span class="value">'+pass.touchdowns.total+'</span></div>';
    if (pass.interceptions) html += '<div class="stat-row"><span class="label">INT</span><span class="value">'+pass.interceptions.total+'</span></div>';
    if (rush.rushingYards) html += '<div class="stat-row"><span class="label">Rush Yards</span><span class="value">'+rush.rushingYards.total+'</span></div>';
    if (rush.rushingTouchdowns) html += '<div class="stat-row"><span class="label">Rush TD</span><span class="value">'+rush.rushingTouchdowns.total+'</span></div>';
    if (recv.receivingYards) html += '<div class="stat-row"><span class="label">Recv Yards</span><span class="value">'+recv.receivingYards.total+'</span></div>';
    if (def.sacks) html += '<div class="stat-row"><span class="label">Sacks</span><span class="value">'+def.sacks.total+'</span></div>';
    if (def.interceptions) html += '<div class="stat-row"><span class="label">Def INT</span><span class="value">'+def.interceptions.total+'</span></div>';
    html += '</div>';
  }
  document.getElementById('teamStatsGrid').innerHTML = html || '<p style="color:#7a8ba8">Selecciona un equipo</p>';
}
renderTeamStats();

// Render League Stats
function renderLeagueStats() {
  const cat = document.getElementById('statCategory').value;
  let html = '<table><tr><th>Equipo</th>';
  const cats = { passing: ['netPassingYards','touchdowns','interceptions','completions','passingAttempts'],
    rushing: ['rushingYards','rushingTouchdowns','rushingAttempts','longRushing'],
    receiving: ['receivingYards','receivingTouchdowns','receptions','targets'],
    defense: ['sacks','interceptions','fumblesRecovered','tacklesForLoss','defensiveTouchdowns'] };
  const labels = { netPassingYards:'Yards',touchdowns:'TD',interceptions:'INT',completions:'Cmp',
    passingAttempts:'Att',rushingYards:'Yds',rushingTouchdowns:'TD',rushingAttempts:'Att',
    longRushing:'Long',receivingYards:'Yds',receivingTouchdowns:'TD',receptions:'Rec',
    targets:'Tgt',sacks:'Sack',fumblesRecovered:'FR',tacklesForLoss:'TFL',defensiveTouchdowns:'TD' };
  const fields = cats[cat] || [];
  fields.forEach(f => html += '<th>'+ (labels[f]||f) +'</th>');
  html += '</tr>';
  
  for (const team of TEAM_NAMES) {
    const stats = TEAM_STATS[team];
    if (!stats) continue;
    const s = stats[cat] || {};
    html += '<tr><td class="team-name">'+team+'</td>';
    fields.forEach(f => {
      const v = s[f] ? (s[f].total || s[f]) : '-';
      html += '<td>'+v+'</td>';
    });
    html += '</tr>';
  }
  html += '</table>';
  document.getElementById('leagueStatsTable').innerHTML = html;
}
renderLeagueStats();

// Render Rosters (top 15 players per team)
function renderRosters() {
  const filter = document.getElementById('rosterTeamFilter').value;
  const teams = filter === 'all' ? TEAM_NAMES : [filter];
  let html = '';
  for (const team of teams) {
    const teamRoster = ROSTERS[team];
    if (!teamRoster) continue;
    let players = [];
    for (const [pos, plist] of Object.entries(teamRoster)) {
      plist.forEach(p => players.push({...p, group: pos}));
    }
    players = players.slice(0, 20);
    html += '<div class="roster-team"><h3>'+team+' <span style="color:#7a8ba8;font-size:11px">('+TEAM_ABBR[team]+')</span></h3>';
    players.forEach(p => {
      html += '<div class="roster-player"><span class="pname">'+p.name+'</span><span><span class="ppos">'+p.pos+'</span> <span class="pexp">'+(p.exp||0)+'yr</span></span></div>';
    });
    html += '</div>';
  }
  document.getElementById('rosterGrid').innerHTML = html;
}
renderRosters();
</script>
</body>
</html>`;

fs.writeFileSync(DASHBOARD, html);
const dashSize = fs.statSync(DASHBOARD).size;
console.log('✅ dashboard_2026.html generated (' + (dashSize/1024).toFixed(1) + ' KB)');
console.log('🎉 NFL 2026 Complete Build Done!');
