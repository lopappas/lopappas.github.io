import {balanceQuality,MIN_CAST_QUALITY} from './quality.ts';
import {guardianStats,guardianUpgradeDamageBonus,isGuardianSpell,type GuardianSpell} from './guardian.ts';
import type {SpellRarity} from './rarity.ts';
export type Point = {x:number;y:number};
export type Strokes = Point[][];
export type Element = 'Water'|'Fire'|'Nature'|'Ancient';
export type SpellId = GuardianSpell|'torrent'|'water'|'fire'|'nature'|'wave'|'bolt'|'leaf'|'chronos'|'ender'|'firestorm'|'tidalcrest'|'bog'|'flameBlade'|'puddleGuard'|'thistleBush'|'alchemize'|'sneakyVine'|'constellation';
export type Spell = {id:SpellId;rarity:SpellRarity;name:string;element:Element;color:string;description:string;path:string;strokes:Strokes;developerOnly?:boolean;upgradable?:boolean};
const curve = (start:Point, a:Point,b:Point,end:Point):Point[] => Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return{x:u*u*u*start.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*end.x,y:u*u*u*start.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*end.y}});
export function shape(start:number[],segments:number[][]):Point[]{let p={x:start[0],y:start[1]};const out=[p];for(const s of segments){const end={x:s[4],y:s[5]};out.push(...curve(p,{x:s[0],y:s[1]},{x:s[2],y:s[3]},end).slice(1));p=end;}return out;}
const snowmanCircles = [[50,25,16],[50,66,25]];
const snowmanArms:Strokes=[
 [{x:35,y:46},{x:21,y:32}],
 [{x:65,y:46},{x:79,y:32}],
];
const snowmanPath = [
 ...snowmanCircles.map(([x,y,r])=>`M${x} ${y-r} A${r} ${r} 0 1 1 ${x} ${y+r} A${r} ${r} 0 1 1 ${x} ${y-r} Z`),
 ...snowmanArms.map(([a,b])=>`M${a.x} ${a.y} L${b.x} ${b.y}`),
].join(' ');
const circleStroke = (x:number,y:number,r:number)=>Array.from({length:97},(_,i)=>{
 const angle=i*Math.PI/48-Math.PI/2;
 return {x:x+r*Math.cos(angle),y:y+r*Math.sin(angle)};
});
const snowmanStrokes = [...snowmanCircles.map(([x,y,r])=>circleStroke(x,y,r)),...snowmanArms];

const scorchyEye = (x:number):Point[]=>[{x,y:29},{x:x+11,y:45},{x:x-11,y:45},{x,y:29}];
const scorchyMouth:Point[]=[{x:26,y:57},...Array.from({length:49},(_,i)=>{
 const angle=i*Math.PI/48;
 return {x:50+24*Math.cos(angle),y:57+19*Math.sin(angle)};
})];
const scorchyStrokes:Strokes=[circleStroke(50,50,43),scorchyEye(37),scorchyEye(63),scorchyMouth];
const scorchyPath='M50 7 A43 43 0 1 1 50 93 A43 43 0 1 1 50 7 Z M37 29 L48 45 L26 45 Z M63 29 L74 45 L52 45 Z M26 57 H74 A24 19 0 0 1 26 57 Z';

const shroomyCap=shape([15,53],[[10,53,8,50,9,45],[13,24,30,12,50,12],[70,12,87,24,91,45],[92,50,90,53,85,53]]);
const shroomyStem=shape([39,53],[[38,62,34,69,34,77],[34,86,41,91,50,91],[59,91,66,86,66,77],[66,69,62,62,61,53]]);
const shroomyStrokes:Strokes=[
 [...shroomyCap,{x:15,y:53}],shroomyStem,
 [{x:46,y:34},{x:46,y:43}],[{x:54,y:34},{x:54,y:43}],
];
const shroomyPath='M15 53 C10 53 8 50 9 45 C13 24 30 12 50 12 C70 12 87 24 91 45 C92 50 90 53 85 53 Z M39 53 C38 62 34 69 34 77 C34 86 41 91 50 91 C59 91 66 86 66 77 C66 69 62 62 61 53 M46 34 V43 M54 34 V43';

const constellationSegments=[[47,29,50,56,43,74],[39,84,30,90,23,86],[16,82,17,71,25,72],[32,71,40,77,49,82],[62,90,76,91,84,82]];

export const SPELLS:Spell[]=[

 {id:'water',rarity:'Common',name:'Dewdrop',element:'Water',color:'#69c2d6',description:'A sturdy splash of water magic. Close the outline and keep the rounded base.',path:'M50 8 C54 23 82 49 80 64 C78 94 22 94 20 64 C18 49 46 23 50 8 Z',strokes:[shape([50,8],[[54,23,82,49,80,64],[78,94,22,94,20,64],[18,49,46,23,50,8]])]},
 {id:'fire',rarity:'Common',name:'Hearthspark',element:'Fire',color:'#f0a068',description:'An eager spark of fire magic',path:'M50 12 L85 82 L15 82 Z',strokes:[[{x:50,y:12},{x:85,y:82},{x:15,y:82},{x:50,y:12}]]},
 {id:'nature',rarity:'Common',name:'Little Sprout',element:'Nature',color:'#9bbe72',description:'A resilient ball of nature magic.',path:'M20 20 L50 50 L80 20 M50 50 L50 88',strokes:[[{x:20,y:20},{x:50,y:50},{x:80,y:20}],[{x:50,y:50},{x:50,y:88}]]},
 {id:'wave',rarity:'Uncommon',name:'Aquaspout',element:'Water',color:'#69c2d6',description:'A fast spurt of water, excellent for clearing space.',path:'M36 18 L50 6 L64 18 M50 32 C53.04 43.4 74.32 63.16 72.8 74.56 C71.28 97.36 28.72 97.36 27.2 74.56 C25.68 63.16 46.96 43.4 50 32 Z',strokes:[[{x:36,y:18},{x:50,y:6},{x:64,y:18}],shape([50,32],[[53.04,43.4,74.32,63.16,72.8,74.56],[71.28,97.36,28.72,97.36,27.2,74.56],[25.68,63.16,46.96,43.4,50,32]])]},
 {id:'bolt',rarity:'Uncommon',name:'Flare Bolt',element:'Fire',color:'#f0a068',description:'A scorching hot ray of fire. High damage and burning, but with low knocking force.',path:'M65 10 L25 50 L55 50 L35 90',strokes:[[{x:65,y:10},{x:25,y:50},{x:55,y:50},{x:35,y:90}]]},
 {id:'leaf',rarity:'Uncommon',name:'Bramble Leaf',element:'Nature',color:'#9bbe72',description:'A burst of lush leaves slowing enemy encroachment. Deals lower damage.',path:'M50 10 L85 50 L50 90 L15 50 Z',strokes:[[{x:50,y:10},{x:85,y:50},{x:50,y:90},{x:15,y:50},{x:50,y:10}]]},
 {id:'chronos',rarity:'Legendary',name:'Chronos Denalis',element:'Ancient',color:'#8b9099',description:'A lost spell that makes time stand still at every cast quality. Higher quality freezes enemies longer. Cooldown: 30 seconds. Upgrade: +12% freeze duration.',path:'M50 10 C72.091 10 90 27.909 90 50 C90 72.091 72.091 90 50 90 C27.909 90 10 72.091 10 50 C10 27.909 27.909 10 50 10 Z M50 50 L50 10',strokes:[shape([50,10],[[72.091,10,90,27.909,90,50],[90,72.091,72.091,90,50,90],[27.909,90,10,72.091,10,50],[10,27.909,27.909,10,50,10]]),[{x:50,y:50},{x:50,y:10}]]},
 {id:'ender',rarity:'Legendary',name:'Ender',element:'Ancient',color:'#8b9099',description:'Draw a capital K. Deals 1,000 base damage to the nearest enemy. No knockback.',path:'M20 10 L20 90 M80 10 L20 50 L80 90',strokes:[[{x:20,y:10},{x:20,y:90}],[{x:80,y:10},{x:20,y:50},{x:80,y:90}]],developerOnly:true,upgradable:false},
 {id:'firestorm',rarity:'Uncommon',name:'Firestorm',element:'Fire',color:'#f0a068',description:'Bring about a relentless rain of fire. Damages all foes caught in its rain, with no knockback. Cooldown: 10 seconds.',path:'M10 18 L90 18 M12 38 L44 38 L28 70 Z M56 38 L88 38 L72 70 Z',strokes:[[{x:10,y:18},{x:90,y:18}],[{x:12,y:38},{x:44,y:38},{x:28,y:70},{x:12,y:38}],[{x:56,y:38},{x:88,y:38},{x:72,y:70},{x:56,y:38}]]},
 {id:'tidalcrest',rarity:'Uncommon',name:'Tidalcrest',element:'Water',color:'#69c2d6',description:'Channel a mighty wave to washout all opponents. Cooldown: 8 seconds.',path:'M15 85 C15 47 50 15 85 12 C61 36 61 60 88 85 L15 85 Z',strokes:[shape([15,85],[[15,47,50,15,85,12],[61,36,61,60,88,85],[64,85,39,85,15,85]])]},
 {id:'bog',rarity:'Uncommon',name:'Drudge Bog',element:'Nature',color:'#9bbe72',description:'Raise a shallow, murky swamp that damages and slows all foes. Recasting extends its duration. Cooldown: 15 seconds.',path:'M50 12 C70.98682 12 88 29.01318 88 50 C88 70.98682 70.98682 88 50 88 C29.01318 88 12 70.98682 12 50 C12 29.01318 29.01318 12 50 12 Z M50 30 L67.5 50 L50 70 L32.5 50 Z',strokes:[shape([50,12],[[70.98682,12,88,29.01318,88,50],[88,70.98682,70.98682,88,50,88],[29.01318,88,12,70.98682,12,50],[12,29.01318,29.01318,12,50,12]]),[{x:50,y:30},{x:67.5,y:50},{x:50,y:70},{x:32.5,y:50},{x:50,y:30}]]},
 {id:'flameBlade',rarity:'Uncommon',name:'Flame Blade',element:'Fire',color:'#f0a068',description:'Swing a fiery sword 110 units ahead of you, damaging and pushing back every enemy in reach. Higher cast quality increases knockback. Cooldown: 8 seconds.',path:'M50 10 L57 62 L43 62 Z M28 62 L72 62 M50 62 L50 88',strokes:[[{x:50,y:10},{x:57,y:62},{x:43,y:62},{x:50,y:10}],[{x:28,y:62},{x:72,y:62}],[{x:50,y:62},{x:50,y:88}]]},
 {id:'puddleGuard',rarity:'Uncommon',name:'Puddle Guard',element:'Water',color:'#69c2d6',description:'Place a puddle 30 units ahead of you. The first enemy to step onto it bursts it, taking no damage and 54.74–273.7 base knockback depending on spell quality. Upgrading adds 20% knockback. Recasting replaces the puddle. Cooldown: 10 seconds.',path:'M6 55 C12 53 14 44 25 44 C37 44 37 56 50 56 C63 56 63 44 75 44 C86 44 88 53 94 55',strokes:[shape([6,55],[[12,53,14,44,25,44],[37,44,37,56,50,56],[63,56,63,44,75,44],[86,44,88,53,94,55]])]},
 {id:'thistleBush',rarity:'Uncommon',name:'Thistle Bush',element:'Nature',color:'#9bbe72',description:'Grow thorns 80–150 units ahead of you. Enemies touching them take low damage every 0.5 seconds. The bush lasts until it deals 40–205 total actual damage. Quality sets its range and damage budget; recasting replaces it. Upgrade: +0.4 damage per tick and +15% damage threshold. Cooldown: 15 seconds.',path:'M10 60 L23.333333 40 L36.666667 60 L50 40 L63.333333 60 L76.666667 40 L90 60',strokes:[[{x:10,y:60},{x:23.333333,y:40},{x:36.666667,y:60},{x:50,y:40},{x:63.333333,y:60},{x:76.666667,y:40},{x:90,y:60}]]},
 {id:'sneakyVine',rarity:'Uncommon',name:'Sneaky Vine',element:'Nature',color:'#9bbe72',description:'A vine reaches from the right, grabs the furthest enemy from behind and drags them backwards with strong knockback. Ignores shield damage and knockback reductions. Deals 27 base damage at 60% accuracy. Cooldown: 12 seconds.',path:'M70 90 L70 30 C70 18.954 61.046 10 50 10 C38.954 10 30 18.954 30 30 L30 42',strokes:[[{x:70,y:90},{x:70,y:30},...shape([70,30],[[70,18.954,61.046,10,50,10],[38.954,10,30,18.954,30,30]]).slice(1),{x:30,y:42}]]},
 {id:'alchemize',rarity:'Legendary',name:'Alchemize',element:'Ancient',color:'#8b9099',description:'Create a random potion once per battle. Faint: non-healing common. Steady: 90% non-healing common, 10% rare. Beautiful: 75% common (including healing), 25% rare. Wonderful: guaranteed rare. Requires room in your purse. Cannot create Spell in a bottle. Upgrade: roll two potions, keeping only those that fit.',path:'M41 14 L59 14 L59 35.6 C77 41 86 52.7 84.2 66.2 C82.4 82.4 70.7 89.6 50 89.6 C29.3 89.6 17.6 82.4 15.8 66.2 C14 52.7 23 41 41 35.6 L41 14 Z M39.2 5 L60.8 5 L59 14 L41 14 L39.2 5 Z',strokes:[[{x:41,y:14},{x:59,y:14},...shape([59,35.6],[[77,41,86,52.7,84.2,66.2],[82.4,82.4,70.7,89.6,50,89.6],[29.3,89.6,17.6,82.4,15.8,66.2],[14,52.7,23,41,41,35.6]]),{x:41,y:14}],[{x:39.2,y:5},{x:60.8,y:5},{x:59,y:14},{x:41,y:14},{x:39.2,y:5}]]},
 {id:'torrent',rarity:'Uncommon',name:'Torrent',element:'Water',color:'#69c2d6',description:'Rain large water orbs onto random enemy-accessible ground. Each splash deals Steady Dewdrop damage and knockback to nearby foes. Faint: 5 seconds. Steady: 8 seconds. Beautiful: 11 seconds. Wonderful: 14 seconds. One orb per second. Cooldown: 10 seconds.',path:'M50 90 C39 40 23 32 10 48 M50 90 C61 40 77 32 90 48',strokes:[shape([50,90],[[39,40,23,32,10,48]]),shape([50,90],[[61,40,77,32,90,48]])]},
 {id:'snowman',rarity:'Legendary',name:'Snowman',element:'Water',color:'#69c2d6',description:'Summon a guardian that marches up to 250 units ahead. It throws a snowball as soon as an enemy comes within 50 units, then every 2 seconds while a target is in range. Enemies hit it immediately on contact for 50% extra damage and can hit it again after 1.5 seconds. Snowballs deal 13–26 base knockback, with a stronger push at higher quality. Hits leave Snowman in place. An 80% cast gives 155 HP and 16 base damage per snowball. Snowballs inherit half your spell damage bonuses. Snowmen of any cast quality last until defeated, replaced, or the battle ends. Cooldown is 30 seconds. Upgrade raises range to 60 units and base knockback to 16–28, and adds 10% damage. Upgraded Snowman has 185 HP at 80% cast quality.',path:snowmanPath,strokes:snowmanStrokes},
 {id:'scorchy',rarity:'Legendary',name:'Scorchy',element:'Fire',color:'#f0a068',description:'Summon a floating jack-o’-lantern that advances up to 250 units. It spits fire at the nearest enemy within 40 units, then again every 1.4 seconds while a target is in range. Fireballs ignite wooden shields, deal 2–3 base knockback depending on cast quality, and inherit half your spell damage bonuses. An 80% cast gives 100 HP and 18 base damage per fireball. Scorchy lasts until defeated, replaced, or the battle ends at every cast quality. Cooldown: 30 seconds. The upgrade raises range to 50 units, adds 20% health, and fires every 1.2 seconds. At 80% cast quality its fireballs deal 20 base damage.',path:scorchyPath,strokes:scorchyStrokes},
 {id:'shroomy',rarity:'Legendary',name:'Shroomy',element:'Nature',color:'#9bbe72',description:'Summon a small mushroom guardian with 10–40 HP. Shroomy fires spores at enemies within 160 units, once every 2.5 seconds, starting with the nearest enemy without spores. Each spore deals Nature damage once per second for 10 seconds, with up to two independent stacks per enemy. At 80% cast quality, each stack deals 5 base damage per second. Spores deal no damage on impact or knockback. Shroomy inherits half your spell damage bonuses. Cooldown: 30 seconds. Upgrade: +10% spore damage.',path:shroomyPath,strokes:shroomyStrokes},
 {id:'constellation',rarity:'Legendary',name:'Constellation',element:'Ancient',color:'#8b9099',description:'Send a purple and gold firework into the sky once per battle. Gain armor that absorbs damage first, plus spell damage and knockback for the battle. At 45–49% quality, gain 3 armor, +5% damage, and +5% knockback. At 50–59%, gain 5 armor, +8% damage, and +7% knockback. At 80% quality, gain 11 armor, +22% damage, and +15% knockback. The upgrade adds 3 armor, 5 percentage points of damage, and 3 points of knockback.',path:`M46 10 ${constellationSegments.map(segment=>`C${segment.join(' ')}`).join(' ')}`,strokes:[shape([46,10],constellationSegments)]},
];
export const PLAYER_SPELLS=SPELLS.filter(spell=>!spell.developerOnly);
export function damageUpgradeBonus(id:SpellId){return isGuardianSpell(id)?guardianUpgradeDamageBonus(id):id==='bolt'?.2:id==='tidalcrest'||id==='flameBlade'?.15:.25;}
export function isUpgradableSpell(id:SpellId){const spell=SPELLS.find(s=>s.id===id);return !!spell&&spell.upgradable!==false;}
// Recognition-only alternatives; spellbook art and perfect traces use SPELLS unchanged.
export const SPELL_VARIATIONS:Partial<Record<SpellId,Strokes[]>>={
 bog:[SPELLS.find(s=>s.id==='bog')!.strokes.map((stroke,i)=>stroke.map(p=>i===1?{x:50+(p.x-50)*.8,y:50+(p.y-50)*.8}:{...p}))],
 bolt:[[[{x:53,y:10},{x:25,y:50},{x:55,y:50},{x:35,y:90}]]],
 flameBlade:[SPELLS.find(s=>s.id==='flameBlade')!.strokes.map((stroke,i)=>stroke.map(p=>({x:i===1?50+(p.x-50)*1.2:p.x,y:i===2?62+(p.y-62)*1.2:p.y})))],
 fire:[[[{x:50,y:12},{x:85,y:12+35*Math.sqrt(3)},{x:15,y:12+35*Math.sqrt(3)},{x:50,y:12}]]],
 firestorm:[[[{x:10,y:18},{x:90,y:18}],[{x:12,y:30},{x:44,y:30},{x:28,y:62},{x:12,y:30}],[{x:56,y:30},{x:88,y:30},{x:72,y:62},{x:56,y:30}]]],
 nature:[[[{x:25,y:15},{x:50,y:50},{x:75,y:15}],[{x:50,y:50},{x:50,y:88}]]],
 tidalcrest:[.8,1.2].map(width=>SPELLS.find(s=>s.id==='tidalcrest')!.strokes.map(stroke=>stroke.map(p=>({x:50+(p.x-50)*width,y:p.y}))))
};
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function strokeLength(strokes:Strokes){let sum=0;for(const stroke of strokes){let length=0;for(let i=1;i<stroke.length;i++)length+=distance(stroke[i-1],stroke[i]);sum+=length;}return sum;}
export function inkCost(a:Point,b:Point,shortSide:number){return distance(a,b)/Math.max(1,shortSide)*(22/1.25/1.4);}
function normalize(strokes:Strokes):Strokes{
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,count=0;
 for(const stroke of strokes)for(const p of stroke){count++;minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);}
 if(!count)return[];const w=maxX-minX,h=maxY-minY,s=Math.max(w,h,0.001);
 return strokes.map(st=>st.map(p=>({x:(p.x-minX-w/2)/s,y:(p.y-minY-h/2)/s})));
}
function sample(strokes:Strokes,count=140):Point[]{
 const total=strokeLength(strokes);if(total<0.001)return[];const step=total/(count-1);const result:Point[]=[];let next=0,travel=0;
 for(const stroke of strokes)for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i],len=distance(a,b);if(len===0)continue;while(next<=travel+len&&result.length<count){const t=(next-travel)/len;result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});next+=step;}travel+=len;}
 return result;
}
function meanNearest(a:Point[],b:Point[]){
 let sum=0;
 // Keep Math.hypot and summation order so raw scores remain bit-for-bit compatible.
 for(const p of a){let nearest=Infinity;for(const q of b)nearest=Math.min(nearest,distance(p,q));sum+=nearest;}
 return sum/a.length;
}
function prepareShape(strokes:Strokes){
 const normalized=normalize(strokes);
 return {points:sample(normalized),length:strokeLength(normalized)};
}

function compareShapes(drawing:ReturnType<typeof prepareShape>,template:ReturnType<typeof prepareShape>,penalty=1){
 const {points,length}=drawing;
 const error=(meanNearest(points,template.points)+meanNearest(template.points,points))/2;
 const ratio=length/template.length;
 const lengthPenalty=Math.exp(-Math.abs(Math.log(Math.max(.001,ratio)))*1.8);
 return {quality:Math.round(100*Math.exp(-error*13)*lengthPenalty*penalty),error};
}

export function scoreDrawingAgainst(strokes:Strokes,reference:Strokes){
 const drawing=prepareShape(strokes);
 return drawing.points.length<5?0:compareShapes(drawing,prepareShape(reference)).quality;
}

// Catalog geometry is constant. Prepare each reference and variant once per module load.
const RECOGNITION_TEMPLATES=SPELLS.map(spell=>({
 spell,
 variants:[spell.strokes,...(SPELL_VARIATIONS[spell.id]??[])].map(prepareShape),
}));
export type RecognitionResult={spell:Spell|null;quality:number;candidates:{spell:Spell;quality:number;error:number}[];reason:string};
const RECOGNITION_MARGIN=7;

export function ambiguousSpells(result:RecognitionResult):Spell[]{
 const {spell,candidates}=result;
 if(spell||candidates.length<2||candidates[0].quality-candidates[1].quality>=RECOGNITION_MARGIN)return [];
 const topQuality=candidates[0].quality;
 return candidates.filter(candidate=>topQuality-candidate.quality<RECOGNITION_MARGIN).map(candidate=>candidate.spell);
}

export function recognize(strokes:Strokes,known:SpellId[]=SPELLS.map(s=>s.id),accuracyBonus=0):RecognitionResult{
 const drawing=prepareShape(strokes),{points}=drawing;if(points.length<5)return{spell:null,quality:0,candidates:[],reason:'Draw a complete sigil first.'};
 const candidates:RecognitionResult['candidates']=[];
 for(const prepared of RECOGNITION_TEMPLATES){
  const {spell}=prepared;if(!known.includes(spell.id))continue;
  let handPenalty=1;
  if(spell.id==='chronos'){let radius=Infinity;for(const p of points)radius=Math.min(radius,Math.hypot(p.x,p.y));handPenalty=Math.exp(-Math.max(0,radius-.1)*9);}
  let best:RecognitionResult['candidates'][number]|undefined;
  // Collapse variations before ambiguity checks, retaining the original tie order.
  for(const template of prepared.variants){
   const {quality,error}=compareShapes(drawing,template,handPenalty);
   if(!best||quality>best.quality)best={spell,quality,error};
  }
  if(best)candidates.push(best);
 }
 candidates.sort((a,b)=>b.quality-a.quality);
 if(!candidates.length)return{spell:null,quality:0,candidates,reason:'No spells learned yet.'};
 return applyRecognitionBonus({spell:null,quality:0,candidates,reason:''},accuracyBonus);
}
/** Reuse geometric scores: bonuses affect acceptance and accuracy, never shape identity or margin. */
export function applyRecognitionBonus(raw:RecognitionResult,accuracyBonus=0):RecognitionResult{
 const {candidates}=raw;if(!candidates.length)return raw;
 const top=candidates[0],margin=top.quality-(candidates[1]?.quality??0);
 const quality=Math.min(100,top.quality+Math.max(0,accuracyBonus));
 const accepted=quality>=MIN_CAST_QUALITY&&margin>=RECOGNITION_MARGIN;
 return{spell:accepted?top.spell:null,quality,candidates,reason:accepted?'':margin<RECOGNITION_MARGIN?'The shape is between two sigils. Make its defining details clearer.':'The sigil is incomplete or its shape needs more care.'};
}

export function grade(quality:number){return quality>=80?'Wonderful':quality>=70?'Beautiful':quality>=60?'Steady':'Faint';}
// Exponential growth between valid scores, plus explicit rewards at grade thresholds.
// Faint stays weak; every Steady-or-better score improves on the old curve.
function accuracyStrength(quality:number){
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return{damage:0,knockback:0};
 const q=balanceQuality(quality),tier=q>=80?3:q>=70?2:q>=60?1:0;
 const growth=Math.expm1(Math.log(6)*(q-48)/52)/5;
 return{damage:Math.round(8+40*growth+[0,7,10,16][tier]),knockback:Math.round(18+82*growth+[0,32,44,60][tier])};
}
export function power(quality:number){return accuracyStrength(quality).damage;}
export function spellPower(id:SpellId,quality:number){
 if(id==='constellation')return 0;
 if(isGuardianSpell(id))return guardianStats(id,quality).baseDamage;
 if(id==='sneakyVine'){if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return 0;const q=balanceQuality(quality),[lo,hi,min,max]=q<60?[48,59,12,20]:q<70?[60,69,27,36]:q<80?[70,79,43,58]:[80,100,67,95];return min+(max-min)*(q-lo)/(hi-lo);}
 if(!['water','fire','nature'].includes(id))return power(quality);
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return 0;
 const q=balanceQuality(quality),[lo,hi,min,max]=q<60?[48,59,7,11]:q<70?[60,69,17,22]:q<80?[70,79,26,31]:[80,100,36,52];
 return Math.round(min+(max-min)*(q-lo)/(hi-lo))-.5;
}
export function knockback(quality:number){return accuracyStrength(quality).knockback;}
export const HOLD_MS=500;
export function castHoldMs(mindRune=false){return HOLD_MS*(mindRune?.75:1);}
export function spellInkColor(progress:number,elementColor?:string){
 const blend=Math.max(0,Math.min(1,(progress-.4)/.5));
 if(!elementColor||blend===0)return '#000000';
 if(blend===1)return elementColor;
 return '#'+elementColor.slice(1).match(/.{2}/g)!.map(channel=>Math.round(parseInt(channel,16)*blend).toString(16).padStart(2,'0')).join('');
}
export function chargeColor(progress:number,elementColor?:string){return progress>=.5&&elementColor?elementColor:'#d9b9ff';}
export const REFILL_MS=1000;
export function refillDurationMs(ink:number){return Math.max(0,100-Math.max(0,Math.min(100,ink)))*10;}
export function refillInk(ink:number,elapsedMs:number){return Math.min(100,Math.max(0,ink)+Math.max(0,elapsedMs)/10);}
export function chargeComplete(start:number,now:number,mindRune=false){return now-start>=castHoldMs(mindRune);}
export function isCheckmark(strokes:Strokes){
 if(strokes.length!==1||strokes[0].length<3)return false;
 let points=strokes[0];if(points[0].x>points.at(-1)!.x)points=[...points].reverse();
 const first=points[0],last=points.at(-1)!,corner=points.reduce((a,p)=>p.y>a.y?p:a);
 const span=Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x));
 if(span<1||corner.x<=first.x||last.x<=corner.x||corner.y-first.y<span*.12||corner.y-last.y<span*.38)return false;
 const lineError=(p:Point,a:Point,b:Point)=>Math.abs((b.x-a.x)*(a.y-p.y)-(a.x-p.x)*(b.y-a.y))/Math.max(.001,distance(a,b));
 const pivot=points.indexOf(corner);
 for(let i=1;i<points.length;i++){if(points[i].x<points[i-1].x-span*.06)return false;if(i<=pivot&&points[i].y<points[i-1].y-span*.06)return false;if(i>pivot&&points[i].y>points[i-1].y+span*.06)return false;}
 const error=points.reduce((sum,p,i)=>sum+lineError(p,i<=pivot?first:corner,i<=pivot?corner:last),0)/points.length;
 return error/span<.12&&distance(corner,last)>distance(first,corner)*1.15;
}
