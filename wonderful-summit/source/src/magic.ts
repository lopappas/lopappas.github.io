export type Point = {x:number;y:number};
export type Strokes = Point[][];
export type Element = 'Water'|'Fire'|'Nature'|'Ancient';
export type SpellId = 'water'|'fire'|'nature'|'wave'|'bolt'|'leaf'|'chronos'|'ender'|'firestorm';
export type Spell = {id:SpellId;name:string;element:Element;color:string;description:string;path:string;strokes:Strokes;developerOnly?:boolean;upgradable?:boolean};
const curve = (start:Point, a:Point,b:Point,end:Point):Point[] => Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return{x:u*u*u*start.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*end.x,y:u*u*u*start.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*end.y}});
function shape(start:number[],segments:number[][]):Point[]{let p={x:start[0],y:start[1]};const out=[p];for(const s of segments){const end={x:s[4],y:s[5]};out.push(...curve(p,{x:s[0],y:s[1]},{x:s[2],y:s[3]},end).slice(1));p=end;}return out;}
export const SPELLS:Spell[]=[
 {id:'water',name:'Dewdrop',element:'Water',color:'#69c2d6',description:'A clear little droplet. Close the outline and keep the rounded base.',path:'M50 8 C54 23 82 49 80 64 C78 94 22 94 20 64 C18 49 46 23 50 8 Z',strokes:[shape([50,8],[[54,23,82,49,80,64],[78,94,22,94,20,64],[18,49,46,23,50,8]])]},
 {id:'fire',name:'Hearthspark',element:'Fire',color:'#f0a068',description:'Draw an upright triangle. Three straight sides, joined at the corners.',path:'M50 12 L85 82 L15 82 Z',strokes:[[{x:50,y:12},{x:85,y:82},{x:15,y:82},{x:50,y:12}]]},
 {id:'nature',name:'Little Sprout',element:'Nature',color:'#9bbe72',description:'Draw a simple Y: two upward branches meeting a straight stem. No leaf outlines needed.',path:'M20 20 L50 50 L80 20 M50 50 L50 88',strokes:[[{x:20,y:20},{x:50,y:50},{x:80,y:20}],[{x:50,y:50},{x:50,y:88}]]},
 {id:'wave',name:'Riptide Surge',element:'Water',color:'#69c2d6',description:'Draw a shark fin: a curved outer edge, an inward-curving side, and a flat base. Lower damage, but much stronger knockback.',path:'M15 85 C15 47 50 15 85 12 C61 36 61 60 88 85 L15 85 Z',strokes:[shape([15,85],[[15,47,50,15,85,12],[61,36,61,60,88,85],[64,85,39,85,15,85]])]},
 {id:'bolt',name:'Flare Bolt',element:'Fire',color:'#f0a068',description:'Draw a lightning bolt: down-left, right, then down-left. Higher damage, lighter knockback, and 3 seconds of burn damage that scales with drawing quality.',path:'M65 10 L25 50 L55 50 L35 90',strokes:[[{x:65,y:10},{x:25,y:50},{x:55,y:50},{x:35,y:90}]]},
 {id:'leaf',name:'Bramble Leaf',element:'Nature',color:'#9bbe72',description:'Draw a closed diamond. Slows the nearest enemy, with lower damage.',path:'M50 10 L85 50 L50 90 L15 50 Z',strokes:[[{x:50,y:10},{x:85,y:50},{x:50,y:90},{x:15,y:50},{x:50,y:10}]]},
 {id:'chronos',name:'Chronos Denalis',element:'Ancient',color:'#8b9099',description:'Draw a circle with a straight line from its center to the top. Temporarily deny the flow of time for all foes.',path:'M50 10 C72.091 10 90 27.909 90 50 C90 72.091 72.091 90 50 90 C27.909 90 10 72.091 10 50 C10 27.909 27.909 10 50 10 Z M50 50 L50 10',strokes:[shape([50,10],[[72.091,10,90,27.909,90,50],[90,72.091,72.091,90,50,90],[27.909,90,10,72.091,10,50],[10,27.909,27.909,10,50,10]]),[{x:50,y:50},{x:50,y:10}]]},
 {id:'ender',name:'Ender',element:'Ancient',color:'#8b9099',description:'Draw a capital K. Deals 1,000 base damage to the nearest enemy. No knockback.',path:'M20 10 L20 90 M80 10 L20 50 L80 90',strokes:[[{x:20,y:10},{x:20,y:90}],[{x:80,y:10},{x:20,y:50},{x:80,y:90}]],developerOnly:true,upgradable:false},
 {id:'firestorm',name:'Firestorm',element:'Fire',color:'#f0a068',description:'Draw a horizontal line above two matching downward triangles. Clouds roll in for 2 seconds, then rain fire on every foe: 2 damage every 0.5 seconds. Better shapes sustain the storm longer. No knockback. Recasting adds duration.',path:'M10 18 L90 18 M12 30 L44 30 L28 62 Z M56 30 L88 30 L72 62 Z',strokes:[[{x:10,y:18},{x:90,y:18}],[{x:12,y:30},{x:44,y:30},{x:28,y:62},{x:12,y:30}],[{x:56,y:30},{x:88,y:30},{x:72,y:62},{x:56,y:30}]]}
];
export const PLAYER_SPELLS=SPELLS.filter(spell=>!spell.developerOnly);
export function isUpgradableSpell(id:SpellId){const spell=SPELLS.find(s=>s.id===id);return !!spell&&spell.upgradable!==false;}
// Recognition-only alternatives; spellbook art and perfect traces use SPELLS unchanged.
export const SPELL_VARIATIONS:Partial<Record<SpellId,Strokes[]>>={
 fire:[[[{x:50,y:12},{x:85,y:12+35*Math.sqrt(3)},{x:15,y:12+35*Math.sqrt(3)},{x:50,y:12}]]]
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
export function recognize(strokes:Strokes,known:SpellId[]=SPELLS.map(s=>s.id)){
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
 const accepted=top.quality>=48&&margin>=7;
 return{spell:accepted?top.spell:null,quality:top.quality,candidates,reason:accepted?'':margin<7?'The shape is between two sigils. Make its defining details clearer.':'The sigil is incomplete or its shape needs more care.'};
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
export function knockback(quality:number){return accuracyStrength(quality).knockback;}
export const HOLD_MS=500;
export function chargeColor(progress:number,elementColor?:string){return progress>=.5&&elementColor?elementColor:'#d9b9ff';}
export const REFILL_MS=1000;
export function refillDurationMs(ink:number){return Math.max(0,100-Math.max(0,Math.min(100,ink)))*10;}
export function refillInk(ink:number,elapsedMs:number){return Math.min(100,Math.max(0,ink)+Math.max(0,elapsedMs)/10);}
export function chargeComplete(start:number,now:number){return now-start>=HOLD_MS;}
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
