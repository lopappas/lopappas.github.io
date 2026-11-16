import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fileURLToPath} from 'node:url';
import {loadArt} from './helpers/loadArt.ts';
import {newRun,finishOpening,selectMode} from '../src/run.ts';
const {HomeModeChoicesView}=loadArt(fileURLToPath(new URL('../src/HomeModeChoices.tsx',import.meta.url)));
test('mode choices preserve Expert entry, keep Apprentice on the menu and provide Back and Escape',()=>{
 let run=finishOpening(newRun()),comingSoon=false,backs=0;
 const props={ready:true,comingSoon:false,onApprentice:()=>{comingSoon=true;},onExpert:()=>{run=selectMode(run,'new',()=>.5);},onBack:()=>backs++};
 const tree=HomeModeChoicesView(props),[apprentice,expert]=tree.props.children[0].props.children,back=tree.props.children[1];
 apprentice.props.onClick();assert.equal(comingSoon,true);assert.equal(run.screen,'menu');
 back.props.onClick();assert.equal(backs,1);
 let prevented=false;tree.props.onKeyDown({key:'Escape',preventDefault(){prevented=true;}});assert.equal(backs,2);assert.equal(prevented,true);
 expert.props.onClick();assert.equal(run.screen,'sister');assert.ok(run.keepsakeOffers.length>0);
});
test('mode choices expose accessible labels, existing grade lettering, transition lock and Coming soon status',()=>{
 const props={ready:false,comingSoon:false,onApprentice(){},onExpert(){},onBack(){}};
 assert.equal(HomeModeChoicesView(props).props.inert,true);
 const markup=renderToStaticMarkup(React.createElement(HomeModeChoicesView,{...props,ready:true,comingSoon:true}));
 assert.match(markup,/grade-beautiful/);assert.match(markup,/grade-wonderful/);assert.match(markup,/aria-label="Apprentice"/);assert.match(markup,/aria-label="Expert"/);assert.match(markup,/role="status">Coming soon/);assert.match(markup,/>Back</);assert.doesNotMatch(markup,/inert=""/);
});
