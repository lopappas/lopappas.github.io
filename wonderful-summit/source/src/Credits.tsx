import React from 'react';
import {SummitWindow} from './SummitWindow';
export function Credits({onExit}:{onExit:()=>void}){
 return <SummitWindow title="Credits" titleId="credits-title" onExit={onExit}><h2>Creator</h2><p>Lorenzo Pappas</p><h2>Audio · SFX</h2><p>Scrawl Sound: Frostnox</p><p className="credits-attribution">Quick Pencil Writing 1 by Frostnox<br/><a href="https://freesound.org/s/796659/" target="_blank" rel="noreferrer">https://freesound.org/s/796659/</a><br/>License: Attribution 4.0</p><h2>Special Thanks &lt;3</h2><p>Slay the Spire<br/>Witch Hat Atelier</p><p className="credits-codex">Made with Codex</p></SummitWindow>;
}
