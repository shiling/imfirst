$(function(){
  $("#btn-newGame").click(function(){
      $.ajax({
          type: "PUT",
          url: "/game",
          success: function(gameId){
            window.location = '/game/' + gameId;
          }
      });
  });
  $("#form-joinGame").submit(function(e){
      var gameId = $(this).find("[name=gameId]").val();
      window.location = '/game/' + gameId;
      e.preventDefault();
  });
});