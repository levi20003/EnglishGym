/* ================= LEARNING LOGIC (pure functions, covered by tests) ================= */
const DAY=864e5;
function addDays(iso,n){const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function daysBetween(a,b){return Math.round((new Date(b+"T12:00:00Z")-new Date(a+"T12:00:00Z"))/DAY)}
const lvlIdx=l=>ALL_LEVELS.indexOf(l);

/* ---- state shape + migration ---- */
function defaultState(){return{v:2,profile:null,cards:{},custom:[],mistakes:[],events:[],revStats:{},writings:[],talks:[],activity:{},tests:[],assess:[],skills:{},genItems:[],missions:{},listening:[],pron:[],started:null}}
function normalizeCat(t){
  const s=String(t||"").toLowerCase();
  if(!s)return"other";
  if(CATS.includes(s))return s;
  if(s.includes("article"))return"articles";
  if(s.includes("preposition"))return"prepositions";
  if(s.includes("present perfect")||s==="perfect")return"present perfect";
  if(s.includes("past"))return"past tenses";
  if(s.includes("question"))return"question formation";
  if(s.includes("order")||s.includes("inversion"))return"word order";
  if(s.includes("conditional")||s.includes("wish"))return"conditionals";
  if(s.includes("passive"))return"passive";
  if(s.includes("agreement")||s.includes("third person")||s.includes("subject-verb"))return"subject-verb agreement";
  if(s.includes("tense")||s.includes("future")||s.includes("continuous"))return"tenses (other)";
  if(s.includes("pattern")||s.includes("gerund")||s.includes("infinitive"))return"verb patterns";
  if(s.includes("countable")||s.includes("plural")||s.includes("quantifier"))return"countables";
  if(s.includes("collocation"))return"collocations";
  if(s.includes("linker")||s.includes("connector")||s.includes("conjunction")||s.includes("linking")||s.includes("cohesion"))return"linkers";
  if(s.includes("register")||s.includes("style")||s.includes("natural")||s.includes("formal")||s.includes("idiom")||s.includes("tone"))return"naturalness & register";
  if(s.includes("spell")||s.includes("punctu")||s.includes("capital"))return"spelling & punctuation";
  if(s.includes("vocab")||s.includes("word choice")||s.includes("false friend")||s.includes("word form")||s.includes("meaning"))return"vocabulary";
  if(s.includes("adjective"))return"prepositions";
  return"other";
}
function migrate(raw){
  const S=Object.assign(defaultState(),raw||{});
  if(!raw||raw.v===2)return S;
  // v1 -> v2
  S.v=2;
  S.mistakes=(raw.mistakes||[]).map((m,i)=>({id:"m1-"+i,d:m.d,cat:normalizeCat(m.type),src:m.src||"quiz",q:m.q||"",yours:m.yours||"",correct:m.correct||"",note:m.note||"",uses:[],fixedAt:m.fixed?(m.d||null):null,manual:!!m.fixed}));
  S.events=[];S.revStats={};S.assess=[];S.skills={};S.genItems=[];
  (raw.tests||[]).filter(t=>t.kind==="placement").forEach(t=>{
    const a={d:t.d,skill:"grammar",set:"A",score:t.score,of:t.of,level:t.level,conf:"low",note:"From the 1.0 test (20 grammar questions)"};
    S.assess.push(a);S.skills.grammar=a;
  });
  delete S.level;
  return S;
}

/* ---- spaced repetition ---- */
function rateCard(s,r,today){
  s=Object.assign({ease:2.5,interval:0,reps:0,lapses:0},s||{});
  if(r===0){s.interval=1;s.lapses++;s.ease=Math.max(1.3,s.ease-.2);s.reps=0}
  else{
    if(s.reps===0)s.interval=r===3?3:1;
    else if(s.reps===1)s.interval=r===1?2:r===2?3:6;
    else s.interval=Math.max(s.interval+1,Math.round(s.interval*(r===1?1.2:r===2?s.ease:s.ease*1.3)));
    s.ease=Math.max(1.3,s.ease+(r===1?-.15:r===3?.15:0));s.reps++;
  }
  s.due=addDays(today,s.interval);s.last=today;return s;
}
function cardStatus(s){if(!s)return"new";if(s.interval>=21)return"mastered";if(s.reps>=2&&s.interval>=7)return"review";return"learning"}
/* Daily caps: reviews come first; new cards shrink as the review load grows, so a missed day never snowballs. */
function reviewCap(minutes){return minutes>=60?70:minutes>=45?55:minutes>=30?40:25}
function newAllowance(dueCount,learningCount,minutes){
  const base=minutes>=60?12:minutes>=45?10:minutes>=30?8:5;
  if(dueCount>=reviewCap(minutes))return 0;
  if(learningCount>=40)return 0;            // too many fresh cards still unstable
  if(dueCount>25||learningCount>=25)return Math.min(3,base);
  return base;
}
function dueQueue(cardsState,deck,today,minutes){
  const due=deck.filter(c=>cardsState[c.id]&&cardsState[c.id].due<=today).sort((a,b)=>cardsState[a.id].due<cardsState[b.id].due?-1:1);
  const cap=reviewCap(minutes);
  return{now:due.slice(0,cap),waiting:Math.max(0,due.length-cap),total:due.length};
}
function retention(revStats,today,days){let n=0,ok=0;for(let k=0;k<days;k++){const r=revStats[addDays(today,-k)];if(r){n+=r.n;ok+=r.ok}}return n?ok/n:null}
function normAnswer(s){return String(s||"").toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' -]/g,"").replace(/\s+/g," ").trim()}
function checkTyped(input,target){
  const a=normAnswer(input),b=normAnswer(target);
  if(!a)return"empty";if(a===b)return"exact";
  // allow one small typo per 6 letters
  const dist=lev(a,b);return dist<=Math.max(1,Math.floor(b.length/6))?"close":"wrong";
}
function lev(a,b){const m=[];for(let i=0;i<=a.length;i++){m[i]=[i];for(let j=1;j<=b.length;j++)m[i][j]=i===0?j:Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1))}return m[a.length][b.length]}

/* ---- mistakes: a mistake is fixed only after 3 correct uses, on 3 different items, on at least 2 different days ---- */
const MASTERY={uses:3,items:3,days:2};
function isMastered(m){
  if(m.fixedAt)return true;
  const u=m.uses||[];
  return u.length>=MASTERY.uses&&new Set(u.map(x=>x.qid)).size>=MASTERY.items&&new Set(u.map(x=>x.d)).size>=MASTERY.days;
}
function addMistake(S,m,today){
  const rec={id:"m"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),d:today,cat:normalizeCat(m.cat),src:m.src,q:m.q||"",qid:m.qid||null,yours:m.yours||"",correct:m.correct||"",note:m.note||"",uses:[],fixedAt:null};
  S.mistakes.unshift(rec);
  // keep all open mistakes; trim only old fixed ones
  if(S.mistakes.length>400){const open=S.mistakes.filter(x=>!isMastered(x));const fixed=S.mistakes.filter(isMastered).slice(0,Math.max(0,400-open.length));S.mistakes=open.concat(fixed)}
  return rec;
}
function recordEvent(S,cat,ok,src,qid,today){S.events.push({d:today,cat:normalizeCat(cat),ok:!!ok,src,qid:qid||null});if(S.events.length>2500)S.events=S.events.slice(-2500)}
/* A correct answer credits the oldest open mistake in that category, if that item hasn't already counted for it. */
function creditCorrect(S,cat,qid,today){
  cat=normalizeCat(cat);
  const open=S.mistakes.filter(m=>m.cat===cat&&!isMastered(m)).reverse();
  for(const m of open){
    if(m.qid&&m.qid===qid&&m.d===today)continue; // same question right after the mistake doesn't count
    if((m.uses||[]).some(u=>u.qid===qid))continue;
    m.uses=(m.uses||[]).concat([{d:today,qid}]);
    if(isMastered(m))m.fixedAt=today;
    return m;
  }
  return null;
}
/* Weakness profile per category over the last 28 days, compared with the 28 days before. */
function weaknessProfile(S,today){
  const out={};
  const from28=addDays(today,-27),from56=addDays(today,-55);
  for(const e of S.events){
    const c=out[e.cat]||(out[e.cat]={cat:e.cat,ok28:0,err28:0,okPrev:0,errPrev:0,open:0,fixed:0});
    if(e.d>=from28){e.ok?c.ok28++:c.err28++}else if(e.d>=from56){e.ok?c.okPrev++:c.errPrev++}
  }
  for(const m of S.mistakes){
    const c=out[m.cat]||(out[m.cat]={cat:m.cat,ok28:0,err28:0,okPrev:0,errPrev:0,open:0,fixed:0});
    isMastered(m)?c.fixed++:c.open++;
    // writing/speaking mistakes are not quiz events; count them as errors in the window
    if(m.src!=="quiz"&&m.src!=="practice"&&m.src!=="assessment"&&m.d>=from28)c.err28++;
  }
  return Object.values(out).map(c=>{
    const n=c.ok28+c.err28,np=c.okPrev+c.errPrev;
    c.acc=n?c.ok28/n:null;c.accPrev=np?c.okPrev/np:null;c.attempts=n;
    c.status=n<3&&c.open===0?"not enough data":
      (c.acc!=null&&c.acc>=.85&&n>=6&&c.open<=1)?"strong":
      (c.accPrev!=null&&c.acc!=null&&c.acc-c.accPrev>=.15)?"improving":
      (c.err28>=3&&(c.acc==null||c.acc<.6))?"weak":
      (c.open>=3)?"recurring":"developing";
    c.priority=c.open*2+c.err28-(c.ok28*.3)+(c.status==="weak"?3:c.status==="recurring"?2:0)-(c.status==="strong"?5:0);
    return c;
  }).sort((a,b)=>b.priority-a.priority);
}
/* Targeted practice: weakest categories first, skip items answered correctly in the last 3 days. */
function targetedItems(S,pool,today,n,levelIdxCap){
  const prof=weaknessProfile(S,today).filter(c=>c.status!=="strong"&&(c.open>0||c.err28>0));
  const recentOk=new Set(S.events.filter(e=>e.ok&&e.d>=addDays(today,-2)).map(e=>e.qid));
  const picked=[];
  for(const c of prof){
    const items=pool.filter(q=>q.cat===c.cat&&!recentOk.has(q.id)&&(levelIdxCap==null||lvlIdx(q.lvl)<=levelIdxCap+1));
    for(const q of items){if(picked.length>=n)break;if(!picked.includes(q))picked.push(q)}
    if(picked.length>=n)break;
  }
  return{items:picked,cats:prof.slice(0,3).map(c=>c.cat)};
}
/* Validate a Claude-generated practice item. */
function validItem(x){
  return x&&typeof x.q==="string"&&x.q.length>5&&Array.isArray(x.o)&&x.o.length===4&&x.o.every(o=>typeof o==="string"&&o.trim())&&new Set(x.o.map(o=>o.trim().toLowerCase())).size===4&&Number.isInteger(x.a)&&x.a>=0&&x.a<4&&CATS.includes(normalizeCat(x.cat));
}

/* ---- assessment ---- */
/* Band scoring: you reach a level when you get at least `pass` of that level's items right AND all lower levels are reached. */
function bandLevel(items,answers,pass){
  const by={};items.forEach((q,i)=>{const b=by[q.lvl]||(by[q.lvl]={n:0,ok:0});b.n++;if(answers[i])b.ok++});
  let level="A1";
  for(const L of LEVELS){const b=by[L];if(!b)continue;if(b.ok/b.n>=pass)level=L;else break}
  return{level,by};
}
function nextSet(S,skill){const last=S.assess.filter(a=>a.skill===skill).slice(-1)[0];return last&&last.set==="A"?"B":"A"}
function overallEstimate(skills){
  const ls=SKILLS.map(([k])=>skills[k]&&skills[k].level).filter(Boolean).map(lvlIdx).sort((a,b)=>a-b);
  if(!ls.length)return null;
  const med=ls[Math.floor((ls.length-1)/2)]; // lower median: don't round up
  return{level:ALL_LEVELS[med],tested:ls.length,spread:ls[ls.length-1]-ls[0]>=2,provisional:ls.length<3,low:ALL_LEVELS[ls[0]],high:ALL_LEVELS[ls[ls.length-1]]};
}
function retestDue(S,today){const last=S.assess.slice(-1)[0];return last?daysBetween(last.d,today)>=28:false}
function validRating(r){return r&&ALL_LEVELS.includes(String(r.level||"").toUpperCase())}

/* ---- activity ---- */
function daysThisWeek(activity,today){let n=0;for(let k=0;k<7;k++)if(activity[addDays(today,-k)])n++;return n}
