//GAME VARIABLES
var gameId, myNickname, socket, numImages, numImagesLoaded;

function setGameId(_gameId){
  gameId = _gameId;
}

function setNickname(nickname){
  myNickname = nickname;
  $.ajax({
    type: "PUT",
    url: "/game/" + gameId + "/player/" + myNickname,
    success: function(err){
      if(err){
        //nickname taken, do something
      }else{
        //join game
        joinGame();
      }
    }
  });
}

function joinGame(){
  socket = io.connect('/'); //connect
  socket.emit('join',{"gameId": gameId, "nickname": myNickname}); //join game

  //when players join the game
  socket.on('players', function(game){listPlayers(game);});

  //when player leave the game
  socket.on('playerLeft', function(data){playerLeft(data.player, data.game);});

  //new round, show round informaiton and load round data
  socket.on('loadRound', function(game){loadRound(game);});

  //theme is being changed, wait
  socket.on('waitForTheme', function(game){waitForTheme(game);})

  //counting down
  socket.on('countdown', function(time){countdown(time)});

  //end of the round, show scores and load next round
  socket.on('endRound', function(data){endRound(data.winner, data.players);});
}

function listPlayers(game){
  if(game.status === 0){  //0 = WAITING_FOR_PLAYERS
    //update list of players
    $("#players").empty();
    $.each(game.players, function(nickname, player){
      $("#players").append($("<li>").text(nickname.concat(nickname===game.host?" (Host)":"")).addClass("list-group-item"));
    });
    //show controls for host/non-host players
    if(myNickname===game.host){
      //prevent start game if less than 2 players
      if(Object.keys(game.players).length<2){
        $("#btn-startGame").attr('disabled',true);
      }else{
        $("#btn-startGame").attr('disabled',false);
      }
      toggleHost();
    }else{
      toggleNonHost();
    }
    //show modal-players
    $("#modal-nickname").modal("hide");
    $("#modal-players").modal("show");
  }
}

function playerLeft(player, game){
  if(game.status===0){
    listPlayers(game);
  }else{
    $("#playerLeft").text(player);
    var numPlayers = Object.keys(game.players).length;
    if(numPlayers<2){
      $("#lastPlayer").show();
    }else{
      setTimeout(function(){
        $("#modal-playerLeft").modal("hide");
      },3000);
    }
    $("#modal-playerLeft").modal("show");
  }
}

function startGame(){
  if(socket){
    socket.emit('startGame', {});
  }  
}

function loadRound(game){
  //display round information
  $(".subject").text(game.theme.subject);
  $(".background").text(game.theme.background);
  $(".modal").modal("hide");
  $("#modal-round").modal("show");
  $("#progress-imagesLoaded").css("width", "0%");
  $("#progress-text").text("Loading...");
  $("#loading").show();
  $("#loaded").hide();

  //clear and hide images
  var board = $("#board");
  board.empty();
  board.hide();

  //load round images
  numImages = game.question.length;
  numImagesLoaded = 0;
  for(var i in game.question){
    var baseUrl = game.question[i];
    var url = baseUrl + "&w=195&h=195&c=7&rs=1";
    var img = $("<img>")
      .addClass("img-thumbnail").addClass("img-responsive")
      .attr("src",url)
      .on('load',function(){
        imageLoaded();
      });
    var tile = $("<a>")
      .addClass("col-md-2").addClass("col-xs-4")
      .attr("href","#")
      .append(img)
      .data("baseUrl", baseUrl)
      .on('click', function(){
        answer($(this).data("baseUrl"));
      });
    board.append(tile);
  }

}

function changingTheme(){
  //update all players
  if(socket){
    socket.emit('changingTheme', {});
  }
  //switch to update theme screen
  $(".modal").modal("hide");
  $("#modal-changingTheme").modal("show");

}

function waitForTheme(game){
  $("#playerChangingTheme").text(game.host);
  $(".modal").modal("hide");
  $("#modal-waitForTheme").modal("show");
}

function changeTheme(subject, background){
  if(socket){
    socket.emit('changeTheme', {"subject": subject, "background": background});
  }
}

function imageLoaded(){  
  numImagesLoaded += 1;
  //update progress bar
  $("#progress-imagesLoaded").css("width", 100.0 * numImagesLoaded/numImages + "%");
  //finish loading
  if(numImagesLoaded===numImages){
    //
    $("#progress-text").text("Waiting for other players...");
    //tell server player is ready
    socket.emit('ready',{});
  }
}

function countdown(time){
  if(Number(time)>0){
    $("#loading").hide();
    $("#countdown").text(time);
    $("#loaded").show(); 
  }else{
    $("#modal-round").modal("hide");
    $("#board").show();
  }
}

function answer(url){
  //check with server if the answer is correct
  socket.emit('answer', url);
}

function endRound(winner, players){
  //display scores
  $("#round-winner").text(winner);
  $("#scores").empty();
  for(var i in players){
    var player = players[i];
    var p = $("<p>")
      .text(player["nickname"] + " ")
      .append($("<span>")
        .text(player["score"])
        .addClass("badge")
        );
    $("#scores").append(p);
  }
  $("#modal-scores").modal("show");
}

function toggleHost(){
  $(".host-player").show();
  $(".non-host-player").hide();
}

function toggleNonHost(){
  $(".host-player").hide();
  $(".non-host-player").show();
}

//PAGE READY
$(function(){

  //populate nickname field if nickname is in cookie
  if($.cookie('nickname')){
    $(this).find("[name=nickname]").val($.cookie('nickname'));
  }

  //DOM EVENT HANDLERS
  $("#modal-nickname").modal("show");
  $("#form-nickname").submit(function(e){
    var nickname = $(this).find("[name=nickname]").val();
    setNickname(nickname);
    e.preventDefault();
  });
  $("#btn-startGame").click(function(e){startGame();});
  $("#btn-changeTheme").click(function(e){changingTheme();});
  $("#form-changeTheme").submit(function(e){
    var subject = $(this).find("[name=subject]").val();
    var background = $(this).find("[name=background]").val();
    changeTheme(subject, background);
    e.preventDefault();
  });
});