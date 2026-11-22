import React from 'react';
/** A trace action belongs to the drawing surface, never to the open spell picker. */
export function CanvasTraceControls({active,menuOpen,disabled,onHide,onLearn}:{active:boolean;menuOpen:boolean;disabled:boolean;onHide:()=>void;onLearn?:()=>void}){
 if(!active||menuOpen)return null;
 return <div className="canvas-trace-controls"><button className="hide-trace" onClick={onHide} disabled={disabled}>Hide trace</button>{onLearn&&<button className="learn-drawing" onClick={onLearn} disabled={disabled}>Learn drawing</button>}</div>;
}
