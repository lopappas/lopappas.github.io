import {SPELL_COOLDOWNS,spellCooldownRemaining,type Battle} from './battle.ts';
import type {SpellId} from './magic.ts';

/** Newest starts on the left; duration and remaining time must not determine queue position. */
export function orderedActiveCooldowns(battle:Battle,known:SpellId[]){
 const started=(id:SpellId)=>(battle.cooldowns[id]??0)-(SPELL_COOLDOWNS[id]??0);
 return known.filter(id=>SPELL_COOLDOWNS[id]&&spellCooldownRemaining(battle,id)>0)
  .sort((a,b)=>started(b)-started(a));
}
