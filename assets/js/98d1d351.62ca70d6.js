"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[5988],{5318:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(7378);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),u=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=u(e.components);return r.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=u(n),m=a,f=d["".concat(l,".").concat(m)]||d[m]||p[m]||o;return n?r.createElement(f,i(i({ref:t},c),{},{components:n})):r.createElement(f,i({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var u=2;u<o;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9929:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>o,metadata:()=>s,toc:()=>u});var r=n(5773),a=(n(7378),n(5318));const o={description:"UrTurn is a game platform that hosts and handles all infrastructure for your game",slug:"/"},i="Introduction",s={unversionedId:"Introduction/Introduction",id:"Introduction/Introduction",title:"Introduction",description:"UrTurn is a game platform that hosts and handles all infrastructure for your game",source:"@site/docs/0-Introduction/0-Introduction.md",sourceDirName:"0-Introduction",slug:"/",permalink:"/docs/",draft:!1,editUrl:"https://github.com/turnbasedgames/urturn/tree/main/docs/docs/0-Introduction/0-Introduction.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{description:"UrTurn is a game platform that hosts and handles all infrastructure for your game",slug:"/"},sidebar:"docs",next:{title:"Flow of a Simple Game",permalink:"/docs/Introduction/Flow-Of-Simple-Game"}},l={},u=[{value:"What UrTurn Is",id:"what-urturn-is",level:2},{value:"Perfect for",id:"perfect-for",level:3},{value:"Opinionated Where It Matters",id:"opinionated-where-it-matters",level:3},{value:"What UrTurn is NOT",id:"what-urturn-is-not",level:2}],c={toc:u};function p(e){let{components:t,...o}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,o,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"introduction"},"Introduction"),(0,a.kt)("h2",{id:"what-urturn-is"},"What UrTurn Is"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://www.urturn.app/"},"UrTurn")," is a game platform that hosts and handles ",(0,a.kt)("strong",{parentName:"p"},"all infrastructure for your game"),": networking, multiplayer, matchmaking, and data storage."),(0,a.kt)("p",null,"The framework lets you modify game state of a room in a ",(0,a.kt)("strong",{parentName:"p"},"transactional")," and ",(0,a.kt)("strong",{parentName:"p"},"event-based")," manner. Just define how to modify game states on each event, and that's it (no infrastructure headaches, no worrying about scale again)."),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"simple diagram of UrTurn and your code",src:n(9270).Z,width:"882",height:"208"})),(0,a.kt)("h3",{id:"perfect-for"},"Perfect for"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Turn based games (e.g. any board game)"),(0,a.kt)("li",{parentName:"ol"},"Word games with several updates per second"),(0,a.kt)("li",{parentName:"ol"},"Games that can be represented as state machines"),(0,a.kt)("li",{parentName:"ol"},"Monetizing Single Player Games (coming soon)")),(0,a.kt)("h3",{id:"opinionated-where-it-matters"},"Opinionated Where It Matters"),(0,a.kt)("p",null,"We are obsessed with a great developer experience. This means we abstract away complicated infrastructure in scalable and best practice way that just makes sense."),(0,a.kt)("h2",{id:"what-urturn-is-not"},"What UrTurn is NOT"),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"UrTurn is ",(0,a.kt)("strong",{parentName:"p"},"NOT")," opinionated on the frontend of your game or your dev environment.")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Continue to use your favorite frontend web technologies (e.g. vanilla HTML5, ReactJS, PhaserIO, BabylonJS, etc.), and hook into UrTurn using the ",(0,a.kt)("inlineCode",{parentName:"li"},"@urturn/client"),"."),(0,a.kt)("li",{parentName:"ul"},"Continue to use your favorite IDE for coding with JavaScript, and continue using your favorite dev tools and open source libraries.")),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"UrTurn's framework is ",(0,a.kt)("strong",{parentName:"p"},"NOT")," closed source.")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"We want developers to have as much control over the look and feel of their game, and post them anywhere, host them anywhere."),(0,a.kt)("li",{parentName:"ul"},"If you wanted to self host UrTurn, you can because all code is available on GitHub. See self-hosting ",(0,a.kt)("a",{parentName:"li",href:"/docs/Advanced/self-hosting"},"guide"),".")),(0,a.kt)("admonition",{type:"caution"},(0,a.kt)("p",{parentName:"admonition"},"UrTurn is ",(0,a.kt)("strong",{parentName:"p"},"NOT")," a real time gaming framework")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Despite this limitation, there is a set of rich potential use cases for it that can make exciting and fun games. See the ",(0,a.kt)("a",{parentName:"li",href:"https://www.urturn.app"},"front page"),"."),(0,a.kt)("li",{parentName:"ul"},"Join the early release wait list on ",(0,a.kt)("a",{parentName:"li",href:"https://discord.gg/myWacjdb5S"},"discord"),", so we can notify you when we add support.")),(0,a.kt)("admonition",{type:"caution"},(0,a.kt)("p",{parentName:"admonition"},"UrTurn is ",(0,a.kt)("strong",{parentName:"p"},"NOT")," fully stable ",(0,a.kt)("em",{parentName:"p"},"yet"),". It is in ",(0,a.kt)("inlineCode",{parentName:"p"},"Alpha"),".")),(0,a.kt)("p",null,"This means that there may be some breaking changes. We will try to avoid them as much as possible, and will always notify developers in our ",(0,a.kt)("a",{parentName:"p",href:"https://discord.gg/myWacjdb5S"},"discord"),"."))}p.isMDXComponent=!0},9270:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/simple_diagram-a16a07fb4edcc31dbc02cbadab3e534b.png"}}]);