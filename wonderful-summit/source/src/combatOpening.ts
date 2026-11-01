export const OPENING_BOOK_HOLD_MS=1000,OPENING_BOOK_FADE_MS=750;
export function combatOpening(elapsed:number){
 const duration=OPENING_BOOK_HOLD_MS+OPENING_BOOK_FADE_MS;
 return {blocked:elapsed<duration,opacity:Math.max(0,Math.min(1,1-(elapsed-OPENING_BOOK_HOLD_MS)/OPENING_BOOK_FADE_MS))};
}
