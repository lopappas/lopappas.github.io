import {RelicIcon} from './RelicIcon';
import {rarityClass} from './rarity';
import React,{useEffect,useRef,useState} from 'react';
import {RELICS,type RelicId} from './run';
import {LessonText} from './LessonText';

export function CombatRelics({relics,variant='combat',broken=[],robesBonus=0}:{relics:RelicId[];variant?:'combat'|'trail';broken?:RelicId[];robesBonus?:number}){
 const [selected,setSelected]=useState<RelicId|null>(null),container=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
 function close(){setSelected(null);trigger.current?.focus({preventScroll:true});}
 useEffect(()=>{
  if(!selected)return;
  const outside=(e:PointerEvent)=>{if(!container.current?.contains(e.target as Node))setSelected(null);};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[selected]);
 if(!relics.length)return null;
 return <div className={`combat-relics${variant==='trail'?' trail-relics':''}`} ref={container}>
  <div className="combat-relic-row" role="group" aria-label="Acquired relics">{relics.map(id=><button key={id} className={`${rarityClass(RELICS[id].rarity)}${broken.includes(id)?' relic-broken':''}`} aria-label={`${RELICS[id].name}, ${RELICS[id].rarity}${broken.includes(id)?' (broken)':''}: view effect`} aria-expanded={selected===id} aria-controls={selected===id?'combat-relic-detail':undefined} onClick={e=>{trigger.current=e.currentTarget;setSelected(selected===id?null:id);}}><span aria-hidden="true" style={broken.includes(id)?{color:'#777'}:undefined}><RelicIcon relic={id}/></span></button>)}</div>
  {selected&&<section id="combat-relic-detail" className={`relic-detail ${rarityClass(RELICS[selected].rarity)}${broken.includes(selected)?' relic-detail-broken':''}`} aria-labelledby="combat-relic-name"><button className="close-modal" aria-label="Close relic effect" onClick={close}>×</button><h2 id="combat-relic-name"><RelicIcon relic={selected}/> {RELICS[selected].name}</h2><em className="rarity-label">{RELICS[selected].rarity}</em><p>{broken.includes(selected)?'Broken':<LessonText text={RELICS[selected].description}/>}</p>{(selected==='filadoraRobes'||selected==='artisanRobes')&&<p className="robes-total">Total damage bonus: <strong>+{robesBonus}%</strong></p>}</section>}
 </div>;
}

