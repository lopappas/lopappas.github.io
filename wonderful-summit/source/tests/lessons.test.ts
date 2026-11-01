import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newTutorial,beginTutorial,pauseTutorial,resumeTutorial,retryTutorial,restoreTutorialCheckpoint,handleTutorialEvent,stepTutorialBattle,tutorialBattleEvents,tutorialCounter,tutorialLessonInfo,canTutorialAction,TUTORIAL_LESSONS,LESSON_COMPLETE_DELAY_MS,type TutorialState,type TutorialCheckpoint,type TutorialEvent,type TutorialLesson} from '../src/tutorial.ts';
import {drinkPotion,launchSpell,advantage,type Potion} from '../src/battle.ts';
import {SPELLS,refillInk,type SpellId} from '../src/magic.ts';

class LessonRun{
 session:TutorialState;snapshot:TutorialCheckpoint;visited:TutorialLesson[]=['book'];
 constructor(roll=.2){this.session=newTutorial(()=>roll);this.snapshot=restoreTutorialCheckpoint(this.session.checkpoint);}
 begin(){this.session=beginTutorial(this.session);}
 emit(event:TutorialEvent){
  const previous=this.session;this.session=handleTutorialEvent(previous,event,this.snapshot);
  if(this.session.attempt!==previous.attempt){this.snapshot=restoreTutorialCheckpoint(this.session.checkpoint);this.visited.push(this.session.lesson);}
 }
 tick(seconds:number){for(let i=0;i<Math.round(seconds*100);i++){
  const previous=this.snapshot.battle,settling=this.session.phase==='settling';
  const next=stepTutorialBattle(previous,.01,this.session.phase!=='active'&&!settling,this.session.lesson,settling);
  this.snapshot={...this.snapshot,battle:next};for(const event of tutorialBattleEvents(previous,next))this.emit(event);
  if(settling)this.emit({type:'settling-tick',deltaMs:(next.time-previous.time)*1000});
 }}
 settle(){for(let i=0;this.session.phase==='settling'&&i<210;i++)this.tick(.01);assert.equal(this.session.phase,'briefing');}
 study(id:SpellId){this.emit({type:'book-opened'});this.emit({type:'spell-viewed',spellId:id});this.tick(2);this.emit({type:'book-closed',spellId:id});}
 potion(id:Potion){assert.ok(canTutorialAction(this.session.lesson,id,this.session.progress.studiedSpell));this.snapshot={...this.snapshot,battle:drinkPotion(this.snapshot.battle,id)};}
 cast(quality:number,id=tutorialCounter(this.snapshot.battle).id){assert.equal(this.session.phase,'active');assert.ok(canTutorialAction(this.session.lesson,'cast',this.session.progress.studiedSpell));this.snapshot={...this.snapshot,battle:launchSpell(this.snapshot.battle,quality,'#abc',id)};this.tick(.4);}
 retry(){this.session=retryTutorial(this.session);this.snapshot=restoreTutorialCheckpoint(this.session.checkpoint);}
 to(lesson:TutorialLesson){
  for(let limit=0;this.session.lesson!==lesson&&limit<TUTORIAL_LESSONS.length;limit++){
   this.begin();switch(this.session.lesson){
    case 'book':this.study('water');this.cast(60,'water');break;
    case 'clear':this.snapshot.ink=90;this.emit({type:'drawing-cleared',hadDrawing:true});break;
    case 'elements':this.study(tutorialCounter(this.snapshot.battle).id);break;
    case 'heal':this.potion('heal');this.tick(1.1);break;
    case 'refill':this.snapshot.ink=refillInk(this.snapshot.ink,650);this.emit({type:'refilled'});break;
    case 'quality':this.cast(60);break;
   }
   this.settle();
  }
  assert.equal(this.session.lesson,lesson);
 }
}

test('all nine lessons complete against each single slime without a freeze lesson or potion',()=>{
 assert.equal(TUTORIAL_LESSONS.length,9);assert.ok(!TUTORIAL_LESSONS.some(id=>String(id)==='freeze'));
 for(const roll of [0,.4,.8]){
  const run=new LessonRun(roll),element=run.snapshot.battle.enemies[0].element;assert.equal(run.snapshot.battle.potions.freeze,0);
  run.to('finish');assert.deepEqual(run.visited,[...TUTORIAL_LESSONS]);assert.equal(run.session.phase,'briefing');
  assert.equal(run.snapshot.battle.enemies.length,1);assert.equal(run.snapshot.battle.enemies[0].element,element);assert.deepEqual(run.snapshot.battle.potions,{heal:0,freeze:0,ink:0});
  assert.equal(run.snapshot.lastCast!.quality,60);assert.equal(run.snapshot.lastCast!.damage,26);
  run.begin();for(let i=0;i<6&&run.snapshot.battle.phase==='active';i++)run.cast(60);
  assert.equal(run.snapshot.battle.phase,'victory');assert.ok(run.snapshot.battle.playerHP>0);assert.equal(run.session.lesson,'finish');
 }
});

test('Remember the book is a paused fifth lesson completed only by Continue',()=>{
 const run=new LessonRun();run.to('remember');
 assert.equal(run.session.phase,'briefing');
 assert.deepEqual(TUTORIAL_LESSONS.slice(2,6),['elements','resistances','remember','heal']);
 const info=tutorialLessonInfo('remember',run.snapshot.battle);
 assert.equal(info.number,5);assert.equal(info.total,9);assert.equal(info.title,'Remember the book!');
 assert.equal(info.briefing,'Review your spell book anytime to help you memorize spells. Every 10 seconds you can open your spell book to magically envision a perfect spell sigil.');
 const saved=restoreTutorialCheckpoint(run.snapshot);run.tick(30);assert.deepEqual(run.snapshot,saved);
 run.emit({type:'book-opened'});assert.equal(run.session.phase,'briefing');
 run.begin();assert.equal(run.session.phase,'settling');assert.equal(run.session.lesson,'remember');
 assert.strictEqual(beginTutorial(run.session),run.session);
 run.tick(.99);assert.equal(run.session.lesson,'remember');
 run.settle();assert.equal(run.session.lesson,'heal');assert.equal(run.session.phase,'briefing');
 assert.equal(run.snapshot.battle.enemies[0].element,saved.battle.enemies[0].element);
 assert.equal(run.snapshot.battle.playerHP,saved.battle.playerHP);assert.equal(run.snapshot.ink,saved.ink);
});

test('a lesson only accepts its action while active, with a living player',()=>{
 const run=new LessonRun();const event:TutorialEvent={type:'drawing-cleared',hadDrawing:true};
 assert.strictEqual(handleTutorialEvent(run.session,event,run.snapshot),run.session);run.begin();assert.strictEqual(handleTutorialEvent(run.session,event,run.snapshot),run.session);
 run.to('clear');const paused=pauseTutorial(beginTutorial(run.session));assert.strictEqual(handleTutorialEvent(paused,event,run.snapshot),paused);
 const active=resumeTutorial(paused),dead={...run.snapshot,battle:{...run.snapshot.battle,phase:'defeat' as const,playerHP:0}};assert.strictEqual(handleTutorialEvent(active,event,dead),active);
});

test('Learn a spell requires opening, studying, closing and then successfully hitting with that same spell',()=>{
 const run=new LessonRun();run.begin();
 run.emit({type:'spell-hit',spellId:'nature',quality:100});assert.equal(run.session.phase,'active');
 assert.equal(canTutorialAction('book','cast',run.session.progress.studiedSpell),false);
 run.emit({type:'book-opened'});run.emit({type:'spell-viewed',spellId:'nature'});
 run.emit({type:'spell-hit',spellId:'nature',quality:100});assert.equal(run.session.phase,'active');
 run.emit({type:'book-closed',spellId:'nature'});assert.equal(run.session.phase,'active');assert.equal(run.session.progress.studiedSpell,'nature');
 run.emit({type:'fizzle'});assert.equal(run.session.phase,'active');
 run.cast(100,'water');assert.equal(run.session.phase,'active');assert.ok(run.session.feedback);
 run.cast(48,'nature');assert.equal(run.session.phase,'settling');assert.equal(run.session.lesson,'book');assert.equal(run.session.lastCast!.spellId,'nature');
 run.settle();assert.equal(run.session.lesson,'clear');
});

test('lesson 1 target remains stationary and cannot attack, including when hit',()=>{
 const run=new LessonRun();run.begin();const start=run.snapshot.battle.enemies[0];run.tick(30);
 assert.equal(run.snapshot.battle.enemies[0].x,start.x);assert.equal(run.snapshot.battle.enemies[0].clock,0);assert.equal(run.snapshot.battle.playerHP,70);
 run.study('water');run.cast(60,'water');assert.ok(run.snapshot.battle.enemies[0].hp<100);assert.equal(run.snapshot.battle.enemies[0].x,start.x);assert.equal(run.snapshot.battle.enemies[0].push,null);
 run.settle();run.begin();run.tick(.1);assert.equal(run.snapshot.battle.enemies[0].x,start.x);
});

test('every completed lesson waits one second before the next lesson appears',()=>{
 assert.equal(LESSON_COMPLETE_DELAY_MS,1000);
 for(const lesson of ['book','clear','elements','resistances','remember','heal','refill','quality'] as const){
  const run=new LessonRun();run.to(lesson);run.begin();
  switch(lesson){case 'book':run.study('water');run.cast(60,'water');break;case 'clear':run.emit({type:'drawing-cleared',hadDrawing:true});break;case 'elements':run.study(tutorialCounter(run.snapshot.battle).id);break;case 'heal':run.potion('heal');run.tick(1.1);break;case 'refill':run.snapshot.ink=100;run.emit({type:'refilled'});break;case 'quality':run.cast(60);break;}
  assert.equal(run.session.phase,'settling');const remaining=1000-run.session.settleMs;
  run.emit({type:'settling-tick',deltaMs:remaining-1});assert.equal(run.session.lesson,lesson);assert.equal(run.session.phase,'settling');
  const waiting=run.session;assert.strictEqual(beginTutorial(waiting),waiting);assert.strictEqual(pauseTutorial(waiting),waiting);
  run.emit({type:'settling-tick',deltaMs:2});assert.equal(run.session.phase,'briefing');assert.notEqual(run.session.lesson,lesson);
 }
});

test('completion gap shows the existing result while enemy attacks stay stopped and input events are ignored',()=>{
 const run=new LessonRun();run.to('clear');run.begin();run.snapshot.battle={...run.snapshot.battle,enemies:run.snapshot.battle.enemies.map(e=>({...e,x:325,attackAt:e.clock}))};
 run.emit({type:'drawing-cleared',hadDrawing:true});const hp=run.snapshot.battle.playerHP;
 run.tick(.9);assert.equal(run.session.phase,'settling');assert.equal(run.snapshot.battle.playerHP,hp);
 const before=run.session;run.emit({type:'refilled'});assert.strictEqual(run.session,before);
 const previous=run.snapshot.battle,next=stepTutorialBattle(previous,60,false,'clear',true);assert.ok(next.time-previous.time<.101);
});

test('elemental lesson requires the counter and supplies its correct element color',()=>{
 for(const roll of [0,.4,.8]){
  const run=new LessonRun(roll);run.to('elements');run.begin();const counter=tutorialCounter(run.snapshot.battle);
  assert.ok(advantage(counter.element,run.snapshot.battle.enemies[0].element));const info=tutorialLessonInfo('elements',run.snapshot.battle);
  assert.deepEqual(info.accent,{name:counter.name,color:counter.color});assert.ok(info.briefing.includes(counter.name));assert.ok(info.task.includes(counter.name));
  const wrong=SPELLS.find(s=>['water','fire','nature'].includes(s.id)&&s.id!==counter.id)!;
  run.study(wrong.id);assert.equal(run.session.phase,'active');assert.ok(run.session.feedback);
  run.study(counter.id);assert.equal(run.session.phase,'settling');run.settle();assert.equal(run.session.lesson,'resistances');
 }
});

test('clearing an empty canvas does not complete the clear lesson',()=>{
 const run=new LessonRun();run.to('clear');run.begin();run.emit({type:'drawing-cleared',hadDrawing:false});assert.equal(run.session.phase,'active');
 run.emit({type:'drawing-cleared',hadDrawing:true});assert.equal(run.session.phase,'settling');run.settle();assert.equal(run.session.lesson,'elements');
});

test('healing still waits for actual restoration and the bottle break before the one-second gap',()=>{
 const run=new LessonRun();run.to('heal');run.begin();const hp=run.snapshot.battle.playerHP;run.potion('heal');
 run.tick(.64);assert.equal(run.snapshot.battle.playerHP,hp);assert.equal(run.session.phase,'active');
 run.tick(.03);assert.equal(run.snapshot.battle.playerHP,hp+30);assert.equal(run.session.progress.healed,true);assert.equal(run.session.phase,'active');
 run.tick(.35);assert.equal(run.session.phase,'settling');assert.equal(run.snapshot.battle.potions.heal,0);
 run.settle();assert.equal(run.session.lesson,'refill');assert.equal(run.snapshot.ink,35);
});

test('refill starts with room in the inkwell and only full completion starts the gap',()=>{
 const run=new LessonRun();run.to('refill');run.begin();run.snapshot.ink=refillInk(35,300);run.emit({type:'refilled'});assert.equal(run.session.phase,'active');
 run.snapshot.ink=refillInk(35,650);run.emit({type:'refilled'});assert.equal(run.session.phase,'settling');run.settle();assert.equal(run.session.lesson,'quality');
});

test('quality still requires a Steady counter-spell and preserves its score through the delay',()=>{
 const run=new LessonRun();run.to('quality');run.begin();const counter=tutorialCounter(run.snapshot.battle);
 run.emit({type:'fizzle'});run.cast(59);assert.equal(run.session.phase,'active');
 const wrong=SPELLS.find(s=>['water','fire','nature'].includes(s.id)&&s.id!==counter.id)!;run.cast(100,wrong.id);assert.equal(run.session.phase,'active');
 run.snapshot.battle={...run.snapshot.battle,enemies:run.snapshot.battle.enemies.map(e=>({...e,hp:1}))};
 run.cast(59);assert.equal(run.snapshot.battle.enemies[0].hp,1);assert.equal(run.session.phase,'active');
 run.cast(60);assert.equal(run.session.phase,'settling');assert.equal(run.session.lastCast!.quality,60);run.settle();assert.equal(run.session.lesson,'finish');assert.equal(run.snapshot.lastCast!.quality,60);
 run.begin();run.cast(60);assert.equal(run.snapshot.battle.phase,'victory');
});

test('slime protection and tutorial delays do not affect normal fights or the final lesson',()=>{
 const run=new LessonRun();const b={...run.snapshot.battle,enemies:run.snapshot.battle.enemies.map(e=>({...e,hp:1}))};const cast=launchSpell(b,100,'#abc','water');let protectedBattle=cast,normalBattle=cast,finalBattle=cast;
 for(let i=0;i<40;i++){protectedBattle=stepTutorialBattle(protectedBattle,.01,false,'quality');normalBattle=stepTutorialBattle(normalBattle,.01,false);finalBattle=stepTutorialBattle(finalBattle,.01,false,'finish');}
 assert.equal(protectedBattle.phase,'active');assert.equal(normalBattle.phase,'victory');assert.equal(finalBattle.phase,'victory');
});

test('lesson retries restore the current lesson and reset its viewing requirement or supplies',()=>{
 for(const lesson of ['book','heal','refill','quality','finish'] as const){
  const run=new LessonRun();run.to(lesson);run.begin();const saved=restoreTutorialCheckpoint(run.session.checkpoint);
  if(lesson==='book')run.study('water');if(lesson==='heal')run.potion('heal');if(lesson==='quality')run.cast(59);
  run.snapshot.ink=0;run.snapshot.battle={...run.snapshot.battle,playerHP:0,phase:'defeat'};run.retry();
  assert.equal(run.session.lesson,lesson);assert.equal(run.session.phase,'active');assert.deepEqual(run.snapshot,saved);assert.equal(run.session.progress.studiedSpell,null);assert.equal(run.session.progress.healed,false);
 }
});

test('casting in lesson 1 unlocks only after studying; quality controls remain usable',()=>{
 assert.equal(canTutorialAction('book','draw'),false);assert.equal(canTutorialAction('book','cast'),false);
 for(const action of ['draw','clear','cast','refill'] as const)assert.equal(canTutorialAction('book',action,'water'),true);
 for(const lesson of TUTORIAL_LESSONS)assert.equal(canTutorialAction(lesson,'book'),true);
 for(const lesson of ['clear','elements','heal','refill'] as const)assert.equal(canTutorialAction(lesson,'cast'),false);
 for(const action of ['draw','clear','cast','refill','book'] as const)assert.equal(canTutorialAction('quality',action),true);
});

test('closing the studied spell page immediately enables drawing without waiting for a hint event',()=>{
 const run=new LessonRun();run.begin();run.emit({type:'book-opened'});run.emit({type:'spell-viewed',spellId:'fire'});
 assert.equal(canTutorialAction('book','draw',run.session.progress.studiedSpell),false);
 run.emit({type:'book-closed',spellId:'fire'});
 assert.equal(run.snapshot.battle.time,0);
 for(const action of ['draw','cast','clear','refill'] as const)assert.equal(canTutorialAction('book',action,run.session.progress.studiedSpell),true);
});

test('the slime remains stationary in early lessons and approaches only during Quality over quantity',()=>{
 const run=new LessonRun();
 for(const lesson of TUTORIAL_LESSONS.slice(0,TUTORIAL_LESSONS.indexOf('quality'))){
  run.to(lesson);run.begin();const before=run.snapshot.battle;
  run.tick(20);
  assert.equal(run.snapshot.battle.enemies[0].x,before.enemies[0].x,lesson);
  assert.equal(run.snapshot.battle.enemies[0].clock,before.enemies[0].clock,lesson);
  assert.equal(run.snapshot.battle.playerHP,before.playerHP,lesson);
 }
 run.to('quality');const before=run.snapshot.battle;
 run.tick(1);assert.equal(run.snapshot.battle.enemies[0].x,before.enemies[0].x); // Briefing still pauses.
 run.begin();run.tick(1);assert.ok(run.snapshot.battle.enemies[0].x<before.enemies[0].x);
 const hp=run.snapshot.battle.playerHP;run.tick(25);assert.ok(run.snapshot.battle.playerHP<hp);
});

test('unsafe next-lesson checkpoints retain reaction time after the delayed transition',()=>{
 const run=new LessonRun();run.to('clear');run.begin();run.snapshot.battle={...run.snapshot.battle,time:30,playerHP:1,enemies:run.snapshot.battle.enemies.map(e=>({...e,x:325,clock:25,attackAt:25}))};
 run.emit({type:'drawing-cleared',hadDrawing:true});run.settle();assert.equal(run.session.lesson,'elements');assert.ok(run.snapshot.battle.approachAt>=run.snapshot.battle.time+2.99);
 run.begin();run.tick(2.5);assert.equal(run.snapshot.battle.phase,'active');assert.equal(run.snapshot.battle.playerHP,1);
});
