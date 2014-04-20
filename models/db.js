var debug = false;

//mongodb
var mongoClient = require('mongodb').MongoClient;

//providers
var ThemeProvider = require('./ThemeProvider.js');
var ImageProvider = require('./ImageProvider.js');

//db variables
//var dbUrl = "mongodb://localhost:27017/first";
var dbUrl = "mongodb://nodejitsu:ae581d34b926f1ac7c6683e53903d14a@alex.mongohq.com:10033/nodejitsudb5932145228";

//connect to db
mongoClient.connect(dbUrl, function(err, db){
    if(err) {console.warn(err.message); throw err;}

    //successfully connected
    if(debug){
        //drop database if debugging
        db.dropDatabase(function(err, done){
            if(err) {console.warn(err.message); throw err;}
            //successfully dropped database
            initCollections(db);
        });
    }else{
        initCollections(db);
    }

});

function initCollections(db){
    //theme collection
    db.createCollection('themes', function(err, collection){
        if(err){console.warn(err.message);}
        //create the provider and export it
        exports.themeProvider = new ThemeProvider(collection);
    });

    //image collection
    db.createCollection('images', function(err, collection){
        if(err){console.warn(err.message);}
        //create the provider and export it
        exports.imageProvider = new ImageProvider(collection);
    });
    
}