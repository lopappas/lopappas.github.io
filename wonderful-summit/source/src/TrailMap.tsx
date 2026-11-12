import {actEncounters,trailAct} from './trailActs';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {isEliteNode,type Run} from './run';
export function TrailSymbol({symbol}:{symbol:string}){
 if(symbol==='sword')return <svg className="trail-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M27 3 24 13 13 24l-5-5L19 8z" fill="currentColor"/><path d="m6 18 8 8M9 23l-5 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
 if(symbol==='campfire')return <svg className="trail-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M15 3c2 7-5 9-5 14 0 4 3 6 6 6 5 0 8-3 7-7-1-3-3-4-3-7-2 3-3 4-3 5 1-5 1-8-2-11z" fill="currentColor"/><path d="m6 25 21 5M26 25 5 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
 return <>{symbol}</>;
}

// Shared layout keeps the trail and read-only Map view in the same act.
export function ActTrail({run,onSelect}:{run:Run;onSelect?:(index:number)=>void}){
 const act=trailAct(run.node);
 return <section className={`trail-panel trail-act-${act.number}`} aria-label={`Act ${act.number}: ${act.title}`}><h1>{act.title}</h1><div className="trail" role={onSelect?undefined:'list'}>{actEncounters(run.node).map(({encounter:node,index:i})=>{
  const name=node.kind==='battle'&&node.encounter==='mother'&&run.bossEncounter==='goblinKing'?'Goblin King':node.name;
  const className=`trail-node${i===run.node?' current':''}${i<run.node?' complete':''}`;
  const content=<><span className="trail-symbol" aria-hidden="true">{i<run.node?'✓':<TrailSymbol symbol={node.icon}/>}</span><span><strong>{name}</strong><small>{i<run.node?'Visited':i===run.node?(onSelect?'Continue':'You are here'):node.kind==='battle'?(isEliteNode(i)?'Elite encounter':'Encounter'):node.kind==='shop'?'Merchant':node.kind==='event'?'Event':'Rest or upgrade'}</small></span></>;
  return onSelect?<button key={i} aria-current={i===run.node?'step':undefined} disabled={i!==run.node&&!run.developerTrailUnlocked} className={className} onClick={()=>onSelect(i)}>{content}</button>:<div key={i} role="listitem" aria-current={i===run.node?'step':undefined} className={className}>{content}</div>;
 })}</div></section>;
}

export function MapButton({run,onOpen,onClose}:{run:Run;onOpen?:()=>void;onClose?:()=>void}){
 const [open,setOpen]=useState(false),trigger=useRef<HTMLButtonElement>(null);
 function close(){setOpen(false);onClose?.();trigger.current?.focus({preventScroll:true});}
 return <><button ref={trigger} className="map-button" aria-haspopup="dialog" onClick={()=>{onOpen?.();setOpen(true);}}>Map</button>{open&&<TrailMap run={run} onClose={close}/>}</>;
}
function TrailMap({run,onClose}:{run:Run;onClose:()=>void}){
 const panel=useRef<HTMLElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,root=document.getElementById('root'),wasInert=root?.inert;if(root)root.inert=true;
  panel.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close.current();}if(e.key==='Tab'){e.preventDefault();panel.current?.querySelector<HTMLButtonElement>('button')?.focus();}};
  window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);if(root)root.inert=wasInert??false;previous?.focus({preventScroll:true});};
 },[]);
 useLayoutEffect(()=>{const p=panel.current,node=p?.querySelector<HTMLElement>('.trail-node.current');if(p&&node){const area=p.getBoundingClientRect(),target=node.getBoundingClientRect();p.scrollTop=Math.max(0,p.scrollTop+target.top-area.top+(target.height-p.clientHeight)/2);}},[run.node]);
 return createPortal(<div className="modal-backdrop trail-map-backdrop" onClick={()=>close.current()}><section ref={panel} className={`trail-map-dialog trail-act-${trailAct(run.node).number}`} role="dialog" aria-modal="true" aria-labelledby="trail-map-title" onClick={e=>e.stopPropagation()}><header><h2 id="trail-map-title">Trail</h2><button className="secondary-button" onClick={()=>close.current()}>Close</button></header><ActTrail run={run}/></section></div>,document.body);
}
