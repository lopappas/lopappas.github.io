import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {TutorialText} from './TutorialText';
import {tutorialTextParts} from './tutorialText';
import {canContinueFilaDialogue,FILA_LETTER_FADE_MS,filaCharacterTimes,advanceFilaDialogue,filaDialogueFrame} from './filaDialogue';

function FadingDialogueText({text,elapsed}:{text:string;elapsed:number}){
 const times=filaCharacterTimes(text);let index=0;
 return <>{tutorialTextParts(text).map((part,i)=><span key={i} className={part.color?'t2-term':undefined} style={part.color?{color:part.color}:undefined}>{(part.text.match(/\S+|\s+/g)??[]).map((word,j)=>{
  if(/^\s+$/.test(word)){index+=Array.from(word).length;return word;}
  return <span key={j} className="t2-fila-word">{Array.from(word,character=>{const at=times[index++];return <span key={at} style={{opacity:Math.max(0,Math.min(1,(elapsed-at)/FILA_LETTER_FADE_MS))}}>{character}</span>;})}</span>;
 })}</span>)}</>;
}
// All Tutorial 2.0 dialogue steps use this presentation, including future lessons.
export function FilaDialogue({text,active,onComplete,onTextProgress,fontFamily='Kurale'}:{text:string;active:boolean;onComplete:()=>void;onTextProgress?:(text:string)=>void;fontFamily?:string}){
 const completed=useRef(false);
 const [acknowledged,setAcknowledged]=useState(false);
 const bubble=useRef<HTMLElement>(null),latest=useRef({active,onComplete,onTextProgress});latest.current={active,onComplete,onTextProgress};
 const [elapsed,setElapsed]=useState(0),[position,setPosition]=useState<{top:number;left:number;width:number}|null>(null);
 useEffect(()=>{
  let frame=0,last=performance.now(),elapsedMs=0,finished=false;
  const visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);
  const tick=(now:number)=>{
   elapsedMs=advanceFilaDialogue(elapsedMs,now-last,latest.current.active&&!document.hidden);last=now;setElapsed(elapsedMs);
   const line=filaDialogueFrame(text,elapsedMs);latest.current.onTextProgress?.(line.text);
   if(line.typed||completed.current)finished=true;else frame=requestAnimationFrame(tick);
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
    const top=Math.max(w.top+52,f.top-(bubble.current?.offsetHeight??100)-64),key=[left,top,width].join(',');
    if(key!==last){last=key;setPosition({left,top,width});}
   }frame=requestAnimationFrame(place);
  };place();return()=>cancelAnimationFrame(frame);
 },[active,text]);
 return createPortal(<><aside ref={bubble} className="t2-fila-bubble" role="status" aria-label={`Filadora says: ${text}`} aria-hidden={!active} style={{...position,fontFamily,visibility:active&&position?'visible':'hidden'}}>
  <strong aria-hidden="true">Filadora</strong><p aria-hidden="true"><span className="t2-fila-measure"><TutorialText text={text}/></span><span className="t2-fila-typed"><FadingDialogueText text={text} elapsed={elapsed}/></span></p>
  {canContinueFilaDialogue(text,elapsed,active,acknowledged)&&<small className="t2-fila-continue-hint">Tap to continue</small>}
 </aside>{canContinueFilaDialogue(text,elapsed,active,acknowledged)&&<button className="t2-dialogue-continue" aria-label="Tap to continue" onClick={e=>{e.preventDefault();e.stopPropagation();if(canContinueFilaDialogue(text,elapsed,latest.current.active,completed.current)){completed.current=true;setAcknowledged(true);latest.current.onComplete();}}}/>}</>,document.body);
}
