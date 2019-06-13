/*jshint esversion: 9 */
const Project = require('./../projects/Project.js');
const DbHandler = require('./../DbHandler/DbHandler');
const MsgBox = require('./../messageBox/messageBox');

 let _db;
 let _userId;
 let _projects;
 let _messanger;
 let _completeProjects;

module.exports = class Projects{
  constructor(projects, userId){
    _projects = projects;
    _userId = userId;
    _db = new DbHandler();
    _messanger = new MsgBox();
  }


  /**
   * Returns array with all saved active projects
   * in user options.
   */
  getProjects(){
    return _projects;
  }

  setProjects(projects){
    _projects = projects;
  }

  get completeProjects(){
    return _completeProjects;
  }

  set completeProjects(value){
    _completeProjects = value;
  }


  /**
   * Returns category class instance for
   * the selected category.
   */
  getProjectById(id){
    let dbProj = _projects.find (obj => {return obj._id == id;});
    if (dbProj != undefined){
      let proj =  new Project(dbProj);
      return proj;
    }
  }


  /**
   * Transforms the project object into a db project object,
   * pushes it into the option project array, updates the
   * db option project array with the new array and
   * runs the callback so the screen can be updated.
   */
  addProject(project, callback){
    let dbProj = project.projectToDbObject();
    _projects.push(dbProj);
    updateDatabase(callback, undefined);
  }

  /**
   * Transforms project object into db project object,
   * pushes the db project into the database and returns
   * the new db object that includes the new id inside.
   */
  async promiseToAddProject(project){
    const dbProj = project.projectToDbObject();
    _projects.push(dbProj);

    const updatedUser = await updateDb();
    _projects = updatedUser.options.projects;
    return _projects[_projects.length-1];
  }


  /**
   * Updates an existing project with the new
   * project object received, updates the database
   * and exectures the callback.
   */
  updateProject(project, callback){
    _projects = _projects.map((proj) => {
      if(proj._id == project.id){
        proj.title = project.title;
        proj.categoryId = project.categoryId;
        proj.description = project.description;
        proj.deadline = project.deadline;
        proj.isLearning = project.isLearning;
        proj.completedTaskNb = project.completedTaskNb;
        proj.totalTaskNb = project.totalTaskNb;
      }
      return proj;
    });
    updateDatabase(callback);
  }


  /**
   * Saves this object project array data
   * into the database.
   */
  saveProjects(projects){
    _projects = projects;
    updateDatabase();
  }


  /**
   * Removes one id from the project array
   * object and updates the database.
   */
  removeProjectById(id, callback){

    if(!navigator.onLine){
      _messanger.showMsgBox('Failed to remove project. \nCheck if there is an internet connection.','error','down');
      return;
    }

    // Update project array
    let index = _projects.map(x => {
      return x._id;
    }).indexOf(id);
    _projects.splice(index, 1);
    callback();

    let errorHandler = callback;
    updateDatabase(undefined, errorHandler);
  }


  /**
   * Removes complete project from collection.
   */
  removeCompleteProjectById(id, callback, errorHandler){

    if(!navigator.onLine){
      _messanger.showMsgBox('Failed to remove project. \nCheck if there is an internet connection.','error','down');
      return;
    }

    let removeProj = _db.removeProjectByID(id);
    removeProj.done((data) => {
      callback();

    }).fail((err) => {
      _messanger.showMsgBox('An error occurred when removing the project data.\nPlease refresh the page and try again.','error','down');
      console.log(err);
      if (errorHandler != undefined){
        errorHandler();
      }
    });
  }


  /**
   * Removes complete project from collection and adds it to the
   * user option project array.
   */
  reactivateProjectById(id, callback, errorHandler){

    if(!navigator.onLine){
      _messanger.showMsgBox('Failed to remove project. \nCheck if there is an internet connection.','error','down');
      return;}

    let removeProj = _db.removeProjectByID(id);
    removeProj.done((query) => {
      // Get target project from class memory and
      // add it to options.
      let removedProj = _completeProjects.find (obj => {
        return obj._id == id;});
      let proj =  new Project(removedProj);
      _projects.push(proj.projectToDbObject());
      updateDatabase();
      callback();

    }).fail((err) => {
      _messanger.showMsgBox('An error occurred when reactivating the project data.\nPlease refresh the page and try again.','error','down');
      console.log(err);
      if (errorHandler != undefined){
        errorHandler();
      }
    });
  }



  /**
   * Removes project from option project list and adds it
   * to the complete project db collection.
   */
  completeProject(proj, callback, errorHandler){

    if(!navigator.onLine){
      _messanger.showMsgBox('Failed to update project. \nCheck if there is an internet connection.','error','down');
      return;
    }

    // Add complete project to collection
    proj.userId = _userId;
    let comProj = proj.projectToCompleteProject();
    let addProject = _db.addProjects([comProj]);

    addProject.done((newProj) => {
      this.removeProjectById(proj.id, callback);

    }).fail((err) => {
      _messanger.showMsgBox('An error occurred when updating the project data.\nPlease refresh the page and try again.','error','down');
      console.log(err);
      if (errorHandler != undefined){
        errorHandler();
      }
    });
  }


  getCompleteProjects(pageNumber, size){
    const promiseProjects = _db.getCompleteProjects({userId: _userId, pageNb: pageNumber, size: size});
    return promiseProjects;
  }
};


/**
 * Patches data into database and executes callback
 * when there is one.
 */
function updateDatabase(callback, errorHandler){
  const saveProjects = _db.updateOptions(_userId, {projects: _projects});

  saveProjects.done((opt) => {
    _projects = opt.options.projects;
    if (callback != undefined){
      callback();
    }

  }).fail((err) => {
    _messanger.showMsgBox('An error occurred when updating the project data.\nPlease refresh the page and try again.','error','down');
    console.log(err);
    if (errorHandler != undefined){
      errorHandler();
    }
  });
}



/**
 * Returns a promise with the complete user object after
 * finishing updating the database.
 */
async function updateDb() {
  return _db.updateOptions(_userId, {projects: _projects});
}
