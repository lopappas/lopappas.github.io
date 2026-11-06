import React,{useEffect,useRef} from 'react';
import {TitleMountain} from './TitleMountain';
import {RainbowLetters} from './SpellGrade';
export function Credits({onExit}:{onExit:()=>void}){
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  dialog.current?.querySelector('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onExit();}if(e.key==='Tab'){const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button,a')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 },[onExit]);
 return <section ref={dialog} className="credits-screen" role="dialog" aria-modal="true" aria-labelledby="credits-title" onClick={onExit}>
  <div className="credits-summit"><TitleMountain/></div>
  <button className="credits-dismiss" aria-label="Close credits"/>
  <div className="credits-copy"><h1 id="credits-title">Credits</h1><h2>Creator</h2><p>Lorenzo Pappas</p><h2>Audio · SFX</h2><p>Scrawl Sound: Frostnox</p><p className="credits-attribution">Quick Pencil Writing 1 by Frostnox<br/><a href="https://freesound.org/s/796659/" target="_blank" rel="noreferrer">https://freesound.org/s/796659/</a><br/>License: Attribution 4.0</p><h2>Special Thanks &lt;3</h2><p>Slay the Spire<br/>Witch Hat Atelier</p><p className="credits-codex">Made with Codex</p><small className="grade-wonderful" aria-label="Tap anywhere to return"><span aria-hidden="true"><RainbowLetters text="Tap anywhere to return"/></span></small></div>
 </section>;
}
