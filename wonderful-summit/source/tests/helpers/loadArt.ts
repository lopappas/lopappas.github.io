import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import ts from 'typescript';
const require=createRequire(import.meta.url);
/** Load isolated SVG views in Node without introducing a browser or runtime JSX loader. */
export function loadArtSource(source:string,filename:string){
 const output=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const module={exports:{} as Record<string,any>};
 const localRequire=(id:string)=>{if(!id.startsWith('.'))return require(id);const path=resolve(dirname(filename),id);return require(existsSync(path)?path:path+'.ts');};
 new Function('require','module','exports',output)(localRequire,module,module.exports);return module.exports;
}
export function loadArt(filename:string){return loadArtSource(readFileSync(filename,'utf8'),filename);}
