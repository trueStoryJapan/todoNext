const OPTIONS = require('./../optionHandler/OptionHandler');
const editorTopBar = require('./../screens/editorTopBar/editorTopBar');
const editor = require('./../screens/editor/editor');
const flashMsg = require('./../messageBox/flashMsg');

/**
 * Represents an empty page with methods for resetting the page,
 * loading buttons into the page tob bar, adding a page title
 * and others.
 */


module.exports = class Page{
  constructor(){
    // To make these app screens accessible by the page.
    this._EditorTopBar = editorTopBar; //TODO: need to expose?
    this._Editor = editor; //TODO: need to expose?

    // Page elements
    this._topBarBtns =[];
    this._pageTitle = '';
    this._pageContent = '';

    this.OPTIONS = OPTIONS;
  }


  /**
   *  Removes previous page content, title and buttons, and
   *  adds new buttons and a new title (when
   *  there is one).
   */
  setPage(){
    this.removeCurrentPage();
    this._EditorTopBar.addButtons(this._topBarBtns);

    if(this._pageTitle!=''){
      this._Editor.setTitle(this._pageTitle);
    }
  }

  scrollPageToTop(){
    $(window).scrollTop(0);
  }

  /**
   *  Cleans page container
   */
  removeCurrentPage(){
    this._EditorTopBar.clearContents();
    this._Editor.clearContents();
  }

  /**
   *  Tells local storage which is the current page.
   */
  updateLocalStorage(){
    localStorage.setItem('currentPage',this.pageName);
  }

　// Function used to prevent that we load the page contents
  // into a different page.
  _pageIsOpen(page){
    let currentPage = localStorage.getItem('currentPage');
    return (currentPage == page.pageName);
  }

  _scrollPage(query){
    if(query != undefined && query.scrollToTop){
      this.scrollPageToTop();
    }
  }

  _fadeIn(query){
    if (query != undefined && query.fadeIn){
      this.listView.fadeInList();
    }
  }

  _hightlightItem(query){
    if (query != undefined && query.highlightId != ''){
      this.listView.hightlightByInstantId(query.highlightId);
    }
  }

  _displayMsg(query){
    if (query != undefined && query.hasOwnProperty('msg')){
      flashMsg.showPlainMsg(query.msg);
    }
  }
};
