import test from 'node:test';
import assert from 'node:assert/strict';
import {createWritingAudio,filaIsWriting,WRITING_SOUND_VOLUME} from '../src/dialogueAudio.ts';
import {FILA_CHARACTER_MS} from '../src/filaDialogue.ts';
test('pencil sound follows lettering and leaves punctuation and completed text quiet',()=>{
 assert.equal(filaIsWriting('A!B',0),true);
 assert.equal(filaIsWriting('A!B',2*FILA_CHARACTER_MS+100),false);
 assert.equal(filaIsWriting('A!B',2*FILA_CHARACTER_MS+500+1),true);
 assert.equal(filaIsWriting('A!B',99999),false);
});
test('writing audio reuses a single loop and stops for pauses, mute and disposal',async()=>{
 let volume=1,plays=0,stops=0;
 const media={loop:false,volume:1,currentTime:5,play:async()=>{plays++;},pause:()=>{stops++;}};
 const player=createWritingAudio(media,()=>volume);
 player.setWriting(true);player.setWriting(true);await Promise.resolve();assert.equal(plays,1);assert.equal(media.loop,true);assert.equal(media.volume,WRITING_SOUND_VOLUME);
 player.setWriting(false);assert.equal(stops,1);assert.equal(media.currentTime,0);
 player.setWriting(true);volume=0;player.sync();assert.equal(stops,2);assert.equal(media.volume,0);
 volume=.5;player.sync();assert.equal(media.volume,WRITING_SOUND_VOLUME*.5);assert.equal(plays,3);
 player.dispose();const before=plays;player.sync();player.setWriting(true);assert.equal(plays,before);assert.ok(stops>=3);
});
test('autoplay rejection is recoverable on a later gesture and late playback cannot outlive dialogue',async()=>{
 let reject=true,plays=0,stops=0,resolve:(()=>void)|undefined;
 const media={loop:false,volume:1,currentTime:0,play:()=>{plays++;return reject?Promise.reject(Error('blocked')):new Promise<void>(r=>{resolve=r;});},pause:()=>{stops++;}};
 const player=createWritingAudio(media,()=>1);player.setWriting(true);await Promise.resolve();await Promise.resolve();reject=false;player.sync();assert.equal(plays,2);
 player.dispose();resolve?.();await Promise.resolve();assert.ok(stops>=2);
});
