import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_INTRO_HOLD_MS,ACT_INTRO_PAN_MS,actIntroFrame,playActIntro} from '../src/actIntro.ts';
import {INK_FADE_MS,CAST_TRANSITION_MS} from '../src/inkVisuals.ts';
test('act introduction holds at the destination for 1200 ms, then reaches the bottom',()=>{
 assert.equal(ACT_INTRO_HOLD_MS,1200);
 for(const time of [0,200,1199,1200])assert.deepEqual(actIntroFrame(time,900),{scrollTop:0,done:false});
 assert.deepEqual(actIntroFrame(1200+ACT_INTRO_PAN_MS,900),{scrollTop:900,done:true});
 assert.deepEqual(actIntroFrame(5000,900),{scrollTop:900,done:true});
});
test('the descent eases monotonically and uses the current viewport scroll range',()=>{
 let previous=0;for(let time=1200;time<=1200+ACT_INTRO_PAN_MS;time+=5){const frame=actIntroFrame(time,900);assert.ok(frame.scrollTop>=previous&&frame.scrollTop<=900);previous=frame.scrollTop;}
 assert.ok(Math.abs(actIntroFrame(1200+ACT_INTRO_PAN_MS/2,900).scrollTop-450)<1e-9);
 assert.ok(Math.abs(actIntroFrame(1200+ACT_INTRO_PAN_MS/2,400).scrollTop-200)<1e-9);
 assert.ok(actIntroFrame(1250,900).scrollTop<90);
});
test('reduced-motion and short trails preserve the destination pause without unnecessary movement',()=>{
 assert.deepEqual(actIntroFrame(1199,900,true),{scrollTop:0,done:false});
 assert.deepEqual(actIntroFrame(1200,900,true),{scrollTop:900,done:true});
 assert.deepEqual(actIntroFrame(1200,-20),{scrollTop:0,done:true});
});
test('casting unlocks after the fade alone with no page flip delay',()=>{
 assert.equal(INK_FADE_MS,350*.6);
 assert.equal(CAST_TRANSITION_MS,INK_FADE_MS);assert.equal(CAST_TRANSITION_MS,210);
});
test('sweep speed is 15 percent slower and an early tap skips only the remaining hold',()=>{
 assert.equal(650/ACT_INTRO_PAN_MS,.85);
 const tapAt=250;
 assert.deepEqual(actIntroFrame(tapAt,900,false,tapAt),{scrollTop:0,done:false});
 assert.ok(actIntroFrame(tapAt+20,900,false,tapAt).scrollTop>0);
 assert.equal(actIntroFrame(tapAt+ACT_INTRO_PAN_MS/2,900,false,tapAt).scrollTop,450);
 assert.deepEqual(actIntroFrame(tapAt+ACT_INTRO_PAN_MS,900,false,tapAt),{scrollTop:900,done:true});
 assert.deepEqual(actIntroFrame(250,900,true,250),{scrollTop:900,done:true});
});
function harness(reduced=false){
 const content=Object.assign(new EventTarget(),{scrollTop:99,scrollHeight:1100,clientHeight:200}),screen=new EventTarget();
 let now=0,serial=0,finished=0;const frames=new Map<number,(now:number)=>void>();
 const cleanup=playActIntro(content,screen,()=>finished++,reduced,{now:()=>now,request:callback=>{frames.set(++serial,callback);return serial;},cancel:id=>{frames.delete(id);}});
 return{content,screen,cleanup,get finished(){return finished;},get pending(){return frames.size;},at(time:number){now=time;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb(time));}};
}
test('tapping anywhere on screen starts the descent, and repeated taps keep its progress',()=>{
 const h=harness();h.at(200);assert.equal(h.content.scrollTop,0);h.screen.dispatchEvent(new Event('pointerdown'));
 h.at(220);assert.ok(h.content.scrollTop>0);h.at(400);const before=h.content.scrollTop;
 h.screen.dispatchEvent(new Event('pointerdown'));h.at(500);assert.ok(h.content.scrollTop>before);
 h.at(200+ACT_INTRO_PAN_MS);assert.equal(h.content.scrollTop,900);assert.equal(h.finished,1);assert.equal(h.pending,0);
 h.screen.dispatchEvent(new Event('pointerdown'));h.at(3000);assert.equal(h.finished,1);
});
test('a tap during automatic sweeping never freezes or restarts it',()=>{
 const h=harness();h.at(1400);const before=h.content.scrollTop;h.screen.dispatchEvent(new Event('pointerdown'));h.at(1500);assert.ok(h.content.scrollTop>before);
 h.at(1200+ACT_INTRO_PAN_MS);assert.equal(h.content.scrollTop,900);assert.equal(h.finished,1);
});
test('navigation cleanup cancels frames and removes tap listeners, while reduced motion skips the pause on tap',()=>{
 const h=harness();h.at(200);h.cleanup();h.screen.dispatchEvent(new Event('pointerdown'));h.at(2000);assert.equal(h.content.scrollTop,0);assert.equal(h.pending,0);assert.equal(h.finished,0);
 const reduced=harness(true);reduced.at(100);reduced.screen.dispatchEvent(new Event('pointerdown'));reduced.at(101);assert.equal(reduced.content.scrollTop,900);assert.equal(reduced.finished,1);
});
test('manual scrolling and keyboard navigation retain their existing cancellation behavior',()=>{
 for(const event of ['wheel','keydown']){const h=harness();h.at(100);h.content.dispatchEvent(new Event(event));h.at(3000);assert.equal(h.finished,1);assert.equal(h.content.scrollTop,0);assert.equal(h.pending,0);}
});
