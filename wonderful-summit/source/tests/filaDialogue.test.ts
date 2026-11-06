import test from 'node:test';
import assert from 'node:assert/strict';
import {FILA_CHARACTER_MS,FILA_DIALOGUE_HOLD_MS,advanceFilaDialogue,filaDialogueFrame} from '../src/filaDialogue.ts';

test('Fila types the complete line before waiting two seconds and resuming the lesson',()=>{
 const text='Water dowses fire!',typingMs=Array.from(text).length*FILA_CHARACTER_MS;
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
