//db
var db = require('./db.js');

//in-memory providers
var GameProvider = require('./GameProvider.js');
var gameProvider = new GameProvider();


exports.themeProvider = function(){
  return db.themeProvider;
}
exports.imageProvider = function(){
  return db.imageProvider;
}
exports.gameProvider = function(){
  return gameProvider;
};

