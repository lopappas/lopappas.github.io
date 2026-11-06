import test from 'node:test';
import assert from 'node:assert/strict';
import {M5_STEPS,FINAL_START,newM5Tutorial,isFinal,finalBattle,m5ActionAllowed,transitionM5,finishFinalBattle,retryFinal} from '../src/tutorial2Final.ts';
import {M4_STEPS,relicAwarded} from '../src/tutorial2Goblin.ts';
import {pauseTutorial2,resumeTutorial2} from '../src/tutorial2.ts';
import {newBattle,stepBattle,launchSpell} from '../src/battle.ts';
const at=(id:string)=>({...newM5Tutorial('final'),index:M5_STEPS.findIndex(s=>s.id===id),token:88});
test('relic dismissal hands off to final entry, consuming its click without starting combat',()=>{
 let s=at('goblin-relic-continue');s=transitionM5(s,{type:'action',action:'continue-anywhere',token:s.token});
 assert.equal(s.index,FINAL_START);assert.equal(s.phase,'running');assert.ok(isFinal(s));assert.ok(relicAwarded(s));
 assert.equal(transitionM5(s,{type:'action',action:'continue-anywhere',token:s.token-1}),s);
 s=transitionM5(s,{type:'tick',deltaMs:800,token:s.token});assert.equal(M5_STEPS[s.index].id,'final-intro');
 assert.equal(m5ActionAllowed(s,'cast'),false);
 s=transitionM5(s,{type:'continue',token:s.token});assert.equal(M5_STEPS[s.index].id,'final-battle');
});
test('final slime is uniformly chosen from normal full health elemental slimes with fresh resources',()=>{
 const elements=new Set();
 for(const r of [0,.34,.67,.999]){const b=finalBattle(()=>r),normal=newBattle('active','slime',()=>r);elements.add(b.enemies[0].element);
 assert.equal(b.enemies.length,1);assert.equal(b.enemies[0].hp,normal.enemies[0].maxHP);assert.equal(b.enemies[0].hp,b.enemies[0].maxHP);
 assert.equal(b.playerHP,100);assert.equal(b.colorful,true);assert.deepEqual(b.potions,{heal:1,freeze:0,ink:0});assert.ok(Number.isFinite(b.approachAt));}
 assert.deepEqual([...elements].sort(),['Fire','Nature','Water']);
});
test('independent combat allows all learned spells and ordinary controls without advancing on input',()=>{
 const s=at('final-battle');for(const action of ['book','select','close','draw','clear','cast','refill','heal'] as const){assert.equal(m5ActionAllowed(s,action,'nature'),true);assert.equal(transitionM5(s,{type:'action',action,spellId:'nature',token:s.token}),s);}
 assert.equal(m5ActionAllowed(s,'inspect'),false);const paused=pauseTutorial2(s);assert.equal(m5ActionAllowed({...s,...paused},'cast'),false);
 assert.equal(finishFinalBattle({...s,...paused},s.token,'victory').index,s.index);
 assert.equal(finishFinalBattle(s,s.token-1,'victory'),s);assert.equal(finishFinalBattle(s,s.token,'defeat'),s);
});
test('final fight runs normal damage and can be lost; retry resets only final encounter',()=>{
 let b=finalBattle(()=>0);for(let i=0;i<3000&&b.phase==='active';i++)b=stepBattle(b,.1);assert.equal(b.phase,'defeat');
 const s=at('final-battle'),retry=retryFinal(s);assert.equal(retry.index,FINAL_START);assert.equal(retry.resetSerial,s.resetSerial+1);assert.ok(relicAwarded(retry));assert.equal(retry.token,s.token+1);
 const fresh=finalBattle(()=>0);assert.equal(fresh.playerHP,100);assert.equal(fresh.enemies[0].hp,fresh.enemies[0].maxHP);assert.equal(fresh.potions.heal,1);
 assert.equal(retryFinal({...s,...pauseTutorial2(s)}).index,s.index);
});
test('real victory alone advances final combat, followed by pause-safe 1.8 second settling',()=>{
 let b=finalBattle(()=>0);for(let cast=0;cast<5&&b.phase==='active';cast++){b=launchSpell(b,100,'blue','water');for(let i=0;i<20;i++)b=stepBattle(b,.1);}assert.equal(b.phase,'victory');
 let s=at('final-battle');s=finishFinalBattle(s,s.token,b.phase);assert.equal(M5_STEPS[s.index].id,'final-victory-wait');
 s=transitionM5(s,{type:'tick',deltaMs:1799,token:s.token});assert.equal(M5_STEPS[s.index].id,'final-victory-wait');
 const paused={...s,...pauseTutorial2(s)};assert.equal(transitionM5(paused,{type:'tick',deltaMs:9000,token:s.token}),paused);
 s={...paused,...resumeTutorial2(paused)};s=transitionM5(s,{type:'tick',deltaMs:1,token:s.token});assert.equal(M5_STEPS[s.index].id,'final-complete');
});
test('focused preview starts at final battle entry while normal tutorial retains all prior lessons',()=>{
 assert.equal(M5_STEPS[newM5Tutorial().index].id,'fire-enter');assert.equal(M5_STEPS[newM5Tutorial('goblin').index].id,'goblin-enter');assert.equal(M5_STEPS[newM5Tutorial('final').index].id,'final-enter');assert.equal(M5_STEPS.length,M4_STEPS.length+5);
});
