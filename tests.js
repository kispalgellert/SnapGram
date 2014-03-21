var assert = require('assert')
var myCode = require('./app')
var mysql = require('mysql');
var should = require('should');
var request = require('supertest');

//Put into words general case 1
//Input: 10000
describe('put_in_words_test_general_case1', function(){
    it('should return <a moment ago>', function(){
        var actualResult = myCode.put_in_words(10000);
        var expectedResult = "a moment ago";
        assert.equal(actualResult, expectedResult);
    })
});

//Put into words general case 2
//Input: 172800000
describe('put_in_words_test_general_case2', function(){
    it('should return <2 days ago>', function(){
        var actualResult = myCode.put_in_words(172800000); //2 days
        var expectedResult = "2 days ago";
        assert.equal(actualResult, expectedResult);
    })
});


//Put into words large case 1
//Input: 2,147,483,647 -> 2.17 bil MAX_INTEGER
describe('put_in_words_test_large_case1', function(){
        it('should return <3 weeks ago>', function(){
        var actualResult = myCode.put_in_words(2147483647); //MAX_INTEGER
        var expectedResult = "3 weeks ago";
        assert.equal(actualResult, expectedResult);
    })
});

//Put into words invalid case 1
//Input: -1
describe('put_in_words_test_invalid_case1', function(){
        it('should return invlaid', function(){
        var actualResult = myCode.put_in_words(-1);
        var expectedResult = "a moment ago";
        assert.equal(actualResult, expectedResult);
    })
});

//Hash test 1
//Input: "password"
describe('hash_test_general_case_1', function(){
        it('should return not password', function(){
        var actualResult = myCode.hash("password");
        var expectedResult = "password";
        assert.notEqual(actualResult, expectedResult);
    })
});

//Hash test 2
//Input: "qwerty"
describe('hash_test_general_case_2', function(){
    it('should return not password', function(){
        var actualResult = myCode.hash("qwerty");
        var expectedResult = "qwerty";
        assert.notEqual(actualResult, expectedResult);
    })
});


describe('Routing', function() {
         var url = 'http://localhost:1337';
         before(function(done) {
                conn = mysql.createConnection({
                      host: 'web2.cpsc.ucalgary.ca',
                      user: 's513_sapratte',
                      password: '10059840',
                      database: 's513_sapratte'
                      });
                done();
                });
         var testEmail = "test@test.com";
         var testPassword = "password";
         var testName = "Test";
         

         
         // use describe to give a title to your test suite, in this case the tile is "Account"
         describe('Account', function() {
                  it('should succesfully create user', function(done) {
                     var profile = {
                     email: testEmail.string,
                     password: testPassword,
                     name: testName,
                     };
                     // once we have specified the info we want to send to the server via POST verb,
                     // we need to actually perform the action on the resource, in this case we want to
                     // POST on /api/profiles and we want to send some info
                     // We do this using the request object, requiring supertest!
                     request(url)
                     .post('/users/create')
                     .send(profile)
                     // end handles the response
                     .end(function(err, res) {
                          if (err) {
                          throw err;
                          }
                          // this is should.js syntax, very clear
                          res.should.have.status(200);
                          done();
                          });
                     });
                  
                  it('should not save duplicate user into table', function(done) {
                     var profile = {
                     email: testEmail,
                     password: testPassword,
                     name: testName,
                     };
                     // once we have specified the info we want to send to the server via POST verb,
                     // we need to actually perform the action on the resource, in this case we want to
                     // POST on /api/profiles and we want to send some info
                     // We do this using the request object, requiring supertest!
                     request(url)
                     .post('/users/create')
                     .send(profile)
                     // end handles the response
                     .end(function(err, res) {
                          if (err) {
                          throw err;
                          }
                          // this is should.js syntax, very clear
                          res.should.have.status(200);
                          done();
                          });
                     });
                  
                  
                  
                  
                  it('should sign in', function(done) {
                     var profile = {
                     email: 'test@test.com',
                     password: 'yoloyolo',
                     };
                     // once we have specified the info we want to send to the server via POST verb,
                     // we need to actually perform the action on the resource, in this case we want to
                     // POST on /api/profiles and we want to send some info
                     // We do this using the request object, requiring supertest!
                     request(url)
                     .post('/signin')
                     .send(profile)
                     // end handles the response
                     .end(function(err, res) {
                          if (err) {
                          throw err;
                          }
                          // this is should.js syntax, very clear
                          res.should.have.status(302);
                          console.log("yea");
                          done();
                          });
                     });
                  });
         });



















