import {MIN_CAST_QUALITY} from './quality.ts';

export const CONSTELLATION_FLIGHT_SECONDS=1.25;
const HAT_ASSEMBLY_SECONDS=.85,HAT_SETTLED_SECONDS=4,HAT_REST_OPACITY=.2;

export function constellationHatFrame(burstAge:number){
 const fade=Math.max(0,Math.min(1,(burstAge-HAT_ASSEMBLY_SECONDS)/(HAT_SETTLED_SECONDS-HAT_ASSEMBLY_SECONDS)));
 return{
  assembly:Math.min(1,burstAge/HAT_ASSEMBLY_SECONDS),
  opacity:HAT_REST_OPACITY+(1-HAT_REST_OPACITY)*(1-fade),
 };
}

export function constellationNoticeOpacity(age:number){
 return Math.max(0,Math.min(1,1-(age-8)/2));
}

export type ConstellationBonus={armor:number;damage:number;knockback:number};
export type Constellation=ConstellationBonus&{castAt:number;maxArmor:number};

const STEADY_BONUSES=[
 {armor:6,damage:11,knockback:9},
 {armor:8,damage:15,knockback:11},
 {armor:11,damage:22,knockback:15},
 {armor:15,damage:28,knockback:20},
 {armor:20,damage:34,knockback:24},
];
const FAINT_BONUSES=[{armor:3,damage:5,knockback:5},{armor:5,damage:8,knockback:7}];

export function constellationBonus(quality:number,upgrade=0):ConstellationBonus{
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return{armor:0,damage:0,knockback:0};
 const position=(Math.min(100,quality)-60)/10;
 const index=Math.floor(position);
 const lower=quality<60?FAINT_BONUSES[quality<50?0:1]:STEADY_BONUSES[index];
 const upper=quality<60?lower:STEADY_BONUSES[index+1]??lower;
 const progress=position-index;
 const interpolate=(stat:keyof ConstellationBonus)=>Math.round(lower[stat]+(upper[stat]-lower[stat])*progress);
 const upgraded=upgrade>=1;
 return{
  armor:interpolate('armor')+(upgraded?3:0),
  damage:interpolate('damage')+(upgraded?5:0),
  knockback:interpolate('knockback')+(upgraded?3:0),
 };
}
