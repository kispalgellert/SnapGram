var express = require("express");
var http = require("http");
var app = express();
var mysql      = require('mysql');
var fs = require('fs');

console.log(hash('Rob'));
console.log(hash('Roa'));

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

	// public static int hash(int k)
	// {
	// 	//Very quick and simple hash function
	// 	k ^= k << 24;
	// 	return k;
		
	// }