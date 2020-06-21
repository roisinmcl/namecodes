let socket = io();

COLOR_CODES = {
  "red": "#cc5252",
  "blue": "#2e85d1",
  "neutral": "#e3dba1",
  "death": "#6e6e6e",
  "unpicked": "#ffffff"
}

LIGHT_COLOR_CODES = {
  "red": "#facaca",
  "blue": "#bfe1ff",
  "neutral": "#fffce6",
  "death": "#cfcfcf",
  "unpicked": "#ffffff"
}

// 0 = red, 1 = blue
MY_TEAM = Math.floor(Math.random() * 2);
assignTeam(MY_TEAM);

IS_CODEMASTER = false

// GAME ELEMENTS

// Set up a new game
let newGame = document.getElementById('newGame')
newGame.onclick = () => {
  socket.emit("newGameReq", "")
}

// Request code master view
let codemaster = document.getElementById('codemaster')
codemaster.onclick = () => {
  console.log("codemaster clicked");
  IS_CODEMASTER = true
  socket.emit("codemasterReq", "")
}

// Send a card click request
function clickCard(num) {
  socket.emit("cardClickReq", {'team': MY_TEAM, 'card': num})
  console.log("Card numer " + num + " was clicked");
}


// RESPONSE HANDLERS

// On new game response, redraw board
socket.on("newGameResp", (msg) => {
  console.log("redrawing board: ", msg);
  redrawBoard(msg);
});

// On response for code master view request
socket.on("codemasterResp", (msg) => {
  redrawBoard(msg);
});

// On card click response, redraw board
socket.on("cardClickResp", (msg) => {
  console.log("got click response: " + JSON.stringify(msg));
  //let cardNum = msg["cardNum"];
  //let cardColor = msg["color"];
  //assignColor(cardNum, cardColor);
  redrawBoard(msg);
});

// Score update
socket.on("scoreUpdate", (msg) => {
  console.log("got score update: " + JSON.stringify(msg));
  let blueScore = parseInt(msg["blue"]);
  console.log(blueScore);
  let redScore = parseInt(msg["red"]);
  console.log(redScore);
  updateScores(redScore, blueScore);
});


// Win update
socket.on("winUpdate", (msg) => {
  console.log("got win update: " + JSON.stringify(msg));
  updateWinMessage(msg);
});


// UI METHODS

function redrawBoard(msg) {
  jsonMsg = JSON.parse(msg);
  console.log("got codemaster request response: " + JSON.stringify(jsonMsg));
  // Update the board with codemaster colors
  console.log("redrawing board: ", msg);
  jsonMsg = JSON.parse(msg);
  console.log(jsonMsg);

  // Regular board draw
  words = jsonMsg["words"]
  var i;
  for (i = 0; i < 25; i++) {
    assignWord(i, words[i]);
  }

  colors = jsonMsg["colors"]

  for (i = 0; i < 25; i++) {
    assignColor(i, colors[i]);
  }
  if (IS_CODEMASTER) { // Add codemaster view
    // Assign all colors a light view
    colorsAll = jsonMsg["colorsAll"]
    for (i = 0; i < 25; i++) {
      assignLightColor(i, colorsAll[i]);
    }

    // Assign guessed colors a dark view and bold font
    for (i = 0; i < 25; i++) {
      if (colors[i] != "unpicked") {
        assignColor(i, colors[i]);
        boldText(i);
      }
    } 
  }
}

// Team assignment helper methods
function assignTeam(team) {
  MY_TEAM = team;
  let myTeamName = MY_TEAM ? "blue" : "red";
  let otherTeamName = MY_TEAM ? "red" : "blue";

  // Update my new team
  var myCard = document.getElementById(myTeamName + "-team");
  myCard.style.background = COLOR_CODES[myTeamName]; 
  var myText = document.getElementById(myTeamName + "-join");
  myText.style.visibility = "hidden";

  // Update the other team
  var otherCard = document.getElementById(otherTeamName + "-team");
  otherCard.style.background = "#FFFFFF"; 
  var otherText = document.getElementById(otherTeamName + "-join");
  otherText.style.visibility = "visible";
}

// Board drawing helper methods
function assignWord(cardNum, word) {
  var id = "cardWord-" + cardNum;
  var card = document.getElementById(id);
  // TODO: clean content
  card.innerHTML = word; 
}

function boldText(cardNum) {
  var id = "cardWord-" + cardNum;
  var card = document.getElementById(id);
  card.innerHTML = card.innerHTML.bold(); 
}

function assignColor(cardNum, color) {
  var id = "card-" + cardNum;
  var card = document.getElementById(id);
  card.style.background = COLOR_CODES[color]; 
}

function assignLightColor(cardNum, color) {
  var id = "card-" + cardNum;
  var card = document.getElementById(id);
  card.style.background = LIGHT_COLOR_CODES[color]; 
}

function updateScores(redScore, blueScore) {
  var redScoreElt = document.getElementById("red-score");
  redScoreElt.innerHTML = redScore;

  var blueScoreElt = document.getElementById("blue-score");
  blueScoreElt.innerHTML = blueScore;
}

function updateWinMessage(winner) {
  var winnerElt = document.getElementById("winner-banner");
  if (winner == "red") {
    winnerElt.innerHTML = "Red team wins!";
  } else {
    winnerElt.innerHTML = "Blue team wins!";
  }
}

function hideWinMessage() {
  var winnerElt = document.getElementById("winner-banner");
  winnerElt.innerHTML = "";
}






// Create and Join room elements: TODO

let nickname = document.getElementById('nickname')
let roomName = document.getElementById('roomName')

let createButton = document.getElementById('createForm')
createButton.onclick = () => {
  console.log("create clicked by ");
  return false;
}

let joinButton = document.getElementById('joinForm')
joinButton.onclick = () => {
  console.log("join clicked!");
  return false;
}