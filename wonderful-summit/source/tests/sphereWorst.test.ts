import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotDrawing,worstDrawing} from '../src/drawings.ts';
import {newRun,battleForRun,finishBattle,combatRelicIds,acquireRelic,enterNode,claimRelic,buy,sealBottle,castTrailEvent,RELICS,ROUTE,type RelicId} from '../src/run.ts';
import {launchSpell,fizzleSpell,releaseMultiplier,ENEMY_BACK_X,ENEMY_RUNWAY_SIZE} from '../src/battle.ts';
import {applyDeveloperCommand} from '../src/developerCommands.ts';
import {soundSamples,SOUND_RATE} from '../src/sound.ts';
const drawing=(q:number,id:'water'|'fire'|null='water')=>snapshotDrawing(id,q,[[{x:15,y:20},{x:31,y:65},{x:49,y:22}]],150,180);
function field(relics:RelicId[]=['perfectedSphere']){
 const run={...newRun(),screen:'battle' as const,relics};const b=battleForRun(run,()=>0);
 return {...b,approachAt:1000,enemies:[{...b.enemies[0],x:350,hp:1000,maxHP:1000,element:'Neutral' as const}]};
}
test('Sphere boosts all direct, ground and bottled spell release multipliers until its first fizzle',()=>{
 let b=field();
 for(const id of ['water','bog','firestorm','tidalcrest'] as const){assert.equal(releaseMultiplier(b,id),1.15);assert.equal(releaseMultiplier(b,id,'bottle'),1.15);}
 b=launchSpell(b,60,'#fff','water');assert.equal(b.projectile?.damageMultiplier,1.15);
 const shattered=fizzleSpell({...b,projectile:null});assert.equal(releaseMultiplier(shattered,'water'),1);assert.equal(shattered.castingRelics.sphere,false);
 assert.equal(field([]).castingRelics.sphere,false);
});
test('same fizzle shatters Sphere with flat 25 damage through defenses, high knockback and one timestamp',()=>{
 const b=field();b.time=2;b.enemies=[{...b.enemies[0],rocky:true,element:'Fire'}, {...b.enemies[0],id:2,x:400}, {...b.enemies[0],id:3,spawnAt:30}];
 const next=fizzleSpell(b);
 assert.deepEqual(next.enemies.map(e=>e.hp),[975,975,1000]);
 assert.equal(next.enemies[0].push?.to,Math.min(ENEMY_BACK_X,350+ENEMY_RUNWAY_SIZE*.75));
 assert.equal(next.sphereShatteredAt,2);assert.equal(next.castingRelics.stardust,true);assert.equal(next.castingRelics.stardustUsed,true);
 assert.equal(fizzleSpell(next).enemies[0].hp,975);assert.equal(fizzleSpell(next).sphereShatteredAt,2);assert.equal(b.castingRelics.sphere,true);
});
test('shattering resolves lethal hits and boss splitting immediately',()=>{
 const b=field();assert.equal(fizzleSpell({...b,enemies:[{...b.enemies[0],hp:20}]}).phase,'victory');
 const boss=fizzleSpell({...b,enemies:[{...b.enemies[0],kind:'mother',hp:20}]});assert.ok(boss.motherSplit);
 assert.equal(fizzleSpell({...b,phase:'victory'}).sphereShatteredAt,null);
});
test('transformation persists through victory and defeat, and Stardust gets its normal first-fizzle effect next combat',()=>{
 for(const phase of ['victory','defeat'] as const){
  const run={...newRun(),screen:'battle' as const,relics:['perfectedSphere'] as RelicId[]};
  const shattered=fizzleSpell(field());const carried=finishBattle(run,{...shattered,phase},()=>.99);
  assert.deepEqual(carried.relics,['blackStardust']);
  const next=battleForRun({...carried,node:1},()=>0);assert.equal(next.sphereShatteredAt,null);assert.equal(next.castingRelics.stardustUsed,false);
  const hp=next.enemies[0].hp;assert.equal(fizzleSpell(next).enemies[0].hp,hp-10);
 }
});
test('no duplicate relic can be acquired by grants, rewards, purchases, or a defensive Sphere conversion',()=>{
 let r=acquireRelic(newRun(),'blackStardust');assert.equal(acquireRelic(r,'blackStardust'),r);
 assert.equal(applyDeveloperCommand(r,{type:'relic',id:'blackStardust'}),r);
 assert.equal(acquireRelic(r,'perfectedSphere'),r);
 const shop={...r,screen:'shop' as const,gold:1000,stock:[{id:'dup',kind:'relic' as const,item:'blackStardust' as const,price:85,sold:false}]};assert.equal(buy(shop,'dup'),shop);
 const battle={...field(),sphereShatteredAt:0};assert.deepEqual(combatRelicIds(['perfectedSphere','blackStardust'],battle),['blackStardust']);
 const reward={...r,screen:'rewards' as const,reward:{gold:1,potion:null,offers:[],relic:'blackStardust' as const,goldClaimed:true,potionStatus:'skipped' as const,relicClaimed:false,learned:null}};
 assert.equal(claimRelic(reward).relics.filter(x=>x==='blackStardust').length,1);
 for(const id of Object.keys(RELICS) as RelicId[]){const once=acquireRelic(newRun(),id);assert.equal(acquireRelic(once,id),once);}
});
test('normal pools never offer Stardust or a second Sphere once Stardust is owned',()=>{
 for(let i=0;i<300;i++)for(const ownsDust of [false,true]){
  const run={...newRun(),relics:ownsDust?['blackStardust'] as RelicId[]:[]},random=()=>i/300;
  for(const node of [2,9]){const shop=enterNode({...run,screen:'map',node},random);assert.ok(!shop.stock.some(s=>s.kind==='relic'&&(s.item==='blackStardust'||ownsDust&&s.item==='perfectedSphere')));}
  const elite={...run,screen:'battle' as const,node:3};const reward=finishBattle(elite,{...battleForRun(elite),phase:'victory'},random).reward;
  assert.notEqual(reward?.relic,'blackStardust');if(ownsDust)assert.notEqual(reward?.relic,'perfectedSphere');
 }
 assert.equal(RELICS.perfectedSphere.description,'All spells deal 15% more damage.');
});
test('failed event and bottle attempts outside combat transform without applying any combat effect',()=>{
 const run=acquireRelic(newRun(),'perfectedSphere');
 const bottled=sealBottle({...run,pendingBottle:true},{spellId:null,quality:12,drawing:drawing(12,null)});assert.ok(bottled.relics.includes('blackStardust'));assert.equal(bottled.worstDrawing,null);
 const event=enterNode({...run,screen:'map',node:7},()=>0);const fizzled=castTrailEvent(event,null,20,drawing(20,null));assert.ok(fizzled.relics.includes('blackStardust'));assert.equal(fizzled.worstDrawing,null);
 const success=sealBottle({...run,pendingBottle:true},{spellId:'water',quality:60,drawing:drawing(60)});assert.ok(success.relics.includes('perfectedSphere'));assert.equal(success.worstDrawing?.quality,60);
});
test('worst drawing excludes fizzles, uses raw accuracy including boosted successes, deep copies and keeps ties',()=>{
 assert.equal(worstDrawing(null,drawing(10,null)),null);assert.equal(worstDrawing(null,null),null);
 const original=drawing(62),a=worstDrawing(null,original)!;original.strokes[0][0].x=999;assert.equal(a.strokes[0][0].x,15);
 assert.equal(worstDrawing(a,drawing(62,'fire')),a);assert.equal(worstDrawing(a,drawing(90)),a);
 const lower=worstDrawing(a,drawing(45,'fire'))!;assert.equal(lower.quality,45);assert.equal(lower.spellId,'fire');assert.equal(worstDrawing(lower,drawing(0,null)),lower);
});
test('worst drawing survives battles, act completion and defeat, and resets for a new run',()=>{
 const run={...newRun(),screen:'battle' as const,node:ROUTE.length-1,worstDrawing:drawing(65)};
 for(const phase of ['victory','defeat'] as const){const b={...battleForRun(run),phase,worstDrawing:drawing(51,'fire')};const carried=finishBattle(run,b,()=>.99);assert.equal(carried.worstDrawing?.quality,51);assert.equal(battleForRun({...carried,node:0}).worstDrawing?.spellId,'fire');}
 assert.equal(newRun().worstDrawing,null);
});
test('retro fracture is a distinct, brief signal with finite bounded output and silent endpoints',()=>{
 const samples=soundSamples('shatter');assert.equal(samples.length,Math.ceil(.42*SOUND_RATE));assert.equal(Math.abs(samples[0]),0);assert.ok(Math.abs(samples.at(-1)!)<.002);assert.ok(samples.every(x=>Number.isFinite(x)&&Math.abs(x)<=.901));assert.notDeepEqual(samples,soundSamples('stone'));
});
