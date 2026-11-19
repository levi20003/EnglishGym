/* Standalone (installed app) platform layer. Replaces the Claude runtime with the
   browser's own speech APIs. No Claude features, no account sync: those return null. */
window.EG_STANDALONE=true;
(function(){
  function webTTS(){
    const ss=window.speechSynthesis;if(!ss||typeof SpeechSynthesisUtterance==="undefined")return null;
    const ORDER=["buttery","airy","glassy","rounded"];
    let stateFns=[],cancelled=false,speaking=false;
    function emit(state,reason){stateFns.forEach(f=>{try{f({state,reason})}catch(e){}})}
    function pickVoices(){
      const want=(window.EG_VARIETY==="US")?"en-US":"en-GB";
      const all=ss.getVoices().filter(v=>/^en[-_]/i.test(v.lang));
      const norm=v=>v.lang.replace("_","-");
      const pref=all.filter(v=>norm(v)===want),rest=all.filter(v=>norm(v)!==want);
      return pref.concat(rest);
    }
    function speakOne(line,vs){return new Promise((res,rej)=>{
      const u=new SpeechSynthesisUtterance(String(line.text||""));
      const i=Math.max(0,ORDER.indexOf(line.voice||"buttery"));
      if(vs.length)u.voice=vs[i%vs.length];u.lang=u.voice?u.voice.lang:((window.EG_VARIETY==="US")?"en-US":"en-GB");
      u.rate=Math.min(1.5,Math.max(0.7,line.rate||1));
      u.onend=()=>res();u.onerror=e=>rej({code:(e&&e.error==="interrupted"||e&&e.error==="canceled")?"viewer_stopped":"unavailable",message:String(e&&e.error||"speech error")});
      ss.speak(u);
    })}
    return {
      async speak(input,opts){
        const lines=(Array.isArray(input)?input:[{text:input,...(opts||{})}]);
        ss.cancel();cancelled=false;speaking=true;emit("speaking");
        if(!ss.getVoices().length)await new Promise(r=>{ss.onvoiceschanged=r;setTimeout(r,1500)});
        const vs=pickVoices();
        try{for(const l of lines){if(cancelled)throw{code:"viewer_stopped"};await speakOne(l,vs)}speaking=false;emit("idle","completed")}
        catch(e){speaking=false;emit("idle","viewer_stopped");throw e}
      },
      stop(){cancelled=true;ss.cancel()},
      onState(f){stateFns.push(f);return()=>{stateFns=stateFns.filter(x=>x!==f)}}
    };
  }
  function webDict(){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return null;
    let P=[],F=[],St=[],rec=null,stopWait=null;
    const fire=(arr,v)=>arr.forEach(f=>{try{f(v)}catch(e){}});
    const sub=(arr,f)=>{arr.push(f);return()=>{const i=arr.indexOf(f);if(i>=0)arr.splice(i,1)}};
    return {
      onPartial:f=>sub(P,f),onFinal:f=>sub(F,f),onState:f=>sub(St,f),
      start(){return new Promise((res,rej)=>{
        try{if(rec)rec.abort()}catch(e){}
        rec=new R();rec.lang="en-GB";rec.continuous=true;rec.interimResults=true;
        let ok=false;
        rec.onstart=()=>{ok=true;fire(St,{state:"listening"});res()};
        rec.onresult=ev=>{let interim="";for(let i=ev.resultIndex;i<ev.results.length;i++){const r=ev.results[i];if(r.isFinal)fire(F,{text:r[0].transcript.trim()});else interim+=r[0].transcript}if(interim)fire(P,{text:interim.trim()})};
        rec.onerror=ev=>{const code=(ev.error==="not-allowed"||ev.error==="service-not-allowed")?"not_granted":"unavailable";if(!ok)rej({code,message:ev.error})};
        rec.onend=()=>{rec=null;fire(St,{state:"idle",reason:"stopped"});if(stopWait){stopWait();stopWait=null}};
        try{rec.start()}catch(e){rej({code:"unavailable",message:String(e)})}
      })},
      stop(){return new Promise(r=>{if(!rec)return r();stopWait=r;try{rec.stop()}catch(e){r()}setTimeout(r,3000)})}
    };
  }
  const caps={tts:webTTS(),dictation:webDict()};
  window.claude={use:n=>Promise.resolve(caps[n]||null)};
  if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();
