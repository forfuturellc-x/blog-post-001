var cp = require("child_process");
var fs = require("fs");
var should = require("should");

// start the server
var serverProcess = cp.spawn("node", ["server.js"]);


serverProcess.stdout.on("data", function(data) {
    should(data.toString()).containEql("started");
    console.log("[OK] server started");

    var result = cp.execSync("node client.js", { encoding: "utf8" });
    console.log("[OK] client executed");

    should(result).eql(fs.readFileSync("test/expected-output.txt", { encoding: "utf8" }));
    console.log("[OK] expected output confirmed");

    serverProcess.kill();
});


process.on("error", function(err) {
    console.error("[ERROR] error bubbled to process: %s", err);
    console.error(err);
    serverProcess.kill('SIGKILL');
});
