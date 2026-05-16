#!/usr/bin/env node
/**
 * Updates dashboard_matchups.js and dashboard_h2h.js 
 * to show teams grouped by division in select dropdowns
 */

const fs = require('fs');
const path = require('path');

const DIVISIONS = {
  'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
  'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
  'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
  'NFC West': ['ARI', 'LAR', 'SF', 'SEA'],
  'AFC East': ['BUF', 'MIA', 'NE', 'NYJ'],
  'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
  'AFC South': ['HOU', 'IND', 'JAX', 'TEN'],
  'AFC West': ['DEN', 'KC', 'LV', 'LAC']
};

const DIV_ORDER = Object.keys(DIVISIONS);
const TEAM_NAMES = {
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
};

// Build grouped options JS string
function buildGroupedOptions(abbrMap) {
  let js = '';
  // Use full names as values (for h2h) or abbr (for matchups)
  // We'll generate agnostic and let caller pick
  for (const div of DIV_ORDER) {
    js += `html += '<optgroup label="— ${div} —">';\\n`;
    for (const abbr of DIVISIONS[div]) {
      const fullName = TEAM_NAMES[abbr];
      const val = abbrMap === 'abbr' ? abbr : fullName;
      js += `html += '<option value="${val}">${fullName}</option>';\\n`;
    }
    js += `html += '</optgroup>';\\n`;
  }
  return js;
}

// For matchups.js: uses team full names as values, TS map
const matchGrouped = buildGroupedOptions('full');
// For h2h.js: uses team abbreviations as values
const h2hGrouped = buildGroupedOptions('abbr');

// ════ Fix matchups.js ════
let mjs = fs.readFileSync(path.join(__dirname, 'dashboard_matchups.js'), 'utf8');

// Find the team select block in matchups
const oldMSelect = `Object.keys(TS).sort().forEach(function(t2){f+='<option value="'+t2+'">'+t2+'</option>'})`;

// Replace with grouped
const newMSelect = matchGrouped.replace(/\\n/g, '\n');

mjs = mjs.replace(oldMSelect, newMSelect);

fs.writeFileSync(path.join(__dirname, 'dashboard_matchups.js'), mjs);
console.log('✅ dashboard_matchups.js updated with divisions');

// ════ Fix h2h.js ════
let hjs = fs.readFileSync(path.join(__dirname, 'dashboard_h2h.js'), 'utf8');

// Find both team select blocks (team1 and team2)
// Pattern: teams.forEach(function(t){html+='<option value="'+t+'">'+TA[t]+'</option>'})
const oldH2HSelect = /teams\.forEach\(function\(t\)\{html\+=['"]<option value="['"]\+t\+['"]>['"]\+TA\[t\]\+['"]<\/option>['"]\}\)/g;

// We need a cleaner approach. Find the exact lines
const h2hLines = [
  { pattern: "teams.forEach(function(t){html+='<option value=\"'+t+'\">'+TA[t]+'</option>'});",
    replacement: '' },
  { pattern: "teams.forEach(function(t){html+='<option value=\"'+t+'\">'+TA[t]+'</option>'})",
    replacement: '' }
];

// First find all occurrences
const h2hContent = hjs;
let line1Start = h2hContent.indexOf("teams.forEach(function(t){html+='<option value=\"'+t+'\">'+TA[t]+'</option>'})");

if (line1Start === -1) {
  // Try alternative pattern
  line1Start = h2hContent.indexOf("teams.forEach(function(t){html+='<option value=\"'+t+'\">'+TA[t]+'</option>'});");
}

if (line1Start > 0) {
  // Build the group optgroups for h2h
  const groupedH2H = `teams = ["-- Select Team --"];\n` +
    DIV_ORDER.map(div => 
      `teams.push("--${div}--", ${DIVISIONS[div].map(t => `"${t}"`).join(', ')});`
    ).join('\n') + '\n';
  
  // Actually this approach is getting messy. Let me just use a simple inline replacement
  // Find the full block from "var teams = Object.keys(TA).sort();" to the end of the select
  const teamsBlockStart = h2hContent.indexOf("var teams = Object.keys(TA).sort();");
  if (teamsBlockStart > 0) {
    // Find the two forEach blocks
    const firstForEach = h2hContent.indexOf("teams.forEach(", teamsBlockStart);
    const secondForEach = h2hContent.indexOf("teams.forEach(", firstForEach + 10);
    
    if (firstForEach > 0 && secondForEach > 0) {
      // Find end of each line
      const endFirst = h2hContent.indexOf('\n', firstForEach);
      const endSecond = h2hContent.indexOf('\n', secondForEach);
      
      // Build grouped HTML for each
      const groupOptions = (abbr) => DIV_ORDER.map(div => 
        "html += '<optgroup label=\"&mdash; " + div + " &mdash;\">';" +
        DIVISIONS[div].map(t => `html += '<option value="${t}">${TEAM_NAMES[t]}</option>';`).join('') +
        "html += '</optgroup>';"
      ).join('\n');
      
      const oldFirst = h2hContent.substring(firstForEach, endFirst);
      const oldSecond = h2hContent.substring(secondForEach, endSecond);
      
      hjs = hjs.replace(oldFirst, `var teamKeys = Object.keys(TA).sort();\n${DIV_ORDER.map(div => 
        `html += '<optgroup label="— ${div} —">';${DIVISIONS[div].map(t => 
          `html += '<option value="${t}">${TEAM_NAMES[t]}</option>';`).join('')}html += '</optgroup>';`
      ).join('\n')}`);
      
      hjs = hjs.replace(oldSecond, `${DIV_ORDER.map(div => 
        `html += '<optgroup label="— ${div} —">';${DIVISIONS[div].map(t => 
          `html += '<option value="${t}">${TEAM_NAMES[t]}</option>';`).join('')}html += '</optgroup>';`
      ).join('\n')}`);
      
      fs.writeFileSync(path.join(__dirname, 'dashboard_h2h.js'), hjs);
      console.log('✅ dashboard_h2h.js updated with divisions');
    } else {
      console.log('⚠️ Could not find second forEach block in h2h.js');
    }
  } else {
    console.log('⚠️ Could not find teams block in h2h.js');
  }
} else {
  console.log('⚠️ Could not find forEach in h2h.js');
}

console.log('🎉 Done!');
