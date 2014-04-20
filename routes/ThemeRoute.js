var bing = require('../services/bing.js');
var pm;

exports.init = function(providerManager){
  pm = providerManager;
}

//ROUTE HANDLERS
//app.put('/theme/:keyword1/:keyword2', themeRoute.addTheme);
exports.addTheme = function(req,res){
  var keyword1 = req.params.keyword1;
  var keyword2 = req.params.keyword2;
  pm.themeProvider().add(keyword1,keyword2);
  res.send();   
};

//app.delete('/theme/:keyword1/:keyword2', themeRoute.deleteTheme);
exports.deleteTheme = function(req,res){
    var keyword1 = req.params.keyword1;
    var keyword2 = req.params.keyword2;
    pm.themeProvider().delete(keyword1, keyword2, function(numberOfRemovedDocuments){
        res.send();
    });
};

//app.get('/theme/:keyword/suggestions', themeRoute.getSuggestions);
exports.getSuggestions = function(req,res){
    var keyword = req.params.keyword;
    pm.themeProvider().matchOne(keyword, function(results){
        res.send(results);
    });
};

//app.put('/image/:keyword', themeRoute.addImages);
exports.addImages = function(req,res){
    var keyword = req.params.keyword;
    var results = JSON.parse(req.body.results);
    pm.imageProvider().add(keyword, results);
    res.send();
};

//app.get('/image/:keyword', themeRoute.getImages);
exports.getImages = function(req,res){
    var keyword = req.params.keyword;
    pm.imageProvider().get(keyword, function(doc){
        var urls = [];
        if(doc){
            urls = bing.getThumbnailUrls(doc["bingResult"]);
        }
        res.send(urls);
    });
};