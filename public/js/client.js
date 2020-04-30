let socket = io();

COLOR_CODES = {
  "red": "#cc5252",
  "blue": "#2e85d1",
  "neutral": "#faf2bb",
  "death": "#6e6e6e",
}

// GAME ELEMENTS

// Set up a new game
let newGame = document.getElementById('newGame')
newGame.onclick = () => {
  socket.emit("newGameReq", "")
}

socket.on("newGameResp", (msg) => {
  console.log("redrawing board: ", msg);
  jsonMsg = JSON.parse(msg);
  console.log(jsonMsg);

  words = jsonMsg["words"]
  var i;
  for (i = 0; i < 25; i++) {
    assignWord(i, words[i]);
  }

  colors = jsonMsg["colors"]

  for (i = 0; i < 25; i++) {
    assignColor(i, colors[i]);
  }
});

function assignWord(cardNum, word) {
  var id = "cardWord-" + cardNum;
  var card = document.getElementById(id);
  // TODO: clean content
  card.innerHTML = word; 
}

function assignColor(cardNum, color) {
  var id = "card-" + cardNum;
  var card = document.getElementById(id);
  card.style.background = COLOR_CODES[color]; 
}

function clickCard(num) {
  socket.emit("cardClickReq", {'team': 'red', 'card': num })
  console.log("Card numer " + num + " was clicked");
}

socket.on("cardClickResp", (msg) => {
  console.log("got click response: " + msg);
})







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