import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import * as bodies from '../src/CharacterBodies.ts';
import {sameSpiderPose} from '../src/spiderPose.ts';
import {PerformanceMetrics} from '../src/performanceMetrics.ts';
type Fixture={name:keyof typeof bodies;props:Record<string,unknown>;markup:string};
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/character-bodies.json',import.meta.url),'utf8')) as Fixture[];
test('cached character bodies match pre-extraction SVG across colors, attack, rocky and practice states',()=>{
 for(const fixture of fixtures){const art=bodies[fixture.name];const markup=renderToStaticMarkup(React.createElement(art as React.ComponentType<Record<string,unknown>>,fixture.props));assert.equal(markup,fixture.markup,`${fixture.name}: ${JSON.stringify(fixture.props)}`);assert.equal(art.$$typeof,Symbol.for('react.memo'));}
});
test('stationary spiders reuse artwork but moving legs retain clock-driven updates and color changes',()=>{
 const still={color:'#abc',clock:1,moving:false};assert.equal(sameSpiderPose(still,{...still,clock:10}),true);assert.equal(sameSpiderPose(still,{...still,moving:true}),false);assert.equal(sameSpiderPose(still,{...still,color:'#def'}),false);
 const moving={...still,moving:true};assert.equal(sameSpiderPose(moving,{...moving,clock:2}),false);assert.equal(sameSpiderPose(moving,{...moving}),true);assert.equal(sameSpiderPose(moving,still),false);
});
test('art commit diagnostics remain optional and reset independently of frame sampling',()=>{
 const metrics=new PerformanceMetrics();metrics.recordArtCommit();assert.equal(metrics.snapshot().artCommits,0);metrics.enabled=true;metrics.recordFrame(1000,1);metrics.recordArtCommit();metrics.recordArtCommit();assert.equal(metrics.snapshot().artCommits,2);assert.equal(metrics.snapshot().artCommitsPerActiveSecond,2);metrics.reset();assert.equal(metrics.snapshot().artCommits,0);
});
