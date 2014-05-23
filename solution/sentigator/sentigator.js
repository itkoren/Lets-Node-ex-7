// Include The 'sys' Module
var sys = require("sys");

// Include The 'domain' Module
var domain = require("domain");

// Create a new domain execution context
var dmn = domain.create();

// Create a listener/handler for the domains errors
dmn.on("error", function(err) {
    console.error(err);
});

// Execute our logic inside the created domain
dmn.run(function() {

    // Include The 'http' Module
    var http = require("http");

    // Include The 'url' Module
    var url = require("url");

    // Include The 'request' Module
    var request = require("request");

    // Include The 'async' Module
    var async = require("async");

    // Include The 'JSONStream' Module
    var jsonStream = require("JSONStream");

    // Include The 'event-stream' Module
    var eventStream = require("event-stream");

    // Include The 'parser' Module
    var parser = require("./lib/parser");

    // Create the HTTP Server
    var server = http.createServer(function (req, res) {
        // Handle HTTP Request
        // Parse the request querystring
        var parsedUrl = url.parse(req.url, true);
        var qs = parsedUrl.query;

        // Validating existence of query param
        if (qs.term) {
            async.auto({
                    twitxy: function (callback) {
                        var tweets = [];
                        request("http://twitxy.itkoren.com/?lang=en&count=5&term=" + encodeURIComponent(qs.term))
                            .pipe(jsonStream.parse("statuses.*"))
                            .pipe(eventStream.mapSync(function (data) {
                                parser({
                                    src: "Twitter",
                                    text: data.text,
                                    score: 0
                                }, tweets);
                            })).on("error", function (e) {
                                // Deal with errors
                                console.error("Got \"twitxy\" error: " + e.message);
                            }).on("end", function () {
                                console.log("End Of Twitter Search Stream");
                                callback(null, { items: tweets });
                            });
                    },
                    google: function (callback) {
                        var searches = [];
                        var hasUTube = false;
                        request("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&language=en&resultSize=5&q=" + encodeURIComponent(qs.term))
                            .pipe(jsonStream.parse("responseData.results.*"))
                            .pipe(eventStream.mapSync(function (data) {
                                parser({
                                    src: "Google",
                                    text: data.title,
                                    score: 0
                                }, searches);

                                // Check if in utube
                                if (!hasUTube && -1 !== data.unescapedUrl.indexOf("utube.com")) {
                                    hasUTube = true;
                                }
                            })).on("error", function (e) {
                                // Deal with errors
                                console.error("Got \"Google\" error: " + e.message);
                            }).on("end", function () {
                                console.log("End Of Google Search Stream");
                                callback(null, { items: searches, hasUTube: hasUTube });
                            });
                    },
                    utube: ["google", function (callback, results) {
                        var tubes = [];

                        if (results.google.hasUTube) {
                            callback(null, tubes);
                        }
                        else {
                            request("https://gdata.youtube.com/feeds/api/videos?max-results=5&alt=json&orderby=published&v=2&q=" + encodeURIComponent(qs.term))
                                .pipe(jsonStream.parse("feed.entry.*"))
                                .pipe(eventStream.mapSync(function (data) {
                                    parser({
                                        src: "UTube",
                                        text: data.title.$t,
                                        score: 0
                                    }, tubes);
                                })).on("error", function (e) {
                                    // Deal with errors
                                    console.error("Got \"UTube\" error: " + e.message);
                                }).on("end", function () {
                                    console.log("End Of Utube Search Stream");
                                    callback(null, { items: tubes });
                                });
                        }
                    }]
                },
                // optional callback
                function (err, results) {
                    // the results array will equal ['one','two'] even though
                    // the second function had a shorter timeout.
                    if (err) {
                        // Deal with errors
                        console.log("Got error: " + err.message);
                        res.writeHead(500);
                        res.end("** Only Bear Here :) **");
                    }
                    else {
                        var items = results.twitxy.items.concat(results.google.items, results.utube.items);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(items));
                    }
                });
        }
        else {
            // No search term supplied, just return
            console.log("Search failed!");
            console.log("Query parameters are missing");
            res.writeHead(500);
            res.end("** Only Bear Here :) **");
        }
    }).listen(process.env.PORT || 8000, process.env.HOST || "0.0.0.0", function () {
        console.log("HTTP Server Started. Listening on " + server.address().address + " : Port " + server.address().port);
    });
});

process.on("uncaughtException", function (err) {
    console.error((new Date()).toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);

    sys.puts("Caught exception: " + err);
    process.exit(1);
});