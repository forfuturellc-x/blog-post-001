var request = require('request').defaults({ json: true });

// A multiplexer is exported by default. It basically manages your
// potholes for you i.e. you do not have to create and start them
// manually. A pothole is created on demand.
var pothole = require('pothole');

// Our burst involves this number of requests. Consider this
// is an app start and we want to populate a database using
// a third-party API.
var burst = 27;

var requestsDone = 0;


// We add a new `pothole` for the API labelled `my-api`, passing
// the definition of our window.
pothole.add('my-api', {
    window: {
        size: 10,
        length: 30 * 1000,
    },
});


// We reset the limit/counter in the server. This is
// plainly for demonstration purposes. We do not really care
// if it succeeds or fails.
request.get("http://localhost:9080/reset", function() {});


for (var i = 0; i < burst; i++) {
    // Enqueue a request. Consider if these requests were invoked
    // from different components of your application. Pothole
    // affords you a loose but effective coordination of
    // usage of the API.
    pothole.enqueue("my-api", function() {
        request.get("http://localhost:9080", function(err, res) {
            requestsDone++;
            if (err) {
                console.log("ERROR occurred: %s", err);
                console.error(err);
                process.exit(1);
            }
            console.log('[%d] server response: remaining=%d', requestsDone, res.body.data.remaining);

            // You need to stop your `pothole` so that the event loop
            // can exit cleanly. Why? A `pothole` uses a timer
            // internally.
            if (requestsDone == burst) pothole.stop("my-api");
        });
    });
}
