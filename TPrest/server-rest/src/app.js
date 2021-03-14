const express = require('express');
const bodyParser = require('body-parser');
const packageJson = require('../package.json');
const User = require('./users/controller');

class App {
    constructor(place) {
        const app = express();
        const user = new User();
        console.log(user);

        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        var middlewareHttp = function (request, response, next) {
            response.setHeader('Api-version', packageJson.version);
            response.setHeader('Content-type', "application/json");

            console.log(`${request.method} ${request.originalUrl}`);
            if (request.body && Object.keys(request.body).length >0) {
                console.log(`request.body ${JSON.stringify(request.body)}`);
            }

            next();
        };
        app.use(middlewareHttp);

        user.configure(app);
        place.configure(app, user);

        app.get('/api/version', function (request, response) {
            response.json({
                version: packageJson.version
            });
        });

        app.use(function (err, req, res, next) {
          if (err.name === 'UnauthorizedError') {
            res.status(401).json({
              key: "invalid token"
            });
          }
        });

        // Si aucune page n'a été trouvée
        var middlewareHttp404 = function (request, response, next) {
            response.status(404).json({
                key: "not.found"
              });
        };
        app.use(middlewareHttp404);

        // eslint-disable-next-line no-unused-vars
        app.use(function (error, request, response, next) {
            console.log(`erreur`);
            console.error(error);

            response.status(500).json({
                key: 'server.error'
            });
        });
        this.app=app;
    }
}

module.exports = App;
