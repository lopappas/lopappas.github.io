import React,{useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
export function notifyPotionsFull(){window.dispatchEvent(new Event('potions-full'));}
export function PotionFullNotice(){
 const [serial,setSerial]=useState(0),[visible,setVisible]=useState(false);
 useEffect(()=>{const show=()=>{setSerial(n=>n+1);setVisible(true);};window.addEventListener('potions-full',show);return()=>window.removeEventListener('potions-full',show);},[]);
 useEffect(()=>{if(!serial)return;const timer=setTimeout(()=>setVisible(false),2200);return()=>clearTimeout(timer);},[serial]);
 return visible?createPortal(<div className="potions-full-notice" role="status">Potions are full!</div>,document.body):null;
}
