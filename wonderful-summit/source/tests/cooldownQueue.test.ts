import test from 'node:test';
import assert from 'node:assert/strict';
import {newBattle} from '../src/battle.ts';
import {orderedActiveCooldowns} from '../src/cooldownQueue.ts';

test('new cooldowns enter on the left despite differing spell durations and learned order',()=>{
 const battle=newBattle('active');battle.time=7;
 battle.cooldowns={chronos:30,firestorm:15,bog:22};
 assert.deepEqual(orderedActiveCooldowns(battle,['chronos','firestorm','bog']),['bog','firestorm','chronos']);
 assert.deepEqual(orderedActiveCooldowns({...battle,time:9},['chronos','firestorm','bog']),['bog','firestorm','chronos']);
});
test('expiry removes entries without reordering remaining cooldowns, and refreshed cooldowns move left',()=>{
 const battle=newBattle('active');battle.time=16;
 battle.cooldowns={chronos:30,firestorm:15,bog:22};
 assert.deepEqual(orderedActiveCooldowns(battle,['chronos','firestorm','bog']),['bog','chronos']);
 battle.cooldowns.chronos=46;
 assert.deepEqual(orderedActiveCooldowns(battle,['chronos','firestorm','bog']),['chronos','bog']);
 assert.deepEqual(orderedActiveCooldowns({...battle,time:46},['chronos','firestorm','bog']),[]);
});
test('unowned, non-cooldown and disabled spells are excluded, including exact expiry boundaries',()=>{
 const battle=newBattle('active');battle.time=5;battle.cooldowns={chronos:30,bog:20};
 assert.deepEqual(orderedActiveCooldowns(battle,['chronos','fire']),['chronos']);
 assert.deepEqual(orderedActiveCooldowns({...battle,cooldownsDisabled:true},['chronos','bog']),[]);
 assert.deepEqual(orderedActiveCooldowns({...battle,time:20},['bog']),[]);
});
