var Player = require('./Player.js');

var GameStatus = {
  WAITING_FOR_PLAYERS: 0,
  ROUND_LOAD: 1,
  ROUND_CHANGE_THEME: 2,
  ROUND_INPROGRESS: 3,
  ROUND_SCORING: 4
}

function Game(gameId){
  this.gameId = gameId;
  this.players = {};
  this.host = "";
  this.status = GameStatus.WAITING_FOR_PLAYERS;
  this.theme = {
    "subject": "panda",
    "background": "dairy cow"
  };
  this.images = {
    "subject": [],
    "background": []
  };
  this.question = [];  //subset of images choosen for the round
  this.numReady = 0;
}

//get get the Game ID
Game.prototype.getGameId = function(){
  return this.gameId
}

//add a player
Game.prototype.addPlayer = function(nickname){
  var err;
  if(!this.players[nickname]){ //nickname is not already taken
    this.players[nickname] = new Player(nickname);
    //set first player to join as host
    if(this.numPlayers()==1){
      this.setHost(nickname);
    }
  }else{
    err = "Nickname taken." 
  }
  return err; 
}

//remove a player
Game.prototype.removePlayer = function(nickname){
  delete this.players[nickname];
  if(this.numPlayers()!==0){  
    if(this.host === nickname){ //if host left, change host
      this.setHost(Object.keys(this.players)[0]);
    }
  }
}

//get all players
Game.prototype.getPlayers = function(){
  return this.players;
}

//get a player
Game.prototype.getPlayer = function(nickname){
  return this.players[nickname];
}

//get players sorted by score from highest to lowest
Game.prototype.getPlayersByScore = function(){
  var players = [];
  for(var nickname in this.players){
    var player = this.players[nickname];
    if(players.length===0){ //first player to add
      players.push(player);
    }else{
      //insert player into players according to score
      for(var i in players){ 
        //has a score bigger than another player that has been added, insert before the other player
        if(player["score"]>players[i]["score"]){
          players.splice(i, 0, player);
          break;
        }
        players.push(player); //smaller score than all the players added so far
      }
    }
  }
  return players;
}

//get the number of players
Game.prototype.numPlayers = function(){
  return Object.keys(this.players).length;
}

//set the host of the game
Game.prototype.setHost = function(nickname){
  this.host = nickname;
}

//get the nickname of the host of the game
Game.prototype.getHost = function(){
  return this.host;
}

//set the status of the game
Game.prototype.setStatus = function(status){
  this.status = status;
}

//get the status of the game
Game.prototype.getStatus = function(){
  return this.status;
}

//set the theme of the game
Game.prototype.setTheme = function(subject, background){
  this.theme = {
    "subject": subject,
    "background": background
  };
}

//get the theme of the game
Game.prototype.getTheme = function(){
  return this.theme;
}

//set the images for the subject or background theme (indicated by key)
Game.prototype.setImages = function(key, imageUrls){
  this.images[key] = imageUrls;
}

//get the images for the subject or background theme (indicated by key)
Game.prototype.getImages = function(key){
  return this.images[key];
}

//get a random image from the subject or background theme (indicated by key)
Game.prototype.getRandomImage = function(key){
  var i = Math.round(Math.random()*(this.images[key].length-1));
  return this.images[key][i];
}

//set the question images for the game
Game.prototype.shuffle = function(){
  var pos = Math.round(Math.random()*17); //position of subject image (answer)
  var q = [];
  for (var i=0; i<18; i++){ //select 18 images for the round
    if(i===pos){  //insert 1 subject image
      q.push(this.getRandomImage("subject"));
    }else{  //insert background images for the rest
      q.push(this.getRandomImage("background"));
    }
  }
  this.question = q;

}

//check if a url is in the subject or background (indicated by key) images
Game.prototype.isInImages = function(key, url){
  return this.images[key].indexOf(url) !== -1
}

//check if a url is the answer to the current question
Game.prototype.isAnswer = function(url){
  for(i in this.question){  //find which picture in question is answer
    if(this.isInImages("subject", this.question[i])){ //found answer
      return this.question[i] === url;  //test if url is answer
    }
  }
}

//increment the numReady counter
Game.prototype.incrementNumReady = function(){
  this.numReady += 1;
}

//reset the numReady counter to 0
Game.prototype.resetNumReady = function(){
  this.numReady = 0;
}

//get the numReady counter
Game.prototype.getNumReady = function(){
  return this.numReady;
}

//export the game class
module.exports = Game;