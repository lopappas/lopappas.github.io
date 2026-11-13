import {batterySaver,setBatterySaver,subscribeRenderPreferences} from './renderPreferences';
import React,{useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {Credits} from './Credits';
import {VersionHistory} from './VersionHistory';
import {audioPreferences,DEFAULT_AUDIO_PREFERENCES,loadAudioPreferences,type AudioPreferences} from './audioPreferences';

export function SettingsButton({onOpen,onClose}:{onOpen?:()=>void;onClose?:()=>void}){
 const [open,setOpen]=useState(false),[audio,setAudio]=useState(false),[credits,setCredits]=useState(false),[history,setHistory]=useState(false),trigger=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLElement>(null);
 const saving=useSyncExternalStore(subscribeRenderPreferences,batterySaver);
 const preferences=useSyncExternalStore(audioPreferences.subscribe,audioPreferences.getSnapshot,()=>DEFAULT_AUDIO_PREFERENCES);
 useEffect(()=>loadAudioPreferences(),[]);
 function close(){setHistory(false);setCredits(false);setOpen(false);onClose?.();trigger.current?.focus({preventScroll:true});}
 useEffect(()=>{
  if(!open||credits||history)return;
  const modal=dialog.current!;modal.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();close();}
   if(e.key==='Tab'){
    const items=Array.from(modal.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')),first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[open,audio,credits,history]);
 return <><button ref={trigger} className="icon-button settings-button" aria-label="Open settings" aria-haspopup="dialog" onClick={()=>{onOpen?.();setAudio(false);setCredits(false);setHistory(false);setOpen(true);}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3 1-2h4l1 2 2 1 2-1 3 3-1 2 1 2 2 1v4l-2 1-1 2 1 2-3 3-2-1-2 1-1 2h-4l-1-2-2-1-2 1-3-3 1-2-1-2-2-1v-4l2-1 1-2-1-2 3-3 2 1z" transform="translate(2 1) scale(.8)" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg></button>{open&&createPortal(history?<VersionHistory onExit={()=>setHistory(false)}/>:credits?<Credits onExit={()=>setCredits(false)}/>:<div className="modal-backdrop settings-backdrop" onClick={close}><section ref={dialog} className="settings-notebook" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={e=>e.stopPropagation()}><div className="notebook-binding" aria-hidden="true">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><button className="close-modal" aria-label="Close settings" onClick={close}>×</button><h2 id="settings-title">{audio?'Audio':'Settings'}</h2>{audio?<><button className="settings-back" onClick={()=>setAudio(false)}>← Settings</button><div className="audio-sliders">{([['master','Master volume'],['music','Music'],['effects','Sound effects']] as [keyof AudioPreferences,string][]).map(([key,label])=><label className="audio-slider" key={key}><span>{label}<output>{Math.round(preferences[key]*100)}%</output></span><input type="range" min="0" max="100" step="1" value={Math.round(preferences[key]*100)} aria-label={label} onChange={e=>audioPreferences.set(key,Number(e.currentTarget.value)/100)}/></label>)}</div></>:<><button className="settings-audio-tab" onClick={()=>setAudio(true)}><span aria-hidden="true">♫</span> Audio <span aria-hidden="true">›</span></button><button className="settings-audio-tab" role="switch" aria-checked={saving} onClick={()=>setBatterySaver(!saving)}>Battery Saver: {saving?'On':'Off'}</button><button className="settings-audio-tab settings-history-tab" onClick={()=>setHistory(true)}><span aria-hidden="true">◷</span> Version History <span aria-hidden="true">›</span></button><button className="settings-audio-tab settings-credits-tab" onClick={()=>setCredits(true)}><span aria-hidden="true">✧</span> Credits <span aria-hidden="true">›</span></button></>}</section></div>,document.body)}</>;
}

