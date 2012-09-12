var page = require('webpage').create();
var system = require('system');

var replay = system.args[1];

if (!replay) {
  console.log('Please provide a name of a replay to run');
  phantom.exit();
}


page.onConsoleMessage = function (msg) { console.log(msg); };
// there must be a better way to do this?
page.onAlert = function(msg) {
  console.log('Replay finished. Goodnight and good luck.');
  msg === 'replayer-is-finished' && phantom.exit();
}

page.open('http://localhost:3000', function(status) {
  var result = page.evaluate(function(replay) {
    Meteor.deps.await_once(function() { return Recorder.ready(); }, function() {
      Recorder.replay(replay, function(err) {
        err & console.log(err);
        alert('replayer-is-finished');
      });
    });
  }, replay);
});