import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chargeColor,SPELLS,refillDurationMs,refillInk} from '../src/magic.ts';
import {castVolume,soundSamples,SOUND_RATE,type CastSound} from '../src/sound.ts';

test('charge stays purple until halfway, then uses the recognized element',()=>{
 for(const spell of SPELLS){assert.equal(chargeColor(.499,spell.color),'#d9b9ff');assert.equal(chargeColor(.5,spell.color),spell.color);assert.equal(chargeColor(1,spell.color),spell.color);}
 assert.equal(chargeColor(1),'#d9b9ff');
});
test('all four sounds produce finite, bounded audio with silent ends',()=>{
 for(const kind of ['fire','water','nature','fizzle'] as CastSound[]){
  const samples=soundSamples(kind);
  assert.ok(samples.length>SOUND_RATE*.3&&samples.length<SOUND_RATE);
  assert.equal(Math.abs(samples[0]),0);
  assert.ok(Math.abs(samples.at(-1)!)<.002);
  assert.ok(samples.every(v=>Number.isFinite(v)&&Math.abs(v)<=.901));
  const rms=Math.sqrt(samples.reduce((sum,v)=>sum+v*v,0)/samples.length);
  assert.ok(rms>.03,'effect should contain audible signal');
 }
});
test('stronger casts amplify each elemental effect within safe output bounds',()=>{
 for(const kind of ['fire','water','nature'] as CastSound[]){
  const samples=soundSamples(kind),energy=samples.reduce((sum,v)=>sum+v*v,0);
  assert.ok(energy*castVolume(100)**2>energy*castVolume(50)**2);
  assert.ok(samples.every(v=>Math.abs(v*castVolume(100))<1));
 }
 assert.equal(castVolume(-20),castVolume(0));assert.equal(castVolume(150),castVolume(100));
});
test('elemental effects have distinct audio signatures',()=>{
 const kinds:CastSound[]=['fire','water','nature','fizzle'];
 const signatures=kinds.map(kind=>Array.from(soundSamples(kind).slice(100,120)).join(','));
 assert.equal(new Set(signatures).size,4);
});

test('player hurt cue is brief, finite, and silent at its boundaries',()=>{
 const samples=soundSamples('hurt');assert.ok(samples.length<=SOUND_RATE*.15);assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);assert.ok(samples.every(v=>Number.isFinite(v)&&Math.abs(v)<1));assert.ok(samples.some(v=>Math.abs(v)>.1));
});

test('partial refills progress at one percentage point per 10 milliseconds',()=>{
 for(const initial of [0,40,75,95,55.7]){const duration=refillDurationMs(initial);assert.ok(Math.abs(duration-(100-initial)*10)<1e-9);assert.ok(Math.abs(refillInk(initial,10)-Math.min(100,initial+1))<1e-9);assert.ok(Math.abs(refillInk(initial,duration/2)-(initial+(100-initial)/2))<1e-9);assert.equal(refillInk(initial,duration),100);assert.equal(refillInk(initial,duration+1000),100);}
 assert.equal(refillDurationMs(100),0);assert.equal(refillInk(40,0),40);
});
