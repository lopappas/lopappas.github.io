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
 for(const [id,action] of [['nature-clear','clear'],['water-heal','heal'],['water-refill','refill']] as const){
  const s=at(id);assert.equal(transitionElement(s,{type:'action',action:'cast',token:s.token}),s);
  assert.equal(transitionElement(s,{type:'action',action,token:s.token-1}),s);
  assert.equal(transitionElement(s,{type:'action',action,token:s.token}).index,s.index+1);
 }
});
test('each 24 HP slime requires Steady or better with the correct advantageous spell',()=>{
 for(let lesson=0;lesson<3;lesson++)for(const quality of [48,59,60]){let b=launchSpell(elementBattle(lesson),quality,'blue',LESSONS[lesson].spell);for(let i=0;i<50;i++)b=stepBattle(b,.1);assert.equal(b.enemies[0].hp<=0,quality>=60);}
 for(const lesson of LESSONS){const s=at(`${lesson.id}-impact`);for(const result of [{spellId:null,quality:0,enemyHP:24},{spellId:lesson.spell,quality:59,enemyHP:1}]){const retry=resolveElementCast(s,{...result,token:s.token-1});assert.equal(elementStep(retry).id,`${lesson.id}-draw`);assert.equal(retry.resetSerial,s.resetSerial+1);assert.equal(retry.retry,true);}}
});
test('water ambush deals real contact damage before the potion lesson and stops further attacks',()=>{
 let b=elementBattle(2,true);for(let i=0;i<50&&!b.playerHits;i++)b=stepBattle(b,.05);
 assert.equal(b.playerHits,1);assert.equal(b.playerHP,88);b.approachAt=Infinity;
 const s=at('water-ambush');assert.equal(finishAmbush(s,s.token-1),s);assert.equal(elementStep(finishAmbush(s,s.token)).id,'water-hit-wait');
 b=drinkPotion(b,'heal');for(let i=0;i<100;i++)b=stepBattle(b,.1);assert.equal(b.playerHP,100);assert.equal(b.playerHits,1);assert.equal(b.potions.heal,0);
});
test('new lessons demonstrate canonical paths in the agreed direction and duration',()=>{
 assert.deepEqual(LESSONS.map(l=>l.duration),[4500,4000,5000]);
 for(const l of LESSONS){const t=elementTrace(l.spell,1);assert.equal(recognize(t.strokes).spell?.id,l.spell);assert.equal(recognize(t.strokes).quality,100);}
 assert.deepEqual(elementTrace('fire',0).tip,{x:50,y:12});assert.ok(elementTrace('fire',.1).tip.x<50);
 assert.deepEqual(elementTrace('nature',0).tip,{x:20,y:20});assert.deepEqual(elementTrace('nature',1).strokes,SPELLS.find(s=>s.id==='nature')!.strokes);
});
test('pause and replay preserve the active lesson and invalidate prior cast results',()=>{
 for(const l of LESSONS){const s=at(`${l.id}-cast`),paused={...s,...pauseTutorial2(s)};assert.equal(replayElement(paused),paused);assert.equal(transitionElement(paused,{type:'action',action:'cast',token:s.token}),paused);
 const resumed={...paused,...resumeTutorial2(paused)},replay=replayElement(resumed);assert.equal(elementStep(replay).id,`${l.id}-demo`);assert.equal(replay.resetSerial,s.resetSerial+1);assert.equal(resolveElementCast(replay,{token:s.token,spellId:l.spell,quality:100,enemyHP:0}),replay);}
});

test('ambush and Belladora use separate ordered arrival and reading delays',()=>{
 for(const [id,duration,next] of [['nature-water-wait',1500,'water-ambush'],['water-hit-wait',1500,'water-injury'],['water-arrive',1000,'water-arrival-wait'],['water-arrival-wait',1500,'water-heal']] as const){
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
