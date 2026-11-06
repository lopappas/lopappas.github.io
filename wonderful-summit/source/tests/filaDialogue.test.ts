import test from 'node:test';
import assert from 'node:assert/strict';
import {FILA_CHARACTER_MS,FILA_LETTER_FADE_MS,FILA_DIALOGUE_HOLD_MS,FILA_PUNCTUATION_PAUSE_MS,advanceFilaDialogue,filaDialogueFrame} from '../src/filaDialogue.ts';

test('Fila types the complete line before waiting 1.8 seconds and resuming the lesson',()=>{
 const text='Water dowses fire!',typingMs=Array.from(text).length*FILA_CHARACTER_MS+FILA_PUNCTUATION_PAUSE_MS;
 assert.equal(filaDialogueFrame(text,0).text,'');
 assert.equal(filaDialogueFrame(text,4*FILA_CHARACTER_MS).text,'Wate');
 assert.deepEqual(filaDialogueFrame(text,typingMs),{text,typed:true,complete:false});
 assert.equal(filaDialogueFrame(text,typingMs+FILA_DIALOGUE_HOLD_MS-1).complete,false);
 assert.equal(filaDialogueFrame(text,typingMs+FILA_DIALOGUE_HOLD_MS).complete,true);
});
test('pausing or hiding the page freezes both typing and the delay after typing',()=>{
 for(const elapsed of [50,10000]){
  assert.equal(advanceFilaDialogue(elapsed,60000,false),elapsed);
  assert.equal(advanceFilaDialogue(elapsed,32,true),elapsed+32);
  for(const invalid of [-1,NaN,Infinity])assert.equal(advanceFilaDialogue(elapsed,invalid,true),elapsed);
 }
});
test('dialogue reveals complete Unicode characters and clamps negative elapsed time',()=>{
 assert.equal(filaDialogueFrame('Hi 💧!',4*FILA_CHARACTER_MS).text,'Hi 💧');
 assert.equal(filaDialogueFrame('Hi',-50).text,'');
});

test('periods and exclamation marks each hold the revealed punctuation for an extra half second',()=>{
 for(const punctuation of ['.','!']){
  const text=`A${punctuation}B`,markAt=2*FILA_CHARACTER_MS;
  assert.equal(filaDialogueFrame(text,markAt).text,`A${punctuation}`);
  assert.equal(filaDialogueFrame(text,markAt+500+FILA_CHARACTER_MS-1).text,`A${punctuation}`);
  assert.equal(filaDialogueFrame(text,markAt+500+FILA_CHARACTER_MS).text,text);
 }
 assert.equal(filaDialogueFrame('A.!B',4*FILA_CHARACTER_MS+1000+FILA_LETTER_FADE_MS-1).typed,false);
 assert.equal(filaDialogueFrame('A.!B',4*FILA_CHARACTER_MS+1000+FILA_LETTER_FADE_MS).typed,true);
});

test('letter fade timing retains punctuation pauses and complete Unicode characters',async()=>{
 const {filaCharacterTimes,FILA_CHARACTER_MS,FILA_PUNCTUATION_PAUSE_MS}=await import('../src/filaDialogue.ts');
 assert.deepEqual(filaCharacterTimes('A!💧'),[FILA_CHARACTER_MS,FILA_CHARACTER_MS*2,FILA_CHARACTER_MS*3+FILA_PUNCTUATION_PAUSE_MS]);
});

test('the reading pause lasts exactly 1.8 seconds and can be skipped only after full reveal',async()=>{
 const {canSkipDialogueHold,FILA_LETTER_FADE_MS}=await import('../src/filaDialogue.ts');const text='Hi',finished=2*FILA_CHARACTER_MS+FILA_LETTER_FADE_MS;
 assert.equal(FILA_DIALOGUE_HOLD_MS,1800);assert.equal(canSkipDialogueHold(text,finished-1,true),false);assert.equal(canSkipDialogueHold(text,finished,true),true);assert.equal(canSkipDialogueHold(text,finished,false),false);
 assert.equal(filaDialogueFrame(text,finished+1799).complete,false);assert.equal(filaDialogueFrame(text,finished+1800).complete,true);
});

test('dialogue character rate is 15 percent faster without shortening reading or punctuation holds',()=>{
 assert.equal(FILA_CHARACTER_MS,48/1.15);assert.equal(FILA_PUNCTUATION_PAUSE_MS,500);assert.equal(FILA_DIALOGUE_HOLD_MS,1800);
});
