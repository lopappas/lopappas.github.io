import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {type Spell,type SpellId} from './magic';
import {combatSpellColumns} from './combatTracePresentation';
export function CombatSpells({known,apprentice,ready,canSelect,onSelect,onClose}:{known:SpellId[];apprentice:boolean;ready:boolean;canSelect?:(id:SpellId)=>boolean;onSelect:(spell:Spell)=>void;onClose:()=>void}){
 const columns=combatSpellColumns(known);
 const grid=useRef<HTMLDivElement>(null),scrollbar=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const list=grid.current!,track=scrollbar.current!;
  const update=()=>{
   const {clientHeight,scrollHeight,scrollTop}=list;
   const overflow=scrollHeight-clientHeight;
   track.hidden=overflow<=0||clientHeight===0;
   if(track.hidden)return;
   const thumbHeight=Math.min(clientHeight,Math.max(16,clientHeight*clientHeight/scrollHeight));
   const progress=Math.max(0,Math.min(1,scrollTop/overflow));
   track.style.setProperty('--thumb-height',`${thumbHeight}px`);
   track.style.setProperty('--thumb-offset',`${progress*(clientHeight-thumbHeight)}px`);
  };
  // Watch column heights as well as the scroll viewport for font and layout changes.
  const observer=new ResizeObserver(update);
  observer.observe(list);
  for(const column of list.children)observer.observe(column);
  list.addEventListener('scroll',update,{passive:true});
  update();
  return()=>{observer.disconnect();list.removeEventListener('scroll',update);};
 },[known]);
 const close=useRef<HTMLButtonElement>(null),closeAction=useRef(onClose);closeAction.current=onClose;
 useEffect(()=>{if(!canSelect)close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeAction.current();}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[]);
 return <div className="combat-spells-shade" onClick={onClose}><section className="combat-spells" role="dialog" aria-label="Acquired spells" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=='Tab')return;const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}>
  <header><button ref={close} className="close-combat-spells" onClick={onClose} aria-label="Close spells"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button></header>
  <div className="combat-spells-scroll">
  <div ref={grid} className="combat-spells-grid" data-columns={columns.length} style={{gridTemplateColumns:`repeat(${columns.length},minmax(0,1fr))`}}>{columns.map(column=><div key={column.element} className="combat-spells-column" role="group" aria-label={`${column.element} spells`}>{column.spells.map(spell=><button key={spell.id} data-tutorial2-target={`spell-${spell.id}`} disabled={!ready||canSelect?.(spell.id)===false} style={{color:spell.color}} onClick={()=>onSelect(spell)} aria-label={`Trace ${spell.name}`}><svg viewBox="0 0 100 100" aria-hidden="true"><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{spell.name}</span></button>)}</div>)}</div>
  <div ref={scrollbar} className="combat-spells-scrollbar" hidden aria-hidden="true"/>
  </div>

  {(!ready||!apprentice)&&<p>{!ready?'Trace is recharging.':'Trace: 2s · Recharge: 10s'}</p>}
 </section></div>;
}
