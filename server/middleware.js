var bodyParser = require('body-parser');
var express = require('express');

module.exports = app => {

	app.set('view engine', 'jade');
	app.set('views', 'server/views');
	app.set('port', 3000);

	app.set('json spaces', 4);

	app.use(bodyParser.json());
	app.use(express.static('assets/public'));
};
