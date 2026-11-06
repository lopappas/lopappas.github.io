import test from 'node:test';
import assert from 'node:assert/strict';
import {M4_STEPS,M4_LESSONS,newM4Tutorial,m4Lesson,m4ActionAllowed,transitionM4,resolveM4Cast,goblinBattle,goblinDrawing,relicAwarded} from '../src/tutorial2Goblin.ts';
import {ELEMENT_STEPS} from '../src/tutorial2Elements.ts';
import {pauseTutorial2} from '../src/tutorial2.ts';
import {recognize} from '../src/magic.ts';
import {launchSpell,stepBattle} from '../src/battle.ts';
const at=(id:string)=>({...newM4Tutorial(),index:M4_STEPS.findIndex(s=>s.id===id),token:100});
function hit(b:ReturnType<typeof goblinBattle>,quality:number){b=launchSpell(b,quality,'orange','fire');for(let i=0;i<20;i++)b=stepBattle(b,.1);return b;}
test('crude and perfect authored triangles score 48 and 100 at real canvas sizes',()=>{
 for(const size of [100,180,230,350])for(const perfect of [false,true]){
 const strokes=goblinDrawing(perfect).map(path=>path.map(p=>({x:271+(p.x-50)*size/100,y:193+(p.y-50)*size/100})));
 const match=recognize(strokes,['fire','water','nature']);assert.equal(match.spell?.id,'fire');assert.equal(match.quality,perfect?100:48);
 }
 assert.equal(M4_LESSONS[3].duration,3000);
 assert.ok(goblinDrawing(true,.5)[0].length<goblinDrawing(true,1)[0].length);
});
test('the real 48 and 100 percent casts exactly exhaust goblin health with no elemental advantage',()=>{
 let b=goblinBattle();assert.equal(b.enemies[0].kind,'goblin');assert.equal(b.enemies[0].element,'Neutral');assert.equal(b.enemies[0].hp,58);
 for(let i=0;i<100;i++)b=stepBattle(b,.1);assert.equal(b.playerHP,100);
 b=hit(b,48);assert.equal(b.enemies[0].hp,51.5);assert.equal(b.phase,'active');b=hit(b,100);assert.equal(b.enemies[0].hp,0);assert.equal(b.phase,'victory');
});
test('elemental milestone hands off into the goblin rather than ending the preview',()=>{
 let s=at('water-victory');s=transitionM4(s,{type:'continue',token:s.token});assert.equal(s.phase,'running');assert.equal(s.index,ELEMENT_STEPS.length);assert.equal(m4Lesson(s),3);
});
test('goblin cast steps permit only casting and wait for matching real combat outcomes',()=>{
 let s=at('goblin-bad-cast');for(const a of ['draw','clear','book','heal','inspect'] as const)assert.equal(m4ActionAllowed(s,a),false);
 s=transitionM4(s,{type:'action',action:'cast',token:s.token});assert.equal(M4_STEPS[s.index].id,'goblin-bad-impact');
 assert.equal(transitionM4(s,{type:'tick',deltaMs:9000,token:s.token}),s);
 assert.equal(resolveM4Cast(s,{token:s.token-2,spellId:'fire',quality:48,enemyHP:51.5}),s);
 s=resolveM4Cast(s,{token:s.token-1,spellId:'fire',quality:48,enemyHP:51.5});assert.equal(M4_STEPS[s.index].id,'goblin-silence');
 s=at('goblin-perfect-impact');const paused={...s,...pauseTutorial2(s)};assert.equal(resolveM4Cast(paused,{token:s.token-1,spellId:'fire',quality:100,enemyHP:0}),paused);
 s=resolveM4Cast(s,{token:s.token-1,spellId:'fire',quality:100,enemyHP:0});assert.equal(M4_STEPS[s.index].id,'goblin-defeat-wait');assert.equal(relicAwarded(s),false);
});
test('the relic dialogue leads directly to inspection with no old reward screen or delay',()=>{
 let s=at('goblin-qualities');assert.equal(relicAwarded(s),false);s=transitionM4(s,{type:'continue',token:s.token});assert.equal(M4_STEPS[s.index].text,'The goblin dropped a relic. Neat!');assert.equal(M4_STEPS[s.index].presentation,undefined);assert.equal(relicAwarded(s),true);
 s=transitionM4(s,{type:'continue',token:s.token});assert.equal(M4_STEPS[s.index].id,'goblin-relic-inspect');
 assert.equal(transitionM4(s,{type:'action',action:'continue-anywhere',token:s.token}),s);
 s=transitionM4(s,{type:'action',action:'inspect',token:s.token});assert.equal(M4_STEPS[s.index].id,'goblin-relic-continue');
 const token=s.token;s=transitionM4(s,{type:'action',action:'continue-anywhere',token});assert.equal(s.phase,'complete');assert.equal(relicAwarded(s),true);assert.equal(transitionM4(s,{type:'action',action:'continue-anywhere',token}),s);
});
test('the goblin defeat waits 1.8 active seconds before the quality explanation',()=>{
 let s=at('goblin-defeat-wait');s=transitionM4(s,{type:'tick',deltaMs:1799,token:s.token});assert.equal(M4_STEPS[s.index].id,'goblin-defeat-wait');
 const paused={...s,...pauseTutorial2(s)};assert.equal(transitionM4(paused,{type:'tick',deltaMs:9999,token:s.token}),paused);
 s=transitionM4(s,{type:'tick',deltaMs:1,token:s.token});assert.equal(M4_STEPS[s.index].id,'goblin-qualities');
});

test('milestone 4 preview starts at the goblin while the normal preview still begins with Fire',()=>{
 assert.equal(M4_STEPS[newM4Tutorial().index].id,'fire-enter');
 assert.equal(M4_STEPS[newM4Tutorial(true).index].id,'goblin-enter');
});
