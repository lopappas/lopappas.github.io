import React,{useEffect,useRef,useState} from 'react';
import type {Spell} from './magic';
import {SpellAcquisition} from './spellAcquisition';

type Props=Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> & {spell?:Spell;onAcquire:()=>void};
/** Spell purchases and reward choices share the same interruptible hold. */
export function SpellAcquireButton({spell,onAcquire,disabled,className='',style,children,...props}:Props){
 const hold=useRef(new SpellAcquisition()),frame=useRef(0),input=useRef<number|string|null>(null),action=useRef(onAcquire);action.current=onAcquire;
 const [progress,setProgress]=useState(0);
 function cancel(){cancelAnimationFrame(frame.current);hold.current.cancel();input.current=null;setProgress(hold.current.progress);}
 function start(source:number|string){
  if(disabled||!spell||!hold.current.start(performance.now()))return;
  input.current=source;
  const tick=(now:number)=>{const complete=hold.current.advance(now);setProgress(hold.current.progress);if(complete){input.current=null;action.current();}else frame.current=requestAnimationFrame(tick);};
  frame.current=requestAnimationFrame(tick);
 }
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel();};window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',hide);return()=>{cancelAnimationFrame(frame.current);hold.current.cancel();window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',hide);};},[]);
 useEffect(()=>{if(disabled)cancel();},[disabled]);
 return <button {...props} disabled={disabled} className={`${className}${spell?' spell-acquire-button':''}`} style={{...style,'--acquire-color':spell?.color,'--acquire-angle':`${progress*360}deg`} as React.CSSProperties}
  onClick={spell?e=>e.preventDefault():onAcquire}
  onContextMenu={spell?e=>e.preventDefault():undefined}
  onPointerDown={spell?e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);start(e.pointerId);}:undefined}
  onPointerMove={spell?e=>{if(input.current!==e.pointerId)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancel();}:undefined}
  onPointerUp={spell?e=>{if(input.current===e.pointerId)cancel();}:undefined} onPointerCancel={spell?cancel:undefined} onLostPointerCapture={spell?cancel:undefined}
  onKeyDown={spell?e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)start(e.key);}}:undefined}
  onKeyUp={spell?e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(input.current===e.key)cancel();}}:undefined} onBlur={spell?cancel:undefined}>
  {children}{spell&&<span className="spell-acquire-ring" aria-hidden="true"/>}
 </button>;
}
