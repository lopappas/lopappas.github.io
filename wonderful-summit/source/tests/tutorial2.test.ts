import test from 'node:test';
import assert from 'node:assert/strict';
import {newTutorial2,transitionTutorial2,pauseTutorial2,resumeTutorial2,canTutorial2Action,tutorial2Step,tutorial2Journey,tutorial2FoundationBattle,TUTORIAL2_FOUNDATION_STEPS as steps,type Tutorial2Step,type Tutorial2Event} from '../src/tutorial2.ts';
import {stepBattle} from '../src/battle.ts';

test('the preview advances only through the authored sequence of real control actions',()=>{
 let state=newTutorial2(steps);assert.equal(tutorial2Step(steps,state)?.id,'welcome');
 state=transitionTutorial2(steps,state,{type:'continue',token:state.token});
 for(const [action,spellId] of [['book',undefined],['select','water'],['close','water'],['draw',undefined],['clear',undefined]] as const){
  assert.equal(canTutorial2Action(steps,state,action,spellId),true);
  state=transitionTutorial2(steps,state,{type:'action',action,spellId,token:state.token});
 }
 assert.equal(tutorial2Step(steps,state)?.id,'preview-finished');state=transitionTutorial2(steps,state,{type:'continue',token:state.token});
 assert.equal(state.phase,'complete');assert.equal(tutorial2Step(steps,state),null);assert.equal(pauseTutorial2(state),state);
});
test('dialogue cannot be completed by gameplay and irrelevant controls remain locked',()=>{
 const initial=newTutorial2(steps);
 for(const action of ['book','select','close','draw','clear','cast','refill','heal'] as const){assert.equal(canTutorial2Action(steps,initial,action),false);assert.equal(transitionTutorial2(steps,initial,{type:'action',action,token:initial.token}),initial);}
 const active=transitionTutorial2(steps,initial,{type:'continue',token:0});
 for(const action of ['cast','refill','heal','clear','draw'] as const){assert.equal(canTutorial2Action(steps,active,action),false);assert.equal(transitionTutorial2(steps,active,{type:'action',action,token:active.token}),active);}
 assert.equal(transitionTutorial2(steps,active,{type:'continue',token:active.token}),active);
});
test('viewing a default spell or choosing the wrong spell cannot complete the selection step',()=>{
 let state=newTutorial2(steps);state=transitionTutorial2(steps,state,{type:'continue',token:0});state=transitionTutorial2(steps,state,{type:'action',action:'book',token:state.token});
 assert.equal(canTutorial2Action(steps,state,'select','fire'),false);assert.equal(canTutorial2Action(steps,state,'close'),false);
 assert.equal(transitionTutorial2(steps,state,{type:'action',action:'select',spellId:'fire',token:state.token}),state);
 assert.equal(transitionTutorial2(steps,state,{type:'action',action:'book',token:state.token}),state);
 assert.equal(transitionTutorial2(steps,state,{type:'action',action:'select',spellId:'water',token:state.token}).index,state.index+1);
});
test('rapid duplicate taps and stale callbacks cannot skip a step, even when action types repeat',()=>{
 const sequence:Tutorial2Step[]=[{id:'a',kind:'dialogue',text:'a'},{id:'b',kind:'dialogue',text:'b'},{id:'c',kind:'action',text:'c',target:'book',action:'book'}];
 const state=newTutorial2(sequence),event:Tutorial2Event={type:'continue',token:state.token},next=transitionTutorial2(sequence,state,event);
 for(let i=0;i<20;i++)assert.equal(transitionTutorial2(sequence,next,event),next);
 assert.equal(next.index,1);assert.equal(transitionTutorial2(sequence,next,{...event,token:next.token}).index,2);
});
test('pause and resume preserve the exact step and reject events while paused',()=>{
 let state=transitionTutorial2(steps,newTutorial2(steps),{type:'continue',token:0});
 for(let i=0;i<5;i++){const paused=pauseTutorial2(state);assert.equal(paused.phase,'paused');assert.equal(paused.index,state.index);assert.equal(paused.token,state.token);assert.equal(pauseTutorial2(paused),paused);
  assert.equal(canTutorial2Action(steps,paused,'book'),false);assert.equal(transitionTutorial2(steps,paused,{type:'action',action:'book',token:paused.token}),paused);
  state=resumeTutorial2(paused);assert.equal(state.phase,'running');assert.equal(state.index,1);
 }
 assert.equal(transitionTutorial2(steps,state,{type:'action',action:'book',token:state.token}).index,2);
});
test('demonstrations accept only the matching completion and cannot be tapped past',()=>{
 const sequence:Tutorial2Step[]=[{id:'brush',kind:'demonstration',text:'watch',completion:'dewdrop-brush'},{id:'after',kind:'dialogue',text:'after'}];const state=newTutorial2(sequence);
 for(const event of [{type:'continue'},{type:'tick',deltaMs:1e6},{type:'action',action:'draw'},{type:'demonstration-finished',completion:'wrong'}] as const)assert.equal(transitionTutorial2(sequence,state,{...event,token:0}),state);
 const event:Tutorial2Event={type:'demonstration-finished',completion:'dewdrop-brush',token:0},next=transitionTutorial2(sequence,state,event);assert.equal(next.index,1);assert.equal(transitionTutorial2(sequence,next,event),next);
});
test('settling time advances only on valid unpaused ticks and preserves progress across pause',()=>{
 const sequence:Tutorial2Step[]=[{id:'impact',kind:'settling',text:'wait',durationMs:1000},{id:'next',kind:'dialogue',text:'next'}];let state=newTutorial2(sequence);
 for(const deltaMs of [0,-1,NaN,Infinity])assert.equal(transitionTutorial2(sequence,state,{type:'tick',deltaMs,token:0}),state);
 state=transitionTutorial2(sequence,state,{type:'tick',deltaMs:400,token:0});const paused=pauseTutorial2(state);assert.equal(transitionTutorial2(sequence,paused,{type:'tick',deltaMs:5000,token:0}),paused);
 state=resumeTutorial2(paused);assert.equal(state.elapsedMs,400);state=transitionTutorial2(sequence,state,{type:'tick',deltaMs:599,token:0});assert.equal(state.index,0);state=transitionTutorial2(sequence,state,{type:'tick',deltaMs:1,token:0});assert.equal(state.index,1);assert.equal(state.elapsedMs,0);
});
test('a restarted sequence can use a fresh token to reject callbacks from the previous attempt',()=>{
 const state=newTutorial2(steps,100);assert.equal(transitionTutorial2(steps,state,{type:'continue',token:0}),state);assert.equal(transitionTutorial2(steps,state,{type:'continue',token:100}).index,1);
});
test('invalid or ambiguous step definitions fail immediately',()=>{
 assert.throws(()=>newTutorial2([]));assert.throws(()=>newTutorial2([steps[0],steps[0]]));assert.throws(()=>newTutorial2([{id:'bad',kind:'settling',text:'',durationMs:NaN}]));
});
test('the foundation uses a safe isolated battle without changing journey state or old tutorial',()=>{
 const journey=tutorial2Journey(),battle=tutorial2FoundationBattle(),snapshot=structuredClone(journey);assert.deepEqual(journey.relics,[]);assert.equal(journey.health,100);assert.equal(battle.enemies[0].element,'Fire');
 let next=battle;for(let i=0;i<1000;i++)next=stepBattle(next,.1);assert.equal(next.playerHP,100);assert.equal(next.enemies[0].x,battle.enemies[0].x);assert.equal(next.playerHits,0);assert.deepEqual(journey,snapshot);
});
