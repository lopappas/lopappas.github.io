import test from 'node:test';
import assert from 'node:assert/strict';
import {BattlePresentation,combatControlValues,equalControlValues} from '../src/battlePresentation.ts';
import {newBattle,stepBattle,launchSpell,drinkPotion,type Battle} from '../src/battle.ts';
import {PerformanceMetrics} from '../src/performanceMetrics.ts';
const spells=['water','fire','nature','torrent'] as const;
function scene(){return newBattle('active','slime',()=>.4);}
function same(a:Battle,b:Battle,practice=false){return equalControlValues(combatControlValues(a,[...spells],practice),combatControlValues(b,[...spells],practice));}
test('ordinary enemy motion publishes every live frame without publishing control changes',()=>{
 let battle=scene();const store=new BattlePresentation(battle,[...spells]);let worlds=0,controls=0;const unsub=store.subscribe(()=>worlds++);
 for(let i=0;i<600;i++){battle=stepBattle(battle,1/60);if(store.publish(battle,[...spells]))controls++;assert.equal(store.getSnapshot(),battle);}
 assert.equal(worlds,600);assert.equal(controls,0);assert.ok(battle.enemies[0].x<580);unsub();store.publish(stepBattle(battle,1/60),[...spells]);assert.equal(worlds,600);
});
test('health and terminal states invalidate controls immediately while live enemy HP stays in battlefield',()=>{
 const b=scene();assert.equal(same(b,{...b,playerHP:88}),false);assert.equal(same(b,{...b,phase:'victory'}),false);assert.equal(same(b,{...b,phase:'defeat'}),false);
 assert.equal(same(b,{...b,enemies:b.enemies.map(e=>({...e,hp:e.hp-5,x:e.x-1}))}),true);
 const store=new BattlePresentation(b,[...spells]);const next={...b,playerHP:88};assert.equal(store.publish(next,[...spells]),true);assert.equal(store.publish(next,[...spells]),false);
});
test('cooldowns publish only changed displayed tenths and never hide their expiration',()=>{
 const b=scene();b.cooldowns.torrent=1;assert.equal(same(b,{...b,time:.001}),true);assert.equal(same(b,{...b,time:.06}),false);
 const before={...b,time:.999};assert.equal(same(before,{...b,time:1}),false);
 let state=launchSpell(scene(),60,'#69c2d6','torrent',0,()=>0);const store=new BattlePresentation(state,[...spells]);let controls=0;
 for(let i=0;i<60;i++){state=stepBattle(state,1/60);if(store.publish(state,[...spells]))controls++;}assert.ok(controls>=9&&controls<=11,`${controls} control updates`);
});
test('potions, bottled spell contents and pending Stellar flights remain reactive',()=>{
 const b=scene();assert.equal(same(b,drinkPotion(b,'heal')),false);
 assert.equal(same(b,{...b,bottledSpells:[{spellId:'water',quality:60}]}),false);
 const pending={...b,potionFlights:[{id:1,potion:'stellar' as const,started:0,toX:245,toY:395,applied:false}]};assert.equal(same(b,pending),false);
 assert.equal(same(pending,{...pending,time:.1,potionFlights:pending.potionFlights.map(f=>({...f}))}),true);
 assert.equal(same(pending,{...pending,potionFlights:pending.potionFlights.map(f=>({...f,applied:true})),stellarReady:true}),false);
});
test('relic borders, upgrades and transformations invalidate the relevant controls',()=>{
 const b=scene();for(const change of [{furyReady:true},{lotus:true,lotusReady:true},{stellarReady:true},{sphereShatteredAt:0},{shaleContacts:3}])assert.equal(same(b,{...b,...change}),false);
 assert.equal(same(b,{...b,castingRelics:{...b.castingRelics,calculus:true}}),false);
 assert.equal(same(b,{...b,castingRelics:{...b.castingRelics,clover:true,steadyCasts:6}}),false);
 assert.equal(same(b,{...b,robes:{...b.robes,enabled:true,spells:['water']}}),false);
});
test('effect timers and transient messages expire without a cast or damage event',()=>{
 const b=scene();for(const key of ['freezeUntil','rejectionUntil','unlimitedUntil'] as const){const active={...b,[key]:1,time:.99};assert.equal(same(active,{...active,time:1}),false);}
 const alchemy={...b,alchemizedPotion:'heal' as const,alchemizeAt:0,time:2.99};assert.equal(same(alchemy,{...alchemy,time:3}),false);
 const sphere={...b,sphereShatteredAt:0,time:3.59};assert.equal(same(sphere,{...sphere,time:3.6}),false);
});
test('practice status changes publish independently of enemy motion',()=>{
 const b=scene(),burning={...b,enemies:b.enemies.map(e=>({...e,burn:{damage:2,nextTick:1,ticks:3}}))};assert.equal(same(b,burning,true),false);
 assert.equal(same(burning,{...burning,enemies:burning.enemies.map(e=>({...e,burn:{...e.burn!,ticks:2}}))},true),false);
 assert.equal(same(b,{...b,enemies:b.enemies.map(e=>({...e,x:e.x-20}))},true),true);
});
test('metric counters distinguish live battlefield commits from controls and reset together',()=>{
 const metrics=new PerformanceMetrics();metrics.recordWorldCommit();assert.equal(metrics.snapshot().worldCommits,0);metrics.enabled=true;for(let i=0;i<60;i++){metrics.recordFrame(1000/60,.1);metrics.recordWorldCommit();}metrics.recordCommit();assert.ok(Math.abs(metrics.snapshot().worldCommitsPerActiveSecond-60)<1e-9);assert.ok(Math.abs(metrics.snapshot().commitsPerActiveSecond-1)<1e-9);metrics.reset();assert.equal(metrics.snapshot().worldCommits,0);
});
