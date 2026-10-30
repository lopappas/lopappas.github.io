import {test} from 'node:test';
import assert from 'node:assert/strict';
import {snapshotDrawing,bestDrawing} from '../src/drawings.ts';
import {newRun,battleForRun,finishBattle,sealBottle,ROUTE,isEliteNode,RELICS,claimGold,claimRelic,leaveNode} from '../src/run.ts';
import {newBattle} from '../src/battle.ts';
const strokes=[[{x:17,y:23},{x:49,y:76},{x:94,y:29}],[{x:48,y:77},{x:48,y:113}]];
test('best drawing saves the actual uneven player strokes, preserving position, size and stroke order',()=>{
 const original=structuredClone(strokes),drawing=snapshotDrawing('nature',83,original,320,240);original[0][0].x=999;original.length=0;assert.deepEqual(drawing.strokes,strokes);assert.equal(drawing.width,320);assert.equal(drawing.height,240);
 const stored=bestDrawing(null,drawing)!;drawing.strokes[0][0].y=777;assert.deepEqual(stored.strokes,strokes);
});
test('higher quality wins across battles, ties preserve the earlier drawing, failed attempts never replace a valid spell',()=>{
 const a=snapshotDrawing('nature',63,strokes,320,240),b=snapshotDrawing('water',81,[[{x:4,y:7},{x:55,y:84}]],180,200);assert.equal(bestDrawing(a,a),a);assert.equal(bestDrawing(b,a),b);assert.deepEqual(bestDrawing(a,b)?.strokes,b.strokes);assert.equal(bestDrawing(b,snapshotDrawing(null,99,strokes,320,240)),b);assert.equal(bestDrawing(null,null),null);
});
test('the full-run drawing survives victory, future battles and defeat, then resets with a new run',()=>{
 const drawing=snapshotDrawing('nature',84,strokes,320,240),r={...newRun(),screen:'battle' as const};const won=finishBattle(r,{...battleForRun(r),bestDrawing:drawing,phase:'victory'},()=>.99);assert.deepEqual(won.bestDrawing?.strokes,strokes);
 const next={...won,screen:'battle' as const,node:1};const b=battleForRun(next);assert.deepEqual(b.bestDrawing?.strokes,strokes);const lost=finishBattle(next,{...b,phase:'defeat',playerHP:0});assert.equal(lost.screen,'defeat');assert.equal(lost.bestDrawing?.quality,84);assert.deepEqual(lost.bestDrawing?.strokes,strokes);assert.equal(newRun().bestDrawing,null);
});
test('bottled spell drawings use the same original-stroke run record without adding reference templates',()=>{
 const drawing=snapshotDrawing('nature',92,strokes,320,240);const r=sealBottle({...newRun(),pendingBottle:true},{spellId:'nature',quality:92,drawing,inkUsed:30});assert.deepEqual(r.bestDrawing?.strokes,strokes);assert.equal(r.bestDrawing?.quality,92);assert.equal(r.pendingBottle,false);
});
test('Rocky clearing has elite rewards and icon while retaining the original 150 HP rocky slime',()=>{
 const node=ROUTE.findIndex(n=>n.name==='Rocky clearing');assert.equal(isEliteNode(node),true);assert.equal(ROUTE[node].icon,'♜');const run={...newRun(),screen:'battle' as const,node};const b=battleForRun(run);assert.equal(b.encounter,'rock');assert.equal(b.enemies.length,1);assert.equal(b.enemies[0].hp,150);assert.equal(b.enemies[0].rocky,true);assert.equal(b.enemies[0].element,'Neutral');
 const reward=finishBattle(run,{...b,phase:'victory'},()=>0).reward!;assert.equal(reward.gold,37);assert.ok(reward.relic);assert.ok(RELICS[reward.relic!]);
});
test('broken Impossible Shale remains owned and disabled across encounters',()=>{
 const run={...newRun(),screen:'battle' as const,relics:['impossibleShale' as const]};const r=finishBattle(run,{...newBattle('active'),shaleContacts:3,phase:'victory'},()=>.99);assert.ok(r.relics.includes('impossibleShale'));assert.equal(r.shaleContacts,3);assert.equal(battleForRun(r).shaleActive,false);
});


test('finishing the act carries the highest original drawing through boss rewards to completion',()=>{
 const earlier=snapshotDrawing('nature',84,strokes,320,240),bossStrokes=[[{x:9,y:51},{x:80,y:19},{x:61,y:143},{x:9,y:51}]],boss=snapshotDrawing('fire',91,bossStrokes,210,260);
 const run={...newRun(),screen:'battle' as const,node:ROUTE.length-1,combats:6,bestDrawing:earlier};
 const result=finishBattle(run,{...battleForRun(run),phase:'victory',bestDrawing:boss},()=>.99);
 const complete=leaveNode(claimRelic(claimGold(result)));assert.equal(complete.screen,'complete');assert.equal(complete.bestDrawing?.quality,91);assert.deepEqual(complete.bestDrawing?.strokes,bossStrokes);assert.equal(complete.bestDrawing?.width,210);assert.equal(complete.bestDrawing?.height,260);
 const lower=finishBattle(run,{...battleForRun(run),phase:'victory',bestDrawing:snapshotDrawing('fire',71,bossStrokes,210,260)},()=>.99);assert.deepEqual(leaveNode(claimGold(lower)).bestDrawing?.strokes,strokes);
});
