import {PotionIcon} from './PotionIcon';
import React,{useEffect,useRef,useState} from 'react';
import {POTIONS,type Potion} from './battle';
import {SPELLS} from './magic';
import {potionCapacity,potionCount,potionSlots,type Run} from './run';
import {LessonText} from './LessonText';

export function RunPotions({run,onDrop,onDrinkHealing,visibleSlots=false}:{run:Run;onDrinkHealing?:(id:Potion)=>void;visibleSlots?:boolean;onDrop:(id:Potion,bottleIndex:number)=>void}){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState<number|null>(null);
 const container=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
 const slots=potionSlots(run.potions,potionCapacity(run));
 const id=selected===null?null:slots[selected];
 const bottleIndex=selected===null?0:slots.slice(0,selected).filter(p=>p==='spellBottle').length;
 const stored=id==='spellBottle'?run.bottledSpells[bottleIndex]:undefined;
 const spell=SPELLS.find(s=>s.id===stored?.spellId);
 function close(){setOpen(false);setSelected(null);(visibleSlots?container.current?.querySelector<HTMLButtonElement>('.inventory-potion:not(:disabled)'):trigger.current)?.focus({preventScroll:true});}
 useEffect(()=>{
  if(!open)return;
  if(!visibleSlots)panel.current?.querySelector<HTMLButtonElement>('.inventory-potion:not(:disabled)')?.focus({preventScroll:true});
  const outside=(e:PointerEvent)=>{if(!container.current?.contains(e.target as Node)){setOpen(false);setSelected(null);}};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open,visibleSlots]);
 const renderSlots=()=> <div className="inventory-potion-slots" role="group" aria-label="Carried potions">{slots.map((p,index)=><button key={index} className={`inventory-potion${selected===index?' selected':''} potion-${p??'empty'}`} disabled={!p} aria-label={`Slot ${index+1}: ${p?POTIONS[p].name:'empty'}`} aria-pressed={p?selected===index:undefined} onClick={()=>{setSelected(index);setOpen(true);}}>{p?(p==='stellar'?<PotionIcon potion={p}/>:POTIONS[p].icon):'·'}</button>)}</div>;
 return <div className={`run-potions${visibleSlots?' run-potions-inline':''}`} ref={container}>
  {visibleSlots?renderSlots():<button ref={trigger} className="run-potions-trigger" aria-label={`Potions: ${potionCount(run)} of ${potionCapacity(run)} slots. View inventory`} aria-expanded={open} aria-controls={open?'run-potion-inventory':undefined} onClick={()=>open?close():setOpen(true)}>⚗ {potionCount(run)}/{potionCapacity(run)} <span aria-hidden="true">⌄</span></button>}
  {open&&<section ref={panel} id="run-potion-inventory" className="run-potion-inventory" aria-labelledby="run-potion-title">
   <button className="close-modal" aria-label="Close potion inventory" onClick={close}>×</button>
   <h2 id="run-potion-title">Your potions</h2>
   {!visibleSlots&&<p>{potionCount(run)?'Tap a potion to view its description.':'Your purse has no potions.'}</p>}
   {!visibleSlots&&renderSlots()}
   {id&&<div className="inventory-potion-detail" aria-live="polite">
    <h3>{POTIONS[id].name}{id==='spellBottle'?'':' potion'}</h3>
    <p><LessonText text={POTIONS[id].detail}/></p>
    {stored&&<p className="inventory-sealed-spell">Sealed spell: <LessonText text={spell?.name??'Fizzle'}/> · {stored.quality}% quality</p>}
    {run.screen!=='battle'&&(id==='heal'||id==='theodoraHeal')&&onDrinkHealing&&<button className="drink-trail-potion" disabled={run.health>=100||run.health<=0||run.pendingBottle} onClick={()=>{onDrinkHealing(id);close();}}>Drink</button>}
    <button className="drop-potion" disabled={run.pendingBottle} aria-label={`Drop ${POTIONS[id].name}${id==='spellBottle'?'':' potion'}`} onClick={()=>{onDrop(id,bottleIndex);if(visibleSlots)close();else{setSelected(null);panel.current?.querySelector<HTMLButtonElement>('.close-modal')?.focus({preventScroll:true});}}}>Drop potion</button>
   </div>}
  </section>}
 </div>;
}

