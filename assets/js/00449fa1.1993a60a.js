"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[4111],{5318:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(7378);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),u=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),s=u(n),m=a,y=s["".concat(p,".").concat(m)]||s[m]||d[m]||o;return n?r.createElement(y,i(i({ref:t},c),{},{components:n})):r.createElement(y,i({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=s;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var u=2;u<o;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},2308:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>u});var r=n(5773),a=(n(7378),n(5318));const o={description:"Deploy your game to UrTurn.app"},i="Deploying your game",l={unversionedId:"Getting-Started/deploying-your-game",id:"Getting-Started/deploying-your-game",title:"Deploying your game",description:"Deploy your game to UrTurn.app",source:"@site/docs/1-Getting-Started/3-deploying-your-game.md",sourceDirName:"1-Getting-Started",slug:"/Getting-Started/deploying-your-game",permalink:"/docs/Getting-Started/deploying-your-game",draft:!1,editUrl:"https://github.com/turnbasedgames/urturn/tree/main/docs/docs/1-Getting-Started/3-deploying-your-game.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{description:"Deploy your game to UrTurn.app"},sidebar:"docs",previous:{title:"Semantle Battle",permalink:"/docs/Getting-Started/semantle-battle"},next:{title:"API",permalink:"/docs/category/api"}},p={},u=[{value:"Manual Deployment",id:"manual-deployment",level:2},{value:"Continuous Deployment",id:"continuous-deployment",level:2},{value:"Build Artifact Spec",id:"build-artifact-spec",level:2}],c={toc:u};function d(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"deploying-your-game"},"Deploying your game"),(0,a.kt)("h2",{id:"manual-deployment"},"Manual Deployment"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Go to UrTurn Dev ",(0,a.kt)("a",{parentName:"li",href:"https://www.urturn.app/develop"},"Console"),"."),(0,a.kt)("li",{parentName:"ol"},"Click ",(0,a.kt)("inlineCode",{parentName:"li"},"create game")," or ",(0,a.kt)("inlineCode",{parentName:"li"},"edit")," an existing game"),(0,a.kt)("li",{parentName:"ol"},"Fill in the required fields"),(0,a.kt)("li",{parentName:"ol"},"Provide the commit SHA that you want to deploy. Usually you can get the commit SHA with this command, which gets the latest commit for your ",(0,a.kt)("inlineCode",{parentName:"li"},"published")," branch.")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},'# In the directory of your game repository\n$ git log -n 1 --pretty=format:"%H" origin/published\n9cf2a6c11accb1d49d1b488985eb1df37c753d4a\n')),(0,a.kt)("ol",{start:5},(0,a.kt)("li",{parentName:"ol"},"Click ",(0,a.kt)("inlineCode",{parentName:"li"},"Create")," or ",(0,a.kt)("inlineCode",{parentName:"li"},"Update"),", and try playing your game! Updates should be instant.")),(0,a.kt)("h2",{id:"continuous-deployment"},"Continuous Deployment"),(0,a.kt)("admonition",{type:"caution"},(0,a.kt)("p",{parentName:"admonition"},"Not supported yet. Join the early release wait list on ",(0,a.kt)("a",{parentName:"p",href:"https://discord.gg/myWacjdb5S"},"discord"),", so we can notify you when we add support.")),(0,a.kt)("h2",{id:"build-artifact-spec"},"Build Artifact Spec"),(0,a.kt)("p",null,"The ",(0,a.kt)("inlineCode",{parentName:"p"},"commit")," that is deployed in production needs to have the format:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"game\n\u2502   index.js # rollup should transpile all of you javascript files and dependencies into this file\n|   thumbnail.png # not required, but if not provided UrTurn will display a stock image for your game\n|\n\u2514\u2500\u2500\u2500frontend/build\n\u2502   \u2502  # all the built html, css, javascript files go here\n")),(0,a.kt)("p",null,"Here is an example for ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/turnbasedgames/urturn/tree/published-tictactoe"},"TicTacToe"),"."),(0,a.kt)("admonition",{type:"success"},(0,a.kt)("p",{parentName:"admonition"},"This is easily achieved using ",(0,a.kt)("a",{parentName:"p",href:"https://docs.github.com/en/actions"},"GitHub Actions"),". Steps in ",(0,a.kt)("a",{parentName:"p",href:"/docs/Getting-Started/runner-init"},"getting started")," should automatically generate the correct actions for you.")))}d.isMDXComponent=!0}}]);