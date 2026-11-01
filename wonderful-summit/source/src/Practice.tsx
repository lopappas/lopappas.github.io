import React,{useState,type ComponentType} from 'react';
import type {CombatProps} from './combatTypes';
import {practiceJourney} from './practice';
export type PracticeControls={mobile:boolean;upgraded:boolean;infiniteInk:boolean;onInfiniteInk:(value:boolean)=>void;onMobile:(value:boolean)=>void;onUpgrade:(value:boolean)=>void;onReset:()=>void;onExit:()=>void};
export function Practice({Combat,onExit}:{Combat:ComponentType<CombatProps>;onExit:()=>void}){
 const [infiniteInk,setInfiniteInk]=useState(true),[mobile,setMobile]=useState(false),[upgraded,setUpgraded]=useState(false),[session,setSession]=useState(0);
 return <Combat key={session} journey={practiceJourney(upgraded)} onFinish={()=>{}} practice={{mobile,upgraded,infiniteInk,onInfiniteInk:setInfiniteInk,onMobile:setMobile,onUpgrade:setUpgraded,onReset:()=>setSession(n=>n+1),onExit}}/>;
}
