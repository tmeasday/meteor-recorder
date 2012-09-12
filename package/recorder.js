var Recordings = new Meteor.Collection('recordings');

if (Meteor.is_server) {
  Meteor.publish('recordings', function() {
    return Recordings.find();
  });
}

if (Meteor.is_client) {
  Meteor.subscribe('recordings');
  
  Recorder = {
    start: function(/* collections */) {
      var startTime = new Date();
      Recorder.currentRecording = []
      Recorder.handles = [];
      
      _.each(arguments, function(collection) {
        function addRecord(record) {
          record.collection = collection._name;
          record.timeOffset = new Date() - startTime;
          
          if ('_meteorRawData' in record.doc)
            record.doc = record.doc._meteorRawData();
          
          Recorder.currentRecording.push(record);
        }
        
        var handle = collection.find().observe({
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
    },
    
    save: function(name) {
      name = name || Meteor.uuid();
      console.log('Recording Complete, ' + Recorder.currentRecording.length + ' actions observed. Saving as ' + name);
      
      console.log(Recorder.currentRecording);
      Recordings.insert({name: name, actions: Recorder.currentRecording});
      Recorder.cancel();
    },
    
  replay: function(name /*, collections */) {
      var recording = Recordings.findOne({name: name});
      
      if (!recording) {
        console.log("No such recording: ' + name + '")
        return;
      }
      
      var idMap = {};
      var collections = {}; 
      _.each(Array.prototype.slice.apply(arguments).slice(1), function(collection) {
        collections[collection._name] = collection;
      });
      
      _.each(recording.actions, function(action) {
        var collection = collections[action.collection];
        
        if (!collection) {
          console.log("Can't apply change to collection '" + action.collection + "', we don't know about it.");
          return;
        }
        
        Meteor.setTimeout(function() {
          if (action.type === 'added') {
            var origId = action.doc._id;
            delete action.doc._id;
            idMap[origId] = collection.insert(action.doc);
            
          } else if (action.type === 'changed') {
            var origId = action.doc._id;
            delete action.doc._id;
            collection.update(idMap[origId], {$set: action.doc});
          } else if (action.type === 'removed') {
            collection.remove(idMap[action.doc._id]);
          }
        }, action.timeOffset);
        });
    }
  }
}