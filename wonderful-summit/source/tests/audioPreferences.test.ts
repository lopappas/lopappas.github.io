import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAudioPreferences,audioChannelVolume,AUDIO_PREFERENCES_KEY} from '../src/audioPreferences.ts';
function storage(initial?:string){let saved=initial??null;return{getItem:(key:string)=>{assert.equal(key,AUDIO_PREFERENCES_KEY);return saved;},setItem:(key:string,value:string)=>{assert.equal(key,AUDIO_PREFERENCES_KEY);saved=value;}};}
test('audio defaults preserve existing volume, with independent music and effects controls',()=>{
 const store=createAudioPreferences();assert.deepEqual(store.getSnapshot(),{master:1,music:1,effects:1});
 store.set('master',.5);store.set('effects',.4);store.set('music',.8);
 assert.equal(audioChannelVolume('effects',store.getSnapshot()),.2);assert.equal(audioChannelVolume('music',store.getSnapshot()),.4);
 store.set('effects',0);assert.equal(audioChannelVolume('effects',store.getSnapshot()),0);assert.equal(audioChannelVolume('music',store.getSnapshot()),.4);
 store.set('master',0);assert.equal(audioChannelVolume('music',store.getSnapshot()),0);
});
test('slider values survive reload and loading settings again never resets a current edit',()=>{
 const saved=storage(),first=createAudioPreferences();first.load(saved);first.set('master',.63);first.set('music',.22);first.set('effects',0);
 const reloaded=createAudioPreferences();reloaded.load(saved);assert.deepEqual(reloaded.getSnapshot(),{master:.63,music:.22,effects:0});
 reloaded.set('effects',.7);reloaded.load(storage('{"effects":1}'));assert.equal(reloaded.getSnapshot().effects,.7);
});
test('corrupt or blocked storage cannot break audio settings; values stay in a safe range',()=>{
 for(const initial of ['bad json','null','{"master":-3,"music":4,"effects":"loud"}']){const store=createAudioPreferences();store.load(storage(initial));const value=store.getSnapshot();assert.ok(Object.values(value).every(v=>v>=0&&v<=1));store.set('master',NaN);assert.deepEqual(store.getSnapshot(),value);}
 const store=createAudioPreferences();store.load({getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}});assert.doesNotThrow(()=>store.set('effects',.25));assert.equal(store.getSnapshot().effects,.25);
});
test('live subscribers update once per change and can unsubscribe',()=>{
 const store=createAudioPreferences();let calls=0;const stop=store.subscribe(()=>calls++);store.set('master',.5);store.set('master',.5);assert.equal(calls,1);stop();store.set('master',.3);assert.equal(calls,1);
});
