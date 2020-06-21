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
// TODO: set up logic for rooms/multiple simultaneous games

PLAYERS = []
WINNER = "none"
BOARD = {}
BOARD_WORDS = {}
BOARD_COLORS = {}
BOARD_COLORS_REVEALED = {}
RED_SCORE = 9
BLUE_SCORE = 8
GAME_IN_PROGRESS = false
GAME_OVER = false

// Constants
// TODO: Change colors codes to numbers
R = "red"
B = "blue"
N = "neutral"
D = "death"
U = "unpicked"
RED_TEAM = 0
BLUE_TEAM = 1

// Socket connects to the server
io.on('connection', (socket) => {

  // Add player socket to game list
  PLAYERS.push(socket.id);

  // If there's a game in progress when player joins, set up their board
  if (GAME_IN_PROGRESS) {
    console.log("Board from game in prog: ");
    console.log(BOARD);
    io.emit("newGameResp", JSON.stringify(BOARD));
    
    // Update scores and winner if necessary
    io.emit("scoreUpdate", {"red": RED_SCORE, "blue": BLUE_SCORE});

    if (WINNER == R) {
      GAME_OVER = true
      io.emit("winUpdate", "red");
    }

    if (WINNER == B) {
      GAME_OVER = true
      io.emit("winUpdate", "blue");
    }
  } else {
    initGame();
    io.emit("newGameResp", JSON.stringify(BOARD));
    io.emit("scoreUpdate", {"red": RED_SCORE, "blue": BLUE_SCORE});
  }

  console.log(PLAYERS);

  // Handle new game
  socket.on("newGameReq", (msg) => {
    console.log("got data from new game req");
    initGame();
    updateScores();
    io.emit("newGameResp", JSON.stringify(BOARD));
    io.emit("scoreUpdate", {"red": RED_SCORE, "blue": BLUE_SCORE});
  });

  // Handle requets to be codemaster
  // TODO: make codemaster status sticky
  socket.on("codemasterReq", (msg) => {
    console.log("got codemaster req");
    socket.emit("codemasterResp", JSON.stringify(BOARD));
  });


  // Handle card click
  socket.on("cardClickReq", (msg) => {
    console.log("got data from card click: " + JSON.stringify(msg));
    // Guess a card
    guessCard(msg["team"], msg["card"]);

    // Response fomat: card number, card color
    io.emit("cardClickResp", JSON.stringify(BOARD));

    // Send score update
    io.emit("scoreUpdate", {"red": RED_SCORE, "blue": BLUE_SCORE});

    let cardIndex = parseInt(msg["card"])
    let teamName = parseInt(msg["team"]) ? "blue" : "red";
    console.log("card clicked index:" + cardIndex);
    let deathCardRedsTurn = BOARD_COLORS[cardIndex] == D && teamName == R;
    console.log("death card red?" + deathCardRedsTurn);
    let deathCardBluesTurn = BOARD_COLORS[cardIndex] == D && teamName == B;
    console.log("death card blue?" + deathCardBluesTurn);
    if (!GAME_OVER && (RED_SCORE == 0 || deathCardBluesTurn)) {
      GAME_OVER = true
      WINNER = R
      console.log("Red wins");
      io.emit("winUpdate", "red");
    }

    if (!GAME_OVER && (BLUE_SCORE == 0 || deathCardRedsTurn)) {
      GAME_OVER = true
      WINNER = B
      console.log("Blue wins");
      io.emit("winUpdate", "blue");
    }
  });

  // Handle exit player
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
  BOARD_COLORS_REVEALED = {}
  RED_SCORE = 9
  BLUE_SCORE = 8
  WINNER = "none"

  GAME_IN_PROGRESS = true
  GAME_OVER = false
  
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

  for (i = 0; i < 25; i++) {
    BOARD_COLORS_REVEALED[i] = U;
  }

  console.log(BOARD_COLORS);
  console.log(BOARD_COLORS_REVEALED);

  BOARD = {"words": BOARD_WORDS, "colors": BOARD_COLORS_REVEALED, "colorsAll": BOARD_COLORS}

}

function guessCard(team, cardNum) {

  let cardColor = BOARD_COLORS[cardNum];
  // update the guessed color
  BOARD_COLORS_REVEALED[cardNum] = cardColor;

  console.log(BOARD_COLORS_REVEALED);
  console.log("BOARD_COLORS_REVEALED:");

  BOARD = {"words": BOARD_WORDS, "colors": BOARD_COLORS_REVEALED, "colorsAll": BOARD_COLORS}
  console.log("BOARD:");
  console.log(BOARD);

  // TODO: check game over
  updateScores();
  return {"cardNum": cardNum, "color": cardColor};
}

function updateScores() {
  let redRemaining = 9;
  let blueRemaining = 8;
  for (i = 0; i < 25; i++) {
    if (BOARD_COLORS_REVEALED[i] == R) {
      redRemaining--;
    }
    if (BOARD_COLORS_REVEALED[i] == B) {
      blueRemaining--;
    }
  }
  RED_SCORE = redRemaining;
  BLUE_SCORE = blueRemaining;
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