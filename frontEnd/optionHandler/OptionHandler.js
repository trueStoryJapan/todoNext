const EventEmitter = require('events');
const Categories = require('./Categories');
const Projects = require('./Projects');
const ActiveTasks = require('./ActiveTasks');
const Habits = require('./Habits');
const Logs = require('./Logs');
const Stats = require('./Stats');
const Tasks = require('./Tasks');
const Points = require('./Points');
const DbHandler = require('./../dbHandler/dbHandler');

// This wrongly named OPTIONS object acts as the store where
// all the active task, active project, category, habit and other
// state information is saved and managed.
// All this data is passed from the backend to the frontend using the attribute of
// a span element at the very end of the main ejs view.
// As soon as the DOM finished parsing, we retrieve the object inside that the span
// attribute, remove the span from the DOM and pass all that data to this OPTIONS object.
 let _OPTIONS;
 let _userId;
 let _activeTasks;
 let _tasks;
 let _categories;
 let _projects;
 let _habits;
 let _logs;
 let _stats;
 let _points;
 let _db;

class Options extends EventEmitter{
  constructor(){
    super();
    // User data and options are stored at the very end of the main view ejs file
    // inside a User object.
    // Before the user gets to see it, we retrieve the data form the ejs and
    // remove the element from the view to leave no trace.
    // * User structure {id, name, email, username, password, options}
    // * Options structure {isFirstSession, taskList, categories, projects}
    let user = JSON.parse($('#variableJSON').text());
    $('#variableJSON').remove();

    _OPTIONS = user.options;
    _userId = user._id;
    _activeTasks = new ActiveTasks(_OPTIONS.activeTasks, _userId);
    _tasks = new Tasks(_userId);
    _categories = new Categories(_OPTIONS.categories, _userId);
    _projects = new Projects(_OPTIONS.projects, _userId, _categories);
    _habits = new Habits(_OPTIONS.habits, _userId, _categories);
    _logs = new Logs(_OPTIONS.logs, _userId);
    _stats = new Stats(_OPTIONS.stats, _userId);
    _points = new Points(_userId);
    _db = new DbHandler();
  }

  get userId(){
    return _userId;
  }

  // TODO: no pasar options tal cual.
  get options(){
    return _OPTIONS;
  }

  get categories(){
    return _categories;
  }

  get projects(){
    return _projects;
  }

  get activeTasks(){
    return _activeTasks;
  }

  get tasks(){
    return _tasks;
  }

  get habits(){
    return _habits;
  }

  get logs(){
    return _logs;
  }

  get stats(){
    return _stats;
  }

  get points(){
    return _points;
  }



  /**
   * Resets record counters (when new day, week or month reached)
   * registers new records (if achieved) and updates log currentDay value
   * with today's value.
   * @param (Boolean)
   */
  checkForRecords(saveInDb = false){

    let requiresSaving = false;

    if (_logs.isNewDay()){
      _stats.updateDayRecords();
      requiresSaving = true;
    }

    if (_logs.isNewWeek()){
      _stats.updateWeekRecords();
      requiresSaving = true;
    }

    if (_logs.isNewMonth()){
      _stats.updateMonthRecords();
      requiresSaving = true;
    }

    //Save database
    if(requiresSaving){
      _logs.updateCurrentDate();
      if(saveInDb) this.updateDb();
    }
  }


  /**
   * Returns the deep clone of an object
   * with all the user options.
   */
  getLocalOptions(){
    let options = {
      activeTasks: _activeTasks.getActiveTasks(),
      categories : _categories.getCategories(),
      projects : _projects.getProjects(),
      habits : _habits.getHabits(),
      logs : _logs.getLogs(),
      stats : _stats.getStats()
    };
    return JSON.parse(JSON.stringify(options));
  }


  /**
   * Updates local options with passed option
   * object data.
   */
  updateLocalOptions(options){
    _activeTasks.setActiveTasks(options.activeTasks);
    _categories.setCategories(options.categories);
    _projects.setProjects(options.projects);
    _habits.setHabits(options.habits);
    _logs.setLogs(options.logs);
    _stats.setStats(options.stats);

    this.emit('updateScreen');
  }

  /**
   * Updates the database option object with
   * the local option data.
   */
  updateDb(){
    this.emit('updateScreen');
    _logs.incrementSaveVersion();
    return _db.updateOptions(_userId, {activeTasks: _activeTasks.getActiveTasks(),
                                       categories : _categories.getCategories(),
                                       projects : _projects.getProjects(),
                                       habits : _habits.getHabits(),
                                       logs : _logs.getLogs(),
                                       stats : _stats.getStats()});
    }



  /**
   * Updates complete option object in the database with
   * the specified data.
   */
  saveIntoDb(callback, errorHandler){

    const saveOptions = _db.updateOptions(_userId, {activeTasks: _activeTasks.getActiveTasks(),
                                                    categories : _categories.getCategories(),
                                                    projects : _projects.getProjects(),
                                                    habits : _habits.getHabits(),
                                                    logs : _logs.getLogs(),
                                                    stats : _stats.getStats()});

    saveOptions.done((db) => {
       _activeTasks.setActiveTasks(db.options.activeTasks);
       _categories.setCategories(db.options.categories);
       _projects.setProjects(db.options.projects);
       _habits.setHabits(db.options.habits);
       _logs.setLogs(db.options.logs);
       _stats.setStats(db.options.stats);
      if (callback != undefined){callback();}

    }).fail((err) => {
      _messanger.showMsgBox('An error occurred when saving the new data.\nPlease refresh the page and try again.','error','down');
      if (errorHandler != undefined){errorHandler();}
      console.log(err);
    });

  }
}

 module.exports = new Options();
