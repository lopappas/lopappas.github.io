import {MIN_CAST_QUALITY} from './quality.ts';
import {SPELLS,scoreDrawingAgainst,shape,type SpellId,type Strokes} from './magic.ts';

export type TrailEventId='forgottenCampsite'|'heartRock';
type CampsiteOutcome='pending'|'lit'|'fleeting'|'spark'|'noEffect';
export type TrailEventState=
 | {id:'forgottenCampsite';outcome:CampsiteOutcome;quality?:number}
 | {id:'heartRock';outcome:'pending'|'blessed'|'noEffect';quality?:number};
export const TRAIL_EVENTS={
 forgottenCampsite:{name:'Forgotten Campsite',description:'You find yourself in a long abandoned campsite. Hmmm... Maybe we can light it up once more?'},
 heartRock:{name:'Heart Rock',description:'A smooth rock rests quietly among the pines. You instinctively reach for your quill and ink, as if in a trance. Draw and cast a heart.'},
} as const;
export const ACT_ONE_EVENTS:TrailEventId[]=['forgottenCampsite','heartRock'];

const HEART_START=[50,29];
const HEART_CURVES=[[36,8,13,15,13,36],[13,54,32,67,50,82],[68,67,87,54,87,36],[87,15,64,8,50,29]];
export const HEART_TRACE_PATH=`M${HEART_START.join(' ')} ${HEART_CURVES.map(curve=>`C${curve.join(' ')}`).join(' ')}`;
const HEART_STROKES=[shape(HEART_START,HEART_CURVES)];
export function heartRockQuality(strokes:Strokes){return scoreDrawingAgainst(strokes,HEART_STROKES);}
export function heartRockReward(quality:number){
 if(!Number.isFinite(quality)||quality<50)return 0;
 return Math.min(25,5*(Math.floor(quality/10)-4));
}

export function rollTrailEvent(random:()=>number=Math.random):TrailEventState{return{id:ACT_ONE_EVENTS[Math.min(ACT_ONE_EVENTS.length-1,Math.floor(Math.max(0,random())*ACT_ONE_EVENTS.length))],outcome:'pending'};}
export function forgottenCampsiteOutcome(spellId:SpellId|null,quality:number):CampsiteOutcome{
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY||SPELLS.find(s=>s.id===spellId)?.element!=='Fire')return 'noEffect';
 return quality>=65?'lit':quality>=60?'fleeting':'spark';
}
export function trailEventDescription(event:TrailEventState){
 if(event.outcome==='pending')return TRAIL_EVENTS[event.id].description;
 if(event.id==='heartRock')return event.outcome==='blessed'?'The rock warms under your hand. You feel your heart beat a little stronger.':'The rock stays cool and quiet.';
 return {lit:'A bright fireball crashes onto the logs. You feel a burst of hot air rush past your face. Then calm... The campfire is lit once more.',fleeting:'The logs were alight, but just for a fleeting moment.',spark:'The faint spark was smothered by the quiet logs',noEffect:'There was no effect'}[event.outcome];
}
