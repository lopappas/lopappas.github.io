import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {openingSpells} from './combatOpening';
import {spellName} from './spellbook';
import type {SpellId} from './magic';

export function OpeningSpellReview({known,upgrades,opacity}:{known:SpellId[];upgrades:Partial<Record<SpellId,number>>;opacity:number}){
 const spells=openingSpells(known),dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  const root=document.getElementById('root'),previous=document.activeElement as HTMLElement|null,wasInert=root?.inert;
  if(root)root.inert=true;dialog.current?.focus({preventScroll:true});
  const key=(event:KeyboardEvent)=>{if(event.key==='Tab'||event.key==='Escape')event.preventDefault();};
  window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('keydown',key);if(root)root.inert=wasInert??false;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 const columns=Math.min(3,Math.max(1,spells.length)),rows=Math.ceil(spells.length/columns);
 return createPortal(<section ref={dialog} tabIndex={-1} className="opening-spell-review" role="dialog" aria-modal="true" aria-label="Pre-battle spell review" style={{opacity}}>
  <div className="opening-review-sheet"><h2>Your spells</h2><ol className="opening-review-symbols" aria-label="Owned spells in spellbook order" style={{'--review-columns':columns,'--review-rows':rows} as React.CSSProperties}>
   {spells.map(spell=><li key={spell.id}><svg viewBox="0 0 100 100" role="img" aria-label={spellName(spell.id,upgrades[spell.id]??0)} style={{color:spell.color}}><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg></li>)}
  </ol></div>
 </section>,document.body);
}
