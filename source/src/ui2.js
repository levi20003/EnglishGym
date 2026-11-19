/* ---------- writing lab ---------- */
function VIEWS_WRITE(m){
  const L=cIdx();
  const prompts=PROMPTS.filter(p=>Math.abs(lvlIdx(p.lvl)-L)<=1);
  let cur=prompts[0];
  let draft=null;try{draft=JSON.parse(localStorage.getItem("eg-draft")||"null")}catch(e){}
  if(draft)cur=PROMPTS.find(p=>p.title===draft.title)||cur;
  const FREE={t:"gen",lvl:contentLevel(),title:"Free writing",task:"Write about anything you like: your day, an opinion, a project. Aim for 150+ words."};
  const task=h("p",{},cur.task);
  const sel=h("select",{id:"promptSel",onchange:()=>{cur=sel.value==="__free"?FREE:(prompts.find(p=>p.title===sel.value)||FREE);task.textContent=cur.task}},
    prompts.map(p=>h("option",{value:p.title,selected:p.title===cur.title},(p.t==="it"?"IT & Business · ":"General · ")+p.title+" ("+p.lvl+")")),h("option",{value:"__free"},"Free writing (your own topic)"));
  const ta=h("textarea",{id:"writeText",placeholder:"Write your text here…"});if(draft)ta.value=draft.text||"";
  const wc=h("span",{class:"muted small"},"0 words");
  const upd=()=>{wc.textContent=words(ta.value)+" words";try{localStorage.setItem("eg-draft",JSON.stringify({title:cur.title,text:ta.value}))}catch(e){}};
  ta.addEventListener("input",upd);upd();
  const out=h("div",{class:"fb","aria-live":"polite"});
  const btn=h("button",{class:"btn primary",onclick:async()=>{
    const text=ta.value.trim();if(words(text)<20){toast("Write at least 20 words first.");return}
    if(!sample){out.innerHTML="";if(STANDALONE)out.append(h("p",{},needsClaude("AI writing feedback")));out.append(selfCheck());return}
    btn.disabled=true;out.innerHTML="";out.append(h("p",{class:"thinking"},"Claude is reading your text. This takes 10 to 40 seconds."));
    try{
      const r=await sample.json(`You are a precise, encouraging English writing tutor. The learner is a 23-year-old Hungarian Business IT student, current estimated level ${contentLevel()}, aiming for B2/C1.
Task: "${cur.task}"
Text:
"""${text}"""
Evaluate on six criteria, each 1-10: grammar, vocabulary range, sentence structure, coherence, naturalness, task completion. The overall score (1-10) reflects the text against the task for a ${contentLevel()} learner. Do not reward unnecessarily complicated vocabulary; reward clarity and natural phrasing.
For every issue, say whether it is an ERROR (grammatically wrong) or UNNATURAL (correct but not how a fluent speaker would say it). Pay special attention to typical Hungarian-speaker problems: articles, prepositions, present perfect, question and word order.
Return ONLY JSON:
{"score":1-10,"criteria":{"grammar":1-10,"vocabulary":1-10,"structure":1-10,"coherence":1-10,"naturalness":1-10,"task":1-10},"summary":"2 sentences: main strength and the single most important thing to improve","issues":[{"original":"exact phrase from the text","better":"corrected or more natural phrase","kind":"error|unnatural","category":"articles|prepositions|present perfect|past tenses|tenses (other)|question formation|word order|conditionals|passive|verb patterns|countables|subject-verb agreement|collocations|linkers|vocabulary|naturalness & register|spelling & punctuation","why":"one short line"}],"corrected_version":"the learner's text with only the errors fixed, same words otherwise","natural_version":"how a fluent professional would write it, same ideas and similar length","expressions":[{"w":"reusable expression","hu":"Hungarian meaning","def":"meaning","ex":"example sentence"}]}
Up to 12 issues, most important first. Exactly 3 expressions.`,{modelTier:"default"});
      if(!r||typeof r.score!=="number")throw{code:"invalid"};
      showFeedback(r,text);
    }catch(e){out.innerHTML="";if(e&&e.code==="not_granted"){out.append(h("p",{class:"muted"},"Claude feedback is turned off for this page. Here is a self-check list instead."),selfCheck())}else out.append(h("p",{class:"bad-t"},claudeErr(e)))}
    btn.disabled=false;
  }},"Get feedback");
  function showFeedback(r,text){
    out.innerHTML="";const d=today();
    const issues=(Array.isArray(r.issues)?r.issues:[]).filter(x=>x&&x.original&&x.better);
    S.writings.unshift({d,title:cur.title,track:cur.t,words:words(text),score:Math.max(1,Math.min(10,Math.round(r.score))),criteria:r.criteria||null,errors:issues.filter(x=>x.kind==="error").length,unnatural:issues.filter(x=>x.kind!=="error").length,text:text.slice(0,2000)});S.writings=S.writings.slice(0,40);
    issues.filter(x=>x.kind==="error").forEach(x=>addMistake(S,{cat:x.category,src:"writing",q:x.original,yours:x.original,correct:x.better,note:x.why||""},d));
    logMinutes(15,"write");
    out.append(h("div",{class:"row"},h("div",{class:"score"},Math.round(r.score)+"/10"),h("p",{style:"flex:1;min-width:200px"},r.summary||"")));
    if(r.criteria&&typeof r.criteria==="object"){const names={grammar:"Grammar",vocabulary:"Vocabulary range",structure:"Sentence structure",coherence:"Coherence",naturalness:"Naturalness",task:"Task completion"};
      out.append(h("div",{class:"crit"},Object.entries(names).map(([k,l])=>{const v=Number(r.criteria[k]);return h("div",{},h("span",{},l),h("div",{class:"meter"},h("i",{style:`width:${(isFinite(v)?v:0)*10}%`})),h("b",{class:"num"},isFinite(v)?v:"–"))})))}
    const errs=issues.filter(x=>x.kind==="error"),unnat=issues.filter(x=>x.kind!=="error");
    if(errs.length){out.append(h("h3",{},`Errors (${errs.length})`),h("p",{class:"small muted"},"Grammatically wrong. These go to your weak spots."));errs.forEach(x=>out.append(corrBlock(x,"warn")))}
    if(unnat.length){out.append(h("h3",{},`Correct, but unnatural (${unnat.length})`),h("p",{class:"small muted"},"Not wrong, but a fluent speaker would say it differently."));unnat.forEach(x=>out.append(corrBlock(x,"accent")))}
    if(r.corrected_version)out.append(h("details",{},h("summary",{},"Your text with errors fixed"),h("p",{style:"white-space:pre-wrap"},r.corrected_version)));
    if(r.natural_version)out.append(h("h3",{},"How a fluent professional might write it"),h("p",{style:"white-space:pre-wrap"},r.natural_version),speakBtn(r.natural_version));
    const ex=(Array.isArray(r.expressions)?r.expressions:[]).filter(p=>p&&p.w&&p.def);
    if(ex.length){out.append(h("h3",{},"3 expressions to reuse"),h("div",{},ex.map(p=>h("p",{},h("b",{},p.w),p.hu?" ("+p.hu+")":""," – "+p.def+" ",h("i",{class:"muted"},p.ex||"")))),h("button",{class:"btn",onclick:e=>{let n=0;ex.forEach(p=>{if(addCustom(p.w,"expression",p.def,p.ex,cur.t,p.hu))n++});e.target.disabled=true;toast(n?`Added ${n} to flashcards`:"Already in your deck")}},"Add them to my flashcards"))}
    out.append(h("p",{class:"note"},"Rewrite the text once using the feedback. The second draft is where most of the learning happens."));
    try{localStorage.removeItem("eg-draft")}catch(e){}
  }
  const micBtn=dict?h("button",{class:"btn",type:"button",onclick:()=>dictateInto(ta,micBtn)},"Dictate"):null;
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Writing lab · level "+contentLevel()),h("label",{class:"f"},"Prompt",sel),task,ta,h("div",{class:"row"},wc,h("span",{style:"flex:1"}),micBtn,btn),out));
  if(S.writings.length)m.append(h("div",{class:"panel"},h("h3",{},"Your recent texts"),h("div",{class:"tablewrap"},h("table",{},h("thead",{},h("tr",{},h("th",{},"Date"),h("th",{},"Prompt"),h("th",{},"Words"),h("th",{},"Score"),h("th",{},"Errors"))),h("tbody",{},S.writings.slice(0,10).map(w=>h("tr",{},h("td",{class:"num"},w.d),h("td",{},w.title),h("td",{class:"num"},w.words),h("td",{class:"num"},w.score??"–"),h("td",{class:"num"},w.errors??"–"))))))));
}
function corrBlock(x,tone){return h("div",{class:"corr "+(tone||"")},h("div",{},h("del",{},x.original)," → ",h("ins",{},x.better||x.corrected)),h("div",{class:"small muted"},(x.category?"["+normalizeCat(x.category)+"] ":"")+(x.why||x.explanation||"")))}
function selfCheck(){return h("div",{class:"panel"},h("h3",{},"Self-check list"),h("ul",{},["Articles: does every singular countable noun have a / an / the?","Prepositions: in / on / at for time and place, depend on, interested in.","Tenses: past simple for finished time, present perfect for experience and unfinished time.","Linkers: did you use at least three (however, therefore, whereas, although)?","Register: in a formal email, no contractions and polite requests (Could you…?)."].map(t=>h("li",{},t))))}

/* ---------- speaking ---------- */
function roleplayDifficulty(id){
  const t=S.talks.filter(x=>x.fl!=null).slice(0,5);
  if(!t.length)return"standard";
  const avg=t.reduce((a,x)=>a+(x.fl+x.ac+x.vo)/3,0)/t.length;
  return avg>=7.5?"challenging":avg<5?"supportive":"standard";
}
function VIEWS_SPEAK(m){
  const diff=roleplayDifficulty();
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"Speaking roleplay · difficulty: "+diff),h("h2",{},"Pick a scenario"),
    h("p",{class:"muted small"},sample?(dict?"Speak with the Speak button or type. Claude plays the other person and adjusts to your recent results.":"Type your answers (voice input works in Chrome, Edge or the Claude desktop app). Claude plays the other person."):(STANDALONE?needsClaude("Roleplay"):"Claude roleplay is unavailable in this view. Use the 60-second drill below.")),
    ["it","gen"].map(tr=>h("div",{},h("h3",{style:"margin:10px 0 8px"},tr==="it"?"IT & Business":"General"),h("div",{class:"scen"},SCENARIOS.filter(s=>s.t===tr).map(s=>h("button",{disabled:!sample,onclick:()=>roleplay(m,s,diff)},h("b",{},s.title),h("span",{class:"muted small"},s.desc),S.talks.some(x=>x.id===s.id)?h("span",{class:"small muted"},"done "+S.talks.filter(x=>x.id===s.id).length+"×"):null)))))));
  let q=SPEAK_QS[Math.floor(Math.random()*SPEAK_QS.length)],timer=null,left=60;
  const qEl=h("h3",{},q),tEl=h("div",{class:"score"},"60s");
  const startB=h("button",{class:"btn primary",onclick:()=>{clearInterval(timer);left=60;tEl.textContent="60s";timer=setInterval(()=>{left--;tEl.textContent=left+"s";if(left<=0){clearInterval(timer);tEl.textContent="Done";logMinutes(2,"produce");toast("Now say it again. Aim for fewer pauses.")}},1000)}},"Start 60 seconds");
  m.append(h("div",{class:"panel"},h("div",{class:"eyebrow"},"60-second speaking drill"),h("p",{class:"muted small"},"Speak out loud about the topic without stopping, then repeat it once. No feedback here; it builds fluency."),qEl,h("div",{class:"row"},tEl,startB,h("button",{class:"btn",onclick:()=>{q=SPEAK_QS[Math.floor(Math.random()*SPEAK_QS.length)];qEl.textContent=q}},"Another topic"))));
}
function roleplay(m,s,diff){
  m.innerHTML="";const msgs=[{role:"assistant",content:s.start}];let turns=0,usedVoice=false;
  const chat=h("div",{class:"chat"});const ta=h("textarea",{id:"rpInput",style:"min-height:80px",placeholder:"Your answer…"});
  const style={supportive:"Speak simply and clearly, slightly above the learner's level, and be patient.",standard:"Speak naturally like a real person in this situation, at a normal professional pace. Ask follow-up questions when answers are vague.",challenging:"Speak naturally and fast, use idioms, push back, ask probing follow-up questions, and do not accept vague answers, as a demanding real person would."}[diff];
  const sys=`You are roleplaying as: ${s.who}. Scenario: ${s.title}. ${s.desc} The other person is Paulik, a 23-year-old Hungarian Business IT student practising English (estimated level ${contentLevel()}). ${style} Stay in character, keep each reply to 1-3 sentences, and end with a question or prompt that keeps the conversation going. Never correct his English during the roleplay. Do not make it unrealistically easy.`;
  function draw(){chat.innerHTML="";msgs.forEach(x=>chat.append(h("div",{class:"msg "+(x.role==="user"?"me":"them")},h("div",{class:"who"},x.role==="user"?"You":s.who.split(" ").slice(0,3).join(" "),x.role==="user"?null:speakBtn(x.content)),x.content)));chat.scrollTop=chat.scrollHeight}
  async function send(){
    const t=ta.value.trim();if(!t)return;ta.value="";msgs.push({role:"user",content:t});turns++;draw();
    const th=h("div",{class:"msg them thinking"},"…");chat.append(th);sendB.disabled=true;
    try{const r=await sample([{role:"user",content:sys+"\n\nStart the conversation."},...msgs],{modelTier:"quick",cache:false});const txt=String(r.text||"").trim();if(!txt)throw{code:"invalid"};msgs.push({role:"assistant",content:txt});draw();
      if(tts&&autoSpeak.checked)tts.speak(txt,{language:"en"}).catch(()=>{});
    }catch(e){th.textContent="(No reply. "+claudeErr(e)+")"}
    sendB.disabled=false;
  }
  const sendB=h("button",{class:"btn primary",onclick:send},"Send");
  const mic=dict?h("button",{class:"btn",type:"button",onclick:()=>{usedVoice=true;dictateInto(ta,mic,"Speak")}},"Speak"):null;
  const autoSpeak=h("input",{type:"checkbox",id:"autospeak",checked:!!tts});
  const fb=h("div",{class:"fb","aria-live":"polite"});
  const endB=h("button",{class:"btn",onclick:async()=>{
    if(turns<3){toast("Answer at least 3 times before feedback.");return}
    endB.disabled=true;fb.innerHTML="";fb.append(h("p",{class:"thinking"},"Claude is reviewing your answers…"));
    try{
      const r=await sample.json(`You are an English speaking coach. Scenario: ${s.title} (${s.who}). The learner is Hungarian, estimated level ${contentLevel()}, aiming for B2/C1. ${usedVoice?"The learner's lines are speech-to-text transcripts: ignore punctuation and capitals; you cannot judge pronunciation.":"The learner typed these answers."}
Conversation:
${msgs.map(x=>(x.role==="user"?"Learner: ":"Partner: ")+x.content).join("\n")}
Return ONLY JSON: {"grammar":1-10,"vocabulary":1-10,"naturalness":1-10,"fluency":1-10,"summary":"2 sentences","grammar_feedback":"1-2 sentences","vocabulary_feedback":"1-2 sentences","naturalness_feedback":"1-2 sentences","fluency_feedback":"1-2 sentences (from answer length, structure and coherence)","issues":[{"original":"learner phrase","better":"better phrase","kind":"error|unnatural","category":"articles|prepositions|present perfect|past tenses|tenses (other)|question formation|word order|conditionals|passive|verb patterns|countables|subject-verb agreement|collocations|linkers|vocabulary|naturalness & register","why":"short"}],"better_expressions":[{"w":"","hu":"Hungarian meaning","def":"","ex":""}],"recommendations":["","",""]}
Up to 8 issues, 4 expressions, exactly 3 specific recommendations.`,{modelTier:"default"});
      if(!r||typeof r.grammar!=="number")throw{code:"invalid"};
      fb.innerHTML="";const d=today();
      const n=k=>Math.max(1,Math.min(10,Math.round(Number(r[k])||0)));
      S.talks.unshift({d,id:s.id,turns,gr:n("grammar"),vo:n("vocabulary"),na:n("naturalness"),fl:n("fluency"),ac:n("grammar"),voice:usedVoice,diff});S.talks=S.talks.slice(0,80);
      const issues=(Array.isArray(r.issues)?r.issues:[]).filter(x=>x&&x.original&&x.better);
      issues.filter(x=>x.kind==="error").forEach(x=>addMistake(S,{cat:x.category,src:"speaking",q:x.original,yours:x.original,correct:x.better,note:x.why||""},d));
      logMinutes(12,"speak");
      fb.append(h("div",{class:"stats"},stat(n("grammar"),"grammar /10"),stat(n("vocabulary"),"vocabulary /10"),stat(n("naturalness"),"naturalness /10"),stat(n("fluency"),"fluency /10")),h("p",{},r.summary||""));
      [["Grammar","grammar_feedback"],["Vocabulary","vocabulary_feedback"],["Naturalness","naturalness_feedback"],["Fluency","fluency_feedback"]].forEach(([l,k])=>{if(r[k])fb.append(h("p",{},h("b",{},l+": "),String(r[k])))});
      if(issues.length){fb.append(h("h3",{},"Better ways to say it"));issues.forEach(x=>fb.append(corrBlock(x,x.kind==="error"?"warn":"accent")))}
      const ex=(Array.isArray(r.better_expressions)?r.better_expressions:[]).filter(p=>p&&p.w&&p.def);
      if(ex.length)fb.append(h("h3",{},"Expressions to steal"),...ex.map(p=>h("p",{},h("b",{},p.w),p.hu?" ("+p.hu+")":""," – "+p.def)),h("button",{class:"btn",onclick:e=>{let k=0;ex.forEach(p=>{if(addCustom(p.w,"expression",p.def,p.ex,s.t,p.hu))k++});e.target.disabled=true;toast(k?`Added ${k} to flashcards`:"Already in your deck")}},"Add to my flashcards"));
      if(Array.isArray(r.recommendations)&&r.recommendations.length)fb.append(h("h3",{},"3 things to work on"),h("ol",{},r.recommendations.slice(0,3).map(x=>h("li",{},String(x)))));
      if(!usedVoice)fb.append(h("p",{class:"note"},"You typed this roleplay. Typing is easier than speaking, so try the next one out loud."));
    }catch(e){fb.innerHTML="";fb.append(h("p",{class:"bad-t"},claudeErr(e)))}
    endB.disabled=false;
  }},"Finish and get feedback");
  m.append(h("div",{class:"panel"},h("div",{class:"row"},h("button",{class:"btn ghost",onclick:()=>go("speak")},"← Scenarios"),h("span",{class:"eyebrow"},s.title+" · "+diff)),chat,ta,h("div",{class:"row"},mic,tts?h("label",{class:"small row",style:"gap:6px"},autoSpeak,"Read replies aloud"):null,h("span",{style:"flex:1"}),endB,sendB),h("p",{class:"muted small"},"Answer in full sentences. Try to use one new phrase per reply."),fb));
  ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
  draw();
}

/* ---------- boot ---------- */
(function boot(){
  const local=loadLocal();S=migrate(local);
  if(!S.started)S.started=today();
  if(local&&local.v!==2)saveLocal();
  const hv=(location.hash||"").slice(1);if(TABS.some(t=>t[0]===hv)||HIDDEN_VIEWS.includes(hv))view=hv;
  render();
  if(!window.claude||!window.claude.use)return;
  window.claude.use("sample").then(x=>{sample=x;if(x&&["write","speak","cards","assess","practice"].includes(view))render()}).catch(()=>{});
  window.claude.use("dictation").then(x=>{dict=x;if(x&&["write","speak","pron"].includes(view))render()}).catch(()=>{});
  window.claude.use("downloads").then(x=>{downloads=x}).catch(()=>{});
  window.claude.use("tts").then(x=>{tts=x;if(x&&["listen","pron","assess","cards"].includes(view))render()}).catch(()=>{});
  Promise.all([window.claude.use("db"),window.claude.use("user")]).then(async([d,u])=>{
    if(!d||!u)return;const id=await u.id();if(!id)return;
    docRef=d.doc("data/users/"+id+"/state");storeMode="db";setSync("Syncing…");
    const t=setTimeout(()=>setSync("Saved on this device"),10000);
    try{const snap=await docRef.get();clearTimeout(t);const data=snap.exists&&snap.data();
      if(data&&data.json){S=migrate(JSON.parse(data.json));if(!S.started)S.started=today();saveLocal();if(JSON.parse(data.json).v!==2)save();setSync("Saved to your account");render()}
      else{setSync("Saved to your account");if(local)save()}
    }catch(e){clearTimeout(t);setSync("Saved on this device")}
  }).catch(()=>{});
})();
