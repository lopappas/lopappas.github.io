import {audioPreferences,audioChannelVolume,loadAudioPreferences} from './audioPreferences.ts';
import type {Element,Spell} from './magic';

export type CastSound=Lowercase<Element>|'fizzle'|'hurt'|'start'|'aquaspout'|'tidalcrest'|'bramble'|'flareBolt'|'cloud'|'mud'|'rain'|'swamp'|'rustle';
export type UISound='bottle'|'learn'|'stone'|'upgrade'|'rest'|'shatter'|'robes';
export const UI_SOUND_VOLUME:Record<UISound,number>={robes:.3,shatter:.38,bottle:.24,learn:.32,stone:.29,upgrade:.36,rest:.3};
type SoundKind=CastSound|UISound;
export function spellCastSound(spell:Pick<Spell,'id'|'element'>|null|undefined):CastSound{
 if(!spell)return 'fizzle';
 return ({thistleBush:'rustle',firestorm:'cloud',bog:'mud',wave:'aquaspout',tidalcrest:'tidalcrest',leaf:'bramble',bolt:'flareBolt'} as Partial<Record<Spell['id'],CastSound>>)[spell.id]??spell.element.toLowerCase() as CastSound;
}
export const SOUND_RATE=22050;
export function castVolume(quality:number){const q=Math.max(0,Math.min(100,quality))/100;return .18+.32*q*q;}

// Original synthesized effects: no downloads, microphone access, or audio assets.
export function soundSamples(kind:SoundKind):Float32Array{
 if(kind==='aquaspout')return soundSamples('water');
 if(kind==='bramble')return soundSamples('nature');
 const duration=kind==='rain'||kind==='swamp'?6:kind==='rustle'?.55:kind==='cloud'?2:kind==='mud'?.8:kind==='tidalcrest'?1.15:kind==='robes'?1:kind==='shatter'?.42:kind==='rest'?1.25:kind==='upgrade'?1.4:kind==='bottle'?.24:kind==='learn'?.65:kind==='stone'?.55:kind==='start'?.78:kind==='hurt'?.14:kind==='nature'?.7:kind==='water'?.58:.48;
 let samples=new Float32Array(Math.ceil(duration*SOUND_RATE));
 let seed=19,low=0,rumble=0;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 for(let i=0;i<samples.length;i++){
  const t=i/SOUND_RATE,u=t/duration;
  const attack=Math.min(1,t/.012),end=Math.min(1,(duration-t)/.04);
  const n=noise();low+=.12*(n-low);rumble+=.008*(low-rumble);
  let value=0;
  if(kind==='rustle'){
   // Four soft leaf brushes and a tiny rounded sprout pop, with no loop.
   for(const start of [0,.09,.21,.34]){const age=t-start;if(age>=0&&age<.18)value+=(low*.9+(n-low)*.12)*Math.sin(Math.PI*age/.18)**2;}
   value+=Math.sin(2*Math.PI*(260*t-90*t*t))*.11*Math.min(1,t/.018)*Math.exp(-t*22);
  }else if(kind==='rain'){
   value=low*1.8+n*.16;
  }else if(kind==='swamp'){
   // Occasional nearby wing buzzes, with quiet space between passes.
   for(const [start,length] of [[.8,.75],[3.7,.95]]){
    const age=t-start;if(age>=0&&age<length){
     const wing=2*Math.PI*(165*age+5*Math.sin(age*17));
     value+=(Math.sin(wing)+.35*Math.sin(wing*2)+.12*Math.sin(wing*3))*Math.sin(Math.PI*age/length)**2*.3;
    }
   }
  }else if(kind==='cloud'){
   // Distant, gently rolling storm rumble without electrical crackles or tones.
   value=(rumble*5+low*.3)*Math.sin(Math.PI*u)**.8;
  }else if(kind==='mud'){
   value=low*2*Math.exp(-t*6);
   for(const start of [0,.12,.29,.43]){const a=t-start;if(a>=0)value+=Math.sin(2*Math.PI*(190*a-160*a*a))*Math.exp(-a*19)*Math.min(1,a/.008)*.4;}
  }else if(kind==='tidalcrest'){
   // A broad rolling surf swell, breaking into fizzing foam.
   const swell=Math.sin(Math.PI*u)**1.3;
   value=(low*3.2+n*.22)*swell+(n-low)*.22*Math.exp(-Math.max(0,t-.35)*4)*Math.min(1,t/.35);
  }else if(kind==='robes'){
   // Soft ascending celesta notes with tiny high bell sparkles.
   for(const [j,f] of [783.99,987.77,1174.66,1567.98,1975.53].entries()){
    const age=t-j*.075;if(age>=0)value+=(Math.sin(2*Math.PI*f*age)+.18*Math.sin(2*Math.PI*f*2.76*age))*Math.min(1,age/.012)*Math.exp(-age*9)*.25;
   }
  }else if(kind==='shatter'){
   // Crunchy 8-bit rock fracture: stepped noise, falling square-wave impact,
   // and three short debris cracks. Quantization gives the retro texture.
   const age=Math.floor(t*5500)/5500;
   const square=Math.sign(Math.sin(2*Math.PI*(155*age-130*age*age)));
   value=(Math.round(n*5)/5*.75+square*.25)*Math.exp(-t*19);
   for(const a of [.045,.09,.155])if(t>=a)value+=Math.round(n*3)/3*.4*Math.exp(-(t-a)*65);
  }else if(kind==='rest'){
   for(const [j,f] of [261.63,329.63,392,329.63,261.63].entries()){const a=t-j*.16;if(a>=0)value+=(Math.sin(2*Math.PI*f*a)+.12*Math.sin(2*Math.PI*f*2*a))*Math.exp(-a*6)*Math.min(1,a/.025)*.28;}
  }else if(kind==='bottle'){
   value=(Math.sin(2*Math.PI*1260*t)+.3*Math.sin(2*Math.PI*2070*t))*Math.exp(-t*24)*.5+low*.2*Math.exp(-t*40);
   const a=t-.06;if(a>=0)value+=Math.sin(2*Math.PI*(490*a+700*a*a))*Math.exp(-a*35)*Math.min(1,a/.008)*.25;
  }else if(kind==='learn'){
   for(const [j,f] of [659.25,783.99,987.77,1318.5].entries()){const a=t-j*.065;if(a>=0)value+=(Math.sin(2*Math.PI*f*a)+.2*Math.sin(2*Math.PI*f*2*a))*Math.exp(-a*10)*Math.min(1,a/.008)*.3;}
  }else if(kind==='stone'){
   // A solid rounded stone contact followed by a happy enchanted resonance.
   value=(Math.sin(2*Math.PI*220*t)*.5+Math.sin(2*Math.PI*503*t)*.18)*Math.exp(-t*24)+low*.7*Math.exp(-t*70);
   for(const [j,f] of [783.99,987.77,1318.5].entries()){
    const a=t-.035-j*.04;if(a>=0)value+=(Math.sin(2*Math.PI*f*a)+.08*Math.sin(2*Math.PI*f*2*a))*Math.exp(-a*12)*Math.min(1,a/.015)*.17;
   }
  }else if(kind==='upgrade'){
   // A gathering magical swell, a full warm chord, then a sparkling release.
   const swell=Math.sin(Math.PI*Math.min(1,t/.7))**2;
   value=(low*.9+Math.sin(2*Math.PI*(150*t+100*t*t))*.2)*swell;
   const a=t-.48;
   if(a>=0){
    const envelope=Math.min(1,a/.035)*Math.exp(-a*3.5);
    for(const f of [261.63,392,523.25,659.25])value+=(Math.sin(2*Math.PI*f*a)+.1*Math.sin(2*Math.PI*f*2*a))*envelope*.19;
   }
   for(const [j,f] of [1046.5,1318.5,1567.98].entries()){
    const age=t-.62-j*.08;if(age>=0)value+=Math.sin(2*Math.PI*f*age)*Math.exp(-age*7)*Math.min(1,age/.012)*.12;
   }
  }else if(kind==='start'){
   for(const [j,f] of [523.25,659.25,783.99,1046.5].entries()){const age=t-j*.09;if(age>=0)value+=(Math.sin(2*Math.PI*f*age)+.15*Math.sin(2*Math.PI*f*2*age))*Math.exp(-age*8)*Math.min(1,age/.008)*.3;}
  }else if(kind==='hurt'){
   value=(.6*Math.sin(2*Math.PI*(145*t-180*t*t))+low*.3)*Math.exp(-t*28);
  }else if(kind==='fire'||kind==='flareBolt'){
   const whoosh=low*4*Math.sin(Math.PI*u)**.7;
   const crackle=n*(Math.sin(t*163)**18)*Math.exp(-t*5)*.32;
   value=whoosh+crackle+.1*Math.sin(2*Math.PI*(90*t-45*t*t))*Math.exp(-t*6);
   if(kind==='flareBolt'){
    value+=n*.55*(Math.sin(t*211)**16)*Math.exp(-t*4);
    value+=Math.sign(Math.sin(2*Math.PI*(1350*t-900*t*t)))*.13*Math.exp(-t*12);
   }
  }else if(kind==='water'){
   for(let j=0;j<6;j++){const age=t-j*.065;if(age>=0&&age<.19){const f=430+j*92;value+=Math.sin(2*Math.PI*(f*age+900*age*age))*Math.exp(-age*26)*Math.min(1,age/.007)*.45;}}
   value+=low*.16*Math.sin(Math.PI*u);
  }else if(kind==='ancient'){
   value=(Math.sin(2*Math.PI*440*t)*.4+Math.sin(2*Math.PI*660*t)*.15)*Math.exp(-t*7);
  }else if(kind==='nature'){
   value=low*.7*Math.sin(Math.PI*u)*Math.exp(-t*2);
   for(const [j,f] of [523.25,659.25,783.99].entries()){const age=t-j*.085;if(age>=0)value+=(Math.sin(2*Math.PI*f*age)+.18*Math.sin(2*Math.PI*f*2*age))*Math.exp(-age*9)*Math.min(1,age/.009)*.25;}
  }else{
   value=(n*.45+Math.sin(2*Math.PI*(420*t-320*t*t))*.14)*Math.exp(-t*8);
  }
  samples[i]=value*(kind==='rain'?1:attack*end);
 }
 // Overlap the rain's tail and head with equal-power fades. The resulting
 // loop crosses into a contiguous noise sequence, without a silent seam.
 if(kind==='rain'){
  const overlap=Math.round(SOUND_RATE*.2),length=samples.length-overlap,loop=new Float32Array(length);
  loop.set(samples.subarray(overlap,samples.length-overlap));
  for(let i=0;i<overlap;i++){
   const phase=i/overlap*Math.PI/2;
   loop[length-overlap+i]=samples[samples.length-overlap+i]*Math.cos(phase)+samples[i]*Math.sin(phase);
  }
  samples=loop;
 }
 // Every preset has a bounded peak; stronger casts increase gain, never clipping.
 const peak=samples.reduce((m,v)=>Math.max(m,Math.abs(v)),.001);
 for(let i=0;i<samples.length;i++)samples[i]*=.9/peak;
 return samples;
}

type AudioEnvironment={createContext:()=>AudioContext|null;isVisible:()=>boolean;now:()=>number};
function browserAudioContext(){
 // Keep game effects mixable with music and other phone audio. Configure the
 // session before creating Web Audio; unsupported browsers keep their defaults.
 try{const session=(navigator as unknown as {audioSession?:{type:string}}).audioSession;if(session)session.type='ambient';}catch{}
 const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 return Constructor?new Constructor():null;
}
export function createSpellAudio(environment:AudioEnvironment={createContext:browserAudioContext,isVisible:()=>!document.hidden,now:()=>performance.now()}){
 let context:AudioContext|null=null,primed:AudioContext|null=null;
 let recycleOnGesture=false,needsWakeCycle=false,waking:AudioContext|null=null;
 const buffers=new Map<SoundKind,AudioBuffer>();
 const activeGains=new Map<GainNode,number>();
 const loops=new Map<'rain'|'swamp',{source:AudioBufferSourceNode;gain:GainNode;expiresAt:number}>();
 const ambienceLeaseSeconds=.5;
 function stopLoop(kind:'rain'|'swamp'){
  const loop=loops.get(kind);if(!loop)return;
  loops.delete(kind);activeGains.delete(loop.gain);
  // Disconnect independently of stop/close promises: an interrupted mobile
  // context can leave those pending while an old looping source stays audible.
  try{loop.gain.gain.cancelScheduledValues(0);loop.gain.gain.value=0;}catch{}
  try{loop.source.stop();}catch{}
  try{loop.source.disconnect();}catch{}
  try{loop.gain.disconnect();}catch{}
 }
 function stopAmbience(){for(const kind of ['rain','swamp'] as const)stopLoop(kind);}

 function setAmbience(levels:{rain:number;swamp:number}){
  const ctx=context;if(!ctx)return;
  for(const kind of ['rain','swamp'] as const){
   const base=(ctx.state==='running'&&visible()?Math.max(0,Math.min(1,levels[kind])):0)*(kind==='rain'?.05:.08);
   if(!base){stopLoop(kind);continue;}
   let loop=loops.get(kind);
   if(loop&&ctx.currentTime>=loop.expiresAt){stopLoop(kind);loop=undefined;}
   if(!loop&&base>0){
    let buffer=buffers.get(kind);if(!buffer){const samples=soundSamples(kind);buffer=ctx.createBuffer(1,samples.length,SOUND_RATE);buffer.getChannelData(0).set(samples);buffers.set(kind,buffer);}
    const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;source.connect(gain);gain.connect(ctx.destination);gain.gain.value=0;
    loop={source,gain,expiresAt:ctx.currentTime+ambienceLeaseSeconds};loops.set(kind,loop);
    source.onended=()=>{
     if(loops.get(kind)?.source!==source)return;
     loops.delete(kind);activeGains.delete(gain);
     try{source.disconnect();}catch{}try{gain.disconnect();}catch{}
    };
    // Give every loop a real audio-engine deadline before any later UI work.
    try{source.start();source.stop(loop.expiresAt);}catch{stopLoop(kind);continue;}
   }
   if(!loop)continue;
   // Only current combat ambience updates may renew this deadline. Cast
   // effects, volume changes and resume callbacks cannot keep old rain alive.
   try{
    loop.expiresAt=ctx.currentTime+ambienceLeaseSeconds;loop.source.stop(loop.expiresAt);
    activeGains.set(loop.gain,base);loop.gain.gain.setTargetAtTime(base*audioChannelVolume('effects'),ctx.currentTime,.04);
   }catch{stopLoop(kind);}

  }
 }

 function refreshVolume(){for(const [gain,base] of activeGains){gain.gain.value=base*audioChannelVolume('effects');if([...loops.values()].some(loop=>loop.gain===gain)&&context)gain.gain.setTargetAtTime(base*audioChannelVolume('effects'),context.currentTime,.04);}}
 const visible=()=>environment.isVisible();
 function resume(ctx:AudioContext){if(ctx===context&&visible()&&ctx.state!=='running'&&ctx.state!=='closed')void ctx.resume().catch(()=>{});}
 function wake(){
  try{
   const ctx=context;if(!ctx||!visible()||ctx.state==='closed'||waking===ctx)return;
   if(needsWakeCycle){
    // Safari can report running while its audio clock/output is frozen.
    // A foreground suspend/resume cycle also resets an interrupted session.
    needsWakeCycle=false;waking=ctx;
    void ctx.suspend().then(()=>{if(ctx===context&&visible()&&ctx.state!=='closed')return ctx.resume();}).catch(()=>{}).finally(()=>{if(waking===ctx){waking=null;if(ctx===context&&visible()&&ctx.state!=='running')wake();}});
   }else resume(ctx);
  }catch{/* The next real interaction can replace a stranded audio context. */}
 }
 function sleep(){
  stopAmbience();
  const ctx=context;if(!ctx)return;
  recycleOnGesture=true;needsWakeCycle=true;primed=null;
  try{if(ctx.state!=='closed')void ctx.suspend().catch(()=>{});}catch{}
 }
 function unlock(){
  try{
   if(!visible())return;
   if(!context||context.state==='closed'||recycleOnGesture){
    // Never await an old resume/close: on iOS those promises may never settle.
    // Create and prime the replacement synchronously within this user gesture.
    const previous=context,next=environment.createContext();
    if(next){
     stopAmbience();
     context=next;primed=null;buffers.clear();activeGains.clear();loops.clear();recycleOnGesture=false;needsWakeCycle=false;waking=null;
     next.onstatechange=()=>{if(next!==context)return;if(String(next.state)==='interrupted')recycleOnGesture=true;wake();};
     if(previous){previous.onstatechange=null;try{if(previous.state!=='closed')void previous.close().catch(()=>{});}catch{}}
    }
   }
   if(!context)return;
   const needsPrime=primed!==context||context.state!=='running';
   resume(context); // Includes Safari's interrupted state, not only suspended.
   if(needsPrime){
    const source=context.createBufferSource();source.buffer=context.createBuffer(1,1,context.sampleRate);
    source.connect(context.destination);source.onended=()=>source.disconnect();source.start();primed=context;
   }
  }catch{/* Input and combat keep working if browser/device audio is unavailable. */}
 }
 function playNow(ctx:AudioContext,kind:SoundKind,quality:number){
  if(ctx!==context||ctx.state!=='running'||!visible())return;
  let buffer=buffers.get(kind);
  if(!buffer){const samples=soundSamples(kind);buffer=ctx.createBuffer(1,samples.length,SOUND_RATE);buffer.getChannelData(0).set(samples);buffers.set(kind,buffer);}
  const source=ctx.createBufferSource(),gain=ctx.createGain();
  source.buffer=buffer;source.loop=false;source.playbackRate.value=kind==='aquaspout'?1.15:kind==='bramble'?.88:1;const base=kind in UI_SOUND_VOLUME?UI_SOUND_VOLUME[kind as UISound]:kind==='rustle'?.22:kind==='start'?.4:kind==='hurt'?.4:kind==='fizzle'?.22:kind==='cloud'?.16:kind==='mud'?.25:castVolume(quality);
  gain.gain.value=base*audioChannelVolume('effects');activeGains.set(gain,base);
  source.connect(gain);gain.connect(ctx.destination);
  source.onended=()=>{activeGains.delete(gain);source.disconnect();gain.disconnect();};source.start();
 }
 function play(kind:SoundKind,quality:number){
  try{
   const ctx=context;if(!ctx||ctx.state==='closed'||!visible())return;
   if(ctx.state==='running'){playNow(ctx,kind,quality);return;}
   // Resume asynchronously before playing; discard old effects rather than
   // replaying a backlog when the player returns from a lock screen or call.
   const requested=environment.now();
   void ctx.resume().then(()=>{if(environment.now()-requested<=250)playNow(ctx,kind,quality);}).catch(()=>{});
  }catch{/* Do not interrupt game state if audio is blocked. */}
 }
 return{unlock,wake,sleep,play,refreshVolume,setAmbience,stopAmbience};
}
const spellAudio=createSpellAudio();
audioPreferences.subscribe(spellAudio.refreshVolume);
export function stopSpellAmbience(){spellAudio.stopAmbience();}
export function setSpellAmbience(levels:{rain:number;swamp:number}){spellAudio.setAmbience(levels);}
export function unlockSpellAudio(){spellAudio.unlock();}
export function playSpellSound(kind:SoundKind,quality:number){spellAudio.play(kind,quality);}

export function playUISound(kind:UISound){spellAudio.unlock();spellAudio.play(kind,0);}

export function installSpellAudio(){
 loadAudioPreferences();
 // Native capture listeners run before React handlers and cover the opening
 // checkmark, menu choices, drawing, potions and keyboard activation alike.
 const gestures=['pointerdown','touchend','click','keydown'];
 const options={capture:true,passive:true};
 for(const name of gestures)document.addEventListener(name,unlockSpellAudio,options);
 const visibility=()=>document.hidden?spellAudio.sleep():spellAudio.wake();
 document.addEventListener('visibilitychange',visibility);
 window.addEventListener('focus',spellAudio.wake);window.addEventListener('pageshow',spellAudio.wake);window.addEventListener('pagehide',spellAudio.sleep);
 return()=>{
  spellAudio.stopAmbience();
  for(const name of gestures)document.removeEventListener(name,unlockSpellAudio,options);
  document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('focus',spellAudio.wake);window.removeEventListener('pageshow',spellAudio.wake);window.removeEventListener('pagehide',spellAudio.sleep);
 };
}
