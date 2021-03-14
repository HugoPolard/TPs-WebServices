const validation = require("mw.validation");
const jwt = require("jsonwebtoken");

class User {
  password
  username
  constructor() {
    this.password = "password";
    this.username = "gaston";
  }
  configure(app) {
    const user = this.user;

    app.post("/api/users/login", (request, response) => {
      const userGived = request.body;

      const rules = {
        //id: ["required"],
        username: [
          "required",
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
              regex: /^[a-zA-Z0-9 -]*$/
            }
          }
        ],
        password: [
          "required",
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
        ]
      };
      var validationResult = validation.objectValidation.validateModel(
        user,
        rules,
        true
      );
  
      if (!validationResult.success) {
        response.status(400).json({validationResult:validationResult});
      }
      
      if (userGived.username == user.username && userGived.password == user.password) {
        var token = jwt.sign( { "username" : user.username }, 'unsecrettressecret');
        response.status(200).send({ auth: true, token: token });
        return;
      }
      response.status(401).json({ auth: false, token: null });
    });

  }
}
module.exports = User;
