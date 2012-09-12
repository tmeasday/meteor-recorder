Meteor Recorder
===============

This is a work in progress, feel free to give it a go!

Install
-------

```bash
mrt add recorder
```

Usage
-----

To record, start the `Recorder` with the collections that you are interested in:

```js
Recorder.start(Paths, Points);
```

To stop, either `Recorder.cancel()`, or call
```js
Recorder.save('my_recording')
```

When you want to re-run your recording, simply call
```js
Recorder.replay('my_recording');
```

And the same set of changes should happen to the collections recorded.

Alternatively, you can run your recording from the commandline, for exampletake a look at `bin/replayer.js`:

```bash
$ bin/replayer.js my_recording
```

Have a nice day.

Tips and Tricks
---------------

You'll need to either pass the collections in that the replay operates on:
```js
Recorder.replay('name', Paths, Points);
```

Or you'll have to make sure that the record can find your collections. For now that means you'll need to name them "correctly":
```js
Paths = new Meteor.Collection('paths');
```

Ensure the recorder has write access to the `Recordings` collection. ie. if you are on `auth`, do something like:

```js
Recordings.allow({
  insert: function() { return true; }
})
```

TODO
----
Find somewhere to store collections