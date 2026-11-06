import type {SpellId} from './magic.ts';
import {newBattle,type Battle} from './battle.ts';
import {newRun} from './run.ts';

export type Tutorial2Action='book'|'select'|'close'|'draw'|'clear'|'cast'|'refill'|'heal';
export type Tutorial2Target='book'|'book-close'|'canvas'|'clear'|'cast'|'refill'|'heal'|`spell-${SpellId}`;
type BaseStep={id:string;text:string};
export type Tutorial2Step=BaseStep&(
 {kind:'dialogue'}|
 {kind:'action';action:Tutorial2Action;target:Tutorial2Target;spellId?:SpellId}|
 {kind:'demonstration';completion:string}|
 {kind:'settling';durationMs:number}
);
export type Tutorial2State={index:number;token:number;phase:'running'|'paused'|'complete';elapsedMs:number};
export type Tutorial2Event={token:number}&(
 {type:'continue'}|{type:'action';action:Tutorial2Action;spellId?:SpellId}|
 {type:'demonstration-finished';completion:string}|{type:'tick';deltaMs:number}
);
export function newTutorial2(steps:readonly Tutorial2Step[],token=0):Tutorial2State{
 if(!steps.length||new Set(steps.map(s=>s.id)).size!==steps.length)throw Error('Tutorial steps require unique IDs and a nonempty sequence.');
 if(steps.some(s=>s.kind==='settling'&&(!Number.isFinite(s.durationMs)||s.durationMs<0)))throw Error('Invalid settling duration.');
 return{index:0,token,phase:'running',elapsedMs:0};
}
export function tutorial2Step(steps:readonly Tutorial2Step[],state:Tutorial2State){return state.phase==='complete'?null:steps[state.index];}
export function canTutorial2Action(steps:readonly Tutorial2Step[],state:Tutorial2State,action:Tutorial2Action,spellId?:SpellId){
 const step=tutorial2Step(steps,state);
 return state.phase==='running'&&step?.kind==='action'&&step.action===action&&(!step.spellId||step.spellId===spellId);
}
export function transitionTutorial2(steps:readonly Tutorial2Step[],state:Tutorial2State,event:Tutorial2Event):Tutorial2State{
 if(state.phase!=='running'||event.token!==state.token)return state;
 const step=steps[state.index];let done=false;
 if(step.kind==='dialogue')done=event.type==='continue';
 if(step.kind==='action')done=event.type==='action'&&canTutorial2Action(steps,state,event.action,event.spellId);
 if(step.kind==='demonstration')done=event.type==='demonstration-finished'&&event.completion===step.completion;
 if(step.kind==='settling'&&event.type==='tick'&&Number.isFinite(event.deltaMs)&&event.deltaMs>0){
  const elapsedMs=Math.min(step.durationMs,state.elapsedMs+event.deltaMs);
  if(elapsedMs<step.durationMs)return{...state,elapsedMs};done=true;
 }
 if(!done)return state;
 const index=state.index+1;return{index,token:state.token+1,phase:index===steps.length?'complete':'running',elapsedMs:0};
}
export function pauseTutorial2(state:Tutorial2State):Tutorial2State{return state.phase==='running'?{...state,phase:'paused'}:state;}
export function resumeTutorial2(state:Tutorial2State):Tutorial2State{return state.phase==='paused'?{...state,phase:'running'}:state;}
// A reviewable foundation sequence using real controls; encounters arrive in later milestones.
export const TUTORIAL2_FOUNDATION_STEPS:readonly Tutorial2Step[]=[
 {id:'welcome',kind:'dialogue',text:'Welcome to the Tutorial 2.0 preview. Follow one highlighted instruction at a time. You can pause or return to the menu whenever you need.'},
 {id:'open-book',kind:'action',action:'book',target:'book',text:'Tap the highlighted Spellbook button.'},
 {id:'choose-dewdrop',kind:'action',action:'select',target:'spell-water',spellId:'water',text:'Tap Dewdrop to select the water spell.'},
 {id:'close-book',kind:'action',action:'close',target:'book-close',text:'Tap Ready to close your spellbook.'},
 {id:'draw-mark',kind:'action',action:'draw',target:'canvas',text:'Draw a mark on the highlighted paper.'},
 {id:'clear-mark',kind:'action',action:'clear',target:'clear',text:'Tap the highlighted clear button to erase your mark.'},
 {id:'preview-finished',kind:'dialogue',text:'You followed every highlighted action. This completes the Tutorial 2.0 preview.'}
];
export function tutorial2Journey(){return{...newRun(),screen:'battle' as const,relics:[],health:100,potions:{heal:1,freeze:0,ink:0}};}
export function tutorial2FoundationBattle():Battle{
 return{...newBattle('active','slime',()=>0),approachAt:Infinity,potions:{heal:1,freeze:0,ink:0}};
}
export type Tutorial2Controls={
 initialBattle:Battle;token:number;paused:boolean;blocking:boolean;resetSerial?:number;trace?:{progress:number;demonstrating:boolean};onCastOutcome?:(outcome:import('./tutorial2Fire').Tutorial2CastOutcome)=>void;
 canAction:(action:Tutorial2Action,spellId?:SpellId)=>boolean;
 onAction:(action:Tutorial2Action,token:number,spellId?:SpellId)=>void;
};
