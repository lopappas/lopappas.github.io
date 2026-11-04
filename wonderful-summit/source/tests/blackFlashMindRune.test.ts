import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBattle,hitWithSpell,launchSpell,stepBattle,rollBlackFlash,fizzleSpell,drinkPotion} from '../src/battle.ts';
import {newRun,battleForRun,RELICS,acquireRelic} from '../src/run.ts';
import {castHoldMs,chargeComplete} from '../src/magic.ts';

function field(){const b=battleForRun({...newRun(),relics:['blackFlash']},()=>0);return {...b,phase:'active' as const,enemies:b.enemies.map(e=>({...e,element:'Neutral' as const,hp:1000,maxHP:1000,x:400}))};}
function advance(b:ReturnType<typeof field>,seconds:number){for(let t=0;t<seconds;t+=.05)b=stepBattle(b,.05);return b;}
test('new relics are common, cannot duplicate, and Black Flash resets for each encounter',()=>{
 for(const id of ['blackFlash','mindRune'] as const){assert.equal(RELICS[id].rarity,'Common');const run=acquireRelic(acquireRelic(newRun(),id),id);assert.equal(run.relics.filter(r=>r===id).length,1);}
 assert.deepEqual(field().blackFlash,{enabled:true,chain:false});assert.deepEqual(newBattle().blackFlash,{enabled:false,chain:false});
});
test('Mind Rune reduces pointer and keyboard cast hold timing without changing normal timing',()=>{
 assert.equal(castHoldMs(),500);assert.equal(castHoldMs(true),375);
 assert.equal(chargeComplete(100,474,true),false);assert.equal(chargeComplete(100,475,true),true);
 assert.equal(chargeComplete(100,599),false);assert.equal(chargeComplete(100,600),true);
});
test('Black Flash uses strict 1/100 odds then chains at strict 1/3 odds until a miss',()=>{
 const initial=field();assert.equal(rollBlackFlash(initial,'water',80,()=>.01).multiplier,1);
 const first=rollBlackFlash(initial,'water',80,()=>.009999);assert.equal(first.multiplier,2);assert.deepEqual(first.state.blackFlashBurst,{serial:1,x:400});assert.equal(first.state.blackFlash.chain,true);
 const chain=rollBlackFlash(first.state,'leaf',80,()=>1/3-1e-9);assert.equal(chain.multiplier,2);assert.equal(chain.state.blackFlashBurst?.serial,2);assert.equal(chain.state.blackFlash.chain,true);
 const miss=rollBlackFlash(chain.state,'water',80,()=>1/3);assert.equal(miss.multiplier,1);assert.equal(miss.state.blackFlash.chain,false);
 assert.equal(rollBlackFlash(miss.state,'water',80,()=>.02).multiplier,1);
});
test('only direct damage plus knockback spells roll; other spells and fizzles preserve a chain',()=>{
 const b={...field(),blackFlash:{enabled:true,chain:true}};
 for(const id of ['bog','firestorm','thistleBush','puddleGuard','flameBlade','chronos','alchemize','ender'] as const){const result=rollBlackFlash(b,id,80,()=>{throw Error('ineligible spell rolled');});assert.equal(result.state,b);assert.equal(result.multiplier,1);}
 assert.equal(rollBlackFlash(b,'water',47,()=>{throw Error('fizzle rolled');}).state,b);
 assert.equal(fizzleSpell(b).blackFlash.chain,true);
 const disabled={...b,blackFlash:{enabled:false,chain:false}};assert.equal(rollBlackFlash(disabled,'water',80,()=>{throw Error('unowned relic rolled');}).state,disabled);
});
test('Black Flash doubles direct damage and push, while intrinsic and amulet burn stay unchanged',()=>{
 for(const id of ['water','fire','nature','wave','bolt','leaf','tidalcrest'] as const){
  const b=field();b.damageBonus=1.07;b.amulets.sun=true;b.amulets.twilight=false;
  const normal=hitWithSpell(b,60,id,1,()=>.99),flash=hitWithSpell(b,60,id,1,()=>0);
  assert.ok(Math.abs((1000-flash.enemies[0].hp)-(1000-normal.enemies[0].hp)*2)<1e-6,id);
  assert.ok(Math.abs((flash.enemies[0].push!.to-400)-(normal.enemies[0].push!.to-400)*2)<1e-6,id);
  assert.deepEqual(flash.enemies[0].burn,normal.enemies[0].burn,id);
 }
});
test('Tidalcrest rolls once for the whole wave and shares its outcome across enemies and frames',()=>{
 let b=field();b.enemies=[{...b.enemies[0],x:380},{...b.enemies[0],id:2,x:430}];
 const plain={...b,blackFlash:{enabled:false,chain:false}};
 const normal=advance(launchSpell(plain,70,'blue','tidalcrest'),1);
 const original=Math.random;let rolls=0;
 try{Math.random=()=>{rolls++;return 0;};b=advance(launchSpell(b,70,'blue','tidalcrest'),1);}finally{Math.random=original;}
 assert.equal(rolls,1);assert.equal(b.blackFlash.chain,true);
 for(let i=0;i<2;i++)assert.equal(1000-b.enemies[i].hp,(1000-normal.enemies[i].hp)*2);
});
test('bottled direct spells participate in Black Flash without altering drawn spell staleness',()=>{
 let b=field();b.potions.spellBottle=1;b.bottledSpells=[{spellId:'water',quality:70}];
 const original=Math.random;try{Math.random=()=>0;b=advance(drinkPotion(b,'spellBottle'),.75);}finally{Math.random=original;}
 assert.equal(b.blackFlash.chain,true);assert.deepEqual(b.stale,{spellId:null,count:0});
});
