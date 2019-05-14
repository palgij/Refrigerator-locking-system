var bodyParser =   require("body-parser"),
    express = 	   require("express"),
    flash =        require('express-flash-notification'),
    session =      require('express-session'),
    database =     require("./middleware/database"),
    auth =    	   require("./middleware/auth"),
    morgan = 	   require("morgan"),
    requestIp =    require("request-ip"),
    app =     	   express();
 
//This line add the authentication requirement to all pages starting with localhost:3000/
//app.all("/*", auth);

//app.use(morgan('tiny'));

app.use(requestIp.mw());

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});

// ============ ROUTES ============

var ostmineRoutes = require("./routes/ostmine"),
    indexRoutes   = require("./routes/index"),
    adminRoutes   = require("./routes/admin");

// ============ APP USE ============

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.disable("view cache");

app.use(session({
  secret: 'Kapilukk on väga salajane!',
  resave: false,
  saveUninitialized: false
}));

// ============ FLASH ============

const flashNotificationOptions = {
  beforeSingleRender: function(item, callback) {
    if (item.type) {
      switch(item.type) {
        case 'SUCCESS':
          item.type = 'Edukas ost!';
          item.alertClass = 'alert-success';
          break;
        case 'ERROR':
          item.type = 'Tekkis viga';
          item.alertClass = 'alert-danger';
          break;
      }
    }
    callback(null, item);
  }
};

// Flash Notification Middleware Initialization
app.use(flash(app, flashNotificationOptions));

// ============ SERVER LISTENING TO ROUTES ============

app.use("/tooted/:id", ostmineRoutes);
app.use(indexRoutes);
app.use("/admin", adminRoutes);

app.listen(3000, function(){
    console.log("Server is listening to port 3000!");
});

