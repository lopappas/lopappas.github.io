import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPELLS,recognize,inkCost,strokeLength,chargeComplete,power,knockback,grade} from '../src/magic.ts';
test('each reference sigil recognizes with excellent quality',()=>{for(const s of SPELLS){const r=recognize(s.strokes);assert.equal(r.spell?.id,s.id);assert.ok(r.quality>=98);}});
test('position and uniform scale do not change quality',()=>{for(const s of SPELLS){const base=recognize(s.strokes);for(const scale of [.15,2,9]){const moved=s.strokes.map(st=>st.map(p=>({x:p.x*scale+321,y:p.y*scale-78})));const r=recognize(moved);assert.equal(r.spell?.id,s.id);assert.equal(r.quality,base.quality);}}});
test('stroke direction and order do not affect nature classification',()=>{const s=SPELLS[2];const r=recognize([...s.strokes].reverse().map(st=>[...st].reverse()));assert.equal(r.spell?.id,'nature');assert.ok(r.quality>=95);});
test('scribbles, a line, a dot, and a partial drop do not cast',()=>{const shapes=[[Array.from({length:70},(_,i)=>({x:i%2*100,y:i*2}))],[[{x:0,y:0},{x:100,y:0}]],[[{x:1,y:1}]], [SPELLS[0].strokes[0].slice(0,25)]];for(const s of shapes)assert.equal(recognize(s).spell,null);});
test('poorly proportioned shapes score below faithful shapes',()=>{const s=SPELLS[0];const distorted=s.strokes.map(st=>st.map(p=>({x:p.x*.55,y:p.y})));assert.ok(recognize(distorted).quality<recognize(s.strokes).quality-15);});
test('ink follows length and supports 25% more drawing per inkwell',()=>{const cost=inkCost({x:0,y:0},{x:100,y:0},100);assert.ok(Math.abs(cost-17.6)<1e-9);assert.ok(Math.abs(22/cost-1.25)<1e-9);assert.equal(inkCost({x:0,y:0},{x:200,y:0},100),cost*2);assert.ok(strokeLength(SPELLS[0].strokes)>0);});
test('cast requires the full half second',()=>{assert.equal(chargeComplete(1000,1499),false);assert.equal(chargeComplete(1000,1500),true);});

test('every faint score is weaker and every higher grade is stronger than the previous balance',()=>{
 for(let q=48;q<=100;q++){
  const oldDamage=Math.round(8+24*(q/100)**2),oldPush=24+q*.5;
  if(q<60){assert.ok(power(q)<oldDamage,`Faint damage at ${q}`);assert.ok(knockback(q)<oldPush,`Faint push at ${q}`);}
  else{assert.ok(power(q)>oldDamage,`Higher-grade damage at ${q}`);assert.ok(knockback(q)>oldPush,`Higher-grade push at ${q}`);}
  if(q>48){assert.ok(power(q)>=power(q-1));assert.ok(knockback(q)>=knockback(q-1));}
 }
 const endpoints=[[48,'Faint',8,18],[59,'Faint',12,26],[60,'Steady',19,58],[69,'Steady',23,67],[70,'Beautiful',27,81],[79,'Beautiful',33,93],[80,'Wonderful',40,111],[100,'Wonderful',64,160]] as const;
 for(const [q,label,damage,push] of endpoints){assert.equal(grade(q),label);assert.equal(power(q),damage);assert.equal(knockback(q),push);}
 assert.ok(power(100)-power(90)>power(90)-power(80));
 assert.ok(knockback(100)-knockback(90)>knockback(90)-knockback(80));
 for(const q of [-10,0,47,NaN]){assert.equal(power(q),0);assert.equal(knockback(q),0);}
 assert.equal(power(200),power(100));assert.equal(knockback(200),knockback(100));
});
test('a careful wonderful cast outperforms several faint casts',()=>{
 assert.ok(power(80)>power(59)*3);assert.ok(knockback(80)>knockback(59)*3);
 assert.ok(power(100)>power(59)*5);assert.ok(knockback(100)>knockback(59)*5);
});
