function Player(nickname){
  this.nickname = nickname;
  this.score = 0;
}
Player.prototype.getNickname = function(){
  return this.nickname;
}
Player.prototype.setNickname = function(nickname){
  this.nickname = nickname;
}
Player.prototype.getScore = function(){
  return this.score;
}
Player.prototype.incrementScore = function(){
  this.score += 1;
}

module.exports = Player;