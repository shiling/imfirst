//Construtor
function ThemeProvider(collection){
    this.collection = collection;
}

//Create and Update methods
ThemeProvider.prototype.add = function(keyword1, keyword2){
    var self = this;    //make into explicit variable, as variable this changes depending on the scope
    self.matchBoth(keyword1,keyword2, function(results){
        var theme;
        if(results.length===0){
            //if new theme, add it with weight = 1
            theme = {
                "keyword1": keyword1,
                "keyword2": keyword2,
                "weight": 1
            };
            self.collection.insert(theme, function(err,docs){
                //do something?

            });
        }else{
            //if theme already exists, increase weight by 1
            theme = results[0];
            theme["weight"]++;
            self.collection.save(theme, function(err, item){
                //do something?

            });
        }

    });
    
}

//Read methods
ThemeProvider.prototype.matchBoth = function(keyword1, keyword2, callback){
    var self = this;    //make into explicit variable, as variable this changes depending on the scope
    self.collection
        .find({
            $or: [
                {"keyword1": keyword1, "keyword2": keyword2},
                {"keyword1": keyword2, "keyword2": keyword1}
            ]
        })
        .limit(1)
        .toArray(function(err,docs){
            callback(docs);
        });
}

ThemeProvider.prototype.matchOne = function(keyword, callback){
    var self = this;    //make into explicit variable, as variable this changes depending on the scope
    self.collection
        .find({
            $or: [
                {"keyword1": keyword},
                {"keyword2": keyword}
            ]
        })
        .sort({
            "weight": -1   //descending
        })
        .limit(10)
        .toArray(function(err,docs){
            callback(docs);
        });
}

//Delete methods
ThemeProvider.prototype.delete = function(keyword1, keyword2, callback){
    var self = this;    //make into explicit variable, as variable this changes depending on the scope
    self.collection
        .remove({
                $or: [
                    {"keyword1": keyword1, "keyword2": keyword2},
                    {"keyword1": keyword2, "keyword2": keyword1}
                ]
            }, 
            function(err, numberOfRemovedDocs){
                callback(numberOfRemovedDocs);
            }
        );
}

//export
module.exports = ThemeProvider;