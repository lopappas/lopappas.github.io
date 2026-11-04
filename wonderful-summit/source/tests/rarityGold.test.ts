import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buy,encounterGold,ROUTE,newRun,battleForRun,finishBattle,claimGold,leaveNode,enterNode,RELICS,STARTER_RELICS,spellPrice,relicPrice,type RelicId,type Run} from '../src/run.ts';
import {SPELLS,PLAYER_SPELLS} from '../src/magic.ts';

test('every normal and elite encounter has six equally selectable, inclusive integer gold amounts; the boss always pays fifty-four',()=>{
 for(let node=0;node<ROUTE.length;node++){
  const encounter=ROUTE[node];
  if(encounter.kind!=='battle'){assert.equal(encounterGold(node,()=>{throw Error('noncombat should not roll gold');}),0);continue;}
  if(encounter.encounter==='mother'){assert.equal(encounterGold(node,()=>{throw Error('boss gold is fixed');}),54);continue;}
  const min='elite' in encounter&&encounter.elite?33:24,counts=new Map<number,number>();
  for(let i=0;i<600;i++){const value=encounterGold(node,()=>(i+.5)/600);assert.ok(Number.isInteger(value));counts.set(value,(counts.get(value)??0)+1);}
  assert.deepEqual([...counts.keys()],[min,min+1,min+2,min+3,min+4,min+5]);assert.ok([...counts.values()].every(n=>n===100));
  assert.equal(encounterGold(node,()=>0),min);assert.equal(encounterGold(node,()=>.999999),min+5);assert.equal(encounterGold(node,()=>1),min+5);
 }
 assert.equal(ROUTE.reduce((sum,_,i)=>sum+encounterGold(i,()=>0),0),297);
 assert.equal(ROUTE.reduce((sum,_,i)=>sum+encounterGold(i,()=>.999999),0),342);
});
test('gold rolls anew per encounter, is stored once in its reward, and cannot be rerolled or collected twice',()=>{
 const run={...newRun(),screen:'battle' as const};
 let reward=finishBattle(run,{...battleForRun(run),phase:'victory'},()=>0);
 assert.equal(reward.reward?.gold,24);assert.equal(reward.gold,0);
 assert.equal(finishBattle(reward,{...battleForRun(run),phase:'victory'},()=>{throw Error('a reward cannot be rerolled');}),reward);
 reward=claimGold(reward);assert.equal(reward.gold,24);assert.equal(claimGold(reward),reward);
 const next=enterNode(leaveNode(reward)),second=finishBattle(next,{...battleForRun(next),phase:'victory'},()=>.999999);
 assert.equal(second.reward?.gold,29);assert.equal(second.gold,24);assert.equal(claimGold(second).gold,53);
 const dead=finishBattle(run,{...battleForRun(run),phase:'defeat',playerHP:0},()=>{throw Error('defeat should not roll rewards');});assert.equal(dead.gold,0);assert.equal(dead.reward,null);
});
test('relic rarities exactly match the approved labeling and keepsakes stay exclusive to Theodora',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(RELICS).map(([id,r])=>[id,r.rarity])),{
  ordinaryFern:'Common',bookWorm:'Common',hazardousVials:'Common',coinpurse:'Keepsake',untouchedBox:'Keepsake',perfectedSphere:'Rare',filadoraRobes:'Starter',forgivingCalculus:'Rare',blackStardust:'Rare',sevenLeafClover:'Uncommon',artisanRobes:'Rare',lotus:'Uncommon',colorfulRock:'Uncommon',impossibleShale:'Uncommon',midnightStone:'Common',amber:'Keepsake',moss:'Keepsake',feather:'Keepsake',bell:'Common',moon:'Common',sunAmulet:'Common',moonAmulet:'Common',twilightAmulet:'Common',twillyScarf:'Uncommon',birkinStock:'Uncommon'
 });
 assert.deepEqual(Object.entries(RELICS).filter(([,r])=>r.rarity==='Keepsake').map(([id])=>id).sort(),[...STARTER_RELICS].sort());
});
test('spell rarities exactly match the approved labeling, including the developer-only Legendary Ender',()=>{
 assert.deepEqual(Object.fromEntries(SPELLS.map(s=>[s.id,s.rarity])),{water:'Common',fire:'Common',nature:'Common',wave:'Uncommon',bolt:'Uncommon',leaf:'Uncommon',chronos:'Legendary',ender:'Legendary',firestorm:'Uncommon',tidalcrest:'Uncommon',bog:'Uncommon',flameBlade:'Uncommon',puddleGuard:'Uncommon',thistleBush:'Uncommon'});
 assert.equal(SPELLS.find(s=>s.id==='ender')?.developerOnly,true);assert.ok(!PLAYER_SPELLS.some(s=>s.id==='ender'));
 assert.deepEqual(PLAYER_SPELLS.filter(s=>s.rarity==='Legendary').map(s=>s.id),['chronos']);
});

test('legendary spells cost fifty percent more, and relic prices follow their tiers',()=>{
 for(const spell of SPELLS)assert.equal(spellPrice(spell.id),spell.rarity==='Legendary'?150:spell.rarity==='Uncommon'?100:45);
 assert.equal(spellPrice('chronos'),150);
 for(const id of Object.keys(RELICS) as RelicId[])if(!STARTER_RELICS.includes(id))assert.equal(relicPrice(id),{Common:50,Uncommon:70,Rare:85,Keepsake:45,Starter:0}[RELICS[id].rarity]);
});

// Sweep the roll for one offering while fixing independent potion/other rolls.
function rollAt(position:number,value:number){let calls=0;return()=>++calls===position?value:.99;}
test('both merchants use 90/10 uncommon/legendary spell odds and 50/33/17 relic tier odds',()=>{
 for(const node of [2,9]){
  const spells={Uncommon:0,Legendary:0},relics={Common:0,Uncommon:0,Rare:0};
  const run:Run={...newRun(),screen:'map',node};
  for(let i=0;i<1000;i++){
   const roll=(i+.5)/1000;
   const spell={item:buy({...enterNode(run,()=>.99),gold:100},'random-spell',rollAt(1,roll)).pendingSpellOffers![0]};
   spells[SPELLS.find(s=>s.id===spell.item)!.rarity as keyof typeof spells]++;
   const relic=enterNode(run,rollAt(3,roll)).stock.find(s=>s.kind==='relic')!;
   relics[RELICS[relic.item as RelicId].rarity as keyof typeof relics]++;
  }
  assert.deepEqual(spells,{Uncommon:900,Legendary:100});
  assert.deepEqual(relics,{Common:500,Uncommon:330,Rare:170});
 }
});
test('spell rewards and both elite drops use the same tier odds as merchant offerings',()=>{
 const run:Run={...newRun(),screen:'battle',combats:2};
 const battle={...battleForRun(run,()=>.5),phase:'victory' as const};
 const spells={Uncommon:0,Legendary:0};
 for(let i=0;i<1000;i++){
  const reward=finishBattle(run,battle,rollAt(2,(i+.5)/1000)).reward!;
  assert.equal(new Set(reward.offers).size,2);
  assert.ok(!reward.offers.includes('ender'));
  spells[SPELLS.find(s=>s.id===reward.offers[0])!.rarity as keyof typeof spells]++;
 }
 assert.deepEqual(spells,{Uncommon:900,Legendary:100});
 for(const node of [3,6]){
  const relics={Common:0,Uncommon:0,Rare:0};
  for(let i=0;i<1000;i++){
   const reward=finishBattle({...run,node,combats:0},battle,rollAt(2,(i+.5)/1000)).reward!;
   relics[RELICS[reward.relic!].rarity as keyof typeof relics]++;
  }
  assert.deepEqual(relics,{Common:500,Uncommon:330,Rare:170});
 }
});
test('exhausted tiers redistribute their odds without blocking remaining spells or relics',()=>{
 const relics=(Object.keys(RELICS) as RelicId[]).filter(id=>RELICS[id].rarity!=='Rare');
 const run:Run={...newRun(),screen:'map',node:2,relics,spells:PLAYER_SPELLS.filter(s=>s.rarity!=='Legendary').map(s=>s.id)};
 for(const roll of [0,.5,.999999]){
  const shop=enterNode(run,()=>roll);
  assert.equal(shop.stock.filter(s=>s.kind==='randomSpell').length,1);
  assert.equal(buy({...shop,gold:100},'random-spell',()=>0).pendingSpellOffers?.[0],'chronos');
  const stock=shop.stock.filter(s=>s.kind==='relic');
  assert.equal(stock.length,2);assert.notEqual(stock[0].item,stock[1].item);
  assert.ok(stock.every(s=>RELICS[s.item as RelicId].rarity==='Rare'));
  const reward=finishBattle({...run,node:3,screen:'battle',combats:2},{...battleForRun(run),phase:'victory'},()=>roll).reward!;
  assert.deepEqual(reward.offers,['chronos']);assert.equal(RELICS[reward.relic!].rarity,'Rare');
 }
});

