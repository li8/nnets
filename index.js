const express = require('express');
const consign = require('consign');

const app = express();
consign({ verbose: true })
  .include('server/config.js')
  .then('server/db.js')
  .then('server/middleware.js')
  .then('server/routes.js')
  .then('server/boot.js')
  .into(app);

module.exports = app;
