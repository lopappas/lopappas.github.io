function parts(version:string){
 if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Expected three numeric version segments.');
 return version.split('.').map(Number);
}
export function formatGameVersion(version:string){
 const [major,middle,release]=parts(version);
 return `${major}.${middle}.${String(release).padStart(2,'0')}`;
}
export function nextGameVersion(version:string,kind:'small'|'feature'){
 const [major,middle,release]=parts(version);
 const next=kind==='small'?release+1:(Math.floor(release/10)+1)*10;
 if(next>99)throw new Error('Release number is full; ask the user for the next middle number.');
 return `${major}.${middle}.${next}`;
}
