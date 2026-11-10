import React,{useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

const STEPS=[
 {target:'practice',title:'Practice',text:'Here, you can practice casting spells that you have learned during your adventures'},
 {target:'encyclopedia',title:'Encyclopedia',text:'Here, you can view all of your spells, relics, and potions from your previous adventures'},
] as const;

/** Only the Next button advances; the menu underneath stays inert during the tour. */
export function MenuTutorial({step,onNext}:{step:0|1;onNext:()=>void}){
 const panel=useRef<HTMLElement>(null),next=useRef<HTMLButtonElement>(null);
 const [layout,setLayout]=useState<{left:number;top:number;width:number;height:number;popupTop:number}|null>(null);
 const entry=STEPS[step];
 useLayoutEffect(()=>{
  const target=document.querySelector<HTMLElement>(`[data-menu-tour="${entry.target}"]`);
  if(!target)return;
  const measure=()=>{
   const r=target.getBoundingClientRect(),height=panel.current?.getBoundingClientRect().height??160;
   setLayout({left:r.left-4,top:r.top-4,width:r.width+8,height:r.height+8,popupTop:Math.max(12,r.top-height-18)});
  };
  target.scrollIntoView({block:'nearest'});measure();next.current?.focus({preventScroll:true});
  const observer=new ResizeObserver(measure);observer.observe(target);if(panel.current)observer.observe(panel.current);
  window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);};
 },[step]);
 return createPortal(<div className="menu-tutorial-overlay">
  {layout&&<div className="menu-tutorial-spotlight" aria-hidden="true" style={{left:layout.left,top:layout.top,width:layout.width,height:layout.height}}/>}
  <section ref={panel} role="dialog" aria-modal="true" aria-labelledby="menu-tutorial-title" aria-describedby="menu-tutorial-copy" className="menu-tutorial-popup" style={{top:layout?.popupTop??12,visibility:layout?'visible':'hidden'}} onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();next.current?.focus();}}}>
   <h2 id="menu-tutorial-title">{entry.title}</h2><p id="menu-tutorial-copy">{entry.text}</p>
   <button ref={next} className="primary-small" onClick={onNext}>Next</button>
  </section>
 </div>,document.body);
}
