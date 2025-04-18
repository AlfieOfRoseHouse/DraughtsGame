/**
 Draughts template
 12 black pieces battle 12 white pieces to dominate the 8x8 board
*/

// Global Variables
//Board
var board;
const MAXSQSIZE = 100;
var sqSize;
const BOARDSIZE = 8;
var offsetX = 40, offsetY = 40;

var currentBoard = 0;
const BOARD1 = [[0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0],
[0, 1, 0, 1, 0, 1, 0, 1],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[2, 0, 2, 0, 2, 0, 2, 0],
[0, 2, 0, 2, 0, 2, 0, 2],
[2, 0, 2, 0, 2, 0, 2, 0]];
const BOARD2 = [[0, 2, 0, 2, 0, 2, 0, 2],
[2, 0, 2, 0, 2, 0, 2, 0],
[0, 2, 0, 2, 0, 2, 0, 2],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 1, 0, 1, 0, 1, 0],
[0, 1, 0, 1, 0, 1, 0, 1],
[1, 0, 1, 0, 1, 0, 1, 0]];

//Counter
const counterDiameter = 7 / 8;
var selectedCoord = [-1, -1];
var playerScores = [0, 0];
//Game
var boardX, boardY;
const NOTSELECTED = 0, SELECTED = 1, DONE = 2;
var gameState = NOTSELECTED;
var turn = 0;
var winner;
var dWin = [1, 1];
var winPos = [0, 0];
//Colours
const playerColours = ['', [50, 50, 50], [200, 200, 175]];
const boardColours = ['burlywood', 'brown', '#B2936C']; //white, red, border
const selectedColour = [218, 165, 32];
const backgroundColour = [40, 40, 40];

//Lambda expressions
let screenToGrid = (coord, offset) => floor((coord - offset) / sqSize + 0.5);
let validCoord = (pos) => pos >= 0 && pos < 8;
let validPos = (x, y) => validCoord(x) && validCoord(y);
let gridToScreen = (coord, offset) => coord * sqSize + offset;
let newSqSize = () => min(MAXSQSIZE, min(width, height) / 12);
let validMove = (d, piece) => currentBoard == 0 && ((d > 0 && piece == 1) || (d < 0 && piece == 2)) || currentBoard == 1 && ((d < 0 && piece == 1) || (d > 0 && piece == 2));

//Setup game
function setup() {
  const canvas = createCanvas(windowWidth - 25, windowHeight - 75);
  canvas.parent(Canvas);
  document.body.style.backgroundColor = `rgb(${backgroundColour.join(', ')})`
  document.body.style.color = `rgb(${backgroundColour.join(', ')})`
  winPos = [width / 2, height / 2];
  //drawing properties
  rectMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER, CENTER);

  recalculate();
  initGame();
}
function initGame() {
  gameState = NOTSELECTED;
  turn = 0;

  flipBoard();
}
function flipBoard() {
  currentBoard = (currentBoard + 1) % 2;
  if (currentBoard == 0) board = BOARD1;
  else board = BOARD2;
}
function recalculate() {
  sqSize = newSqSize();
  offsetX = width / 2 - 3.5 * sqSize;
  offsetY = height / 2 - 3.5 * sqSize;
  textSize(sqSize / 2);
}

//Counters
function moveCounter() {
  const [x, y] = selectedCoord;
  const piece = board[y][x];
  const dx = boardX - x, dy = boardY - y;

  const absDx = abs(dx), absDy = abs(dy);

  if (absDx !== absDy) {
    gameState = NOTSELECTED;
    return;
  }

  if (!validMove(dy, piece) && !king(x, y)) {
    gameState = NOTSELECTED;
    return;
  }

  if (absDx == 1 && absDy == 1) move(x, y, piece);
  else if (absDx == 2 && absDy == 2) take(piece, dx, dy);

  checkIfKing(dy);

}
function move(x, y, piece) {
  if (board[boardY][boardX] != 0) return;
  board[boardY][boardX] = piece;
  board[y][x] = 0;
  turn = 1 - turn;

  gameState = NOTSELECTED;
}
function take(piece, dx, dy) {
  const middle = [boardX - dx / 2, boardY - dy / 2];
  const enemyCounter = 3 - piece;

  if (board[middle[1]][middle[0]] != enemyCounter && board[middle[1]][middle[0]] != enemyCounter + 2) return;
  if (board[boardY][boardX] != 0) return;

  playerScores[piece - 1]++;

  board[boardY][boardX] = piece;
  board[middle[1]][middle[0]] = 0;
  board[selectedCoord[1]][selectedCoord[0]] = 0;

  selectedCoord = [boardX, boardY];
}

function checkIfKing(dy) {
  if (board[boardY][boardX] > 2) return;
  if ((dy > 0 && boardY == 7) || (dy < 0 && boardY == 0)) {
    board[boardY][boardX] += 2;
  }
}
function king(x, y) {
  if (board[y][x] < 3) return false;
  return true;
}

//Game
function win() {
  if (!(playerScores[0] >= 12 || playerScores[1] >= 12)) return;
  gameState = DONE;
  winner = 1
  if (playerScores[0] > playerScores[1]) winner = 0;
}

//Draws gfx
function draw() {
  background(backgroundColour);

  stroke(0);
  drawBoard();
  highlightSelected();
  drawCounters();

  drawTurn();

  drawScore();

  win()
  if (gameState == DONE) drawWinner();
}
function drawBoard() {
  //Border
  fill(boardColours[2]);
  strokeWeight(1);
  const x = width / 2, y = height / 2, size = sqSize * 8.5, halfSize = size / 2;
  rect(x, y, size, size);
  line(x - halfSize, y - halfSize, x + halfSize, y + halfSize);
  line(x + halfSize, y - halfSize, x - halfSize, y + halfSize);
  //Grid
  for (r = 0; r < BOARDSIZE; r++) {
    for (c = 0; c < BOARDSIZE; c++) {
      strokeWeight(1);
      fill(boardColours[(r + c) % 2])
      rect(gridToScreen(c, offsetX), gridToScreen(r, offsetY), sqSize, sqSize)
    }
  }
}
function highlightSelected() {
  if (gameState != SELECTED) return;
  strokeWeight(0);
  fill(selectedColour);
  rect(gridToScreen(selectedCoord[0], offsetX), gridToScreen(selectedCoord[1], offsetY), sqSize, sqSize);
}
function drawCounters() {
  for (let y in board) {
    for (let x in board) {
      if (board[y][x] == 0) continue;
      strokeWeight(0);
      const king = (board[y][x] > 2)
      var colourId = (king) ? board[y][x] - 2 : board[y][x];
      fill(playerColours[colourId]);
      const d = sqSize * counterDiameter;
      ellipse(gridToScreen(x, offsetX), gridToScreen(y, offsetY), d, d);
      if (!king) continue;
      colourId = 3 - colourId;
      fill(playerColours[colourId]);
      text('♚', gridToScreen(x, offsetX), gridToScreen(y, offsetY));
    }
  }
}

function drawTurn() {
  const x = width / 2, y = offsetY / 3;
  //Counter background
  let [r, g, b] = playerColours[(1 - turn) + 1];
  const size = min(sqSize * 2, offsetY / 2);
  fill(r, g, b, 200);
  ellipse(x, y, size, size);
  //Background
  [r, g, b] = backgroundColour;
  fill(r, g, b, 40);
  rect(x - (sqSize / 2) * 9, y - 2, (sqSize / 2) * 36, sqSize / 2);
  //Text
  fill(200);
  strokeWeight(0);
  text(`Player ${turn + 1}'s move:`, x, y);
}
function drawScore() {
  stroke(backgroundColour);
  strokeWeight(1);

  //Background
  fill(boardColours[2]);
  rect(width / 2 + 5 * sqSize, height / 2, sqSize, sqSize * 9);

  //Counters
  const d = sqSize * counterDiameter;
  for (let plr in playerScores) {
    fill(playerColours[currentBoard == 0 ? plr + 1 : 2 - plr]);

    const x = width / 2 + 5 * sqSize;
    let y = height / 2 + (currentBoard == 0 ? ((plr * 2) - 1) : 0 - ((plr * 2) - 1)) * 4 * sqSize;
    for (let idx = 0; idx < playerScores[plr]; idx++) {
      ellipse(x, y, d, d);
      y -= (currentBoard == 0 ? ((plr * 2) - 1) : 0 - ((plr * 2) - 1)) * d / 4;
    }
  }
}

function drawWinner() {
  strokeWeight(0);

  let [r, g, b] = backgroundColour;
  fill(r, g, b, 200);
  rect(0, 0, width * 2, height * 2);

  let [x, y] = winPos;
  //Counter background
  [r, g, b] = playerColours[winner + 1];
  const size = min(sqSize * 2, offsetY / 2);
  fill(r, g, b, 250);
  ellipse(x, y, size, size);
  //Background
  [r, g, b] = backgroundColour;
  fill(r, g, b, 40);
  rect(x - (sqSize / 2) * 9, y - 2, (sqSize / 2) * 36, sqSize / 2);
  //Text
  fill(200);
  text(`Player ${winner} wins!`, x, y);
  winPos[0] += dWin[0];
  winPos[1] += dWin[1];
  if (winPos[0] - size >= width || winPos[0] + size <= 0) {
    winPos[0] = (winPos[0] - size >= width) ? width - size - 1 : size + 1;
    dWin[0] = -dWin[0];
  }
  if (winPos[1] - size >= height || winPos[1] + size <= 0) {
    winPos[1] = (winPos[1] - size >= height) ? height - size - 1 : size + 1;
    dWin[1] = -dWin[1];
  }
}

//Event handling
function mouseClicked() {
  //Calculates click coordinates
  boardX = screenToGrid(mouseX, offsetX);
  boardY = screenToGrid(mouseY, offsetY);
  //Checks if won
  if (gameState == DONE) return;
  //Select counter
  if (!validPos(boardX, boardY)) {
    gameState = NOTSELECTED;
    return;
  }
  const selected = board[boardY][boardX];
  if (gameState == SELECTED) moveCounter();
  else if (!(selected == turn + 1 || selected == turn + 3) && board[boardY][boardX] != 0) {
    gameState = SELECTED;
    selectedCoord = [boardX, boardY];
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 25, windowHeight - 75);
  recalculate();
}
