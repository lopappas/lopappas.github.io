import React,{useEffect,useRef,useState} from 'react';
import {RainbowLetters} from './SpellGrade';

export function HomeModeChoices({onExpert,onBack}:{onExpert:()=>void;onBack:()=>void}){
 const [comingSoon,setComingSoon]=useState(false),[ready,setReady]=useState(false);
 const first=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const timer=setTimeout(()=>{setReady(true);},180);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{if(ready)first.current?.focus({preventScroll:true});},[ready]);
 return <HomeModeChoicesView ready={ready} comingSoon={comingSoon} first={first} onApprentice={()=>setComingSoon(true)} onExpert={onExpert} onBack={onBack}/>;
}

export function HomeModeChoicesView({ready,comingSoon,first,onApprentice,onExpert,onBack}:{ready:boolean;comingSoon:boolean;first?:React.RefObject<HTMLButtonElement|null>;onApprentice:()=>void;onExpert:()=>void;onBack:()=>void}){
 return <section className="home-mode-choices" aria-label="Choose a mode" inert={!ready} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onBack();}}}>
  <div className="home-mode-row">
   <button ref={first} className="primary-small grade-beautiful" aria-label="Apprentice" onClick={onApprentice}><span aria-hidden="true"><RainbowLetters text="Apprentice" tone="beautiful"/></span></button>
   <button className="primary-small grade-wonderful" aria-label="Expert" onClick={onExpert}><span aria-hidden="true"><RainbowLetters text="Expert"/></span></button>
  </div>
  <button className="home-mode-back" onClick={onBack}>Back</button>
  <p className="home-mode-notice" role="status">{comingSoon?'Coming soon':''}</p>
 </section>;
}
