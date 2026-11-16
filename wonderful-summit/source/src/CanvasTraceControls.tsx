import React from 'react';
/** A trace action belongs to the drawing surface, never to the open spell picker. */
export function CanvasTraceControls({active,menuOpen,disabled,onHide}:{active:boolean;menuOpen:boolean;disabled:boolean;onHide:()=>void}){
 if(!active||menuOpen)return null;
 return <div className="canvas-trace-controls"><button onClick={onHide} disabled={disabled}>Hide trace</button></div>;
}
