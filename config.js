// module variables

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
	/*
	let config = new require('./config.json');
	return config; 
	*/
	var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",'./config.json',false);
    Httpreq.send(null);
    return  JSON.parse(  Httpreq.responseText );   
}

exports.getNet = function( name )
{
	/*
	let netWork = require('./'+name+'.json');
	return netWork;*/

	var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",'./'+name+'.json',false);
    Httpreq.send(null);
    return  JSON.parse(  Httpreq.responseText ); 
}