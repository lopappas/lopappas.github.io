import React,{memo,useLayoutEffect} from 'react';
import {performanceMetrics} from './performanceMetrics.ts';
type SlimeProps={color:string;attacking:boolean;practice:boolean;rocky:boolean};
export const FilaBody=memo(function FilaBody({}) {
    useLayoutEffect(()=>performanceMetrics.recordArtCommit());
    return React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M9 0h4v2h2v3h2v4h3v3H2V9h3V5h2V2h2zM5 12h12v8h-2v2h3v3h2v5h-3v2h-5v-2H9v2H4v-4H2v-5h2v-3H3v-6h2z", fill: "#352e46" }),
        React.createElement("path", { d: "M9 2h4v3h2v4H6V5h3zM4 9h14v2H4z", fill: "#9c83bc" }),
        React.createElement("path", { d: "M6 7h10v2H6z", fill: "#e5bb7e" }),
        React.createElement("path", { d: "M5 12h12v3H5zM4 15h3v6H4zM15 14h2v7h-2z", fill: "#6c4951" }),
        React.createElement("path", { d: "M7 14h8v6H7zM9 20h4v2H9z", fill: "#f2cea6" }),
        React.createElement("path", { d: "M9 16h1v2H9zM13 16h1v2h-1z", fill: "#352e46" }),
        React.createElement("path", { d: "M6 22h9v3h2v3H4v-3h2z", fill: "#9c83bc" }),
        React.createElement("path", { d: "M6 24h9v1H6z", fill: "#e5bb7e" }),
        React.createElement("path", { d: "M5 29h4v2H5zM12 29h4v2h-4z", fill: "#352e46" }),
        React.createElement("path", { d: "M20 9h5v7h-1v12h-3V16h-1z", fill: "#352e46" }),
        React.createElement("path", { d: "M21 10h3v4h-3z", fill: "#efd7ad" }),
        React.createElement("path", { d: "M21 10h3v2h-3z", fill: "#c0a1df" }),
        React.createElement("path", { d: "M21 14h3v2h-3z", fill: "#e5bb7e" }),
        React.createElement("path", { d: "M22 16h1v11h-1z", fill: "#b58255" }),
        React.createElement("path", { d: "M15 22h4v2h-4z", fill: "#9c83bc" }),
        React.createElement("path", { d: "M19 22h4v2h-4z", fill: "#f2cea6" }));
});
export const SlimeBody=memo(function SlimeBody({ color, attacking, practice, rocky }:SlimeProps) { useLayoutEffect(()=>performanceMetrics.recordArtCommit()); return React.createElement(React.Fragment, null,
    React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M-36 12v-24h6v-16h10v-8h36v6h12v12h8v30h-6v8h-60v-8z", fill: practice ? '#8c6224' : '#2d493d' }),
        React.createElement("path", { d: "M-30 12v-22h6v-14h12v-6h24v6h12v12h6v24h-6v4h-48v-4z", fill: attacking ? '#ebd588' : color }),
        React.createElement("path", { d: "M-21-13v-7h9v-4h17v5h-16v6z", fill: practice ? '#fff0a5' : '#e3dfb0' }),
        React.createElement("path", { d: "M-13-9h5v8h-5zM10-9h5v8h-5zM-3 6h9v3h-9z", fill: "#2d493d" }),
        rocky && React.createElement("g", { shapeRendering: "crispEdges" },
            React.createElement("path", { d: "M-25-22h11v8h-11zM9-26h12v9H9zM-31 1h8v12h-8zM21 4h8v9h-8z", fill: "#717d78" }),
            React.createElement("path", { d: "M-10-28h6v5h5v7M19-13v7h6", fill: "none", stroke: "#53615b", strokeWidth: "2" })))); });
export const GoblinBody=memo(function GoblinBody({}) { useLayoutEffect(()=>performanceMetrics.recordArtCommit()); return React.createElement(React.Fragment, null,
    React.createElement("path", { d: "M-29-50h58v33H-29zM-40-43h11v12h-11zM29-43h11v12H29z", fill: "#91ac65" }),
    React.createElement("path", { d: "M-21-49h43v9h-43zM-14-39h7v7h-7zM10-39h7v7h-7z", fill: "#354132" }),
    React.createElement("path", { d: "M-12-22h25v5h-25z", fill: "#e7d7ae" }),
    React.createElement("path", { d: "M-23-15h46v34h-46zM-28 17h18v8h-18zM11 17h18v8H11z", fill: "#74584b" }),
    React.createElement("path", { d: "M-18-10h36v7h-36z", fill: "#bc9764" }),
    React.createElement("path", { d: "M-45-15h14v47h-14zM-50-25h24v12h-24z", fill: "#6b6760" })); });
export const CrownBody=memo(function CrownBody({}) { useLayoutEffect(()=>performanceMetrics.recordArtCommit()); return React.createElement(React.Fragment, null,
    React.createElement("path", { d: "M-25-50-29-75-14-65 0-81 14-65 29-75 25-50Z", fill: "#f4cc4f", stroke: "#9e7025", strokeWidth: "2" }),
    React.createElement("path", { d: "M-24-58H24", stroke: "#ffe89a", strokeWidth: "3" }),
    React.createElement("path", { d: "m0-71 4 5-4 5-4-5z", fill: "#d75545" })); });
export const GoblinHelmet=memo(function GoblinHelmet({}) { useLayoutEffect(()=>performanceMetrics.recordArtCommit()); return React.createElement(React.Fragment, null,
    React.createElement("path", { d: "M-18-58h9v8h-9zM-4-63h9v13h-9zM10-58h9v8h-9z", fill: "#dbba70" })); });
export const SpiderBody=memo(function SpiderBody({ color }:{color:string}) {
    useLayoutEffect(()=>performanceMetrics.recordArtCommit());
    return React.createElement(React.Fragment, null,
        "  ",
        React.createElement("path", { d: "M-4-15H14V-10H21V9H15V15H-4V10H-10V-9H-4Z", fill: "#293f38" }),
        React.createElement("path", { d: "M0-11H12V-6H17V6H12V11H0V6H-5V-5H0Z", fill: color }),
        React.createElement("path", { d: "M2-9H10V-5H2Z", fill: "#e5e5be", opacity: ".7" }),
        React.createElement("path", { d: "M-23-10H-9V-6H-5V7H-9V11H-23V7H-27V-6H-23Z", fill: "#293f38" }),
        React.createElement("path", { d: "M-22-6H-11V6H-22Z", fill: color }),
        React.createElement("path", { d: "M-24-5H-20V-1H-24ZM-24 3H-20V7H-24Z", fill: "#fff3c6" }),
        React.createElement("path", { d: "M-29-1H-25V2H-29ZM-30 6H-25V9H-30Z", fill: "#c6b996" }));
});
