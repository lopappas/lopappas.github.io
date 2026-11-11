import {SPELLS,type SpellId,type Point} from './magic.ts';
import {TUTORIAL2_FIRE_STEPS,tutorial2FireBattle,type Tutorial2FireState,type Tutorial2CastOutcome} from './tutorial2Fire.ts';
import {newTutorial2,transitionTutorial2,type Tutorial2Step,type Tutorial2Event,type Tutorial2Action} from './tutorial2.ts';
import {CONTACT_X} from './battle.ts';
export const LESSONS=[{id:'fire',spell:'water',name:'Dewdrop',duration:4500},{id:'nature',spell:'fire',name:'Hearthspark',duration:4000},{id:'water',spell:'nature',name:'Little Sprout',duration:4000}] as const;
function castingSteps(i:1|2):Tutorial2Step[]{const l=LESSONS[i];return[
 {id:`${l.id}-book`,kind:'action',action:'book',target:'book',text:'Open your spellbook.'},
 {id:`${l.id}-select`,kind:'action',action:'select',spellId:l.spell,target:`spell-${l.spell}`,text:`Select ${l.name}, your ${i===1?'fire':'nature'} spell.`},
 {id:`${l.id}-close`,kind:'action',action:'close',target:'book-close',text:'Close your spellbook.'},
 {id:`${l.id}-demo`,kind:'demonstration',completion:l.spell,text:`Tutorial: How to draw ${l.name}`},
 {id:`${l.id}-draw`,kind:'action',action:'draw',target:'canvas',text:`Try to draw your own ${l.name}!`},
 {id:`${l.id}-cast`,kind:'action',action:'cast',target:'cast',text:'Hold Cast!'},
 {id:`${l.id}-impact`,kind:'settling',durationMs:0,text:''},
 {id:`${l.id}-retry`,kind:'settling',durationMs:1000,text:'Try again'}
];}
const authoredSteps:readonly Tutorial2Step[]=[
 {id:'fire-enter',kind:'settling',durationMs:800,text:''},
 {id:'fire-arrival-wait',kind:'settling',durationMs:600,text:''},...TUTORIAL2_FIRE_STEPS.flatMap(s=>s.id==='fire-impact'?[s,{id:'fire-retry',kind:'settling' as const,durationMs:1000,text:'Try again'}]:[s]),
 {id:'nature-intro',kind:'dialogue',text:'Ah, a pesky nature slime, let me blast em away with fire!'},
 {id:'nature-spill',kind:'dialogue',text:'Whoops! I spilled my inkwell…'},
 {id:'nature-clear',kind:'action',action:'clear',target:'clear',text:'Clear the spilled ink.'},
 {id:'nature-ink',kind:'dialogue',text:'I need to refill my ink too.'},
 {id:'nature-refill',kind:'action',action:'refill',target:'refill',text:'Refill your ink'},
 {id:'nature-refilled',kind:'dialogue',text:'Ok, back to taking down this nature slime.'},
 ...castingSteps(1),{id:'nature-victory',kind:'dialogue',text:'That was easy. Fire beats nature.'},
 {id:'water-enter',kind:'settling',durationMs:800,text:''},
 {id:'water-pre-attack',kind:'settling',durationMs:1500,text:''},
 {id:'water-ambush',kind:'settling',durationMs:0,text:''},
 {id:'water-hit-wait',kind:'settling',durationMs:1500,text:''},
 {id:'water-injury',kind:'dialogue',text:'Ow! What... Where did this water slime come from?? I need a health potion... Belladora! Where are you!'},
 {id:'water-arrive',kind:'settling',durationMs:1000,text:''},
 {id:'water-arrival-wait',kind:'settling',durationMs:1500,text:''},
 {id:'water-heal',kind:'action',action:'heal',target:'heal',text:'Tap your health potion.'},
 {id:'water-potion-wait',kind:'settling',durationMs:1800,text:''},
 {id:'water-recovered',kind:'dialogue',text:'Much better. You’ll pay for this water slime!'},
 ...castingSteps(2),{id:'water-victory',kind:'dialogue',text:"Don't mess with witches! Nature absorbs water."},
 {id:'water-elements',kind:'dialogue',presentation:'screen',text:'Water beats Fire.\n\nFire beats Nature.\n\nNature beats Water.\n\nUse the elements to your advantage to deal extra damage!'},
];
export const ELEMENT_STEPS:readonly Tutorial2Step[]=authoredSteps.map(step=>step.kind==='dialogue'?step:{...step,text:step.text.replace(/\.$/,'')});
export const newElementTutorial=():Tutorial2FireState=>({...newTutorial2(ELEMENT_STEPS),resetSerial:0,retry:false});
export const elementStep=(s:Tutorial2FireState)=>ELEMENT_STEPS[s.index];
export const elementLesson=(s:Tutorial2FireState)=>(s.phase==='complete'?2:LESSONS.findIndex(l=>elementStep(s)?.id.startsWith(l.id))) as 0|1|2;
function jump(s:Tutorial2FireState,id:string,reset=false){return{...s,index:ELEMENT_STEPS.findIndex(x=>x.id===id),token:s.token+1,elapsedMs:0,resetSerial:s.resetSerial+(reset?1:0)};}
export function elementActionAllowed(s:Tutorial2FireState,action:Tutorial2Action,spellId?:SpellId){
 const step=elementStep(s);if(s.phase!=='running')return false;
 if(/-(draw|cast)$/.test(step.id)&&['draw','clear'].includes(action))return true;
 return step.kind==='action'&&step.action===action&&(!step.spellId||step.spellId===spellId);
}
export const elementCanReplay=(s:Tutorial2FireState)=>s.phase==='running'&&/-(draw|cast)$/.test(elementStep(s).id);
export const replayElement=(s:Tutorial2FireState)=>elementCanReplay(s)?jump(s,`${LESSONS[elementLesson(s)].id}-demo`,true):s;
export function transitionElement(s:Tutorial2FireState,e:Tutorial2Event){
 if(s.phase!=='running'||e.token!==s.token)return s;
 const step=elementStep(s);
 if(e.type==='tick'&&['water-draw','water-cast'].includes(step.id)&&Number.isFinite(e.deltaMs)&&e.deltaMs>0)return s.elapsedMs>=6000?s:{...s,elapsedMs:Math.min(6000,s.elapsedMs+e.deltaMs)};
 if(step.kind==='settling'&&step.durationMs===0)return s;
 if(step.id.endsWith('-retry')&&e.type==='tick'&&Number.isFinite(e.deltaMs)&&e.deltaMs>0&&s.elapsedMs+e.deltaMs>=1000)return{...jump(s,`${LESSONS[elementLesson(s)].id}-draw`),retry:true};
 if(e.type==='action'&&e.action==='clear'&&elementCanReplay(s))return jump(s,`${LESSONS[elementLesson(s)].id}-draw`,true);
 const next=transitionTutorial2(ELEMENT_STEPS,s,e);return next===s?s:{...s,...next,elapsedMs:step.id==='water-draw'&&e.type==='action'&&e.action==='draw'?s.elapsedMs:next.elapsedMs,retry:e.type==='tick'?s.retry:false};
}
export function resolveElementCast(s:Tutorial2FireState,o:Tutorial2CastOutcome){
 if(s.phase!=='running'||!elementStep(s).id.endsWith('-impact')||o.token!==s.token-1)return s;
 const l=LESSONS[elementLesson(s)];return o.spellId===l.spell&&o.quality>=60&&o.enemyHP<=0?jump(s,`${l.id}-victory`):{...jump(s,`${l.id}-${o.quality<60?'retry':'draw'}`,true),retry:true};
}
export const finishAmbush=(s:Tutorial2FireState,token:number)=>s.phase==='running'&&s.token===token&&elementStep(s).id==='water-ambush'?jump(s,'water-hit-wait'):s;
export function elementBattle(lesson:number,ambush=false){
 const b=tutorial2FireBattle();return{...b,playerHP:100,potions:{...b.potions,heal:lesson===2&&!ambush?0:1},approachAt:ambush?0:Infinity,enemies:b.enemies.map(e=>({...e,element:lesson===1?'Nature' as const:lesson===2?'Water' as const:'Fire' as const,x:ambush?CONTACT_X:e.x}))};
}
export function elementTrace(spellId:SpellId,progress:number){
 const spell=SPELLS.find(s=>s.id===spellId)!;
 const paths=spellId==='water'?[([...spell.strokes[0]].reverse())]:spellId==='fire'?[([...spell.strokes[0]].reverse())]:spell.strokes;
 const total=paths.reduce((sum,path)=>sum+path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0),0);
 let remaining=total*Math.max(0,Math.min(1,progress));const strokes:Point[][]=[];let tip=paths[0][0];
 for(const path of paths){const partial=[path[0]];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b.x-a.x,b.y-a.y);if(remaining>=length){partial.push(b);remaining-=length;tip=b;}else{const t=length?remaining/length:0;tip={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};partial.push(tip);strokes.push(partial);return{strokes,tip};}}strokes.push(partial);}
 return{strokes,tip};
}
