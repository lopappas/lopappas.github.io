import React,{useEffect,useRef,useState,type ComponentType} from 'react';
import {beginTutorial,newTutorial,pauseTutorial,resumeTutorial,retryTutorial,tutorialJourney,tutorialLessonInfo,handleTutorialEvent} from './tutorial';
import type {CombatProps} from './combatTypes';
import {useDeveloperTarget} from './Developer';
import {applyDeveloperCommand} from './developerCommands';
import {LessonText} from './LessonText';

function LessonBreak({briefing,info,onContinue,onRestart,onExit}:{briefing:boolean;info:ReturnType<typeof tutorialLessonInfo>;onContinue:()=>void;onRestart:()=>void;onExit:()=>void}){
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,modal=dialog.current!;modal.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Tab'){const items=Array.from(modal.querySelectorAll<HTMLButtonElement>('button')),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[]);
 return <div className="modal-backdrop tutorial-break-backdrop"><section ref={dialog} className="tutorial-break" role="dialog" aria-modal="true" aria-labelledby="tutorial-break-title">
  <span className="tutorial-emblem" aria-hidden="true">✦</span><small className="tutorial-lesson-number">{info.number} / {info.total}</small><h1 id="tutorial-break-title">{briefing?info.title:'Lesson paused'}</h1>
  <p><LessonText text={briefing?info.briefing:info.task} accent={info.accent}/></p>
  <button className="primary-small" onClick={()=>{onContinue();}}>{briefing?(info.number===1?'Begin':'Continue'):'Resume'}</button>
  {!briefing&&<button className="secondary-button" onClick={()=>{onRestart();}}>Restart lesson</button>}
  <button className="tutorial-menu-button" onClick={()=>{onExit();}}>Menu</button>
 </section></div>;
}

export function TutorialSession({Combat,onExit}:{Combat:ComponentType<CombatProps>;onExit:()=>void}){
 const [session,setSession]=useState(()=>newTutorial());
 const [journey,setJourney]=useState(()=>tutorialJourney());
 useDeveloperTarget(command=>setJourney(r=>applyDeveloperCommand(r,command)),1);
 const info=tutorialLessonInfo(session.lesson,session.checkpoint.battle,session.progress.studiedSpell);
 const expectedLesson=session.lesson,expectedAttempt=session.attempt;
 return <>
  <Combat key={session.attempt} journey={journey} tutorial={{checkpoint:session.checkpoint,lesson:session.lesson,studiedSpell:session.progress.studiedSpell,settling:session.phase==='settling',feedback:session.phase==='settling'?'Lesson complete ✓':session.feedback,paused:session.phase==='briefing'||session.phase==='paused',onPause:()=>setSession(pauseTutorial),onExit,onEvent:(event,snapshot)=>setSession(s=>s.lesson===expectedLesson&&s.attempt===expectedAttempt?handleTutorialEvent(s,event,snapshot):s)}} onFinish={battle=>{if(battle.phase==='defeat')setSession(retryTutorial);else if(battle.phase==='victory'&&session.lesson==='finish')onExit();}}/>
  {(session.phase==='briefing'||session.phase==='paused')&&<LessonBreak briefing={session.phase==='briefing'} info={info} onContinue={()=>setSession(s=>s.phase==='briefing'?beginTutorial(s):resumeTutorial(s))} onRestart={()=>setSession(retryTutorial)} onExit={onExit}/>}
 </>;
}
