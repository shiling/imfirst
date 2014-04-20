//models
var Game = require('./Game.js');

function GameProvider(){
  this.games = {};
}

//create new instance of game with unique gameId
GameProvider.prototype.newGame = function(){

  var gameId;
  while(!gameId || this.games[gameId]){  //loop while no gameId or if gameId is in use
    //generate random game id
    gameId = Math.floor(Math.random()*16777215).toString(16); //generates random hexadecimal up to 6 digits
  }  

  //create game
  var game = new Game(gameId);
  //save game
  this.games[gameId] = game;
  return game
}

//get game with specified gameId
GameProvider.prototype.getGame = function(gameId){
  return this.games[gameId];
}

//delete game with specified gameId
GameProvider.prototype.deleteGame = function(gameId){
  delete this.games[gameId];
}

module.exports = GameProvider;