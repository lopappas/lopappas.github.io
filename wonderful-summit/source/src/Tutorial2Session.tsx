import React,{useEffect,useLayoutEffect,useMemo,useRef,useState,type ComponentType} from 'react';
import {createPortal} from 'react-dom';
import type {CombatProps} from './combatTypes';
import {FilaDialogue} from './FilaDialogue';
import {TutorialText} from './TutorialText';
import {TutorialQualityExplanation} from './TutorialQualityExplanation';
import {pauseTutorial2,resumeTutorial2,tutorial2Step,tutorial2Journey,type Tutorial2Target} from './tutorial2';
import {M4_LESSONS as LESSONS,m4Battle as elementBattle,m4Lesson as elementLesson,replayM4 as replayTutorial2Fire,m4CanReplay as fireCanReplay,resolveM4Cast as resolveTutorial2FireCast,relicAwarded,goblinDrawing,QUALITY_EXPLANATION,QUALITY_LINES} from './tutorial2Goblin';
import {M5_STEPS as steps,newM5Tutorial,m5ActionAllowed as fireActionAllowed,transitionM5 as transitionTutorial2Fire,isFinal,finalBattle,finishFinalBattle,retryFinal} from './tutorial2Final';
import {finishAmbush} from './tutorial2Elements';
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
function CanvasNotice({text}:{text:string}){
 const [position,setPosition]=useState<{top:number;left:number}|null>(null);
 useLayoutEffect(()=>{let frame=0,last='';const place=()=>{const canvas=document.querySelector('[data-tutorial2-target="canvas"]');if(canvas){const r=canvas.getBoundingClientRect(),top=r.top+r.height/2,left=r.left+r.width/2,key=`${top},${left}`;if(key!==last){last=key;setPosition({top,left});}}frame=requestAnimationFrame(place);};place();return()=>cancelAnimationFrame(frame);},[]);
 return position?<div className="t2-instruction t2-canvas-notice" role="status" style={position}>{text}</div>:null;
}
function Tutorial2Dialog({title,text,label,onContinue,onExit}:{title:string;text:string;label:string;onContinue:()=>void;onExit:()=>void}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  ref.current?.querySelector('button')?.focus();
  const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const items=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}};
  document.addEventListener('keydown',trap,true);return()=>{document.removeEventListener('keydown',trap,true);};
 },[]);
 return createPortal(<div className="t2-dialog-backdrop"><section ref={ref} className="t2-dialog" role="dialog" aria-modal="true" aria-labelledby="t2-dialog-title" aria-describedby="t2-dialog-text"><h1 id="t2-dialog-title">{title}</h1><div id="t2-dialog-text">{text===QUALITY_EXPLANATION?<TutorialQualityExplanation/>:<p><TutorialText text={text.replace(/\.$/,'')}/></p>}</div><button className="primary-small" onClick={onContinue}>{label}</button>{label!=='Return to menu'&&<button className="secondary-button" onClick={onExit}>Return to menu</button>}</section></div>,document.body);
}
function Tutorial2Content({Combat,onExit,onComplete,dialogueFont}:{Combat:ComponentType<CombatProps>;onExit:()=>void;onComplete?:()=>void;dialogueFont:string}){
 const [state,setState]=useState(()=>newM5Tutorial(new URLSearchParams(location.search).get('milestone')==='5'?'final':new URLSearchParams(location.search).get('milestone')==='4'?'goblin':'all'));
 const [baseJourney]=useState(tutorial2Journey);
 const awarded=relicAwarded(state);
 const journey=useMemo(()=>({...baseJourney,relics:awarded?['colorfulRock' as const]:baseJourney.relics}),[awarded,baseJourney]);
 const final=isFinal(state);
 const [finalInitial]=useState(finalBattle);
 const [defeated,setDefeated]=useState(false);
 const lesson=final?4:elementLesson(state),lessonSpec=LESSONS[lesson as 0|1|2|3]??LESSONS[2];
 const battle=useMemo(()=>final?finalInitial:elementBattle(lesson,lesson===2),[lesson,finalInitial]);
 const [demoProgress,setDemoProgress]=useState(0);
 const [spilled,setSpilled]=useState(false);
 const latest=useRef(state);latest.current=state;
 const step=tutorial2Step(steps,state),paused=state.phase==='paused',complete=state.phase==='complete';
 const returnFromTutorial=()=>{if(complete||step?.id==='final-complete')(onComplete??onExit)();else onExit();};
 const pause=()=>setState(s=>({...s,...pauseTutorial2(s)})),resume=()=>setState(s=>({...s,...resumeTutorial2(s)}));
 useLayoutEffect(()=>{
  if(step?.kind!=='demonstration')return;let frame=0,last=performance.now(),elapsed=0;setDemoProgress(0);const token=state.token,duration=lessonSpec.duration;
  const tick=(now:number)=>{if(latest.current.phase!=='paused'&&!document.hidden)elapsed+=Math.max(0,now-last);last=now;setDemoProgress(Math.min(1,elapsed/duration));if(elapsed>=duration)setState(s=>transitionTutorial2Fire(s,{type:'demonstration-finished',completion:step.completion,token}));else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
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
 const scriptedDrawing=useMemo(()=>lesson===3&&['goblin-bad-cast','goblin-perfect-draw','goblin-perfect-cast'].includes(step?.id??'')?{id:step!.id,strokes:goblinDrawing(step!.id.includes('perfect'),step!.kind==='demonstration'?demoProgress:1)}:undefined,[lesson,step?.id,demoProgress]);
 return <><Combat key={`${lesson}-${final?state.resetSerial:0}`} journey={journey} tutorial2={{freeCombat:final,onBattleEnd:(phase,token)=>{if(phase==='defeat')setDefeated(true);else setState(s=>finishFinalBattle(s,token,phase));},scriptedDrawing,relicInspection:lesson===3?{canInspect:!paused&&step?.id==='goblin-relic-inspect',inspected:step?.id==='goblin-relic-reading'||step?.id==='goblin-relic-continue',onInspect:()=>{const token=state.token;setState(s=>transitionTutorial2Fire(s,{type:'action',action:'inspect',token}));}}:undefined,initialBattle:battle,resetBattle:elementBattle(lesson),setup:step?.id==='nature-spill'&&spilled?'spill':undefined,ambush:step?.id==='water-ambush',companion:lesson>=2&&!['water-enter','water-pre-attack','water-ambush','water-hit-wait','water-injury'].includes(step?.id??''),onAmbush:token=>setState(s=>finishAmbush(s,token)),token:state.token,paused,blocking:defeated||complete||step?.kind==='dialogue'||step?.kind==='demonstration'||step?.kind==='settling'&&step.id!=='final-battle'&&step.id!=='water-ambush'&&step.id!=='water-hit-wait'&&step.id!=='water-potion-wait'&&!step.id.endsWith('-impact'),resetSerial:state.resetSerial,trace:lesson<3&&/-(demo|draw|cast|impact)$/.test(step?.id??'')?{progress:step?.kind==='demonstration'?demoProgress:1,demonstrating:step?.kind==='demonstration',spellId:lessonSpec.spell}:undefined,canAction:(action,spellId)=>fireActionAllowed(latest.current,action,spellId),onAction:(action,token,spellId)=>setState(s=>transitionTutorial2Fire(s,{type:'action',action,token,spellId})),onCastOutcome:outcome=>setState(s=>isFinal(s)?s:resolveTutorial2FireCast(s,outcome))}} onFinish={onExit}/>
  {createPortal(<nav className="t2-controls" aria-label="Tutorial controls"><button onClick={paused?resume:pause} disabled={complete}>{paused?'Resume':'Pause'}</button><button onClick={returnFromTutorial}>Menu</button></nav>,document.body)}
  {!paused&&step&&step.text&&!['water-draw','water-cast','goblin-relic-continue'].includes(step.id)&&(step.kind==='action'||step.kind==='demonstration')&&<Spotlight target={step.kind==='action'?step.target:'canvas'} text={step.text} token={state.token}/>}
  {!paused&&step&&['water-draw','water-cast'].includes(step.id)&&state.elapsedMs>=6000&&<Spotlight target="cast" text="" token={state.token} quiet/>}
  {!paused&&step?.id.endsWith('-retry')&&createPortal(<div className="t2-instruction t2-retry-notice" role="status">Try again</div>,document.body)}
  {!final&&fireCanReplay(state)&&createPortal(<button className="t2-replay" onClick={()=>setState(replayTutorial2Fire)}>Show me again</button>,document.body)}
  {step?.kind==='dialogue'&&step.presentation!=='screen'&&<FilaDialogue key={state.token} text={step.text} fontFamily={dialogueFont} active={!paused} onTextProgress={text=>{if(step.id==='nature-spill'&&text.startsWith('Whoops!'))setSpilled(true);}} onComplete={()=>{const token=state.token;setState(s=>transitionTutorial2Fire(s,{type:'continue',token}));}}/>}
  {!paused&&step?.kind==='dialogue'&&step.presentation==='screen'&&<Tutorial2Dialog title={step.id==='goblin-qualities'?'Make Every Spell Count':step.id==='final-intro'?'Your Final Test':'Tutorial complete'} text={step.text} label={step.id==='final-complete'?'Return to menu':'Continue'} onContinue={()=>{if(step.id==='final-complete'){(onComplete??onExit)();return;}const token=state.token;setState(s=>transitionTutorial2Fire(s,{type:'continue',token}));}} onExit={onExit}/>}
  {!paused&&step?.id==='goblin-relic-continue'&&createPortal(<><CanvasNotice text="Tap anywhere to continue"/><button className="t2-continue-anywhere" aria-label="Tap anywhere to continue" onClick={e=>{e.preventDefault();e.stopPropagation();const token=state.token;setState(s=>transitionTutorial2Fire(s,{type:'action',action:'continue-anywhere',token}));}}/></>,document.body)}
  {!paused&&defeated&&<Tutorial2Dialog title="Try again" text="Take another shot at the final slime" label="Retry final battle" onContinue={()=>{setDefeated(false);setState(retryFinal);}} onExit={onExit}/>}
  {(paused||complete)&&<Tutorial2Dialog title={paused?'Tutorial paused':'Tutorial complete'} text={paused?'Your place, drawing, and spellbook are kept. Resume whenever you are ready.':'You defended your village! You are ready to begin your journey'} label={paused?'Resume':'Return to menu'} onContinue={paused?resume:returnFromTutorial} onExit={onExit}/>}
 </>;
}

export function Tutorial2Session(props:{Combat:ComponentType<CombatProps>;onExit:()=>void;onComplete?:()=>void}){
 const [font,setFont]=useState<'loading'|'Kurale'|'Georgia'>('loading');
 useEffect(()=>{let alive=true;document.fonts.load('16px Kurale').then(faces=>{if(alive)setFont(faces.length?'Kurale':'Georgia');}).catch(()=>{if(alive)setFont('Georgia');});return()=>{alive=false;};},[]);
 return font==='loading'?<main className="app" aria-busy="true"/>:<Tutorial2Content {...props} dialogueFont={font}/>;
}
