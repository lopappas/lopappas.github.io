import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COMMON_POTIONS,RARE_POTIONS,potionImpactIds,POTION_IDS,POTIONS,FREEZE_SECONDS,newBattle,drinkPotion,stepBattle,spellDamage,CONTACT_X,PLAYER_HIT_PUSH,enemyElementColor,presentEnemies,type Potion} from '../src/battle.ts';
import {ROUTE,newRun,enterNode,buy,sealBottle,leaveNode,camp,potionCount,potionSlots,battleForRun,finishBattle,claimPotion,discardPotion,merchantDialogue} from '../src/run.ts';
import {SPELLS,PLAYER_SPELLS,recognize} from '../src/magic.ts';
function advance(b:ReturnType<typeof newBattle>,seconds:number){for(let i=0;i<Math.round(seconds*100);i++)b=stepBattle(b,.01);return b;}
function shop(){return {...newRun(),screen:'shop' as const,gold:100,stock:[{id:'bottle',kind:'potion' as const,item:'spellBottle' as const,price:12,sold:false}]};}
test('second merchant and a fresh Mossy grove campsite sit between barricade and boss',()=>{
 assert.deepEqual(ROUTE.slice(-4).map(n=>n.name),['Woodland barricade','Sea Merchant','Mossy grove campsite','Slime Mother']);
 assert.equal(merchantDialogue(ROUTE.findLastIndex(n=>n.kind==='shop')),"I'm saving money to buy a cozy sweater for winter. How are you staying warm?");
 const node=ROUTE.findIndex(n=>n.name==='Mossy grove campsite');const r=enterNode({...newRun(),screen:'map',node,campUsed:true,health:13});assert.equal(r.campUsed,false);assert.equal(camp(r).health,83);assert.equal(leaveNode(camp(r)).node,node+1);
});
test('both shops replace unavailable spell slots with extra potions while keeping six unique stock entries',()=>{
 for(const node of ROUTE.flatMap((n,i)=>n.kind==='shop'?[i]:[]))for(const missing of [0,1,2,4])for(const roll of [0,.4,.99]){
  const known=PLAYER_SPELLS.slice(0,PLAYER_SPELLS.length-missing).map(s=>s.id),r=enterNode({...newRun(),screen:'map',node,spells:known},()=>roll);
  assert.equal(r.stock.length,6);assert.equal(new Set(r.stock.map(s=>s.id)).size,6);assert.equal(r.stock.filter(s=>s.kind==='relic').length,2);assert.equal(r.stock.filter(s=>s.kind==='spell').length,Math.min(missing,2));assert.equal(r.stock.filter(s=>s.kind==='potion').length,4-Math.min(missing,2));assert.ok(r.stock.filter(s=>s.kind==='spell').every(s=>!known.includes(s.item as any)));
 }
});
test('new potions appear in shop and reward pools; each occupies one slot',()=>{
 for(const id of POTION_IDS){const pool=COMMON_POTIONS.includes(id)?COMMON_POTIONS:RARE_POTIONS;let call=0;const reward=finishBattle({...newRun(),screen:'battle',relics:['twillyScarf']},{...battleForRun(newRun()),phase:'victory'},()=>call++===0?(COMMON_POTIONS.includes(id)?0:.8):(pool.indexOf(id)+.1)/3);assert.equal(reward.reward?.potion,id);const r=claimPotion(reward);assert.equal(potionCount(r),2);assert.equal(r.pendingBottle,id==='spellBottle');}
 assert.deepEqual(potionSlots({heal:0,freeze:0,ink:0,rejection:1,spellBottle:2},3),['rejection','spellBottle','spellBottle']);
 assert.equal(POTIONS.rejection.detail,'Imbue your skin with a powerful repelling force for 15 seconds. Attackers get sent soaring and deal less damage.');
});
test('acquiring a bottle opens one mandatory attempt; sealing cannot repeat, and failure is preserved',()=>{
 const paid=buy(shop(),'bottle');assert.equal(paid.gold,88);assert.equal(paid.pendingBottle,true);assert.equal(leaveNode(paid),paid);assert.equal(buy(paid,'bottle'),paid);
 const template=SPELLS.find(s=>s.id==='water')!,match=recognize(template.strokes,paid.spells),sealed=sealBottle(paid,{spellId:match.spell!.id,quality:match.quality});assert.equal(sealed.pendingBottle,false);assert.deepEqual(sealed.bottledSpells,[{spellId:'water',quality:100}]);assert.equal(sealBottle(sealed,{spellId:'fire',quality:80}),sealed);assert.equal(leaveNode(sealed).screen,'map');
 const failed=sealBottle(paid,{spellId:null,quality:32});assert.deepEqual(failed.bottledSpells,[{spellId:null,quality:32}]);assert.equal(failed.potions.spellBottle,1);assert.equal(discardPotion(failed,'spellBottle').bottledSpells.length,0);
});
test('a full purse can replace a stored spell bottle without leaving orphaned spells',()=>{
 let r={...shop(),screen:'rewards' as const,potions:{heal:1,freeze:0,ink:0,spellBottle:2},bottledSpells:[{spellId:'water' as const,quality:60},{spellId:'fire' as const,quality:90}],reward:{gold:25,potion:'spellBottle' as const,offers:[],relic:null,goldClaimed:false,potionStatus:'pending' as const,relicClaimed:true,learned:null}};
 assert.equal(claimPotion(r),r);const replaced=claimPotion(r,'spellBottle');assert.equal(potionCount(replaced),3);assert.deepEqual(replaced.bottledSpells,[{spellId:'fire',quality:90}]);const sealed=sealBottle(replaced,{spellId:'nature',quality:70});assert.equal(sealed.bottledSpells.length,2);
});
test('bottled spells retain quality and can be selected separately, carry across battles, and release once on impact',()=>{
 let run=sealBottle(buy(shop(),'bottle'),{spellId:'water',quality:60});run={...run,potions:{...run.potions,spellBottle:2},bottledSpells:[...run.bottledSpells,{spellId:'fire',quality:100}]};
 let b=battleForRun(run,()=>0);b.enemies[0]={...b.enemies[0],element:'Neutral',hp:1000,maxHP:1000};b=drinkPotion(b,'spellBottle',1);assert.equal(b.potions.spellBottle,1);assert.deepEqual(b.bottledSpells,[{spellId:'water',quality:60}]);assert.equal(b.enemies[0].hp,1000);b=advance(b,.66);assert.equal(b.enemies[0].hp,1000-spellDamage({element:'Neutral'},100,'fire'));assert.equal(b.casts,1);b=advance(b,.5);assert.equal(b.casts,1);
 const carried=finishBattle({...run,screen:'battle'},{...b,phase:'victory'},()=>.99);assert.deepEqual(carried.bottledSpells,b.bottledSpells);assert.deepEqual(battleForRun(carried).bottledSpells,b.bottledSpells);
 b=drinkPotion(b,'spellBottle');b=advance(b,.66);assert.equal(b.casts,2);assert.equal(b.bottledSpells.length,0);assert.equal(drinkPotion(b,'spellBottle'),b);
});
test('bottled intermediate and Ancient spells retain their special effects; fizzle bottles are consumed harmlessly',()=>{
 for(const id of ['bolt','leaf','chronos'] as const){let b=newBattle('active','pack');b.enemies[0].element='Neutral';b.potions.spellBottle=1;b.bottledSpells=[{spellId:id,quality:70}];b=advance(drinkPotion(b,'spellBottle'),.66);if(id==='bolt')assert.ok(b.enemies[0].burn);if(id==='leaf')assert.ok(b.enemies[0].leafSlows.length);if(id==='chronos'){assert.ok(b.chronosFields.length);assert.ok(b.enemies.every(e=>e.stunUntil>5));}}
 let b=newBattle('active');b.potions.spellBottle=1;b.bottledSpells=[{spellId:null,quality:20}];const hp=b.enemies[0].hp;b=advance(drinkPotion(b,'spellBottle'),.66);assert.equal(b.enemies[0].hp,hp);assert.equal(b.casts,0);assert.equal(b.potions.spellBottle,0);
});
test('Rejection applies on impact for 15 seconds: half contact damage and 100 extra push with relics',()=>{
 for(const encounter of ['slime','mother'] as const){let b=newBattle('active',encounter);b.potions.rejection=1;b.firstHitPush=80;b=drinkPotion(b,'rejection');assert.equal(b.rejectionUntil,0);b=advance(b,.66);assert.ok(Math.abs(b.rejectionUntil-b.time-15)<.02);b.approachAt=0;b.enemies[0]={...b.enemies[0],x:CONTACT_X,attackAt:0,push:null};b=stepBattle(b,.01);assert.equal(b.playerHP,encounter==='mother'?90:94);assert.equal(b.enemies[0].push!.to-CONTACT_X,PLAYER_HIT_PUSH+80+100);
 b=advance(b,15.1);b.enemies[0]={...b.enemies[0],x:CONTACT_X,attackAt:0,push:null};const hp=b.playerHP;b=stepBattle(b,.01);assert.equal(hp-b.playerHP,encounter==='mother'?20:12);assert.equal(b.enemies[0].push!.to-CONTACT_X,PLAYER_HIT_PUSH);}
});
test('Freeze lasts six seconds and caret colors follow elemental identity',()=>{
 assert.equal(FREEZE_SECONDS,6);let b=advance(drinkPotion(newBattle('active'),'freeze'),.66);assert.ok(Math.abs(b.freezeUntil-b.time-6)<.02);const x=b.enemies[0].x;b=advance(b,5.98);assert.equal(b.enemies[0].x,x);b=advance(b,.1);assert.ok(b.enemies[0].x<x);
 assert.equal(enemyElementColor('Fire'),'#ef9c70');assert.equal(enemyElementColor('Water'),'#7ccbd6');assert.equal(enemyElementColor('Nature'),'#99bf76');assert.equal(enemyElementColor('Neutral'),'#45474c');
});
test('offspring spread around the death location without leaving the runway, keeping a clear nearest target',()=>{
 for(const x of [CONTACT_X,401,640]){let b=newBattle('active','mother');b.enemies[0]={...b.enemies[0],hp:0,x};b=advance(b,2.01);const children=presentEnemies(b);assert.equal(children.length,3);assert.equal(new Set(children.map(e=>e.x)).size,3);assert.ok(children.every(e=>e.x>=CONTACT_X&&e.x<=640));assert.equal(children[1].x-children[0].x,36);assert.equal(children[2].x-children[1].x,36);}
});

test('a spell bottle that wins combat still reports its impact once',()=>{
 let b=newBattle('active');b.enemies[0].hp=1;b.potions.spellBottle=1;b.bottledSpells=[{spellId:'water',quality:100}];b=drinkPotion(b,'spellBottle');b=advance(b,.64);const next=stepBattle(b,.02);assert.equal(next.phase,'victory');assert.deepEqual(potionImpactIds(b,next),[1]);assert.deepEqual(potionImpactIds(next,next),[]);
});
