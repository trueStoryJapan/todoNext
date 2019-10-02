const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Session = require('./models/session');


// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});


// Set connection to database.
// userNewUrlParser is necessary to prevent mongodb warnings.
mongoose.connect('mongodb+srv://tallyTrueStory:pro095678seda@cluster0-gyxb9.gcp.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
});

// Previous database
// mongoose.connect('mongodb://tallyTS:pro040703thy@ds259253.mlab.com:59253/todonextdb', {
//   useNewUrlParser: true,
// });


mongoose.set('useCreateIndex', true);


// Require routes
const indexRoute = require('./routes/index');
const userRoute = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const pointRoutes = require('./routes/points');
const habitRoutes = require('./routes/habits');
const projectRoutes = require('./routes/projects');
const categoryRoutes = require('./routes/categories');

const app = express();

//static files
// Moving this line to this top position inmensively increased the loading
// speed of the application. It seems it was having issues loading all the
// static files while handling the other middleware.
app.use(express.static('./public'));


// Set body parser middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false}));
app.use(cookieParser());


// Set express session.
app.use(session({
  secret: '5j4k3k3j4j4jljklj3io43jh3',
  saveUninitialized: true,
  resave: true
}));


// Init passport.
app.use(passport.initialize());
app.use(passport.session());


//Set up express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    let namespace = param.split('.'), root = namespace.shift(), formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';

    }
    return{
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Set up flash and global variables.
app.use(flash());
app.use(function (req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//set up template engine.
app.set('view engine', 'ejs');


//Use routes
indexRoute(app);
userRoute(app);
pointRoutes(app);
taskRoutes(app);
habitRoutes(app);
projectRoutes(app);
categoryRoutes(app);


//Error handling middleware
app.use(function(err,req,res,next){
  console.log(err.message);
  res.status(422).send({error:err.message});
});


//listen to port
let port = process.env.PORT;
if(port == null || port == ""){
  port = 8000;
}
const server = app.listen(port);
console.log("Listening to port 8000.");


//Attach io to server
const SocketIO = require('socket.io');
const io = SocketIO(server);

// Listen for new connections
io.on('connection', (socket) => {

  // User sends back it's own user id value as
  // soon as the connection is made.
  socket.on('connected', (data) => {

    //We check if a session with such user id exists in the database.
    Session.getSessionByUserId(data.userId, function(err, session){
      if(err) throw err;

      //If the session does not exist,
      //we add the session to the database and do noting else.
      if(!session){

        let request = {userId: data.userId, socketId : socket.id};

        Session.saveSession([request], function(err, savedSession){
          if (err) return next(err);
        });

      //If the session exists, request the other socket to log out
      //and modify the socket id info of the existing session.
      }else{

        if(session.socketId!=socket.id){
          io.to(session.socketId).emit('disconnect',{});
          Session.patchById(session._id, {socketId: socket.id}, function(err, updatedSession){
            if (err) return next(err);
          });

        }
      }
    });
  });


});
