import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fileURLToPath} from 'node:url';
import {loadArt} from './helpers/loadArt.ts';
import {newBattle} from '../src/battle.ts';
const {CooldownBadges}=loadArt(fileURLToPath(new URL('../src/CooldownBadges.tsx',import.meta.url)));
test('cooldown feedback targets only the blocked spell and retains queue order and remaining time',()=>{
 const battle=newBattle('active');battle.time=5;battle.cooldowns={bog:20,chronos:30};
 const props={battle,ids:['bog','chronos'],feedback:{spellId:'chronos',serial:1},onFeedbackEnd(){}};
 const html=renderToStaticMarkup(React.createElement(CooldownBadges,props));
 assert.equal((html.match(/class="cooldown-cast-blocked"/g)??[]).length,1);assert.ok(html.indexOf('Drudge Bog cooldown')<html.indexOf('Chronos Denalis cooldown'));assert.ok(html.includes('25.0s'));assert.ok(!html.includes('<h3'));assert.equal(battle.cooldowns.chronos,30);
});
test('each blocked attempt restarts the matching badge cue and reports its own completion token',()=>{
 const battle=newBattle('active');battle.cooldowns={bog:20,chronos:30};const ended:number[]=[];
 const props={battle,ids:['bog','chronos'],feedback:{spellId:'chronos',serial:1},onFeedbackEnd:(serial:number)=>ended.push(serial)};
 const first=CooldownBadges(props).props.children,second=CooldownBadges({...props,feedback:{spellId:'chronos',serial:2}}).props.children;
 assert.equal(first[0].key,second[0].key);assert.notEqual(first[1].key,second[1].key);first[1].props.onAnimationEnd();second[1].props.onAnimationEnd();assert.deepEqual(ended,[1,2]);
 assert.equal(CooldownBadges({...props,ids:[]}),null);
});
