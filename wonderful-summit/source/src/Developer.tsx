import React,{createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {HoldGesture} from './holdGesture';
import {createPortal} from 'react-dom';
import {SPELLS} from './magic';
import {RELICS} from './run';
import {LessonText} from './LessonText';
import {parseDeveloperCommand,type DeveloperCommand} from './developerCommands';
const Context=createContext<{allowed:boolean;open:()=>void;targets:Map<number,(command:DeveloperCommand)=>void>}|null>(null);
export function DeveloperProvider({children}:{children:ReactNode}){
 const allowed=true;
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const targets=useRef(new Map<number,(command:DeveloperCommand)=>void>()),dialog=useRef<HTMLElement>(null);
 useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null;dialog.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);}if(e.key==='Tab'){const items=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus({preventScroll:true});};},[open]);
 async function grant(command:DeveloperCommand){if(busy)return;setBusy(true);setMessage('');try{const verified=parseDeveloperCommand(command);if(!verified)throw new Error('Invalid command.');const target=[...targets.current.entries()].sort((a,b)=>b[0]-a[0])[0]?.[1];if(!target)throw new Error('No active game.');target(verified);setMessage(verified.type==='gold'?'+1000 gold':verified.type==='spell'?'Spell learned':'Relic acquired');}catch(error){setMessage(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
 return <Context.Provider value={{allowed,open:()=>{setMessage('');setOpen(true);},targets:targets.current}}>{children}{open&&allowed&&createPortal(<div className="modal-backdrop developer-backdrop" onClick={()=>setOpen(false)}><section className="help-modal developer-panel" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="developer-title" onClick={e=>e.stopPropagation()}><button className="close-modal" onClick={()=>setOpen(false)} aria-label="Close developer panel">×</button><h2 id="developer-title">Developer panel</h2><button className="primary-small" disabled={busy} onClick={()=>void grant({type:'gold'})}>+1000 gold</button><h3>Spells</h3><div className="developer-options">{SPELLS.map(s=><button key={s.id} disabled={busy} onClick={()=>void grant({type:'spell',id:s.id})}><LessonText text={s.name}/></button>)}</div><h3>Relics</h3><div className="developer-options">{Object.entries(RELICS).map(([id,r])=><button key={id} disabled={busy} onClick={()=>void grant({type:'relic',id:id as keyof typeof RELICS})}>{r.icon} {r.name}</button>)}</div><p role="status">{message}</p></section></div>,document.body)}</Context.Provider>;
}
export function useDeveloperTarget(handler:(command:DeveloperCommand)=>void,priority=0){const context=useContext(Context),ref=useRef(handler);ref.current=handler;const targets=context?.targets;useEffect(()=>{if(!targets)return;const target=(c:DeveloperCommand)=>ref.current(c);targets.set(priority,target);return()=>{if(targets.get(priority)===target)targets.delete(priority);};},[targets,priority]);}
export function useDeveloperHold(onClick:()=>void){
 const context=useContext(Context),hold=useRef(new HoldGesture()),start=useRef({x:0,y:0});
 const cancel=()=>hold.current.cancel();
 useEffect(()=>cancel,[]);
 const begin=()=>{cancel();hold.current.consumed=false;if(context?.allowed)hold.current.start(context.open);};
 return {onClick:()=>{if(hold.current.click())onClick();},onPointerDown:(e:React.PointerEvent<HTMLButtonElement>)=>{if(!e.isPrimary||e.button!==0)return;start.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);begin();},onPointerMove:(e:React.PointerEvent)=>{if(Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>12)cancel();},onPointerUp:cancel,onPointerCancel:cancel,onLostPointerCapture:cancel,onContextMenu:(e:React.MouseEvent)=>e.preventDefault(),onKeyDown:(e:React.KeyboardEvent)=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)begin();}},onKeyUp:(e:React.KeyboardEvent)=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();cancel();if(hold.current.click())onClick();}},onBlur:cancel};
}
