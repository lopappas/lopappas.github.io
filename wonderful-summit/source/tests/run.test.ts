import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ROUTE,newRun,startRun,enterNode,finishBattle,claimGold,claimPotion,claimRelic,rewardsComplete,learnReward,leaveNode,buy,camp,potionCount,battleForRun,RELICS,discardPotion,skipRewardPotion,type Run} from '../src/run.ts';
import {SPELLS,isCheckmark,recognize,type SpellId} from '../src/magic.ts';
import {hitWithSpell,stepBattle,launchSpell,nearestEnemy,targetedEnemy,presentEnemies,drinkPotion} from '../src/battle.ts';
const rng=()=>.1;
function start():Run{return startRun({...newRun(),keepsakeOffers:['amber','moss','feather'],screen:'sister'},'amber');}
function won(r:Run):Run{return finishBattle(r,{...battleForRun(r,rng),phase:'victory',playerHP:65},rng);}
function collect(r:Run):Run{r=claimGold(r);r=claimRelic(r);r=r.reward?.potion&&potionCount(r)>=3?skipRewardPotion(r):claimPotion(r);if(r.reward?.offers.length)r=learnReward(r,r.reward.offers[0]);return leaveNode(r);}
test('checkmark accepts scale and translation and rejects spell shapes and flat scribbles',()=>{
 const check=[[{x:10,y:50},{x:30,y:70},{x:80,y:10}]];
 for(const scale of [.2,1,3])assert.equal(isCheckmark(check.map(s=>s.map(p=>({x:p.x*scale+100,y:p.y*scale+20})))),true);
 for(const s of SPELLS)assert.equal(isCheckmark(s.strokes),false);
 assert.equal(isCheckmark([[{x:1,y:1},{x:20,y:1},{x:80,y:1}]]),false);
});
test('every run starts with all three beginner spells and a valid starter relic',()=>{const r=start();assert.deepEqual(newRun().spells,['water','fire','nature']);assert.deepEqual(r.spells,['water','fire','nature']);assert.deepEqual(r.relics,['filadoraRobes','amber']);assert.equal(r.health,100);assert.equal(r.screen,'map');assert.equal(potionCount(r),1);assert.deepEqual(startRun({...newRun(),keepsakeOffers:['amber','moss','feather'],screen:'sister'},'bell'),{...newRun(),keepsakeOffers:['amber','moss','feather'],screen:'sister'});});
test('unlearned sigils do not cast, and learned spells remain recognizable',()=>{assert.equal(recognize(SPELLS[1].strokes,['fire']).spell?.id,'fire');assert.equal(recognize(SPELLS[3].strokes,['fire']).spell,null);});
test('complete route has seven combats, merchant, camp and final victory',()=>{
 let r=start();const screens:string[]=[];
 for(let i=0;i<ROUTE.length;i++){
  r=enterNode(r,rng);screens.push(r.screen);
  if(r.screen==='battle')r=collect(won(r));else if(r.screen==='shop'||r.screen==='event')r=leaveNode(r);else r=leaveNode(camp(r));
 }
 assert.deepEqual(screens,['battle','battle','shop','battle','camp','battle','battle','event','battle','shop','camp','battle']);assert.equal(r.screen,'complete');assert.equal(r.combats,7);assert.equal(r.gold,242);assert.equal(r.relics.length,4);assert.equal(r.spells.length,6);
});
test('rewards are rolled once, claim only once, and spell choice cannot be skipped',()=>{
 let r=won(enterNode(start(),rng));assert.equal(r.reward?.potion,'heal');const first=claimPotion(claimGold(r));assert.equal(first.gold,27);assert.deepEqual(claimGold(first),first);assert.deepEqual(finishBattle(first,{...battleForRun(first),phase:'victory'}),first);
 r=won(enterNode(leaveNode(first),rng));r=claimPotion(claimGold(r));assert.deepEqual(r.reward?.offers,['wave','bolt','leaf']);assert.deepEqual(leaveNode(r),r);const id=r.reward!.offers[0];r=learnReward(r,id);assert.equal(r.spells.filter(s=>s===id).length,1);assert.deepEqual(learnReward(r,id),r);assert.equal(leaveNode(r).screen,'map');
});
test('potion drop boundary is 35 percent and capacity never exceeds three',()=>{
 const active=enterNode(start(),rng),battle={...battleForRun(active),phase:'victory' as const};
 assert.ok(finishBattle(active,battle,()=>.349).reward?.potion);assert.equal(finishBattle(active,battle,()=>.35).reward?.potion,null);
 let r=finishBattle({...active,potions:{heal:1,freeze:1,ink:1}},battleForRun({...active,potions:{heal:1,freeze:1,ink:1}}),rng); // Active fights cannot be claimed.
 assert.equal(r.screen,'battle');r=finishBattle({...active,potions:{heal:1,freeze:1,ink:1}},{...battle,potions:{heal:1,freeze:1,ink:1}},rng);assert.deepEqual(claimPotion(r),r);r=claimPotion(r,'freeze');assert.equal(potionCount(r),3);assert.equal(r.potions.freeze,0);assert.equal(r.potions.heal,2);
});
test('shop charges exact prices, cannot overspend or buy sold stock twice',()=>{
 let r={...start(),node:2,gold:55};r=enterNode(r,rng);const item=r.stock.find(s=>s.kind==='spell')!;const bought=buy(r,item.id);assert.equal(bought.gold,10);assert.ok(bought.spells.includes(item.item as SpellId));assert.deepEqual(buy(bought,item.id),bought);const relic=r.stock.find(s=>s.kind==='relic')!;assert.deepEqual(buy({...r,gold:0},relic.id),{...r,gold:0});
 const full={...r,potions:{heal:1,freeze:1,ink:1}};const potion=r.stock.find(s=>s.kind==='potion')!;assert.deepEqual(buy(full,potion.id),full);assert.equal(potionCount(discardPotion(full,'heal')),2);
});
test('camp allows one heal OR one upgrade, and only for a known spell',()=>{const r={...start(),screen:'camp' as const,health:45};assert.equal(camp(r).health,100);assert.deepEqual(camp(camp(r),'fire'),camp(r));assert.equal(camp(r,'fire').upgrades.fire,1);assert.deepEqual(camp(r,'bolt'),r);assert.deepEqual(leaveNode(r),r);});
test('battle carries health, potions, upgrades and relics without refilling inventory',()=>{
 const r={...start(),screen:'battle' as const,health:44,potions:{heal:0,freeze:1,ink:0},upgrades:{fire:1}};const b=battleForRun(r,rng);assert.equal(b.playerHP,44);assert.deepEqual(b.potions,r.potions);assert.equal(b.upgrades.fire,1);assert.equal(b.damageBonus,1.05);const hit=hitWithSpell(b,100,'fire');assert.ok(hit.enemies[0].hp<100-32);
});
test('defeat ends run, restart clears all run power, elite relic excludes owned relics',()=>{
 const r=enterNode(start(),rng);const dead=finishBattle(r,{...battleForRun(r),phase:'defeat',playerHP:0});assert.equal(dead.screen,'defeat');assert.deepEqual(enterNode(dead),dead);assert.equal(newRun().gold,0);assert.deepEqual(newRun().relics,['filadoraRobes']);
 const elite={...r,node:3,relics:['amber','moss'] as (keyof typeof RELICS)[]};const reward=won(elite).reward!;assert.ok(reward.relic&&!elite.relics.includes(reward.relic));
});
test('moss locket heals after victories and glass bell affects only first incoming hit',()=>{
 const r={...enterNode(start(),rng),relics:['moss'] as (keyof typeof RELICS)[]};assert.equal(won(r).health,77);
 const b=battleForRun({...r,relics:['bell']},rng);b.approachAt=0;b.enemies[0]={...b.enemies[0],x:325,attackAt:0};const hit=stepBattle(b,.01);assert.equal(hit.enemies[0].push?.to,510);assert.equal(hit.playerHP,b.playerHP-12);
});

test('first spell reward lets each intermediate be chosen and never offers a beginner',()=>{
 for(const id of ['wave','bolt','leaf','chronos'] as const){
  let r=collect(won(enterNode(start(),rng)));
  r=won(enterNode(r,()=>.99));
  for(let roll=0;!r.reward!.offers.includes(id)&&roll<=100;roll++)r=finishBattle({...r,screen:'battle',combats:1},{...battleForRun(r),phase:'victory'},()=>roll/100);assert.equal(r.reward!.offers.length,3);assert.ok(r.reward!.offers.includes(id));
  r=learnReward(r,id);
  assert.deepEqual(r.spells,['water','fire','nature',id]);
  for(const known of r.spells){const spell=SPELLS.find(s=>s.id===known)!;assert.equal(recognize(spell.strokes,r.spells).spell?.id,known);}
 }
});

test('gold and potion pickups are independent, support either order, and cannot be collected twice',()=>{
 for(const potionFirst of [false,true]){
  const reward=won(enterNode(start(),rng)),gold=reward.gold,potions=potionCount(reward);
  let r=potionFirst?claimPotion(reward):claimGold(reward);
  assert.equal(r.gold,gold+(potionFirst?0:27));assert.equal(potionCount(r),potions+(potionFirst?1:0));
  assert.equal(rewardsComplete(r.reward!),!potionFirst);if(potionFirst)assert.deepEqual(leaveNode(r),r);
  r=potionFirst?claimGold(r):claimPotion(r);
  assert.equal(r.gold,gold+27);assert.equal(potionCount(r),potions+1);
  assert.deepEqual(claimGold(r),r);assert.deepEqual(claimPotion(r),r);assert.deepEqual(skipRewardPotion(r),r);
  assert.equal(rewardsComplete(r.reward!),true);assert.equal(leaveNode(r).screen,'map');
 }
});
test('a full purse never blocks gold, and leaving a potion never silently claims other rewards',()=>{
 const battle=enterNode({...start(),potions:{heal:1,freeze:1,ink:1}},rng);
 const r=won(battle),gold=claimGold(r);
 assert.equal(gold.gold,27);assert.equal(potionCount(gold),3);assert.equal(gold.reward!.potionStatus,'pending');assert.deepEqual(claimPotion(gold),gold);
 const skipped=skipRewardPotion(r);assert.equal(skipped.gold,0);assert.equal(potionCount(skipped),3);assert.equal(skipped.reward!.potionStatus,'skipped');assert.deepEqual(claimPotion(skipped),skipped);assert.deepEqual(leaveNode(skipped),skipped);
 const replaced=claimPotion(gold,'freeze');assert.equal(replaced.gold,27);assert.equal(replaced.potions.freeze,0);assert.equal(replaced.potions.heal,2);assert.deepEqual(claimPotion(replaced,'heal'),replaced);assert.equal(potionCount(replaced),3);
});
test('elite relic collects independently once and all pickups resolve before continuing',()=>{
 const active={...enterNode(start(),rng),node:3};let r=won(active);
 const relic=r.reward!.relic!;r=claimRelic(r);assert.ok(r.relics.includes(relic));assert.equal(r.gold,0);assert.equal(potionCount(r),1);assert.deepEqual(claimRelic(r),r);assert.deepEqual(leaveNode(r),r);
 r=claimGold(skipRewardPotion(r));assert.equal(rewardsComplete(r.reward!),true);assert.equal(leaveNode(r).screen,'map');
 const noPotion=finishBattle(active,{...battleForRun(active),phase:'victory'},()=>.9);assert.equal(noPotion.reward!.potion,null);assert.equal(noPotion.reward!.potionStatus,'skipped');assert.deepEqual(claimPotion(noPotion),noPotion);
 for(const wrongScreen of ['map','battle','defeat'] as const){const wrong={...r,screen:wrongScreen};assert.deepEqual(claimGold(wrong),wrong);assert.deepEqual(claimPotion(wrong),wrong);assert.deepEqual(claimRelic(wrong),wrong);}
});

test('only the first two-slime encounter delays its second enemy until combat second ten',()=>{
 const run={...start(),node:1};let b=battleForRun(run,rng);
 const back=b.enemies[1].x;assert.equal(b.enemies[1].spawnAt,10);assert.equal(presentEnemies(b).length,1);
 for(let i=0;i<999;i++)b=stepBattle(b,.01);
 assert.equal(presentEnemies(b).length,1);assert.equal(b.enemies[1].x,back);assert.equal(b.enemies[1].clock,0);
 assert.ok(Math.abs(b.enemies[0].x-(580-18*4.99))<1e-6); // Hidden slime does not slow the first.
 b=stepBattle(b,.01);assert.equal(presentEnemies(b).length,2);assert.equal(b.enemies[1].x,back);
 const moving=stepBattle(b,.02);assert.ok(Math.abs(back-moving.enemies[1].x-18*.8*.02)<1e-6);
 const final=battleForRun({...run,node:5},rng);assert.equal(presentEnemies(final).length,1);assert.equal(final.approachAt,5);assert.equal(final.enemies[1].spawnAt,7);assert.ok(final.enemies[1].shield);
});
test('a hidden reinforcement cannot be targeted or damaged and prevents early victory',()=>{
 let b=battleForRun({...start(),node:1},rng);
 b=hitWithSpell(b,100,'water',2);assert.equal(b.enemies[1].hp,100);assert.ok(b.enemies[0].hp<100); // Explicit hidden ID falls back to present target.
 b=hitWithSpell(b,100,'water');assert.equal(b.enemies[0].hp,0);assert.equal(b.phase,'active');assert.equal(nearestEnemy(b),undefined);assert.equal(targetedEnemy(b),undefined);
 assert.deepEqual(launchSpell(b,100,'#abc'),b);assert.equal(drinkPotion({...b,potions:{...b.potions,freeze:1}},'freeze').potionFlights[0].toX,640);
 for(let i=0;i<999;i++)b=stepBattle(b,.01);
 assert.equal(b.phase,'active');assert.equal(presentEnemies(b).length,0);
 b=stepBattle(b,.01);assert.equal(presentEnemies(b).length,1);assert.equal(nearestEnemy(b)!.id,2);
 for(let i=0;i<3&&b.phase==='active';i++)b=hitWithSpell(b,100,'nature');assert.equal(b.phase,'victory');
});
test('burn can kill the first slime before reinforcement, and freeze does not delay arrival',()=>{
 let b=battleForRun({...start(),node:1},rng);b.enemies[0]={...b.enemies[0],hp:1,burn:{damage:1,nextTick:1,ticks:1}};
 for(let i=0;i<100;i++)b=stepBattle(b,.01);assert.equal(b.enemies[0].hp,0);assert.equal(b.phase,'active');
 b={...b,time:9.9,freezeUntil:12};for(let i=0;i<20;i++)b=stepBattle(b,.01);
 assert.equal(presentEnemies(b).length,1);assert.equal(b.enemies[1].clock,0);assert.equal(b.enemies[1].x,640);
});

test('Continue leaves uncollected potions behind without granting or replacing inventory',()=>{
 for(const potions of [{heal:1,freeze:0,ink:0},{heal:1,freeze:1,ink:1}]){
  const active=enterNode({...start(),potions},rng),r=claimGold(won(active));
  assert.equal(r.reward!.potionStatus,'pending');assert.equal(rewardsComplete(r.reward!),true);
  const continued=leaveNode(r);assert.equal(continued.screen,'map');assert.equal(continued.gold,27);assert.deepEqual(continued.potions,potions);assert.equal(continued.reward,null);
 }
 const elite=claimGold(won({...enterNode(start(),rng),node:3}));assert.equal(rewardsComplete(elite.reward!),false);assert.deepEqual(leaveNode(elite),elite);
 let second=collect(won(enterNode(start(),rng)));second=claimGold(won(enterNode(second,rng)));assert.equal(rewardsComplete(second.reward!),false);assert.deepEqual(leaveNode(second),second);
 second=learnReward(second,second.reward!.offers[0]);assert.equal(rewardsComplete(second.reward!),true);assert.equal(leaveNode(second).screen,'map');
});

