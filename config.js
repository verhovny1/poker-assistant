// module variables
const config = require('./config.json');
const simbolsNet = require('./simbolsNet.json');

exports.setConfig = function( obj )
{
 	
	var json = JSON.stringify(obj);

	var fs = require('fs');
	fs.writeFile('config.json',json, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	});

}

exports.getConfig = function()
{
	return config;
}

exports.getSimbolsNet = function()
{
	return simbolsNet;
}