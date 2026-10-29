import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpellAudio,installSpellAudio,UI_SOUND_VOLUME,soundSamples,SOUND_RATE} from '../src/sound.ts';

class DeviceAudio{
 state='suspended';sampleRate=48000;destination={};onstatechange:(()=>void)|null=null;
 resumes=0;suspends=0;closes=0;starts:number[]=[];buffers=0;
 resumeAction=async()=>{this.state='running';};
 resume(){this.resumes++;return this.resumeAction();}
 suspend(){this.suspends++;this.state='suspended';return Promise.resolve();}
 close(){this.closes++;this.state='closed';return Promise.resolve();}
 createBuffer(_channels:number,length:number){this.buffers++;const samples=new Float32Array(length);return{length,owner:this,getChannelData:()=>samples};}
 createBufferSource(){
  const device=this;
  return{playbackRate:{value:1},buffer:null as ReturnType<DeviceAudio['createBuffer']>|null,onended:null,connect(){},disconnect(){},start(){assert.strictEqual(this.buffer?.owner,device);device.starts.push(this.buffer!.length);}};
 }
 createGain(){return{gain:{value:0},connect(){},disconnect(){}};}
}
function device(){
 const devices:DeviceAudio[]=[];let visible=true,now=0;
 const audio=createSpellAudio({createContext:()=>{const ctx=new DeviceAudio();devices.push(ctx);return ctx as unknown as AudioContext;},isVisible:()=>visible,now:()=>now});
 return{audio,devices,setVisible:(value:boolean)=>visible=value,setNow:(value:number)=>now=value};
}
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};

test('remaining UI effects are distinct, bounded and brief, with silent sample boundaries',()=>{
 assert.deepEqual(Object.keys(UI_SOUND_VOLUME).sort(),['bottle','learn','rest','stone','upgrade']);
 const signatures=new Set<string>();
 for(const kind of Object.keys(UI_SOUND_VOLUME) as Array<keyof typeof UI_SOUND_VOLUME>){
  const samples=soundSamples(kind);
  assert.ok(samples.every(value=>Number.isFinite(value)&&Math.abs(value)<=.901));
  assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);
  assert.ok(samples.some(value=>Math.abs(value)>.1));assert.ok(UI_SOUND_VOLUME[kind]>.1&&UI_SOUND_VOLUME[kind]<.4);
  signatures.add(Array.from(samples.slice(100,120)).join(','));
 }
 assert.equal(signatures.size,5);
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
