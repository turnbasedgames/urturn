"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[418],{5318:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>c});var n=a(7378);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),u=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),d=u(a),c=r,h=d["".concat(s,".").concat(c)]||d[c]||p[c]||o;return a?n.createElement(h,l(l({ref:t},m),{},{components:a})):n.createElement(h,l({ref:t},m))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,l=new Array(o);l[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var u=2;u<o;u++)l[u]=a[u];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},4148:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>p,frontMatter:()=>o,metadata:()=>i,toc:()=>u});var n=a(5773),r=(a(7378),a(5318));const o={title:"Understanding the Backend"},l=void 0,i={unversionedId:"backend",id:"backend",title:"Understanding the Backend",description:"Overview",source:"@site/docs/1-backend.md",sourceDirName:".",slug:"/backend",permalink:"/docs/backend",draft:!1,editUrl:"https://github.com/turnbasedgames/urturn/docs/1-backend.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Understanding the Backend"},sidebar:"tutorialSidebar",previous:{title:"Deploying Your Game",permalink:"/docs/getting-started/deploying"},next:{title:"Configuring Your Game",permalink:"/docs/game-configuration"}},s={},u=[{value:"Overview",id:"overview",level:2},{value:"Objects",id:"objects",level:2},{value:"BoardGame",id:"boardgame",level:3},{value:"joinable: <em>boolean</em>",id:"joinable-boolean",level:4},{value:"finished: <em>boolean</em>",id:"finished-boolean",level:4},{value:"players: <em>Player[]</em>",id:"players-player",level:4},{value:"version: <em>int</em>",id:"version-int",level:4},{value:"state: <em>JSON object</em>",id:"state-json-object",level:4},{value:"BoardGameResult",id:"boardgameresult",level:3},{value:"Player",id:"player",level:3},{value:"Functions",id:"functions",level:2},{value:"onRoomStart",id:"onroomstart",level:3},{value:"onPlayerJoin",id:"onplayerjoin",level:3},{value:"onPlayerQuit",id:"onplayerquit",level:3},{value:"onPlayerMove",id:"onplayermove",level:3}],m={toc:u};function p(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"overview"},"Overview"),(0,r.kt)("p",null,'The "backend" for all games is compromised of four functions found in the highest level ',(0,r.kt)("strong",{parentName:"p"},"index.js")," file. Currently, for this file to work you cannot import any outside functions - all of your code must be in this file."),(0,r.kt)("h2",{id:"objects"},"Objects"),(0,r.kt)("h3",{id:"boardgame"},"BoardGame"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  joinable: boolean,\n  finished: boolean,\n  players: Player[],\n  version: number,\n  state: {}\n}\n")),(0,r.kt)("p",null,"A JSON object provided to you that contains information about the current board game state."),(0,r.kt)("h4",{id:"joinable-boolean"},"joinable: ",(0,r.kt)("em",{parentName:"h4"},"boolean")),(0,r.kt)("p",null,"Initially true. "),(0,r.kt)("p",null,"If true, new users will be able to join this game instance. If false, new users can not join this game instance via a private room or matchmaking."),(0,r.kt)("h4",{id:"finished-boolean"},"finished: ",(0,r.kt)("em",{parentName:"h4"},"boolean")),(0,r.kt)("p",null,"Initially false. "),(0,r.kt)("p",null,'If true, no new changes can be made to the board game state, no new players can join, and the game instance will show in the "Played Games" list. If false, the game will show in the "Active Games" list for players.'),(0,r.kt)("h4",{id:"players-player"},"players: ",(0,r.kt)("em",{parentName:"h4"},"Player[]")),(0,r.kt)("p",null,"Initially empty."),(0,r.kt)("p",null,"A list of the ",(0,r.kt)("a",{parentName:"p",href:"#player"},"player objects")," in the game in the order the players joined. Will update as players join and leave the game instance. "),(0,r.kt)("h4",{id:"version-int"},"version: ",(0,r.kt)("em",{parentName:"h4"},"int")),(0,r.kt)("p",null,"Initially 0."),(0,r.kt)("p",null,"The current version of the board game state. Incremented with every change. Is used to keep all players in sync with the current board game state."),(0,r.kt)("h4",{id:"state-json-object"},"state: ",(0,r.kt)("em",{parentName:"h4"},"JSON object")),(0,r.kt)("p",null,"Initially empty, can be modified to any configuration."),(0,r.kt)("p",null,"Can hold any valid JSON object and is only used internally in your game logic."),(0,r.kt)("h3",{id:"boardgameresult"},"BoardGameResult"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  joinable: boolean,\n  finished: boolean,\n  state: {}\n}\n")),(0,r.kt)("p",null,"A JSON object that your functions can return - contains the aspects of the BoardGame that have been modified. Will be used to update your ",(0,r.kt)("a",{parentName:"p",href:"#boardgame"},"BoardGame")," object."),(0,r.kt)("h3",{id:"player"},"Player"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  id: string,\n  username: string\n}\n")),(0,r.kt)("p",null,"An object representing a single player."),(0,r.kt)("h2",{id:"functions"},"Functions"),(0,r.kt)("h3",{id:"onroomstart"},"onRoomStart"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"onRoomStart = () => BoardGameResult\n")),(0,r.kt)("p",null,"Runs when the room is first initialized, as triggered by these actions:"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"When a private room is created (player clicks ",(0,r.kt)("em",{parentName:"li"},"Create Private Room"),")"),(0,r.kt)("li",{parentName:"ol"},"When a room is created for the matchmaking queue (player clicks ",(0,r.kt)("em",{parentName:"li"},"Play"),")")),(0,r.kt)("p",null,"Returns the ",(0,r.kt)("a",{parentName:"p",href:"#boardgameresult"},"BoardGameResult"),". Use this function to initialize your board game state."),(0,r.kt)("h3",{id:"onplayerjoin"},"onPlayerJoin"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"onPlayerJoin = (player: Player, boardGame: object) => BoardGameResult\n")),(0,r.kt)("p",null,"Runs when a player joins the room, including when the room is created (i.e. the player clicks ",(0,r.kt)("em",{parentName:"p"},"Play")," or ",(0,r.kt)("em",{parentName:"p"},"Create Private Room"),"). Reveals the player who joined and the current ",(0,r.kt)("a",{parentName:"p",href:"#boardgame"},"BoardGame")," state. Returns the ",(0,r.kt)("a",{parentName:"p",href:"#boardgameresult"},"BoardGameResult"),"."),(0,r.kt)("h3",{id:"onplayerquit"},"onPlayerQuit"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"onPlayerQuit = (player: Player, boardGame: object) => BoardGameResult\n")),(0,r.kt)("p",null,"Runs when a player quits the game. A player ",(0,r.kt)("strong",{parentName:"p"},"only")," quits the game by manually clicking the ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"quit"))," button - closing the browser or tab will not end the game session. Reveals the player who quit and the current ",(0,r.kt)("a",{parentName:"p",href:"#boardgame"},"BoardGame")," state. Returns the ",(0,r.kt)("a",{parentName:"p",href:"#boardgameresult"},"BoardGameResult"),"."),(0,r.kt)("h3",{id:"onplayermove"},"onPlayerMove"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"onPlayerMove = (player: Player, move: object, boardGame: object) => BoardGameResult\n")),(0,r.kt)("p",null,"Runs when a player moves (i.e. when ",(0,r.kt)("inlineCode",{parentName:"p"},"client.makeMove()")," is called). Reveals the player that made the move, the object containing the move, and the current ",(0,r.kt)("a",{parentName:"p",href:"#boardgame"},"BoardGame")," state. The move object is defined by you and can be any JSON object. Returns the ",(0,r.kt)("a",{parentName:"p",href:"#boardgameresult"},"BoardGameResult"),"."))}p.isMDXComponent=!0}}]);