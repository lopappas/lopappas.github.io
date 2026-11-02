import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {openingSpellGroups} from './combatOpening';
import {spellName} from './spellbook';
import {LessonText} from './LessonText';
import type {Spell,SpellId} from './magic';

export function OpeningSpellReview({known,reviewed,upgrades,onReady}:{known:SpellId[];reviewed:SpellId[];upgrades:Partial<Record<SpellId,number>>;onReady:()=>void}){
 const groups=openingSpellGroups(known,reviewed),ready=useRef<HTMLButtonElement>(null),sheet=useRef<HTMLDivElement>(null),popup=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
 const [selected,setSelected]=useState<Spell|null>(null),selectedRef=useRef(selected);selectedRef.current=selected;
 useEffect(()=>{
  const root=document.getElementById('root'),previous=document.activeElement as HTMLElement|null,wasInert=root?.inert;
  if(root)root.inert=true;ready.current?.focus({preventScroll:true});
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();if(selectedRef.current)setSelected(null);}
   if(event.key==='Tab'){
    const container=selectedRef.current?popup.current:sheet.current;
    const items=Array.from(container?.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"]')??[]),first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('keydown',key);if(root)root.inert=wasInert??false;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 useEffect(()=>{
  if(!selected)return;
  const content=sheet.current;if(content)content.inert=true;close.current?.focus({preventScroll:true});
  return()=>{if(content)content.inert=false;if(trigger.current?.isConnected)trigger.current.focus({preventScroll:true});};
 },[selected]);
 return createPortal(<section className="opening-spell-review" role="dialog" aria-modal="true" aria-labelledby="opening-review-title">
  <div ref={sheet} className="opening-review-sheet"><h2 id="opening-review-title">Your spells</h2><p className="opening-review-hint">Tap a spell to inspect. Begin when you’re ready.</p>
   <div tabIndex={0} role="region" aria-label="Spells grouped by element" className="opening-review-groups">{groups.map(group=><section className="opening-review-element" key={group.element} aria-label={`${group.element} spells`} style={{'--review-color':group.color} as React.CSSProperties}>
    <ol className="opening-review-symbols">{group.spells.map(spell=><li key={spell.id} className={spell.isNew?'review-new':undefined}>
     <button className="review-spell-button" aria-label={`Inspect ${spellName(spell.id,upgrades[spell.id]??0)}`} aria-haspopup="dialog" aria-expanded={selected?.id===spell.id} aria-controls={selected?.id===spell.id?'review-spell-inspect':undefined} onClick={event=>{trigger.current=event.currentTarget;setSelected(spell);}}>
      {spell.isNew&&<span className="review-new-label">New</span>}<svg viewBox="0 0 100 100" aria-hidden="true" style={{color:spell.color}}><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <strong style={{color:spell.color}}>{spellName(spell.id,upgrades[spell.id]??0)}</strong>
     </button>
    </li>)}</ol>
   </section>)}</div>
   <button ref={ready} className="primary-small opening-review-ready" onClick={onReady}>Ready</button>
  </div>
  {selected&&<div className="review-inspect-backdrop" onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)setSelected(null);}}>
   <section ref={popup} id="review-spell-inspect" className="review-inspect-popup" role="dialog" aria-modal="true" aria-labelledby="review-inspect-title" aria-describedby="review-inspect-description">
    <button ref={close} className="review-inspect-close" aria-label="Close spell description" onClick={()=>setSelected(null)}>×</button>
    <svg className="review-inspect-sigil" viewBox="0 0 100 100" aria-hidden="true" style={{color:selected.color}}><path d={selected.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <h3 id="review-inspect-title"><LessonText text={spellName(selected.id,upgrades[selected.id]??0)}/></h3>
    <p id="review-inspect-description"><LessonText text={selected.id==='firestorm'&&(upgrades.firestorm??0)>0?selected.description.replace('2 damage every','3 damage every'):selected.description}/></p>
   </section>
  </div>}
 </section>,document.body);
}
