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

    // Include The 'express' Module
    var express = require("express");

    // Include The 'content' Module
    var content = require("./routes/content");

    var app = express();

    // Set All Environments Application Settings
    app.set("port", process.env.PORT || 8000);
    app.set("ip", process.env.IP || "0.0.0.0");

    app.use("/content", content);

    // Create the HTTP Server
    var server = http.createServer(app).listen(app.get("port"), app.get("ip"), function () {
        console.log("Express Server Started. Listening on " + server.address().address + " : Port " + server.address().port);
    });
});

process.on("uncaughtException", function (err) {
    console.error((new Date()).toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);

    sys.puts("Caught exception: " + err);
    process.exit(1);
});