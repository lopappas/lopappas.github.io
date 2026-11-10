import React,{useEffect,useRef,useState} from 'react';
import {lessonFrame,practiceLesson} from './practiceLessons';
import type {SpellId} from './magic';
export function PracticeLesson({spellId,paused,onFinished}:{spellId:SpellId;paused:boolean;onFinished:()=>void}){
 const lesson=practiceLesson(spellId)!,[progress,setProgress]=useState(0),latest=useRef({paused,onFinished});latest.current={paused,onFinished};
 useEffect(()=>{let frame=0,last=performance.now(),elapsed=0;const visible=()=>{last=performance.now();};document.addEventListener('visibilitychange',visible);const tick=(now:number)=>{if(!latest.current.paused&&!document.hidden)elapsed+=now-last;last=now;const p=Math.min(1,elapsed/lesson.duration);setProgress(p);if(p===1)latest.current.onFinished();else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visible);};},[spellId]);
 const {strokes,tip}=lessonFrame(lesson.paths,progress);
 return <div className="t2-trace practice-learning-trace" role="img" aria-label={progress<1?`Brush drawing ${lesson.spell.name}`:`Persistent ${lesson.spell.name} tracing guide`}><svg viewBox="0 0 100 100" aria-hidden="true">{strokes.map((p,i)=><polyline key={i} points={p.map(v=>`${v.x},${v.y}`).join(' ')} fill="none" stroke={lesson.spell.color} strokeOpacity={progress<1?.7:.2} strokeWidth="3.45" strokeLinecap="round" strokeLinejoin="round"/>)}{progress<1&&<g transform={`translate(${tip.x} ${tip.y}) rotate(35)`}><path d="M0 0-3-7-2-13 2-13 3-7Z" fill="#495337" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-13H2V-28H-2Z" fill="#98664a" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-14H2V-11H-2Z" fill="#e1c172"/></g>}</svg></div>;
}
