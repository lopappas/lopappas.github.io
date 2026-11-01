import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PaletteGroup,grayPaint} from '../src/PaletteGroup.ts';
import {newBattle,hitWithSpell} from '../src/battle.ts';
import {chronosGrayAmount,chronosVisuals} from '../src/timeVisuals.ts';
test('native SVG colors become equal RGB channels without CSS filters, preserving alpha and paint references',()=>{
 for(const color of ['#f00','#00ff00','#1234','#124a7899','#fff']){const painted=grayPaint(color,1) as string;assert.equal(painted.slice(1,3),painted.slice(3,5));assert.equal(painted.slice(3,5),painted.slice(5,7));assert.equal(grayPaint(color,0),color);}
 assert.equal(grayPaint('#124a7899',1)?.toString().slice(-2),'99');assert.equal(grayPaint('url(#sky)',1),'url(#sky)');assert.equal(grayPaint('none',1),'none');
});
test('palette inheritance recolors custom effect components while sibling player artwork retains its color',()=>{
 function Effect(){return React.createElement(PaletteGroup,null,React.createElement('path',{fill:'#00f'}));}
 const markup=renderToStaticMarkup(React.createElement('svg',null,React.createElement(PaletteGroup,{amount:1},React.createElement('path',{fill:'#f00'}),React.createElement(React.Fragment,null,React.createElement('path',{fill:'#0f0'})),React.createElement(Effect)),React.createElement('g',{'aria-label':'Fila'},React.createElement('path',{fill:'#f00'}))));
 assert.ok(markup.includes('fill="#363636"'));assert.ok(markup.includes('fill="#121212"'));assert.ok(markup.includes('fill="#b6b6b6"'));assert.ok(markup.includes('fill="#f00"'));assert.ok(!markup.includes('filter'));
});
test('enemy and environment palette amounts fade smoothly with combat time and preserve existing grayscale on recasts',()=>{
 let b=hitWithSpell(newBattle('active'),60,'chronos');assert.equal(chronosGrayAmount(b.enemies[0],0),0);assert.ok(chronosGrayAmount(b.enemies[0],.09)>.4);assert.equal(chronosGrayAmount(b.enemies[0],.18),1);assert.equal(chronosVisuals(b).environmentAmount,0);
 b.time=.2;b=hitWithSpell(b,70,'chronos');assert.equal(chronosGrayAmount(b.enemies[0],b.time),1);assert.equal(chronosVisuals(b).environmentAmount,1);b.time=.38;assert.ok(chronosVisuals(b).environmentAmount>.99);
 b.time=5.39;assert.ok(chronosVisuals(b).environmentAmount>0&&chronosVisuals(b).environmentAmount<1);b.time=5.5;assert.equal(chronosVisuals(b).environmentAmount,0);
 assert.equal(chronosGrayAmount(newBattle('active').enemies[0],.1),0);
});
