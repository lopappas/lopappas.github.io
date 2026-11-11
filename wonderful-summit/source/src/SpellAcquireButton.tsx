import React,{useEffect,useRef,useState} from 'react';
import type {Spell} from './magic';
import {SpellAcquisition} from './spellAcquisition';

type Props=Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> & {spell?:Spell;acquired?:boolean;onAcquire:()=>void;onShortTap?:()=>void;onHoldStart?:()=>void};
/** Spell purchases and reward choices share the same interruptible hold. */
export function SpellAcquireButton({spell,acquired=false,onAcquire,onShortTap,onHoldStart,disabled,className='',style,children,...props}:Props){
 const hold=useRef(new SpellAcquisition()),frame=useRef(0),input=useRef<number|string|null>(null),action=useRef(onAcquire);action.current=onAcquire;
 const [progress,setProgress]=useState(0),[holding,setHolding]=useState(false),[tap,setTap]=useState(0);
 const button=useRef<HTMLButtonElement>(null),tapAnimation=useRef<Animation|null>(null);
 useEffect(()=>{if(!tap||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;tapAnimation.current=button.current?.animate([{transform:'translateX(0) rotate(0deg)'},{transform:'translateX(-2px) rotate(-.5deg)'},{transform:'translateX(2px) rotate(.5deg)'},{transform:'translateX(0) rotate(0deg)'}],{duration:240,easing:'ease-out'})??null;return()=>tapAnimation.current?.cancel();},[tap]);
 function release(){cancel();setTap(n=>n+1);onShortTap?.();}
 function cancel(){setHolding(false);cancelAnimationFrame(frame.current);hold.current.cancel();input.current=null;setProgress(hold.current.progress);}
 function start(source:number|string){
  if(disabled||!spell||!hold.current.start(performance.now()))return;
  tapAnimation.current?.cancel();setHolding(true);onHoldStart?.();input.current=source;
  const tick=(now:number)=>{const complete=hold.current.advance(now);setProgress(hold.current.progress);if(complete){input.current=null;setHolding(false);action.current();}else frame.current=requestAnimationFrame(tick);};
  frame.current=requestAnimationFrame(tick);
 }
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel();};window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',hide);return()=>{cancelAnimationFrame(frame.current);hold.current.cancel();window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',hide);};},[]);
 useEffect(()=>{if(disabled)cancel();},[disabled]);
 return <button {...props} ref={button} disabled={disabled} className={`${className}${spell?` spell-acquire-button${holding?' spell-acquire-holding':''}${acquired||progress===1?' spell-acquired':''}`:''}`} style={{...style,'--jostle':`${.3+progress*1.2}px`,'--acquire-color':spell?.color,'--acquire-angle':`${(acquired?1:progress)*360}deg`} as React.CSSProperties}
  onClick={spell?e=>e.preventDefault():onAcquire}
  onContextMenu={spell?e=>e.preventDefault():undefined}
  onPointerDown={spell?e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);start(e.pointerId);}:undefined}
  onPointerMove={spell?e=>{if(input.current!==e.pointerId)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancel();}:undefined}
  onPointerUp={spell?e=>{if(input.current===e.pointerId)release();}:undefined} onPointerCancel={spell?cancel:undefined} onLostPointerCapture={spell?cancel:undefined}
  onKeyDown={spell?e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)start(e.key);}}:undefined}
  onKeyUp={spell?e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(input.current===e.key)release();}}:undefined} onBlur={spell?cancel:undefined}>
  {children}{spell&&<span className="spell-acquire-ring" aria-hidden="true"/>}
 </button>;
}
