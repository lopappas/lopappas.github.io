import React from 'react';
import {SPELLS,type SpellId} from './magic';
import {spellCooldownRemaining,type Battle} from './battle';
type Feedback={spellId:SpellId;serial:number}|null;
export function CooldownBadges({battle,ids,feedback,onFeedbackEnd}:{battle:Battle;ids:SpellId[];feedback:Feedback;onFeedbackEnd:(serial:number)=>void}){
 if(!ids.length)return null;
 return <div className="spell-cooldowns canvas-spell-cooldowns" aria-label="Spell cooldowns">{ids.map(id=>{
  const spell=SPELLS.find(s=>s.id===id)!,remaining=spellCooldownRemaining(battle,id),serial=feedback?.spellId===id?feedback.serial:null;
  return <span key={serial===null?id:id+'-'+serial} className={serial===null?undefined:'cooldown-cast-blocked'} onAnimationEnd={serial===null?undefined:()=>onFeedbackEnd(serial)} style={{'--cooldown-color':spell.color} as React.CSSProperties} aria-label={spell.name+' cooldown: '+remaining.toFixed(1)+' seconds'}><svg viewBox="0 0 100 100" aria-hidden="true"><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg><strong>{remaining.toFixed(1)}s</strong></span>;
 })}</div>;
}
