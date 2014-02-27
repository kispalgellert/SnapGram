var express = require("express");
var http = require("http");
var app = express();
var mysql      = require('mysql');
var fs = require('fs');
app.use(express.urlencoded());

// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'me',
//   password : 'secret'
// });

// connection.connect();

// connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//   if (err) throw err;

//   console.log('The solution is: ', rows[0].solution);
// });

// connection.end();

app.all("*", function(request, response, next) {
	//response.writeHead(200, { "Content-Type": "text/plain" });
	next();	//This is needed to defer to the next middleware
	console.log("Request Received");
});

app.get("/", function(request, response) {
	response.writeHead(200, { "Content-Type": "text/plain" });
  	response.end("Welcome to the homepage!");
});

// app.get("/signup", function(request, response) {
//  	//response.end("Welcome to the about page!");
//  	app.use(express.urlencoded());
// });

app.post('/signup', function(req, res) {
	//app.use(express.json());
     var name = req.body.name,
     email = req.body.email,
     password = req.body.password;
     console.log("name = "+name);
     console.log("Email = "+email);
     console.log("password = "+password);
     //res.redirect("index.html") //redirect to a page to that generates html
});

app.get("*", function(request, response) {
	  response.writeHead(404, { "Content-Type": "text/plain" });
	  response.end("404!");
});

http.createServer(app).listen(1337);
