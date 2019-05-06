/*jshint esversion: 6 */
const EventEmitter = require('events');
const MsgBox = require('./../messageBox/messageBox');


/**
 *
 */
module.exports = class DbHandler extends EventEmitter{
  constructor(id){
    super(id);

    this._messanger = new MsgBox();

  }

//-----------------------TODOS-------------------------------------------

/**
 * addTodos - Requests the back end to add an array of todos into
 * the database.
 *
 * @param  {Array} todos Array of todo objects.
 * @return {Ajax}        Ajax response.
 */
addTodos(todos){

  const delivery = {todos: JSON.stringify(todos,null,2)};

  return $.ajax({
    type: 'POST',
    url: '/todos',
    data: delivery,
  });
}


  /**
   * getTodos - Retrieves all matching todos from db.
   *
   * @param  {Object} request ex. {user: OPTIONS.userId, status:'active'}
   * @return {ajax}
   */
  getTodos(request){

    return $.ajax({
      type: 'GET',
      url: '/todos',
      data: request,
    });
  }


  /**
   * updateTodo - Requests back-end to save passed modifications into
   * corresponding todo in the database.
   *
   * @param  {String} id
   * @param  {object} request
   * @return {ajax}
   */
  updateTodoById(id, request){

    let delivery = {id: id,
                    request: JSON.stringify(request,null,2)};

    return $.ajax({
      type: 'PATCH',
      url: '/todos',
      data: delivery,
    });
  }


//-----------------------OPTIONS-------------------------------------------

updateOptions(id, request){

  let delivery = {id: id,
                  request: JSON.stringify(request,null,2)};

  return $.ajax({
    type: 'PATCH',
    url: '/users',
    data: delivery,
  });
}


//-----------------------POINTS-------------------------------------------



  /**
   * addPoints - description
   *
   * @param  {Array} todos Array of todo objects.
   * @return {Ajax}
   */
  addPoints(todos){

    const delivery = {points: JSON.stringify(todos,null,2)};

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

};