import {SPELLS,isUpgradableSpell,type Element,type SpellId} from './magic.ts';
import {firestormBaseDamage} from './firestorm.ts';
import {thistleStats} from './nearSpells.ts';
import {spellDamage,spellKnockback} from './battle.ts';

const ELEMENT_ORDER:Element[]=['Water','Fire','Nature','Ancient'];
const BEGINNERS=new Set<SpellId>(['water','fire','nature']);
export function spellbookColumns(known:SpellId[]){
 return ELEMENT_ORDER.filter(element=>element!=='Ancient'||SPELLS.some(s=>s.element==='Ancient'&&known.includes(s.id))).map(element=>({element,color:SPELLS.find(s=>s.element===element)!.color,spells:SPELLS.filter(s=>s.element===element&&known.includes(s.id)).sort((a,b)=>Number(!BEGINNERS.has(a.id))-Number(!BEGINNERS.has(b.id)))}));
}
export function spellName(spellId:SpellId,level=0){return SPELLS.find(s=>s.id===spellId)!.name+'+'.repeat(isUpgradableSpell(spellId)?Math.max(0,Math.min(1,level)):0);}
export function spellUpgradePreview(spellId:SpellId,level=0,damageBonus=1){
 if(level>=1||!isUpgradableSpell(spellId))return null;
 const duration=spellId==='chronos';
 const knockback=spellId==='puddleGuard';
 return{currentThreshold:thistleStats(60,level).budget,nextThreshold:thistleStats(60,level+1).budget,knockback,currentKnockback:spellKnockback(60,spellId,1,'Neutral',false,null,0,level),nextKnockback:spellKnockback(60,spellId,1,'Neutral',false,null,0,level+1),thistle:spellId==='thistleBush',bog:spellId==='bog',firestorm:spellId==='firestorm',currentTick:firestormBaseDamage(level),nextTick:firestormBaseDamage(level+1),duration,currentName:spellName(spellId,level),nextName:spellName(spellId,level+1),currentBonus:level*(knockback?20:duration?15:25),nextBonus:(level+1)*(knockback?20:duration?15:25),currentDamage:spellDamage({element:'Neutral'},60,spellId,damageBonus,level),nextDamage:spellDamage({element:'Neutral'},60,spellId,damageBonus,level+1)};
}
