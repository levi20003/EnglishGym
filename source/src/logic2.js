/* ================= LEARNING LOGIC, part 2 (pure, tested) ================= */
const CONTRACTIONS={"i'm":"i am","you're":"you are","we're":"we are","they're":"they are","it's":"it is","that's":"that is","there's":"there is","what's":"what is","i'll":"i will","you'll":"you will","we'll":"we will","it'll":"it will","i'd":"i would","you'd":"you would","we'd":"we would","don't":"do not","doesn't":"does not","didn't":"did not","can't":"can not","cannot":"can not","won't":"will not","isn't":"is not","aren't":"are not","wasn't":"was not","haven't":"have not","hasn't":"has not","i've":"i have","we've":"we have","you've":"you have","let's":"let us","wanna":"want to","gonna":"going to"};
const NUMS={"0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five","6":"six","7":"seven","8":"eight","9":"nine","10":"ten","12":"twelve"};
function speechTokens(s){
  const out=[];
  String(s||"").toLowerCase().replace(/[’`]/g,"'").replace(/[^a-z0-9' -]/g," ").split(/[\s-]+/).filter(Boolean).forEach(w=>{
    w=w.replace(/^'+|'+$/g,"");if(!w)return;
    if(CONTRACTIONS[w])out.push(...CONTRACTIONS[w].split(" "));else if(NUMS[w])out.push(NUMS[w]);else out.push(w);
  });
  return out;
}
/* Word-level match between the target sentence and what speech recognition heard (longest common subsequence). */
function wordDiff(target,heard){
  const a=speechTokens(target),b=speechTokens(heard);
  const m=Array.from({length:a.length+1},()=>new Array(b.length+1).fill(0));
  for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)m[i][j]=a[i]===b[j]?m[i+1][j+1]+1:Math.max(m[i+1][j],m[i][j+1]);
  const matchedIdx=new Set();let i=0,j=0;
  while(i<a.length&&j<b.length){if(a[i]===b[j]){matchedIdx.add(i);i++;j++}else if(m[i+1][j]>=m[i][j+1])i++;else j++}
  const words=a.map((w,k)=>({w,ok:matchedIdx.has(k)}));
  return{score:a.length?matchedIdx.size/a.length:0,matched:matchedIdx.size,total:a.length,missing:words.filter(x=>!x.ok).map(x=>x.w),words,extra:Math.max(0,b.length-matchedIdx.size)};
}

/* ---- adaptive daily session ---- */
const MODE_LABEL={quiz:"Vocabulary + quiz",write:"Writing",speak:"Speaking roleplay",weak:"Weak-spot practice",listen:"Listening",pron:"Pronunciation & shadowing",assess:"Assessment",produce:"60-second speaking"};
const RHYTHM2={1:"quiz",2:"write",3:"speak",4:"weak",5:"speak",6:"write",0:"listen"};
const SKILL_MODE={grammar:"weak",listening:"listen",writing:"write",speaking:"speak",reading:"quiz"};
function lastDone(S,mode,today){for(let k=0;k<60;k++){const d=addDays(today,-k);if(S.missions[d]&&S.missions[d][mode])return k}return null}
function planSession(S,today,minutes,dow){
  const scores={},why={};
  const add=(m,v,r)=>{scores[m]=(scores[m]||0)+v;if(r&&v>0)(why[m]=why[m]||[]).push(r)};
  ["quiz","write","speak","weak","listen"].forEach(m=>add(m,0));
  add(RHYTHM2[dow],2,"today's slot in your weekly rhythm");
  const anyAssess=S.assess.length>0;
  if(!anyAssess)add("assess",4,"no skill has been assessed yet");
  else if(retestDue(S,today))add("assess",5,"your 4-week re-test is due");
  const tested=SKILLS.map(([k])=>[k,S.skills[k]]).filter(x=>x[1]);
  if(tested.length>=2){
    const lo=Math.min(...tested.map(x=>lvlIdx(x[1].level))),hi=Math.max(...tested.map(x=>lvlIdx(x[1].level)));
    if(hi>lo)tested.filter(x=>lvlIdx(x[1].level)===lo).forEach(([k])=>add(SKILL_MODE[k],2,`${k} is your lowest skill`));
  }
  const prof=weaknessProfile(S,today),weakN=prof.filter(c=>c.status==="weak"||c.status==="recurring").length;
  if(weakN>=2)add("weak",1.5,`${weakN} mistake areas keep coming back`);
  const lastW=S.writings[0];if(lastW&&lastW.score!=null&&lastW.score<5&&daysBetween(lastW.d,today)<=7)add("write",1,"your last text scored low, so a second attempt helps");
  ["quiz","write","speak","weak","listen"].forEach(m=>{const k=lastDone(S,m,today);if(k===0)add(m,-3);else if(k===null||k>=4)add(m,1,k===null?"you haven't done this yet":`last done ${k} days ago`)});
  const order=["assess","weak","write","speak","listen","quiz"];
  const main=Object.keys(scores).sort((a,b)=>scores[b]-scores[a]||order.indexOf(a)-order.indexOf(b))[0];
  const dq=dueQueue(S.cards,DECK.concat(S.custom||[]),today,minutes);
  const learning=Object.values(S.cards).filter(c=>cardStatus(c)==="learning").length;
  const nNew=newAllowance(dq.total,learning,minutes);
  const reviewMin=Math.max(3,Math.min(12,Math.round(dq.now.length*.35+nNew*.6)));
  const produce=main==="speak"||main==="assess"?"pron":main==="write"?"produce":(Number(today.slice(-2))%2?"pron":"produce");
  const produceMin=4;
  return{review:{due:dq.now.length,waiting:dq.waiting,nNew,min:reviewMin},main:{mode:main,why:(why[main]||[]).slice(0,2),min:Math.max(10,minutes-reviewMin-produceMin)},produce:{mode:produce,min:produceMin}};
}

/* ---- outcome analytics ---- */
function windowAvg(list,dateKey,valFn,from,to){const v=list.filter(x=>x[dateKey]>=from&&x[dateKey]<=to).map(valFn).filter(x=>x!=null&&isFinite(x));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function compare4w(S,today){
  const cur=[addDays(today,-27),today],prev=[addDays(today,-55),addDays(today,-28)];
  const q=(r)=>{const e=S.events.filter(x=>x.d>=r[0]&&x.d<=r[1]&&x.src!=="assessment");return e.length?e.filter(x=>x.ok).length/e.length:null};
  const rec=(r)=>{let n=0,ok=0;for(const[d,v]of Object.entries(S.revStats))if(d>=r[0]&&d<=r[1]){n+=v.n;ok+=v.ok}return n?ok/n:null};
  const w=(r)=>windowAvg(S.writings,"d",x=>x.score,r[0],r[1]);
  const l=(r)=>windowAvg(S.listening||[],"d",x=>x.of?x.score/x.of:null,r[0],r[1]);
  const sp=(r)=>windowAvg(S.talks,"d",x=>x.gr!=null?(x.gr+x.vo+x.na+x.fl)/4:(x.fl!=null?(x.fl+x.ac+x.vo)/3:null),r[0],r[1]);
  const pr=(r)=>windowAvg(S.pron||[],"d",x=>x.match,r[0],r[1]);
  return[["Question accuracy",q(prev),q(cur),"pct"],["Card recall",rec(prev),rec(cur),"pct"],["Writing score",w(prev),w(cur),"10"],["Listening accuracy",l(prev),l(cur),"pct"],["Speaking score",sp(prev),sp(cur),"10"],["Speech recognised (shadowing)",pr(prev),pr(cur),"pct"]];
}
function weeklyMinutes(activity,today,weeks){const out=[];for(let w=weeks-1;w>=0;w--){let s=0;for(let k=0;k<7;k++)s+=activity[addDays(today,-(w*7+k))]||0;out.push(s)}return out}
