import {SPELLS,type Element,type SpellId} from './magic.ts';
import {spellDamage,chronosEffect} from './battle.ts';

const ELEMENT_ORDER:Element[]=['Water','Fire','Nature','Ancient'];
const BEGINNERS=new Set<SpellId>(['water','fire','nature']);
export function spellbookColumns(known:SpellId[]){
 return ELEMENT_ORDER.filter(element=>element!=='Ancient'||known.includes('chronos')).map(element=>({element,color:SPELLS.find(s=>s.element===element)!.color,spells:SPELLS.filter(s=>s.element===element&&known.includes(s.id)).sort((a,b)=>Number(!BEGINNERS.has(a.id))-Number(!BEGINNERS.has(b.id)))}));
}
export function spellName(spellId:SpellId,level=0){return SPELLS.find(s=>s.id===spellId)!.name+'+'.repeat(Math.max(0,Math.min(2,level)));}
export function spellUpgradePreview(spellId:SpellId,level=0,damageBonus=1){
 if(level>=2)return null;
 const timeRanges=spellId==='chronos'?[[48,59],[60,69],[70,79],[80,100]].map(([lo,hi])=>({grade:lo<60?'Faint':lo<70?'Steady':lo<80?'Beautiful':'Wonderful',kind:chronosEffect(lo).kind,current:[chronosEffect(lo,level).duration,chronosEffect(hi,level).duration],next:[chronosEffect(lo,level+1).duration,chronosEffect(hi,level+1).duration]})):null;
 return{timeRanges,currentName:spellName(spellId,level),nextName:spellName(spellId,level+1),currentBonus:level*(timeRanges?30:25),nextBonus:(level+1)*(timeRanges?30:25),currentDamage:spellDamage({element:'Neutral'},60,spellId,damageBonus,level),nextDamage:spellDamage({element:'Neutral'},60,spellId,damageBonus,level+1)};
}
