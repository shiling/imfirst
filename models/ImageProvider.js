//constructor
function ImageProvider(collection){
  this.collection = collection;
}

//
ImageProvider.prototype.add = function(keyword, bingResult){
  var self = this;
  self.collection.count({
      "keyword": keyword
    }, 
    function(err, count){
      if(err){
        console.warn(err.message);
      }
      if(count === 0){  //only add if keyword is new
        self.collection.insert({
            "keyword": keyword,
            "bingResult": bingResult  
          },function(err, item){
              //do something?
        }); 
      }
  });

}

//
ImageProvider.prototype.get = function(keyword, callback){
  var self = this;
  self.collection
    .find({
      "keyword": keyword
    })
    .limit(1)
    .toArray(function(err,docs){
      callback(docs[0]);
    });
}

//export
module.exports = ImageProvider;