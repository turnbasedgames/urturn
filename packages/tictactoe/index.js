// TicTacToe Example

function onRoomStart(lib, options){
  return {
    state: "NOT_STARTED", // NOT_STARTED, IN_GAME, END
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    plrs: [], // first player is X, second player is O
    winner: null, // null means tie if state is END, otherwise set to the plr that won
  }
}

function onPlayerJoin(lib, plr, boardgame){
  // VALIDATIONS
  // check if game has started
  if(boardgame.state !== "NOT_STARTED"){
    throw new Error("game has already started, can't join the game!")
  }

  // TRANSFORMATIONS
  // determine if we should start the game
  boardgame.plrs.push(plr)
  if (boardgame.plrs.length === 2){
    // start game
    boardgame.state = "IN_GAME"

    // randomize player order
    if(Math.random() < 0.5){
      const plrs = [boardgame.plrs[1], boardgame.plrs[0]]
      boardgame.plrs = plrs
    }
  }

  return boardgame
}

function getPlrToMove(board, plrs){ 
  const xCount = 0;
  const oCount = 0;
  for(row in board){
    for(mark in row){
      if (mark === 'X'){
        xCount++;
      }else if(mark === 'O'){
        oCount++;
      }
    }
  }
  if(xCount === oCount){
    return plrs[0]
  }else{
    return plrs[1]
  }
}

function getPlrMark(plr, plrs){
  if(plr === plrs[0]){
    return 'X'
  }else{
    return 'O'
  }
}

function getPlrFromMark(mark, plrs){
  return mark === 'X' ? plrs[0] : plrs[1]
}

function isWinningSequence(arr){
  return arr[0] != null && arr[0] == arr[1] && arr[1] == arr[2]
}

function isEndGame(board, plrs){
  // check if there is a winner
  for(let i = 0; i < board.length; i++){
    const row = board[i]
    const col = [board[0][i], board[1][i], board[2][i]]
    
    if(isWinningSequence(row)){
      return [true, getPlrFromMark(row[0], plrs)]
    }else if(isWinningSequence(col)){
      return [true, getPlrFromMark(col[0], plrs)]
    }
  }

  const d1 = [board[0][0], board[1][1], board[2][2]]
  const d2 = [board[0][2], board[1][1], board[2][0]]
  if(isWinningSequence(d1)){
    return [true, getPlrFromMark(d1[0], plrs)]
  }else if(isWinningSequence(d2)){
    return [true, getPlrFromMark(d2[0], plrs)]
  }

  // check for tie
  if(board.some((row)=>{
    return row.some(mark => mark === null)
  })){
    return [false, null]
  }else{
    return [true, null]
  }
}

function onPlayerMove(lib, plr, move, boardgame){
  const {board, plrs} = boardgame

  // VALIDATIONS
  // boardgame must be in the game
  const {x, y} = move
  if(boardgame.state !== "IN_GAME"){
    throw new Error("game is not in progress, can't make move!")
  }
  if(getPlrToMove(board, plrs) !== plr){
    throw new Error("Its not this player's turn: " + plr)
  }
  if(board[x][y] !== null){
    throw new Error("Invalid move, someone already marked here: " + x + "," + y)
  }
  
  const plrMark = getPlrMark(plr, plrs)
  board[x][y] = plrMark

  // Check if game is over
  const [isEnd, winner] = isEndGame(board, plrs)
  if(isEnd){
    boardgame.state = "END"
    boardgame.winner = winner
  }else{
    return boardgame
  }
}

module.exports = {
  onPlayerJoin,
  onPlayerMove,
  onRoomStart,
}
