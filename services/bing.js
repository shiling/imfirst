var https = require('https');
var baseUrl = "https://user:tnkWKw0MRttBe+cF5ohQEeoYUtNvLV1omI0ZyGWU3qM@api.datamarket.azure.com/Bing/Search/v1/Image?$format=JSON"

//sends request to bing for get images
exports.search = function(query, callback){
    //var path = basePath.concat("&Query=" + escape("'" + query + "'"));
    var url = baseUrl.concat("&Query=" + escape("'" + query + "'"));
    console.log("searching bing:" + url);

    //make request
    https.get(url, function(res) {
        console.log("response: " + res.statusCode);
        var data = "";
        res.on('data',function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            callback(JSON.parse(data));
        });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

}

//extract thumnbnail urls from a bing result
exports.getThumbnailUrls = function(bingResult){
    var results = bingResult["d"]["results"];
    var urls = [];
    for(index in results){
        var thumbnailUrl = results[index]["Thumbnail"]["MediaUrl"];
        urls.push(thumbnailUrl);
    }
    return urls;
}