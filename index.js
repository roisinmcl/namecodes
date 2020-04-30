var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let express = require('express')


app.use(express.static(__dirname + '/public'));

const Gameplay = require('./src/gameplay.js')
const game = new Gameplay();


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/templates/index.html');
});


// Server Logic

PLAYERS = []
BOARD = {}
BOARD_WORDS = {}
BOARD_COLORS = {}
R = "red"
B = "blue"
N = "neutral"
D = "death"
RED_SCORE = 0
BLUE_SCORE = 0
GAME_IN_PROGRESS = false

// Server connection w/ a socket
io.on('connection', (socket) => {

  PLAYERS.push(socket.id);

  if (GAME_IN_PROGRESS) {
    io.emit("newGameResp", JSON.stringify(BOARD));
  }

  console.log(PLAYERS);

  socket.on("newGameReq", (msg) => {
    console.log("got data from new game req");
    initGame();
    io.emit("newGameResp", JSON.stringify(BOARD));
  });


  socket.on("cardClickReq", (msg) => {
    console.log("got data from card click: " + msg);
    io.emit("cardClickResp", {'cardNum': 'insert number', 'color': 'red'});
  });


  socket.on('disconnect', () => {
    PLAYERS.splice(PLAYERS.indexOf(socket.id), 1);
    console.log(PLAYERS);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});


// Game Logic

function initGame() {

  BOARD = {}
  BOARD_WORDS = {}
  BOARD_COLORS = {}

  GAME_IN_PROGRESS = true
  
  // Assign words 

  var gameBoard = {}
  var tempList = TEST_WORD_LIST.slice()

  var i;
  for (i = 0; i < 25; i++) {
    var index = Math.floor(Math.random() * tempList.length);  
    gameBoard[i] = tempList[index];
    tempList.splice(index, 1);
  }

  console.log(gameBoard);
  BOARD_WORDS = gameBoard;

  // Assign colors

  // Initialize to null
  for (i = 0; i < 25; i++) {
    BOARD_COLORS[i] = 0
  }

  // Assign red and blue tiles
  redToAssign = 9
  blueToAssign = 8
  neutralToAssign = 7
  deathToAssign = 1

  var i;
  while ((redToAssign + blueToAssign + neutralToAssign + deathToAssign) > 0) {
    // Inefficient
    var index = Math.floor(Math.random() * 25);
    while (BOARD_COLORS[index] != 0) {
      index = Math.floor(Math.random() * 25);
    }
    if (redToAssign > 0) {
      BOARD_COLORS[index] = R;
      redToAssign--;
    } else if (blueToAssign > 0) {
      BOARD_COLORS[index] = B;
      blueToAssign--;
    } else if (neutralToAssign > 0) {
      BOARD_COLORS[index] = N;
      neutralToAssign--;
    } else if (deathToAssign > 0) {
      BOARD_COLORS[index] = D;
      deathToAssign--;
    }
  }

  console.log(BOARD_COLORS);

  BOARD = {"words": BOARD_WORDS, "colors": BOARD_COLORS}

}


const TEST_WORD_LIST = [
"turtle",
"dog",
"cat",
"mouse",
"bunny",
"rabbit",
"horse",
"cow",
"sheep",
"pidgeon",
"lizard",
"ant",
"spider",
"anteater",
"aardvard",
"rat",
"bee",
"bull",
"zebra",
"lion",
"tiger",
"bear",
"jackal",
"elk",
"bison",
"buffalo",
"reindeer",
"butterfly",
"fish",
]