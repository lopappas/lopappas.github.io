import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HoldGesture} from '../src/holdGesture.ts';
import {applyDeveloperCommand,parseDeveloperCommand} from '../src/developerCommands.ts';
import {newRun,RELICS,enterNode,finishBattle,type RelicId} from '../src/run.ts';
import {newBattle} from '../src/battle.ts';
test('local developer grants validate spell and relic IDs without requiring a network identity',()=>{
 for(const command of [{type:'gold'},{type:'spell',id:'wave'},{type:'relic',id:'twillyScarf'},{type:'relic',id:'birkinStock'}])assert.deepEqual(parseDeveloperCommand(command),command);
 for(const command of [null,{type:'spell',id:'unknown'},{type:'relic',id:'__proto__'}])assert.equal(parseDeveloperCommand(command),null);
});
test('developer grants are immediate, preserve run state, and cannot duplicate spells or relics',()=>{
 const start={...newRun(),node:3,health:41,screen:'battle' as const},gold=applyDeveloperCommand(start,{type:'gold'});assert.equal(gold.gold,1000);assert.equal(gold.health,41);assert.equal(gold.node,3);
 const spell=applyDeveloperCommand(gold,{type:'spell',id:'bolt'});assert.ok(spell.spells.includes('bolt'));assert.equal(applyDeveloperCommand(spell,{type:'spell',id:'bolt'}),spell);
 const relic=applyDeveloperCommand(spell,{type:'relic',id:'birkinStock'});assert.ok(relic.relics.includes('birkinStock'));assert.equal(applyDeveloperCommand(relic,{type:'relic',id:'birkinStock'}),relic);
});
test('three-second hold fires once and consumes click; short and cancelled holds stay ordinary clicks',t=>{
 t.mock.timers.enable({apis:['setTimeout']});let opens=0;const hold=new HoldGesture();hold.start(()=>opens++);t.mock.timers.tick(2999);assert.equal(opens,0);t.mock.timers.tick(1);assert.equal(opens,1);t.mock.timers.tick(5000);assert.equal(opens,1);assert.equal(hold.click(),false);assert.equal(hold.click(),true);
 hold.start(()=>opens++);t.mock.timers.tick(1000);hold.cancel();t.mock.timers.tick(5000);assert.equal(opens,1);assert.equal(hold.click(),true);
});
test('ordinary shop and elite random rolls can select both new relics without excluding other relics',()=>{
 const shop=new Set<string>(),elite=new Set<string>();for(let i=0;i<100;i++){const random=()=>i/100;const stock=enterNode({...newRun(),screen:'map',node:2},random).stock;for(const item of stock)if(item.kind==='relic')shop.add(item.item);const reward=finishBattle({...newRun(),screen:'battle',node:3},{...newBattle('active'),phase:'victory'},random).reward;if(reward?.relic)elite.add(reward.relic);}
 for(const id of Object.keys(RELICS) as RelicId[]){assert.ok(shop.has(id),id+' in shop');assert.ok(elite.has(id),id+' in elite rewards');}
});
