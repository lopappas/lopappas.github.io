import {newBattle,type Battle} from './battle.ts';
import {newTutorial2,transitionTutorial2,type Tutorial2Step,type Tutorial2Event,type Tutorial2Action} from './tutorial2.ts';
import {M4_STEPS,newM4Tutorial,m4ActionAllowed,transitionM4} from './tutorial2Goblin.ts';
import type {Tutorial2FireState} from './tutorial2Fire.ts';

export const FINAL_STEPS:readonly Tutorial2Step[]=[
 {id:'final-enter',kind:'settling',durationMs:800,text:''},
 {id:'final-intro',kind:'dialogue',presentation:'screen',text:'This is your battle. Defeat the final slime. Remember your spellbook to review spells! And always remember, quality is always better than quantity. Make every spell count <3'},
 {id:'final-battle',kind:'settling',durationMs:0,text:''},
 {id:'final-victory-wait',kind:'settling',durationMs:1800,text:''},
 {id:'final-complete',kind:'dialogue',presentation:'screen',text:'You defended your village! You are ready to begin your journey'}
];
export const M5_STEPS=[...M4_STEPS,...FINAL_STEPS];
export const FINAL_START=M4_STEPS.length;
export const isFinal=(s:Tutorial2FireState)=>s.index>=FINAL_START;
export function newM5Tutorial(start:'all'|'goblin'|'final'='all'):Tutorial2FireState{
 return start==='final'?{...newM4Tutorial(),...newTutorial2(M5_STEPS),index:FINAL_START}:newM4Tutorial(start==='goblin');
}
export function finalBattle(random:()=>number=Math.random):Battle{
 const b=newBattle('active','slime',random);
 return{...b,colorful:true,potions:{heal:1,freeze:0,ink:0}};
}
export function m5ActionAllowed(s:Tutorial2FireState,action:Tutorial2Action,spellId?:Parameters<typeof m4ActionAllowed>[2]){
 if(!isFinal(s))return m4ActionAllowed(s,action,spellId);
 return s.phase==='running'&&M5_STEPS[s.index]?.id==='final-battle'&&['book','select','close','draw','clear','cast','refill','heal'].includes(action);
}
export function transitionM5(s:Tutorial2FireState,event:Tutorial2Event):Tutorial2FireState{
 if(!isFinal(s)){const next=transitionM4(s,event);return next.phase==='complete'?{...next,phase:'running'}:next;}
 // Free play actions never advance the sequence. Only a real battle outcome can end combat.
 if(M5_STEPS[s.index]?.id==='final-battle')return s;
 const next=transitionTutorial2(M5_STEPS,s,event);return next===s?s:{...s,...next};
}
export function finishFinalBattle(s:Tutorial2FireState,token:number,phase:Battle['phase']):Tutorial2FireState{
 if(s.phase!=='running'||s.token!==token||M5_STEPS[s.index]?.id!=='final-battle'||phase!=='victory')return s;
 return{...s,index:s.index+1,token:s.token+1,elapsedMs:0};
}
export function retryFinal(s:Tutorial2FireState):Tutorial2FireState{
 if(s.phase!=='running'||M5_STEPS[s.index]?.id!=='final-battle')return s;
 return{...s,index:FINAL_START,token:s.token+1,elapsedMs:0,resetSerial:s.resetSerial+1};
}
