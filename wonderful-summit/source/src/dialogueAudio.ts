import {FILA_CHARACTER_MS,filaCharacterTimes} from './filaDialogue.ts';
export const WRITING_SOUND_VOLUME=.3;
// The sample runs only during lettering, leaving punctuation and reading pauses quiet.
export function filaIsWriting(text:string,elapsed:number){
 const characters=Array.from(text);
 return filaCharacterTimes(text).some((time,i)=>time>elapsed&&time-elapsed<=FILA_CHARACTER_MS&&!/\s/.test(characters[i]));
}
type WritingMedia={loop:boolean;muted:boolean;volume:number;currentTime:number;play:()=>Promise<void>;pause:()=>void};
export function createWritingAudio(media:WritingMedia,volume:()=>number){
 let wanted=false,playing=false,disposed=false;
 media.loop=true;
 function stop(){playing=false;media.muted=true;media.pause();media.currentTime=0;}
 function sync(){
  if(disposed)return;
  media.volume=Math.max(0,Math.min(1,volume()*WRITING_SOUND_VOLUME));
  if(!wanted||media.volume===0){if(playing)stop();return;}
  if(playing)return;playing=true;media.muted=false;
  try{void media.play().then(()=>{if(disposed||!wanted)stop();}).catch(()=>{playing=false;});}catch{playing=false;}
 }
 return{setWriting(value:boolean){wanted=value;sync();},sync,dispose(){disposed=true;wanted=false;stop();}};
}

let writingMedia:HTMLAudioElement|undefined,primed=false;
export function getWritingMedia(){
 if(!writingMedia){writingMedia=new Audio(new URL('./audio/frostnox_quick-pencil-writing.ogg',import.meta.url).href);writingMedia.preload='auto';}
 return writingMedia;
}
// Prime the shared element during a real game gesture for mobile autoplay rules.
export function primeWritingMedia(){
 if(primed||typeof Audio==='undefined')return;
 const media=getWritingMedia();primed=true;
 if(!media.paused)return;
 media.muted=true;media.volume=0;
 void media.play().then(()=>{if(media.muted){media.pause();media.currentTime=0;}}).catch(()=>{primed=false;});
}
