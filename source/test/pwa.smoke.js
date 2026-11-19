// Standalone app smoke test: offline cache, Claude-only features labelled, export/import round trip. Run after build-pwa.sh.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{
const dist=path.resolve(__dirname,'../pwa/dist');const srv=spawn('python3',['-m','http.server','8765','-d',dist],{stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const fail=m=>{console.log("FAIL",m);process.exitCode=1};
await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
const sw=await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return !!r.active});console.log("service worker active:",sw);if(!sw)fail("sw");
const man=await p.evaluate(async()=>(await (await fetch(document.querySelector('link[rel=manifest]').href)).json()).name);console.log("manifest:",man);
console.log("standalone flag:",await p.evaluate(()=>window.EG_STANDALONE===true));
// make some progress
await p.click('nav.tabs button:has-text("Quiz")');await p.waitForTimeout(200);
await p.click('nav.tabs button:has-text("Writing")');await p.waitForTimeout(200);
await p.click('nav.tabs button:has-text("Speaking")');await p.waitForTimeout(200);
const spk=await p.textContent('main');if(!spk.includes("only works in the Claude version"))fail("speaking label");else console.log("speaking: Claude-only label shown");
await p.click('nav.tabs button:has-text("Assessment")');await p.waitForTimeout(200);
console.log("assessment Claude-only labels:",await p.locator('a:has-text("Open the Claude version")').count());
await p.evaluate(()=>{S.cards.d3={ease:2.5,interval:4,reps:2,due:"2026-12-01",lapses:0};S.activity["2026-11-18"]=20;save()});
// offline reload
await ctx.setOffline(true);await p.reload();await p.waitForTimeout(800);
const off=await p.locator('nav.tabs button').count();console.log("offline reload tabs:",off);if(off<5)fail("offline");
await ctx.setOffline(false);
// export
await p.click('nav.tabs button:has-text("Profile")');await p.waitForTimeout(200);
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('button:has-text("Export progress")')]);
const file=path.resolve(__dirname,'../../export-test.json');await dl.saveAs(file);const ex=JSON.parse(fs.readFileSync(file,'utf8'));
console.log("export:",dl.suggestedFilename(),"cards:",Object.keys(ex.state.cards).length);if(!ex.state.cards.d3)fail("export content");
// wipe, then import
await p.evaluate(()=>{localStorage.clear()});await p.reload();await p.waitForTimeout(500);
await p.click('nav.tabs button:has-text("Profile")');await p.waitForTimeout(200);
await p.click('button:has-text("Paste instead")');await p.fill('textarea[placeholder="Paste exported progress here"]','{"nope":1}');await p.click('button:has-text("Import pasted text")');await p.waitForTimeout(200);
console.log("bad file toast:",await p.textContent('#toast'));
await p.fill('textarea[placeholder="Paste exported progress here"]',fs.readFileSync(file,'utf8'));await p.click('button:has-text("Import pasted text")');await p.waitForTimeout(200);
const [dl2]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),p.click('button:has-text("Replace")')]);await p.waitForTimeout(300);
const st=await p.evaluate(()=>JSON.parse(localStorage.getItem("english-gym-v1")));console.log("imported d3:",!!st.cards.d3,"activity:",st.activity["2026-11-18"],"backup download:",!!dl2);if(!st.cards.d3)fail("import");
const m=await b.newPage({viewport:{width:390,height:844}});await m.goto('http://localhost:8765/');await m.waitForTimeout(500);await m.click('nav.tabs button:has-text("Profile")');
console.log("phone scrollWidth",await m.evaluate(()=>document.documentElement.scrollWidth));
await m.screenshot({path:path.resolve(__dirname,'../../pwa-profile-390.png'),fullPage:true});
console.log("page errors:",errs);await b.close();srv.kill();})();
