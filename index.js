var path        = require('path');
var express     = require('express');
var ParseServer = require('parse-server').ParseServer;
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

databaseUri || console.log('DATABASE_URI not specified, falling back to localhost.');

var port = process.env.PORT || 1337;
var api = new ParseServer(
{
  databaseURI: databaseUri                 || 'mongodb://localhost:27017/dev',
  appId      : process.env.APP_ID          || 'myAppId',
  masterKey  : process.env.MASTER_KEY      || 'masterKey', //Add your master key here. Keep it secret!
  serverURL  : process.env.SERVER_URL      || 'http://localhost:' + port + '/1',

  // If you change the cloud/main.js to another path
  // it wouldn't work on SashiDo :( ... so Don't change this.
  cloud      : process.env.CLOUD_CODE_MAIN || 'cloud/main.js',

  liveQuery:
  {
    classNames: [] // List of classes to support for query subscriptions example: [ 'Posts', 'Comments' ]
  },
});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use(express.static(path.join(__dirname, '/public')));


// Mount your cloud express app
app.use('/', require('./cloud/main.js').app);


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/1';
app.use(mountPath, api);


var httpServer = require('http').createServer(app);
httpServer.listen(port, function(){ console.log('Running on http://localhost:' + port); });

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
