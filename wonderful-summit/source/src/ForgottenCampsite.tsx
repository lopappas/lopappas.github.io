import React from 'react';
import {TRAIL_EVENTS,trailEventDescription} from './events';
import {EventCanvas} from './EventCanvas';
import {TravelSpellbook} from './Spellbook';
import type {PlayerDrawing} from './drawings';
import type {SpellId} from './magic';
import type {Run} from './run';

function Campfire({outcome}:{outcome:NonNullable<Run['event']>['outcome']}){
 const lit=outcome==='lit',fleeting=outcome==='fleeting';
 return <svg key={outcome} className={`forgotten-fire ${lit?'rekindled':fleeting?'fleeting-fire':''}`} viewBox="0 0 320 108" role="img" aria-label={lit?'A restored campfire':fleeting?'The campfire flickers and fades':'An abandoned campsite with cold logs'}>
  <path d="M0 79h320v29H0z" fill="#294334"/><path d="M12 80V44h5v36m3-24 12 9m-16-9-9 9M295 80V35h5v45m-2-21 14-12m-14 6-12-12" fill="none" stroke="#4d6750" strokeWidth="4"/>
  <ellipse cx="160" cy="89" rx="59" ry="12" fill="#1f3027"/>{Array.from({length:7},(_,i)=><path key={i} d={`M${107+i*15} 88l-4 5 4 5 13-2 2-6-6-3z`} fill="#78806a" stroke="#344536" strokeWidth="2"/>)}
  <path d="m128 77 60 14-3 9-61-14z" fill="#8d6243" stroke="#443b2b" strokeWidth="2"/><path d="m126 92 60-18 4 9-61 18z" fill="#aa7650" stroke="#443b2b" strokeWidth="2"/><path d="m137 88 35-9m-25 13 29-8" stroke="#63432e" strokeWidth="2"/>
  {(lit||fleeting)&&<g className="event-flames"><ellipse cx="160" cy="85" rx="41" ry="12" fill="#e8a05f" opacity=".3"/><g className="event-flame"><path d="m141 83-5-17 12-13 6-23 14 23 9-10 9 25-9 18z" fill="#eb8851"/><path d="m151 84-5-12 11-18 5 11 9-6 5 14-9 13z" fill="#ffd083"/><path d="m156 84-2-9 7-10 7 14-5 6z" fill="#fff0b7"/></g><path className="event-ember" d="M147 40h3v3h-3zM174 26h3v4h-3zM158 17h2v3h-2z" fill="#efbb73"/></g>}
  {lit&&<circle className="event-fireball" cx="160" cy="64" r="14" fill="#ffd083" stroke="#f09557" strokeWidth="8"/>}
 </svg>;
}
export function ForgottenCampsite({run,onCast,onRest,onUpgrade}:{run:Run;onCast:(id:SpellId|null,quality:number,drawing:PlayerDrawing)=>void;onRest:()=>void;onUpgrade:(id:SpellId)=>void}){
 const event=run.event;if(!event)return null;
 return <section className="run-panel event-panel"><h1>{TRAIL_EVENTS[event.id].name}</h1><Campfire outcome={event.outcome}/><p key={event.outcome} className="event-description" role="status">{trailEventDescription(event)}</p>{event.outcome==='pending'?<EventCanvas known={run.spells} onCast={onCast}/>:event.outcome==='lit'?<div className="event-camp-actions"><button className="camp-choice" disabled={run.campUsed} onClick={onRest}><strong>Rest</strong><small>Restore 70 health</small></button><TravelSpellbook known={run.spells} upgrades={run.upgrades} upgrade={{used:run.campUsed,damageBonus:run.relics.includes('amber')?1.15:1,onConfirm:onUpgrade}}/></div>:null}</section>;
}
