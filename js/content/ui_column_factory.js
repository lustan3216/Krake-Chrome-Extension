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
  Gary Teh <garyjob@krake.io>  
*/


/*
 * This class handles the creation of a column in the panel at the bottom of the page
 */
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

var UIColumnFactory = {
  
  

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
      var selector = '#krake-column-control-' + columnId;
      var linkButtonImageUrl = "background-image: url(\"" + chrome.extension.getURL("images/link.png") + "\");";
      var $linkButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-link",
                                        style:  linkButtonImageUrl });

      $columnControl.append($linkButton);
     
      $linkButton.bind('click', function(){
        chrome.extension.sendMessage({ action:"get_column_by_id", params: {columnId: columnId} }, function(response){
          console.log( JSON.stringify(response) );
          //if(response.session.currentColumn){
              //notify user to save column first
          //}else{
            if(response.status == 'success'){
              window.location.href = response.column.selection1.elementLink;
            }
            
          //} 
        });
      });//eo click


      //create pagination
    }

    var editButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/edit.png") + 
                              "\");";

    var $editButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-edit",
                                      style:  editButtonImageUrl });

    $editButton.bind('click', function(){
      alert("editButtonClicked");
    });

    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/bin.png") + 
                               "\");";
    var $deleteButton = $("<button>", { class: "krake-control-button k_panel krake-control-button-delete",
                                        style: deleteButtonImageUrl });

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });




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


    $deleteButton.bind('click', function(){
      //send mixpanel request
      KrakeHelper.triggerMixpanelEvent(null, 'event_10');

      NotificationManager.hideAllMessages();

      var columnIdentifier = "#krake-column-" + columnId; 
      chrome.extension.sendMessage({ action: "delete_column", params: { columnId: columnId } }, function(response){
        if(response.status == 'success'){
          $(columnIdentifier).remove();
          //remove highlights
          UIElementSelector.unHighLightElements(response.deletedColumn);
        }   
      });
    });

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($detailPageLink).append($deleteButton)).append($breadcrumb).append($columnName).append($firstSelection).append($secondSelection).append($thirdSelection);

    return $wrapper;


  },



  createUIColumn: function(type, columnId)
  {
    var divKrakeColumnId = "krake-column-" + columnId;
    var columnTitleId = "krake-column-title-" + columnId;

    var $wrapper = $("<div>", { id: divKrakeColumnId, 
                                class: "krake-column k_panel"});

    var columnControlId =  "krake-column-control-" + columnId;
    var $columnControl = $("<div>", {  id: columnControlId,
                                       class: "krake-column-control k_panel" });
    
    //delete button
    var deleteButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/bin.png") + 
                              "\");";

    var $deleteButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-delete",
                                        title: "delete column",
                                        style:  deleteButtonImageUrl });

    $deleteButton.bind('click', function(){
      //send mixpanel request
      KrakeHelper.triggerMixpanelEvent(null, 'event_10');

      NotificationManager.hideAllMessages();

      var columnIdentifier = "#krake-column-" + columnId; 
      chrome.extension.sendMessage({ action: "delete_column", params: { columnId: columnId } }, function(response){
        if(response.status == 'success'){
          $(columnIdentifier).remove();
          //remove highlights
          UIElementSelector.unHighLightElements(response.deletedColumn);
        }   
      });
    });

    $deleteButton.tooltip();    

    //save button
    var saveButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/save.png") + 
                              "\");";

    var $saveButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-save",
                                      title: "save column",
                                      style:  saveButtonImageUrl });

    $saveButton.bind('click', function(){
      chrome.extension.sendMessage({ action: "save_column" }, function(response){
        if(response.status == 'success'){
          //send mixpanel request
          KrakeHelper.triggerMixpanelEvent(null, 'event_9');

          var columnIdentifier = "#krake-column-" + columnId; 
          var selector = columnIdentifier + ' .krake-control-button-save';
          $(selector).remove();
          $('.tooltip').remove();          
          //UIColumnFactory.addEditButton(columnId);
        }else{
          NotificationManager.showNotification({
            type : 'error',
            title : Params.NOTIFICATION_TITLE_SAVE_COLUMN_FAILED,
            message : Params.NOTIFICATION_MESSAGE_SAVE_COLUMN_FAILED
          });
        }   
      });
    });
    
    $saveButton.tooltip();    

    var breadcrumbId = "k_column-breadcrumb-" + columnId;
    var $breadcrumb = $("<div>", { id: breadcrumbId,
                                   class: "krake-breadcrumb k_panel" });

    var $columnTitle = $("<div>", { id: columnTitleId, 
                                    class: "krake-column-row krake-column-title k_panel",
                                    contenteditable: "true", 
                                    "data-placeholder": Params.DEFAULT_COLUMN_NAME });
    
    var firstSelectionId = "krake-first-selection-" + columnId;
    var $firstSelection = $("<div>", { id: firstSelectionId,
                                       class: "krake-column-row krake-selection-1 k_panel" });

    var secondSelectionId = "krake-second-selection-" + columnId;
    var $secondSelection = $("<div>", { id: secondSelectionId,
                                          class: "krake-column-row krake-selection-3 k_panel" });
  
    var thirdSelectionId = "krake-third-selection-" + columnId;
    var $thirdSelection = $("<div>", { id: thirdSelectionId,
                                          class: "krake-column-row krake-selection-3 k_panel" });

    

    $columnControl = $columnControl.append($deleteButton);

    $wrapper.append($columnControl.append($deleteButton).append($saveButton)).append($breadcrumb).append($columnTitle).append($firstSelection).append($secondSelection).append($thirdSelection);

    return $wrapper;
  },//eo createColumn
   
   
   
  addEditButton : function(columnId){
    //edit button
    var editButtonImageUrl = "background-image: url(\"" +
                               chrome.extension.getURL("images/edit.png") + 
                              "\");";

    var $editButton = $("<button>", { class: "k_panel krake-control-button krake-control-button-edit",
                                      style:  editButtonImageUrl });

    $editButton.bind('click', function(){
      chrome.extension.sendMessage({ action: "stage_column", params : { columnId : columnId } }, function(response){
        if(response.status == 'success'){ }
      });
    });

    var selector = "#krake-column-control-" + columnId; 
    $(selector).append($editButton);
  }


};//eo UIColumnFactory
