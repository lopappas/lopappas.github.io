import type {SpellRarity} from './rarity.ts';
export type Point = {x:number;y:number};
export type Strokes = Point[][];
export type Element = 'Water'|'Fire'|'Nature'|'Ancient';
export type SpellId = 'water'|'fire'|'nature'|'wave'|'bolt'|'leaf'|'chronos'|'ender'|'firestorm'|'tidalcrest'|'bog'|'flameBlade'|'puddleGuard'|'thistleBush'|'alchemize'|'sneakyVine';
export type Spell = {id:SpellId;rarity:SpellRarity;name:string;element:Element;color:string;description:string;path:string;strokes:Strokes;developerOnly?:boolean;upgradable?:boolean};
const curve = (start:Point, a:Point,b:Point,end:Point):Point[] => Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return{x:u*u*u*start.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*end.x,y:u*u*u*start.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*end.y}});
function shape(start:number[],segments:number[][]):Point[]{let p={x:start[0],y:start[1]};const out=[p];for(const s of segments){const end={x:s[4],y:s[5]};out.push(...curve(p,{x:s[0],y:s[1]},{x:s[2],y:s[3]},end).slice(1));p=end;}return out;}
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
 {id:'flameBlade',rarity:'Uncommon',name:'Flame Blade',element:'Fire',color:'#f0a068',description:'Swing a fiery sword 110 units ahead of you, striking every enemy in reach. High damage, no knockback. Cooldown: 8 seconds.',path:'M50 10 L57 62 L43 62 Z M28 62 L72 62 M50 62 L50 88',strokes:[[{x:50,y:10},{x:57,y:62},{x:43,y:62},{x:50,y:10}],[{x:28,y:62},{x:72,y:62}],[{x:50,y:62},{x:50,y:88}]]},
 {id:'puddleGuard',rarity:'Uncommon',name:'Puddle Guard',element:'Water',color:'#69c2d6',description:'Place a puddle 30 units ahead of you. The first enemy to step onto it bursts it, taking no damage and 54.74–273.7 base knockback depending on spell quality. Upgrading adds 20% knockback. Recasting replaces the puddle. Cooldown: 10 seconds.',path:'M6 55 C12 53 14 44 25 44 C37 44 37 56 50 56 C63 56 63 44 75 44 C86 44 88 53 94 55',strokes:[shape([6,55],[[12,53,14,44,25,44],[37,44,37,56,50,56],[63,56,63,44,75,44],[86,44,88,53,94,55]])]},
 {id:'thistleBush',rarity:'Uncommon',name:'Thistle Bush',element:'Nature',color:'#9bbe72',description:'Grow thorns 80–150 units ahead of you. Enemies touching them take low damage every 0.5 seconds. The bush lasts until it deals 30.08–188 total actual damage. Quality sets its range and damage budget; recasting replaces it. Upgrade: +0.4 damage per tick and +15% damage threshold. Cooldown: 15 seconds.',path:'M10 60 L23.333333 40 L36.666667 60 L50 40 L63.333333 60 L76.666667 40 L90 60',strokes:[[{x:10,y:60},{x:23.333333,y:40},{x:36.666667,y:60},{x:50,y:40},{x:63.333333,y:60},{x:76.666667,y:40},{x:90,y:60}]]},
 {id:'sneakyVine',rarity:'Uncommon',name:'Sneaky Vine',element:'Nature',color:'#9bbe72',description:'A vine reaches from the right, grabs the furthest enemy from behind and drags them backwards with strong knockback. Ignores shield damage and knockback reductions. Deals 27 base damage at 60% accuracy. Cooldown: 12 seconds.',path:'M70 90 L70 30 C70 18.954 61.046 10 50 10 C38.954 10 30 18.954 30 30 L30 42',strokes:[[{x:70,y:90},{x:70,y:30},...shape([70,30],[[70,18.954,61.046,10,50,10],[38.954,10,30,18.954,30,30]]).slice(1),{x:30,y:42}]]},
 {id:'alchemize',rarity:'Legendary',name:'Alchemize',element:'Ancient',color:'#8b9099',upgradable:false,description:'Create a random potion once per battle. Faint: non-healing common. Steady: 90% non-healing common, 10% rare. Beautiful: 75% common (including healing), 25% rare. Wonderful: guaranteed rare. Requires room in your purse. Cannot create Spell in a bottle.',path:'M41 14 L59 14 L59 35.6 C77 41 86 52.7 84.2 66.2 C82.4 82.4 70.7 89.6 50 89.6 C29.3 89.6 17.6 82.4 15.8 66.2 C14 52.7 23 41 41 35.6 L41 14 Z M39.2 5 L60.8 5 L59 14 L41 14 L39.2 5 Z',strokes:[[{x:41,y:14},{x:59,y:14},...shape([59,35.6],[[77,41,86,52.7,84.2,66.2],[82.4,82.4,70.7,89.6,50,89.6],[29.3,89.6,17.6,82.4,15.8,66.2],[14,52.7,23,41,41,35.6]]),{x:41,y:14}],[{x:39.2,y:5},{x:60.8,y:5},{x:59,y:14},{x:41,y:14},{x:39.2,y:5}]]},
];
export const PLAYER_SPELLS=SPELLS.filter(spell=>!spell.developerOnly);
export function isUpgradableSpell(id:SpellId){const spell=SPELLS.find(s=>s.id===id);return !!spell&&spell.upgradable!==false;}
// Recognition-only alternatives; spellbook art and perfect traces use SPELLS unchanged.
export const SPELL_VARIATIONS:Partial<Record<SpellId,Strokes[]>>={
 flameBlade:[SPELLS.find(s=>s.id==='flameBlade')!.strokes.map((stroke,i)=>stroke.map(p=>({x:i===1?50+(p.x-50)*1.2:p.x,y:i===2?62+(p.y-62)*1.2:p.y})))],
 fire:[[[{x:50,y:12},{x:85,y:12+35*Math.sqrt(3)},{x:15,y:12+35*Math.sqrt(3)},{x:50,y:12}]]],
 firestorm:[[[{x:10,y:18},{x:90,y:18}],[{x:12,y:30},{x:44,y:30},{x:28,y:62},{x:12,y:30}],[{x:56,y:30},{x:88,y:30},{x:72,y:62},{x:56,y:30}]]],
 nature:[[[{x:25,y:15},{x:50,y:50},{x:75,y:15}],[{x:50,y:50},{x:50,y:88}]]],
 tidalcrest:[.8,1.2].map(width=>SPELLS.find(s=>s.id==='tidalcrest')!.strokes.map(stroke=>stroke.map(p=>({x:50+(p.x-50)*width,y:p.y}))))
};
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function strokeLength(strokes:Strokes){return strokes.reduce((sum,s)=>sum+s.slice(1).reduce((n,p,i)=>n+distance(s[i],p),0),0);}
export function inkCost(a:Point,b:Point,shortSide:number){return distance(a,b)/Math.max(1,shortSide)*(22/1.25);}
function normalize(strokes:Strokes):Strokes{
 const all=strokes.flat();if(!all.length)return[];const xs=all.map(p=>p.x),ys=all.map(p=>p.y);const minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY,s=Math.max(w,h,0.001);
 return strokes.map(st=>st.map(p=>({x:(p.x-minX-w/2)/s,y:(p.y-minY-h/2)/s})));
}
function sample(strokes:Strokes,count=140):Point[]{
 const total=strokeLength(strokes);if(total<0.001)return[];const step=total/(count-1);const result:Point[]=[];let next=0,travel=0;
 for(const stroke of strokes)for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i],len=distance(a,b);if(len===0)continue;while(next<=travel+len&&result.length<count){const t=(next-travel)/len;result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});next+=step;}travel+=len;}
 return result;
}
const meanNearest=(a:Point[],b:Point[])=>a.reduce((sum,p)=>sum+Math.min(...b.map(q=>distance(p,q))),0)/a.length;
export function recognize(strokes:Strokes,known:SpellId[]=SPELLS.map(s=>s.id),accuracyBonus=0){
 const normalized=normalize(strokes),points=sample(normalized);if(points.length<5)return{spell:null,quality:0,candidates:[],reason:'Draw a complete sigil first.'};
 const len=strokeLength(normalized);
 // Collapse every shape variation into one candidate per spell BEFORE ambiguity checks.
 const candidates=SPELLS.filter(s=>known.includes(s.id)).map(spell=>{
  const handPenalty=spell.id==='chronos'?Math.exp(-Math.max(0,Math.min(...points.map(p=>Math.hypot(p.x,p.y)))-.1)*9):1;
  return [spell.strokes,...(SPELL_VARIATIONS[spell.id]??[])].map(template=>{
   const ref=normalize(template),target=sample(ref),error=(meanNearest(points,target)+meanNearest(target,points))/2;
   const ratio=len/strokeLength(ref),lengthPenalty=Math.exp(-Math.abs(Math.log(Math.max(.001,ratio)))*1.8);
   return{spell,quality:Math.round(100*Math.exp(-error*13)*lengthPenalty*handPenalty),error};
  }).reduce((best,current)=>current.quality>best.quality?current:best);
 }).sort((a,b)=>b.quality-a.quality);
 if(!candidates.length)return{spell:null,quality:0,candidates,reason:'No spells learned yet.'};
 const top=candidates[0],margin=top.quality-(candidates[1]?.quality??0);
 const quality=Math.min(100,top.quality+Math.max(0,accuracyBonus));
 const accepted=quality>=48&&margin>=7;
 return{spell:accepted?top.spell:null,quality,candidates,reason:accepted?'':margin<7?'The shape is between two sigils. Make its defining details clearer.':'The sigil is incomplete or its shape needs more care.'};
}
export function grade(quality:number){return quality>=80?'Wonderful':quality>=70?'Beautiful':quality>=60?'Steady':'Faint';}
// Exponential growth between valid scores, plus explicit rewards at grade thresholds.
// Faint stays weak; every Steady-or-better score improves on the old curve.
function accuracyStrength(quality:number){
 if(!Number.isFinite(quality)||quality<48)return{damage:0,knockback:0};
 const q=Math.min(100,quality),tier=q>=80?3:q>=70?2:q>=60?1:0;
 const growth=Math.expm1(Math.log(6)*(q-48)/52)/5;
 return{damage:Math.round(8+40*growth+[0,7,10,16][tier]),knockback:Math.round(18+82*growth+[0,32,44,60][tier])};
}
export function power(quality:number){return accuracyStrength(quality).damage;}
export function spellPower(id:SpellId,quality:number){
 if(id==='sneakyVine'){if(!Number.isFinite(quality)||quality<48)return 0;const q=Math.min(100,quality),[lo,hi,min,max]=q<60?[48,59,12,20]:q<70?[60,69,27,36]:q<80?[70,79,43,58]:[80,100,67,95];return min+(max-min)*(q-lo)/(hi-lo);}
 if(!['water','fire','nature'].includes(id))return power(quality);
 if(!Number.isFinite(quality)||quality<48)return 0;
 const q=Math.min(100,quality),[lo,hi,min,max]=q<60?[48,59,7,11]:q<70?[60,69,17,22]:q<80?[70,79,26,31]:[80,100,36,52];
 return Math.round(min+(max-min)*(q-lo)/(hi-lo))-.5;
}
export function knockback(quality:number){return accuracyStrength(quality).knockback;}
export const HOLD_MS=500;
export function castHoldMs(mindRune=false){return HOLD_MS*(mindRune?.75:1);}
export function spellInkColor(progress:number,elementColor?:string){return progress>=.5&&elementColor?chargeColor(progress,elementColor):'#000000';}
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


