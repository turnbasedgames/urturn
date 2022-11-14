"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[3083],{5318:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var a=n(7378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},p=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),p=u(n),m=r,h=p["".concat(s,".").concat(m)]||p[m]||d[m]||o;return n?a.createElement(h,l(l({ref:t},c),{},{components:n})):a.createElement(h,l({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=p;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var u=2;u<o;u++)l[u]=n[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}p.displayName="MDXCreateElement"},9398:(e,t,n)=>{n.d(t,{Z:()=>l});var a=n(7378),r=n(8944);const o="tabItem_wHwb";function l(e){let{children:t,hidden:n,className:l}=e;return a.createElement("div",{role:"tabpanel",className:(0,r.Z)(o,l),hidden:n},t)}},6262:(e,t,n)=>{n.d(t,{Z:()=>m});var a=n(5773),r=n(7378),o=n(8944),l=n(6457),i=n(784),s=n(9947),u=n(3457);const c="tabList_J5MA",d="tabItem_l0OV";function p(e){var t;const{lazy:n,block:l,defaultValue:p,values:m,groupId:h,className:f}=e,y=r.Children.map(e.children,(e=>{if((0,r.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),b=m??y.map((e=>{let{props:{value:t,label:n,attributes:a}}=e;return{value:t,label:n,attributes:a}})),g=(0,i.l)(b,((e,t)=>e.value===t.value));if(g.length>0)throw new Error(`Docusaurus error: Duplicate values "${g.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const k=null===p?p:p??(null==(t=y.find((e=>e.props.default)))?void 0:t.props.value)??y[0].props.value;if(null!==k&&!b.some((e=>e.value===k)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${k}" but none of its children has the corresponding value. Available values are: ${b.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:v,setTabGroupChoices:w}=(0,s.U)(),[T,N]=(0,r.useState)(k),_=[],{blockElementScrollPositionUntilNextRender:x}=(0,u.o5)();if(null!=h){const e=v[h];null!=e&&e!==T&&b.some((t=>t.value===e))&&N(e)}const j=e=>{const t=e.currentTarget,n=_.indexOf(t),a=b[n].value;a!==T&&(x(t),N(a),null!=h&&w(h,String(a)))},I=e=>{var t;let n=null;switch(e.key){case"Enter":j(e);break;case"ArrowRight":{const t=_.indexOf(e.currentTarget)+1;n=_[t]??_[0];break}case"ArrowLeft":{const t=_.indexOf(e.currentTarget)-1;n=_[t]??_[_.length-1];break}}null==(t=n)||t.focus()};return r.createElement("div",{className:(0,o.Z)("tabs-container",c)},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":l},f)},b.map((e=>{let{value:t,label:n,attributes:l}=e;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:T===t?0:-1,"aria-selected":T===t,key:t,ref:e=>_.push(e),onKeyDown:I,onClick:j},l,{className:(0,o.Z)("tabs__item",d,null==l?void 0:l.className,{"tabs__item--active":T===t})}),n??t)}))),n?(0,r.cloneElement)(y.filter((e=>e.props.value===T))[0],{className:"margin-top--md"}):r.createElement("div",{className:"margin-top--md"},y.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==T})))))}function m(e){const t=(0,l.Z)();return r.createElement(p,(0,a.Z)({key:String(t)},e))}},8165:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>m,frontMatter:()=>i,metadata:()=>u,toc:()=>d});var a=n(5773),r=(n(7378),n(5318)),o=n(6262),l=n(9398);const i={},s="Flow of a Simple Game",u={unversionedId:"Introduction/Flow-Of-Simple-Game",id:"Introduction/Flow-Of-Simple-Game",title:"Flow of a Simple Game",description:"TicTacToe",source:"@site/docs/0-Introduction/1-Flow-Of-Simple-Game.mdx",sourceDirName:"0-Introduction",slug:"/Introduction/Flow-Of-Simple-Game",permalink:"/docs/Introduction/Flow-Of-Simple-Game",draft:!1,editUrl:"https://github.com/turnbasedgames/urturn/tree/main/docs/docs/0-Introduction/1-Flow-Of-Simple-Game.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{},sidebar:"docs",previous:{title:"Introduction",permalink:"/docs/"},next:{title:"Concepts",permalink:"/docs/Introduction/Concepts"}},c={},d=[{value:"TicTacToe",id:"tictactoe",level:2},{value:"1. Player <code>Billy</code> clicks <strong>Play</strong>",id:"1-player-billy-clicks-play",level:3},{value:"2. Player <code>Sarah</code> clicks <strong>Play</strong>",id:"2-player-sarah-clicks-play",level:3},{value:"3. <code>Billy</code> puts <code>X</code> in top left corner",id:"3-billy-puts-x-in-top-left-corner",level:3},{value:"4. Room functions are pure functions",id:"4-room-functions-are-pure-functions",level:3},{value:"Getting the hang of it?",id:"getting-the-hang-of-it",level:2}],p={toc:d};function m(e){let{components:t,...i}=e;return(0,r.kt)("wrapper",(0,a.Z)({},p,i,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"flow-of-a-simple-game"},"Flow of a Simple Game"),(0,r.kt)("h2",{id:"tictactoe"},"TicTacToe"),(0,r.kt)("p",null,"Let's walk through a simple TicTacToe game that you made:"),(0,r.kt)("h3",{id:"1-player-billy-clicks-play"},"1. Player ",(0,r.kt)("inlineCode",{parentName:"h3"},"Billy")," clicks ",(0,r.kt)("strong",{parentName:"h3"},"Play")),(0,r.kt)("p",null,(0,r.kt)("a",{target:"_blank",href:n(4171).Z},(0,r.kt)("img",{alt:"billy clicks play",src:n(9367).Z,width:"845",height:"496"}))),(0,r.kt)("p",null,"UrTurn calls your ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions"},"room function")," implementation of ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#onroomstart-required"},(0,r.kt)("inlineCode",{parentName:"a"},"onRoomStart"))," to initialize the room state."),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"result",label:"Initial roomState",default:!0,mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "joinable": true, // defaults to true, (when set to false, UrTurn prevents any new players from joining the room)\n  "finished": false, // defaults to false, (when set to true, UrTurn prevents any new moves from being made)\n  "state": { // this field can be any JSON object that you define. This was provided in the roomStateResult by the room function above.\n    "status": "preGame",\n    "board": [\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ]\n    ],\n    "winner": null,\n  },\n  "version": 0, // metadata controlled by UrTurn; as each new `RoomState` gets created, this gets incremented by 1\n  "players": [], // metadata controlled by UrTurn; when a player joins the room, they are added here to the list. When they quit the room, they are removed.\n}\n'))),(0,r.kt)(l.Z,{value:"onRoomStart",label:"onRoomStart code",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onRoomStart() {\n  return {\n    state: {\n      status: Status.PreGame,\n      board: [\n        [null, null, null],\n        [null, null, null],\n        [null, null, null],\n      ],\n      winner: null, // null means tie if game is finished, otherwise set to the plr that won,\n    },\n  };\n}\n")))),(0,r.kt)("p",null,"UrTurn calls ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#onplayerjoin-required"},(0,r.kt)("inlineCode",{parentName:"a"},"onPlayerJoin"))," function with ",(0,r.kt)("inlineCode",{parentName:"p"},"Billy")," player object and the previous ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/types#roomstate"},(0,r.kt)("inlineCode",{parentName:"a"},"roomState"))," created earlier."),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"result",label:"roomState result",default:!0,mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "joinable": true, // room should still let players join because there are not enough players to play tictactoe yet\n  "finished": false,\n  "state": {\n    "status": "preGame",\n    "board": [\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ]\n    ],\n    "winner": null\n  },\n  // highlight-start\n  "version": 1, // incremented because our room function successfully modified the state\n  "players": [ // new player is in the player list\n    {\n      "id": "id_0",\n      "username": "billy"\n    }\n  ]\n  // highlight-end\n}\n'))),(0,r.kt)(l.Z,{value:"onPlayerJoin",label:"onPlayerJoin Code",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onPlayerJoin(player, roomState) {\n  const { players, state } = roomState;\n  if (players.length === 2) { // enough players to play the game\n    state.status = Status.InGame;\n    state.plrToMoveIndex = 0; // keep track of who\u2019s turn it is\n    return { // return modifications we want to make to the roomState\n      state,\n      joinable: false, // we should not allow new players to join the game, tictactoe only needs two players\n    };\n  }\n  // our first player joined, we should do nothing (not enough players yet to start).\n  return {};\n}\n")))),(0,r.kt)("p",null,"Updates are propagated to clients by sending an event to ",(0,r.kt)("inlineCode",{parentName:"p"},"client.events.on('stateChanged')")," so your game frontend can update the view for the player."),(0,r.kt)("p",null,(0,r.kt)("a",{target:"_blank",href:n(7537).Z},(0,r.kt)("img",{alt:"billy waiting",src:n(7562).Z,width:"690",height:"527"}))),(0,r.kt)("h3",{id:"2-player-sarah-clicks-play"},"2. Player ",(0,r.kt)("inlineCode",{parentName:"h3"},"Sarah")," clicks ",(0,r.kt)("strong",{parentName:"h3"},"Play")),(0,r.kt)("p",null,"UrTurn matchmaking system puts ",(0,r.kt)("inlineCode",{parentName:"p"},"Sarah")," to the same room as ",(0,r.kt)("inlineCode",{parentName:"p"},"Billy"),"."),(0,r.kt)("p",null,"The same function ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#onplayerjoin-required"},(0,r.kt)("inlineCode",{parentName:"a"},"onPlayerJoin"))," is called with ",(0,r.kt)("inlineCode",{parentName:"p"},"Sarah")," player object and the previous ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/types#roomstate"},(0,r.kt)("inlineCode",{parentName:"a"},"roomState")),", which produces the result (changes are highlighted):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  // highlight-next-line\n  "joinable": false, // no longer joinable as we have enough players!\n  "finished": false,\n  "state": {\n    // highlight-next-line\n    "status": "inGame", // game is now in game and we can start playing!\n    "board": [\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ]\n    ],\n    "winner": null,\n    "plrToMoveIndex": 0\n  },\n  // highlight-next-line\n  "version": 2,\n  "players": [\n    {\n      "id": "id_0",\n      "username": "billy"\n    },\n    // highlight-start\n    { // new player "sarah", added by UrTurn runner\n      "id": "id_1",\n      "username": "sarah"\n    }\n    // highlight-end\n  ]\n}\n')),(0,r.kt)("p",null,"Updates are propagated to all clients:"),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"Sarah",label:"Sarah's browser",default:!0,mdxType:"TabItem"},(0,r.kt)("p",null,(0,r.kt)("a",{target:"_blank",href:n(396).Z},(0,r.kt)("img",{alt:"sarah joins",src:n(6686).Z,width:"677",height:"521"})))),(0,r.kt)(l.Z,{value:"Billy",label:"Billy's browser",mdxType:"TabItem"},(0,r.kt)("p",null,(0,r.kt)("a",{target:"_blank",href:n(4310).Z},(0,r.kt)("img",{alt:"sarah joins billy view",src:n(8938).Z,width:"596",height:"521"}))))),(0,r.kt)("h3",{id:"3-billy-puts-x-in-top-left-corner"},"3. ",(0,r.kt)("inlineCode",{parentName:"h3"},"Billy")," puts ",(0,r.kt)("inlineCode",{parentName:"h3"},"X")," in top left corner"),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"Billy moves",label:"Billy's browser",default:!0,mdxType:"TabItem"},(0,r.kt)("p",null,(0,r.kt)("a",{target:"_blank",href:n(6776).Z},(0,r.kt)("img",{alt:"billy moves",src:n(3821).Z,width:"684",height:"524"})))),(0,r.kt)(l.Z,{value:"Sarah",label:"Sarah's browser",mdxType:"TabItem"},(0,r.kt)("p",null,(0,r.kt)("a",{target:"_blank",href:n(8147).Z},(0,r.kt)("img",{alt:"billy moves sarah view",src:n(9774).Z,width:"605",height:"512"}))))),(0,r.kt)("p",null,"Your frontend calls ",(0,r.kt)("inlineCode",{parentName:"p"},"client.makeMove({ x: 0, y: 0 })")," whenever it detected ",(0,r.kt)("inlineCode",{parentName:"p"},"billy")," clicking a button on the board"),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"The ",(0,r.kt)("inlineCode",{parentName:"p"},"client.makeMove")," function takes any move JSON!")),(0,r.kt)("p",null,"UrTurn calls ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#onplayermove-required"},(0,r.kt)("inlineCode",{parentName:"a"},"onPlayerMove"))," function to handle the arbitrary move:"),(0,r.kt)(o.Z,{mdxType:"Tabs"},(0,r.kt)(l.Z,{value:"result",label:"roomState result",mdxType:"TabItem"},(0,r.kt)("p",null,"Resulting ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/types#roomstate"},(0,r.kt)("inlineCode",{parentName:"a"},"roomState"))," (changes are highlighted):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "joinable": false,\n  "finished": false,\n  "state": {\n    "status": "inGame",\n    "board": [\n      [\n        // highlight-next-line\n        "X", // Billy\u2019s move!\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ],\n      [\n        null,\n        null,\n        null\n      ]\n    ],\n    "winner": null,\n    // highlight-next-line\n    "plrToMoveIndex": 1 // next move is Sarah\u2019s\n  },\n  // highlight-next-line\n  "version": 3,\n  "players": [\n    {\n      "id": "id_0",\n      "username": "billy"\n    },\n    {\n      "id": "id_1",\n      "username": "sarah"\n    }\n  ]\n}\n'))),(0,r.kt)(l.Z,{value:"onRoomStart",label:"onRoomStart code",mdxType:"TabItem"},(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onPlayerMove(player, move, roomState) {\n  const { state, players } = roomState;\n  const { board, plrToMoveIndex } = state;\n  const { x, y } = move;\n  if (state.status !== Status.InGame) { // must be in the game (clients may spoof and send onPlayerMove with whatever values they want!)\n    throw new Error(\"game is not in progress, can't make move!\"); // error will be propagated to the client.makeMove() call\n  }\n  if (players[plrToMoveIndex].id !== player.id) { // make sure it is the player\u2019s turn\n    throw new Error(`Its not this player's turn: ${player.username}`);\n  }\n  if (board[x][y] !== null) {\n    throw new Error(`Invalid move, someone already marked here: ${x},${y}`);\n  }\n\n  board[x][y] = players[0].id === player.id ? \u2018X\u2019 : \u2018O\u2019; // set the board square to the correct mark;\n\n  // game may be finished\n  // logic is too long to show here, but checks if an \u201cthree marks in a row\u201d or if no more possible moves left\n  const [isEnd, winner] = isEndGame(board, players);\n  if (isEnd) {\n    // transitions game to end\n    state.status = Status.EndGame;\n    state.winner = winner;\n    return { state, finished: true }; // game is now finished, modify the \u201cfinished\u201d metadata so UrTurn can properly catalogue this room\n  }\n\n  // alternate the current player move so next player can make a move\n  state.plrToMoveIndex = plrToMoveIndex === 0 ? 1 : 0;\n  return { state };\n}\n")))),(0,r.kt)("h3",{id:"4-room-functions-are-pure-functions"},"4. ",(0,r.kt)("a",{parentName:"h3",href:"/docs/API/room-functions"},"Room functions")," are ",(0,r.kt)("a",{parentName:"h3",href:"/docs/API/room-functions#all-functions-are-pure-functions"},"pure functions")),(0,r.kt)("p",null,"Notice how all of the implemented room functions (",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#onroomstart-required"},(0,r.kt)("inlineCode",{parentName:"a"},"onRoomStart")),", ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#onplayerjoin-required"},(0,r.kt)("inlineCode",{parentName:"a"},"onPlayerJoin")),", etc.) takes in the current ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/types#roomstate"},(0,r.kt)("inlineCode",{parentName:"a"},"roomState"))," and several other arguments and returns a ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/types#roomstateresult"},(0,r.kt)("inlineCode",{parentName:"a"},"roomStateResult")),"."),(0,r.kt)("p",null,"Data should feel like a natural flow of transformations throughout time:\n",(0,r.kt)("img",{alt:"pure functions diagram",src:n(9379).Z,width:"691",height:"110"})),(0,r.kt)("p",null,"This makes it easier to understand, debug, and test your ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions"},"room functions"),". More on ",(0,r.kt)("a",{parentName:"p",href:"/docs/API/room-functions#all-functions-are-pure-functions"},"pure functions"),"."),(0,r.kt)("h2",{id:"getting-the-hang-of-it"},"Getting the hang of it?"),(0,r.kt)("admonition",{type:"success"},(0,r.kt)("p",{parentName:"admonition"},"You just write code for ",(0,r.kt)("strong",{parentName:"p"},"how state changes")," based on various room events - player joins, quits, makes move, etc."),(0,r.kt)("p",{parentName:"admonition"},"UrTurn takes care of the rest.")),(0,r.kt)("p",null,"Try implementing the entire ",(0,r.kt)("a",{parentName:"p",href:"/docs/getting-started/tictactoe"},"TicTacToe game")," and deploying it to production so anyone can play it!"))}m.isMDXComponent=!0},4171:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/files/click_play_button_tictactoe-a227fbd394c180d42b7e26582cb472a4.gif"},7537:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/files/tictactoe_1_billy_waiting-656e6c5221f4163331f0831cdba229d5.png"},396:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/files/tictactoe_2_sarah_joined-1ea2198107daa24d1f0d45ddaa0d5221.png"},4310:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/files/tictactoe_2_sarah_joined_billy_view-0427767429c0302f0623df36c1648333.png"},6776:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/files/tictactoe_3_billy_moves-49a2b9cb8ebb35317f1d95756e9f3f74.gif"},8147:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/files/tictactoe_3_billy_moves_sarah_view-064e864938de4590f4d6616c37dd73b7.gif"},9367:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/click_play_button_tictactoe-a227fbd394c180d42b7e26582cb472a4.gif"},9379:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/pure_function-adbb82777528fd65864ee0f5f7ba98d1.png"},7562:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/tictactoe_1_billy_waiting-656e6c5221f4163331f0831cdba229d5.png"},6686:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/tictactoe_2_sarah_joined-1ea2198107daa24d1f0d45ddaa0d5221.png"},8938:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/tictactoe_2_sarah_joined_billy_view-0427767429c0302f0623df36c1648333.png"},3821:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/tictactoe_3_billy_moves-49a2b9cb8ebb35317f1d95756e9f3f74.gif"},9774:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/tictactoe_3_billy_moves_sarah_view-064e864938de4590f4d6616c37dd73b7.gif"}}]);