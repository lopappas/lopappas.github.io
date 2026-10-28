import {SPELLS,type Element,type SpellId} from './magic.ts';
import {spellDamage} from './battle.ts';

const ELEMENT_ORDER:Element[]=['Water','Fire','Nature'];
const BEGINNERS=new Set<SpellId>(['water','fire','nature']);
export function spellbookColumns(known:SpellId[]){
 return ELEMENT_ORDER.map(element=>({element,color:SPELLS.find(s=>s.element===element)!.color,spells:SPELLS.filter(s=>s.element===element&&known.includes(s.id)).sort((a,b)=>Number(!BEGINNERS.has(a.id))-Number(!BEGINNERS.has(b.id)))}));
}
export function spellName(spellId:SpellId,level=0){return SPELLS.find(s=>s.id===spellId)!.name+'+'.repeat(Math.max(0,Math.min(2,level)));}
export function spellUpgradePreview(spellId:SpellId,level=0,damageBonus=1){
 if(level>=2)return null;
 return{currentName:spellName(spellId,level),nextName:spellName(spellId,level+1),currentBonus:level*25,nextBonus:(level+1)*25,currentDamage:spellDamage({element:'Neutral'},60,spellId,damageBonus,level),nextDamage:spellDamage({element:'Neutral'},60,spellId,damageBonus,level+1)};
}
