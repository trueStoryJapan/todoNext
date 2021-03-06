const appConfig = require('./../appConfig/appConfig');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserOptionsSchema = require('./userOptions');


// Object generated as soon as a new user registers into the system.
// This object will also include in it the User Options object.
// Refer to ./userOptions for more information.
let UserSchema = mongoose.Schema({
  username:{
    type: String,
    index: true
  },
  password:{
    type: String
  },
  email:{
    type: String
  },
  name:{
    type: String
  },
  options: UserOptionsSchema
});

UserSchema.set('versionKey', false);

// Saves data in different collections depending on the environment.
let targetCollection = (appConfig.production) ? 'prodUsers' : 'Users';

// Set schema
let User = module.exports = mongoose.model(targetCollection, UserSchema);



// Encrypts password and saves user into db.
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};



// Finds user by username.
module.exports.getUserByUsername = function(username, callback){
  let query = {username: username};
  User.findOne(query, callback);
};



// Finds user by email.
module.exports.getUserByEmail = function(email, callback){
  let query = {email: email};
  User.findOne(query, callback);
};



// Finds user by ID.
module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
};


// Compares password with retrieved user from database.
module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch){
    if (err) throw err;
    callback(null, isMatch);
  });
};



//------------------ User option manipulation methods ----------------//

// Updates user option object with never version.
module.exports.patchById = function(id, request, callback){
  User.findById(id, function (err, user) {
    if (err) return next(err);

    // To avoid that a possible older version of the user option object
    // could replace a newer version causing that the user lost their most recent data.
    if (request.hasOwnProperty('logs') && user.options.logs.saveVersion > request.logs.saveVersion) return next(new Error("Tried to overwrite with older data."));

    for (let k in request){
      if (request.hasOwnProperty(k)) {
        user.options[k] = request[k];
      }
    }
    user.save(callback);
  });

};

// Removes single active task by task id.
// TODO: possibly out of use. Remove in that case.
module.exports.removeActiveTask = function(request, callback){
  let userId = request.userId;
  let taskId = request.taskId;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    user.options.activeTasks.id(taskId).remove();
    user.save(callback);
  });
};


// Adds category to category list.
// TODO: possibly out of use. Remove in that case.
module.exports.addCategory = function(request, callback){
  let userId = request.userId;
  let cat = request.category;
   User.findById(userId, function (err, user) {
     if (err) return next(err);
     user.options.categories.push(cat);
     user.save(callback);
   });

};


// Adds habit to habit list.
// TODO: possibly out of use. Remove in that case.
module.exports.addHabit = function(request, callback){
  let userId = request.userId;
  let hab = request.habit;
   User.findById(userId, function (err, user) {
     if (err) return next(err);
     user.options.habits.push(hab);
     user.save(callback);
   });
};


// Removed habit from habit list by habit id.
// TODO: possibly out of use. Remove in that case.
module.exports.removeHabit = function(request, callback){
  let userId = request.userId;
  let habitId = request.habitId;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    user.options.habits.id(habitId).remove();
    user.save(callback);
  });
};
