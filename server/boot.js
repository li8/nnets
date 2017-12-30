var https = require('http');
var fs = require('fs');

module.exports = app => {
    app.server.db.sequelize.sync().done(() => {
      app.listen(app.get('port'), () => {
          console.log(`M-API - Port ${app.get('port')}`);
        });
    });
};
