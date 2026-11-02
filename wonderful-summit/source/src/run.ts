import {pickByRarity,type RelicRarity,type SpellRarity} from './rarity.ts';
import {rollTrailEvent,forgottenCampsiteOutcome,type TrailEventState} from './events.ts';
import {worstDrawing,bestDrawing,type PlayerDrawing} from './drawings.ts';
import {SPELLS,PLAYER_SPELLS,isUpgradableSpell,type SpellId} from './magic.ts';
import {newBattle,COMMON_POTIONS,RARE_POTIONS,SHOP_POTIONS,potionPrice,rollRewardPotion,POTION_IDS,type BottledSpell,type PotionCounts,type Battle,type Potion,type Encounter} from './battle.ts';
export type RelicId='amber'|'moss'|'feather'|'bell'|'moon'|'sunAmulet'|'moonAmulet'|'twilightAmulet'|'twillyScarf'|'birkinStock'|'midnightStone'|'lotus'|'colorfulRock'|'impossibleShale'|'forgivingCalculus'|'blackStardust'|'sevenLeafClover'|'artisanRobes'|'filadoraRobes'|'perfectedSphere'|'coinpurse'|'untouchedBox';
export const RELICS:Record<RelicId,{rarity:RelicRarity;name:string;icon:string;description:string}>={coinpurse:{rarity:'Keepsake',name:'Theodora’s Coinpurse',icon:'◈',description:'Gain 80 gold upon collection.'},untouchedBox:{rarity:'Keepsake',name:'Untouched Box',icon:'▣',description:'Upon collection, receive two random non-keepsake relics.'},perfectedSphere:{rarity:'Rare',name:'Perfected Sphere',icon:'◉',description:"All spells deal 15% more damage... as long as you don't fizzle."},filadoraRobes:{rarity:'Starter',name:'Filadora’s robes',icon:'♜',description:'Each distinct spell cast with true Wonderful accuracy grants +2% damage to all spells for this run. Bonus accuracy does not qualify.'},forgivingCalculus:{rarity:'Rare',name:'Forgiving Calculus',icon:'∫',description:'Adds 3 percentage points of spell accuracy. Your best spell showcase uses your original drawing accuracy.'},blackStardust:{rarity:'Rare',name:'Perfected Spheredust',icon:'◌',description:'Your first fizzle each combat deals 10 damage to all present enemies and knocks them back slightly.'},sevenLeafClover:{rarity:'Common',name:'7 leaf clover',icon:'☘',description:'If you cast 6 consecutive competent spells in a row, your 7th spell has +7% spell quality.'},artisanRobes:{rarity:'Rare',name:'Artisan robes',icon:'♜',description:'Replaces Filadora’s robes. Each distinct true Wonderful spell grants +4% damage for this run, including spells already earned.'},lotus:{rarity:'Uncommon',name:'Blooming Lotus',icon:'❀',description:'Your first offensive spell each combat deals 30% extra damage.'},colorfulRock:{rarity:'Uncommon',name:'Colorful Rock',icon:'◈',description:'Spells deal 15% more damage when their element differs from your last played spell.'},impossibleShale:{rarity:'Uncommon',name:'Impossible Shale',icon:'⬢',description:'Attackers are permanently cursed, taking 5 damage every second. Breaks after 3 contacts.'},midnightStone:{rarity:'Rare',name:'Midnight stone',icon:'⬟',description:'This dark stone reacts to ink, giving spells more power the more ink used.'},amber:{rarity:'Keepsake',name:"Madora’s Earring",icon:'◆',description:'All spells deal 5% more damage.'},moss:{rarity:'Keepsake',name:'Moss Locket',icon:'❧',description:'Recover 10 health after every victory.'},feather:{rarity:'Keepsake',name:'Giant Inkwell',icon:'⌁',description:'Drawing consumes 20% less ink.'},bell:{rarity:'Common',name:'Glass Bell',icon:'♧',description:'The first enemy to hit you each battle is pushed back an extra 80 units.'},moon:{rarity:'Common',name:'Gravity Needle',icon:'☾',description:'All knockback increases by 15%.'},sunAmulet:{rarity:'Rare',name:'Sun Amulet',icon:'☀',description:'Competent fire spells deal an additional 30% of hit damage as burn over 3 seconds. Fire enemies cannot be burned.'},moonAmulet:{rarity:'Rare',name:'Moon Amulet',icon:'☽',description:'Competent water spells deal 15% more damage and knockback.'},twilightAmulet:{rarity:'Rare',name:'Twilight Amulet',icon:'✺',description:'Competent nature spells deal 15% more damage and have a 50% chance to briefly root enemies. Nature enemies are immune to roots.'},twillyScarf:{rarity:'Rare',name:"Belladora's Twilly Scarf",icon:'⋈',description:'Every combat victory offers a potion reward.'},birkinStock:{rarity:'Uncommon',name:'Birkin-stock',icon:'▣',description:'Belladora holds 2 additional potions. Who\'s a good purse!'}};
export const BEGINNER_SPELLS:SpellId[]=['water','fire','nature'];
export const STARTER_RELICS:RelicId[]=['amber','moss','feather','coinpurse','untouchedBox'];
export const ROUTE=[{kind:'battle',name:'Meadow crossing',icon:'sword',encounter:'slime'},{kind:'battle',name:'Twin thicket',icon:'sword',encounter:'pack'},{kind:'shop',name:'Sea Merchant',icon:'$'},{kind:'battle',name:'Goblin lookout',icon:'♜',elite:true,encounter:'elite'},{kind:'camp',name:'Firefly campsite',icon:'campfire'},{kind:'battle',name:'The upper meadow',icon:'sword',encounter:'upperMeadow'},{kind:'battle',name:'Rocky clearing',icon:'♜',elite:true,encounter:'rock'},{kind:'event',name:'Forgotten Campsite',icon:'?'},{kind:'battle',name:'Woodland barricade',icon:'sword',encounter:'shieldPack'},{kind:'shop',name:'Sea Merchant',icon:'$'},{kind:'camp',name:'Mossy grove campsite',icon:'campfire'},{kind:'battle',name:'Slime Mother',icon:'♛',encounter:'mother'}] as const;
export function isEliteNode(node:number){const entry=ROUTE[node];return !!entry&&'elite' in entry&&entry.elite;}
export function encounterGold(node:number,random:()=>number=Math.random){
 const encounter=ROUTE[node];if(!encounter||encounter.kind!=='battle')return 0;
 if(encounter.encounter==='mother')return 60;
 const minimum=isEliteNode(node)?37:27;
 return minimum+Math.max(0,Math.min(5,Math.floor(random()*6)));
}
export type RunScreen='opening'|'menu'|'tutorial'|'sister'|'map'|'battle'|'rewards'|'shop'|'camp'|'event'|'complete'|'defeat';
export type Stock={id:string;kind:'spell'|'potion'|'relic';item:SpellId|Potion|RelicId;price:number;sold:boolean};
export type Reward={gold:number;potion:Potion|null;offers:SpellId[];relic:RelicId|null;goldClaimed:boolean;potionStatus:'pending'|'collected'|'skipped';relicClaimed:boolean;learned:SpellId|null};
export type Run={reviewedSpells:SpellId[];keepsakeOffers:RelicId[];wonderfulSpells:SpellId[];stellarReady:boolean;developerTrailUnlocked:boolean;event:TrailEventState|null;bestDrawing:PlayerDrawing|null;worstDrawing:PlayerDrawing|null;shaleContacts:number;screen:RunScreen;node:number;health:number;gold:number;combats:number;spells:SpellId[];upgrades:Partial<Record<SpellId,number>>;relics:RelicId[];potions:PotionCounts;bottledSpells:BottledSpell[];pendingBottle:boolean;furyReady:boolean;reward:Reward|null;stock:Stock[];campUsed:boolean};
export function newRun():Run{return{reviewedSpells:[...BEGINNER_SPELLS],keepsakeOffers:[],wonderfulSpells:[],stellarReady:false,developerTrailUnlocked:false,event:null,bestDrawing:null,worstDrawing:null,shaleContacts:0,screen:'opening',node:0,health:100,gold:0,combats:0,spells:[...BEGINNER_SPELLS],upgrades:{},relics:['filadoraRobes'],potions:{theodoraHeal:1,heal:0,freeze:0,ink:0},bottledSpells:[],pendingBottle:false,furyReady:false,reward:null,stock:[],campUsed:false};}
export function finishOpening(run:Run):Run{return run.screen==='opening'?{...run,screen:'menu'}:run;}
export function rollKeepsakeOffers(random:()=>number=Math.random):RelicId[]{
 const pool=[...STARTER_RELICS],offers:RelicId[]=[];
 while(offers.length<3&&pool.length){const index=Math.max(0,Math.min(pool.length-1,Math.floor(random()*pool.length)));offers.push(pool.splice(index,1)[0]);}
 return offers;
}
export function selectMode(run:Run,mode:'new'|'tutorial',random:()=>number=Math.random):Run{return run.screen==='menu'?{...newRun(),keepsakeOffers:mode==='new'?rollKeepsakeOffers(random):[],screen:mode==='new'?'sister':'tutorial'}:run;}
export function returnToMenu():Run{return{...newRun(),screen:'menu'};}
const pick=<T,>(list:T[],random:()=>number)=>list[Math.min(list.length-1,Math.floor(random()*list.length))];
const SPELL_WEIGHTS:Record<SpellRarity,number>={Common:90,Uncommon:90,Legendary:10};
const RELIC_WEIGHTS:Record<RelicRarity,number>={Common:60,Uncommon:30,Rare:10,Keepsake:0,Starter:0};
const spellRarity=(id:SpellId)=>SPELLS.find(s=>s.id===id)!.rarity;
const pickSpell=(items:SpellId[],random:()=>number)=>pickByRarity(items,spellRarity,SPELL_WEIGHTS,random);
const pickRelic=(items:RelicId[],random:()=>number)=>pickByRarity(items,id=>RELICS[id].rarity,RELIC_WEIGHTS,random);
export function spellPrice(id:SpellId){return ['firestorm','bog','tidalcrest'].includes(id)?50:spellRarity(id)==='Legendary'?70:45;}
export function relicPrice(id:RelicId){return {Common:50,Uncommon:70,Rare:85,Keepsake:45,Starter:0}[RELICS[id].rarity];}
export function startRun(run:Run,relic:RelicId,random:()=>number=Math.random):Run{if(run.screen!=='sister'||!run.keepsakeOffers.includes(relic))return run;return acquireRelic({...run,screen:'map',spells:[...BEGINNER_SPELLS],relics:['filadoraRobes']},relic,random);}
export function potionCapacity(run:Pick<Run,'relics'>){return run.relics.includes('birkinStock')?5:3;}
// Expand every bottle into a separate slot, including duplicate potion types.
export function potionSlots(potions:PotionCounts,capacity:number):(Potion|null)[]{const bottles=POTION_IDS.flatMap(id=>Array.from({length:potions[id]??0},()=>id));return [...bottles,...Array.from({length:Math.max(0,capacity-bottles.length)},()=>null)];}
export function potionCount(run:Run){return Object.values(run.potions).reduce((a,b)=>a+b,0);}
export function enterNode(run:Run,random:()=>number=Math.random):Run{
 if(run.pendingBottle||run.screen!=='map'||run.node>=ROUTE.length)return run;
 const node=ROUTE[run.node];
 if(node.kind==='battle')return{...run,screen:'battle'};
 if(node.kind==='event')return{...run,screen:'event',event:rollTrailEvent(random),campUsed:false};
 if(node.kind==='camp')return{...run,screen:'camp',campUsed:false};
 const allSpells=PLAYER_SPELLS.map(s=>s.id),allRelics=(Object.keys(RELICS) as RelicId[]).filter(id=>relicCanDrop(run,id)&&!(id==='impossibleShale'&&run.shaleContacts>=3));
 // Prefer unowned items, but keep the six-card layout when a collection is complete.
 const chooseTwo=(all:RelicId[],unowned:RelicId[])=>{const result:RelicId[]=[];while(result.length<2){const preferred=unowned.filter(x=>!result.includes(x)),pool=preferred.length?preferred:all.filter(x=>!result.includes(x));result.push(pickRelic(pool,random));}return result;};
 const stock:Stock[]=[pick(COMMON_POTIONS,random),pick(RARE_POTIONS,random)].map(item=>({id:`potion-${item}`,kind:'potion',item,price:potionPrice(item),sold:false}));
 const unlearned=allSpells.filter(id=>!run.spells.includes(id));
 for(let slot=0;slot<2;slot++){
  if(unlearned.length){const item=pickSpell(unlearned,random);unlearned.splice(unlearned.indexOf(item),1);stock.push({id:`spell-${item}`,kind:'spell',item,price:spellPrice(item),sold:false});}
  else {const available=SHOP_POTIONS.filter(id=>!stock.some(s=>s.kind==='potion'&&s.item===id)),item=pick(available.length?available:SHOP_POTIONS,random);stock.push({id:`potion-extra-${slot}`,kind:'potion',item,price:potionPrice(item),sold:false});}
 }
 for(const item of chooseTwo(allRelics,allRelics.filter(id=>!run.relics.includes(id))))stock.push({id:`relic-${item}`,kind:'relic',item,price:relicPrice(item),sold:false});
 return{...run,screen:'shop',stock};
}
export function battleForRun(run:Run,random:()=>number=Math.random):Battle{
 const node=ROUTE[run.node];const battle=newBattle('active',node.kind==='battle'?node.encounter as Encounter:'slime',random);
 return{...battle,stellarReady:run.stellarReady,robes:{enabled:run.relics.includes('filadoraRobes')||run.relics.includes('artisanRobes'),artisan:run.relics.includes('artisanRobes'),spells:[...run.wonderfulSpells]},castingRelics:{...battle.castingRelics,calculus:run.relics.includes('forgivingCalculus'),sphere:run.relics.includes('perfectedSphere'),stardust:run.relics.includes('blackStardust'),clover:run.relics.includes('sevenLeafClover')},bestDrawing:run.bestDrawing,worstDrawing:run.worstDrawing,lotus:run.relics.includes('lotus'),lotusReady:run.relics.includes('lotus'),colorful:run.relics.includes('colorfulRock'),shaleActive:run.relics.includes('impossibleShale')&&run.shaleContacts<3,shaleContacts:run.shaleContacts,furyReady:run.furyReady,midnightStone:run.relics.includes('midnightStone'),amulets:{sun:run.relics.includes('sunAmulet'),moon:run.relics.includes('moonAmulet'),twilight:run.relics.includes('twilightAmulet')},enemies:battle.enemies.map(e=>run.node===1&&e.id===2?{...e,spawnAt:10}:e),playerHP:run.health,potions:{...run.potions},bottledSpells:run.bottledSpells.map(s=>({...s})),upgrades:{...run.upgrades},damageBonus:run.relics.includes('amber')?1.05:1,pushBonus:run.relics.includes('moon')?1.15:1,firstHitPush:run.relics.includes('bell')?80:0,difficulty:run.node>=5?1.2:1};
}
export function finishBattle(run:Run,battle:Battle,random:()=>number=Math.random):Run{
 if(run.screen!=='battle'||!['victory','defeat'].includes(battle.phase))return run;
 const carried={...run,relics:combatRelicIds(run.relics,battle),worstDrawing:worstDrawing(run.worstDrawing,battle.worstDrawing),wonderfulSpells:[...battle.robes.spells],stellarReady:battle.stellarReady,bestDrawing:bestDrawing(run.bestDrawing,battle.bestDrawing),shaleContacts:battle.shaleContacts,furyReady:battle.furyReady,health:battle.playerHP,potions:{...battle.potions},bottledSpells:battle.bottledSpells.map(s=>({...s}))};
 if(battle.phase==='defeat')return{...carried,screen:'defeat'};
 const combats=run.combats+1;
 const potion=(run.relics.includes('twillyScarf')||random()<.35)?rollRewardPotion(random):null;
 const unknown=PLAYER_SPELLS.filter(s=>!run.spells.includes(s.id)).map(s=>s.id),offers:SpellId[]=[];
 if(combats%3===0)for(let i=0;i<2&&unknown.length;i++){const id=pickSpell(unknown,random);unknown.splice(unknown.indexOf(id),1);offers.push(id);}
 const available=(Object.keys(RELICS) as RelicId[]).filter(id=>relicCanDrop(carried,id)&&!carried.relics.includes(id)&&!(id==='impossibleShale'&&run.shaleContacts>=3));const relic=isEliteNode(run.node)&&available.length?pickRelic(available,random):null;
 const gold=encounterGold(run.node,random);
 return{...carried,screen:'rewards',combats,health:Math.min(100,battle.playerHP+(run.relics.includes('moss')?10:0)),reward:{gold,potion,offers,relic,goldClaimed:false,potionStatus:potion?'pending':'skipped',relicClaimed:!relic,learned:null}};
}
export function claimGold(run:Run):Run{
 const r=run.reward;if(run.screen!=='rewards'||!r||r.goldClaimed)return run;
 return{...run,gold:run.gold+r.gold,reward:{...r,goldClaimed:true}};
}
export function claimPotion(run:Run,replacement?:Potion):Run{
 const r=run.reward;if(run.pendingBottle||run.screen!=='rewards'||!r||!r.potion||r.potionStatus!=='pending')return run;
 const potions={...run.potions},replacing=potionCount(run)>=potionCapacity(run);
 if(replacing){if(!replacement||!(potions[replacement]??0))return run;potions[replacement]=(potions[replacement]??0)-1;}
 potions[r.potion]=(potions[r.potion]??0)+1;
 return{...run,potions,bottledSpells:replacing&&replacement==='spellBottle'?run.bottledSpells.slice(1):run.bottledSpells,pendingBottle:r.potion==='spellBottle',reward:{...r,potionStatus:'collected'}};
}
export function claimRelic(run:Run):Run{
 const r=run.reward;if(run.screen!=='rewards'||!r||!r.relic||r.relicClaimed)return run;
 return{...acquireRelic(run,r.relic),reward:{...r,relicClaimed:true}};
}
export function skipRewardPotion(run:Run):Run{
 const r=run.reward;if(run.pendingBottle||run.screen!=='rewards'||!r||!r.potion||r.potionStatus!=='pending')return run;
 return{...run,reward:{...r,potionStatus:'skipped'}};
}
export function rewardsComplete(r:Reward){return r.goldClaimed&&r.relicClaimed&&(r.offers.length===0||!!r.learned);}
export function learnReward(run:Run,id:SpellId):Run{const r=run.reward;if(run.screen!=='rewards'||!r||r.learned||!r.offers.includes(id)||run.spells.includes(id))return run;return{...run,spells:[...run.spells,id],reward:{...r,learned:id}};}
export function leaveNode(run:Run):Run{
 if(run.pendingBottle)return run;
 if(run.screen==='rewards'&&(!run.reward||!rewardsComplete(run.reward)))return run;
 if(!['rewards','shop','camp','event'].includes(run.screen)||(run.screen==='camp'||run.screen==='event'&&run.event?.outcome==='lit')&&!run.campUsed)return run;
 return{...run,node:run.node+1,screen:run.node+1>=ROUTE.length?'complete':'map',reward:null,event:null};
}
export function buy(run:Run,id:string):Run{const item=run.stock.find(s=>s.id===id);if(run.pendingBottle||run.screen!=='shop'||!item||item.sold||run.gold<item.price)return run;
 if(item.kind==='potion'&&potionCount(run)>=potionCapacity(run)||item.kind==='spell'&&run.spells.includes(item.item as SpellId)||item.kind==='relic'&&run.relics.includes(item.item as RelicId))return run;
 const next={...run,gold:run.gold-item.price,stock:run.stock.map(s=>s.id===id?{...s,sold:true}:s)};
 if(item.kind==='potion')return{...next,pendingBottle:item.item==='spellBottle',potions:{...run.potions,[item.item]:(run.potions[item.item as Potion]??0)+1}};
 if(item.kind==='spell')return{...next,spells:[...run.spells,item.item as SpellId]};return acquireRelic(next,item.item as RelicId);
}
export function discardPotion(run:Run,id:Potion,bottleIndex=0):Run{
 if(run.pendingBottle||!['sister','map','rewards','shop','camp','event','complete','defeat'].includes(run.screen)||(run.potions[id]??0)<=0)return run;
 if(id==='spellBottle'&&(!Number.isInteger(bottleIndex)||bottleIndex<0||bottleIndex>=(run.potions[id]??0)))return run;
 return{...run,bottledSpells:id==='spellBottle'?run.bottledSpells.filter((_,index)=>index!==bottleIndex):run.bottledSpells,potions:{...run.potions,[id]:(run.potions[id]??0)-1}};
}
export function drinkTrailHealing(run:Run,id:Potion='heal'):Run{
 if(['opening','menu','battle','defeat'].includes(run.screen)||run.pendingBottle||run.health<=0||run.health>=100||(id!=='heal'&&id!=='theodoraHeal')||(run.potions[id]??0)<1)return run;
 return{...run,health:Math.min(100,run.health+(id==='theodoraHeal'?35:30)),potions:{...run.potions,[id]:(run.potions[id]??0)-1}};
}
export function camp(run:Run,spell?:SpellId):Run{if(run.pendingBottle||!(run.screen==='camp'||run.screen==='event'&&run.event?.outcome==='lit')||run.campUsed||spell&&(!run.spells.includes(spell)||!isUpgradableSpell(spell)))return run;
 if(spell&&((run.upgrades[spell]??0)>=1))return run;
 return spell?{...run,campUsed:true,upgrades:{...run.upgrades,[spell]:(run.upgrades[spell]??0)+1}}:{...run,campUsed:true,health:Math.min(100,run.health+70)};
}

export function sealBottle(run:Run,spell:BottledSpell):Run{
 if(!run.pendingBottle)return run;
 const valid=spell.spellId&&run.spells.includes(spell.spellId)&&Number.isFinite(spell.quality)&&spell.quality>=48;
 return{...(!valid?shatterTrailSphere(run):run),pendingBottle:false,worstDrawing:valid?worstDrawing(run.worstDrawing,spell.drawing):run.worstDrawing,bestDrawing:bestDrawing(run.bestDrawing,spell.drawing),bottledSpells:[...run.bottledSpells,{spellId:valid?spell.spellId:null,quality:Math.max(0,Math.min(100,Number.isFinite(spell.quality)?spell.quality:0)),...(spell.drawing?{drawing:spell.drawing}:{}),...(spell.inkUsed===undefined?{}:{inkUsed:Number.isFinite(spell.inkUsed)?Math.max(0,spell.inkUsed):0})}]};
}
export function merchantDialogue(node:number){return node>7?"I'm saving money to buy a cozy sweater for winter. How are you staying warm?":"The summit is glowing like a deep sea anglerfish today. I'm a sea urchin by the way. Oh! Did you need something?";}

export function castTrailEvent(run:Run,spellId:SpellId|null,quality:number,drawing?:PlayerDrawing):Run{
 if(run.pendingBottle||run.screen!=='event'||!run.event||run.event.outcome!=='pending')return run;
 const known=spellId&&run.spells.includes(spellId)?spellId:null;
 return{...(!known||quality<48?shatterTrailSphere(run):run),worstDrawing:known&&quality>=48?worstDrawing(run.worstDrawing,drawing):run.worstDrawing,event:{...run.event,outcome:forgottenCampsiteOutcome(known,quality),quality:Math.max(0,Math.min(100,Number.isFinite(quality)?quality:0))},bestDrawing:bestDrawing(run.bestDrawing,drawing)};
}

export function unlockDeveloperTrail(run:Run):Run{return run.screen==='map'&&!run.pendingBottle&&!run.developerTrailUnlocked?{...run,developerTrailUnlocked:true}:run;}
export function selectTrailNode(run:Run,node:number,random:()=>number=Math.random):Run{
 if(run.screen!=='map'||run.pendingBottle||!Number.isInteger(node)||node<0||node>=ROUTE.length||node!==run.node&&!run.developerTrailUnlocked)return run;
 return enterNode({...run,node},random);
}


export function acquireRelic(run:Run,id:RelicId,random:()=>number=Math.random):Run{
 if(run.relics.includes(id)||id==='perfectedSphere'&&run.relics.includes('blackStardust')||id==='filadoraRobes'&&run.relics.includes('artisanRobes'))return run;
 let next={...run,gold:run.gold+(id==='coinpurse'?80:0),relics:[...new Set([...run.relics.filter(old=>id!=='artisanRobes'||old!=='filadoraRobes'),id])]};
 if(id!=='untouchedBox')return next;
 for(let i=0;i<2;i++){
  const available=(Object.keys(RELICS) as RelicId[]).filter(item=>relicCanDrop(next,item)&&!next.relics.includes(item)&&!(item==='impossibleShale'&&next.shaleContacts>=3));
  if(!available.length)break;
  next=acquireRelic(next,pickRelic(available,random),random);
 }
 return next;
}
export function runRobesBonus(run:Run){return run.wonderfulSpells.length*(run.relics.includes('artisanRobes')?4:run.relics.includes('filadoraRobes')?2:0);}

// Black Stardust is a transformation only; never offer another sphere after it.
export function relicCanDrop(run:Pick<Run,'relics'>,id:RelicId){return !STARTER_RELICS.includes(id)&&RELICS[id].rarity!=='Starter'&&id!=='blackStardust'&&!(id==='perfectedSphere'&&run.relics.includes('blackStardust'));}
export function combatRelicIds(relics:RelicId[],battle:Pick<Battle,'sphereShatteredAt'>):RelicId[]{
 return [...new Set(relics.map(id=>id==='perfectedSphere'&&battle.sphereShatteredAt!==null?'blackStardust':id))];
}
export function shatterTrailSphere(run:Run):Run{
 if(!run.relics.includes('perfectedSphere'))return run;
 return {...run,relics:[...new Set(run.relics.map(id=>id==='perfectedSphere'?'blackStardust' as const:id))]};
}

export function markSpellsReviewed(run:Run):Run{if(run.screen!=='battle')return run;return {...run,reviewedSpells:[...new Set([...run.reviewedSpells,...run.spells])]};}
