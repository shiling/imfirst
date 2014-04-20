var Game = require('../models/Game.js');
var Tense = require('tense');
var tense = new Tense();
var bing = require('../services/bing.js');

//VARIABLES USED BY ROUTE HANDLERS
var pm;

//INITIALISE ROUTE
exports.init = function(providerManager, io){
    pm = providerManager;
    initSockets(io);
}

//INITIALISE SOCKETS - mainly gameplay events
function initSockets(io){

    io.sockets.on('connection', function(socket){

        //variables to identify the player for the socket
        var game, nickname;

        //a new player joins
        //set game and nickname variables for future access
        //and add player to the socket room for the game
        //and update everyone in the room of the new player
        socket.on('join', function(data){
            var gameId = data.gameId;
            game = pm.gameProvider().getGame(gameId);
            nickname = data.nickname;
            if(game && game.getStatus() === 0){   //allow to join only when game is in waiting for players status
                socket.join(gameId);
                io.sockets.in(gameId).emit("players", game);
            }
        });

        //start the game
        //get the images for the subject and background themes
        //and then load round
        socket.on('startGame', function(data){
            if(nickname===game.host){   //allow only if request is sent from host
                //get images for the theme
                getImages(game.theme.subject, function(urls){
                    game.setImages("subject", urls);
                    getImages(game.theme.background, function(urls){
                        game.setImages("background", urls);
                        //load round
                        loadRound();
                    });
                });
            }
        });

        //notify all players that theme is being changed
        socket.on('changingTheme', function(data){
            if(game.getStatus()===1){   //allow only when game is loading status
                //set status to 2 and host to player who wants to change theme
                game.setStatus(2);
                game.setHost(nickname);
                //notfiy other players
                socket.broadcast.to(game.getGameId()).emit('waitForTheme', game); 
            }
        });

        //theme is changed
        //update theme of the game
        //save theme to db
        //get images for the theme and load round
        socket.on('changeTheme', function(data){
            if(game.getStatus()===2 && nickname===game.host){   //allow only when game is in change theme status and request is from host
                //set theme of the game
                //get keywords from data and singularize them
                var subject = tense.singularize(data.subject);  
                var background = tense.singularize(data.background);
                game.setTheme(subject, background);
                
                //save theme to db
                try{
                    pm.themeProvider().add(subject, background);
                }catch(e){
                    console.warn(e);
                }

                //get images for the theme
                getImages(game.theme.subject, function(urls){
                    game.setImages("subject", urls);
                    getImages(game.theme.background, function(urls){
                        game.setImages("background", urls);

                        //load round
                        loadRound();
                    });
                });
            }
        });

        //make sure all players are ready and then start count down
        socket.on('ready', function(){
            game.incrementNumReady();
            if(game.getNumReady() === game.numPlayers()){//all players are ready, start countdown
                countdown(3);
            }    
        });

        function countdown(time){
            if(game.getStatus()===1){   //make sure that game is in loading status
                setTimeout(function(){
                    io.sockets.in(game.getGameId()).emit("countdown", time);
                    if(time>0){
                        countdown(time-1)
                    }else{
                        game.setStatus(3);  //change status to ROUND_INPROGRESS
                    }
                },1000)
            }
        }

        //check if answer is correct
        socket.on('answer', function(url){
            if(game.getStatus()===3 && game.isAnswer(url)){ //is correct answer, allow only if round is in progress
                //change status to ROUND_SCORING
                game.setStatus(4);

                //increment player's score
                game.getPlayer(nickname).incrementScore();

                //notify end of round
                io.sockets.in(game.getGameId()).emit("endRound", {"winner": nickname,"players": game.getPlayersByScore()});

                //wait a while, then load next round
                setTimeout(function(){
                    loadRound();
                }, 3000);
            }
        })

        //player leaves, remove player from game and notify all players
        //if last player left, delete game
        socket.on('disconnect', function(){
            if(game){
                //remove player and update everyone in room
                game.removePlayer(nickname);

                //else, update all players
                io.sockets.in(game.getGameId()).emit("playerLeft", {"player": nickname, "game": game});
                
                //if all players left, delete the game
                if(game.numPlayers() === 0){
                    pm.gameProvider().deleteGame(game.getGameId());
                }
            }
        }); 

        //get images for the theme
        function getImages(keyword, onComplete){

            pm.imageProvider().get(keyword, function(err, doc){
                //if no results, get from bing
                if(!doc){
                    bing.search(keyword, function(data){
                        //save data to db
                        pm.imageProvider().add(keyword, data);

                        //set images in game
                        var urls = bing.getThumbnailUrls(data);
                        onComplete(urls);
                    });
                }else{
                    //set images in game
                    var urls = bing.getThumbnailUrls(doc["bingResult"]);
                    onComplete(urls);
                }
            });
        }

        //load a round
        //shuffle the images for the round and reset numReady
        function loadRound(){
            //shuffle images to use for the round
            game.shuffle();

            //change status of game
            game.setStatus(1);  //1 = round loading

            //reset numReady
            game.resetNumReady();

            //nofify all players
            io.sockets.in(game.getGameId()).emit("loadRound", game);

        }

    });

}

//ROUTE HANDLERS

//app.put('/game', gameRoute.createGame);
exports.createGame = function(req,res){
    var game = pm.gameProvider().newGame();
    res.send(game.getGameId());
};

//app.get('/game/:gameId', gameRoute.getGame);
exports.getGame = function(req,res){
    var gameId = req.params.gameId;
    var game = pm.gameProvider().getGame(gameId);
    if(game){
        if(game.getStatus()===0){   //allow access only if game is WAITING_FOR_PLAYERS state
            res.render('game',{
                "gameId": gameId
            });
        }
        else{   //game is closed
            res.render('gameNotAvailable',{"error": "Game " + gameId + " is not accepting new players."});
            res.send();
        }
    }else{  //game not found
        res.status(404);
        res.render('gameNotAvailable',{"error": "Game " + gameId + " is not found."});
        res.send();
    }
};

//app.put('/game/:gameId/player/:nickname', gameRoute.addPlayer);
exports.addPlayer = function(req,res){
    var gameId = req.params.gameId;
    var nickname = req.params.nickname;
    var game = pm.gameProvider().getGame(gameId);   //get game
    var err = game.addPlayer(nickname); //add player to game
    res.cookie('nickname', nickname, {httpOnly: false}); //remember nickname for future game
    res.send(err);
};
