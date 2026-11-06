import React,{useEffect,useLayoutEffect,useMemo,useRef,useState,type ComponentType} from 'react';
import {createPortal} from 'react-dom';
import type {CombatProps} from './combatTypes';
import {FilaDialogue} from './FilaDialogue';
import {TutorialText} from './TutorialText';
import {pauseTutorial2,resumeTutorial2,tutorial2Step,tutorial2Journey,type Tutorial2Target} from './tutorial2';
import {ELEMENT_STEPS as steps,LESSONS,newElementTutorial as newTutorial2Fire,elementBattle,elementLesson,elementActionAllowed as fireActionAllowed,replayElement as replayTutorial2Fire,elementCanReplay as fireCanReplay,transitionElement as transitionTutorial2Fire,resolveElementCast as resolveTutorial2FireCast,finishAmbush} from './tutorial2Elements';
import './tutorial2.css';

type Rect={top:number;left:number;width:number;height:number};
function Spotlight({target,text,token,quiet=false}:{target:Tutorial2Target;text:string;token:number;quiet?:boolean}){
 const [rect,setRect]=useState<Rect|null>(null);
 useLayoutEffect(()=>{
  let frame=0,element:HTMLElement|null=null,oldDescription:string|null=null,last='';
  const update=()=>{
   const next=document.querySelector<HTMLElement>(`[data-tutorial2-target="${target}"]`);
   if(next!==element){if(element){element.classList.remove('t2-highlight');if(oldDescription===null)element.removeAttribute('aria-describedby');else element.setAttribute('aria-describedby',oldDescription);}element=next;oldDescription=element?.getAttribute('aria-describedby')??null;
    if(element){element.classList.add('t2-highlight');if(!quiet)element.setAttribute('aria-describedby','t2-instruction');if(!quiet&&element.tagName==='BUTTON')element.focus({preventScroll:true});}}
   if(element){const r=element.getBoundingClientRect(),key=[r.top,r.left,r.width,r.height,innerWidth,innerHeight].join(',');if(key!==last){last=key;setRect({top:r.top,left:r.left,width:r.width,height:r.height});}}
   frame=requestAnimationFrame(update);
  };update();
  return()=>{cancelAnimationFrame(frame);if(element){element.classList.remove('t2-highlight');if(oldDescription===null)element.removeAttribute('aria-describedby');else element.setAttribute('aria-describedby',oldDescription);}};
 },[target,token]);
 if(!rect)return null;
 const below=rect.top<155,top=below?rect.top+rect.height+16:rect.top-85;
 return createPortal(<><div className={`t2-spotlight${quiet?' t2-spotlight-quiet':''}`} aria-hidden="true" style={{top:rect.top-5,left:rect.left-5,width:rect.width+10,height:rect.height+10}}/>{!quiet&&<div id="t2-instruction" key={token} className="t2-instruction" role="status" style={{top:Math.max(62,Math.min(innerHeight-100,top)),left:Math.max(12,Math.min(innerWidth-292,rect.left+rect.width/2-140))}}><strong><TutorialText text={text.replace(/\.$/,'')}/></strong></div>}</>,document.body);
}
function Tutorial2Dialog({title,text,label,onContinue,onExit}:{title:string;text:string;label:string;onContinue:()=>void;onExit:()=>void}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  ref.current?.querySelector('button')?.focus();
  const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const items=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}};
  document.addEventListener('keydown',trap,true);return()=>{document.removeEventListener('keydown',trap,true);};
 },[]);
 return createPortal(<div className="t2-dialog-backdrop"><section ref={ref} className="t2-dialog" role="dialog" aria-modal="true" aria-labelledby="t2-dialog-title" aria-describedby="t2-dialog-text"><small>TUTORIAL 2.0</small><h1 id="t2-dialog-title">{title}</h1><p id="t2-dialog-text"><TutorialText text={text.replace(/\.$/,'')}/></p><button className="primary-small" onClick={onContinue}>{label}</button>{label!=='Return to menu'&&<button className="secondary-button" onClick={onExit}>Return to menu</button>}</section></div>,document.body);
}
export function Tutorial2Session({Combat,onExit}:{Combat:ComponentType<CombatProps>;onExit:()=>void}){
 const [state,setState]=useState(newTutorial2Fire);
 const [journey]=useState(tutorial2Journey);
 const lesson=elementLesson(state),lessonSpec=LESSONS[lesson]??LESSONS[2];
 const battle=useMemo(()=>elementBattle(lesson,lesson===2),[lesson]);
 const [demoProgress,setDemoProgress]=useState(0);
 const [spilled,setSpilled]=useState(false);
 const latest=useRef(state);latest.current=state;
 const step=tutorial2Step(steps,state),paused=state.phase==='paused',complete=state.phase==='complete';
 const pause=()=>setState(s=>({...s,...pauseTutorial2(s)})),resume=()=>setState(s=>({...s,...resumeTutorial2(s)}));
 useEffect(()=>{
  if(step?.kind!=='demonstration')return;let frame=0,last=performance.now(),elapsed=0;setDemoProgress(0);const token=state.token;
  const tick=(now:number)=>{if(latest.current.phase!=='paused'&&!document.hidden)elapsed+=Math.max(0,now-last);last=now;setDemoProgress(Math.min(1,elapsed/lessonSpec.duration));if(elapsed>=lessonSpec.duration)setState(s=>transitionTutorial2Fire(s,{type:'demonstration-finished',completion:step.completion,token}));else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[state.token]);
 useEffect(()=>{
  const timed=step?.kind==='settling'&&step.durationMs>0||step?.id==='water-draw'||step?.id==='water-cast';
  if(!timed)return;let frame=0,last=performance.now();const token=state.token;
  const tick=(now:number)=>{const delta=now-last;last=now;if(latest.current.phase==='running'&&!document.hidden)setState(s=>transitionTutorial2Fire(s,{type:'tick',deltaMs:delta,token}));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[state.token]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;e.preventDefault();e.stopImmediatePropagation();setState(s=>({...s,...(s.phase==='paused'?resumeTutorial2(s):pauseTutorial2(s))}));};
  const visibility=()=>{if(document.hidden)pause();};window.addEventListener('keydown',key,true);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 return <><Combat key={lesson} journey={journey} tutorial2={{initialBattle:battle,resetBattle:elementBattle(lesson),setup:step?.id==='nature-spill'&&spilled?'spill':step?.id==='water-refill'?'empty':undefined,ambush:step?.id==='water-ambush',companion:lesson===2&&!['water-pre-attack','water-ambush','water-hit-wait','water-injury'].includes(step?.id??''),onAmbush:token=>setState(s=>finishAmbush(s,token)),token:state.token,paused,blocking:complete||step?.kind==='dialogue'||step?.kind==='demonstration'||step?.kind==='settling'&&step.id!=='water-ambush'&&step.id!=='water-hit-wait'&&step.id!=='water-potion-wait'&&!step.id.endsWith('-impact'),resetSerial:state.resetSerial,trace:/-(demo|draw|cast|impact)$/.test(step?.id??'')?{progress:step?.kind==='demonstration'?demoProgress:1,demonstrating:step?.kind==='demonstration',spellId:lessonSpec.spell}:undefined,canAction:(action,spellId)=>fireActionAllowed(latest.current,action,spellId),onAction:(action,token,spellId)=>setState(s=>transitionTutorial2Fire(s,{type:'action',action,token,spellId})),onCastOutcome:outcome=>setState(s=>resolveTutorial2FireCast(s,outcome))}} onFinish={onExit}/>
  {createPortal(<nav className="t2-controls" aria-label="Tutorial 2.0 controls"><button onClick={paused?resume:pause} disabled={complete}>{paused?'Resume':'Pause'}</button><button onClick={onExit}>Menu</button></nav>,document.body)}
  {!paused&&step&&!['water-draw','water-cast'].includes(step.id)&&(step.kind==='action'||step.kind==='demonstration')&&<Spotlight target={step.kind==='action'?step.target:'canvas'} text={step.text} token={state.token}/>}
  {!paused&&step&&['water-draw','water-cast'].includes(step.id)&&state.elapsedMs>=6000&&<Spotlight target="cast" text="" token={state.token} quiet/>}
  {!paused&&step?.id.endsWith('-retry')&&createPortal(<div className="t2-instruction t2-retry-notice" role="status">Try again</div>,document.body)}
  {fireCanReplay(state)&&createPortal(<button className="t2-replay" onClick={()=>setState(replayTutorial2Fire)}>Show me again</button>,document.body)}
  {step?.kind==='dialogue'&&<FilaDialogue key={state.token} text={step.text} holdMs={step.id==='nature-victory'?0:undefined} active={!paused} onTextProgress={text=>{if(step.id==='nature-spill'&&text.startsWith('Whoops!'))setSpilled(true);}} onComplete={()=>{const token=state.token;setState(s=>transitionTutorial2Fire(s,{type:'continue',token}));}}/>}
  {(paused||complete)&&<Tutorial2Dialog title={paused?'Tutorial paused':'Preview complete'} text={paused?'Your place, drawing, and spellbook are kept. Resume whenever you are ready.':'Thanks for trying the Tutorial 2.0 preview.'} label={paused?'Resume':'Return to menu'} onContinue={paused?resume:onExit} onExit={onExit}/>}
 </>;
}
