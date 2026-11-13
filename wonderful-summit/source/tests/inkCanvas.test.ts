import test from 'node:test';
import assert from 'node:assert/strict';
import {inkPixelRatio,resizeInkCanvas} from '../src/inkCanvas.ts';
import {ReleasedInkFade} from '../src/inkVisuals.ts';

test('ink resolution retains lower-density displays and caps high-density displays at two',()=>{
 for(const ratio of [.8,1,1.25,1.5,2])assert.equal(inkPixelRatio(ratio),ratio);
 for(const ratio of [2.5,3,4])assert.equal(inkPixelRatio(ratio),2);
 for(const ratio of [0,-1,NaN,Infinity])assert.equal(inkPixelRatio(ratio),1);
});
test('phone ink backing uses four ninths of the former pixels without changing CSS size',()=>{
 const canvas={width:0,height:0,style:{width:'430px',height:'739px'}};
 resizeInkCanvas(canvas,430,739,3);
 assert.equal(canvas.width,860);assert.equal(canvas.height,1478);
 assert.equal(canvas.width*canvas.height/(1290*2217),4/9);
 assert.deepEqual(canvas.style,{width:'430px',height:'739px'});
 resizeInkCanvas(canvas,739,430,3);assert.equal(canvas.width,1478);assert.equal(canvas.height,860);
 resizeInkCanvas(canvas,430.25,200.75,1.5);assert.equal(canvas.width,645);assert.equal(canvas.height,301);
});
test('repeated layout notifications preserve cached released ink; actual resizes invalidate it',()=>{
 let width=0,height=0,resets=0;
 const canvas={get width(){return width;},set width(value:number){width=value;resets++;},get height(){return height;},set height(value:number){height=value;resets++;}};
 const strokes=[[{x:10,y:20},{x:80,y:90}]],fade=new ReleasedInkFade(0);
 resizeInkCanvas(canvas,430,739,3);assert.equal(resets,2);assert.equal(fade.needsPaint(width,height,strokes),true);
 for(let i=0;i<10;i++){resizeInkCanvas(canvas,430,739,3);assert.equal(fade.needsPaint(width,height,strokes),false);}
 assert.equal(resets,2);assert.equal(fade.opacity(105),.5);
 resizeInkCanvas(canvas,739,430,3);assert.equal(resets,4);assert.equal(fade.needsPaint(width,height,strokes),true);
 resizeInkCanvas(canvas,739,430,1);assert.equal(resets,6);assert.equal(fade.needsPaint(width,height,strokes),true);
});
