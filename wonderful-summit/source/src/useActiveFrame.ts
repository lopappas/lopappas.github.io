import {useEffect,useRef} from 'react';
import {FrameLoop,bindFrameVisibility} from './frameLoop';
/** No animation callbacks while disabled or hidden; resume with a fresh time origin. */
export function useActiveFrame(callback:(delta:number,now:number)=>boolean|void,active:boolean){
 const latest=useRef(callback);latest.current=callback;
 useEffect(()=>{
  if(!active)return;
  const loop=new FrameLoop((dt,now)=>latest.current(dt,now),{now:()=>performance.now(),request:cb=>requestAnimationFrame(cb),cancel:id=>cancelAnimationFrame(id)});
  return bindFrameVisibility(loop,document);
 },[active]);
}
