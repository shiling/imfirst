var http = require('http'),
    express = require('express'),
    pm = require('./models/ProviderManager.js');

//APP
var app = express();
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.static('site/public'));
    app.use(app.router);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
});

//ROUTES - ADMIN
app.use('/admin', express.static('site/admin'));
//require authentication to access ADMIN
var adminAuth = express.basicAuth('admin', 'omnomnomnom');
app.all('/admin/*', adminAuth);  

//SOCKET IO
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//ROUTES - GAME
var gameRoute = require('./routes/GameRoute.js');
gameRoute.init(pm, io);
app.put('/game', gameRoute.createGame);
app.get('/game/:gameId', gameRoute.getGame);
app.put('/game/:gameId/player/:nickname', gameRoute.addPlayer);

//ROUTES - THEMES AND IMAGES
var themeRoute = require('./routes/ThemeRoute.js');
themeRoute.init(pm);
app.put('/theme/:keyword1/:keyword2', themeRoute.addTheme);
app.delete('/theme/:keyword1/:keyword2', themeRoute.deleteTheme);
app.get('/theme/:keyword/suggestions', themeRoute.getSuggestions);
app.put('/image/:keyword', themeRoute.addImages);
app.get('/image/:keyword', themeRoute.getImages);

//
server.listen(3000,function(){
    console.log('Listening on port 3000');
});