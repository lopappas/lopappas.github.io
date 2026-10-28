import {power,knockback,SPELLS,type SpellId,type Element} from './magic.ts';
export const PLAYER_MAX_HP=100,SLIME_MAX_HP=100;
export const CONTACT_X=325,SLIME_START_X=580,SLIME_SPEED=18;
export const CONTACT_DAMAGE=12,ATTACK_COOLDOWN=1.5,ATTACK_WINDUP=.45,PUSH_DURATION=.28;
export const ENEMY_BACK_X=640;
export const ENEMY_RUNWAY_SIZE=ENEMY_BACK_X-CONTACT_X;
export const PLAYER_HIT_PUSH=ENEMY_RUNWAY_SIZE/3;
export const ENEMY_APPROACH_DELAY=5;
export type BattlePhase='ready'|'active'|'victory'|'defeat';
export type Encounter='slime'|'pack'|'elite'|'rock';
export type Potion='heal'|'freeze'|'ink';
export const ENCOUNTERS:Record<Encounter,string>={slime:'Meadow slime',pack:'Elemental pack',elite:'Elite goblin',rock:'Rock slime'};
export const FREEZE_SECONDS=4,UNLIMITED_INK_SECONDS=15;
export const POTIONS:Record<Potion,{name:string;icon:string;detail:string}>={heal:{name:'Healing',icon:'♥',detail:'Restore 30 health'},freeze:{name:'Freeze',icon:'❄',detail:`Freeze all enemies for ${FREEZE_SECONDS} seconds`},ink:{name:'Endless ink',icon:'◒',detail:`Refill ink to 100% and gain ${UNLIMITED_INK_SECONDS} seconds of unlimited ink`}};
export const POTION_FLIGHT_SECONDS=.65,POTION_BREAK_SECONDS=.35;
export type PotionFlight={id:number;potion:Potion;started:number;toX:number;toY:number;applied:boolean};
export type Burn={damage:number;nextTick:number;ticks:number};
export type Push={from:number;to:number;started:number;ends:number};
export type Enemy={id:number;rocky:boolean;kind:'slime'|'goblin';spawnAt:number;element:Element|'Neutral';hp:number;maxHP:number;x:number;clock:number;attackAt:number|null;nextAttackAt:number;hurtUntil:number;push:Push|null;slowUntil:number;rootUntil:number;stunUntil:number;burn:Burn|null};
export type Projectile={started:number;duration:number;quality:number;color:string;spellId:SpellId;targetId:number};
export type Battle={phase:BattlePhase;encounter:Encounter;time:number;approachAt:number;playerHP:number;enemies:Enemy[];playerHurtUntil:number;playerHits:number;casts:number;projectile:Projectile|null;potions:Record<Potion,number>;freezeUntil:number;unlimitedUntil:number;potionFlights:PotionFlight[];potionSerial:number;upgrades:Partial<Record<SpellId,number>>;damageBonus:number;pushBonus:number;firstHitPush:number;difficulty:number;amulets:{sun:boolean;moon:boolean;twilight:boolean}};
function enemy(id:number,element:Enemy['element'],x:number,kind:Enemy['kind']='slime',rocky=false):Enemy{return{id,kind,rocky,spawnAt:0,element,hp:rocky?150:kind==='goblin'?200:SLIME_MAX_HP,maxHP:rocky?150:kind==='goblin'?200:SLIME_MAX_HP,x,clock:0,attackAt:null,nextAttackAt:0,hurtUntil:0,push:null,slowUntil:0,rootUntil:0,stunUntil:0,burn:null};}
const ELEMENTS:Element[]=['Fire','Water','Nature'];
export function newBattle(phase:BattlePhase='ready',encounter:Encounter='slime',random:()=>number=Math.random):Battle{
 const first=ELEMENTS[Math.min(2,Math.floor(random()*3))];
 const remaining=ELEMENTS.filter(e=>e!==first);
 const second=encounter==='pack'?remaining[Math.min(1,Math.floor(random()*2))]:first;
 return{phase,encounter,time:0,approachAt:ENEMY_APPROACH_DELAY,playerHP:PLAYER_MAX_HP,enemies:encounter==='pack'?[enemy(1,first,580),enemy(2,second,ENEMY_BACK_X)]:encounter==='elite'?[enemy(1,'Neutral',580,'goblin')]:encounter==='rock'?[enemy(1,'Neutral',SLIME_START_X,'slime',true)]:[enemy(1,first,SLIME_START_X)],playerHurtUntil:0,playerHits:0,casts:0,projectile:null,potions:{heal:1,freeze:1,ink:1},freezeUntil:0,unlimitedUntil:0,potionFlights:[],potionSerial:0,upgrades:{},damageBonus:1,pushBonus:1,firstHitPush:0,difficulty:1,amulets:{sun:false,moon:false,twilight:false}};
}
export function presentEnemies(state:Battle){return state.enemies.filter(e=>e.hp>0&&e.spawnAt<=state.time+1e-9);}
export function nearestEnemy(state:Battle){return presentEnemies(state).sort((a,b)=>a.x-b.x||a.id-b.id)[0];}
export function targetedEnemy(state:Battle){return presentEnemies(state).find(e=>e.id===state.projectile?.targetId)??nearestEnemy(state);}
export function advantage(element:Element,target:Enemy['element']){return(element==='Water'&&target==='Fire')||(element==='Fire'&&target==='Nature')||(element==='Nature'&&target==='Water');}
export function elementalMatchup(element:Element,target:Enemy['element']){
 if(element==='Neutral'||target==='Neutral')return{damage:1,knockback:1,immuneEffects:false};
 if(element===target)return{damage:.5,knockback:.7,immuneEffects:true};
 if(advantage(target,element))return{damage:.75,knockback:.85,immuneEffects:false};
 return{damage:1.5,knockback:1,immuneEffects:false};
}
export function rockyDefense(rocky:boolean,quality:number){return !rocky||quality>=70?{damage:1,knockback:1,immuneEffects:false}:quality>=60?{damage:.75,knockback:.75,immuneEffects:false}:{damage:.5,knockback:0,immuneEffects:true};}
export function spellDamage(target:Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'>>,quality:number,spellId:SpellId,damageBonus=1,upgrade=0){if(spellId==='chronos')return 0;const spell=SPELLS.find(s=>s.id===spellId)!;const factor=spellId==='bolt'?1.4:spellId==='wave'?.8:spellId==='leaf'?.75:1;return Math.round(power(quality)*factor*damageBonus*(1+upgrade*.25)*elementalMatchup(spell.element,target.element).damage*rockyDefense(!!target.rocky,quality).damage);}
export function spellKnockback(quality:number,spellId:SpellId,pushBonus=1,target:Enemy['element']='Neutral',rocky=false){if(spellId==='chronos')return 0;return rockyDefense(rocky,quality).knockback*knockback(quality)*(spellId==='wave'?1.7:spellId==='bolt'?.65:1)*pushBonus*elementalMatchup(SPELLS.find(s=>s.id===spellId)!.element,target).knockback;}
export function eliteRush(e:Enemy){if(e.kind!=='goblin')return 'none';const cycle=e.clock%10;return cycle>=6&&cycle<7?'warning':cycle>=7&&cycle<9?'rush':'none';}
export function chronosEffect(quality:number){
 if(!Number.isFinite(quality)||quality<48)return{kind:'slow' as const,duration:0};
 const q=Math.min(100,quality),[lo,hi,min,max]=q<60?[48,59,.5,1]:q<70?[60,69,1.1,2.4]:q<80?[70,79,2.4,3.6]:[80,100,3.7,7];
 return{kind:q<70?'slow' as const:'stun' as const,duration:Math.round((min+(max-min)*(q-lo)/(hi-lo))*1000)/1000};
}
export function hitWithSpell(state:Battle,quality:number,spellId:SpellId='water',targetId?:number,random:()=>number=Math.random):Battle{
 if(state.phase!=='active')return state;
 if(spellId==='chronos'){
  const effect=chronosEffect(quality);if(!effect.duration)return state;
  const live=new Set(presentEnemies(state).map(e=>e.id));if(!live.size)return state;
  const enemies=state.enemies.map(e=>!live.has(e.id)||rockyDefense(e.rocky,quality).immuneEffects?e:effect.kind==='slow'?{...e,slowUntil:Math.max(e.slowUntil,state.time+effect.duration)}:{...e,stunUntil:Math.max(e.stunUntil,state.time+effect.duration),attackAt:null});
  return{...state,enemies,casts:state.casts+1};
 }
 const target=presentEnemies(state).find(e=>e.id===targetId)??nearestEnemy(state);if(!target)return state;
 const q=Math.max(0,Math.min(100,quality)),element=SPELLS.find(s=>s.id===spellId)!.element;
 const immuneEffects=elementalMatchup(element,target.element).immuneEffects||rockyDefense(target.rocky,q).immuneEffects;
 const steady=q>=60,moon=steady&&element==='Water'&&state.amulets.moon,twilight=steady&&element==='Nature'&&state.amulets.twilight;
 const rooted=twilight&&!immuneEffects&&target.element!=='Nature'&&random()<.5;
 const enemies=state.enemies.map(e=>{
  if(e.id!==target.id)return e;
  const rockyFaint=e.rocky&&q<60;
  const damage=spellDamage(e,q,spellId,state.damageBonus*(moon||twilight?1.15:1),state.upgrades[spellId]??0);
  // Sun adds 30% of the resisted direct hit over three seconds, alongside Flare Bolt's burn.
  const burnTick=(spellId==='bolt'&&!immuneEffects?burnDamage(q,e.element,e.rocky):0)+(steady&&element==='Fire'&&state.amulets.sun&&e.element!=='Fire'?Math.round(damage*.3)/3:0);
  return{...e,hp:Math.max(0,e.hp-damage),push:rockyFaint?e.push:{from:e.x,to:Math.min(ENEMY_BACK_X,e.x+spellKnockback(q,spellId,state.pushBonus*(moon?1.15:1),e.element,e.rocky)),started:state.time,ends:state.time+PUSH_DURATION},attackAt:rockyFaint?e.attackAt:null,hurtUntil:state.time+.25,slowUntil:spellId==='leaf'&&!immuneEffects?state.time+4:e.slowUntil,rootUntil:rooted?state.time+1.5:e.rootUntil,burn:burnTick>0?{damage:Math.max(e.burn?.damage??0,burnTick),nextTick:state.time+1,ticks:3}:e.burn};
 });
 return{...state,enemies,casts:state.casts+1,phase:enemies.every(e=>e.hp===0)?'victory':'active'};
}
export function launchSpell(state:Battle,quality:number,color:string,spellId:SpellId='water'):Battle{const target=nearestEnemy(state);if(state.phase!=='active'||state.projectile||!target)return state;return{...state,projectile:{started:state.time,duration:.32,quality,color,spellId,targetId:target.id}};}
export function projectilePosition(state:Battle){const p=state.projectile;if(!p)return null;const target=presentEnemies(state).find(e=>e.id===p.targetId)??nearestEnemy(state);if(!target)return null;const t=Math.min(1,Math.max(0,(state.time-p.started)/p.duration));return{x:300+(target.x-300)*t,y:420+(enemyY(target.id)-15-420)*t};}
export function enemyY(id:number){return 420+(id-1)*29;}
export function burnDamage(quality:number,element:Enemy['element'],rocky=false){const match=elementalMatchup('Fire',element);return match.immuneEffects||rockyDefense(rocky,quality).immuneEffects?0:Math.round(power(quality)*.25*(advantage('Fire',element)?1.5:1)*rockyDefense(rocky,quality).damage);}
export function potionPosition(flight:PotionFlight,time:number){const t=Math.max(0,Math.min(1,(time-flight.started)/POTION_FLIGHT_SECONDS));return{x:160+(flight.toX-160)*t,y:383+(flight.toY-383)*t-440*t*(1-t),rotation:-30+330*t,progress:t};}
export function stepBattle(state:Battle,delta:number):Battle{
 if(state.phase!=='active'||!Number.isFinite(delta)||delta<=0)return state;
 const dt=Math.min(delta,.1),time=state.time+dt;
 let next={...state,time};
 next.potionFlights=state.potionFlights.map(f=>{if(!f.applied&&time-f.started>=POTION_FLIGHT_SECONDS){if(f.potion==='heal')next.playerHP=Math.min(100,next.playerHP+30);if(f.potion==='freeze')next.freezeUntil=time+FREEZE_SECONDS;if(f.potion==='ink')next.unlimitedUntil=time+UNLIMITED_INK_SECONDS;return{...f,applied:true};}return f;}).filter(f=>time-f.started<POTION_FLIGHT_SECONDS+POTION_BREAK_SECONDS);
 const frozen=state.time<next.freezeUntil;
 const groupSpeed=presentEnemies(next).length>=2?.8:1;
 next.enemies=state.enemies.map(old=>{
  if(old.hp<=0||old.spawnAt>time+1e-9)return old;
  // Only advance the portion of this frame after the opening pause / arrival.
  const actionDelta=Math.max(0,time-Math.max(state.time,state.approachAt,old.spawnAt,old.rootUntil,old.stunUntil));
  const e={...old,clock:old.clock+(frozen?0:actionDelta)};
  if(e.burn){let burn={...e.burn};while(burn.ticks>0&&time+1e-9>=burn.nextTick){e.hp=Math.max(0,e.hp-(Math.round(burn.damage*burn.ticks)-Math.round(burn.damage*(burn.ticks-1))));e.hurtUntil=time+.15;burn.ticks--;burn.nextTick+=1;}e.burn=burn.ticks>0&&e.hp>0?burn:null;if(e.hp===0){e.push=null;e.attackAt=null;return e;}}
  if(e.push){const p=e.push,t=Math.min(1,(time-p.started)/(p.ends-p.started));e.x=p.from+(p.to-p.from)*(1-(1-t)**3);e.attackAt=null;if(t>=1)e.push=null;return e;}
  if(frozen||actionDelta<=1e-9)return e;
  const rush=eliteRush(e);const speed=e.kind==='goblin'?(rush==='warning'?0:rush==='rush'?52:22):SLIME_SPEED*(e.rocky?.9:1);
  e.x=Math.max(CONTACT_X,e.x-speed*groupSpeed*state.difficulty*(state.time<e.slowUntil?.45:1)*actionDelta);
  if(e.x>CONTACT_X)e.attackAt=null;
  else if(e.attackAt===null){if(e.clock>=e.nextAttackAt)e.attackAt=e.clock+(e.kind==='goblin'?.65:ATTACK_WINDUP);}
  else if(e.clock>=e.attackAt){next.playerHP=Math.max(0,next.playerHP-Math.round((e.kind==='goblin'?18:CONTACT_DAMAGE)*state.difficulty));next.playerHurtUntil=time+.25;next.playerHits++;e.push={from:e.x,to:Math.min(ENEMY_BACK_X,e.x+PLAYER_HIT_PUSH+(next.playerHits===1?state.firstHitPush:0)),started:time,ends:time+PUSH_DURATION};e.attackAt=null;e.nextAttackAt=e.clock+(e.kind==='goblin'?2:ATTACK_COOLDOWN);}
  return e;
 });
 if(next.enemies.every(e=>e.hp===0)){next.phase='victory';next.projectile=null;return next;}
 if(next.playerHP===0){next.phase='defeat';next.projectile=null;return next;}
 if(next.projectile&&time-next.projectile.started>=next.projectile.duration){const p=next.projectile;next.projectile=null;next=hitWithSpell(next,p.quality,p.spellId,p.targetId);}
 return next;
}
export function drinkPotion(state:Battle,potion:Potion):Battle{
 if(state.phase!=='active'||state.potions[potion]<=0)return state;
 const live=presentEnemies(state),toX=potion==='freeze'?(live.length?live.reduce((n,e)=>n+e.x,0)/live.length:ENEMY_BACK_X):245,toY=potion==='freeze'?435:395;
 return{...state,potions:{...state.potions,[potion]:state.potions[potion]-1},potionSerial:state.potionSerial+1,potionFlights:[...state.potionFlights,{id:state.potionSerial+1,potion,started:state.time,toX,toY,applied:false}]};
}

// Impact begins the bottle's breaking animation; each flight reports once.
export function potionImpactIds(previous:Battle,next:Battle){
 if(previous===next||next.phase!=='active')return[];
 return next.potionFlights.filter(f=>f.applied&&previous.potionFlights.some(old=>old.id===f.id&&!old.applied)).map(f=>f.id);
}
