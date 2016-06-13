var http = require('http');
var express = require('express');

var app = express();
var server = http.Server(app);

var windowSize = 10;            // The number of requests in a window.
var windowLength = 30 * 1000;   // The time length of a window.
var remaining = windowSize;     // A counter used to implement our rate-limiting


// This endpoint allows us to reset the counter just before
// running the client. Otherwise, we would hit the limit if we
// ran the client multiple, successive times. We hit this
// endpoint just before running the actual demo.
app.get('/reset', function(req, res) {
    remaining = windowSize;
    return res.json({ message: "reset" });
});


// This endpoint basically decrements the counter on each request,
// if allowed, or returns an error to the client if the limit
// is exceeded.
app.get('/', function(req, res) {
    if (remaining <= 0) {
        return res.status(503).json({
            error: { message: "limit exceeded" },
        });
    }
    remaining--;
    return res.json({
        data: {
            remaining: remaining,
        },
    });
});


server.listen(9080, function() {
    console.log('server started');

    // This interval resets the counter from one window to
    // the next.
    setInterval(function() {
        remaining = windowSize;
    }, windowLength);
});
