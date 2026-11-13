import {FrameLoop} from './frameLoop';
import {observeAnchoredLayout} from './observeAnchoredLayout';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {createWritingAudio,filaIsWriting,getWritingMedia} from './dialogueAudio';
import {audioPreferences,audioChannelVolume} from './audioPreferences';
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
 const completed=useRef(false),typingSync=useRef(()=>{});
 const writingRef=useRef<ReturnType<typeof createWritingAudio>|null>(null);
 useEffect(()=>{if(!active)writingRef.current?.setWriting(false);typingSync.current();},[active]);
 const [acknowledged,setAcknowledged]=useState(false);
 const bubble=useRef<HTMLElement>(null),latest=useRef({active,onComplete,onTextProgress});latest.current={active,onComplete,onTextProgress};
 const [elapsed,setElapsed]=useState(0),[position,setPosition]=useState<{top:number;left:number;width:number}|null>(null);
 useEffect(()=>{
  let elapsedMs=0,finished=false;
  const audio=getWritingMedia(),writing=createWritingAudio(audio,()=>audioChannelVolume('effects'));audio.preload='auto';
  const unsubscribe=audioPreferences.subscribe(writing.sync);
  const gesture=()=>{if(latest.current.active&&!document.hidden)writing.sync();};
  document.addEventListener('pointerdown',gesture);document.addEventListener('keydown',gesture);
  const visibility=()=>{if(document.hidden)writing.setWriting(false);typingSync.current();};document.addEventListener('visibilitychange',visibility);
  writingRef.current=writing;
  const loop=new FrameLoop(delta=>{
   elapsedMs=advanceFilaDialogue(elapsedMs,delta*1000,latest.current.active&&!document.hidden);setElapsed(elapsedMs);
   writing.setWriting(latest.current.active&&!document.hidden&&filaIsWriting(text,elapsedMs));
   const line=filaDialogueFrame(text,elapsedMs);latest.current.onTextProgress?.(line.text);
   if(line.typed||completed.current){finished=true;return false;}
  },{now:()=>performance.now(),request:cb=>requestAnimationFrame(cb),cancel:id=>cancelAnimationFrame(id)});
  typingSync.current=()=>loop.setRunning(latest.current.active&&!document.hidden&&!finished);typingSync.current();
  return()=>{loop.setRunning(false);typingSync.current=()=>{};document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',gesture);document.removeEventListener('keydown',gesture);unsubscribe();writing.dispose();writingRef.current=null;};
 },[text]);
 useLayoutEffect(()=>{
  if(!active)return;
  const fila=document.querySelector('[data-tutorial2-speaker="fila"]'),world=fila?.closest('.world'),el=bubble.current;if(!fila||!world||!el)return;
  let last='';
  const measure=()=>{
   const f=fila.getBoundingClientRect(),w=world.getBoundingClientRect(),width=Math.min(290,w.width-24);
   const left=Math.max(w.left+12,Math.min(w.right-width-12,f.left+f.width*.6));
   const top=Math.max(w.top+52,f.top-el.offsetHeight-64),key=[left,top,width].join(',');
   if(key!==last){last=key;setPosition({left,top,width});}
  };
  return observeAnchoredLayout([fila,world,el],world,target=>target instanceof Element&&target.contains(fila),measure);
 },[active,text]);

 return createPortal(<><aside ref={bubble} className="t2-fila-bubble" role="status" aria-label={`Filadora says: ${text}`} aria-hidden={!active} style={{...position,fontFamily,visibility:active&&position?'visible':'hidden'}}>
  <strong aria-hidden="true">Filadora</strong><p aria-hidden="true"><span className="t2-fila-measure"><TutorialText text={text}/></span><span className="t2-fila-typed"><FadingDialogueText text={text} elapsed={elapsed}/></span></p>
  {canContinueFilaDialogue(text,elapsed,active,acknowledged)&&<small className="t2-fila-continue-hint">Tap to continue</small>}
 </aside>{canContinueFilaDialogue(text,elapsed,active,acknowledged)&&<button className="t2-dialogue-continue" aria-label="Tap to continue" onClick={e=>{e.preventDefault();e.stopPropagation();if(canContinueFilaDialogue(text,elapsed,latest.current.active,completed.current)){completed.current=true;setAcknowledged(true);latest.current.onComplete();}}}/>}</>,document.body);
}
