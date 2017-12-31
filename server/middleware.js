var bodyParser = require('body-parser');
var express = require('express');
var helper = require('./helper.js');
var schedule = require('node-schedule');



module.exports = app => {
	const DataSets = app.server.db.models.DataSets;
	const Experiments = app.server.db.models.Experiments;

	app.set('view engine', 'jade');
	app.set('views', 'server/views');
	app.set('port', 3000);

	app.set('json spaces', 4);

	app.use(bodyParser.json());
	app.use(express.static('assets/public'));


	var j = schedule.scheduleJob('42 * * * *', function(){
	  console.log('The answer to life, the universe, and everything! -- run every 42nd min of the hour');
		helper.force(Experiments,DataSets);
	});
	helper.force(Experiments,DataSets);
};
