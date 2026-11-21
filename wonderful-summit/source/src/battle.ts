import {CONTACT_X,ENEMY_BACK_X,COMBAT_LANE_Y,FILA_FOOT_Y,combatLane,enemyFootOffset,laneContactReach,placeLaneArrivals,spaceLaneEnemies,type CombatLane} from './combatLanes.ts';
import {
 GUARDIAN_SHOT_FLIGHT_SECONDS,GUARDIAN_CONTACT_DISTANCE,GUARDIAN_COOLDOWN,
 GUARDIAN_DAMAGE_TAKEN,GUARDIAN_ENEMY_COOLDOWN,GUARDIAN_MAX_CONTACT_REACH,
 GUARDIAN_MAX_DISTANCE,GUARDIAN_SPEED,GUARDIAN_SPELLS,SHROOMY_MAX_STACKS,SHROOMY_SPORE_TICKS,shroomySporePower,shroomySporeSlow,type ShroomySpore,guardianAttackInterval,guardianAttackRange,guardianBoostMultiplier,guardianKnockback,guardianStats,isGuardianSpell,type Guardian,type GuardianSpell,
} from './guardian.ts';
import {constellationBonus,type Constellation} from './constellation.ts';
import {playerMaxHealth} from './playerHealth.ts';
import {balanceQuality,MIN_CAST_QUALITY} from './quality.ts';
import {torrentDuration,torrentContains,torrentDropSpot,TORRENT_INTERVAL,TORRENT_SPLASH_SECONDS,type Torrent} from './torrent.ts';
import {GOBLIN_KING_DIALOGUE_MS,kingHasCrown,kingSpellMultiplier,type KingState} from './goblinKing.ts';
import {damageUpgradeBonus} from './magic.ts';
import {isNearSpell,nearDamage,nearKnockback,thistleStats,THISTLE_SLOW,type NearSpell} from './nearSpells.ts';
import {ERUPTION_KNOCKBACK,ERUPTION_WARNING_SECONDS,eruptionStunSeconds,MAGMA_SLOW,MAGMA_TICK_SECONDS,magmaContains,magmaSize,type EruptionWarning,type Magma} from './eruption.ts';
import {bogEffect,extendBog,type Bog} from './bog.ts';
import {extendFirestorm,firestormBaseDamage,FIRESTORM_TICK_SECONDS,type Firestorm} from './firestorm.ts';
import type {PlayerDrawing} from './drawings.ts';
import {spellPower,power,knockback,SPELLS,isUpgradableSpell,type SpellId,type Element} from './magic.ts';
import {woodenShield,shieldProtection,igniteShield,updateShield,type EnemyShield} from './shields.ts';
export const PLAYER_MAX_HP=100,SLIME_MAX_HP=100;
export {CONTACT_X,ENEMY_BACK_X} from './combatLanes.ts';
export const SLIME_START_X=580,SLIME_SPEED=18;
export const CONTACT_DAMAGE=12,ATTACK_COOLDOWN=1.5,ATTACK_WINDUP=.45,PUSH_DURATION=.28;
export const MOTHER_SPLIT_SECONDS=2;
export const ENEMY_RUNWAY_SIZE=ENEMY_BACK_X-CONTACT_X;
export const PLAYER_HIT_PUSH=ENEMY_RUNWAY_SIZE/3;
export const ENEMY_APPROACH_DELAY=5;
export type BattlePhase='ready'|'active'|'victory'|'defeat';
export type Encounter='slime'|'pack'|'elite'|'rock'|'shieldPack'|'mother'|'upperMeadow'|'rockSpider'|'rockWebNest'|'spiderGoblinElite'|'goblinKing';
export type Potion='theodoraHeal'|'heal'|'freeze'|'ink'|'rejection'|'spellBottle'|'fury'|'stellar'|'miasma';
export type PotionCounts=Record<'heal'|'freeze'|'ink',number>&Partial<Record<'theodoraHeal'|'rejection'|'spellBottle'|'fury'|'stellar'|'miasma',number>>;
export type BottledSpell={drawing?:PlayerDrawing;inkUsed?:number;spellId:SpellId|null;quality:number};
export const POTION_IDS:Potion[]=['theodoraHeal','heal','freeze','ink','rejection','spellBottle','fury','stellar','miasma'];
export const COMMON_POTIONS:Potion[]=['heal','freeze','ink','stellar'];
export const RARE_POTIONS:Potion[]=['spellBottle','rejection','fury','miasma'];
export function potionRarity(potion:Potion):'Keepsake'|'Rare'|'Common'{return potion==='theodoraHeal'?'Keepsake':RARE_POTIONS.includes(potion)?'Rare':'Common';}
export const SHOP_POTIONS:Potion[]=[...COMMON_POTIONS,...RARE_POTIONS];
export function potionPrice(potion:Potion){return RARE_POTIONS.includes(potion)?36:18;}
export function rollRewardPotion(random:()=>number=Math.random):Potion{const pool=random()<.7?COMMON_POTIONS:RARE_POTIONS;return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];}
export function enemyElementColor(element:Enemy['element']){return element==='Fire'?'#ef9c70':element==='Water'?'#7ccbd6':element==='Nature'?'#99bf76':'#45474c';}
export const ENCOUNTERS:Record<Encounter,string>={goblinKing:'Goblin King',slime:'Meadow slime',pack:'Elemental pack',elite:'Elite goblin',rock:'Rock slime',shieldPack:'Woodland barricade',mother:'Slime Mother',rockSpider:'Rock and web',rockWebNest:'Rockweb nest',spiderGoblinElite:'Webbed ambush',upperMeadow:'The upper meadow'};
export const FREEZE_SECONDS=6,UNLIMITED_INK_SECONDS=15;
export const POTIONS:Record<Potion,{name:string;icon:string;detail:string}>={miasma:{name:'Miasma',icon:'☠',detail:'A forgotten evil potion that curses all present enemies for 3 damage per second for 12 seconds. Repeated doses refresh the duration without stacking damage.'},stellar:{name:'Stellar',icon:'✦',detail:'Your next cast gains 10% spell quality. Does not stack with other stellar potions.'},theodoraHeal:{name:"Theodora’s healing",icon:'💗',detail:'Restore 35 health. A homemade gift from Theodora.'},heal:{name:'Healing',icon:'♥',detail:'Restore 30 health'},freeze:{name:'Freeze',icon:'❄',detail:`Freeze all enemies for ${FREEZE_SECONDS} seconds`},ink:{name:'Endless ink',icon:'◒',detail:`Gain ${UNLIMITED_INK_SECONDS} seconds of unlimited ink and refill ink to 100%`},rejection:{name:'Rejection',icon:'✧',detail:'Imbue your skin with a powerful repelling magic for 15 seconds. During this time, attackers get sent soaring on contact and deal reduced damage.'},spellBottle:{name:'Spell in a bottle',icon:'✎',detail:'Cast a spell into this bottle to store its power until needed.'},fury:{name:'Fury',icon:'♨',detail:'Your next spell deals twice as much damage. Make it count.'}};
export const POTION_FLIGHT_SECONDS=.65,POTION_BREAK_SECONDS=.35;
export type PotionFlight={spell?:BottledSpell;id:number;potion:Potion;started:number;toX:number;toY:number;applied:boolean};
export type Burn={quality?:number;damage:number;nextTick:number;ticks:number};
export type Push={from:number;to:number;started:number;ends:number};
type ToxicTwigPoison={started:number;ticks:number;quality:number;scale:number};
const TOXIC_TWIG_INTERVAL=1.5,TOXIC_TWIG_TICKS=10;
export type Enemy={eruptionStunUntil?:number;toxicTwig?:ToxicTwigPoison[];spores?:ShroomySpore[];lane?:CombatLane;guardianHitAt?:number;nextGuardianAttackAt?:number;goblinKing?:boolean;kingEnragedAt?:number;offspring:boolean;potionCurseTick:number|null;potionCurseUntil:number;curseTick:number|null;id:number;rocky:boolean;shield:EnemyShield|null;chronosStartedAt:number;stunStartedAt:number;kind:'slime'|'goblin'|'mother'|'spider';initialElement:Element|'Neutral';readyAt:number;spawnAt:number;element:Element|'Neutral';hp:number;maxHP:number;x:number;clock:number;attackAt:number|null;nextAttackAt:number;hurtUntil:number;push:Push|null;leafSlows:{until:number;amount:number}[];slowUntil:number;rootUntil:number;chronosSlowUntil:number;stunUntil:number;burn:Burn|null};
export type Projectile={knockbackMultiplier?:number;inkUsed:number;damageMultiplier:number;started:number;duration:number;quality:number;color:string;spellId:SpellId;targetId:number};
export type TidalWave={blackFlashMultiplier?:number;id:number;started:number;duration:number;quality:number;damageMultiplier:number;inkUsed:number;hitIds:number[];bonuses:{damageBonus:number;pushBonus:number;upgrade:number;midnightStone:boolean;moon:boolean}};
export const TIDAL_TRAVEL_SECONDS=.9,TIDAL_START_X=300;
type NearCast={quality:number;multiplier:number;inkUsed:number;knockbackMultiplier:number;bonuses:TidalWave['bonuses'];amulets:Battle['amulets']};
export type Battle={eruptionWarnings:EruptionWarning[];magma:Magma[];constellation:Constellation|null;snowman:Guardian|null;scorchy:Guardian|null;shroomy:Guardian|null;maxHealth?:number;contactPushMultiplier?:number;torrent:Torrent|null;fireFriend:boolean;snaily:boolean;cooldownsDisabled?:boolean;repeatAlchemize?:boolean;vineGrab:{targetId:number;x:number;y:number;started:number}|null;blackFlashBurst:{serial:number;x:number}|null;blackFlash:{enabled:boolean;chain:boolean};alchemizeUsed:boolean;alchemizedPotions?:Potion[];potionFullSerial?:number;alchemizedPotion:Potion|null;alchemizeAt:number;potionCapacity:number;hazardousVials:boolean;flameSwing:{started:number}|null;puddle:{x:number;cast:NearCast}|null;puddleBurst:{x:number;started:number}|null;thistle:{started:number;range:number;budget:number;spent:number;nextTick:number;cast:NearCast}|null;stale:{spellId:SpellId|null;count:number};cooldowns:Partial<Record<SpellId,number>>;stellarReady:boolean;robes:{enabled:boolean;artisan:boolean;spells:SpellId[]};sphereShatteredAt:number|null;castingRelics:{sphere:boolean;calculus:boolean;stardust:boolean;clover:boolean;stardustUsed:boolean;steadyCasts:number};bog:Bog|null;tidalWaves:TidalWave[];tidalSerial:number;firestorm:Firestorm|null;bestDrawing:PlayerDrawing|null;worstDrawing:PlayerDrawing|null;lotus:boolean;lotusReady:boolean;colorful:boolean;lastElement:Element|null;shaleActive:boolean;shaleContacts:number;offspringOrder:Element[];phase:BattlePhase;encounter:Encounter;time:number;approachAt:number;playerHP:number;enemies:Enemy[];playerHurtUntil:number;playerHits:number;casts:number;projectile:Projectile|null;potions:PotionCounts;bottledSpells:BottledSpell[];rejectionUntil:number;furyReady:boolean;freezeUntil:number;unlimitedUntil:number;potionFlights:PotionFlight[];potionSerial:number;upgrades:Partial<Record<SpellId,number>>;midnightStone:boolean;damageBonus:number;pushBonus:number;firstHitPush:number;difficulty:number;motherSplit:{at:number;x:number;element:Enemy['element'];spawned:boolean;snowmanX:number|null}|null;chronosFields:{quality:number;kind:'slow'|'stun';started:number;until:number}[];chronosPulse:{started:number;strong:boolean}|null;amulets:{sun:boolean;moon:boolean;twilight:boolean}};
function enemy(id:number,element:Enemy['element'],x:number,kind:Enemy['kind']='slime',rocky=false):Enemy{return{id,offspring:false,potionCurseTick:null,potionCurseUntil:0,curseTick:null,kind,initialElement:element,readyAt:0,rocky,shield:null,chronosStartedAt:0,stunStartedAt:0,spawnAt:0,element,hp:rocky?150:kind==='goblin'?200:kind==='mother'?300:SLIME_MAX_HP,maxHP:rocky?150:kind==='goblin'?200:kind==='mother'?300:SLIME_MAX_HP,x,clock:0,attackAt:null,nextAttackAt:0,hurtUntil:0,push:null,leafSlows:[],slowUntil:0,rootUntil:0,chronosSlowUntil:0,stunUntil:0,burn:null};}
export function createGoblinKing():Enemy{return{...enemy(1,'Neutral',580,'goblin'),goblinKing:true,hp:1000,maxHP:1000};}
export function kingDamageMultiplier(target:KingState,quality:number){return kingHasCrown(target)?kingSpellMultiplier(quality):1;}
export function resistedSlow(enemy:KingState,amount:number){return Math.max(0,amount-(kingHasCrown(enemy)?.2:0));}
export function createSpider(id=1,x=SLIME_START_X,element:Enemy['element']='Neutral'):Enemy{return enemy(id,element,x,'spider');}
const ELEMENTS:Element[]=['Fire','Water','Nature'];
export function newBattle(phase:BattlePhase='ready',encounter:Encounter='slime',random:()=>number=Math.random):Battle{
 const first=ELEMENTS[Math.min(2,Math.floor(random()*3))];
 const remaining=ELEMENTS.filter(e=>e!==first);
 const second=encounter==='pack'?remaining[Math.min(1,Math.floor(random()*2))]:(encounter==='shieldPack'||encounter==='upperMeadow')?ELEMENTS[Math.min(2,Math.floor(random()*3))]:first;
 const offspringOrder=[...ELEMENTS];if(encounter==='mother')for(let i=2;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[offspringOrder[i],offspringOrder[j]]=[offspringOrder[j],offspringOrder[i]];}
 return{eruptionWarnings:[],magma:[],constellation:null,snowman:null,scorchy:null,shroomy:null,torrent:null,fireFriend:false,snaily:false,vineGrab:null,blackFlashBurst:null,blackFlash:{enabled:false,chain:false},alchemizeUsed:false,alchemizedPotion:null,alchemizeAt:0,potionCapacity:3,hazardousVials:false,flameSwing:null,puddle:null,puddleBurst:null,thistle:null,stale:{spellId:null,count:0},cooldowns:{},stellarReady:false,robes:{enabled:false,artisan:false,spells:[]},sphereShatteredAt:null,castingRelics:{sphere:false,calculus:false,stardust:false,clover:false,stardustUsed:false,steadyCasts:0},bog:null,tidalWaves:[],tidalSerial:0,firestorm:null,bestDrawing:null,worstDrawing:null,lotus:false,lotusReady:false,colorful:false,lastElement:null,shaleActive:false,shaleContacts:0,offspringOrder,phase,encounter,time:0,approachAt:ENEMY_APPROACH_DELAY,playerHP:PLAYER_MAX_HP,enemies:encounter==='goblinKing'?[createGoblinKing()]:encounter==='spiderGoblinElite'?[createSpider(1,560),createSpider(2,600),{...enemy(3,'Neutral',600,'goblin'),spawnAt:ENEMY_APPROACH_DELAY+8},{...enemy(4,'Neutral',ENEMY_BACK_X,'goblin'),spawnAt:ENEMY_APPROACH_DELAY+8},{...createSpider(5,ENEMY_BACK_X),spawnAt:ENEMY_APPROACH_DELAY+8+6}]:encounter==='rockWebNest'?[...([560,600,640].map((x,i)=>enemy(i+1,'Neutral',x,'slime',true))),{...createSpider(4,ENEMY_BACK_X),spawnAt:10}]:encounter==='rockSpider'?[enemy(1,'Neutral',SLIME_START_X,'slime',true),{...createSpider(2,ENEMY_BACK_X),spawnAt:6}]:encounter==='upperMeadow'?[enemy(1,first,580),{...enemy(2,second,ENEMY_BACK_X),shield:woodenShield(),spawnAt:7}]:encounter==='mother'?[enemy(1,first,580,'mother')]:encounter==='shieldPack'?[{...enemy(1,first,580),shield:woodenShield()},{...enemy(2,second,ENEMY_BACK_X),shield:woodenShield()},{...enemy(3,'Neutral',ENEMY_BACK_X,'slime',true),spawnAt:13.5}]:encounter==='pack'?[enemy(1,first,580),enemy(2,second,ENEMY_BACK_X)]:encounter==='elite'?[enemy(1,'Neutral',580,'goblin')]:encounter==='rock'?[enemy(1,'Neutral',SLIME_START_X,'slime',true)]:[enemy(1,first,SLIME_START_X)],playerHurtUntil:0,playerHits:0,casts:0,projectile:null,potions:{heal:1,freeze:1,ink:1},bottledSpells:[],rejectionUntil:0,furyReady:false,freezeUntil:0,unlimitedUntil:0,potionFlights:[],potionSerial:0,upgrades:{},midnightStone:false,damageBonus:1,pushBonus:1,firstHitPush:0,difficulty:1,motherSplit:null,chronosFields:[],chronosPulse:null,amulets:{sun:false,moon:false,twilight:false}};
}
export function presentEnemies(state:Battle){return state.enemies.filter(e=>e.hp>0&&e.spawnAt<=state.time+1e-9);}
export function nearestEnemy(state:Battle){return presentEnemies(state).sort((a,b)=>a.x-b.x||a.id-b.id)[0];}
export function spellTarget(state:Battle,id?:SpellId){
 if(id==='toxicTwig')return presentEnemies(state).filter(e=>!e.toxicTwig?.length).sort((a,b)=>b.hp-a.hp||a.x-b.x||a.id-b.id)[0];
 if(id==='sneakyVine')return presentEnemies(state).sort((a,b)=>b.x-a.x||a.id-b.id)[0];
 return nearestEnemy(state);
}
export function targetedEnemy(state:Battle){return presentEnemies(state).find(e=>e.id===state.projectile?.targetId)??nearestEnemy(state);}
export function advantage(element:Enemy['element'],target:Enemy['element']){return(element==='Water'&&target==='Fire')||(element==='Fire'&&target==='Nature')||(element==='Nature'&&target==='Water');}
export function elementalMatchup(element:Element,target:Enemy['element']){
 if(element==='Ancient'||target==='Neutral')return{damage:1,knockback:1,immuneEffects:false};
 if(element===target)return{damage:.5,knockback:.7,immuneEffects:true};
 if(advantage(target,element))return{damage:.75,knockback:.85,immuneEffects:false};
 return{damage:1.5,knockback:1,immuneEffects:false};
}
export function rockyDefense(rocky:boolean,quality:number){return !rocky||quality>=70?{damage:1,knockback:1,immuneEffects:false}:quality>=60?{damage:.75,knockback:.75,immuneEffects:false}:{damage:.5,knockback:0,immuneEffects:true};}
type SpellDamageTarget=Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'|'shield'|'goblinKing'|'kingEnragedAt'|'hp'|'maxHP'>>;
function sporeTickDamage(target:SpellDamageTarget,quality:number,damage:number,time:number){
 return Math.round(1e6*damage*rockyDefense(!!target.rocky,quality).damage
  *shieldProtection(target.shield,time)*kingDamageMultiplier(target,quality))/1e6;
}
export function shroomyTickDamage(target:SpellDamageTarget,quality:number,bonus=1,upgrade=0,time=0){
 return sporeTickDamage(target,quality,shroomySporePower(quality,upgrade)*bonus,time);
}
export function spellDamage(target:SpellDamageTarget,quality:number,spellId:SpellId,damageBonus=1,upgrade=0,time=0):number{if(spellId==='torrent'){if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return 0;return spellDamage({...target,rocky:false,shield:null,goblinKing:false},60,'water',damageBonus,upgrade,time)*rockyDefense(!!target.rocky,quality).damage*shieldProtection(target.shield,time)*kingDamageMultiplier(target,quality);}if(spellId==='toxicTwig'||spellId==='shroomy'||spellId==='constellation'||spellId==='alchemize'||spellId==='bog'||spellId==='chronos'||spellId==='firestorm')return 0;const spell=SPELLS.find(s=>s.id===spellId)!;const factor=spellId==='bolt'?1.3:spellId==='tidalcrest'?(1.265*.95):spellId==='wave'?.9:spellId==='leaf'?.75:1;const precision=isGuardianSpell(spellId)||['thistleBush','puddleGuard','water','fire','nature','eruption'].includes(spellId)?1e6:1;return Math.round(precision*(isNearSpell(spellId)?nearDamage(spellId,quality,upgrade):spellId==='ender'?(Number.isFinite(quality)&&quality>=MIN_CAST_QUALITY?1000:0):spellPower(spellId,quality)*factor)*damageBonus*(1+(isUpgradableSpell(spellId)&&spellId!=='thistleBush'&&spellId!=='puddleGuard'?Math.max(0,Math.min(1,upgrade)):0)*damageUpgradeBonus(spellId))*elementalMatchup(spell.element,target.element).damage*rockyDefense(!!target.rocky,quality).damage*(spellId==='sneakyVine'?1:shieldProtection(target.shield,time))*kingDamageMultiplier(target,quality))/precision;}
export function spellKnockback(quality:number,spellId:SpellId,pushBonus=1,target:Enemy['element']='Neutral',rocky=false,shield:EnemyShield|null=null,time=0,upgrade=0,goblinKing=false):number{if(spellId==='torrent'){if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return 0;return spellKnockback(60,'water',pushBonus,target,false,null,time,0,false)*rockyDefense(rocky,quality).knockback*shieldProtection(shield,time)*(goblinKing?kingSpellMultiplier(quality):1);}if(spellId==='eruption')return Number.isFinite(quality)&&quality>=MIN_CAST_QUALITY?ERUPTION_KNOCKBACK:0;if(spellId==='toxicTwig'||spellId==='constellation'||spellId==='alchemize'||spellId==='bog'||spellId==='chronos'||spellId==='ender'||spellId==='firestorm')return 0;const base=isGuardianSpell(spellId)?guardianKnockback(spellId,quality,upgrade):isNearSpell(spellId)?nearKnockback(spellId,quality):spellId==='wave'&&quality>=MIN_CAST_QUALITY&&quality<60?40+14*(quality-45)/14:knockback(quality)*(spellId==='wave'?1.7:spellId==='tidalcrest'?(1.5*.95):spellId==='sneakyVine'?2.5:spellId==='bolt'?.65:1);return (goblinKing?kingSpellMultiplier(quality):1)*(spellId==='sneakyVine'?1:shieldProtection(shield,time))*rockyDefense(rocky,quality).knockback*base*pushBonus*(spellId==='puddleGuard'&&upgrade>=1?1.2:1)*elementalMatchup(SPELLS.find(s=>s.id===spellId)!.element,target).knockback;}
// Rain retains fractional damage so small elemental/rock/shield reductions remain meaningful.
export function amuletDamageMultiplier(quality:number,id:SpellId,amulets:Battle['amulets']){
 if(!Number.isFinite(quality)||quality<60)return 1;
 const element=SPELLS.find(s=>s.id===id)!.element;
 return element==='Fire'&&amulets.sun||element==='Water'&&amulets.moon||element==='Nature'&&amulets.twilight?1.15:1;
}
function toxicTwigScale(quality:number,upgrade:number){
 return power(quality)/power(80)*(upgrade>=1?1+damageUpgradeBonus('toxicTwig'):1);
}
function toxicTwigTickDamage(target:SpellDamageTarget,poison:Pick<ToxicTwigPoison,'quality'|'scale'|'ticks'>){
 const damage=(6+2*poison.ticks)*poison.scale;
 return Math.round(1e6*damage*rockyDefense(!!target.rocky,poison.quality).damage
  *kingDamageMultiplier(target,poison.quality))/1e6;
}
export function toxicTwigTotalDamage(target:SpellDamageTarget,quality:number,bonus=1,upgrade=0){
 const scale=toxicTwigScale(quality,upgrade)*bonus;
 let total=0;
 for(let ticks=0;ticks<TOXIC_TWIG_TICKS;ticks++)total+=toxicTwigTickDamage(target,{quality,scale,ticks});
 return Math.round(total*1e6)/1e6;
}
function toxicTwigDamageBonus(state:Battle,quality:number,multiplier:number,inkUsed:number){
 return state.damageBonus*multiplier*amuletDamageMultiplier(quality,'toxicTwig',state.amulets)
  *(1+(state.midnightStone?midnightBonus(inkUsed):0));
}
export function toxicTwigCastPreview(state:Battle,quality:number,inkUsed:number){
 const target=spellTarget(state,'toxicTwig')??{element:'Neutral'};
 const bonus=toxicTwigDamageBonus(state,quality,releaseMultiplier(state,'toxicTwig'),inkUsed);
 return toxicTwigTotalDamage(target,quality,bonus,state.upgrades.toxicTwig??0);
}
export function firestormTickDamage(target:Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'|'shield'|'goblinKing'|'kingEnragedAt'|'hp'|'maxHP'>>,quality:number,damageBonus=1,upgrade=0,multiplier=1,time=0){
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return 0;
 return Math.round(firestormBaseDamage(upgrade)*damageBonus*multiplier*elementalMatchup('Fire',target.element).damage*rockyDefense(!!target.rocky,quality).damage*shieldProtection(target.shield,time)*kingDamageMultiplier(target,quality)*1000000)/1000000;
}
export function bogSlow(state:Battle,e:Enemy,time:number){
 const bog=state.bog;if(!bog||time<bog.arrives||time>=bog.portions.at(-1)!.until)return 0;
 const portion=bog.portions.find(p=>p.until>time);if(!portion||elementalMatchup('Nature',e.element).immuneEffects||rockyDefense(e.rocky,portion.quality).immuneEffects)return 0;
 return bogEffect(portion.quality,portion.upgrade).slow;
}
// Snaily boosts the strongest regular slow. Spores add their own slow independently.
export function spellSlow(state:Battle,e:Enemy,time:number){
 const amount=Math.max(bogSlow(state,e,time),time<e.chronosSlowUntil?.55:0,...e.leafSlows.filter(f=>f.until>time).map(f=>f.amount),time<e.slowUntil&&e.leafSlows.length===0?.55:0);
 const boost=amount>0 && state.snaily ? .05 : 0;
 const sporeSlow=e.spores?.reduce((total,spore)=>
  spore.ticks>0&&spore.nextTick+spore.ticks-1>time+1e-9?total+(spore.slow??shroomySporeSlow()):total,0)??0;
 const inMagma=state.magma.some(pool=>pool.started<=time&&time<pool.until&&magmaContains(pool,e.x,enemyY(e.id,state.encounter,e.lane)));
 const inThistles=state.thistle&&time>=state.thistle.started&&e.x>=CONTACT_X&&e.x<=CONTACT_X+state.thistle.range;
 return Math.max(inMagma?MAGMA_SLOW:0,inThistles?THISTLE_SLOW:0,resistedSlow(e,Math.min(1,amount+boost+sporeSlow)));
}
export function bogTickDamage(e:Pick<Enemy,'element'>&Partial<Pick<Enemy,'rocky'|'shield'|'goblinKing'|'kingEnragedAt'|'hp'|'maxHP'>>,q:number,upgrade=0,bonus=1,multiplier=1,midnight=0,time=0,twilight=false){
 return Math.round(bogEffect(q,upgrade).damage*bonus*multiplier*(1+midnight)*(twilight&&q>=60?1.15:1)*elementalMatchup('Nature',e.element).damage*rockyDefense(!!e.rocky,q).damage*shieldProtection(e.shield,time)*kingDamageMultiplier(e,q)*1e6)/1e6;
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
   const damage=bogTickDamage(e,portion.quality,portion.upgrade,portion.damageBonus,portion.multiplier,portion.midnight,tick,portion.twilight);
   const hp=Math.max(0,Math.round((e.hp-damage)*1e6)/1e6);
   return{...e,hp,hurtUntil:time+.15,push:hp===0?null:e.push,attackAt:hp===0?null:e.attackAt};
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
   const damage=firestormTickDamage({...e,shield:oldShield},portion.quality,portion.damageBonus,portion.baseDamage===firestormBaseDamage(1)?1:0,portion.multiplier,tick);
   const boostedDamage=portion.midnightBonus?Math.floor(damage*(1+portion.midnightBonus)+1e-9):damage;
   const shield=igniteShield(oldShield,'Fire',portion.quality,tick),ignited=shield!==oldShield;
   const hp=Math.max(0,Math.round((e.hp-boostedDamage)*1000000)/1000000);
   return{...e,hp,shield:shield??e.shield,hurtUntil:time+.15,push:hp===0||ignited?null:e.push,attackAt:hp===0||ignited?null:e.attackAt};
  });
  nextTick+=FIRESTORM_TICK_SECONDS;
 }
 return{...state,enemies,firestorm:time+1e-9>=end?null:{...storm,nextTick}};
}
function advanceEruptions(state:Battle):Battle{
 if(!state.eruptionWarnings.length)return state;
 let enemies=state.enemies;
 const magma=[...state.magma];
 const eruptionWarnings=state.eruptionWarnings.flatMap(warning=>{
  const target=enemies.find(e=>e.id===warning.targetId&&e.hp>0);
  const x=target?.x??warning.x;
  const impactY=target?enemyY(target.id,state.encounter,target.lane):warning.impactY;
  const started=warning.started+ERUPTION_WARNING_SECONDS;
  if(state.time+1e-9<started)return [{...warning,x,impactY}];

  const {quality,upgrade,damageBonus}=warning;
  if(target){
   const shield=updateShield(target.shield,started);
   const damage=spellDamage({...target,shield},quality,'eruption',damageBonus,upgrade,started);
   const hp=Math.max(0,target.hp-damage);
   const push=hp>0?extendEnemyKnockback(state,target,spellKnockback(quality,'eruption')):null;
   const hit={...target,hp,push,hurtUntil:started+.25,attackAt:null,shield:igniteShield(shield,'Fire',quality,started)};
   const knocked=hp===0?hit:{...hit,eruptionStunUntil:Math.max(target.eruptionStunUntil??0,state.time+eruptionStunSeconds(quality))};
   enemies=enemies.map(e=>e.id===target.id?knocked:e);
  }
  const {radiusX,radiusY,duration,damage}=magmaSize(quality,upgrade);
  magma.push({x,impactY,started,until:started+duration,nextTick:started+MAGMA_TICK_SECONDS,radiusX,radiusY,quality,damage:damage*damageBonus});
  return [];
 });
 return {...state,enemies,magma,eruptionWarnings};
}
function advanceMagma(state:Battle,time:number):Battle{
 if(!state.magma.length)return state;
 let enemies=state.enemies;
 const magma=state.magma.flatMap(pool=>{
  let nextTick=pool.nextTick;
  while(nextTick<=Math.min(time,pool.until)+1e-9){
   const tick=nextTick;
   enemies=enemies.map(enemy=>{
    if(enemy.hp<=0||enemy.spawnAt>tick+1e-9||!magmaContains(pool,enemy.x,enemyY(enemy.id,state.encounter,enemy.lane)))return enemy;
    const element=enemy.kind==='mother'?ELEMENTS[(ELEMENTS.indexOf(enemy.initialElement as Element)+Math.floor((tick+1e-9)/15))%3]:enemy.element;
    const damage=pool.damage*elementalMatchup('Fire',element).damage*rockyDefense(enemy.rocky,pool.quality).damage
     *shieldProtection(updateShield(enemy.shield,tick),tick)*kingDamageMultiplier(enemy,pool.quality);
    const hp=Math.max(0,Math.round((enemy.hp-damage)*1e6)/1e6);
    return {...enemy,hp,hurtUntil:time+.15,push:hp===0?null:enemy.push,attackAt:hp===0?null:enemy.attackAt};
   });
   nextTick+=MAGMA_TICK_SECONDS;
  }
  return time+1e-9<pool.until?[{...pool,nextTick}]:[];
 });
 return {...state,enemies,magma};
}
export function eliteRush(e:Enemy){if(e.kind!=='goblin'||e.goblinKing)return 'none';const cycle=e.clock%10;return cycle>=6&&cycle<7?'warning':cycle>=7&&cycle<9?'rush':'none';}
export function chronosEffect(quality:number,upgrade=0){
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return{kind:'slow' as const,duration:0};
 const q=balanceQuality(quality),[lo,hi,min,max]=q<60?[48,59,1,2.4]:q<70?[60,69,2.5,5]:q<80?[70,79,5.1,9]:[80,100,9.1,18];
 return{kind:'stun' as const,duration:Math.round((min+(max-min)*(q-lo)/(hi-lo))*(1+.12*Math.max(0,Math.min(1,upgrade)))*1000)/1000};
}
export function brambleEffect(quality:number,upgrade=0){
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return{duration:0,amount:0};
 const q=balanceQuality(quality),[lo,hi,d0,d1,a0,a1]=q<60?[48,59,3,4,.35,.45]:q<70?[60,69,4.1,5,.46,.55]:q<80?[70,79,5.1,6,.56,.61]:[80,100,6.1,8,.62,.75];
 const t=(q-lo)/(hi-lo);return{duration:Math.round((d0+(d1-d0)*t)*1000)/1000,amount:Math.round((a0+(a1-a0)*t+(upgrade>=1?.05:0))*1000)/1000};
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
function enemyKnockback(state:Battle,enemy:Enemy,distance:number,duration=PUSH_DURATION):Push{
 return {from:enemy.x,to:Math.min(ENEMY_BACK_X,enemy.x+distance),started:state.time,ends:state.time+duration};
}

function extendEnemyKnockback(state:Battle,enemy:Enemy,distance:number){
 const push=distance>0?enemyKnockback(state,enemy,distance):null;
 return push&&push.to>(enemy.push?.to??enemy.x)?push:enemy.push;
}

export function fizzleSpell(state:Battle):Battle{
 if(state.phase!=='active')return state;
 const shatter=state.castingRelics.sphere;
 const burst=shatter||state.castingRelics.stardust&&!state.castingRelics.stardustUsed;
 const damage=shatter?25:10,push=shatter?ENEMY_RUNWAY_SIZE*.75:25;
 const live=new Set(presentEnemies(state).map(e=>e.id));
 const enemies=burst?state.enemies.map(e=>live.has(e.id)?{...e,hp:Math.max(0,e.hp-damage),hurtUntil:state.time+.25,attackAt:null,push:enemyKnockback(state,e,push)}:e):state.enemies;
 return resolveMother({...state,enemies,sphereShatteredAt:shatter?state.time:state.sphereShatteredAt,furyReady:false,stellarReady:false,castingRelics:{...state.castingRelics,sphere:false,stardust:state.castingRelics.stardust||shatter,steadyCasts:0,stardustUsed:state.castingRelics.stardustUsed||burst}});
}
export function rollBlackFlash(state:Battle,id:SpellId,quality:number,random:()=>number=Math.random,x=nearestEnemy(state)?.x??400){
 if(!state.blackFlash.enabled||!Number.isFinite(quality)||quality<60||!(['water','fire','nature','wave','bolt','leaf','tidalcrest','sneakyVine','torrent','flameBlade'] as SpellId[]).includes(id))return{state,multiplier:1};
 const success=random()<(state.blackFlash.chain?1/3:1/10);
 return{state:{...state,blackFlashBurst:success?{serial:(state.blackFlashBurst?.serial??0)+1,x}:state.blackFlashBurst,blackFlash:{...state.blackFlash,chain:success}},multiplier:success?2:1};
}
export function hitWithSpell(state:Battle,quality:number,spellId:SpellId='water',targetId?:number,random:()=>number=Math.random,damageMultiplier=1,inkUsed=0,bonuses?:TidalWave['bonuses'],knockbackMultiplier=1,blackFlashMultiplier?:number):Battle{
 if(spellId==='constellation'){
  if(state.phase!=='active'||state.constellation)return state;
  const bonus=constellationBonus(quality,state.upgrades.constellation??0);
  if(!bonus.armor)return state;
  return{...state,casts:state.casts+1,constellation:{...bonus,maxArmor:bonus.armor,castAt:state.time},
   damageBonus:state.damageBonus+bonus.damage/100,pushBonus:state.pushBonus+bonus.knockback/100};
 }
 if(spellId==='alchemize'){
  if(state.phase!=='active'||!Number.isFinite(quality)||quality<MIN_CAST_QUALITY||alchemizeBlockReason(state,false,true))return state;
  const count=(state.upgrades.alchemize??0)>=1?2:1;
  const rolled=Array.from({length:count},()=>rollAlchemizePotion(quality,random)!);
  const room=Math.max(0,state.potionCapacity-POTION_IDS.reduce((n,id)=>n+(state.potions[id]??0),0)),kept=rolled.slice(0,room),potions={...state.potions};
  for(const potion of kept)potions[potion]=(potions[potion]??0)+1;
  return{...state,alchemizeUsed:true,alchemizedPotion:kept[0]??null,alchemizedPotions:kept,alchemizeAt:state.time,casts:state.casts+1,potions,potionFullSerial:(state.potionFullSerial??0)+(kept.length<rolled.length?1:0)};
 }
 if(isNearSpell(spellId)&&targetId===undefined)return castNearSpell(state,quality,spellId,damageMultiplier,inkUsed,knockbackMultiplier,random);
 if(state.phase!=='active'||(spellId==='bog'||spellId==='ender'||spellId==='firestorm'||spellId==='tidalcrest')&&(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY))return state;
 if(isGuardianSpell(spellId))return beginGuardian(state,spellId,quality,guardianDamageBonus(state,spellId,quality,damageMultiplier,inkUsed));
 if(spellId==='torrent')return beginTorrent(state,quality,damageMultiplier,inkUsed,knockbackMultiplier,random);
 if(spellId==='bog')return{...state,casts:state.casts+1,bog:extendBog(state.bog,state.time,{quality,upgrade:state.upgrades.bog??0,damageBonus:state.damageBonus,multiplier:damageMultiplier,midnight:state.midnightStone?midnightBonus(inkUsed):0,twilight:state.amulets.twilight})};
 if(spellId==='firestorm')return{...state,casts:state.casts+1,firestorm:extendFirestorm(state.firestorm,state.time,quality,state.upgrades.firestorm??0,state.damageBonus*amuletDamageMultiplier(quality,spellId,state.amulets),damageMultiplier,state.midnightStone?midnightBonus(inkUsed):0)};
 if(spellId==='chronos'){
  const effect=chronosEffect(quality,state.upgrades.chronos??0);if(!effect.duration)return state;
  const live=new Set(presentEnemies(state).map(e=>e.id));if(!live.size)return state;
  const field={quality,kind:effect.kind,started:state.time,until:state.time+effect.duration};
  const enemies=state.enemies.map(e=>live.has(e.id)?applyChronos(e,field,state.time):e);
  return resolveMother({...state,enemies,chronosFields:[...(state.chronosFields??[]).filter(f=>f.until>state.time),field],casts:state.casts+1,chronosPulse:{started:state.time,strong:quality>=70}});
 }
 if(spellId==='toxicTwig'){
  const target=spellTarget(state,spellId);
  if(!target)return state;
  const scale=toxicTwigScale(quality,state.upgrades.toxicTwig??0);
  if(!scale)return state;
  const poison={started:state.time,ticks:0,quality,scale:scale*toxicTwigDamageBonus(state,quality,damageMultiplier,inkUsed)};
  return {...state,casts:state.casts+1,enemies:state.enemies.map(e=>e.id===target.id?{...e,toxicTwig:[poison]}:e)};
 }
 const target=presentEnemies(state).find(e=>e.id===targetId)??spellTarget(state,spellId);if(!target)return state;
 if(spellId==='eruption'){
  if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return state;
  const upgrade=bonuses?.upgrade??state.upgrades.eruption??0;
  const damageBonus=(bonuses?.damageBonus??state.damageBonus)*damageMultiplier*amuletDamageMultiplier(quality,'eruption',state.amulets)
   *(1+((bonuses?.midnightStone??state.midnightStone)?midnightBonus(inkUsed):0));
  const warning={targetId:target.id,x:target.x,impactY:enemyY(target.id,state.encounter,target.lane),started:state.time,quality:Math.min(100,quality),upgrade,damageBonus};
  return {...state,casts:state.casts+1,eruptionWarnings:[...state.eruptionWarnings,warning]};
 }
 const flash=blackFlashMultiplier===undefined?rollBlackFlash(state,spellId,quality,random,target.x):{state,multiplier:blackFlashMultiplier};state=flash.state;
 const q=Math.max(0,Math.min(100,quality)),element=SPELLS.find(s=>s.id===spellId)!.element;
 const immuneEffects=elementalMatchup(element,target.element).immuneEffects||rockyDefense(target.rocky,q).immuneEffects;
 const casting=bonuses??{damageBonus:state.damageBonus,pushBonus:state.pushBonus,upgrade:state.upgrades[spellId]??0,midnightStone:state.midnightStone,moon:state.amulets.moon};
 const steady=q>=60,moon=steady&&element==='Water'&&casting.moon,twilight=steady&&element==='Nature'&&state.amulets.twilight;
 const rooted=twilight&&spellId==='nature'&&!immuneEffects&&target.element!=='Nature'&&random()<.5;
 const enemies=state.enemies.map(e=>{
  if(e.id!==target.id)return e;
  const rockyFaint=e.rocky&&q<60;
  const bonus=casting.damageBonus*amuletDamageMultiplier(q,spellId,{...state.amulets,moon:casting.moon}),level=casting.upgrade;
  const precision=['thistleBush','puddleGuard','water','fire','nature'].includes(spellId)?1e6:1;const damage=Math.round(precision*spellDamage(e,q,spellId,bonus,level,state.time)*damageMultiplier*(1+(casting.midnightStone?midnightBonus(inkUsed):0)))/precision*flash.multiplier;
  const shield=igniteShield(updateShield(e.shield,state.time),element,q,state.time),shieldBurning=spellId!=='sneakyVine'&&(shield?.burnUntil??0)>state.time;
  // Sun grants Hearthspark its burn; Flare Bolt retains only its intrinsic burn.
  const burnTick=((spellId==='bolt'&&!immuneEffects?burnDamage(q,e.element,e.rocky)*damageMultiplier*amuletDamageMultiplier(q,spellId,state.amulets):0)+(steady&&spellId==='fire'&&state.amulets.sun&&e.element!=='Fire'?Math.round(spellDamage({...e,shield:null,goblinKing:false},q,spellId,bonus,level,state.time)*.3)*damageMultiplier/3:0))*(state.fireFriend?1.5:1);
  const hp=Math.max(0,e.hp-damage);
  let push=e.push;
  if(hp<=0&&spellId==='puddleGuard')push=null;
  else if(spellId!=='ender'&&spellId!=='thistleBush'){
   if(shieldBurning){
    if(spellId!=='flameBlade')push=null;
   }else if(!rockyFaint){
    const distance=spellKnockback(q,spellId,casting.pushBonus*knockbackMultiplier*flash.multiplier*(moon&&spellId==='water'?1.15:1),e.element,e.rocky,e.shield,state.time,level,kingHasCrown({...e,hp}))*(e.kind==='mother'?.8:1);
    push=spellId==='flameBlade'?extendEnemyKnockback(state,e,distance):enemyKnockback(state,e,distance,spellId==='sneakyVine'?.9:PUSH_DURATION);
   }
  }
  return{...e,shield,hp,push,attackAt:spellId==='ender'||spellId==='thistleBush'||!shieldBurning&&rockyFaint?e.attackAt:null,hurtUntil:state.time+.25,leafSlows:spellId==='leaf'&&!immuneEffects?[...e.leafSlows.filter(f=>f.until>state.time),{until:state.time+brambleEffect(q,level).duration,amount:brambleEffect(q,level).amount}]:e.leafSlows,slowUntil:spellId==='leaf'&&!immuneEffects?Math.max(e.slowUntil,state.time+brambleEffect(q,level).duration):e.slowUntil,rootUntil:rooted?state.time+1.5:e.rootUntil,burn:burnTick>0?{quality:burnTick>=(e.burn?.damage??0)?q:e.burn?.quality??q,damage:Math.max(e.burn?.damage??0,burnTick),nextTick:state.time+1,ticks:3}:e.burn};
 });
 return resolveMother({...state,enemies,casts:state.casts+1,vineGrab:spellId==='sneakyVine'?{targetId:target.id,x:target.x,y:enemyArtY(target,state.encounter)-12,started:state.time}:state.vineGrab});
}
// Resolve direct damage and damage-over-time deaths through the same boss phase.
function resolveMother(state:Battle):Battle{
 let next={...state,enemies:state.enemies.map(e=>e.goblinKing&&e.kingEnragedAt===undefined&&e.hp<=e.maxHP/2?{...e,kingEnragedAt:state.time}:e)};
 const mother=state.enemies.find(e=>e.kind==='mother');
 if(mother&&mother.hp<=0&&!state.motherSplit){
  next={...state,motherSplit:{at:state.time,x:mother.x,element:mother.element,spawned:false,snowmanX:state.snowman?.x??null},enemies:state.enemies.map(e=>e.id===mother.id?{...e,attackAt:null,burn:null}:e),projectile:null};
 }
 if(next.motherSplit&&!next.motherSplit.spawned&&mother&&next.motherSplit.x!==mother.x)next={...next,motherSplit:{...next.motherSplit,x:mother.x}};
 const split=next.motherSplit;
 if(split&&!split.spawned&&next.time+1e-9>=split.at+MOTHER_SPLIT_SECONDS){
  const spawnAt=split.at+MOTHER_SPLIT_SECONDS;
  const children=next.offspringOrder.map((element,i)=>{
   let child={...enemy(i+2,element,Math.max(CONTACT_X,Math.min(ENEMY_BACK_X-72,split.x-36))+i*36),spawnAt,readyAt:spawnAt+4,offspring:true};
   for(const field of next.chronosFields??[])if(field.until>spawnAt)child=applyChronos(child,field,spawnAt);
   return child;
  });
  next={...next,motherSplit:{...split,spawned:true},enemies:[...next.enemies,...children]};
 }
 if(next.enemies.every(e=>e.hp<=0)&&(!next.motherSplit||next.motherSplit.spawned))return{...next,phase:'victory',projectile:null,tidalWaves:[],torrent:null,snowman:null,scorchy:null,shroomy:null};
 return next;
}
export const SPELL_COOLDOWNS:Partial<Record<SpellId,number>>={snowman:GUARDIAN_COOLDOWN,scorchy:GUARDIAN_COOLDOWN,shroomy:GUARDIAN_COOLDOWN,torrent:10,sneakyVine:12,chronos:30,firestorm:10,eruption:12,bog:15,tidalcrest:8,puddleGuard:10,thistleBush:15,flameBlade:8};
export function spellCooldownRemaining(state:Battle,id:SpellId){if(state.cooldownsDisabled)return 0;const remaining=(state.cooldowns[id]??0)-state.time;return remaining>1e-9?remaining:0;}
export function staleMultiplier(state:Battle,id:SpellId){return state.stale.spellId===id&&state.stale.count>=3?.75:1;}
export function releaseMultiplier(state:Battle,spellId:SpellId,source:'cast'|'bottle'='cast'){const element=SPELLS.find(s=>s.id===spellId)!.element;return(source==='cast'?staleMultiplier(state,spellId):1)*(state.castingRelics.sphere?1.15:1)*(1+robesBonus(state)/100)*(source==='cast'&&state.furyReady?2:1)*(state.lotus&&state.lotusReady&&!['chronos','puddleGuard','alchemize','constellation'].includes(spellId)?1.25:1)*(state.colorful&&state.lastElement!==null&&element!==state.lastElement?1.15:1);}
export function releaseSpell(state:Battle,spellId:SpellId,source:'cast'|'bottle'='cast'){return{...state,stale:source==='cast'?{spellId,count:state.stale.spellId===spellId?state.stale.count+1:1}:state.stale,cooldowns:!state.cooldownsDisabled&&source==='cast'&&SPELL_COOLDOWNS[spellId]?{...state.cooldowns,[spellId]:state.time+SPELL_COOLDOWNS[spellId]!}:state.cooldowns,furyReady:source==='cast'?false:state.furyReady,lotusReady:!['chronos','puddleGuard','alchemize','constellation'].includes(spellId)?false:state.lotusReady,lastElement:SPELLS.find(s=>s.id===spellId)!.element};}
export function launchSpell(state:Battle,quality:number,color:string,spellId:SpellId='water',inkUsed=0,random:()=>number=Math.random):Battle{if(spellCastBlockReason(state,spellId))return state;const target=nearestEnemy(state);if(state.phase!=='active'||state.projectile||spellCooldownRemaining(state,spellId)>0)return state;if(!target&&!isGuardianSpell(spellId)&&!['constellation','torrent','alchemize','bog','firestorm','tidalcrest','flameBlade','puddleGuard','thistleBush'].includes(spellId))return fizzleSpell(state);if(!Number.isFinite(quality))return fizzleSpell(state);const rawQuality=quality;quality=effectiveAccuracy(state,quality);if(quality<MIN_CAST_QUALITY)return fizzleSpell(state);const knockbackMultiplier=staleMultiplier(state,spellId);state=prepareRelicCast(state,quality,spellId,rawQuality);const released=releaseSpell(state,spellId);if(spellId==='tidalcrest')return beginTidalWave(released,quality,releaseMultiplier(state,spellId),inkUsed,knockbackMultiplier);if(isGuardianSpell(spellId))return beginGuardian(released,spellId,quality,guardianCastDamageBonus(state,spellId,quality,inkUsed));if(spellId==='torrent'||spellId==='sneakyVine'||spellId==='toxicTwig'||spellId==='constellation'||spellId==='alchemize'||spellId==='bog'||spellId==='firestorm'||spellId==='eruption'||isNearSpell(spellId))return hitWithSpell(released,quality,spellId,undefined,random,releaseMultiplier(state,spellId),inkUsed,undefined,knockbackMultiplier);if(!target)return fizzleSpell(state);return{...released,projectile:{knockbackMultiplier,inkUsed,damageMultiplier:releaseMultiplier(state,spellId),started:state.time,duration:spellId==='leaf'?.32/.7:spellId==='wave'?.32/1.25:spellId==='bolt'?.16:.32,quality,color,spellId,targetId:target.id}};}

function castNearSpell(state:Battle,quality:number,id:NearSpell,multiplier:number,inkUsed:number,knockbackMultiplier:number,random:()=>number):Battle{
 if(state.phase!=='active'||!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return state;
 const cast:NearCast={quality,multiplier,inkUsed,knockbackMultiplier,amulets:{...state.amulets},bonuses:{damageBonus:state.damageBonus,pushBonus:state.pushBonus,upgrade:state.upgrades[id]??0,midnightStone:state.midnightStone,moon:state.amulets.moon}};
 if(id==='puddleGuard')return{...state,casts:state.casts+1,puddle:{x:CONTACT_X+30,cast}};
 if(id==='thistleBush'){const stats=thistleStats(quality,cast.bonuses.upgrade);return{...state,casts:state.casts+1,thistle:{...stats,started:state.time,spent:0,nextTick:state.time+.5,cast}};}
 const targets=presentEnemies(state).filter(e=>e.x>=CONTACT_X&&e.x<=CONTACT_X+110);
 const flash=targets.length?rollBlackFlash(state,id,quality,random,targets[0].x):{state,multiplier:1};
 let next:Battle={...flash.state,flameSwing:{started:state.time}};
 for(const e of targets)next=nearHit(next,cast,id,e.id,flash.multiplier);
 return{...next,casts:state.casts+1};
}
function nearHit(state:Battle,cast:NearCast,id:NearSpell,targetId:number,blackFlashMultiplier?:number){
 const next=hitWithSpell({...state,amulets:cast.amulets},cast.quality,id,targetId,Math.random,cast.multiplier,cast.inkUsed,cast.bonuses,cast.knockbackMultiplier,blackFlashMultiplier);
 return{...next,amulets:state.amulets,casts:state.casts};
}
function advanceNearSpells(previous:Battle,state:Battle):Battle{
 let next=state;
 if(next.flameSwing&&next.time-next.flameSwing.started>.35)next={...next,flameSwing:null};
 if(next.puddleBurst&&next.time-next.puddleBurst.started>.4)next={...next,puddleBurst:null};
 if(next.puddle){
  const puddle=next.puddle;
  // The first walking enemy to touch the small puddle consumes it. Moving
  // backwards through it during knockback does not count as walking onto it.
  const crossing=presentEnemies(next).filter(e=>{
   const old=previous.enemies.find(old=>old.id===e.id);
   return !e.push&&!old?.push&&e.x<=puddle.x+10&&e.x>=puddle.x-10;
  }).sort((a,b)=>a.x-b.x||a.id-b.id)[0];
  if(crossing){next=nearHit({...next,puddle:null,puddleBurst:{x:puddle.x,started:next.time}},puddle.cast,'puddleGuard',crossing.id);}
 }
 const bush=next.thistle;
 if(bush){let spent=bush.spent,tick=bush.nextTick;
  while(tick<=next.time+1e-9&&spent<bush.budget&&next.phase==='active'){
   const ids=presentEnemies({...next,time:tick}).filter(e=>e.x>=CONTACT_X&&e.x<=CONTACT_X+bush.range).map(e=>e.id);
   for(const id of ids){
    const before=next.enemies.find(e=>e.id===id)!.hp;
    next=nearHit({...next,time:tick},bush.cast,'thistleBush',id);next={...next,time:state.time};
    spent=Math.round((spent+Math.max(0,before-next.enemies.find(e=>e.id===id)!.hp))*1e6)/1e6;
    if(spent>=bush.budget||next.phase!=='active')break;
   }
   tick+=.5;
  }
  next={...next,thistle:spent>=bush.budget?null:{...bush,spent,nextTick:tick}};
 }
 return next;
}

export function tidalWavePosition(wave:TidalWave,time:number){return TIDAL_START_X+(ENEMY_BACK_X-TIDAL_START_X)*Math.max(0,Math.min(1,(time-wave.started)/wave.duration));}
function beginTidalWave(state:Battle,quality:number,damageMultiplier=1,inkUsed=0,knockbackMultiplier=1):Battle{
 if(state.phase!=='active'||!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return state;
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
  const hitIds=[...wave.hitIds];let blackFlashMultiplier=wave.blackFlashMultiplier;
  for(const crossing of crossings){
   if(next.phase!=='active')break;
   // An earlier wave or projectile may already have killed this exact target.
   if(!next.enemies.some(e=>e.id===crossing.id&&e.hp>0))continue;
   if(blackFlashMultiplier===undefined){const flash=rollBlackFlash(next,'tidalcrest',wave.quality,Math.random,next.enemies.find(e=>e.id===crossing.id)!.x);next=flash.state;blackFlashMultiplier=flash.multiplier;}
   next=hitWithSpell(next,wave.quality,'tidalcrest',crossing.id,Math.random,wave.damageMultiplier,wave.inkUsed,wave.bonuses,1,blackFlashMultiplier);
   next={...next,casts};hitIds.push(crossing.id);
  }
  if(state.time+1e-9<wave.started+wave.duration)remaining.push({...wave,hitIds,blackFlashMultiplier});
 }
 return{...next,tidalWaves:next.phase==='active'?remaining:[]};
}
export function projectilePosition(state:Battle){const p=state.projectile;if(!p)return null;const target=presentEnemies(state).find(e=>e.id===p.targetId)??nearestEnemy(state);if(!target)return null;const t=Math.min(1,Math.max(0,(state.time-p.started)/p.duration));const wobble=p.spellId==='leaf'?Math.sin(Math.PI*t)*(Math.sin(t*17)*13+Math.sin(t*29)*4):0;return{x:300+(target.x-300)*t,y:420+(enemyArtY(target,state.encounter)-15-420)*t+wobble};}
export function enemyY(id:number,encounter:Encounter='slime',lane?:CombatLane){return COMBAT_LANE_Y[combatLane(id,encounter,lane)];}
export function enemyArtY(enemy:Enemy,encounter:Encounter){return enemyY(enemy.id,encounter,enemy.lane)-enemyFootOffset(enemy);}
export function burnDamage(quality:number,element:Enemy['element'],rocky=false){const match=elementalMatchup('Fire',element);return match.immuneEffects||rockyDefense(rocky,quality).immuneEffects?0:Math.round(power(quality)*.25*(advantage('Fire',element)?1.5:1)*rockyDefense(rocky,quality).damage);}
export function potionPosition(flight:PotionFlight,time:number){const t=Math.max(0,Math.min(1,(time-flight.started)/POTION_FLIGHT_SECONDS));return{x:160+(flight.toX-160)*t,y:383+(flight.toY-383)*t-440*t*(1-t),rotation:-30+330*t,progress:t};}
function enemyContactDamage(enemy:Enemy,difficulty:number){
 return enemy.goblinKing?34:enemy.kind==='spider'?10:enemy.kind==='mother'?20:enemy.offspring?12:(enemy.kind==='goblin'?18:CONTACT_DAMAGE)*difficulty;
}

export function stepBattle(state:Battle,delta:number):Battle{
 if(state.phase!=='active'||!Number.isFinite(delta)||delta<=0)return state;
 const dt=Math.min(delta,.1),time=state.time+dt;
 let next=resolveMother({...state,time,vineGrab:state.vineGrab&&time-state.vineGrab.started<1.1?state.vineGrab:null});
 if(next.phase==='victory')return next;
 next.enemies=placeLaneArrivals(next.enemies,next.encounter,time);
 const potionFlights=state.potionFlights.map(f=>{if(!f.applied&&time-f.started>=POTION_FLIGHT_SECONDS){if(f.potion==='miasma'){
 const ids=new Set(presentEnemies(next).map(e=>e.id));
 next.enemies=next.enemies.map(e=>ids.has(e.id)?{...e,potionCurseTick:e.potionCurseTick??time+1,potionCurseUntil:time+12}:e);
 }if(f.potion==='heal'||f.potion==='theodoraHeal')next.playerHP=Math.min(playerMaxHealth(next),next.playerHP+(f.potion==='theodoraHeal'?35:30));if(f.potion==='freeze')next.freezeUntil=time+FREEZE_SECONDS;if(f.potion==='ink')next.unlimitedUntil=time+UNLIMITED_INK_SECONDS;if(f.potion==='rejection')next.rejectionUntil=time+15;if(f.potion==='fury')next.furyReady=true;if(f.potion==='stellar')next.stellarReady=true;if(f.potion==='spellBottle'&&f.spell?.spellId){const stellarReady=next.stellarReady;const drawStreak=next.castingRelics.steadyCasts;const bottleQuality=Math.min(100,f.spell.quality+(next.castingRelics.calculus?3:0));next=prepareRelicCast(next,bottleQuality,f.spell.spellId,f.spell.drawing?.quality??f.spell.quality);next={...next,stellarReady,castingRelics:{...next.castingRelics,steadyCasts:drawStreak}};const multiplier=releaseMultiplier(next,f.spell.spellId,'bottle');const released=releaseSpell(next,f.spell.spellId,'bottle');next=f.spell.spellId==='tidalcrest'?beginTidalWave(released,bottleQuality,multiplier,f.spell.inkUsed??0):hitWithSpell(released,bottleQuality,f.spell.spellId,undefined,Math.random,multiplier,f.spell.inkUsed??0);}if(next.hazardousVials){const live=new Set(presentEnemies(next).map(e=>e.id));next.enemies=next.enemies.map(e=>live.has(e.id)?{...e,hp:Math.max(0,e.hp-10),hurtUntil:time+.25,attackAt:null,push:enemyKnockback(next,e,Math.max(25,(e.push?.to??e.x)-e.x))}:e);}return{...f,applied:true};}return f;}).filter(f=>time-f.started<POTION_FLIGHT_SECONDS+POTION_BREAK_SECONDS);
 next.potionFlights=potionFlights;
 next=resolveMother(bogRain(stormRain(next,time),time));if(next.phase==='victory')return next;
 for(const id of GUARDIAN_SPELLS)next[id]=moveGuardian(next,id,next[id]===state[id]?dt:0);
 const frozen=state.time<next.freezeUntil;
 const live=presentEnemies(next);
 const groupSpeed=live.length>=2?.8:1;
 const marchOrder=live.length>1?live.sort((a,b)=>a.x-b.x||a.id-b.id):[];
 next.chronosFields=(next.chronosFields??[]).filter(f=>f.until>time);
 function advanceEnemy(original:Enemy):Enemy{
  let old=original;
  if(old.spawnAt>state.time&&old.spawnAt<=time+1e-9)for(const field of state.chronosFields??[])if(field.until>old.spawnAt)old=applyChronos(old,field,old.spawnAt);
  if(old.hp<=0){if(old.kind==='mother'&&old.push){const p=old.push,t=Math.max(0,Math.min(1,(time-p.started)/(p.ends-p.started)));return {...old,x:p.from+(p.to-p.from)*(1-(1-t)**3),push:t>=1?null:p};}return old;}
  if(old.spawnAt>time+1e-9)return old;
  if(old.kind==='mother'){const index=ELEMENTS.indexOf(old.initialElement as Element);old={...old,element:ELEMENTS[(index+Math.floor((time+1e-9)/15))%3]};}
  // Only advance actions after arrival, status holds and crown-loss dialogue.
  const actionDelta=Math.max(0,time-Math.max(state.time,state.approachAt,old.spawnAt,old.readyAt,old.goblinKing&&old.kingEnragedAt!==undefined?old.kingEnragedAt+GOBLIN_KING_DIALOGUE_MS/1000:0,old.rootUntil,old.stunUntil,old.eruptionStunUntil??0,old.shield?.burnUntil??0));
  let e:Enemy={...old,leafSlows:old.leafSlows.filter(f=>f.until>time),shield:updateShield(old.shield,time),clock:old.clock+(frozen?0:actionDelta)};
  if(e.potionCurseTick!=null){while(e.potionCurseTick<=Math.min(time,e.potionCurseUntil)+1e-9&&e.hp>0){e.hp=Math.max(0,e.hp-3);e.hurtUntil=time+.15;e.potionCurseTick+=1;}if(time+1e-9>=e.potionCurseUntil)e.potionCurseTick=null;if(e.hp<=0){e.push=null;e.attackAt=null;return e;}}
  if(e.curseTick!==null){while(e.curseTick<=time+1e-9&&e.hp>0){e.hp=Math.max(0,e.hp-5);e.hurtUntil=time+.15;e.curseTick+=1;}if(e.hp<=0){e.push=null;e.attackAt=null;return e;}}
  if(e.burn){let burn={...e.burn};while(burn.ticks>0&&time+1e-9>=burn.nextTick){e.hp=Math.max(0,e.hp-kingDamageMultiplier(e,burn.quality??100)*Math.round((Math.round(burn.damage*burn.ticks)-Math.round(burn.damage*(burn.ticks-1)))*shieldProtection(old.shield,burn.nextTick)));e.hurtUntil=time+.15;burn.ticks--;burn.nextTick+=1;}e.burn=burn.ticks>0&&e.hp>0?burn:null;if(e.hp===0){e.push=null;e.attackAt=null;return e;}}
  if(e.spores?.length){
   e=advanceSpores(e,time);
   if(e.hp===0)return {...e,push:null,attackAt:null};
  }
  if(e.toxicTwig?.length){
   e=advanceToxicTwig(e,time);
   if(e.hp===0)return {...e,push:null,attackAt:null};
  }
  // Hold knockback in place too; its remaining motion resumes after the line.
  const dialogueEnd=e.goblinKing&&e.kingEnragedAt!==undefined?e.kingEnragedAt+GOBLIN_KING_DIALOGUE_MS/1000:0;
  const dialogueHold=Math.max(0,Math.min(time,dialogueEnd)-state.time);
  if(e.push&&dialogueHold>0)e.push={...e.push,started:e.push.started+dialogueHold,ends:e.push.ends+dialogueHold};
  if(time<dialogueEnd)return e;
  if(e.push){
   const p=e.push,t=Math.min(1,(time-p.started)/(p.ends-p.started));
   e.x=Math.max(e.x,p.from+(p.to-p.from)*(1-(1-t)**3));
   e.attackAt=null;
   if(t>=1)e.push=null;
   return e;
  }
  if(frozen||actionDelta<=1e-9)return e;
  const rush=eliteRush(e);const speed=e.goblinKing?SLIME_SPEED*.9*(kingHasCrown(e)?1:1.8):e.kind==='goblin'?(rush==='warning'?0:rush==='rush'?52:22):SLIME_SPEED*(e.kind==='spider'?2:e.rocky?.9:1);
  // Enemies engage the furthest-forward guardian they have not passed.
  const guardianSpell=frontGuardian(next,e.x);
  const guardian=guardianSpell?next[guardianSpell]:null;
  const frontX=guardian?.x??CONTACT_X;
  const targetsGuardian=guardian!==null;
  const contactX=targetsGuardian?frontX+GUARDIAN_CONTACT_DISTANCE:CONTACT_X;
  const furthestX=targetsGuardian?frontX+GUARDIAN_MAX_CONTACT_REACH:Infinity;
  const reach=Math.min(furthestX,laneContactReach(e,marchOrder,next.encounter,frontX,contactX));
  const stopX=Math.max(CONTACT_X,Math.min(e.x,reach));
  e.x=Math.max(stopX,e.x-speed*groupSpeed*state.difficulty*(1-spellSlow(next,{...e,leafSlows:old.leafSlows,spores:old.spores},state.time))*actionDelta);
  if(guardianSpell&&guardian&&e.x<=reach+1e-9){
   e.attackAt=null;
   if(e.clock+1e-9>=(e.nextGuardianAttackAt??0)){
    const hp=guardian.hp-enemyContactDamage(e,state.difficulty)*GUARDIAN_DAMAGE_TAKEN;
    next[guardianSpell]=hp>0?{...guardian,hp,hurtUntil:time+.25}:null;
    e.nextGuardianAttackAt=e.clock+GUARDIAN_ENEMY_COOLDOWN;
    e.guardianHitAt=time;
   }
   return e;
  }
  if(e.x>reach+1e-9){e.attackAt=null;return e;}
  if(e.attackAt===null){
   if(e.clock>=e.nextAttackAt)e.attackAt=e.clock+(e.kind==='goblin'?.65:ATTACK_WINDUP);
  }else if(e.clock>=e.attackAt){
   const damage=enemyContactDamage(e,state.difficulty);
   const incoming=Math.round(damage*(next.rejectionUntil>time?.5:1));
   const absorbed=Math.min(next.constellation?.armor??0,incoming);
   if(next.constellation&&absorbed>0)next.constellation={...next.constellation,armor:next.constellation.armor-absorbed};
   next.playerHP=Math.max(0,next.playerHP-(incoming-absorbed));
   next.playerHurtUntil=time+.25;
   next.playerHits++;
   if(next.shaleActive&&next.shaleContacts<3){
    e.curseTick=e.curseTick??time+1;
    next.shaleContacts++;
    if(next.shaleContacts===3){
     next.shaleActive=false;
     next.playerHP=Math.min(playerMaxHealth(next),next.playerHP+15);
    }
   }
   e.push=enemyKnockback(next,e,(PLAYER_HIT_PUSH+(next.playerHits===1?state.firstHitPush:0)+(next.rejectionUntil>time?100:0))*state.pushBonus*(state.contactPushMultiplier??1)*shieldProtection(e.shield,time));
   e.attackAt=null;
   e.nextAttackAt=e.clock+(e.kind==='goblin'?2:ATTACK_COOLDOWN);
  }
  return e;
 }
 const moved=next.enemies.map(advanceEnemy);
 next.enemies=spaceLaneEnemies(next.enemies,moved,next.encounter,time,CONTACT_X,ENEMY_BACK_X);
 next=resolveMother(advanceEruptions(advanceMagma(next,time)));
 if(next.phase==='victory')return next;
 if(next.playerHP===0){next.phase='defeat';next.projectile=null;next.tidalWaves=[];next.torrent=null;for(const id of GUARDIAN_SPELLS)next[id]=null;return next;}
 if(next.projectile&&time-next.projectile.started>=next.projectile.duration){const p=next.projectile;next.projectile=null;next=hitWithSpell(next,p.quality,p.spellId,p.targetId,Math.random,p.damageMultiplier??1,p.inkUsed??0,undefined,p.knockbackMultiplier??1);}
 next=advanceNearSpells(state,advanceTorrent(advanceTidalWaves(state,next)));
 for(const id of GUARDIAN_SPELLS)next=advanceGuardian(next,id);
 return next;
}
export function drinkPotion(state:Battle,potion:Potion,bottleIndex=0):Battle{
 if(state.phase!=='active'||(state.potions[potion]??0)<=0)return state;
 if(potion==='stellar'&&(state.stellarReady||state.potionFlights.some(f=>f.potion==='stellar'&&!f.applied)))return state;
 const spell=potion==='spellBottle'?state.bottledSpells[bottleIndex]:undefined;if(potion==='spellBottle'&&!spell)return state;if(spellCastBlockReason(state,spell?.spellId,true))return state;
 const live=presentEnemies(state),toX=(potion==='freeze'||potion==='spellBottle'||potion==='miasma')?(live.length?live.reduce((n,e)=>n+e.x,0)/live.length:ENEMY_BACK_X):245,toY=(potion==='freeze'||potion==='spellBottle'||potion==='miasma')?FILA_FOOT_Y:395;
 return{...state,bottledSpells:potion==='spellBottle'?state.bottledSpells.filter((_,i)=>i!==bottleIndex):state.bottledSpells,potions:{...state.potions,[potion]:(state.potions[potion]??0)-1},potionSerial:state.potionSerial+1,potionFlights:[...state.potionFlights,{id:state.potionSerial+1,potion,spell,started:state.time,toX,toY,applied:false}]};
}

// Impact begins the bottle's breaking animation; each flight reports once.
export function potionImpactIds(previous:Battle,next:Battle){
 if(previous===next||(next.phase!=='active'&&next.phase!=='victory'))return[];
 return next.potionFlights.filter(f=>f.applied&&previous.potionFlights.some(old=>old.id===f.id&&!old.applied)).map(f=>f.id);
}


export function potionName(id:Potion){return id==='miasma'||id==='spellBottle'?POTIONS[id].name:`${POTIONS[id].name} potion`;}

export function spellCastBlockReason(state:Battle,id?:SpellId|null,fromBottle=false):string|null{
 if(id==='alchemize')return alchemizeBlockReason(state,fromBottle);
 if(id==='eruption'&&!nearestEnemy(state))return 'No enemy to erupt beneath';
 if(id==='toxicTwig'&&!spellTarget(state,id))return 'No uncursed enemy to target';
 if(id!=='constellation')return null;
 if(state.constellation)return 'Constellation has already been used this battle';
 if(state.potionFlights.some(f=>!f.applied&&f.spell?.spellId==='constellation'))return 'Constellation is already being cast';
 return null;
}

export function alchemizeBlockReason(state:Battle,fromBottle=false,ignoreFlight=false):string|null{
 if(!ignoreFlight&&state.potionFlights.some(f=>!f.applied&&f.spell?.spellId==='alchemize'))return 'Alchemize is already being cast';
 if(state.alchemizeUsed&&!state.repeatAlchemize)return 'Alchemize has already been used this battle';
 if(POTION_IDS.reduce((n,id)=>n+(state.potions[id]??0),0)-(fromBottle?1:0)>=state.potionCapacity)return 'Your purse is full';
 return null;
}
export function rollAlchemizePotion(quality:number,random:()=>number=Math.random):Potion|null{
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return null;
 const rareChance=quality>=80?1:quality>=70?.25:quality>=60?.1:0;
 const roll=random(),rare=rareChance===1||(rareChance>0&&roll<rareChance),pool=rare?RARE_POTIONS.filter(id=>id!=='spellBottle'):COMMON_POTIONS.filter(id=>quality>=70||id!=='heal');
 return pool[Math.max(0,Math.min(pool.length-1,Math.floor(random()*pool.length)))];
}


// Each drop picks independently from the same six battlefield columns.
function beginTorrent(state:Battle,quality:number,multiplier:number,inkUsed:number,knockbackMultiplier:number,random:()=>number):Battle{
 const duration=torrentDuration(quality);if(state.phase!=='active'||!duration)return state;
 const orbs=Array.from({length:duration/TORRENT_INTERVAL},(_,i)=>({
  ...torrentDropSpot(random()),landsAt:state.time+(i+1)*TORRENT_INTERVAL,applied:false,
 }));
 return{...state,casts:state.casts+1,torrent:{started:state.time,until:state.time+duration,quality,damageBonus:state.damageBonus*amuletDamageMultiplier(quality,'torrent',state.amulets),pushBonus:state.pushBonus*knockbackMultiplier,upgrade:state.upgrades.torrent??0,multiplier,midnight:state.midnightStone?midnightBonus(inkUsed):0,orbs}};
}
function advanceTorrent(state:Battle):Battle{
 const torrent=state.torrent;if(!torrent||state.phase!=='active')return state;
 let next=state;
 const orbs=torrent.orbs.map(orb=>{
  if(orb.applied||orb.landsAt>state.time+1e-9)return orb;
  const targets=presentEnemies(next).filter(e=>torrentContains(orb,e.x,enemyY(e.id,state.encounter,e.lane)));
  if(targets.length){
   const flash=rollBlackFlash(next,'torrent',torrent.quality,Math.random,orb.x);next=flash.state;
   const ids=new Set(targets.map(e=>e.id));
   next={...next,enemies:next.enemies.map(e=>{
    if(!ids.has(e.id))return e;
    const damage=spellDamage(e,torrent.quality,'torrent',torrent.damageBonus,torrent.upgrade,next.time)*torrent.multiplier*(1+torrent.midnight)*flash.multiplier;
    const hp=Math.max(0,Math.round((e.hp-damage)*1e6)/1e6);
    const push=spellKnockback(torrent.quality,'torrent',torrent.pushBonus*flash.multiplier,e.element,e.rocky,e.shield,next.time,0,kingHasCrown({...e,hp}))*(e.kind==='mother'?.8:1);
    const blocked=e.rocky&&torrent.quality<60;
    return{...e,hp,hurtUntil:damage>0?next.time+.25:e.hurtUntil,attackAt:blocked?e.attackAt:null,push:hp<=0?null:blocked?e.push:enemyKnockback(next,e,push)};
   })};
   next=resolveMother(next);
  }
  return{...orb,applied:true};
 });
 return{...next,torrent:next.phase!=='active'||state.time+1e-9>=torrent.until+TORRENT_SPLASH_SECONDS?null:{...torrent,orbs}};
}

function guardianDamageBonus(state:Battle,spellId:GuardianSpell,quality:number,castBoost:number,inkUsed:number):number{
 const playerMultiplier=state.damageBonus*castBoost*amuletDamageMultiplier(quality,spellId,state.amulets)
  *(1+(state.midnightStone?midnightBonus(inkUsed):0));
 return guardianBoostMultiplier(playerMultiplier);
}

export function guardianCastDamageBonus(state:Battle,spellId:GuardianSpell,quality:number,inkUsed:number):number{
 const stale=staleMultiplier(state,spellId);
 const castBoost=releaseMultiplier(state,spellId)/stale;
 return guardianDamageBonus(state,spellId,quality,castBoost,inkUsed)*stale;
}

function toxicTwigNextTick(poison:ToxicTwigPoison){return poison.started+(poison.ticks+1)*TOXIC_TWIG_INTERVAL;}
function advanceToxicTwig(enemy:Enemy,time:number):Enemy{
 const current=enemy.toxicTwig;
 if(!current?.some(poison=>toxicTwigNextTick(poison)<=time+1e-9))return enemy;
 const effects=current.map(poison=>({...poison}));
 let hp=enemy.hp;
 while(hp>0){
  const due=effects.filter(poison=>poison.ticks<TOXIC_TWIG_TICKS&&toxicTwigNextTick(poison)<=time+1e-9)
   .sort((a,b)=>toxicTwigNextTick(a)-toxicTwigNextTick(b))[0];
  if(!due)break;
  hp=Math.max(0,hp-toxicTwigTickDamage({...enemy,hp},due));
  due.ticks++;
 }
 return {...enemy,hp,hurtUntil:time+.15,toxicTwig:hp>0?effects.filter(poison=>poison.ticks<TOXIC_TWIG_TICKS):[]};
}

function advanceSpores(enemy:Enemy,time:number):Enemy{
 if(!enemy.spores?.some(spore=>time+1e-9>=spore.nextTick))return enemy;
 const spores=enemy.spores.map(spore=>({...spore}));
 let hp=enemy.hp;
 for(;;){
  const due=spores.filter(spore=>spore.ticks>0&&time+1e-9>=spore.nextTick).sort((a,b)=>a.nextTick-b.nextTick)[0];
  if(!due||hp<=0)break;
  hp=Math.max(0,hp-sporeTickDamage({...enemy,hp},due.quality,due.damage,due.nextTick));
  due.nextTick+=1;
  due.ticks--;
 }
 return {...enemy,hp,hurtUntil:time+.15,spores:hp>0?spores.filter(spore=>spore.ticks>0):[]};
}

function frontGuardian(state:Battle,enemyX:number):GuardianSpell|null{
 let best:GuardianSpell|null=null;
 let frontX=-Infinity;
 for(const id of GUARDIAN_SPELLS){
  const guardian=state[id];
  if(!guardian||guardian.x>enemyX||guardian.x<=frontX)continue;
  best=id;
  frontX=guardian.x;
 }
 return best;
}

function beginGuardian(state:Battle,spellId:GuardianSpell,quality:number,damageBonus:number):Battle{
 const upgrade=state.upgrades[spellId]??0;
 const {hp}=guardianStats(spellId,quality,upgrade);
 if(!hp)return state;
 const guardian:Guardian={
  x:CONTACT_X,hp,quality,damageBonus,upgrade,
  nextShotAt:state.time,hurtUntil:0,shot:null,
 };
 return {...state,[spellId]:guardian,casts:state.casts+1};
}

function moveGuardian(state:Battle,spellId:GuardianSpell,delta:number):Guardian|null{
 const guardian=state[spellId];
 if(!guardian||spellId==='shroomy')return guardian;
 if(state.motherSplit&&!state.motherSplit.spawned)return guardian;
 const range=guardianAttackRange(spellId,guardian.upgrade);
 let limit=CONTACT_X+GUARDIAN_MAX_DISTANCE;
 for(const e of state.enemies){
  if(e.hp<=0||e.spawnAt>state.time+1e-9)continue;
  if(guardianInRange(guardian,e,range))return guardian;
  if(e.x>guardian.x)limit=Math.min(limit,e.x-range);
 }
 const x=Math.max(guardian.x,Math.min(limit,guardian.x+GUARDIAN_SPEED*delta));
 return x===guardian.x?guardian:{...guardian,x};
}

function guardianInRange(guardian:Guardian,enemy:Enemy,range:number){
 return Math.abs(enemy.x-guardian.x)<=range+1e-9;
}

function advanceGuardian(state:Battle,spellId:GuardianSpell):Battle{
 const guardian=state[spellId];
 if(state.phase!=='active'||!guardian)return state;
 const {time}=state;
 const shot=guardian.shot;
 if(shot){
  if(time+1e-9<shot.started+GUARDIAN_SHOT_FLIGHT_SECONDS)return state;
  const enemies=state.enemies.map(e=>{
   if(e.id!==shot.targetId||e.hp<=0)return e;
   if(spellId==='shroomy'){
    if((e.spores?.length??0)>=SHROOMY_MAX_STACKS)return e;
    const nextTick=shot.started+GUARDIAN_SHOT_FLIGHT_SECONDS+1;
    const spore:ShroomySpore={
     quality:guardian.quality,
     damage:shroomySporePower(guardian.quality,guardian.upgrade)*guardian.damageBonus,
     slow:shroomySporeSlow(guardian.upgrade),
     nextTick,ticks:SHROOMY_SPORE_TICKS,
    };
    return {...e,spores:[...(e.spores??[]),spore]};
   }
   const damage=spellDamage(e,guardian.quality,spellId,guardian.damageBonus,guardian.upgrade,time);
   if(damage<=0)return e;
   const hp=Math.max(0,e.hp-damage);
   const shield=spellId==='scorchy'?igniteShield(e.shield,'Fire',guardian.quality,time):e.shield;
   const ignited=shield!==e.shield;
   const distance=spellKnockback(guardian.quality,spellId,state.pushBonus,e.element,e.rocky,e.shield,time,guardian.upgrade,kingHasCrown(e));
   const push=extendEnemyKnockback(state,e,distance);
   return {...e,hp,shield,hurtUntil:time+.25,push:hp===0?null:push,attackAt:hp===0||ignited?null:e.attackAt};
  });
  return resolveMother({...state,enemies,[spellId]:{...guardian,shot:null}});
 }
 if(time+1e-9<guardian.nextShotAt)return state;
 const range=guardianAttackRange(spellId,guardian.upgrade);
 const target=presentEnemies(state)
  .filter(e=>guardianInRange(guardian,e,range)&&(spellId!=='shroomy'||(e.spores?.length??0)<SHROOMY_MAX_STACKS))
  .sort((a,b)=>(spellId==='shroomy'?(a.spores?.length??0)-(b.spores?.length??0):0)||Math.abs(a.x-guardian.x)-Math.abs(b.x-guardian.x)||a.id-b.id)[0];
 if(!target)return state;
 const nextShot={x:guardian.x,targetId:target.id,started:time};
 return {...state,[spellId]:{...guardian,nextShotAt:time+guardianAttackInterval(spellId,guardian.upgrade),shot:nextShot}};
}
