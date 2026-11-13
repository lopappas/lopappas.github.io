import React,{memo,useLayoutEffect,useSyncExternalStore,type ComponentProps} from 'react';
import {World} from './World';
import type {BattlePresentation} from './battlePresentation';
import {performanceMetrics} from './performanceMetrics';
type Props=Omit<ComponentProps<typeof World>,'battle'>&{presentation:BattlePresentation;paused:boolean};
export const AnimatedWorld=memo(function AnimatedWorld({presentation,paused,...props}:Props){
 const battle=useSyncExternalStore(presentation.subscribe,presentation.getSnapshot);
 useLayoutEffect(()=>{if(!paused&&battle.phase==='active'&&!document.hidden)performanceMetrics.recordWorldCommit();});
 return <World {...props} battle={battle}/>;
});
