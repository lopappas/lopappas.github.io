import React,{memo,useSyncExternalStore,type ReactNode} from 'react';
import {chargeColor} from './magic';
import type {DrawingPresentation} from './drawingPresentation';
export const InkMeter=memo(function InkMeter({signals,unlimited}:{signals:DrawingPresentation;unlimited:boolean}){
 const ink=useSyncExternalStore(signals.subscribeInk,signals.getInk);
 return <><div className={`ink-track${ink<=25&&!unlimited?' ink-low':''}`} role="meter" aria-label="Brush ink" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ink)}><i style={{width:`${unlimited?100:ink}%`}}/></div><strong>{unlimited?'∞':Math.ceil(ink)}<small>/100</small></strong></>;
});
export function DrawingFrame({signals,color,className,children}:{signals:DrawingPresentation;color?:string;className:string;children:ReactNode}){
 const charge=useSyncExternalStore(signals.subscribeCharge,signals.getCharge),tint=chargeColor(charge,color);
 return <div className={`${className}${charge?' charging':''}`} style={{'--charge-color':tint,'--charge-glow':`${tint}66`} as React.CSSProperties}>{children}</div>;
}
export function ChargeTrack({signals,color}:{signals:DrawingPresentation;color?:string}){
 const charge=useSyncExternalStore(signals.subscribeCharge,signals.getCharge),tint=chargeColor(charge,color);
 return <div className="charge-track" style={{background:`conic-gradient(from -90deg, ${tint} ${charge*360}deg, transparent ${charge*360}deg)`}}/>;
}
