const validation = require("mw.validation");
const jwt = require('express-jwt');

class Places {
  constructor(data) {
    this.data = data;
  }
  configure(app, user) {
    const data = this.data;

    app.get("/api/places/:id", function(request, response) {
      let id = request.params.id;
      return data.getPlaceAsync(id).then(function(place) {
        if (place !== undefined) {
          response.status(200).json(place);
          return;
        }
        response.status(404).json({
          key: "entity.not.found"
        });
      });
    });

    app.delete("/api/places/:id", (req, res) => {
      let id = req.params.id;
      return data.deletePlaceAsync(id).then((result) => {
        if (result == true) {
          res.status(204).json(place);
          return;
        }
        res.status(404).json();
      });
    });

    app.options("/api/places", function(request, response) {
      response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'my-header-custom, Content-Type');
      response.setHeader('Cache-Control', 'public, max-age=30');
      response.status(200).json();
    })

    app.get("/api/places", function(request, response) {
      //let places = data.getPlacesAsync(id)
      return data.getPlacesAsync().then(function(places) {
          response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
          response.setHeader('Cache-Control', 'public, max-age=15');
          response.status(200).json({"places" : places });
          return;
      });
    });

    app.post("/api/places", 
    jwt({ secret: 'unsecrettressecret', algorithms: ['HS256'] }),
    (request, response) => {
      if (request.user.username != user.username) {   // Verification des permissions de l'utilisateur (même si plutot inutile ici vu que utilisateur unique)
        response.status(403).json();
        return;
      }

      const place = request.body;
      var onlyIf = function(){
        if(place.image && place.image.url){
          return true;
        }
        return false;
     }
 
      const rules = {
        //id: ["required"],
        name: [
          {
            minLength: {
              minLength: 3
            }
          },
          {
            maxLength: {
              maxLength: 100,
              message: "Expression is too long {maxLength} characters maximum"
            }
          },
          {
            pattern: {
              regex: /^[a-zA-Z -]*$/
            }
          }
        ],
        author: ["required"],
        review: ["required", "digit"],
        "@image": {
          url: ["url"],
          title: [
            {
              required: {
                onlyIf: onlyIf,
                message: "Field Image title is required"
              }
            }
          ]
        }
      };
      var validationResult = validation.objectValidation.validateModel(
        place,
        rules,
        true
      );

      if (place.name == null) {
        place.name = user.username;
      }
 
      if (!validationResult.success) {
        response.status(400).json({validationResult:validationResult});
      }
      
      return data.savePlaceAsync(place).then(function(id) {
        response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        response.setHeader('Location', `/api/places/${id}`);
        response.status(201).json();
      });

    });

  }
}
module.exports = Places;
