import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useDeveloperHold} from './Developer';
import {playUISound} from './sound';
import {SPELLS,type Spell,type SpellId} from './magic';
import {BOOK_TRANSITION_MS} from './guide';
import {spellbookColumns,spellName,spellUpgradePreview} from './spellbook';
import {LessonText,type SpellAccent} from './LessonText';

function Sigil({spell}:{spell:Spell}){return <svg viewBox="0 0 100 100" aria-hidden="true"><path d={spell.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
type UpgradePage={selected:boolean;used:boolean;confirmed:boolean;celebrating:boolean;damageBonus:number;onConfirm:()=>void};
type Props={known:SpellId[];upgrades:Partial<Record<SpellId,number>>;reference:Spell;pageFlash:number;closing:boolean;inCombat?:boolean;tutorialHint?:{text:string;spellId?:SpellId;accent?:SpellAccent};upgrade?:UpgradePage;onSelect:(spell:Spell)=>void;onClose:()=>void};
export function Spellbook({known,upgrades,reference,pageFlash,closing,inCombat=false,tutorialHint,upgrade,onSelect,onClose}:Props){
 const dialog=useRef<HTMLElement>(null),closeRef=useRef(onClose);closeRef.current=onClose;
 const level=upgrades[reference.id]??0,preview=upgrade?spellUpgradePreview(reference.id,upgrade.confirmed?Math.max(0,level-1):level,upgrade.damageBonus):null;
 const pagesDisabled=closing||!!upgrade?.confirmed;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,modal=dialog.current!;
  modal.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();closeRef.current();}
   if(e.key==='Tab'){
    const items=Array.from(modal.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')),first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };
  window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[]);
 return createPortal(<div className={`modal-backdrop book-backdrop${closing?' book-closing':''}`} style={{'--book-duration':`${BOOK_TRANSITION_MS}ms`} as React.CSSProperties} onClick={onClose}>
  <section ref={dialog} className="book-modal" role="dialog" aria-modal="true" aria-labelledby="book-title" onClick={e=>e.stopPropagation()}>
   <button className="close-modal" onClick={onClose} aria-label="Close spellbook">×</button><span id="book-title" className="eyebrow">FILA'S SPELLS</span>
   {tutorialHint&&<p className="book-tutorial-task"><LessonText text={tutorialHint.text} accent={tutorialHint.accent}/></p>}
   <div className="book-elements" aria-label="Spells by element">{spellbookColumns(known).map(column=><section className="spell-column" key={column.element} aria-label={`${column.element} spells`} style={{'--element-color':column.color} as React.CSSProperties}>
    <h3><LessonText text={column.element}/></h3>{column.spells.map(spell=><button key={spell.id} className={`${reference.id===spell.id?'active':''}${tutorialHint?.spellId===spell.id?' tutorial-focus':''}`} aria-pressed={reference.id===spell.id} disabled={pagesDisabled||!!upgrade&&spell.id==='chronos'} onClick={()=>onSelect(spell)}><span className="spell-name" style={{color:spell.color}}>{spellName(spell.id,upgrades[spell.id]??0)}</span></button>)}
   </section>)}</div>
   <div className="book-sigil-frame"><button key={pageFlash} className="large-sigil page-border" style={{color:reference.color,'--page-color':reference.color} as React.CSSProperties} onClick={()=>onSelect(reference)} disabled={pagesDisabled} aria-label={`View ${spellName(reference.id,level)} sigil`}><Sigil spell={reference}/></button>{upgrade?.celebrating&&<svg className="upgrade-rainbow" viewBox="0 0 120 120" aria-hidden="true"><g>{Array.from({length:8},(_,i)=><circle key={i} cx="60" cy="60" r="55" fill="none" stroke={`hsl(${i*45} 90% 70%)`} strokeWidth="5" strokeDasharray={`${Math.PI*110/8} ${Math.PI*110*7/8}`} strokeDashoffset={-i*Math.PI*110/8}/>)}</g></svg>}</div>
   <h3><span className="spell-name" style={{color:reference.color}}>{spellName(reference.id,level)}</span></h3><p><LessonText text={reference.description}/></p>
   {upgrade?<div className="upgrade-preview" aria-live="polite">{!upgrade.selected?<p>Choose a spell to upgrade.</p>:preview?<><strong style={{color:reference.color}}>{upgrade.confirmed?preview.nextName:`Upgrade to ${preview.nextName}`}</strong><p>Direct damage bonus: +{preview.currentBonus}% → +{preview.nextBonus}%</p><small>Steady (60%) damage: {preview.currentDamage} → {preview.nextDamage}<br/>Before elemental advantage.</small></>:<p>Fully upgraded.</p>}</div>:<div className="book-tip">Keep the overall shape and proportions. Any size or position works. Stroke order does not matter.</div>}
   {inCombat&&<small className="book-warning">In combat, enemies keep moving while this book is open.</small>}
   {upgrade&&<button className="primary-small" disabled={closing||!upgrade.selected||upgrade.used||!preview} onClick={upgrade.onConfirm}>{upgrade.confirmed?'Upgraded!':'Confirm upgrade'}</button>}
   <button className={upgrade?'secondary-button upgrade-close':'primary-small'} onClick={onClose}>Close</button>
  </section>
 </div>,document.body);
}

type CampUpgrade={used:boolean;damageBonus:number;onConfirm:(spellId:SpellId)=>void};
export function TravelSpellbook({known,upgrades,upgrade}:{known:SpellId[];upgrades:Partial<Record<SpellId,number>>;upgrade?:CampUpgrade}){
 const [open,setOpen]=useState(false),[closing,setClosing]=useState(false),[reference,setReference]=useState(()=>SPELLS.find(s=>known.includes(s.id))!),[pageFlash,setPageFlash]=useState(0);
 const [selected,setSelected]=useState(false),[confirmed,setConfirmed]=useState(false),[celebrating,setCelebrating]=useState(false);
 const closingRef=useRef(false),commitRef=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),celebrationTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);if(celebrationTimer.current)clearTimeout(celebrationTimer.current);},[]);
 function select(spell:Spell){if(closingRef.current||commitRef.current)return;setReference(spell);setSelected(true);setPageFlash(n=>n+1);}
 function close(){if(closingRef.current)return;closingRef.current=true;setClosing(true);timer.current=setTimeout(()=>{timer.current=null;setOpen(false);setClosing(false);closingRef.current=false;},BOOK_TRANSITION_MS);}
 function show(){if(open||closingRef.current||upgrade?.used)return;if(!known.includes(reference.id))setReference(SPELLS.find(s=>known.includes(s.id))!);commitRef.current=false;setSelected(false);setConfirmed(false);setCelebrating(false);setPageFlash(n=>n+1);setOpen(true);}
 function confirm(){if(!upgrade||upgrade.used||!selected||closingRef.current||commitRef.current||(upgrades[reference.id]??0)>=2)return;commitRef.current=true;playUISound('upgrade');setConfirmed(true);setCelebrating(true);upgrade.onConfirm(reference.id);celebrationTimer.current=setTimeout(()=>{celebrationTimer.current=null;setCelebrating(false);},1400);}
 const developerHold=useDeveloperHold(show);
 return <><button className={upgrade?'camp-choice':'book-button'} disabled={!!upgrade?.used||!!upgrade&&known.every(id=>id==='chronos'||(upgrades[id]??0)>=2)} {...(upgrade?{onClick:show}:developerHold)} aria-label={upgrade?'Choose a spell to upgrade':'Open spellbook'}>{upgrade?<><strong>Upgrade</strong><small>Choose a spell in your spellbook</small></>:<><span aria-hidden="true">▤</span> Spellbook</>}</button>{open&&<Spellbook known={known} upgrades={upgrades} reference={reference} pageFlash={pageFlash} closing={closing} upgrade={upgrade?{selected,confirmed,celebrating,used:upgrade.used,damageBonus:upgrade.damageBonus,onConfirm:confirm}:undefined} onSelect={select} onClose={close}/>}</>;
}
