/*jshint esversion: 6 */
const EventEmitter = require('events');
const MsgBox = require('./../messageBox/messageBox');

module.exports = class DbHandler extends EventEmitter{
  constructor(id){
    super(id);
    this._messanger = new MsgBox();
  }

//-----------------------Tasks --------------------------------//


  /**
   * Adds array of complete tasks to the
   * database task collection.
   *
   * @param  {Array} tasks Array of task objects.
   * @return {Ajax}
   */
  insertTasks(tasks){

    const delivery = {tasks: JSON.stringify(tasks,null,2)};

    return $.ajax({
      type: 'POST',
      url: '/tasks',
      data: delivery,
    });
  }



  /**
   * Retrieves all matching tasks from db.
   *
   * @param  {Object} request ex. {user: OPTIONS.userId, status:'active'}
   * @return {ajax}
   */
  getTasks(request){

    return $.ajax({
      type: 'GET',
      url: '/tasks',
      data: request,
    });
  }


  /**
   * Requests back-end to save passed modifications into
   * specified task in the database.
   *
   * @param  {String} id
   * @param  {object} request
   * @return {ajax}
   */
  updateTaskById(id, request){

    let delivery = {id: id,
                    request: JSON.stringify(request,null,2)};

    return $.ajax({
      type: 'PATCH',
      url: '/tasks',
      data: delivery,
    });
  }

//----------------------Active tasks --------------------//



  //----------------------- Options ---------------------------------//


    /**
     *
     */
    updateOptions(id, request){

      let delivery = {id: id,
                      request: JSON.stringify(request,null,2)};

      return $.ajax({
        type: 'PATCH',
        url: '/users',
        data: delivery,
      });
    }



//----------------------- Points ---------------------------------//



  /**
   * addPoints - description
   *
   * @param  {Array} task Array of task objects.
   * @return {Ajax}
   */
  addPoints(tasks){

    const delivery = {points: JSON.stringify(tasks,null,2)};

    return $.ajax({
      type: 'POST',
      url: '/points',
      data: delivery,
    });
  }


  /**
   * removePoint - Completely removes indicated point
   * fromt db.
   *
   * @param  {Object} point  ex.{taskId : pointId};
   * @return {ajax}          ajax response
   */
  removePoint(point){

    return $.ajax({
        type: 'DELETE',
        url: '/points',
        data: point,
      });
  }




//----------------------- Categories ------------------------------------//

  addCategory(userId, category){

    let delivery = {userId: userId,
                    category: JSON.stringify(category,null,2)};

    return $.ajax({
      type: 'POST',
      url: '/categories',
      data: delivery,
    });

  }

  //----------------------- Habits ------------------------------------//

    addHabit(userId, habit){

      let delivery = {userId: userId,
                      habit: JSON.stringify(habit,null,2)};

      return $.ajax({
        type: 'POST',
        url: '/habits',
        data: delivery,
      });

    }

    removeHabit(userId, habitId){

      let delivery = {
        userId: userId,
        habitId: habitId
      };

       return $.ajax({
           type: 'DELETE',
           url:  '/habits',
           data: delivery,
         });
    }


//----------------------- Projects -------------------------------------//

  /**
   * addProjects - Adds array of projects to the
   * database project collection.
   *
   * @param  {Array} projects Array of project objects.
   * @return {Ajax}
   */
  addProjects(projects){

    const delivery = {projects: JSON.stringify(projects,null,2)};

    return $.ajax({
      type: 'POST',
      url: '/projects',
      data: delivery,
    });

  }


  /**
   * removeProjectByID - Completely removes indicated project
   * fromt db.
   *
   * @param  {String} id
   * @return {ajax}          ajax response
   */
  removeProjectByID(id){

    return $.ajax({
        type: 'DELETE',
        url: '/projects',
        data: {_id: id},
      });
  }

  /**
   * getCompleteProjects - Retrieves all matching complete projects
   *
   * @param  {Object} request ex. {userId: userId}
   * @return {ajax}
   */
  getCompleteProjects(request){

    return $.ajax({
      type: 'GET',
      url: '/projects',
      data: request,
    });
  }

};
