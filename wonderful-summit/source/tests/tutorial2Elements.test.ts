import test from 'node:test';
import assert from 'node:assert/strict';
import {ELEMENT_STEPS,LESSONS,newElementTutorial,elementStep,elementLesson,elementBattle,elementActionAllowed,transitionElement,resolveElementCast,finishAmbush,replayElement,elementTrace} from '../src/tutorial2Elements.ts';
import {stepBattle,launchSpell,drinkPotion} from '../src/battle.ts';
import {recognize,SPELLS} from '../src/magic.ts';
import {pauseTutorial2,resumeTutorial2} from '../src/tutorial2.ts';
const at=(id:string)=>({...newElementTutorial(),index:ELEMENT_STEPS.findIndex(s=>s.id===id),token:50});
test('all three elemental lessons run in order through the real action and result gates',()=>{
 let s=newElementTutorial();const lessons=new Set<number>();let count=0;
 while(s.phase!=='complete'&&count++<100){lessons.add(elementLesson(s));const step=elementStep(s);
  if(step.id==='water-ambush'){s=finishAmbush(s,s.token);continue;}
  if(step.id.endsWith('-impact')){s=resolveElementCast(s,{token:s.token-1,spellId:LESSONS[elementLesson(s)].spell,quality:60,enemyHP:0});continue;}
  if(step.kind==='dialogue')s=transitionElement(s,{type:'continue',token:s.token});
  else if(step.kind==='demonstration')s=transitionElement(s,{type:'demonstration-finished',completion:step.completion,token:s.token});
  else if(step.kind==='settling')s=transitionElement(s,{type:'tick',deltaMs:step.durationMs,token:s.token});
  else if(step.kind==='action'){assert.equal(elementActionAllowed(s,step.action,step.spellId),true);s=transitionElement(s,{type:'action',action:step.action,spellId:step.spellId,token:s.token});}
 }
 assert.equal(s.phase,'complete');assert.deepEqual([...lessons],[0,1,2]);
});
test('nature clear and water heal/refill cannot be skipped by unrelated or stale events',()=>{
 for(const [id,action] of [['nature-clear','clear'],['water-heal','heal'],['nature-refill','refill']] as const){
  const s=at(id);assert.equal(transitionElement(s,{type:'action',action:'cast',token:s.token}),s);
  assert.equal(transitionElement(s,{type:'action',action,token:s.token-1}),s);
  assert.equal(transitionElement(s,{type:'action',action,token:s.token}).index,s.index+1);
 }
});
test('each 24 HP slime requires Steady or better with the correct advantageous spell',()=>{
 for(let lesson=0;lesson<3;lesson++)for(const quality of [48,59,60]){let b=launchSpell(elementBattle(lesson),quality,'blue',LESSONS[lesson].spell);for(let i=0;i<50;i++)b=stepBattle(b,.1);assert.equal(b.enemies[0].hp<=0,quality>=60);}
 for(const lesson of LESSONS){const s=at(`${lesson.id}-impact`);for(const result of [{spellId:null,quality:0,enemyHP:24},{spellId:lesson.spell,quality:59,enemyHP:1}]){const retry=resolveElementCast(s,{...result,token:s.token-1});assert.equal(elementStep(retry).id,`${lesson.id}-retry`);assert.equal(retry.resetSerial,s.resetSerial+1);assert.equal(retry.retry,true);}}
});
test('water ambush deals real contact damage before the potion lesson and stops further attacks',()=>{
 let b=elementBattle(2,true);for(let i=0;i<50&&!b.playerHits;i++)b=stepBattle(b,.05);
 assert.equal(b.playerHits,1);assert.equal(b.playerHP,88);b.approachAt=Infinity;
 const s=at('water-ambush');assert.equal(finishAmbush(s,s.token-1),s);assert.equal(elementStep(finishAmbush(s,s.token)).id,'water-hit-wait');
 b=drinkPotion(b,'heal');for(let i=0;i<100;i++)b=stepBattle(b,.1);assert.equal(b.playerHP,100);assert.equal(b.playerHits,1);assert.equal(b.potions.heal,0);
});
test('new lessons demonstrate canonical paths in the agreed direction and duration',()=>{
 assert.deepEqual(LESSONS.map(l=>l.duration),[4500,4000,4000]);
 for(const l of LESSONS){const t=elementTrace(l.spell,1);assert.equal(recognize(t.strokes).spell?.id,l.spell);assert.equal(recognize(t.strokes).quality,100);}
 assert.deepEqual(elementTrace('fire',0).tip,{x:50,y:12});assert.ok(elementTrace('fire',.1).tip.x<50);
 assert.deepEqual(elementTrace('nature',0).tip,{x:20,y:20});assert.deepEqual(elementTrace('nature',1).strokes,SPELLS.find(s=>s.id==='nature')!.strokes);
});
test('pause and replay preserve the active lesson and invalidate prior cast results',()=>{
 for(const l of LESSONS){const s=at(`${l.id}-cast`),paused={...s,...pauseTutorial2(s)};assert.equal(replayElement(paused),paused);assert.equal(transitionElement(paused,{type:'action',action:'cast',token:s.token}),paused);
 const resumed={...paused,...resumeTutorial2(paused)},replay=replayElement(resumed);assert.equal(elementStep(replay).id,`${l.id}-demo`);assert.equal(replay.resetSerial,s.resetSerial+1);assert.equal(resolveElementCast(replay,{token:s.token,spellId:l.spell,quality:100,enemyHP:0}),replay);}
});

test('ambush and Belladora use separate ordered arrival and reading delays',()=>{
 for(const [id,duration,next] of [['fire-enter',800,'fire-arrival-wait'],['fire-arrival-wait',600,'fire-intro'],['water-enter',800,'water-pre-attack'],['water-pre-attack',1500,'water-ambush'],['water-hit-wait',1500,'water-injury'],['water-arrive',1000,'water-arrival-wait'],['water-arrival-wait',1500,'water-heal']] as const){
  let s=at(id);s=transitionElement(s,{type:'tick',deltaMs:duration-1,token:s.token});assert.equal(elementStep(s).id,id);
  const paused={...s,...pauseTutorial2(s)};assert.equal(transitionElement(paused,{type:'tick',deltaMs:5000,token:s.token}),paused);
  s=transitionElement(s,{type:'tick',deltaMs:1,token:s.token});assert.equal(elementStep(s).id,next);
 }
});
test('Little Sprout cast reminder waits six active seconds across drawing and ignores stale ticks',()=>{
 let s=at('water-draw');s=transitionElement(s,{type:'tick',deltaMs:3000,token:s.token});
 s=transitionElement(s,{type:'action',action:'draw',token:s.token});assert.equal(elementStep(s).id,'water-cast');assert.equal(s.elapsedMs,3000);
 assert.equal(elementActionAllowed(s,'cast'),true);
 s=transitionElement(s,{type:'tick',deltaMs:2999,token:s.token});assert.equal(s.elapsedMs,5999);
 assert.equal(transitionElement(s,{type:'tick',deltaMs:500,token:s.token-1}),s);
 s=transitionElement(s,{type:'tick',deltaMs:1,token:s.token});assert.equal(s.elapsedMs,6000);
 const cast=transitionElement(s,{type:'action',action:'cast',token:s.token});assert.equal(elementStep(cast).id,'water-impact');
 assert.equal(transitionElement(cast,{type:'tick',deltaMs:9000,token:cast.token}),cast);
});

test('potion press starts an explicit 1.8 second wait before the next spell lesson',()=>{
 let s=at('water-heal');s=transitionElement(s,{type:'action',action:'heal',token:s.token});assert.equal(elementStep(s).id,'water-potion-wait');
 assert.equal(elementActionAllowed(s,'heal'),false);
 s=transitionElement(s,{type:'tick',deltaMs:1799,token:s.token});assert.equal(elementStep(s).id,'water-potion-wait');
 s=transitionElement(s,{type:'tick',deltaMs:1,token:s.token});assert.equal(elementStep(s).id,'water-recovered');assert.equal(elementStep(s).text,'Much better. You’ll pay for this water slime!');
 s=transitionElement(s,{type:'continue',token:s.token});assert.equal(elementStep(s).id,'water-book');
 let b=elementBattle(2,true);b.playerHP=88;b.approachAt=Infinity;b=drinkPotion(b,'heal');for(let i=0;i<18;i++)b=stepBattle(b,.1);assert.equal(b.playerHP,100);
});

test('sub-Steady casts show Try again for one active second, then return to the static guide',()=>{
 for(const lesson of LESSONS){const impact=at(`${lesson.id}-impact`);let s=resolveElementCast(impact,{token:impact.token-1,spellId:lesson.spell,quality:59,enemyHP:8});
 assert.equal(elementStep(s).id,`${lesson.id}-retry`);assert.equal(elementStep(s).text,'Try again');assert.equal(elementActionAllowed(s,'cast'),false);
 s=transitionElement(s,{type:'tick',deltaMs:999,token:s.token});assert.equal(elementStep(s).id,`${lesson.id}-retry`);
 const paused={...s,...pauseTutorial2(s)};assert.equal(transitionElement(paused,{type:'tick',deltaMs:5000,token:s.token}),paused);
 s=transitionElement(s,{type:'tick',deltaMs:1,token:s.token});assert.equal(elementStep(s).id,`${lesson.id}-draw`);
 }
});

test('victory quips advance after the shared dialogue reading hold without an extra hidden delay',()=>{
 for(const lesson of LESSONS){let s=at(`${lesson.id}-victory`);s=transitionElement(s,{type:'continue',token:s.token});if(lesson.id==='water')assert.equal(s.phase,'complete');else assert.equal(elementStep(s).id,lesson.id==='fire'?'nature-intro':'nature-elements');}
});

test('the spill is cleared and ink refilled before Hearthspark is required',()=>{
 const ids=ELEMENT_STEPS.map(s=>s.id);
 assert.ok(ids.indexOf('nature-spill')<ids.indexOf('nature-clear'));
 assert.ok(ids.indexOf('nature-clear')<ids.indexOf('nature-refill'));
 assert.ok(ids.indexOf('nature-refill')<ids.indexOf('nature-draw'));
 assert.equal(ids.includes('water-refill'),false);
 let s=at('nature-refill');assert.equal(elementActionAllowed(s,'draw'),false);
 s=transitionElement(s,{type:'action',action:'refill',token:s.token});assert.equal(elementStep(s).id,'nature-refilled');assert.equal(elementStep(s).text,'Ok, back to taking down this nature slime.');
 s=transitionElement(s,{type:'continue',token:s.token});assert.equal(elementStep(s).id,'nature-book');
});

test('element advantages require an explicit Continue after Nature victory, before the Water ambush',()=>{
 let s=at('nature-victory');s=transitionElement(s,{type:'continue',token:s.token});
 const info=elementStep(s);assert.equal(info.id,'nature-elements');assert.equal(info.kind,'dialogue');
 assert.ok(info.kind==='dialogue'&&info.presentation==='screen');
 assert.equal(info.text,'Water beats Fire. Fire beats Nature. Nature beats Water. Use the elements to your advantage to deal extra damage!');
 assert.equal(elementLesson(s),1);
 assert.equal(transitionElement(s,{type:'tick',deltaMs:10000,token:s.token}),s);
 assert.equal(transitionElement(s,{type:'continue',token:s.token-1}),s);
 const continued=transitionElement(s,{type:'continue',token:s.token});assert.equal(elementStep(continued).id,'water-enter');
 assert.equal(transitionElement(continued,{type:'continue',token:s.token}),continued);
});
