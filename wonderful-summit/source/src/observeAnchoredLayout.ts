import {FrameBatch} from './frameBatch.ts';
type Observer={observe:(element:Element)=>void;disconnect:()=>void};
type Environment={request:(callback:()=>void)=>number;cancel:(id:number)=>void;events:EventTarget[];observer:(callback:()=>void)=>Observer;hidden:()=>boolean};
/** Re-measure only on layout events; follow actual anchor animations until they finish. */
export function observeAnchoredLayout(elements:Element[],motionRoot:EventTarget,isAnchorMotion:(target:EventTarget|null)=>boolean,measure:()=>void,environment:Environment={request:cb=>requestAnimationFrame(cb),cancel:id=>cancelAnimationFrame(id),events:[window,document,...(window.visualViewport?[window.visualViewport]:[])],observer:cb=>new ResizeObserver(cb),hidden:()=>document.hidden}){
 const batch=new FrameBatch(environment.request,environment.cancel),motions=new Map<EventTarget,Set<string>>();let disposed=false;
 const tick=()=>{if(disposed||environment.hidden())return;measure();if(motions.size)schedule();};
 const schedule=()=>{if(disposed)return;if(environment.hidden())batch.clear();else batch.schedule(tick);};
 const motion=(event:Event)=>{
  if(disposed||!event.target||!isAnchorMotion(event.target))return;
  const key=(event.type.startsWith('animation')?'animation:':'transition:')+((event as AnimationEvent).animationName??(event as TransitionEvent).propertyName??'');
  if(event.type==='animationstart'||event.type==='transitionrun'){let names=motions.get(event.target);if(!names){names=new Set();motions.set(event.target,names);}names.add(key);}else{const names=motions.get(event.target);names?.delete(key);if(!names?.size)motions.delete(event.target);}
  schedule();
 };
 const observer=environment.observer(schedule);elements.forEach(e=>observer.observe(e));
 for(const target of environment.events)for(const name of ['resize','scroll','visibilitychange'])target.addEventListener(name,schedule,true);
 const motionNames=['animationstart','animationend','animationcancel','transitionrun','transitionend','transitioncancel'];motionNames.forEach(name=>motionRoot.addEventListener(name,motion,true));
 if(!environment.hidden())measure();
 return()=>{disposed=true;batch.clear();observer.disconnect();motions.clear();for(const target of environment.events)for(const name of ['resize','scroll','visibilitychange'])target.removeEventListener(name,schedule,true);motionNames.forEach(name=>motionRoot.removeEventListener(name,motion,true));};
}
