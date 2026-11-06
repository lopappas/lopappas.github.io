import test from 'node:test';
import assert from 'node:assert/strict';
import {FILA_CHARACTER_MS,FILA_LETTER_FADE_MS,FILA_PUNCTUATION_PAUSE_MS,advanceFilaDialogue,filaDialogueFrame} from '../src/filaDialogue.ts';

test('Fila finishes typing without automatically advancing',()=>{
 const text='Water dowses fire!',typingMs=Array.from(text).length*FILA_CHARACTER_MS+FILA_PUNCTUATION_PAUSE_MS;
 assert.equal(filaDialogueFrame(text,0).text,'');
 assert.equal(filaDialogueFrame(text,4*FILA_CHARACTER_MS).text,'Wate');
 assert.deepEqual(filaDialogueFrame(text,typingMs),{text,typed:true});
 assert.deepEqual(filaDialogueFrame(text,typingMs+600000),{text,typed:true});
});
test('pausing or hiding the page freezes typing',()=>{
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

test('completed dialogue remains tappable indefinitely and rejects early, paused and repeated taps',async()=>{
 const {canContinueFilaDialogue}=await import('../src/filaDialogue.ts');const text='Hi',finished=2*FILA_CHARACTER_MS+FILA_LETTER_FADE_MS;
 assert.equal(canContinueFilaDialogue(text,finished-1,true),false);
 for(const elapsed of [finished,finished+1800,finished+600000]){
  assert.equal(canContinueFilaDialogue(text,elapsed,true),true);
  assert.equal(canContinueFilaDialogue(text,elapsed,false),false);
  assert.equal(canContinueFilaDialogue(text,elapsed,true,true),false);
 }
});

test('dialogue character rate is 15 percent faster while retaining punctuation pauses',()=>{
 assert.equal(FILA_CHARACTER_MS,48/1.15);assert.equal(FILA_PUNCTUATION_PAUSE_MS,500);
});
