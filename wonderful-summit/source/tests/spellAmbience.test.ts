import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,launchSpell,projectilePosition,stepBattle} from '../src/battle.ts';
import {eruptionJustBurst,soundSamples} from '../src/sound.ts';
import {spellAmbience,shouldPlaySpellArrival} from '../src/spellAmbience.ts';
test('rain starts at rainfall, swamp starts on arrival, fades match the visual endings and combat pauses stop both',()=>{
 let b=launchSpell(newBattle('active'),60,'#fff','firestorm');b=launchSpell(b,60,'#fff','bog');
 assert.deepEqual(spellAmbience(b),{rain:0,swamp:0,sizzle:0});
 assert.equal(shouldPlaySpellArrival('firestorm',b),false);assert.equal(shouldPlaySpellArrival('bog',b),false);assert.equal(shouldPlaySpellArrival('bog',{...b,time:100}),true);
 assert.equal(spellAmbience({...b,time:1.5}).swamp,1);assert.equal(spellAmbience({...b,time:1.5}).rain,0);
 assert.deepEqual(spellAmbience({...b,time:2.3}),{rain:1,swamp:1,sizzle:0});
 assert.ok(Math.abs(spellAmbience({...b,time:b.bog!.portions.at(-1)!.until-.2}).swamp-.5)<1e-8);
 assert.ok(Math.abs(spellAmbience({...b,time:b.firestorm!.portions.at(-1)!.until-.15}).rain-.5)<1e-8);
 assert.deepEqual(spellAmbience({...b,time:2.3},true),{rain:0,swamp:0,sizzle:0});
 assert.deepEqual(spellAmbience({...b,time:2.3,phase:'victory'}),{rain:0,swamp:0,sizzle:0});
});
test('Bramble Leaf travels 30 percent slower with a wobble that converges on its target',()=>{
 const b=newBattle('active'),leaf=launchSpell(b,60,'#fff','leaf'),water=launchSpell(b,60,'#fff','water');
 assert.equal(leaf.projectile!.duration,water.projectile!.duration/.7);
 const p=leaf.projectile!,mid=projectilePosition({...leaf,time:p.duration*.5})!,end=projectilePosition({...leaf,time:p.duration})!;
 const start=projectilePosition(leaf)!;assert.ok(Math.abs(mid.y-(start.y+end.y)/2)>1);
 assert.ok(Math.abs(end.y-projectilePosition({...water,time:water.projectile!.duration})!.y)<1e-8);
});

test('Eruption sizzles during smoke and emits one blast when the magma appears',()=>{
 const initial=newBattle('active');
 const warning=launchSpell(initial,80,'#fff','eruption');
 assert.equal(shouldPlaySpellArrival('eruption',initial),false);
 assert.ok(spellAmbience(warning).sizzle>0);
 assert.equal(spellAmbience(warning,true).sizzle,0);
 let before=warning;
 for(let i=0;i<7;i++)before=stepBattle(before,.1);
 assert.ok(spellAmbience(before).sizzle>0);
 assert.equal(eruptionJustBurst(warning,before),false);
 const impact=stepBattle(before,.1);
 assert.equal(spellAmbience(impact).sizzle,0);
 assert.equal(eruptionJustBurst(before,impact),true);
 assert.equal(eruptionJustBurst(impact,stepBattle(impact,.1)),false);
 for(const cue of ['sizzle','eruptionBlast'] as const){
  const samples=soundSamples(cue);
  assert.ok(samples.every(Number.isFinite)&&samples.some(value=>Math.abs(value)>.1));
 }
});
