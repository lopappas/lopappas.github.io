import {spellbookColumns} from './spellbook.ts';
import type {SpellId} from './magic.ts';
export const OPENING_REVIEW_HOLD_MS=1000,OPENING_REVIEW_FADE_MS=750;
export function combatOpening(elapsed:number){
 const duration=OPENING_REVIEW_HOLD_MS+OPENING_REVIEW_FADE_MS;
 return {blocked:elapsed<duration,opacity:Math.max(0,Math.min(1,1-(elapsed-OPENING_REVIEW_HOLD_MS)/OPENING_REVIEW_FADE_MS))};
}

export function openingSpells(known:SpellId[]){return spellbookColumns(known).flatMap(column=>column.spells);}
