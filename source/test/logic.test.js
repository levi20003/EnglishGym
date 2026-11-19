// Run: node test/logic.test.js
const fs=require("fs"),vm=require("vm"),path=require("path"),assert=require("assert");
const ctx={console};vm.createContext(ctx);
for(const f of ["content.js","content2.js","logic.js","logic2.js"])vm.runInContext(fs.readFileSync(path.join(__dirname,"../src",f),"utf8").replace(/^const /gm,"var "),ctx);
let pass=0,fail=0;
function t(name,fn){try{fn();pass++;console.log("  ok  "+name)}catch(e){fail++;console.log("  FAIL "+name+"\n       "+e.message)}}
const L=ctx,T="2026-11-19";

console.log("content");
t("first 60 deck ids keep their v1 words",()=>{assert.equal(L.DECK[0].w,"get the hang of");assert.equal(L.DECK[30].w,"deploy");assert.equal(L.DECK[59].w,"attachment")});
t("every deck item has Hungarian, definition, example, level, category",()=>{for(const c of L.DECK){assert.ok(c.hu&&c.def&&c.ex&&L.LEVELS.includes(c.lvl)&&c.cat,c.w)}});
t("deck ids are unique",()=>{assert.equal(new Set(L.DECK.map(c=>c.id)).size,L.DECK.length)});
t("practice items are valid and categorised",()=>{const ids=new Set();for(const q of L.GRAMMAR){assert.ok(L.validItem(q),q.id);assert.ok(L.CATS.includes(q.cat),q.id);assert.ok(!ids.has(q.id),"dup "+q.id);ids.add(q.id)}});
t("each main category has at least 5 practice items",()=>{for(const c of ["articles","prepositions","present perfect","question formation","word order","conditionals","passive","verb patterns","collocations","linkers","vocabulary"]){assert.ok(L.GRAMMAR.filter(q=>q.cat===c).length>=5,c)}});
t("assessment sets are parallel: 5 items per level in A and B",()=>{for(const s of ["A","B"])for(const lv of L.LEVELS)assert.equal(L.ASSESS_GRAMMAR[s].filter(q=>q.lvl===lv).length,5,s+lv)});
t("assessment sets A and B share no questions",()=>{const a=new Set(L.ASSESS_GRAMMAR.A.map(q=>q.q));for(const q of L.ASSESS_GRAMMAR.B)assert.ok(!a.has(q.q),q.q)});
t("reading sets have one text per level with 3 questions",()=>{for(const s of ["A","B"]){assert.deepEqual(L.ASSESS_READING[s].map(x=>x.lvl),L.LEVELS);for(const x of L.ASSESS_READING[s])assert.equal(x.qs.length,3)}});

console.log("spaced repetition");
t("Again resets to 1 day and lowers ease",()=>{const s=L.rateCard({ease:2.5,interval:10,reps:4,lapses:0},0,T);assert.equal(s.interval,1);assert.equal(s.reps,0);assert.ok(s.ease<2.5);assert.equal(s.due,"2026-11-20")});
t("intervals grow with Good",()=>{let s=null;const iv=[];for(let i=0;i<5;i++){s=L.rateCard(s,2,T);iv.push(s.interval)}for(let i=1;i<iv.length;i++)assert.ok(iv[i]>=iv[i-1],iv.join(","));assert.ok(iv[4]>=21,iv.join(","))});
t("interval always grows on a pass after reps 2",()=>{const s=L.rateCard({ease:1.3,interval:2,reps:3,lapses:0},1,T);assert.ok(s.interval>=3)});
t("status labels",()=>{assert.equal(L.cardStatus(null),"new");assert.equal(L.cardStatus({reps:1,interval:1}),"learning");assert.equal(L.cardStatus({reps:3,interval:8}),"review");assert.equal(L.cardStatus({reps:5,interval:30}),"mastered")});
t("no new cards when reviews pile up",()=>{assert.equal(L.newAllowance(60,5,45),0);assert.equal(L.newAllowance(30,5,45),3);assert.equal(L.newAllowance(5,5,45),10);assert.equal(L.newAllowance(5,45,45),0)});
t("due queue is capped and oldest first after a missed week",()=>{const st={},deck=L.DECK;deck.forEach((c,i)=>st[c.id]={due:L.addDays(T,-(i%7)),interval:1,reps:1});const q=L.dueQueue(st,deck,T,30);assert.equal(q.now.length,40);assert.equal(q.waiting,deck.length-40);assert.ok(st[q.now[0].id].due<=st[q.now[39].id].due)});
t("typed answers accept small typos only",()=>{assert.equal(L.checkTyped("meet a deadline","meet a deadline"),"exact");assert.equal(L.checkTyped("Meet a dedline","meet a deadline"),"close");assert.equal(L.checkTyped("make a deadline","meet a deadline"),"wrong");assert.equal(L.checkTyped("","x"),"empty")});
t("retention from review stats",()=>{const r={};r[T]={n:10,ok:8};r[L.addDays(T,-3)]={n:10,ok:6};assert.equal(L.retention(r,T,7),0.7);assert.equal(L.retention({},T,7),null)});

console.log("mistake intelligence");
t("free-text categories normalise",()=>{assert.equal(L.normalizeCat("Articles"),"articles");assert.equal(L.normalizeCat("verb tense"),"tenses (other)");assert.equal(L.normalizeCat("Present Perfect"),"present perfect");assert.equal(L.normalizeCat("past simple"),"past tenses");assert.equal(L.normalizeCat("indirect question word order"),"question formation");assert.equal(L.normalizeCat("register / style"),"naturalness & register");assert.equal(L.normalizeCat("blah"),"other")});
function fresh(){return L.defaultState()}
t("one correct answer does not fix a mistake",()=>{const S=fresh();const m=L.addMistake(S,{cat:"articles",src:"quiz",qid:"g-ar1"},T);L.creditCorrect(S,"articles","g-ar2",T);assert.ok(!L.isMastered(m))});
t("three correct uses on one day is not enough",()=>{const S=fresh();const m=L.addMistake(S,{cat:"articles",src:"quiz",qid:"g-ar1"},T);for(const id of ["g-ar2","g-ar3","g-ar4"])L.creditCorrect(S,"articles",id,T);assert.ok(!L.isMastered(m))});
t("the same item twice counts once",()=>{const S=fresh();const m=L.addMistake(S,{cat:"articles",src:"quiz",qid:"g-ar1"},T);L.creditCorrect(S,"articles","g-ar2",T);L.creditCorrect(S,"articles","g-ar2",L.addDays(T,1));L.creditCorrect(S,"articles","g-ar3",L.addDays(T,1));assert.equal(m.uses.length,2);assert.ok(!L.isMastered(m))});
t("3 different items over 2 days fixes it",()=>{const S=fresh();const m=L.addMistake(S,{cat:"articles",src:"quiz",qid:"g-ar1"},T);L.creditCorrect(S,"articles","g-ar2",T);L.creditCorrect(S,"articles","g-ar3",L.addDays(T,1));L.creditCorrect(S,"articles","g-ar4",L.addDays(T,1));assert.ok(L.isMastered(m));assert.equal(m.fixedAt,L.addDays(T,1))});
t("credits go to the oldest open mistake first",()=>{const S=fresh();const a=L.addMistake(S,{cat:"prepositions",src:"quiz",qid:"x1"},L.addDays(T,-5));const b=L.addMistake(S,{cat:"prepositions",src:"writing"},T);L.creditCorrect(S,"prepositions","g-pr1",T);assert.equal(a.uses.length,1);assert.equal(b.uses.length,0)});
t("weakness profile marks repeated errors as weak and ranks them first",()=>{const S=fresh();for(let i=0;i<5;i++){L.recordEvent(S,"articles",false,"quiz","g-ar"+i,T);L.addMistake(S,{cat:"articles",src:"quiz"},T)}for(let i=0;i<8;i++)L.recordEvent(S,"passive",true,"quiz","p"+i,T);const p=L.weaknessProfile(S,T);assert.equal(p[0].cat,"articles");assert.equal(p[0].status,"weak");assert.equal(p.find(c=>c.cat==="passive").status,"strong")});
t("weakness profile shows improvement against the previous 4 weeks",()=>{const S=fresh();const old=L.addDays(T,-40);for(let i=0;i<6;i++)L.recordEvent(S,"prepositions",i<2,"quiz","q"+i,old);for(let i=0;i<6;i++)L.recordEvent(S,"prepositions",i<5,"quiz","r"+i,T);assert.equal(L.weaknessProfile(S,T).find(c=>c.cat==="prepositions").status,"improving")});
t("targeted practice picks the weakest category and skips items just answered correctly",()=>{const S=fresh();for(let i=0;i<4;i++){L.recordEvent(S,"articles",false,"quiz","x"+i,T);L.addMistake(S,{cat:"articles",src:"quiz"},T)}L.recordEvent(S,"articles",true,"quiz","g-ar2",T);const r=L.targetedItems(S,L.GRAMMAR,T,5,L.lvlIdx("B2"));assert.ok(r.items.length>=4);assert.ok(r.items.every(q=>q.cat==="articles"));assert.ok(!r.items.some(q=>q.id==="g-ar2"))});
t("generated items are validated",()=>{assert.ok(!L.validItem({q:"Pick one",o:["a","a","b","c"],a:1,cat:"articles"}));assert.ok(!L.validItem({q:"Pick one ___",o:["a","b","c"],a:1,cat:"articles"}));assert.ok(L.validItem({q:"He is ___ engineer.",o:["a","an","the","—"],a:1,cat:"articles"}))});

console.log("assessment");
const items=L.ASSESS_GRAMMAR.A;
t("band scoring stops at the first failed level",()=>{const ans=items.map(q=>q.lvl==="A2"||q.lvl==="B1"||q.lvl==="C1");assert.equal(L.bandLevel(items,ans,.6).level,"B1")});
t("all wrong is A1, all right is C1",()=>{assert.equal(L.bandLevel(items,items.map(()=>false),.6).level,"A1");assert.equal(L.bandLevel(items,items.map(()=>true),.6).level,"C1")});
t("overall uses the lower median and flags spread",()=>{const o=L.overallEstimate({grammar:{level:"B2"},reading:{level:"B2"},writing:{level:"A2"},speaking:{level:"B1"}});assert.equal(o.level,"B1");assert.ok(o.spread);assert.ok(!o.provisional)});
t("overall with one skill is provisional",()=>{const o=L.overallEstimate({grammar:{level:"B2"}});assert.equal(o.level,"B2");assert.ok(o.provisional)});
t("overall ignores activity: no skills, no level",()=>{assert.equal(L.overallEstimate({}),null)});
t("re-test alternates question sets",()=>{const S=fresh();assert.equal(L.nextSet(S,"grammar"),"A");S.assess.push({skill:"grammar",set:"A",d:T});assert.equal(L.nextSet(S,"grammar"),"B");S.assess.push({skill:"grammar",set:"B",d:T});assert.equal(L.nextSet(S,"grammar"),"A")});
t("re-test is due after 28 days",()=>{const S=fresh();S.assess.push({skill:"grammar",d:L.addDays(T,-27)});assert.ok(!L.retestDue(S,T));assert.ok(L.retestDue(S,L.addDays(T,1)))});
t("Claude ratings are validated",()=>{assert.ok(L.validRating({level:"b2"}));assert.ok(!L.validRating({level:"B3"}));assert.ok(!L.validRating(null))});

console.log("migration from 1.0");
t("v1 data is kept and converted",()=>{const v1={v:1,profile:{level:"B1",minutes:30,goals:[],interests:[],balance:50},level:"B2",cards:{d0:{ease:2.5,interval:3,reps:2,due:T}},custom:[{id:"c1",w:"foo",def:"bar"}],mistakes:[{d:T,type:"tenses",src:"quiz",q:"q",yours:"a",correct:"b",note:"n",fixed:false},{d:T,type:"articles",src:"writing",q:"x",yours:"x",correct:"y",note:"",fixed:true}],writings:[{d:T,score:7}],talks:[],activity:{[T]:15},tests:[{d:T,kind:"placement",score:14,of:20,level:"B2"}],missions:{}};
  const S=L.migrate(JSON.parse(JSON.stringify(v1)));
  assert.equal(S.v,2);assert.deepEqual(S.cards,v1.cards);assert.equal(S.custom.length,1);assert.equal(S.writings.length,1);assert.equal(S.activity[T],15);
  assert.equal(S.mistakes[0].cat,"tenses (other)");assert.equal(S.mistakes[0].fixedAt,null);assert.ok(L.isMastered(S.mistakes[1]));
  assert.equal(S.skills.grammar.level,"B2");assert.equal(S.assess.length,1);assert.equal(L.nextSet(S,"grammar"),"B");assert.equal(S.level,undefined)});
t("v2 data passes through unchanged",()=>{const S=L.defaultState();S.cards={d1:{due:T}};const S2=L.migrate(JSON.parse(JSON.stringify(S)));assert.deepEqual(S2.cards,S.cards)});

console.log("listening + pronunciation");
t("listening items are well formed",()=>{for(const x of L.LISTENING.concat(L.ASSESS_LISTENING.A,L.ASSESS_LISTENING.B)){assert.ok(x.lines.length&&x.qs.length>=3,x.id||x.lvl);for(const [sp,txt] of x.lines){assert.ok(L.VOICES.includes(x.speakers[sp]),"voice for "+sp);assert.ok(txt.length<2000)}for(const q of x.qs)assert.ok(q.o.length===4&&q.a>=0&&q.a<4)}});
t("listening assessment sets: one item per level each",()=>{for(const s of ["A","B"])assert.deepEqual(L.ASSESS_LISTENING[s].map(x=>x.lvl),L.LEVELS)});
t("perfect repetition scores 100%",()=>{const r=L.wordDiff("Can I have a look at it?","can I have a look at it");assert.equal(r.score,1);assert.equal(r.missing.length,0)});
t("contractions and numbers match either way",()=>{assert.equal(L.wordDiff("I'm sure it's three.","I am sure it is 3").score,1)});
t("missing words are reported",()=>{const r=L.wordDiff("I think these three things are worth thinking about.","I sink these tree things are worth thinking about");assert.deepEqual(r.missing,["think","three"]);assert.ok(r.score>0.7&&r.score<0.85)});
t("empty recognition scores 0",()=>{assert.equal(L.wordDiff("Turn it off and on again.","").score,0)});

console.log("adaptive session");
function st(){return L.defaultState()}
t("first session asks for an assessment",()=>{const p=L.planSession(st(),T,45,1);assert.equal(p.main.mode,"assess")});
t("weekday rhythm is the default once assessed",()=>{const S=st();S.assess.push({d:T,skill:"grammar",level:"B1"});S.skills.grammar=S.assess[0];assert.equal(L.planSession(S,T,45,2).main.mode,"write")});
t("lowest skill pulls the session toward it",()=>{const S=st();for(const [k,l] of [["grammar","B2"],["reading","B2"],["speaking","A2"]]){const a={d:T,skill:k,level:l};S.assess.push(a);S.skills[k]=a}assert.equal(L.planSession(S,T,45,1).main.mode,"speak")});
t("a mode done today is not picked again",()=>{const S=st();S.assess.push({d:T,skill:"grammar",level:"B1"});S.skills.grammar=S.assess[0];S.missions[T]={write:true};assert.notEqual(L.planSession(S,T,45,2).main.mode,"write")});
t("re-test due wins",()=>{const S=st();const old=L.addDays(T,-30);S.assess.push({d:old,skill:"grammar",level:"B1"});S.skills.grammar=S.assess[0];assert.equal(L.planSession(S,T,45,3).main.mode,"assess")});
t("missed week: review is capped and minutes still add up",()=>{const S=st();S.assess.push({d:T,skill:"grammar",level:"B1"});S.skills.grammar=S.assess[0];L.DECK.forEach(c=>S.cards[c.id]={due:L.addDays(T,-7),interval:1,reps:1});const p=L.planSession(S,T,30,1);assert.equal(p.review.due,40);assert.equal(p.review.nNew,0);assert.ok(p.review.min<=12);assert.ok(p.review.min+p.main.min+p.produce.min<=34)});
t("speaking day ends with shadowing, writing day with speaking",()=>{const S=st();S.assess.push({d:T,skill:"grammar",level:"B1"});S.skills.grammar=S.assess[0];assert.equal(L.planSession(S,T,45,3).produce.mode,"pron");assert.equal(L.planSession(S,T,45,2).produce.mode,"produce")});

console.log("analytics");
t("4-week comparison separates windows",()=>{const S=st();S.writings=[{d:T,score:7},{d:L.addDays(T,-40),score:5}];const c=L.compare4w(S,T);const w=c.find(x=>x[0]==="Writing score");assert.equal(w[1],5);assert.equal(w[2],7)});
t("weekly minutes",()=>{const a={};a[T]=20;a[L.addDays(T,-8)]=15;assert.deepEqual(L.weeklyMinutes(a,T,2),[15,20])});

console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
