import React,{useEffect,useLayoutEffect,useRef,useState,type ComponentType} from 'react';
import {createPortal} from 'react-dom';
import type {CombatProps} from './combatTypes';
import {canTutorial2Action,newTutorial2,pauseTutorial2,resumeTutorial2,transitionTutorial2,tutorial2Step,tutorial2Journey,tutorial2FoundationBattle,TUTORIAL2_FOUNDATION_STEPS as steps,type Tutorial2Target} from './tutorial2';
import './tutorial2.css';

type Rect={top:number;left:number;width:number;height:number};
function Spotlight({target,text,token}:{target:Tutorial2Target;text:string;token:number}){
 const [rect,setRect]=useState<Rect|null>(null);
 useLayoutEffect(()=>{
  let frame=0,element:HTMLElement|null=null,oldDescription:string|null=null,last='';
  const update=()=>{
   const next=document.querySelector<HTMLElement>(`[data-tutorial2-target="${target}"]`);
   if(next!==element){if(element){element.classList.remove('t2-highlight');if(oldDescription===null)element.removeAttribute('aria-describedby');else element.setAttribute('aria-describedby',oldDescription);}element=next;oldDescription=element?.getAttribute('aria-describedby')??null;
    if(element){element.classList.add('t2-highlight');element.setAttribute('aria-describedby','t2-instruction');if(element.tagName==='BUTTON')element.focus({preventScroll:true});}}
   if(element){const r=element.getBoundingClientRect(),key=[r.top,r.left,r.width,r.height,innerWidth,innerHeight].join(',');if(key!==last){last=key;setRect({top:r.top,left:r.left,width:r.width,height:r.height});}}
   frame=requestAnimationFrame(update);
  };update();
  return()=>{cancelAnimationFrame(frame);if(element){element.classList.remove('t2-highlight');if(oldDescription===null)element.removeAttribute('aria-describedby');else element.setAttribute('aria-describedby',oldDescription);}};
 },[target,token]);
 if(!rect)return null;
 const below=rect.top<155,top=below?rect.top+rect.height+16:rect.top-85;
 return createPortal(<><div className="t2-spotlight" aria-hidden="true" style={{top:rect.top-5,left:rect.left-5,width:rect.width+10,height:rect.height+10}}/><div id="t2-instruction" key={token} className="t2-instruction" role="status" style={{top:Math.max(62,Math.min(innerHeight-100,top)),left:Math.max(12,Math.min(innerWidth-292,rect.left+rect.width/2-140))}}><strong>{text}</strong></div></>,document.body);
}
function Tutorial2Dialog({title,text,label,onContinue,onExit}:{title:string;text:string;label:string;onContinue:()=>void;onExit:()=>void}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  ref.current?.querySelector('button')?.focus();
  const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const items=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}};
  document.addEventListener('keydown',trap,true);return()=>{document.removeEventListener('keydown',trap,true);};
 },[]);
 return createPortal(<div className="t2-dialog-backdrop"><section ref={ref} className="t2-dialog" role="dialog" aria-modal="true" aria-labelledby="t2-dialog-title" aria-describedby="t2-dialog-text"><small>TUTORIAL 2.0</small><h1 id="t2-dialog-title">{title}</h1><p id="t2-dialog-text">{text}</p><button className="primary-small" onClick={onContinue}>{label}</button><button className="secondary-button" onClick={onExit}>Return to menu</button></section></div>,document.body);
}
export function Tutorial2Session({Combat,onExit}:{Combat:ComponentType<CombatProps>;onExit:()=>void}){
 const [state,setState]=useState(()=>newTutorial2(steps));
 const [journey]=useState(tutorial2Journey),[battle]=useState(tutorial2FoundationBattle);
 const latest=useRef(state);latest.current=state;
 const step=tutorial2Step(steps,state),paused=state.phase==='paused',complete=state.phase==='complete';
 const pause=()=>setState(pauseTutorial2),resume=()=>setState(resumeTutorial2);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;e.preventDefault();e.stopImmediatePropagation();setState(s=>s.phase==='paused'?resumeTutorial2(s):pauseTutorial2(s));};
  const visibility=()=>{if(document.hidden)pause();};window.addEventListener('keydown',key,true);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return <><Combat journey={journey} tutorial2={{initialBattle:battle,token:state.token,paused,blocking:step?.kind!=='action',canAction:(action,spellId)=>canTutorial2Action(steps,latest.current,action,spellId),onAction:(action,token,spellId)=>setState(s=>transitionTutorial2(steps,s,{type:'action',action,token,spellId}))}} onFinish={onExit}/>
  {createPortal(<nav className="t2-controls" aria-label="Tutorial 2.0 controls"><button onClick={paused?resume:pause} disabled={complete}>{paused?'Resume':'Pause'}</button><button onClick={onExit}>Menu</button></nav>,document.body)}
  {!paused&&step?.kind==='action'&&<Spotlight target={step.target} text={step.text} token={state.token}/>}
  {(paused||complete||step?.kind==='dialogue')&&<Tutorial2Dialog key={paused?'paused':state.token} title={paused?'Tutorial paused':complete?'Preview complete':'One step at a time'} text={paused?'Your place, drawing, and spellbook are kept. Resume whenever you are ready.':complete?'Thanks for trying the Tutorial 2.0 preview.':step!.text} label={paused?'Resume':complete?'Return to menu':'Continue'} onContinue={paused?resume:complete?onExit:()=>{const token=state.token;setState(s=>transitionTutorial2(steps,s,{type:'continue',token}));}} onExit={onExit}/>}
 </>;
}
