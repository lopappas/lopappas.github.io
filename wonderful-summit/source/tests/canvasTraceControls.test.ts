import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadArt} from './helpers/loadArt.ts';
import {CombatTrace} from '../src/combatTrace.ts';
const {CanvasTraceControls}=loadArt(fileURLToPath(new URL('../src/CanvasTraceControls.tsx',import.meta.url)));
test('canvas Hide trace exists only for an active guide outside the spell picker',()=>{
 const props={active:false,menuOpen:false,disabled:false,onHide(){}};assert.equal(CanvasTraceControls(props),null);assert.equal(CanvasTraceControls({...props,active:true,menuOpen:true}),null);
 const visible=CanvasTraceControls({...props,active:true});assert.equal(visible.props.children.props.children,'Hide trace');assert.equal(visible.props.children.props.disabled,false);assert.equal(CanvasTraceControls({...props,active:true,disabled:true}).props.children.props.disabled,true);
});
test('canvas Hide trace triggers the supplied dismissal action without changing Expert cooldown',()=>{
 const trace=new CombatTrace();trace.select('fire',['fire'],'expert',4);let calls=0;const controls=CanvasTraceControls({active:true,menuOpen:false,disabled:false,onHide(){calls++;trace.hide();}});controls.props.children.props.onClick();assert.equal(calls,1);assert.equal(trace.spellId,null);assert.equal(trace.canSelect('expert',6),false);assert.equal(trace.canSelect('expert',16),true);
});
test('opening and closing the picker cannot revive a dismissed guide or bypass its cooldown',()=>{
 for(const mode of ['apprentice','expert'] as const){const trace=new CombatTrace();trace.select('water',['water','fire'],mode,0);trace.hide();assert.equal(trace.spellId,null);trace.advance(1);assert.equal(trace.spellId,null);assert.equal(trace.select('fire',['water','fire'],mode,1),mode==='apprentice');}
});
