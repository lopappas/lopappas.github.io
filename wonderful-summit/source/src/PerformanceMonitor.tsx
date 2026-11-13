import React,{useEffect,useState,useSyncExternalStore} from 'react';
import {performanceMetrics,performanceEnabled,setPerformanceEnabled,subscribePerformance} from './performanceMetrics';
import packageInfo from '../package.json';
export function PerformanceControls(){
 const enabled=useSyncExternalStore(subscribePerformance,performanceEnabled);
 return <button className="primary-small" onClick={()=>setPerformanceEnabled(!enabled)}>{enabled?'Stop performance monitor':'Start performance monitor'}</button>;
}
export function PerformanceMonitor(){
 const enabled=useSyncExternalStore(subscribePerformance,performanceEnabled),[snapshot,setSnapshot]=useState(()=>performanceMetrics.snapshot()),[message,setMessage]=useState('');
 useEffect(()=>{if(!enabled)return;setSnapshot(performanceMetrics.snapshot());const timer=setInterval(()=>setSnapshot(performanceMetrics.snapshot()),1000);return()=>clearInterval(timer);},[enabled]);
 if(!enabled)return null;
 async function copy(){try{await navigator.clipboard.writeText(JSON.stringify({version:packageInfo.version,userAgent:navigator.userAgent,pixelRatio:devicePixelRatio,viewport:{width:innerWidth,height:innerHeight},metrics:performanceMetrics.snapshot()},null,2));setMessage('Copied');}catch{setMessage('Copy unavailable');}}
 return <aside className="performance-monitor" aria-label="Performance monitor"><strong>Combat performance</strong><div>{snapshot.updatesPerSecond.toFixed(1)} updates/s · p95 {snapshot.p95IntervalMs.toFixed(1)} ms</div><div>Simulation {snapshot.meanStepMs.toFixed(3)} ms/update</div><div>{snapshot.commitsPerActiveSecond.toFixed(1)} combat commits/s · {snapshot.activeSeconds.toFixed(0)} active seconds</div><small>Last 600 active updates. Timing excludes rendering/GPU.</small><div><button onClick={()=>{performanceMetrics.reset();setSnapshot(performanceMetrics.snapshot());setMessage('');}}>Reset</button> <button onClick={()=>void copy()}>Copy report</button> <button onClick={()=>setPerformanceEnabled(false)}>Stop</button> <span>{message}</span></div></aside>;
}
