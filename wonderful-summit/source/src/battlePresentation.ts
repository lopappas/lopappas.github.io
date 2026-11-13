import {POTION_IDS,SPELL_COOLDOWNS,spellCooldownRemaining,cloverReady,robesBonus,type Battle} from './battle.ts';
import {practiceEffects} from './practice.ts';
import type {SpellId} from './magic.ts';
/** Only displayed values belong here; simulation and drawing always read the live battle. */
export function combatControlValues(b:Battle,known:SpellId[],practice=false):readonly unknown[]{
 const remaining=(until:number)=>until>b.time?(until-b.time).toFixed(1):null;
 return [b.phase,b.encounter,b.playerHP,b.sphereShatteredAt,b.shaleContacts,b.castingRelics.calculus,cloverReady(b),robesBonus(b),b.robes.spells,b.furyReady,b.lotus,b.lotusReady,b.stellarReady,b.potionCapacity,
  ...POTION_IDS.map(id=>b.potions[id]??0),b.bottledSpells,b.potionFlights.some(f=>f.potion==='stellar'&&!f.applied),
  b.alchemizedPotion&&b.time<b.alchemizeAt+3?b.alchemizedPotions??b.alchemizedPotion:null,
  b.sphereShatteredAt!==null&&b.time<b.sphereShatteredAt+3.6,
  remaining(b.freezeUntil),remaining(b.rejectionUntil),remaining(b.unlimitedUntil),
  ...known.filter(id=>SPELL_COOLDOWNS[id]).map(id=>{const time=spellCooldownRemaining(b,id);return time>0?time.toFixed(1):null;}),
  practice?practiceEffects(b).join('|'):null];
}
export function equalControlValues(a:readonly unknown[],b:readonly unknown[]){return a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));}
/** High-frequency publication is confined to subscribers such as the animated world. */
export class BattlePresentation{
 private battle:Battle;
 private controls:readonly unknown[];
 private listeners=new Set<()=>void>();
 constructor(battle:Battle,known:SpellId[],practice=false){this.battle=battle;this.controls=combatControlValues(battle,known,practice);}
 getSnapshot=()=>this.battle;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 publish(battle:Battle,known:SpellId[],practice=false){
  const controls=combatControlValues(battle,known,practice),changed=!equalControlValues(this.controls,controls);
  this.controls=controls;
  if(this.battle!==battle){this.battle=battle;this.listeners.forEach(listener=>listener());}
  return changed;
 }
}
