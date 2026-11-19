// Browser smoke test with a stubbed window.claude (sample returns canned JSON). Run: node test/smoke.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];
const v1={v:1,profile:{name:"Paulik",level:"B1",minutes:30,goals:["Job interviews"],interests:["Tech"],balance:50},level:"B2",cards:{d0:{ease:2.5,interval:1,reps:2,due:"2026-01-01",lapses:0},d30:{ease:2.5,interval:3,reps:1,due:"2026-01-01",lapses:0}},custom:[],mistakes:[{d:"2026-11-18",type:"articles",src:"quiz",q:"x",yours:"a",correct:"the",note:"",fixed:false}],writings:[],talks:[],activity:{"2026-11-18":10},tests:[{d:"2026-11-18",kind:"placement",score:14,of:20,level:"B2"}],missions:{}};
const stub=`window.claude={use:async n=>{
 if(n==="sample"){const f=async(i)=>({text:"Sure. What happened next?"});f.json=async(p)=>{
  if(p.includes("CEFR examiner"))return{level:"b1",confidence:"medium",criteria:{range:"ok",accuracy:"ok",coherence:"ok",task:"ok"},strengths:["clear"],to_reach_next_level:["a","b","c"],mistakes:[{original:"in the monday",corrected:"on Monday",category:"prepositions"}]};
  if(p.includes("six criteria"))return{score:6.5,criteria:{grammar:6,vocabulary:7,structure:6,coherence:7,naturalness:5,task:8},summary:"Good.",issues:[{original:"I am living here since 2021",better:"I have lived here since 2021",kind:"error",category:"present perfect",why:"since"},{original:"make a call to him",better:"call him",kind:"unnatural",category:"naturalness",why:"simpler"}],corrected_version:"x",natural_version:"y",expressions:[{w:"get back to you",hu:"visszajelzek",def:"reply later",ex:"I'll get back to you tomorrow."}]};
  if(p.includes("speaking coach"))return{grammar:6,vocabulary:6,naturalness:5,fluency:7,summary:"ok",grammar_feedback:"g",vocabulary_feedback:"v",naturalness_feedback:"n",fluency_feedback:"f",issues:[{original:"I go yesterday",better:"I went yesterday",kind:"error",category:"past simple",why:"past"}],better_expressions:[{w:"to be honest",def:"x",ex:"y"}],recommendations:["1","2","3"]};
  if(p.includes("multiple-choice English practice"))return[{q:"I bought ___ new laptop.",o:["a","an","the","—"],a:0,cat:"articles",n:"a + consonant"},{q:"bad",o:["a"],a:0,cat:"articles"}];
  return[]};return f}
 if(n==="tts")return{speak:async()=>{await new Promise(r=>setTimeout(r,30))},stop(){},onState(){return()=>{}}};
 if(n==="dictation"){const hs={p:[],f:[],s:[]};return{onPartial(f){hs.p.push(f);return()=>{hs.p=hs.p.filter(x=>x!==f)}},onFinal(f){hs.f.push(f);return()=>{hs.f=hs.f.filter(x=>x!==f)}},onState(f){hs.s.push(f);return()=>{hs.s=hs.s.filter(x=>x!==f)}},start:async()=>{window.__dictHandlers=hs;hs.s.forEach(f=>f({state:"listening"}))},stop:async()=>{hs.f.forEach(f=>f({text:window.__say||"I'm a developer not a designer"}));hs.s.forEach(f=>f({state:"idle",reason:"stopped"}))}}}
 return null}};`;
for(const [w,h] of [[1280,900],[390,844]]){
const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(w+": "+e.message));
await p.addInitScript(`try{localStorage.setItem("english-gym-v1",${JSON.stringify(JSON.stringify(v1))})}catch(e){};`+stub);
await p.goto('file://'+path.resolve(__dirname,'../english-gym.html'));await p.waitForTimeout(400);
await p.screenshot({path:path.resolve(__dirname,`../../today-${w}.png`)});
for(const t of ['Flashcards','Quiz','Writing','Speaking','Weak spots','Assessment','Progress','Profile','Today']){await p.click(`nav.tabs button:has-text("${t}")`);await p.waitForTimeout(120)}
const mig=await p.evaluate(()=>JSON.parse(localStorage.getItem("english-gym-v1")));
if(w===1280){
 console.log("migrated v:",mig.v,"grammar skill:",mig.skills.grammar&&mig.skills.grammar.level,"mistake cat:",mig.mistakes[0].cat);
 // grammar test set B (v1 placement = set A)
 await p.click('nav.tabs button:has-text("Assessment")');await p.click('.grid2 .panel:nth-child(1) button');
 for(let i=0;i<20;i++){await p.click('.opt >> nth=1')}
 console.log("grammar result:",await p.textContent('.score'));
 await p.click('text=Back to assessments');
 // reading
 await p.click('.grid2 .panel:nth-child(2) button');
 for(let t=0;t<4;t++){for(let q=0;q<3;q++)await p.click(`.opts >> nth=${q} >> .opt >> nth=1`);await p.click('button.primary:has-text("Next text"), button.primary:has-text("Finish")')}
 console.log("reading result:",await p.textContent('.score'));await p.click('text=Back to assessments');
 // writing assessment
 await p.click('.grid2 .panel:nth-child(4) button');await p.fill('#assessWrite',"word ".repeat(90));await p.click('text=Submit for rating');await p.waitForSelector('.score');console.log("writing result:",await p.textContent('.score'));await p.click('text=Back to assessments');
 // speaking assessment (typed)
 await p.click('.grid2 .panel:nth-child(5) button');for(let i=0;i<3;i++){await p.fill('textarea',"this is my answer to the question and I think it is good ok because I said so");await p.click('button:has-text("Next question"), button:has-text("Finish")')}
 await p.waitForSelector('.score');console.log("speaking result:",await p.textContent('.score'));
 await p.click('nav.tabs button:has-text("Assessment")');console.log("overall:",await p.textContent('h1'));
 // cards
 await p.click('nav.tabs button:has-text("Flashcards")');
 for(let i=0;i<4;i++){await p.click('.panel >> nth=0 >> button.primary');await p.click('.rate .btn >> nth=2')}
 // quiz
 await p.click('nav.tabs button:has-text("Quiz")');for(let i=0;i<10;i++){await p.click('.opt >> nth=0');await p.click('button.primary:has-text("Next"), button.primary:has-text("See result")')}
 console.log("quiz:",await p.textContent('.score'));
 // writing lab
 await p.click('nav.tabs button:has-text("Writing")');await p.fill('#writeText',"I am living here since 2021 and I like it very much because it is nice. ".repeat(3));await p.click('text=Get feedback');await p.waitForSelector('.crit');console.log("writing lab: criteria rows",await p.locator('.crit>div').count());
 // roleplay
 await p.click('nav.tabs button:has-text("Speaking")');await p.click('.scen button >> nth=0');for(let i=0;i<3;i++){await p.fill('#rpInput','I go yesterday to the office');await p.click('button:has-text("Send")');await p.waitForTimeout(80)}
 await p.click('text=Finish and get feedback');await p.waitForSelector('.fb ol');console.log("roleplay recs:",await p.locator('.fb ol li').count());
 // weak spots + practice incl generation
 await p.click('nav.tabs button:has-text("Weak spots")');console.log("weak rows:",await p.locator('tbody tr').count());
 await p.click('text=Practise my weak spots');await p.waitForTimeout(200);
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem("english-gym-v1")));console.log("events:",st.events.length,"mistakes open:",st.mistakes.filter(m=>!m.fixedAt).length,"talks:",st.talks.length,"writings:",st.writings.length,"assess:",st.assess.map(a=>a.skill+":"+a.level).join(","));
 // listening exercise
 await p.click('nav.tabs button:has-text("Listening")');await p.click('.scen button >> nth=0');await p.click('button:has-text("Play")');await p.waitForTimeout(100);await p.click('text=Show the questions');
 for(let q=0;q<4;q++)await p.click(`.opts >> nth=${q} >> .opt >> nth=0`);await p.click('text=Check answers');console.log("listening:",await p.textContent('.score'));
 // listening assessment
 await p.click('nav.tabs button:has-text("Assessment")');await p.click('.grid2 .panel:nth-child(3) button');
 for(let i=0;i<4;i++){await p.click('button.primary:has-text("Play")');await p.waitForTimeout(80);for(let q=0;q<3;q++)await p.click(`.opts >> nth=${q} >> .opt >> nth=1`);await p.click('button:has-text("Next recording"), button:has-text("Finish")')}
 console.log("listening test:",await p.textContent('.score'));
 // pronunciation with stubbed recognition
 await p.click('nav.tabs button:has-text("Pronunciation")');await p.click('button:has-text("Record")');await p.click('button:has-text("Stop")');await p.waitForSelector('.words');console.log("pron match:",await p.textContent('.score'));await p.click('text=Save and next');
 await p.click('nav.tabs button:has-text("Today")');console.log("today main:",await p.textContent('.mission li:nth-child(2) b'));
 await p.click('nav.tabs button:has-text("Progress")');await p.screenshot({path:path.resolve(__dirname,'../../progress.png'),fullPage:true});
}else{for(const t of ['Weak spots','Listening','Pronunciation','Assessment','Progress']){await p.click(`nav.tabs button:has-text("${t}")`);const sw0=await p.evaluate(()=>document.documentElement.scrollWidth);if(sw0>390)console.log("OVERFLOW on",t,sw0)}await p.screenshot({path:path.resolve(__dirname,'../../pron-390.png'),fullPage:true});await p.click('nav.tabs button:has-text("Weak spots")');const sw=await p.evaluate(()=>document.documentElement.scrollWidth);console.log("phone scrollWidth",sw);}
await p.close()}
console.log("page errors:",errs);await b.close()})();
