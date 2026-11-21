import {PRACTICE_SCORING_VARIANTS,SPELLS,type SpellId,type Strokes} from './magic.ts';
import {elementTrace} from './tutorial2Elements.ts';
const clone=(paths:Strokes)=>paths.map(p=>p.map(v=>({...v})));
export const LESSON_INSTRUCTIONS:Partial<Record<SpellId,string>>={
 eruption:'In one stroke, start at the bottom left, curve up to the flat top, curve down the other side, then close the base.',
 shroomy:'Start at the lower left of the cap and draw the dome, then close it across the flat base. Draw the stem from left to right beneath the cap.',
 scorchy:'Draw the circle, then the two triangles from left to right. Draw the mouth from its left corner across the top, then follow the curve back to where you started.',
 snowman:'Draw a small circle for the head and a larger one touching it below. From each upper side of the larger circle, draw a short line up and out.',
 torrent:'Start at the left tip, follow the arc down to the shared bottom point, then sweep up the right arc in one continuous stroke.',
 water:'Start at the tip and draw the droplet counterclockwise.',fire:'Start at the top and draw the triangle counterclockwise.',nature:'Draw the sprouts from left to right, then draw the stem down.',
 wave:'Start at the tip of the water droplet and draw counterclockwise. Once the droplet is finished, start from the left of the caret and draw it from left to right.',
 bolt:'Draw it from the top to bottom.',leaf:'Draw it from the left-most corner, and go clockwise.',chronos:'From the top of the circle, draw counter-clockwise. When the circle is completed, draw down.',
 tidalcrest:'Start the draw from the bottom left then draw it clockwise.',firestorm:'Draw the horizontal line from left to right. Then draw the left triangle from top left clockwise. Repeat for the right triangle.',
 bog:'From the top, draw a circle counterclockwise. Draw a bramble leaf in the center from the left corner clockwise.',
 constellation:'Draw one continuous stroke from the top down. Loop left, cross the stem, then sweep out to the right.',
 alchemize:'Draw the bottle from the top left counterclockwise. For the cork, start at the bottom left, draw up the left side, across the top, then down the right side. Do not draw the bottom.',
 puddleGuard:'Draw it from left to right.',flameBlade:'Draw the guard from upper left to lower right. Draw the handle from the center of the guard down to the left. Start at the upper-left end of the blade’s base, draw up to the tip, then down to the other end.',
 toxicTwig:'Draw a long vertical line with two short bars across the middle. You can draw the bars separately or connect them at one end in a single stroke.',
 thistleBush:'Draw it from left to right.',sneakyVine:'Start at the bottom right of the shape and finish drawing it.',
};
export function practiceLesson(id:SpellId){
 const spell=SPELLS.find(s=>s.id===id);if(!spell||!LESSON_INSTRUCTIONS[id])return null;
 let paths=clone(PRACTICE_SCORING_VARIANTS[id]??spell.strokes);
 if(['water','fire','nature'].includes(id))paths=clone(elementTrace(id,1).strokes);
 if(id==='wave')paths=[paths[1].reverse(),paths[0]];
 const length=paths.reduce((sum,p)=>sum+p.slice(1).reduce((n,b,i)=>n+Math.hypot(b.x-p[i].x,b.y-p[i].y),0),0);
 return {spell,paths,instruction:LESSON_INSTRUCTIONS[id]!,duration:(id==='water'?4500:['fire','nature'].includes(id)?4000:Math.max(4000,Math.min(8000,length*25)))/1.2};
}
/** Time follows path length, with a visible brush lift between independent strokes. */
export function lessonFrame(paths:Strokes,progress:number){
 if(progress>=1)return {strokes:clone(paths),tip:{...paths.at(-1)!.at(-1)!}};
 const lengths=paths.map(path=>path.slice(1).reduce((n,b,i)=>n+Math.hypot(b.x-path[i].x,b.y-path[i].y),0));
 const total=lengths.reduce((a,b)=>a+b,0)+Math.max(0,paths.length-1)*15;
 let remaining=total*Math.max(0,Math.min(1,progress));const strokes:Strokes=[];let tip=paths[0][0];
 for(let s=0;s<paths.length;s++){
  const path=paths[s],partial=[path[0]];tip=path[0];
  for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i],distance=Math.hypot(b.x-a.x,b.y-a.y);
   if(remaining>=distance){partial.push(b);remaining-=distance;tip=b;}else{const t=distance?remaining/distance:0;tip={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};partial.push(tip);strokes.push(partial);return{strokes,tip};}
  }
  strokes.push(partial);if(s<paths.length-1){if(remaining<15)return{strokes,tip};remaining-=15;}
 }
 return {strokes,tip};
}

export function lessonTipPages(text:string,capacity:number){
 const pages:string[]=[];let part='';
 for(const word of text.trim().split(/\s+/).filter(Boolean)){if(part&&part.length+word.length+1>capacity){pages.push(part);part='';}part+=(part?' ':'')+word;}
 if(part)pages.push(part);return pages;
}
