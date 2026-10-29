export type AudioPreferences={master:number;music:number;effects:number};
export type AudioChannel='music'|'effects';
export const DEFAULT_AUDIO_PREFERENCES:AudioPreferences={master:1,music:1,effects:1};
export const AUDIO_PREFERENCES_KEY='wonderful-summit.audio.v1';
type StorageAccess=Pick<Storage,'getItem'|'setItem'>;
const clamp=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(1,value)):fallback;
export function createAudioPreferences(){
 let value={...DEFAULT_AUDIO_PREFERENCES},storage:StorageAccess|undefined,loaded=false;
 const listeners=new Set<()=>void>();
 const notify=()=>listeners.forEach(listener=>listener());
 return{
  getSnapshot:()=>value,
  subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},
  load:(source?:StorageAccess)=>{
   if(loaded)return;loaded=true;storage=source;
   try{const parsed=JSON.parse(source?.getItem(AUDIO_PREFERENCES_KEY)??'null');if(parsed&&typeof parsed==='object'){value={master:clamp(parsed.master,1),music:clamp(parsed.music,1),effects:clamp(parsed.effects,1)};notify();}}catch{}
  },
  set:(key:keyof AudioPreferences,amount:number)=>{
   const next=clamp(amount,value[key]);if(next===value[key])return;
   value={...value,[key]:next};try{storage?.setItem(AUDIO_PREFERENCES_KEY,JSON.stringify(value));}catch{}notify();
  }
 };
}
export const audioPreferences=createAudioPreferences();
export function loadAudioPreferences(){let storage:StorageAccess|undefined;try{storage=window.localStorage;}catch{}audioPreferences.load(storage);}
export function audioChannelVolume(channel:AudioChannel,preferences=audioPreferences.getSnapshot()){return preferences.master*preferences[channel];}
