/*jshint esversion: 6 */
const appConfig = require('./../appConfig/appConfig');

const mongoose = require('mongoose');

// this schema cannot be a constant
let todoSchema = new mongoose.Schema({
  title: String,
  isHabit: Boolean,
  dueTo: Date,
  urgency: String,
  hours: String,
  progress: Number,
  isLearning: Boolean,
  status: String,
  categoryId: String,
  projectId: String,
  habitId: String,
  notes: String,
  userId: String
});

let targetCollection = (appConfig.production) ? 'prodTasks' : 'Tasks';

let Todo = module.exports = mongoose.model(targetCollection,todoSchema);

// Finds all todos that match with the conditions passed by the request.
module.exports.findTodos = function(request, callback){
  Todo.find(request, callback);
};


// Inserts an array of todos.
module.exports.saveTodos = function(request, callback){
  Todo.insertMany(request, callback);
};


// Updates target todo with passed modifications.
module.exports.patchById = function(id, request, callback){

  Todo.findById(id, function (err, todo) {
    if (err) return next(err);

    for (let k in request){
      if (request.hasOwnProperty(k)) {
        todo[k] = request[k];
      }
    }

    todo.save(callback);
  });

};
