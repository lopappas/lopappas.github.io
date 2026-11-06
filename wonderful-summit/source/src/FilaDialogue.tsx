import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {advanceFilaDialogue,filaDialogueFrame} from './filaDialogue';

// All Tutorial 2.0 dialogue steps use this presentation, including future lessons.
export function FilaDialogue({text,active,onComplete}:{text:string;active:boolean;onComplete:()=>void}){
 const bubble=useRef<HTMLElement>(null),latest=useRef({active,onComplete});latest.current={active,onComplete};
 const [elapsed,setElapsed]=useState(0),[position,setPosition]=useState<{top:number;left:number;width:number}|null>(null);
 useEffect(()=>{
  let frame=0,last=performance.now(),elapsedMs=0,finished=false;
  const visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);
  const tick=(now:number)=>{
   elapsedMs=advanceFilaDialogue(elapsedMs,now-last,latest.current.active&&!document.hidden);last=now;setElapsed(elapsedMs);
   if(filaDialogueFrame(text,elapsedMs).complete){finished=true;latest.current.onComplete();}else frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
  return()=>{if(!finished)cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};
 },[text]);
 useLayoutEffect(()=>{
  let frame=0,last='';
  const place=()=>{
   const fila=document.querySelector('[data-tutorial2-speaker="fila"]'),world=fila?.closest('.world');
   if(fila&&world){
    const f=fila.getBoundingClientRect(),w=world.getBoundingClientRect(),width=Math.min(290,w.width-24);
    const left=Math.max(w.left+12,Math.min(w.right-width-12,f.left+f.width*.6));
    const top=Math.max(w.top+52,f.top-(bubble.current?.offsetHeight??135)-14),key=[left,top,width].join(',');
    if(key!==last){last=key;setPosition({left,top,width});}
   }frame=requestAnimationFrame(place);
  };place();return()=>cancelAnimationFrame(frame);
 },[active,text]);
 const line=filaDialogueFrame(text,elapsed);
 return createPortal(<aside ref={bubble} className="t2-fila-bubble" role="status" aria-label={`Fila says: ${text}`} aria-hidden={!active} style={{...position,visibility:active&&position?'visible':'hidden'}}>
  <strong aria-hidden="true">Fila</strong><p aria-hidden="true"><span className="t2-fila-measure">{text}</span><span className="t2-fila-typed">{line.text}{!line.typed&&<i className="t2-fila-caret"/>}</span></p>
 </aside>,document.body);
}
