import {audioPreferences,audioChannelVolume,loadAudioPreferences} from './audioPreferences.ts';
import type {Element} from './magic';

export type CastSound=Lowercase<Element>|'fizzle'|'hurt'|'start';
export type UISound='bottle'|'learn'|'stone'|'upgrade'|'rest';
export const UI_SOUND_VOLUME:Record<UISound,number>={bottle:.24,learn:.32,stone:.29,upgrade:.36,rest:.3};
type SoundKind=CastSound|UISound;
export const SOUND_RATE=22050;
export function castVolume(quality:number){const q=Math.max(0,Math.min(100,quality))/100;return .18+.32*q*q;}

// Original synthesized effects: no downloads, microphone access, or audio assets.
export function soundSamples(kind:SoundKind):Float32Array{
 const duration=kind==='rest'?1.25:kind==='upgrade'?1.4:kind==='bottle'?.24:kind==='learn'?.65:kind==='stone'?.55:kind==='start'?.78:kind==='hurt'?.14:kind==='nature'?.7:kind==='water'?.58:.48;
 const samples=new Float32Array(Math.ceil(duration*SOUND_RATE));
 let seed=19,low=0;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 for(let i=0;i<samples.length;i++){
  const t=i/SOUND_RATE,u=t/duration;
  const attack=Math.min(1,t/.012),end=Math.min(1,(duration-t)/.04);
  const n=noise();low+=.12*(n-low);
  let value=0;
  if(kind==='rest'){
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
  }else if(kind==='fire'){
   const whoosh=low*4*Math.sin(Math.PI*u)**.7;
   const crackle=n*(Math.sin(t*163)**18)*Math.exp(-t*5)*.32;
   value=whoosh+crackle+.1*Math.sin(2*Math.PI*(90*t-45*t*t))*Math.exp(-t*6);
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
  samples[i]=value*attack*end;
 }
 // Every preset has a bounded peak; stronger casts increase gain, never clipping.
 const peak=samples.reduce((m,v)=>Math.max(m,Math.abs(v)),.001);
 for(let i=0;i<samples.length;i++)samples[i]*=.9/peak;
 return samples;
}

type AudioEnvironment={createContext:()=>AudioContext|null;isVisible:()=>boolean;now:()=>number};
function browserAudioContext(){
 // Supported iPhones otherwise classify Web Audio as ambient audio. Request
 // playback when the player first interacts; unsupported browsers keep defaults.
 try{const session=(navigator as unknown as {audioSession?:{type:string}}).audioSession;if(session)session.type='playback';}catch{}
 const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 return Constructor?new Constructor():null;
}
export function createSpellAudio(environment:AudioEnvironment={createContext:browserAudioContext,isVisible:()=>!document.hidden,now:()=>performance.now()}){
 let context:AudioContext|null=null,primed:AudioContext|null=null;
 let recycleOnGesture=false,needsWakeCycle=false,waking:AudioContext|null=null;
 const buffers=new Map<SoundKind,AudioBuffer>();
 const activeGains=new Map<GainNode,number>();
 function refreshVolume(){for(const [gain,base] of activeGains)gain.gain.value=base*audioChannelVolume('effects');}
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
     context=next;primed=null;buffers.clear();activeGains.clear();recycleOnGesture=false;needsWakeCycle=false;waking=null;
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
  source.buffer=buffer;const base=kind in UI_SOUND_VOLUME?UI_SOUND_VOLUME[kind as UISound]:kind==='start'?.4:kind==='hurt'?.4:kind==='fizzle'?.22:castVolume(quality);
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
 return{unlock,wake,sleep,play,refreshVolume};
}
const spellAudio=createSpellAudio();
audioPreferences.subscribe(spellAudio.refreshVolume);
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
  for(const name of gestures)document.removeEventListener(name,unlockSpellAudio,options);
  document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('focus',spellAudio.wake);window.removeEventListener('pageshow',spellAudio.wake);window.removeEventListener('pagehide',spellAudio.sleep);
 };
}
