import {SPELLS,type SpellId} from './magic.ts';
import {newBattle,COMMON_POTIONS,RARE_POTIONS,potionPrice,rollRewardPotion,POTION_IDS,type BottledSpell,type PotionCounts,type Battle,type Potion,type Encounter} from './battle.ts';
export type RelicId='amber'|'moss'|'feather'|'bell'|'moon'|'sunAmulet'|'moonAmulet'|'twilightAmulet'|'twillyScarf'|'birkinStock'|'midnightStone'|'lotus'|'colorfulRock'|'impossibleShale';
export const RELICS:Record<RelicId,{name:string;icon:string;description:string}>={lotus:{name:'Blooming Lotus',icon:'❀',description:'Your first offensive spell each combat deals 30% extra damage.'},colorfulRock:{name:'Colorful Rock',icon:'◈',description:'Spells deal 15% more damage when their element differs from your last played spell.'},impossibleShale:{name:'Impossible Shale',icon:'⬢',description:'Attackers are permanently cursed, taking 5 damage each second. Breaks after 3 contacts.'},midnightStone:{name:'Midnight stone',icon:'⬟',description:'This dark stone reacts to ink, giving spells more power the more ink used.'},amber:{name:"Madora’s Earring",icon:'◆',description:'Spells deal 15% more direct damage.'},moss:{name:'Moss Locket',icon:'❧',description:'Recover 12 health after every victory.'},feather:{name:'Heirloom inkwell',icon:'⌁',description:'Drawing consumes 20% less ink.'},bell:{name:'Glass Bell',icon:'♧',description:'The first enemy to hit you each battle is pushed back an extra 80 units.'},moon:{name:'Gravity Needle',icon:'☾',description:'All knockback increases by 15%.'},sunAmulet:{name:'Sun Amulet',icon:'☀',description:'Steady or better Fire spells deal an additional 30% of hit damage as burn over 3 seconds. Fire enemies cannot be burned.'},moonAmulet:{name:'Moon Amulet',icon:'☽',description:'Steady or better Water spells deal 15% more damage and knockback. Elemental resistances still apply.'},twilightAmulet:{name:'Twilight Amulet',icon:'✺',description:'Steady or better Nature spells deal 15% more damage and have a 50% chance to root enemies for 1.5 seconds. Nature enemies are immune to roots.'},twillyScarf:{name:"Belladora's Twilly Scarf",icon:'⋈',description:'Every combat victory offers a potion reward.'},birkinStock:{name:'Birkin-stock',icon:'▣',description:'Belladora holds 2 additional potions. Each potion takes its own slot, for a total capacity of 5.'}};
export const BEGINNER_SPELLS:SpellId[]=['water','fire','nature'];
export const STARTER_RELICS:RelicId[]=['amber','moss','feather'];
export const ROUTE=[{kind:'battle',name:'Meadow crossing',icon:'sword',encounter:'slime'},{kind:'battle',name:'Twin thicket',icon:'sword',encounter:'pack'},{kind:'shop',name:'Sea Merchant',icon:'$'},{kind:'battle',name:'Goblin lookout',icon:'♜',encounter:'elite'},{kind:'camp',name:'Firefly campsite',icon:'campfire'},{kind:'battle',name:'The upper meadow',icon:'sword',encounter:'upperMeadow'},{kind:'battle',name:'Rocky clearing',icon:'sword',encounter:'rock'},{kind:'battle',name:'Woodland barricade',icon:'sword',encounter:'shieldPack'},{kind:'shop',name:'Sea Merchant',icon:'$'},{kind:'camp',name:'Mossy grove campsite',icon:'campfire'},{kind:'battle',name:'Slime Mother',icon:'♛',encounter:'mother'}] as const;
export type RunScreen='opening'|'menu'|'tutorial'|'sister'|'map'|'battle'|'rewards'|'shop'|'camp'|'complete'|'defeat';
export type Stock={id:string;kind:'spell'|'potion'|'relic';item:SpellId|Potion|RelicId;price:number;sold:boolean};
export type Reward={gold:number;potion:Potion|null;offers:SpellId[];relic:RelicId|null;goldClaimed:boolean;potionStatus:'pending'|'collected'|'skipped';relicClaimed:boolean;learned:SpellId|null};
export type Run={shaleContacts:number;screen:RunScreen;node:number;health:number;gold:number;combats:number;spells:SpellId[];upgrades:Partial<Record<SpellId,number>>;relics:RelicId[];potions:PotionCounts;bottledSpells:BottledSpell[];pendingBottle:boolean;furyReady:boolean;reward:Reward|null;stock:Stock[];campUsed:boolean};
export function newRun():Run{return{shaleContacts:0,screen:'opening',node:0,health:100,gold:0,combats:0,spells:[...BEGINNER_SPELLS],upgrades:{},relics:[],potions:{heal:1,freeze:0,ink:0},bottledSpells:[],pendingBottle:false,furyReady:false,reward:null,stock:[],campUsed:false};}
export function finishOpening(run:Run):Run{return run.screen==='opening'?{...run,screen:'menu'}:run;}
export function selectMode(run:Run,mode:'new'|'tutorial'):Run{return run.screen==='menu'?{...newRun(),screen:mode==='new'?'sister':'tutorial'}:run;}
export function returnToMenu():Run{return{...newRun(),screen:'menu'};}
const pick=<T,>(list:T[],random:()=>number)=>list[Math.min(list.length-1,Math.floor(random()*list.length))];
export function startRun(run:Run,relic:RelicId):Run{if(run.screen!=='sister'||!STARTER_RELICS.includes(relic))return run;return{...run,screen:'map',spells:[...BEGINNER_SPELLS],relics:[relic]};}
export function potionCapacity(run:Pick<Run,'relics'>){return run.relics.includes('birkinStock')?5:3;}
// Expand every bottle into a separate slot, including duplicate potion types.
export function potionSlots(potions:PotionCounts,capacity:number):(Potion|null)[]{const bottles=POTION_IDS.flatMap(id=>Array.from({length:potions[id]??0},()=>id));return [...bottles,...Array.from({length:Math.max(0,capacity-bottles.length)},()=>null)];}
export function potionCount(run:Run){return Object.values(run.potions).reduce((a,b)=>a+b,0);}
export function enterNode(run:Run,random:()=>number=Math.random):Run{
 if(run.pendingBottle||run.screen!=='map'||run.node>=ROUTE.length)return run;
 const node=ROUTE[run.node];
 if(node.kind==='battle')return{...run,screen:'battle'};
 if(node.kind==='camp')return{...run,screen:'camp',campUsed:false};
 const allSpells=SPELLS.map(s=>s.id),allRelics=(Object.keys(RELICS) as RelicId[]).filter(id=>!STARTER_RELICS.includes(id)&&!(id==='impossibleShale'&&run.shaleContacts>=3));
 // Prefer unowned items, but keep the six-card layout when a collection is complete.
 const chooseTwo=<T,>(all:T[],unowned:T[])=>{const result:T[]=[];while(result.length<2){const preferred=unowned.filter(x=>!result.includes(x)),pool=preferred.length?preferred:all.filter(x=>!result.includes(x));result.push(pick(pool,random));}return result;};
 const stock:Stock[]=[pick(COMMON_POTIONS,random),pick(RARE_POTIONS,random)].map(item=>({id:`potion-${item}`,kind:'potion',item,price:potionPrice(item),sold:false}));
 const unlearned=allSpells.filter(id=>!run.spells.includes(id));
 for(let slot=0;slot<2;slot++){
  if(unlearned.length){const item=pick(unlearned,random);unlearned.splice(unlearned.indexOf(item),1);stock.push({id:`spell-${item}`,kind:'spell',item,price:28,sold:false});}
  else {const available=POTION_IDS.filter(id=>!stock.some(s=>s.kind==='potion'&&s.item===id)),item=pick(available.length?available:POTION_IDS,random);stock.push({id:`potion-extra-${slot}`,kind:'potion',item,price:potionPrice(item),sold:false});}
 }
 for(const item of chooseTwo(allRelics,allRelics.filter(id=>!run.relics.includes(id))))stock.push({id:`relic-${item}`,kind:'relic',item,price:45,sold:false});
 return{...run,screen:'shop',stock};
}
export function battleForRun(run:Run,random:()=>number=Math.random):Battle{
 const node=ROUTE[run.node];const battle=newBattle('active',node.kind==='battle'?node.encounter as Encounter:'slime',random);
 return{...battle,lotus:run.relics.includes('lotus'),lotusReady:run.relics.includes('lotus'),colorful:run.relics.includes('colorfulRock'),shaleActive:run.relics.includes('impossibleShale')&&run.shaleContacts<3,shaleContacts:run.shaleContacts,furyReady:run.furyReady,midnightStone:run.relics.includes('midnightStone'),amulets:{sun:run.relics.includes('sunAmulet'),moon:run.relics.includes('moonAmulet'),twilight:run.relics.includes('twilightAmulet')},enemies:battle.enemies.map(e=>run.node===1&&e.id===2?{...e,spawnAt:10}:e),playerHP:run.health,potions:{...run.potions},bottledSpells:run.bottledSpells.map(s=>({...s})),upgrades:{...run.upgrades},damageBonus:run.relics.includes('amber')?1.15:1,pushBonus:run.relics.includes('moon')?1.15:1,firstHitPush:run.relics.includes('bell')?80:0,difficulty:run.node>=5?1.2:1};
}
export function finishBattle(run:Run,battle:Battle,random:()=>number=Math.random):Run{
 if(run.screen!=='battle'||!['victory','defeat'].includes(battle.phase))return run;
 const carried={...run,shaleContacts:battle.shaleContacts,relics:battle.shaleContacts>=3?run.relics.filter(id=>id!=='impossibleShale'):run.relics,furyReady:battle.furyReady,health:battle.playerHP,potions:{...battle.potions},bottledSpells:battle.bottledSpells.map(s=>({...s}))};
 if(battle.phase==='defeat')return{...carried,screen:'defeat'};
 const combats=run.combats+1,gold=run.node===3?40:run.node>=5?35:run.node===1?30:25;
 const potion=(run.relics.includes('twillyScarf')||random()<.35)?rollRewardPotion(random):null;
 const unknown=SPELLS.filter(s=>!run.spells.includes(s.id)).map(s=>s.id),offers:SpellId[]=[];
 if(combats%2===0)for(let i=0;i<3&&unknown.length;i++){const id=pick(unknown,random);unknown.splice(unknown.indexOf(id),1);offers.push(id);}
 const available=(Object.keys(RELICS) as RelicId[]).filter(id=>!STARTER_RELICS.includes(id)&&!run.relics.includes(id)&&!(id==='impossibleShale'&&run.shaleContacts>=3));const relic=run.node===3&&available.length?pick(available,random):null;
 return{...carried,screen:'rewards',combats,health:Math.min(100,battle.playerHP+(run.relics.includes('moss')?12:0)),reward:{gold,potion,offers,relic,goldClaimed:false,potionStatus:potion?'pending':'skipped',relicClaimed:!relic,learned:null}};
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
 return{...run,relics:run.relics.includes(r.relic)?run.relics:[...run.relics,r.relic],reward:{...r,relicClaimed:true}};
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
 if(!['rewards','shop','camp'].includes(run.screen)||run.screen==='camp'&&!run.campUsed)return run;
 return{...run,node:run.node+1,screen:run.node+1>=ROUTE.length?'complete':'map',reward:null};
}
export function buy(run:Run,id:string):Run{const item=run.stock.find(s=>s.id===id);if(run.pendingBottle||run.screen!=='shop'||!item||item.sold||run.gold<item.price)return run;
 if(item.kind==='potion'&&potionCount(run)>=potionCapacity(run)||item.kind==='spell'&&run.spells.includes(item.item as SpellId)||item.kind==='relic'&&run.relics.includes(item.item as RelicId))return run;
 const next={...run,gold:run.gold-item.price,stock:run.stock.map(s=>s.id===id?{...s,sold:true}:s)};
 if(item.kind==='potion')return{...next,pendingBottle:item.item==='spellBottle',potions:{...run.potions,[item.item]:(run.potions[item.item as Potion]??0)+1}};
 if(item.kind==='spell')return{...next,spells:[...run.spells,item.item as SpellId]};return{...next,relics:[...run.relics,item.item as RelicId]};
}
export function discardPotion(run:Run,id:Potion,bottleIndex=0):Run{
 if(run.pendingBottle||!['sister','map','rewards','shop','camp','complete','defeat'].includes(run.screen)||(run.potions[id]??0)<=0)return run;
 if(id==='spellBottle'&&(!Number.isInteger(bottleIndex)||bottleIndex<0||bottleIndex>=(run.potions[id]??0)))return run;
 return{...run,bottledSpells:id==='spellBottle'?run.bottledSpells.filter((_,index)=>index!==bottleIndex):run.bottledSpells,potions:{...run.potions,[id]:(run.potions[id]??0)-1}};
}
export function camp(run:Run,spell?:SpellId):Run{if(run.screen!=='camp'||run.campUsed||spell&&!run.spells.includes(spell))return run;
 if(spell&&((run.upgrades[spell]??0)>=1))return run;
 return spell?{...run,campUsed:true,upgrades:{...run.upgrades,[spell]:(run.upgrades[spell]??0)+1}}:{...run,campUsed:true,health:Math.min(100,run.health+70)};
}

export function sealBottle(run:Run,spell:BottledSpell):Run{
 if(!run.pendingBottle)return run;
 const valid=spell.spellId&&run.spells.includes(spell.spellId)&&Number.isFinite(spell.quality)&&spell.quality>=48;
 return{...run,pendingBottle:false,bottledSpells:[...run.bottledSpells,{spellId:valid?spell.spellId:null,quality:Math.max(0,Math.min(100,Number.isFinite(spell.quality)?spell.quality:0)),...(spell.inkUsed===undefined?{}:{inkUsed:Number.isFinite(spell.inkUsed)?Math.max(0,spell.inkUsed):0})}]};
}
export function merchantDialogue(node:number){return node>7?"I'm saving money to buy a cozy sweater for winter. How are you staying warm?":"The summit is glowing like a deep sea anglerfish today. I'm a sea urchin by the way. Oh! Did you need something?";}
