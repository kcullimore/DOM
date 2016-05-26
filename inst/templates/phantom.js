// Do NOT have empty line at start of template, or whisker::whisker.render()
// will just return "" (!)
initSocket = function(ws) {
    ws.onopen = function() {
        log("Connection opened");
    }
    ws.onerror = function(evt) { 
        msg = "An error occurred with the WebSocket. " +
            "Has the R server been started?";
        log(msg);
    };
    ws.onclose = function(evt) {
        log("Connection closed");
    }
    ws.onmessage = function(evt) {
        var msgJSON = JSON.parse(evt.data);
        if (msgJSON.fun[0] === "DIE") {
            phantom.exit();
        } else {
            page.evaluate(handleMessage, evt);
        }
    }
}
// Must load page from R server before trying to create websocket
// (otherwise violate the "Same Origin Policy")
var page = require('webpage').create();
page.onConsoleMessage = function(msg) {
    console.log(msg);
}
var fs = require('fs');
// NOTE that phantomjs wants 127.0.0.1 not 'localhost'
// ALSO phantomjs (2) wants http: protocol explicit 
// (otherwise it appears to assume file: protocol)
page.open("{{{url}}}", 
          function(status) {
              if (status === "success") {
                  log("opening socket")
                  ws = new WebSocket("ws://127.0.0.1:{{{port}}}");
                  log("socket: " + ws.toString());
                  initSocket(ws);
                  log("socket initialised");
              } else {
                  log("Failed to load page");
              }
          });