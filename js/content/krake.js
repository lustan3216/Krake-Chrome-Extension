/*
  Copyright 2013 Krake Pte Ltd.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Author:
  Joseph Yang <sirjosephyang@krake.io>
*/

var generateColumnId = function(){
  return Math.floor( Math.random() * 10000000000 );
}//
/***************************************************************************/
/************************** UI Column Factory  *****************************/
/***************************************************************************/
var UIColumnFactory = {
  /*
   * @Param: params:object
   *         {
               columnId: string
               columnType: string
               columnName: string
               firstSelectionText: string (optional)
               secondSelectionText: string (optional)
               breadcrumb: string
             }
   */

  recreateUIColumn: function(params){
    
    var columnId = params.columnId;
    var type = params.columnType;
    var columnTitle = params.columnName;
    var firstSelectionText = params.firstSelectionText;
    var secondSelectionText = params.secondSelectionText;
    var elementLink = params.elementLink;

    console.log("params: " + JSON.stringify(params));

    var divKrakeColumnId = "krake-column-" + columnId;
    var columnNameId = "krake-column-title-" + columnId;

    var $wrapper = $("<div>", { id: divKrakeColumnId, 
                                class: "krake-column k_panel"});

    var columnControlId =  "krake-column-control-" + columnId;
    var $columnControl = $("<div>", { id: columnControlId,
                                      class: "krake-column-control k_panel" });

    console.log("elementLink:= " + elementLink);
    
    var $detailPageLink = null;

    if(elementLink)
    {
      var detailButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("skin/images/link.png") + 
                               "\");";

      $detailPageLink = $("<a>", {  class: "k_panel krake-control-button krake-control-button-link",
                                    title: "Hyperlink detected\nClick to find more info",
                                    href: elementLink,
                                    style: detailButtonImageUrl});
      $detailPageLink.click(
        function(){
          chrome.extension.sendMessage({ name: "set_parent_column_id", 
                                       params: { parentColumnId: columnId } },
          function(response){
            window.location.href = elementLink; 
          });  
        });


      //create pagination
    }
    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("skin/images/bin.png") + 
                               "\");";
    var $deleteButton = $("<button>", { class: "krake-control-button k_panel krake-control-button-delete",
                                        style: deleteButtonImageUrl });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });

    ContentHelper.getBreadCrumbArrayForColumnWithId(columnId, 
      function(object){
        UIColumnFactory.createUIBreadcrumb($breadcrumb, object);
      });


    var $columnName = $("<div>", { id: columnNameId, 
                                    class: "krake-column-row krake-column-title k_panel",
                                    text: columnTitle });
    
    var firstSelectionId = "krake-first-selection-" + columnId;
    var $firstSelection = $("<div>", { id: firstSelectionId,
                                       class: "krake-column-row krake-selection-1 k_panel",
                                       text: firstSelectionText });

    if(type=="list")
    {
      var secondSelectionId = "krake-second-selection-" + columnId;
      var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-2 k_panel",
                                          text: secondSelectionText });

    }
    else
    {
      var secondSelectionId = "krake-second-selection-" + columnId;
      var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-2 k_panel"});
    }

    var thirdSelectionId = "krake-third-selection-" + columnId;
    var $thirdSelection = $("<div>", { id: thirdSelectionId,
                                       class: "krake-column-row krake-selection-3 k_panel" });


    $deleteButton.click(
      function()
      {
        var columnIdentifier = "#krake-column-" + columnId; 
        $(columnIdentifier).remove();
        chrome.extension.sendMessage({ name: "remove_column",
                                       params: { columnId: columnId } 
                                      });
      }
    );

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($detailPageLink).append($deleteButton)).append($breadcrumb).append($columnName).append($firstSelection).append($secondSelection).append($thirdSelection);

    return $wrapper;


  },

  createUIColumn: function(type, columnId)
  {
    console.log("createColumn");
    var divKrakeColumnId = "krake-column-" + columnId;
    var columnTitleId = "krake-column-title-" + columnId;

    var $wrapper = $("<div>", { id: divKrakeColumnId, 
                                class: "krake-column k_panel"});

    var columnControlId =  "krake-column-control-" + columnId;
    var $columnControl = $("<div>", {  id: columnControlId,
                                       class: "krake-column-control k_panel" });

    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/bin.png") + 
                              "\");";

    var $deleteButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-delete",
                                        style:  deleteButtonImageUrl });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });

    var $columnTitle = $("<div>", { id: columnTitleId, 
                                    class: "krake-column-row krake-column-title k_panel",
                                    contenteditable: "true", 
                                    "data-placeholder": "asdf" });
    
    var firstSelectionId = "krake-first-selection-" + columnId;
    var $firstSelection = $("<div>", { id: firstSelectionId,
                                       class: "krake-column-row krake-selection-1 k_panel" });

    var secondSelectionId = "krake-second-selection-" + columnId;
    var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-3 k_panel" });
  
    var thirdSelectionId = "krake-third-selection-" + columnId;
    var $thirdSelection = $("<div>", { id: thirdSelectionId,
                                          class: "krake-column-row krake-selection-3 k_panel" });

    $deleteButton.bind('click', function(){
      alert("column-" + columnId + " delete button clicked");  
    });

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($deleteButton)).append($breadcrumb).append($columnTitle).append($firstSelection).append($secondSelection).append($thirdSelection);

    return $wrapper;
  },//eo createColumn
 

};//eo UIColumnFactory


/***************************************************************************/
/******************************  Panel UI  *********************************/
/***************************************************************************/
var uiBtnCreateList = $("#btn-create-list");
var uiBtnSelectSingle = $("#btn-select-single");
var uiBtnEditPagination = $("#btn-edit-pagination");
var uiBtnDone = $("#btn-done");
var uiPanelWrapper = $("#inner-wrapper"); 

var Panel = function(){
   
};//eo Panel

Panel.prototype.init = function(){
  uiBtnCreateList.bind('click', uiBtnCreateListClick);
  uiBtnSelectSingle.bind('click', uiBtnSelectSingleClick);
  uiBtnEditPagination.bind('click', uiBtnEditPaginationClick);
  uiBtnDone.bind('click', uiBtnDoneClick);
};

var uiBtnCreateListClick = function(e){
  //add ui column
  var columnId = generateColumnId();
  uiPanelWrapper.append(UIColumnFactory.createUIColumn('list', columnId));
  attachEnterKeyEventToColumnTitle(columnId);
  //add breadcrumb for ui column

  //add logical column in sharedKrake

}; 

var uiBtnSelectSingleClick = function(e){
  var columnId = generateColumnId();
  uiPanelWrapper.append(UIColumnFactory.createUIColumn('single', columnId));
}; 

var uiBtnEditPaginationClick = function(e){
  console.log("uiBtnEditPaginationClick");
};

var uiBtnDoneClick = function(e){
  console.log("uiBtnDoneClick");
};

var attachEnterKeyEventToColumnTitle = function(columnId){
  var identifier = "#krake-column-title-" + columnId;
  $(identifier).keydown(function(e) {
    if(e.which == 13) {
      //update breadcrumb segment title
      var newColumnTitle = $(identifier).text();
      //self.updateBreadcrumbSegmentTitle(columnId, $.trim(newColumnTitle));     
      $(this).blur().next().focus();  return false;
    }
  });    
};//eo attachEnterKeyEventToColumnTitle







