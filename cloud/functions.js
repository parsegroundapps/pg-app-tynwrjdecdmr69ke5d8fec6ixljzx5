/*
* Simple Cloud Code Example
*/

Parse.Cloud.define('hello', function (request, response)
{
  response.success("Hello from SashiDo's Simple Cloud Code :)");
});
