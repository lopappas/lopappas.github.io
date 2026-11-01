import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {CHAPTERS,ENCYCLOPEDIA_PREVIEW,encyclopediaGroups,isEntryRevealed,type Chapter,type Discoveries,type EncyclopediaEntry} from './encyclopedia';
import {rarityClass,spellRarityClass} from './rarity';
import {PotionIcon} from './PotionIcon';
import type {Potion} from './battle';
import './encyclopedia.css';

const TITLES:Record<Chapter,string>={spells:'Spells',relics:'Relics',potions:'Potions'};
function inkColor(entry:EncyclopediaEntry){return ({Water:'#257285',Fire:'#b34f23',Nature:'#537230',Ancient:'#62666e'} as Record<string,string>)[entry.element??'']??entry.color;}
function EntryArt({entry}:{entry:EncyclopediaEntry}){
 if(entry.path)return <svg viewBox="0 0 100 100" role="img" aria-label={`${entry.name} drawing shape`}><path d={entry.path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
 if(entry.chapter==='potions')return <PotionIcon potion={entry.id as Potion}/>;
 return <span className="journal-relic-art" aria-hidden="true">{entry.icon}</span>;
}
export function EncyclopediaButton({discoveries}:{discoveries:Discoveries}){
 const [open,setOpen]=useState(false),trigger=useRef<HTMLButtonElement>(null);
 return <><button ref={trigger} className="secondary-button encyclopedia-button" aria-haspopup="dialog" onClick={()=>setOpen(true)}>Encyclopedia</button>{open&&<Encyclopedia discoveries={discoveries} onClose={()=>{setOpen(false);trigger.current?.focus({preventScroll:true});}}/>}</>;
}
export function Encyclopedia({discoveries,onClose,preview=ENCYCLOPEDIA_PREVIEW}:{discoveries:Discoveries;onClose:()=>void;preview?:boolean}){
 const [chapter,setChapter]=useState<Chapter>('spells'),[entry,setEntry]=useState<EncyclopediaEntry|null>(null);
 const modal=useRef<HTMLElement>(null),scroll=useRef<HTMLDivElement>(null),closeRef=useRef(onClose),lastEntry=useRef<string|null>(null),indexScroll=useRef(0);closeRef.current=onClose;
 const groups=encyclopediaGroups(chapter),entries=groups.flatMap(g=>g.entries),revealed=entries.filter(e=>isEntryRevealed(e,discoveries,preview)).length;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,root=document.getElementById('root'),wasInert=root?.inert;
  if(root)root.inert=true;
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();closeRef.current();}
   if(e.key==='Tab'){
    const items=Array.from(modal.current!.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"]')),first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };
  window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('keydown',key);if(root)root.inert=wasInert??false;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 useLayoutEffect(()=>{
  scroll.current?.scrollTo(0,!entry&&lastEntry.current?indexScroll.current:0);
  if(entry)modal.current?.querySelector<HTMLElement>('.journal-entry-title')?.focus({preventScroll:true});
  else if(lastEntry.current){modal.current?.querySelector<HTMLElement>(`[data-entry="${lastEntry.current}"]`)?.focus({preventScroll:true});lastEntry.current=null;}
  else modal.current?.querySelector<HTMLButtonElement>(`[data-chapter="${chapter}"]`)?.focus({preventScroll:true});
 },[chapter,entry]);
 const known=entry&&isEntryRevealed(entry,discoveries,preview);
 return createPortal(<div className="journal-backdrop" onClick={onClose}>
  <section className="encyclopedia-journal" ref={modal} role="dialog" aria-modal="true" aria-labelledby="encyclopedia-title" onClick={e=>e.stopPropagation()}>
   <div className="journal-binding" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div>
   <header className="journal-header"><span className="journal-eyebrow">FILA'S FIELD JOURNAL</span><h1 id="encyclopedia-title">Encyclopedia</h1><button className="journal-close" onClick={onClose} aria-label="Close encyclopedia">×</button>
    <nav className="journal-chapters" aria-label="Encyclopedia chapters">{CHAPTERS.map((id,i)=><button key={id} data-chapter={id} aria-pressed={chapter===id} onClick={()=>{lastEntry.current=null;setChapter(id);setEntry(null);}}><small aria-hidden="true">0{i+1}</small>{TITLES[id]}</button>)}</nav>
   </header>
   <div ref={scroll} className="journal-scroll">
    {entry?<article className="journal-entry">
     <button className="journal-back" onClick={()=>{lastEntry.current=entry.key;setEntry(null);}}>← All {TITLES[chapter].toLowerCase()}</button>
     <div className={`journal-art ${known?(entry.chapter==='spells'?spellRarityClass(entry.rarity as import('./rarity').SpellRarity):rarityClass(entry.rarity)):''}`} style={{color:known?inkColor(entry):undefined}}>{known?<EntryArt entry={entry}/>:<span className="journal-question" aria-hidden="true">?</span>}</div>
     <h2 className="journal-entry-title" tabIndex={-1}>{known?entry.name:'???'}</h2>
     <p className="journal-entry-kind">{known?`${entry.rarity}${entry.element?` · ${entry.element} magic`:''}`:'Undiscovered'}</p>
     {known?<><section className="journal-notes"><h3>{chapter==='spells'?'Spell notes':'Effect'}</h3><p>{entry.description}</p></section>{entry.tips&&<section className="journal-notes"><h3>Tips for casting</h3><p>{entry.tips}</p><p>Keep the overall shape and proportions. Any size or position works, and stroke order does not matter. Hold Cast for half a second to release your spell.</p></section>}{entry.lore&&<blockquote className="journal-lore">{entry.lore}</blockquote>}</>:<p className="journal-undiscovered">Collect this {chapter==='spells'?'spell':chapter==='relics'?'relic':'potion'} on your journey to reveal its journal entry.</p>}
    </article>:<>
     <div className="journal-chapter-heading"><h2>{TITLES[chapter]}</h2><span>{revealed} / {entries.length} revealed</span></div>
     <p className="journal-intro">{chapter==='spells'?'Shapes to remember. Magic to make.':chapter==='relics'?'Small treasures with stories of their own.':'A little wonder, carefully bottled.'} Select an entry to read its notes.</p>
     {groups.map(group=><section className="journal-rarity-group" key={group.rarity} aria-label={`${group.rarity} ${TITLES[chapter].toLowerCase()}`}><h3>{group.rarity}<span>{group.entries.length}</span></h3><div className="journal-entry-grid">{group.entries.map(item=>{const visible=isEntryRevealed(item,discoveries,preview);return <button key={item.key} data-entry={item.key} className={`journal-item ${visible?(item.chapter==='spells'?spellRarityClass(item.rarity as import('./rarity').SpellRarity):rarityClass(item.rarity)):'journal-locked'}`} aria-label={visible?`${item.name}, ${item.rarity}: read entry`:'Undiscovered entry: read notes'} onClick={()=>{indexScroll.current=scroll.current?.scrollTop??0;setEntry(item);}}><span className="journal-item-art" style={{color:visible?inkColor(item):undefined}}>{visible?<EntryArt entry={item}/>:<span className="journal-question" aria-hidden="true">?</span>}</span><strong>{visible?item.name:'???'}</strong></button>;})}</div></section>)}
    </>}
   </div>
   <footer className="journal-footer"><span>{preview?'All entries revealed for now':'Your journey, remembered'}</span><span>{entry?'Field notes':`Chapter ${CHAPTERS.indexOf(chapter)+1} / 3`}</span></footer>
  </section>
 </div>,document.body);
}
