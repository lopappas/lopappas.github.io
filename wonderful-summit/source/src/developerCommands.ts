import {POTION_IDS,type Potion} from './battle.ts';
import {SPELLS,isUpgradableSpell,type SpellId} from './magic.ts';
import {acquireRelic,potionCapacity,potionCount,RELICS,ROUTE,selectTrailNode,type RelicId,type Run} from './run.ts';
export type DeveloperCommand={type:'travel';node:number}|{type:'gold'}|{type:'maxHealth'}|{type:'upgradeSpells'}|{type:'spell';id:SpellId}|{type:'relic';id:RelicId}|{type:'potion';id:Potion};
export function parseDeveloperCommand(value:unknown):DeveloperCommand|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(v.type==='potion'&&POTION_IDS.includes(v.id as Potion))return{type:'potion',id:v.id as Potion};
 if(v.type==='travel'&&Number.isInteger(v.node)&&Number(v.node)>=0&&Number(v.node)<ROUTE.length)return{type:'travel',node:Number(v.node)};
 if(v.type==='gold'||v.type==='maxHealth'||v.type==='upgradeSpells')return{type:v.type};
 if(v.type==='spell'&&SPELLS.some(s=>s.id===v.id))return{type:'spell',id:v.id as SpellId};
 if(v.type==='relic'&&typeof v.id==='string'&&Object.hasOwn(RELICS,v.id))return{type:'relic',id:v.id as RelicId};
 return null;
}
export function applyDeveloperCommand(run:Run,command:DeveloperCommand):Run{
 if(command.type==='travel')return selectTrailNode(run,command.node);
 if(command.type==='potion'){if(run.pendingBottle||potionCount(run)>=potionCapacity(run))return run;return{...run,pendingBottle:command.id==='spellBottle',potions:{...run.potions,[command.id]:(run.potions[command.id]??0)+1}};}
 if(command.type==='maxHealth')return{...run,maxHealth:999,health:999};
 if(command.type==='upgradeSpells')return{...run,upgrades:{...run.upgrades,...Object.fromEntries(run.spells.filter(isUpgradableSpell).map(id=>[id,1]))}};
 if(command.type==='gold')return{...run,gold:run.gold+1000};
 if(command.type==='spell')return run.spells.includes(command.id)?run:{...run,spells:[...run.spells,command.id]};
 const next=acquireRelic(run,command.id);return next===run?run:{...next,...(command.id==='impossibleShale'?{shaleContacts:0}:{})};
}

