export const FILA_CHARACTER_MS=32;
export const FILA_DIALOGUE_HOLD_MS=2200;

// Shared timing for every Tutorial 2.0 Fila line; only active, visible time counts.
export function advanceFilaDialogue(elapsedMs:number,deltaMs:number,active:boolean){
 return active&&Number.isFinite(deltaMs)&&deltaMs>0?elapsedMs+deltaMs:elapsedMs;
}
export function filaDialogueFrame(text:string,elapsedMs:number){
 const characters=Array.from(text),elapsed=Math.max(0,elapsedMs),typingMs=characters.length*FILA_CHARACTER_MS;
 return{text:characters.slice(0,Math.floor(elapsed/FILA_CHARACTER_MS)).join(''),typed:elapsed>=typingMs,complete:elapsed>=typingMs+FILA_DIALOGUE_HOLD_MS};
}
