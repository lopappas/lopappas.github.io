import test from 'node:test';
import assert from 'node:assert/strict';
import {ENCYCLOPEDIA_ENTRIES,CHAPTERS,RARITY_ORDER,encyclopediaGroups,isEntryRevealed,recordDiscoveries} from '../src/encyclopedia.ts';
import {PLAYER_SPELLS} from '../src/magic.ts';
import {RELICS} from '../src/run.ts';
import {POTION_IDS} from '../src/battle.ts';

test('journal includes every collectible exactly once and groups by rarity',()=>{
 assert.equal(ENCYCLOPEDIA_ENTRIES.length,PLAYER_SPELLS.length+Object.keys(RELICS).length+POTION_IDS.length);
 assert.equal(new Set(ENCYCLOPEDIA_ENTRIES.map(e=>e.key)).size,ENCYCLOPEDIA_ENTRIES.length);
 assert.ok(!ENCYCLOPEDIA_ENTRIES.some(e=>e.key==='spells:ender'));
 for(const chapter of CHAPTERS){
  const groups=encyclopediaGroups(chapter);
  assert.deepEqual(groups.map(g=>g.rarity),RARITY_ORDER.filter(r=>groups.some(g=>g.rarity===r)));
  assert.ok(groups.every(g=>g.entries.every(e=>e.rarity===g.rarity&&e.chapter===chapter)));
 }
});
test('preview reveals everything; normal mode reveals collected items permanently within a session',()=>{
 const spell=ENCYCLOPEDIA_ENTRIES.find(e=>e.key==='spells:bog')!;
 assert.ok(ENCYCLOPEDIA_ENTRIES.every(e=>isEntryRevealed(e,{})));
 assert.equal(isEntryRevealed(spell,{},false),false);
 const discoveries=recordDiscoveries({},{spells:['bog'],relics:['lotus'],potions:{fury:1,freeze:0}});
 for(const key of ['spells:bog','relics:lotus','potions:fury'])assert.equal(discoveries[key as keyof typeof discoveries],true);
 assert.equal(discoveries['potions:freeze'],undefined);
 assert.equal(isEntryRevealed(spell,discoveries,false),true);
 assert.equal(recordDiscoveries(discoveries,{spells:[],relics:[],potions:{}}),discoveries);
});
