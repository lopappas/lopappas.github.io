import {SPELLS,type Strokes} from './magic.ts';
import {newTutorial2,transitionTutorial2,type Tutorial2Step,type Tutorial2Event,type Tutorial2Action} from './tutorial2.ts';
import {ELEMENT_STEPS,LESSONS as ELEMENT_LESSONS,newElementTutorial,elementLesson,elementBattle,elementActionAllowed,elementCanReplay,replayElement,transitionElement,resolveElementCast} from './tutorial2Elements.ts';
import type {Tutorial2FireState,Tutorial2CastOutcome} from './tutorial2Fire.ts';
export const QUALITY_LINES=[
 'Fizzles are your mistakes from poorly scribbled spells.',
 'Faint spells are weak, and mean you need to draw more carefully.',
 'Steady spells are average, and will take care of lesser foes.',
 'Beautiful spells are amazing, and will slay greater foes.',
 'Wonderful spells are the best... they make your mother proud!'
];
export const QUALITY_EXPLANATION='There are 5 types of spell casts:\n'+QUALITY_LINES.join('\n');
export const RELIC_EXPLANATION='Relics are powerful talismans that give you different advantages. Tap on them to inspect their magical effects.';
export const GOBLIN_STEPS:readonly Tutorial2Step[]=[
 {id:'goblin-enter',kind:'settling',durationMs:800,text:''},
 {id:'goblin-intro',kind:'dialogue',text:'Ah, a non-elemental enemy. It has no elemental vulnerabilities or resistances. I will cast Hearthspark.'},
 {id:'goblin-nephew',kind:'dialogue',text:"Oh! I remember, my nephew drew me a spell. I'll use it to defeat this goblin."},
 {id:'goblin-bad-cast',kind:'action',action:'cast',target:'cast',text:''},
 {id:'goblin-bad-impact',kind:'settling',durationMs:0,text:''},
 {id:'goblin-silence',kind:'dialogue',text:'...'},
 {id:'goblin-passion',kind:'dialogue',text:'He still has much to learn. Here goblin! Witness a true Hearthspark!'},
 {id:'goblin-perfect-draw',kind:'demonstration',completion:'perfect',text:''},
 {id:'goblin-perfect-cast',kind:'action',action:'cast',target:'cast',text:'Hold Cast!'},
 {id:'goblin-perfect-impact',kind:'settling',durationMs:0,text:''},
 {id:'goblin-defeat-wait',kind:'settling',durationMs:1800,text:''},
 {id:'goblin-qualities',kind:'dialogue',presentation:'screen',text:QUALITY_EXPLANATION},
 {id:'goblin-relic-explain',kind:'dialogue',text:'The goblin dropped a relic. Neat!'},
 {id:'goblin-relic-inspect',kind:'action',action:'inspect',target:'relic-colorfulRock',text:'Tap relic to inspect its magical effects'},
 {id:'goblin-relic-reading',kind:'settling',durationMs:1000,text:''},
 {id:'goblin-relic-continue',kind:'action',action:'continue-anywhere',target:'relic-colorfulRock',text:'Tap anywhere to continue'}
];
export const M4_STEPS=[...ELEMENT_STEPS,...GOBLIN_STEPS];
export const M4_LESSONS=[...ELEMENT_LESSONS,{id:'goblin',spell:'fire',name:'Hearthspark',duration:3000}] as const;
export const newM4Tutorial=(startAtGoblin=false):Tutorial2FireState=>({...newElementTutorial(),...newTutorial2(M4_STEPS),index:startAtGoblin?ELEMENT_STEPS.length:0});
export const m4Lesson=(s:Tutorial2FireState)=>s.phase==='complete'||s.index>=ELEMENT_STEPS.length?3:elementLesson(s);
export function goblinBattle(){const b=elementBattle(0);return{...b,potions:{...b.potions,heal:0},enemies:b.enemies.map(e=>({...e,kind:'goblin' as const,element:'Neutral' as const,initialElement:'Neutral' as const,hp:58,maxHP:58}))};}
export const m4Battle=(lesson:number,ambush=false)=>lesson===3?goblinBattle():elementBattle(lesson,ambush);
export const m4ActionAllowed=(s:Tutorial2FireState,action:Tutorial2Action,spellId?:Parameters<typeof elementActionAllowed>[2])=>s.index<ELEMENT_STEPS.length?elementActionAllowed(s,action,spellId):s.phase==='running'&&M4_STEPS[s.index]?.kind==='action'&&(M4_STEPS[s.index] as {action:Tutorial2Action}).action===action;
export const m4CanReplay=(s:Tutorial2FireState)=>s.index<ELEMENT_STEPS.length&&elementCanReplay(s);
export const replayM4=(s:Tutorial2FireState)=>s.index<ELEMENT_STEPS.length?replayElement(s):s;
export function transitionM4(s:Tutorial2FireState,event:Tutorial2Event){
 if(s.index<ELEMENT_STEPS.length){const next=transitionElement(s,event);return next.phase==='complete'?{...next,phase:'running' as const}:next;}
 if(s.phase!=='running'||s.token!==event.token||M4_STEPS[s.index]?.id.endsWith('-impact'))return s;
 const next=transitionTutorial2(M4_STEPS,s,event);return next===s?s:{...s,...next};
}
export function resolveM4Cast(s:Tutorial2FireState,o:Tutorial2CastOutcome){
 if(s.index<ELEMENT_STEPS.length)return resolveElementCast(s,o);
 if(s.phase!=='running'||o.token!==s.token-1)return s;
 const id=M4_STEPS[s.index]?.id;
 const good=o.spellId==='fire'&&(id==='goblin-bad-impact'&&o.quality===48&&Math.abs(o.enemyHP-51.5)<.001||id==='goblin-perfect-impact'&&o.quality===100&&o.enemyHP<=0);
 if(!id?.endsWith('-impact'))return s;
 return good?{...s,index:s.index+1,token:s.token+1,elapsedMs:0}:{...s,index:M4_STEPS.findIndex(x=>x.id==='goblin-bad-cast'),token:s.token+1,elapsedMs:0,resetSerial:s.resetSerial+1};
}
export function relicAwarded(s:Tutorial2FireState){return s.phase==='complete'||s.index>=M4_STEPS.findIndex(x=>x.id==='goblin-relic-explain');}
export function goblinDrawing(perfect:boolean,progress=1):Strokes{
 let path:Strokes[number];
 if(perfect)path=SPELLS.find(s=>s.id==='fire')!.strokes[0];
 else{path=[];const v=[[50,12],[85,82],[15,82],[50,12]];for(let e=0;e<3;e++)for(let j=0;j<8;j++){const t=j/8,a=v[e],b=v[e+1];path.push({x:a[0]+(b[0]-a[0])*t+Math.sin(j*2.7+e*1.8+11)*6,y:a[1]+(b[1]-a[1])*t+Math.cos(j*1.9+e+11)*3.6});}path.push(path[0]);}
 const lengths=path.slice(1).map((b,i)=>Math.hypot(b.x-path[i].x,b.y-path[i].y));let left=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,progress));const partial=[path[0]];
 for(let i=0;i<lengths.length;i++){const a=path[i],b=path[i+1];if(left>=lengths[i]){partial.push(b);left-=lengths[i];}else{const t=left/lengths[i];partial.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});break;}}
 return[partial];
}
