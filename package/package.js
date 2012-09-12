Package.describe({
  summary: "Record a series of client changes to mongo."
});

Package.on_use(function (api, where) {
  where = where || ['client', 'server'];
  
  api.use('deps-extensions', 'client');
  api.add_files(['recorder.js'], where);
});