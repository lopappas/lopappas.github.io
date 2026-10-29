import {SPELLS,type SpellId} from './magic.ts';

export type TrailEventId='forgottenCampsite';
export type EventOutcome='pending'|'lit'|'fleeting'|'spark'|'noEffect';
export type TrailEventState={id:TrailEventId;outcome:EventOutcome;quality?:number};
export const TRAIL_EVENTS={forgottenCampsite:{name:'Forgotten campsite',description:'You find yourself in a long abandoned campsite. Hmmm... Maybe we can light it up once more?'}} as const;
// Add future Act 1 events here. The selected event is kept for the whole visit.
export const ACT_ONE_EVENTS:TrailEventId[]=['forgottenCampsite'];
export function rollTrailEvent(random:()=>number=Math.random):TrailEventState{return{id:ACT_ONE_EVENTS[Math.min(ACT_ONE_EVENTS.length-1,Math.floor(Math.max(0,random())*ACT_ONE_EVENTS.length))],outcome:'pending'};}
export function forgottenCampsiteOutcome(spellId:SpellId|null,quality:number):EventOutcome{
 if(!Number.isFinite(quality)||quality<48||SPELLS.find(s=>s.id===spellId)?.element!=='Fire')return 'noEffect';
 return quality>=65?'lit':quality>=60?'fleeting':'spark';
}
export function trailEventDescription(event:TrailEventState){
 if(event.outcome==='pending')return TRAIL_EVENTS[event.id].description;
 return {lit:'A bright fireball crashes onto the logs. You feel a burst of hot air rush past your face. Then calm... The campfire is lit once more.',fleeting:'The logs were alight, but just for a fleeting moment.',spark:'The faint spark was smothered by the quiet logs',noEffect:'There was no effect'}[event.outcome];
}
