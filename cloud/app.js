/*
* Advanced Cloud Code Example
*/

var express = require('express');
var app = express();

app.get('/hello-advanced', function (req, res)
{
  res.send("Hello from SashiDo's Advanced Cloud Code");
});

/*
* Exporting of module.exports.app is required.
* we mount it automaticaly to the Parse Server Deployment.
*/

module.exports = app
