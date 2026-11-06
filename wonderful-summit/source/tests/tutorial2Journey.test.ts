import test from 'node:test';
import assert from 'node:assert/strict';
import {M5_STEPS,newM5Tutorial,isFinal,finalBattle,m5ActionAllowed,transitionM5,finishFinalBattle,retryFinal} from '../src/tutorial2Final.ts';
import {m4Lesson,m4Battle,resolveM4Cast,goblinDrawing,relicAwarded} from '../src/tutorial2Goblin.ts';
import {LESSONS,finishAmbush,replayElement} from '../src/tutorial2Elements.ts';
import {pauseTutorial2,resumeTutorial2} from '../src/tutorial2.ts';
import {recognize,SPELLS,type SpellId} from '../src/magic.ts';
import {launchSpell,stepBattle,drinkPotion,type Battle} from '../src/battle.ts';
function settle(b:Battle,seconds=1){for(let i=0;i<Math.ceil(seconds/.05);i++)b=stepBattle(b,.05);return b;}
function cast(b:Battle,spell:SpellId,quality:number){return settle(launchSpell(b,quality,'blue',spell));}
for(const roll of [0,.34,.67])test(`full tutorial reaches completion with real combat, retries and final element roll ${roll}`,()=>{
 let s=newM5Tutorial(),lesson=-1,b:Battle|null=null,reset=-1,failed=false,count=0;
 const visited=new Set<string>();
 while(s.phase!=='complete'&&count++<180){
  const step=M5_STEPS[s.index];visited.add(step.id);
  const current=isFinal(s)?4:m4Lesson(s);
  if(current!==lesson||s.resetSerial!==reset){lesson=current;reset=s.resetSerial;b=lesson===4?finalBattle(()=>roll):m4Battle(lesson,lesson===2);}
  assert.ok(b);
  const paused={...s,...pauseTutorial2(s)};
  assert.equal(transitionM5(paused,{type:'tick',deltaMs:99999,token:s.token}),paused);
  assert.equal(transitionM5(paused,{type:'continue',token:s.token}),paused);
  assert.equal(m5ActionAllowed(paused,'cast'),false);
  assert.deepEqual({...paused,...resumeTutorial2(paused)},s);
  assert.equal(transitionM5(s,{type:'continue',token:s.token-1}),s);
  if(step.id==='water-ambush'){
   for(let i=0;i<100&&!b.playerHits;i++)b=stepBattle(b,.05);
   assert.equal(b.playerHits,1);assert.equal(b.playerHP,88);b={...b,approachAt:Infinity};s=finishAmbush(s,s.token);continue;
  }
  if(step.id==='final-battle'){
   const spell=({Fire:'water',Nature:'fire',Water:'nature'} as const)[b.enemies[0].element as 'Fire'|'Water'|'Nature'];
   for(let i=0;i<8&&b.phase==='active';i++)b=cast(b,spell,100);
   assert.equal(b.phase,'victory');s=finishFinalBattle(s,s.token,b.phase);continue;
  }
  if(step.kind==='action'){
   assert.equal(m5ActionAllowed(s,step.action,step.spellId),true);
   const token=s.token;s=transitionM5(s,{type:'action',action:step.action,spellId:step.spellId,token});
   if(step.action==='heal'){b=settle(drinkPotion(b,'heal'),1.8);assert.equal(b.playerHP,100);assert.equal(b.potions.heal,0);}
   if(step.action==='cast'){
    const goblin=lesson===3,perfect=step.id.includes('perfect');
    const match=recognize(goblin?goblinDrawing(perfect):SPELLS.find(x=>x.id===LESSONS[lesson].spell)!.strokes,['fire','water','nature']);
    assert.ok(match.spell);const quality=!goblin&&!failed?59:match.quality;
    b=cast(b,match.spell.id,quality);
    if(!goblin&&!failed){failed=true;assert.ok(b.enemies[0].hp>0);}
    else if(goblin)assert.equal(b.enemies[0].hp,perfect?0:51.5);
    else assert.equal(b.phase,'victory');
    s=resolveM4Cast(s,{token,spellId:match.spell.id,quality,enemyHP:b.enemies[0].hp});
   }
   if(step.action==='inspect')assert.equal(M5_STEPS[s.index].id,'goblin-relic-reading');
  }else if(step.kind==='dialogue'){
   assert.equal(transitionM5(s,{type:'tick',deltaMs:600000,token:s.token}),s);
   s=transitionM5(s,{type:'continue',token:s.token});
  }else if(step.kind==='demonstration')s=transitionM5(s,{type:'demonstration-finished',completion:step.completion,token:s.token});
  else{
   assert.ok(step.durationMs>0,`unresolved combat gate: ${step.id}`);
   s=transitionM5(s,{type:'tick',deltaMs:step.durationMs,token:s.token});
  }
 }
 assert.equal(s.phase,'complete');assert.ok(count<180);assert.ok(relicAwarded(s));
 for(const id of ['fire-retry','nature-refilled','water-recovered','goblin-bad-cast','goblin-perfect-cast','goblin-relic-reading','final-complete'])assert.ok(visited.has(id),id);
});
test('replay and final retry invalidate old callbacks across encounter boundaries',()=>{
 let s={...newM5Tutorial(),index:M5_STEPS.findIndex(x=>x.id==='fire-cast'),token:40};
 const replay=replayElement(s);assert.equal(resolveM4Cast(replay,{token:s.token,spellId:'water',quality:100,enemyHP:0}),replay);
 s={...newM5Tutorial('final'),index:M5_STEPS.findIndex(x=>x.id==='final-battle'),token:90};
 const retried=retryFinal(s);assert.equal(finishFinalBattle(retried,s.token,'victory'),retried);
 const entering=transitionM5(retried,{type:'tick',deltaMs:800,token:retried.token});
 const active=transitionM5(entering,{type:'continue',token:entering.token});
 assert.equal(finishFinalBattle(active,s.token,'victory'),active);assert.ok(relicAwarded(active));
});
