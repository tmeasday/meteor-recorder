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
Recorder.save('name')
```

When you want to re-run your recording, simply call
```js
Recorder.replay('name', Paths, Points);
```

And the same set of changes should happen to the collections recorded.

Have a nice day.

Tips and Tricks
---------------

Ensure the recorder has write access to the `Recordings` collection. ie. if you are on `auth`, do something like:

```js
Recordings.allow({
  insert: function() { return true; }
})
```