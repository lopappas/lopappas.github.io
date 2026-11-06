export const FILA_CHARACTER_MS=48/1.15;
export const FILA_PUNCTUATION_PAUSE_MS=500;

// Shared timing for every Tutorial 2.0 Fila line; only active, visible time counts.
export function advanceFilaDialogue(elapsedMs:number,deltaMs:number,active:boolean){
 return active&&Number.isFinite(deltaMs)&&deltaMs>0?elapsedMs+deltaMs:elapsedMs;
}
export function filaDialogueFrame(text:string,elapsedMs:number){
 const characters=Array.from(text),elapsed=Math.max(0,elapsedMs);let typingMs=0,count=0;
 for(const character of characters){typingMs+=FILA_CHARACTER_MS;if(elapsed>=typingMs)count++;if(character==='.'||character==='!')typingMs+=FILA_PUNCTUATION_PAUSE_MS;}
 typingMs=Math.max(typingMs,(filaCharacterTimes(text).at(-1)??0)+FILA_LETTER_FADE_MS);
 return{text:characters.slice(0,count).join(''),typed:elapsed>=typingMs};
}

export const FILA_LETTER_FADE_MS=220;
export function filaCharacterTimes(text:string){
 let time=0;return Array.from(text,character=>{time+=FILA_CHARACTER_MS;const appearsAt=time;if(character==='.'||character==='!')time+=FILA_PUNCTUATION_PAUSE_MS;return appearsAt;});
}

export function canContinueFilaDialogue(text:string,elapsedMs:number,active:boolean,acknowledged=false){return active&&!acknowledged&&filaDialogueFrame(text,elapsedMs).typed;}
