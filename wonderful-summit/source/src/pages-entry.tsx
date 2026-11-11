import {PotionFullNotice} from './PotionFullNotice';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {RunGame} from './RunScreens';
import {Combat} from './main';
import {DeveloperProvider} from './Developer';
// Loading every declared face also covers fonts used only in later screens.
// Do not mount the title card until they are ready, even with a cold cache.
async function start(){
 try{
  await Promise.all(Array.from(document.fonts,face=>face.load()));
  await document.fonts.ready;
  createRoot(document.getElementById('root')!).render(<DeveloperProvider><PotionFullNotice/><RunGame Combat={Combat}/></DeveloperProvider>);
 }catch{
  document.getElementById('root')!.textContent='Fonts could not load. Please refresh to try again.';
 }
}
void start();
