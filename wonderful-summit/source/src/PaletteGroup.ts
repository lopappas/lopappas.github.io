import React,{createContext,useContext,type ReactNode,type ReactElement,type SVGProps} from 'react';
const PaletteContext=createContext(0);
/** Convert SVG paint values directly: no CSS/SVG filter support is required. */
export function grayPaint(value:unknown,amount:number):unknown{
 if(typeof value!=='string'||!/^#[\da-f]{3,8}$/i.test(value)||![4,5,7,9].includes(value.length)||amount<=0)return value;
 const hex=value.slice(1),expanded=hex.length<=4?hex.split('').map(c=>c+c).join(''):hex;
 const rgb=[0,2,4].map(i=>parseInt(expanded.slice(i,i+2),16)),gray=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722,t=Math.max(0,Math.min(1,amount));
 return '#'+rgb.map(c=>Math.round(c+(gray-c)*t).toString(16).padStart(2,'0')).join('')+expanded.slice(6);
}
function paintProps(props:Record<string,unknown>,amount:number){const result={...props};for(const key of ['fill','stroke','stopColor','color'])if(key in result)result[key]=grayPaint(result[key],amount);return result;}
function paintNodes(children:ReactNode,amount:number):ReactNode{if(amount<=0)return children;return React.Children.map(children,node=>{
 if(!React.isValidElement(node)||typeof node.type!=='string'&&node.type!==React.Fragment)return node;
 const e=node as ReactElement<Record<string,unknown>>,props=paintProps(e.props,amount);
 if('children' in props)props.children=paintNodes(props.children as ReactNode,amount);
 return React.cloneElement(e,props);
});}
export function PaletteGroup({amount,children,...props}:SVGProps<SVGGElement>&{amount?:number}){
 const inherited=useContext(PaletteContext),level=amount??inherited;
 return React.createElement(PaletteContext.Provider,{value:level},React.createElement('g',paintProps(props as Record<string,unknown>,level),paintNodes(children,level)));
}
