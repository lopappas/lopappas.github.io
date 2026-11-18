import React,{useEffect,useRef,type ReactNode} from 'react';
import {TitleMountain} from './TitleMountain';
import {RainbowLetters} from './SpellGrade';

export function SummitWindow({title,titleId,className='',scrollable=false,children,onExit}:{title:string;titleId:string;className?:string;scrollable?:boolean;children:ReactNode;onExit:()=>void}){
 const dialog=useRef<HTMLElement>(null);
 const copy=useRef<HTMLDivElement>(null);
 const gesture=useRef<{x:number;y:number;scrollTop:number;moved:boolean}|null>(null);

 function dismissOnTap(e:React.MouseEvent<HTMLElement>){
  const start=gesture.current;
  gesture.current=null;
  // Some drags can still produce a click when the scroll area has reached an edge.
  if(scrollable&&e.detail!==0&&start&&(start.moved||copy.current?.scrollTop!==start.scrollTop))return;
  onExit();
 }
 useEffect(()=>{
  dialog.current?.querySelector<HTMLElement>(scrollable?'.credits-copy':'.summit-continue')?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onExit();}if(e.key==='Tab'){const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button,a,[tabindex="0"]')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 },[onExit,scrollable]);
 return <section ref={dialog} className={`credits-screen ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={dismissOnTap}
  onPointerDown={scrollable?e=>{
   if(e.isPrimary&&e.button===0)gesture.current={x:e.clientX,y:e.clientY,scrollTop:copy.current?.scrollTop??0,moved:false};
  }:undefined}
  onPointerMove={scrollable?e=>{
   const start=gesture.current;
   if(e.isPrimary&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>10)start.moved=true;
  }:undefined}
  onPointerCancel={scrollable?()=>{if(gesture.current)gesture.current.moved=true;}:undefined}>
  <div className="credits-summit"><TitleMountain/></div>
  <button className="credits-dismiss" aria-label={`Close ${title.toLowerCase()}`}/>
  <div ref={copy} className="credits-copy" tabIndex={scrollable?0:undefined} role={scrollable?"region":undefined} aria-labelledby={scrollable?titleId:undefined}><h1 id={titleId}>{title}</h1>{children}</div><button className="summit-continue grade-wonderful" aria-label="Tap anywhere to close" onClick={e=>{e.stopPropagation();onExit();}}><span aria-hidden="true"><RainbowLetters text="Tap anywhere to close"/></span></button>
 </section>;
}
