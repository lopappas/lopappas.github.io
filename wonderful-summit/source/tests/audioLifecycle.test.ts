import {audioPreferences} from '../src/audioPreferences.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpellAudio,FIRESTORM_AUDIO_ENABLED,spellCastSound,installSpellAudio,UI_SOUND_VOLUME,soundSamples,SOUND_RATE} from '../src/sound.ts';

class DeviceAudio{
 sources:{loop:boolean;expiresAt:number;ended:boolean;onended:(()=>void)|null}[]=[];
 advanceAudio(seconds:number){this.currentTime+=seconds;for(const source of this.sources)if(!source.ended&&source.expiresAt<=this.currentTime){source.ended=true;source.onended?.();}}
 currentTime=0;stops=0;sourceDisconnects=0;gainDisconnects=0;stopThrows=false;state='suspended';sampleRate=48000;destination={};onstatechange:(()=>void)|null=null;
 offsets:number[]=[];rates:number[]=[];gains:{gain:{value:number}}[]=[];resumes=0;suspends=0;closes=0;starts:number[]=[];buffers=0;
 resumeAction=async()=>{this.state='running';};
 resume(){this.resumes++;return this.resumeAction();}
 suspend(){this.suspends++;this.state='suspended';return Promise.resolve();}
 close(){this.closes++;this.state='closed';return Promise.resolve();}
 createBuffer(_channels:number,length:number){this.buffers++;const samples=new Float32Array(length);return{length,owner:this,getChannelData:()=>samples};}
 createBufferSource(){
  const device=this;
  const source={expiresAt:Infinity,ended:false,stop(at?:number){if(at===undefined||at<=device.currentTime)device.stops++;if(device.stopThrows)throw Error('interrupted');this.expiresAt=at??device.currentTime;},loop:false,playbackRate:{value:1},buffer:null as ReturnType<DeviceAudio['createBuffer']>|null,onended:null as (()=>void)|null,connect(){},disconnect(){device.sourceDisconnects++;},start(_when=0,offset=0){device.offsets.push(offset);assert.strictEqual(this.buffer?.owner,device);device.starts.push(this.buffer!.length);device.rates.push(this.playbackRate.value);}};device.sources.push(source);return source;
 }
 createGain(){const device=this;const gain={gain:{value:0,cancelScheduledValues(){},setTargetAtTime(value:number){this.value=value;}},connect(){},disconnect(){device.gainDisconnects++;}};this.gains.push(gain);return gain;}
}
function device(firestormAudio=true){
 const devices:DeviceAudio[]=[];let visible=true,now=0;
 const audio=createSpellAudio({createContext:()=>{const ctx=new DeviceAudio();devices.push(ctx);return ctx as unknown as AudioContext;},isVisible:()=>visible,now:()=>now},firestormAudio?{firestormAudio:true}:{});
 return{audio,devices,setVisible:(value:boolean)=>visible=value,setNow:(value:number)=>now=value};
}
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};

test('remaining UI effects are distinct, bounded and brief, with silent sample boundaries',()=>{
 assert.deepEqual(Object.keys(UI_SOUND_VOLUME).sort(),['bottle','learn','rest','robes','shatter','stone','upgrade']);
 const signatures=new Set<string>();
 for(const kind of Object.keys(UI_SOUND_VOLUME) as Array<keyof typeof UI_SOUND_VOLUME>){
  const samples=soundSamples(kind);
  assert.ok(samples.every(value=>Number.isFinite(value)&&Math.abs(value)<=.901));
  assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);
  assert.ok(samples.some(value=>Math.abs(value)>.1));assert.ok(UI_SOUND_VOLUME[kind]>.1&&UI_SOUND_VOLUME[kind]<.4);
  signatures.add(Array.from(samples.slice(100,120)).join(','));
 }
 assert.equal(signatures.size,7);
 assert.ok(soundSamples('learn').length>SOUND_RATE*.5);
 assert.equal(soundSamples('upgrade').length,Math.ceil(SOUND_RATE*1.4));
});

test('startup chime has finite bounded signals and silent ends',()=>{
 for(const kind of ['start'] as const){
  const samples=soundSamples(kind);assert.ok(samples.every(value=>Number.isFinite(value)&&Math.abs(value)<=.901));
  assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);assert.ok(samples.some(value=>Math.abs(value)>.1));
  assert.ok(samples.length/SOUND_RATE<.8);
 }
});

test('first interaction activates one audio context and reuses it on later touches',async()=>{
 const d=device();d.audio.play('water',60);assert.equal(d.devices.length,0);
 d.audio.unlock();assert.equal(d.devices.length,1);assert.deepEqual(d.devices[0].starts,[1]);await flush();
 d.audio.unlock();d.audio.play('water',60);d.audio.play('water',80);
 assert.equal(d.devices.length,1);assert.equal(d.devices[0].buffers,2);assert.equal(d.devices[0].starts.filter(n=>n>1).length,2);
});

test('suspended and Safari interrupted sounds resume before playback instead of being dropped',async()=>{
 for(const state of ['suspended','interrupted']){
  const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];ctx.state=state;
  const count=ctx.starts.length;d.audio.play('fire',80);assert.equal(ctx.starts.length,count);
  await flush();assert.equal(ctx.state,'running');assert.equal(ctx.starts.length,count+1);assert.ok(ctx.resumes>=2);
 }
});

test('foreground recovery and context state changes resume audio; hidden pages stay silent',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];
 d.setVisible(false);d.audio.sleep();assert.equal(ctx.state,'suspended');const resumes=ctx.resumes,starts=ctx.starts.length;
 d.audio.wake();d.audio.unlock();d.audio.play('hurt',0);assert.equal(ctx.resumes,resumes);assert.equal(ctx.starts.length,starts);
 d.setVisible(true);d.audio.wake();await flush();assert.equal(ctx.state,'running');
 ctx.state='interrupted';ctx.onstatechange!();await flush();assert.equal(ctx.state,'running');d.audio.play('hurt',0);assert.ok(ctx.starts.at(-1)!>1);
});

test('closed audio contexts recreate on the next interaction with fresh context-owned buffers',async()=>{
 const d=device();d.audio.unlock();await flush();d.audio.play('nature',100);const first=d.devices[0];first.state='closed';
 d.audio.unlock();await flush();d.audio.play('nature',100);
 assert.equal(d.devices.length,2);assert.equal(first.onstatechange,null);assert.equal(d.devices[1].buffers,2);assert.ok(d.devices[1].starts.at(-1)!>1);
});

test('blocked resumes do not break input, and old sounds are discarded after a long interruption',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];ctx.state='interrupted';
 ctx.resumeAction=()=>Promise.reject(new Error('Gesture required'));
 assert.doesNotThrow(()=>{d.audio.unlock();d.audio.play('fizzle',0);});await flush();
 let finish!:()=>void;ctx.resumeAction=()=>new Promise(resolve=>{finish=()=>{ctx.state='running';resolve();};});
 const starts=ctx.starts.length;d.audio.play('hurt',0);d.setNow(1000);finish();await flush();assert.equal(ctx.starts.length,starts);
 d.audio.play('water',70);assert.equal(ctx.starts.length,starts+1);
 const unavailable=createSpellAudio({createContext:()=>null,isVisible:()=>true,now:()=>0});assert.doesNotThrow(()=>{unavailable.unlock();unavailable.play('water',70);});
});

test('native startup listeners unlock input, recover pagehide/pageshow and clean up on unmount',async()=>{
 const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
 const doc=Object.assign(new EventTarget(),{hidden:false});const contexts:DeviceAudio[]=[];
 class Context extends DeviceAudio{constructor(){super();contexts.push(this);}}
 const win=Object.assign(new EventTarget(),{AudioContext:Context});
 Object.defineProperty(globalThis,'document',{configurable:true,value:doc});Object.defineProperty(globalThis,'window',{configurable:true,value:win});
 try{
  const cleanup=installSpellAudio();
  for(const event of ['pointerdown','touchend','click','keydown']){doc.dispatchEvent(new Event(event));assert.equal(contexts.length,1);}
  const ctx=contexts[0];assert.ok(ctx.resumes>=1);doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));
  doc.hidden=false;ctx.state='interrupted';const before=ctx.resumes;win.dispatchEvent(new Event('pageshow'));await flush();assert.equal(ctx.resumes,before+1);
  win.dispatchEvent(new Event('pagehide'));assert.equal(ctx.state,'suspended');win.dispatchEvent(new Event('pageshow'));await flush();doc.dispatchEvent(new Event('touchend'));assert.equal(contexts.length,2);assert.equal(ctx.closes,1);
  cleanup();const live=contexts[1],suspends=live.suspends;live.state='closed';doc.dispatchEvent(new Event('touchend'));win.dispatchEvent(new Event('pagehide'));assert.equal(contexts.length,2);assert.equal(live.suspends,suspends);
 }finally{
  if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else Reflect.deleteProperty(globalThis,'document');
  if(previousWindow)Object.defineProperty(globalThis,'window',previousWindow);else Reflect.deleteProperty(globalThis,'window');
 }
});


test('a never-resolving foreground resume cannot strand audio after the next real interaction',async()=>{
 const d=device();d.audio.unlock();await flush();d.audio.play('water',70);const old=d.devices[0],pending:(()=>void)[]=[];
 old.state='interrupted';old.resumeAction=()=>new Promise(resolve=>{pending.push(()=>{old.state='running';resolve();});});
 d.audio.play('fire',80);const oldStarts=old.starts.length;
 d.setVisible(false);d.audio.sleep();d.setVisible(true);d.audio.wake();await flush();
 d.audio.unlock();d.audio.play('nature',80);assert.equal(d.devices.length,2);assert.equal(old.closes,1);assert.equal(old.onstatechange,null);assert.ok(d.devices[1].starts.at(-1)!>1);
 pending.forEach(finish=>finish());await flush();assert.equal(old.starts.length,oldStarts);assert.equal(d.devices[1].state,'running');
});
test('a context falsely reporting running is cycled on return and replaced in the next gesture',async()=>{
 const d=device();d.audio.unlock();await flush();const old=d.devices[0];d.audio.play('water',70);
 d.setVisible(false);d.audio.sleep();old.state='running'; // Safari may expose running even with a stopped audio clock.
 const suspends=old.suspends;d.setVisible(true);d.audio.wake();assert.equal(old.suspends,suspends+1);await flush();
 d.audio.unlock();d.audio.play('water',70);assert.equal(d.devices.length,2);assert.equal(old.closes,1);assert.equal(d.devices[1].buffers,2);assert.ok(d.devices[1].starts.at(-1)!>1);
});
test('repeated background switches retire each old context only once and never initialize audio while hidden',async()=>{
 const d=device();d.setVisible(false);d.audio.unlock();assert.equal(d.devices.length,0);d.setVisible(true);d.audio.unlock();await flush();
 for(let i=0;i<4;i++){
  const old=d.devices.at(-1)!;d.setVisible(false);d.audio.sleep();d.audio.unlock();assert.equal(d.devices.length,i+1);
  d.setVisible(true);d.audio.wake();d.audio.unlock();await flush();d.audio.unlock();d.audio.unlock();d.audio.play('hurt',0);
  assert.equal(d.devices.length,i+2);assert.equal(old.closes,1);assert.equal(old.onstatechange,null);assert.ok(d.devices.at(-1)!.starts.at(-1)!>1);
 }
});


test('master and effects sliders change playing and future effects, including after context recovery',async()=>{
 const d=device();try{
  d.audio.unlock();await flush();d.audio.play('water',80);const first=d.devices[0],base=first.gains[0].gain.value;
  audioPreferences.set('master',.5);audioPreferences.set('effects',.4);d.audio.refreshVolume();assert.equal(first.gains[0].gain.value,base*.2);
  audioPreferences.set('music',0);d.audio.play('water',80);assert.equal(first.gains[1].gain.value,base*.2);
  d.setVisible(false);d.audio.sleep();d.setVisible(true);d.audio.unlock();await flush();d.audio.play('water',80);assert.equal(d.devices[1].gains[0].gain.value,base*.2);
  audioPreferences.set('master',0);d.audio.refreshVolume();assert.equal(d.devices[1].gains[0].gain.value,0);d.audio.play('hurt',0);assert.equal(d.devices[1].gains[1].gain.value,0);
 }finally{for(const key of ['master','music','effects'] as const)audioPreferences.set(key,1);}
});


test('browser audio requests mixing before context creation, including after a background return',async()=>{
 const originals=new Map(['window','document','navigator'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const session={type:'auto'};const contexts:DeviceAudio[]=[];
 try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{audioSession:session}});
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{AudioContext:class extends DeviceAudio{
   constructor(){super();assert.equal(session.type,'ambient');contexts.push(this);}
  }}});
  const audio=createSpellAudio();audio.unlock();await flush();
  audio.play('water',60);assert.ok(contexts[0].starts.some(length=>length>1));
  audio.sleep();session.type='auto';audio.unlock();await flush();
  assert.equal(contexts.length,2);assert.equal(session.type,'ambient');
 }finally{
  for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
 }
});

test('spell-specific cues use the requested playback speeds and distinct bounded surf and electric signals',async()=>{
 const d=device();d.audio.unlock();await flush();
 for(const [id,element,kind,rate] of [['wave','Water','aquaspout',1.15],['leaf','Nature','bramble',.88],['tidalcrest','Water','tidalcrest',1],['bolt','Fire','flareBolt',1]] as const){
  assert.equal(spellCastSound({id,element}),kind);d.audio.play(kind,80);
  assert.equal(d.devices[0].rates.at(-1),rate);
  const samples=soundSamples(kind);assert.ok(samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=.901));assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);
 }
 assert.equal(spellCastSound(null),'fizzle');
 assert.notDeepEqual(soundSamples('tidalcrest'),soundSamples('water'));
 assert.notDeepEqual(soundSamples('flareBolt'),soundSamples('fire'));
});

test('rain and swamp layers mix, extend without restarting, fade with levels and stop cleanly',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0],before=ctx.starts.length;
 d.audio.setAmbience({rain:1,swamp:1});assert.equal(ctx.starts.length,before+2);
 d.audio.setAmbience({rain:1,swamp:1});assert.equal(ctx.starts.length,before+2);
 d.audio.setAmbience({rain:.5,swamp:.5});assert.equal(ctx.gains.at(-2)!.gain.value,.025);assert.equal(ctx.gains.at(-1)!.gain.value,.04);
 d.audio.setAmbience({rain:0,swamp:0});assert.equal(ctx.stops,2);
 d.audio.setAmbience({rain:0,swamp:0});assert.equal(ctx.stops,2);
 for(const kind of ['cloud','mud','rain','swamp'] as const){const samples=soundSamples(kind);assert.ok(samples.some(v=>Math.abs(v)>.1));assert.ok(samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=.901));}
});

test('rain loop retains continuous energy across its seam and Bog buzzes have quiet gaps',()=>{
 const rain=soundSamples('rain'),window=2000;
 const rms=(values:Float32Array)=>Math.sqrt(values.reduce((n,v)=>n+v*v,0)/values.length);
 const seam=new Float32Array(window*2);seam.set(rain.subarray(rain.length-window));seam.set(rain.subarray(0,window),window);
 const ratio=rms(seam)/rms(rain.subarray(5000,9000));assert.ok(ratio>.7&&ratio<1.3);
 const bugs=soundSamples('swamp');assert.ok(bugs.subarray(0,SOUND_RATE*.5).every(v=>v===0));
 assert.ok(bugs.subarray(SOUND_RATE,Math.floor(SOUND_RATE*1.4)).some(v=>Math.abs(v)>.1));
 assert.ok(bugs.subarray(SOUND_RATE*2,SOUND_RATE*3).every(v=>v===0));
});

test('interrupted rain is disconnected before context replacement even when stop fails and close never settles',async()=>{
 const d=device();d.audio.unlock();await flush();const old=d.devices[0];
 d.audio.setAmbience({rain:1,swamp:1});old.stopThrows=true;
 old.close=()=>{old.closes++;return new Promise<void>(()=>{});};
 old.state='interrupted';old.onstatechange?.();d.audio.unlock();
 assert.equal(d.devices.length,2);assert.equal(old.stops,2);
 assert.equal(old.sourceDisconnects,2);assert.equal(old.gainDisconnects,2);
 await flush();const next=d.devices[1],starts=next.starts.length;d.audio.play('water',80);
 assert.equal(next.starts.length,starts+1);d.audio.setAmbience({rain:0,swamp:0});assert.equal(next.stops,0);
});
test('expired rain, hidden pages and battle teardown disconnect loops even if a source refuses to stop',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];
 d.audio.setAmbience({rain:1,swamp:0});ctx.stopThrows=true;d.audio.setAmbience({rain:0,swamp:0});
 assert.equal(ctx.sourceDisconnects,1);assert.equal(ctx.gainDisconnects,1);
 d.audio.setAmbience({rain:1,swamp:0});d.audio.sleep();assert.equal(ctx.sourceDisconnects,2);
 d.audio.stopAmbience();assert.equal(ctx.sourceDisconnects,2);
});

test('rain expires in the audio engine even when its final game stop update is missed',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];
 d.audio.setAmbience({rain:1,swamp:0});const rain=ctx.sources.find(s=>s.loop)!;
 ctx.advanceAudio(.3);d.audio.play('water',60);d.audio.refreshVolume();ctx.advanceAudio(.3);assert.equal(rain.ended,true);assert.equal(ctx.sourceDisconnects,1);
 const before=ctx.starts.length;d.audio.play('fire',80);d.audio.play('water',80);
 assert.equal(ctx.starts.length,before+2);assert.equal(ctx.sources.filter(s=>s.loop&&!s.ended).length,0);
});
test('active rain renews continuously, restarts after an expired callback, and leaves no loop in a new encounter',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];
 d.audio.setAmbience({rain:1,swamp:0});const first=ctx.sources.find(s=>s.loop)!,before=ctx.starts.length;
 ctx.advanceAudio(.3);d.audio.setAmbience({rain:1,swamp:0});ctx.advanceAudio(.3);assert.equal(first.ended,false);assert.equal(ctx.starts.length,before);
 ctx.advanceAudio(.3);assert.equal(first.ended,true);d.audio.setAmbience({rain:1,swamp:0});assert.equal(ctx.starts.length,before+1);
 d.audio.stopAmbience();d.audio.play('nature',80);ctx.advanceAudio(.6);assert.equal(ctx.sources.filter(s=>s.loop&&!s.ended).length,0);
});

test('cloud roll-in is a tracked non-looping cue that ends with its visual phase and never contaminates other casts',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];d.audio.setCloudRollIn(.8);
 assert.equal(ctx.offsets.at(-1),.8);const cloud=ctx.sources.at(-1)!;assert.equal(cloud.loop,false);const starts=ctx.starts.length;
 ctx.advanceAudio(.2);d.audio.setCloudRollIn(1);d.audio.play('water',80);assert.equal(ctx.starts.length,starts+1);
 d.audio.setCloudRollIn(2);assert.equal(ctx.sourceDisconnects,1);ctx.advanceAudio(.6);assert.equal(cloud.ended,true);
 d.audio.play('fire',80);d.audio.play('nature',80);assert.equal(ctx.starts.filter(n=>n===SOUND_RATE*2).length,1);
 d.setNow(3000);d.audio.setCloudRollIn(0);d.audio.stopAmbience();assert.equal(ctx.sourceDisconnects,2);
});
test('cancelled or ended Firestorm prevents a delayed cloud cue from replaying when browser audio resumes',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0],before=ctx.starts.length;
 ctx.state='suspended';let resume!:()=>void;ctx.resumeAction=()=>new Promise<void>(resolve=>{resume=()=>{ctx.state='running';resolve();};});
 d.audio.play('cloud',80);d.audio.setCloudRollIn(null);resume();await flush();
 assert.equal(ctx.starts.length,before);d.audio.play('water',80);assert.equal(ctx.starts.length,before+1);
});

test('other spell cues disconnect Firestorm rain and cloud sources for the entire cue duration',async()=>{
 for(const [kind,duration] of [['water',.58],['aquaspout',.58/1.15],['bramble',.7/.88],['tidalcrest',1.15],['flareBolt',.48],['mud',.8]] as const){
  const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];
  d.audio.setAmbience({rain:1,swamp:1});d.audio.setCloudRollIn(0);const before=ctx.starts.length;
  d.audio.play(kind,80);assert.equal(ctx.sourceDisconnects,2,kind);assert.equal(ctx.starts.length,before+1);
  d.audio.setAmbience({rain:1,swamp:1});d.audio.setCloudRollIn(.1);assert.equal(ctx.starts.length,before+1);
  d.setNow((duration+.05)*1000);d.audio.setAmbience({rain:1,swamp:1});assert.equal(ctx.starts.length,before+1);
  d.setNow((duration+.13)*1000);d.audio.setAmbience({rain:1,swamp:1});assert.equal(ctx.starts.length,before+2);
 }
});
test('a later short cast cannot shorten Firestorm isolation for an earlier longer sound, and absent Firestorm stays silent',async()=>{
 const d=device();d.audio.unlock();await flush();const ctx=d.devices[0];
 d.audio.setAmbience({rain:1,swamp:0});d.audio.play('tidalcrest',80);d.setNow(100);d.audio.play('fire',80);
 const before=ctx.starts.length;d.setNow(800);d.audio.setAmbience({rain:1,swamp:0});assert.equal(ctx.starts.length,before);
 d.setNow(1400);d.audio.setAmbience({rain:0,swamp:0});d.audio.setCloudRollIn(null);assert.equal(ctx.starts.length,before);
});

test('production default blocks every Firestorm audio path without creating buffers or sources',async()=>{
 assert.equal(FIRESTORM_AUDIO_ENABLED,false);
 const d=device(false);d.audio.unlock();await flush();const ctx=d.devices[0],starts=ctx.starts.length,buffers=ctx.buffers;
 for(const age of [0,.2,.8,1.5,2,8]){d.audio.setCloudRollIn(age);d.audio.setAmbience({rain:1,swamp:0});d.audio.play('cloud',80);d.audio.play('rain',80);}
 assert.equal(ctx.starts.length,starts);assert.equal(ctx.buffers,buffers);
 ctx.state='suspended';const resumes=ctx.resumes;d.audio.play('cloud',80);d.audio.play('rain',80);assert.equal(ctx.resumes,resumes);
});
test('all other spell cues and Bog ambience work before and after attempted Firestorm audio',async()=>{
 const d=device(false);d.audio.unlock();await flush();const ctx=d.devices[0];
 const kinds=['water','fire','nature','ancient','aquaspout','bramble','flareBolt','tidalcrest','mud'] as const;
 for(const kind of kinds){const before=ctx.starts.length;d.audio.play(kind,80);assert.equal(ctx.starts.length,before+1);}
 const signatures=ctx.starts.slice(-kinds.length),rates=ctx.rates.slice(-kinds.length);
 d.audio.setCloudRollIn(0);d.audio.setAmbience({rain:1,swamp:0});d.audio.play('cloud',80);
 for(const kind of kinds)d.audio.play(kind,80);
 assert.deepEqual(ctx.starts.slice(-kinds.length),signatures);assert.deepEqual(ctx.rates.slice(-kinds.length),rates);
 const before=ctx.starts.length;d.audio.setAmbience({rain:1,swamp:1});assert.equal(ctx.starts.length,before+1);
});
