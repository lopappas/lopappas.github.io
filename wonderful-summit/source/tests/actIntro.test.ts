import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_INTRO_HOLD_MS,ACT_INTRO_PAN_MS,actIntroFrame} from '../src/actIntro.ts';
import {INK_DISSOLVE_MS,CAST_PAGE_FLIP_MS,CAST_TRANSITION_MS} from '../src/inkVisuals.ts';
test('act introduction holds at the destination for 1200 ms, then reaches the bottom',()=>{
 assert.equal(ACT_INTRO_HOLD_MS,1200);
 for(const time of [0,200,1199,1200])assert.deepEqual(actIntroFrame(time,900),{scrollTop:0,done:false});
 assert.deepEqual(actIntroFrame(1200+ACT_INTRO_PAN_MS,900),{scrollTop:900,done:true});
 assert.deepEqual(actIntroFrame(5000,900),{scrollTop:900,done:true});
});
test('the descent eases monotonically and uses the current viewport scroll range',()=>{
 let previous=0;for(let time=1200;time<=1850;time+=5){const frame=actIntroFrame(time,900);assert.ok(frame.scrollTop>=previous&&frame.scrollTop<=900);previous=frame.scrollTop;}
 assert.equal(actIntroFrame(1525,900).scrollTop,450);
 assert.equal(actIntroFrame(1525,400).scrollTop,200);
 assert.ok(actIntroFrame(1250,900).scrollTop<90);
});
test('reduced-motion and short trails preserve the destination pause without unnecessary movement',()=>{
 assert.deepEqual(actIntroFrame(1199,900,true),{scrollTop:0,done:false});
 assert.deepEqual(actIntroFrame(1200,900,true),{scrollTop:900,done:true});
 assert.deepEqual(actIntroFrame(1200,-20),{scrollTop:0,done:true});
});
test('cast dissolve is forty percent shorter and the restored flip finishes before unlocking the canvas',()=>{
 assert.equal(INK_DISSOLVE_MS,350*.6);assert.equal(CAST_PAGE_FLIP_MS,340);
 assert.equal(CAST_TRANSITION_MS,INK_DISSOLVE_MS+CAST_PAGE_FLIP_MS);
 assert.equal(CAST_TRANSITION_MS,550);assert.ok(CAST_TRANSITION_MS<650);
});
