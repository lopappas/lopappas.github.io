import React,{useEffect,useRef,type ReactNode} from 'react';
import {TitleMountain} from './TitleMountain';
import {RainbowLetters} from './SpellGrade';

export function SummitWindow({title,titleId,className='',children,onExit}:{title:string;titleId:string;className?:string;children:ReactNode;onExit:()=>void}){
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  dialog.current?.querySelector<HTMLButtonElement>('.summit-continue')?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onExit();}if(e.key==='Tab'){const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button,a')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 },[onExit]);
 return <section ref={dialog} className={`credits-screen ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onExit}>
  <div className="credits-summit"><TitleMountain/></div>
  <button className="credits-dismiss" aria-label={`Close ${title.toLowerCase()}`}/>
  <div className="credits-copy"><h1 id={titleId}>{title}</h1>{children}</div><button className="summit-continue grade-wonderful" aria-label="Tap anywhere to continue" onClick={e=>{e.stopPropagation();onExit();}}><span aria-hidden="true"><RainbowLetters text="Tap anywhere to continue"/></span></button>
 </section>;
}
