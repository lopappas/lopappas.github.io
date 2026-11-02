import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {openingSpellGroups} from './combatOpening';
import {spellName} from './spellbook';
import type {SpellId} from './magic';

export function OpeningSpellReview({known,reviewed,upgrades,onReady}:{known:SpellId[];reviewed:SpellId[];upgrades:Partial<Record<SpellId,number>>;onReady:()=>void}){
 const groups=openingSpellGroups(known,reviewed),ready=useRef<HTMLButtonElement>(null),scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=document.getElementById('root'),previous=document.activeElement as HTMLElement|null,wasInert=root?.inert;
  if(root)root.inert=true;ready.current?.focus({preventScroll:true});
  const key=(event:KeyboardEvent)=>{if(event.key==='Tab'){event.preventDefault();(document.activeElement===ready.current?scroll.current:ready.current)?.focus();}if(event.key==='Escape')event.preventDefault();};
  window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('keydown',key);if(root)root.inert=wasInert??false;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 return createPortal(<section className="opening-spell-review" role="dialog" aria-modal="true" aria-labelledby="opening-review-title">
  <div className="opening-review-sheet"><h2 id="opening-review-title">Your spells</h2><p className="opening-review-hint">Take a moment. Begin when you’re ready.</p>
   <div ref={scroll} tabIndex={0} role="region" aria-label="Spells grouped by element" className="opening-review-groups">{groups.map(group=><section className="opening-review-element" key={group.element} aria-label={`${group.element} spells`} style={{'--review-color':group.color} as React.CSSProperties}>
    <h3>{group.element}</h3><ol className="opening-review-symbols">{group.spells.map(spell=><li key={spell.id} className={spell.isNew?'review-new':undefined}>
     {spell.isNew&&<span className="review-new-label">New</span>}<svg viewBox="0 0 100 100" aria-hidden="true" style={{color:spell.color}}><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
     <strong style={{color:spell.color}}>{spellName(spell.id,upgrades[spell.id]??0)}</strong>
    </li>)}</ol>
   </section>)}</div>
   <button ref={ready} className="primary-small opening-review-ready" onClick={onReady}>Ready</button>
  </div>
 </section>,document.body);
}
