#!/usr/bin/env node
const fs=require('fs'), https=require('https');
const F=__dirname+'/dashboard_2026.html';

const TEAMS={
  ARI:{c:"Mike LaFleur",s:"State Farm Stadium, Glendale"}, ATL:{c:"Kevin Stefanski",s:"Mercedes-Benz Stadium, Atlanta"},
  BAL:{c:"Jesse Minter",s:"M&T Bank Stadium, Baltimore"}, BUF:{c:"Joe Brady",s:"Highmark Stadium, Orchard Park"},
  CAR:{c:"Dave Canales",s:"Bank of America Stadium, Charlotte"}, CHI:{c:"Matt Eberflus",s:"Soldier Field, Chicago"},
  CIN:{c:"Zac Taylor",s:"Paycor Stadium, Cincinnati"}, CLE:{c:"Todd Monken",s:"Huntington Bank Field, Cleveland"},
  DAL:{c:"Vacante",s:"AT&T Stadium, Arlington"}, DEN:{c:"Sean Payton",s:"Empower Field at Mile High, Denver"},
  DET:{c:"Dan Campbell",s:"Ford Field, Detroit"}, GB:{c:"Matt LaFleur",s:"Lambeau Field, Green Bay"},
  HOU:{c:"DeMeco Ryans",s:"NRG Stadium, Houston"}, IND:{c:"Shane Steichen",s:"Lucas Oil Stadium, Indianapolis"},
  JAX:{c:"Liam Coen",s:"EverBank Stadium, Jacksonville"}, KC:{c:"Andy Reid",s:"GEHA Field at Arrowhead, Kansas City"},
  LAC:{c:"Jim Harbaugh",s:"SoFi Stadium, Inglewood"}, LAR:{c:"Sean McVay",s:"SoFi Stadium, Inglewood"},
  LV:{c:"Klint Kubiak",s:"Allegiant Stadium, Las Vegas"}, MIA:{c:"Jeff Hafley",s:"Hard Rock Stadium, Miami Gardens"},
  MIN:{c:"Kevin O'Connell",s:"U.S. Bank Stadium, Minneapolis"}, NE:{c:"Mike Vrabel",s:"Gillette Stadium, Foxborough"},
  NO:{c:"Kellen Moore",s:"Caesars Superdome, New Orleans"}, NYG:{c:"John Harbaugh",s:"MetLife Stadium, East Rutherford"},
  NYJ:{c:"Aaron Glenn",s:"MetLife Stadium, East Rutherford"}, PHI:{c:"Nick Sirianni",s:"Lincoln Financial Field, Philadelphia"},
  PIT:{c:"Mike McCarthy",s:"Acrisure Stadium, Pittsburgh"}, SEA:{c:"Mike Macdonald",s:"Lumen Field, Seattle"},
  SF:{c:"Kyle Shanahan",s:"Levi's Stadium, Santa Clara"}, TB:{c:"Todd Bowles",s:"Raymond James Stadium, Tampa"},
  TEN:{c:"Robert Saleh",s:"Nissan Stadium, Nashville"}, WAS:{c:"Dan Quinn",s:"Northwest Stadium, Landover"}
};

const ST={KC:95,BUF:93,BAL:92,PHI:91,DET:90,SF:89,CIN:88,GB:87,LAR:85,MIA:84,HOU:83,DAL:82,LAC:81,SEA:80,MIN:79,TB:78,CHI:77,DEN:76,PIT:75,NYJ:74,WAS:73,ATL:72,ARI:71,LV:70,NO:69,IND:68,JAX:67,CLE:66,TEN:65,NYG:64,NE:63,CAR:62};
const QB={KC:96,BUF:94,BAL:93,CIN:91,PHI:90,DET:89,LAR:88,DAL:87,GB:86,SF:85,MIA:84,HOU:83,LAC:82,SEA:81,MIN:80,JAX:79,CHI:78,TB:77,ATL:76,ARI:75,NYJ:74,WAS:73,DEN:72,NO:71,PIT:70,LV:69,IND:68,CLE:67,TEN:66,NYG:65,NE:64,CAR:63};
const DF={BAL:94,KC:92,SF:91,BUF:90,DET:89,PHI:88,CIN:87,GB:86,DAL:85,MIA:84,LAR:83,HOU:82,LAC:81,SEA:80,MIN:79,TB:78,CHI:77,DEN:76,PIT:75,NYJ:74,WAS:73,ATL:72,ARI:71,LV:70,NO:69,IND:68,JAX:67,CLE:66,TEN:65,NYG:64,NE:63,CAR:62};
const OL={PHI:95,DET:93,KC:91,BAL:90,GB:89,DAL:88,LAR:87,SF:86,BUF:85,CIN:84,MIA:83,HOU:82,LAC:81,SEA:80,MIN:79,TB:78,CHI:77,DEN:76,PIT:75,NYJ:74,WAS:73,ATL:72,ARI:71,LV:70,NO:69,IND:68,JAX:67,CLE:66,TEN:65,NYG:64,NE:63,CAR:62};

function gp(P,X,I,T){let b, t=X==='QB'?QB:(['DL','LB','CB','S'].includes(X)?DF:(X==='OL'?OL:ST));b=t[P]||70;return Math.max(55,Math.min(99,Math.round(b*(1-(I/Math.max(T,1))*0.35))));}
function mp(p){let P=(p||'').toUpperCase();if(P==='QB')return'QB';if(P==='RB'||P==='FB')return'RB';if(P==='WR')return'WR';if(P==='TE')return'TE';if(['T','G','C','OT','OG','OC','OL'].includes(P))return'OL';if(['DL','DE','DT','NT'].includes(P))return'DL';if(['LB','OLB','ILB','MLB'].includes(P))return'LB';if(['CB','DB'].includes(P))return'CB';if(['S','SAF','FS','SS'].includes(P))return'S';return null;}

const OP=[['QB',3],['RB',3],['WR',4],['TE',2],['OL',5]], DP=[['DL',4],['LB',4],['CB',4],['S',3]];

(async()=>{
  console.log('Fetching...');
  const d=await new Promise((r,j)=>{https.get('https://api.sleeper.app/v1/players/nfl',(res)=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{r(JSON.parse(b))}catch(e){j(e)}});}).on('error',j);});
  console.log(Object.keys(d).length+' players loaded');
  
  // Build team index
  const tm={}; for(const a in TEAMS) tm[a]={o:{},d:{}};
  let count=0;
  for(const pid in d){
    const p=d[pid];
    if(!p.active) continue;
    if(!p.team||!tm[p.team]) continue;
    const pos=mp(p.position);
    if(!pos) continue;
    const n=p.full_name||(p.first_name+' '+p.last_name);
    const side=['QB','RB','WR','TE','OL'].includes(pos)?'o':'d';
    if(!tm[p.team][side][pos]) tm[p.team][side][pos]=[];
    tm[p.team][side][pos].push(n);
    count++;
  }
  console.log(count+' active players matched to teams');
  
  // Build JS
  let js='var tm={\n';
  for(const a in TEAMS){
    js+=` ${a}: {\n  coach: "${TEAMS[a].c}",\n  stadium: "${TEAMS[a].s}",\n  record: "0-0",\n  qbRecord: "0-0",\n  off: [\n`;
    for(const [pos,limit] of OP){
      const arr=(tm[a].o[pos]||[]).slice(0,limit);
      arr.forEach((n,i)=>{js+=`   { n: "${n}", p: "${pos}", g: ${gp(a,pos,i,arr.length)} },\n`;});
    }
    js+=`  ],\n  def: [\n`;
    for(const [pos,limit] of DP){
      const arr=(tm[a].d[pos]||[]).slice(0,limit);
      arr.forEach((n,i)=>{js+=`   { n: "${n}", p: "${pos}", g: ${gp(a,pos,i,arr.length)} },\n`;});
    }
    const pct=((ST[a]||70)-60)/35;
    js+=`  ],\n  injuries: [],\n  draft: [],\n  offStats: { passYds: ${Math.round(3500+pct*1500)}, passYdsG: ${Math.round((3500+pct*1500)/17)}, rushYds: ${Math.round(1400+pct*800)}, rushYdsG: ${Math.round((1400+pct*800)/17)}, pts: ${Math.round(280+pct*180)}, ptsG: ${Math.round((280+pct*180)/17)} },\n  defStats: { passYds: ${Math.round(4300-pct*800)}, passYdsG: ${Math.round((4300-pct*800)/17)}, rushYds: ${Math.round(2100-pct*600)}, rushYdsG: ${Math.round((2100-pct*600)/17)}, pts: ${Math.round(400-pct*120)}, ptsG: ${Math.round((400-pct*120)/17)}, sacks: ${Math.round(30+pct*20)} },\n  olStats: { sacksAllowed: ${Math.round(55-pct*20)}, pressureRate: ${Math.round((40-pct*12)*10)/10}, ydsBeforeContact: ${Math.round((1.0+pct*1.2)*10)/10} }\n },\n`;
  }
  js+='};\n';
  const pc=(js.match(/"n":/g)||[]).length;
  console.log(pc+' players in generated JS');
  
  let html=fs.readFileSync(F,'utf8');
  html=html.replace(/var tm=\{[\s\S]*?\};/,js);
  fs.writeFileSync(F,html);
  console.log('Saved');
  
  const {execSync}=require('child_process');
  execSync('cd "'+__dirname+'" && git add dashboard_2026.html && git commit -m "v26: full real rosters from Sleeper" && git push',{stdio:'inherit'});
  console.log('Done');
})();
