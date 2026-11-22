import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpellScoringBoost,SPELL_SCORING_BOOST_KEY} from '../src/spellScoringBoost.ts';

test('spell scoring boost starts off and persists each choice across reloads',()=>{
 const values=new Map<string,string>();
 const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 const initial=createSpellScoringBoost(storage);
 assert.equal(initial.getSnapshot(),false);
 initial.setEnabled(true);
 assert.equal(values.get(SPELL_SCORING_BOOST_KEY),'true');
 const reloaded=createSpellScoringBoost(storage);
 assert.equal(reloaded.getSnapshot(),true);
 reloaded.setEnabled(false);
 assert.equal(createSpellScoringBoost(storage).getSnapshot(),false);
});

test('spell scoring boost works for the session if storage is blocked',()=>{
 const store=createSpellScoringBoost({getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}});
 const updates:boolean[]=[];
 const stop=store.subscribe(()=>updates.push(store.getSnapshot()));
 assert.equal(store.getSnapshot(),false);
 store.setEnabled(true);
 store.setEnabled(true);
 store.setEnabled(false);
 stop();
 store.setEnabled(true);
 assert.deepEqual(updates,[true,false]);
});
