var express = require("express");
var http = require("http");
var app = express();
var mysql      = require('mysql');
var fs = require('fs');
app.use(express.urlencoded());

conn = mysql.createConnection({
  host: 'web2.cpsc.ucalgary.ca',
  user: 's513_sapratte',
  password: '10059840',
  database: 's513_sapratte'
});

//All requests do this
app.all("*", function(request, response, next) {
	next();	//This is needed to defer to the next middleware
	console.log("Request Received");
});

//Index path
//Should display index.html
app.get("/", function(request, response) {
	response.writeHead(200, { "Content-Type": "text/plain" });
  	response.end("Welcome to the homepage!");
});

//Path to receive a users signup request
//Querystring inside the post body
app.post('/users/create', function(req, res) {
	//app.use(express.json());
     var name = req.body.name,
     email = req.body.email,
     password = req.body.password;
     console.log("name = "+name);
     console.log("Email = "+email);
     console.log("password = "+password);

     var query = 'Insert into UsersTest2 (name,email,password) VALUES (\''+name+'\',\''+email+'\',\''+hash(password)+'\')';
     conn.connect();
     conn.query(query, function(err, rows, fields) {
	  if (err) throw err;

	  console.log('User '+name+' is created');
	  //Need to redirect here
	});
     conn.end();
 console.log("query = "+query);
});

//path to get a user's stream
app.get("/users/:userid", function(req, res) {
	//If user in a session, then display results (user must be logged in)
	//else redriect to signup page

	//checking if a userid exists or not
	conn.query('Select * from UsersTest2 where id='+req.params.userid , function(err, rows, fields) {
	  if (err) throw err;

	  if(rows.length==1)
	  {
	  	console.log('length of rows = '+ rows.length);
	  	res.end("Hello, " + req.params.userid + ".");
	  }
	  else
	  {
	  	//No such user exsists, 404
	  	res.end("User doesnt exist");
	  	//redirect here
	  }
	});

  // Fun fact: this has security issues
});

//path to print out recrods from DB
//Remove before deployment
app.get("/queryusertable", function(request, response) {
	console.log("Querying user table");
		conn.query('Select id,name, email, password From UsersTest2', function(err, rows, fields) {
	  if (err) throw err;

	  //Printing all results
	  for(var i = 0;i<rows.length;i++)
	  {
	  	  console.log('\t Record ', i);
	  	  console.log('The Unique userid is: ', rows[i].id);
		  console.log('The Name is: ', rows[i].name);
		  console.log('The email is: ', rows[i].email);
		  console.log('The password is: ', rows[i].password);
		  console.log('\n')
	  }
	  	response.redirect("/");
	});
	
});


//path to create a table
//Remove before deployment
//Also drop old tables
app.get("/createtable", function(request, response) {
		//conn.query('CREATE TABLE UsersTest2(id MEDIUMINT NOT NULL AUTO_INCREMENT,name varchar(255), email varchar(255), password varchar(20),PRIMARY KEY (id))', function(err, rows, fields) {
		conn.query('Insert into UsersTest2 (name,email,password) VALUES (\'Rob siry\',\'test@email.com\',\'Pass\')', function(err, rows, fields) {
	  if (err) throw err;

	  console.log('Inserted is created');
	  response.redirect("/");		//redirecting 
	});
	
});

//Route to signin from index.html
app.post("/signin", function(request, response) {

	var email = request.body.email,
    password = request.body.password;

    //Debug stuff
    console.log("Email = "+email);
    console.log("password = "+password);

    var query = 'Select * from UsersTest2 where email=\''+email+'\' and password=\''+hash(password)+'\'';
    console.log('Query = '+query);

    conn.query(query, function(err, rows, fields) {
	  if (err) throw err;

	response.writeHead(200, { "Content-Type": "text/plain" });
	  console.log("Row length= "+rows.length)
	  if(rows.length>0)		//Number of records returned back
	  {
	  	response.end("Signin page goes here!");
	  }
	  else
	  {
	  	response.end("User doesnt exist");
	  }
	});

});

//If a path doesn't exist from the ones above, display 404
app.get("*", function(request, response) {
	  response.writeHead(404, { "Content-Type": "text/plain" });
	  response.end("404!");
});
http.createServer(app).listen(1337);	//Running server
console.log("Server Running at localhost:1337");

//Simple hash function
//Note: its really bad, found on stackoverflow
function hash(k){
	var hash = 0, i, char;
    if (k.length == 0) return hash;
    for (i = 0, l = k.length; i < l; i++) {
        char  = k.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

