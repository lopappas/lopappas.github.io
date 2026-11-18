import React,{useEffect,useRef,type ReactNode} from 'react';
import {TitleMountain} from './TitleMountain';
import {RainbowLetters} from './SpellGrade';

export function SummitWindow({title,titleId,className='',scrollable=false,children,onExit}:{title:string;titleId:string;className?:string;scrollable?:boolean;children:ReactNode;onExit:()=>void}){
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  dialog.current?.querySelector<HTMLElement>(scrollable?'.credits-copy':'.summit-continue')?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onExit();}if(e.key==='Tab'){const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button,a,[tabindex="0"]')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 },[onExit,scrollable]);
 return <section ref={dialog} className={`credits-screen ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onExit}>
  <div className="credits-summit"><TitleMountain/></div>
  <button className="credits-dismiss" aria-label={`Close ${title.toLowerCase()}`}/>
  <div className="credits-copy" tabIndex={scrollable?0:undefined} role={scrollable?"region":undefined} aria-labelledby={scrollable?titleId:undefined} onClick={scrollable?e=>e.stopPropagation():undefined}><h1 id={titleId}>{title}</h1>{children}</div><button className="summit-continue grade-wonderful" aria-label={scrollable?"Close version history":"Tap anywhere to continue"} onClick={e=>{e.stopPropagation();onExit();}}><span aria-hidden="true"><RainbowLetters text={scrollable?"Continue":"Tap anywhere to continue"}/></span></button>
 </section>;
}
