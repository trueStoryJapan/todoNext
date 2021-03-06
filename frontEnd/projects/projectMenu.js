/*jshint esversion: 6 */
const ContextMenu = require('./../menus/menu');
const icons = require('./../icons/icons.js');


module.exports = class CategoryMenu extends ContextMenu{
  constructor(trigger, id, listMethods){
    super(trigger, id);
    // Provides the different category list methods that
    // will be attached to each button action.
    this.listMethods = listMethods;

    // Each object attribute represents a button
    this.options = {
      edit:{
        text: 'Edit',
        src: icons.edit(),
        fun: (id) => {this.listMethods.editItem(id);}
      },
      remove:{
        text: 'Remove',
        src: icons.pending(),
        fun: (id) => {this.listMethods.removeItem(id);}
      },
      complete:{
        text: 'Complete',
        src: icons.checkbox('#757575'),
        fun: (id) => {this.listMethods.completeItem(id);}
      }
    };
  }
};
