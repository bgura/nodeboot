nodeboot is a simple "framework" for getting a RESTful JSON web api up and running using nodejs. At the moment, its not a true
"framework" as its not packaged as a library. Rather, for the time being, this is simply a project that can be used to model &
kickstart the development of a nodejs json api.

### Usage

1. Implement a model
```ts
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, required: true, unique: true},
});

const User = mongoose.model('User', UserSchema);

module.exports = User

export default User

```

2. Implement an API to access the model
```ts
import IApi from "./api";
import Route from "./route";
import express from "express";

export {};

const User = require('../models/user');

class UserApi implements IApi
{
    private routes_: Array<Route>;

    constructor() {
        this.routes_ = [];

        this.routes_.push(
            new Route(
                "get",
                "GET",
                "/user",
                this.get
            )
        );
    };

    getRoutes(): Route[] {
        return this.routes_;
    }

    get(req: express.Request, res: express.Response) {
        User.find(function(err: string, users: User[]) {
            if(err)
                res.send(err);
            res.json(users);
        });
    }
};

module.exports = UserApi;
export default UserApi;
```

3. Create a Server and Register the Routes
```ts
const pid  = process.pid;

import IApi from "./routes/api";
import UserApi from "./routes/user_api"
import Route from "./routes/route";

var express    = require('express');        // call express
var bodyParser = require('body-parser');

// Configure the databse
var mongoose = require('mongoose');

class Application {
  private pid_: number;
  private port_: number;
  private apis_: IApi[];
  private router_: any; // express router
  private app_: any; //express app

  constructor(pid: number, port: number) {
    this.pid_    = pid;
    this.port_   = port;
    this.apis_   = [];
    this.app_    = express();
    this.router_ = express.Router();
  };

  run() {
    this.initializeDb();
    this.initializeApis();
    this.initializeApp();
    this.initializeRoutes();
    
    this.app_.use('/api', this.router_);
    this.app_.listen(this.port_);
    console.log('Listening on port ' + this.port_);
  }

  initializeDb() {
    mongoose.connect('mongodb://localhost:27017/', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
  }

  initializeApis() {
    this.apis_.push(new UserApi());
  }
  
  initializeApp() {
    // configure app to use bodyParser()
    // this will let us get the data from a POST
    this.app_.use(bodyParser.urlencoded({ extended: true }));
    this.app_.use(bodyParser.json());
  }

  initializeRoutes() {
    // Iterate each API
    for( let api of this.apis_) {
      for( let route of api.getRoutes() ) {
        if(route.getMethod() === "GET" ) {
          this.router_.route(route.getPattern()).get(route.getHandler());
          console.log(`Registered route, ${route.getName()}, method=${route.getMethod()}, path=${route.getPattern()}`);
        } else if(route.getMethod() === "POST" ) {
          this.router_.route(route.getPattern()).post(route.getHandler());
          console.log(`Registered route, ${route.getName()}, method=${route.getMethod()}, path=${route.getPattern()}`);
        } else if(route.getMethod() === "PUT" ) {
          this.router_.route(route.getPattern()).put(route.getHandler());
          console.log(`Registered route, ${route.getName()}, method=${route.getMethod()}, path=${route.getPattern()}`);
        } else {
          console.log(`Invalid route configuration, ${route.getName()}, method=${route.getMethod()}`);
        }
      }
    }

    // Register middleware...
    this.router_.use(function(req: any, res: any, next: () => void) {
      // do logging
      console.log('Routing request...');
      next(); // make sure we go to the next routes and don't stop here
    });

    // Index route
    // this.router_.get('/', function(req: any, res: { json: (arg0: { message: string; }) => void; }) {
    //   res.json({ message: 'hooray! welcome to our api!' });   
    //   console.log(`You been served by ${pid}`);
    // });
  }
};

var port = process.env.PORT || 8080;        // set our port

var server = new Application(pid, Number(port));
server.run();
```

4. Compile and Run!
```
tsc
node build/app.js
```

5. Test the Endpoint
```
wget http://127.0.0.1:8080/api/user

{ "Text" : "Hello World!"  }
```