import {SPELLS,type SpellId} from './magic.ts';
import {RELICS,type RelicId,type Run} from './run.ts';
export type DeveloperCommand={type:'gold'}|{type:'spell';id:SpellId}|{type:'relic';id:RelicId};
export function parseDeveloperCommand(value:unknown):DeveloperCommand|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(v.type==='gold')return{type:'gold'};
 if(v.type==='spell'&&SPELLS.some(s=>s.id===v.id))return{type:'spell',id:v.id as SpellId};
 if(v.type==='relic'&&typeof v.id==='string'&&Object.hasOwn(RELICS,v.id))return{type:'relic',id:v.id as RelicId};
 return null;
}
export function applyDeveloperCommand(run:Run,command:DeveloperCommand):Run{
 if(command.type==='gold')return{...run,gold:run.gold+1000};
 if(command.type==='spell')return run.spells.includes(command.id)?run:{...run,spells:[...run.spells,command.id]};
 return run.relics.includes(command.id)?run:{...run,relics:[...run.relics,command.id]};
}
