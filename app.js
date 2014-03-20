var express = require("express");
var path = require('path');
var http = require("http");
var app = express();
var mysql = require('mysql');
var fs = require('fs-extra');
var testing; 
var currentUser;
var formidable = require('formidable');
var gm = require('gm');
var url = require('url');
var follows =3;
var userExist = 0;
var passExist = 0;
var invalidEmail = 0;

//Variables for image upload and queries
var usersimages;
var time;
var user;

var types = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
	"JPG": "image/jpeg"
};

//Express uses these
app.set('port', process.env.PORT || 1337);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '1234EFGHI'})); 
app.use(express.static(path.join(__dirname, '/public')));
app.use(app.router);

// Set the database connetion variables
//var conn = mysql.createConnection({
//  host: 'web2.cpsc.ucalgary.ca',
//  user: 's513_sapratte',
//  password: '10059840',
//  database: 's513_sapratte'
//});

//All requests do this
app.all("*", function(request, response, next) {
	next();	//This is needed to defer to the next middleware
});

//Index path
//Should display index.html
app.get("/", function(request, response) {
  if(request.session.userid) 
  {
    response.redirect("/feed"); //redirect
  }
  else
  {
    response.render("index",{userTest : userExist, passTest : passExist});
  }
});

// Render the signup page after the user presses "Sign up" on the home page
app.get("/users/new", function(request, response) {
  response.render("signup");
});


// Display the stream of the specified user
app.get("/users/:userid", function(request, response) 
{
	
    // Check if current user is signed in
    if(request.session.userid) 
    {
		// Open the connection to the database
		var conn = mysql.createConnection({
										  host: 'web2.cpsc.ucalgary.ca',
										  user: 's513_sapratte',
										  password: '10059840',
										  database: 's513_sapratte'
										  });
        var usersimages= '';
        var time = '';
            
        // Get the data from Stream table to display images
        var q = 'Select * From Stream WHERE userid=? ORDER BY date DESC';
        conn.query(q, [request.params.userid], function(err, rows, fields) {
                if (err) {
				   
                    response.render("error", {userName: request.session.name, errorMSG: "500 - Internal Server Error! 1"});
                }

                // Save the data
                for(var i = 0;i<rows.length;i++) {
                    if (usersimages === '') {
                        usersimages = rows[i].path;
                        time = time_ago_in_words(rows[i].date);
                    }
                    else {
                        usersimages = usersimages + ',' + rows[i].path;
                        time = time + ',' + time_ago_in_words(rows[i].date);
                    }
                }
            
                // Get the current users information from the Users table
                var query = 'Select * from UsersTest2 where id='+request.params.userid
                conn.query(query, function(err, rows, fields){
                        if (err) {
						   console.log(err);
                           response.render("error", {userName: request.session.name, errorMSG: "500 - Internal Server Error! "});
                        }
                        else {
                           // if the user exists query for followers
                           if (rows.length){
                                var q2='select * from Follow where userid='+request.session.userid+' and follows='+request.params.userid
                                conn.query(q2 , function(err, rows2, fields){
                                    if (err) {
										 console.log("Error here 2");
                                        response.render("error", {userName: request.session.name, errorMSG: "500 - Internal Server Error!"});
                                    }
                                    else if (request.session.userid == request.params.userid) {
                                        follows = 99;   //99 because in the jade file it'll disable the follow button
                                    }
                                    else if(rows2.length==1) {
                                        follows = 1;    //Unfollow button is displayed
                                    }
                                    else{
                                        follows = 0;    //Follow button is displayed
                                    }
									conn.end(); // Close the connection to the database
                                    // Render the Stream page
                                    response.render("stream", {userName: rows[0].name,images: stringToArray(usersimages), following: follows, userId: request.params.userid, currentUId: request.session.userid, navUser : request.session.name, times: stringToArray(time)});
										   
                                });
                           }
                           else{
                                response.render("error", {userName: request.session.name, errorMSG: "User Doesn't Exist!"});    //render template
                           }
                        }
                });
        });
		
    }
	else
	{
        // If the user is not signed in redirect to the Sign in/up page
		response.redirect("/users/new");
	}
	
});

// Display the Feed of the specified user
app.get("/feed", function(request, response)
{
    // Check if the current user is signed in
    if(request.session.userid) {
        usersimages = '';   //Set varaibles to '' for feed
        time = '';
        user = '';
        var streamID = '';
		
        // Open the connection to the database
		var conn = mysql.createConnection({
										  host: 'web2.cpsc.ucalgary.ca',
										  user: 's513_sapratte',
										  password: '10059840',
										  database: 's513_sapratte'
										  });
		
        // Query the Stream and Feed tables for user's feed data
        conn.query('Select Stream.userid,Feed.path,Stream.date,Stream.name From Feed, Stream WHERE Feed.userid=? AND Feed.path=Stream.path ORDER BY Stream.date DESC',[request.session.userid], function(err, rows, fields) {
            if (err){
                response.render("error", {userName: request.session.name, errorMSG: "500 - Internal Server Error! 6"});
            }
            else {
                for(var i = 0;i<rows.length;i++) {
                   if (usersimages === '') {
                        //Getting images
                        usersimages = rows[i].path;
                        time = time_ago_in_words(rows[i].date);
                        user = ''+rows[i].name;
                        streamID = ''+rows[i].userid;
                   }
                   else {
                        usersimages = usersimages + ',' + rows[i].path;
                        time = time + ',' + time_ago_in_words(rows[i].date);
                        user = user + ',' + rows[i].name;
                        streamID = streamID + ',' + rows[i].userid;
                   }
                }
                //render the feed with all variables
                response.render("feed", {userName: request.session.name, images: stringToArray(usersimages), times: stringToArray(time), users: stringToArray(user), sessionID: request.session.userid, streamID : stringToArray(streamID)});
            }
        });
		
		conn.end(); // Close the connection to the database
    }
    else {
        response.redirect("/users/new");    //redirect if not logged in
    }
});


app.get("/users/:userid/follow", function(request, response, next) {
		
	// Open the connection to the database
	var conn = mysql.createConnection({
									  host: 'web2.cpsc.ucalgary.ca',
									  user: 's513_sapratte',
									  password: '10059840',
									  database: 's513_sapratte'
									  });
	//Inserting a user into the follow table
    var query = 'Insert into Follow VALUES ('+request.session.userid+','+request.params.userid+')';
    conn.query(query, function(err, rows, fields) {
        if (err) throw err;
        response.redirect("/users/"+request.params.userid);
		conn.end(); // Close the connection to the database
    });
		
	
});


app.get("/users/:userid/unfollow", function(request, response, next) {
	
	// Open the connection to the database
	var conn = mysql.createConnection({
									  host: 'web2.cpsc.ucalgary.ca',
									  user: 's513_sapratte',
									  password: '10059840',
									  database: 's513_sapratte'
									  });
        //Removing a user from the follow table
    var query ='DELETE FROM Follow where userid='+request.session.userid+' and follows='+request.params.userid;
    conn.query(query, function(err, rows, fields) {
        if (err) throw err;
        response.redirect("/users/"+request.params.userid);
    });
		
	conn.end(); // Close the connection to the database
});


// Upload an image
app.get("/photos/new", function(req, res) {
  if(req.session.userid)
  {          
    res.render("upload", {user: req.session.userid, userName: req.session.name});
    console.log("Go to upload");
  }
  else 
  {
    res.redirect("/users/new");
  }
});

//for display thumbnails
app.get("/photos/thumbnail/*", function(req, res) {
    var url_parts = url.parse(req.url, true);
    var name = path.basename(url_parts.pathname);
    var type = types[path.extname(name).split(".")[1]];

    img = fs.readFileSync('./public/images/' + name);
    gm(img, name).resize(400).stream(function streamOut (err,stdout,stderr) {
        if(err) console.log("Resizing error");
        else {
            res.writeHead(200, {'Content-Type': type});
            var piping = stdout.pipe(res);
            piping.on('finish', function(){
            });
        }
    });
});

//For displaying orginal size
app.get("/photos/*", function(req, res) {
    var url_parts = url.parse(req.url, true);
    var name = path.basename(url_parts.pathname);
    var type = types[path.extname(name).split(".")[1]];

    img = fs.readFileSync('./public/images/' + name);   //reading file
    gm(img, name).stream(function streamOut (err,stdout,stderr) {
        if(err) console.log("Resizing error");
        else {
            res.writeHead(200, {'Content-Type': type});
            var piping = stdout.pipe(res);
            piping.on('finish', function(){
            });
        }
    });
});

//render images for stream and feed
app.get("/public/images/*", function(req, res) {
    var url_parts = url.parse(req.url, true);
    var name = path.basename(url_parts.pathname);
   	var type = types[path.extname(name).split(".")[1]];

    img = fs.readFileSync('.' + req.url)
    gm(img, name).resize(400).stream(function streamOut (err,stdout,stderr) {
        if(err) console.log("Resizing error");
        else {
            res.writeHead(200, {'Content-Type': type});
           	var piping = stdout.pipe(res);
            piping.on('finish', function(){
            });
        }
    });
});


//Path to receive a users signup request
app.post('/users/create', function(req, res)
{
	 // Open the connection to the database
	 var conn = mysql.createConnection({
									   host: 'web2.cpsc.ucalgary.ca',
									   user: 's513_sapratte',
									   password: '10059840',
									   database: 's513_sapratte'
									   });
		 
    //Querystring inside the post body
     var name = req.body.name,
     email = req.body.email,
     password = req.body.password;
    
     //Checking to see if the user has signed up before with that email in post body
     var uniqueCheckQuery = 'Select * from UsersTest2 where email=\''+email+'\'';
     conn.query(uniqueCheckQuery, function(err, dbrows, fields) {
     if (err){
		console.log(err);
        res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! THIS ONE"});
     }
     else{
        if(dbrows.length!=0){
             //Email is already registered
             invalidEmail = 1;
             res.render("signup", {userEmail : invalidEmail})   //Render sign up page with errorå
        }
        else
        {
              //Unique email is supplied
              //Inserting new user into DB
              var query = 'Insert into UsersTest2 (name,email,password) VALUES (\''+name+'\',\''+email+'\',\''+hash(password)+'\')';
              conn.query(query, function(err, rows, fields) {
              if (err){
                  res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error!"});
              }
              else {
                  //Selecting information from newest user
                  var query = 'Select * from UsersTest2 where email=\''+email+'\' and password=\''+hash(password)+'\'';
                  conn.query(query, function(err, rows, fields) {

                      if(rows.length>0)        //Number of records returned back
                      {
                          //Creating session information
                          req.session.userid = rows[0].id      // Save the user id for the session
                          req.session.name = rows[0].name      // Save the name for the session
                          currentUser = req.session.name;
                          res.redirect('/feed');
							 
                      }
                      else {
                          res.end("User doesnt exist"); //If invalid user
                      }
					 conn.end(); // Close the connection to the database
                  });
             }
             });
        }
     }
     });
     invalidEmail = 0;    //set back to 0 for email checking (dupilate emails)
	 
});


//Path to create photos (upload)
app.post("/photos/create", function(req, res) {
    console.log("params "+req.params.userid);
    if(req.session.userid) {

        var form = new formidable.IncomingForm();
        form.parse(req);
        form.on('file', function(fields, file) {
        
        var temp_path = file.path;
        var file_name = file.name;
        var new_name;
        var id;
        var ext = path.extname(file_name);
        var new_location = './public/images/';
                
        var type = types[path.extname(file_name).split(".")[1]];
        if (type){
				
			// Open the connection to the database
			var conn = mysql.createConnection({
											  host: 'web2.cpsc.ucalgary.ca',
											  user: 's513_sapratte',
											  password: '10059840',
											  database: 's513_sapratte'
											  });
            var query = 'SELECT * FROM Stream WHERE photoid=(SELECT MAX(photoid) FROM Stream)'; //Getting the unique id for photos
            conn.query(query, function(err, rows, fields) {
            if (err){
                res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! 4"});
            }
            if (rows.length == 0) {
                //If no records exisit at this point, make to 1
                id = 1;
                new_name = '1' + ext;   //Adding one the unqiue photo id
            }
            else {
                //If recrods exist already, do this
                id = rows[0].photoid +1;
                new_name = id + ext;
            }
            var path = new_location + new_name; //Creating path
            var date = new Date();  //Creating date

            fs.copy(temp_path, path, function(err) {
            if (err) {
                res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! 5"});
            }
            else {
                var query = 'Insert INTO Stream (userid,photoid,path,name) VALUES (?,?,?,?)';   //Inserting into the Stream the photo information
                conn.query(query, [req.session.userid, id, path, req.session.name], function(err, rows, fields) {
                if (err){
                    res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! 1"});
                }
                else {
                   var query = 'Insert into Feed (userid,path) VALUES (?,?)';   //Inserting into feed
                   conn.query(query,[req.session.userid, path], function(err, rows, fields) {
                        if (err){
                            res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! 2"});
                        }
                        else{
                            // Add to followers Feeds
                            var query = 'SELECT * From Follow WHERE follows=?';
                            conn.query(query, [req.session.userid], function(err, rows, fields) {
                            if (err){
                                res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! 3"});
                            }
                            else {
                                for(var i = 0;i<rows.length;i++) {
                                    var query = 'Insert into Feed (userid,path) VALUES (?,?)';  //Inserting into the followers feeds
                                    conn.query(query, [rows[i].userid,path], function(err, rows, fields) {
                                    if (err){
                                        res.render("error", {userName: req.session.name, errorMSG: "500 - Internal Server Error! 3"});
                                    }
                                    });
                                }
                            }
							conn.end(); // Close the connection to the database
                            });
                            res.redirect("/users/"+req.session.userid);     //redirect after
							
                            }
                    });
                }
                });
            }
            });
        });
            
		
        }
        else {
            res.redirect('/photos/new');
        }
    });
    }
    else {
         userid = req.session.userid;
         res.redirect("/users/"+userid);
    }
});


//Route to signin from index.html
app.post("/signin", function(request, response) {
  
	 // Open the connection to the database
	 var conn = mysql.createConnection({
									   host: 'web2.cpsc.ucalgary.ca',
									   user: 's513_sapratte',
									   password: '10059840',
									   database: 's513_sapratte'
									   });
		 
    //Sign in information
	var email = request.body.email,
    password = request.body.password;

    //Getting user information
    var query = 'Select * from UsersTest2 where email=\''+email+'\'';

    conn.query(query, function(err, rows, fields) {
        if (err){
                userExist = 1;
                passExist = 0; 
                response.redirect('/');
        }

        else {
            if(rows.length)		//Number of records returned back
            {
               if(!(hash(request.body.password) == rows[0].password))
               {
                    passExist = 1;
                    userExist = 0;
                    response.redirect('/'); //If usernames dont match
               }
               else {
                    //If passwords do match with usernames
                    request.session.userid = rows[0].id      // Save the user id for the session
                    request.session.name = rows[0].name      // Save the name for the session
                    currentUser = request.session.name;
                    userid = request.session.id;
                    userExist = 0;
                    passExist = 0;
                    response.redirect('/feed');
               }
            }
            else {
                    userExist = 1;
                    passExist = 0;
                    response.redirect('/'); //If user exsists but password is wrong
            }
        }
		conn.end(); // Close the connection to the database
	});
	
});


//Path to signout a user 
app.get("/signout", function(request, response) {
	request.session.destroy();
	response.redirect("/");	//redirect to index
});

//Clearing the database with bulk upload
app.get("/bulk/clear", function(request, response) {

	// Open the connection to the database
	var conn = mysql.createConnection({
									  host: 'web2.cpsc.ucalgary.ca',
									  user: 's513_sapratte',
									  password: '10059840',
									  database: 's513_sapratte'
									  });
      console.log("Bulk upload");
      if(request.query.password == 222)
      {
        var commands = ["UsersTest2","Follow","Stream","Feed"]; //All table names for command

        //For loop to run through all truncating process
        for (var i = commands.length - 1; i >= 0; i--) {

          //Truncating table query
          conn.query('TRUNCATE TABLE '+commands[i], function(err, rows, fields) {
        });
		conn.end(); // Close the connection to the database
       };
      }
      else
      {
        console.log("Invalid password");
      }

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Truncating database");
	
});

//For bulk Users upload
app.post("/bulk/users", function(request, response) {
		 
	// Open the connection to the database
	var conn = mysql.createConnection({
									   host: 'web2.cpsc.ucalgary.ca',
									   user: 's513_sapratte',
									   password: '10059840',
									   database: 's513_sapratte'
									   });
    console.log("req.params.password=" + request.query.password);
   
    var queryResponse;

    if(request.query.password==222)
    {
      //Couldn't get this to work 100%
      //But I kept it in
     //  request.on('data', function(chunk) {
     //      queryResponse+=chunk;
     //      console.log('data');
     //  });

     // request.on('end', function(){
     //      console.log('end');
     //  });
      var test;

      for (i = 0; i < request.body.length; i++) {
      test=request.body[i]
      console.log("photoid ="+test.id+" user_id ="+test.user_id+ " path ="+test.path+" date="+test.timestamp);
      var date= new Date(parseInt(test.timestamp,10))
      console.log("Date = "+date);
      conn.query('Insert into Stream VALUES ('+Number(test.user_id)+','+Number(test.id)+','+test.path+','+test.timestamp+')', function(err, rows, fields) {

      });
	  conn.end();  // Close the connection to the database
    }

      response.end("Uploading JSON");
    }
    else
    {
      console.log("Invalid password");
      response.end("Invalid password");
    }
	
});

//If a path doesn't exist from the ones above, display 404
app.get("*", function(request, response) {
    response.render("error", {errorMSG : "404 - Page Not Found"})
});



http.createServer(app).listen(1337);	//Running server
//This is because node.ucalgary was not working on the submit day
console.log("Server is listening on http://localhost:1337/");  

//Simple hash function
//Note: its really bad
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

//Turning a string into a array
function stringToArray(images) {
    var array = images.split(',');
    return array;
}

//Finding out the date time (Ex. Moments ago...etc)
function time_ago_in_words(date) {
    var today = new Date();
    var diff = today - date;
    
    return put_in_words(diff);
}

//Helper function for time_ago_in_words
//Figures out the time in words
function put_in_words(diff) {
    var years = Math.floor(diff/1000/60/60/24/365);
    var days = Math.floor(diff/1000/60/60/24);
    var months = Math.floor(diff/1000/60/60/24/30);
    var weeks = Math.floor(diff/1000/60/60/24/7);
    var hours = Math.floor(diff/1000/60/60);
    var minutes = Math.floor(diff/1000/60);
    var seconds = Math.floor(diff/1000);
    
    var string = '';
    
    if (years > 0){
        
        if (years == 1)
            string = years + ' year';
        else
            string = years + ' years';
    }
    else if (months > 0) {
        
        if (months == 1)
            string = months + ' month';
        else
            string = months + ' months';
    }
    else if (weeks > 0){
        
        if (weeks == 1)
            string = weeks + ' week';
        else
            string = weeks + ' weeks';
    }
    else if (days > 0){
        
        if (days == 1)
            string = days + ' day';
        else
            string = days + ' days';
    }
    else if (hours > 0) {
        
        if (hours == 1)
            string = hours + ' hour';
        else
            string = hours + ' hours';
    }
    else if (minutes > 0) {
        
        if (minutes == 1)
            string = minutes + ' minute';
        else
            string = minutes + ' minutes';
    }
    else
        string = 'a moment';
    
    return string + ' ago';
}



