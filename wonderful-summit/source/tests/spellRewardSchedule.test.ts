import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,ROUTE,battleForRun,finishBattle,claimGold,claimRelic,skipRewardSpell,learnReward,leaveNode,type Run} from '../src/run.ts';

test('regular, elite and boss victories offer two unknown spells at victories 1, 4, 7 and 10',()=>{
 let run=newRun();const offered:number[]=[];
 for(const node of ROUTE.flatMap((n,i)=>n.kind==='battle'?[i]:[])){
  const active:Run={...run,node,screen:'battle'};
  const victory={...battleForRun(active),phase:'victory' as const};
  let result=finishBattle(active,victory,()=>.99);
  assert.equal(result.combats,run.combats+1);
  if([1,4,7,10].includes(result.combats)){
   offered.push(result.combats);assert.equal(result.reward!.offers.length,2);
   assert.equal(new Set(result.reward!.offers).size,2);
   assert.ok(result.reward!.offers.every(id=>!active.spells.includes(id)));
   const settled=claimRelic(claimGold(result));assert.equal(leaveNode(settled),settled);
   if(result.combats===4){result=learnReward(settled,result.reward!.offers[0]);assert.equal(result.spells.length,active.spells.length+1);}
   else{result=skipRewardSpell(settled);assert.deepEqual(result.spells,active.spells);assert.equal(skipRewardSpell(result),result);}
   assert.notEqual(leaveNode(result).screen,'rewards');
  }else assert.deepEqual(result.reward!.offers,[]);
  assert.equal(finishBattle(result,victory),result);
  run=result;
 }
 assert.deepEqual(offered,[1,4,7,10]);
 const fresh={...newRun(),screen:'battle' as const};
 assert.equal(finishBattle(fresh,{...battleForRun(fresh),phase:'victory'}).reward!.offers.length,2);
 const defeat=finishBattle(fresh,{...battleForRun(fresh),phase:'defeat',playerHP:0});
 assert.equal(defeat.combats,0);assert.equal(defeat.reward,null);
});
