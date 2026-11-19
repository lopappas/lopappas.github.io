import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ACT_ONE_EVENTS,forgottenCampsiteOutcome,HEART_TRACE_PATH,heartRockQuality,heartRockReward,trailEventDescription} from '../src/events.ts';
import {ROUTE,newRun,startRun,enterNode,selectTrailNode,unlockDeveloperTrail,castHeartRock,castTrailEvent,camp,leaveNode,battleForRun,type Run} from '../src/run.ts';
import {SPELLS,recognize,shape} from '../src/magic.ts';
import {snapshotDrawing} from '../src/drawings.ts';
const eventNode=ROUTE.findIndex(n=>n.kind==='event');
const visit=(roll=0):Run=>enterNode({...newRun(),screen:'map',node:eventNode,health:20,combats:5,campUsed:true},()=>roll);

test('the random event slot equally splits Heart Rock and Forgotten Campsite after Rocky clearing',()=>{
 assert.deepEqual(ACT_ONE_EVENTS,['forgottenCampsite','heartRock']);assert.equal(ROUTE[eventNode].icon,'?');assert.equal(ROUTE[eventNode].name,'Random event');assert.equal(ROUTE[eventNode-1].name,'Rocky clearing');assert.equal(ROUTE[eventNode+1].name,'Woodland barricade');assert.deepEqual(ROUTE.filter(n=>n.kind==='camp').map(n=>n.name),['Firefly campsite','Mossy grove campsite']);
 const r=visit();assert.equal(r.screen,'event');assert.deepEqual(r.event,{id:'forgottenCampsite',outcome:'pending'});assert.equal(r.campUsed,false);assert.equal(enterNode(r),r);
 assert.equal(visit(.49999).event?.id,'forgottenCampsite');
 for(const roll of [.5,.99,1])assert.deepEqual(visit(roll).event,{id:'heartRock',outcome:'pending'});
});
test('starting a run assigns one event shared by normal entry and developer travel',()=>{
 const sister:Run={...newRun(),screen:'sister',keepsakeOffers:['amber']};
 for(const [roll,id] of [[.49,'forgottenCampsite'],[.5,'heartRock']] as const){
  const run=startRun(sister,'amber',()=>roll);
  assert.equal(run.trailEventId,id);
  const unexpectedRoll=()=>{throw new Error('Entering the node must reuse the run event');};
  const entered=enterNode({...run,node:eventNode},unexpectedRoll);
  const jumped=selectTrailNode(unlockDeveloperTrail(run),eventNode,unexpectedRoll);
  for(const eventRun of [entered,jumped]){
   assert.deepEqual(eventRun.event,{id,outcome:'pending'});
   assert.equal(leaveNode(eventRun).trailEventId,id);
  }
 }
 assert.equal(newRun().trailEventId,undefined);
});
test('fire quality boundaries, non-fire spells and fizzles resolve to the specified outcomes',()=>{
 for(const id of ['fire','bolt'] as const)for(const [q,outcome] of [[45,'spark'],[59,'spark'],[60,'fleeting'],[64,'fleeting'],[65,'lit'],[70,'lit'],[100,'lit']] as const)assert.equal(forgottenCampsiteOutcome(id,q),outcome);
 for(const id of [null,'water','nature','wave','leaf','chronos'] as const)for(const q of [0,59,64,65,100])assert.equal(forgottenCampsiteOutcome(id,q),'noEffect');
 for(const q of [0,44,NaN,Infinity])assert.equal(forgottenCampsiteOutcome('fire',q),'noEffect');
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
 const rested=camp(lit);assert.equal(rested.health,80);assert.equal(rested.campUsed,true);assert.equal(camp(rested,'fire'),rested);
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

test('Heart Rock rewards each score tier and gives no HP below 50%',()=>{
 const boundaries=[[0,0],[49,0],[50,5],[59,5],[60,10],[69,10],[70,15],[79,15],[80,20],[89,20],[90,25],[100,25],[NaN,0],[Infinity,0]];
 for(const [quality,reward] of boundaries){
  assert.equal(heartRockReward(quality),reward);
  const initial={...visit(.5),health:60};
  const cast=castHeartRock(initial,quality);
  assert.equal(cast.event?.outcome,reward?'blessed':'noEffect');
  assert.equal(cast.health,60+reward);
  assert.equal(cast.maxHealth,reward?100+reward:undefined);
  assert.equal(castHeartRock(cast,100),cast);
  assert.equal(camp(cast),cast);
 }
});

test('Heart Rock can be skipped and a cast adds to any existing cap for the rest of the run',()=>{
 const heart={...visit(.99),health:96,maxHealth:135,relics:['perfectedSphere'] as Run['relics']};
 assert.equal(leaveNode(heart).health,96);
 assert.equal(castTrailEvent(heart,'fire',100),heart);
 assert.equal(castHeartRock({...heart,pendingBottle:true},95).event?.outcome,'pending');
 assert.equal(castHeartRock(visit(),95).event?.outcome,'pending');
 assert.deepEqual(castHeartRock(heart,25).relics,['perfectedSphere']);
 const next=enterNode(leaveNode(castHeartRock(heart,95)));
 const battle=battleForRun(next);
 assert.equal(next.event,null);
 assert.equal(battle.playerHP,121);
 assert.equal(battle.maxHealth,160);
 assert.deepEqual(next.relics,['perfectedSphere']);
});

test('Heart Rock scores the heart by geometry, independent of starting point, size and draw direction',()=>{
 const outline=[[50,29],[44,22],[36,18],[28,18],[21,21],[15,28],[13,36],[16,46],[22,53],[34,67],[50,82],[67,67],[78,53],[84,46],[87,36],[85,28],[79,21],[72,18],[64,18],[56,22],[50,29]].map(([x,y])=>({x,y}));
 const [start,...curves]=HEART_TRACE_PATH.slice(1).split(' C').map(segment=>segment.split(' ').map(Number));
 assert.equal(heartRockQuality([shape(start,curves)]),100);
 const shifted=[...outline.slice(9),...outline.slice(1,10)];
 assert.ok(Math.abs(heartRockQuality([shifted])-heartRockQuality([outline]))<=1);
 const scaled=outline.map(p=>({x:1.4*p.x+17,y:1.4*p.y+29}));
 assert.ok(heartRockQuality([outline])>=70);
 assert.equal(heartRockQuality([scaled]),heartRockQuality([outline]));
 assert.equal(heartRockQuality([outline.toReversed()]),heartRockQuality([outline]));
 assert.equal(heartRockQuality([]),0);
 for(const id of ['fire','water','nature','snowman'])assert.ok(heartRockQuality(SPELLS.find(spell=>spell.id===id)!.strokes)<50);
});
