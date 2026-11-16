import {SPELLS,type SpellId} from './magic.ts';
const STARTERS:SpellId[]=['water','fire','nature'];
const ELEMENT_ORDER={Water:0,Fire:1,Nature:2,Ancient:3};
export function orderedCombatSpells(known:SpellId[]){return SPELLS.filter(s=>known.includes(s.id)).sort((a,b)=>Number(!STARTERS.includes(a.id))-Number(!STARTERS.includes(b.id))||ELEMENT_ORDER[a.element]-ELEMENT_ORDER[b.element]);}
export function combatTraceScale(id:SpellId){return id==='thistleBush'?1.5:['torrent','puddleGuard'].includes(id)?1.4:['bog','chronos','firestorm','flameBlade'].includes(id)?1.15:1;}
export const TRACE_STROKE_WIDTH=4.4,TRACE_FADE_MS=180;

export function combatSpellColumns(known:SpellId[]){
 const owned=orderedCombatSpells(known),elements=owned.some(s=>s.element==='Ancient')?(['Water','Fire','Nature','Ancient'] as const):(['Water','Fire','Nature'] as const);
 return elements.map(element=>({element,spells:owned.filter(spell=>spell.element===element)}));
}
