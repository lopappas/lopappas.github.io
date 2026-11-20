import {SPELLS,damageUpgradeBonus,isUpgradableSpell,type Element,type SpellId} from './magic.ts';
import {firestormBaseDamage} from './firestorm.ts';
import {constellationBonus} from './constellation.ts';
import {MIN_CAST_QUALITY} from './quality.ts';
import {guardianAttackInterval,guardianAttackRange,guardianBoostMultiplier,guardianKnockback,guardianStats,isGuardianSpell,shroomySporeSlow} from './guardian.ts';
import {thistleStats} from './nearSpells.ts';
import {shroomyTickDamage,spellDamage,spellKnockback} from './battle.ts';

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
 const guardianHealth=isGuardianSpell(spellId)&&spellId!=='shroomy'?{current:guardianStats(spellId,60,level).hp,next:guardianStats(spellId,60,level+1).hp}:null;
 const guardianRange=isGuardianSpell(spellId)&&spellId!=='shroomy'?{current:guardianAttackRange(spellId,level),next:guardianAttackRange(spellId,level+1)}:null;
 const guardianPush=spellId==='snowman'?{
  current:[guardianKnockback(spellId,MIN_CAST_QUALITY,level),guardianKnockback(spellId,100,level)].join('–'),
  next:[guardianKnockback(spellId,MIN_CAST_QUALITY,level+1),guardianKnockback(spellId,100,level+1)].join('–'),
 }:null;
 const shotInterval=spellId==='scorchy'?{current:guardianAttackInterval(spellId,level),next:guardianAttackInterval(spellId,level+1)}:null;
 const sporeSlow=spellId==='shroomy'?{current:shroomySporeSlow(level)*100,next:shroomySporeSlow(level+1)*100}:null;
 const damageBonusPercent=Math.round(damageUpgradeBonus(spellId)*1000)/10;
 const previewDamageBonus=isGuardianSpell(spellId)?guardianBoostMultiplier(damageBonus):damageBonus;
 const constellation=spellId==='constellation'?{current:constellationBonus(60,level),next:constellationBonus(60,level+1)}:null;
 return{constellation,sporeSlow,guardianHealth,guardianRange,guardianKnockback:guardianPush,shotInterval,alchemy:spellId==='alchemize',leaf:spellId==='leaf',currentThreshold:thistleStats(60,level).budget,nextThreshold:thistleStats(60,level+1).budget,knockback,currentKnockback:spellKnockback(60,spellId,1,'Neutral',false,null,0,level),nextKnockback:spellKnockback(60,spellId,1,'Neutral',false,null,0,level+1),thistle:spellId==='thistleBush',bog:spellId==='bog',firestorm:spellId==='firestorm',currentTick:firestormBaseDamage(level),nextTick:firestormBaseDamage(level+1),duration,currentName:spellName(spellId,level),nextName:spellName(spellId,level+1),currentBonus:level*(knockback?20:duration?12:damageBonusPercent),nextBonus:(level+1)*(knockback?20:duration?12:damageBonusPercent),currentDamage:spellId==='shroomy'?shroomyTickDamage({element:'Neutral'},60,previewDamageBonus,level):spellDamage({element:'Neutral'},60,spellId,previewDamageBonus,level),nextDamage:spellId==='shroomy'?shroomyTickDamage({element:'Neutral'},60,previewDamageBonus,level+1):spellDamage({element:'Neutral'},60,spellId,previewDamageBonus,level+1)};
}
