import {SPELLS,type Point,type SpellId} from './magic.ts';
import {tutorial2FoundationBattle,newTutorial2,transitionTutorial2,type Tutorial2State,type Tutorial2Step,type Tutorial2Event,type Tutorial2Action} from './tutorial2.ts';
import type {Battle} from './battle.ts';
export const DEWDROP_DEMO_MS=4500;
export const TUTORIAL2_FIRE_STEPS:readonly Tutorial2Step[]=[
 {id:'fire-intro',kind:'dialogue',text:'Oh no! A fire slime has come to attack my village! I have a water spell to handle this.'},
 {id:'fire-book',kind:'action',action:'book',target:'book',text:'Open your spellbook.'},
 {id:'fire-select',kind:'action',action:'select',target:'spell-water',spellId:'water',text:'Select Dewdrop, your water spell.'},
 {id:'fire-close',kind:'action',action:'close',target:'book-close',text:'Close your spellbook.'},
 {id:'fire-demo',kind:'demonstration',completion:'dewdrop',text:'Dewdrop casting tutorial'},
 {id:'fire-draw',kind:'action',action:'draw',target:'canvas',text:'Try to draw your own Dewdrop!'},
 {id:'fire-cast',kind:'action',action:'cast',target:'cast',text:'Hold Cast!'},
 {id:'fire-impact',kind:'settling',durationMs:0,text:''},
 {id:'fire-victory',kind:'dialogue',text:'Of course I won, water dowses fire!'}
];
export type Tutorial2FireState=Tutorial2State&{resetSerial:number;retry:boolean};
export function newTutorial2Fire():Tutorial2FireState{return{...newTutorial2(TUTORIAL2_FIRE_STEPS),resetSerial:0,retry:false};}
export function tutorial2FireBattle():Battle{const b=tutorial2FoundationBattle();return{...b,enemies:b.enemies.map(e=>({...e,hp:24,maxHP:24}))};}
const indexOf=(id:string)=>TUTORIAL2_FIRE_STEPS.findIndex(s=>s.id===id);
function jump(state:Tutorial2FireState,id:string,reset=false):Tutorial2FireState{return{...state,index:indexOf(id),token:state.token+1,elapsedMs:0,resetSerial:state.resetSerial+(reset?1:0)};}
export function fireActionAllowed(state:Tutorial2FireState,action:Tutorial2Action,spellId?:SpellId){
 if(state.phase!=='running')return false;
 const step=TUTORIAL2_FIRE_STEPS[state.index];
 if(['fire-draw','fire-cast'].includes(step?.id)&&['draw','clear'].includes(action))return true;
 return step?.kind==='action'&&step.action===action&&(!step.spellId||step.spellId===spellId);
}
export function fireCanReplay(state:Tutorial2FireState){return state.phase==='running'&&['fire-draw','fire-cast'].includes(TUTORIAL2_FIRE_STEPS[state.index]?.id);}
export function replayTutorial2Fire(state:Tutorial2FireState){return fireCanReplay(state)?jump(state,'fire-demo',true):state;}
export function transitionTutorial2Fire(state:Tutorial2FireState,event:Tutorial2Event):Tutorial2FireState{
 if(state.phase!=='running'||state.token!==event.token)return state;
 if(event.type==='action'&&event.action==='clear'&&fireActionAllowed(state,'clear'))return jump(state,'fire-draw',true);
 // Impact must be acknowledged by combat, never by a timer or repeated input.
 if(TUTORIAL2_FIRE_STEPS[state.index]?.id==='fire-impact')return state;
 const next=transitionTutorial2(TUTORIAL2_FIRE_STEPS,state,event);return next===state?state:{...state,...next};
}
export type Tutorial2CastOutcome={token:number;spellId:SpellId|null;quality:number;enemyHP:number};
export function resolveTutorial2FireCast(state:Tutorial2FireState,outcome:Tutorial2CastOutcome):Tutorial2FireState{
 if(state.phase!=='running'||TUTORIAL2_FIRE_STEPS[state.index]?.id!=='fire-impact'||outcome.token!==state.token-1)return state;
 if(outcome.spellId==='water'&&outcome.quality>=60&&outcome.enemyHP<=0)return jump(state,'fire-victory');
 return{...jump(state,'fire-draw',true),retry:true};
}
// Reverse the canonical clockwise drawing; keep the same recognition template.
export const DEWDROP_TRACE=[...SPELLS.find(s=>s.id==='water')!.strokes[0]].reverse();
export function dewdropTrace(progress:number):{points:Point[];tip:Point}{
 const p=Math.max(0,Math.min(1,progress)),segments=DEWDROP_TRACE.slice(1).map((b,i)=>Math.hypot(b.x-DEWDROP_TRACE[i].x,b.y-DEWDROP_TRACE[i].y)),total=segments.reduce((a,b)=>a+b,0);
 let remaining=total*p;const points=[DEWDROP_TRACE[0]];
 for(let i=0;i<segments.length;i++){const a=DEWDROP_TRACE[i],b=DEWDROP_TRACE[i+1];if(remaining>=segments[i]){points.push(b);remaining-=segments[i];}else{const t=segments[i]?remaining/segments[i]:0;points.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});break;}}
 return{points,tip:points[points.length-1]};
}
