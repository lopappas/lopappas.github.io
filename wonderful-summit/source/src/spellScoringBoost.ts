export const SPELL_SCORING_BOOST_KEY='wonderful-summit.spell-scoring-boost.v1';
export const DEFAULT_SPELL_SCORING_BOOST=true;
type StorageAccess=Pick<Storage,'getItem'|'setItem'>;

export function createSpellScoringBoost(storage?:StorageAccess){
 let enabled=DEFAULT_SPELL_SCORING_BOOST;
 try{
  const saved=storage?.getItem(SPELL_SCORING_BOOST_KEY);
  if(saved==='true'||saved==='false')enabled=saved==='true';
 }catch{}
 const listeners=new Set<()=>void>();
 return {
  getSnapshot:()=>enabled,
  subscribe:(listener:()=>void)=>{
   listeners.add(listener);
   return ()=>{listeners.delete(listener);};
  },
  setEnabled:(next:boolean)=>{
   if(next===enabled)return;
   enabled=next;
   try{storage?.setItem(SPELL_SCORING_BOOST_KEY,String(next));}catch{}
   listeners.forEach(listener=>listener());
  },
 };
}

function getLocalStorage(){
 try{return globalThis.localStorage;}catch{return undefined;}
}

export const spellScoringBoost=createSpellScoringBoost(getLocalStorage());
