import {lessonTipPages} from './practiceLessons';
import React,{useLayoutEffect,useRef,useState} from 'react';

/** Pages contain only the supplied drawing instructions, without adding new tips. */
export function LessonTips({text}:{text:string}){
 const area=useRef<HTMLParagraphElement>(null),[capacity,setCapacity]=useState(32),[page,setPage]=useState(0);
 useLayoutEffect(()=>{
  const el=area.current!;
  const resize=()=>{const style=getComputedStyle(el),size=parseFloat(style.fontSize),line=parseFloat(style.lineHeight);setCapacity(Math.max(12,Math.floor(el.clientWidth/(size*.6))*Math.max(1,Math.floor(el.clientHeight/line))));};
  const ro=new ResizeObserver(resize);ro.observe(el);resize();return()=>ro.disconnect();
 },[]);
 const pages=lessonTipPages(text,capacity);
 const index=Math.min(page,pages.length-1);
 return <div className="practice-lesson-tips"><p ref={area} aria-live="polite" aria-atomic="true">{pages[index]}</p>{pages.length>1&&<button aria-label={`More drawing tips, page ${index+1} of ${pages.length}`} onClick={()=>setPage((index+1)%pages.length)}>→</button>}</div>;
}
