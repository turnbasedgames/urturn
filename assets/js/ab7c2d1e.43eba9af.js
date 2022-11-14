"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[5833],{5318:(e,t,a)=>{a.d(t,{Zo:()=>s,kt:()=>c});var n=a(7378);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var m=n.createContext({}),p=function(e){var t=n.useContext(m),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},s=function(e){var t=p(e.components);return n.createElement(m.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,m=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=p(a),c=r,k=d["".concat(m,".").concat(c)]||d[c]||u[c]||o;return a?n.createElement(k,l(l({ref:t},s),{},{components:a})):n.createElement(k,l({ref:t},s))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,l=new Array(o);l[0]=d;var i={};for(var m in t)hasOwnProperty.call(t,m)&&(i[m]=t[m]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var p=2;p<o;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},7643:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>m,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var n=a(5773),r=(a(7378),a(5318));const o={description:"objects that are used by the client and room functions"},l="Types",i={unversionedId:"API/types",id:"API/types",title:"Types",description:"objects that are used by the client and room functions",source:"@site/docs/2-API/2-types.md",sourceDirName:"2-API",slug:"/API/types",permalink:"/docs/API/types",draft:!1,editUrl:"https://github.com/turnbasedgames/urturn/tree/main/docs/docs/2-API/2-types.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{description:"objects that are used by the client and room functions"},sidebar:"docs",previous:{title:"Client",permalink:"/docs/API/client"},next:{title:"Runner",permalink:"/docs/API/runner"}},m={},p=[{value:"RoomState",id:"roomstate",level:2},{value:"RoomStartContext",id:"roomstartcontext",level:2},{value:"RoomLogger",id:"roomlogger",level:2},{value:"RoomStateResult",id:"roomstateresult",level:2},{value:"Player",id:"player",level:2},{value:"Move",id:"move",level:2}],s={toc:p};function u(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},s,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"types"},"Types"),(0,r.kt)("p",null,"Objects that are used by the ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/client"},"client")," and ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions"},"room functions")),(0,r.kt)("h2",{id:"roomstate"},"RoomState"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"RoomState")," object is provided to each ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions"},"room function"),", and will have the fields:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.joinable"),": ",(0,r.kt)("em",{parentName:"li"},"bool"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"true")),(0,r.kt)("li",{parentName:"ul"},"If true, new users will be able to join this game instance."),(0,r.kt)("li",{parentName:"ul"},"If false, new users can not join this game instance via a private room or matchmaking."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.finished"),": ",(0,r.kt)("em",{parentName:"li"},"bool"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"false"),"."),(0,r.kt)("li",{parentName:"ul"},"If true, no new functions will be called for the room (e.g. no new players can join, players can't make moves anymore, etc.). Marking a room finished is important for UrTurn to index each room properly."),(0,r.kt)("li",{parentName:"ul"},'If false, the game will show in the "Active Games" list for players.'))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.state"),": ",(0,r.kt)("em",{parentName:"li"},"JSON object"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"{}")),(0,r.kt)("li",{parentName:"ul"},"Can hold any valid JSON object, and is designed for you to put any data you want to make your game logic possible."),(0,r.kt)("li",{parentName:"ul"},"If you try to store non JSON serializable values like ",(0,r.kt)("inlineCode",{parentName:"li"},"functions"),", they will be parsed out."),(0,r.kt)("li",{parentName:"ul"},"Max size is ",(0,r.kt)("inlineCode",{parentName:"li"},"15mb"),"."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.players"),": ",(0,r.kt)("a",{parentName:"li",href:"#player"},(0,r.kt)("em",{parentName:"a"},"Player[]")),", ",(0,r.kt)("strong",{parentName:"li"},"read-only"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"[]")),(0,r.kt)("li",{parentName:"ul"},"UrTurn manages this field and will add a player object to the list before calling ",(0,r.kt)("inlineCode",{parentName:"li"},"onPlayerJoin")," and removes the player object from the list before calling ",(0,r.kt)("inlineCode",{parentName:"li"},"onPlayerQuit"),"."),(0,r.kt)("li",{parentName:"ul"},"Sorted in the order players joined the room (earliest player first with later players further in the array)."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.version"),": ",(0,r.kt)("em",{parentName:"li"},"int"),", ",(0,r.kt)("strong",{parentName:"li"},"read-only"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default"),": 0"),(0,r.kt)("li",{parentName:"ul"},"UrTurn manages this field and increments the ",(0,r.kt)("inlineCode",{parentName:"li"},"version")," by 1 every time a function successfully modifies it."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.roomStartContext"),": ",(0,r.kt)("a",{parentName:"li",href:"#roomstartcontext"},(0,r.kt)("em",{parentName:"a"},"RoomStartContext")),", ",(0,r.kt)("strong",{parentName:"li"},"read-only"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default"),": {}"),(0,r.kt)("li",{parentName:"ul"},"Provides crucial information on context of how this room was created"),(0,r.kt)("li",{parentName:"ul"},"For example, private rooms will set ",(0,r.kt)("inlineCode",{parentName:"li"},"roomState.roomStartContext.private = true"),"."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"roomState.logger"),": ",(0,r.kt)("a",{parentName:"li",href:"#roomlogger"},(0,r.kt)("em",{parentName:"a"},"RoomLogger")),", ",(0,r.kt)("strong",{parentName:"li"},"read-only"),", ",(0,r.kt)("strong",{parentName:"li"},"room functions only"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"Logger object used to log out metadata or message."),(0,r.kt)("li",{parentName:"ul"},"This helps us correlate logs in the same function call.")))),(0,r.kt)("h2",{id:"roomstartcontext"},"RoomStartContext"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"RoomStartContext")," is an object that is defined by how the player created the room. This is useful whenever you want your game to behave differently depending on how the room started."),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"RoomStartContext.private")," ",(0,r.kt)("strong",{parentName:"li"},"bool"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"true")," if the room is private (other players will not be able to access the room without the link)"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"false")," if the room is public. This means players can queue up and join this room.")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"// Example 1. Default (User clicks `Play`)\nroomState.roomStartContext = { private: false }\n\n// Example 2. Private Rooms (User clicks `Create Private Room`)\nroomState.roomStartContext = { private: true }\n")),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"It is not possible to have custom ",(0,r.kt)("inlineCode",{parentName:"p"},"RoomStartContext"),". We are still brainstorming on a good solution for this."),(0,r.kt)("p",{parentName:"admonition"},"Please join our ",(0,r.kt)("a",{parentName:"p",href:"https://discord.gg/myWacjdb5S"},"discord")," to tell us about your use case.")),(0,r.kt)("h2",{id:"roomlogger"},"RoomLogger"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"RoomLogger")," is an object to be used to log any metadata or message"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"RoomLogger.info")," ",(0,r.kt)("em",{parentName:"li"},"(...args) => void"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"Logs at the ",(0,r.kt)("inlineCode",{parentName:"li"},"info")," level"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"RoomLogger.warn")," ",(0,r.kt)("em",{parentName:"li"},"(...args) => void"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"Logs at the ",(0,r.kt)("inlineCode",{parentName:"li"},"warn")," level"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"RoomLogger.error")," ",(0,r.kt)("em",{parentName:"li"},"(...args) => void"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"Logs at the ",(0,r.kt)("inlineCode",{parentName:"li"},"error")," level")))),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"Viewing production logs is not supported yet. Provide details on your use case at our ",(0,r.kt)("a",{parentName:"p",href:"https://discord.gg/myWacjdb5S"},"discord"),".")),(0,r.kt)("h2",{id:"roomstateresult"},"RoomStateResult"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"RoomStateResult")," object is returned by every exported function. All fields are optional (omitting a field will make no edits to the current value). This object can have all the non ",(0,r.kt)("inlineCode",{parentName:"p"},"read-only")," fields as the ",(0,r.kt)("a",{parentName:"p",href:"#roomstate"},(0,r.kt)("inlineCode",{parentName:"a"},"RoomState")),"."),(0,r.kt)("h2",{id:"player"},"Player"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"player.id"),": ",(0,r.kt)("em",{parentName:"li"},"string"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Unique")," identification string for the player."),(0,r.kt)("li",{parentName:"ul"},"No two players will have the same ",(0,r.kt)("inlineCode",{parentName:"li"},"id"),"."),(0,r.kt)("li",{parentName:"ul"},"Player's cannot ever change their ",(0,r.kt)("inlineCode",{parentName:"li"},"id"),"."))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"player.username"),": ",(0,r.kt)("em",{parentName:"li"},"string"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Unique")," amongst any player at a point in time."),(0,r.kt)("li",{parentName:"ul"},"Player may change their ",(0,r.kt)("inlineCode",{parentName:"li"},"username"),".")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{ // example\n  "id": "90123018123dsf",\n  "username": "billy"\n}\n')),(0,r.kt)("h2",{id:"move"},"Move"),(0,r.kt)("p",null,"Any ",(0,r.kt)("inlineCode",{parentName:"p"},"JSON")," serializable object."),(0,r.kt)("p",null,"Example:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "y": 1,\n  "nested": {"field": "hello world"}\n  // ... any other field\n}\n')))}u.isMDXComponent=!0}}]);