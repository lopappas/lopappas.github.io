import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {renderToStaticMarkup} from 'react-dom/server';
import {loadArt} from './helpers/loadArt.ts';
import {decorativeTime} from '../src/visualCadence.ts';
import {TargetCaret} from '../src/TargetCaret.ts';
const art=(name:string)=>loadArt(fileURLToPath(new URL('../src/'+name+'.tsx',import.meta.url)));
const ui=art('EnemyUI'),fire=art('FirestormArt'),bog=art('BogArt'),burn=art('EnemyEffects'),torrent=art('TorrentArt');
const markup=(component:any,props:any)=>renderToStaticMarkup(React.createElement(component,props));
const equalProps=(a:any,b:any)=>Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>Object.is(a[k],b[k]));
test('cached enemy labels and indicators exactly preserve prior SVG across enemy types, health, status and crown loss',()=>{
 const fixtures=JSON.parse(readFileSync(new URL('./fixtures/enemy-ui-0.2.93.json',import.meta.url),'utf8'));
 for(const {props,markup:expected} of fixtures){const {e,color,kingUIOffset,enemyEntrance,status}=props;
  const labels=markup(ui.EnemyNameplate,{kind:e.kind,element:e.element,goblinKing:e.goblinKing,rocky:e.rocky,hp:e.hp,maxHP:e.maxHP,color,kingUIOffset,enemyEntrance});
  const indicators=markup(ui.EnemyIndicators,{attacking:e.attackAt!==null,status,statusY:e.goblinKing?-195+kingUIOffset:e.kind==='mother'?-145:-97});
  assert.equal(labels+indicators,expected);
 }
 for(const component of [ui.EnemyNameplate,ui.EnemyIndicators,TargetCaret])assert.equal(component.$$typeof,Symbol.for('react.memo'));
});
test('cached labels still reflect actual health, element, status and target changes',()=>{
 const props={kind:'mother',element:'Fire',hp:40,maxHP:100,color:'#abc',kingUIOffset:0};
 for(const change of [{hp:39.9},{element:'Water'},{color:'#def'},{kingUIOffset:48}])assert.notEqual(markup(ui.EnemyNameplate,props),markup(ui.EnemyNameplate,{...props,...change}));
 assert.notEqual(markup(ui.EnemyIndicators,{attacking:false,status:null,statusY:-97}),markup(ui.EnemyIndicators,{attacking:true,status:'Burn',statusY:-97}));
 assert.notEqual(markup(TargetCaret,{element:'Fire'}),markup(TargetCaret,{element:'Water'}));
});
test('prepared storm, bog and burn geometry matches pre-change snapshots at sampled timestamps',()=>{
 const fixtures=JSON.parse(readFileSync(new URL('./fixtures/spell-art-0.2.93.json',import.meta.url),'utf8'));
 for(const fixture of fixtures)assert.equal(markup(fixture.name==='FirestormArt'?fire.FirestormArt:fixture.name==='BogArt'?bog.BogArt:burn.EnemyEffects,fixture.props),fixture.markup);
});
test('decorative views reuse props on alternating 60 Hz updates, even when simulation objects change',()=>{
 const count=(frame:(time:number)=>any)=>{let changes=0,previous:any;for(let i=0;i<120;i++){const next=frame(3+i/60);assert.equal(next.type.$$typeof,Symbol.for('react.memo'));if(!previous||!equalProps(previous,next.props))changes++;previous=next.props;}return changes;};
 assert.equal(count(time=>fire.FirestormArt({storm:{started:0,rainAt:2,nextTick:time,portions:[{until:20,quality:60}]},time,gray:0})),60);
 assert.equal(count(time=>bog.BogArt({bog:{started:0,portions:[{until:20,hitIds:[]}]},time,gray:0})),60);
 assert.equal(count(time=>burn.EnemyEffects({enemy:{rootUntil:0,curseTick:null,burn:{ticks:3}},time})),60);
 assert.equal(count(time=>burn.EnemyEffects({enemy:{rootUntil:0,curseTick:5,burn:null},time})),1);
});
test('battle-clock sampling pauses without drift and cannot advance effect time into the future',()=>{
 for(let i=0;i<1000;i++){const time=i/127,frame=decorativeTime(time);assert.ok(frame<=time+1e-10);assert.ok(time-frame<1/30+1e-10);assert.equal(decorativeTime(time),frame);}
 assert.equal(decorativeTime(3),3);assert.equal(decorativeTime(3+1/60),3);assert.equal(decorativeTime(3+1/30),3+1/30);
});
test('activation, rain onset, extensions and status removal invalidate decoration within the same bucket',()=>{
 const storm={started:1.011,rainAt:3.011,portions:[{until:10}]};
 assert.equal(fire.FirestormArt({storm:null,time:3.012}),null);
 const before=fire.FirestormArt({storm,time:3.010}),after=fire.FirestormArt({storm,time:3.012});assert.equal(before.props.time,after.props.time);assert.equal(before.props.raining,false);assert.equal(after.props.raining,true);
 assert.notEqual(fire.FirestormArt({storm:{...storm,portions:[{until:14}]},time:3.012}).props.end,after.props.end);
 assert.ok(fire.FirestormArt({storm,time:1.012}).props.time>=storm.started);
 assert.equal(bog.BogArt({bog:null,time:3.012}),null);
 const e={rootUntil:3.011,curseTick:null,burn:{ticks:1}};
 assert.equal(burn.EnemyEffects({enemy:e,time:3.010}).props.rooted,true);const removed=burn.EnemyEffects({enemy:{...e,burn:null},time:3.012});assert.equal(removed.props.rooted,false);assert.equal(removed.props.burning,false);
});
test('Torrent falling orbs retain full-rate motion, splash sampling preserves immediate impact and expiry',()=>{
 const landsAt=3.011,state={orbs:[{x:400,y:420,landsAt}]};
 const child=(time:number)=>torrent.TorrentArt({torrent:state,time}).props.children[0];
 const a=child(2.99),b=child(3.005);assert.equal(a.props.time,2.99);assert.equal(b.props.time,3.005);assert.equal(a.props.falling,true);
 const impact=child(landsAt);assert.equal(impact.props.falling,false);assert.equal(impact.props.time,landsAt);
 assert.equal(child(3.012).props.time,landsAt);assert.equal(child(landsAt+1),null);assert.equal(torrent.TorrentArt({torrent:null,time:4}),null);
});
