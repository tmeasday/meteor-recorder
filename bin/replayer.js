var page = require('webpage').create();
var system = require('system');

var replay = system.args[1];

if (!replay) {
  console.log('Please provide a name of a replay to run');
  Phantom.exit();
}


page.onConsoleMessage = function (msg) { console.log(msg); };

page.open('http://localhost:3000', function(status) {
  var result = page.evaluate(function(replay) {
    Meteor.deps.await_once(function() { return Recorder.ready(); }, function() {
      Recorder.replay(replay, function(err) {
        console.log(err);
        console.log('done');
      });
    });
  }, replay);
  // Phantom.exit();
});