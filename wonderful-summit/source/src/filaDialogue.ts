export const FILA_CHARACTER_MS=48;
export const FILA_DIALOGUE_HOLD_MS=2200;
export const FILA_PUNCTUATION_PAUSE_MS=500;

// Shared timing for every Tutorial 2.0 Fila line; only active, visible time counts.
export function advanceFilaDialogue(elapsedMs:number,deltaMs:number,active:boolean){
 return active&&Number.isFinite(deltaMs)&&deltaMs>0?elapsedMs+deltaMs:elapsedMs;
}
export function filaDialogueFrame(text:string,elapsedMs:number,holdMs=FILA_DIALOGUE_HOLD_MS){
 const characters=Array.from(text),elapsed=Math.max(0,elapsedMs);let typingMs=0,count=0;
 for(const character of characters){typingMs+=FILA_CHARACTER_MS;if(elapsed>=typingMs)count++;if(character==='.'||character==='!')typingMs+=FILA_PUNCTUATION_PAUSE_MS;}
 return{text:characters.slice(0,count).join(''),typed:elapsed>=typingMs,complete:elapsed>=typingMs+holdMs};
}
