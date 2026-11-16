import {revealHomeModes} from './homeModeReveal';
import React,{useEffect,useRef,useState} from 'react';
import {RainbowLetters} from './SpellGrade';

export function HomeModeChoices({onApprentice,onExpert,onBack}:{onApprentice:()=>void;onExpert:()=>void;onBack:()=>void}){
 const [ready,setReady]=useState(false),[visible,setVisible]=useState(false);
 const first=useRef<HTMLButtonElement>(null);
 useEffect(()=>revealHomeModes(()=>setVisible(true),()=>setReady(true),window.matchMedia('(prefers-reduced-motion: reduce)').matches),[]);
 useEffect(()=>{if(ready)first.current?.focus({preventScroll:true});},[ready]);
 return <HomeModeChoicesView ready={ready} visible={visible} first={first} onApprentice={onApprentice} onExpert={onExpert} onBack={onBack}/>;
}

export function HomeModeChoicesView({ready,visible=ready,first,onApprentice,onExpert,onBack}:{ready:boolean;visible?:boolean;first?:React.RefObject<HTMLButtonElement|null>;onApprentice:()=>void;onExpert:()=>void;onBack:()=>void}){
 return <section className={`home-mode-choices${visible?' is-visible':''}`} aria-label="Choose a mode" inert={!ready} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onBack();}}}>
  <div className="home-mode-row">
   <button ref={first} className="primary-small grade-beautiful" aria-label="Apprentice" onClick={onApprentice}><span aria-hidden="true"><RainbowLetters text="Apprentice" tone="beautiful"/></span></button>
   <button className="primary-small grade-wonderful" aria-label="Expert" onClick={onExpert}><span aria-hidden="true"><RainbowLetters text="Expert"/></span></button>
  </div>
  <button className="home-mode-back" onClick={onBack}>Back</button>
  <p className="home-mode-notice" role="status">Apprentice is recommended for new players.</p>
 </section>;
}
