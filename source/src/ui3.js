/* ---------- audio playback (Claude text-to-speech, labelled as generated) ---------- */
let ttsRate=1;
function playScript(item,onState){
  if(!tts)return Promise.reject({code:"unavailable"});window.EG_VARIETY=item.variety;
  const lines=item.lines.map(([sp,text])=>({text,voice:(item.speakers&&item.speakers[sp])||"buttery",language:"en",rate:ttsRate}));
  onState&&onState("playing");
  return tts.speak(lines).then(()=>onState&&onState("done")).catch(e=>{onState&&onState("stopped");throw e});
}
function stopAudio(){try{tts&&tts.stop()}catch(e){}}
const GEN_LABEL=window.EG_STANDALONE?"Generated audio: your device's built-in voice reading a script written for this exercise. Not a real recording. The app picks a British or American system voice when your device has one.":"Generated audio: a Claude voice reading a script written for this exercise. Not a real recording, and the voices are not regional accents.";
function audioUnavailable(){return h("div",{class:"banner"},h("p",{},h("b",{},"Audio isn't available in this browser."),h("br"),h("span",{class:"small muted"},(window.EG_STANDALONE?"This device has no English text-to-speech voice. On Android, install Speech Services by Google; on Windows, add an English voice in Settings > Time & language > Speech.":"Text-to-speech works in Chrome, Edge and the Claude desktop app, not in Safari or the Claude mobile apps. Listening practice needs real audio, so it can't run here. Try the real recordings below instead."))))}
function realAudioPanel(){return h("div",{class:"panel"},h("h3",{},"Real recordings with real accents"),h("p",{class:"small muted"},"Generated voices can't replace real speakers. Use these free sources for accent variety; they open in a new tab."),h("ul",{},REAL_AUDIO.map(([t,u,d])=>h("li",{},h("a",{href:u,target:"_blank",rel:"noopener"},t)," · "+d))))}

/* ---------- listening ---------- */
VIEWS.listen=function(m){
  const L=cIdx(),items=LISTENING.concat(S.listenGen||[]);
  const acc=S.listening.slice(0,10);
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Listening"),h("h1",{},"Listen first, read later"),
    h("p",{class:"muted small"},"Each exercise: listen without the text, answer the questions, then check the transcript and key vocabulary. "+GEN_LABEL),
    acc.length?h("p",{class:"small"},`Recent accuracy: ${pct(acc.reduce((a,x)=>a+x.score/x.of,0)/acc.length)} over ${acc.length} exercises.`):null));
  if(!tts)m.append(audioUnavailable());
  const list=h("div",{class:"scen"});
  items.slice().sort((a,b)=>Math.abs(lvlIdx(a.lvl)-L)-Math.abs(lvlIdx(b.lvl)-L)).forEach(x=>{
    const done=S.listening.filter(r=>r.id===x.id);
    list.append(h("button",{disabled:!tts,onclick:()=>runListening(m,x)},h("span",{class:"row",style:"gap:6px"},h("span",{class:"tag"},x.lvl),h("span",{class:"tag"},x.variety==="UK"?"British English":"American English"),x.gen?h("span",{class:"tag"},"Claude script"):null),h("b",{},x.title),done.length?h("span",{class:"small muted"},`done ${done.length}×, best ${Math.max(...done.map(r=>r.score))}/${done[0].of}`):h("span",{class:"small muted"},Object.keys(x.speakers).length>1?"Dialogue":"Monologue")));
  });
  const gen=h("button",{class:"btn",disabled:!sample||!tts,onclick:async()=>{
    gen.disabled=true;gen.textContent="Writing a new exercise…";
    try{const x=await generateListening();S.listenGen=[x].concat(S.listenGen||[]).slice(0,30);save();runListening(m,x)}catch(e){toast(claudeErr(e));gen.disabled=false;gen.textContent="New exercise on my interests (Claude)"}
  }},"New exercise on my interests (Claude)");
  m.append(h("div",{class:"panel"},h("h3",{},"Exercises"),list,h("div",{class:"row"},gen,h("span",{class:"small muted"},"Claude writes the script and questions; the audio is then generated."))),realAudioPanel());
};
async function generateListening(){
  const p=P(),lvl=contentLevel(),variety=Math.random()<.5?"UK":"US";
  const topic=shuffle(p.interests)[0]||"technology";
  const r=await sample.json(`Write a realistic listening exercise for a CEFR ${lvl} learner (Hungarian Business IT student). Topic area: ${topic}. Use consistent ${variety==="UK"?"British":"American"} English spelling and vocabulary. Make it natural, contemporary and specific, like real speech (fillers, reformulations), not a textbook. 180-300 words total, 1 to 3 speakers with first names.
Then 4 comprehension questions (gist, detail, inference, meaning of a phrase in context), 4 options each, exactly one correct.
Return ONLY JSON: {"title":"short title","lines":[{"speaker":"Name","text":"..."}],"qs":[{"q":"","o":["","","",""],"a":0}],"vocab":[["expression","Hungarian meaning"]]} with 3-5 vocab items taken from the script.`,{modelTier:"default"});
  const lines=(r&&Array.isArray(r.lines)?r.lines:[]).filter(l=>l&&typeof l.speaker==="string"&&typeof l.text==="string"&&l.text.trim()).map(l=>[l.speaker.trim().slice(0,20),l.text.trim().slice(0,1800)]);
  const names=[...new Set(lines.map(l=>l[0]))];const chars=lines.reduce((a,l)=>a+l[1].length,0);
  const qs=(Array.isArray(r&&r.qs)?r.qs:[]).filter(q=>q&&typeof q.q==="string"&&Array.isArray(q.o)&&q.o.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4);
  if(lines.length<1||names.length>3||chars<500||chars>2600||qs.length<3)throw{code:"invalid"};
  const speakers={};names.forEach((n,i)=>speakers[n]=VOICES[(i*2+1)%VOICES.length]);
  return{id:"lsg-"+hashStr(lines.map(l=>l[1]).join(" ")),gen:true,lvl,variety,track:"gen",title:String(r.title||"New exercise").slice(0,60),speakers,lines,qs:qs.slice(0,4),vocab:(Array.isArray(r.vocab)?r.vocab:[]).filter(v=>Array.isArray(v)&&v[0]).slice(0,5)};
}
function runListening(m,x){
  m.innerHTML="";const panel=h("div",{class:"panel"});m.append(panel);
  let plays=0,stage="listen";const sel=[];
  const status=h("span",{class:"small muted"},"Not played yet");
  const playB=h("button",{class:"btn primary",onclick:()=>{plays++;status.textContent="Playing… (play "+plays+")";playB.disabled=true;playScript(x).then(()=>{status.textContent=`Played ${plays}×`}).catch(()=>{status.textContent=plays?`Stopped (played ${plays}×)`:"Couldn't play"}).finally(()=>{playB.disabled=false})}},"Play");
  const speed=h("select",{id:"lspeed",onchange:()=>{ttsRate=+speed.value}},[["0.85","Slower"],["1","Normal"],["1.15","Faster"]].map(([v,l])=>h("option",{value:v,selected:String(ttsRate)===v},l)));
  function controls(){return h("div",{class:"row"},playB,h("button",{class:"btn",onclick:stopAudio},"Stop"),h("label",{class:"small row",style:"gap:6px"},"Speed",speed),status)}
  function draw(){
    panel.innerHTML="";
    panel.append(h("div",{class:"row"},h("button",{class:"btn ghost",onclick:()=>{stopAudio();go("listen")}},"← Exercises"),h("span",{class:"eyebrow"},`${x.lvl} · ${x.variety==="UK"?"British":"American"} English`)),h("h2",{},x.title),h("p",{class:"small muted"},GEN_LABEL));
    if(stage==="listen"){panel.append(controls(),h("p",{},"Listen once for the general idea. You can play it again while you answer."),h("button",{class:"btn",onclick:()=>{stage="questions";draw()}},"Show the questions"));return}
    if(stage==="questions"){
      panel.append(controls());
      x.qs.forEach((q,qi)=>{const opts=h("div",{class:"opts"});q.o.forEach((o,k)=>opts.append(h("button",{class:"opt"+(sel[qi]===k?" sel":""),"aria-pressed":String(sel[qi]===k),onclick:()=>{sel[qi]=k;[...opts.children].forEach((b,j)=>{b.classList.toggle("sel",j===k);b.setAttribute("aria-pressed",String(j===k))})}},o)));panel.append(h("h3",{},(qi+1)+". "+q.q),opts)});
      panel.append(h("button",{class:"btn primary",onclick:()=>{if(sel.filter(v=>v!=null).length<x.qs.length){toast("Answer every question (guess if you need to).");return}stopAudio();stage="review";
        const score=x.qs.filter((q,i)=>sel[i]===q.a).length;S.listening.unshift({d:today(),id:x.id,lvl:x.lvl,score,of:x.qs.length,plays});S.listening=S.listening.slice(0,200);logMinutes(8,"listen");draw()}},"Check answers"));return}
    const score=x.qs.filter((q,i)=>sel[i]===q.a).length;
    panel.append(h("div",{class:"row"},h("div",{class:"score"},`${score}/${x.qs.length}`),h("p",{class:"muted",style:"flex:1;min-width:200px"},`You played it ${plays}×. `+(plays>2?"Next time, try to answer after two plays.":"")+(score===x.qs.length?" Excellent.":"")))) ;
    x.qs.forEach((q,i)=>panel.append(h("p",{class:sel[i]===q.a?"good-t":"bad-t"},`${i+1}. ${q.q} `,h("b",{},q.o[q.a]),sel[i]===q.a?"":` (you chose: ${q.o[sel[i]]})`)));
    panel.append(h("h3",{},"Transcript"),h("div",{class:"reading"},x.lines.map(([sp,t])=>h("p",{style:"margin:0 0 8px"},Object.keys(x.speakers).length>1?h("b",{},sp+": "):null,t))),h("div",{class:"row"},playB,h("span",{class:"small muted"},"Listen again while reading. Then shadow one line out loud.")));
    if(x.vocab&&x.vocab.length)panel.append(h("h3",{},"Key vocabulary"),h("ul",{},x.vocab.map(([w,hu])=>h("li",{},h("b",{},w)," – "+(hu||"")))),h("button",{class:"btn",onclick:e=>{let n=0;x.vocab.forEach(([w,hu])=>{const line=x.lines.map(l=>l[1]).find(t=>t.toLowerCase().includes(String(w).toLowerCase().split(" ")[0]))||"";if(addCustom(w,"expression",hu||w,line,x.track,hu))n++});e.target.disabled=true;toast(n?`Added ${n} to flashcards`:"Already in your deck")}},"Add to my flashcards"));
    panel.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:()=>go("listen")},"More listening")));
  }
  draw();
}
function runListeningTest(m){
  const set=nextSet(S,"listening"),items=ASSESS_LISTENING[set];
  const flat=[];items.forEach(it=>it.qs.forEach(q=>flat.push(Object.assign({lvl:it.lvl},q))));
  m.innerHTML="";const panel=h("div",{class:"panel"});m.append(panel);
  let ii=0;const ans=[];
  function draw(){
    panel.innerHTML="";
    if(ii>=items.length){const r=bandLevel(flat,ans,.6),sc=ans.filter(Boolean).length;
      finishAssess({d:today(),skill:"listening",set,score:sc,of:flat.length,level:r.level,conf:"medium",by:r.by,note:"generated audio"});
      panel.append(h("div",{class:"eyebrow"},"Listening · set "+set),h("div",{class:"score"},r.level),h("p",{},`${sc} of ${flat.length} correct. `+LEVELS.map(L=>`${L} ${r.by[L].ok}/${r.by[L].n}`).join(" · ")),h("p",{class:"muted small"},"Based on generated audio with clear voices. Real conversations with accents and noise are harder, so treat this as an upper estimate."),h("button",{class:"btn primary",onclick:()=>go("assess")},"Back to assessments"));return}
    const it=items[ii],sel=[];let plays=0;
    const st=h("span",{class:"small muted"},"You can play each recording twice.");
    const pb=h("button",{class:"btn primary",onclick:()=>{if(plays>=2)return;plays++;pb.disabled=true;st.textContent=`Playing (${plays} of 2)…`;playScript(it).catch(()=>{}).finally(()=>{st.textContent=`Played ${plays} of 2`;pb.disabled=plays>=2})}},"Play");
    panel.append(h("div",{class:"eyebrow"},`Listening assessment · ${ii+1} of ${items.length}`),h("div",{class:"progressbar"},h("i",{style:`width:${ii/items.length*100}%`})),h("p",{class:"small muted"},GEN_LABEL),h("div",{class:"row"},pb,st));
    it.qs.forEach((q,qi)=>{const opts=h("div",{class:"opts"});q.o.forEach((o,k)=>opts.append(h("button",{class:"opt",onclick:()=>{sel[qi]=k;[...opts.children].forEach((b,j)=>b.classList.toggle("sel",j===k))}},o)));panel.append(h("h3",{},(qi+1)+". "+q.q),opts)});
    panel.append(h("button",{class:"btn",onclick:()=>{if(!plays){toast("Play the recording first.");return}if(sel.filter(v=>v!=null).length<it.qs.length){toast("Answer all three questions.");return}stopAudio();it.qs.forEach((q,qi)=>ans.push(sel[qi]===q.a));ii++;draw()}},ii+1<items.length?"Next recording":"Finish"));
  }
  draw();
}

/* ---------- pronunciation & shadowing ---------- */
VIEWS.pron=function(m){
  const foci=[...new Set(PRON.map(p=>p.focus))];
  let focus=null;try{focus=localStorage.getItem("eg-pfocus")}catch(e){}
  const done=new Set((S.pron||[]).filter(r=>r.d===today()).map(r=>r.id));
  const pool=PRON.filter(p=>!focus||p.focus===focus);
  let idx=Math.max(0,pool.findIndex(p=>!done.has(p.id)));
  const recent=(S.pron||[]).filter(r=>r.match!=null).slice(0,20);
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Pronunciation & shadowing"),h("h1",{},"Listen, repeat, compare"),
    h("p",{class:"small muted"},"Two kinds of feedback, kept apart. ",h("b",{},"Automated:")," speech recognition checks which words it understood. That measures intelligibility only; it cannot hear stress, rhythm or individual sounds. ",h("b",{},"Self-assessment:")," you judge stress, rhythm and sounds against the model."),
    recent.length?h("p",{class:"small"},`Words recognised, last ${recent.length} sentences: ${pct(recent.reduce((a,r)=>a+r.match,0)/recent.length)}`):null,
    h("div",{class:"chips"},[null].concat(foci).map(f=>h("label",{},h("input",{type:"radio",name:"pf",checked:(f||null)===(focus||null),onchange:()=>{try{f?localStorage.setItem("eg-pfocus",f):localStorage.removeItem("eg-pfocus")}catch(e){}render()}}),f||"all")))));
  if(!tts)m.append(h("p",{class:"small muted"},"No model audio in this browser: follow the stress marks and tips instead."));
  if(!dict)m.append(h("p",{class:"small muted"},"Speech recognition isn't available here (it works in Chrome, Edge and the Claude desktop app), so only self-assessment is possible."));
  const panel=h("div",{class:"panel"});m.append(panel);
  function draw(){
    const p=pool[idx%pool.length];panel.innerHTML="";
    let heard="",diff=null;const self={};
    const res=h("div",{"aria-live":"polite"});
    const rec=dict?h("button",{class:"btn primary",onclick:()=>{
      if(rec.dataset.on){rec.dataset.on="";rec.textContent="Record";dict.stop().catch(()=>{});return}
      heard="";res.innerHTML="";res.append(h("p",{class:"thinking"},"Listening… say the sentence, then press Stop."));
      dictHandlers({partial:({text})=>{res.firstChild&&(res.firstChild.textContent="Heard: "+heard+text)},final:({text})=>{heard+=text+" "},state:({state})=>{if(state==="idle"){rec.dataset.on="";rec.textContent="Record";if(heard.trim()){diff=wordDiff(p.s,heard);showDiff()}else{res.innerHTML="";res.append(h("p",{class:"small muted"},"Nothing was recognised. Try again a little closer to the microphone."))}}}});
      rec.dataset.on="1";rec.textContent="Stop";
      dict.start().catch(e=>{rec.dataset.on="";rec.textContent="Record";toast(e&&e.code==="not_granted"?"Microphone is off for this page.":"Speech recognition isn't available.")});
    }},"Record"):null;
    function showDiff(){
      res.innerHTML="";
      res.append(h("div",{class:"eyebrow"},"Automated · speech recognition match"),h("div",{class:"row"},h("div",{class:"score"},pct(diff.score)),h("p",{class:"small muted",style:"flex:1;min-width:200px"},`${diff.matched} of ${diff.total} words recognised. This shows how understandable you were to a machine, not how native you sound.`)),
        h("p",{class:"words"},diff.words.map(w=>h("span",{class:"w "+(w.ok?"ok":"miss")},w.w))),h("p",{class:"small muted"},"Heard: “"+heard.trim()+"”"));
      if(diff.missing.length&&sample)res.append(h("button",{class:"btn ghost",onclick:async e=>{e.target.disabled=true;try{const r=await sample(`A Hungarian learner of English said this sentence: "${p.s}". Speech recognition heard: "${heard.trim()}". These words were not recognised: ${diff.missing.join(", ")}. In 2-3 short bullet points, suggest the most likely pronunciation causes for a Hungarian speaker and one practical tip each. Be clear these are guesses based on the transcript, not on audio.`,{modelTier:"quick"});res.append(h("div",{class:"note"},h("b",{},"AI guess from the transcript (not from your audio): "),h("div",{style:"white-space:pre-wrap"},String(r.text||""))))}catch(err){toast(claudeErr(err))}}},"Why weren't those words recognised? (Claude's guess)"));
    }
    const selfRow=(k,l)=>h("div",{class:"row"},h("span",{style:"min-width:150px"},l),["felt right","not sure","difficult"].map(v=>h("label",{class:"small row",style:"gap:4px"},h("input",{type:"radio",name:"self-"+k,onchange:()=>{self[k]=v}}),v)));
    panel.append(h("div",{class:"row"},h("span",{class:"tag"},p.focus),h("span",{class:"eyebrow"},`${(idx%pool.length)+1} of ${pool.length}`)),
      h("h2",{class:"pron-s"},p.s),h("p",{class:"mono-mark"},p.mark),h("p",{class:"small muted"},p.tip),
      h("div",{class:"row"},tts?h("button",{class:"btn",onclick:()=>tts.speak(p.s,{language:"en",rate:1}).catch(()=>{})},"Listen"):null,tts?h("button",{class:"btn",onclick:()=>tts.speak(p.s,{language:"en",rate:.75}).catch(()=>{})},"Listen slowly"):null,rec),
      tts?h("p",{class:"small muted"},"Model audio is a generated Claude voice."):null,res,
      h("div",{class:"eyebrow",style:"margin-top:6px"},"Self-assessment"),selfRow("stress","Word & sentence stress"),selfRow("rhythm","Rhythm & linking"),selfRow("sounds","Difficult sounds"),
      h("div",{class:"row"},h("button",{class:"btn primary",onclick:()=>{S.pron=(S.pron||[]);S.pron.unshift({d:today(),id:p.id,focus:p.focus,match:diff?Math.round(diff.score*100)/100:null,self:Object.assign({},self)});S.pron=S.pron.slice(0,300);logMinutes(1,"pron");idx++;draw()}},"Save and next"),h("button",{class:"btn ghost",onclick:()=>{idx++;draw()}},"Skip")));
  }
  draw();
};

/* ---------- adaptive today ---------- */
VIEWS.today=function(m){
  const p=P(),d=today(),dow=new Date().getDay(),plan=planSession(S,d,p.minutes,dow),ms=S.missions[d]||{};
  const dn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dow];
  const mainMode=plan.main.mode,target={quiz:"quiz",write:"write",speak:"speak",weak:"weak",listen:"listen",assess:"assess"}[mainMode];
  const o=overall();
  m.append(h("div",{class:"panel"},
    h("div",{class:"eyebrow"},dn+" · about "+p.minutes+" minutes"+(o?" · estimated "+o.level:"")),
    h("h1",{},"Today's session"),
    h("ol",{class:"mission"},
      h("li",{},h("span",{class:"check"+(ms.cards?" on":"")}),h("div",{class:"t"},h("b",{},"1. Review"),h("div",{class:"muted small"},`${plan.review.due} cards due${plan.review.nNew?`, ${plan.review.nNew} new`:""}${plan.review.waiting?` · ${plan.review.waiting} can wait; no need to catch up at once`:""}`)),h("span",{class:"min"},"~"+plan.review.min+" min"),h("button",{class:"btn",onclick:()=>go("cards")},"Open")),
      h("li",{},h("span",{class:"check"+(ms[mainMode]?" on":"")}),h("div",{class:"t"},h("b",{},"2. "+MODE_LABEL[mainMode]),h("div",{class:"muted small"},plan.main.why.length?"Because "+plan.main.why.join(", and ")+".":"")),h("span",{class:"min"},"~"+plan.main.min+" min"),h("button",{class:"btn primary",onclick:()=>go(target)},"Start")),
      h("li",{},h("span",{class:"check"+(ms[plan.produce.mode]?" on":"")}),h("div",{class:"t"},h("b",{},"3. "+(plan.produce.mode==="pron"?"Shadow 3 sentences":"Speak for 60 seconds")),h("div",{class:"muted small"},plan.produce.mode==="pron"?"Listen, repeat out loud, compare":"Out loud, about a topic, using one new phrase")),h("span",{class:"min"},"~"+plan.produce.min+" min"),h("button",{class:"btn",onclick:()=>go(plan.produce.mode==="pron"?"pron":"speak")},"Open"))),
    h("p",{class:"note"},"The plan adapts to your weakest skill, recurring mistakes and what you did recently. Missed days don't create a backlog.")));
  const others=["quiz","write","speak","listen","weak"].filter(x=>x!==mainMode);
  m.append(h("div",{class:"panel"},h("h3",{},"Prefer something else today?"),h("div",{class:"row"},others.map(x=>h("button",{class:"btn",onclick:()=>go(x)},MODE_LABEL[x])),h("button",{class:"btn",onclick:()=>go("pron")},"Pronunciation"))));
};

/* ---------- outcome dashboard ---------- */
function sparkline(vals,max,fmt){
  const w=260,hgt=56,pad=6,n=vals.length;if(!n)return h("span",{class:"small muted"},"No data yet");
  const x=i=>n===1?w/2:pad+i*(w-2*pad)/(n-1),y=v=>hgt-pad-(v/max)*(hgt-2*pad);
  const pts=vals.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const svg=`<svg viewBox="0 0 ${w} ${hgt}" width="100%" height="${hgt}" role="img" aria-label="trend"><line x1="${pad}" x2="${w-pad}" y1="${y(max/2)}" y2="${y(max/2)}" stroke="var(--line)" stroke-dasharray="3 3"/><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${pts}"/><circle cx="${x(n-1)}" cy="${y(vals[n-1])}" r="4" fill="var(--accent)"/></svg>`;
  const wrap=h("div",{class:"spark"});wrap.innerHTML=svg;wrap.append(h("div",{class:"small muted"},`latest ${fmt(vals[n-1])} · first ${fmt(vals[0])} · ${n} entries`));return wrap;
}
VIEWS.progress=function(m){
  const d=today(),o=overall();
  const arrow=(a,b)=>a==null||b==null?"":lvlIdx(b)>lvlIdx(a)?" ↑":lvlIdx(b)<lvlIdx(a)?" ↓":" =";
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Am I actually getting better at English?"),h("h1",{},o?`Estimated ${o.level} overall`:"Not assessed yet"),
    o&&o.spread?h("p",{class:"small"},`Skills range from ${o.low} to ${o.high}. The lowest one gets extra practice in your daily plan.`):null,
    h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Skill"),h("th",{},"Now"),h("th",{},"Before"),h("th",{},"Tested"))),h("tbody",{},SKILLS.map(([k,l])=>{const a=S.assess.filter(x=>x.skill===k),last=a[a.length-1],prev=a[a.length-2];return h("tr",{},h("td",{},l),h("td",{},last?h("b",{},last.level+arrow(prev&&prev.level,last.level)):"–"),h("td",{},prev?prev.level:"–"),h("td",{class:"num"},last?last.d:"–"))})))),
    h("p",{class:"small muted"},"Levels change only through assessments. Estimates, not certification.")));
  const cmp=compare4w(S,d);const fmt=(v,k)=>v==null?"–":k==="pct"?pct(v):v.toFixed(1)+"/10";
  m.append(h("div",{class:"panel"},h("h3",{},"Learning outcomes: last 4 weeks vs the 4 weeks before"),h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Measure"),h("th",{},"Before"),h("th",{},"Last 4 weeks"),h("th",{},"Change"))),h("tbody",{},cmp.map(([l,a,b,k])=>h("tr",{},h("td",{},l),h("td",{class:"num"},fmt(a,k)),h("td",{class:"num"},fmt(b,k)),h("td",{class:"num "+(a!=null&&b!=null?(b>a?"good-t":b<a?"bad-t":""):"")},a!=null&&b!=null?(b>a?"better":b<a?"worse":"same"):"–")))))),
    h("div",{class:"stats"},stat(Object.values(S.cards).filter(c=>cardStatus(c)==="mastered").length,"words mastered","21+ day interval"),stat(dueQueue(S.cards,allCards(),d,P().minutes).total,"awaiting review"),stat(S.mistakes.filter(x=>x.fixedAt&&!x.manual).length,"mistakes fixed","proven 3 times"))));
  const ws=S.writings.slice(0,12).reverse().filter(w=>w.score!=null);
  const ls=(S.listening||[]).slice(0,12).reverse();
  m.append(h("div",{class:"grid2"},h("div",{class:"panel"},h("h3",{},"Writing score trend"),sparkline(ws.map(w=>w.score),10,v=>v+"/10")),h("div",{class:"panel"},h("h3",{},"Listening accuracy trend"),sparkline(ls.map(x=>x.score/x.of),1,v=>pct(v)))));
  const prof=weaknessProfile(S,d).filter(c=>c.err28>0).slice(0,5);
  m.append(h("div",{class:"panel"},h("h3",{},"Most frequent mistakes, last 4 weeks"),prof.length?h("div",{class:"tablewrap"},h("table",{},h("tbody",{},prof.map(c=>h("tr",{},h("td",{},c.cat),h("td",{class:"num"},c.err28+" errors"),h("td",{},chip(c.status,STATUS_CLASS[c.status]))))))):h("p",{class:"muted small"},"No mistakes recorded in the last 4 weeks."),h("button",{class:"btn ghost",onclick:()=>go("weak")},"Open weak spots")));
  const talks=S.talks.slice(0,8);
  m.append(h("div",{class:"panel"},h("h3",{},"Speaking practice history"),talks.length?h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Date"),h("th",{},"Scenario"),h("th",{},"Grammar"),h("th",{},"Vocab"),h("th",{},"Natural"),h("th",{},"Fluency"),h("th",{},"Mode"))),h("tbody",{},talks.map(t=>{const sc=SCENARIOS.find(s=>s.id===t.id);return h("tr",{},h("td",{class:"num"},t.d),h("td",{},sc?sc.title:t.id),h("td",{class:"num"},t.gr??t.ac??"–"),h("td",{class:"num"},t.vo??"–"),h("td",{class:"num"},t.na??"–"),h("td",{class:"num"},t.fl??"–"),h("td",{},t.voice?"spoken":"typed"))})))):h("p",{class:"muted small"},"No roleplays yet.")));
  const wk=weeklyMinutes(S.activity,d,4);
  m.append(h("div",{class:"panel"},h("h3",{},"Activity (effort, not progress)"),h("div",{class:"stats"},stat(daysThisWeek(S.activity,d)+"/7","days practised this week"),stat(wk[3],"minutes this week","estimated"),stat(wk.slice(0,3).join(" · "),"previous 3 weeks"),stat(S.writings.length+S.talks.length,"texts + roleplays"))));
};
