import React from 'react';

/** Shared Belladora artwork used in combat and at the merchant. */
export function PetPurse({sad=false}:{sad?:boolean}){return <g><ellipse cx="8" cy="27" rx="21" ry="5" fill="#2a4735" opacity=".4"/><path d="M-8 5Q-12-17 7-17T22 5" fill="none" stroke="#c9ad6e" strokeWidth="4"/><rect x="-15" y="0" width="44" height="29" rx="10" fill="#a97c5a"/><path d="M-15 5h44" stroke="#dec184" strokeWidth="4"/><circle cx="0" cy="13" r="2.5" fill="#29362d"/><circle cx="16" cy="13" r="2.5" fill="#29362d"/><path d={sad?'M5 23q3-5 7 0':'M5 20q3 4 7 0'} fill="none" stroke="#513f36" strokeWidth="2"/><path d="m-6 29-4 6m29-6 4 6" stroke="#755c42" strokeWidth="4"/></g>}
