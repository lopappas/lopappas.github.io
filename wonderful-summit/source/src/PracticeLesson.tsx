import {BOG_TRACE_GROWTH,combatTraceScale,traceSize,traceStrokeWidth} from './combatTracePresentation';
import {traceViewBox} from './traceLayout';
import {useActiveFrame} from './useActiveFrame';
import React,{useEffect,useRef,useState,useMemo} from 'react';
import {lessonFrame,practiceLesson} from './practiceLessons';
import type {SpellId} from './magic';
export function PracticeLesson({spellId,paused,onFinished}:{spellId:SpellId;paused:boolean;onFinished:()=>void}){
 const lesson=useMemo(()=>practiceLesson(spellId)!,[spellId]),[progress,setProgress]=useState(0),latest=useRef({paused,onFinished});latest.current={paused,onFinished};
 const elapsed=useRef(0);
 useEffect(()=>{elapsed.current=0;setProgress(0);},[spellId]);
 useActiveFrame(delta=>{if(latest.current.paused||elapsed.current>=lesson.duration)return false;elapsed.current+=delta*1000;const p=Math.min(1,elapsed.current/lesson.duration);setProgress(p);if(p===1){latest.current.onFinished();return false;}},!paused&&progress<1);

 const {strokes,tip}=lessonFrame(lesson.paths,progress);
 const scale=spellId==='bog'?BOG_TRACE_GROWTH:spellId==='snowman'||spellId==='eruption'?combatTraceScale(spellId):1;
 return <div className="t2-trace practice-learning-trace" role="img" aria-label={progress<1?`Brush drawing ${lesson.spell.name}`:`Persistent ${lesson.spell.name} tracing guide`}><svg viewBox={traceViewBox(lesson.paths)} aria-hidden="true" style={scale===1?undefined:traceSize(scale)}>{strokes.map((p,i)=><polyline key={i} points={p.map(v=>`${v.x},${v.y}`).join(' ')} fill="none" stroke={lesson.spell.color} strokeOpacity={progress<1?.7:.2} strokeWidth={traceStrokeWidth(spellId,3.45,true)} strokeLinecap="round" strokeLinejoin="round"/>)}{progress<1&&<g transform={`translate(${tip.x} ${tip.y}) rotate(35)`}><path d="M0 0-3-7-2-13 2-13 3-7Z" fill="#495337" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-13H2V-28H-2Z" fill="#98664a" stroke="#253a2c" strokeWidth=".7"/><path d="M-2-14H2V-11H-2Z" fill="#e1c172"/></g>}</svg></div>;
}
