function parts(version:string){
 const match=/^(\d+)\.(\d+)\.(\d+)(-alpha)?$/.exec(version);
 if(!match)throw new Error('Expected three numeric version segments with an optional -alpha suffix.');
 const [,major,middle,release,suffix='']=match;
 return {major:Number(major),middle:Number(middle),release:Number(release),suffix};
}
export function formatGameVersion(version:string){
 const {major,middle,release,suffix}=parts(version);
 return `${major}.${middle}.${String(release).padStart(2,'0')}${suffix}`;
}
export function nextGameVersion(version:string,kind:'small'|'feature'){
 const {major,middle,release,suffix}=parts(version);
 const next=kind==='small'?release+1:(Math.floor(release/10)+1)*10;
 if(next>99)throw new Error('Release number is full; ask the user for the next middle number.');
 return `${major}.${middle}.${next}${suffix}`;
}
