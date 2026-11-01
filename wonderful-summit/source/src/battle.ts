import {bogEffect,extendBog,type Bog} from './bog.ts';
import {extendFirestorm,firestormBaseDamage,FIRESTORM_TICK_SECONDS,type Firestorm} from './firestorm.ts';
import type {PlayerDrawing} from './drawings.ts';
import {spellPower,power,knockback,SPELLS,isUpgradableSpell,type SpellId,type Element} from './magic.ts';
import {woodenShield,shieldProtection,igniteShield,updateShield,type EnemyShield} from './shields.ts';
export const PLAYER_MAX_HP=100,SLIME_MAX_HP=100;
export const CONTACT_X=325,SLIME_START_X=580,SLIME_SPEED=18;
export const CONTACT_DAMAGE=12,ATTACK_COOLDOWN=1.5,ATTACK_WINDUP=.45,PUSH_DURATION=.28;
export const ENEMY_BACK_X=640;
export const ENEMY_RUNWAY_SIZE=ENEMY_BACK_X-CONTACT_X;
export const PLAYER_HIT_PUSH=ENEMY_RUNWAY_SIZE/3;
export const ENEMY_APPROACH_DELAY=5;
export type BattlePhase='ready'|'active'|'victory'|'defeat';
export type Encounter='slime'|'pack'|'elite'|'rock'|'shieldPack'|'mother'|'upperMeadow';
export type Potion='theodoraHeal'|'heal'|'freeze'|'ink'|'rejection'|'spellBottle'|'fury'|'stellar';
export type PotionCounts=Record<'heal'|'freeze'|'ink',number>&Partial<Record<'theodoraHeal'|'rejection'|'spellBottle'|'fury'|'stellar',number>>;
export type BottledSpell={drawing?:PlayerDrawing;inkUsed?:number;spellId:SpellId|null;quality:number};
export const POTION_IDS:Potion[]=['theodoraHeal','heal','freeze','ink','rejection','spellBottle','fury','stellar'];
export const COMMON_POTIONS:Potion[]=['heal','freeze','ink','stellar'];
export const RARE_POTIONS:Potion[]=['spellBottle','rejection','fury'];
export const SHOP_POTIONS:Potion[]=[...COMMON_POTIONS,...RARE_POTIONS];
export function potionPrice(potion:Potion){return RARE_POTIONS.includes(potion)?36:18;}
export function rollRewardPotion(random:()=>number=Math.random):Potion{const pool=random()<.7?COMMON_POTIONS:RARE_POTIONS;return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];}
export function enemyElementColor(element:Enemy['element']){return element==='Fire'?'#ef9c70':element==='Water'?'#7ccbd6':element==='Nature'?'#99bf76':'#45474c';}
export const ENCOUNTERS:Record<Encounter,string>={slime:'Meadow slime',pack:'Elemental pack',elite:'Elite goblin',rock:'Rock slime',shieldPack:'Woodland barricade',mother:'Slime Mother',upperMeadow:'The upper meadow'};
export const FREEZE_SECONDS=6,UNLIMITED_INK_SECONDS=15;
export const POTIONS:Record<Potion,{name:string;icon:string;detail:string}>={stellar:{name:'Stellar',icon:'✦',detail:'Your next cast gains 10% spell quality. Does not stack with other stellar potions.'},theodoraHeal:{name:"Theodora’s healing",icon:'💗',detail:'Restore 35 health. A homemade gift from Theodora.'},heal:{name:'Healing',icon:'♥',detail:'Restore 30 health'},freeze:{name:'Freeze',icon:'❄',detail:`Freeze all enemies for ${FREEZE_SECONDS} seconds`},ink:{name:'Endless ink',icon:'◒',detail:`Gain ${UNLIMITED_INK_SECONDS} seconds of unlimited ink and refill ink to 100%`},rejection:{name:'Rejection',icon:'✧',detail:'Imbue your skin with a powerful repelling magic for 15 seconds. During this time, attackers get sent soaring on contact and deal reduced damage.'},spellBottle:{name:'Spell in a bottle',icon:'✎',detail:'Cast a spell into this bottle to store its power until needed.'},fury:{name:'Fury',icon:'♨',detail:'Your next spell deals twice as much damage. Make it count.'}};
export const POTION_FLIGHT_SECONDS=.65,POTION_BREAK_SECONDS=.35;
export type PotionFlight={spell?:BottledSpell;id:number;potion:Potion;started:number;toX:number;toY:number;applied:boolean};
export type Burn={damage:number;nextTick:number;ticks:number};
export type Push={from:number;to:number;started:number;ends:number};
export type Enemy={offspring:boolean;curseTick:number|null;id:number;rocky:boolean;shield:EnemyShield|null;chronosStartedAt:number;stunStartedAt:number;kind:'slime'|'goblin'|'mother';initialElement:Element|'Neutral';readyAt:number;spawnAt:number;element:Element|'Neutral';hp:number;maxHP:number;x:number;clock:number;attackAt:number|null;nextAttackAt:number;hurtUntil:number;push:Push|null;leafSlows:{until:number;amount:number}[];slowUntil:number;rootUntil:number;chronosSlowUntil:number;stunUntil:number;burn:Burn|null};
export type Projectile={knockbackMultiplier?:number;inkUsed:number;damageMultiplier:number;started:number;duration:number;quality:number;color:string;spellId:SpellId;targetId:number};
export type TidalWave={id:number;started:number;duration:number;quality:number;damageMultiplier:number;inkUsed:number;hitIds:number[];bonuses:{damageBonus:number;pushBonus:number;upgrade:number;midnightStone:boolean;moon:boolean}};
export const TIDAL_TRAVEL_SECONDS=.9,TIDAL_START_X=300;
export type Battle={stale:{spellId:SpellId|null;count:number};cooldowns:Partial<Record<SpellId,number>>;stellarReady:boolean;robes:{enabled:boolean;artisan:boolean;spells:SpellId[]};sphereShatteredAt:number|null;castingRelics:{sphere:boolean;calculus:boolean;stardust:boolean;clover:boolean;stardustUsed:boolean;steadyCasts:number};bog:Bog|null;tidalWaves:TidalWave[];tidalSerial:number;firestorm:Firestorm|null;bestDrawing:PlayerDrawing|null;worstDrawing:PlayerDrawing|null;lotus:boolean;lotusReady:boolean;colorful:boolean;lastElement:Element|null;shaleActive:boolean;shaleContacts:number;offspringOrder:Element[];phase:BattlePhase;encounter:Encounter;time:number;approachAt:number;playerHP:number;enemies:Enemy[];playerHurtUntil:number;playerHits:number;casts:number;projectile:Projectile|null;potions:PotionCounts;bottledSpells:BottledSpell[];rejectionUntil:number;furyReady:boolean;freezeUntil:number;unlimitedUntil:number;potionFlights:PotionFlight[];potionSerial:number;upgrades:Partial<Record<SpellId,number>>;midnightStone:boolean;damageBonus:number;pushBonus:number;firstHitPush:number;difficulty:number;motherSplit:{at:number;x:number;element:Enemy['element'];spawned:boolean}|null;chronosFields:{quality:number;kind:'slow'|'stun';started:number;until:number}[];chronosPulse:{started:number;strong:boolean}|null;amulets:{sun:boolean;moon:boolean;twilight:boolean}};
function enemy(id:number,element:Enemy['element'],x:number,kind:Enemy['kind']='slime',rocky=false):Enemy{return{id,offspring:false,curseTick:null,kind,initialElement:element,readyAt:0,rocky,shield:null,chronosStartedAt:0,stunStartedAt:0,spawnAt:0,element,hp:rocky?150:kind==='goblin'?200:kind==='mother'?300:SLIME_MAX_HP,maxHP:rocky?150:kind==='goblin'?200:kind==='mother'?300:SLIME_MAX_HP,x,clock:0,attackAt:null,nextAttackAt:0,hurtUntil:0,push:null,leafSlows:[],slowUntil:0,rootUntil:0,chronosSlowUntil:0,stunUntil:0,burn:null};}
const ELEMENTS:Element[]=['Fire','Water','Nature'];
export function newBattle(phase:BattlePhase='ready',encounter:Encounter='slime',random:()=>number=Math.random):Battle{
 const first=ELEMENTS[Math.min(2,Math.floor(random()*3))];
 const remaining=ELEMENTS.filter(e=>e!==first);
 const second=encounter==='pack'?remaining[Math.min(1,Math.floor(random()*2))]:(encounter==='shieldPack'||encounter==='upperMeadow')?ELEMENTS[Math.min(2,Math.floor(random()*3))]:first;
 const offspringOrder=[...ELEMENTS];if(encounter==='mother')for(let i=2;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[offspringOrder[i],offspringOrder[j]]=[offspringOrder[j],offspringOrder[i]];}
 return{stale:{spellId:null,count:0},cooldowns:{},stellarReady:false,robes:{enabled:false,artisan:false,spells:[]},sphereShatteredAt:null,castingRelics:{sphere:false,calculus:false,stardust:false,clover:false,stardustUsed:false,steadyCasts:0},bog:null,tidalWaves:[],tidalSerial:0,firestorm:null,bestDrawing:null,worstDrawing:null,lotus:false,lotusReady:false,colorful:false,lastElement:null,shaleActive:false,shaleContacts:0,offspringOrder,phase,encounter,time:0,approachAt:ENEMY_APPROACH_DELAY,playerHP:PLAYER_MAX_HP,enemies:encounter==='upperMeadow'?[enemy(1,first,580),{...enemy(2,second,ENEMY_BACK_X),shield:woodenShield(),spawnAt:7}]:encounter==='mother'?[enemy(1,first,580,'mother')]:encounter==='shieldPack'?[{...enemy(1,first,580),shield:woodenShield()},{...enemy(2,second,ENEMY_BACK_X),shield:woodenShield()},{...enemy(3,'Neutral',ENEMY_BACK_X,'slime',true),spawnAt:13.5}]:encounter==='pack'?[enemy(1,first,580),enemy(2,second,ENEMY_BACK_X)]:encounter==='elite'?[enemy(1,'Neutral',580,'goblin')]:encounter==='rock'?[enemy(1,'Neutral',SLIME_START_X,'slime',true)]:[enemy(1,first,SLIME_START_X)],playerHurtUntil:0,playerHits:0,casts:0,projectile:null,potions:{heal:1,freeze:1,ink:1},bottledSpells:[],rejectionUntil:0,furyReady:false,freezeUntil:0,unlimitedUntil:0,potionFlights:[],potionSerial:0,upgrades:{},midnightStone:false,damageBonus:1,pushBonus:1,firstHitPush:0,difficulty:1,motherSplit:null,chronosFields:[],chronosPulse:null,amulets:{sun:false,moon:false,twilight:false}};
}
export function presentEnemies(state:Battle){return state.enemies.filter(e=>e.hp>0&&e.spawnAt<=state.time+1e-9);}
export function nearestEnemy(state:Battle){return presentEnemies(state).sort((a,b)=>a.x-b.x||a.id-b.id)[0];}
export function targetedEnemy(state:Battle){return presentEnemies(state).find(e=>e.id===state.projectile?.targetId)??nearestEnemy(state);}
export function advantage(element:Enemy['element'],target:Enemy['element']){return(element==='Water'&&target==='Fire')||(element==='Fire'&&target==='Nature')||(element==='Nature'&&target==='Water');}
export function elementalMatchup(element:Element,target:Enemy['element']){
 if(element==='Ancient'||target==='Neutral')return{damage:1,knockback:1,immuneEffects:false};
 if(element===target)return{damage:.5,knockback:.7,immuneEffects:true};
 if(advantage(target,element))return{damage:.75,knockback:.85,immuneEffects:false};
 return{damage:1.5,knockback:1,immuneEffects:false};
}
export function rockyDefense(rocky:boolean,quality:number){return !rocky||quality>=70?{damage:1,knockback:1,immuneEffects:false}:quality>=60?{damage:.75,knockback:.75,immuneEffects:false}:{damage:.5,knockback:0,immuneEffects:true};}
export function spellDamage(target:Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'|'shield'>>,quality:number,spellId:SpellId,damageBonus=1,upgrade=0,time=0){if(spellId==='bog'||spellId==='chronos'||spellId==='firestorm')return 0;const spell=SPELLS.find(s=>s.id===spellId)!;const factor=spellId==='bolt'?1.3:spellId==='tidalcrest'?1.1:spellId==='wave'?.9:spellId==='leaf'?.75:1;return Math.round((spellId==='ender'?(Number.isFinite(quality)&&quality>=48?1000:0):spellPower(spellId,quality)*factor)*damageBonus*(1+(isUpgradableSpell(spellId)?Math.max(0,Math.min(1,upgrade)):0)*.25)*elementalMatchup(spell.element,target.element).damage*rockyDefense(!!target.rocky,quality).damage*shieldProtection(target.shield,time));}
export function spellKnockback(quality:number,spellId:SpellId,pushBonus=1,target:Enemy['element']='Neutral',rocky=false,shield:EnemyShield|null=null,time=0){if(spellId==='bog'||spellId==='chronos'||spellId==='ender'||spellId==='firestorm')return 0;const base=spellId==='wave'&&quality>=48&&quality<60?40+14*(quality-48)/11:knockback(quality)*(spellId==='wave'?1.7:spellId==='tidalcrest'?1.5:spellId==='bolt'?.65:1);return shieldProtection(shield,time)*rockyDefense(rocky,quality).knockback*base*pushBonus*elementalMatchup(SPELLS.find(s=>s.id===spellId)!.element,target).knockback;}
// Rain retains fractional damage so small elemental/rock/shield reductions remain meaningful.
export function firestormTickDamage(target:Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'|'shield'>>,quality:number,damageBonus=1,upgrade=0,multiplier=1,time=0){
 if(!Number.isFinite(quality)||quality<48)return 0;
 return Math.round(firestormBaseDamage(upgrade)*damageBonus*multiplier*elementalMatchup('Fire',target.element).damage*rockyDefense(!!target.rocky,quality).damage*shieldProtection(target.shield,time)*1000000)/1000000;
}
export function bogSlow(state:Battle,e:Enemy,time:number){
 const bog=state.bog;if(!bog||time<bog.arrives||time>=bog.portions.at(-1)!.until)return 0;
 const portion=bog.portions.find(p=>p.until>time);if(!portion||elementalMatchup('Nature',e.element).immuneEffects||rockyDefense(e.rocky,portion.quality).immuneEffects)return 0;
 return bogEffect(portion.quality,portion.upgrade).slow;
}
export function bogTickDamage(e:Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'|'shield'>>,q:number,upgrade=0,bonus=1,multiplier=1,midnight=0,time=0,twilight=false){
 return Math.round(bogEffect(q,upgrade).damage*bonus*multiplier*(1+midnight)*(twilight&&q>=60?1.15:1)*elementalMatchup('Nature',e.element).damage*rockyDefense(!!e.rocky,q).damage*shieldProtection(e.shield,time)*1e6)/1e6;
}
function bogRain(state:Battle,time:number):Battle{
 const bog=state.bog;if(!bog)return state;
 let nextTick=bog.nextTick,enemies=state.enemies;
 const portions=bog.portions.map(p=>({...p,hitIds:[...p.hitIds]})),end=portions.at(-1)!.until;
 while(nextTick<=Math.min(time,end)+1e-9){
  const portion=portions.find(p=>p.until+1e-9>=nextTick)!,tick=nextTick;
  enemies=enemies.map(old=>{
   if(old.hp<=0||old.spawnAt>tick+1e-9)return old;
   const e=old.kind==='mother'?{...old,element:ELEMENTS[(ELEMENTS.indexOf(old.initialElement as Element)+Math.floor((tick+1e-9)/15))%3]}:old;
   const first=!portion.hitIds.includes(e.id);if(first)portion.hitIds.push(e.id);
   const immune=elementalMatchup('Nature',e.element).immuneEffects||rockyDefense(e.rocky,portion.quality).immuneEffects;
   const root=first&&portion.twilight&&portion.quality>=60&&!immune&&Math.random()<.5;
   const damage=bogTickDamage(e,portion.quality,portion.upgrade,portion.damageBonus,portion.multiplier,portion.midnight,tick,portion.twilight);
   const hp=Math.max(0,Math.round((e.hp-damage)*1e6)/1e6);
   return{...e,hp,hurtUntil:time+.15,rootUntil:root?Math.max(e.rootUntil,tick+1.5):e.rootUntil,push:hp===0?null:e.push,attackAt:hp===0||root?null:e.attackAt};
  });
  nextTick+=.5;
 }
 return{...state,enemies,bog:time+1e-9>=end?null:{...bog,nextTick,portions}};
}
function stormRain(state:Battle,time:number):Battle{
 const storm=state.firestorm;if(!storm)return state;
 let nextTick=storm.nextTick,enemies=state.enemies;
 const end=storm.portions.at(-1)!.until;
 while(nextTick<=Math.min(time,end)+1e-9){
  const portion=storm.portions.find(p=>p.until+1e-9>=nextTick)!;
  const tick=nextTick;
  enemies=enemies.map(old=>{
   if(old.hp<=0||old.spawnAt>tick+1e-9)return old;
   const e=old.kind==='mother'?{...old,element:ELEMENTS[(ELEMENTS.indexOf(old.initialElement as Element)+Math.floor((tick+1e-9)/15))%3]}:old;
   const oldShield=updateShield(e.shield,tick);
   const damage=firestormTickDamage({...e,shield:oldShield},portion.quality,portion.damageBonus,portion.baseDamage===3?1:0,portion.multiplier,tick);
   const boostedDamage=portion.midnightBonus?Math.floor(damage*(1+portion.midnightBonus)+1e-9):damage;
   const shield=igniteShield(oldShield,'Fire',portion.quality,tick),ignited=shield!==oldShield;
   const hp=Math.max(0,Math.round((e.hp-boostedDamage)*1000000)/1000000);
   return{...e,hp,shield:shield??e.shield,hurtUntil:time+.15,push:hp===0||ignited?null:e.push,attackAt:hp===0||ignited?null:e.attackAt};
  });
  nextTick+=FIRESTORM_TICK_SECONDS;
 }
 return{...state,enemies,firestorm:time+1e-9>=end?null:{...storm,nextTick}};
}
export function eliteRush(e:Enemy){if(e.kind!=='goblin')return 'none';const cycle=e.clock%10;return cycle>=6&&cycle<7?'warning':cycle>=7&&cycle<9?'rush':'none';}
export function chronosEffect(quality:number,upgrade=0){
 if(!Number.isFinite(quality)||quality<48)return{kind:'slow' as const,duration:0};
 const q=Math.min(100,quality),[lo,hi,min,max]=q<60?[48,59,1,2.4]:q<70?[60,69,2.5,5]:q<80?[70,79,5.1,9]:[80,100,9.1,18];
 return{kind:'stun' as const,duration:Math.round((min+(max-min)*(q-lo)/(hi-lo))*(1+.2*Math.max(0,Math.min(1,upgrade)))*1000)/1000};
}
export function brambleEffect(quality:number){
 if(!Number.isFinite(quality)||quality<48)return{duration:0,amount:0};
 const q=Math.min(100,quality),[lo,hi,d0,d1,a0,a1]=q<60?[48,59,3,4,.4,.5]:q<70?[60,69,4.1,5,.51,.6]:q<80?[70,79,5.1,6,.61,.66]:[80,100,6.1,8,.67,.8];
 const t=(q-lo)/(hi-lo);return{duration:Math.round((d0+(d1-d0)*t)*1000)/1000,amount:Math.round((a0+(a1-a0)*t)*1000)/1000};
}
function applyChronos(e:Enemy,field:Battle['chronosFields'][number],time:number):Enemy{
 if(e.hp<=0)return e;
 const started=Math.max(field.started,e.spawnAt);
 return field.kind==='slow'?{...e,chronosStartedAt:Math.max(e.chronosSlowUntil,e.stunUntil)>time?e.chronosStartedAt:started,slowUntil:Math.max(e.slowUntil,field.until),chronosSlowUntil:Math.max(e.chronosSlowUntil,field.until)}:{...e,chronosStartedAt:Math.max(e.chronosSlowUntil,e.stunUntil)>time?e.chronosStartedAt:started,stunStartedAt:e.stunUntil>time?e.stunStartedAt:started,stunUntil:Math.max(e.stunUntil,field.until),attackAt:null};
}
export function midnightBonus(inkUsed:number){
 if(!Number.isFinite(inkUsed)||inkUsed<30)return 0;
 if(inkUsed>54)return .20;
 const thresholds=[[50,.15],[45,.12],[40,.10],[35,.05],[30,.03]];
 return thresholds.find(([ink])=>inkUsed>=ink)![1];
}
export function cloverReady(state:Battle){return state.castingRelics.clover&&state.castingRelics.steadyCasts===6;}
export function cloverAccuracyBonus(state:Battle,raw:number){return cloverReady(state)?7:0;}
export function relicAccuracyBonus(state:Battle,raw=100){return (state.castingRelics.calculus?3:0)+cloverAccuracyBonus(state,raw)+(state.stellarReady?10:0);}
export function effectiveAccuracy(state:Battle,raw:number){return Math.max(0,Math.min(100,raw+relicAccuracyBonus(state,raw)));}
export function robesBonus(state:Battle){return state.robes.enabled?state.robes.spells.length*(state.robes.artisan?4:2):0;}
export function prepareRelicCast(state:Battle,quality:number,id:SpellId,rawQuality=quality):Battle{
 const add=state.robes.enabled&&rawQuality>=80&&!state.robes.spells.includes(id);
 return {...state,stellarReady:false,castingRelics:{...state.castingRelics,steadyCasts:cloverReady(state)||quality<60?0:state.castingRelics.steadyCasts+1},robes:{...state.robes,spells:add?[...state.robes.spells,id]:state.robes.spells}};
}
export function fizzleSpell(state:Battle):Battle{
 if(state.phase!=='active')return state;
 const shatter=state.castingRelics.sphere;
 const burst=shatter||state.castingRelics.stardust&&!state.castingRelics.stardustUsed;
 const damage=shatter?25:10,push=shatter?ENEMY_RUNWAY_SIZE*.75:25;
 const live=new Set(presentEnemies(state).map(e=>e.id));
 const enemies=burst?state.enemies.map(e=>live.has(e.id)?{...e,hp:Math.max(0,e.hp-damage),hurtUntil:state.time+.25,attackAt:null,push:{from:e.x,to:Math.min(ENEMY_BACK_X,e.x+push),started:state.time,ends:state.time+PUSH_DURATION}}:e):state.enemies;
 return resolveMother({...state,enemies,sphereShatteredAt:shatter?state.time:state.sphereShatteredAt,furyReady:false,stellarReady:false,castingRelics:{...state.castingRelics,sphere:false,stardust:state.castingRelics.stardust||shatter,steadyCasts:0,stardustUsed:state.castingRelics.stardustUsed||burst}});
}
export function hitWithSpell(state:Battle,quality:number,spellId:SpellId='water',targetId?:number,random:()=>number=Math.random,damageMultiplier=1,inkUsed=0,bonuses?:TidalWave['bonuses'],knockbackMultiplier=1):Battle{
 if(state.phase!=='active'||(spellId==='bog'||spellId==='ender'||spellId==='firestorm'||spellId==='tidalcrest')&&(!Number.isFinite(quality)||quality<48))return state;
 if(spellId==='bog')return{...state,casts:state.casts+1,bog:extendBog(state.bog,state.time,{quality,upgrade:state.upgrades.bog??0,damageBonus:state.damageBonus,multiplier:damageMultiplier,midnight:state.midnightStone?midnightBonus(inkUsed):0,twilight:state.amulets.twilight})};
 if(spellId==='firestorm')return{...state,casts:state.casts+1,firestorm:extendFirestorm(state.firestorm,state.time,quality,state.upgrades.firestorm??0,state.damageBonus,damageMultiplier,state.midnightStone?midnightBonus(inkUsed):0)};
 if(spellId==='chronos'){
  const effect=chronosEffect(quality,state.upgrades.chronos??0);if(!effect.duration)return state;
  const live=new Set(presentEnemies(state).map(e=>e.id));if(!live.size)return state;
  const field={quality,kind:effect.kind,started:state.time,until:state.time+effect.duration};
  const enemies=state.enemies.map(e=>live.has(e.id)?applyChronos(e,field,state.time):e);
  return resolveMother({...state,enemies,chronosFields:[...(state.chronosFields??[]).filter(f=>f.until>state.time),field],casts:state.casts+1,chronosPulse:{started:state.time,strong:quality>=70}});
 }
 const target=presentEnemies(state).find(e=>e.id===targetId)??nearestEnemy(state);if(!target)return state;
 const q=Math.max(0,Math.min(100,quality)),element=SPELLS.find(s=>s.id===spellId)!.element;
 const immuneEffects=elementalMatchup(element,target.element).immuneEffects||rockyDefense(target.rocky,q).immuneEffects;
 const casting=bonuses??{damageBonus:state.damageBonus,pushBonus:state.pushBonus,upgrade:state.upgrades[spellId]??0,midnightStone:state.midnightStone,moon:state.amulets.moon};
 const steady=q>=60,moon=steady&&element==='Water'&&casting.moon,twilight=steady&&element==='Nature'&&state.amulets.twilight;
 const rooted=twilight&&!immuneEffects&&target.element!=='Nature'&&random()<.5;
 const enemies=state.enemies.map(e=>{
  if(e.id!==target.id)return e;
  const rockyFaint=e.rocky&&q<60;
  const bonus=casting.damageBonus*(moon||twilight?1.15:1),level=casting.upgrade;
  const damage=Math.round(spellDamage(e,q,spellId,bonus,level,state.time)*damageMultiplier*(1+(casting.midnightStone?midnightBonus(inkUsed):0)));
  const shield=igniteShield(updateShield(e.shield,state.time),element,q,state.time),shieldBurning=(shield?.burnUntil??0)>state.time;
  // Sun adds 30% of the resisted direct hit over three seconds, alongside Flare Bolt's burn.
  const burnTick=(spellId==='bolt'&&!immuneEffects?burnDamage(q,e.element,e.rocky)*damageMultiplier:0)+(steady&&element==='Fire'&&state.amulets.sun&&e.element!=='Fire'?Math.round(spellDamage({...e,shield:null},q,spellId,bonus,level,state.time)*.3)*damageMultiplier/3:0);
  return{...e,shield,hp:Math.max(0,e.hp-damage),push:spellId==='ender'?e.push:shieldBurning?null:rockyFaint?e.push:{from:e.x,to:Math.min(ENEMY_BACK_X,e.x+spellKnockback(q,spellId,casting.pushBonus*knockbackMultiplier*(moon?1.15:1),e.element,e.rocky,e.shield,state.time)*(e.kind==='mother'?.8:1)),started:state.time,ends:state.time+PUSH_DURATION},attackAt:spellId==='ender'||!shieldBurning&&rockyFaint?e.attackAt:null,hurtUntil:state.time+.25,leafSlows:spellId==='leaf'&&!immuneEffects?[...e.leafSlows.filter(f=>f.until>state.time),{until:state.time+brambleEffect(q).duration,amount:brambleEffect(q).amount}]:e.leafSlows,slowUntil:spellId==='leaf'&&!immuneEffects?Math.max(e.slowUntil,state.time+brambleEffect(q).duration):e.slowUntil,rootUntil:rooted?state.time+1.5:e.rootUntil,burn:burnTick>0?{damage:Math.max(e.burn?.damage??0,burnTick),nextTick:state.time+1,ticks:3}:e.burn};
 });
 return resolveMother({...state,enemies,casts:state.casts+1});
}
// Resolve direct damage and damage-over-time deaths through the same boss phase.
function resolveMother(state:Battle):Battle{
 let next=state;
 const mother=state.enemies.find(e=>e.kind==='mother');
 if(mother&&mother.hp<=0&&!state.motherSplit){
  next={...state,motherSplit:{at:state.time,x:mother.x,element:mother.element,spawned:false},enemies:state.enemies.map(e=>e.id===mother.id?{...e,attackAt:null,burn:null}:e),projectile:null};
 }
 if(next.motherSplit&&!next.motherSplit.spawned&&mother&&next.motherSplit.x!==mother.x)next={...next,motherSplit:{...next.motherSplit,x:mother.x}};
 const split=next.motherSplit;
 if(split&&!split.spawned&&next.time+1e-9>=split.at+2){
  const spawnAt=split.at+2;
  const children=next.offspringOrder.map((element,i)=>{
   let child={...enemy(i+2,element,Math.max(CONTACT_X,Math.min(ENEMY_BACK_X-72,split.x-36))+i*36),spawnAt,readyAt:spawnAt+4,offspring:true};
   for(const field of next.chronosFields??[])if(field.until>spawnAt)child=applyChronos(child,field,spawnAt);
   return child;
  });
  next={...next,motherSplit:{...split,spawned:true},enemies:[...next.enemies,...children]};
 }
 if(next.enemies.every(e=>e.hp<=0)&&(!next.motherSplit||next.motherSplit.spawned))return{...next,phase:'victory',projectile:null,tidalWaves:[]};
 return next;
}
export const SPELL_COOLDOWNS:Partial<Record<SpellId,number>>={chronos:20};
export function spellCooldownRemaining(state:Battle,id:SpellId){const remaining=(state.cooldowns[id]??0)-state.time;return remaining>1e-9?remaining:0;}
export function staleMultiplier(state:Battle,id:SpellId){return state.stale.spellId===id&&state.stale.count>=3?.75:1;}
export function releaseMultiplier(state:Battle,spellId:SpellId,source:'cast'|'bottle'='cast'){const element=SPELLS.find(s=>s.id===spellId)!.element;return(source==='cast'?staleMultiplier(state,spellId):1)*(state.castingRelics.sphere?1.15:1)*(1+robesBonus(state)/100)*(source==='cast'&&state.furyReady?2:1)*(state.lotus&&state.lotusReady&&spellId!=='chronos'?1.3:1)*(state.colorful&&state.lastElement!==null&&element!==state.lastElement?1.15:1);}
export function releaseSpell(state:Battle,spellId:SpellId,source:'cast'|'bottle'='cast'){return{...state,stale:source==='cast'?{spellId,count:state.stale.spellId===spellId?state.stale.count+1:1}:state.stale,cooldowns:source==='cast'&&SPELL_COOLDOWNS[spellId]?{...state.cooldowns,[spellId]:state.time+SPELL_COOLDOWNS[spellId]!}:state.cooldowns,furyReady:source==='cast'?false:state.furyReady,lotusReady:spellId!=='chronos'?false:state.lotusReady,lastElement:SPELLS.find(s=>s.id===spellId)!.element};}
export function launchSpell(state:Battle,quality:number,color:string,spellId:SpellId='water',inkUsed=0):Battle{const target=nearestEnemy(state);if(state.phase!=='active'||state.projectile||spellCooldownRemaining(state,spellId)>0)return state;if(!target&&!['bog','firestorm','tidalcrest'].includes(spellId))return fizzleSpell(state);if(!Number.isFinite(quality))return fizzleSpell(state);const rawQuality=quality;quality=effectiveAccuracy(state,quality);if(quality<48)return fizzleSpell(state);const knockbackMultiplier=staleMultiplier(state,spellId);state=prepareRelicCast(state,quality,spellId,rawQuality);const released=releaseSpell(state,spellId);if(spellId==='tidalcrest')return beginTidalWave(released,quality,releaseMultiplier(state,spellId),inkUsed,knockbackMultiplier);if(spellId==='bog'||spellId==='firestorm')return hitWithSpell(released,quality,spellId,undefined,Math.random,releaseMultiplier(state,spellId),inkUsed);if(!target)return fizzleSpell(state);return{...released,projectile:{knockbackMultiplier,inkUsed,damageMultiplier:releaseMultiplier(state,spellId),started:state.time,duration:.32,quality,color,spellId,targetId:target.id}};}

export function tidalWavePosition(wave:TidalWave,time:number){return TIDAL_START_X+(ENEMY_BACK_X-TIDAL_START_X)*Math.max(0,Math.min(1,(time-wave.started)/wave.duration));}
function beginTidalWave(state:Battle,quality:number,damageMultiplier=1,inkUsed=0,knockbackMultiplier=1):Battle{
 if(state.phase!=='active'||!Number.isFinite(quality)||quality<48)return state;
 const wave:TidalWave={id:state.tidalSerial+1,started:state.time,duration:TIDAL_TRAVEL_SECONDS,quality,damageMultiplier,inkUsed,hitIds:[],bonuses:{damageBonus:state.damageBonus,pushBonus:state.pushBonus*knockbackMultiplier,upgrade:state.upgrades.tidalcrest??0,midnightStone:state.midnightStone,moon:state.amulets.moon}};
 return{...state,casts:state.casts+1,tidalSerial:wave.id,tidalWaves:[...state.tidalWaves,wave]};
}
// Sweep the moving front against moving foes; hidden arrivals cannot be hit retroactively.
function tidalCrossing(previous:Battle,next:Battle,wave:TidalWave,enemy:Enemy):number|null{
 if(enemy.hp<=0||wave.hitIds.includes(enemy.id))return null;
 const start=Math.max(previous.time,wave.started,enemy.spawnAt),end=Math.min(next.time,wave.started+wave.duration);
 if(start>end+1e-9)return null;
 const old=previous.enemies.find(e=>e.id===enemy.id)??enemy;
 const movementStart=Math.max(previous.time,enemy.spawnAt),span=next.time-movementStart;
 const enemyX=(at:number)=>old.x+(enemy.x-old.x)*(span>0?Math.max(0,Math.min(1,(at-movementStart)/span)):1);
 const a=enemyX(start)-tidalWavePosition(wave,start),b=enemyX(end)-tidalWavePosition(wave,end);
 if(a< -1e-9||b>1e-9)return null;
 const at=start+(end-start)*(a-b>1e-9?Math.max(0,Math.min(1,a/(a-b))):0),x=tidalWavePosition(wave,at);
 return x>=CONTACT_X-1e-9&&x<=ENEMY_BACK_X+1e-9?at:null;
}
function advanceTidalWaves(previous:Battle,state:Battle):Battle{
 if(state.phase!=='active')return state;
 let next=state;const remaining:TidalWave[]=[],casts=state.casts;
 for(const wave of state.tidalWaves){
  const crossings=state.enemies.map(e=>({id:e.id,at:tidalCrossing(previous,state,wave,e)})).filter((c):c is {id:number;at:number}=>c.at!==null).sort((a,b)=>a.at-b.at||a.id-b.id);
  const hitIds=[...wave.hitIds];
  for(const crossing of crossings){
   if(next.phase!=='active')break;
   // An earlier wave or projectile may already have killed this exact target.
   if(!next.enemies.some(e=>e.id===crossing.id&&e.hp>0))continue;
   next=hitWithSpell(next,wave.quality,'tidalcrest',crossing.id,Math.random,wave.damageMultiplier,wave.inkUsed,wave.bonuses);
   next={...next,casts};hitIds.push(crossing.id);
  }
  if(state.time+1e-9<wave.started+wave.duration)remaining.push({...wave,hitIds});
 }
 return{...next,tidalWaves:next.phase==='active'?remaining:[]};
}
export function projectilePosition(state:Battle){const p=state.projectile;if(!p)return null;const target=presentEnemies(state).find(e=>e.id===p.targetId)??nearestEnemy(state);if(!target)return null;const t=Math.min(1,Math.max(0,(state.time-p.started)/p.duration));return{x:300+(target.x-300)*t,y:420+(enemyY(target.id,state.encounter)-15-420)*t};}
export function enemyY(id:number,encounter:Encounter='slime'){return 420+(id-1-(encounter==='mother'&&id>1?1:0))*29;}
export function burnDamage(quality:number,element:Enemy['element'],rocky=false){const match=elementalMatchup('Fire',element);return match.immuneEffects||rockyDefense(rocky,quality).immuneEffects?0:Math.round(power(quality)*.25*(advantage('Fire',element)?1.5:1)*rockyDefense(rocky,quality).damage);}
export function potionPosition(flight:PotionFlight,time:number){const t=Math.max(0,Math.min(1,(time-flight.started)/POTION_FLIGHT_SECONDS));return{x:160+(flight.toX-160)*t,y:383+(flight.toY-383)*t-440*t*(1-t),rotation:-30+330*t,progress:t};}
export function stepBattle(state:Battle,delta:number):Battle{
 if(state.phase!=='active'||!Number.isFinite(delta)||delta<=0)return state;
 const dt=Math.min(delta,.1),time=state.time+dt;
 let next=resolveMother({...state,time});
 if(next.phase==='victory')return next;
 const potionFlights=state.potionFlights.map(f=>{if(!f.applied&&time-f.started>=POTION_FLIGHT_SECONDS){if(f.potion==='heal'||f.potion==='theodoraHeal')next.playerHP=Math.min(100,next.playerHP+(f.potion==='theodoraHeal'?35:30));if(f.potion==='freeze')next.freezeUntil=time+FREEZE_SECONDS;if(f.potion==='ink')next.unlimitedUntil=time+UNLIMITED_INK_SECONDS;if(f.potion==='rejection')next.rejectionUntil=time+15;if(f.potion==='fury')next.furyReady=true;if(f.potion==='stellar')next.stellarReady=true;if(f.potion==='spellBottle'&&f.spell?.spellId){const stellarReady=next.stellarReady;const drawStreak=next.castingRelics.steadyCasts;const bottleQuality=Math.min(100,f.spell.quality+(next.castingRelics.calculus?3:0));next=prepareRelicCast(next,bottleQuality,f.spell.spellId,f.spell.drawing?.quality??f.spell.quality);next={...next,stellarReady,castingRelics:{...next.castingRelics,steadyCasts:drawStreak}};const multiplier=releaseMultiplier(next,f.spell.spellId,'bottle');const released=releaseSpell(next,f.spell.spellId,'bottle');next=f.spell.spellId==='tidalcrest'?beginTidalWave(released,bottleQuality,multiplier,f.spell.inkUsed??0):hitWithSpell(released,bottleQuality,f.spell.spellId,undefined,Math.random,multiplier,f.spell.inkUsed??0);}return{...f,applied:true};}return f;}).filter(f=>time-f.started<POTION_FLIGHT_SECONDS+POTION_BREAK_SECONDS);
 next.potionFlights=potionFlights;
 next=resolveMother(bogRain(stormRain(next,time),time));if(next.phase==='victory')return next;
 const frozen=state.time<next.freezeUntil;
 const groupSpeed=presentEnemies(next).length>=2?.8:1;
 next.chronosFields=(next.chronosFields??[]).filter(f=>f.until>time);
 next.enemies=next.enemies.map(original=>{
  let old=original;
  if(old.spawnAt>state.time&&old.spawnAt<=time+1e-9)for(const field of state.chronosFields??[])if(field.until>old.spawnAt)old=applyChronos(old,field,old.spawnAt);
  if(old.hp<=0){if(old.kind==='mother'&&old.push){const p=old.push,t=Math.max(0,Math.min(1,(time-p.started)/(p.ends-p.started)));return {...old,x:p.from+(p.to-p.from)*(1-(1-t)**3),push:t>=1?null:p};}return old;}
  if(old.spawnAt>time+1e-9)return old;
  if(old.kind==='mother'){const index=ELEMENTS.indexOf(old.initialElement as Element);old={...old,element:ELEMENTS[(index+Math.floor((time+1e-9)/15))%3]};}
  // Only advance the portion of this frame after the opening pause / arrival.
  const actionDelta=Math.max(0,time-Math.max(state.time,state.approachAt,old.spawnAt,old.readyAt,old.rootUntil,old.stunUntil,old.shield?.burnUntil??0));
  const e={...old,leafSlows:old.leafSlows.filter(f=>f.until>time),shield:updateShield(old.shield,time),clock:old.clock+(frozen?0:actionDelta)};
  if(e.curseTick!==null){while(e.curseTick<=time+1e-9&&e.hp>0){e.hp=Math.max(0,e.hp-5);e.hurtUntil=time+.15;e.curseTick+=1;}if(e.hp<=0){e.push=null;e.attackAt=null;return e;}}
  if(e.burn){let burn={...e.burn};while(burn.ticks>0&&time+1e-9>=burn.nextTick){e.hp=Math.max(0,e.hp-Math.round((Math.round(burn.damage*burn.ticks)-Math.round(burn.damage*(burn.ticks-1)))*shieldProtection(old.shield,burn.nextTick)));e.hurtUntil=time+.15;burn.ticks--;burn.nextTick+=1;}e.burn=burn.ticks>0&&e.hp>0?burn:null;if(e.hp===0){e.push=null;e.attackAt=null;return e;}}
  if(e.push){const p=e.push,t=Math.min(1,(time-p.started)/(p.ends-p.started));e.x=p.from+(p.to-p.from)*(1-(1-t)**3);e.attackAt=null;if(t>=1)e.push=null;return e;}
  if(frozen||actionDelta<=1e-9)return e;
  const rush=eliteRush(e);const speed=e.kind==='goblin'?(rush==='warning'?0:rush==='rush'?52:22):SLIME_SPEED*(e.rocky?.9:1);
  e.x=Math.max(CONTACT_X,e.x-speed*groupSpeed*state.difficulty*(1-Math.max(bogSlow(next,e,state.time),state.time<e.chronosSlowUntil?.55:0,...old.leafSlows.filter(f=>f.until>state.time).map(f=>f.amount),state.time<e.slowUntil&&old.leafSlows.length===0?.55:0))*actionDelta);
  if(e.x>CONTACT_X)e.attackAt=null;
  else if(e.attackAt===null){if(e.clock>=e.nextAttackAt)e.attackAt=e.clock+(e.kind==='goblin'?.65:ATTACK_WINDUP);}
  else if(e.clock>=e.attackAt){next.playerHP=Math.max(0,next.playerHP-Math.round((e.kind==='mother'?20:e.offspring?12:(e.kind==='goblin'?18:CONTACT_DAMAGE)*state.difficulty)*(next.rejectionUntil>time?.5:1)));next.playerHurtUntil=time+.25;next.playerHits++;if(next.shaleActive&&next.shaleContacts<3){e.curseTick=e.curseTick??time+1;next.shaleContacts++;if(next.shaleContacts===3){next.shaleActive=false;next.playerHP=Math.min(100,next.playerHP+15);}}e.push={from:e.x,to:Math.min(ENEMY_BACK_X,e.x+(PLAYER_HIT_PUSH+(next.playerHits===1?state.firstHitPush:0)+(next.rejectionUntil>time?100:0))*state.pushBonus*shieldProtection(e.shield,time)),started:time,ends:time+PUSH_DURATION};e.attackAt=null;e.nextAttackAt=e.clock+(e.kind==='goblin'?2:ATTACK_COOLDOWN);}
  return e;
 });
 next=resolveMother(next);
 if(next.phase==='victory')return next;
 if(next.playerHP===0){next.phase='defeat';next.projectile=null;next.tidalWaves=[];return next;}
 if(next.projectile&&time-next.projectile.started>=next.projectile.duration){const p=next.projectile;next.projectile=null;next=hitWithSpell(next,p.quality,p.spellId,p.targetId,Math.random,p.damageMultiplier??1,p.inkUsed??0,undefined,p.knockbackMultiplier??1);}
 return advanceTidalWaves(state,next);
}
export function drinkPotion(state:Battle,potion:Potion,bottleIndex=0):Battle{
 if(state.phase!=='active'||(state.potions[potion]??0)<=0)return state;
 if(potion==='stellar'&&(state.stellarReady||state.potionFlights.some(f=>f.potion==='stellar'&&!f.applied)))return state;
 const spell=potion==='spellBottle'?state.bottledSpells[bottleIndex]:undefined;if(potion==='spellBottle'&&!spell)return state;
 const live=presentEnemies(state),toX=(potion==='freeze'||potion==='spellBottle')?(live.length?live.reduce((n,e)=>n+e.x,0)/live.length:ENEMY_BACK_X):245,toY=(potion==='freeze'||potion==='spellBottle')?435:395;
 return{...state,bottledSpells:potion==='spellBottle'?state.bottledSpells.filter((_,i)=>i!==bottleIndex):state.bottledSpells,potions:{...state.potions,[potion]:(state.potions[potion]??0)-1},potionSerial:state.potionSerial+1,potionFlights:[...state.potionFlights,{id:state.potionSerial+1,potion,spell,started:state.time,toX,toY,applied:false}]};
}

// Impact begins the bottle's breaking animation; each flight reports once.
export function potionImpactIds(previous:Battle,next:Battle){
 if(previous===next||(next.phase!=='active'&&next.phase!=='victory'))return[];
 return next.potionFlights.filter(f=>f.applied&&previous.potionFlights.some(old=>old.id===f.id&&!old.applied)).map(f=>f.id);
}

