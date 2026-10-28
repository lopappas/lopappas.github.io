import {newBattle,stepBattle,spellDamage,CONTACT_X,CONTACT_DAMAGE,type Battle} from './battle.ts';
import {newRun,type Run} from './run.ts';
import {SPELLS,type SpellId} from './magic.ts';

export type TutorialCheckpoint={battle:Battle;ink:number;lastCast?:{spellId:SpellId;quality:number;damage:number}};
export const TUTORIAL_LESSONS=['book','clear','elements','resistances','remember','heal','refill','quality','finish'] as const;
export type TutorialLesson=typeof TUTORIAL_LESSONS[number];
const isInfoLesson=(lesson:TutorialLesson)=>lesson==='remember'||lesson==='resistances';
export type TutorialAction='book'|'draw'|'clear'|'cast'|'refill'|'heal'|'freeze'|'ink';
type LessonProgress={bookOpened:boolean;viewedSpell:SpellId|null;studiedSpell:SpellId|null;healed:boolean};
const emptyProgress=():LessonProgress=>({bookOpened:false,viewedSpell:null,studiedSpell:null,healed:false});
export type TutorialState={phase:'briefing'|'active'|'paused'|'settling';settleMs:number;lastCast?:TutorialCheckpoint['lastCast'];lesson:TutorialLesson;progress:LessonProgress;feedback:string|null;checkpoint:TutorialCheckpoint;attempt:number};
export type TutorialEvent={type:'book-opened'}|{type:'spell-viewed';spellId:SpellId}|{type:'book-closed';spellId:SpellId}|{type:'drawing-cleared';hadDrawing:boolean}|{type:'potion-impact';potion:'heal'|'freeze'|'ink';healing:number}|{type:'potion-finished';potion:'heal'|'freeze'|'ink'}|{type:'settling-tick';deltaMs:number}|{type:'refilled'}|{type:'spell-hit';spellId:SpellId;quality:number}|{type:'fizzle'};

export function tutorialCounter(battle:Battle){const element=battle.enemies[0].element;return SPELLS.find(s=>s.id===(element==='Fire'?'water':element==='Water'?'nature':'fire'))!;}
export function tutorialLessonInfo(lesson:TutorialLesson,battle:Battle,studiedSpell?:SpellId|null){
 const spell=tutorialCounter(battle),enemy=battle.enemies[0].element;
 const lessons:Record<TutorialLesson,{title:string;briefing:string;task:string;focus:TutorialAction|null}>={
  book:{title:'Learn a spell',briefing:'Your spell book contains all of your known spells. Look at a spell in the spell book to memorize it, then cast that spell on the slime.',task:studiedSpell?`Paint ${SPELLS.find(s=>s.id===studiedSpell)!.name} and hold cast for 0.5 seconds.`:'Open the spellbook. Study a spell, then close it.',focus:studiedSpell?'cast':'book'},
  clear:{title:'Clear the canvas',briefing:'Draw a practice mark, then tap ↺ to clear it. You can start a drawing again whenever you need.',task:'Draw a mark, then tap ↺ to clear it.',focus:'clear'},
  elements:{title:'Elemental advantages',briefing:`Water beats fire\nFire beats nature\nNature beats water\n\nFind ${spell.name}, the ${spell.element} spell that counters this ${enemy} slime.`,task:`Find ${spell.name} in the spellbook, then close it.`,focus:'book'},
  resistances:{title:'Elemental resistances',briefing:'Elemental creatures resist elements they are strong against.\nA nature slime takes less damage from water spells.\n\nElemental creatures **strongly** resist their own element:\nA nature slime takes **much** less damage from nature spells',task:'Non-elemental enemies have no resistances.',focus:null},
  remember:{title:'Remember the book!',briefing:'Review your spell book anytime to help you memorize spells. Every 10 seconds you can open your spell book to magically envision a perfect spell sigil.',task:'Review your spell book anytime to help you memorize spells.',focus:null},
  heal:{title:'Healing potions',briefing:'Tap the healing potion in your purse. It restores health when the bottle lands.',task:'Tap the healing potion and watch it land.',focus:'heal'},
  refill:{title:'Refill your ink',briefing:'Your inkwell is low. Tap Refill to restore it. Refills are free.',task:'Tap Refill to restore your ink.',focus:'refill'},
  quality:{title:'Quality over quantity',briefing:`Strong shapes deal much more damage and knockback than desperate scribbles. Paint ${spell.name} and aim for Steady (60%+) spell quality or better! Use the spell book if you need to remember the spell sigil.`,task:`Paint ${spell.name}. Hold cast 0.5s. Aim for Steady (60%+).`,focus:'cast'},
  finish:{title:'Finish the slime',briefing:'Use what you learned to defeat this slime.',task:'Use what you learned to defeat this slime.',focus:null}
 };
 return{...lessons[lesson],accent:lesson==='elements'?{name:spell.name,color:spell.color}:undefined,number:TUTORIAL_LESSONS.indexOf(lesson)+1,total:TUTORIAL_LESSONS.length};
}
export function canTutorialAction(lesson:TutorialLesson,action:TutorialAction,studiedSpell?:SpellId|null){
 if(action==='book'||lesson==='finish')return true;
 if(lesson==='book')return !!studiedSpell&&['draw','clear','cast','refill'].includes(action);
 if(lesson==='clear')return action==='draw'||action==='clear';
 if(lesson==='heal')return action==='heal';
 if(lesson==='refill')return action==='refill';
 if(lesson==='quality')return action==='draw'||action==='clear'||action==='cast'||action==='refill';
 return false;
}

export function tutorialJourney():Run{
 return{...newRun(),screen:'battle',health:70,potions:{heal:1,freeze:0,ink:0}};
}
export function newTutorial(random:()=>number=Math.random):TutorialState{
 const journey=tutorialJourney();
 return{phase:'briefing',settleMs:0,lesson:'book',progress:emptyProgress(),feedback:null,attempt:0,checkpoint:{ink:100,battle:{...newBattle('active','slime',random),playerHP:journey.health,potions:{...journey.potions}}}};
}
export function beginTutorial(s:TutorialState):TutorialState{return s.phase==='briefing'?(isInfoLesson(s.lesson)?completeLesson(s):{...s,phase:'active'}):s;}
export function pauseTutorial(s:TutorialState):TutorialState{return s.phase==='active'?{...s,phase:'paused'}:s;}
export function resumeTutorial(s:TutorialState):TutorialState{return s.phase==='paused'?{...s,phase:'active'}:s;}
export function retryTutorial(s:TutorialState):TutorialState{return{...s,phase:isInfoLesson(s.lesson)?'briefing':'active',settleMs:0,lastCast:s.checkpoint.lastCast,progress:emptyProgress(),feedback:null,attempt:s.attempt+1};}
export function restoreTutorialCheckpoint(checkpoint:TutorialCheckpoint):TutorialCheckpoint{return structuredClone(checkpoint);}
export function checkpointTutorial(s:TutorialState,battle:Battle,ink:number):TutorialState{
 if(battle.phase!=='active')return s;
 return{...s,phase:'briefing',settleMs:0,attempt:s.attempt+1,checkpoint:restoreTutorialCheckpoint({battle,ink:Math.max(0,Math.min(100,ink))})};
}
function advanceAfterDelay(s:TutorialState,snapshot:TutorialCheckpoint):TutorialState{
 const index=TUTORIAL_LESSONS.indexOf(s.lesson);if(index>=TUTORIAL_LESSONS.length-1)return s;
 const lesson=TUTORIAL_LESSONS[index+1],saved=checkpointTutorial(s,snapshot.battle,lesson==='refill'?35:snapshot.ink);
 const battle=saved.checkpoint.battle;
 // A one-hit-away checkpoint at contact range must still allow a book close or potion.
 const needsBreathingRoom=battle.playerHP<=CONTACT_DAMAGE&&battle.enemies.some(e=>e.hp>0&&e.x<CONTACT_X+40);
 // New lesson controls start clean without replaying an old hit sound or flash.
 return{...saved,lesson,progress:emptyProgress(),feedback:null,checkpoint:{...saved.checkpoint,lastCast:s.lastCast,battle:{...battle,approachAt:needsBreathingRoom?Math.max(battle.approachAt,battle.time+3):battle.approachAt,playerHits:0,playerHurtUntil:0,enemies:battle.enemies.map(e=>({...e,hurtUntil:0,...(needsBreathingRoom?{attackAt:null}:{})}))}}};
}
export const LESSON_COMPLETE_DELAY_MS=1000;
function completeLesson(s:TutorialState,lastCast?:TutorialCheckpoint['lastCast']):TutorialState{
 return{...s,phase:'settling',settleMs:0,feedback:null,lastCast:lastCast??s.lastCast};
}
function castResult(event:{spellId:SpellId;quality:number},snapshot:TutorialCheckpoint){return{...event,damage:spellDamage(snapshot.battle.enemies[0],event.quality,event.spellId,snapshot.battle.damageBonus,snapshot.battle.upgrades[event.spellId]??0)};}
export function handleTutorialEvent(s:TutorialState,event:TutorialEvent,snapshot:TutorialCheckpoint):TutorialState{
 if(snapshot.battle.phase!=='active')return s;
 if(s.phase==='settling'){
  if(event.type!=='settling-tick'||!Number.isFinite(event.deltaMs)||event.deltaMs<=0)return s;
  const elapsed=s.settleMs+event.deltaMs;
  return elapsed>=LESSON_COMPLETE_DELAY_MS?advanceAfterDelay(s,snapshot):{...s,settleMs:elapsed};
 }
 if(s.phase!=='active')return s;
 const counter=tutorialCounter(snapshot.battle);
 if(s.lesson==='book'||s.lesson==='elements'){
  if(event.type==='book-opened')return{...s,feedback:null,progress:{...s.progress,bookOpened:true,viewedSpell:null,studiedSpell:null}};
  if(event.type==='spell-viewed'&&s.progress.bookOpened&&['water','fire','nature'].includes(event.spellId))return{...s,progress:{...s.progress,viewedSpell:event.spellId}};
  if(event.type==='book-closed'&&s.progress.bookOpened&&s.progress.viewedSpell===event.spellId){
   if(s.lesson==='book')return{...s,progress:{...s.progress,bookOpened:false,studiedSpell:event.spellId}};
   if(event.spellId===counter.id)return completeLesson(s);
   return{...s,feedback:`Find ${counter.name}, the ${counter.element} counter-spell.`,progress:emptyProgress()};
  }
  if(s.lesson==='book'&&event.type==='fizzle')return{...s,feedback:'Try the spell you studied. Use the book if you need a reminder.'};
  if(s.lesson==='book'&&event.type==='spell-hit'&&s.progress.studiedSpell){
   if(event.spellId===s.progress.studiedSpell&&event.quality>=48&&event.quality<=100)return completeLesson(s,castResult(event,snapshot));
   return{...s,feedback:`Cast ${SPELLS.find(spell=>spell.id===s.progress.studiedSpell)!.name}, the spell you studied.`};
  }
 }
 if(s.lesson==='clear'&&event.type==='drawing-cleared'&&event.hadDrawing)return completeLesson(s);
 if(s.lesson==='heal'){
  if(event.type==='potion-impact'&&event.potion==='heal'&&event.healing>0)return{...s,progress:{...s.progress,healed:true}};
  if(event.type==='potion-finished'&&event.potion==='heal'&&s.progress.healed)return completeLesson(s);
 }
 if(s.lesson==='refill'&&event.type==='refilled'&&snapshot.ink>=99.99)return completeLesson(s);
 if(s.lesson==='quality'){
  if(event.type==='fizzle')return{...s,feedback:'Study the sigil again. Aim for Steady (60%+).'};
  if(event.type==='spell-hit'){
   if(event.spellId!==counter.id)return{...s,feedback:`Use ${counter.name} against this ${snapshot.battle.enemies[0].element} slime.`};
   if(event.quality>=60&&event.quality<=100)return completeLesson(s,castResult(event,snapshot));
   return{...s,feedback:'Take care with the shape. Aim for Steady (60%+).'};
  }
 }
 return s;
}
export function tutorialBattleEvents(previous:Battle,next:Battle):TutorialEvent[]{
 if(previous===next||next.phase!=='active')return[];
 const events:TutorialEvent[]=[];
 for(const flight of previous.potionFlights){const landed=next.potionFlights.find(f=>f.id===flight.id);
  if(!flight.applied&&landed?.applied)events.push({type:'potion-impact',potion:flight.potion,healing:flight.potion==='heal'?Math.max(0,Math.min(30,100-previous.playerHP)):0});
  if(flight.applied&&!landed)events.push({type:'potion-finished',potion:flight.potion});
 }
 if(previous.projectile&&next.casts>previous.casts)events.push({type:'spell-hit',spellId:previous.projectile.spellId,quality:previous.projectile.quality});
 return events;
}
export function tutorialEnemyIsStill(lesson?:TutorialLesson){return !!lesson&&TUTORIAL_LESSONS.indexOf(lesson)<TUTORIAL_LESSONS.indexOf('quality');}
export function stepTutorialBattle(battle:Battle,delta:number,paused:boolean,lesson?:TutorialLesson,settling=false):Battle{
 if(paused)return battle;
 const still=tutorialEnemyIsStill(lesson);
 let next=stepBattle(still||settling?{...battle,approachAt:Infinity}:battle,delta);
 if(still||settling)next={...next,approachAt:battle.approachAt};
 // Keep early lessons stationary, even when an informational lesson is inserted.
 if(still)next={...next,enemies:next.enemies.map((e,i)=>({...e,x:battle.enemies[i].x,clock:battle.enemies[i].clock,attackAt:null,push:null}))};
 // A rushed cast cannot end the single-opponent lesson before mastery is shown.
 if(lesson&&lesson!=='finish'&&next.phase==='victory')return{...next,phase:'active',enemies:next.enemies.map(e=>e.hp===0?{...e,hp:1}:e)};
 return next;
}
