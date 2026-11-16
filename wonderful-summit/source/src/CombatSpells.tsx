import React,{useEffect,useRef} from 'react';
import {type Spell,type SpellId} from './magic';
import {orderedCombatSpells} from './combatTracePresentation';
export function CombatSpells({known,apprentice,ready,hasGuide,onSelect,onHide,onClose}:{known:SpellId[];apprentice:boolean;ready:boolean;hasGuide:boolean;onSelect:(spell:Spell)=>void;onHide:()=>void;onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null),closeAction=useRef(onClose);closeAction.current=onClose;
 useEffect(()=>{close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeAction.current();}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[]);
 return <div className="combat-spells-shade" onClick={onClose}><section className="combat-spells" role="dialog" aria-label="Acquired spells" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key!=='Tab')return;const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}>
  <header><strong>Spells</strong>{hasGuide&&<button className="hide-combat-trace" onClick={onHide}>Hide trace</button>}<button ref={close} onClick={onClose} aria-label="Close spells">×</button></header>
  <div className="combat-spells-grid">{orderedCombatSpells(known).map(spell=><button key={spell.id} disabled={!ready} style={{color:spell.color}} onClick={()=>onSelect(spell)} aria-label={`Trace ${spell.name}`}><svg viewBox="0 0 100 100" aria-hidden="true"><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{spell.name}</span></button>)}</div>
  <p>{!ready?'Trace is recharging.':apprentice?'Tap a spell for a lasting guide.':'Trace: 2s · Recharge: 10s'}</p>
 </section></div>;
}
