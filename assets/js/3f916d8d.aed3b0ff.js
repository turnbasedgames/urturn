"use strict";(self.webpackChunk_urturn_docs=self.webpackChunk_urturn_docs||[]).push([[150],{5318:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>p});var a=t(7378);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function i(e,n){if(null==e)return{};var t,a,r=function(e,n){if(null==e)return{};var t,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)t=o[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=a.createContext({}),d=function(e){var n=a.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},u=function(e){var n=d(e.components);return a.createElement(s.Provider,{value:n},e.children)},c={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},m=a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),m=d(t),p=r,h=m["".concat(s,".").concat(p)]||m[p]||c[p]||o;return t?a.createElement(h,l(l({ref:n},u),{},{components:t})):a.createElement(h,l({ref:n},u))}));function p(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,l=new Array(o);l[0]=m;var i={};for(var s in n)hasOwnProperty.call(n,s)&&(i[s]=n[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var d=2;d<o;d++)l[d]=t[d];return a.createElement.apply(null,l)}return a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},4175:(e,n,t)=>{t.r(n),t.d(n,{contentTitle:()=>h,default:()=>y,frontMatter:()=>p,metadata:()=>f,toc:()=>g});var a=t(5773),r=t(7378),o=t(5318),l=t(6457),i=t(4263),s=t(8944);const d="tabItem_WhCL";function u(e){var n,t;const{lazy:o,block:l,defaultValue:u,values:c,groupId:m,className:p}=e,h=r.Children.map(e.children,(e=>{if((0,r.isValidElement)(e)&&void 0!==e.props.value)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),f=c??h.map((e=>{let{props:{value:n,label:t,attributes:a}}=e;return{value:n,label:t,attributes:a}})),g=(0,i.lx)(f,((e,n)=>e.value===n.value));if(g.length>0)throw new Error(`Docusaurus error: Duplicate values "${g.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const b=null===u?u:u??(null==(n=h.find((e=>e.props.default)))?void 0:n.props.value)??(null==(t=h[0])?void 0:t.props.value);if(null!==b&&!f.some((e=>e.value===b)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${b}" but none of its children has the corresponding value. Available values are: ${f.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:y,setTabGroupChoices:v}=(0,i.UB)(),[k,w]=(0,r.useState)(b),T=[],{blockElementScrollPositionUntilNextRender:x}=(0,i.o5)();if(null!=m){const e=y[m];null!=e&&e!==k&&f.some((n=>n.value===e))&&w(e)}const j=e=>{const n=e.currentTarget,t=T.indexOf(n),a=f[t].value;a!==k&&(x(n),w(a),null!=m&&v(m,a))},N=e=>{var n;let t=null;switch(e.key){case"ArrowRight":{const n=T.indexOf(e.currentTarget)+1;t=T[n]||T[0];break}case"ArrowLeft":{const n=T.indexOf(e.currentTarget)-1;t=T[n]||T[T.length-1];break}}null==(n=t)||n.focus()};return r.createElement("div",{className:"tabs-container"},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.Z)("tabs",{"tabs--block":l},p)},f.map((e=>{let{value:n,label:t,attributes:o}=e;return r.createElement("li",(0,a.Z)({role:"tab",tabIndex:k===n?0:-1,"aria-selected":k===n,key:n,ref:e=>T.push(e),onKeyDown:N,onFocus:j,onClick:j},o,{className:(0,s.Z)("tabs__item",d,null==o?void 0:o.className,{"tabs__item--active":k===n})}),t??n)}))),o?(0,r.cloneElement)(h.filter((e=>e.props.value===k))[0],{className:"margin-vert--md"}):r.createElement("div",{className:"margin-vert--md"},h.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==k})))))}function c(e){const n=(0,l.Z)();return r.createElement(u,(0,a.Z)({key:String(n)},e))}const m=function(e){let{children:n,hidden:t,className:a}=e;return r.createElement("div",{role:"tabpanel",hidden:t,className:a},n)},p={title:"Creating Your First Game!"},h=void 0,f={unversionedId:"getting-started/create-game",id:"getting-started/create-game",title:"Creating Your First Game!",description:"Overview",source:"@site/docs/0-getting-started/3-create-game.md",sourceDirName:"0-getting-started",slug:"/getting-started/create-game",permalink:"/docs/getting-started/create-game",editUrl:"https://github.com/turnbasedgames/urturn/docs/0-getting-started/3-create-game.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{title:"Creating Your First Game!"},sidebar:"tutorialSidebar",previous:{title:"Walking Through the Template Files",permalink:"/docs/getting-started/template-files"},next:{title:"Deploying Your Game",permalink:"/docs/getting-started/deploying"}},g=[{value:"Overview",id:"overview",children:[],level:2},{value:"The Backend",id:"the-backend",children:[{value:"What is Board Game State?",id:"what-is-board-game-state",children:[],level:3},{value:"Four Functions - That&#39;s It!",id:"four-functions---thats-it",children:[{value:"1. onRoomStart",id:"1-onroomstart",children:[],level:4},{value:"2. onPlayerJoin",id:"2-onplayerjoin",children:[],level:4},{value:"3. onPlayerMove",id:"3-onplayermove",children:[],level:4},{value:"4. onPlayerQuit",id:"4-onplayerquit",children:[],level:4}],level:3}],level:2},{value:"Frontend",id:"frontend",children:[{value:"1. Extract the Board Game State",id:"1-extract-the-board-game-state",children:[],level:3},{value:"2. Create a Tic-Tac-Toe Board",id:"2-create-a-tic-tac-toe-board",children:[],level:3},{value:"3. Add MakeMove()",id:"3-add-makemove",children:[],level:3}],level:2},{value:"Adding a Thumbnail",id:"adding-a-thumbnail",children:[],level:2},{value:"Testing Your Game",id:"testing-your-game",children:[],level:2}],b={toc:g};function y(e){let{components:n,...t}=e;return(0,o.kt)("wrapper",(0,a.Z)({},b,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"overview"},"Overview"),(0,o.kt)("p",null,"We are ready to make our first game - tic-tac-toe! There are two major components of your game: the ",(0,o.kt)("a",{parentName:"p",href:"#frontend"},"frontend")," and the ",(0,o.kt)("a",{parentName:"p",href:"#backend"},"backend"),". We will go over the basics of each."),(0,o.kt)("h2",{id:"the-backend"},"The Backend"),(0,o.kt)("h3",{id:"what-is-board-game-state"},"What is Board Game State?"),(0,o.kt)("p",null,"Your game state is held in the ",(0,o.kt)("a",{parentName:"p",href:"/docs/backend#boardgame"},"BoardGame"),' object. You can tell UrTurn if your game is joinable and/or if it is finished. You can also define the "state" object that will define the way the board currently looks. For this tic-tac-toe game, the BoardGame state will look like this:'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "players": "[]", // controlled by UrTurn\n  "version": 0, // controlled by UrTurn\n  "joinable": true,\n  "finished": false,\n  "state": {\n    "board": "[\n      [null, null, null],\n      [null, null, null],\n      [null, null, null],\n    ]",\n    "winner": null\n  }\n}\n')),(0,o.kt)("p",null,"We will be manipulating the ",(0,o.kt)("inlineCode",{parentName:"p"},"joinable"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"finished"),", and ",(0,o.kt)("inlineCode",{parentName:"p"},"state")," properties of this object to control our game."),(0,o.kt)("h3",{id:"four-functions---thats-it"},"Four Functions - That's It!"),(0,o.kt)("p",null,"All of our game logic can be encompassed by the following four functions:"),(0,o.kt)("h4",{id:"1-onroomstart"},"1. onRoomStart"),(0,o.kt)("p",null,"This function will be called whenever a ",(0,o.kt)("a",{parentName:"p",href:"/docs/backend#onroomstart"},"room is created"),". When the game starts, we want to initialize our empty BoardGame state, which includes the following for tic-tac-toe:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"The Board: A 3x3 square, initialized with null values."),(0,o.kt)("li",{parentName:"ol"},"The Winner: The winner's ID, if there is a winner. Initially null.")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onRoomStart() {\n  return {\n    state: {\n      board: [\n        [null, null, null],\n        [null, null, null],\n        [null, null, null],\n      ],\n      winner: null\n    }\n  };\n}\n")),(0,o.kt)("h4",{id:"2-onplayerjoin"},"2. onPlayerJoin"),(0,o.kt)("p",null,"This function will be called whenever a player actually joins the game. It provides us with the ID of the player who joined as well as the current ",(0,o.kt)("a",{parentName:"p",href:"/docs/backend#boardgame"},"BoardGame state"),"."),(0,o.kt)("p",null,"If this is the first player to join, we will just return an empty object. If this is the second player to join, then the game has all the necessary players and should be marked as unjoinable."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onPlayerJoin(plr, boardGame) {\n  const { players } = boardGame;\n\n  if (players.length === 2) {\n    return { joinable: false };\n  }\n  return { };\n}\n")),(0,o.kt)("h4",{id:"3-onplayermove"},"3. onPlayerMove"),(0,o.kt)("p",null,"This function will be called whenever a player makes a move. It provides us with the ID of the player who made the move, the move object, and the current board game state. We can define the move object as any valid JSON object - for tic-tac-toe, it will be an object containing the x- and y-coordinates of the square they selected."),(0,o.kt)("p",null,"After the move is completed, if we determine the game is over and there is a winner, we will add the winner's ID to our state so it can be displayed on the frontend."),(0,o.kt)(c,{mdxType:"Tabs"},(0,o.kt)(m,{value:"snippet",label:"Snippet",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onPlayerMove(plr, move, boardGame) {\n  const { state, players } = boardGame;\n  const { board, plrToMoveIndex } = state;\n\n  const { x, y } = move;\n\n  const plrMark = getPlrMark(plr, players);\n\n  board[x][y] = plrMark;\n\n  const [isEnd, winner] = isEndGame(board, players);\n\n  if (isEnd) {\n    state.winner = winner;\n\n    return { state, finished: true };\n  }\n\n  return { state };\n}\n"))),(0,o.kt)(m,{value:"full",label:"Full Code",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function getPlrMark(plr, plrs) {\n  if (plr.id === plrs[0].id) { // for simplicity, the first player will be 'X'\n    return 'X';\n  }\n  return 'O';\n}\n\nfunction isEndGame(board, plrs) {\n  function getPlrFromMark(mark, plrs) {\n    return mark === 'X' ? plrs[0] : plrs[1];\n  }\n\n  function isWinningSequence(arr) {\n    return arr[0] !== null && arr[0] === arr[1] && arr[1] === arr[2];\n  }\n\n  // check rows and cols\n  for (let i = 0; i < board.length; i += 1) {\n    const row = board[i];\n    const col = [board[0][i], board[1][i], board[2][i]];\n\n    if (isWinningSequence(row)) {\n      return [true, getPlrFromMark(row[0], plrs)];\n    } if (isWinningSequence(col)) {\n      return [true, getPlrFromMark(col[0], plrs)];\n    }\n  }\n\n  // check diagonals\n  const d1 = [board[0][0], board[1][1], board[2][2]];\n  const d2 = [board[0][2], board[1][1], board[2][0]];\n  if (isWinningSequence(d1)) {\n    return [true, getPlrFromMark(d1[0], plrs)];\n  } if (isWinningSequence(d2)) {\n    return [true, getPlrFromMark(d2[0], plrs)];\n  }\n\n  // check for tie\n  if (board.some((row) => row.some((mark) => mark === null))) {\n    return [false, null];\n  }\n  return [true, null];\n}\n\nfunction onPlayerMove(plr, move, boardGame) {\n  const { state, players } = boardGame;\n  const { board, plrToMoveIndex } = state;\n\n  const { x, y } = move;\n\n  const plrMark = getPlrMark(plr, players);\n\n  board[x][y] = plrMark;\n\n  const [isEnd, winner] = isEndGame(board, players);\n\n  if (isEnd) {\n    state.winner = winner;\n    return { state, finished: true };\n  }\n  return { state };\n}\n")))),(0,o.kt)("h4",{id:"4-onplayerquit"},"4. onPlayerQuit"),(0,o.kt)("p",null,"This function will be called whenever a player ",(0,o.kt)("a",{parentName:"p",href:"/docs/backend#onplayerquit"},"quits the game"),". It provides us with the ID of the player who quit and the current board game state."),(0,o.kt)("p",null,"For tic-tac-toe, the game will end if one of the players quits. The game will be marked as unjoinable and finished, and the remaining player will be marked the winner."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="index.js"',title:'"index.js"'},"function onPlayerQuit(plr, boardGame) {\n  const { state, players } = boardGame;\n\n  if (players.length === 1) {\n    const [winner] = players;\n    state.winner = winner;\n    return { state, joinable: false, finished: true };\n  }\n  return { joinable: false, finished: true };\n}\n")),(0,o.kt)("h2",{id:"frontend"},"Frontend"),(0,o.kt)("p",null,"This section will go over how to implement the frontend for our tic-tac-toe so that it is visible to the user. We will be adding our components to ",(0,o.kt)("inlineCode",{parentName:"p"},"frontend/src/App.jsx"),". This file already contains some logic for you to access the ",(0,o.kt)("a",{parentName:"p",href:"/docs/backend#boardgame"},"BoardGame")," object and for any state changes to make to be propagated to your backend."),(0,o.kt)("h3",{id:"1-extract-the-board-game-state"},"1. Extract the Board Game State"),(0,o.kt)("p",null,"We will first extract the information we need from the board game state:"),(0,o.kt)(c,{mdxType:"Tabs"},(0,o.kt)(m,{value:"snippet",label:"Snippet",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="frontend/src/App.jsx"',title:'"frontend/src/App.jsx"'},"const {\n  state: {\n    board\n  } = {\n    board: [\n      [null, null, null],\n      [null, null, null],\n      [null, null, null]\n    ]\n  }\n} = boardGame;\n"))),(0,o.kt)(m,{value:"full",label:"Full Code",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="frontend/src/App.jsx"',title:'"frontend/src/App.jsx"'},"import React, { useState, useEffect } from 'react';\nimport { ThemeProvider, Typography } from '@mui/material';\n\nimport client, { events } from '@urturn/client';\nimport theme from './theme';\n\nfunction App() {\n  const [boardGame, setBoardGame] = useState(client.getBoardGame() || {});\n  useEffect(() => {\n    const onStateChanged = (newBoardGame) => {\n      setBoardGame(newBoardGame);\n    };\n    events.on('stateChanged', onStateChanged);\n    return () => {\n      events.off('stateChanged', onStateChanged);\n    };\n  }, []);\n\n  console.log('boardGame:', boardGame);\n\n  const {\n    state: {\n      board\n    } = {\n      board: [\n        [null, null, null],\n        [null, null, null],\n        [null, null, null]\n      ]\n    }\n  } = boardGame;\n\n  return (\n    <ThemeProvider theme={theme}>\n      <Typography>\n        TODO: Display your game here\n      </Typography>\n    </ThemeProvider>\n  );\n}\n\nexport default App;\n")))),(0,o.kt)("h3",{id:"2-create-a-tic-tac-toe-board"},"2. Create a Tic-Tac-Toe Board"),(0,o.kt)("p",null,"Using our empty board game, we can render a simple tic-tac-toe board:"),(0,o.kt)(c,{mdxType:"Tabs"},(0,o.kt)(m,{value:"snippet",label:"Snippet",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="frontend/src/App.jsx" live',title:'"frontend/src/App.jsx"',live:!0},'function App(props) {\n  return (\n    <ThemeProvider theme={theme}>\n      <Typography>\n        <Stack margin={2} spacing={1} direction="row" justifyContent="center">\n          <Box>\n            {board.map((row, rowNum) => (\n              <Stack key={rowNum} direction="row">\n                {row.map((val, colNum) => (\n                  <Stack\n                    key={colNum}\n                    direction="row"\n                    justifyContent="center"\n                    alignItems="center"\n                    sx={{\n                      border: 1,\n                      borderColor: \'text.primary\',\n                      height: \'100px\',\n                      width: \'100px\',\n                    }}\n                  >\n                    <Typography color="text.primary" fontSize="60px">\n                      {val}\n                    </Typography>\n                  </Stack>\n                ))}\n              </Stack>\n            ))}\n          </Box>\n        </Stack>\n      </Typography>\n    </ThemeProvider>\n  );\n}\n'))),(0,o.kt)(m,{value:"full",label:"Full Code",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="frontend/src/App.jsx"',title:'"frontend/src/App.jsx"'},"import React, { useState, useEffect } from 'react';\nimport { ThemeProvider, Typography, Stack, Box } from '@mui/material';\n\nimport client, { events } from '@urturn/client';\nimport theme from './theme';\n\nfunction App() {\n  const [boardGame, setBoardGame] = useState(client.getBoardGame() || {});\n  useEffect(() => {\n    const onStateChanged = (newBoardGame) => {\n      setBoardGame(newBoardGame);\n    };\n    events.on('stateChanged', onStateChanged);\n    return () => {\n      events.off('stateChanged', onStateChanged);\n    };\n  }, []);\n\n  console.log('boardGame:', boardGame);\n\n  const {\n    state: {\n      board\n    } = {\n      board: [\n        [null, null, null],\n        [null, null, null],\n        [null, null, null],\n      ]\n    }\n  } = boardGame;\n\n  return (\n    <ThemeProvider theme={theme}>\n      <Typography>\n        <Stack margin={2} spacing={1} direction=\"row\" justifyContent=\"center\">\n          <Box>\n            {board.map((row, rowNum) => (\n              <Stack key={rowNum} direction=\"row\">\n                {row.map((val, colNum) => (\n                  <Stack\n                    key={colNum}\n                    direction=\"row\"\n                    justifyContent=\"center\"\n                    alignItems=\"center\"\n                    sx={{\n                      border: 1,\n                      borderColor: 'text.primary',\n                      height: '100px',\n                      width: '100px',\n                    }}\n                  >\n                    <Typography color=\"text.primary\" fontSize=\"60px\">\n                      {val}\n                    </Typography>\n                  </Stack>\n                ))}\n              </Stack>\n            ))}\n          </Box>\n        </Stack>\n      </Typography>\n    </ThemeProvider>\n  );\n}\n\nexport default App;\n")))),(0,o.kt)("h3",{id:"3-add-makemove"},"3. Add MakeMove()"),(0,o.kt)("p",null,"We can now add in the ability for a player to make a move. We'll add an onClick handler to each tic-tac-toe square that will send a move containing the x- and y-coordinates (the row and column numbers of the box they clicked on) to the client. UrTurn will handle sending the move to your onPlayerMove function!"),(0,o.kt)(c,{mdxType:"Tabs"},(0,o.kt)(m,{value:"snippet",label:"Snippet",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="frontend/src/App.jsx"',title:'"frontend/src/App.jsx"'},"onClick={async (event) => {\n  event.preventDefault();\n  const move = { x: rowNum, y: colNum };\n  await client.makeMove(move);\n}}\n"))),(0,o.kt)(m,{value:"full",label:"Full Code",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:'title="frontend/src/App.jsx"',title:'"frontend/src/App.jsx"'},"import React, { useState, useEffect } from 'react';\nimport { ThemeProvider, Typography, Stack, Box } from '@mui/material';\n\nimport client, { events } from '@urturn/client';\nimport theme from './theme';\n\nfunction App() {\n  const [boardGame, setBoardGame] = useState(client.getBoardGame() || {});\n  useEffect(() => {\n    const onStateChanged = (newBoardGame) => {\n      setBoardGame(newBoardGame);\n    };\n    events.on('stateChanged', onStateChanged);\n    return () => {\n      events.off('stateChanged', onStateChanged);\n    };\n  }, []);\n\n  console.log('boardGame:', boardGame);\n\n  const {\n    state: {\n      board\n    } = {\n      board: [\n        [null, null, null],\n        [null, null, null],\n        [null, null, null],\n      ]\n    }\n  } = boardGame;\n\n  return (\n    <ThemeProvider theme={theme}>\n      <Typography>\n        <Stack margin={2} spacing={1} direction=\"row\" justifyContent=\"center\">\n          <Box>\n            {board.map((row, rowNum) => (\n              <Stack key={rowNum} direction=\"row\">\n                {row.map((val, colNum) => (\n                  <Stack\n                    key={colNum}\n                    direction=\"row\"\n                    justifyContent=\"center\"\n                    alignItems=\"center\"\n                    sx={{\n                      border: 1,\n                      borderColor: 'text.primary',\n                      height: '100px',\n                      width: '100px',\n                    }}\n                    onClick={async (event) => {\n                      event.preventDefault();\n                      const move = { x: rowNum, y: colNum };\n                      await client.makeMove(move);\n                    }}\n                  >\n                    <Typography color=\"text.primary\" fontSize=\"60px\">\n                      {val}\n                    </Typography>\n                  </Stack>\n                ))}\n              </Stack>\n            ))}\n          </Box>\n        </Stack>\n      </Typography>\n    </ThemeProvider>\n  );\n}\n\nexport default App;\n")))),(0,o.kt)("h2",{id:"adding-a-thumbnail"},"Adding a Thumbnail"),(0,o.kt)("p",null,"We'll now find a suitable thumbnail for our game, such as ",(0,o.kt)("a",{parentName:"p",href:"https://unsplash.com/photos/67Rp3mulEVA"},"this one"),". We'll download it, upload it at the highest level of our folder structure, and rename it \"thumbnail.png\" (the actual filetype doesn't matter - but it ",(0,o.kt)("strong",{parentName:"p"},"must")," have this name)."),(0,o.kt)("h2",{id:"testing-your-game"},"Testing Your Game"),(0,o.kt)("p",null,"We're now ready to test our game! In the Runner, you should see the empty board game state. Click ",(0,o.kt)("strong",{parentName:"p"},"Add Player")," to add a player to the game. This will open a new tab that simulates what the player will see upon joining."),(0,o.kt)("p",null,'In our game state, "joinable" still says true. We can add an additional player and see that "joinable" is now set to false, as defined in our onPlayerJoin function.'),(0,o.kt)("p",null,"You can now simulate playing tic-tac-toe between the two tabs!"),(0,o.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},'You currently must refresh the Runner to see all "state" specific changes.'))),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/turnbasedgames/tictactoe/tree/solution"},"Here")," is the finished tic-tac-toe game in production, which includes error handling, move validation, player validation, and more!"))}y.isMDXComponent=!0}}]);