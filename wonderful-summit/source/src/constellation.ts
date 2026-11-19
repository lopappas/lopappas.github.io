import {MIN_CAST_QUALITY} from './quality.ts';

export const CONSTELLATION_FLIGHT_SECONDS=1.25;
export const CONSTELLATION_HAT_SECONDS=3;
export const CONSTELLATION_HAT_REPEAT_SECONDS=16;
const HAT_ASSEMBLY_SECONDS=.85,HAT_RETURN_FADE_SECONDS=.6;

export function constellationHatFrame(burstAge:number){
 const phase=burstAge%CONSTELLATION_HAT_REPEAT_SECONDS;
 if(burstAge<CONSTELLATION_HAT_REPEAT_SECONDS){
  return{
   assembly:Math.min(1,burstAge/HAT_ASSEMBLY_SECONDS),
   opacity:Math.max(0,Math.min(1,1-(burstAge-HAT_ASSEMBLY_SECONDS)/CONSTELLATION_HAT_SECONDS)),
  };
 }
 return{
  assembly:1,
  opacity:phase<HAT_RETURN_FADE_SECONDS?phase/HAT_RETURN_FADE_SECONDS:
   Math.max(0,1-(phase-HAT_RETURN_FADE_SECONDS)/CONSTELLATION_HAT_SECONDS),
 };
}

export function constellationNoticeOpacity(age:number){
 return Math.max(0,Math.min(1,1-(age-8)/2));
}

export type ConstellationBonus={armor:number;damage:number;knockback:number};
export type Constellation=ConstellationBonus&{castAt:number;maxArmor:number};

export function constellationBonus(quality:number,upgrade=0):ConstellationBonus{
 if(!Number.isFinite(quality)||quality<MIN_CAST_QUALITY)return{armor:0,damage:0,knockback:0};
 let armor=5,damage=8,knockback=5;
 if(quality>=80){
  const progress=Math.min(1,(quality-80)/20);
  armor=30+10*progress;
  damage=30+10*progress;
  knockback=20+5*progress;
 }else if(quality>=60){
  const progress=(quality-60)/20;
  armor=12+18*progress;
  damage=14+16*progress;
  knockback=10+10*progress;
 }else if(quality>=50){
  armor=8;
  damage=11;
  knockback=8;
 }
 const upgraded=upgrade>=1;
 return{
  armor:Math.round(armor)+(upgraded?5:0),
  damage:Math.round(damage)+(upgraded?5:0),
  knockback:Math.round(knockback)+(upgraded?3:0),
 };
}
