import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ACT_ONE_EVENTS,forgottenCampsiteOutcome,trailEventDescription} from '../src/events.ts';
import {ROUTE,newRun,enterNode,castTrailEvent,camp,leaveNode,battleForRun,type Run} from '../src/run.ts';
import {SPELLS,recognize} from '../src/magic.ts';
import {snapshotDrawing} from '../src/drawings.ts';
const eventNode=ROUTE.findIndex(n=>n.kind==='event');
const visit=():Run=>enterNode({...newRun(),screen:'map',node:eventNode,health:20,combats:5,campUsed:true},()=>.99);

test('Forgotten Campsite is the only Act 1 event, immediately after Rocky clearing; both existing camps remain',()=>{
 assert.deepEqual(ACT_ONE_EVENTS,['forgottenCampsite']);assert.equal(ROUTE[eventNode].icon,'?');assert.equal(ROUTE[eventNode].name,'Forgotten Campsite');assert.equal(ROUTE[eventNode-1].name,'Rocky clearing');assert.equal(ROUTE[eventNode+1].name,'Woodland barricade');assert.deepEqual(ROUTE.filter(n=>n.kind==='camp').map(n=>n.name),['Firefly campsite','Mossy grove campsite']);
 const r=visit();assert.equal(r.screen,'event');assert.deepEqual(r.event,{id:'forgottenCampsite',outcome:'pending'});assert.equal(r.campUsed,false);assert.equal(enterNode(r),r);
});
test('fire quality boundaries, non-fire spells and fizzles resolve to the specified outcomes',()=>{
 for(const id of ['fire','bolt'] as const)for(const [q,outcome] of [[48,'spark'],[59,'spark'],[60,'fleeting'],[64,'fleeting'],[65,'lit'],[70,'lit'],[100,'lit']] as const)assert.equal(forgottenCampsiteOutcome(id,q),outcome);
 for(const id of [null,'water','nature','wave','leaf','chronos'] as const)for(const q of [0,59,64,65,100])assert.equal(forgottenCampsiteOutcome(id,q),'noEffect');
 for(const q of [0,47,NaN,Infinity])assert.equal(forgottenCampsiteOutcome('fire',q),'noEffect');
 const r=visit();assert.equal(trailEventDescription(r.event!),'You find yourself in a long abandoned campsite. Hmmm... Maybe we can light it up once more?');
 const descriptions={lit:'A bright fireball crashes onto the logs. You feel a burst of hot air rush past your face. Then calm... The campfire is lit once more.',fleeting:'The logs were alight, but just for a fleeting moment.',spark:'The faint spark was smothered by the quiet logs',noEffect:'There was no effect'};
 for(const [outcome,text] of Object.entries(descriptions))assert.equal(trailEventDescription({id:'forgottenCampsite',outcome:outcome as keyof typeof descriptions}),text);
});
test('every completed attempt is final, including fizzles, and unlearned spells cannot light the fire',()=>{
 for(const id of ['fire','water',null] as const)for(const quality of [40,59,64,65,100]){
  const r=castTrailEvent(visit(),id,quality);assert.notEqual(r.event?.outcome,'pending');assert.equal(castTrailEvent(r,'fire',100),r);
 }
 const unlearned=castTrailEvent(visit(),'bolt',100);assert.equal(unlearned.event?.outcome,'noEffect');
 const known=castTrailEvent({...visit(),spells:['water','fire','nature','bolt']},'bolt',65);assert.equal(known.event?.outcome,'lit');
 const map={...visit(),screen:'map' as const};assert.equal(castTrailEvent(map,'fire',100),map);
});
test('success unlocks exactly one normal campsite action, without combat rewards or spending combat buffs',()=>{
 const initial={...visit(),furyReady:true,relics:['moss','lotus'] as Run['relics']},lit=castTrailEvent(initial,'fire',65);
 assert.equal(lit.combats,initial.combats);assert.equal(lit.gold,initial.gold);assert.deepEqual(lit.potions,initial.potions);assert.equal(lit.reward,null);assert.equal(lit.health,20);assert.equal(lit.furyReady,true);assert.equal(leaveNode(lit),lit);
 const rested=camp(lit);assert.equal(rested.health,90);assert.equal(rested.campUsed,true);assert.equal(camp(rested,'fire'),rested);
 const upgraded=camp(lit,'fire');assert.equal(upgraded.upgrades.fire,1);assert.equal(upgraded.health,20);assert.equal(camp(upgraded),upgraded);
 const maxed={...lit,upgrades:{fire:1}};assert.equal(camp(maxed,'fire'),maxed);assert.equal(camp(lit,'bolt'),lit);
 for(const completed of [rested,upgraded]){const next=leaveNode(completed);assert.equal(next.screen,'map');assert.equal(next.node,eventNode+1);assert.equal(next.event,null);assert.equal(battleForRun(next).encounter,'shieldPack');}
});
test('failed attempts cannot rest or upgrade; players can leave a failed or untouched event',()=>{
 for(const r of [visit(),castTrailEvent(visit(),'fire',64),castTrailEvent(visit(),'fire',59),castTrailEvent(visit(),null,0)]){
  assert.equal(camp(r),r);assert.equal(camp(r,'fire'),r);const next=leaveNode(r);assert.equal(next.node,eventNode+1);assert.equal(next.event,null);assert.equal(next.health,r.health);assert.equal(next.combats,r.combats);
 }
 const pendingBottle={...visit(),pendingBottle:true};assert.equal(castTrailEvent(pendingBottle,'fire',100),pendingBottle);assert.equal(leaveNode(pendingBottle),pendingBottle);
});
test('event uses normal recognition and preserves the actual successful drawing for run records',()=>{
 const strokes=SPELLS.find(s=>s.id==='fire')!.strokes.map(s=>s.map(p=>({x:p.x*2+30,y:p.y*2+12}))),r=visit(),match=recognize(strokes,r.spells);assert.equal(match.spell?.id,'fire');
 const drawing=snapshotDrawing(match.spell!.id,match.quality,strokes,300,240),lit=castTrailEvent(r,match.spell!.id,match.quality,drawing);assert.equal(lit.event?.outcome,'lit');assert.deepEqual(lit.bestDrawing?.strokes,strokes);assert.equal(lit.bestDrawing?.width,300);
});


test('the event retains quality for successful, weak, non-fire and fizzled attempts',()=>{
 for(const [id,quality] of [['fire',65],['fire',64],['fire',59],['water',93],[null,37],[null,0]] as const){const r=castTrailEvent(visit(),id,quality);assert.equal(r.event?.quality,quality);assert.equal(castTrailEvent(r,'fire',100).event?.quality,quality);}
 assert.equal(castTrailEvent(visit(),null,NaN).event?.quality,0);
});
