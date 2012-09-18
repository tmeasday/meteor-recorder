var Recordings = new Meteor.Collection('recordings');

if (Meteor.is_server) {
  Meteor.publish('recordings', function() {
    return Recordings.find();
  });
}

if (Meteor.is_client) {
  Recorder = {};
  Meteor.deps.add_reactive_variable(Recorder, 'ready', false);
  Meteor.deps.add_reactive_variable(Recorder, 'recording', false);
  
  Meteor.subscribe('recordings', function() {
    Recorder.ready.set(true);
  });
  
  _.extend(Recorder, {
    start: function(/* collectionVariableNames */) {
      var startTime = new Date();
      Recorder.currentRecording = []
      Recorder.handles = [];
      Recorder.recording.set(true);
      
      _.each(arguments, function(collectionVarName) {
        function addRecord(record) {
          record.collection = collectionVarName;
          record.timeOffset = new Date() - startTime;
          
          if ('_meteorRawData' in record.doc)
            record.doc = record.doc._meteorRawData();
          
          Recorder.currentRecording.push(record);
        }
        
        // FIXME -- is there any alternate way to find the collection?
        var handle = window[collectionVarName].find().observe({
          _suppress_initial: true,
          'added': function(addedDoc) {
            addRecord({type: 'added', doc: addedDoc});
          },
          'changed': function(newDoc) {
            addRecord({type: 'changed', doc: newDoc});
          },
          'removed': function(oldDoc) {
            addRecord({type: 'removed', doc: oldDoc});
          }
        });
        
        Recorder.handles.push(handle);
      });
      
      console.log('Recording Started');
    },
    
    cancel: function() {
      _.invoke(Recorder.handles, 'stop');
      Recorder.handles = [];
      Recorder.recording.set(false)
    },
    
    save: function(name) {
      name = name || Meteor.uuid();
      console.log('Recording Complete, ' + Recorder.currentRecording.length + ' actions observed. Saving as ' + name);
      
      Recordings.insert({name: name, actions: Recorder.currentRecording});
      Recorder.cancel();
    },
    
    replay: function(name, fn) {
      var recording = Recordings.findOne({name: name});
      if (!recording) {
        return fn("No such recording: '" + name + "'");
      }
      
      var idMap = {};
      var awaiting = 0;
      
      var done = function() {
        awaiting -= 1;
        if (awaiting === 0 && fn)
          fn();
      };
      
      _.each(recording.actions, function(action) {
        var collection = window[action.collection];
        
        if (!collection) {
          console.log("Can't apply change to collection '" + action.collection + "', we don't know about it.");
          return;
        }
        
        awaiting += 1;
        // wait for the right amount of time, then do the action
        Meteor.setTimeout(function() {
          if (action.type === 'added') {
            var origId = action.doc._id;
            delete action.doc._id;
            idMap[origId] = collection.insert(action.doc, done);
            
          } else if (action.type === 'changed') {
            var origId = action.doc._id;
            delete action.doc._id;
            collection.update(idMap[origId], {$set: action.doc}, done);
          } else if (action.type === 'removed') {
            collection.remove(idMap[action.doc._id], done);
          }
        }, action.timeOffset);
      });
    }
  });
}