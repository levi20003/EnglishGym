/* ================= APP ================= */
function today(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
let S=defaultState();
let docRef=null,sample=null,dict=null,tts=null,downloads=null,saveTimer=null,storeMode="local";
const STANDALONE=!!window.EG_STANDALONE,CLAUDE_URL="https://claude.ai/artifact/VuYbGGJVvynT2938BzDKqA";
function needsClaude(what){return STANDALONE?h("span",{class:"small muted"},(what||"This")+" needs Claude, so it only works in the Claude version. ",h("a",{href:CLAUDE_URL,target:"_blank",rel:"noopener"},"Open the Claude version")):h("span",{class:"small muted"},(what||"This")+" needs Claude, which isn't available in this view.")}
const LSKEY="english-gym-v1";
function loadLocal(){try{const r=localStorage.getItem(LSKEY);if(r)return JSON.parse(r)}catch(e){}return null}
function saveLocal(){try{localStorage.setItem(LSKEY,JSON.stringify(S))}catch(e){}}
function save(){
  saveLocal();clearTimeout(saveTimer);
  if(docRef){saveTimer=setTimeout(async()=>{try{await docRef.set({json:JSON.stringify(S),updated:Date.now(),v:2});setSync("Saved to your account")}catch(e){setSync("Saved on this device")}},700)}
}
function setSync(t){const e=document.getElementById("hdrSync");if(e)e.textContent=t}
function logMinutes(m,kind){const d=today();S.activity[d]=(S.activity[d]||0)+m;S.missions[d]=S.missions[d]||{};if(kind)S.missions[d][kind]=true;save();renderHeader()}
const DEFAULT_PROFILE={name:"Paulik",level:"B1",minutes:45,goals:["Job interviews","Speaking confidently","Business emails"],interests:["Software and AI","IT support and networking","Databases","Cybersecurity","Business and investing","Gaming (GTA 6)","Sport","Travel","Film and series"],balance:50};
const P=()=>Object.assign({},DEFAULT_PROFILE,S.profile||{});
const overall=()=>overallEstimate(S.skills);
function contentLevel(){const o=overall();let l=(o&&o.level)||P().level||"B1";if(l==="A1")l="A2";if(l==="C2")l="C1";return l}
const cIdx=()=>lvlIdx(contentLevel());
const learnCount=()=>Object.values(S.cards).filter(c=>cardStatus(c)==="learning").length;

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
function h(tag,attrs={},...kids){const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs||{})){if(k==="class")e.className=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v===true?"":v)}for(const k of kids.flat()){if(k==null||k===false)continue;e.append(k.nodeType?k:document.createTextNode(String(k)))}return e}
function toast(t){const e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>e.hidden=true,2600)}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function allCards(){return DECK.concat(S.custom.map(c=>Object.assign({cat:"word",hu:"",track:"gen",lvl:"B1"},c)))}
function speakBtn(text,label){if(!tts)return null;return h("button",{class:"speak",type:"button",onclick:()=>{tts.speak(text,{language:"en"}).catch(()=>{})}},label||"listen")}
function stat(v,l,sub){return h("div",{class:"stat"},h("b",{},v),h("span",{},l),sub?h("span",{class:"sub"},sub):null)}
const pct=x=>x==null?"–":Math.round(x*100)+"%";
const STATUS_CLASS={"weak":"bad","recurring":"warn","developing":"","improving":"good","strong":"good","not enough data":""};
function chip(text,cls){return h("span",{class:"chip "+(cls||"")},text)}
function claudeErr(e){return e&&e.code==="not_granted"?"Claude access is off for this page, so this part can't run.":e&&e.code==="rate_limited"?"Too many Claude requests right now. Wait a minute and try again.":"Claude didn't answer properly. Your work is kept; try again."}

/* ---------- answer handling (shared by quiz, practice, generated items) ---------- */
function handleAnswer(q,chosen,src){
  const ok=chosen===q.a,d=today(),qid=q.id||null;
  recordEvent(S,q.cat,ok,src,qid,d);
  let note="";
  if(ok){const m=creditCorrect(S,q.cat,qid,d);if(m){const n=(m.uses||[]).length;note=isMastered(m)?`That fixed one of your ${q.cat} mistakes.`:`Counts toward fixing a ${q.cat} mistake (${Math.min(n,3)}/3).`}}
  else addMistake(S,{cat:q.cat,src,qid,q:q.q,yours:q.o[chosen],correct:q.o[q.a],note:q.n||""},d);
  save();return{ok,note};
}
function runMCQ(panel,qs,src,title,onDone){
  let i=0,score=0,answered=false;
  function draw(){
    panel.innerHTML="";
    if(i>=qs.length){onDone(score);return}
    const q=qs[i];
    panel.append(h("div",{class:"row"},h("span",{class:"eyebrow"},`${title} · ${i+1} of ${qs.length}`),h("span",{class:"tag"},q.cat)),h("div",{class:"progressbar"},h("i",{style:`width:${i/qs.length*100}%`})),h("h2",{},q.q));
    const opts=h("div",{class:"opts"}),fb=h("div",{"aria-live":"polite"});
    q.o.forEach((o,k)=>opts.append(h("button",{class:"opt",onclick:()=>{if(answered)return;answered=true;const r=handleAnswer(q,k,src);const btns=[...opts.children];btns[q.a].classList.add("right");
      if(r.ok){score++;fb.append(h("p",{class:"good-t"},"Correct. "+(q.n||"")))}else{btns[k].classList.add("wrong");fb.append(h("p",{class:"bad-t"},"Not quite. "+(q.n||"")))}
      if(r.note)fb.append(h("p",{class:"small muted"},r.note));
      const nb=h("button",{class:"btn primary",style:"margin-top:10px",onclick:()=>{i++;answered=false;draw()}},i+1<qs.length?"Next":"See result");fb.append(nb);nb.focus()}},o)));
    panel.append(opts,fb);
  }
  draw();
}

/* ---------- navigation ---------- */
const TABS=[["today","Today"],["cards","Flashcards"],["quiz","Quiz"],["listen","Listening"],["write","Writing"],["speak","Speaking"],["pron","Pronunciation"],["weak","Weak spots"],["assess","Assessment"],["progress","Progress"],["profile","Profile"]];
const HIDDEN_VIEWS=["practice"];
let view="today";
function go(v){view=v;try{history.replaceState(null,"","#"+v)}catch(e){}render()}
function renderTabs(){const t=$("#tabs");t.innerHTML="";for(const[k,l]of TABS)t.append(h("button",{role:"tab","aria-selected":String(k===view),onclick:()=>go(k)},l))}
function renderHeader(){const o=overall();$("#hdrLevel").textContent=o?("Est. "+o.level+(o.provisional?" (provisional)":"")):"Level not assessed";$("#hdrStreak").textContent=daysThisWeek(S.activity,today())+" of 7 days this week"}
function render(){renderTabs();renderHeader();const m=$("#main");m.innerHTML="";(VIEWS[view]||VIEWS.today)(m);window.scrollTo({top:0})}

const RHYTHM={1:["Vocabulary + quiz","quiz","New words and phrases, then a 10-question quiz"],2:["Writing (IT and Business)","write","An email, report or update"],3:["Speaking roleplay (General)","speak","Meeting people, food, travel, debate"],4:["Weak-spot practice","weak","Targeted questions on your most frequent mistakes"],5:["Speaking roleplay (IT and Business)","speak","Interview, troubleshooting, stand-up"],6:["Writing (General)","write","Opinion, review or story"],0:["Review and check-in","progress","Cards, then look at your progress"]};

const VIEWS={
today(m){
  const p=P(),dow=new Date().getDay(),r=RHYTHM[dow],dn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dow],ms=S.missions[today()]||{};
  const o=overall();
  if(!o)m.append(h("div",{class:"banner"},h("p",{},h("b",{},"Start with an assessment of each skill."),h("br"),h("span",{class:"muted small"},"Grammar and reading take about 10 minutes each and need nothing else. Writing and speaking use Claude for the rating. Until then the app uses your own level guess ("+p.level+").")),h("button",{class:"btn primary",onclick:()=>go("assess")},"Open assessments")));
  else if(retestDue(S,today()))m.append(h("div",{class:"banner"},h("p",{},h("b",{},"4-week check-in is due."),h("br"),h("span",{class:"muted small"},"Re-take the skill assessments with new questions and compare with last time.")),h("button",{class:"btn primary",onclick:()=>go("assess")},"Re-test")));
  const q=dueQueue(S.cards,allCards(),today(),p.minutes),nn=Math.min(newAllowance(q.total,learnCount(),p.minutes),newCards(20).length);
  const top=weaknessProfile(S,today()).find(c=>c.status==="weak"||c.status==="recurring");
  const mainMin=Math.max(10,p.minutes-15);
  m.append(h("div",{class:"panel"},
    h("div",{class:"eyebrow"},dn+" · about "+p.minutes+" minutes"),
    h("h1",{},"Today's session"),
    h("ol",{class:"mission"},
      h("li",{},h("span",{class:"check"+(ms.cards?" on":"")}),h("div",{class:"t"},h("b",{},"1. Review"),h("div",{class:"muted small"},`${q.now.length} cards due${nn?`, ${nn} new`:""}${q.waiting?` · ${q.waiting} can wait, no need to catch up at once`:""}`)),h("span",{class:"min"},"~8 min"),h("button",{class:"btn",onclick:()=>go("cards")},"Open")),
      h("li",{},h("span",{class:"check"+(ms[r[1]]?" on":"")}),h("div",{class:"t"},h("b",{},"2. "+r[0]),h("div",{class:"muted small"},r[2])),h("span",{class:"min"},"~"+mainMin+" min"),h("button",{class:"btn primary",onclick:()=>go(r[1])},"Start")),
      h("li",{},h("span",{class:"check"+(ms.produce?" on":"")}),h("div",{class:"t"},h("b",{},"3. Say it yourself"),h("div",{class:"muted small"},"60 seconds speaking out loud on a topic, using one new phrase")),h("span",{class:"min"},"~3 min"),h("button",{class:"btn",onclick:()=>go("speak")},"Open"))
    ),
    top?h("p",{class:"note"},"Your most frequent mistakes right now: ",h("b",{},top.cat),". ",h("button",{class:"btn ghost",onclick:()=>go("weak")},"Practise them")):h("p",{class:"note"},"Missed a day? Just carry on. Reviews are capped so nothing piles up.")
  ));
},
cards(m){
  const p=P();
  const dq=dueQueue(S.cards,allCards(),today(),p.minutes);
  let queue=dq.now.concat(newCards(newAllowance(dq.total,learnCount(),p.minutes))),i=0,shown=false,done=0,typed=null;
  const panel=h("div",{class:"panel"});m.append(panel);
  function prodMode(c){const s=S.cards[c.id];return s&&s.reps>=2&&((c.id.length+today().charCodeAt(9))%2===0)}
  function draw(){
    panel.innerHTML="";
    if(i>=queue.length){
      panel.append(h("h2",{},done?"Session done":"Nothing due right now"),h("p",{class:"muted"},done?`You reviewed ${done} cards.`+(dq.waiting?` ${dq.waiting} older reviews will come tomorrow; that is on purpose.`:" Come back tomorrow for the next batch."):"All reviews are done for today."));
      if(done)logMinutes(Math.max(1,Math.round(done*0.4)),"cards");
      const extra=newCards(5);
      panel.append(h("div",{class:"row"},extra.length&&newAllowance(0,learnCount(),p.minutes)>0?h("button",{class:"btn",onclick:()=>{queue=extra;i=0;done=0;draw()}},"Learn 5 more"):null,h("button",{class:"btn",onclick:()=>go("today")},"Back to today")));
      if(learnCount()>=25)panel.append(h("p",{class:"note"},`You have ${learnCount()} cards still in the learning stage, so new cards are limited until they settle.`));
      return;
    }
    const c=queue[i],st=S.cards[c.id],isNew=!st,prod=prodMode(c);
    panel.append(h("div",{class:"row"},h("span",{class:"eyebrow"},`Card ${i+1} of ${queue.length}`),h("span",{class:"tag "+(c.track==="it"?"it":"gen")},c.track==="it"?"IT & Business":"General"),h("span",{class:"tag"},c.cat),h("span",{class:"tag"},c.lvl),chip(cardStatus(st))),
      h("div",{class:"progressbar"},h("i",{style:`width:${i/queue.length*100}%`})));
    const card=h("div",{class:"card"});
    if(prod){
      card.append(h("div",{class:"eyebrow"},"Say or type the English"),h("div",{class:"def"},c.hu||c.def),h("div",{class:"muted"},c.def),h("div",{class:"ex"},"“"+blankOut(c.ex,c.w)+"”"));
      if(!shown){const inp=h("input",{type:"text",id:"prodIn",placeholder:"English expression",autocomplete:"off"});card.append(inp);setTimeout(()=>inp.focus(),0);
        inp.addEventListener("keydown",e=>{if(e.key==="Enter"){typed=checkTyped(inp.value,c.w);shown=true;draw()}});}
    }else{
      card.append(h("div",{class:"word"},c.w),speakBtn(c.w));
    }
    if(shown){
      if(prod)card.append(h("div",{class:"word"},c.w),typed?h("p",{class:typed==="exact"||typed==="close"?"good-t":"bad-t"},typed==="exact"?"Correct.":typed==="close"?"Almost: check the spelling.":typed==="empty"?"Recalled in your head? Rate honestly.":"Not this time."):null);
      else card.append(c.hu?h("div",{class:"def"},h("b",{},c.hu)):null,h("div",{class:"def"},c.def));
      card.append(h("div",{class:"ex"},"“"+c.ex+"”"),speakBtn(c.ex,"listen to the sentence"));
      const extra=[c.syn?"Similar: "+c.syn:null,c.ant?"Opposite: "+c.ant:null].filter(Boolean).join(" · ");
      if(extra)card.append(h("div",{class:"small muted"},extra));
      if(c.note)card.append(h("div",{class:"small warn-t"},c.note));
    }
    panel.append(card);
    if(!shown)panel.append(h("button",{class:"btn primary",onclick:()=>{if(prod){const inp=$("#prodIn");typed=checkTyped(inp&&inp.value,c.w)}shown=true;draw()}},prod?"Check":"Show meaning"),h("p",{class:"muted small"},prod?"Production practice: recall the English yourself before you look.":"Say the meaning out loud first, or make your own sentence with it."));
    else{
      const names=["Again","Hard","Good","Easy"],cls=["again","","","easy"];
      panel.append(h("div",{class:"rate"},names.map((n,k)=>h("button",{class:"btn "+cls[k],onclick:()=>{
        const before=S.cards[c.id];S.cards[c.id]=rateCard(before,k,today());
        if(before){const d=today();const r=S.revStats[d]||(S.revStats[d]={n:0,ok:0});r.n++;if(k>0)r.ok++}
        if(k===0)queue.push(c);i++;done++;shown=false;typed=null;save();draw()}},n,h("small",{},nextLabel(st,k))))));
    }
  }
  draw();
  m.append(deckPanel(),addCardPanel());
},
quiz(m){
  const L=cIdx(),d=today();
  const tg=targetedItems(S,GRAMMAR,d,4,L).items;
  const rest=shuffle(GRAMMAR.filter(q=>!tg.includes(q)&&Math.abs(lvlIdx(q.lvl)-L)<=1)).slice(0,8-tg.length);
  const qs=shuffle(tg.concat(rest).concat(vocabQuestions(2)));
  const panel=h("div",{class:"panel"});m.append(panel);
  runMCQ(panel,qs,"quiz","Quiz",score=>{logMinutes(5,"quiz");S.tests.push({d,kind:"quiz",score,of:qs.length});save();
    panel.append(h("div",{class:"eyebrow"},"Quiz result"),h("div",{class:"score"},`${score} / ${qs.length}`),h("p",{class:"muted"},tg.length?`${tg.length} questions targeted your weak spots. Wrong answers went to your mistake list.`:"Wrong answers went to your mistake list."),h("div",{class:"row"},h("button",{class:"btn primary",onclick:()=>go("quiz")},"New quiz"),h("button",{class:"btn",onclick:()=>go("weak")},"See weak spots")))});
},
weak(m){
  const d=today(),prof=weaknessProfile(S,d);
  const open=S.mistakes.filter(x=>!isMastered(x));
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Weak spots"),h("h1",{},prof.length?"Your mistake profile":"No data yet"),
    h("p",{class:"muted small"},"Built from quizzes, practice, writing and speaking feedback over the last 4 weeks. A mistake only counts as fixed after you get 3 different questions on it right, on at least 2 different days."),
    prof.length?h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Area"),h("th",{},"Status"),h("th",{},"Accuracy, 4 wks"),h("th",{},"Errors, 4 wks"),h("th",{},"Open"))),h("tbody",{},prof.map(c=>h("tr",{},h("td",{},c.cat),h("td",{},chip(c.status,STATUS_CLASS[c.status])),h("td",{class:"num"},pct(c.acc)+(c.accPrev!=null?` (was ${pct(c.accPrev)})`:"")),h("td",{class:"num"},c.err28),h("td",{class:"num"},c.open)))))):h("p",{class:"muted"},"Take a quiz or get writing feedback, and your weak spots will appear here."),
    h("div",{class:"row"},h("button",{class:"btn primary",disabled:!open.length,onclick:()=>go("practice")},"Practise my weak spots"),open.length?h("span",{class:"small muted"},`${open.length} open mistakes`):null)));
  const byCat={};open.forEach(x=>(byCat[x.cat]=byCat[x.cat]||[]).push(x));
  for(const c of prof.filter(c=>byCat[c.cat])){
    m.append(h("details",{class:"panel"},h("summary",{},h("b",{},c.cat)," · "+byCat[c.cat].length+" open"),byCat[c.cat].slice(0,30).map(x=>h("div",{class:"corr"},
      h("div",{},x.src==="quiz"||x.src==="practice"?h("span",{},x.q+" "):null,h("del",{},x.yours)," → ",h("ins",{},x.correct)),
      h("div",{class:"row"},h("span",{class:"small muted",style:"flex:1"},[x.note,x.src,x.d,`${(x.uses||[]).length}/3 correct uses`].filter(Boolean).join(" · ")),h("button",{class:"btn ghost",onclick:()=>{S.mistakes=S.mistakes.filter(y=>y!==x);save();render()}},"Not a mistake"))))));
  }
  const fixed=S.mistakes.filter(isMastered).length;if(fixed)m.append(h("p",{class:"muted small"},fixed+" mistakes fixed so far."));
},
practice(m){
  const d=today(),tg=targetedItems(S,GRAMMAR.concat(S.genItems),d,8,cIdx());
  const panel=h("div",{class:"panel"});m.append(panel);
  const gen=async()=>{
    if(!sample){toast(STANDALONE?"Fresh questions need Claude. Use the Claude version (link in Profile).":"Claude is not available in this view.");return}
    const cats=(tg.cats.length?tg.cats:weaknessProfile(S,d).slice(0,2).map(c=>c.cat)).slice(0,2);
    panel.innerHTML="";panel.append(h("p",{class:"thinking"},"Claude is writing fresh questions on "+cats.join(" and ")+"…"));
    try{
      const ex=S.mistakes.filter(x=>cats.includes(x.cat)&&!isMastered(x)).slice(0,6).map(x=>`- wrote "${x.yours}" instead of "${x.correct}"`).join("\n");
      const r=await sample.json(`Write 8 multiple-choice English practice questions for a Hungarian learner at CEFR ${contentLevel()}, targeting these error categories: ${cats.join(", ")}.
Recent mistakes by this learner:\n${ex||"(none recorded)"}
Use new, natural, contemporary sentences in varied contexts (IT support, databases, networking, business, gaming, sport, travel, daily life). Each question has one gap shown as ___ and exactly 4 options with exactly one correct answer. Do not reuse the learner's sentences.
Return ONLY a JSON array of {"q":"sentence with ___","o":["","","",""],"a":index of correct option 0-3,"cat":"one of: ${cats.join(", ")}","n":"one-line explanation"}.`,{modelTier:"default"});
      const ok=(Array.isArray(r)?r:[]).filter(validItem).map(x=>({id:"gen-"+hashStr(x.q),q:x.q.trim(),o:x.o.map(s=>s.trim()),a:x.a,cat:normalizeCat(x.cat),n:String(x.n||""),lvl:contentLevel(),gen:true}));
      if(!ok.length)throw{code:"invalid"};
      S.genItems=ok.concat(S.genItems).slice(0,120);save();start(ok);
    }catch(e){panel.innerHTML="";panel.append(h("p",{class:"bad-t"},claudeErr(e)),h("button",{class:"btn",onclick:()=>go("weak")},"Back"))}
  };
  function start(items){runMCQ(panel,items,"practice","Weak-spot practice",score=>{logMinutes(6,"weak");panel.append(h("div",{class:"score"},`${score} / ${items.length}`),h("p",{class:"muted"},"Correct answers count toward fixing your open mistakes. Come back on another day to complete them."),h("div",{class:"row"},h("button",{class:"btn primary",onclick:()=>go("weak")},"See weak spots"),sample?h("button",{class:"btn",onclick:gen},"More fresh questions (Claude)"):null))})}
  if(tg.items.length>=4)start(tg.items);
  else{panel.append(h("h2",{},"You've used up the built-in questions for now"),h("p",{class:"muted"},tg.items.length?`Only ${tg.items.length} unused questions left in your weak areas.`:"Every built-in question in your weak areas was answered correctly in the last 3 days."),h("div",{class:"row"},sample?h("button",{class:"btn primary",onclick:gen},"Generate fresh questions with Claude"):needsClaude("Fresh questions"),tg.items.length?h("button",{class:"btn",onclick:()=>start(tg.items)},"Do the "+tg.items.length+" left"):null))}
},
assess(m){
  const o=overall(),d=today();
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Assessment"),h("h1",{},o?`Estimated overall level: ${o.level}`:"Find your level, skill by skill"),
    o?h("p",{},`Based on ${o.tested} of 5 skills.`+(o.provisional?" Provisional until at least 3 skills are tested.":"")+(o.spread?` Your skills differ a lot (from ${o.low} to ${o.high}), so practise the lowest one most.`:"")):null,
    h("p",{class:"muted small"},"These are estimates against CEFR descriptors, not an official certificate. Your level only changes when you take an assessment, never from streaks, minutes or word counts. Re-test every 4 weeks; the next test uses the other question set.")));
  const grid=h("div",{class:"grid2"});m.append(grid);
  const meta={grammar:["20 multiple-choice questions, A2 to C1","~10 min",null,()=>runGrammarTest(m)],reading:["4 short texts, 12 questions","~12 min",null,()=>runReadingTest(m)],listening:["4 short recordings (generated audio), 12 questions","~10 min","tts",()=>runListeningTest(m)],writing:["One task, rated by Claude on CEFR writing descriptors","~20 min","claude",()=>runWritingTest(m)],speaking:["3 questions answered by voice (or typing), rated from the transcript","~8 min","claude",()=>runSpeakingTest(m)]};
  for(const[k,label]of SKILLS){
    const last=S.skills[k],[desc,time,need,fn]=meta[k];
    const due=last&&daysBetween(last.d,d)>=28;
    const prev=S.assess.filter(a=>a.skill===k).slice(-2);
    grid.append(h("div",{class:"panel"},h("div",{class:"row"},h("h3",{style:"flex:1"},label),last?h("span",{class:"pill lvl"},last.level):chip("not tested")),
      h("p",{class:"small muted"},desc+(time?" · "+time:"")),
      last?h("p",{class:"small"},`Last: ${last.d}`+(last.conf?` · confidence ${last.conf}`:"")+(prev.length===2?` · before: ${prev[0].level}`:"")+(last.note?` · ${last.note}`:"")):null,
      fn?h("button",{class:"btn "+(due||!last?"primary":""),disabled:(need==="claude"&&!sample)||(need==="tts"&&!tts),onclick:fn},last?(due?"Re-test now (new questions)":"Re-test"):"Start"):null,
      need==="claude"&&!sample?h("p",{},needsClaude("This test")):null,
      need==="tts"&&!tts?h("p",{class:"small muted"},"Needs audio (Chrome, Edge or the Claude desktop app)."):null));
  }
  const hist=S.assess.slice().reverse().slice(0,15);
  if(hist.length)m.append(h("div",{class:"panel"},h("h3",{},"History"),h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Date"),h("th",{},"Skill"),h("th",{},"Set"),h("th",{},"Result"),h("th",{},"Estimate"))),h("tbody",{},hist.map(a=>h("tr",{},h("td",{class:"num"},a.d),h("td",{},a.skill),h("td",{},a.set||"–"),h("td",{class:"num"},a.of?a.score+"/"+a.of:"rated"),h("td",{},a.level))))))));
},
write(m){VIEWS_WRITE(m)},
speak(m){VIEWS_SPEAK(m)},
progress(m){
  const d=today(),o=overall();
  const words=Object.values(S.cards).filter(c=>c.reps>0).length,mastered=Object.values(S.cards).filter(c=>cardStatus(c)==="mastered").length,due=dueQueue(S.cards,allCards(),d,P().minutes).total;
  const ev28=S.events.filter(e=>e.d>=addDays(d,-27)&&e.src!=="assessment"),acc=ev28.length?ev28.filter(e=>e.ok).length/ev28.length:null;
  const fixed28=S.mistakes.filter(x=>x.fixedAt&&x.fixedAt>=addDays(d,-27)&&!x.manual).length;
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Am I getting better?"),h("h1",{},o?`Estimated ${o.level} overall`:"Not assessed yet"),
    h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Skill"),h("th",{},"Estimate"),h("th",{},"Previous"),h("th",{},"Date"))),h("tbody",{},SKILLS.map(([k,l])=>{const a=S.assess.filter(x=>x.skill===k);const last=a[a.length-1],prev=a[a.length-2];return h("tr",{},h("td",{},l),h("td",{},last?last.level:"–"),h("td",{},prev?prev.level:"–"),h("td",{class:"num"},last?last.d:"–"))})))),
    h("h3",{},"Learning outcomes, last 4 weeks"),
    h("div",{class:"stats"},stat(pct(retention(S.revStats,d,28)),"card recall","reviews you remembered"),stat(pct(acc),"question accuracy","quiz and practice"),stat(mastered,"words mastered","interval 21+ days"),stat(fixed28,"mistakes fixed","3 correct uses each")),
    h("p",{class:"note"},"Outcomes measure what you can do. The numbers below only measure effort.")));
  const days=[];for(let k=13;k>=0;k--){const x=addDays(d,-k);days.push([x,S.activity[x]||0])}
  const max=Math.max(30,...days.map(x=>x[1]));
  m.append(h("div",{class:"panel"},h("h3",{},"Activity"),h("div",{class:"stats"},stat(daysThisWeek(S.activity,d)+"/7","days practised this week"),stat(words,"words started"),stat(due,"cards due"),stat(S.writings.length,"texts written"),stat(S.talks.length,"roleplays")),
    h("p",{class:"small muted"},"Minutes per day, last 14 days (estimated from activities)"),
    h("div",{class:"bars"},days.map(([x,v])=>h("div",{class:v?"":"zero",style:`height:${v/max*100}%`,title:x+": "+v+" min"}))),
    h("div",{class:"barlabels"},days.map(([x],k)=>h("span",{},k%2?"":x.slice(8))))));
  m.append(h("div",{class:"panel"},h("h3",{},"More analytics are coming"),h("p",{class:"small muted"},"Writing and listening trends, speaking history and a 4-week comparison arrive with the next updates.")));
},
profile(m){
  const p=P();
  const goals=["Job interviews","University courses","Reading tech docs","Speaking confidently","Business emails","Customer support","Presentations","Travel","Films and series without subtitles"];
  const ints=["Software and AI","IT support and networking","Databases","Cybersecurity","Business and investing","Gaming (GTA 6)","Sport","Travel","Film and series","Music"];
  const f=h("form",{class:"panel",onsubmit:e=>{e.preventDefault();const fd=new FormData(f);S.profile={name:fd.get("name")||"Paulik",level:fd.get("level"),minutes:+fd.get("minutes"),goals:fd.getAll("goals"),interests:fd.getAll("interests"),balance:+fd.get("balance")};save();toast("Profile saved");go(overall()?"today":"assess")}},
    h("div",{class:"eyebrow"},"Profile"),h("h2",{},S.profile?"Your learning profile":"Set up your profile"),h("p",{class:"muted small"},"These answers shape your word list, prompts and daily plan."),
    h("label",{class:"f"},"Name",h("input",{type:"text",id:"pname",name:"name",value:p.name})),
    h("label",{class:"f"},"Your own level guess (used only until you take the assessments)",h("select",{id:"plevel",name:"level"},[["A2","A2 · simple everyday English"],["B1","B1 · most daily situations"],["B2","B2 · technical and abstract topics"],["C1","C1 · fluent and precise"]].map(([v,l])=>h("option",{value:v,selected:p.level===v},l)))),
    h("label",{class:"f"},"Minutes per day",h("select",{id:"pmin",name:"minutes"},[15,30,45,60].map(v=>h("option",{value:v,selected:p.minutes===v},v+" minutes")))),
    h("fieldset",{class:"fs"},h("legend",{},"Main goals"),h("div",{class:"chips"},goals.map(g=>h("label",{},h("input",{type:"checkbox",name:"goals",value:g,checked:p.goals.includes(g)}),g)))),
    h("fieldset",{class:"fs"},h("legend",{},"Interests (topics for texts, roleplays and generated words)"),h("div",{class:"chips"},ints.map(g=>h("label",{},h("input",{type:"checkbox",name:"interests",value:g,checked:p.interests.includes(g)}),g)))),
    h("label",{class:"f"},"Balance: General ← → IT and Business",h("input",{type:"range",id:"pbal",name:"balance",min:0,max:100,step:10,value:p.balance})),
    h("div",{class:"row"},h("button",{class:"btn primary",type:"submit"},"Save profile")));
  m.append(f,h("div",{class:"panel"},h("h3",{},"Where your progress is saved"),h("p",{class:"muted small"},storeMode==="db"?"In your Claude account, so it follows you between phone and laptop. Only you can see it. A copy is also kept in this browser.":STANDALONE?"On this device only. The installed app has no account sync: use Export and Import below to move progress between your PC, your phone and the Claude version.":"In this browser only. Open the app while signed in to claude.ai to sync between devices."),
    STANDALONE?h("p",{class:"small"},h("a",{href:CLAUDE_URL,target:"_blank",rel:"noopener"},"Open the Claude version")," for writing and speaking feedback, roleplays, the writing and speaking tests and Claude-generated practice."):null),
    backupPanel());
}
};
/* ---------- export / import of progress ---------- */
function exportText(){return JSON.stringify({app:"english-gym",format:1,exported:new Date().toISOString(),state:S})}
function parseImport(txt){
  let o;try{o=JSON.parse(String(txt||"").trim())}catch(e){return{error:"That isn't a valid English Gym file (not JSON)."}}
  const st=o&&o.app==="english-gym"&&o.state?o.state:o;
  if(!st||typeof st!=="object"||Array.isArray(st)||!("cards" in st)||!("mistakes" in st))return{error:"That file doesn't look like English Gym progress."};
  if(st.v&&st.v>2)return{error:"This file comes from a newer version of English Gym. Update the app first."};
  try{return{state:migrate(st)}}catch(e){return{error:"The file couldn't be read: "+e.message}}
}
function stateSummary(x){return `${Object.keys(x.cards||{}).length} cards studied, ${(x.writings||[]).length} texts, ${(x.assess||[]).length} test results, ${Object.keys(x.activity||{}).length} active days`}
function backupPanel(){
  const out=h("div",{});
  const fname="english-gym-progress-"+today()+".json";
  async function doExport(){
    const data=exportText();
    if(downloads){try{await downloads.save({filename:fname,data});toast("Progress exported");return}catch(e){if(e&&e.code==="declined")return}}
    if(!window.claude||STANDALONE){try{const a=h("a",{href:URL.createObjectURL(new Blob([data],{type:"application/json"})),download:fname});document.body.append(a);a.click();a.remove();toast("Progress exported");return}catch(e){}}
    copyBox(data);
  }
  function copyBox(data){out.innerHTML="";const ta=h("textarea",{readonly:true,style:"min-height:90px"});ta.value=data;
    out.append(h("p",{class:"small muted"},"Download isn't available here. Copy this text and paste it into Import on your other device."),ta,
      h("div",{class:"row"},h("button",{class:"btn",onclick:async()=>{try{await navigator.clipboard.writeText(data);toast("Copied")}catch(e){ta.select();toast("Select all and copy")}}},"Copy")))}
  function confirmImport(st){out.innerHTML="";
    out.append(h("div",{class:"banner"},h("p",{},h("b",{},"Replace the progress on this device?")),
      h("p",{class:"small"},"File: "+stateSummary(st)+"."),h("p",{class:"small"},"Now: "+stateSummary(S)+"."),
      h("p",{class:"small muted"},"Your current progress is downloaded as a backup first, if this view allows downloads."),
      h("div",{class:"row"},h("button",{class:"btn primary",onclick:async()=>{try{await doExport()}catch(e){}S=st;if(!S.started)S.started=today();save();toast("Progress imported");render()}},"Replace"),h("button",{class:"btn",onclick:()=>{out.innerHTML=""}},"Cancel"))))}
  function tryImport(txt){const r=parseImport(txt);if(r.error){toast(r.error);return}confirmImport(r.state)}
  const file=h("input",{type:"file",accept:".json,application/json",style:"display:none",onchange:async e=>{const f=e.target.files&&e.target.files[0];if(f)tryImport(await f.text());e.target.value=""}});
  return h("div",{class:"panel"},h("h3",{},"Export and import progress"),
    h("p",{class:"muted small"},"Move your progress between the Claude version, the Windows app and the Android app. Export saves one file with everything; Import replaces this device's progress with that file."),
    h("div",{class:"row"},h("button",{class:"btn",onclick:doExport},"Export progress"),h("button",{class:"btn",onclick:()=>file.click()},"Import from file"),
      h("button",{class:"btn ghost",onclick:()=>{out.innerHTML="";const ta=h("textarea",{placeholder:"Paste exported progress here",style:"min-height:90px"});out.append(ta,h("div",{class:"row"},h("button",{class:"btn",onclick:()=>tryImport(ta.value)},"Import pasted text")))}},"Paste instead")),
    file,out);
}


/* ---------- vocabulary helpers ---------- */
function nextLabel(st,r){const s=rateCard(st,r,today());return s.interval+"d"}
function blankOut(ex,w){const re=new RegExp(w.split(/\s+/).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("\\s+")+"\\w*","i");return re.test(ex)?ex.replace(re,"_____"):ex}
function newCards(n){
  if(n<=0)return[];
  const L=cIdx(),bal=P().balance;
  const pool=allCards().filter(c=>!S.cards[c.id]&&lvlIdx(c.lvl)<=L+1);
  const score=c=>(c.custom?-2:0)+Math.abs(lvlIdx(c.lvl)-L)+(c.track==="it"?(bal>=50?0:1):(bal>=50?1:0))+(c.cat==="collocation"?-.3:0)+Math.random()*.9;
  return pool.map(c=>[score(c),c]).sort((a,b)=>a[0]-b[0]).slice(0,n).map(x=>x[1]);
}
function vocabQuestions(n){
  const L=cIdx(),pool=shuffle(allCards().filter(c=>S.cards[c.id]&&lvlIdx(c.lvl)<=L+1));
  const src=pool.length>=n?pool:shuffle(allCards().filter(c=>lvlIdx(c.lvl)<=L+1));
  return src.slice(0,n).map(c=>{
    const same=shuffle(allCards().filter(x=>x.id!==c.id&&x.cat===c.cat&&x.w!==c.w));
    const other=shuffle(allCards().filter(x=>x.id!==c.id&&x.cat!==c.cat));
    const wrong=same.concat(other).slice(0,3).map(x=>x.w);
    const o=shuffle([c.w,...wrong]);
    return{id:"v-"+c.id,q:`Which fits? “${blankOut(c.ex,c.w)}”`,o,a:o.indexOf(c.w),cat:"vocabulary",n:`${c.w}: ${c.def}${c.hu?" ("+c.hu+")":""}`,lvl:c.lvl};
  });
}
function hashStr(s){let x=0;for(let i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return(x>>>0).toString(36)}
function deckPanel(){
  const counts={new:0,learning:0,review:0,mastered:0};allCards().forEach(c=>counts[cardStatus(S.cards[c.id])]++);
  return h("details",{class:"panel"},h("summary",{},h("b",{},"Your deck")," · "+allCards().length+" items"),
    h("div",{class:"stats"},stat(counts.new,"new"),stat(counts.learning,"learning"),stat(counts.review,"in review"),stat(counts.mastered,"mastered")),
    h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Expression"),h("th",{},"Magyarul"),h("th",{},"Type"),h("th",{},"Level"),h("th",{},"Status"))),h("tbody",{},allCards().filter(c=>S.cards[c.id]).slice(0,200).map(c=>h("tr",{},h("td",{},c.w),h("td",{},c.hu||"–"),h("td",{},c.cat),h("td",{},c.lvl),h("td",{},cardStatus(S.cards[c.id]))))))));
}
function addCustom(w,cat,def,ex,track,hu){w=String(w||"").trim();if(!w||!def)return false;if(allCards().some(c=>c.w.toLowerCase()===w.toLowerCase()))return false;S.custom.push({id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),w,cat:cat||"word",def:String(def),ex:String(ex||""),hu:String(hu||""),track:track==="it"?"it":"gen",lvl:contentLevel(),custom:true});save();return true}
function addCardPanel(){
  const w=h("input",{type:"text",id:"nw",placeholder:"Word or phrase"}),hu=h("input",{type:"text",id:"nhu",placeholder:"Magyarul"}),d=h("input",{type:"text",id:"nd",placeholder:"English definition"}),e=h("input",{type:"text",id:"ne",placeholder:"Example sentence"});
  const tr=h("select",{id:"nt"},h("option",{value:"gen"},"General"),h("option",{value:"it"},"IT & Business"));
  const gen=h("button",{class:"btn",disabled:!sample,onclick:async()=>{
    gen.disabled=true;gen.textContent="Generating…";
    try{const p=P();const known=allCards().map(c=>c.w).join(", ");
      const r=await sample.json(`Create 10 English vocabulary items for a CEFR ${contentLevel()} learner: a 23-year-old Hungarian Business IT student. Interests: ${p.interests.join(", ")}. Goals: ${p.goals.join(", ")}. About ${p.balance}% IT and Business, the rest general English. Prefer collocations, phrasal verbs and useful expressions over single rare words. Avoid: ${known}.
Return ONLY a JSON array of {"w":"expression","cat":"word|phrasal verb|collocation|expression|idiom|IT term|business term","hu":"accurate Hungarian meaning (not a literal word-for-word translation)","def":"simple English definition","ex":"natural, contemporary example sentence containing the expression","track":"it or gen"}.`,{modelTier:"default"});
      let n=0;(Array.isArray(r)?r:[]).forEach(c=>{if(c&&typeof c.w==="string"&&typeof c.def==="string"&&typeof c.ex==="string"&&c.ex.toLowerCase().includes(c.w.toLowerCase().split(" ")[0])&&addCustom(c.w,c.cat,c.def,c.ex,c.track,c.hu))n++});
      toast(n?`Added ${n} new items.`:"Nothing usable came back. Try again.");if(n)go("cards");
    }catch(err){toast(claudeErr(err))}gen.disabled=false;gen.textContent="Generate 10 for me"}},"Generate 10 for me");
  return h("details",{class:"panel"},h("summary",{},h("b",{},"Add your own words")),h("p",{class:"muted small"},"Words from lectures, films or work stick best. "+S.custom.length+" of your own so far."),
    h("div",{class:"grid2"},w,hu),d,e,h("div",{class:"row"},tr,h("button",{class:"btn primary",onclick:()=>{if(!w.value.trim()||!d.value.trim()){toast("Add the expression and its definition.");return}if(addCustom(w.value,"word",d.value.trim(),e.value.trim(),tr.value,hu.value.trim())){w.value=d.value=e.value=hu.value="";toast("Card added")}else toast("That expression is already in your deck.")}},"Add card"),gen));
}

/* ---------- assessments ---------- */
function finishAssess(rec){S.assess.push(rec);S.skills[rec.skill]=rec;logMinutes(10,"assess");save();renderHeader()}
function runGrammarTest(m){
  const set=nextSet(S,"grammar"),items=ASSESS_GRAMMAR[set].map(q=>Object.assign({},q,{o:q.o}));
  m.innerHTML="";const panel=h("div",{class:"panel"});m.append(panel);
  let i=0;const ans=[];
  function draw(){
    panel.innerHTML="";
    if(i>=items.length){
      const r=bandLevel(items,ans,.6),sc=ans.filter(Boolean).length,d=today();
      items.forEach((q,k)=>recordEvent(S,q.cat,ans[k],"assessment","a-"+set+k,d));
      finishAssess({d,skill:"grammar",set,score:sc,of:items.length,level:r.level,conf:"medium",by:r.by});
      panel.append(h("div",{class:"eyebrow"},"Grammar & vocabulary · set "+set),h("div",{class:"score"},r.level),h("p",{},`${sc} of ${items.length} correct. `+LEVELS.map(L=>`${L} ${r.by[L].ok}/${r.by[L].n}`).join(" · ")),
        h("p",{class:"muted small"},"A level counts as reached when you get at least 3 of its 5 questions right and all easier levels are reached. This measures grammar and vocabulary only; speaking and writing are assessed separately."),
        h("button",{class:"btn primary",onclick:()=>go("assess")},"Back to assessments"));return}
    const q=items[i];
    panel.append(h("div",{class:"eyebrow"},`Grammar & vocabulary · ${i+1} of ${items.length}`),h("div",{class:"progressbar"},h("i",{style:`width:${i/items.length*100}%`})),h("h2",{},q.q),
      h("div",{class:"opts"},q.o.map((o,k)=>h("button",{class:"opt",onclick:()=>{ans[i]=k===q.a;i++;draw()}},o))),
      h("button",{class:"btn ghost",onclick:()=>{ans[i]=false;i++;draw()}},"I don't know"));
  }
  draw();
}
function runReadingTest(m){
  const set=nextSet(S,"reading"),texts=ASSESS_READING[set];
  const flat=[];texts.forEach(t=>t.qs.forEach(q=>flat.push(Object.assign({lvl:t.lvl},q))));
  m.innerHTML="";const panel=h("div",{class:"panel"});m.append(panel);
  let ti=0;const ans=[];
  function draw(){
    panel.innerHTML="";
    if(ti>=texts.length){
      const r=bandLevel(flat,ans,.6),sc=ans.filter(Boolean).length;
      finishAssess({d:today(),skill:"reading",set,score:sc,of:flat.length,level:r.level,conf:"medium",by:r.by});
      panel.append(h("div",{class:"eyebrow"},"Reading · set "+set),h("div",{class:"score"},r.level),h("p",{},`${sc} of ${flat.length} correct. `+LEVELS.map(L=>`${L} ${r.by[L].ok}/${r.by[L].n}`).join(" · ")),h("p",{class:"muted small"},"A level counts when you answer at least 2 of its 3 questions correctly and all easier texts are passed."),h("button",{class:"btn primary",onclick:()=>go("assess")},"Back to assessments"));return}
    const t=texts[ti],sel=[];
    panel.append(h("div",{class:"eyebrow"},`Reading · text ${ti+1} of ${texts.length}`),h("div",{class:"progressbar"},h("i",{style:`width:${ti/texts.length*100}%`})),h("h2",{},t.title),h("div",{class:"reading"},t.text));
    t.qs.forEach((q,qi)=>{const opts=h("div",{class:"opts"});q.o.forEach((o,k)=>opts.append(h("button",{class:"opt","aria-pressed":"false",onclick:()=>{sel[qi]=k;[...opts.children].forEach((b,j)=>{b.classList.toggle("sel",j===k);b.setAttribute("aria-pressed",String(j===k))})}},o)));panel.append(h("h3",{},(qi+1)+". "+q.q),opts)});
    panel.append(h("button",{class:"btn primary",onclick:()=>{if(sel.filter(x=>x!=null).length<t.qs.length){toast("Answer all three questions (guess if you need to).");return}t.qs.forEach((q,qi)=>ans.push(sel[qi]===q.a));ti++;draw()}},ti+1<texts.length?"Next text":"Finish"));
  }
  draw();
}
async function rateWithClaude(kind,task,text,extra){
  const desc=kind==="writing"?CEFR_WRITING:CEFR_SPEAKING;
  const r=await sample.json(`You are a strict, fair CEFR examiner. Rate this ${kind} sample by a Hungarian learner of English. Use these descriptors: ${desc}
Do not inflate: if evidence is mixed, choose the lower level. Do not reward unnecessarily complicated vocabulary. Judge only what is in the sample.${extra||""}
Task: ${task}
Sample:
"""${text}"""
Return ONLY JSON: {"level":"A1|A2|B1|B2|C1|C2","confidence":"low|medium|high","criteria":{"range":"one line","accuracy":"one line","coherence":"one line","task":"one line"},"strengths":["",""],"to_reach_next_level":["","",""],"mistakes":[{"original":"","corrected":"","category":"articles|prepositions|present perfect|past tenses|tenses (other)|question formation|word order|conditionals|passive|verb patterns|countables|subject-verb agreement|collocations|linkers|vocabulary|naturalness & register|spelling & punctuation"}]}`,{modelTier:"complex"});
  if(!validRating(r))throw{code:"invalid"};
  r.level=String(r.level).toUpperCase();return r;
}
function showRating(panel,skill,set,r,note){
  const d=today();
  (Array.isArray(r.mistakes)?r.mistakes:[]).slice(0,10).forEach(x=>{if(x&&x.original&&x.corrected)addMistake(S,{cat:x.category,src:skill,q:x.original,yours:x.original,correct:x.corrected,note:"from the "+skill+" assessment"},d)});
  const conf=["low","medium","high"].includes(r.confidence)?r.confidence:"low";
  finishAssess({d,skill,set,level:r.level,conf:note&&note.typed?"low":conf,note:note&&note.text});
  panel.innerHTML="";
  panel.append(h("div",{class:"eyebrow"},(skill==="writing"?"Writing":"Speaking")+" · set "+set),h("div",{class:"score"},r.level),h("p",{class:"small muted"},`Estimated by Claude against CEFR descriptors, confidence ${note&&note.typed?"low":conf}. Not a certificate.`+(note&&note.text?" "+note.text:"")));
  if(r.criteria&&typeof r.criteria==="object")panel.append(h("div",{class:"tablewrap"},h("table",{},h("tbody",{},Object.entries(r.criteria).map(([k,v])=>h("tr",{},h("th",{},k),h("td",{},String(v))))))));
  if(Array.isArray(r.strengths)&&r.strengths.length)panel.append(h("h3",{},"Strengths"),h("ul",{},r.strengths.map(s=>h("li",{},String(s)))));
  if(Array.isArray(r.to_reach_next_level)&&r.to_reach_next_level.length)panel.append(h("h3",{},"To reach the next level"),h("ul",{},r.to_reach_next_level.map(s=>h("li",{},String(s)))));
  panel.append(h("button",{class:"btn primary",onclick:()=>go("assess")},"Back to assessments"));
}
function runWritingTest(m){
  const set=nextSet(S,"writing"),task=ASSESS_WRITING[set].task;
  m.innerHTML="";const panel=h("div",{class:"panel"});m.append(panel);
  const ta=h("textarea",{id:"assessWrite",placeholder:"Write here. No dictionary, no translator: the result should reflect what you can do alone."});
  const wc=h("span",{class:"muted small"},"0 words");ta.addEventListener("input",()=>wc.textContent=words(ta.value)+" words");
  const b=h("button",{class:"btn primary",onclick:async()=>{
    if(words(ta.value)<80){toast("Write at least 80 words so there is enough to rate.");return}
    b.disabled=true;const th=h("p",{class:"thinking"},"Claude is rating your text. This can take up to a minute.");panel.append(th);
    try{const r=await rateWithClaude("writing",task,ta.value.trim());showRating(panel,"writing",set,r)}catch(e){th.remove();toast(claudeErr(e));b.disabled=false}
  }},"Submit for rating");
  panel.append(h("div",{class:"eyebrow"},"Writing assessment · set "+set),h("h2",{},"Your task"),h("p",{},task),h("p",{class:"small muted"},"Take about 20 minutes. Don't use a translator."),ta,h("div",{class:"row"},wc,h("span",{style:"flex:1"}),b));
}
function runSpeakingTest(m){
  const set=nextSet(S,"speaking"),qs=ASSESS_SPEAKING[set];
  m.innerHTML="";const panel=h("div",{class:"panel"});m.append(panel);
  let i=0;const answers=[],spoken=[];
  function draw(){
    panel.innerHTML="";
    if(i>=qs.length){
      const th=h("p",{class:"thinking"},"Claude is rating your answers…");panel.append(th);
      const typed=spoken.filter(Boolean).length<qs.length;
      rateWithClaude("speaking (transcribed)",qs.join(" / "),qs.map((q,k)=>`Q${k+1}: ${q}\nA${k+1}: ${answers[k]}`).join("\n\n"),` This is a speech-to-text transcript: ignore punctuation and capitalisation, and do not judge pronunciation, which cannot be heard.${typed?" Some answers were typed, not spoken.":""}`)
        .then(r=>showRating(panel,"speaking",set,r,{typed,text:typed?"Some answers were typed, so this says less about real speaking.":"Rated from a transcript: pronunciation is not assessed."}))
        .catch(e=>{th.remove();panel.append(h("p",{class:"bad-t"},claudeErr(e)),h("button",{class:"btn",onclick:()=>{i=qs.length;draw()}},"Try the rating again"))});
      return}
    const ta=h("textarea",{id:"spk"+i,style:"min-height:120px",placeholder:dict?"Press Speak and answer out loud. Your words appear here.":"Speech input isn't available here, so type what you would say."});
    if(answers[i])ta.value=answers[i];
    const mic=dict?h("button",{class:"btn primary",type:"button",onclick:()=>{spoken[i]=true;dictateInto(ta,mic,"Speak")}},"Speak"):null;
    panel.append(h("div",{class:"eyebrow"},`Speaking assessment · set ${set} · ${i+1} of ${qs.length}`),h("h2",{},qs[i]),speakBtn(qs[i],"listen to the question"),h("p",{class:"small muted"},"Answer for 45 to 90 seconds. Don't prepare notes; speak as you would in a conversation."),ta,
      h("div",{class:"row"},mic,h("span",{style:"flex:1"}),h("button",{class:"btn",onclick:()=>{if(words(ta.value)<15){toast("Say a bit more: at least 15 words.");return}answers[i]=ta.value.trim();i++;draw()}},i+1<qs.length?"Next question":"Finish")));
  }
  draw();
}
const words=t=>String(t||"").trim().split(/\s+/).filter(Boolean).length;

/* ---------- dictation ---------- */
let dictUnsubs=[];
function dictHandlers(hs){dictUnsubs.forEach(u=>{try{u()}catch(e){}});dictUnsubs=[];if(!dict)return;if(hs.partial)dictUnsubs.push(dict.onPartial(hs.partial));if(hs.final)dictUnsubs.push(dict.onFinal(hs.final));if(hs.state)dictUnsubs.push(dict.onState(hs.state))}
async function dictateInto(ta,btn,label){
  label=label||"Dictate";
  if(!dict)return;
  if(btn.dataset.on){btn.textContent=label;delete btn.dataset.on;try{await dict.stop()}catch(e){}return}
  const base=ta.value;let acc="";
  dictHandlers({partial:({text})=>{ta.value=(base?base+" ":"")+acc+text},final:({text})=>{acc+=text+" ";ta.value=(base?base+" ":"")+acc;ta.dispatchEvent(new Event("input"))},state:({state})=>{if(state==="idle"){btn.textContent=label;delete btn.dataset.on}}});
  btn.dataset.on="1";btn.textContent="Stop";
  dict.start().catch(e=>{btn.textContent=label;delete btn.dataset.on;toast(e&&e.code==="not_granted"?"Microphone is off for this page. Type instead.":"Speech input isn't available. Type instead.")});
}
