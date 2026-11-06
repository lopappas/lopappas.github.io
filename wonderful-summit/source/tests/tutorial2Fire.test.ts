import test from 'node:test';
import assert from 'node:assert/strict';
import {newTutorial2Fire,TUTORIAL2_FIRE_STEPS as steps,transitionTutorial2Fire,resolveTutorial2FireCast,tutorial2FireBattle,fireActionAllowed,fireCanReplay,replayTutorial2Fire,DEWDROP_DEMO_MS,DEWDROP_TRACE,dewdropTrace} from '../src/tutorial2Fire.ts';
import {pauseTutorial2,resumeTutorial2} from '../src/tutorial2.ts';
import {launchSpell,stepBattle,spellDamage} from '../src/battle.ts';
import {recognize,SPELLS} from '../src/magic.ts';
function at(id:string){return{...newTutorial2Fire(),index:steps.findIndex(s=>s.id===id),token:10};}
function outcome(quality:number){let b=launchSpell(tutorial2FireBattle(),quality,'blue','water');for(let i=0;i<10;i++)b=stepBattle(b,.1);return b;}
test('the first lesson always starts with one 24 HP Fire slime and no attacks or relic modifiers',()=>{
 const b=tutorial2FireBattle();assert.equal(b.enemies.length,1);assert.equal(b.enemies[0].element,'Fire');assert.equal(b.enemies[0].hp,24);assert.equal(b.enemies[0].maxHP,24);assert.equal(b.damageBonus,1);assert.equal(b.lotus,false);
 let next=b;for(let i=0;i<1000;i++)next=stepBattle(next,.1);assert.equal(next.playerHP,100);assert.equal(next.playerHits,0);assert.equal(next.enemies[0].x,b.enemies[0].x);
});
test('a 60 percent advantageous Dewdrop kills in one hit while all successful Faint scores cannot',()=>{
 for(let q=48;q<60;q++){assert.ok(spellDamage({element:'Fire'},q,'water')<24);assert.ok(outcome(q).enemies[0].hp>0);}
 assert.equal(outcome(60).phase,'victory');assert.equal(outcome(60).enemies[0].hp,0);
});
test('the authored flow requires book, explicit Dewdrop selection, book close and demonstration before drawing',()=>{
 let state=newTutorial2Fire();assert.equal(steps[state.index].id,'fire-intro');state=transitionTutorial2Fire(state,{type:'continue',token:state.token});
 for(const [action,spellId] of [['book',undefined],['select','water'],['close','water']] as const)state=transitionTutorial2Fire(state,{type:'action',action,spellId,token:state.token});
 assert.equal(steps[state.index].id,'fire-demo');assert.equal(fireActionAllowed(state,'draw'),false);assert.equal(fireActionAllowed(state,'cast'),false);
 state=transitionTutorial2Fire(state,{type:'demonstration-finished',completion:'dewdrop',token:state.token});assert.equal(steps[state.index].id,'fire-draw');
 assert.equal(fireActionAllowed(state,'cast'),false);state=transitionTutorial2Fire(state,{type:'action',action:'draw',token:state.token});assert.equal(steps[state.index].id,'fire-cast');assert.equal(fireActionAllowed(state,'draw'),true);assert.equal(fireActionAllowed(state,'clear'),true);
});
test('casting locks controls until the projectile resolves, rather than advancing on a button tap',()=>{
 const state=at('fire-cast'),next=transitionTutorial2Fire(state,{type:'action',action:'cast',token:state.token});assert.equal(steps[next.index].id,'fire-impact');assert.equal(fireCanReplay(next),false);
 for(const action of ['draw','clear','cast','book','heal','refill'] as const)assert.equal(fireActionAllowed(next,action),false);
 assert.equal(transitionTutorial2Fire(next,{type:'tick',deltaMs:10000,token:next.token}),next);
 assert.equal(resolveTutorial2FireCast(next,{token:state.token,spellId:'water',quality:60,enemyHP:0}).index,steps.findIndex(s=>s.id==='fire-victory'));
});
test('a fizzle, weak hit, surviving enemy or wrong spell returns to a fresh guided attempt',()=>{
 const state=at('fire-impact');
 for(const result of [{spellId:null,quality:0,enemyHP:24},{spellId:'water' as const,quality:59,enemyHP:8.25},{spellId:'water' as const,quality:60,enemyHP:1},{spellId:'fire' as const,quality:100,enemyHP:0}]){
  const next=resolveTutorial2FireCast(state,{...result,token:state.token-1});assert.equal(steps[next.index].id,'fire-draw');assert.equal(next.retry,true);assert.equal(next.resetSerial,state.resetSerial+1);assert.equal(next.token,state.token+1);
 }
});
test('stale results, duplicate results and results while paused cannot skip or reset later steps',()=>{
 const state=at('fire-impact'),result={token:state.token-1,spellId:'water' as const,quality:60,enemyHP:0};
 assert.equal(resolveTutorial2FireCast(state,{...result,token:state.token-2}),state);
 const paused={...state,...pauseTutorial2(state)};assert.equal(resolveTutorial2FireCast(paused,result),paused);
 const resumed={...paused,...resumeTutorial2(paused)},won=resolveTutorial2FireCast(resumed,result);assert.equal(resolveTutorial2FireCast(won,result),won);
});
test('Show me again is optional, restarts the demonstration and resets the current drawing attempt',()=>{
 for(const id of ['fire-draw','fire-cast']){const state=at(id);assert.equal(fireCanReplay(state),true);const replay=replayTutorial2Fire(state);assert.equal(steps[replay.index].id,'fire-demo');assert.equal(replay.resetSerial,state.resetSerial+1);assert.equal(replay.token,state.token+1);}
 for(const id of ['fire-intro','fire-demo','fire-impact','fire-victory']){const state=at(id);assert.equal(replayTutorial2Fire(state),state);}
});
test('clear returns to drawing with fresh ink, and repeat drawing never skips the hold-to-cast step',()=>{
 const state=at('fire-cast'),cleared=transitionTutorial2Fire(state,{type:'action',action:'clear',token:state.token});assert.equal(steps[cleared.index].id,'fire-draw');assert.equal(cleared.resetSerial,1);
 assert.equal(transitionTutorial2Fire(state,{type:'action',action:'draw',token:state.token}),state);
});
test('the Dewdrop demonstration lasts 4.5 seconds, starts at the top and moves counterclockwise',()=>{
 assert.equal(DEWDROP_DEMO_MS,4500);assert.deepEqual(DEWDROP_TRACE[0],{x:50,y:8});assert.ok(DEWDROP_TRACE[1].x<50);
 assert.deepEqual(dewdropTrace(0).tip,{x:50,y:8});assert.ok(dewdropTrace(.1).tip.x<50);assert.deepEqual(dewdropTrace(1).tip,{x:50,y:8});assert.deepEqual(dewdropTrace(10),dewdropTrace(1));assert.deepEqual(dewdropTrace(-1),dewdropTrace(0));
});
test('the demonstrated path remains a perfect Dewdrop through the real recognizer',()=>{
 assert.equal(recognize([dewdropTrace(1).points]).spell?.id,'water');assert.equal(recognize([dewdropTrace(1).points]).quality,100);
 assert.deepEqual([...DEWDROP_TRACE].reverse(),SPELLS.find(s=>s.id==='water')!.strokes[0]);
});
