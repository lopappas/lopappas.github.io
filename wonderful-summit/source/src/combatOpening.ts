import {spellbookColumns} from './spellbook.ts';
import type {SpellId} from './magic.ts';
export function combatOpening(ready:boolean){return {blocked:!ready};}

export function openingSpells(known:SpellId[]){return spellbookColumns(known).flatMap(column=>column.spells);}
export function openingSpellGroups(known:SpellId[],reviewed:SpellId[]){return spellbookColumns(known).filter(group=>group.spells.length>0).map(group=>({...group,spells:group.spells.map(spell=>({...spell,isNew:!reviewed.includes(spell.id)}))}));}
