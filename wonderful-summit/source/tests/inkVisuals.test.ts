import test from 'node:test';
import assert from 'node:assert/strict';
import {inkRumble,inkExpansion,paintSpellInk} from '../src/inkVisuals.ts';
import {type Strokes} from '../src/magic.ts';

test('rumble begins with the color transition, increases gently and never exceeds one pixel',()=>{
 for(const p of [0,.39,.4]){const r=inkRumble(p,123);assert.equal(Math.abs(r.x),0);assert.equal(Math.abs(r.y),0);}
 assert.ok(Math.abs(inkRumble(.9,123).x)>Math.abs(inkRumble(.5,123).x));
 for(let time=0;time<1000;time+=7){const r=inkRumble(1,time);assert.ok(Math.abs(r.x)<=1);assert.ok(Math.abs(r.y)<=.75);}
 const reduced=inkRumble(1,123,true);assert.equal(Math.abs(reduced.x),0);assert.equal(Math.abs(reduced.y),0);
});
function context(){
 const calls:{kind:string;args:number[];alpha:number}[]=[];
 const ctx={globalAlpha:1,save(){},restore(){},beginPath(){},scale(...args:number[]){calls.push({kind:"scale",args,alpha:this.globalAlpha});},translate(...args:number[]){calls.push({kind:'translate',args,alpha:this.globalAlpha});},moveTo(...args:number[]){calls.push({kind:'move',args,alpha:this.globalAlpha});},lineTo(...args:number[]){calls.push({kind:'line',args,alpha:this.globalAlpha});},stroke(){calls.push({kind:'stroke',args:[],alpha:this.globalAlpha});}};
 return {ctx:ctx as unknown as CanvasRenderingContext2D,calls};
}
test('rumble and dissolve preserve recognition geometry and completely remove released ink',()=>{
 const drawing:Strokes=[[{x:10,y:10},{x:50,y:15},{x:20,y:50}]],before=structuredClone(drawing);
 for(const reduced of [false,true]){
  const c=context();paintSpellInk(c.ctx,drawing,'#ffadef',.8,123,null,reduced);assert.ok(c.calls.some(c=>c.kind==='stroke'));
  const middle=context();paintSpellInk(middle.ctx,drawing,'#ffadef',0,123,.5,reduced);assert.ok(middle.calls.some(c=>c.kind==='stroke'&&c.alpha<1));
  const end=context();paintSpellInk(end.ctx,drawing,'#ffadef',0,123,1,reduced);assert.ok(!end.calls.some(c=>c.kind==='stroke'));
 }
 assert.deepEqual(drawing,before);
});
test('reduced-motion dissolve fades the intact drawing without drift or fragments',()=>{
 const c=context();paintSpellInk(c.ctx,[[{x:1,y:2},{x:5,y:9}]],'#ffa1ed',1,123,.5,true);
 assert.deepEqual(c.calls.filter(c=>c.kind==='move'||c.kind==='line').map(c=>c.args),[[1,2],[5,9]]);
 assert.equal(c.calls.find(c=>c.kind==='stroke')?.alpha,.5);
 assert.ok(!c.calls.some(c=>c.kind==='translate'));
});

test('ink expands only during the color transition and keeps recognition points intact',()=>{
 const drawing:Strokes=[[{x:10,y:10},{x:50,y:15},{x:20,y:50}]],before=structuredClone(drawing);
 assert.equal(inkExpansion(.4),0);assert.equal(inkExpansion(.65),.5);assert.equal(inkExpansion(.9),1);assert.equal(inkExpansion(1),1);
 const c=context();paintSpellInk(c.ctx,drawing,'#ff6508',.9,123,null);
 assert.ok(c.calls.some(c=>c.kind==='scale'&&Math.abs(c.args[0]-1.08)<.0001));assert.ok(c.ctx.lineWidth>3.45);
 const reduced=context();paintSpellInk(reduced.ctx,drawing,'#ff6508',.9,123,null,true);
 assert.ok(!reduced.calls.some(c=>c.kind==='scale'));assert.deepEqual(drawing,before);
});
